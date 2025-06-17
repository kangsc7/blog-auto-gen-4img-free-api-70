
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useUserManagement = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const channelRef = useRef<any>(null);
    const isDeletingRef = useRef(false);

    const fetchUsers = useCallback(async () => {
        // 삭제 중일 때는 fetch 하지 않음
        if (isDeletingRef.current) {
            console.log('삭제 중이므로 사용자 목록 갱신을 건너뜁니다.');
            return;
        }

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
                    // 삭제 중일 때는 실시간 업데이트 무시
                    if (isDeletingRef.current) {
                        console.log('삭제 중이므로 실시간 업데이트를 무시합니다:', payload);
                        return;
                    }
                    console.log('실시간 프로필 변경 감지:', payload);
                    fetchUsers();
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
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
            console.log('사용자 삭제 시작:', userId);
            
            // 삭제 중 플래그 설정 - 실시간 업데이트 차단
            isDeletingRef.current = true;
            
            // 실시간 구독 일시 중단
            if (channelRef.current) {
                console.log('실시간 구독 일시 중단');
                await supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }

            // 먼저 UI에서 해당 사용자 즉시 제거
            setUsers(prevUsers => {
                const filteredUsers = prevUsers.filter(user => user.id !== userId);
                console.log('UI에서 사용자 즉시 제거, 남은 사용자 수:', filteredUsers.length);
                return filteredUsers;
            });

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
                
                // 실패 시 원복을 위해 다시 fetch
                await fetchUsers();
                return false;
            }

            console.log('Profile 삭제 성공');
            
            // auth.users에서 삭제 시도 (실패해도 계속 진행)
            try {
                const { error: authError } = await supabase.auth.admin.deleteUser(userId);
                if (authError) {
                    console.warn('Auth 사용자 삭제 실패 (무시하고 계속):', authError);
                } else {
                    console.log('Auth 사용자 삭제 성공');
                }
            } catch (authDeleteError) {
                console.warn('Auth 삭제 중 예외 발생 (무시):', authDeleteError);
            }

            toast({ title: "사용자 삭제 완료", description: "사용자가 성공적으로 삭제되었습니다." });
            
            // 삭제 완료 후 플래그 해제
            isDeletingRef.current = false;
            
            // 실시간 구독 재시작
            const newChannel = supabase
                .channel('realtime-profiles-restart')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'profiles' },
                    (payload) => {
                        if (isDeletingRef.current) {
                            console.log('삭제 중이므로 실시간 업데이트를 무시합니다:', payload);
                            return;
                        }
                        console.log('실시간 프로필 변경 감지 (재시작):', payload);
                        fetchUsers();
                    }
                )
                .subscribe();
            
            channelRef.current = newChannel;
            console.log('실시간 구독 재시작 완료');
            
            return true;
        } catch (error) {
            console.error('사용자 삭제 중 예상치 못한 오류:', error);
            toast({ 
                title: "사용자 삭제 실패", 
                description: `예상치 못한 오류가 발생했습니다: ${error}`, 
                variant: "destructive" 
            });
            
            // 오류 발생 시 플래그 해제 및 원복
            isDeletingRef.current = false;
            await fetchUsers();
            return false;
        }
    };

    return { users, loading, updateUserStatus, deleteUser };
};
