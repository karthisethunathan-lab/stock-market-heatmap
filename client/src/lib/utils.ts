import { ColorMode, PortfolioHolding } from '../types';

export function formatCurrency(amount?: number | null, currency: string = 'USD', compact = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) return currency === 'INR' ? '₹0.00' : '$0.00';

  if (compact) {
    return formatCompactNumber(amount, currency);
  }

  const isINR = currency === 'INR';
  return new Intl.NumberFormat(isINR ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: isINR ? 'INR' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactNumber(num?: number | null, currency?: string): string {
  if (num === undefined || num === null || isNaN(num) || num === 0) return '0';
  const isINR = currency === 'INR';

  if (isINR) {
    if (Math.abs(num) >= 1e7) return `₹${(num / 1e7).toFixed(2)} Cr`;
    if (Math.abs(num) >= 1e5) return `₹${(num / 1e5).toFixed(2)} L`;
    if (Math.abs(num) >= 1e3) return `₹${(num / 1e3).toFixed(1)} K`;
    return `₹${num.toFixed(0)}`;
  }

  const prefix = currency === 'USD' ? '$' : '';
  if (Math.abs(num) >= 1e12) return `${prefix}${(num / 1e12).toFixed(2)}T`;
  if (Math.abs(num) >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M`;
  if (Math.abs(num) >= 1e3) return `${prefix}${(num / 1e3).toFixed(1)}K`;
  return `${prefix}${num.toFixed(2)}`;
}

export function formatPercent(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00%';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

/**
 * Calculate Compound Annual Growth Rate
 */
export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (!startValue || startValue <= 0 || !endValue || endValue <= 0 || !years || years <= 0) return 0;
  return Number(((Math.pow(endValue / startValue, 1 / years) - 1) * 100).toFixed(2));
}

/**
 * Calculate XIRR (Extended Internal Rate of Return) via Newton-Raphson
 */
export function calculateXIRR(cashFlows: Array<{ amount: number; date: Date }>): number {
  if (!cashFlows || cashFlows.length < 2) return 0;

  const hasNegative = cashFlows.some((cf) => cf.amount < 0);
  const hasPositive = cashFlows.some((cf) => cf.amount > 0);
  if (!hasNegative || !hasPositive) return 0;

  const d0 = cashFlows[0].date.getTime();
  const dayFractions = cashFlows.map((cf) => (cf.date.getTime() - d0) / (365 * 86400000));

  let rate = 0.1; // initial guess 10%
  const maxIterations = 50;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    let fValue = 0;
    let fDerivative = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      const dt = dayFractions[j];
      const factor = Math.pow(1 + rate, dt);
      if (factor === 0) continue;
      fValue += cashFlows[j].amount / factor;
      fDerivative -= (dt * cashFlows[j].amount) / (factor * (1 + rate));
    }

    if (Math.abs(fDerivative) < 1e-10) break;
    const newRate = rate - fValue / fDerivative;
    if (Math.abs(newRate - rate) < tolerance) {
      return Number((newRate * 100).toFixed(2));
    }
    rate = newRate;
  }

  return Number((rate * 100).toFixed(2));
}

/**
 * High-contrast terminal color scale for stock treemaps
 */
export function getTreemapColor(changePercent: number, mode: ColorMode = 'standard'): string {
  const p = Number(changePercent) || 0;

  if (mode === 'colorblind') {
    if (p >= 5.0) return '#1d4ed8'; // deep blue
    if (p >= 3.0) return '#2563eb';
    if (p >= 1.5) return '#3b82f6';
    if (p >= 0.2) return '#60a5fa';
    if (p <= -5.0) return '#c2410c'; // deep orange
    if (p <= -3.0) return '#ea580c';
    if (p <= -1.5) return '#f97316';
    if (p <= -0.2) return '#fb923c';
    return '#1e293b'; // dark neutral
  }

  if (p >= 5.0) return '#047857'; // deep emerald green
  if (p >= 3.0) return '#059669';
  if (p >= 1.5) return '#10b981';
  if (p >= 0.2) return '#34d399';
  if (p <= -5.0) return '#991b1b'; // deep crimson red
  if (p <= -3.0) return '#dc2626';
  if (p <= -1.5) return '#ef4444';
  if (p <= -0.2) return '#f87171';
  return '#1e293b'; // neutral dark slate
}

export function getTreemapTextColor(changePercent: number): string {
  const p = Math.abs(Number(changePercent) || 0);
  if (p > 1.5) return '#ffffff';
  return '#f1f5f9';
}

/**
 * Export portfolio holdings to CSV format
 */
export function exportHoldingsToCSV(holdings: PortfolioHolding[], portfolioName: string): void {
  const headers = ['Symbol', 'Name', 'Sector', 'Quantity', 'BuyPrice', 'BuyDate', 'Currency'];
  const rows = holdings.map((h) => [
    `"${h.symbol}"`,
    `"${h.name.replace(/"/g, '""')}"`,
    `"${h.sector}"`,
    h.quantity,
    h.buyPrice,
    `"${h.buyDate}"`,
    `"${h.currency}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${portfolioName.toLowerCase().replace(/\s+/g, '_')}_holdings.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parse imported CSV into PortfolioHolding objects (standard, Zerodha, Groww)
 */
export function parseHoldingsFromCSV(csvText: string): PortfolioHolding[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const rawHeader = lines[0].toLowerCase();
  const isZerodha = rawHeader.includes('instrument') && rawHeader.includes('qty');
  const isGroww = rawHeader.includes('stock name') && (rawHeader.includes('shares') || rawHeader.includes('quantity'));

  const holdings: PortfolioHolding[] = [];

  if (isZerodha) {
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const instIdx = headers.findIndex((h) => h.includes('instrument'));
    const qtyIdx = headers.findIndex((h) => h === 'qty' || h.includes('quantity'));
    const avgCostIdx = headers.findIndex((h) => h.includes('avg. cost') || h.includes('avg cost'));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      let symbol = parts[instIdx] || '';
      if (!symbol) continue;
      if (!symbol.endsWith('.NS')) symbol = `${symbol}.NS`;

      holdings.push({
        id: `zerodha-${Date.now()}-${i}`,
        symbol,
        name: symbol.replace('.NS', ''),
        sector: 'Indian Equities',
        quantity: Number(parts[qtyIdx]) || 1,
        buyPrice: Number(parts[avgCostIdx]) || 100,
        buyDate: new Date().toISOString().slice(0, 10),
        currency: 'INR',
      });
    }
    return holdings;
  }

  if (isGroww) {
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const nameIdx = headers.findIndex((h) => h.includes('stock name'));
    const symbolIdx = headers.findIndex((h) => h.includes('symbol'));
    const qtyIdx = headers.findIndex((h) => h.includes('shares') || h.includes('quantity'));
    const priceIdx = headers.findIndex((h) => h.includes('average price') || h.includes('buy price'));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      let symbol = (symbolIdx !== -1 ? parts[symbolIdx] : parts[nameIdx]) || '';
      if (!symbol) continue;
      if (!symbol.endsWith('.NS')) symbol = `${symbol}.NS`;

      holdings.push({
        id: `groww-${Date.now()}-${i}`,
        symbol,
        name: parts[nameIdx] || symbol.replace('.NS', ''),
        sector: 'Indian Equities',
        quantity: Number(parts[qtyIdx]) || 1,
        buyPrice: Number(parts[priceIdx]) || 100,
        buyDate: new Date().toISOString().slice(0, 10),
        currency: 'INR',
      });
    }
    return holdings;
  }

  // Standard CSV parse
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const symbolIdx = headers.findIndex((h) => h.includes('symbol'));
  const nameIdx = headers.findIndex((h) => h.includes('name'));
  const sectorIdx = headers.findIndex((h) => h.includes('sector'));
  const qtyIdx = headers.findIndex((h) => h.includes('quantity') || h.includes('qty'));
  const priceIdx = headers.findIndex((h) => h.includes('price') || h.includes('cost'));
  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const currIdx = headers.findIndex((h) => h.includes('curr'));

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    const cleanVals = values.map((v) => v.trim().replace(/^"|"$/g, ''));

    const symbol = symbolIdx !== -1 ? cleanVals[symbolIdx] : cleanVals[0];
    if (!symbol) continue;

    holdings.push({
      id: `imported-${Date.now()}-${i}`,
      symbol: symbol.toUpperCase(),
      name: nameIdx !== -1 ? cleanVals[nameIdx] : symbol,
      sector: sectorIdx !== -1 ? cleanVals[sectorIdx] : 'Other',
      quantity: Number(cleanVals[qtyIdx !== -1 ? qtyIdx : 3]) || 1,
      buyPrice: Number(cleanVals[priceIdx !== -1 ? priceIdx : 4]) || 100,
      buyDate: dateIdx !== -1 ? cleanVals[dateIdx] : new Date().toISOString().slice(0, 10),
      currency: currIdx !== -1 ? cleanVals[currIdx] : symbol.endsWith('.NS') ? 'INR' : 'USD',
    });
  }

  return holdings;
}
