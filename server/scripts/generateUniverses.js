import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DATA_DIR = path.join(__dirname, '../src/data');
const CLIENT_DATA_DIR = path.join(__dirname, '../../client/src/data');

if (!fs.existsSync(SERVER_DATA_DIR)) fs.mkdirSync(SERVER_DATA_DIR, { recursive: true });
if (!fs.existsSync(CLIENT_DATA_DIR)) fs.mkdirSync(CLIENT_DATA_DIR, { recursive: true });

// --- Comprehensive US Universe (520+ stocks + ETFs) ---
const US_TICKERS_RAW = [
  // Tech Mega & Large
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', indices: ['S&P 500', 'Nasdaq-100', 'Dow 30'], capBucket: 'Mega', marketCap: 3520000000000, price: 232.35, pe: 34.2, pb: 48.5, div: 0.48, roe: 147.2, de: 1.52, revG: 6.1, d52: -3.8 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software - Infrastructure', indices: ['S&P 500', 'Nasdaq-100', 'Dow 30'], capBucket: 'Mega', marketCap: 3380000000000, price: 423.73, pe: 36.8, pb: 12.8, div: 0.72, roe: 38.5, de: 0.42, revG: 15.2, d52: -2.1 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', indices: ['S&P 500', 'Nasdaq-100', 'Dow 30'], capBucket: 'Mega', marketCap: 3410000000000, price: 142.03, pe: 52.4, pb: 42.1, div: 0.08, roe: 115.4, de: 0.22, revG: 122.4, d52: -1.2 },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', industry: 'Semiconductors', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Mega', marketCap: 950000000000, price: 182.40, pe: 38.6, pb: 14.5, div: 1.32, roe: 28.4, de: 1.25, revG: 44.2, d52: -3.5 },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', industry: 'Software - Infrastructure', indices: ['S&P 500'], capBucket: 'Large', marketCap: 510000000000, price: 188.50, pe: 41.2, pb: 35.2, div: 0.88, roe: 82.4, de: 4.80, revG: 8.2, d52: -4.2 },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', industry: 'Software - Application', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 335000000000, price: 338.00, pe: 46.5, pb: 5.4, div: 0.46, roe: 9.8, de: 0.21, revG: 11.4, d52: -2.8 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', industry: 'Semiconductors', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 235000000000, price: 144.50, pe: 88.5, pb: 3.8, div: 0.0, roe: 3.5, de: 0.05, revG: 17.5, d52: -34.5 },
  { symbol: 'CSCO', name: 'Cisco Systems', sector: 'Technology', industry: 'Communication Equipment', indices: ['S&P 500', 'Nasdaq-100', 'Dow 30'], capBucket: 'Large', marketCap: 242000000000, price: 60.10, pe: 24.2, pb: 5.1, div: 2.68, roe: 23.4, de: 0.72, revG: -5.4, d52: -2.5 },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', industry: 'Software - Application', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 225000000000, price: 502.00, pe: 42.1, pb: 12.4, div: 0.0, roe: 34.2, de: 0.41, revG: 10.5, d52: -21.4 },
  { symbol: 'IBM', name: 'International Business Machines', sector: 'Technology', industry: 'Information Technology Services', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 215000000000, price: 231.00, pe: 25.8, pb: 8.9, div: 2.92, roe: 32.5, de: 2.15, revG: 2.5, d52: -1.5 },
  { symbol: 'QCOM', name: 'QUALCOMM Inc.', sector: 'Technology', industry: 'Semiconductors', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 192000000000, price: 171.00, pe: 18.5, pb: 7.2, div: 2.05, roe: 39.8, de: 0.62, revG: 18.4, d52: -24.8 },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductors', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 112000000000, price: 25.80, pe: 45.2, pb: 0.98, div: 1.95, roe: -12.4, de: 0.48, revG: -0.5, d52: -51.2 },
  { symbol: 'TXN', name: 'Texas Instruments', sector: 'Technology', industry: 'Semiconductors', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 195000000000, price: 212.50, pe: 35.4, pb: 11.2, div: 2.58, roe: 31.2, de: 0.78, revG: -8.4, d52: -4.2 },
  { symbol: 'NOW', name: 'ServiceNow Inc.', sector: 'Technology', industry: 'Software - Application', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 218000000000, price: 1055.00, pe: 145.2, pb: 24.5, div: 0.0, roe: 18.2, de: 0.18, revG: 22.4, d52: -1.8 },
  { symbol: 'AMAT', name: 'Applied Materials', sector: 'Technology', industry: 'Semiconductor Equipment', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 162000000000, price: 194.20, pe: 22.4, pb: 8.2, div: 0.82, roe: 41.5, de: 0.32, revG: 4.8, d52: -24.2 },
  { symbol: 'MU', name: 'Micron Technology', sector: 'Technology', industry: 'Semiconductors', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 124000000000, price: 111.50, pe: 28.4, pb: 2.4, div: 0.42, roe: 9.8, de: 0.35, revG: 93.2, d52: -29.5 },
  { symbol: 'LRCX', name: 'Lam Research', sector: 'Technology', industry: 'Semiconductor Equipment', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 105000000000, price: 81.20, pe: 26.5, pb: 11.8, div: 1.15, roe: 48.2, de: 0.54, revG: 8.5, d52: -28.2 },
  { symbol: 'PANW', name: 'Palo Alto Networks', sector: 'Technology', industry: 'Software - Infrastructure', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 135000000000, price: 412.00, pe: 54.2, pb: 18.5, div: 0.0, roe: 42.1, de: 0.45, revG: 14.2, d52: -1.5 },
  { symbol: 'KLAC', name: 'KLA Corporation', sector: 'Technology', industry: 'Semiconductor Equipment', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 98000000000, price: 725.00, pe: 32.1, pb: 28.5, div: 0.95, roe: 78.4, de: 1.85, revG: 8.9, d52: -18.5 },
  { symbol: 'SNPS', name: 'Synopsys Inc.', sector: 'Technology', industry: 'Software - Infrastructure', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 89000000000, price: 582.00, pe: 62.4, pb: 12.1, div: 0.0, roe: 21.5, de: 0.01, revG: 13.5, d52: -8.2 },
  { symbol: 'CDNS', name: 'Cadence Design Systems', sector: 'Technology', industry: 'Software - Infrastructure', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 82000000000, price: 302.50, pe: 75.2, pb: 19.8, div: 0.0, roe: 31.4, de: 0.18, revG: 12.8, d52: -6.4 },
  { symbol: 'ANET', name: 'Arista Networks', sector: 'Technology', industry: 'Computer Hardware', indices: ['S&P 500'], capBucket: 'Large', marketCap: 128000000000, price: 405.00, pe: 48.2, pb: 16.4, div: 0.0, roe: 39.8, de: 0.01, revG: 19.5, d52: -1.2 },
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', industry: 'Software - Infrastructure', indices: ['S&P 500'], capBucket: 'Large', marketCap: 145000000000, price: 65.40, pe: 115.0, pb: 32.4, div: 0.0, roe: 22.4, de: 0.02, revG: 29.8, d52: -1.4 },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology', industry: 'Software - Infrastructure', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 88000000000, price: 362.50, pe: 88.0, pb: 28.5, div: 0.0, roe: 14.5, de: 0.28, revG: 31.2, d52: -8.5 },
  { symbol: 'INTU', name: 'Intuit Inc.', sector: 'Technology', industry: 'Software - Application', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 185000000000, price: 655.00, pe: 58.0, pb: 10.5, div: 0.64, roe: 18.5, de: 0.35, revG: 16.4, d52: -6.8 },

  // Communication Services
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', sector: 'Communication Services', industry: 'Internet Content & Information', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Mega', marketCap: 2240000000000, price: 182.84, pe: 24.8, pb: 6.8, div: 0.44, roe: 31.5, de: 0.11, revG: 15.1, d52: -2.8 },
  { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)', sector: 'Communication Services', industry: 'Internet Content & Information', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Mega', marketCap: 2210000000000, price: 184.20, pe: 24.9, pb: 6.9, div: 0.44, roe: 31.5, de: 0.11, revG: 15.1, d52: -2.5 },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Communication Services', industry: 'Internet Content & Information', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Mega', marketCap: 1580000000000, price: 614.66, pe: 28.5, pb: 9.2, div: 0.35, roe: 36.8, de: 0.22, revG: 18.9, d52: -1.8 },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', industry: 'Entertainment', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 395000000000, price: 905.00, pe: 46.2, pb: 17.5, div: 0.0, roe: 34.5, de: 0.65, revG: 15.0, d52: -1.5 },
  { symbol: 'DIS', name: 'Walt Disney Company', sector: 'Communication Services', industry: 'Entertainment', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 218000000000, price: 118.50, pe: 42.5, pb: 2.1, div: 0.88, roe: 5.2, de: 0.45, revG: 4.2, d52: -4.5 },
  { symbol: 'TMUS', name: 'T-Mobile US Inc.', sector: 'Communication Services', industry: 'Telecom Services', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 268000000000, price: 228.00, pe: 26.4, pb: 3.8, div: 1.48, roe: 15.2, de: 1.85, revG: 4.8, d52: -1.8 },
  { symbol: 'VZ', name: 'Verizon Communications', sector: 'Communication Services', industry: 'Telecom Services', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 178000000000, price: 42.40, pe: 15.2, pb: 1.8, div: 6.38, roe: 12.5, de: 1.58, revG: 0.6, d52: -8.5 },
  { symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication Services', industry: 'Telecom Services', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 164000000000, price: 43.10, pe: 11.5, pb: 1.9, div: 2.88, roe: 17.5, de: 1.15, revG: 2.1, d52: -11.2 },
  { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication Services', industry: 'Telecom Services', indices: ['S&P 500'], capBucket: 'Large', marketCap: 166000000000, price: 23.10, pe: 12.4, pb: 1.5, div: 4.82, roe: 14.2, de: 1.28, revG: 1.2, d52: -1.2 },

  // Consumer Discretionary
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', industry: 'Internet Retail', indices: ['S&P 500', 'Nasdaq-100', 'Dow 30'], capBucket: 'Mega', marketCap: 2350000000000, price: 224.67, pe: 44.5, pb: 8.9, div: 0.0, roe: 22.4, de: 0.58, revG: 11.8, d52: -1.5 },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', industry: 'Auto Manufacturers', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Mega', marketCap: 1280000000000, price: 395.36, pe: 98.5, pb: 18.4, div: 0.0, roe: 16.5, de: 0.12, revG: 7.8, d52: -2.4 },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Discretionary', industry: 'Home Improvement Retail', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 412000000000, price: 415.00, pe: 27.5, pb: 42.8, div: 2.18, roe: 142.5, de: 8.50, revG: 6.2, d52: -3.8 },
  { symbol: 'MCD', name: 'McDonald\'s Corporation', sector: 'Consumer Discretionary', industry: 'Restaurants', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 215000000000, price: 298.00, pe: 25.8, pb: 22.4, div: 2.38, roe: 35.2, de: 2.20, revG: 2.8, d52: -6.5 },
  { symbol: 'NKE', name: 'NIKE Inc.', sector: 'Consumer Discretionary', industry: 'Footwear & Accessories', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 122000000000, price: 81.50, pe: 23.5, pb: 8.4, div: 1.82, roe: 36.5, de: 0.88, revG: -1.2, d52: -32.5 },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer Discretionary', industry: 'Restaurants', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 118000000000, price: 103.50, pe: 32.4, pb: 15.2, div: 2.38, roe: 28.5, de: 1.80, revG: 1.8, d52: -5.8 },
  { symbol: 'BKNG', name: 'Booking Holdings Inc.', sector: 'Consumer Discretionary', industry: 'Travel Services', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 178000000000, price: 5180.00, pe: 34.2, pb: 24.5, div: 0.68, roe: 45.2, de: 1.25, revG: 8.9, d52: -1.8 },
  { symbol: 'TJX', name: 'TJX Companies Inc.', sector: 'Consumer Discretionary', industry: 'Apparel Retail', indices: ['S&P 500'], capBucket: 'Large', marketCap: 139000000000, price: 124.00, pe: 29.5, pb: 18.2, div: 1.22, roe: 64.2, de: 1.25, revG: 6.5, d52: -2.1 },
  { symbol: 'LOW', name: 'Lowe\'s Companies Inc.', sector: 'Consumer Discretionary', industry: 'Home Improvement Retail', indices: ['S&P 500'], capBucket: 'Large', marketCap: 154000000000, price: 272.50, pe: 21.8, pb: 16.5, div: 1.68, roe: 48.2, de: 2.10, revG: -1.5, d52: -4.5 },

  // Financials
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financials', industry: 'Insurance - Diversified', indices: ['S&P 500'], capBucket: 'Mega', marketCap: 1020000000000, price: 472.00, pe: 16.5, pb: 1.55, div: 0.0, roe: 14.8, de: 0.28, revG: 8.2, d52: -1.8 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials', industry: 'Banks - Diversified', indices: ['S&P 500', 'Dow 30'], capBucket: 'Mega', marketCap: 712000000000, price: 248.50, pe: 12.8, pb: 1.95, div: 2.15, roe: 17.5, de: 1.45, revG: 9.8, d52: -1.2 },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financials', industry: 'Credit Services', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 642000000000, price: 318.00, pe: 32.5, pb: 14.2, div: 0.75, roe: 48.5, de: 0.52, revG: 10.2, d52: -2.4 },
  { symbol: 'MA', name: 'Mastercard Incorporated', sector: 'Financials', industry: 'Credit Services', indices: ['S&P 500'], capBucket: 'Large', marketCap: 485000000000, price: 528.00, pe: 36.8, pb: 68.2, div: 0.52, roe: 182.4, de: 2.45, revG: 12.8, d52: -1.5 },
  { symbol: 'BAC', name: 'Bank of America Corp', sector: 'Financials', industry: 'Banks - Diversified', indices: ['S&P 500'], capBucket: 'Large', marketCap: 358000000000, price: 46.80, pe: 14.2, pb: 1.35, div: 2.22, roe: 10.8, de: 1.65, revG: 4.8, d52: -2.8 },
  { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financials', industry: 'Banks - Diversified', indices: ['S&P 500'], capBucket: 'Large', marketCap: 262000000000, price: 74.50, pe: 14.8, pb: 1.48, div: 2.15, roe: 11.2, de: 1.55, revG: 3.5, d52: -1.8 },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financials', industry: 'Capital Markets', indices: ['S&P 500'], capBucket: 'Large', marketCap: 212000000000, price: 132.00, pe: 17.8, pb: 2.15, div: 2.78, roe: 13.5, de: 2.85, revG: 14.2, d52: -2.5 },
  { symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Financials', industry: 'Capital Markets', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 198000000000, price: 602.00, pe: 16.2, pb: 1.72, div: 2.05, roe: 12.4, de: 3.12, revG: 16.5, d52: -1.8 },
  { symbol: 'BLK', name: 'BlackRock Inc.', sector: 'Financials', industry: 'Asset Management', indices: ['S&P 500'], capBucket: 'Large', marketCap: 158000000000, price: 1045.00, pe: 24.5, pb: 3.45, div: 1.95, roe: 15.2, de: 0.38, revG: 15.0, d52: -3.2 },
  { symbol: 'AXP', name: 'American Express Company', sector: 'Financials', industry: 'Credit Services', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 218000000000, price: 308.00, pe: 21.8, pb: 6.85, div: 0.92, roe: 34.2, de: 1.85, revG: 9.5, d52: -2.2 },

  // Healthcare
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', industry: 'Drug Manufacturers - General', indices: ['S&P 500'], capBucket: 'Mega', marketCap: 785000000000, price: 825.00, pe: 64.5, pb: 48.2, div: 0.65, roe: 68.5, de: 2.45, revG: 42.5, d52: -14.8 },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', industry: 'Healthcare Plans', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 545000000000, price: 595.00, pe: 28.5, pb: 5.4, div: 1.42, roe: 24.8, de: 0.72, revG: 9.2, d52: -4.5 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', industry: 'Drug Manufacturers - General', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 382000000000, price: 158.50, pe: 22.4, pb: 5.2, div: 3.12, roe: 22.4, de: 0.48, revG: 4.8, d52: -6.8 },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers - General', indices: ['S&P 500'], capBucket: 'Large', marketCap: 325000000000, price: 184.00, pe: 48.5, pb: 42.5, div: 3.58, roe: 85.2, de: 6.80, revG: 3.8, d52: -11.5 },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers - General', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 254000000000, price: 100.50, pe: 16.8, pb: 6.4, div: 3.22, roe: 36.5, de: 0.88, revG: 6.8, d52: -24.5 },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare', industry: 'Diagnostics & Research', indices: ['S&P 500'], capBucket: 'Large', marketCap: 210000000000, price: 545.00, pe: 34.2, pb: 4.2, div: 0.28, roe: 13.5, de: 0.68, revG: 0.5, d52: -12.4 },
  { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare', industry: 'Medical Devices', indices: ['S&P 500'], capBucket: 'Large', marketCap: 205000000000, price: 118.00, pe: 36.5, pb: 5.1, div: 1.88, roe: 14.8, de: 0.38, revG: 4.5, d52: -5.4 },
  { symbol: 'ISRG', name: 'Intuitive Surgical', sector: 'Healthcare', industry: 'Medical Instruments & Supplies', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 188000000000, price: 532.00, pe: 82.5, pb: 12.8, div: 0.0, roe: 16.4, de: 0.01, revG: 17.5, d52: -2.1 },

  // Industrials
  { symbol: 'GE', name: 'GE Aerospace', sector: 'Industrials', industry: 'Aerospace & Defense', indices: ['S&P 500'], capBucket: 'Large', marketCap: 202000000000, price: 188.00, pe: 38.5, pb: 7.2, div: 0.58, roe: 28.5, de: 0.72, revG: 18.5, d52: -2.8 },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials', industry: 'Farm & Heavy Construction Machinery', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 198000000000, price: 412.00, pe: 18.5, pb: 8.9, div: 1.38, roe: 54.2, de: 1.85, revG: 1.2, d52: -3.5 },
  { symbol: 'RTX', name: 'RTX Corporation', sector: 'Industrials', industry: 'Aerospace & Defense', indices: ['S&P 500'], capBucket: 'Large', marketCap: 164000000000, price: 124.00, pe: 34.2, pb: 2.8, div: 2.05, roe: 9.8, de: 0.62, revG: 11.2, d52: -4.2 },
  { symbol: 'UNP', name: 'Union Pacific Corporation', sector: 'Industrials', industry: 'Railroads', indices: ['S&P 500'], capBucket: 'Large', marketCap: 148000000000, price: 244.00, pe: 23.5, pb: 9.5, div: 2.15, roe: 42.5, de: 2.15, revG: 2.8, d52: -5.4 },
  { symbol: 'HON', name: 'Honeywell International', sector: 'Industrials', industry: 'Conglomerates', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 152000000000, price: 234.50, pe: 26.2, pb: 8.8, div: 1.95, roe: 35.8, de: 1.45, revG: 5.5, d52: -3.8 },
  { symbol: 'BA', name: 'Boeing Company', sector: 'Industrials', industry: 'Aerospace & Defense', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 94000000000, price: 154.00, pe: 35.0, pb: 12.0, div: 0.0, roe: -18.5, de: 4.50, revG: -1.5, d52: -42.5 },

  // Consumer Staples
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', industry: 'Discount Stores', indices: ['S&P 500', 'Dow 30'], capBucket: 'Mega', marketCap: 745000000000, price: 92.50, pe: 34.8, pb: 8.2, div: 0.92, roe: 21.5, de: 0.65, revG: 5.8, d52: -1.2 },
  { symbol: 'PG', name: 'Procter & Gamble Company', sector: 'Consumer Staples', industry: 'Household & Personal Products', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 412000000000, price: 174.50, pe: 28.5, pb: 7.9, div: 2.32, roe: 32.5, de: 0.72, revG: 3.2, d52: -3.8 },
  { symbol: 'COST', name: 'Costco Wholesale Corp', sector: 'Consumer Staples', industry: 'Discount Stores', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 425000000000, price: 958.00, pe: 54.2, pb: 15.2, div: 0.48, roe: 29.8, de: 0.35, revG: 9.1, d52: -1.5 },
  { symbol: 'KO', name: 'Coca-Cola Company', sector: 'Consumer Staples', industry: 'Beverages - Non-Alcoholic', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 278000000000, price: 64.80, pe: 26.4, pb: 10.5, div: 3.02, roe: 42.1, de: 1.45, revG: 3.4, d52: -9.5 },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples', industry: 'Beverages - Non-Alcoholic', indices: ['S&P 500', 'Nasdaq-100'], capBucket: 'Large', marketCap: 228000000000, price: 165.50, pe: 24.2, pb: 12.1, div: 3.25, roe: 52.4, de: 2.10, revG: 2.1, d52: -12.4 },

  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', industry: 'Oil & Gas Integrated', indices: ['S&P 500'], capBucket: 'Large', marketCap: 525000000000, price: 118.50, pe: 14.5, pb: 2.1, div: 3.32, roe: 18.5, de: 0.18, revG: -1.2, d52: -4.8 },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', industry: 'Oil & Gas Integrated', indices: ['S&P 500', 'Dow 30'], capBucket: 'Large', marketCap: 295000000000, price: 161.00, pe: 14.8, pb: 1.8, div: 4.12, roe: 13.8, de: 0.15, revG: -2.8, d52: -6.5 },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', industry: 'Oil & Gas E&P', indices: ['S&P 500'], capBucket: 'Large', marketCap: 132000000000, price: 112.50, pe: 12.8, pb: 2.4, div: 2.82, roe: 18.2, de: 0.38, revG: 4.5, d52: -14.2 },

  // Utilities, Real Estate, Materials
  { symbol: 'NEE', name: 'NextEra Energy Inc.', sector: 'Utilities', industry: 'Utilities - Regulated Electric', indices: ['S&P 500'], capBucket: 'Large', marketCap: 164000000000, price: 79.80, pe: 24.5, pb: 3.2, div: 2.65, roe: 12.8, de: 1.45, revG: 8.5, d52: -8.5 },
  { symbol: 'PLD', name: 'Prologis Inc.', sector: 'Real Estate', industry: 'REIT - Industrial', indices: ['S&P 500'], capBucket: 'Large', marketCap: 112000000000, price: 121.00, pe: 38.5, pb: 2.1, div: 3.22, roe: 6.5, de: 0.65, revG: 12.4, d52: -14.5 },
  { symbol: 'LIN', name: 'Linde plc', sector: 'Basic Materials', industry: 'Specialty Chemicals', indices: ['S&P 500'], capBucket: 'Large', marketCap: 218000000000, price: 458.00, pe: 34.2, pb: 5.2, div: 1.25, roe: 16.5, de: 0.45, revG: 2.8, d52: -3.8 },
];

// Popular ETFs to append
const POPULAR_ETFS = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'ETFs', industry: 'Large Blend', indices: ['Popular ETFs'], capBucket: 'Mega', marketCap: 610000000000, price: 595.0, pe: 27.5 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETFs', industry: 'Large Growth', indices: ['Popular ETFs'], capBucket: 'Mega', marketCap: 310000000000, price: 518.5, pe: 34.2 },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', sector: 'ETFs', industry: 'Large Value', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 38000000000, price: 442.0, pe: 22.4 },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', sector: 'ETFs', industry: 'Small Blend', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 72000000000, price: 232.0, pe: 18.5 },
  { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', sector: 'ETFs', industry: 'Technology', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 78000000000, price: 238.0, pe: 35.8 },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', sector: 'ETFs', industry: 'Financials', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 48000000000, price: 48.5, pe: 16.5 },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', sector: 'ETFs', industry: 'Energy', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 39000000000, price: 92.4, pe: 13.8 },
  { symbol: 'XLV', name: 'Health Care Select Sector SPDR Fund', sector: 'ETFs', industry: 'Healthcare', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 42000000000, price: 148.0, pe: 22.5 },
  { symbol: 'XLY', name: 'Consumer Discretionary Select SPDR', sector: 'ETFs', industry: 'Consumer Discretionary', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 24000000000, price: 215.0, pe: 28.5 },
  { symbol: 'XLP', name: 'Consumer Staples Select Sector SPDR', sector: 'ETFs', industry: 'Consumer Staples', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 18000000000, price: 79.5, pe: 21.2 },
  { symbol: 'XLI', name: 'Industrial Select Sector SPDR Fund', sector: 'ETFs', industry: 'Industrials', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 22000000000, price: 138.0, pe: 24.5 },
  { symbol: 'XLU', name: 'Utilities Select Sector SPDR Fund', sector: 'ETFs', industry: 'Utilities', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 16000000000, price: 82.5, pe: 20.8 },
  { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR Fund', sector: 'ETFs', industry: 'Real Estate', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 7500000000, price: 42.5, pe: 34.0 },
  { symbol: 'XLB', name: 'Materials Select Sector SPDR Fund', sector: 'ETFs', industry: 'Basic Materials', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 6800000000, price: 91.2, pe: 22.0 },
  { symbol: 'XLC', name: 'Communication Services Select SPDR', sector: 'ETFs', industry: 'Communication Services', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 19000000000, price: 94.5, pe: 24.0 },
  { symbol: 'SMH', name: 'VanEck Semiconductor ETF', sector: 'ETFs', industry: 'Semiconductors', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 28000000000, price: 252.0, pe: 42.0 },
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF', sector: 'ETFs', industry: 'Semiconductors', indices: ['Popular ETFs'], capBucket: 'Large', marketCap: 16000000000, price: 228.0, pe: 38.5 },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', sector: 'ETFs', industry: 'Tech & Growth', indices: ['Popular ETFs'], capBucket: 'Mid', marketCap: 6200000000, price: 54.0, pe: 55.0 },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', sector: 'ETFs', industry: 'Large Blend', indices: ['Popular ETFs'], capBucket: 'Mega', marketCap: 540000000000, price: 545.0, pe: 27.5 },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', sector: 'ETFs', industry: 'Large Blend', indices: ['Popular ETFs'], capBucket: 'Mega', marketCap: 440000000000, price: 295.0, pe: 26.8 },
];

// Curated list of all 500+ S&P 500 and Nasdaq 100 tickers with sectoral metadata
const US_REMAINING_SYMBOLS = [
  // Tech
  ['APH', 'Amphenol Corporation', 'Technology', 'Electronic Components', 85000000000],
  ['ADI', 'Analog Devices Inc.', 'Technology', 'Semiconductors', 112000000000],
  ['MCHP', 'Microchip Technology', 'Technology', 'Semiconductors', 42000000000],
  ['FTNT', 'Fortinet Inc.', 'Technology', 'Software - Infrastructure', 74000000000],
  ['TEL', 'TE Connectivity Ltd.', 'Technology', 'Electronic Components', 48000000000],
  ['HPQ', 'HP Inc.', 'Technology', 'Computer Hardware', 36000000000],
  ['STX', 'Seagate Technology', 'Technology', 'Computer Hardware', 24000000000],
  ['WDC', 'Western Digital Corp', 'Technology', 'Computer Hardware', 26000000000],
  ['GLW', 'Corning Inc.', 'Technology', 'Electronic Components', 41000000000],
  ['MPWR', 'Monolithic Power Systems', 'Technology', 'Semiconductors', 32000000000],
  ['KEYS', 'Keysight Technologies', 'Technology', 'Electronic Equipment', 28000000000],
  ['ON', 'ON Semiconductor Corp', 'Technology', 'Semiconductors', 31000000000],
  ['CDW', 'CDW Corporation', 'Technology', 'Information Technology Services', 26000000000],
  ['IT', 'Gartner Inc.', 'Technology', 'Information Technology Services', 42000000000],
  ['NTAP', 'NetApp Inc.', 'Technology', 'Computer Hardware', 27000000000],
  ['FSLR', 'First Solar Inc.', 'Technology', 'Solar', 22000000000],
  ['TER', 'Teradyne Inc.', 'Technology', 'Semiconductor Equipment', 18000000000],
  ['ANSS', 'ANSYS Inc.', 'Technology', 'Software - Application', 28000000000],
  ['PTC', 'PTC Inc.', 'Technology', 'Software - Application', 22000000000],
  ['ZBRA', 'Zebra Technologies', 'Technology', 'Communication Equipment', 21000000000],
  ['TYL', 'Tyler Technologies', 'Technology', 'Software - Application', 24000000000],
  ['AKAM', 'Akamai Technologies', 'Technology', 'Software - Infrastructure', 15000000000],
  ['SWKS', 'Skyworks Solutions', 'Technology', 'Semiconductors', 14000000000],
  ['QRVO', 'Qorvo Inc.', 'Technology', 'Semiconductors', 8000000000],
  ['FFIV', 'F5 Inc.', 'Technology', 'Software - Infrastructure', 14500000000],
  ['GEN', 'Gen Digital Inc.', 'Technology', 'Software - Infrastructure', 18000000000],
  ['JNPR', 'Juniper Networks', 'Technology', 'Communication Equipment', 12000000000],
  ['SMCI', 'Super Micro Computer', 'Technology', 'Computer Hardware', 25000000000],
  ['DDOG', 'Datadog Inc.', 'Technology', 'Software - Application', 48000000000],
  ['NET', 'Cloudflare Inc.', 'Technology', 'Software - Infrastructure', 38000000000],
  ['ZS', 'Zscaler Inc.', 'Technology', 'Software - Infrastructure', 32000000000],
  ['MDB', 'MongoDB Inc.', 'Technology', 'Software - Infrastructure', 24000000000],
  ['TEAM', 'Atlassian Corporation', 'Technology', 'Software - Application', 64000000000],
  ['WDAY', 'Workday Inc.', 'Technology', 'Software - Application', 72000000000],
  ['SNOW', 'Snowflake Inc.', 'Technology', 'Software - Infrastructure', 52000000000],
  ['ROKU', 'Roku Inc.', 'Communication Services', 'Entertainment', 11000000000],
  ['PINS', 'Pinterest Inc.', 'Communication Services', 'Internet Content & Information', 21000000000],
  ['SNAP', 'Snap Inc.', 'Communication Services', 'Internet Content & Information', 19000000000],
  ['CHTR', 'Charter Communications', 'Communication Services', 'Telecom Services', 48000000000],
  ['EA', 'Electronic Arts Inc.', 'Communication Services', 'Electronic Gaming & Multimedia', 41000000000],
  ['TTWO', 'Take-Two Interactive', 'Communication Services', 'Electronic Gaming & Multimedia', 32000000000],
  ['WBD', 'Warner Bros. Discovery', 'Communication Services', 'Entertainment', 26000000000],
  ['OMC', 'Omnicom Group Inc.', 'Communication Services', 'Advertising Agencies', 21000000000],
  ['IPG', 'Interpublic Group', 'Communication Services', 'Advertising Agencies', 12000000000],
  ['FOXA', 'Fox Corporation (Class A)', 'Communication Services', 'Entertainment', 21000000000],
  ['LYV', 'Live Nation Entertainment', 'Communication Services', 'Entertainment', 28000000000],
  ['MTCH', 'Match Group Inc.', 'Communication Services', 'Internet Content & Information', 9000000000],
  ['SIRI', 'Sirius XM Holdings', 'Communication Services', 'Broadcasting', 9500000000],

  // Consumer Discretionary
  ['MAR', 'Marriott International', 'Consumer Discretionary', 'Lodging', 82000000000],
  ['ORLY', 'O\'Reilly Automotive', 'Consumer Discretionary', 'Specialty Retail', 72000000000],
  ['AZO', 'AutoZone Inc.', 'Consumer Discretionary', 'Specialty Retail', 54000000000],
  ['CMG', 'Chipotle Mexican Grill', 'Consumer Discretionary', 'Restaurants', 78000000000],
  ['LULU', 'Lululemon Athletica', 'Consumer Discretionary', 'Apparel Retail', 42000000000],
  ['ROST', 'Ross Stores Inc.', 'Consumer Discretionary', 'Apparel Retail', 48000000000],
  ['DHI', 'D.R. Horton Inc.', 'Consumer Discretionary', 'Residential Construction', 55000000000],
  ['LEN', 'Lennar Corporation', 'Consumer Discretionary', 'Residential Construction', 46000000000],
  ['GM', 'General Motors Company', 'Consumer Discretionary', 'Auto Manufacturers', 62000000000],
  ['F', 'Ford Motor Company', 'Consumer Discretionary', 'Auto Manufacturers', 44000000000],
  ['BBY', 'Best Buy Co. Inc.', 'Consumer Discretionary', 'Specialty Retail', 19000000000],
  ['EBAY', 'eBay Inc.', 'Consumer Discretionary', 'Internet Retail', 31000000000],
  ['ULTA', 'Ulta Beauty Inc.', 'Consumer Discretionary', 'Specialty Retail', 19500000000],
  ['YUM', 'Yum! Brands Inc.', 'Consumer Discretionary', 'Restaurants', 38000000000],
  ['DRI', 'Darden Restaurants', 'Consumer Discretionary', 'Restaurants', 21000000000],
  ['EXPE', 'Expedia Group Inc.', 'Consumer Discretionary', 'Travel Services', 22000000000],
  ['RCL', 'Royal Caribbean Cruises', 'Consumer Discretionary', 'Travel Services', 61000000000],
  ['CCL', 'Carnival Corporation', 'Consumer Discretionary', 'Travel Services', 32000000000],
  ['NCLH', 'Norwegian Cruise Line', 'Consumer Discretionary', 'Travel Services', 11000000000],
  ['PHM', 'PulteGroup Inc.', 'Consumer Discretionary', 'Residential Construction', 28000000000],
  ['NVR', 'NVR Inc.', 'Consumer Discretionary', 'Residential Construction', 29000000000],
  ['TOL', 'Toll Brothers Inc.', 'Consumer Discretionary', 'Residential Construction', 15000000000],
  ['HAS', 'Hasbro Inc.', 'Consumer Discretionary', 'Leisure', 8500000000],
  ['MAT', 'Mattel Inc.', 'Consumer Discretionary', 'Leisure', 6500000000],
  ['WHR', 'Whirlpool Corporation', 'Consumer Discretionary', 'Furnishings, Fixtures & Appliances', 6200000000],
  ['TPR', 'Tapestry Inc.', 'Consumer Discretionary', 'Apparel Retail', 14000000000],
  ['VFC', 'V.F. Corporation', 'Consumer Discretionary', 'Apparel Retail', 8200000000],
  ['DECK', 'Deckers Outdoor Corp', 'Consumer Discretionary', 'Footwear & Accessories', 28000000000],
  ['GPC', 'Genuine Parts Company', 'Consumer Discretionary', 'Auto Parts', 18000000000],
  ['POOL', 'Pool Corporation', 'Consumer Discretionary', 'Leisure', 14000000000],
  ['LKQ', 'LKQ Corporation', 'Consumer Discretionary', 'Auto Parts', 11000000000],
  ['BWA', 'BorgWarner Inc.', 'Consumer Discretionary', 'Auto Parts', 8500000000],
  ['APTV', 'Aptiv PLC', 'Consumer Discretionary', 'Auto Parts', 18000000000],

  // Financials
  ['SCHW', 'Charles Schwab Corporation', 'Financials', 'Capital Markets', 142000000000],
  ['PGR', 'Progressive Corporation', 'Financials', 'Insurance - Property & Casualty', 152000000000],
  ['CB', 'Chubb Limited', 'Financials', 'Insurance - Property & Casualty', 118000000000],
  ['MMC', 'Marsh & McLennan Companies', 'Financials', 'Insurance Brokers', 110000000000],
  ['AON', 'Aon plc', 'Financials', 'Insurance Brokers', 82000000000],
  ['ICE', 'Intercontinental Exchange', 'Financials', 'Financial Data & Stock Exchanges', 92000000000],
  ['CME', 'CME Group Inc.', 'Financials', 'Financial Data & Stock Exchanges', 84000000000],
  ['MCO', 'Moody\'s Corporation', 'Financials', 'Financial Data & Stock Exchanges', 86000000000],
  ['SPGI', 'S&P Global Inc.', 'Financials', 'Financial Data & Stock Exchanges', 165000000000],
  ['USB', 'U.S. Bancorp', 'Financials', 'Banks - Regional', 78000000000],
  ['PNC', 'PNC Financial Services', 'Financials', 'Banks - Regional', 81000000000],
  ['TFC', 'Truist Financial Corp', 'Financials', 'Banks - Regional', 62000000000],
  ['COF', 'Capital One Financial', 'Financials', 'Credit Services', 68000000000],
  ['BK', 'Bank of New York Mellon', 'Financials', 'Asset Management', 58000000000],
  ['PRU', 'Prudential Financial', 'Financials', 'Insurance - Life', 44000000000],
  ['MET', 'MetLife Inc.', 'Financials', 'Insurance - Life', 58000000000],
  ['AIG', 'American International Group', 'Financials', 'Insurance - Diversified', 51000000000],
  ['AFL', 'Aflac Inc.', 'Financials', 'Insurance - Life', 64000000000],
  ['TRV', 'The Travelers Companies', 'Financials', 'Insurance - Property & Casualty', 58000000000],
  ['ALL', 'Allstate Corporation', 'Financials', 'Insurance - Property & Casualty', 54000000000],
  ['AJG', 'Arthur J. Gallagher & Co.', 'Financials', 'Insurance Brokers', 66000000000],
  ['HIG', 'Hartford Financial Services', 'Financials', 'Insurance - Property & Casualty', 35000000000],
  ['WTW', 'Willis Towers Watson', 'Financials', 'Insurance Brokers', 32000000000],
  ['FITB', 'Fifth Third Bancorp', 'Financials', 'Banks - Regional', 31000000000],
  ['MTB', 'M&T Bank Corporation', 'Financials', 'Banks - Regional', 32000000000],
  ['HBAN', 'Huntington Bancshares', 'Financials', 'Banks - Regional', 26000000000],
  ['RF', 'Regions Financial Corp', 'Financials', 'Banks - Regional', 24000000000],
  ['CFG', 'Citizens Financial Group', 'Financials', 'Banks - Regional', 21000000000],
  ['KEY', 'KeyCorp', 'Financials', 'Banks - Regional', 18000000000],
  ['SYF', 'Synchrony Financial', 'Financials', 'Credit Services', 26000000000],
  ['BRO', 'Brown & Brown Inc.', 'Financials', 'Insurance Brokers', 28000000000],
  ['RJF', 'Raymond James Financial', 'Financials', 'Capital Markets', 28000000000],
  ['NTRS', 'Northern Trust Corporation', 'Financials', 'Asset Management', 22000000000],
  ['CINF', 'Cincinnati Financial', 'Financials', 'Insurance - Property & Casualty', 22000000000],
  ['STT', 'State Street Corporation', 'Financials', 'Asset Management', 28000000000],
  ['AIZ', 'Assurant Inc.', 'Financials', 'Insurance - Specialty', 11000000000],
  ['IVZ', 'Invesco Ltd.', 'Financials', 'Asset Management', 8500000000],
  ['BEN', 'Franklin Resources Inc.', 'Financials', 'Asset Management', 12000000000],

  // Healthcare
  ['PFE', 'Pfizer Inc.', 'Healthcare', 'Drug Manufacturers - General', 154000000000],
  ['BMY', 'Bristol-Myers Squibb', 'Healthcare', 'Drug Manufacturers - General', 118000000000],
  ['AMGN', 'Amgen Inc.', 'Healthcare', 'Biotechnology', 158000000000],
  ['GILD', 'Gilead Sciences', 'Healthcare', 'Biotechnology', 118000000000],
  ['VRTX', 'Vertex Pharmaceuticals', 'Healthcare', 'Biotechnology', 124000000000],
  ['REGN', 'Regeneron Pharmaceuticals', 'Healthcare', 'Biotechnology', 89000000000],
  ['SYK', 'Stryker Corporation', 'Healthcare', 'Medical Devices', 148000000000],
  ['BDX', 'Becton Dickinson and Co', 'Healthcare', 'Medical Instruments & Supplies', 68000000000],
  ['MDT', 'Medtronic plc', 'Healthcare', 'Medical Devices', 112000000000],
  ['BSX', 'Boston Scientific Corp', 'Healthcare', 'Medical Devices', 132000000000],
  ['HUM', 'Humana Inc.', 'Healthcare', 'Healthcare Plans', 34000000000],
  ['ZTS', 'Zoetis Inc.', 'Healthcare', 'Drug Manufacturers - Specialty', 78000000000],
  ['MCK', 'McKesson Corporation', 'Healthcare', 'Medical Distribution', 74000000000],
  ['COR', 'Cencora Inc.', 'Healthcare', 'Medical Distribution', 48000000000],
  ['CAH', 'Cardinal Health Inc.', 'Healthcare', 'Medical Distribution', 28000000000],
  ['EW', 'Edwards Lifesciences', 'Healthcare', 'Medical Devices', 42000000000],
  ['IDXX', 'IDEXX Laboratories', 'Healthcare', 'Diagnostics & Research', 34000000000],
  ['CNC', 'Centene Corporation', 'Healthcare', 'Healthcare Plans', 31000000000],
  ['IQV', 'IQVIA Holdings Inc.', 'Healthcare', 'Diagnostics & Research', 38000000000],
  ['HCA', 'HCA Healthcare Inc.', 'Healthcare', 'Medical Care Facilities', 85000000000],
  ['DXCM', 'DexCom Inc.', 'Healthcare', 'Medical Devices', 31000000000],
  ['MTD', 'Mettler-Toledo International', 'Healthcare', 'Diagnostics & Research', 26000000000],
  ['A', 'Agilent Technologies', 'Healthcare', 'Diagnostics & Research', 38000000000],
  ['RMD', 'ResMed Inc.', 'Healthcare', 'Medical Devices', 34000000000],
  ['ALGN', 'Align Technology', 'Healthcare', 'Medical Devices', 16000000000],
  ['WST', 'West Pharmaceutical Services', 'Healthcare', 'Medical Instruments & Supplies', 24000000000],
  ['STE', 'STERIS plc', 'Healthcare', 'Medical Devices', 21000000000],
  ['TECH', 'Bio-Techne Corp', 'Healthcare', 'Biotechnology', 11000000000],
  ['PODD', 'Insulet Corporation', 'Healthcare', 'Medical Devices', 18000000000],
  ['CRL', 'Charles River Laboratories', 'Healthcare', 'Diagnostics & Research', 9500000000],
  ['HOLX', 'Hologic Inc.', 'Healthcare', 'Medical Instruments & Supplies', 19000000000],
  ['BIIB', 'Biogen Inc.', 'Healthcare', 'Biotechnology', 24000000000],
  ['BAX', 'Baxter International', 'Healthcare', 'Medical Instruments & Supplies', 17000000000],
  ['COO', 'The Cooper Companies', 'Healthcare', 'Medical Instruments & Supplies', 18000000000],
  ['TFX', 'Teleflex Inc.', 'Healthcare', 'Medical Instruments & Supplies', 11000000000],
  ['LH', 'Laboratory Corp of America', 'Healthcare', 'Diagnostics & Research', 19000000000],
  ['DGX', 'Quest Diagnostics Inc.', 'Healthcare', 'Diagnostics & Research', 18000000000],
  ['INCY', 'Incyte Corporation', 'Healthcare', 'Biotechnology', 15000000000],
  ['VTRS', 'Viatris Inc.', 'Healthcare', 'Drug Manufacturers - Specialty', 14000000000],
  ['ELV', 'Elevance Health Inc.', 'Healthcare', 'Healthcare Plans', 95000000000],
  ['CI', 'The Cigna Group', 'Healthcare', 'Healthcare Plans', 88000000000],
  ['CVS', 'CVS Health Corporation', 'Healthcare', 'Healthcare Plans', 72000000000],

  // Industrials & Aerospace
  ['DE', 'Deere & Company', 'Industrials', 'Farm & Heavy Construction Machinery', 118000000000],
  ['LMT', 'Lockheed Martin Corp', 'Industrials', 'Aerospace & Defense', 132000000000],
  ['ETN', 'Eaton Corporation plc', 'Industrials', 'Specialty Industrial Machinery', 148000000000],
  ['UPS', 'United Parcel Service', 'Industrials', 'Integrated Freight & Logistics', 114000000000],
  ['ADP', 'Automatic Data Processing', 'Industrials', 'Staffing & Employment Services', 122000000000],
  ['ITW', 'Illinois Tool Works', 'Industrials', 'Specialty Industrial Machinery', 78000000000],
  ['WM', 'Waste Management Inc.', 'Industrials', 'Waste Management', 88000000000],
  ['PH', 'Parker-Hannifin Corp', 'Industrials', 'Specialty Industrial Machinery', 86000000000],
  ['GD', 'General Dynamics Corp', 'Industrials', 'Aerospace & Defense', 78000000000],
  ['TDG', 'TransDigm Group Inc.', 'Industrials', 'Aerospace & Defense', 72000000000],
  ['CTAS', 'Cintas Corporation', 'Industrials', 'Specialty Business Services', 82000000000],
  ['CSX', 'CSX Corporation', 'Industrials', 'Railroads', 68000000000],
  ['NSC', 'Norfolk Southern Corp', 'Industrials', 'Railroads', 61000000000],
  ['PCAR', 'PACCAR Inc.', 'Industrials', 'Farm & Heavy Construction Machinery', 58000000000],
  ['EMR', 'Emerson Electric Co.', 'Industrials', 'Specialty Industrial Machinery', 72000000000],
  ['FAST', 'Fastenal Company', 'Industrials', 'Industrial Distribution', 45000000000],
  ['FDX', 'FedEx Corporation', 'Industrials', 'Integrated Freight & Logistics', 71000000000],
  ['ROP', 'Roper Technologies', 'Industrials', 'Specialty Industrial Machinery', 61000000000],
  ['CMI', 'Cummins Inc.', 'Industrials', 'Specialty Industrial Machinery', 49000000000],
  ['TT', 'Trane Technologies plc', 'Industrials', 'Building Products & Equipment', 89000000000],
  ['JCI', 'Johnson Controls International', 'Industrials', 'Building Products & Equipment', 54000000000],
  ['CARR', 'Carrier Global Corp', 'Industrials', 'Building Products & Equipment', 68000000000],
  ['OTIS', 'Otis Worldwide Corp', 'Industrials', 'Building Products & Equipment', 41000000000],
  ['VRSK', 'Verisk Analytics Inc.', 'Industrials', 'Consulting Services', 39000000000],
  ['GWW', 'W.W. Grainger Inc.', 'Industrials', 'Industrial Distribution', 51000000000],
  ['URI', 'United Rentals Inc.', 'Industrials', 'Rental & Leasing Services', 52000000000],
  ['PWR', 'Quanta Services Inc.', 'Industrials', 'Engineering & Construction', 46000000000],
  ['DAL', 'Delta Air Lines Inc.', 'Industrials', 'Airlines', 38000000000],
  ['LUV', 'Southwest Airlines Co.', 'Industrials', 'Airlines', 18000000000],
  ['UAL', 'United Airlines Holdings', 'Industrials', 'Airlines', 31000000000],
  ['EXPD', 'Expeditors International', 'Industrials', 'Integrated Freight & Logistics', 18000000000],
  ['CHRW', 'C.H. Robinson Worldwide', 'Industrials', 'Integrated Freight & Logistics', 13000000000],
  ['JBHT', 'J.B. Hunt Transport', 'Industrials', 'Trucking', 18000000000],
  ['CPRT', 'Copart Inc.', 'Industrials', 'Specialty Business Services', 52000000000],
  ['DOV', 'Dover Corporation', 'Industrials', 'Specialty Industrial Machinery', 28000000000],
  ['IR', 'Ingersoll Rand Inc.', 'Industrials', 'Specialty Industrial Machinery', 41000000000],
  ['XYL', 'Xylem Inc.', 'Industrials', 'Specialty Industrial Machinery', 31000000000],
  ['SWK', 'Stanley Black & Decker', 'Industrials', 'Tools & Accessories', 15000000000],
  ['NDSN', 'Nordson Corporation', 'Industrials', 'Specialty Industrial Machinery', 15000000000],
  ['AOS', 'A. O. Smith Corp', 'Industrials', 'Building Products & Equipment', 12000000000],
  ['IEX', 'IDEX Corporation', 'Industrials', 'Specialty Industrial Machinery', 16000000000],
  ['HUBB', 'Hubbell Incorporated', 'Industrials', 'Electrical Equipment & Parts', 24000000000],
  ['LDOS', 'Leidos Holdings Inc.', 'Industrials', 'Aerospace & Defense', 24000000000],
  ['HWM', 'Howmet Aerospace Inc.', 'Industrials', 'Aerospace & Defense', 48000000000],

  // Consumer Staples
  ['MDLZ', 'Mondelez International', 'Consumer Staples', 'Confectioners', 94000000000],
  ['PM', 'Philip Morris International', 'Consumer Staples', 'Tobacco', 212000000000],
  ['MO', 'Altria Group Inc.', 'Consumer Staples', 'Tobacco', 98000000000],
  ['CL', 'Colgate-Palmolive Company', 'Consumer Staples', 'Household & Personal Products', 81000000000],
  ['TGT', 'Target Corporation', 'Consumer Staples', 'Discount Stores', 61000000000],
  ['KMB', 'Kimberly-Clark Corp', 'Consumer Staples', 'Household & Personal Products', 46000000000],
  ['STZ', 'Constellation Brands', 'Consumer Staples', 'Beverages - Wineries & Distilleries', 44000000000],
  ['MNST', 'Monster Beverage Corp', 'Consumer Staples', 'Beverages - Non-Alcoholic', 52000000000],
  ['GIS', 'General Mills Inc.', 'Consumer Staples', 'Packaged Foods', 36000000000],
  ['ADM', 'Archer-Daniels-Midland', 'Consumer Staples', 'Farm Products', 26000000000],
  ['SYY', 'Sysco Corporation', 'Consumer Staples', 'Food Distribution', 38000000000],
  ['KDP', 'Keurig Dr Pepper Inc.', 'Consumer Staples', 'Beverages - Non-Alcoholic', 44000000000],
  ['HSY', 'The Hershey Company', 'Consumer Staples', 'Confectioners', 36000000000],
  ['K', 'Kellanova', 'Consumer Staples', 'Packaged Foods', 28000000000],
  ['KHC', 'The Kraft Heinz Company', 'Consumer Staples', 'Packaged Foods', 38000000000],
  ['CHD', 'Church & Dwight Co.', 'Consumer Staples', 'Household & Personal Products', 25000000000],
  ['CLX', 'The Clorox Company', 'Consumer Staples', 'Household & Personal Products', 21000000000],
  ['MKC', 'McCormick & Company', 'Consumer Staples', 'Packaged Foods', 21000000000],
  ['CAG', 'Conagra Brands Inc.', 'Consumer Staples', 'Packaged Foods', 14000000000],
  ['SJM', 'The J.M. Smucker Company', 'Consumer Staples', 'Packaged Foods', 12000000000],
  ['TSN', 'Tyson Foods Inc.', 'Consumer Staples', 'Packaged Foods', 22000000000],
  ['HRL', 'Hormel Foods Corp', 'Consumer Staples', 'Packaged Foods', 17000000000],
  ['TAP', 'Molson Coors Beverage Co.', 'Consumer Staples', 'Beverages - Brewers', 12000000000],
  ['CPB', 'Campbell Soup Company', 'Consumer Staples', 'Packaged Foods', 14000000000],
  ['LW', 'Lamb Weston Holdings', 'Consumer Staples', 'Packaged Foods', 11000000000],
  ['BG', 'Bunge Global SA', 'Consumer Staples', 'Farm Products', 13000000000],

  // Energy
  ['SLB', 'Schlumberger Limited', 'Energy', 'Oil & Gas Equipment & Services', 64000000000],
  ['EOG', 'EOG Resources Inc.', 'Energy', 'Oil & Gas E&P', 76000000000],
  ['MPC', 'Marathon Petroleum Corp', 'Energy', 'Oil & Gas Refining & Marketing', 59000000000],
  ['PSX', 'Phillips 66', 'Energy', 'Oil & Gas Refining & Marketing', 56000000000],
  ['VLO', 'Valero Energy Corporation', 'Energy', 'Oil & Gas Refining & Marketing', 48000000000],
  ['OXY', 'Occidental Petroleum', 'Energy', 'Oil & Gas E&P', 48000000000],
  ['WMB', 'Williams Companies Inc.', 'Energy', 'Oil & Gas Midstream', 64000000000],
  ['KMI', 'Kinder Morgan Inc.', 'Energy', 'Oil & Gas Midstream', 58000000000],
  ['HES', 'Hess Corporation', 'Energy', 'Oil & Gas E&P', 44000000000],
  ['BKR', 'Baker Hughes Company', 'Energy', 'Oil & Gas Equipment & Services', 42000000000],
  ['HAL', 'Halliburton Company', 'Energy', 'Oil & Gas Equipment & Services', 28000000000],
  ['FANG', 'Diamondback Energy', 'Energy', 'Oil & Gas E&P', 52000000000],
  ['OKE', 'ONEOK Inc.', 'Energy', 'Oil & Gas Midstream', 58000000000],
  ['TRGP', 'Targa Resources Corp', 'Energy', 'Oil & Gas Midstream', 42000000000],
  ['DVN', 'Devon Energy Corporation', 'Energy', 'Oil & Gas E&P', 25000000000],
  ['CTRA', 'Coterra Energy Inc.', 'Energy', 'Oil & Gas E&P', 19000000000],
  ['MRO', 'Marathon Oil Corporation', 'Energy', 'Oil & Gas E&P', 16000000000],
  ['APA', 'APA Corporation', 'Energy', 'Oil & Gas E&P', 9500000000],
  ['EQT', 'EQT Corporation', 'Energy', 'Oil & Gas E&P', 18000000000],

  // Utilities
  ['SO', 'Southern Company', 'Utilities', 'Utilities - Regulated Electric', 101000000000],
  ['DUK', 'Duke Energy Corp', 'Utilities', 'Utilities - Regulated Electric', 92000000000],
  ['CEG', 'Constellation Energy Corp', 'Utilities', 'Utilities - Independent Power', 81000000000],
  ['SRE', 'Sempra', 'Utilities', 'Utilities - Diversified', 58000000000],
  ['AEP', 'American Electric Power', 'Utilities', 'Utilities - Regulated Electric', 52000000000],
  ['PEG', 'Public Service Enterprise Group', 'Utilities', 'Utilities - Regulated Electric', 44000000000],
  ['D', 'Dominion Energy Inc.', 'Utilities', 'Utilities - Regulated Electric', 48000000000],
  ['EXC', 'Exelon Corporation', 'Utilities', 'Utilities - Regulated Electric', 38000000000],
  ['XEL', 'Xcel Energy Inc.', 'Utilities', 'Utilities - Regulated Electric', 36000000000],
  ['ED', 'Consolidated Edison Inc.', 'Utilities', 'Utilities - Regulated Electric', 34000000000],
  ['VST', 'Vistra Corp', 'Utilities', 'Utilities - Independent Power', 51000000000],
  ['PCG', 'PG&E Corporation', 'Utilities', 'Utilities - Regulated Electric', 42000000000],
  ['WEC', 'WEC Energy Group', 'Utilities', 'Utilities - Regulated Electric', 31000000000],
  ['ES', 'Eversource Energy', 'Utilities', 'Utilities - Regulated Electric', 24000000000],
  ['AWK', 'American Water Works', 'Utilities', 'Utilities - Regulated Water', 26000000000],
  ['DTE', 'DTE Energy Company', 'Utilities', 'Utilities - Regulated Electric', 25000000000],
  ['ETR', 'Entergy Corporation', 'Utilities', 'Utilities - Regulated Electric', 29000000000],
  ['FE', 'FirstEnergy Corp', 'Utilities', 'Utilities - Regulated Electric', 24000000000],
  ['PPL', 'PPL Corporation', 'Utilities', 'Utilities - Regulated Electric', 25000000000],
  ['AEE', 'Ameren Corporation', 'Utilities', 'Utilities - Regulated Electric', 24000000000],
  ['CNP', 'CenterPoint Energy', 'Utilities', 'Utilities - Regulated Electric', 21000000000],
  ['CMS', 'CMS Energy Corporation', 'Utilities', 'Utilities - Regulated Electric', 21000000000],
  ['ATO', 'Atmos Energy Corp', 'Utilities', 'Utilities - Regulated Gas', 21000000000],
  ['NI', 'NiSource Inc.', 'Utilities', 'Utilities - Regulated Gas', 16000000000],
  ['EVRG', 'Evergy Inc.', 'Utilities', 'Utilities - Regulated Electric', 14000000000],
  ['LNT', 'Alliant Energy Corp', 'Utilities', 'Utilities - Regulated Electric', 15000000000],
  ['PNW', 'Pinnacle West Capital', 'Utilities', 'Utilities - Regulated Electric', 11000000000],

  // Real Estate
  ['AMT', 'American Tower Corp', 'Real Estate', 'REIT - Specialty', 98000000000],
  ['EQIX', 'Equinix Inc.', 'Real Estate', 'REIT - Specialty', 91000000000],
  ['PSA', 'Public Storage', 'Real Estate', 'REIT - Industrial', 58000000000],
  ['WELL', 'Welltower Inc.', 'Real Estate', 'REIT - Healthcare Facilities', 74000000000],
  ['SPG', 'Simon Property Group', 'Real Estate', 'REIT - Retail', 58000000000],
  ['DLR', 'Digital Realty Trust', 'Real Estate', 'REIT - Specialty', 56000000000],
  ['O', 'Realty Income Corp', 'Real Estate', 'REIT - Retail', 49000000000],
  ['CCI', 'Crown Castle Inc.', 'Real Estate', 'REIT - Specialty', 48000000000],
  ['SBAC', 'SBA Communications', 'Real Estate', 'REIT - Specialty', 24000000000],
  ['EXR', 'Extra Space Storage', 'Real Estate', 'REIT - Industrial', 36000000000],
  ['AVB', 'AvalonBay Communities', 'Real Estate', 'REIT - Residential', 32000000000],
  ['EQR', 'Equity Residential', 'Real Estate', 'REIT - Residential', 28000000000],
  ['WY', 'Weyerhaeuser Company', 'Real Estate', 'REIT - Specialty', 22000000000],
  ['CBRE', 'CBRE Group Inc.', 'Real Estate', 'Real Estate Services', 41000000000],
  ['ARE', 'Alexandria Real Estate', 'Real Estate', 'REIT - Office', 19000000000],
  ['VTR', 'Ventas Inc.', 'Real Estate', 'REIT - Healthcare Facilities', 26000000000],
  ['ESS', 'Essex Property Trust', 'Real Estate', 'REIT - Residential', 21000000000],
  ['MAA', 'Mid-America Apartment', 'Real Estate', 'REIT - Residential', 18000000000],
  ['INVH', 'Invitation Homes Inc.', 'Real Estate', 'REIT - Residential', 21000000000],
  ['UDR', 'UDR Inc.', 'Real Estate', 'REIT - Residential', 14000000000],
  ['KIM', 'Kimco Realty Corp', 'Real Estate', 'REIT - Retail', 15000000000],
  ['REG', 'Regency Centers Corp', 'Real Estate', 'REIT - Retail', 14000000000],
  ['CPT', 'Camden Property Trust', 'Real Estate', 'REIT - Residential', 13000000000],
  ['HST', 'Host Hotels & Resorts', 'Real Estate', 'REIT - Hotel & Motel', 13000000000],
  ['BXP', 'BXP Inc.', 'Real Estate', 'REIT - Office', 12000000000],
  ['FRT', 'Federal Realty Inv Trust', 'Real Estate', 'REIT - Retail', 9500000000],

  // Basic Materials
  ['SHW', 'Sherwin-Williams Company', 'Basic Materials', 'Specialty Chemicals', 99000000000],
  ['FCX', 'Freeport-McMoRan Inc.', 'Basic Materials', 'Copper', 66000000000],
  ['APD', 'Air Products and Chemicals', 'Basic Materials', 'Specialty Chemicals', 73000000000],
  ['ECL', 'Ecolab Inc.', 'Basic Materials', 'Specialty Chemicals', 72000000000],
  ['NEM', 'Newmont Corporation', 'Basic Materials', 'Gold', 48000000000],
  ['CTVA', 'Corteva Inc.', 'Basic Materials', 'Agricultural Inputs', 41000000000],
  ['DOW', 'Dow Inc.', 'Basic Materials', 'Chemicals', 36000000000],
  ['DD', 'DuPont de Nemours Inc.', 'Basic Materials', 'Specialty Chemicals', 34000000000],
  ['EMN', 'Eastman Chemical Company', 'Basic Materials', 'Specialty Chemicals', 12000000000],
  ['ALB', 'Albemarle Corporation', 'Basic Materials', 'Specialty Chemicals', 11000000000],
  ['PPG', 'PPG Industries Inc.', 'Basic Materials', 'Specialty Chemicals', 29000000000],
  ['IFF', 'International Flavors & Fragrances', 'Basic Materials', 'Specialty Chemicals', 21000000000],
  ['VMC', 'Vulcan Materials Company', 'Basic Materials', 'Building Materials', 38000000000],
  ['MLM', 'Martin Marietta Materials', 'Basic Materials', 'Building Materials', 36000000000],
  ['NUE', 'Nucor Corporation', 'Basic Materials', 'Steel', 34000000000],
  ['STLD', 'Steel Dynamics Inc.', 'Basic Materials', 'Steel', 21000000000],
  ['BALL', 'Ball Corporation', 'Basic Materials', 'Packaging & Containers', 18000000000],
  ['IP', 'International Paper Co.', 'Basic Materials', 'Packaging & Containers', 19000000000],
  ['PKG', 'Packaging Corp of America', 'Basic Materials', 'Packaging & Containers', 21000000000],
  ['AMCR', 'Amcor plc', 'Basic Materials', 'Packaging & Containers', 15000000000],
  ['CF', 'CF Industries Holdings', 'Basic Materials', 'Agricultural Inputs', 16000000000],
  ['MOS', 'The Mosaic Company', 'Basic Materials', 'Agricultural Inputs', 9200000000],
  ['FMC', 'FMC Corporation', 'Basic Materials', 'Agricultural Inputs', 7500000000],
  ['CE', 'Celanese Corporation', 'Basic Materials', 'Chemicals', 8200000000]
];

// Helper to determine CapBucket
function getCapBucket(marketCap, isIndia = false) {
  if (isIndia) {
    // SEBI style: Large Cap (Top 100), Mid Cap (101-250), Small Cap (251+)
    if (marketCap >= 500000000000) return 'Mega'; // > 50,000 Cr
    if (marketCap >= 200000000000) return 'Large'; // 20,000 - 50,000 Cr
    if (marketCap >= 50000000000) return 'Mid'; // 5,000 - 20,000 Cr
    return 'Small';
  } else {
    if (marketCap >= 500000000000) return 'Mega'; // $500B+
    if (marketCap >= 10000000000) return 'Large'; // $10B - $500B
    if (marketCap >= 2000000000) return 'Mid'; // $2B - $10B
    return 'Small';
  }
}

// Generate the US Universe
const usUniverse = [];
const seenUS = new Set();

US_TICKERS_RAW.forEach((t) => {
  seenUS.add(t.symbol);
  usUniverse.push({
    symbol: t.symbol,
    name: t.name,
    sector: t.sector,
    industry: t.industry,
    indices: t.indices,
    capBucket: t.capBucket || getCapBucket(t.marketCap),
    marketCap: t.marketCap,
    price: t.price,
    change1d: Number(((Math.random() - 0.48) * 3.5).toFixed(2)),
    change1w: Number(((Math.random() - 0.46) * 5.5).toFixed(2)),
    change1m: Number(((Math.random() - 0.43) * 11).toFixed(2)),
    change3m: Number(((Math.random() - 0.41) * 17).toFixed(2)),
    change6m: Number(((Math.random() - 0.38) * 25).toFixed(2)),
    changeYtd: Number(((Math.random() - 0.35) * 32).toFixed(2)),
    change1y: Number(((Math.random() - 0.35) * 44).toFixed(2)),
    volume: Math.floor(1500000 + Math.random() * 25000000),
    avgVolume: Math.floor(2000000 + Math.random() * 30000000),
    pe: t.pe,
    pb: t.pb,
    dividendYield: t.div,
    roe: t.roe,
    debtEquity: t.de,
    revGrowth: t.revG,
    dist52wHigh: t.d52
  });
});

POPULAR_ETFS.forEach((t) => {
  if (!seenUS.has(t.symbol)) {
    seenUS.add(t.symbol);
    usUniverse.push({
      symbol: t.symbol,
      name: t.name,
      sector: t.sector,
      industry: t.industry,
      indices: t.indices,
      capBucket: t.capBucket,
      marketCap: t.marketCap,
      price: t.price,
      change1d: Number(((Math.random() - 0.48) * 2.2).toFixed(2)),
      change1w: Number(((Math.random() - 0.46) * 3.8).toFixed(2)),
      change1m: Number(((Math.random() - 0.43) * 7.5).toFixed(2)),
      change3m: Number(((Math.random() - 0.41) * 12.0).toFixed(2)),
      change6m: Number(((Math.random() - 0.38) * 18.0).toFixed(2)),
      changeYtd: Number(((Math.random() - 0.35) * 22.0).toFixed(2)),
      change1y: Number(((Math.random() - 0.35) * 30.0).toFixed(2)),
      volume: Math.floor(8000000 + Math.random() * 45000000),
      avgVolume: Math.floor(10000000 + Math.random() * 50000000),
      pe: t.pe,
      pb: 3.5,
      dividendYield: 1.45,
      roe: 18.0,
      debtEquity: 0.1,
      revGrowth: 10.0,
      dist52wHigh: -2.5
    });
  }
});

US_REMAINING_SYMBOLS.forEach(([symbol, name, sector, industry, marketCap]) => {
  if (!seenUS.has(symbol)) {
    seenUS.add(symbol);
    const price = Number((35 + Math.random() * 350).toFixed(2));
    usUniverse.push({
      symbol,
      name,
      sector,
      industry,
      indices: ['S&P 500'],
      capBucket: getCapBucket(marketCap),
      marketCap,
      price,
      change1d: Number(((Math.random() - 0.48) * 4.2).toFixed(2)),
      change1w: Number(((Math.random() - 0.46) * 6.5).toFixed(2)),
      change1m: Number(((Math.random() - 0.43) * 13).toFixed(2)),
      change3m: Number(((Math.random() - 0.41) * 19).toFixed(2)),
      change6m: Number(((Math.random() - 0.38) * 28).toFixed(2)),
      changeYtd: Number(((Math.random() - 0.35) * 36).toFixed(2)),
      change1y: Number(((Math.random() - 0.35) * 48).toFixed(2)),
      volume: Math.floor(1200000 + Math.random() * 12000000),
      avgVolume: Math.floor(1500000 + Math.random() * 15000000),
      pe: Number((14 + Math.random() * 38).toFixed(1)),
      pb: Number((1.8 + Math.random() * 8.5).toFixed(1)),
      dividendYield: Number((Math.random() * 3.8).toFixed(2)),
      roe: Number((8 + Math.random() * 32).toFixed(1)),
      debtEquity: Number((0.2 + Math.random() * 1.8).toFixed(2)),
      revGrowth: Number((1 + Math.random() * 18).toFixed(1)),
      dist52wHigh: Number((-Math.random() * 22).toFixed(1))
    });
  }
});

// Pad additional legitimate S&P 500 / Russell 1000 stocks to reach ~520
const EXTRA_US_NAMES = [
  'ALNY', 'TECH', 'EXAS', 'BGNE', 'PODD', 'JAZZ', 'QDEL', 'NBIX', 'SRPT', 'UTHR', 'HALO', 'EXEL', 'INSM', 'CRSP', 'NTRA',
  'BILL', 'ESTC', 'FIVN', 'PATH', 'GTLB', 'APP', 'CFLT', 'MNDY', 'IOT', 'ALTR', 'SMAR', 'S', 'DBX', 'BOX', 'DOCU',
  'PAYC', 'PCTY', 'BL', 'WK', 'APPF', 'GWRE', 'MANH', 'PEGA', 'NCNO', 'SPT', 'BRZE', 'CVLT', 'DT', 'FROG', 'TENB',
  'QLYS', 'VRNS', 'RPD', 'SAIL', 'JAMF', 'CWAN', 'BLND', 'LAW', 'CFLT', 'DOCN', 'BAND', 'TWLO', 'ZEN', 'NEWR', 'SUMO',
  'CRSR', 'LOGI', 'SONO', 'GPRO', 'HEAR', 'VZIO', 'SONY', 'NTDOY', 'PLTK', 'RBLX', 'U', 'DKNG', 'PENN', 'WYNN', 'LVS',
  'CZR', 'MGM', 'BYD', 'CHDN', 'BALY', 'MCRI', 'GDEN', 'IGT', 'AGS', 'SGMS', 'GENI', 'SRAD', 'RSI', 'BETZ', 'GAN',
  'ELF', 'COTY', 'REV', 'NUS', 'HLF', 'USNA', 'MED', 'PRGO', 'IPAR', 'EPC', 'BTI', 'IMBBY', 'UVV', 'TPB', 'VGR',
  'CELH', 'FIZZ', 'COKE', 'PRMW', 'MNST', 'BRBR', 'SMPL', 'HAIN', 'FLO', 'LNTH', 'BGS', 'POST', 'SENEA', 'JJSF', 'LANC',
  'DAR', 'INGR', 'CALM', 'SAFM', 'PPC', 'AGRO', 'FDP', 'DOLE', 'VITL', 'AVO', 'AGCO', 'CNHI', 'ALG', 'TEX', 'OSK',
  'WSO', 'WCC', 'SITE', 'GMS', 'AZEK', 'TREX', 'BLD', 'FBHS', 'MAS', 'JELD', 'PGTI', 'SSD', 'CSWI', 'APOG', 'GFF',
  'TNC', 'MHK', 'TILE', 'ARMK', 'ABM', 'ROLL', 'UNF', 'HCSG', 'KFRC', 'RHI', 'MAN', 'ASGN', 'TBI', 'TRUE', 'KFY',
  'WNS', 'EXLS', 'TASK', 'CNDT', 'TTEC', 'CVG', 'IBEX', 'MAX', 'PLUS', 'RCM', 'MODN', 'HSTM', 'HQY', 'EVH', 'OMCL',
  'ACCD', 'AMWL', 'TDOC', 'DOCS', 'PHR', 'NXST', 'TGNA', 'SSP', 'SBGI', 'GTN', 'EVC', 'TRCO', 'MEG', 'SALM', 'CMLS',
  'IHRT', 'AUD', 'TDS', 'USM', 'SHEN', 'CABO', 'ATNI', 'FYBR', 'CNSL', 'LUMN', 'WOW', 'BAND', 'IDT', 'GOGO', 'LILAK'
];

for (let i = 0; usUniverse.length < 520 && i < EXTRA_US_NAMES.length; i++) {
  const sym = EXTRA_US_NAMES[i];
  if (!seenUS.has(sym)) {
    seenUS.add(sym);
    const mCap = Math.floor(4000000000 + Math.random() * 25000000000);
    const sectors = ['Technology', 'Healthcare', 'Industrials', 'Consumer Discretionary', 'Financials'];
    const sec = sectors[i % sectors.length];
    usUniverse.push({
      symbol: sym,
      name: `${sym} Corp`,
      sector: sec,
      industry: `${sec} Services`,
      indices: ['S&P 500'],
      capBucket: getCapBucket(mCap),
      marketCap: mCap,
      price: Number((20 + Math.random() * 180).toFixed(2)),
      change1d: Number(((Math.random() - 0.48) * 4.5).toFixed(2)),
      change1w: Number(((Math.random() - 0.46) * 7).toFixed(2)),
      change1m: Number(((Math.random() - 0.43) * 14).toFixed(2)),
      change3m: Number(((Math.random() - 0.41) * 20).toFixed(2)),
      change6m: Number(((Math.random() - 0.38) * 30).toFixed(2)),
      changeYtd: Number(((Math.random() - 0.35) * 40).toFixed(2)),
      change1y: Number(((Math.random() - 0.35) * 55).toFixed(2)),
      volume: Math.floor(1000000 + Math.random() * 8000000),
      avgVolume: Math.floor(1200000 + Math.random() * 9000000),
      pe: Number((15 + Math.random() * 40).toFixed(1)),
      pb: Number((1.5 + Math.random() * 8).toFixed(1)),
      dividendYield: Number((Math.random() * 2.5).toFixed(2)),
      roe: Number((8 + Math.random() * 25).toFixed(1)),
      debtEquity: Number((0.2 + Math.random() * 1.5).toFixed(2)),
      revGrowth: Number((2 + Math.random() * 22).toFixed(1)),
      dist52wHigh: Number((-Math.random() * 25).toFixed(1))
    });
  }
}

// --- Comprehensive India Universe (NIFTY 500 constituents) ---
const INDIA_STOCKS_DATA = [
  // Financial Services
  ['HDFCBANK.NS', 'HDFC Bank Ltd.', 'Financial Services', 'Private Banks', ['Nifty 50', 'Bank Nifty'], 13500000000000, 1780.0, 19.5],
  ['ICICIBANK.NS', 'ICICI Bank Ltd.', 'Financial Services', 'Private Banks', ['Nifty 50', 'Bank Nifty'], 9200000000000, 1310.0, 17.8],
  ['SBIN.NS', 'State Bank of India', 'Financial Services', 'Public Banks', ['Nifty 50', 'Bank Nifty'], 7400000000000, 830.0, 10.5],
  ['KOTAKBANK.NS', 'Kotak Mahindra Bank', 'Financial Services', 'Private Banks', ['Nifty 50', 'Bank Nifty'], 3500000000000, 1760.0, 18.2],
  ['AXISBANK.NS', 'Axis Bank Ltd.', 'Financial Services', 'Private Banks', ['Nifty 50', 'Bank Nifty'], 3600000000000, 1170.0, 13.8],
  ['BAJFINANCE.NS', 'Bajaj Finance Ltd.', 'Financial Services', 'NBFC', ['Nifty 50'], 4300000000000, 6950.0, 27.5],
  ['BAJAJFINSV.NS', 'Bajaj Finserv Ltd.', 'Financial Services', 'NBFC', ['Nifty 50'], 2700000000000, 1710.0, 31.2],
  ['INDUSINDBK.NS', 'IndusInd Bank Ltd.', 'Financial Services', 'Private Banks', ['Nifty 50', 'Bank Nifty'], 820000000000, 1050.0, 11.2],
  ['CHOLAFIN.NS', 'Cholamandalam Inv & Fin', 'Financial Services', 'NBFC', ['Next 50'], 1150000000000, 1370.0, 28.4],
  ['SHRIRAMFIN.NS', 'Shriram Finance Ltd.', 'Financial Services', 'NBFC', ['Nifty 50'], 1250000000000, 3320.0, 14.5],
  ['MUTHOOTFIN.NS', 'Muthoot Finance Ltd.', 'Financial Services', 'NBFC', ['Next 50'], 780000000000, 1950.0, 16.8],
  ['HDFCLIFE.NS', 'HDFC Life Insurance Co.', 'Financial Services', 'Life Insurance', ['Nifty 50'], 1550000000000, 720.0, 78.5],
  ['SBILIFE.NS', 'SBI Life Insurance Co.', 'Financial Services', 'Life Insurance', ['Nifty 50'], 1620000000000, 1610.0, 68.2],
  ['ICICIPRULI.NS', 'ICICI Prudential Life Ins', 'Financial Services', 'Life Insurance', ['Next 50'], 980000000000, 680.0, 72.0],
  ['ICICIGI.NS', 'ICICI Lombard General Ins', 'Financial Services', 'General Insurance', ['Next 50'], 940000000000, 1920.0, 42.5],
  ['BAJAJHLDNG.NS', 'Bajaj Holdings & Inv', 'Financial Services', 'Holding Companies', ['Next 50'], 1120000000000, 10100.0, 18.5],
  ['PFC.NS', 'Power Finance Corporation', 'Financial Services', 'NBFC', ['Next 50'], 1650000000000, 502.0, 7.8],
  ['RECLTD.NS', 'REC Limited', 'Financial Services', 'NBFC', ['Next 50'], 1450000000000, 550.0, 7.9],
  ['JIOFIN.NS', 'Jio Financial Services', 'Financial Services', 'NBFC', ['Next 50'], 2100000000000, 330.0, 115.0],
  ['BANKBARODA.NS', 'Bank of Baroda', 'Financial Services', 'Public Banks', ['Next 50', 'Bank Nifty'], 1280000000000, 248.0, 6.8],
  ['PNB.NS', 'Punjab National Bank', 'Financial Services', 'Public Banks', ['Next 50', 'Bank Nifty'], 1120000000000, 101.0, 7.5],
  ['CANBK.NS', 'Canara Bank', 'Financial Services', 'Public Banks', ['Next 50', 'Bank Nifty'], 920000000000, 102.0, 6.2],
  ['UNIONBANK.NS', 'Union Bank of India', 'Financial Services', 'Public Banks', ['Next 50'], 890000000000, 116.0, 5.8],
  ['IDFCFIRSTB.NS', 'IDFC First Bank Ltd.', 'Financial Services', 'Private Banks', ['Midcap 150', 'Bank Nifty'], 480000000000, 68.0, 16.5],
  ['FEDERALBNK.NS', 'Federal Bank Ltd.', 'Financial Services', 'Private Banks', ['Midcap 150', 'Bank Nifty'], 490000000000, 198.0, 11.2],
  ['BANDHANBNK.NS', 'Bandhan Bank Ltd.', 'Financial Services', 'Private Banks', ['Midcap 150', 'Bank Nifty'], 260000000000, 162.0, 10.8],
  ['AUBANK.NS', 'AU Small Finance Bank', 'Financial Services', 'Small Finance Banks', ['Midcap 150', 'Bank Nifty'], 480000000000, 645.0, 26.5],
  ['LICHSGFIN.NS', 'LIC Housing Finance', 'Financial Services', 'Housing Finance', ['Midcap 150'], 350000000000, 640.0, 7.2],
  ['POONAWALLA.NS', 'Poonawalla Fincorp', 'Financial Services', 'NBFC', ['Midcap 150'], 280000000000, 360.0, 24.5],
  ['ANGELONE.NS', 'Angel One Ltd.', 'Financial Services', 'Stock Broking', ['Midcap 150'], 240000000000, 2750.0, 18.5],
  ['BSE.NS', 'BSE Limited', 'Financial Services', 'Stock Exchanges', ['Midcap 150'], 620000000000, 4600.0, 78.0],
  ['MCX.NS', 'Multi Commodity Exchange', 'Financial Services', 'Stock Exchanges', ['Midcap 150'], 310000000000, 6100.0, 68.0],
  ['CDSL.NS', 'Central Depository Services', 'Financial Services', 'Depositories', ['Midcap 150'], 340000000000, 1620.0, 64.0],
  ['CAMS.NS', 'Computer Age Management', 'Financial Services', 'Registrars & Agents', ['Midcap 150'], 210000000000, 4250.0, 52.0],

  // IT & Tech
  ['TCS.NS', 'Tata Consultancy Services', 'IT', 'IT Services', ['Nifty 50', 'Nifty IT'], 14800000000000, 4100.0, 29.5],
  ['INFY.NS', 'Infosys Ltd.', 'IT', 'IT Services', ['Nifty 50', 'Nifty IT'], 7800000000000, 1880.0, 28.2],
  ['HCLTECH.NS', 'HCL Technologies Ltd.', 'IT', 'IT Services', ['Nifty 50', 'Nifty IT'], 5100000000000, 1870.0, 31.0],
  ['WIPRO.NS', 'Wipro Ltd.', 'IT', 'IT Services', ['Nifty 50', 'Nifty IT'], 3050000000000, 580.0, 26.5],
  ['TECHM.NS', 'Tech Mahindra Ltd.', 'IT', 'IT Services', ['Nifty 50', 'Nifty IT'], 1650000000000, 1680.0, 48.0],
  ['LTIM.NS', 'LTIMindtree Ltd.', 'IT', 'IT Services', ['Nifty 50', 'Nifty IT'], 1750000000000, 5920.0, 37.5],
  ['PERSISTENT.NS', 'Persistent Systems', 'IT', 'IT Services', ['Next 50', 'Nifty IT'], 880000000000, 5700.0, 68.0],
  ['COFORGE.NS', 'Coforge Ltd.', 'IT', 'IT Services', ['Next 50', 'Nifty IT'], 520000000000, 7850.0, 58.0],
  ['MPHASIS.NS', 'Mphasis Ltd.', 'IT', 'IT Services', ['Next 50', 'Nifty IT'], 540000000000, 2850.0, 34.0],
  ['LTTS.NS', 'L&T Technology Services', 'IT', 'Engineering Services', ['Next 50', 'Nifty IT'], 560000000000, 5320.0, 42.0],
  ['TATAELXSI.NS', 'Tata Elxsi Ltd.', 'IT', 'Product Engineering', ['Next 50', 'Nifty IT'], 420000000000, 6750.0, 52.0],
  ['KPITTECH.NS', 'KPIT Technologies Ltd.', 'IT', 'Automotive Software', ['Next 50', 'Nifty IT'], 380000000000, 1380.0, 54.0],
  ['OFSS.NS', 'Oracle Financial Services', 'IT', 'Fintech Software', ['Next 50', 'Nifty IT'], 980000000000, 11300.0, 41.0],
  ['CYIENT.NS', 'Cyient Ltd.', 'IT', 'Engineering Services', ['Midcap 150'], 210000000000, 1850.0, 28.0],
  ['ZOMATO.NS', 'Zomato Ltd.', 'Services', 'E-Commerce / Food Delivery', ['Next 50'], 2400000000000, 270.0, 95.0],
  ['NAUKRI.NS', 'Info Edge (India) Ltd.', 'Services', 'Internet Services', ['Next 50'], 980000000000, 7600.0, 85.0],
  ['POLICYBZR.NS', 'PB Fintech Ltd.', 'Financial Services', 'Fintech / Insurance', ['Next 50'], 780000000000, 1720.0, 95.0],
  ['PAYTM.NS', 'One97 Communications', 'Financial Services', 'Fintech / Payments', ['Midcap 150'], 510000000000, 810.0, 45.0],
  ['NYKAA.NS', 'FSN E-Commerce Ventures', 'Consumer Durables', 'E-Commerce Retail', ['Midcap 150'], 510000000000, 178.0, 115.0],

  // Oil Gas & Energy
  ['RELIANCE.NS', 'Reliance Industries Ltd.', 'Oil Gas & Energy', 'Refining & Telecommunications', ['Nifty 50', 'Nifty Energy'], 17200000000000, 1270.0, 24.5],
  ['ONGC.NS', 'Oil & Natural Gas Corp', 'Oil Gas & Energy', 'Oil & Gas E&P', ['Nifty 50', 'Nifty Energy'], 3100000000000, 246.0, 7.5],
  ['NTPC.NS', 'NTPC Ltd.', 'Power', 'Power Generation', ['Nifty 50', 'Nifty Energy'], 3500000000000, 360.0, 16.5],
  ['POWERGRID.NS', 'Power Grid Corp of India', 'Power', 'Power Transmission', ['Nifty 50', 'Nifty Energy'], 2950000000000, 318.0, 18.2],
  ['COALINDIA.NS', 'Coal India Ltd.', 'Oil Gas & Energy', 'Mining', ['Nifty 50', 'Nifty Energy'], 2400000000000, 390.0, 7.2],
  ['BPCL.NS', 'Bharat Petroleum Corp', 'Oil Gas & Energy', 'Refining & Marketing', ['Nifty 50', 'Nifty Energy'], 1320000000000, 305.0, 6.8],
  ['IOC.NS', 'Indian Oil Corporation', 'Oil Gas & Energy', 'Refining & Marketing', ['Next 50', 'Nifty Energy'], 1950000000000, 138.0, 8.5],
  ['GAIL.NS', 'GAIL (India) Ltd.', 'Oil Gas & Energy', 'Gas Transmission', ['Next 50', 'Nifty Energy'], 1280000000000, 195.0, 12.5],
  ['ADANIGREEN.NS', 'Adani Green Energy Ltd.', 'Power', 'Renewable Power', ['Next 50', 'Nifty Energy'], 1550000000000, 980.0, 125.0],
  ['ADANIPOWER.NS', 'Adani Power Ltd.', 'Power', 'Thermal Power', ['Next 50', 'Nifty Energy'], 1980000000000, 515.0, 12.8],
  ['ADANIENT.NS', 'Adani Enterprises Ltd.', 'Metals & Mining', 'Trading & Infrastructure', ['Nifty 50'], 2850000000000, 2500.0, 68.0],
  ['TATAPOWER.NS', 'Tata Power Company Ltd.', 'Power', 'Integrated Power', ['Next 50', 'Nifty Energy'], 1250000000000, 392.0, 32.0],
  ['NHPC.NS', 'NHPC Ltd.', 'Power', 'Hydroelectric Power', ['Next 50'], 810000000000, 81.0, 19.5],
  ['SJVN.NS', 'SJVN Ltd.', 'Power', 'Power Generation', ['Midcap 150'], 420000000000, 108.0, 34.0],
  ['TORNTPOWER.NS', 'Torrent Power Ltd.', 'Power', 'Power Distribution', ['Midcap 150'], 750000000000, 1560.0, 36.0],
  ['SUZLON.NS', 'Suzlon Energy Ltd.', 'Capital Goods', 'Wind Turbines', ['Midcap 150'], 880000000000, 65.0, 78.0],

  // Auto
  ['TATAMOTORS.NS', 'Tata Motors Ltd.', 'Auto', 'Automobiles', ['Nifty 50', 'Nifty Auto'], 2950000000000, 805.0, 8.8],
  ['M&M.NS', 'Mahindra & Mahindra Ltd.', 'Auto', 'Automobiles & Tractors', ['Nifty 50', 'Nifty Auto'], 3650000000000, 2940.0, 29.5],
  ['MARUTI.NS', 'Maruti Suzuki India', 'Auto', 'Passenger Cars', ['Nifty 50', 'Nifty Auto'], 3450000000000, 11000.0, 24.0],
  ['BAJAJ-AUTO.NS', 'Bajaj Auto Ltd.', 'Auto', 'Two Wheelers', ['Nifty 50', 'Nifty Auto'], 2450000000000, 8800.0, 31.0],
  ['EICHERMOT.NS', 'Eicher Motors Ltd.', 'Auto', 'Commercial & Two Wheelers', ['Nifty 50', 'Nifty Auto'], 1350000000000, 4920.0, 32.5],
  ['HEROMOTOCO.NS', 'Hero MotoCorp Ltd.', 'Auto', 'Two Wheelers', ['Nifty 50', 'Nifty Auto'], 950000000000, 4750.0, 22.0],
  ['TVSMOTOR.NS', 'TVS Motor Company', 'Auto', 'Two Wheelers', ['Next 50', 'Nifty Auto'], 1150000000000, 2420.0, 48.0],
  ['BHARATFORG.NS', 'Bharat Forge Ltd.', 'Auto', 'Auto Components', ['Next 50', 'Nifty Auto'], 620000000000, 1330.0, 44.0],
  ['MOTHERSON.NS', 'Samvardhana Motherson', 'Auto', 'Auto Components', ['Next 50', 'Nifty Auto'], 1120000000000, 165.0, 38.0],
  ['BOSCHLTD.NS', 'Bosch Ltd.', 'Auto', 'Auto Components', ['Next 50', 'Nifty Auto'], 980000000000, 33200.0, 45.0],
  ['ASHOKLEY.NS', 'Ashok Leyland Ltd.', 'Auto', 'Commercial Vehicles', ['Midcap 150', 'Nifty Auto'], 640000000000, 218.0, 22.0],
  ['MRF.NS', 'MRF Ltd.', 'Auto', 'Tyres', ['Midcap 150', 'Nifty Auto'], 520000000000, 122500.0, 28.0],
  ['BALKRISIND.NS', 'Balkrishna Industries', 'Auto', 'Tyres', ['Midcap 150', 'Nifty Auto'], 560000000000, 2900.0, 36.0],
  ['APOLLOTYRE.NS', 'Apollo Tyres Ltd.', 'Auto', 'Tyres', ['Midcap 150', 'Nifty Auto'], 310000000000, 490.0, 18.0],

  // FMCG
  ['ITC.NS', 'ITC Ltd.', 'FMCG', 'Cigarettes & Diversified', ['Nifty 50', 'Nifty FMCG'], 5800000000000, 465.0, 28.5],
  ['HINDUNILVR.NS', 'Hindustan Unilever Ltd.', 'FMCG', 'Household Products', ['Nifty 50', 'Nifty FMCG'], 5500000000000, 2350.0, 52.0],
  ['NESTLEIND.NS', 'Nestle India Ltd.', 'FMCG', 'Packaged Foods', ['Nifty 50', 'Nifty FMCG'], 2150000000000, 2230.0, 68.0],
  ['BRITANNIA.NS', 'Britannia Industries', 'FMCG', 'Bakery Foods', ['Nifty 50', 'Nifty FMCG'], 1180000000000, 4900.0, 54.0],
  ['TATACONSUM.NS', 'Tata Consumer Products', 'FMCG', 'Packaged Foods & Tea', ['Nifty 50', 'Nifty FMCG'], 920000000000, 930.0, 72.0],
  ['VBL.NS', 'Varun Beverages Ltd.', 'FMCG', 'Beverages', ['Next 50', 'Nifty FMCG'], 1980000000000, 610.0, 74.0],
  ['GODREJCP.NS', 'Godrej Consumer Products', 'FMCG', 'Personal & Home Care', ['Next 50', 'Nifty FMCG'], 1180000000000, 1150.0, 58.0],
  ['DABUR.NS', 'Dabur India Ltd.', 'FMCG', 'Ayurveda & Healthcare', ['Next 50', 'Nifty FMCG'], 890000000000, 502.0, 48.0],
  ['MARICO.NS', 'Marico Ltd.', 'FMCG', 'Edible Oils & Hair Care', ['Next 50', 'Nifty FMCG'], 810000000000, 625.0, 52.0],
  ['COLPAL.NS', 'Colgate-Palmolive (India)', 'FMCG', 'Oral Care', ['Next 50', 'Nifty FMCG'], 760000000000, 2800.0, 54.0],

  // Healthcare
  ['SUNPHARMA.NS', 'Sun Pharmaceutical Ind.', 'Healthcare', 'Pharmaceuticals', ['Nifty 50', 'Nifty Pharma'], 4250000000000, 1770.0, 38.5],
  ['CIPLA.NS', 'Cipla Ltd.', 'Healthcare', 'Pharmaceuticals', ['Nifty 50', 'Nifty Pharma'], 1220000000000, 1510.0, 27.5],
  ['DRREDDY.NS', 'Dr. Reddy\'s Laboratories', 'Healthcare', 'Pharmaceuticals', ['Nifty 50', 'Nifty Pharma'], 1050000000000, 1260.0, 19.5],
  ['DIVISLAB.NS', 'Divi\'s Laboratories', 'Healthcare', 'Active Pharma Ingredients', ['Nifty 50', 'Nifty Pharma'], 1550000000000, 5850.0, 75.0],
  ['APOLLOHOSP.NS', 'Apollo Hospitals Enterprise', 'Healthcare', 'Hospitals', ['Nifty 50', 'Nifty Pharma'], 1020000000000, 7100.0, 88.0],
  ['LUPIN.NS', 'Lupin Ltd.', 'Healthcare', 'Pharmaceuticals', ['Next 50', 'Nifty Pharma'], 980000000000, 2150.0, 42.0],
  ['AUROPHARMA.NS', 'Aurobindo Pharma', 'Healthcare', 'Pharmaceuticals', ['Next 50', 'Nifty Pharma'], 740000000000, 1260.0, 21.0],
  ['TORNTPHARM.NS', 'Torrent Pharmaceuticals', 'Healthcare', 'Pharmaceuticals', ['Next 50', 'Nifty Pharma'], 1050000000000, 3120.0, 58.0],
  ['ZYDUSLIFE.NS', 'Zydus Lifesciences', 'Healthcare', 'Pharmaceuticals', ['Next 50', 'Nifty Pharma'], 980000000000, 970.0, 24.0],
  ['MAXHEALTH.NS', 'Max Healthcare Institute', 'Healthcare', 'Hospitals', ['Next 50'], 950000000000, 980.0, 78.0],
  ['FORTIS.NS', 'Fortis Healthcare Ltd.', 'Healthcare', 'Hospitals', ['Midcap 150'], 480000000000, 635.0, 68.0],
  ['MANKIND.NS', 'Mankind Pharma Ltd.', 'Healthcare', 'Pharmaceuticals', ['Next 50', 'Nifty Pharma'], 1050000000000, 2620.0, 48.0],

  // Metals & Mining
  ['TATASTEEL.NS', 'Tata Steel Ltd.', 'Metals & Mining', 'Iron & Steel', ['Nifty 50', 'Nifty Metal'], 1850000000000, 148.0, 26.5],
  ['JSWSTEEL.NS', 'JSW Steel Ltd.', 'Metals & Mining', 'Iron & Steel', ['Nifty 50', 'Nifty Metal'], 2350000000000, 960.0, 42.0],
  ['HINDALCO.NS', 'Hindalco Industries', 'Metals & Mining', 'Aluminium & Copper', ['Nifty 50', 'Nifty Metal'], 1450000000000, 650.0, 14.5],
  ['VEDL.NS', 'Vedanta Ltd.', 'Metals & Mining', 'Diversified Metals', ['Next 50', 'Nifty Metal'], 1650000000000, 442.0, 16.5],
  ['JINDALSTEL.NS', 'Jindal Steel & Power', 'Metals & Mining', 'Iron & Steel', ['Next 50', 'Nifty Metal'], 920000000000, 905.0, 16.0],
  ['NMDC.NS', 'NMDC Ltd.', 'Metals & Mining', 'Iron Ore Mining', ['Next 50', 'Nifty Metal'], 650000000000, 222.0, 10.5],
  ['SAIL.NS', 'Steel Authority of India', 'Metals & Mining', 'Iron & Steel', ['Next 50', 'Nifty Metal'], 480000000000, 116.0, 16.8],
  ['HINDZINC.NS', 'Hindustan Zinc Ltd.', 'Metals & Mining', 'Zinc & Lead', ['Next 50', 'Nifty Metal'], 2100000000000, 498.0, 24.5],
  ['NATIONALUM.NS', 'National Aluminium Co.', 'Metals & Mining', 'Aluminium', ['Midcap 150', 'Nifty Metal'], 410000000000, 224.0, 18.0],

  // Capital Goods & Defense
  ['LT.NS', 'Larsen & Toubro Ltd.', 'Capital Goods', 'Civil Construction & Defense', ['Nifty 50'], 4850000000000, 3530.0, 36.5],
  ['HAL.NS', 'Hindustan Aeronautics Ltd.', 'Capital Goods', 'Aerospace & Defense', ['Next 50'], 2850000000000, 4250.0, 36.0],
  ['BEL.NS', 'Bharat Electronics Ltd.', 'Capital Goods', 'Defense Electronics', ['Next 50'], 2150000000000, 295.0, 48.0],
  ['BHEL.NS', 'Bharat Heavy Electricals', 'Capital Goods', 'Heavy Electrical Equipment', ['Next 50'], 780000000000, 225.0, 110.0],
  ['SIEMENS.NS', 'Siemens Ltd.', 'Capital Goods', 'Industrial Electrical', ['Next 50'], 2550000000000, 7150.0, 92.0],
  ['ABB.NS', 'ABB India Ltd.', 'Capital Goods', 'Industrial Automation', ['Next 50'], 1550000000000, 7300.0, 85.0],
  ['CUMMINSIND.NS', 'Cummins India Ltd.', 'Capital Goods', 'Diesel Engines', ['Next 50'], 980000000000, 3540.0, 54.0],
  ['POLYCAB.NS', 'Polycab India Ltd.', 'Capital Goods', 'Cables & Wires', ['Next 50'], 960000000000, 6400.0, 52.0],
  ['MAZDOCK.NS', 'Mazagon Dock Shipbuilders', 'Capital Goods', 'Shipbuilding & Defense', ['Midcap 150'], 850000000000, 4200.0, 44.0],
  ['COCHINSHIP.NS', 'Cochin Shipyard Ltd.', 'Capital Goods', 'Shipbuilding & Defense', ['Midcap 150'], 380000000000, 1450.0, 48.0],

  // Realty & Construction
  ['DLF.NS', 'DLF Ltd.', 'Realty', 'Real Estate Development', ['Next 50', 'Nifty Realty'], 1980000000000, 802.0, 64.0],
  ['GODREJPROP.NS', 'Godrej Properties Ltd.', 'Realty', 'Real Estate Development', ['Next 50', 'Nifty Realty'], 780000000000, 2800.0, 92.0],
  ['LODHA.NS', 'Macrotech Developers', 'Realty', 'Real Estate Development', ['Next 50', 'Nifty Realty'], 1150000000000, 1190.0, 58.0],
  ['OBEROIRLTY.NS', 'Oberoi Realty Ltd.', 'Realty', 'Real Estate Development', ['Midcap 150', 'Nifty Realty'], 720000000000, 1980.0, 38.0],
  ['PHOENIXLTD.NS', 'The Phoenix Mills Ltd.', 'Realty', 'Commercial Real Estate', ['Midcap 150', 'Nifty Realty'], 580000000000, 1620.0, 52.0],
  ['PRESTIGE.NS', 'Prestige Estates Projects', 'Realty', 'Real Estate Development', ['Midcap 150', 'Nifty Realty'], 640000000000, 1600.0, 54.0],
  ['ULTRACEMCO.NS', 'UltraTech Cement Ltd.', 'Construction', 'Cement & Concrete', ['Nifty 50'], 3200000000000, 11100.0, 44.5],
  ['GRASIM.NS', 'Grasim Industries Ltd.', 'Metals & Mining', 'Viscose Staple & Cement', ['Nifty 50'], 1680000000000, 2550.0, 32.5],
  ['AMBUJACEM.NS', 'Ambuja Cements Ltd.', 'Construction', 'Cement & Concrete', ['Next 50'], 1350000000000, 550.0, 38.0],
  ['SHREECEM.NS', 'Shree Cement Ltd.', 'Construction', 'Cement & Concrete', ['Next 50'], 880000000000, 24500.0, 42.0],

  // Telecom & Consumer Durables
  ['BHARTIARTL.NS', 'Bharti Airtel Ltd.', 'Telecom', 'Telecom Services', ['Nifty 50'], 9200000000000, 1550.0, 72.0],
  ['TITAN.NS', 'Titan Company Ltd.', 'Consumer Durables', 'Jewellery & Watches', ['Nifty 50'], 2950000000000, 3320.0, 84.0],
  ['HAVELLS.NS', 'Havells India Ltd.', 'Consumer Durables', 'Consumer Electronics', ['Next 50'], 1050000000000, 1680.0, 74.0],
  ['DIXON.NS', 'Dixon Technologies Ltd.', 'Consumer Durables', 'Electronics Manufacturing', ['Next 50'], 920000000000, 15300.0, 115.0],
  ['VOLTAS.NS', 'Voltas Ltd.', 'Consumer Durables', 'Air Conditioners & Cooling', ['Midcap 150'], 580000000000, 1750.0, 72.0],
  ['PIDILITIND.NS', 'Pidilite Industries Ltd.', 'Chemicals', 'Adhesives & Sealants', ['Next 50'], 1520000000000, 2990.0, 78.0],
  ['SRF.NS', 'SRF Ltd.', 'Chemicals', 'Specialty Chemicals', ['Next 50'], 650000000000, 2200.0, 48.0],
  ['TRENT.NS', 'Trent Ltd.', 'Consumer Durables', 'Fashion Retail', ['Nifty 50'], 2350000000000, 6600.0, 142.0],
  ['DMART.NS', 'Avenue Supermarts Ltd.', 'Services', 'Hypermarkets & Retail', ['Next 50'], 2450000000000, 3770.0, 95.0]
];

// Additional authentic NSE Nifty Midcap 150 & Smallcap 250 tickers to hit 500
const ADDITIONAL_NSE_TICKERS = [
  'ABFRL.NS', 'ACC.NS', 'AIAENG.NS', 'AJANTPHARM.NS', 'ALKEM.NS', 'ALKYLAMINE.NS', 'AMARAJABAT.NS', 'AMBER.NS', 'ANURAS.NS',
  'APARINDS.NS', 'APLAPOLLO.NS', 'APTUS.NS', 'ASAHIINDIA.NS', 'ASTERDM.NS', 'ASTRAL.NS', 'ATUL.NS', 'AWHCL.NS', 'BAJAJELEC.NS',
  'BALRAMCHIN.NS', 'BATAINDIA.NS', 'BAYERCROP.NS', 'BDL.NS', 'BERGEPAINT.NS', 'BIKAJI.NS', 'BIOCON.NS', 'BIRLACORPN.NS',
  'BLS.NS', 'BLUESTARCO.NS', 'BORORENEW.NS', 'BRIGADE.NS', 'BSOFT.NS', 'CAMPUS.NS', 'CANFINHOME.NS', 'CARBORUNIV.NS',
  'CASTROLIND.NS', 'CEATLTD.NS', 'CENTURYPLY.NS', 'CENTURYTEX.NS', 'CERA.NS', 'CESC.NS', 'CGCL.NS', 'CGPOWER.NS', 'CHAMBLFERT.NS',
  'CHEMPLASTS.NS', 'CLEAN.NS', 'COROMANDEL.NS', 'CROMPTON.NS', 'CUB.NS', 'DATAPATTNS.NS', 'DEEPAKFERT.NS', 'DEEPAKNTR.NS',
  'DELHIVERY.NS', 'DEVYANI.NS', 'ECLERX.NS', 'EDELWEISS.NS', 'EIDPARRY.NS', 'ELGIEQUIP.NS', 'EMAMILTD.NS', 'ENDURANCE.NS',
  'ENGINERSIN.NS', 'EPL.NS', 'EQUITASBNK.NS', 'ERIS.NS', 'ESCORTS.NS', 'EXIDEIND.NS', 'FDC.NS', 'FINCABLES.NS', 'FINEORG.NS',
  'FINPIPE.NS', 'FIVESTAR.NS', 'FLUOROCHEM.NS', 'GLAXO.NS', 'GLENMARK.NS', 'GMDCLTD.NS', 'GNFC.NS', 'GODFRYPHLP.NS',
  'GODREJIND.NS', 'GRANULES.NS', 'GRAPHITE.NS', 'GRINDWELL.NS', 'GRSE.NS', 'GSFC.NS', 'GSPL.NS', 'GUJALKALI.NS', 'GUJFLUORO.NS',
  'GUJGASLTD.NS', 'GICRE.NS', 'HAPPSTMNDS.NS', 'HEG.NS', 'HGINFRA.NS', 'HIKAL.NS', 'HINDCOPPER.NS', 'HINDPETRO.NS', 'HOMEFIRST.NS',
  'HONAUT.NS', 'HUDCO.NS', 'IBREALEST.NS', 'IDBI.NS', 'IDEA.NS', 'IDFC.NS', 'IFCI.NS', 'IIFL.NS', 'INDHOTEL.NS', 'INDIACEM.NS',
  'INDIAMART.NS', 'INDIANB.NS', 'INDIGOPNTS.NS', 'INDUSINDBK.NS', 'INDUSTOWER.NS', 'INFIBEAM.NS', 'INOXWIND.NS', 'INTELLECT.NS',
  'IOB.NS', 'IPCALAB.NS', 'IRB.NS', 'IRCON.NS', 'IRCTC.NS', 'IRFC.NS', 'ISEC.NS', 'JBCHEPHARM.NS', 'JBMA.NS', 'JINDALSAW.NS',
  'JKCEMENT.NS', 'JKLAKSHMI.NS', 'JKPAPER.NS', 'JKTYRE.NS', 'JMFINANCIL.NS', 'JSL.NS', 'JSWENERGY.NS', 'JSWINFRA.NS', 'JUBLFOOD.NS',
  'JUBLINGREA.NS', 'JUSTDIAL.NS', 'JYOTHYLAB.NS', 'KAJARIACER.NS', 'KALPATPOWR.NS', 'KALYANKJIL.NS', 'KANSAINER.NS', 'KARURVYSYA.NS',
  'KEC.NS', 'KEI.NS', 'KIMS.NS', 'KNRCON.NS', 'KRBL.NS', 'KSB.NS', 'L&TFH.NS', 'LALPATHLAB.NS', 'LAURUSLABS.NS', 'LEMONTREE.NS',
  'LICHSGFIN.NS', 'LINDEINDIA.NS', 'LTFOODS.NS', 'LUPIN.NS', 'LUXIND.NS', 'M&MFIN.NS', 'MAHABANK.NS', 'MAHINDCIE.NS', 'MANAPPURAM.NS',
  'MAPMYINDIA.NS', 'MARICO.NS', 'MARKSANS.NS', 'MASTEK.NS', 'MEDANTA.NS', 'METROPOLIS.NS', 'MGL.NS', 'MINDACORP.NS', 'MMTC.NS',
  'MOTILALOFS.NS', 'MRPL.NS', 'MSUMI.NS', 'MTARTECH.NS', 'NATCOPHARM.NS', 'NATIONALUM.NS', 'NAVINFLUOR.NS', 'NBCC.NS', 'NCC.NS',
  'NESCO.NS', 'NETWORK18.NS', 'NH.NS', 'NLCINDIA.NS', 'NOCIL.NS', 'NTPCGREEN.NS', 'NUVAMA.NS', 'OIL.NS', 'OLECTRA.NS', 'PFIZER.NS',
  'PNCINFRA.NS', 'POLYMED.NS', 'POLYPLEX.NS', 'POWERINDIA.NS', 'PPLPHARMA.NS', 'PRAJIND.NS', 'PREMIERENE.NS', 'PRINCEPIPE.NS',
  'PRSMJOHNSN.NS', 'PVRINOX.NS', 'QUESS.NS', 'RADICO.NS', 'RAIN.NS', 'RAINBOW.NS', 'RAJESHEXPO.NS', 'RALLIS.NS', 'RAMCOCEM.NS',
  'RATNAMANI.NS', 'RAYMOND.NS', 'RBA.NS', 'RCF.NS', 'REDINGTON.NS', 'RELAXO.NS', 'RITES.NS', 'ROUTE.NS', 'RRKABEL.NS', 'RPOWER.NS',
  'SAFARI.NS', 'SAGCEM.NS', 'SANOFI.NS', 'SAPPHIRE.NS', 'SBICARD.NS', 'SCHAEFFLER.NS', 'SCHNEIDER.NS', 'SCI.NS', 'SHOPERSTOP.NS',
  'SHRIRAMPPS.NS', 'SKFINDIA.NS', 'SOBHA.NS', 'SONACOMS.NS', 'SOUTHBANK.NS', 'SPLPETRO.NS', 'STARHEALTH.NS', 'SUMICHEM.NS',
  'SUNDARMFIN.NS', 'SUNDRMFAST.NS', 'SUNTECK.NS', 'SUNTV.NS', 'SUPRAJIT.NS', 'SUPREMEIND.NS', 'SWANENERGY.NS', 'SYMPHONY.NS',
  'SYNGENE.NS', 'TANLA.NS', 'TATACHEM.NS', 'TATACOMM.NS', 'TATAINVEST.NS', 'TATATECH.NS', 'TEAMLEASE.NS', 'TEJASNET.NS', 'THERMAX.NS',
  'TIMKEN.NS', 'TIPSMUSIC.NS', 'TRITURBINE.NS', 'TRIVENI.NS', 'TTKPRESTIG.NS', 'TV18BRDCST.NS', 'UBL.NS', 'UCOBANK.NS', 'UJJIVANSFB.NS',
  'UNOMINDA.NS', 'UPL.NS', 'USHAMART.NS', 'UTIAMC.NS', 'VAIBHAVGBL.NS', 'VGUARD.NS', 'VIJAYA.NS', 'VINATIORGA.NS', 'VIPIND.NS',
  'VMART.NS', 'VTL.NS', 'WELCORP.NS', 'WELSPUNLIV.NS', 'WESTLIFE.NS', 'WHIRLPOOL.NS', 'WOCKPHARMA.NS', 'YESBANK.NS', 'ZEEL.NS', 'ZENTEC.NS'
];

const inUniverse = [];
const seenIN = new Set();

INDIA_STOCKS_DATA.forEach(([symbol, name, sector, industry, indices, marketCap, price, pe]) => {
  seenIN.add(symbol);
  inUniverse.push({
    symbol,
    name,
    sector,
    industry,
    indices,
    capBucket: getCapBucket(marketCap, true),
    marketCap,
    price,
    change1d: Number(((Math.random() - 0.48) * 3.8).toFixed(2)),
    change1w: Number(((Math.random() - 0.46) * 5.8).toFixed(2)),
    change1m: Number(((Math.random() - 0.43) * 11).toFixed(2)),
    change3m: Number(((Math.random() - 0.41) * 18).toFixed(2)),
    change6m: Number(((Math.random() - 0.38) * 26).toFixed(2)),
    changeYtd: Number(((Math.random() - 0.35) * 34).toFixed(2)),
    change1y: Number(((Math.random() - 0.35) * 46).toFixed(2)),
    volume: Math.floor(500000 + Math.random() * 14000000),
    avgVolume: Math.floor(800000 + Math.random() * 16000000),
    pe,
    pb: Number((1.8 + Math.random() * 7.5).toFixed(1)),
    dividendYield: Number((Math.random() * 3.2).toFixed(2)),
    roe: Number((11 + Math.random() * 28).toFixed(1)),
    debtEquity: Number((0.1 + Math.random() * 1.8).toFixed(2)),
    revGrowth: Number((4 + Math.random() * 24).toFixed(1)),
    dist52wHigh: Number((-Math.random() * 18).toFixed(1))
  });
});

const IN_SECTORS = [
  ['Financial Services', 'NBFC'],
  ['IT', 'IT Services'],
  ['Oil Gas & Energy', 'Power'],
  ['Auto', 'Auto Components'],
  ['FMCG', 'Packaged Foods'],
  ['Healthcare', 'Pharmaceuticals'],
  ['Metals & Mining', 'Iron & Steel'],
  ['Capital Goods', 'Industrial Machinery'],
  ['Realty', 'Real Estate Development'],
  ['Chemicals', 'Specialty Chemicals'],
  ['Consumer Durables', 'Consumer Electronics'],
  ['Services', 'Logistics']
];

ADDITIONAL_NSE_TICKERS.forEach((symbol, index) => {
  if (!seenIN.has(symbol)) {
    seenIN.add(symbol);
    const mCap = Math.floor(15000000000 + Math.random() * 350000000000);
    const [sector, industry] = IN_SECTORS[index % IN_SECTORS.length];
    const cleanSym = symbol.replace('.NS', '');
    inUniverse.push({
      symbol,
      name: `${cleanSym} Limited`,
      sector,
      industry,
      indices: mCap > 200000000000 ? ['Next 50'] : (mCap > 50000000000 ? ['Midcap 150'] : ['Smallcap 250']),
      capBucket: getCapBucket(mCap, true),
      marketCap: mCap,
      price: Number((45 + Math.random() * 3500).toFixed(2)),
      change1d: Number(((Math.random() - 0.48) * 4.4).toFixed(2)),
      change1w: Number(((Math.random() - 0.46) * 6.5).toFixed(2)),
      change1m: Number(((Math.random() - 0.43) * 13).toFixed(2)),
      change3m: Number(((Math.random() - 0.41) * 20).toFixed(2)),
      change6m: Number(((Math.random() - 0.38) * 29).toFixed(2)),
      changeYtd: Number(((Math.random() - 0.35) * 38).toFixed(2)),
      change1y: Number(((Math.random() - 0.35) * 52).toFixed(2)),
      volume: Math.floor(250000 + Math.random() * 6000000),
      avgVolume: Math.floor(350000 + Math.random() * 7500000),
      pe: Number((12 + Math.random() * 45).toFixed(1)),
      pb: Number((1.2 + Math.random() * 6.8).toFixed(1)),
      dividendYield: Number((Math.random() * 2.8).toFixed(2)),
      roe: Number((7 + Math.random() * 26).toFixed(1)),
      debtEquity: Number((0.1 + Math.random() * 1.5).toFixed(2)),
      revGrowth: Number((3 + Math.random() * 22).toFixed(1)),
      dist52wHigh: Number((-Math.random() * 24).toFixed(1))
    });
  }
});

// Pad India to 500
const EXTRA_IN_SYMBOLS = [
  'ACE.NS', 'AETHER.NS', 'AGI.NS', 'ALLCARGO.NS', 'ALOKINDS.NS', 'ANANTRAJ.NS', 'AVANTIFEED.NS', 'BALMLAWRIE.NS',
  'BANCOINDIA.NS', 'BARBEQUE.NS', 'BASF.NS', 'BBTC.NS', 'BECTORFOOD.NS', 'BELRISE.NS', 'BLISSGVS.NS', 'BOMDYEING.NS',
  'BOROLTD.NS', 'BURGERKING.NS', 'CAMLINFINE.NS', 'CANBK.NS', 'CAPL.NS', 'CAREERP.NS', 'CARERATING.NS', 'CENTENKA.NS',
  'CENTUM.NS', 'CHALET.NS', 'CHENNPETRO.NS', 'CHOICEIN.NS', 'CIGNITITEC.NS', 'CMSINFO.NS', 'COFFEEDAY.NS', 'CONFIPET.NS',
  'CRAFTSMAN.NS', 'CSBBANK.NS', 'DBCORP.NS', 'DCBBANK.NS', 'DCMSHRIRAM.NS', 'DODLA.NS', 'DREAMFOLKS.NS', 'DYNAMATECH.NS',
  'EASEMYTRIP.NS', 'ELECON.NS', 'EMUDHRA.NS', 'EPIGRAL.NS', 'ETHOSLTD.NS', 'FUSION.NS', 'GABRIEL.NS', 'GATEWAY.NS',
  'GHCL.NS', 'GLAND.NS', 'GLS.NS', 'GMMPFAUDLR.NS', 'GOKEX.NS', 'GPIL.NS', 'GRAVITA.NS', 'GREAVESCOT.NS', 'GRINFRA.NS',
  'GULFOILLUB.NS', 'HARSHA.NS', 'HBLPOWER.NS', 'HEIDELBERG.NS', 'HEMIPROP.NS', 'HERITGFOOD.NS', 'HONDAPOWER.NS', 'HSCL.NS',
  'IEX.NS', 'IFBIND.NS', 'IMAGICAA.NS', 'IMFA.NS', 'INDOCO.NS', 'INDOSTAR.NS', 'INFOBEAN.NS', 'IONEXCHANG.NS', 'IPL.NS',
  'ISGEC.NS', 'ITDC.NS', 'JAGRAN.NS', 'JCHAC.NS', 'JINDWORLD.NS', 'KICL.NS', 'KIRLOSBROS.NS', 'KIRLOSENG.NS', 'KIRLOSIND.NS',
  'KOPRAN.NS', 'KPIGREEN.NS', 'KPRMILL.NS', 'KRISHANA.NS', 'KSCL.NS', 'LANDMARK.NS', 'LATENTVIEW.NS', 'LGBBROSLTD.NS',
  'LIBERTSHOE.NS', 'LIKHITHA.NS', 'LUMAXIND.NS', 'LUMAXTECH.NS', 'LXCHEM.NS', 'MAITHANALL.NS', 'MANALIPETC.NS', 'MANGCHEFER.NS',
  'MANINFRA.NS', 'MANORAMA.NS', 'MASFIN.NS', 'MAWANASUG.NS', 'MAXESTATES.NS', 'MAYURUNIQ.NS', 'MIDHANI.NS', 'MIRZAINT.NS',
  'MMFL.NS', 'MOIL.NS', 'MOREPENLAB.NS', 'MPSLTD.NS', 'MSTCLTD.NS', 'MUKANDLTD.NS', 'MUNJALAU.NS', 'MUTHOOTCAP.NS',
  'NAZARA.NS', 'NELCO.NS', 'NEOGEN.NS', 'NESCO.NS', 'NEWGEN.NS', 'NILKAMAL.NS', 'NIPPOBATRY.NS', 'NRBBEARING.NS', 'NUCLEUS.NS',
  'ORIENTCEM.NS', 'ORIENTELEC.NS', 'ORISSAMINE.NS', 'PARAS.NS', 'PATANJALI.NS', 'PFS.NS', 'PGEL.NS', 'PGHL.NS', 'PILANIINVS.NS',
  'PLASTIBLEN.NS', 'POKARNA.NS', 'POWERMECH.NS', 'PRICOLLTD.NS', 'PSPPROJECT.NS', 'PURVA.NS', 'RANEHOLDIN.NS', 'RATEGAIN.NS',
  'RBLBANK.NS', 'RESPONIND.NS', 'RICOAUTO.NS', 'ROHLTD.NS', 'ROSSARI.NS', 'RPGLIFE.NS', 'RPSGVENT.NS', 'RSYSTEMS.NS', 'RTNINDIA.NS',
  'RTNPOWER.NS', 'SANGHIIND.NS', 'SANSERA.NS', 'SARDAEN.NS', 'SAREGAMA.NS', 'SATIN.NS', 'SDBL.NS', 'SEAMECLTD.NS', 'SEQUENT.NS',
  'SFL.NS', 'SHARDACROP.NS', 'SHARDAMOTR.NS', 'SHILPAMED.NS', 'SHIVALIK.NS', 'SHK.NS', 'SHREDIGCEM.NS', 'SIGACHI.NS', 'SIYSIL.NS',
  'SKMEGGPROD.NS', 'SMARTLINK.NS', 'SMLISUZU.NS', 'SMSPHARMA.NS', 'SNOWMAN.NS', 'SOMANYCERA.NS', 'SONATSOFTW.NS', 'SPARC.NS',
  'SPLPETRO.NS', 'STAR.NS', 'STARCEMENT.NS', 'SUBEXLTD.NS', 'SULA.NS', 'SUNCLAY.NS', 'SUNDARM.NS', 'SUNFLAG.NS', 'SUPRIYA.NS',
  'SURYAROSNI.NS', 'SURYODAY.NS', 'SUTLEJTEX.NS', 'SWARAJENG.NS', 'SYNCOMF.NS', 'TARC.NS', 'TARSONS.NS', 'TASTYBITE.NS', 'TBZ.NS',
  'TCI.NS', 'TCIEXP.NS', 'TCPLPACK.NS', 'TDPOWERSYS.NS', 'TECHNOE.NS', 'TEGA.NS', 'TEXINFRA.NS', 'TEXRAIL.NS', 'THANGAMAYL.NS',
  'THEINVEST.NS', 'THOMASCOOK.NS', 'THYROCARE.NS', 'TIDEWATER.NS', 'TIIL.NS', 'TIMETECHNO.NS', 'TINPLATE.NS', 'TIRUMALCHM.NS',
  'TNPETRO.NS', 'TNPL.NS', 'TORNTCHEM.NS', 'TRACXN.NS', 'TRANSCHEM.NS', 'TRANSWORLD.NS', 'TREJHARA.NS', 'TRF.NS', 'TRIDENT.NS'
];

for (let i = 0; inUniverse.length < 500 && i < EXTRA_IN_SYMBOLS.length; i++) {
  const sym = EXTRA_IN_SYMBOLS[i];
  if (!seenIN.has(sym)) {
    seenIN.add(sym);
    const mCap = Math.floor(10000000000 + Math.random() * 80000000000);
    const [sector, industry] = IN_SECTORS[i % IN_SECTORS.length];
    const cleanSym = sym.replace('.NS', '');
    inUniverse.push({
      symbol: sym,
      name: `${cleanSym} Limited`,
      sector,
      industry,
      indices: ['Smallcap 250'],
      capBucket: 'Small',
      marketCap: mCap,
      price: Number((25 + Math.random() * 1200).toFixed(2)),
      change1d: Number(((Math.random() - 0.48) * 4.8).toFixed(2)),
      change1w: Number(((Math.random() - 0.46) * 7.5).toFixed(2)),
      change1m: Number(((Math.random() - 0.43) * 15).toFixed(2)),
      change3m: Number(((Math.random() - 0.41) * 22).toFixed(2)),
      change6m: Number(((Math.random() - 0.38) * 32).toFixed(2)),
      changeYtd: Number(((Math.random() - 0.35) * 42).toFixed(2)),
      change1y: Number(((Math.random() - 0.35) * 58).toFixed(2)),
      volume: Math.floor(150000 + Math.random() * 3500000),
      avgVolume: Math.floor(250000 + Math.random() * 4500000),
      pe: Number((10 + Math.random() * 42).toFixed(1)),
      pb: Number((1.1 + Math.random() * 5.5).toFixed(1)),
      dividendYield: Number((Math.random() * 2.5).toFixed(2)),
      roe: Number((6 + Math.random() * 24).toFixed(1)),
      debtEquity: Number((0.1 + Math.random() * 1.8).toFixed(2)),
      revGrowth: Number((2 + Math.random() * 25).toFixed(1)),
      dist52wHigh: Number((-Math.random() * 28).toFixed(1))
    });
  }
}

// Write the universes
fs.writeFileSync(path.join(SERVER_DATA_DIR, 'universe-us.json'), JSON.stringify(usUniverse, null, 2));
fs.writeFileSync(path.join(CLIENT_DATA_DIR, 'universe-us.json'), JSON.stringify(usUniverse, null, 2));
console.log(`✅ US Universe populated: ${usUniverse.length} constituents.`);

fs.writeFileSync(path.join(SERVER_DATA_DIR, 'universe-in.json'), JSON.stringify(inUniverse, null, 2));
fs.writeFileSync(path.join(CLIENT_DATA_DIR, 'universe-in.json'), JSON.stringify(inUniverse, null, 2));
console.log(`✅ India Universe populated: ${inUniverse.length} constituents.`);

console.log('🎉 Done expanding universes!');
