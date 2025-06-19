import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAuth } from '@/hooks/useAuth';

const YoutubeGenerator = () => {
  const { session, profile, handleLogout } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!session) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader
        currentUser={profile?.email || 'Unknown User'}
        handleLogout={handleLogout}
      />
      <div className="container mx-auto py-8">
        <Card className="max-w-lg mx-auto shadow-md">
          <CardHeader>
            <CardTitle>YouTube 콘텐츠 생성기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                제목
              </label>
              <Input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                설명
              </label>
              <Textarea
                placeholder="설명을 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
              />
            </div>
            <Button className="w-full">콘텐츠 생성하기</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YoutubeGenerator;

