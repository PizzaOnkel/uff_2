import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = process.cwd();
const logicPath = path.join(projectRoot, 'src', 'utils', 'logicZentrale.js');
const logic = await import(new URL(`file://${logicPath}`));

// choose latest ChestData_*.json from public/json-data
const jsonDir = path.join(projectRoot, 'public', 'json-data');
const allFiles = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));
const chestFiles = allFiles.filter(f => f.startsWith('ChestData_')).sort().reverse();
const alt = allFiles.filter(f => f.startsWith('aktuelle_Punkte-Tabelle')).sort().reverse();
const chosen = chestFiles.length>0 ? chestFiles[0] : (alt.length>0 ? alt[0] : null);
if(!chosen) { console.error('No JSON files found in public/json-data'); process.exit(1); }
const sample = JSON.parse(fs.readFileSync(path.join(jsonDir, chosen), 'utf8'));
let resultsArr = [];
if (Array.isArray(sample)) resultsArr = sample;
else if (Array.isArray(sample.results)) resultsArr = sample.results;
else resultsArr = [sample];
const chestMappingCsv = fs.readFileSync(path.join(projectRoot, 'chest-mapping-overview.csv'), 'utf8');
const lines = chestMappingCsv.split(/\r?\n/).filter(Boolean);
const header = lines.shift().split(';').map(h=>h.trim());
const mappings = lines.map(l=>{ const parts=l.split(';'); const o={}; for(let i=0;i<header.length;i++) o[header[i]]=(parts[i]||'').trim(); return o; });

const out = logic.calculatePlayerNorms({ playersArr: [], resultsArr, chestMappings: mappings, normsArr: [], ignoreChests: [] });

console.log('Players:', out.length);
const categoryTotals = {};
for(const p of out){ for(const d of p.chestDetails||[]){ const c = d.category||'Unbekannt'; categoryTotals[c] = categoryTotals[c] || { count:0, points:0 }; categoryTotals[c].count += Number(d.count||0); categoryTotals[c].points += Number(d.points||0); } }
console.log('Category totals:'); console.log(JSON.stringify(categoryTotals, null,2));
console.log('\nSample player (first 5):', JSON.stringify(out.slice(0,5), null,2));
