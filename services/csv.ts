
import { Taxon } from '../types';

export async function parseTaiColCSV(csvContent: string): Promise<Taxon[]> {
  const lines = csvContent.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const getIndex = (name: string) => headers.indexOf(name);
  
  const col = {
    usage_status: getIndex('usage_status'),
    taxon_id: getIndex('taxon_id'),
    simple_name: getIndex('simple_name'),
    search_name: getIndex('search_name'),
    common_name_c: getIndex('common_name_c'),
    rank: getIndex('rank'),
    family: getIndex('family'),
    genus: getIndex('genus'),
  };

  const results: Taxon[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < headers.length) continue;

    const usageStatus = (row[col.usage_status] || '').toLowerCase().replace(/^"|"$/g, '');
    if (usageStatus !== 'accepted') continue;

    const taxonId = row[col.taxon_id]?.replace(/^"|"$/g, '') || '';
    const simpleName = row[col.simple_name]?.replace(/^"|"$/g, '') || '';
    const chineseName = (row[col.search_name] || row[col.common_name_c])?.replace(/^"|"$/g, '') || '';
    const rank = row[col.rank]?.replace(/^"|"$/g, '') || '';
    const family = row[col.family]?.replace(/^"|"$/g, '') || '';
    const genus = row[col.genus]?.replace(/^"|"$/g, '') || '';

    // 解析學名成分
    const parts = simpleName.split(' ');
    let species = undefined;
    let subspecies = undefined;

    if (parts.length >= 2) {
      species = parts[1];
      if (parts.length >= 3) {
        subspecies = parts.slice(2).join(' ');
      }
    }

    results.push({
      taxon_id: taxonId,
      scientific_name: simpleName,
      chinese_name: chineseName,
      rank: rank,
      family: family,
      genus: genus,
      species,
      subspecies
    });
  }

  return results;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let char of line) {
    if (char === '"') inQuote = !inQuote;
    else if (char === ',' && !inQuote) { result.push(cur); cur = ''; }
    else cur += char;
  }
  result.push(cur);
  return result;
}
