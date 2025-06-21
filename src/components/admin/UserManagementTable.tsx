
import React, { useState } from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import RemainingTime from './RemainingTime';
import type { UserStatus } from '@/types';

const getStatusBadgeVariant = (status: UserStatus): 'default' | 'secondary' | 'destructive' => {
  switch (status) {
    case 'approved':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'rejected':
    case 'expired':
      return 'destructive';
    default:
      return 'secondary';
  }
};

interface UserManagementTableProps {
  isAdmin?: boolean;
}

const ADMIN_EMAILS = ['5321497@naver.com'];

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ isAdmin = false }) => {
  const { users, loading, updateUserStatus, deleteUser, setUserAccessDuration } = useUserManagement();
  const [accessDays, setAccessDays] = useState<{ [key: string]: string }>({});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">사용자 목록을 불러오는 중...</p>
      </div>
    );
  }

  const filteredUsers = isAdmin ? users : users.filter((user) => user.status === 'approved');
  
  const approvedUsers = filteredUsers.filter((user) => user.status === 'approved');
  const pendingUsers = isAdmin ? users.filter((user) => user.status === 'pending') : [];
  const rejectedUsers = isAdmin ? users.filter((user) => user.status === 'rejected') : [];
  const expiredUsers = isAdmin ? users.filter((user) => user.status === 'expired') : [];

  const isAdminUser = (email: string) => {
    return ADMIN_EMAILS.includes(email);
  };

  const handleSetAccessDuration = async (userId: string) => {
    const days = parseInt(accessDays[userId] || '0');
    if (isNaN(days) || days < 0) {
      alert('유효한 일수를 입력해주세요.');
      return;
    }
    
    const success = await setUserAccessDuration(userId, days);
    if (success) {
      setAccessDays(prev => ({ ...prev, [userId]: '' }));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>승인된 사용자 ({approvedUsers.length})</CardTitle>
            <CardDescription>현재 서비스를 이용 중인 사용자들입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이메일</TableHead>
                  <TableHead>남은 기간</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">승인된 사용자가 없습니다.</TableCell>
                  </TableRow>
                ) : (
                  approvedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                        {isAdminUser(user.email) && <Badge variant="secondary" className="ml-2">관리자</Badge>}
                      </TableCell>
                      <TableCell><RemainingTime approvedAt={user.approved_at} /></TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 승인 대기 사용자 */}
      <Card>
        <CardHeader>
          <CardTitle>승인 대기 사용자 ({pendingUsers.length})</CardTitle>
          <CardDescription>승인을 기다리고 있는 사용자입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">승인 대기 중인 사용자가 없습니다.</TableCell></TableRow>
              ) : (
                pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => updateUserStatus(user.id, 'approved')}>승인</Button>
                      <Button size="sm" variant="destructive" onClick={() => updateUserStatus(user.id, 'rejected')}>거절</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 승인된 사용자 */}
      <Card>
        <CardHeader>
          <CardTitle>승인된 사용자 ({approvedUsers.length})</CardTitle>
          <CardDescription>서비스 이용이 승인된 사용자입니다. 사용 기간을 설정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>남은 기간</TableHead>
                <TableHead>사용 기간 설정</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedUsers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">승인된 사용자가 없습니다.</TableCell></TableRow>
              ) : (
                approvedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.email}
                      {isAdminUser(user.email) && <Badge variant="secondary" className="ml-2">관리자</Badge>}
                    </TableCell>
                    <TableCell><RemainingTime approvedAt={user.approved_at} /></TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="일수"
                          className="w-20"
                          value={accessDays[user.id] || ''}
                          onChange={(e) => setAccessDays(prev => ({ ...prev, [user.id]: e.target.value }))}
                        />
                        <Button size="sm" onClick={() => handleSetAccessDuration(user.id)}>확인</Button>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      {!isAdminUser(user.email) && (
                        <Button size="sm" variant="destructive" onClick={() => updateUserStatus(user.id, 'rejected')}>승인 취소</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 시간 만료 사용자 */}
      <Card>
        <CardHeader>
          <CardTitle>시간 만료 사용자 ({expiredUsers.length})</CardTitle>
          <CardDescription>사용 기간이 만료된 사용자입니다. 새로운 사용 기간을 설정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>만료일</TableHead>
                <TableHead>사용 기간 설정</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiredUsers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">시간 만료된 사용자가 없습니다.</TableCell></TableRow>
              ) : (
                expiredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="일수"
                          className="w-20"
                          value={accessDays[user.id] || ''}
                          onChange={(e) => setAccessDays(prev => ({ ...prev, [user.id]: e.target.value }))}
                        />
                        <Button size="sm" onClick={() => handleSetAccessDuration(user.id)}>확인</Button>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>사용자 삭제 확인</AlertDialogTitle>
                            <AlertDialogDescription>
                              이 사용자를 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>삭제</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 거절된 사용자 */}
      <Card>
        <CardHeader>
          <CardTitle>거절된 사용자 ({rejectedUsers.length})</CardTitle>
          <CardDescription>접근이 거절된 사용자입니다. 필요시 다시 승인하거나 완전 삭제할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>거절일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rejectedUsers.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">거절된 사용자가 없습니다.</TableCell></TableRow>
              ) : (
                rejectedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => updateUserStatus(user.id, 'approved')}>다시 승인</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>사용자 삭제 확인</AlertDialogTitle>
                            <AlertDialogDescription>
                              이 사용자를 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>삭제</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
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
