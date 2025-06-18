
import React from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RemainingTime from './RemainingTime';
import type { UserStatus } from '@/types';

const getStatusBadgeVariant = (status: UserStatus): 'default' | 'secondary' | 'destructive' => {
  switch (status) {
    case 'approved':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
};

interface UserManagementTableProps {
  isAdmin?: boolean;
}

// 관리자 이메일 목록
const ADMIN_EMAILS = ['5321497@naver.com'];

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ isAdmin = false }) => {
  const { users, loading, updateUserStatus } = useUserManagement();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">사용자 목록을 불러오는 중...</p>
      </div>
    );
  }

  const approvedUsers = users.filter((user) => user.status === 'approved');

  // 사용자가 관리자인지 확인하는 함수
  const isAdminUser = (email: string) => {
    return ADMIN_EMAILS.includes(email);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>승인된 사용자 ({approvedUsers.length})</CardTitle>
          <CardDescription>
            {isAdmin 
              ? '서비스 이용이 승인된 사용자입니다. 승인 후 30일이 지나면 접근이 만료됩니다.' 
              : '현재 서비스를 이용 중인 사용자들입니다.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>남은 기간</TableHead>
                <TableHead>상태</TableHead>
                {isAdmin && <TableHead className="text-right">관리</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedUsers.length === 0 ? (
                <TableRow><TableCell colSpan={isAdmin ? 4 : 3} className="h-24 text-center">승인된 사용자가 없습니다.</TableCell></TableRow>
              ) : (
                approvedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.email}
                      {isAdminUser(user.email) && <Badge variant="secondary" className="ml-2">관리자</Badge>}
                    </TableCell>
                    <TableCell><RemainingTime approvedAt={user.approved_at} /></TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge></TableCell>
                    {isAdmin && (
                      <TableCell className="text-right space-x-2">
                        {!isAdminUser(user.email) && (
                          <Button size="sm" variant="destructive" onClick={() => updateUserStatus(user.id, 'rejected')}>승인 취소</Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
