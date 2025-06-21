
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserAccess = () => {
  const { user, profile } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
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

      // 일반 사용자는 승인 상태와 시간 기반 만료 여부 확인
      if (profile.status === 'approved' && profile.access_expires_at) {
        const now = new Date();
        const expiresAt = new Date(profile.access_expires_at);

        if (now <= expiresAt) {
          setHasAccess(true);
        } else {
          // 시간이 만료된 경우 상태를 expired로 업데이트
          const { error } = await supabase
            .from('profiles')
            .update({ 
              status: 'expired',
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (error) {
            console.error('Failed to update expired status:', error);
          }

          setHasAccess(false);
          toast({
            title: "⏰ 이용 기간 만료",
            description: "설정된 이용 기간이 만료되었습니다. 관리자에게 연장을 요청하세요.",
            variant: "destructive",
            duration: 5000
          });
        }
      } else if (profile.status === 'expired') {
        setHasAccess(false);
        toast({
          title: "⏰ 이용 기간 만료",
          description: "이용 기간이 만료되었습니다. 관리자에게 연장을 요청하세요.",
          variant: "destructive"
        });
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
        }
      }

      setIsCheckingAccess(false);
    };

    checkUserAccess();

    // 1분마다 접근 권한 재확인
    const interval = setInterval(checkUserAccess, 60000);

    return () => clearInterval(interval);
  }, [user, profile, toast]);

  return { hasAccess, isCheckingAccess };
};
