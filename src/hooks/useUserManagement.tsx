
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
                    fetchUsers();
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

    const setUserAccessDuration = async (userId: string, days: number) => {
        const now = new Date();
        const totalSeconds = days * 24 * 60 * 60;
        
        const { error } = await supabase
            .from('profiles')
            .update({
                access_duration_days: days,
                remaining_time_seconds: totalSeconds,
                last_time_update: now.toISOString(),
                status: days > 0 ? 'approved' : 'expired',
                updated_at: now.toISOString()
            })
            .eq('id', userId);

        if (error) {
            console.error('Error setting user access duration:', error);
            toast({ title: "접근 기간 설정 실패", description: error.message, variant: "destructive" });
            return false;
        }

        toast({ 
            title: "접근 기간 설정", 
            description: days > 0 ? `${days}일간 접근이 설정되었습니다.` : "접근이 즉시 만료되었습니다." 
        });
        return true;
    };

    const deleteUser = async (userId: string) => {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        
        if (error) {
            console.error('Error deleting user:', error);
            toast({ title: "사용자 삭제 실패", description: error.message, variant: "destructive" });
            return false;
        }

        toast({ title: "사용자 삭제", description: "사용자가 완전히 삭제되었습니다." });
        return true;
    };

    return { users, loading, updateUserStatus, deleteUser, setUserAccessDuration };
};
