import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAuth } from '@/hooks/useAuth';

const InfographicGenerator = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [generatedInfographic, setGeneratedInfographic] = useState('');
  const { session, handleLogout } = useAuth();

  const handleGenerateInfographic = () => {
    // 간단한 예시: 제목과 내용을 합쳐서 인포그래픽 내용 생성
    setGeneratedInfographic(`
      <h1>${title}</h1>
      <p>${content}</p>
      <img src="https://via.placeholder.com/350x150" alt="Placeholder Image" />
    `);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-gray-700">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader
        currentUser={session?.user?.email || 'Guest'}
        handleLogout={handleLogout}
      />
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">인포그래픽 생성기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">제목</label>
              <Input
                type="text"
                placeholder="인포그래픽 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">내용</label>
              <Textarea
                placeholder="인포그래픽 내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none"
              />
            </div>
            <Button onClick={handleGenerateInfographic} className="w-full">
              인포그래픽 생성
            </Button>
          </CardContent>
        </Card>

        {generatedInfographic && (
          <Card className="max-w-2xl mx-auto mt-8 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold">생성된 인포그래픽</CardTitle>
            </CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: generatedInfographic }} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InfographicGenerator;
