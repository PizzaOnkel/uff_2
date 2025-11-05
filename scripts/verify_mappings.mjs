import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const logicPath = path.join(projectRoot, 'src', 'utils', 'logicZentrale.js');
const { calculatePlayerNorms } = await import(new URL(`file://${logicPath}`));

// load CSV mapping fallback
function loadCsvMappings(){
  const csvPath = path.join(projectRoot, 'chest-mapping-overview.csv');
  if(!fs.existsSync(csvPath)) return [];
  const raw = fs.readFileSync(csvPath,'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = lines.shift().split(';').map(h=>h.trim());
  const rows = lines.map(l=>{ const parts = l.split(';'); const obj={}; for(let i=0;i<header.length;i++) obj[header[i]]= (parts[i]||'').trim(); return obj; });
  return rows.map(r=>({ Name: r['Name']||'', Type: r['Type']||'', level: r['Level']||'', Source: r['Source']||'', category: r['category']||'', points: (r['points']?Number(r['points']): (r['points']===undefined?undefined:0)), raw: r }));
}

const chestMappings = loadCsvMappings();

const jsonDir = path.join(projectRoot, 'public', 'json-data');
if(!fs.existsSync(jsonDir)){
  console.error('json-data folder not found:', jsonDir);
  process.exit(1);
}

// Only consider ChestData files (new capture system). Ignore legacy 'aktuelle_Punkte-Tabelle' files.
const files = fs.readdirSync(jsonDir).filter(f=>f.toLowerCase().endsWith('.json') && f.toLowerCase().startsWith('chestdata'));
if(files.length===0){ console.log('No JSON files found in public/json-data'); process.exit(0); }

for(const file of files){
  try{
    const p = path.join(jsonDir, file);
    const raw = fs.readFileSync(p,'utf8');
    const json = JSON.parse(raw);
    const resultsArr = Array.isArray(json) ? json : (Array.isArray(json.results)? json.results : [json]);
    const out = calculatePlayerNorms({ playersArr: [], resultsArr, chestMappings, normsArr: [], ignoreChests: [] });
    const categoryTotals = {};
    for(const pItem of out){ for(const d of (pItem.chestDetails||[])){ const cat = d.category||'Unbekannt'; categoryTotals[cat]=categoryTotals[cat]||{count:0,points:0}; categoryTotals[cat].count += Number(d.count||0); categoryTotals[cat].points += Number(d.points||0); }}
    console.log('---', file, 'players:', out.length, 'categories:', Object.keys(categoryTotals).length);
    const sorted = Object.entries(categoryTotals).sort((a,b)=> b[1].points - a[1].points);
    for(const [cat, val] of sorted){ console.log('   ', cat, 'count', val.count, 'points', val.points); }
  }catch(e){ console.error('ERR reading', file, e.message); }
}
