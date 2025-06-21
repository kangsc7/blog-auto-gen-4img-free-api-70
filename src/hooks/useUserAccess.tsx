
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserAccess = () => {
  const { user, profile } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkUserAccess = async () => {
      if (!user || !profile) {
        setHasAccess(false);
        setIsCheckingAccess(false);
        return;
      }

      // 관리자는 항상 접근 가능
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleData) {
        setHasAccess(true);
        setIsCheckingAccess(false);
        return;
      }

      // 일반 사용자는 상태와 남은 시간 확인
      if (profile.status === 'approved') {
        if (profile.remaining_time_seconds && profile.remaining_time_seconds > 0) {
          // 남은 시간 계산 및 업데이트
          const lastUpdate = profile.last_time_update ? new Date(profile.last_time_update).getTime() : Date.now();
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
          const newRemainingTime = Math.max(0, profile.remaining_time_seconds - elapsedSeconds);
          
          if (newRemainingTime > 0) {
            setHasAccess(true);
            setRemainingTime(newRemainingTime);
            
            // DB 업데이트
            await supabase
              .from('profiles')
              .update({
                remaining_time_seconds: newRemainingTime,
                last_time_update: new Date().toISOString(),
                status: newRemainingTime <= 0 ? 'expired' : 'approved'
              })
              .eq('id', user.id);
          } else {
            // 시간 만료
            setHasAccess(false);
            await supabase
              .from('profiles')
              .update({
                remaining_time_seconds: 0,
                status: 'expired',
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
            
            toast({
              title: "접근 만료",
              description: "사용 기간이 만료되었습니다. 관리자에게 문의하세요.",
              variant: "destructive"
            });
          }
        } else {
          // 기존 30일 승인 로직 (하위 호환성)
          if (profile.approved_at) {
            const approvedDate = new Date(profile.approved_at);
            const expiryDate = new Date(approvedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            const now = new Date();

            if (now <= expiryDate) {
              setHasAccess(true);
            } else {
              setHasAccess(false);
              toast({
                title: "접근 만료",
                description: "30일 이용 기간이 만료되었습니다. 관리자에게 문의하세요.",
                variant: "destructive"
              });
            }
          } else {
            setHasAccess(false);
          }
        }
      } else {
        setHasAccess(false);
        if (profile.status === 'pending') {
          toast({
            title: "승인 대기",
            description: "관리자의 승인을 기다리고 있습니다.",
            variant: "destructive"
          });
        } else if (profile.status === 'rejected') {
          toast({
            title: "접근 거부",
            description: "계정이 거절되었습니다. 관리자에게 문의하세요.",
            variant: "destructive"
          });
        } else if (profile.status === 'expired') {
          toast({
            title: "접근 만료",
            description: "사용 기간이 만료되었습니다. 관리자에게 문의하세요.",
            variant: "destructive"
          });
        }
      }

      setIsCheckingAccess(false);
    };

    checkUserAccess();

    // 1분마다 시간 업데이트
    const interval = setInterval(checkUserAccess, 60000);
    return () => clearInterval(interval);
  }, [user, profile, toast]);

  return { hasAccess, isCheckingAccess, remainingTime };
};
