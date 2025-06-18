
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DuplicateErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DuplicateErrorDialog: React.FC<DuplicateErrorDialogProps> = ({
  open,
  onOpenChange,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-red-500 text-white p-6 rounded-lg shadow-xl max-w-md mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-white" />
          <h3 className="text-lg font-bold">최신 이슈 생성 실패</h3>
        </div>
        <p className="text-white mb-6 leading-relaxed">
          중복 주제 금지로 생성에 실패했습니다.<br />
          중복 허용을 활성화 하세요!
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => onOpenChange(false)}
            className="bg-white text-red-500 px-6 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
