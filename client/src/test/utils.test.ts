import { describe, it, expect } from 'vitest';
import {
  calculateCAGR,
  calculateXIRR,
  formatCompactNumber,
  formatCurrency,
  formatPercent,
  parseHoldingsFromCSV,
} from '../lib/utils';

describe('Financial Utility Functions', () => {
  it('calculates CAGR accurately', () => {
    // 100 to 200 over 3 years: (200/100)^(1/3) - 1 ≈ 25.99%
    const cagr = calculateCAGR(100, 200, 3);
    expect(cagr).toBeCloseTo(25.99, 1);
  });

  it('calculates XIRR for standard cash flow streams', () => {
    const cashFlows = [
      { amount: -1000, date: new Date('2023-01-01') },
      { amount: 1200, date: new Date('2024-01-01') },
    ];
    const xirr = calculateXIRR(cashFlows);
    expect(xirr).toBeCloseTo(20.0, 1);
  });

  it('formats currency correctly for USD and INR', () => {
    expect(formatCurrency(182.5, 'USD')).toBe('$182.50');
    expect(formatCurrency(2450.75, 'INR')).toBe('₹2,450.75');
  });

  it('formats compact numbers for both USD and INR (Crore / Lakh)', () => {
    expect(formatCompactNumber(1500000000, 'USD')).toBe('$1.50B');
    expect(formatCompactNumber(2500000, 'USD')).toBe('$2.50M');

    // Indian Lakh / Crore grouping
    expect(formatCompactNumber(25000000, 'INR')).toBe('₹2.50 Cr');
    expect(formatCompactNumber(500000, 'INR')).toBe('₹5.00 L');

    // Missing or zero handling
    expect(formatCompactNumber(null)).toBe('--');
    expect(formatCompactNumber(undefined)).toBe('--');
    expect(formatCompactNumber(0)).toBe('0');
  });

  it('formats percentage moves with + or - signs', () => {
    expect(formatPercent(4.25)).toBe('+4.25%');
    expect(formatPercent(-2.15)).toBe('-2.15%');
  });

  it('parses standard holdings CSV', () => {
    const csv = 'Symbol,Name,Sector,Quantity,BuyPrice,BuyDate,Currency\nAAPL,Apple,Technology,10,180,2024-01-01,USD';
    const holdings = parseHoldingsFromCSV(csv);
    expect(holdings).toHaveLength(1);
    expect(holdings[0].symbol).toBe('AAPL');
    expect(holdings[0].quantity).toBe(10);
    expect(holdings[0].buyPrice).toBe(180);
  });

  it('detects and parses Zerodha broker CSV format', () => {
    const zerodhaCsv = 'Instrument,Qty,Avg. cost,LTP,Cur. val,P&L,Net chg.\nINFY,25,1450.50,1520.00,38000,1737.50,4.79';
    const holdings = parseHoldingsFromCSV(zerodhaCsv);
    expect(holdings).toHaveLength(1);
    expect(holdings[0].symbol).toBe('INFY.NS');
    expect(holdings[0].quantity).toBe(25);
    expect(holdings[0].buyPrice).toBe(1450.5);
    expect(holdings[0].currency).toBe('INR');
  });

  it('detects and parses Groww broker CSV format', () => {
    const growwCsv = 'Stock Name,Symbol,Shares,Average Price\nReliance Industries,RELIANCE,15,2450.00';
    const holdings = parseHoldingsFromCSV(growwCsv);
    expect(holdings).toHaveLength(1);
    expect(holdings[0].symbol).toBe('RELIANCE.NS');
    expect(holdings[0].quantity).toBe(15);
    expect(holdings[0].buyPrice).toBe(2450);
  });
});
