
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface RemainingTimeProps {
  approvedAt: string | null;
  expiresAt: string | null;
}

const RemainingTime: React.FC<RemainingTimeProps> = ({ approvedAt, expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft('무제한');
      return;
    }

    const updateTimeLeft = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('만료됨');
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days}일 ${hours}시간`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}시간 ${minutes}분`);
        } else {
          setTimeLeft(`${minutes}분`);
        }
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [expiresAt]);

  const getBadgeVariant = () => {
    if (timeLeft === '만료됨') return 'destructive';
    if (timeLeft === '무제한') return 'secondary';
    return 'default';
  };

  return (
    <Badge variant={getBadgeVariant()}>
      {timeLeft}
    </Badge>
  );
};

export default RemainingTime;
