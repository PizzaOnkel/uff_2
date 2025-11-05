// Debug-Script für Firebase Chest-Mappings
console.log('🔍 Checking Firebase chest mappings...');

// In der Browser-Konsole ausführen:
(async function() {
  try {
    // Firebase direkt von der Seite verwenden
    const { db } = window; // Falls db global verfügbar ist
    if (!db) {
      console.log('❌ Firebase db nicht verfügbar. Versuche import...');
      return;
    }
    
    const { getDocs, collection } = window; // Firebase functions
    const chestMappingsSnap = await getDocs(collection(db, "chestMappings"));
    const mappings = chestMappingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('📊 Total chest mappings in Firebase:', mappings.length);
    
    if (mappings.length === 0) {
      console.log('⚠️ PROBLEM: Keine Chest-Mappings in Firebase gefunden!');
      console.log('💡 Lösung: CSV-Import über Admin Panel → Chest Mapping → CSV Import Button');
      return;
    }
    
    // Prüfe Common Chest Mappings
    const commonMappings = mappings.filter(m => 
      (m.category || '').toLowerCase().includes('common') ||
      (m.type || '').toLowerCase().includes('common')
    );
    
    console.log('📦 Common Chest Mappings gefunden:', commonMappings.length);
    commonMappings.slice(0, 3).forEach((m, i) => {
      console.log(`${i+1}.`, {
        name: m.chestName,
        type: m.type,
        category: m.category,
        level: m.level,
        points: m.points
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();