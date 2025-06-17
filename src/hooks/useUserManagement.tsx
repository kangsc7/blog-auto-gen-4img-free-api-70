
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useUserManagement = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);
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
                (payload) => {
                    // 삭제 중인 사용자의 실시간 업데이트는 무시
                    if (isDeletingUser && 
                        (payload.eventType === 'DELETE' || 
                         (payload.eventType === 'UPDATE' && payload.new?.id === isDeletingUser))) {
                        console.log('삭제 중인 사용자의 실시간 업데이트 무시:', payload);
                        return;
                    }
                    fetchUsers(); // 다른 경우에만 refetch
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchUsers, isDeletingUser]);
    
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
            
            // 삭제 플래그 설정으로 실시간 업데이트 차단
            setIsDeletingUser(userId);
            
            // UI에서 즉시 사용자 제거
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            
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
                // 실패 시 UI 복원
                await fetchUsers();
                toast({ 
                    title: "사용자 삭제 실패", 
                    description: `Profile 삭제 중 오류: ${profileError.message}`, 
                    variant: "destructive" 
                });
                return false;
            }

            console.log('Profile 삭제 성공');
            toast({ title: "사용자 삭제", description: "사용자가 성공적으로 삭제되었습니다." });
            
            return true;
        } catch (error) {
            console.error('사용자 삭제 중 예상치 못한 오류:', error);
            // 실패 시 UI 복원
            await fetchUsers();
            toast({ 
                title: "사용자 삭제 실패", 
                description: `예상치 못한 오류가 발생했습니다: ${error}`, 
                variant: "destructive" 
            });
            return false;
        } finally {
            // 삭제 플래그 해제
            setIsDeletingUser(null);
        }
    };

    return { users, loading, updateUserStatus, deleteUser };
};
