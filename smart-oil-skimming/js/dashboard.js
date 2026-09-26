/* ==========================================================================
   DASHBOARD.JS
   Drives the Live Monitoring dashboard using SIMULATED sensor data from
   data/sensor-data.js. Replace SensorData.fetchLatestReading() with a real
   API call to switch to live ESP32 hardware — no other change required.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const els = {
    oilLevel: document.getElementById('stat-oil-level'),
    motorSpeed: document.getElementById('stat-motor-speed'),
    beltStatus: document.getElementById('stat-belt-status'),
    cleaningStatus: document.getElementById('stat-cleaning-status'),
    systemStatus: document.getElementById('stat-system-status'),
    alertStatus: document.getElementById('stat-alert-status'),
    lastUpdated: document.getElementById('last-updated'),
    alertFeed: document.getElementById('alert-feed'),
    alertFeedMini: document.getElementById('alert-feed-mini'),
    oilCollectedToday: document.getElementById('oil-collected-today'),
    liveOilLevel: document.getElementById('live-oil-level'),
    liveMotorSpeed: document.getElementById('live-motor-speed'),
  };

  // ---- Tab navigation ----
  const tabButtons = document.querySelectorAll('.dash-tab');
  const tabPanels = document.querySelectorAll('.dash-panel');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });

  // ---- Charts ----
  const oilLevelChart = makeLineChart(document.getElementById('chart-oil-level'), {
    label: 'Oil Level %', color: ChartTheme.amber, suggestedMax: 100,
  });
  const motorSpeedChart = makeLineChart(document.getElementById('chart-motor-speed'), {
    label: 'Motor Speed RPM', color: ChartTheme.cyan, suggestedMax: 200,
  });
  const collectionChart = makeBarChart(document.getElementById('chart-collection'), {
    label: 'Oil Collected (L)', color: ChartTheme.green,
  });
  const historyChart = makeLineChart(document.getElementById('chart-history'), {
    label: 'Oil Level History %', color: ChartTheme.amber, suggestedMax: 100,
  });
  const liveMirrorEl = document.getElementById('chart-live-mirror');
  const liveMirrorChart = liveMirrorEl ? makeLineChart(liveMirrorEl, {
    label: 'Oil Level %', color: ChartTheme.cyan, suggestedMax: 100,
  }) : null;

  // Seed charts with a short simulated history so they don't start empty
  const seedHistory = SensorData.generateHistory(12);
  seedHistory.forEach((reading, i) => {
    const t = new Date(Date.now() - (seedHistory.length - i) * 4000);
    const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    pushPoint(oilLevelChart, label, reading.oilLevel);
    pushPoint(motorSpeedChart, label, reading.motorSpeed);
    pushPoint(historyChart, label, reading.oilLevel);
  });

  // Collection chart: last 7 demo days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  days.forEach((d) => {
    pushPoint(collectionChart, d, +(2 + Math.random() * 4).toFixed(1), 7);
  });

  function setStatusPill(el, text, tone) {
    if (!el) return;
    el.textContent = text;
    el.className = 'stat-value pill ' + tone;
  }

  function renderAlertInto(container, alert, max) {
    if (!container) return;
    const item = document.createElement('div');
    item.className = `alert-item ${alert.level}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    item.innerHTML = `<span class="dot"></span><div><p>${alert.message}</p><span class="time mono">${time}</span></div>`;
    container.prepend(item);
    while (container.children.length > max) {
      container.removeChild(container.lastChild);
    }
  }

  function renderAlert(alert) {
    renderAlertInto(els.alertFeed, alert, 8);
    renderAlertInto(els.alertFeedMini, alert, 4);
  }

  async function tick() {
    const reading = await SensorData.fetchLatestReading();
    const label = new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (els.oilLevel) els.oilLevel.textContent = `${reading.oilLevel}%`;
    if (els.motorSpeed) els.motorSpeed.textContent = `${reading.motorSpeed} RPM`;
    if (els.oilCollectedToday) els.oilCollectedToday.textContent = `${reading.oilCollectedToday} L`;
    if (els.liveOilLevel) els.liveOilLevel.textContent = `${reading.oilLevel}%`;
    if (els.liveMotorSpeed) els.liveMotorSpeed.textContent = `${reading.motorSpeed} RPM`;
    setStatusPill(els.beltStatus, reading.beltStatus, 'good');
    setStatusPill(els.cleaningStatus, reading.cleaningStatus, 'good');
    setStatusPill(els.systemStatus, reading.systemStatus, 'good');

    const toneMap = { normal: 'good', warning: 'warn', critical: 'bad' };
    setStatusPill(els.alertStatus, reading.alertLevel.toUpperCase(), toneMap[reading.alertLevel]);

    if (els.lastUpdated) {
      els.lastUpdated.textContent = `Last updated ${new Date(reading.timestamp).toLocaleTimeString()} · SIMULATED DATA`;
    }

    pushPoint(oilLevelChart, label, reading.oilLevel);
    pushPoint(motorSpeedChart, label, reading.motorSpeed);
    pushPoint(historyChart, label, reading.oilLevel);
    if (liveMirrorChart) pushPoint(liveMirrorChart, label, reading.oilLevel);

    // Occasionally surface a demo alert
    if (Math.random() < 0.18 || reading.alertLevel !== 'normal') {
      renderAlert(reading.alertLevel !== 'normal'
        ? { level: reading.alertLevel, message: reading.alertLevel === 'critical'
            ? 'Oil level critical — container may be near capacity.'
            : 'Oil level high — monitor container fill.' }
        : SensorData.getRandomAlert());
    }
  }

  tick();
  setInterval(tick, 3500);
});
