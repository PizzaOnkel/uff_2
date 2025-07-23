// Script zum Extrahieren aller Name, Type und Source Werte aus JSON-Dateien
const fs = require('fs');
const path = require('path');

// Pfad zum JSON-Ordner
const jsonDir = 'c:\\Users\\user\\Desktop\\clan-dashboard\\uff_2\\public\\json-data';

// Sets für einzigartige Werte
const names = new Set();
const types = new Set();
const sources = new Set();

// Alle JSON-Dateien lesen
const files = fs.readdirSync(jsonDir).filter(file => file.endsWith('.json'));

console.log(`Verarbeite ${files.length} JSON-Dateien...`);

files.forEach(file => {
    const filePath = path.join(jsonDir, file);
    console.log(`Lese ${file}...`);
    
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Durchgehe alle Datumseinträge
        Object.keys(data).forEach(date => {
            const entries = data[date];
            
            // Durchgehe alle Clanmate-Einträge
            entries.forEach(entry => {
                if (entry.chests && Array.isArray(entry.chests)) {
                    // Durchgehe alle Chests
                    entry.chests.forEach(chest => {
                        if (chest.Name) names.add(chest.Name);
                        if (chest.Type) types.add(chest.Type);
                        if (chest.Source) sources.add(chest.Source);
                    });
                }
            });
        });
    } catch (error) {
        console.error(`Fehler beim Lesen von ${file}:`, error.message);
    }
});

// Sortiere die Arrays
const sortedNames = Array.from(names).sort();
const sortedTypes = Array.from(types).sort();
const sortedSources = Array.from(sources).sort();

console.log(`\nGefunden:`);
console.log(`- ${sortedNames.length} einzigartige Names`);
console.log(`- ${sortedTypes.length} einzigartige Types`);
console.log(`- ${sortedSources.length} einzigartige Sources`);

// CSV-Inhalt erstellen
let csvContent = 'Category,Value\n';

// Names hinzufügen
sortedNames.forEach(name => {
    csvContent += `Name,"${name}"\n`;
});

// Types hinzufügen
sortedTypes.forEach(type => {
    csvContent += `Type,"${type}"\n`;
});

// Sources hinzufügen
sortedSources.forEach(source => {
    csvContent += `Source,"${source}"\n`;
});

// CSV-Datei schreiben
const csvPath = path.join(jsonDir, 'extracted_data.csv');
fs.writeFileSync(csvPath, csvContent);

console.log(`\nCSV-Datei erstellt: ${csvPath}`);
console.log(`\nInhalt der CSV-Datei:`);
console.log(csvContent);

// Detaillierte Listen ausgeben
console.log(`\n=== NAMES ===`);
sortedNames.forEach(name => console.log(name));

console.log(`\n=== TYPES ===`);
sortedTypes.forEach(type => console.log(type));

console.log(`\n=== SOURCES ===`);
sortedSources.forEach(source => console.log(source));
