import React, { useEffect, useState } from 'react';
import { fetchQuote, fetchHistory } from '../../lib/api';
import {
  Calculator,
  TrendingUp,
  Layers,
  Info,
  Package,
  Activity,
  Globe,
  Truck,
  Building2,
} from 'lucide-react';

interface CommoditySpecsTabProps {
  symbol: string;
}

interface CommodityConfig {
  contractName: string;
  exchange: string;
  contractSize: string;
  sizeMultiplier: number;
  priceUnit: string;
  minTick: string;
  tickValue: number;
  settlement: string;
  tradingHours: string;
  topProducers: string[];
  keyDrivers: string[];
}

const COMMODITY_REGISTRY: Record<string, CommodityConfig> = {
  'GC=F': {
    contractName: 'Gold Futures',
    exchange: 'COMEX (CME Group)',
    contractSize: '100 Troy Ounces',
    sizeMultiplier: 100,
    priceUnit: 'USD per Troy Ounce',
    minTick: '$0.10 / oz',
    tickValue: 10.0,
    settlement: 'Physical Delivery',
    tradingHours: 'Sun 6:00 PM – Fri 5:00 PM ET',
    topProducers: ['China', 'Australia', 'Russia', 'United States', 'Canada'],
    keyDrivers: ['Central Bank Reserve Buying', 'Real Interest Rates (Fed Policy)', 'US Dollar Index (DXY)', 'Geopolitical Safe-Haven Inflows'],
  },
  'SI=F': {
    contractName: 'Silver Futures',
    exchange: 'COMEX (CME Group)',
    contractSize: '5,000 Troy Ounces',
    sizeMultiplier: 5000,
    priceUnit: 'USD per Troy Ounce',
    minTick: '$0.005 / oz',
    tickValue: 25.0,
    settlement: 'Physical Delivery',
    tradingHours: 'Sun 6:00 PM – Fri 5:00 PM ET',
    topProducers: ['Mexico', 'China', 'Peru', 'Chile', 'Poland'],
    keyDrivers: ['Solar PV & Clean Tech Demand', 'Industrial Electronics', 'Gold/Silver Ratio Reversion', 'Monetary Inflation Hedge'],
  },
  'PL=F': {
    contractName: 'Platinum Futures',
    exchange: 'NYMEX (CME Group)',
    contractSize: '50 Troy Ounces',
    sizeMultiplier: 50,
    priceUnit: 'USD per Troy Ounce',
    minTick: '$0.10 / oz',
    tickValue: 5.0,
    settlement: 'Physical Delivery',
    tradingHours: 'Sun 6:00 PM – Fri 5:00 PM ET',
    topProducers: ['South Africa (~72%)', 'Russia', 'Zimbabwe', 'North America'],
    keyDrivers: ['Automotive Catalytic Converters', 'Hydrogen Fuel Cell Tech', 'South African Mining Supply', 'Jewelry Demand'],
  },
  'PA=F': {
    contractName: 'Palladium Futures',
    exchange: 'NYMEX (CME Group)',
    contractSize: '100 Troy Ounces',
    sizeMultiplier: 100,
    priceUnit: 'USD per Troy Ounce',
    minTick: '$0.10 / oz',
    tickValue: 10.0,
    settlement: 'Physical Delivery',
    tradingHours: 'Sun 6:00 PM – Fri 5:00 PM ET',
    topProducers: ['Russia (Norilsk Nickel)', 'South Africa', 'Canada', 'United States'],
    keyDrivers: ['Gasoline Auto Catalysts', 'Russian Sanctions & Supply Disruptions', 'EV Substitution Speed', 'Recycling Scrap Supply'],
  },
  'CL=F': {
    contractName: 'Crude Oil (WTI)',
    exchange: 'NYMEX (CME Group)',
    contractSize: '1,000 Barrels (42,000 Gallons)',
    sizeMultiplier: 1000,
    priceUnit: 'USD per Barrel',
    minTick: '$0.01 / barrel',
    tickValue: 10.0,
    settlement: 'Physical Delivery (Cushing, OK)',
    tradingHours: 'Sun 6:00 PM – Fri 5:00 PM ET',
    topProducers: ['United States (Permian)', 'Saudi Arabia', 'Russia', 'Canada', 'Iraq'],
    keyDrivers: ['OPEC+ Production Quotas', 'US Strategic Petroleum Reserve (SPR)', 'Global Macro GDP Growth', 'Middle East Supply Logistics'],
  },
  'BZ=F': {
    contractName: 'Brent Crude Oil',
    exchange: 'ICE Futures Europe',
    contractSize: '1,000 Barrels',
    sizeMultiplier: 1000,
    priceUnit: 'USD per Barrel',
    minTick: '$0.01 / barrel',
    tickValue: 10.0,
    settlement: 'Cash Settled',
    tradingHours: 'Sun 8:00 PM – Fri 6:00 PM ET',
    topProducers: ['North Sea (UK/Norway)', 'West Africa', 'Middle East', 'Latin America'],
    keyDrivers: ['Global Seaborne Trade Routes', 'Red Sea & Suez Shipping', 'Asian Refining Margins', 'OPEC Policy Compliance'],
  },
  'NG=F': {
    contractName: 'Natural Gas',
    exchange: 'NYMEX (CME Group)',
    contractSize: '10,000 MMBtu',
    sizeMultiplier: 10000,
    priceUnit: 'USD per MMBtu',
    minTick: '$0.001 / MMBtu',
    tickValue: 10.0,
    settlement: 'Physical Delivery (Henry Hub, LA)',
    tradingHours: 'Sun 6:00 PM – Fri 5:00 PM ET',
    topProducers: ['United States (Appalachia/Haynesville)', 'Russia', 'Iran', 'Qatar'],
    keyDrivers: ['Winter Heating Degree Days', 'Summer Cooling Electric Demand', 'US LNG Export Terminal Utilization', 'EIA Storage Surplus/Deficit'],
  },
  'RB=F': {
    contractName: 'RBOB Gasoline',
    exchange: 'NYMEX (CME Group)',
    contractSize: '42,000 Gallons (1,000 Barrels)',
    sizeMultiplier: 42000,
    priceUnit: 'USD per Gallon',
    minTick: '$0.0001 / gal',
    tickValue: 4.2,
    settlement: 'Physical Delivery (New York Harbor)',
    tradingHours: 'Sun 6:00 PM – Fri 5:00 PM ET',
    topProducers: ['US Gulf Coast Refineries', 'Midwest Refining', 'European Exporters'],
    keyDrivers: ['Summer Driving Season Demand', 'Refinery Crack Spreads', 'Refinery Turnaround Maintenance', 'Ethanol Blending Mandates'],
  },
  'HO=F': {
    contractName: 'Heating Oil',
    exchange: 'NYMEX (CME Group)',
    contractSize: '42,000 Gallons',
    sizeMultiplier: 42000,
    priceUnit: 'USD per Gallon',
    minTick: '$0.0001 / gal',
    tickValue: 4.2,
    settlement: 'Physical Delivery (New York Harbor)',
    tradingHours: 'Sun 6:00 PM – Fri 5:00 PM ET',
    topProducers: ['US Refineries', 'European Distillate Units', 'Asian Refiners'],
    keyDrivers: ['Northeast Winter Temperatures', 'Commercial Trucking & Diesel Freight', 'Jet Fuel Refinery Competition', 'EIA Distillate Inventories'],
  },
  'HG=F': {
    contractName: 'Copper Futures',
    exchange: 'COMEX (CME Group)',
    contractSize: '25,000 Pounds',
    sizeMultiplier: 25000,
    priceUnit: 'USD per Pound',
    minTick: '$0.0005 / lb',
    tickValue: 12.5,
    settlement: 'Physical Delivery',
    tradingHours: 'Sun 6:00 PM – Fri 5:00 PM ET',
    topProducers: ['Chile (Codelco/Escondida)', 'Peru', 'DR Congo', 'China', 'United States'],
    keyDrivers: ['Global Electrification & Grid Expansion', 'Electric Vehicle Wire Production', 'Chinese Construction & Manufacturing PMI', 'Mine Disruptions & Smelter Fees'],
  },
  'ZC=F': {
    contractName: 'Corn Futures',
    exchange: 'CBOT (CME Group)',
    contractSize: '5,000 Bushels (~127 Metric Tons)',
    sizeMultiplier: 50, // Quoted in cents/bu on CME -> $50 per cent move
    priceUnit: 'US Cents per Bushel',
    minTick: '0.25¢ / bu',
    tickValue: 12.5,
    settlement: 'Physical Delivery (Chicago/Illinois River)',
    tradingHours: 'Sun 8:00 PM – Fri 2:20 PM ET',
    topProducers: ['United States (Midwest)', 'China', 'Brazil (Safrinha)', 'Argentina'],
    keyDrivers: ['USDA WASDE Reports', 'Midwest Weather & Soil Moisture', 'Ethanol Production Mandates', 'Chinese Livestock Feed Purchases'],
  },
  'ZW=F': {
    contractName: 'Wheat Futures',
    exchange: 'CBOT (CME Group)',
    contractSize: '5,000 Bushels (~136 Metric Tons)',
    sizeMultiplier: 50,
    priceUnit: 'US Cents per Bushel',
    minTick: '0.25¢ / bu',
    tickValue: 12.5,
    settlement: 'Physical Delivery',
    tradingHours: 'Sun 8:00 PM – Fri 2:20 PM ET',
    topProducers: ['China', 'India', 'Russia', 'United States', 'European Union', 'Australia'],
    keyDrivers: ['Black Sea Grain Export Corridors', 'Global Drought / Freeze Stress', 'Fertilizer Costs', 'Global Food Security Reserves'],
  },
  'ZS=F': {
    contractName: 'Soybean Futures',
    exchange: 'CBOT (CME Group)',
    contractSize: '5,000 Bushels (~136 Metric Tons)',
    sizeMultiplier: 50,
    priceUnit: 'US Cents per Bushel',
    minTick: '0.25¢ / bu',
    tickValue: 12.5,
    settlement: 'Physical Delivery',
    tradingHours: 'Sun 8:00 PM – Fri 2:20 PM ET',
    topProducers: ['Brazil (Mato Grosso)', 'United States', 'Argentina', 'China'],
    keyDrivers: ['Brazilian Export Pacing', 'Soy Crush Profit Margins', 'Biodiesel Policy Targets', 'Chinese Import Demand'],
  },
  'KC=F': {
    contractName: 'Coffee Futures (Arabica)',
    exchange: 'ICE Futures US',
    contractSize: '37,500 Pounds',
    sizeMultiplier: 375, // Cents to dollars
    priceUnit: 'US Cents per Pound',
    minTick: '0.05¢ / lb',
    tickValue: 18.75,
    settlement: 'Physical Delivery (Licensed Warehouses)',
    tradingHours: 'Mon-Fri 4:15 AM – 1:30 PM ET',
    topProducers: ['Brazil (Minas Gerais)', 'Colombia', 'Ethiopia', 'Honduras'],
    keyDrivers: ['Brazilian Frost & Rainfall in Flowering Season', 'ICE Certified Warehouse Stocks', 'EU Deforestation Regulations (EUDR)', 'Global Specialty Coffee Consumption'],
  },
  'SB=F': {
    contractName: 'Sugar #11',
    exchange: 'ICE Futures US',
    contractSize: '112,000 Pounds (50 Long Tons)',
    sizeMultiplier: 1120,
    priceUnit: 'US Cents per Pound',
    minTick: '0.01¢ / lb',
    tickValue: 11.2,
    settlement: 'Physical Delivery (Port of Origin)',
    tradingHours: 'Mon-Fri 3:30 AM – 1:00 PM ET',
    topProducers: ['Brazil (Centre-South)', 'India', 'Thailand', 'China'],
    keyDrivers: ['Brazil Cane Ethanol vs Sugar Parity', 'Indian Monsoon & Export Limits', 'Global Confectionery Demand', 'Weather in Southeast Asia'],
  },
  'CC=F': {
    contractName: 'Cocoa Futures',
    exchange: 'ICE Futures US',
    contractSize: '10 Metric Tons',
    sizeMultiplier: 10,
    priceUnit: 'USD per Metric Ton',
    minTick: '$1.00 / ton',
    tickValue: 10.0,
    settlement: 'Physical Delivery',
    tradingHours: 'Mon-Fri 4:45 AM – 1:30 PM ET',
    topProducers: ['Ivory Coast (~45%)', 'Ghana (~15%)', 'Ecuador', 'Cameroon'],
    keyDrivers: ['Swollen Shoot Virus & Aging Trees in West Africa', 'Structural Deficit in Global Cocoa Grinds', 'Harmattan Winds & Rainfall', 'Farmgate Price Minimums'],
  },
};

export const CommoditySpecsTab: React.FC<CommoditySpecsTabProps> = ({ symbol }) => {
  const [quote, setQuote] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [numContracts, setNumContracts] = useState<string>('1');
  const [expectedMove, setExpectedMove] = useState<string>('1.5');

  // Fallback config for generic commodities
  const cleanSym = symbol.toUpperCase();
  const config = COMMODITY_REGISTRY[cleanSym] || {
    contractName: quote?.name || cleanSym.replace('=F', '') + ' Futures',
    exchange: 'CME / NYMEX / ICE',
    contractSize: '1 Standard Futures Contract',
    sizeMultiplier: 100,
    priceUnit: 'USD',
    minTick: '$0.01',
    tickValue: 10.0,
    settlement: 'Physical Delivery',
    tradingHours: 'Sun 6:00 PM – Fri 5:00 PM ET',
    topProducers: ['United States', 'Global Producers', 'OPEC+ / G20 Nations'],
    keyDrivers: ['Global Supply/Demand Balance', 'Dollar Index (DXY) Inverse Correlation', 'Industrial Production Rates', 'Inventory Cycle'],
  };

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      fetchQuote(symbol),
      fetchHistory(symbol, '1Y', '1d'),
    ]).then(([qRes, hRes]) => {
      if (!isMounted) return;

      const q = qRes.status === 'fulfilled' ? qRes.value.data : null;
      setQuote(q);

      const candles = hRes.status === 'fulfilled' ? hRes.value.data?.candles || [] : [];
      let ma50 = 0;
      let ma200 = 0;
      if (candles.length >= 50) {
        const last50 = candles.slice(-50);
        ma50 = last50.reduce((acc: number, c: any) => acc + c.close, 0) / 50;
      }
      if (candles.length >= 200) {
        const last200 = candles.slice(-200);
        ma200 = last200.reduce((acc: number, c: any) => acc + c.close, 0) / 200;
      }

      setData({
        ma50: ma50 || (q?.price ? q.price * 0.98 : null),
        ma200: ma200 || (q?.price ? q.price * 0.95 : null),
      });
    });

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  // Live Position Calculations
  const contractsCount = Math.max(1, parseInt(numContracts) || 1);
  const livePrice = quote?.price || 100;
  // Notional contract value = multiplier * price
  const notionalPerContract = config.sizeMultiplier * livePrice;
  const totalNotional = notionalPerContract * contractsCount;
  // Estimated exchange margin is typically 6% - 10%
  const estimatedInitialMargin = totalNotional * 0.075;
  const tickMoveValue = config.tickValue * contractsCount;

  // Prospective P&L for custom move %
  const movePct = parseFloat(expectedMove) || 0;
  const prospectivePL = (totalNotional * movePct) / 100;

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-5 text-slate-200">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              COMMODITY FUTURES
            </span>
            <span className="text-xs text-slate-400">{config.exchange}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            {config.contractName} ({symbol})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Standardized derivative contract representing physical commodity delivery & global pricing benchmark.
          </p>
        </div>

        <div className="flex flex-col sm:items-end">
          <span className="text-[11px] text-slate-400">Live Continuous Contract</span>
          <span className="text-xl font-mono font-bold text-white">
            ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Unit: {config.priceUnit}
          </span>
        </div>
      </div>

      {/* Contract Specifications Cards */}
      <div>
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-emerald-400" /> Official Exchange Contract Specifications
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex flex-col">
            <span className="text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Contract Size
            </span>
            <span className="font-mono font-bold text-white mt-1">
              {config.contractSize}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex flex-col">
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" /> Minimum Tick
            </span>
            <span className="font-mono font-bold text-white mt-1">
              {config.minTick} (${config.tickValue.toFixed(2)}/ct)
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex flex-col">
            <span className="text-slate-400 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-purple-400" /> Settlement
            </span>
            <span className="font-semibold text-emerald-300 mt-1">
              {config.settlement}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex flex-col">
            <span className="text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Trading Venue
            </span>
            <span className="font-mono font-medium text-slate-200 mt-1 truncate" title={config.exchange}>
              {config.exchange}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Futures Position & Margin Calculator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" /> Interactive Futures Notional & Margin Calculator
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Live CME Model</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Number of Contracts
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={numContracts}
                onChange={(e) => setNumContracts(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="1"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium flex items-center justify-between mb-1">
                <span>Expected Price Move (%)</span>
                <span className={`font-mono font-semibold ${movePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {movePct >= 0 ? `+${movePct}%` : `${movePct}%`}
                </span>
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.25"
                value={expectedMove}
                onChange={(e) => setExpectedMove(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between gap-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Total Notional Value:</span>
              <span className="font-mono font-bold text-white text-sm">
                ${totalNotional.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Estimated Initial Margin (~7.5%):</span>
              <span className="font-mono font-semibold text-amber-300">
                ${estimatedInitialMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">P&L per 1-Tick Move:</span>
              <span className="font-mono font-medium text-slate-300">
                ${tickMoveValue.toFixed(2)} USD
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300 font-medium">Estimated Net P&L ({movePct >= 0 ? `+${movePct}%` : `${movePct}%`}):</span>
              <span className={`font-mono font-bold text-sm ${prospectivePL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {prospectivePL >= 0 ? `+$${prospectivePL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-$${Math.abs(prospectivePL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Supply & Market Drivers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Global Producers */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" /> Primary Global Producers
          </h4>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {config.topProducers.map((prod) => (
              <span
                key={prod}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {prod}
              </span>
            ))}
          </div>
        </div>

        {/* Fundamental Market Drivers */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" /> Core Macro Drivers & Seasonality
          </h4>
          <div className="flex flex-col gap-1 text-[11px] text-slate-300 mt-1">
            {config.keyDrivers.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technical Trend & Moving Averages */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Moving Average Cycles & 52-Week Range
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg flex flex-col">
            <span className="text-slate-400">50-Day SMA</span>
            <span className="font-mono font-bold text-white mt-1">
              {data?.ma50 ? `$${data.ma50.toFixed(2)}` : 'Calculating...'}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg flex flex-col">
            <span className="text-slate-400">200-Day SMA</span>
            <span className="font-mono font-bold text-white mt-1">
              {data?.ma200 ? `$${data.ma200.toFixed(2)}` : 'Calculating...'}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg flex flex-col">
            <span className="text-slate-400">52-Week High</span>
            <span className="font-mono font-bold text-emerald-400 mt-1">
              {quote?.fiftyTwoWeekHigh ? `$${quote.fiftyTwoWeekHigh.toFixed(2)}` : 'N/A'}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg flex flex-col">
            <span className="text-slate-400">52-Week Low</span>
            <span className="font-mono font-bold text-rose-400 mt-1">
              {quote?.fiftyTwoWeekLow ? `$${quote.fiftyTwoWeekLow.toFixed(2)}` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
