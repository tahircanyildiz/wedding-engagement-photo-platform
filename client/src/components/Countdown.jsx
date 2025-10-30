import { useState, useEffect } from 'react';

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg min-w-[80px]">
      <span className="text-4xl font-bold text-romantic-600">{value.toString().padStart(2, '0')}</span>
      <span className="text-sm text-gray-600 mt-1 uppercase tracking-wide">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      <TimeUnit value={timeLeft.days} label="Gün" />
      <TimeUnit value={timeLeft.hours} label="Saat" />
      <TimeUnit value={timeLeft.minutes} label="Dakika" />
      <TimeUnit value={timeLeft.seconds} label="Saniye" />
    </div>
  );
};

export default Countdown;
