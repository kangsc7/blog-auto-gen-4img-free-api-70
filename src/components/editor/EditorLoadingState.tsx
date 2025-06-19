
import React from 'react';
import { Loader2 } from 'lucide-react';

export const EditorLoadingState: React.FC = () => {
  return (
    <div className="text-center py-8 text-gray-500 flex flex-col items-center justify-center min-h-[200px]">
      <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
      <p className="font-semibold text-lg">
        <span className="font-bold text-blue-600">
          <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite] transform-origin-[70%_70%] mr-0.5">파</span>
          <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite_0.1s] transform-origin-[70%_70%] mr-0.5">코</span>
          <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite_0.2s] transform-origin-[70%_70%] mr-0.5">월</span>
          <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite_0.3s] transform-origin-[70%_70%]">드</span>
        </span>
        가 글을 생성하고 있습니다...
      </p>
      <p className="text-sm animate-fade-in">잠시만 기다려주세요.</p>
    </div>
  );
};
