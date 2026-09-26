/* ==========================================================================
   SENSOR-DATA.JS
   ----------------------------------------------------------------------
   THIS FILE PRODUCES SIMULATED / DEMO DATA ONLY.
   No physical ESP32 hardware is connected to this website.

   HOW TO CONNECT REAL HARDWARE LATER:
   Replace the body of `fetchLatestReading()` with a real network call,
   e.g.:
       const res = await fetch('http://<esp32-ip>/api/reading');
       return await res.json();
   As long as the returned object keeps the same shape as
   `generateSimulatedReading()` below, every chart and dashboard widget
   on this site will keep working without any other code changes.
   ========================================================================== */

const SensorData = (() => {
  // Internal state the simulator walks forward each tick, so values
  // drift smoothly instead of jumping randomly.
  let state = {
    oilLevel: 68,      // %
    motorSpeed: 120,    // RPM
    beltRunning: true,
    cleaningActive: true,
    systemOnline: true,
    oilCollectedToday: 4.2, // litres, demo figure
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randomStep(range) {
    return (Math.random() - 0.5) * range;
  }

  /**
   * Generates one simulated reading. This is a stand-in for a real
   * ESP32 payload — the field names are the intended API contract.
   */
  function generateSimulatedReading() {
    state.oilLevel = clamp(state.oilLevel + randomStep(6), 12, 96);

    // Motor speed responds to oil level (higher oil -> faster skimming),
    // matching the "adaptive belt speed" behaviour described in the project.
    const targetSpeed = 80 + (state.oilLevel / 100) * 90;
    state.motorSpeed = clamp(state.motorSpeed + (targetSpeed - state.motorSpeed) * 0.35 + randomStep(4), 60, 190);

    state.oilCollectedToday = clamp(state.oilCollectedToday + Math.random() * 0.05, 0, 20);

    let alertLevel = 'normal';
    if (state.oilLevel > 85) alertLevel = 'warning';
    if (state.oilLevel > 93) alertLevel = 'critical';

    return {
      timestamp: new Date().toISOString(),
      oilLevel: Math.round(state.oilLevel * 10) / 10,
      motorSpeed: Math.round(state.motorSpeed),
      beltStatus: state.beltRunning ? 'RUNNING' : 'STOPPED',
      cleaningStatus: state.cleaningActive ? 'ACTIVE' : 'IDLE',
      systemStatus: state.systemOnline ? 'ONLINE' : 'OFFLINE',
      alertLevel,
      oilCollectedToday: Math.round(state.oilCollectedToday * 100) / 100,
      simulated: true,
    };
  }

  /**
   * Public entry point used by dashboard.js. Kept async so it can be
   * swapped for a real `fetch()` call to an ESP32 / backend API without
   * changing any calling code.
   */
  async function fetchLatestReading() {
    // Simulated network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 60));
    return generateSimulatedReading();
  }

  /**
   * Produces a short history array for initial chart population.
   */
  function generateHistory(points = 20) {
    const history = [];
    for (let i = 0; i < points; i++) {
      history.push(generateSimulatedReading());
    }
    return history;
  }

  const ALERT_LIBRARY = [
    { level: 'warning', message: 'Oil level high — approaching container capacity.' },
    { level: 'warning', message: 'Oil collection container nearing full.' },
    { level: 'warning', message: 'Motor temperature slightly elevated.' },
    { level: 'critical', message: 'Sensor communication interrupted — check wiring.' },
    { level: 'normal', message: 'Belt cleaning cycle completed successfully.' },
    { level: 'normal', message: 'System self-check passed.' },
  ];

  function getRandomAlert() {
    return ALERT_LIBRARY[Math.floor(Math.random() * ALERT_LIBRARY.length)];
  }

  return { fetchLatestReading, generateHistory, getRandomAlert };
})();
