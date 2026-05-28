import { useState, useEffect } from "react";

const TIMEZONES = [
  { name: "Bangkok", code: "Asia/Bangkok", offset: "+07:00", emoji: "🇹🇭" },
  { name: "Tokyo", code: "Asia/Tokyo", offset: "+09:00", emoji: "🇯🇵" },
  { name: "Hong Kong", code: "Asia/Hong_Kong", offset: "+08:00", emoji: "🇭🇰" },
  { name: "Singapore", code: "Asia/Singapore", offset: "+08:00", emoji: "🇸🇬" },
  { name: "Dubai", code: "Asia/Dubai", offset: "+04:00", emoji: "🇦🇪" },
  { name: "New York", code: "America/New_York", offset: "-05:00/-04:00", emoji: "🇺🇸" },
  { name: "London", code: "Europe/London", offset: "+00:00/+01:00", emoji: "🇬🇧" },
  { name: "Paris", code: "Europe/Paris", offset: "+01:00/+02:00", emoji: "🇫🇷" },
  { name: "Sydney", code: "Australia/Sydney", offset: "+10:00/+11:00", emoji: "🇦🇺" },
  { name: "Los Angeles", code: "America/Los_Angeles", offset: "-08:00/-07:00", emoji: "🇺🇸" },
];

export default function DigitalClock() {
  const [times, setTimes] = useState({});
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Bangkok");
  const [is24Hour, setIs24Hour] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);

  useEffect(() => {
    const updateTimes = () => {
      const newTimes = {};
      TIMEZONES.forEach(tz => {
        const date = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tz.code,
          hour: is24Hour ? "2-digit" : "numeric",
          minute: "2-digit",
          second: showSeconds ? "2-digit" : undefined,
          hour12: !is24Hour,
        });
        
        const parts = formatter.formatToParts(date);
        const timeObj = {};
        parts.forEach(part => {
          timeObj[part.type] = part.value;
        });

        const hour = timeObj.hour;
        const minute = timeObj.minute;
        const second = timeObj.second || "00";
        const period = timeObj.dayPeriod || "";

        newTimes[tz.code] = {
          time: showSeconds ? `${hour}:${minute}:${second}` : `${hour}:${minute}`,
          period,
          date: date.toLocaleDateString("en-US", { 
            timeZone: tz.code,
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
          })
        };
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, showSeconds ? 1000 : 60000);
    return () => clearInterval(interval);
  }, [is24Hour, showSeconds]);

  const selectedTz = TIMEZONES.find(tz => tz.code === selectedTimezone);
  const selectedTime = times[selectedTimezone];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Courier New', monospace", color: "#e2e8f0", padding: "20px" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1a1a2e; }
        ::-webkit-scrollbar-thumb { background: #3b7eff; border-radius: 3px; }
        
        .container { max-width: 1200px; margin: 0 auto; }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeIn 0.6s ease;
        }
        
        .header h1 {
          font-size: 48px;
          font-weight: 700;
          background: linear-gradient(135deg, #3b7eff, #6c3bff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          letter-spacing: 3px;
        }
        
        .header p {
          font-size: 14px;
          color: #3a5878;
          letter-spacing: 1px;
        }
        
        .main-display {
          background: linear-gradient(135deg, #1e1e36, #2a2a52);
          border: 2px solid #3b7eff;
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 30px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(59, 126, 255, 0.2);
          animation: slideUp 0.6s ease;
        }
        
        .timezone-label {
          font-size: 18px;
          color: #3b7eff;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 600;
        }
        
        .timezone-emoji {
          font-size: 32px;
        }
        
        .digital-time {
          font-size: 96px;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 0 20px rgba(59, 126, 255, 0.5);
          letter-spacing: 5px;
          margin: 20px 0;
          font-variant-numeric: tabular-nums;
        }
        
        .time-period {
          font-size: 24px;
          color: #6c3bff;
          font-weight: 600;
          margin-left: 10px;
          min-width: 60px;
        }
        
        .date-display {
          font-size: 16px;
          color: #3a5878;
          margin-top: 15px;
          letter-spacing: 1px;
        }
        
        .controls {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          animation: slideUp 0.6s ease 0.1s backwards;
        }
        
        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #1e1e36;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #2a3a60;
        }
        
        .control-label {
          font-size: 12px;
          color: #4a6488;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .toggle-btn {
          background: #3b7eff;
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 11px;
          transition: all 0.2s;
        }
        
        .toggle-btn:hover {
          background: #2b6eef;
          transform: translateY(-2px);
        }
        
        .toggle-btn.inactive {
          background: #2a3a60;
          color: #4a6488;
        }
        
        .timezone-selector {
          background: #0c1422;
          border: 1.5px solid #1a2840;
          border-radius: 10px;
          padding: 10px 14px;
          color: #e2e8f0;
          font-size: 13px;
          font-family: 'Courier New', monospace;
          cursor: pointer;
          transition: all 0.2s;
          outline: none;
        }
        
        .timezone-selector:hover {
          border-color: #3b7eff;
        }
        
        .timezone-selector:focus {
          border-color: #3b7eff;
          box-shadow: 0 0 0 3px rgba(59, 126, 255, 0.15);
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 30px;
        }
        
        .clock-card {
          background: linear-gradient(135deg, #1e1e36, #2a2a52);
          border: 1px solid #2a3a60;
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
          animation: slideIn 0.4s ease;
        }
        
        .clock-card:hover {
          border-color: #3b7eff;
          box-shadow: 0 8px 24px rgba(59, 126, 255, 0.2);
          transform: translateY(-5px);
        }
        
        .clock-card.active {
          border-color: #3b7eff;
          background: linear-gradient(135deg, #2a2a52, #3a3a62);
          box-shadow: 0 0 20px rgba(59, 126, 255, 0.3);
        }
        
        .card-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .card-emoji {
          font-size: 28px;
        }
        
        .card-name {
          font-size: 13px;
          color: #3b7eff;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .card-time {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 2px;
          margin: 10px 0;
          font-variant-numeric: tabular-nums;
        }
        
        .card-date {
          font-size: 11px;
          color: #3a5878;
          letter-spacing: 0.5px;
        }
        
        .info-section {
          background: #1e1e36;
          border: 1px solid #2a3a60;
          border-radius: 15px;
          padding: 20px;
          margin-top: 30px;
          animation: slideUp 0.6s ease 0.2s backwards;
        }
        
        .info-title {
          font-size: 13px;
          color: #3b7eff;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .offset-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }
        
        .offset-item {
          background: #0c1422;
          border: 1px solid #1a2840;
          border-radius: 8px;
          padding: 12px;
          font-size: 12px;
          color: #3a5878;
        }
        
        .offset-city {
          color: #e2e8f0;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .offset-time {
          color: #3b7eff;
          font-weight: 700;
          font-size: 13px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>🌍 WORLD CLOCK</h1>
          <p>REAL-TIME TIMEZONE DISPLAY</p>
        </div>

        {/* Main Display */}
        <div className="main-display">
          <div className="timezone-label">
            <span className="timezone-emoji">{selectedTz?.emoji}</span>
            <span>{selectedTz?.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="digital-time">{selectedTime?.time}</div>
            {!is24Hour && <div className="time-period">{selectedTime?.period}</div>}
          </div>
          <div className="date-display">{selectedTime?.date}</div>
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="control-group">
            <label className="control-label">Format:</label>
            <button
              className={`toggle-btn ${is24Hour ? "" : "inactive"}`}
              onClick={() => setIs24Hour(!is24Hour)}
            >
              {is24Hour ? "24H" : "12H"}
            </button>
          </div>
          <div className="control-group">
            <label className="control-label">Seconds:</label>
            <button
              className={`toggle-btn ${showSeconds ? "" : "inactive"}`}
              onClick={() => setShowSeconds(!showSeconds)}
            >
              {showSeconds ? "ON" : "OFF"}
            </button>
          </div>
          <div className="control-group">
            <label className="control-label">Select Timezone:</label>
            <select
              className="timezone-selector"
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
            >
              {TIMEZONES.map(tz => (
                <option key={tz.code} value={tz.code}>
                  {tz.emoji} {tz.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clock Grid */}
        <div>
          <div style={{ fontSize: "14px", color: "#3b7eff", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px" }}>
            📊 All Timezones
          </div>
          <div className="grid">
            {TIMEZONES.map(tz => (
              <div
                key={tz.code}
                className={`clock-card ${selectedTimezone === tz.code ? "active" : ""}`}
                onClick={() => setSelectedTimezone(tz.code)}
              >
                <div className="card-header">
                  <span className="card-emoji">{tz.emoji}</span>
                  <span className="card-name">{tz.name}</span>
                </div>
                <div className="card-time">{times[tz.code]?.time || "--:--"}</div>
                <div className="card-date">{times[tz.code]?.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-title">ℹ️ Timezone Information</div>
          <div className="offset-list">
            {TIMEZONES.map(tz => (
              <div key={tz.code} className="offset-item">
                <div className="offset-city">{tz.emoji} {tz.name}</div>
                <div className="offset-time">{tz.offset}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
