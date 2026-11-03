import React, { useState, useRef } from 'react';
import { usePortfolios } from '../../hooks/usePortfolios';
import { PortfolioSummaryCards } from './PortfolioSummaryCards';
import { HoldingsTable } from './HoldingsTable';
import { AllocationDonut } from './AllocationDonut';
import { PortfolioHeatmap } from './PortfolioHeatmap';
import { AddHoldingModal } from './AddHoldingModal';
import { exportHoldingsToCSV, parseHoldingsFromCSV } from '../../lib/utils';
import { useApp } from '../../context/ThemeContext';
import {
  Plus,
  Download,
  Upload,
  Trash2,
  Edit3,
  Briefcase,
  Check,
  X,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const { showToast } = useApp();
  const {
    portfolios,
    activePortfolioId,
    setActivePortfolioId,
    activePortfolio,
    calculated,
    createPortfolio,
    renamePortfolio,
    deletePortfolio,
    deleteHolding,
    replaceHoldings,
    refreshPrices,
  } = usePortfolios();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'heatmap'>('overview');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPortfolioName.trim()) {
      createPortfolio(newPortfolioName.trim());
      setNewPortfolioName('');
      setIsCreatingPortfolio(false);
    }
  };

  const startEditingName = (id: string, currentName: string) => {
    setEditingNameId(id);
    setEditNameText(currentName);
  };

  const saveEditedName = (id: string) => {
    if (editNameText.trim()) {
      renamePortfolio(id, editNameText.trim());
    }
    setEditingNameId(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!activePortfolio || activePortfolio.holdings.length === 0) {
      showToast('No holdings to export', 'error');
      return;
    }
    exportHoldingsToCSV(activePortfolio.holdings, activePortfolio.name);
    showToast(`Exported "${activePortfolio.name}" holdings to CSV`, 'success');
  };

  // CSV Import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseHoldingsFromCSV(text);
        if (parsed.length === 0) {
          showToast('No valid holdings found in CSV file', 'error');
          return;
        }
        replaceHoldings(activePortfolioId, parsed);
      } catch (err) {
        showToast('Failed to parse CSV file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      
      {/* Portfolio Selector Tabs & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0d121f] rounded-xl border border-slate-800">
        
        {/* Left: Portfolios Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {portfolios.map((p) => {
            const isActive = p.id === activePortfolioId;
            const isEditing = editingNameId === p.id;

            if (isEditing) {
              return (
                <div key={p.id} className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                  <input
                    type="text"
                    value={editNameText}
                    onChange={(e) => setEditNameText(e.target.value)}
                    className="bg-transparent text-white font-mono text-xs focus:outline-none w-28"
                    autoFocus
                  />
                  <button onClick={() => saveEditedName(p.id)} className="text-emerald-400 hover:text-white">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingNameId(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={p.id}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-900'
                }`}
              >
                <button
                  onClick={() => setActivePortfolioId(p.id)}
                  className="flex items-center gap-1.5 focus:outline-none"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{p.name}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({p.holdings.length})
                  </span>
                </button>

                {isActive && (
                  <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditingName(p.id, p.name)}
                      title="Rename portfolio"
                      className="text-slate-500 hover:text-slate-300"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    {portfolios.length > 1 && (
                      <button
                        onClick={() => deletePortfolio(p.id)}
                        title="Delete portfolio"
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* New Portfolio Trigger */}
          {isCreatingPortfolio ? (
            <form onSubmit={handleCreateSubmit} className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
              <input
                type="text"
                placeholder="Portfolio name..."
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none w-32"
                autoFocus
              />
              <button type="submit" className="text-emerald-400 hover:text-white">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingPortfolio(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingPortfolio(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-slate-700 hover:border-emerald-500/60 text-slate-400 hover:text-emerald-400 text-xs font-mono transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Portfolio</span>
            </button>
          )}
        </div>

        {/* Right: Actions Toolbar */}
        <div className="flex items-center gap-2">
          
          {/* View toggle: Overview vs Heatmap */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'overview'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table & Allocation
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'heatmap'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Portfolio Heatmap
            </button>
          </div>

          <button
            onClick={refreshPrices}
            title="Refresh prices"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* CSV Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import from CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            title="Export to CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Add Holding Button */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Holding</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <PortfolioSummaryCards
        totalInvested={calculated.totalInvested}
        totalCurrentValue={calculated.totalCurrentValue}
        totalPnl={calculated.totalPnl}
        totalPnlPercent={calculated.totalPnlPercent}
        dayPnl={calculated.dayPnl}
        dayPnlPercent={calculated.dayPnlPercent}
        currency={calculated.primaryCurrency}
        hasMixedCurrencies={calculated.hasMixedCurrencies}
      />

      {/* Conditional View: Overview (Table + Donut) OR Portfolio Treemap Heatmap */}
      {viewMode === 'overview' ? (
        <>
          {/* Holdings Allocation Donut Charts */}
          {calculated.holdings.length > 0 && (
            <AllocationDonut
              stockAllocations={calculated.stockAllocations}
              sectorAllocations={calculated.sectorAllocations}
              currency={calculated.primaryCurrency}
            />
          )}

          {/* Holdings Detailed Table */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-300">
                Holdings Breakdown ({calculated.holdings.length})
              </h3>
            </div>

            <HoldingsTable
              holdings={calculated.holdings}
              portfolioId={activePortfolioId}
              onDeleteHolding={deleteHolding}
            />
          </div>
        </>
      ) : (
        <PortfolioHeatmap portfolioSectors={calculated.portfolioSectors} />
      )}

      {/* Add Holding Modal */}
      {addModalOpen && (
        <AddHoldingModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          currency={calculated.primaryCurrency}
        />
      )}
    </div>
  );
};
