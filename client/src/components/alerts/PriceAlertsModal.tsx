import React, { useState, useEffect } from 'react';
import { PriceAlert } from '../../types';
import { Bell, Trash2, Plus, X } from 'lucide-react';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
  currentPrice?: number;
}

const STORAGE_KEY = 'stock_market_price_alerts';

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  defaultSymbol = 'AAPL',
  currentPrice = 100,
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [condition, setCondition] = useState<'above' | 'below' | 'pct_move' | '52w_high'>('above');
  const [targetValue, setTargetValue] = useState<number>(Number((currentPrice * 1.05).toFixed(2)));
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAlerts(JSON.parse(saved));
    } catch {
      // Ignore
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultSymbol) setSymbol(defaultSymbol);
    if (currentPrice) setTargetValue(Number((currentPrice * 1.05).toFixed(2)));
  }, [defaultSymbol, currentPrice]);

  if (!isOpen) return null;

  const requestPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setPermission(res);
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol) return;

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      symbol: symbol.toUpperCase().trim(),
      name: symbol.toUpperCase().trim(),
      condition,
      targetValue: Number(targetValue),
      createdPrice: currentPrice,
      createdAt: new Date().toISOString(),
      triggered: false,
    };

    const updated = [newAlert, ...alerts];
    setAlerts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (permission === 'default') {
      requestPermission();
    }
  };

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Price Alerts</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Permission Banner */}
        {permission !== 'granted' && (
          <div className="px-4 py-2.5 bg-amber-950/40 border-b border-amber-800/60 flex items-center justify-between text-xs text-amber-300">
            <span>Enable browser notifications to receive live price alert popups while the tab is open.</span>
            <button
              onClick={requestPermission}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-semibold text-[11px] whitespace-nowrap ml-2"
            >
              Enable
            </button>
          </div>
        )}

        {/* Add Alert Form */}
        <form onSubmit={handleCreateAlert} className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col gap-3">
          <div className="text-xs font-semibold text-slate-300">Set New Alert for {symbol}</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase">Ticker</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white uppercase outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="above">Price Rises Above (&gt;=)</option>
                <option value="below">Price Drops Below (&lt;=)</option>
                <option value="pct_move">% Move Exceeds</option>
                <option value="52w_high">Touches 52W High</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase">Target ({condition === 'pct_move' ? '%' : '$ / ₹'})</label>
              <input
                type="number"
                step="any"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Create Alert
          </button>
        </form>

        {/* Existing Alerts List */}
        <div className="p-4 flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-thin">
          <div className="text-xs font-semibold text-slate-400">Active Price Alerts ({alerts.length})</div>
          {alerts.length === 0 ? (
            <div className="text-xs text-slate-500 py-4 text-center">No active alerts configured.</div>
          ) : (
            alerts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-white">{a.symbol}</span>
                  <span className="text-[11px] text-slate-400">
                    {a.condition === 'above' && `Rises above ${a.targetValue}`}
                    {a.condition === 'below' && `Drops below ${a.targetValue}`}
                    {a.condition === 'pct_move' && `Moves more than ${a.targetValue}%`}
                    {a.condition === '52w_high' && 'Hits new 52-Week High'}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteAlert(a.id)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
