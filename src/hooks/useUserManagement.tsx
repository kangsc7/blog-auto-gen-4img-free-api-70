
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
        } else {
            updatePayload.approved_at = null;
            updatePayload.access_expires_at = null;
            updatePayload.remaining_access_days = null;
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
            console.log('🗑️ 사용자 완전 삭제 시작:', userId);
            
            // 관리자 권한으로 RLS 정책 우회를 위한 추가 확인
            const { data: currentUser } = await supabase.auth.getUser();
            if (!currentUser.user) {
                throw new Error('인증되지 않은 사용자입니다.');
            }

            // 1. 먼저 profiles 테이블에서 해당 사용자 확인
            console.log('1️⃣ 사용자 존재 확인...');
            const { data: existingUser, error: checkError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (checkError || !existingUser) {
                console.error('❌ 삭제할 사용자를 찾을 수 없음:', checkError);
                throw new Error('삭제할 사용자를 찾을 수 없습니다.');
            }

            console.log('✅ 삭제 대상 사용자 확인됨:', existingUser.email);

            // 2. user_roles 테이블에서 삭제 (역할이 있는 경우만)
            console.log('2️⃣ user_roles에서 삭제 시도...');
            const { error: roleError } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            // 역할이 없어도 정상 진행 (PGRST116은 'No rows found' 에러)
            if (roleError && roleError.code !== 'PGRST116') {
                console.warn('⚠️ 역할 삭제 경고:', roleError);
            } else {
                console.log('✅ user_roles 삭제 완료 (또는 해당 없음)');
            }

            // 3. profiles 테이블에서 삭제
            console.log('3️⃣ profiles에서 삭제 시도...');
            const { data: deleteResult, error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId)
                .select(); // 삭제된 행 반환

            if (profileError) {
                console.error('❌ 프로필 삭제 실패:', profileError);
                throw profileError;
            }

            if (!deleteResult || deleteResult.length === 0) {
                console.warn('⚠️ 삭제할 프로필을 찾을 수 없음 (이미 삭제됨?)');
                // 이미 삭제된 경우도 성공으로 처리
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                toast({
                    title: "✅ 사용자 삭제 완료",
                    description: "사용자가 이미 시스템에서 제거되었습니다.",
                    duration: 4000
                });
                return true;
            }

            console.log('✅ 프로필 삭제 성공:', deleteResult);

            // 4. 로컬 상태에서도 즉시 제거
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

            // 5. 성공 메시지
            toast({ 
                title: "✅ 사용자 완전 삭제 완료", 
                description: `${existingUser.email} 사용자의 모든 데이터가 영구적으로 삭제되었습니다.`,
                duration: 4000
            });

            console.log('🎉 사용자 완전 삭제 프로세스 완료');
            return true;

        } catch (error: any) {
            console.error('❌ 사용자 삭제 중 오류:', error);
            
            // 구체적인 오류 메시지 제공
            let errorMessage = "삭제 중 오류가 발생했습니다.";
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.code) {
                errorMessage = `데이터베이스 오류 (${error.code}): ${error.message || '알 수 없는 오류'}`;
            }
            
            toast({ 
                title: "❌ 사용자 삭제 실패", 
                description: errorMessage, 
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
