
import React, { useState } from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Clock, Trash2, RefreshCw } from 'lucide-react';
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
    case 'expired':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: UserStatus): string => {
  switch (status) {
    case 'approved': return '승인됨';
    case 'pending': return '대기중';
    case 'rejected': return '거절됨';
    case 'expired': return '만료됨';
    default: return status;
  }
};

interface UserManagementTableProps {
  isAdmin?: boolean;
}

// 관리자 이메일 목록
const ADMIN_EMAILS = ['5321497@naver.com'];

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ isAdmin = false }) => {
  const { users, loading, updateUserStatus, setUserAccessDays, deleteUser } = useUserManagement();
  const [accessDays, setAccessDays] = useState<{ [key: string]: string }>({});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">사용자 목록을 불러오는 중...</p>
      </div>
    );
  }

  // 비관리자는 승인된 사용자만 보기, 관리자는 모든 상태의 사용자 보기
  const filteredUsers = isAdmin ? users : users.filter((user) => user.status === 'approved');
  
  // 상태별로 사용자 분류
  const approvedUsers = filteredUsers.filter((user) => user.status === 'approved');
  const pendingUsers = isAdmin ? users.filter((user) => user.status === 'pending') : [];
  const rejectedUsers = isAdmin ? users.filter((user) => user.status === 'rejected') : [];
  const expiredUsers = isAdmin ? users.filter((user) => user.status === 'expired') : [];

  // 사용자가 관리자인지 확인하는 함수
  const isAdminUser = (email: string) => {
    return ADMIN_EMAILS.includes(email);
  };

  // 접근 기간 설정
  const handleSetAccessDays = async (userId: string) => {
    const days = parseInt(accessDays[userId] || '0');
    if (isNaN(days) || days < 0) {
      return;
    }

    const success = await setUserAccessDays(userId, days);
    if (success) {
      setAccessDays(prev => ({ ...prev, [userId]: '' }));
    }
  };

  // 사용자 삭제
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (window.confirm(`정말로 ${userEmail} 사용자를 완전히 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      await deleteUser(userId);
    }
  };

  // 비관리자용 승인된 사용자만 보여주는 컴포넌트
  if (!isAdmin) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>승인된 사용자 ({approvedUsers.length})</CardTitle>
            <CardDescription>
              현재 서비스를 이용 중인 사용자들입니다.
            </CardDescription>
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
                    <TableCell colSpan={3} className="h-24 text-center">
                      승인된 사용자가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  approvedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                        {isAdminUser(user.email) && <Badge variant="secondary" className="ml-2">관리자</Badge>}
                      </TableCell>
                      <TableCell><RemainingTime approvedAt={user.approved_at} expiresAt={user.access_expires_at} /></TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{getStatusLabel(user.status)}</Badge></TableCell>
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

  // 관리자용 모든 상태의 사용자 보여주는 컴포넌트
  return (
    <div className="space-y-8">
      {/* 승인 대기 사용자 */}
      <Card>
        <CardHeader>
          <CardTitle>승인 대기 사용자 ({pendingUsers.length})</CardTitle>
          <CardDescription>
            승인을 기다리고 있는 사용자입니다. 승인하면 설정한 기간만큼 서비스를 이용할 수 있습니다.
          </CardDescription>
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
                    <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{getStatusLabel(user.status)}</Badge></TableCell>
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
          <CardDescription>
            서비스 이용이 승인된 사용자입니다. 접근 기간을 개별적으로 설정할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>남은 기간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>기간 설정</TableHead>
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
                    <TableCell><RemainingTime approvedAt={user.approved_at} expiresAt={user.access_expires_at} /></TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{getStatusLabel(user.status)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="일수"
                          className="w-16"
                          value={accessDays[user.id] || ''}
                          onChange={(e) => setAccessDays(prev => ({ ...prev, [user.id]: e.target.value }))}
                          min="0"
                        />
                        <Button size="sm" onClick={() => handleSetAccessDays(user.id)}>
                          <Clock className="h-3 w-3 mr-1" />
                          설정
                        </Button>
                      </div>
                    </TableCell>
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
          <CardDescription>
            이용 기간이 만료된 사용자입니다. 기간을 다시 설정하여 재승인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>만료일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>기간 설정</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiredUsers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">만료된 사용자가 없습니다.</TableCell></TableRow>
              ) : (
                expiredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.access_expires_at ? new Date(user.access_expires_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{getStatusLabel(user.status)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="일수"
                          className="w-16"
                          value={accessDays[user.id] || ''}
                          onChange={(e) => setAccessDays(prev => ({ ...prev, [user.id]: e.target.value }))}
                          min="0"
                        />
                        <Button size="sm" onClick={() => handleSetAccessDays(user.id)}>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          재승인
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="destructive" onClick={() => updateUserStatus(user.id, 'rejected')}>거절</Button>
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
          <CardDescription>
            접근이 거절된 사용자입니다. 필요시 다시 승인하거나 완전히 삭제할 수 있습니다.
          </CardDescription>
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
                    <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{getStatusLabel(user.status)}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => updateUserStatus(user.id, 'approved')}>다시 승인</Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        완전 삭제
                      </Button>
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
