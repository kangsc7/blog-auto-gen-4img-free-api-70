
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { TopicConfirmDialog } from '@/components/dialog/TopicConfirmDialog';

interface TopicListProps {
  topics: string[];
  selectedTopic: string;
  selectTopic: (topic: string) => void;
  onTopicConfirm?: (topic: string) => void;
}

export const TopicList: React.FC<TopicListProps> = ({ 
  topics, 
  selectedTopic, 
  selectTopic,
  onTopicConfirm 
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    topic: string;
  }>({ isOpen: false, topic: '' });

  const handleTopicClick = (topic: string) => {
    if (onTopicConfirm) {
      setConfirmDialog({ isOpen: true, topic });
    } else {
      selectTopic(topic);
    }
  };

  const handleConfirm = () => {
    if (onTopicConfirm) {
      onTopicConfirm(confirmDialog.topic);
    }
    selectTopic(confirmDialog.topic);
    setConfirmDialog({ isOpen: false, topic: '' });
  };

  const handleCancel = () => {
    setConfirmDialog({ isOpen: false, topic: '' });
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center text-blue-700">
              <Lightbulb className="h-5 w-5 mr-2" />
              생성된 주제 목록
            </span>
            <span className="text-sm text-gray-500">{topics.length}개 생성됨</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>키워드를 입력하고 주제를 생성해보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {topics.map((topic, index) => (
                <div
                  key={index}
                  onClick={() => handleTopicClick(topic)}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedTopic === topic 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{topic}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TopicConfirmDialog
        isOpen={confirmDialog.isOpen}
        topic={confirmDialog.topic}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};
