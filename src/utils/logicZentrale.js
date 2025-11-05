import { mapToMainName } from "../utils/aliasMapping.js";

// Small safe helpers
function safeToString(v) {
  if (v === undefined || v === null) return "";
  return String(v);
}

// Normalize names for tolerant comparison
export function normalizeChestName(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019`´]/g, "'")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[éèê]/g, "e")
    .replace(/[áàâ]/g, "a")
    .replace(/[íìî]/g, "i")
    .replace(/[óòô]/g, "o")
    .replace(/[úùû]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/ç/g, "c")
    .replace(/\s+/g, " ")
    .trim();
}

export function stringsMatchTolerant(a, b) {
  if (!a || !b) return false;
  const A = normalizeChestName(a);
  const B = normalizeChestName(b);
  if (A === B) return true;
  if (A.includes(B) || B.includes(A)) return true;
  return false;
}

function categoriesMatchTolerant(a, b) {
  if (!a || !b) return false;
  const A = normalizeChestName(a);
  const B = normalizeChestName(b);
  if (A === B) return true;
  const keywords = ["tartaros", "elven", "cursed", "citadel", "epic", "rare", "bank", "runic", "heroic", "jormungandr", "union", "rota", "vault"];
  for (const k of keywords) if (A.includes(k) && B.includes(k)) return true;
  return false;
}

// Exported helper for pages: tolerant category check between a chest object and a category name
export function chestCategoryMatches(chest, catName) {
  const c = (chest && (chest.category || chest.Category || '')) || '';
  return stringsMatchTolerant(c, catName);
}

function mapCategoryToPageName(cat) {
  const c = safeToString(cat).toLowerCase();
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
  return safeToString(cat);
}

export function isArenaChest(chest) {
  if (!chest) return false;
  const cat = safeToString(chest.category || chest.Type || chest.Source || chest.Name);
  return normalizeChestName(cat).includes("arena");
}

export function isIgnoredChest(chest, ignoreChests) {
  const ignoreArr = Array.isArray(ignoreChests) ? ignoreChests : [];
  if (isArenaChest(chest)) return false;
  for (const ig of ignoreArr) {
    if (!ig) continue;
    const igName = safeToString(ig.Name || ig.name).trim().toLowerCase();
    if (igName && igName !== safeToString(chest.Name || chest.name).trim().toLowerCase()) continue;
    if (ig.Type && !(safeToString(chest.Type || chest.type).toLowerCase().includes(safeToString(ig.Type || ig.type).toLowerCase()))) continue;
    if (ig.Source && !(safeToString(chest.Source || chest.source).toLowerCase().includes(safeToString(ig.Source || ig.source).toLowerCase()))) continue;
    if (ig.Level && safeToString(ig.Level).trim() !== safeToString(chest.level ?? chest.Level ?? '').trim()) continue;
    return true;
  }
  return false;
}

export function extractChestLevel(chestOrName, category) {
  // Accept either a chest object or a raw name string
  let chestName = '';
  let source = '';
  let type = '';
  let explicitLevel = null;
  if (chestOrName && typeof chestOrName === 'object') {
    chestName = safeToString(chestOrName.Name || chestOrName.name || '');
    source = safeToString(chestOrName.Source || chestOrName.source || '');
    type = safeToString(chestOrName.Type || chestOrName.type || '');
    explicitLevel = chestOrName.level ?? chestOrName.Level ?? null;
  } else {
    chestName = safeToString(chestOrName || '');
  }

  const bankLevels = ["wooden", "bronze", "silver", "golden", "precious", "magic"];
  const catLower = safeToString(category || '').toLowerCase();

  // If explicit level is given and looks like textual bank-levels, return that
  if (explicitLevel !== null && explicitLevel !== undefined && explicitLevel !== '') {
    const el = String(explicitLevel).trim();
    // numeric?
    const n = Number(el);
    if (!isNaN(n)) return n;
    // textual bank level
    const elNorm = normalizeChestName(el);
    const foundText = bankLevels.find(l => elNorm.includes(l));
    if (foundText) return foundText.charAt(0).toUpperCase() + foundText.slice(1);
  }

  // Build a combined normalized string from name/type/source to find numeric level anywhere
  const combined = normalizeChestName([chestName, type, source].filter(Boolean).join(' '));

  // Bank chest textual levels
  if (categoriesMatchTolerant(category || '', 'Bank Chests') || catLower.includes('bank')) {
    const found = bankLevels.find(l => combined.includes(l));
    if (found) return found.charAt(0).toUpperCase() + found.slice(1);
  }

  // Look for first numeric token in combined string
  const m = combined.match(/(\d{1,3})/);
  if (m) return Number(m[1]);

  return null;
}

export function chestMatchesLevel(chestOrName, targetLevel, category) {
  if (targetLevel === undefined || targetLevel === null) return false;
  // If first arg is an object, try to derive its level first
  let chestLevel = null;
  let name = '';
  if (chestOrName && typeof chestOrName === 'object') {
    chestLevel = extractChestLevel(chestOrName, category);
    name = safeToString(chestOrName.Name || chestOrName.name || '');
  } else {
    name = safeToString(chestOrName || '');
  }

  // If we have a numeric chestLevel, use it for comparisons
  if (typeof targetLevel === 'string' && targetLevel.includes('-')) {
    const [s, e] = targetLevel.split('-').map(x => Number(x.trim()));
    if (!isNaN(s) && !isNaN(e)) {
      if (chestLevel !== null && chestLevel !== undefined) return Number(chestLevel) >= s && Number(chestLevel) <= e;
      const m = normalizeChestName(name).match(/(\d+)/);
      if (!m || isNaN(s) || isNaN(e)) return false;
      const lv = Number(m[1]);
      return lv >= s && lv <= e;
    }
    return false;
  }

  if (typeof targetLevel === 'number') {
    if (chestLevel !== null && chestLevel !== undefined) return Number(chestLevel) === targetLevel;
    const m = normalizeChestName(name).match(/(\d+)/);
    if (!m) return false;
    return Number(m[1]) === targetLevel;
  }

  // Fallback textual match (e.g., 'Wooden')
  if (chestLevel !== null && chestLevel !== undefined && String(chestLevel).toLowerCase() === String(targetLevel).toLowerCase()) return true;
  return normalizeChestName(name).includes(normalizeChestName(targetLevel));
}

export function getChestPoints(chest, chestMappings) {
  chest = chest || {};
  const mappings = Array.isArray(chestMappings) ? chestMappings : [];
  if (mappings.length === 0) return 0;
  const typeB = safeToString(chest.Type || chest.type || '');
  const nameB = safeToString(chest.Name || chest.name || '');
  const categoryB = safeToString(chest.category || chest.Category || chest.Type || '');
  // Normalize levelB by attempting to extract numeric/textual level from chest fields
  const extractedLevel = extractChestLevel(chest, chest.category || chest.Category || chest.Type || chest.Source || '');
  const levelB = extractedLevel !== null && extractedLevel !== undefined ? extractedLevel : safeToString(chest.level ?? chest.Level ?? '');

  let best = null;
  let bestScore = -1;

  for (const m of mappings) {
    const typeA = safeToString(m.type || m.Type || '');
    const nameA = safeToString(m.chestName || m.Name || '');
    const categoryA = safeToString(m.category || m.Category || '');
    const levelA = safeToString(m.level || m.Level || '');
    let score = 0;

    // strong exact name match
    if (nameA && nameA.toLowerCase() === nameB.toLowerCase()) score += 100;
    // substring matches (tolerant for OCR differences)
    else if (nameA && nameB && nameA.toLowerCase().includes(nameB.toLowerCase())) score += 40;
    else if (nameA && nameB && nameB.toLowerCase().includes(nameA.toLowerCase())) score += 30;

    // category similarity
    if (categoryA && categoriesMatchTolerant(categoryA, categoryB)) score += 20;

    // type match
    if (typeA && typeA.toLowerCase() === typeB.toLowerCase()) score += 5;

    // level match (numeric or textual)
    if (levelA && (levelB !== undefined && levelB !== null && levelB !== '')) {
      const nA = Number(levelA);
      const nB = Number(levelB);
      if (!isNaN(nA) && !isNaN(nB) && nA === nB) score += 30;
      else if (String(levelA).toLowerCase() === String(levelB).toLowerCase()) score += 10;
      else {
        // try extracting numeric from levelA textual forms like 'Level 25'
        const mA = normalizeChestName(levelA).match(/(\d{1,3})/);
        const mB = typeof levelB === 'string' ? normalizeChestName(levelB).match(/(\d{1,3})/) : null;
        const vA = mA ? Number(mA[1]) : (isNaN(Number(levelA)) ? NaN : Number(levelA));
        const vB = mB ? Number(mB[1]) : (isNaN(Number(levelB)) ? NaN : Number(levelB));
        if (!isNaN(vA) && !isNaN(vB) && vA === vB) score += 25;
      }
    }

    // prefer higher score even when not all fields match
    if (score > bestScore) { bestScore = score; best = m; }
  }

  if (best && best.points !== undefined && best.points !== '') return Number(best.points) || 0;
  return 0;
}

export function fallbackCategory(chest) {
  const name = normalizeChestName(safeToString(chest?.Name || chest?.name || ''));
  const type = normalizeChestName(safeToString(chest?.Type || chest?.type || ''));
  const source = normalizeChestName(safeToString(chest?.Source || chest?.source || ''));
  if (name.includes('arena') || type.includes('arena') || source.includes('arena')) return 'Arena Total';
  if (name.includes('bank') || type.includes('bank') || source.includes('bank')) return 'Bank Total';
  if (name.includes('epic') || type.includes('epic') || source.includes('epic')) return 'Epic Total';
  if (name.includes('rare') || type.includes('rare') || source.includes('rare')) return 'Rare Total';
  if (name.includes('tartaros') || type.includes('tartaros') || source.includes('tartaros')) return 'Tartaros Total';
  if (chest && chest.category) return chest.category;
  if (chest && chest.Type) return chest.Type;
  if (chest && chest.Name) return chest.Name;
  return 'Unbekannt';
}

export function fallbackLevel(chest) {
  return chest?.level ?? chest?.Level ?? 0;
}

export function calculatePlayerNorms({ playersArr = [], resultsArr = [], chestMappings = [], normsArr = [], ignoreChests = [], periodsArr = [], currentPeriodId = null }) {
  function getNormPoints(troopStrength) {
    const name = safeToString(troopStrength).trim().toLowerCase() || 'nicht definiert';
    const found = (normsArr || []).find(n => safeToString(n.troopStrength).trim().toLowerCase() === name);
    return found ? Number(found.value) || 0 : 0;
  }
  const filtered = currentPeriodId ? (resultsArr || []).filter(r => r.periodId === currentPeriodId) : (resultsArr || []);
  const playerMap = new Map();
  for (const doc of filtered) {
    const candidates = [];
    if (!doc) continue;
    if (doc.Clanmate || doc.clanmate || doc.player || doc.playerName) candidates.push(doc);
    else if (Array.isArray(doc)) doc.forEach(i => { if (i) candidates.push(i); });
    else if (typeof doc === 'object') {
      for (const v of Object.values(doc)) {
        if (Array.isArray(v)) v.forEach(i => { if (i && (i.Clanmate || i.chests)) candidates.push(i); });
        else if (v && (v.Clanmate || v.chests)) candidates.push(v);
      }
    }
    for (const res of candidates) {
      const mainName = mapToMainName(playersArr || [], res.Clanmate || res.clanmate || res.player || res.playerName || '');
      if (!mainName) continue;
      const playerDef = (playersArr || []).find(p => p.name === mainName) || {};
      const troopStrength = playerDef?.troopStrength || res.troopStrength || '';
      const normPoints = getNormPoints(troopStrength);
      if (!playerMap.has(mainName)) {
        playerMap.set(mainName, { name: mainName, ist: 0, soll: normPoints, chestDetails: [], timestamp: res.timestamp || res.uploadTime || null, rank: playerDef?.rank || playerDef?.position || '', troopStrength: playerDef?.troopStrength || troopStrength || '', chests: 0 });
      }
      const entry = playerMap.get(mainName);
      const rawChests = res.chests;
      const normalized = [];
      if (Array.isArray(rawChests)) normalized.push(...rawChests);
      else if (rawChests && typeof rawChests === 'object') {
        for (const [cat, val] of Object.entries(rawChests)) {
          if (Array.isArray(val)) val.forEach(item => normalized.push({ ...(item || {}), category: cat }));
          else if (val && typeof val === 'object') for (const [lvl, cnt] of Object.entries(val)) { const count = Number(cnt) || 0; if (count > 0) normalized.push({ Name: '', Type: '', Source: '', category: cat, level: lvl, count }); }
        }
      }
      for (const rc of normalized) {
        try {
          if (!rc) continue;
          if (isIgnoredChest(rc, ignoreChests)) continue;
          const category = rc.category || rc.Type || rc.Source || rc.Category || '';
          const level = extractChestLevel(rc.Name || rc.name || '', category) ?? (rc.level ?? rc.Level ?? '');
          const count = Number(rc.count ?? rc.Count ?? 1) || 1;
          const pointsPer = getChestPoints({ ...rc, category, level }, chestMappings) || 0;
          const points = Number(pointsPer) * count;
          entry.ist = (entry.ist || 0) + points;
          entry.chests = (entry.chests || 0) + count;
          if (res.timestamp || res.uploadTime) {
            const ts = res.timestamp || res.uploadTime;
            if (!entry.timestamp) entry.timestamp = ts;
            else { const prev = new Date(entry.timestamp).getTime ? new Date(entry.timestamp).getTime() : 0; const cur = new Date(ts).getTime ? new Date(ts).getTime() : 0; if (!isNaN(cur) && cur > prev) entry.timestamp = ts; }
          }
          entry.chestDetails.push({ Name: rc.Name || rc.name || '', Type: rc.Type || rc.type || '', Source: rc.Source || rc.source || '', category: mapCategoryToPageName(category || rc.category || rc.Type || rc.Source || ''), level: level ?? '', count, points: Number(points) || 0 });
        } catch (e) {
          // swallow
        }
      }
    }
  }
  const final = Array.from(playerMap.values()).map(e => { const soll = Number(e.soll || 0); const ist = Number(e.ist || 0); const percent = soll > 0 ? Math.round((ist / soll) * 100) : 0; return { ...e, ist, soll, percent, differenz: ist - soll, chestDetails: e.chestDetails || [] }; });
  return final;
}
