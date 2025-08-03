// Punkte-Mapping für Epic Chests (analog Rare Chests, aber Ancient Squad ausgeschlossen)
export function getEpicChestPoints(chest, chestMappings) {
  if (!chestMappings || chestMappings.length === 0) return 0;
  const levelStr = String(chest.level ?? chest.Level ?? '').trim();
  const typeLower = (chest.Type || '').toLowerCase();
  const nameLower = (chest.Name || '').toLowerCase();
  const categoryLower = (chest.category || '').toLowerCase();
  // Epic Ancient squad explizit ausschließen
  if (typeLower.includes('ancient squad') || nameLower.includes('ancient squad') || categoryLower.includes('ancient squad')) return 0;
  const mapping = chestMappings.find(m => {
    const mType = (m.type || m.Type || '').trim().toLowerCase();
    const mName = (m.chestName || m.Name || '').trim().toLowerCase();
    const mCategory = (m.category || '').trim().toLowerCase();
    const mLevel = String(m.level || m.levelStart || m.Level || '').trim();
    // Enthält Typ, Name oder Kategorie sowohl 'epic' als auch ('crypt' oder 'undead')?
    const isEpic = (mType + mName + mCategory).includes('epic');
    const isCryptOrUndead = (mType + mName + mCategory).includes('crypt') || (mType + mName + mCategory).includes('undead');
    // Level-Vergleich tolerant (String/Number)
    const levelMatch = mLevel === levelStr || Number(mLevel) === Number(levelStr);
    // Epic Ancient squad explizit ausschließen
    const isAncientSquad = (mType + mName + mCategory).includes('ancient squad');
    return isEpic && isCryptOrUndead && levelMatch && !isAncientSquad;
  });
  if (mapping && mapping.points !== undefined) {
    return Number(mapping.points);
  }
  return 0;
}
// Zentrale Utility für Chest-Mapping, Filter und Punkteberechnung
// Hier werden alle Kernfunktionen gekapselt, die in mehreren Seiten benötigt werden

// Hilfsfunktion: Fallback-Mapping für category/level
export function fallbackCategory(chest) {
  const name = (chest.Name || '').toLowerCase();
  const type = (chest.Type || '').toLowerCase();
  const source = (chest.Source || '').toLowerCase();
  if (name.includes('arena') || type.includes('arena') || source.includes('arena')) return 'Arena Total';
  // Tolerant: auch "common chest" (Singular/Plural) in Name oder Typ akzeptieren
  if (type.includes('common crypt') || name.includes('common chest') || type.includes('common chest')) return 'Common Total';
  if (name.includes('rare dragon') || type.includes('rare crypt')) return 'Rare Total';
  // Spezialfälle zuerst!
  if (name.includes('elven citadel chest')) return 'Elven Total';
  if (name.includes('cursed citadel chest')) return 'Cursed Total';
  if (
    name.includes('epic ancient squad') || type.includes('epic ancient squad') || source.includes('epic ancient squad') ||
    name.includes('eas total') || type.includes('eas total') || source.includes('eas total') ||
    name.includes('eas') || type.includes('eas') || source.includes('eas')
  ) return 'EAs Total';
  if (
    name.includes('rota') || type.includes('rota') || source.includes('rota') ||
    name.includes('rise of the ancients') || type.includes('rise of the ancients') || source.includes('rise of the ancients')
  ) return 'ROTA Total';
  if (
    name.includes('union') || type.includes('union') || source.includes('union') ||
    name.includes('authority') || type.includes('authority') || source.includes('authority')
  ) return 'Union Total';
  if (name.includes('vault of the ancients') || type.includes('vault of the ancients') || source.includes('vault of the ancients')) return 'VotA Total';
  if (name.includes('epic') || type.includes('epic') || name.includes('undead')) return 'Epic Total';
  if (name.includes('tartaros') || type.includes('tartaros') || source.includes('tartaros')) return 'Tartaros Total';
  // KEINE weitere elven/citadel/cursed-Matches!
  if (
    name.includes('bank') || type.includes('bank') || source.includes('bank') ||
    ['wooden','bronze','silver','golden','precious','magic'].some(lvl => name.includes(lvl) || type.includes(lvl))
  ) return 'Bank Total';
  if (name.includes('runic') || type.includes('runic') || source.includes('runic')) return 'Runic Total';
  if (
    type.includes('heroic monster') || name.includes('heroic chest') || name.includes('heroic chests') ||
    type.includes('heroic chest') || type.includes('heroic chests') ||
    source.includes('heroic chest') || source.includes('heroic chests') ||
    name.includes('heroic') || type.includes('heroic') || source.includes('heroic')
  ) return 'Heroic Total';
  if (name.includes('jormungandr') || type.includes('jormungandr') || source.includes('jormungandr')) return 'Jormungandr Total';
  if (chest.category) return chest.category;
  if (chest.Type) return chest.Type;
  if (chest.Name) return chest.Name;
  if (chest.Source) return chest.Source;
  return 'Unbekannt';
}

export function fallbackLevel(chest) {
  return chest.level ?? chest.Level ?? 0;
}

// Arena-Truhen nie ignorieren (global)
export function isArenaChest(chest) {
  return (
    (chest.category && chest.category === "Arena Chests") ||
    chest.Type === "Arena" ||
    chest.Source === "Arena"
  );
}

// Ignore-Logik
export function isIgnoredChest(chest, ignoreChests) {
  if (isArenaChest(chest)) return false;
  for (const ignore of ignoreChests) {
    if (ignore.Name && ignore.Name.trim().toLowerCase() !== (chest.Name || "").trim().toLowerCase()) continue;
    if (
      ignore.Level &&
      ignore.Level.toString().trim() !== "" &&
      String(ignore.Level).trim() !== String(chest.level ?? chest.Level ?? "").trim()
    ) continue;
    if (ignore.Type && ignore.Type.trim() !== "") {
      if (!chest.Type) continue;
      const t1 = ignore.Type.trim().toLowerCase();
      const t2 = (chest.Type || "").trim().toLowerCase();
      if (!(t2.includes(t1))) continue;
    }
    if (ignore.Source && ignore.Source.trim() !== "") {
      if (!chest.Source) continue;
      const s1 = ignore.Source.trim().toLowerCase();
      const s2 = (chest.Source || "").trim().toLowerCase();
      if (!(s2.includes(s1))) continue;
    }
    return true;
  }
  return false;
}

// Mapping-Logik: Weist einer Chest das passende Mapping zu und gibt die Punkte zurück
export function getChestPoints(chest, chestMappings) {
  let points = 0;
  if (chestMappings.length > 0) {
    let bestMapping = null;
    let bestScore = -1;
    chestMappings.forEach(m => {
      const typeA = (m.type || m.Type || "").trim().toLowerCase();
      const typeB = (chest.Type || "").trim().toLowerCase();
      const nameA = (m.chestName || m.Name || "").trim().toLowerCase();
      const nameB = (chest.Name || "").trim().toLowerCase();
      const categoryA = (m.category || "").trim().toLowerCase();
      const categoryB = (chest.category || "").trim().toLowerCase();
      const sourceA = (m.source || m.Source || "").trim().toLowerCase();
      const sourceB = (chest.Source || chest.source || "").trim().toLowerCase();
      const levelA = String(m.levelStart || m.level || m.Level || m.levelEnd || "").trim().toLowerCase();
      const levelB = String(chest.level ?? chest.Level ?? chest.levelStart ?? chest.levelEnd ?? "").trim().toLowerCase();
      let score = 0;
      // Für Bank Chests: Mapping auch über Name, falls Level nicht passt
      const isBankChest = (chest.category === "Bank Chests" || typeB === "bank" || sourceB === "bank");
      let matches = true;
      if (isBankChest) {
        if (nameA && nameB && nameB.includes(levelA)) score += 2;
        if (nameA && nameA === nameB) score++;
        if (categoryA && categoryA === categoryB) score++;
        if (typeA && typeA === typeB) score++;
        if (sourceA && sourceA === sourceB) score++;
        if (levelA && (levelA === levelB || nameB.includes(levelA))) score++;
        matches = (
          (!categoryA || categoryA === categoryB) &&
          (!typeA || typeA === typeB) &&
          (!sourceA || sourceA === sourceB) &&
          ((levelA && (levelA === levelB || nameB.includes(levelA))) || (!levelA))
        );
      } else {
        if (nameA && nameA === nameB) score++;
        let citadelMatch = false;
        if ((categoryA === 'citadel' && (categoryB === 'elven chests' || categoryB === 'cursed chests')) ||
            ((categoryA === 'elven chests' || categoryA === 'cursed chests') && categoryB === 'citadel')) {
          citadelMatch = true;
        }
        if (categoryA && (categoryA === categoryB || citadelMatch)) score++;
        if (typeA && typeA === typeB) score++;
        if (sourceA && sourceA === sourceB) score++;
        if (levelA && (levelA === levelB || m.levelEnd === levelB)) score++;
        if (nameA && nameA !== nameB) matches = false;
        if (categoryA && !(categoryA === categoryB || citadelMatch)) matches = false;
        if (typeA && typeA !== typeB) matches = false;
        if (sourceA && sourceA !== sourceB) matches = false;
        if (levelA && (levelA !== levelB && m.levelEnd !== levelB)) matches = false;
      }
      if (matches && score > bestScore) {
        bestScore = score;
        bestMapping = m;
      }
    });
    if (bestMapping && bestMapping.points !== undefined) {
      points = Number(bestMapping.points);
    }
  }
  return points;
}
