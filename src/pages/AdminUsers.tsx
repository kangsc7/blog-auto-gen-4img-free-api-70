
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { AppHeader } from '@/components/layout/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, ShieldCheck, ArrowLeft, Users, Info } from 'lucide-react';
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
    
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center shadow-lg">
                    <CardHeader>
                        <div className="mx-auto bg-red-100 rounded-full p-3 w-fit">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-bold">로그인 필요</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="mb-6">
                            이 페이지에 접근하려면 로그인이 필요합니다.
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
                currentUser={user?.email || '사용자'}
                handleLogout={handleLogout}
            />
            <main className="container mx-auto p-4 md:p-6">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        {isAdmin ? (
                            <ShieldCheck className="h-10 w-10 text-blue-600" />
                        ) : (
                            <Users className="h-10 w-10 text-blue-600" />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                {isAdmin ? '사용자 관리' : '사용자 현황'}
                            </h1>
                            <p className="text-gray-500">
                                {isAdmin 
                                    ? '새로운 사용자의 가입을 실시간으로 승인하거나 거절합니다.' 
                                    : '현재 서비스 사용자 현황을 확인할 수 있습니다.'
                                }
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="outline">
                        <Link to="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            메인으로 돌아가기
                        </Link>
                    </Button>
                </div>

                {!isAdmin && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-600" />
                                안내사항
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                이 페이지는 현재 서비스를 이용 중인 사용자들의 현황을 보여줍니다. 
                                사용자 승인/거절 등의 관리 기능은 관리자만 이용할 수 있습니다.
                            </CardDescription>
                        </CardContent>
                    </Card>
                )}

                <UserManagementTable isAdmin={isAdmin} />
            </main>
        </div>
    );
};

export default AdminUsers;
