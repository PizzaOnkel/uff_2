import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logicPath = path.join(__dirname, '..', 'src', 'utils', 'logicZentrale.js');
// Pick latest ChestData_*.json in public/json-data (fallback to aktuelle_Punkte-Tabelle_*.json)
const jsonDir = path.join(__dirname, '..', 'public', 'json-data');
const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));
const chestFiles = files.filter(f => f.startsWith('ChestData_')).sort().reverse();
const alt = files.filter(f => f.startsWith('aktuelle_Punkte-Tabelle')).sort().reverse();
const chosen = chestFiles.length > 0 ? chestFiles[0] : (alt.length>0? alt[0] : null);
if(!chosen) throw new Error('Keine JSON-Datei in public/json-data gefunden');
const dataPath = path.join(jsonDir, chosen);

(async () => {
  try {
    const logic = await import('file://' + logicPath);
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const json = JSON.parse(raw);
    const resultsArr = json.results || json;
    const playersArr = [];
    const chestMappingsPath = path.join(__dirname, '..', 'public', 'chest-mapping.json');
    let chestMappings = [];
    if (fs.existsSync(chestMappingsPath)) {
      try { chestMappings = JSON.parse(fs.readFileSync(chestMappingsPath,'utf8')); } catch(e) { chestMappings = []; }
    }
    const normsArr = [];

    const out = logic.calculatePlayerNorms({ playersArr, resultsArr, chestMappings, normsArr });
    console.log('Players total:', out.length);
    console.log(JSON.stringify(out.slice(0,5), null, 2));

    // Quick scan for categories that are entirely zero across chestDetails
    const categories = {};
    for (const p of out) {
      for (const c of (p.chestDetails || [])) {
        const cat = c.category || 'Unbekannt';
        categories[cat] = categories[cat] || { count:0, points:0 };
        categories[cat].count += (c.count || 0);
        categories[cat].points += (c.points || 0);
      }
    }
    console.log('Category aggregates:');
    console.log(JSON.stringify(categories, null, 2));

  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
