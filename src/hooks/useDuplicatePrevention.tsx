
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// 유사도 계산 함수 (70% 기준)
const calculateSimilarity = (str1: string, str2: string): number => {
  const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  if (s1 === s2) return 100;
  
  const maxLength = Math.max(s1.length, s2.length);
  let matches = 0;
  
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++;
  }
  
  return (matches / maxLength) * 100;
};

// localStorage 키
const DUPLICATE_TOPICS_KEY = 'blog_duplicate_topics';

export const useDuplicatePrevention = () => {
  const { toast } = useToast();
  const [preventDuplicates, setPreventDuplicates] = useState(true);
  const [duplicateTopics, setDuplicateTopics] = useState<string[]>([]);

  // localStorage에서 중복 주제 목록 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DUPLICATE_TOPICS_KEY);
      if (stored) {
        setDuplicateTopics(JSON.parse(stored));
      }
    } catch (error) {
      console.error('중복 주제 목록 로드 실패:', error);
    }
  }, []);

  // 중복 주제 목록을 localStorage에 저장
  const saveDuplicateTopics = (topics: string[]) => {
    try {
      localStorage.setItem(DUPLICATE_TOPICS_KEY, JSON.stringify(topics));
      setDuplicateTopics(topics);
    } catch (error) {
      console.error('중복 주제 목록 저장 실패:', error);
    }
  };

  // 중복 주제인지 확인
  const isDuplicateTopic = (newTopic: string): boolean => {
    if (!preventDuplicates) return false;
    
    return duplicateTopics.some(existingTopic => {
      const similarity = calculateSimilarity(newTopic, existingTopic);
      return similarity >= 70;
    });
  };

  // 새 주제를 중복 목록에 추가
  const addToDuplicateList = (topic: string) => {
    if (preventDuplicates && !isDuplicateTopic(topic)) {
      const newTopics = [...duplicateTopics, topic];
      saveDuplicateTopics(newTopics);
      console.log('중복 목록에 추가된 주제:', topic);
    }
  };

  // 중복 방지 토글
  const handlePreventDuplicatesToggle = () => {
    const newValue = !preventDuplicates;
    setPreventDuplicates(newValue);
    
    console.log('중복금지 설정 변경:', { 이전값: preventDuplicates, 새값: newValue });
    
    // 중복 허용으로 변경시 저장된 중복 목록 삭제
    if (!newValue) {
      clearDuplicateTopics();
      toast({
        title: "중복 허용 활성화",
        description: "기존에 중복으로 금지된 키워드들을 다시 사용할 수 있습니다.",
      });
    } else {
      toast({
        title: "중복 금지 활성화", 
        description: "70% 이상 유사한 주제는 생성되지 않습니다.",
      });
    }
  };

  // 중복 주제 목록 완전 삭제
  const clearDuplicateTopics = () => {
    try {
      localStorage.removeItem(DUPLICATE_TOPICS_KEY);
      setDuplicateTopics([]);
      console.log('✅ 중복 주제 목록 완전 삭제');
    } catch (error) {
      console.error('중복 주제 목록 삭제 실패:', error);
    }
  };

  return {
    preventDuplicates,
    duplicateTopics,
    isDuplicateTopic,
    addToDuplicateList,
    handlePreventDuplicatesToggle,
    clearDuplicateTopics,
  };
};
