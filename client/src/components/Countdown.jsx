import { useState, useEffect } from 'react';

// Tarihi her zaman İstanbul saati (UTC+3) olarak yorumla
const parseIstanbul = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes('T')) {
    return new Date(dateStr.includes('+') || dateStr.endsWith('Z') ? dateStr : dateStr + '+03:00');
  }
  return new Date(dateStr + 'T00:00:00+03:00');
};

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const difference = parseIstanbul(targetDate) - new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-xl px-3 py-3 md:p-4 shadow-lg flex-1 min-w-0">
      <span className="text-3xl md:text-4xl font-bold text-romantic-600 tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs md:text-sm text-gray-600 mt-1 uppercase tracking-wide whitespace-nowrap">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex gap-2 md:gap-3 justify-center w-full max-w-xs md:max-w-sm mx-auto">
      <TimeUnit value={timeLeft.days} label="Gün" />
      <TimeUnit value={timeLeft.hours} label="Saat" />
      <TimeUnit value={timeLeft.minutes} label="Dakika" />
    </div>
  );
};

export default Countdown;
