import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchYahooQuoteSummary, getYahooCrumb } from '../../client/api/_handlers/yahooQuoteSummary.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const files = [
  path.join(currentDir, '../../client/api/_handlers/data/universe-in.json'),
  path.join(currentDir, '../../client/src/data/universe-in.json'),
  path.join(currentDir, '../../server/src/data/universe-in.json'),
];

// Clean sector mapper function
function mapYahooToIndianSector(ySector, yIndustry, symbol) {
  const s = (ySector || '').toLowerCase();
  const ind = (yIndustry || '').toLowerCase();
  const sym = (symbol || '').toUpperCase();

  // Known special cases
  if (sym.includes('PAYTM')) return { sector: 'Financial Services', industry: 'FinTech & Digital Payments' };
  if (sym.includes('ZOMATO') || sym.includes('ETERNAL')) return { sector: 'Services', industry: 'Food Delivery & Quick Commerce' };
  if (sym.includes('INDIGO')) return { sector: 'Services', industry: 'Passenger Airlines' };
  if (sym.includes('IRCTC')) return { sector: 'Services', industry: 'Rail Catering & Ticketing' };
  if (sym.includes('DELHIVERY')) return { sector: 'Services', industry: 'Supply Chain & Logistics' };
  if (sym.includes('NAUKRI') || sym.includes('INFOEDGE')) return { sector: 'IT', industry: 'Internet Platforms' };
  if (sym.includes('TRENT')) return { sector: 'Consumer Durables', industry: 'Apparel & Fashion Retail (Zudio)' };
  if (sym.includes('JUBLFOOD')) return { sector: 'Services', industry: 'QSR & Restaurants (Domino\'s)' };

  // Financial Services
  if (
    s.includes('financial') ||
    ind.includes('bank') ||
    ind.includes('insurance') ||
    ind.includes('nbfc') ||
    ind.includes('credit') ||
    ind.includes('capital market') ||
    ind.includes('asset management') ||
    ind.includes('holding')
  ) {
    return { sector: 'Financial Services', industry: yIndustry || 'Banking & Financial Services' };
  }

  // Healthcare & Pharma
  if (
    s.includes('healthcare') ||
    ind.includes('drug') ||
    ind.includes('pharma') ||
    ind.includes('biotech') ||
    ind.includes('hospital') ||
    ind.includes('medical') ||
    ind.includes('diagnostics') ||
    ind.includes('healthcare')
  ) {
    return { sector: 'Healthcare', industry: yIndustry || 'Pharmaceuticals & Healthcare' };
  }

  // IT & Software
  if (
    s.includes('technology') ||
    ind.includes('software') ||
    ind.includes('information technology') ||
    ind.includes('it services') ||
    ind.includes('computer') ||
    ind.includes('internet')
  ) {
    return { sector: 'IT', industry: yIndustry || 'IT & Software Services' };
  }

  // Telecom
  if (
    s.includes('communication') &&
    (ind.includes('telecom') || ind.includes('wireless') || ind.includes('cellular') || ind.includes('network') || ind.includes('tower'))
  ) {
    return { sector: 'Telecom', industry: yIndustry || 'Telecommunications' };
  }

  // Auto & Auto Components
  if (
    ind.includes('auto') ||
    ind.includes('vehicle') ||
    ind.includes('motor') ||
    ind.includes('tire') ||
    ind.includes('tyre') ||
    ind.includes('truck') ||
    ind.includes('tractor')
  ) {
    return { sector: 'Auto', industry: yIndustry || 'Automobiles & Auto Components' };
  }

  // Real Estate / Realty
  if (
    s.includes('real estate') ||
    ind.includes('real estate') ||
    ind.includes('reit') ||
    ind.includes('residential') ||
    ind.includes('property')
  ) {
    return { sector: 'Realty', industry: yIndustry || 'Real Estate Development' };
  }

  // Power & Electric Utilities
  if (
    s.includes('utilities') ||
    ind.includes('electric') ||
    ind.includes('power') ||
    ind.includes('renewable') ||
    ind.includes('thermal') ||
    ind.includes('hydro')
  ) {
    return { sector: 'Power', industry: yIndustry || 'Electric Utilities & Power Generation' };
  }

  // Oil, Gas & Energy
  if (
    s.includes('energy') ||
    ind.includes('oil') ||
    ind.includes('gas') ||
    ind.includes('petroleum') ||
    ind.includes('refining') ||
    ind.includes('drilling') ||
    ind.includes('fuel')
  ) {
    return { sector: 'Oil Gas & Energy', industry: yIndustry || 'Oil, Gas & Energy' };
  }

  // FMCG / Consumer Staples
  if (
    s.includes('consumer defensive') ||
    ind.includes('packaged food') ||
    ind.includes('beverage') ||
    ind.includes('tobacco') ||
    ind.includes('household') ||
    ind.includes('personal product') ||
    ind.includes('confectionery') ||
    ind.includes('dairy') ||
    ind.includes('sugar') ||
    ind.includes('tea') ||
    ind.includes('coffee') ||
    ind.includes('edible')
  ) {
    return { sector: 'FMCG', industry: yIndustry || 'Fast Moving Consumer Goods' };
  }

  // Chemicals
  if (
    ind.includes('chemical') ||
    ind.includes('fertilizer') ||
    ind.includes('agrichemical') ||
    ind.includes('pesticide') ||
    ind.includes('petrochem')
  ) {
    return { sector: 'Chemicals', industry: yIndustry || 'Specialty & Agro Chemicals' };
  }

  // Metals & Mining
  if (
    ind.includes('steel') ||
    ind.includes('metal') ||
    ind.includes('mining') ||
    ind.includes('aluminum') ||
    ind.includes('iron') ||
    ind.includes('copper') ||
    ind.includes('zinc') ||
    ind.includes('mineral')
  ) {
    return { sector: 'Metals & Mining', industry: yIndustry || 'Metals & Mining' };
  }

  // Construction & Cement
  if (ind.includes('building material') || ind.includes('cement')) {
    return { sector: 'Capital Goods', industry: 'Cement & Building Materials' };
  }
  if (ind.includes('engineering & construction') || ind.includes('infrastructure')) {
    return { sector: 'Capital Goods', industry: 'Infrastructure & Construction' };
  }

  // Capital Goods / Machinery / Defense
  if (
    s.includes('industrials') &&
    (ind.includes('machinery') ||
      ind.includes('electrical equipment') ||
      ind.includes('aerospace') ||
      ind.includes('defense') ||
      ind.includes('conglomerate') ||
      ind.includes('capital') ||
      ind.includes('industrial'))
  ) {
    return { sector: 'Capital Goods', industry: yIndustry || 'Capital Goods & Industrial Machinery' };
  }

  // Consumer Durables (Apparel, Footwear, Consumer Electronics, Home)
  if (
    s.includes('consumer cyclical') &&
    (ind.includes('electronics') ||
      ind.includes('appliance') ||
      ind.includes('footwear') ||
      ind.includes('apparel') ||
      ind.includes('textile') ||
      ind.includes('furnishing') ||
      ind.includes('jewel') ||
      ind.includes('luxury') ||
      ind.includes('home improvement'))
  ) {
    return { sector: 'Consumer Durables', industry: yIndustry || 'Consumer Durables & Lifestyle' };
  }

  // Services (Logistics, Airlines, Hotels, Media, Restaurants, Travel)
  if (
    ind.includes('airline') ||
    ind.includes('logistics') ||
    ind.includes('freight') ||
    ind.includes('delivery') ||
    ind.includes('transport') ||
    ind.includes('hotel') ||
    ind.includes('entertainment') ||
    ind.includes('media') ||
    ind.includes('broadcasting') ||
    ind.includes('travel') ||
    ind.includes('restaurant') ||
    ind.includes('retail') ||
    ind.includes('hospitality')
  ) {
    return { sector: 'Services', industry: yIndustry || 'Consumer & Commercial Services' };
  }

  // Broad Fallbacks
  if (s.includes('basic materials')) return { sector: 'Chemicals', industry: yIndustry || 'Basic Materials' };
  if (s.includes('industrials')) return { sector: 'Capital Goods', industry: yIndustry || 'Industrials' };
  if (s.includes('consumer cyclical')) return { sector: 'Consumer Durables', industry: yIndustry || 'Consumer Cyclical' };

  return { sector: 'Services', industry: yIndustry || 'Diversified' };
}

async function run() {
  console.log('Loading Indian universe...');
  const mainFile = files[0];
  const universe = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
  console.log(`Loaded ${universe.length} stocks.`);

  // 1. Handle Zomato ticker rebrand to ETERNAL.NS
  const zomatoIdx = universe.findIndex((s) => s.symbol === 'ZOMATO.NS');
  if (zomatoIdx !== -1) {
    universe[zomatoIdx] = {
      ...universe[zomatoIdx],
      symbol: 'ETERNAL.NS',
      name: 'Eternal Ltd. (Zomato & Blinkit)',
      sector: 'Services',
      industry: 'Food Delivery & Quick Commerce',
      price: 363.65,
    };
    console.log('Updated ZOMATO.NS -> ETERNAL.NS');
  }

  // 2. Find stocks with mock/round-robin names or industries
  const targetStocks = universe.filter(
    (s) =>
      s.name.endsWith('Limited') ||
      s.name.endsWith('LTD') ||
      s.name.endsWith('Limited.') ||
      s.industry === 'Power' ||
      s.industry === 'NBFC' ||
      s.industry === 'IT Services' ||
      s.industry === 'Specialty Chemicals' ||
      s.industry === 'Iron & Steel' ||
      s.industry === 'Pharmaceuticals' ||
      s.industry === 'Packaged Foods' ||
      s.industry === 'Auto Components' ||
      s.industry === 'Logistics' ||
      s.industry === 'Real Estate Development' ||
      s.industry === 'Industrial Machinery' ||
      s.industry === 'Consumer Electronics'
  );

  console.log(`Found ${targetStocks.length} candidate stocks to verify and fix.`);

  // Process in batches of 10 with delay
  const batchSize = 10;
  let fixedCount = 0;

  for (let i = 0; i < targetStocks.length; i += batchSize) {
    const batch = targetStocks.slice(i, i + batchSize);
    console.log(`Processing batch ${i + 1} to ${Math.min(i + batchSize, targetStocks.length)} of ${targetStocks.length}...`);

    await Promise.all(
      batch.map(async (item) => {
        try {
          const summary = await fetchYahooQuoteSummary(item.symbol, ['assetProfile', 'quoteType']);
          if (!summary) return;

          const longName = summary?.quoteType?.longName || summary?.quoteType?.shortName;
          const ySector = summary?.assetProfile?.sector;
          const yIndustry = summary?.assetProfile?.industry;

          if (ySector || yIndustry || longName) {
            // Find item in universe
            const uItem = universe.find((x) => x.symbol === item.symbol);
            if (!uItem) return;

            if (longName && !longName.endsWith('LIMITED.')) {
              uItem.name = longName.replace(/ Limited$/i, ' Ltd.').replace(/ Corporation$/i, ' Corp.');
            }

            if (ySector || yIndustry) {
              const mapped = mapYahooToIndianSector(ySector, yIndustry, item.symbol);
              uItem.sector = mapped.sector;
              uItem.industry = mapped.industry;
            }

            fixedCount++;
          }
        } catch (err) {
          // ignore individual failed fetches
        }
      })
    );

    // brief pause
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`Successfully verified and updated ${fixedCount} stocks.`);

  // Write updated universe to all 3 files
  files.forEach((f) => {
    if (fs.existsSync(f)) {
      fs.writeFileSync(f, JSON.stringify(universe, null, 2), 'utf8');
      console.log(`Saved updated universe to ${f}`);
    }
  });

  // Print final sector breakdown
  const finalSectors = {};
  universe.forEach((s) => {
    finalSectors[s.sector] = (finalSectors[s.sector] || 0) + 1;
  });
  console.log('\n--- FINAL INDIAN SECTOR BREAKDOWN ---');
  console.log(finalSectors);
}

run().catch(console.error);
