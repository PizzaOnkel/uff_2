import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getChestPoints, extractChestLevel, normalizeChestName } from '../src/utils/logicZentrale.js';

function mapCategoryToPageNameLocal(cat) {
  const c = String(cat || '').toLowerCase();
  if (c.includes("arena")) return "Arena Chests";
  if (c.includes("common")) return "Common Chests";
  if (c.includes("rare")) return "Rare Chests";
  if (c.includes("epic") && c.includes("ancient")) return "Epic Ancient squad";
  if (c.includes("epic")) return "Epic Chests";
  if (c.includes("tartaros")) return "Chests of Tartaros";
  if (c.includes("elven") || c.includes("citadel")) return "Elven Chests";
  if (c.includes("cursed")) return "Cursed Chests";
  if (c.includes("bank")) return "Bank Chests";
  if (c.includes("runic")) return "Runic Chests";
  if (c.includes("heroic")) return "Heroic Chests";
  if (c.includes("vault") || c.includes("vota") || c.includes("ancients")) return "Vault of the Ancients";
  if (c.includes("rota") || c.includes("rise of the ancients")) return "Rise of the Ancients";
  if (c.includes("union")) return "Union Chest";
  if (c.includes("jormungandr") || c.includes("jörmungandr")) return "Jormungandr Chests";
  return String(cat || '');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadCsvMappings(csvPath) {
  if (!fs.existsSync(csvPath)) return [];
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
  const dataDir = path.resolve(__dirname, '..', 'public', 'json-data');
  const csv = path.resolve(__dirname, '..', 'chest-mapping-overview.csv');
  const mappings = loadCsvMappings(csv);
  if (!fs.existsSync(dataDir)) {
    console.error('json-data folder not found:', dataDir);
    process.exit(2);
  }
  const files = fs.readdirSync(dataDir).filter(f => f.startsWith('ChestData') && f.endsWith('.json'));
  let totalFound = 0;
  for (const file of files) {
    const fp = path.join(dataDir, file);
    let json;
    try { json = JSON.parse(fs.readFileSync(fp,'utf8')); } catch(e){ continue; }
    for (const [date, arr] of Object.entries(json)) {
      if (!Array.isArray(arr)) continue;
      for (const player of arr) {
        const name = player.Clanmate || player.player || player.playerName || player.ClanmateName || '';
        const chests = player.chests || [];
        for (const c of chests) {
          const rawCat = c.category || c.Category || c.Type || c.Source || '';
          const pageCat = mapCategoryToPageNameLocal(rawCat || '');
          if (pageCat !== 'Jormungandr Chests') continue;
          const level = extractChestLevel(c, rawCat);
          const points = getChestPoints({ ...c, category: rawCat, level }, mappings);
          const count = Number(c.count || c.Count || 1) || 1;
          if (points && Number(points) > 0) {
            console.log(`File: ${file} Date: ${date} Player: ${name} ChestName: ${(c.Name||c.name||'')} Type: ${(c.Type||'')} Source: ${(c.Source||'')} Level: ${level} Count: ${count} PointsPer: ${points} TotalPoints: ${points*count}`);
            totalFound++;
          }
        }
      }
    }
  }
  if (totalFound===0) console.log('No Jormungandr chests with points > 0 found in ChestData files using CSV mappings.');
  else console.log('Found', totalFound, 'entries.');
})();