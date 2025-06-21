
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const fetchKeywords = async () => {
  const { data, error, count } = await supabase
    .from('keywords')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return { keywords: data || [], count: count ?? 0 };
};

const AdminKeywords = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['keywords'], 
    queryFn: fetchKeywords
  });

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">키워드 관리</h1>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            메인으로 돌아가기
          </Link>
        </Button>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="ml-4 text-lg text-gray-600">키워드를 불러오는 중입니다...</p>
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : String(error)}</AlertDescription>
        </Alert>
      )}

      {data && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>키워드 목록</CardTitle>
            <CardDescription>
              데이터베이스에 저장된 총 {data.count}개의 키워드입니다.
              가장 최근에 추가된 키워드가 위쪽에 표시됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-2/5">키워드</TableHead>
                      <TableHead>타입</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead className="text-right">생성일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.keywords.map((keyword) => (
                      <TableRow key={keyword.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{keyword.keyword_text}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            keyword.type === 'evergreen' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {keyword.type}
                          </span>
                        </TableCell>
                        <TableCell>{keyword.category}</TableCell>
                        <TableCell className="text-right">{new Date(keyword.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminKeywords;
