// Utility für Alias-Mapping
// players: Array aller Spielerobjekte mit name und aliases
// name: beliebiger Name (Alias oder Hauptname)
export function mapToMainName(players, name) {
  if (!name || !players) return name;
  const lower = name.trim().toLowerCase();
  for (const p of players) {
    if (p.name && p.name.trim().toLowerCase() === lower) return p.name;
    if (Array.isArray(p.aliases) && p.aliases.some(a => a.trim().toLowerCase() === lower)) return p.name;
  }
  return name;
}
