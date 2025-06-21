
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
            // 실시간으로 만료된 사용자 상태 업데이트
            const updatedUsers = (data || []).map(user => {
                if (user.status === 'approved' && user.access_expires_at) {
                    const now = new Date();
                    const expiresAt = new Date(user.access_expires_at);
                    if (now > expiresAt && user.status !== 'expired') {
                        // 백그라운드에서 상태 업데이트
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
                    fetchUsers(); // Refetch on any change
                }
            )
            .subscribe();

        // 주기적으로 만료된 사용자 체크 (1분마다)
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
            const accessExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 기본 30일
            updatePayload.approved_at = now.toISOString();
            updatePayload.access_expires_at = accessExpiresAt.toISOString();
            updatePayload.remaining_access_days = 30;
        } else if (status === 'expired') {
            updatePayload.approved_at = null;
            updatePayload.access_expires_at = null;
            updatePayload.remaining_access_days = 0;
        } else if (status === 'rejected') {
            // 거절 시에는 승인 관련 정보만 초기화
            updatePayload.approved_at = null;
            updatePayload.access_expires_at = null;
            updatePayload.remaining_access_days = null;
        }

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
        
        // 로컬 상태 즉시 업데이트
        setUsers(prevUsers => 
            prevUsers.map(user => 
                user.id === userId 
                    ? { ...user, ...updatePayload }
                    : user
            )
        );

        toast({ title: "사용자 상태 변경", description: `상태가 '${status}'(으)로 변경되었습니다.` });
        return true;
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
            
            // 1. 먼저 로컬 상태에서 제거 (즉시 UI 업데이트)
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            
            // 2. 실시간 구독 일시 중단
            const channel = supabase.channel('delete-operation');
            
            // 3. user_roles 테이블에서 삭제
            console.log('🔄 user_roles 삭제 중...');
            const { error: roleError } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            if (roleError && roleError.code !== 'PGRST116') {
                console.warn('⚠️ 역할 삭제 경고:', roleError);
            }

            // 4. profiles 테이블에서 삭제 (관리자 권한으로 RLS 우회)
            console.log('🔄 profiles 삭제 중...');
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (profileError) {
                console.error('❌ 프로필 삭제 실패:', profileError);
                
                // 실패 시 로컬 상태 복원
                await fetchUsers();
                throw profileError;
            }

            // 5. auth.users에서도 삭제 시도 (관리자 권한 필요)
            console.log('🔄 auth 사용자 삭제 시도...');
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);
            
            if (authError) {
                console.warn('⚠️ Auth 사용자 삭제 경고:', authError.message);
                // auth 삭제 실패는 무시하고 계속 진행
            }

            console.log('✅ 완전 삭제 성공');
            
            toast({ 
                title: "✅ 사용자 완전 삭제 완료", 
                description: "사용자의 모든 데이터가 영구적으로 삭제되었습니다.",
                duration: 4000
            });

            // 6. 채널 정리
            supabase.removeChannel(channel);
            
            return true;

        } catch (error: any) {
            console.error('❌ 완전 삭제 실패:', error);
            
            // 실패 시 사용자 목록 다시 로드
            await fetchUsers();
            
            toast({ 
                title: "❌ 사용자 삭제 실패", 
                description: error.message || "삭제 중 오류가 발생했습니다.", 
                variant: "destructive",
                duration: 5000
            });
            
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
