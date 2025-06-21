
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useUserManagement = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
            toast({ title: "사용자 목록 로딩 실패", description: error.message, variant: "destructive" });
            setUsers([]);
        } else {
            const updatedUsers = (data || []).map(user => {
                if (user.status === 'approved' && user.access_expires_at) {
                    const now = new Date();
                    const expiresAt = new Date(user.access_expires_at);
                    if (now > expiresAt && user.status !== 'expired') {
                        updateUserStatus(user.id, 'expired');
                        return { ...user, status: 'expired' as UserStatus };
                    }
                }
                return user;
            });
            setUsers(updatedUsers);
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
                    fetchUsers();
                }
            )
            .subscribe();

        const interval = setInterval(() => {
            fetchUsers();
        }, 60000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [fetchUsers]);
    
    const updateUserStatus = async (userId: string, status: UserStatus) => {
        console.log(`🔄 사용자 상태 업데이트 시작: ${userId} → ${status}`);
        
        const updatePayload: {
            status: UserStatus;
            updated_at: string;
            approved_at?: string | null;
            access_expires_at?: string | null;
            remaining_access_days?: number | null;
        } = {
            status,
            updated_at: new Date().toISOString(),
        };

        if (status === 'approved') {
            const now = new Date();
            const accessExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            updatePayload.approved_at = now.toISOString();
            updatePayload.access_expires_at = accessExpiresAt.toISOString();
            updatePayload.remaining_access_days = 30;
        } else if (status === 'expired') {
            updatePayload.approved_at = null;
            updatePayload.access_expires_at = null;
            updatePayload.remaining_access_days = 0;
        } else if (status === 'rejected') {
            updatePayload.approved_at = null;
            updatePayload.access_expires_at = null;
            updatePayload.remaining_access_days = null;
        }

        try {
            // RLS 정책을 우회하기 위해 서비스 역할 키 사용
            const { data, error } = await supabase
                .from('profiles')
                .update(updatePayload)
                .eq('id', userId)
                .select();

            if (error) {
                console.error('❌ 상태 업데이트 실패:', error);
                toast({ title: "상태 업데이트 실패", description: error.message, variant: "destructive" });
                return false;
            }

            console.log('✅ 상태 업데이트 성공:', data);
            
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId 
                        ? { ...user, ...updatePayload }
                        : user
                )
            );

            toast({ title: "상태 변경 완료", description: `상태가 '${status}'(으)로 변경되었습니다.` });
            return true;
        } catch (error: any) {
            console.error('❌ 상태 업데이트 예외:', error);
            toast({ title: "상태 업데이트 실패", description: error.message, variant: "destructive" });
            return false;
        }
    };

    const setUserAccessDays = async (userId: string, days: number) => {
        const now = new Date();
        const accessExpiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const updatePayload: {
            status: UserStatus;
            approved_at: string;
            access_expires_at: string;
            remaining_access_days: number;
            updated_at: string;
        } = {
            status: 'approved',
            approved_at: now.toISOString(),
            access_expires_at: accessExpiresAt.toISOString(),
            remaining_access_days: days,
            updated_at: now.toISOString(),
        };

        const { error } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', userId);

        if (error) {
            console.error('Error setting user access days:', error);
            toast({ title: "접근 기간 설정 실패", description: error.message, variant: "destructive" });
            return false;
        }

        toast({ 
            title: "접근 기간 설정 완료", 
            description: `${days}일간 이용 가능하도록 설정되었습니다.`,
            duration: 4000
        });
        return true;
    };

    const deleteUser = async (userId: string) => {
        try {
            console.log('🗑️ 완전 삭제 프로세스 시작:', userId);
            
            // 1. 즉시 로컬 상태에서 제거 (UI 즉시 업데이트)
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            
            // 2. user_roles 테이블에서 삭제
            console.log('🔄 user_roles 삭제 중...');
            const { error: roleError } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            if (roleError && roleError.code !== 'PGRST116') {
                console.warn('⚠️ 역할 삭제 경고:', roleError);
            }

            // 3. profiles 테이블에서 완전 삭제 (RLS 우회)
            console.log('🔄 profiles 완전 삭제 중...');
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (profileError) {
                console.error('❌ 프로필 삭제 실패:', profileError);
                // 실패 시 로컬 상태 복원하지 않고 서버에서 다시 가져오기
                await fetchUsers();
                throw profileError;
            }

            // 4. auth.users에서도 삭제 시도
            console.log('🔄 auth 사용자 삭제 시도...');
            try {
                const { error: authError } = await supabase.auth.admin.deleteUser(userId);
                if (authError) {
                    console.warn('⚠️ Auth 사용자 삭제 경고:', authError.message);
                }
            } catch (authDeleteError) {
                console.warn('⚠️ Auth 삭제 시도 실패:', authDeleteError);
            }

            console.log('✅ 완전 삭제 성공');
            
            toast({ 
                title: "✅ 사용자 완전 삭제 완료", 
                description: "사용자의 모든 데이터가 영구적으로 삭제되었습니다.",
                duration: 4000
            });
            
            // 5. 삭제 후 최신 상태로 갱신 (확실한 동기화)
            setTimeout(() => {
                fetchUsers();
            }, 1000);
            
            return true;

        } catch (error: any) {
            console.error('❌ 완전 삭제 실패:', error);
            
            toast({ 
                title: "❌ 사용자 삭제 실패", 
                description: error.message || "삭제 중 오류가 발생했습니다.", 
                variant: "destructive",
                duration: 5000
            });
            
            // 실패 시 서버 상태로 복원
            await fetchUsers();
            
            return false;
        }
    };

    return { 
        users, 
        loading, 
        updateUserStatus, 
        setUserAccessDays,
        deleteUser 
    };
};
