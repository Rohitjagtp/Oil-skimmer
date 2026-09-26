/* ==========================================================================
   CHARTS.JS — Chart.js configuration helpers
   ========================================================================== */

const ChartTheme = {
  cyan: '#17d9e8',
  amber: '#ff9f2e',
  green: '#35c98d',
  grid: 'rgba(169,188,208,0.12)',
  text: '#a9bcd0',
};

Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = ChartTheme.text;

function makeLineChart(ctx, { label, color, suggestedMax, suggestedMin = 0 }) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label,
          data: [],
          borderColor: color,
          backgroundColor: `${color}22`,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: ChartTheme.grid }, ticks: { maxTicksLimit: 6 } },
        y: {
          grid: { color: ChartTheme.grid },
          suggestedMin,
          suggestedMax,
        },
      },
    },
  });
}

function makeBarChart(ctx, { label, color }) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label,
          data: [],
          backgroundColor: color,
          borderRadius: 4,
          maxBarThickness: 28,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: ChartTheme.grid } },
      },
    },
  });
}

function pushPoint(chart, label, value, maxPoints = 20) {
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(value);
  if (chart.data.labels.length > maxPoints) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update('none');
}
