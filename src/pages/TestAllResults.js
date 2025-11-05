import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function TestAllResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chestTypes, setChestTypes] = useState([]);

  useEffect(() => {
    async function loadAllData() {
      console.log("🚨 LOADING ALL RESULTS WITHOUT FILTERS 🚨");
      
      try {
        const [resultsSnap, mappingsSnap] = await Promise.all([
          getDocs(collection(db, "results")),
          getDocs(collection(db, "chestMappings"))
        ]);
        
        const allResults = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const allMappings = mappingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log(`🚨 LOADED ${allResults.length} RESULTS, ${allMappings.length} MAPPINGS`);
        
        // Debug: Zeige die ersten Results komplett
        console.log("🚨 FIRST 3 RESULTS COMPLETE:", allResults.slice(0, 3));
        
        // Schaue nach allen verfügbaren Feldern
        const firstResult = allResults[0] || {};
        console.log("🚨 AVAILABLE FIELDS in first result:", Object.keys(firstResult));
        
        // WICHTIG: Chest-Daten sind im "chests" Array!
        const firstChests = firstResult.chests || [];
        console.log("🚨 FIRST RESULT CHESTS:", firstChests);
        if (firstChests.length > 0) {
          console.log("🚨 FIRST CHEST STRUCTURE:", firstChests[0]);
          console.log("🚨 FIRST CHEST FIELDS:", Object.keys(firstChests[0]));
        }
        
        // Alle Chest-Daten aus allen Results extrahieren
        const allChests = [];
        allResults.forEach(result => {
          if (result.chests && Array.isArray(result.chests)) {
            result.chests.forEach(chest => {
              allChests.push({
                ...chest,
                player: result.Clanmate,
                periodId: result.periodId
              });
            });
          }
        });
        
        console.log("🚨 TOTAL EXTRACTED CHESTS:", allChests.length);
        
        // Alle verschiedenen Chest-Typen sammeln
        const types = [...new Set(allChests.map(c => c.Type || c.type || c.ChestType || '').filter(t => t))];
        const names = [...new Set(allChests.map(c => c.Name || c.name || c.ChestName || '').filter(n => n))];
        const players = [...new Set(allResults.map(r => r.Clanmate || '').filter(p => p))];
        
        console.log("🚨 ALL CHEST TYPES:", types);
        console.log("🚨 ALL CHEST NAMES:", names.slice(0, 20));
        console.log("🚨 ALL PLAYERS:", players.slice(0, 10));
        
        // Nach Common Chests suchen
        const commonTypes = types.filter(t => t.toLowerCase().includes('common'));
        const commonNames = names.filter(n => n.toLowerCase().includes('common'));
        
        console.log("🚨 COMMON TYPES:", commonTypes);
        console.log("🚨 COMMON NAMES:", commonNames);
        
        setResults(allChests); // Zeige extrahierte Chests statt Results
        setChestTypes(types);
        setLoading(false);
        
      } catch (error) {
        console.error("❌ ERROR:", error);
        setLoading(false);
      }
    }
    
    loadAllData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>🚨 TEST: ALLE RESULTS OHNE FILTER</h1>
      <p><strong>Total Results:</strong> {results.length}</p>
      <p><strong>Unique Chest Types:</strong> {chestTypes.length}</p>
      
      <h2>Alle Chest-Typen:</h2>
      <ul>
        {chestTypes.map((type, idx) => (
          <li key={idx}>{type}</li>
        ))}
      </ul>
      
      <h2>Sample Results:</h2>
      <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Player</th>
            <th>Chest Name</th>
            <th>Type</th>
            <th>Level</th>
            <th>Period</th>
          </tr>
        </thead>
        <tbody>
          {results.slice(0, 50).map((chest, idx) => (
            <tr key={idx}>
              <td>{chest.player}</td>
              <td>{chest.Name || chest.name || chest.ChestName}</td>
              <td>{chest.Type || chest.type || chest.ChestType}</td>
              <td>{chest.level || chest.Level || chest.ChestLevel}</td>
              <td>{chest.periodId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TestAllResults;