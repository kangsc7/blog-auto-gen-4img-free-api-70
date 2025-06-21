
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

      // 일반 사용자는 승인 상태와 만료 여부 확인
      if (profile.status === 'approved' && profile.approved_at) {
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
  }, [user, profile, toast]);

  return { hasAccess, isCheckingAccess };
};
