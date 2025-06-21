import { useEffect, useMemo, useState } from "react";

const Countdown = ({ baseDate, months, days, hours, minutes }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [isOver, setIsOver] = useState(false);

  const targetDate = useMemo(() => {
    const target = new Date(baseDate);
    console.log(target.getMonth());
    target.setMonth(target.getMonth() + months);
    target.setDate(target.getDate() + days);
    target.setHours(target.getHours() + hours);
    target.setMinutes(target.getMinutes() + minutes);
    return target;
  }, [baseDate, months, days, hours, minutes]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setIsOver(true);
        setTimeLeft({});
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const secs = totalSeconds % 60;
      const mins = Math.floor((totalSeconds / 60) % 60);
      const hrs = Math.floor((totalSeconds / 3600) % 24);
      const dys = Math.floor(totalSeconds / (3600 * 24));

      setTimeLeft({ days: dys, hours: hrs, minutes: mins, seconds: secs });
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-md text-center">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Wedding Countdown</h2>
      {isOver ? (
        <p className="text-red-500 font-medium">🎉 Countdown is over!</p>
      ) : (
        <div className="flex justify-center space-x-4 text-xl font-semibold text-gray-800">
          <div className="flex flex-col items-center">
            <span className="text-3xl">{timeLeft.days}</span>
            <span className="text-sm text-gray-500">Days</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl">{timeLeft.hours}</span>
            <span className="text-sm text-gray-500">Hours</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl">{timeLeft.minutes}</span>
            <span className="text-sm text-gray-500">Minutes</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl">{timeLeft.seconds}</span>
            <span className="text-sm text-gray-500">Seconds</span>
          </div>
        </div>
      )}
    </div>
  );
};


const Countdown2 = ()=>{
  const baseDate = new Date("2025-06-19T00:00:00Z");
  const months = 2;
  const days = 15;
  const hours = 4;
  const minutes =60;

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <Countdown
        baseDate={baseDate}
        months={months}
        days={days}
        hours={hours}
        minutes={minutes}
      />
    </div>
  );
}

export default Countdown2;
