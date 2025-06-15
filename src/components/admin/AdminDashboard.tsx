
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';

export const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      toast({ title: '오류', description: '사용자 목록을 불러오는 데 실패했습니다.', variant: 'destructive' });
      console.error(error);
    } else {
      setPendingUsers(data as Profile[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleUpdateUserStatus = async (userId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      toast({ title: '오류', description: '사용자 상태 변경에 실패했습니다.', variant: 'destructive' });
    } else {
      toast({ title: '성공', description: `사용자 상태를 '${status}'(으)로 변경했습니다.` });
      fetchPendingUsers();
    }
  };

  return (
    <div className="max-w-7xl mx-auto mb-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>관리자 대시보드</CardTitle>
              <CardDescription>가입 승인 대기 중인 사용자 목록입니다.</CardDescription>
            </div>
            <Button onClick={fetchPendingUsers} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이메일</TableHead>
                  <TableHead>가입 요청일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center h-24">로딩 중...</TableCell></TableRow>
                ) : pendingUsers.length > 0 ? (
                  pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleString('ko-KR')}</TableCell>
                      <TableCell><Badge variant="outline">{user.status}</Badge></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="default" onClick={() => handleUpdateUserStatus(user.id, 'approved')}>승인</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateUserStatus(user.id, 'rejected')}>거절</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={4} className="text-center h-24">승인 대기 중인 사용자가 없습니다.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
