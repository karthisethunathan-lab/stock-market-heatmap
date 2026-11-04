// Market hours calculation utility for US (NYSE/Nasdaq) and India (NSE/BSE)

export function getUSMarketStatus(date = new Date()) {
  // Convert current UTC time to America/New_York
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const parts = formatter.formatToParts(date);
  const partMap = {};
  parts.forEach((p) => { partMap[p.type] = p.value; });

  const weekday = partMap.weekday; // 'Mon', 'Tue', etc.
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const totalMinutes = hour * 60 + minute;

  const isWeekend = weekday === 'Sat' || weekday === 'Sun';

  let status = 'CLOSED';
  let badgeColor = 'gray';
  let sessionLabel = 'Market Closed';

  if (!isWeekend) {
    if (totalMinutes >= 4 * 60 && totalMinutes < 9 * 60 + 30) {
      status = 'PRE-MARKET';
      badgeColor = 'amber';
      sessionLabel = 'Pre-Market';
    } else if (totalMinutes >= 9 * 60 + 30 && totalMinutes < 16 * 60) {
      status = 'OPEN';
      badgeColor = 'green';
      sessionLabel = 'Market Open';
    } else if (totalMinutes >= 16 * 60 && totalMinutes < 20 * 60) {
      status = 'POST-MARKET';
      badgeColor = 'blue';
      sessionLabel = 'After Hours';
    } else {
      status = 'CLOSED';
      badgeColor = 'gray';
      sessionLabel = 'Market Closed';
    }
  }

  const localTimeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ET`;

  return {
    market: 'US',
    exchange: 'NYSE / NASDAQ',
    status,
    badgeColor,
    sessionLabel,
    localTime: localTimeFormatted,
    timezone: 'America/New_York',
    isOpen: status === 'OPEN',
  };
}

export function getIndiaMarketStatus(date = new Date()) {
  // Convert current UTC time to Asia/Kolkata
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const parts = formatter.formatToParts(date);
  const partMap = {};
  parts.forEach((p) => { partMap[p.type] = p.value; });

  const weekday = partMap.weekday;
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const totalMinutes = hour * 60 + minute;

  const isWeekend = weekday === 'Sat' || weekday === 'Sun';

  let status = 'CLOSED';
  let badgeColor = 'gray';
  let sessionLabel = 'Market Closed';

  if (!isWeekend) {
    if (totalMinutes >= 9 * 60 && totalMinutes < 9 * 60 + 15) {
      status = 'PRE-MARKET';
      badgeColor = 'amber';
      sessionLabel = 'Pre-Open';
    } else if (totalMinutes >= 9 * 60 + 15 && totalMinutes < 15 * 60 + 30) {
      status = 'OPEN';
      badgeColor = 'green';
      sessionLabel = 'Market Open';
    } else if (totalMinutes >= 15 * 60 + 30 && totalMinutes < 16 * 60) {
      status = 'POST-MARKET';
      badgeColor = 'blue';
      sessionLabel = 'Post-Close';
    } else {
      status = 'CLOSED';
      badgeColor = 'gray';
      sessionLabel = 'Market Closed';
    }
  }

  const localTimeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} IST`;

  return {
    market: 'India',
    exchange: 'NSE / BSE',
    status,
    badgeColor,
    sessionLabel,
    localTime: localTimeFormatted,
    timezone: 'Asia/Kolkata',
    isOpen: status === 'OPEN',
  };
}
