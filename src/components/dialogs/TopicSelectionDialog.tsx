
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TopicSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics: string[];
  onSelectTopic: (topic: string) => void;
  title?: string;
}

export const TopicSelectionDialog: React.FC<TopicSelectionDialogProps> = ({
  open,
  onOpenChange,
  topics,
  onSelectTopic,
  title = "생성된 주제",
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleConfirm = () => {
    if (selectedTopic) {
      onSelectTopic(selectedTopic);
      setSelectedTopic("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] p-0 overflow-hidden bg-gradient-to-b from-white to-blue-50">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-md">
          <DialogTitle className="text-xl font-bold text-center text-white">
            {title}
          </DialogTitle>
          <p className="text-center text-white opacity-90 mt-2">
            다음 중 작성하실 주제를 선택해 주세요
          </p>
        </DialogHeader>
        
        <div className="p-1">
          <ScrollArea className="h-[320px] px-4 py-2">
            <div className="space-y-2">
              {topics.length > 0 ? (
                topics.map((topic, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedTopic === topic
                        ? "bg-blue-100 border-2 border-blue-500 shadow-md"
                        : "bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                    }`}
                    onClick={() => handleSelectTopic(topic)}
                  >
                    <p className={`text-base ${selectedTopic === topic ? "font-semibold text-blue-700" : "text-gray-700"}`}>
                      {topic}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  생성된 주제가 없습니다
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 text-gray-700"
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTopic}
            className={`${
              selectedTopic
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            } text-white`}
          >
            주제 선택 및 글 작성 시작
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
