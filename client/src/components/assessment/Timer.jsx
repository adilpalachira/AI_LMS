import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const Timer = ({ durationMinutes = 30, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 300; // < 5 mins

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
        isUrgent
          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
          : 'bg-blue-50 text-blue-700 border-blue-200'
      }`}
    >
      {isUrgent ? <AlertCircle size={16} /> : <Clock size={16} />}
      <span>
        Time Remaining: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer;
