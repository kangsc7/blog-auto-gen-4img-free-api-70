
import { useState, useEffect, useMemo } from 'react';
import { differenceInSeconds, addDays } from 'date-fns';

const RemainingTime = ({ approvedAt }: { approvedAt: string | null }) => {
    const expiryDate = useMemo(() => {
        if (!approvedAt) return null;
        return addDays(new Date(approvedAt), 30);
    }, [approvedAt]);

    const calculateRemainingTime = () => {
        if (!expiryDate) return { expired: true, text: '' };

        const now = new Date();
        const totalSeconds = differenceInSeconds(expiryDate, now);

        if (totalSeconds <= 0) {
            return { expired: true, text: '만료됨' };
        }

        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        return { expired: false, text: `${days}일 ${hours}시간 ${minutes}분 남음` };
    };

    const [remaining, setRemaining] = useState(calculateRemainingTime());

    useEffect(() => {
        if (!approvedAt || remaining.expired) return;

        const timer = setInterval(() => {
            setRemaining(calculateRemainingTime());
        }, 1000 * 60); // 1분마다 업데이트

        return () => clearInterval(timer);
    }, [approvedAt, remaining.expired]);

    return <span>{remaining.text}</span>;
};

export default RemainingTime;
