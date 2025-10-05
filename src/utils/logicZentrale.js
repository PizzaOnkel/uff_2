import { mapToMainName } from "../utils/aliasMapping";

// **INTELLIGENTE SONDERZEICHEN-NORMALISIERUNG**
// Behandelt Apostrophe, Umlaute und andere Sonderzeichen für besseres String-Matching
export function normalizeChestName(name) {
  if (!name || typeof name !== 'string') return '';
  
  let normalized = name.trim().toLowerCase();
  
  // **OCR-FEHLER KORREKTUREN**
  // Häufige OCR-Lesefehler automatisch korrigieren
  const ocrFixes = {
    // Pipe-Zeichen am Ende entfernen
    '|': '',
    ' |': '', // auch mit Leerzeichen
    '| ': '', // auch mit nachfolgendem Leerzeichen
    // Unicode-Fehler korrigieren
    'â€˜': "'",  // Fenrirâ€˜s -> Fenrir's
    'â€™': "'",  // Variante
    'Ã¯': 'i',   // heroÃ¯c -> heroic
    'ã¯': 'i',   // heroã¯c -> heroic (weitere Variante)
    'Ð¡': 'c',   // Level 15 Ð¡ -> Level 15 C
    'Ä±': 'n',   // BarbariarÄ± -> Barbarian
    'ae±': '',   // Barbarianae± -> Barbarian
    // Häufige Tippfehler
    'abandpned': 'abandoned',  // Abandpned -> Abandoned
    'elveri': 'elven',         // Elveri -> Elven
    'elvri': 'elven',          // Elvri -> Elven
    'elvrin': 'elven',         // Elvrin -> Elven
    'elvenn': 'elven',         // Elvenn -> Elven
    'cidadel': 'citadel',      // Cidadel -> Citadel
    'barbariar': 'barbarian',  // BarbariarÄ± -> Barbarian (zusätzlich)
    'barbariarn': 'barbarian', // Barbariarn -> Barbarian
    'barbarianae': 'barbarian', // Barbarianae± -> Barbarian
    'bankk': 'bank',           // Bankk -> Bank
    'heroã¯c': 'heroic',       // heroã¯c -> heroic
    'ancientsâ€™': "ancients'", // Ancientsâ€™ -> Ancients'
    'ancientsâ€˜': "ancients'", // Ancientsâ€˜ -> Ancients'
    'fenrirâ€™': "fenrir's",   // Fenrirâ€™ -> Fenrir's
    'fenrirâ€˜': "fenrir's",   // Fenrirâ€˜ -> Fenrir's
    // Truncated text
    ' ban': ' bank',  // Level 0 Ban -> Level 0 Bank
    ' 2 2': ' 22',    // Level 2 2 -> Level 22
    // Store-Fehler
    'hermes" store': 'hermes store', // Hermes" Store -> Hermes Store
  };
  
  // OCR-Korrekturen anwenden
  for (const [error, fix] of Object.entries(ocrFixes)) {
    normalized = normalized.replace(new RegExp(error, 'g'), fix);
  }
  
  return normalized
    // Apostrophe normalisieren (verschiedene Unicode-Varianten)
    .replace(/[''`´]/g, "'")
    // Umlaute normalisieren
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe') 
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    // Akzente normalisieren
    .replace(/[éèê]/g, 'e')
    .replace(/[áàâ]/g, 'a')
    .replace(/[íìî]/g, 'i')
    .replace(/[óòô]/g, 'o')
    .replace(/[úùû]/g, 'u')
    // Weitere Sonderzeichen
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    // Mehrfache Leerzeichen normalisieren
    .replace(/\s+/g, ' ')
    .trim();
}

// Toleranter String-Vergleich mit Sonderzeichen-Normalisierung
export function stringsMatchTolerant(str1, str2) {
  if (!str1 || !str2) return false;
  
  const norm1 = normalizeChestName(str1);
  const norm2 = normalizeChestName(str2);
  
  // Exakte Übereinstimmung nach Normalisierung
  if (norm1 === norm2) return true;
  
  // Teilstring-Matching
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
  return false;
}

// 1:1-Übernahme der Normberechnung aus CurrentTotalEventPage.js
export function calculatePlayerNorms({ playersArr, resultsArr, chestMappings, normsArr, ignoreChests, periodsArr, currentPeriodId }) {
  function getNormPoints(troopStrengthName) {
    if (!troopStrengthName || troopStrengthName.trim() === '') {
      troopStrengthName = 'nicht definiert';
    }
    const norm = normsArr.find(n => String(n.troopStrength).trim().toLowerCase() === String(troopStrengthName).trim().toLowerCase());
    return norm ? Number(norm.value) : 0;
  }
  function isArenaChest(chest) {
    return (
      (chest.category && chest.category === "Arena Chests") ||
      chest.Type === "Arena" ||
      chest.Source === "Arena"
    );
  }
  function isIgnoredChest(chest) {
    // Fallback: ignoreChests immer als Array behandeln
    const ignoreArr = Array.isArray(ignoreChests) ? ignoreChests : [];
    if (isArenaChest(chest)) return false;
    for (const ignore of ignoreArr) {
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
  // Nur Ergebnisse der aktuellen Periode berücksichtigen
  const filteredResults = currentPeriodId
    ? resultsArr.filter(r => r.periodId === currentPeriodId)
    : resultsArr;
    
  // PERFORMANCE-OPTIMIERUNG: Erstelle Mapping-Index für schnellere Suche
  const mappingCache = new Map();
  if (chestMappings.length > 0) {
    chestMappings.forEach(m => {
      const key = `${(m.type || m.Type || "").trim().toLowerCase()}_${(m.chestName || m.Name || "").trim().toLowerCase()}_${(m.category || "").trim().toLowerCase()}_${String(m.levelStart || m.level || m.Level || m.levelEnd || "").trim().toLowerCase()}`;
      if (!mappingCache.has(key)) {
        mappingCache.set(key, []);
      }
      mappingCache.get(key).push(m);
    });
  }
  
  const playerMap = new Map();
  filteredResults.forEach(result => {
    const mainName = mapToMainName(playersArr, result.Clanmate);
    const player = playersArr.find(p => p.name === mainName);
    let troopStrength = player?.troopStrength || result.troopStrength || '';
    if (!troopStrength || troopStrength.trim() === '') {
      troopStrength = 'nicht definiert';
    }
    const normPoints = getNormPoints(troopStrength);
    const mappedChests = Array.isArray(result.chests)
      ? result.chests.map(chest => {
          if (!chest.category && chest.Type) chest.category = chest.Type;
          // --- Patch: Tartaros-Level aus Type/Source extrahieren, wenn Level leer oder 0 ---
          let levelRaw = chest.level ?? chest.Level ?? chest.levelStart ?? chest.levelEnd ?? "";
          let levelStr = String(levelRaw).trim();
          if (levelStr === "" || levelStr === "0" || levelStr === 0) {
            // Versuche Level aus Type oder Source zu extrahieren
            let found = null;
            if (typeof chest.Type === "string") {
              found = chest.Type.match(/level\s*(\d+)/i);
            }
            if (!found && typeof chest.Source === "string") {
              found = chest.Source.match(/level\s*(\d+)/i);
            }
            if (found && found[1]) {
              levelStr = found[1];
            }
          }
          // Restliche Logik verwendet jetzt levelStr statt levelB
          let points = 0;
          let bestMapping = null;
          let bestScore = -1;
          
          // PERFORMANCE-OPTIMIERUNG: Verwende optimierte Mapping-Suche statt doppelter Schleife
          if (chestMappings.length > 0) {
            // Schnelle Suche: Erstelle Suchkriterien
            const typeB = (chest.Type || "").trim().toLowerCase();
            const nameB = (chest.Name || "").trim().toLowerCase();
            const categoryB = (chest.category || "").trim().toLowerCase();
            const sourceB = (chest.Source || chest.source || "").trim().toLowerCase();
            const levelB = String(levelStr).toLowerCase();
            
            // Kandidaten-Mappings sammeln (max 10-20 statt alle durchgehen)
            const candidateMappings = [];
            
            // Direkte Suche nach passenden Mappings
            for (const m of chestMappings) {
              const typeA = (m.type || m.Type || "").trim().toLowerCase();
              const nameA = (m.chestName || m.Name || "").trim().toLowerCase();
              const categoryA = (m.category || "").trim().toLowerCase();
              
              // Früher Ausschluss unpassender Mappings
              let couldMatch = false;
              if (typeA && typeB && typeA.includes(typeB.substring(0, 8))) couldMatch = true;
              if (nameA && nameB && nameA.includes(nameB.substring(0, 8))) couldMatch = true;
              if (categoryA && categoryB && categoryA.includes(categoryB.substring(0, 8))) couldMatch = true;
              if (!typeA && !nameA && !categoryA) couldMatch = true; // Generische Mappings
              
              if (couldMatch) {
                candidateMappings.push(m);
              }
              
              // Limitiere Kandidaten für Performance
              if (candidateMappings.length > 20) break;
            }
            
            // Nur die relevanten Kandidaten bewerten
            candidateMappings.forEach(m => {
              const typeA = (m.type || m.Type || "").trim().toLowerCase();
              const nameA = (m.chestName || m.Name || "").trim().toLowerCase();
              const categoryA = (m.category || "").trim().toLowerCase();
              const sourceA = (m.source || m.Source || "").trim().toLowerCase();
              const levelA = String(m.levelStart || m.level || m.Level || m.levelEnd || "").trim().toLowerCase();
              let score = 0;
              const isBankChest = (chest.category === "Bank Chests" || typeB === "bank" || sourceB === "bank");
              // --- Tartaros Spezial-Matching ---
              const isTartarosChest = (categoryB === "chests of tartaros" || nameB.includes("tartaros"));
              const isTartarosMapping = categoryA.startsWith("tartaros crypt level") || typeA.startsWith("tartaros crypt level");
              let tartarosMatch = false;
              if (isTartarosChest && isTartarosMapping) {
                // Level muss übereinstimmen
                const mappingLevel = (categoryA.match(/level (\d+)/) || typeA.match(/level (\d+)/));
                if (mappingLevel && mappingLevel[1] && levelB === mappingLevel[1]) {
                  tartarosMatch = true;
                  score += 10; // Priorisiere Tartaros-Match
                }
              }
              let matches = true;
              if (isBankChest) {
                if (nameA && nameB && nameB.includes(levelA)) score += 2;
                if (nameA && nameA === nameB) score++;
                if (categoryA && categoriesMatchTolerant(categoryA, categoryB)) score++;
                if (typeA && typeA === typeB) score++;
                if (sourceA && sourceA === sourceB) score++;
                if (levelA && (levelA === levelB || nameB.includes(levelA))) score++;
                matches = (
                  (!categoryA || categoriesMatchTolerant(categoryA, categoryB)) &&
                  (!typeA || typeA === typeB) &&
                  (!sourceA || sourceA === sourceB) &&
                  ((levelA && (levelA === levelB || nameB.includes(levelA))) || (!levelA))
                );
              } else if (tartarosMatch) {
                matches = true;
              } else {
                if (nameA && nameA === nameB) score++;
                let citadelMatch = false;
                if ((categoryA === 'citadel' && (categoryB === 'elven chests' || categoryB === 'cursed chests')) ||
                    ((categoryA === 'elven chests' || categoryA === 'cursed chests') && categoryB === 'citadel')) {
                  citadelMatch = true;
                }
                if (categoryA && (categoriesMatchTolerant(categoryA, categoryB) || citadelMatch)) score++;
                if (typeA && typeA === typeB) score++;
                if (sourceA && sourceA === sourceB) score++;
                if (levelA && (levelA === levelB || m.levelEnd === levelB)) score++;
                if (nameA && nameA !== nameB) matches = false;
                if (categoryA && !(categoriesMatchTolerant(categoryA, categoryB) || citadelMatch)) matches = false;
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
          // --- Common Chests Mapping zentralisiert mit Sonderzeichen-Normalisierung ---
          let nameLower = normalizeChestName(chest.Name || "");
          let typeLower = normalizeChestName(chest.Type || "");
          let sourceLower = normalizeChestName(chest.Source || "");
          let category = "Unbekannt";
          let level = chest.level ?? chest.Level ?? 0;
          if (
            typeLower.includes("common crypt") ||
            nameLower.includes("common chest") ||
            typeLower.includes("common chest")
          ) {
            category = "Common Chests";
            if ((!bestMapping || bestMapping.points === undefined) && chestMappings.length > 0) {
              const generic = chestMappings.find(m => {
                const mType = (m.type || m.Type || '').trim().toLowerCase();
                const mLevel = String(m.level || m.levelStart || m.Level || '').trim();
                return (mType === 'common crypt' || mType === 'common chest') && mLevel === String(level);
              });
              if (generic && generic.points !== undefined) {
                points = Number(generic.points);
              }
            }
          }
          else if (typeLower.includes("rare crypt") || nameLower.includes("rare dragon")) {
            category = "Rare Chests";
            if ((points === 0 || points === undefined) && chestMappings.length > 0) {
              const levelStr = String(level).trim();
              const generic = chestMappings.find(m => {
                const mType = (m.type || m.Type || '').trim().toLowerCase();
                const mName = (m.chestName || m.Name || '').trim().toLowerCase();
                const mCategory = (m.category || '').trim().toLowerCase();
                const mLevel = String(m.level || m.levelStart || m.Level || '').trim();
                const isRare = (mType + mName + mCategory).includes('rare');
                const isCryptOrDragon = (mType + mName + mCategory).includes('crypt') || (mType + mName + mCategory).includes('dragon');
                const levelMatch = mLevel === levelStr || Number(mLevel) === Number(levelStr);
                return isRare && isCryptOrDragon && levelMatch;
              });
              if (generic && generic.points !== undefined) {
                points = Number(generic.points);
              }
            }
          }
          else {
            if (
              (nameLower.includes("quick march chest") && typeLower.includes("rise of the ancients event")) ||
              (nameLower.includes("quick march chest") && sourceLower.includes("rise of the ancients event"))
            ) {
              category = "Quick March Chest";
            }
            else if (
              (nameLower.includes("ancients' chest") && typeLower.includes("rise of the ancients event")) ||
              (nameLower.replace("'","").includes("ancients chest") && typeLower.includes("rise of the ancients event")) ||
              (nameLower.includes("ancients' chest") && sourceLower.includes("rise of the ancients event")) ||
              (nameLower.replace("'","").includes("ancients chest") && sourceLower.includes("rise of the ancients event"))
            ) {
              category = "Ancients Chest";
            }
            else if (
              (chest.Name === "Golden Guardian Epic Chest") &&
              (chest.Type === "Epic Ancient squad") &&
              (chest.Source === "Epic Ancient squad")
            ) {
              category = "Epic Ancient squad";
            }
            else if (typeLower.includes("union of triumph personal reward") || sourceLower.includes("union of triumph personal reward")) {
              category = "Union Chest";
              level = "total";
            }
            else if (typeLower.includes("arena") || sourceLower.includes("arena") || nameLower.includes("arena")) {
              category = "Arena Chests";
              level = "total";
            }
            else if (nameLower.includes("elven citadel chest")) {
              category = "Elven Chests";
            } else if (nameLower.includes("cursed citadel chest")) {
              category = "Cursed Chests";
            }
            else if (nameLower.includes("citadel chest")) {
              if (nameLower.includes("elven")) {
                category = "Elven Chests";
              } else if (nameLower.includes("cursed")) {
                category = "Cursed Chests";
              }
            }
            else if (((chest.Type||chest.Kategorie||chest.Category||"").toLowerCase().includes("heroic monster"))) {
              category = "Heroic Chests";
            }
            else if (nameLower.includes("rare dragon") || typeLower.includes("rare crypt")) {
              category = "Rare Chests";
            }
            if (category === "Rare Chests" && (points === 0 || points === undefined) && chestMappings.length > 0) {
              const levelStr = String(level).trim();
              const generic = chestMappings.find(m => {
                const mType = (m.type || m.Type || '').trim().toLowerCase();
                const mName = (m.chestName || m.Name || '').trim().toLowerCase();
                const mCategory = (m.category || '').trim().toLowerCase();
                const mLevel = String(m.level || m.levelStart || m.Level || '').trim();
                const isRare = (mType + mName + mCategory).includes('rare');
                const isCryptOrDragon = (mType + mName + mCategory).includes('crypt') || (mType + mName + mCategory).includes('dragon');
                const levelMatch = mLevel === levelStr || Number(mLevel) === Number(levelStr);
                return isRare && isCryptOrDragon && levelMatch;
              });
              if (generic && generic.points !== undefined) {
                points = Number(generic.points);
              }
            }
            else if (nameLower.includes("epic") || typeLower.includes("epic") || nameLower.includes("undead")) {
              category = "Epic Chests";
              if ((points === 0 || points === undefined) && chestMappings.length > 0) {
                const levelStr = String(level).trim();
                const generic = chestMappings.find(m => {
                  const mType = (m.type || m.Type || '').trim().toLowerCase();
                  const mName = (m.chestName || m.Name || '').trim().toLowerCase();
                  const mCategory = (m.category || '').trim().toLowerCase();
                  const mLevel = String(m.level || m.levelStart || m.Level || '').trim();
                  const isEpic = (mType + mName + mCategory).includes('epic');
                  const isCryptOrUndead = (mType + mName + mCategory).includes('crypt') || (mType + mName + mCategory).includes('undead');
                  const levelMatch = mLevel === levelStr || Number(mLevel) === Number(levelStr);
                  const isAncientSquad = (mType + mName + mCategory).includes('ancient squad');
                  return isEpic && isCryptOrUndead && levelMatch && !isAncientSquad;
                });
                if (generic && generic.points !== undefined) {
                  points = Number(generic.points);
                }
              }
            }
            else if (
              nameLower.includes("bank") || typeLower.includes("bank") || sourceLower.includes("bank") ||
              ["wooden","bronze","silver","golden","precious","magic"].some(lvl => nameLower.includes(lvl) || typeLower.includes(lvl))
            ) {
              category = "Bank Chests";
              const bankLevels = ["Wooden","Bronze","Silver","Golden","Precious","Magic"];
              let foundLevel = bankLevels.find(lvl =>
                nameLower.includes(lvl.toLowerCase()) ||
                typeLower.includes(lvl.toLowerCase()) ||
                (chest.level||"").toString().toLowerCase() === lvl.toLowerCase() ||
                (chest.Level||"").toString().toLowerCase() === lvl.toLowerCase()
              );
              if (!foundLevel && (chest.level || chest.Level)) {
                const num = Number(chest.level ?? chest.Level);
                if (!isNaN(num) && num >= 1 && num <= 6) {
                  foundLevel = bankLevels[num-1];
                }
              }
              if (!foundLevel) foundLevel = "Unbekannt";
              level = foundLevel;
            }
            else if (nameLower.includes("tartaros") || typeLower.includes("tartaros") || sourceLower.includes("tartaros")) {
              category = "Chests of Tartaros";
              let tartarosMatch = (chest.Name||"").match(/tartaros crypt level (\d+)/i);
              if (!tartarosMatch && chest.Type) {
                tartarosMatch = (chest.Type||"").match(/tartaros crypt level (\d+)/i);
              }
              if (!tartarosMatch && chest.Source) {
                tartarosMatch = (chest.Source||"").match(/tartaros crypt level (\d+)/i);
              }
              if (tartarosMatch) {
                level = Number(tartarosMatch[1]);
              } else if ([15,20,25,30,35].includes(Number(chest.level ?? chest.Level))) {
                level = Number(chest.level ?? chest.Level);
              } else {
                level = chest.level ?? chest.Level ?? 0;
              }
              // --- Patch: Tolerantes Mapping für Tartaros Chests ---
              if ((points === 0 || points === undefined) && chestMappings.length > 0) {
                const levelStr = String(level).trim();
                const generic = chestMappings.find(m => {
                  const mType = (m.type || m.Type || '').trim().toLowerCase();
                  const mName = (m.chestName || m.Name || '').trim().toLowerCase();
                  const mCategory = (m.category || '').trim().toLowerCase();
                  const mLevel = String(m.level || m.levelStart || m.Level || '').trim();
                  // Enthält Typ, Name oder Kategorie 'tartaros' und 'crypt level'
                  const isTartaros = (mType + mName + mCategory).includes('tartaros');
                  const isCryptLevel = (mType + mName + mCategory).includes('crypt level');
                  // Level-Vergleich tolerant (String/Number)
                  const levelMatch = mLevel === levelStr || Number(mLevel) === Number(levelStr);
                  return isTartaros && isCryptLevel && levelMatch;
                });
                if (generic && generic.points !== undefined) {
                  points = Number(generic.points);
                }
              }
            }
            else if (nameLower.includes("jormungandr") || typeLower.includes("jormungandr") || sourceLower.includes("jormungandr")) {
              category = "Jormungandr Chests";
              level = "total";
            }
            else if (nameLower.includes("authority") || typeLower.includes("authority") || sourceLower.includes("authority")) {
              category = "Union Chest";
              level = "total";
            }
            else if (nameLower.includes("runic") || typeLower.includes("runic") || sourceLower.includes("runic")) {
              category = "Runic Chests";
            }
            else if (nameLower.includes("vault") || typeLower.includes("vault") || sourceLower.includes("vault")) {
              category = "Vault of the Ancients";
            }
            else if (nameLower.includes("quick march") || typeLower.includes("quick march") || sourceLower.includes("quick march")) {
              category = "Quick March Chest";
            }
            else if (nameLower.includes("ancients chest") || typeLower.includes("ancients chest") || sourceLower.includes("ancients chest")) {
              category = "Ancients Chest";
            }
            else if (nameLower.includes("rota") || typeLower.includes("rota") || sourceLower.includes("rota")) {
              category = "ROTA Total";
            }
            else if (nameLower.includes("epic ancient squad") || typeLower.includes("epic ancient squad") || sourceLower.includes("epic ancient squad")) {
              category = "Epic Ancient squad";
            }
            else if (nameLower.includes("eas total") || typeLower.includes("eas total") || sourceLower.includes("eas total")) {
              category = "EAs Total";
            }
            else if (nameLower.includes("union total") || typeLower.includes("union total") || sourceLower.includes("union total")) {
              category = "Union Total";
            }
            if (category === "Unbekannt") {
              category = chest.category || fallbackCategory(chest);
            }
          }
          return {
            ...chest,
            category,
            // Nutze level (lokale Variable) für die Rückgabe, falls levelStr leer ist
            level: level,
            count: chest.count || 1,
            points
          };
        })
      : [];
    // Filtere nur ignorierte Truhen raus (außer Arena)
    const filteredChests = mappedChests.filter(chest => {
      return !isIgnoredChest(chest);
    });
    const ist = filteredChests.reduce((sum, chest) => sum + (chest.points || 0), 0);
    // Timestamp-Logik: Versuche result.timestamp oder result.uploadtime zu verwenden
    let resultTimestamp = result.timestamp || result.uploadtime || null;
    // Versuche, String in Date umwandeln, falls vorhanden
    let tsDate = resultTimestamp ? new Date(resultTimestamp) : null;
    if (playerMap.has(mainName)) {
      const entry = playerMap.get(mainName);
      entry.ist += ist;
      // chestDetails anhängen (falls mehrere Ergebnisse pro Spieler)
      entry.chestDetails = (entry.chestDetails || []).concat(filteredChests);
      entry.chests = (entry.chests || 0) + filteredChests.length;
      // Timestamp: immer den neuesten Wert nehmen
      if (tsDate && (!entry.timestamp || new Date(entry.timestamp) < tsDate)) {
        entry.timestamp = resultTimestamp;
      }
    } else {
      playerMap.set(mainName, {
        name: mainName,
        troopStrength,
        rank: player?.rank || "", // Rang ergänzen!
        ist,
        soll: normPoints,
        normErfuellung: 0,
        chestDetails: filteredChests,
        chests: filteredChests.length,
        timestamp: resultTimestamp || ""
      });
    }
  });
  playerMap.forEach(entry => {
    entry.normErfuellung = entry.soll > 0 ? Math.round((entry.ist / entry.soll) * 100) : 0;
    entry.percent = entry.normErfuellung; // Für Kompatibilität mit Tabelle
    entry.differenz = (entry.ist || 0) - (entry.soll || 0);
    // Fallback: leeres Array, falls keine Truhen
    if (!entry.chestDetails) entry.chestDetails = [];
    // Timestamp-Format: yyyy-mm-dd / hh:mm
    if (entry.timestamp) {
      let d = new Date(entry.timestamp);
      if (!isNaN(d.getTime())) {
        const pad = n => n.toString().padStart(2, '0');
        entry.timestamp = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} / ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    }
  });
  return Array.from(playerMap.values());
}
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

// Hilfsfunktion: Fallback-Mapping für category/level mit Sonderzeichen-Support
export function fallbackCategory(chest) {
  const name = normalizeChestName(chest.Name || '');
  const type = normalizeChestName(chest.Type || '');
  const source = normalizeChestName(chest.Source || '');
  
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

// **ERWEITERTE BEREICHS-LEVEL-FUNKTIONEN**
// Unterstützt sowohl normale Level als auch Bereiche (z.B. "1-5", "10-15")
export function chestMatchesLevel(chest, targetLevel, category) {
  // Kompatibilität: Behandle sowohl chest-Objekt als auch chestName-String
  const chestName = typeof chest === 'string' ? chest : (chest?.Name || chest?.name || '');
  
  if (targetLevel === undefined) return false;
  
  // WICHTIG: Verwende chest.level falls verfügbar (von calculatePlayerNorms gesetzt)
  let chestLevel = null;
  if (typeof chest === 'object' && chest !== null) {
    chestLevel = chest.level;
  }
  
  // Fallback: Level aus Namen extrahieren falls chest.level nicht verfügbar
  if (chestLevel === null || chestLevel === undefined) {
    if (!chestName) return false;
    const normalizedName = normalizeChestName(chestName);
    
    // Für Bank Chests
    if (category === "Bank Chests") {
      const bankLevels = ["wooden", "bronze", "silver", "golden", "precious", "magic"];
      const foundLevel = bankLevels.find(level => normalizedName.includes(level));
      chestLevel = foundLevel ? foundLevel.charAt(0).toUpperCase() + foundLevel.slice(1) : null;
    } else {
      // Numerische Level extrahieren
      const levelMatch = normalizedName.match(/(\d+)/);
      chestLevel = levelMatch ? parseInt(levelMatch[1]) : null;
    }
  }
  
  if (chestLevel === null || chestLevel === undefined) return false;
  
  // Vergleiche chestLevel mit targetLevel
  // Für String-Level (Bank Chests)
  if (typeof targetLevel === 'string' && typeof chestLevel === 'string') {
    const normalizedTarget = normalizeChestName(targetLevel);
    const normalizedChest = normalizeChestName(chestLevel);
    return normalizedChest === normalizedTarget;
  }
  
  // Für numerische Level - exakter Match
  if (typeof targetLevel === 'number' && typeof chestLevel === 'number') {
    return chestLevel === targetLevel;
  }
  
  // Für Bereichs-Level (z.B. "20-24")
  if (typeof targetLevel === 'string' && targetLevel.includes('-') && typeof chestLevel === 'number') {
    const [start, end] = targetLevel.split('-').map(x => parseInt(x.trim()));
    if (!isNaN(start) && !isNaN(end)) {
      return chestLevel >= start && chestLevel <= end;
    }
  }
  
  return false;
}

// Intelligente Level-Extraktion mit Bereichs-Support
export function extractChestLevel(chestName, category) {
  if (!chestName) return null;
  
  const normalizedName = normalizeChestName(chestName);
  
  // Bank Chests haben String-Level
  if (category === "Bank Chests") {
    const bankLevels = ["wooden", "bronze", "silver", "golden", "precious", "magic"];
    const foundLevel = bankLevels.find(level => normalizedName.includes(level));
    return foundLevel ? foundLevel.charAt(0).toUpperCase() + foundLevel.slice(1) : null;
  }
  
  // Numerische Level extrahieren
  const levelMatch = normalizedName.match(/(\d+)/);
  if (levelMatch) {
    return parseInt(levelMatch[1]);
  }
  
  return null;
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
  // Fallback: ignoreChests immer als Array behandeln
  const ignoreArr = Array.isArray(ignoreChests) ? ignoreChests : [];
  if (isArenaChest(chest)) return false;
  for (const ignore of ignoreArr) {
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
// Hilfsfunktion für toleranten Kategorie-Vergleich (z.B. Tartaros) mit Sonderzeichen-Support
function categoriesMatchTolerant(catA, catB) {
  if (!catA || !catB) return false;
  
  const a = normalizeChestName(catA);
  const b = normalizeChestName(catB);
  
  // Tolerant für Tartaros
  if ((a.includes('tartaros') && b.includes('tartaros'))) return true;
  // Tolerant für Elven/Cursed/Citadel
  if ((a.includes('elven') && b.includes('elven')) || (a.includes('cursed') && b.includes('cursed')) || (a.includes('citadel') && b.includes('citadel'))) return true;
  // Tolerant für Epic
  if (a.includes('epic') && b.includes('epic')) return true;
  // Tolerant für Rare
  if (a.includes('rare') && b.includes('rare')) return true;
  // Tolerant für Bank
  if (a.includes('bank') && b.includes('bank')) return true;
  // Tolerant für Runic
  if (a.includes('runic') && b.includes('runic')) return true;
  // Tolerant für Heroic
  if (a.includes('heroic') && b.includes('heroic')) return true;
  // Tolerant für Jormungandr
  if (a.includes('jormungandr') && b.includes('jormungandr')) return true;
  // Tolerant für Union
  if (a.includes('union') && b.includes('union')) return true;
  // Tolerant für ROTA
  if (a.includes('rota') && b.includes('rota')) return true;
  // Sonst exakter Vergleich
  return a === b;
}

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
        if (categoryA && categoriesMatchTolerant(categoryA, categoryB)) score++;
        if (typeA && typeA === typeB) score++;
        if (sourceA && sourceA === sourceB) score++;
        if (levelA && (levelA === levelB || nameB.includes(levelA))) score++;
        matches = (
          (!categoryA || categoriesMatchTolerant(categoryA, categoryB)) &&
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
        if (categoryA && (categoriesMatchTolerant(categoryA, categoryB) || citadelMatch)) score++;
        if (typeA && typeA === typeB) score++;
        if (sourceA && sourceA === sourceB) score++;
        if (levelA && (levelA === levelB || m.levelEnd === levelB)) score++;
        if (nameA && nameA !== nameB) matches = false;
        if (categoryA && !(categoriesMatchTolerant(categoryA, categoryB) || citadelMatch)) matches = false;
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