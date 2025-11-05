import fs from 'fs';
import path from 'path';

// Use process.cwd() to resolve paths relative to the project root where the script is run
const projectRoot = process.cwd();
const jsonDir = path.join(projectRoot, 'public', 'json-data');
const chestMappingsPath = path.join(projectRoot, 'public', 'chest-mapping.json');
// Find latest ChestData_*.json
let dataPath;
try{
  const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));
  const chestFiles = files.filter(f => f.startsWith('ChestData_')).sort().reverse();
  const alt = files.filter(f => f.startsWith('aktuelle_Punkte-Tabelle')).sort().reverse();
  const chosen = chestFiles.length>0 ? chestFiles[0] : (alt.length>0?alt[0]:null);
  if(!chosen) throw new Error('Keine JSON-Datei im public/json-data gefunden');
  dataPath = path.join(jsonDir, chosen);
}catch(err){ console.error('Error finding data file:', err); process.exit(1); }

function safeToString(v){ if (v===undefined||v===null) return ''; return String(v); }
function normalizeChestName(name){ if(!name||typeof name!=='string') return ''; return name.trim().toLowerCase().replace(/[\u2018\u2019`´]/g, "'").replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[éèê]/g,'e').replace(/[áàâ]/g,'a').replace(/[íìî]/g,'i').replace(/[óòô]/g,'o').replace(/[úùû]/g,'u').replace(/ñ/g,'n').replace(/ç/g,'c').replace(/\s+/g,' ').trim(); }
function categoriesMatchTolerant(a,b){ if(!a||!b) return false; const A=normalizeChestName(a), B=normalizeChestName(b); if(A===B) return true; const keys=["tartaros","elven","cursed","citadel","epic","rare","bank","runic","heroic","jormungandr","union","rota","vault"]; for(const k of keys) if(A.includes(k)&&B.includes(k)) return true; return false; }
function mapCategoryToPageName(cat){ const c=safeToString(cat).toLowerCase(); if(c.includes('arena')) return 'Arena Chests'; if(c.includes('common')) return 'Common Chests'; if(c.includes('rare')) return 'Rare Chests'; if(c.includes('epic')&&c.includes('ancient')) return 'Epic Ancient squad'; if(c.includes('epic')) return 'Epic Chests'; if(c.includes('tartaros')) return 'Chests of Tartaros'; if(c.includes('elven')||c.includes('citadel')) return 'Elven Chests'; if(c.includes('cursed')) return 'Cursed Chests'; if(c.includes('bank')) return 'Bank Chests'; if(c.includes('runic')) return 'Runic Chests'; if(c.includes('heroic')) return 'Heroic Chests'; if(c.includes('vault')||c.includes('vota')||c.includes('ancients')) return 'Vault of the Ancients'; if(c.includes('rota')||c.includes('rise of the ancients')) return 'Rise of the Ancients'; if(c.includes('union')) return 'Union Chest'; if(c.includes('jormungandr')||c.includes('jörmungandr')) return 'Jormungandr Chests'; return safeToString(cat); }

function extractChestLevel(chestName, category){ chestName=safeToString(chestName); if(!chestName) return null; const normalized=normalizeChestName(chestName); const bankLevels=["wooden","bronze","silver","golden","precious","magic"]; if(categoriesMatchTolerant(category||'', 'Bank Chests') || safeToString(category).toLowerCase().includes('bank')){ const found=bankLevels.find(l=>normalized.includes(l)); if(found) return found.charAt(0).toUpperCase()+found.slice(1); } const m=normalized.match(/(\d+)/); if(m) return Number(m[1]); return null; }

function getChestPoints(chest, chestMappings){
  chest = chest||{};
  const mappings = Array.isArray(chestMappings)?chestMappings:[];
  if(mappings.length===0) return 0;
  const typeB = safeToString(chest.Type||chest.type||'');
  const nameB = safeToString(chest.Name||chest.name||'');
  const categoryB = safeToString(chest.category||chest.Category||chest.Type||'');
  const levelB = safeToString(chest.level??chest.Level??'');

  let best = null;
  let bestScore = -1;

  for(const m of mappings){
    const typeA = safeToString(m.Type||m.type||'');
    const nameA = safeToString(m.Name||m.chestName||'');
    const categoryA = safeToString(m.category||m.Category||'');
    const levelA = safeToString(m.level||m.Level||'');
    let score = 0;

    // exact name match (strong)
    if(nameA && nameA.toLowerCase()===nameB.toLowerCase()) score += 100;
    // substring name match
    else if(nameA && nameB && nameA.toLowerCase().includes(nameB.toLowerCase())) score += 40;
    else if(nameA && nameB && nameB.toLowerCase().includes(nameA.toLowerCase())) score += 30;

    // category similarity
    if(categoryA && categoriesMatchTolerant(categoryA, categoryB)) score += 20;

    // type match
    if(typeA && typeA.toLowerCase()===typeB.toLowerCase()) score += 5;

    // level match (numeric equality or textual)
    if(levelA && levelB){
      if(Number(levelA) && Number(levelB) && Number(levelA)===Number(levelB)) score += 30;
      else if(levelA.toLowerCase()===levelB.toLowerCase()) score += 10;
    }

    // Accept candidate even when not all fields match; prefer higher score
    if(score > bestScore){ bestScore = score; best = m; }
  }

  if(best && best.points!==undefined && best.points!=='' ) return Number(best.points)||0;
  return 0;
}

function normalizeResultEntries(results){
  const out = [];
  if(!results) return out;
  // If it's already an array, normalize each entry
  if(Array.isArray(results)){
    for(const doc of results){ if(!doc) continue; if(doc.Clanmate||doc.clanmate||doc.player||doc.playerName) out.push(doc); else if(Array.isArray(doc)) doc.forEach(i=>i&&out.push(i)); else if(typeof doc==='object') out.push(doc); }
    return out;
  }
  // If it's an object with known container keys, prefer those
  const knownKeys = ['results','players','entries','data','members'];
  for(const k of knownKeys){ if(results[k] && Array.isArray(results[k])) return normalizeResultEntries(results[k]); }
  // Otherwise collect arrays found in object values
  for(const v of Object.values(results)){
    if(Array.isArray(v)) v.forEach(i=>i&&out.push(i));
    else if(v && (v.Clanmate||v.chests||v.player)) out.push(v);
  }
  // If nothing collected and object itself looks like a player entry, include it
  if(out.length===0 && (results.Clanmate||results.clanmate||results.player)) out.push(results);
  return out;
}

function calculatePlayerNormsLocal({playersArr=[], resultsArr=[], chestMappings=[], normsArr=[], ignoreChests=[]}){
  const filtered = resultsArr||[];
  const candidates = normalizeResultEntries(filtered);
  const playerMap = new Map();
  for(const res of candidates){ const name = res.Clanmate||res.clanmate||res.player||res.playerName||'unknown'; if(!playerMap.has(name)) playerMap.set(name,{name,ist:0,soll:0,chestDetails:[]}); const entry=playerMap.get(name); const rawChests=res.chests; const normalized=[]; if(Array.isArray(rawChests)) normalized.push(...rawChests); else if(rawChests && typeof rawChests==='object'){ for(const [cat,val] of Object.entries(rawChests)){ if(Array.isArray(val)) val.forEach(item=> normalized.push({...item, category:cat})); else if(val && typeof val==='object') for(const [lvl,cnt] of Object.entries(val)){ const count=Number(cnt)||0; if(count>0) normalized.push({Name:'',Type:'',Source:'',category:cat,level:lvl,count}); } } }
  for(const rc of normalized){ try{ if(!rc) continue; const category = rc.category||rc.Type||rc.Source||rc.Category||''; const level = extractChestLevel(rc.Name||rc.name||'', category) ?? (rc.level ?? rc.Level ?? ''); const count = Number(rc.count ?? rc.Count ?? 1) || 1; const pointsPer = getChestPoints({...rc, category, level}, chestMappings) || 0; const points = Number(pointsPer) * count; entry.ist += points; entry.chestDetails.push({ Name: rc.Name||rc.name||'', Type: rc.Type||rc.type||'', Source: rc.Source||rc.source||'', category: mapCategoryToPageName(category||rc.category||rc.Type||rc.Source||''), level: level??'', count, points }); }catch(e){}} }
  return Array.from(playerMap.values()); }

(async()=>{
  try{
    const raw = fs.readFileSync(dataPath,'utf8');
    const json = JSON.parse(raw);
    const resultsArr = json.results || json;
    let chestMappings = [];
    // Try to load JSON mapping first, otherwise fall back to CSV overview file in project root
    if(fs.existsSync(chestMappingsPath)){
      try{ chestMappings = JSON.parse(fs.readFileSync(chestMappingsPath,'utf8')); }catch(e){ chestMappings = []; }
    }
    // Fallback: chest-mapping-overview.csv at project root
    const csvFallback = path.join(projectRoot, 'chest-mapping-overview.csv');
    if(chestMappings.length===0 && fs.existsSync(csvFallback)){
      const rawCsv = fs.readFileSync(csvFallback,'utf8');
      const lines = rawCsv.split(/\r?\n/).filter(Boolean);
      const headerLine = lines.shift();
      const cols = headerLine.split(';').map(h=>h.trim());
      const rows = lines.map(l=>{
        const parts = l.split(';');
        const obj = {};
        for(let i=0;i<cols.length;i++) obj[cols[i]] = (parts[i]||'').trim();
        return obj;
      });
      // map to simpler structure
      chestMappings = rows.map(r=>({
        Name: r['Name']||r['name']||'',
        Type: r['Type']||r['type']||'',
        level: r['Level']||r['level']||'',
        Source: r['Source']||r['source']||'',
        category: r['category']||r['Category']||'',
        points: (r['points']? Number(r['points']) : (r['points']===undefined? undefined : 0)),
        raw: r
      }));
    }
    const out = calculatePlayerNormsLocal({ playersArr: [], resultsArr, chestMappings, normsArr:[], ignoreChests:[] });
    console.log('Players:', out.length);
    console.log('Sample:', JSON.stringify(out.slice(0,5), null,2));
    const categories = {};
    for(const p of out){ for(const c of (p.chestDetails||[])){ const cat = c.category||'Unbekannt'; categories[cat]=categories[cat]||{count:0,points:0}; categories[cat].count+= (c.count||0); categories[cat].points += (c.points||0); } }
    console.log('Category aggregates:');
    console.log(JSON.stringify(categories, null,2));
  }catch(e){ console.error(e); process.exit(1);} })();
