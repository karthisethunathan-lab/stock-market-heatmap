import { getUniverse } from './universeRefresher.js';

export function screenStocks(filters = {}) {
  const {
    market = 'us',
    sector,
    industry,
    capBucket,
    minPe,
    maxPe,
    minPb,
    maxPb,
    minDivYield,
    minRoe,
    maxDebtEquity,
    minRevGrowth,
    minChange1d,
    maxChange1d,
    maxDist52wHigh,
    preset,
    sortBy = 'marketCap',
    sortOrder = 'desc',
    page = 1,
    limit = 25,
  } = filters;

  let pool = [];
  if (market === 'all') {
    pool = [...getUniverse('us'), ...getUniverse('in')];
  } else if (market === 'in' || market === 'india') {
    pool = [...getUniverse('in')];
  } else {
    pool = [...getUniverse('us')];
  }

  // Presets
  if (preset) {
    switch (preset.toLowerCase()) {
      case 'gainers':
        pool = pool.filter((s) => s.change1d > 0).sort((a, b) => b.change1d - a.change1d);
        break;
      case 'losers':
        pool = pool.filter((s) => s.change1d < 0).sort((a, b) => a.change1d - b.change1d);
        break;
      case 'active':
        pool = pool.sort((a, b) => (b.volume || 0) - (a.volume || 0));
        break;
      case 'high-dividend':
        pool = pool.filter((s) => (s.dividendYield || 0) > 2.0).sort((a, b) => (b.dividendYield || 0) - (a.dividendYield || 0));
        break;
      case 'value':
        pool = pool.filter((s) => s.pe && s.pe > 0 && s.pe < 22).sort((a, b) => (a.pe || 999) - (b.pe || 999));
        break;
      case 'growth':
        pool = pool.filter((s) => (s.revGrowth || 0) > 12).sort((a, b) => (b.revGrowth || 0) - (a.revGrowth || 0));
        break;
      case 'near-52w-high':
        pool = pool.filter((s) => (s.dist52wHigh || -99) >= -5.0).sort((a, b) => (b.dist52wHigh || -99) - (a.dist52wHigh || -99));
        break;
      default:
        break;
    }
  }

  // Custom multi-factor filtering
  let filtered = pool.filter((s) => {
    if (sector && sector !== 'All' && s.sector !== sector) return false;
    if (industry && industry !== 'All' && s.industry !== industry) return false;
    if (capBucket && capBucket !== 'All' && s.capBucket !== capBucket) return false;

    if (minPe !== undefined && minPe !== '' && (s.pe === null || s.pe < Number(minPe))) return false;
    if (maxPe !== undefined && maxPe !== '' && (s.pe === null || s.pe > Number(maxPe))) return false;

    if (minPb !== undefined && minPb !== '' && (s.pb === null || s.pb < Number(minPb))) return false;
    if (maxPb !== undefined && maxPb !== '' && (s.pb === null || s.pb > Number(maxPb))) return false;

    if (minDivYield !== undefined && minDivYield !== '' && (s.dividendYield === null || s.dividendYield < Number(minDivYield))) return false;
    if (minRoe !== undefined && minRoe !== '' && (s.roe === null || s.roe < Number(minRoe))) return false;
    if (maxDebtEquity !== undefined && maxDebtEquity !== '' && (s.debtEquity === null || s.debtEquity > Number(maxDebtEquity))) return false;
    if (minRevGrowth !== undefined && minRevGrowth !== '' && (s.revGrowth === null || s.revGrowth < Number(minRevGrowth))) return false;

    if (minChange1d !== undefined && minChange1d !== '' && (s.change1d === null || s.change1d < Number(minChange1d))) return false;
    if (maxChange1d !== undefined && maxChange1d !== '' && (s.change1d === null || s.change1d > Number(maxChange1d))) return false;

    if (maxDist52wHigh !== undefined && maxDist52wHigh !== '' && (s.dist52wHigh === null || s.dist52wHigh < Number(maxDist52wHigh))) return false;

    return true;
  });

  // Sorting
  if (!preset) {
    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === undefined || valA === null) valA = sortOrder === 'asc' ? Infinity : -Infinity;
      if (valB === undefined || valB === null) valB = sortOrder === 'asc' ? Infinity : -Infinity;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }

  // Pagination
  const total = filtered.length;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  return {
    items: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
}
