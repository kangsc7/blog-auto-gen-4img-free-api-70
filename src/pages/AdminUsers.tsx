
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { AppHeader } from '@/components/layout/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminUsers = () => {
    const { user, loading, handleLogout, isAdmin } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>로딩 중...</p>
            </div>
        );
    }
    
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center shadow-lg">
                    <CardHeader>
                        <div className="mx-auto bg-red-100 rounded-full p-3 w-fit">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-bold">접근 거부</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="mb-6">
                            이 페이지에 접근할 권한이 없습니다.
                        </CardDescription>
                        <Button onClick={() => navigate('/')}>
                           <ArrowLeft className="mr-2 h-4 w-4" /> 메인으로 돌아가기
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <AppHeader
                currentUser={user?.email || '관리자'}
                resetApp={() => window.location.reload()}
                handleLogout={handleLogout}
            />
            <main className="container mx-auto p-4 md:p-6">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="h-10 w-10 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">사용자 관리</h1>
                            <p className="text-gray-500">새로운 사용자의 가입을 실시간으로 승인하거나 거절합니다.</p>
                        </div>
                    </div>
                    <Button asChild variant="outline">
                        <Link to="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            메인으로 돌아가기
                        </Link>
                    </Button>
                </div>
                <UserManagementTable />
            </main>
        </div>
    );
};

export default AdminUsers;
