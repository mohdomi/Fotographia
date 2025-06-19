import Countdown from "./components/CountDown";

function App() {
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

export default App;
