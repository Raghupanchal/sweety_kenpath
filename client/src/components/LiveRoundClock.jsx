import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, Clock as ClockIcon, X, Calendar, Sparkles } from 'lucide-react';
import { SLOTS } from '../utils/glucoseHelpers';

/**
 * Returns the current clinical glucose slot based on the time of day
 */
function getCurrentSlotHint(hours) {
  if (hours >= 5 && hours < 9) return { label: 'Morning (fasting)', window: 'Fasting Window' };
  if (hours >= 9 && hours < 13) return { label: 'After breakfast', window: 'Post-Breakfast' };
  if (hours >= 13 && hours < 18) return { label: 'After lunch', window: 'Post-Lunch' };
  return { label: 'After dinner', window: 'Post-Dinner' };
}

/**
 * Format date to HH:mm for HTML time input
 */
function formatTimeInput(d) {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function LiveRoundClock({ onTriggerReminder }) {
  const [now, setNow] = useState(new Date());
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState(() => {
    try {
      const saved = localStorage.getItem('sweety_glucose_alert');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [alertTriggered, setAlertTriggered] = useState(false);

  // Custom Time Setup States
  const [customTime, setCustomTime] = useState(() => {
    const twoHoursLater = new Date(Date.now() + 120 * 60 * 1000);
    return formatTimeInput(twoHoursLater);
  });
  const [selectedSlot, setSelectedSlot] = useState(() => getCurrentSlotHint(new Date().getHours()).label);

  // Ticking real-time clock loop
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);

      // Check alert trigger
      if (activeAlert && !alertTriggered) {
        const targetTime = new Date(activeAlert.targetTimestamp);
        if (currentTime >= targetTime) {
          setAlertTriggered(true);
          if (onTriggerReminder) {
            onTriggerReminder(activeAlert);
          }
          // Browser native notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('⏰ Sweety Glucose Reminder', {
                body: `It's time to record your ${activeAlert.slot} glucose reading!`,
                icon: '/sweety-logo.png',
              });
            } catch (e) {
              console.warn('Notification error:', e);
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAlert, alertTriggered, onTriggerReminder]);

  // Request browser notification permission once
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.warn('Notification permission request error:', e);
      }
    }
  };

  const handleOpenModal = () => {
    const currentHour = new Date().getHours();
    setSelectedSlot(getCurrentSlotHint(currentHour).label);
    const twoHoursLater = new Date(Date.now() + 120 * 60 * 1000);
    setCustomTime(formatTimeInput(twoHoursLater));
    setAlertModalOpen(true);
  };

  // Quick preset offset helper
  const handleQuickPreset = (mins) => {
    const target = new Date(Date.now() + mins * 60 * 1000);
    setCustomTime(formatTimeInput(target));
  };

  const calculateTargetTimestamp = () => {
    if (!customTime) return null;
    const [hStr, mStr] = customTime.split(':');
    const target = new Date();
    target.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);

    // If target time is earlier today than current time, schedule for tomorrow
    if (target.getTime() <= Date.now()) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  };

  const handleSaveCustomAlert = () => {
    requestNotificationPermission();
    const target = calculateTargetTimestamp();
    if (!target) return;

    const alertData = {
      slot: selectedSlot,
      targetTimestamp: target.toISOString(),
      targetTimeString: target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveAlert(alertData);
    setAlertTriggered(false);
    localStorage.setItem('sweety_glucose_alert', JSON.stringify(alertData));
    setAlertModalOpen(false);
  };

  const handleClearAlert = () => {
    setActiveAlert(null);
    setAlertTriggered(false);
    localStorage.removeItem('sweety_glucose_alert');
  };

  // Clock Hand Calculations
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secondDeg = seconds * 6; // 360 / 60
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  const slotInfo = getCurrentSlotHint(hours);
  const timeFormatted = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateFormatted = now.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  // Hours ticks coordinates for dial (radius 40)
  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const isMajor = i % 3 === 0;
    return {
      index: i,
      x: 50 + 40 * Math.sin(angle),
      y: 50 - 40 * Math.cos(angle),
      isMajor,
    };
  });

  const targetDateObj = calculateTargetTimestamp();
  const minutesUntilAlert = targetDateObj
    ? Math.max(0, Math.round((targetDateObj.getTime() - Date.now()) / 60000))
    : 0;

  return (
    <div className="flex flex-col items-center justify-center my-3 lg:my-0 px-2 sm:px-4">
      {/* Round Analog Clock Face */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
        {/* Outer concentric decorative ripple */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#DDD8FB] animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#F8F7FF] via-white to-[#F0EEFD] border border-[#DDD8FB] shadow-soft"></div>

        {/* SVG Round Dial */}
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 relative z-10">
          {/* Dial hour dots */}
          {hourMarkers.map((m) => (
            <circle
              key={m.index}
              cx={m.x}
              cy={m.y}
              r={m.isMajor ? 2.5 : 1.2}
              fill={m.isMajor ? '#6C5DD3' : '#05193C'}
              opacity={m.isMajor ? 0.9 : 0.3}
            />
          ))}

          {/* Hour Hand */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="28"
            stroke="#05193C"
            strokeWidth="3.2"
            strokeLinecap="round"
            transform={`rotate(${hourDeg} 50 50)`}
          />

          {/* Minute Hand */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="18"
            stroke="#05193C"
            strokeOpacity="0.75"
            strokeWidth="2.2"
            strokeLinecap="round"
            transform={`rotate(${minuteDeg} 50 50)`}
          />

          {/* Second Hand (Soft Royal Periwinkle) */}
          <line
            x1="50"
            y1="56"
            x2="50"
            y2="14"
            stroke="#6C5DD3"
            strokeWidth="1.4"
            strokeLinecap="round"
            transform={`rotate(${secondDeg} 50 50)`}
          />

          {/* Center Pivot Pin */}
          <circle cx="50" cy="50" r="3.2" fill="#6C5DD3" />
          <circle cx="50" cy="50" r="1.2" fill="#FFFFFF" />
        </svg>

        {/* Live Pulse Dot */}
        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6C5DD3] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6C5DD3]"></span>
        </span>
      </div>

      {/* Realtime Digital Time & Date Badges */}
      <div className="mt-2 text-center">
        <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-[#05193C] text-white font-mono text-xs font-extrabold tracking-wider shadow-sm">
          <ClockIcon className="w-3 h-3 text-[#B8ACF6]" />
          <span>{timeFormatted}</span>
        </div>

        <div className="flex items-center justify-center space-x-1.5 text-[11px] font-semibold text-[#05193C]/60 mt-1">
          <span>{dateFormatted}</span>
          <span>•</span>
          <span className="text-[#6C5DD3] font-bold">{slotInfo.window}</span>
        </div>

        {/* Set Reminder Button / Active Alert Pill */}
        <div className="mt-2">
          {activeAlert ? (
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-[#F0EEFD] border border-[#DDD8FB] text-[#6C5DD3] text-[11px] font-extrabold shadow-sm">
              <BellRing className={`w-3.5 h-3.5 ${alertTriggered ? 'animate-bounce text-[#6C5DD3]' : 'text-[#6C5DD3]'}`} />
              <span>
                {alertTriggered ? `Reminder Due: ${activeAlert.slot}!` : `Alert at ${activeAlert.targetTimeString}`}
              </span>
              <button
                onClick={handleClearAlert}
                className="ml-1 p-0.5 hover:bg-[#DDD8FB] rounded-full text-[#6C5DD3] transition-colors"
                title="Cancel Alert"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-[#F0EEFD] hover:bg-[#E4E0FD] border border-[#DDD8FB] text-[#6C5DD3] text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="Set glucose check alert"
            >
              <Bell className="w-3.5 h-3.5 text-[#6C5DD3]" />
              <span>Set Alert</span>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Custom Alert Setup Modal */}
      {alertModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#05193C]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full border border-[#EDE9FE] shadow-soft-lg animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#EDE9FE]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#F0EEFD] text-[#6C5DD3] flex items-center justify-center border border-[#DDD8FB]">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#05193C]">Set Glucose Alert</h3>
                  <p className="text-[10px] text-[#05193C]/50">Choose any time or quick interval</p>
                </div>
              </div>
              <button
                onClick={() => setAlertModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-[#05193C] hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* 1. Custom Exact Time Picker */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#05193C]/70 mb-1.5 flex items-center justify-between">
                  <span>Exact Alert Time</span>
                  <span className="text-[10px] font-semibold text-[#6C5DD3]">Set anytime</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-[#F8F7FF] border border-[#DDD8FB] rounded-2xl text-base font-extrabold text-[#05193C] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] transition-all"
                  />
                </div>
              </div>

              {/* 2. Quick One-Click Add Presets */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#05193C]/70 mb-1.5">
                  Or Quick Preset Interval:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '+15m', mins: 15 },
                    { label: '+30m', mins: 30 },
                    { label: '+1h', mins: 60 },
                    { label: '+2h', mins: 120 },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.mins}
                      onClick={() => handleQuickPreset(preset.mins)}
                      className="py-1.5 px-2 rounded-xl border border-[#DDD8FB] bg-[#F8F7FF] hover:bg-[#F0EEFD] text-[#05193C] text-xs font-extrabold text-center transition-all active:scale-95"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Measurement Slot Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#05193C]/70 mb-1.5">
                  Target Glucose Slot:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SLOTS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSelectedSlot(s)}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-extrabold text-center border transition-all truncate ${
                        selectedSlot === s
                          ? 'bg-[#6C5DD3] text-white border-[#6C5DD3] shadow-sm'
                          : 'bg-[#F8F7FF] text-[#05193C] border-[#DDD8FB] hover:bg-[#F0EEFD]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Live Summary Card */}
              <div className="p-3 bg-[#F8F7FF] border border-[#DDD8FB] rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between text-[#05193C]/70">
                  <span>Scheduled For:</span>
                  <strong className="text-sm font-extrabold text-[#05193C]">
                    {targetDateObj
                      ? targetDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '--'}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#05193C]/60">
                  <span>Slot Window:</span>
                  <span className="font-bold text-[#6C5DD3]">{selectedSlot}</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold pt-0.5">
                  ⏰ Triggers in {minutesUntilAlert} minutes
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-2 pt-2 border-t border-[#EDE9FE]">
              {/* Light Button: Cancel */}
              <button
                type="button"
                onClick={() => setAlertModalOpen(false)}
                className="w-1/2 py-2.5 rounded-2xl border border-[#DDD8FB] bg-[#F0EEFD] text-[#6C5DD3] text-xs font-extrabold hover:bg-[#E4E0FD] transition-all"
              >
                Cancel
              </button>
              {/* Primary Button: Save Alert */}
              <button
                type="button"
                onClick={handleSaveCustomAlert}
                className="w-1/2 py-2.5 rounded-2xl bg-[#6C5DD3] text-white text-xs font-extrabold hover:bg-[#5B4DC7] shadow-sm flex items-center justify-center space-x-1.5 transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Save Alert</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
