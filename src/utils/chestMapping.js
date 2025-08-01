// Gemeinsame Mapping-Logik für Truhen-Kategorien und Level
// Aus CurrentTotalEventPage.js extrahiert

export function mapChestToCategoryAndLevel(chest, chestMappings = []) {
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
      if (nameA && nameA === nameB) score++;
      // Kategorie-Matching: Für Citadel akzeptiere auch 'Citadel' <-> 'Elven Chests'/'Cursed Chests'
      let citadelMatch = false;
      if ((categoryA === 'citadel' && (categoryB === 'elven chests' || categoryB === 'cursed chests')) ||
          ((categoryA === 'elven chests' || categoryA === 'cursed chests') && categoryB === 'citadel')) {
        citadelMatch = true;
      }
      if (categoryA && (categoryA === categoryB || citadelMatch)) score++;
      if (typeA && typeA === typeB) score++;
      if (sourceA && sourceA === sourceB) score++;
      if (levelA && (levelA === levelB || m.levelEnd === levelB)) score++;
      let matches = true;
      if (nameA && nameA !== nameB) matches = false;
      if (categoryA && !(categoryA === categoryB || citadelMatch)) matches = false;
      if (typeA && typeA !== typeB) matches = false;
      if (sourceA && sourceA !== sourceB) matches = false;
      if (levelA && (levelA !== levelB && m.levelEnd !== levelB)) matches = false;
      if (matches && score > bestScore) {
        bestScore = score;
        bestMapping = m;
      }
    });
    if (bestMapping && bestMapping.points !== undefined) {
      points = Number(bestMapping.points);
    }
  }
  let category = "Unbekannt";
  let level = chest.level ?? chest.Level ?? 0;
  if ((chest.Type||"").toLowerCase().includes("arena") || (chest.Source||"").toLowerCase().includes("arena") || (chest.Name||"").toLowerCase().includes("arena")) {
    category = "Arena Chests";
    level = "total";
  }
  else if ((chest.Name||"").toLowerCase().includes("orc") || (chest.Type||"").toLowerCase().includes("common crypt")) {
    category = "Common Chests";
  }
  else if ((chest.Name||"").toLowerCase().includes("rare dragon") || (chest.Type||"").toLowerCase().includes("rare crypt")) {
    category = "Rare Chests";
  }
  else if ((chest.Name||"").toLowerCase().includes("epic") || (chest.Type||"").toLowerCase().includes("epic") || (chest.Name||"").toLowerCase().includes("undead")) {
    category = "Epic Chests";
  }
  else if ((chest.Name||"").toLowerCase().includes("elven") || (chest.Name||"").toLowerCase().includes("citadel") || (chest.Type||"").toLowerCase().includes("elven") || (chest.Type||"").toLowerCase().includes("citadel") || (chest.Source||"").toLowerCase().includes("elven") || (chest.Source||"").toLowerCase().includes("citadel")) {
    category = "Elven Chests";
  }
  else if (
    (chest.Name||"").toLowerCase().includes("bank") ||
    (chest.Type||"").toLowerCase().includes("bank") ||
    (chest.Source||"").toLowerCase().includes("bank") ||
    ["wooden","bronze","silver","golden","precious","magic"].some(lvl => (chest.Name||"").toLowerCase().includes(lvl) || (chest.Type||"").toLowerCase().includes(lvl))
  ) {
    category = "Bank Chests";
    const bankLevels = ["Wooden","Bronze","Silver","Golden","Precious","Magic"];
    let foundLevel = bankLevels.find(lvl =>
      (chest.Name||"").toLowerCase().includes(lvl.toLowerCase()) ||
      (chest.Type||"").toLowerCase().includes(lvl.toLowerCase()) ||
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
  else if ((chest.Name||"").toLowerCase().includes("jormungandr") || (chest.Type||"").toLowerCase().includes("jormungandr") || (chest.Source||"").toLowerCase().includes("jormungandr")) {
    category = "Jormungandr Chests";
    level = "total";
  }
  else if ((chest.Name||"").toLowerCase().includes("cursed") || (chest.Type||"").toLowerCase().includes("cursed") || (chest.Source||"").toLowerCase().includes("cursed")) {
    category = "Cursed Chests";
  }
  else if ((chest.Name||"").toLowerCase().includes("authority") || (chest.Type||"").toLowerCase().includes("authority") || (chest.Source||"").toLowerCase().includes("authority")) {
    category = "Union Chest";
    level = "total";
  }
  else if ((chest.Name||"").toLowerCase().includes("runic") || (chest.Type||"").toLowerCase().includes("runic") || (chest.Source||"").toLowerCase().includes("runic")) {
    category = "Runic Chests";
  }
  else if ((chest.Name||"").toLowerCase().includes("heroic") || (chest.Type||"").toLowerCase().includes("heroic") || (chest.Source||"").toLowerCase().includes("heroic")) {
    category = "Heroic Chests";
  }
  else if ((chest.Name||"").toLowerCase().includes("vault") || (chest.Type||"").toLowerCase().includes("vault") || (chest.Source||"").toLowerCase().includes("vault")) {
    category = "Vault of the Ancients";
  }
  else if ((chest.Name||"").toLowerCase().includes("quick march") || (chest.Type||"").toLowerCase().includes("quick march") || (chest.Source||"").toLowerCase().includes("quick march")) {
    category = "Quick March Chest";
  }
  else if ((chest.Name||"").toLowerCase().includes("ancients chest") || (chest.Type||"").toLowerCase().includes("ancients chest") || (chest.Source||"").toLowerCase().includes("ancients chest")) {
    category = "Ancients Chest";
  }
  else if ((chest.Name||"").toLowerCase().includes("rota") || (chest.Type||"").toLowerCase().includes("rota") || (chest.Source||"").toLowerCase().includes("rota")) {
    category = "ROTA Total";
  }
  else if ((chest.Name||"").toLowerCase().includes("epic ancient squad") || (chest.Type||"").toLowerCase().includes("epic ancient squad") || (chest.Source||"").toLowerCase().includes("epic ancient squad")) {
    category = "Epic Ancient squad";
  }
  else if ((chest.Name||"").toLowerCase().includes("eas total") || (chest.Type||"").toLowerCase().includes("eas total") || (chest.Source||"").toLowerCase().includes("eas total")) {
    category = "EAs Total";
  }
  else if ((chest.Name||"").toLowerCase().includes("union total") || (chest.Type||"").toLowerCase().includes("union total") || (chest.Source||"").toLowerCase().includes("union total")) {
    category = "Union Total";
  }
  if (category === "Unbekannt") {
    category = chest.category || (chest.Type || chest.Name || chest.Source || 'Unbekannt');
  }
  return {
    ...chest,
    category,
    level,
    count: chest.count || 1,
    points
  };
}
