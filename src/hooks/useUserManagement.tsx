
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useUserManagement = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        // Keep loading true only on initial fetch
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
            toast({ title: "사용자 목록 로딩 실패", description: error.message, variant: "destructive" });
            setUsers([]);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchUsers();

        const channel = supabase
            .channel('realtime-profiles')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                () => {
                    fetchUsers(); // Refetch on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchUsers]);
    
    const updateUserStatus = async (userId: string, status: UserStatus) => {
        const updatePayload: {
            status: UserStatus;
            updated_at: string;
            approved_at?: string | null;
        } = {
            status,
            updated_at: new Date().toISOString(),
        };

        if (status === 'approved') {
            updatePayload.approved_at = new Date().toISOString();
        } else {
            updatePayload.approved_at = null;
        }

        const { error } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', userId);

        if (error) {
            console.error('Error updating user status:', error);
            toast({ title: "상태 업데이트 실패", description: error.message, variant: "destructive" });
            return false;
        }

        toast({ title: "사용자 상태 변경", description: `상태가 '${status}'(으)로 변경되었습니다.` });
        return true;
    };

    const deleteUser = async (userId: string) => {
        try {
            console.log('사용자 삭제 시도:', userId);
            
            // 먼저 auth.users에서 삭제 시도
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);
            
            if (authError) {
                console.warn('Auth 사용자 삭제 실패 (계속 진행):', authError);
            } else {
                console.log('Auth 사용자 삭제 성공');
            }

            // profiles 테이블에서 삭제
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (profileError) {
                console.error('Profile 삭제 실패:', profileError);
                toast({ 
                    title: "사용자 삭제 실패", 
                    description: `Profile 삭제 중 오류: ${profileError.message}`, 
                    variant: "destructive" 
                });
                return false;
            }

            console.log('Profile 삭제 성공');
            toast({ title: "사용자 삭제", description: "사용자가 성공적으로 삭제되었습니다." });
            
            // 즉시 사용자 목록 새로고침
            await fetchUsers();
            
            return true;
        } catch (error) {
            console.error('사용자 삭제 중 예상치 못한 오류:', error);
            toast({ 
                title: "사용자 삭제 실패", 
                description: `예상치 못한 오류가 발생했습니다: ${error}`, 
                variant: "destructive" 
            });
            return false;
        }
    };

    return { users, loading, updateUserStatus, deleteUser };
};
