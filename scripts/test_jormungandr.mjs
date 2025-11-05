import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getChestPoints, extractChestLevel } from '../src/utils/logicZentrale.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadCsvMappings(csvPath) {
  const txt = fs.readFileSync(csvPath, 'utf8');
  const lines = txt.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(';').map(h => h.trim());
  const rows = lines.slice(1).map(l => {
    const cols = l.split(';');
    const obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = (cols[i] || '').trim();
    }
    return obj;
  });
  return rows.map(r => ({
    Name: r['Name'] || r['name'] || '',
    Type: r['Type'] || r['type'] || '',
    level: r['Level'] || r['level'] || '',
    Source: r['Source'] || r['source'] || '',
    category: r['category'] || r['Category'] || '',
    points: r['points'] === undefined || r['points'] === '' ? '' : Number(r['points'])
  }));
}

(async function main(){
  const csv = path.resolve(__dirname, '..', 'chest-mapping-overview.csv');
  if (!fs.existsSync(csv)) {
    console.error('CSV not found at', csv);
    process.exit(2);
  }
  const mappings = loadCsvMappings(csv);
  const chest = { Name: "Jormungandr's Chest", Type: "Jormungandr Shop", Source: "Jormungandr Shop", Level: '', category: 'Jormungandr Chests' };

  console.log('extractChestLevel ->', extractChestLevel(chest, chest.category));
  console.log('getChestPoints ->', getChestPoints(chest, mappings));

  // Re-run scoring to show top candidates
  function scoreMapping(m, chest) {
    const typeB = String(chest.Type || chest.type || '');
    const nameB = String(chest.Name || chest.name || '');
    const categoryB = String(chest.category || chest.Category || chest.Type || '');
    const extractedLevel = extractChestLevel(chest, chest.category || chest.Category || chest.Type || chest.Source || '');
    const levelB = extractedLevel !== null && extractedLevel !== undefined ? extractedLevel : (chest.level ?? chest.Level ?? '');

    const typeA = String(m.type || m.Type || '');
    const nameA = String(m.chestName || m.Name || '');
    const categoryA = String(m.category || m.Category || '');
    const levelA = String(m.level || m.Level || m.levelStart || '');
    let score = 0;
    if (nameA && nameA.toLowerCase() === nameB.toLowerCase()) score += 100;
    else if (nameA && nameB && nameA.toLowerCase().includes(nameB.toLowerCase())) score += 40;
    else if (nameA && nameB && nameB.toLowerCase().includes(nameA.toLowerCase())) score += 30;
    // category similarity approximation: simple lower-case includes
    if (categoryA && categoryB && categoryA.toLowerCase() === categoryB.toLowerCase()) score += 20;
    if (typeA && typeA.toLowerCase() === typeB.toLowerCase()) score += 5;
    if (levelA && (levelB !== undefined && levelB !== null && levelB !== '')) {
      const nA = Number(levelA);
      const nB = Number(levelB);
      if (!isNaN(nA) && !isNaN(nB) && nA === nB) score += 30;
      else if (String(levelA).toLowerCase() === String(levelB).toLowerCase()) score += 10;
    }
    return score;
  }

  const scored = mappings.map(m => ({ m, score: scoreMapping(m, chest) })).sort((a,b)=>b.score-a.score);
  console.log('Top 10 candidates:');
  console.log(scored.slice(0,10).map(s=>({ name: s.m.Name, category: s.m.category, points: s.m.points, score: s.score })));
})();
