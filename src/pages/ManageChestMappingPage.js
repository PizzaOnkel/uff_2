import React, { useState, useEffect } from "react";
import ChestMappingSuggestions from "./ChestMappingSuggestions";
import ChestMappingIgnoreList from "./ChestMappingIgnoreList";
import { CHEST_NAMES, CHEST_TYPES, CHEST_SOURCES } from "./chestDropdownData";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDocs, query } from "firebase/firestore";
import StickyBackButton from "../components/StickyBackButton";

// Hilfsfunktion: Vorschlagsliste aus allen Ergebnissen neu generieren
async function refreshUsedChestMappings(db) {
  // Alle existierenden Mappings und Vorschläge laden
  const [resultsSnap, mappingsSnap, usedSnap] = await Promise.all([
    getDocs(collection(db, 'results')),
    getDocs(collection(db, 'chestMappings')),
    getDocs(collection(db, 'usedChestMappings'))
  ]);
  const mappedChests = new Set();
  mappingsSnap.forEach(doc => {
    const d = doc.data();
    if (d.chestName && d.category) mappedChests.add(`${d.chestName}__${d.category}__${d.levelStart||''}`);
  });
  usedSnap.forEach(doc => {
    const d = doc.data();
    if (d.chestName && d.category) mappedChests.add(`${d.chestName}__${d.category}__${d.level||''}`);
  });
  // Mapping-Logik aus CurrentTotalEventPage.js für Vorschläge
  function mapChestFields(chest) {
    let chestName = chest.chestName || chest.Name || chest.name || chest.type || chest.Type || chest.id || '';
    let type = chest.type || chest.Type || '';
    let source = chest.source || chest.Source || '';
    let level = chest.level || chest.Level || '';
    let category = chest.category || chest.Category || '';
    // --- Mapping-Logik ---
    if (!category && type) category = type;
    if ((type||"").toLowerCase().includes("arena") || (source||"").toLowerCase().includes("arena") || (chestName||"").toLowerCase().includes("arena")) {
      category = "Arena Chests";
      level = "total";
    } else if ((chestName||"").toLowerCase().includes("orc") || (type||"").toLowerCase().includes("common crypt")) {
      category = "Common Chests";
    } else if ((chestName||"").toLowerCase().includes("elven citadel chest")) {
      category = "Citadel";
    } else if ((chestName||"").toLowerCase().includes("cursed citadel chest")) {
      category = "Citadel";
    } else if (((type||chest.Kategorie||chest.Category||"").toLowerCase().includes("heroic monster"))) {
      category = "Heroic Chests";
    } else if ((chestName||"").toLowerCase().includes("rare dragon") || (type||"").toLowerCase().includes("rare crypt")) {
      category = "Rare Chests";
    } else if ((chestName||"").toLowerCase().includes("epic") || (type||"").toLowerCase().includes("epic") || (chestName||"").toLowerCase().includes("undead")) {
      category = "Epic Chests";
    } else if ((chestName||"").toLowerCase().includes("bank") || (type||"").toLowerCase().includes("bank") || (source||"").toLowerCase().includes("bank") || ["wooden","bronze","silver","golden","precious","magic"].some(lvl => (chestName||"").toLowerCase().includes(lvl) || (type||"").toLowerCase().includes(lvl))) {
      category = "Bank Chests";
      const bankLevels = ["Wooden","Bronze","Silver","Golden","Precious","Magic"];
      let foundLevel = bankLevels.find(lvl =>
        (chestName||"").toLowerCase().includes(lvl.toLowerCase()) ||
        (type||"").toLowerCase().includes(lvl.toLowerCase()) ||
        (level||"").toString().toLowerCase() === lvl.toLowerCase()
      );
      if (!foundLevel && level) {
        const num = Number(level);
        if (!isNaN(num) && num >= 1 && num <= 6) {
          foundLevel = bankLevels[num-1];
        }
      }
      if (!foundLevel) foundLevel = "Unbekannt";
      level = foundLevel;
    } else if ((chestName||"").toLowerCase().includes("jormungandr") || (type||"").toLowerCase().includes("jormungandr") || (source||"").toLowerCase().includes("jormungandr")) {
      category = "Jormungandr Chests";
      level = "total";
    } else if ((chestName||"").toLowerCase().includes("authority") || (type||"").toLowerCase().includes("authority") || (source||"").toLowerCase().includes("authority")) {
      category = "Union Chest";
      level = "total";
    } else if ((chestName||"").toLowerCase().includes("runic") || (type||"").toLowerCase().includes("runic") || (source||"").toLowerCase().includes("runic")) {
      category = "Runic Chests";
    } else if ((chestName||"").toLowerCase().includes("vault") || (type||"").toLowerCase().includes("vault") || (source||"").toLowerCase().includes("vault")) {
      category = "Vault of the Ancients";
    } else if ((chestName||"").toLowerCase().includes("quick march") || (type||"").toLowerCase().includes("quick march") || (source||"").toLowerCase().includes("quick march")) {
      category = "Quick March Chest";
    } else if ((chestName||"").toLowerCase().includes("ancients chest") || (type||"").toLowerCase().includes("ancients chest") || (source||"").toLowerCase().includes("ancients chest")) {
      category = "Ancients Chest";
    } else if ((chestName||"").toLowerCase().includes("rota") || (type||"").toLowerCase().includes("rota") || (source||"").toLowerCase().includes("rota")) {
      category = "ROTA Total";
    } else if ((chestName||"").toLowerCase().includes("epic ancient squad") || (type||"").toLowerCase().includes("epic ancient squad") || (source||"").toLowerCase().includes("epic ancient squad")) {
      category = "Epic Ancient squad";
    } else if ((chestName||"").toLowerCase().includes("eas total") || (type||"").toLowerCase().includes("eas total") || (source||"").toLowerCase().includes("eas total")) {
      category = "EAs Total";
    } else if ((chestName||"").toLowerCase().includes("union total") || (type||"").toLowerCase().includes("union total") || (source||"").toLowerCase().includes("union total")) {
      category = "Union Total";
    }
    if (!category) category = chest.category || chest.Category || type || 'Unbekannt';
    return {
      chestName,
      category,
      type,
      source,
      level,
      createdAt: new Date().toISOString()
    };
  }
  // Alle neuen Truhen aus allen Ergebnissen extrahieren
  const newSuggestions = [];
  resultsSnap.forEach(entryDoc => {
    const entry = entryDoc.data();
    if (!Array.isArray(entry.chests)) return;
    entry.chests.forEach(chest => {
      const mapped = mapChestFields(chest);
      const key = `${mapped.chestName}__${mapped.category}__${mapped.level}`;
      if (!mappedChests.has(key) && mapped.chestName) {
        newSuggestions.push(mapped);
        mappedChests.add(key);
      }
    });
  });
  // Bestehende Vorschläge löschen (um Duplikate zu vermeiden)
  for (const docSnap of usedSnap.docs) {
    await deleteDoc(docSnap.ref);
  }
  // Neue Vorschläge speichern
  for (const suggestion of newSuggestions) {
    await addDoc(collection(db, 'usedChestMappings'), suggestion);
  }
  return newSuggestions.length;
}
// Alle zuordenbaren Kategorien:
// Arena, Common, Rare, Epic, Tartaros, Elven, Cursed, Bank, Runic, Heroic, Vota, Quick March, Ancients, ROTA, Epic Ancient, Union, Jormungandr

// Alle zuordenbaren Type:
// (aus CHEST_TYPES)
// "default", "Wooden", "Bronze", "Silver", "Golden", "Precious", "Magic", ...

// Alle zuordenbaren Source:
// (aus CHEST_SOURCES)
// "default", "Event", "Shop", "Quest", "Drop", "Common", ...



function ManageChestMappingPage({ t, setCurrentPage }) {
  // Vorschlagsliste beim Öffnen automatisch aktualisieren
  useEffect(() => {
    (async () => {
      await refreshUsedChestMappings(db);
    })();
  }, []);

  // Funktion für Ignore-Button in Vorschlagsliste
  const handleAddIgnoreFromSuggestion = async (mapping) => {
    await addDoc(collection(db, "chestMappingIgnore"), {
      Name: mapping.chestName || '',
      Level: mapping.level || '',
      Type: mapping.type || '',
      Source: mapping.source || '',
      timestamp: new Date().toISOString()
    });
  };
  // Dynamisch alle Werte aus Rohdaten, Mappings und Vorschlägen sammeln
  const [allChestNames, setAllChestNames] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allSources, setAllSources] = useState([]);
  const [allLevels, setAllLevels] = useState([]);
  useEffect(() => {
    async function fetchAllChestData() {
      const [resultsSnap, mappingsSnap, usedSnap] = await Promise.all([
        getDocs(collection(db, "results")),
        getDocs(collection(db, "chestMappings")),
        getDocs(collection(db, "usedChestMappings"))
      ]);
      const allChests = [];
      resultsSnap.docs.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.chests)) {
          allChests.push(...data.chests);
        }
      });
      // Alle Felder aus Rohdaten, Mappings und Vorschlägen aggregieren
      const allMappingData = [
        ...allChests,
        ...mappingsSnap.docs.map(d => d.data()),
        ...usedSnap.docs.map(d => d.data())
      ];
      setAllChestNames(Array.from(new Set(allMappingData.map(c => c.chestName || c.Name || c.name || c.type || c.Type || c.id || "").filter(Boolean))).sort());
      setAllCategories(Array.from(new Set(allMappingData.map(c => c.category || c.Category || c.type || c.Type || "").filter(Boolean))).sort());
      setAllTypes(Array.from(new Set(allMappingData.map(c => c.type || c.Type || "").filter(Boolean))).sort());
      setAllSources(Array.from(new Set(allMappingData.map(c => c.source || c.Source || "").filter(Boolean))).sort());
      setAllLevels(Array.from(new Set(allMappingData.map(c => c.level || c.Level || c.levelStart || c.levelEnd || "").filter(Boolean))).sort((a,b)=>{
        if(!isNaN(a)&&!isNaN(b)) return Number(a)-Number(b);
        return String(a).localeCompare(String(b), 'de', {numeric:true});
      }));
    }
    fetchAllChestData();
  }, []);
  // Sortier-Optionen für Vorschlagsliste
  const [sortField, setSortField] = useState('category'); // 'category' oder 'chestName' oder 'level'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' oder 'desc'
  const [chestMappings, setChestMappings] = useState([]);
  const [newMapping, setNewMapping] = useState({
    chestName: "default",
    category: "",
    type: "",
    source: "",
    levelStart: "",
    levelEnd: "",
    points: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [editingMapping, setEditingMapping] = useState({});
  const [usedChestMappings, setUsedChestMappings] = useState([]);
  const [importing, setImporting] = useState(false);
  // UI-Steuerung für ausgelagerte Komponenten
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showIgnoreList, setShowIgnoreList] = useState(false);
  // Ignore-Liste für Mapping-Vorschläge (Firestore)
  const [ignoreChests, setIgnoreChests] = useState([]);
  const [newIgnore, setNewIgnore] = useState({ Name: '', Level: '', Type: '', Source: '' });
  const [editingIgnoreId, setEditingIgnoreId] = useState(null);
  const [editingIgnore, setEditingIgnore] = useState({});
  // Dynamisch generierte Kategorien (Fallback auf statisch falls leer)
  // Kategorien-Logik: Immer "Chests of Tartaros" im Dropdown anbieten
  let categories = allCategories.length > 0 ? [...allCategories] : [
    "Arena", "Common", "Rare", "Epic", "Tartaros",
    "Elven", "Elven Chests", "Cursed", "Cursed Chests", "Bank", "Runic", "Heroic",
    "Vota", "Quick March", "Ancients", "ROTA", "Epic Ancient",
    "Union", "Jormungandr"
  ];
  // Doppelt sicherstellen, dass die wichtigsten Kategorien immer dabei sind
  ["Cursed Chests", "Elven Chests", "Chests of Tartaros"].forEach(cat => {
    if (!categories.includes(cat)) categories.push(cat);
  });
  useEffect(() => {
    // chestMappings abonnieren
    const unsub1 = onSnapshot(collection(db, "chestMappings"), snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      setChestMappings(list);
    });
    // usedChestMappings abonnieren (Vorschläge immer aktuell!)
    const unsub2 = onSnapshot(collection(db, "usedChestMappings"), snapshot => {
      setUsedChestMappings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    // Ignore-Liste abonnieren
    const unsub3 = onSnapshot(collection(db, "chestMappingIgnore"), snapshot => {
      setIgnoreChests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);
  // Ignore-Eintrag hinzufügen
  async function handleAddIgnore(e) {
    e.preventDefault();
    if (!newIgnore.Name && !newIgnore.Level && !newIgnore.Type && !newIgnore.Source) return;
    await addDoc(collection(db, "chestMappingIgnore"), {
      ...newIgnore,
      timestamp: new Date().toISOString()
    });
    setNewIgnore({ Name: '', Level: '', Type: '', Source: '' });
  }

  // Ignore-Eintrag bearbeiten
  function handleEditIgnore(ignore) {
    setEditingIgnoreId(ignore.id);
    setEditingIgnore({ ...ignore });
  }

  async function handleSaveEditIgnore() {
    if (!editingIgnoreId) return;
    await updateDoc(doc(db, "chestMappingIgnore", editingIgnoreId), {
      ...editingIgnore
    });
    setEditingIgnoreId(null);
    setEditingIgnore({});
  }

  async function handleDeleteIgnore(id) {
    await deleteDoc(doc(db, "chestMappingIgnore", id));
  }

  // Importiere einen Mapping-Vorschlag in die chestMappings
  async function importUsedMapping(mapping) {
    setImporting(true);
    try {
      await addDoc(collection(db, "chestMappings"), {
        chestName: mapping.chestName,
        category: mapping.category,
        levelStart: mapping.level,
        levelEnd: mapping.level,
        points: 0,
        timestamp: new Date().toISOString()
      });
      // Optional: Nach dem Import aus der Vorschlagsliste entfernen
      setUsedChestMappings(usedChestMappings.filter(m => m.id !== mapping.id));
    } catch (e) {
      alert("Fehler beim Importieren: " + e.message);
    }
    setImporting(false);
  }

  // Filter für Vorschlagsliste: Nur Truhen, die weder gemappt noch ignoriert sind
  function isChestInMappingsOrIgnore(chest) {
    const key = `${chest.chestName}__${chest.category}__${chest.level}`;
    // Check Mapping-Liste
    const inMappings = chestMappings.some(m => {
      const mKey = `${m.chestName}__${m.category}__${m.levelStart || m.level || ''}`;
      return mKey === key;
    });
    // Check Ignore-Liste
    const inIgnore = ignoreChests.some(i => {
      const iKey = `${i.Name || i.chestName || ''}__${i.Category || i.category || i.Type || ''}__${i.Level || i.level || ''}`;
      return iKey === key;
    });
    return inMappings || inIgnore;
  }

  const filteredSuggestions = usedChestMappings.filter(chest => !isChestInMappingsOrIgnore(chest));

  const chestNames = {
    "Arena Chests": ["default"],
    "Common Chests": ["default"],
    "Rare Chests": ["default"],
    "Epic Chests": ["default"],
    "Chests of Tartaros": ["default"],
    "Elven Chests": ["default", "Elven Citadel Chest"],
    "Cursed Chests": ["default", "Cursed Citadel Chest"],
    "Runic Chests": ["default", "Runic Chest"],
    "Heroic Chests": ["default"],
    "Vault of the Ancients": ["default"],
    "Bank Chests": [
      "Wooden Chest",
      "Bronze Chest",
      "Silver Chest",
      "Golden Chest",
      "Precious Chest",
      "Magic Chest"
    ]
    // ...weitere Chests ggf. ergänzen...
  };

  function getChestNamesForCategory(category) {
    const bankNames = ["Wooden Chest", "Bronze Chest", "Silver Chest", "Golden Chest", "Precious Chest", "Magic Chest"];
    if (category === "Bank") {
      return [...bankNames];
    }
    return chestNames[category + " Chests"] || chestNames[category] || ["default"];
  }

  const handleAddMapping = async (e) => {
    e.preventDefault();
    if (!newMapping.category || !newMapping.points) return;
    let levelStart = newMapping.levelStart;
    let levelEnd = newMapping.levelEnd;
    if (newMapping.category !== "Bank") {
      levelStart = levelStart !== "" ? parseInt(levelStart, 10) : "";
      levelEnd = levelEnd !== "" ? parseInt(levelEnd, 10) : "";
    }
    // Doppelte prüfen
    const exists = chestMappings.some(m =>
      (m.chestName || "") === (newMapping.chestName || "") &&
      (m.category || "") === (newMapping.category || "") &&
      ((m.levelStart !== undefined ? m.levelStart : m.level) || "") == (levelStart || "")
    );
    if (exists) {
      alert("Es existiert bereits ein Mapping mit gleichem Name, Kategorie und Level!");
      return;
    }
    const docRef = await addDoc(collection(db, "chestMappings"), {
      ...newMapping,
      levelStart,
      levelEnd,
      points: newMapping.points !== "" ? parseInt(newMapping.points, 10) : "",
      timestamp: new Date().toISOString()
    });
    console.log("Mapping gespeichert:", {
      ...newMapping,
      levelStart,
      levelEnd,
      points: newMapping.points !== "" ? parseInt(newMapping.points, 10) : "",
      timestamp: new Date().toISOString(),
      docId: docRef.id
    });
    setNewMapping({
      chestName: "default",
      category: "",
      type: "",
      source: "",
      levelStart: "",
      levelEnd: "",
      points: ""
    });
  };

  const handleEdit = (mapping) => {
    setEditingId(mapping.id);
    setEditingMapping({ ...mapping });
  }

  const handleSaveEdit = async () => {
    let levelStart = editingMapping.levelStart;
    let levelEnd = editingMapping.levelEnd;
    // Level als Zahl speichern, außer bei Bank
    if (editingMapping.category !== "Bank") {
      levelStart = levelStart !== "" && levelStart !== null ? Number(levelStart) : "";
      levelEnd = levelEnd !== "" && levelEnd !== null ? Number(levelEnd) : "";
    }
    await updateDoc(doc(db, "chestMappings", editingId), {
      ...editingMapping,
      levelStart,
      levelEnd,
      points: editingMapping.points !== "" && editingMapping.points !== null ? Number(editingMapping.points) : ""
    });
    setEditingId(null);
    setEditingMapping({});
  }

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "chestMappings", id));
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8" style={{position:'relative'}}>
      {/* Fixierte Buttons rechts mittig */}
      <div style={{position:'fixed', right:'24px', top:'50%', transform:'translateY(-50%)', zIndex:1000, width:'200px', display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'auto'}}>
        <div style={{width:'100%'}}>
          <StickyBackButton onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)} label={t?.backToAdminPanel || 'Zurück'} style={{width:'100px'}} />
        </div>
        <div style={{width:'100%'}}>
          <StickyBackButton
            onClick={() => window.scrollTo({top:0, behavior:'smooth'})}
            label={"On Top"}
            style={{ background: '#1976d2', width:'100px', marginTop:'34px' }}
          />
        </div>
      </div>
      {/* Button für Vorschlagsliste */}
      <div className="w-full max-w-4xl flex flex-row gap-4 mb-4">
        <button onClick={() => setShowSuggestions(v => !v)} className="px-4 py-2 bg-yellow-700 rounded text-white font-semibold hover:bg-yellow-800 transition">{showSuggestions ? 'Vorschlagsliste ausblenden' : 'Vorschlagsliste anzeigen'}</button>
        <button onClick={() => setShowIgnoreList(v => !v)} className="px-4 py-2 bg-red-700 rounded text-white font-semibold hover:bg-red-800 transition">{showIgnoreList ? 'Ignorierliste ausblenden' : 'Ignorierliste anzeigen'}</button>
      </div>
      {/* Ausgelagerte Komponenten */}
      {showSuggestions && (
      <ChestMappingSuggestions
        usedChestMappings={filteredSuggestions}
        importUsedMapping={importUsedMapping}
        importing={importing}
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        handleAddIgnoreFromSuggestion={handleAddIgnoreFromSuggestion}
      />
      )}
      {showIgnoreList && (
        <ChestMappingIgnoreList
          ignoreChests={ignoreChests}
          newIgnore={newIgnore}
          setNewIgnore={setNewIgnore}
          handleAddIgnore={handleAddIgnore}
          editingIgnoreId={editingIgnoreId}
          editingIgnore={editingIgnore}
          setEditingIgnoreId={setEditingIgnoreId}
          setEditingIgnore={setEditingIgnore}
          handleSaveEditIgnore={handleSaveEditIgnore}
          handleDeleteIgnore={handleDeleteIgnore}
          handleEditIgnore={handleEditIgnore}
        />
      )}

      <h2 className="text-4xl font-bold mb-6 text-center text-purple-400">Truhen-Zuordnungen verwalten</h2>
      {/* Formular für neue Zuordnung */}
      <form onSubmit={handleAddMapping} className="mb-8 w-full max-w-4xl bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 text-purple-300">Neue Truhen-Zuordnung hinzufügen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Truhen-Name *</label>
            <select
              value={newMapping.chestName}
              onChange={(e) => setNewMapping({...newMapping, chestName: e.target.value})}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Bitte wählen...</option>
              {Array.from(new Set([
                ...allChestNames,
                ...getChestNamesForCategory(newMapping.category),
                ...(newMapping.category === "Bank" ? [
                  "Wooden Chest", "Bronze Chest", "Silver Chest", "Golden Chest", "Precious Chest", "Magic Chest"
                ] : [])
              ].filter(Boolean))).sort((a,b)=>String(a).localeCompare(String(b),'de',{numeric:true})).map(chestName => (
                <option key={chestName} value={chestName}>{chestName}</option>
              ))}
            </select>
            {!newMapping.category && (
              <p className="text-xs text-gray-400 mt-1">Erst Kategorie wählen</p>
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Kategorie *</label>
            <select
              value={newMapping.category}
              onChange={(e) => {
                let val = e.target.value;
                // Für Bank immer exakt 'Bank' als Wert setzen
                if (val.toLowerCase().includes('bank')) val = 'Bank';
                setNewMapping({
                  ...newMapping,
                  category: val,
                  chestName: ""
                });
              }}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Bitte wählen...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Type</label>
            <select
              value={newMapping.type}
              onChange={(e) => setNewMapping({...newMapping, type: e.target.value})}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Bitte wählen...</option>
              {(() => {
                // Wenn Kategorie "Chests of Tartaros" gewählt ist, spezielle Typen anbieten
                if (newMapping.category === "Chests of Tartaros") {
                  const tartarosTypes = [10,15,20,25,30,35].map(lvl => `Tartaros Crypt Level ${lvl}`);
                  return tartarosTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ));
                }
                // Standard-Typen
                if (allTypes.length > 0) {
                  return allTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ));
                }
                return Array.from(new Set([
                  ...CHEST_TYPES,
                  "Elven Citadel",
                  "Cursed Citadel",
                  "Wooden",
                  "Bronze",
                  "Silver",
                  "Golden",
                  "Precious",
                  "Magic"
                ])).map(type => (
                  <option key={type} value={type}>{type}</option>
                ));
              })()}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Source</label>
            <select
              value={newMapping.source}
              onChange={(e) => setNewMapping({...newMapping, source: e.target.value})}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="">Bitte wählen...</option>
              {allSources.length > 0
                ? allSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))
                : Array.from(new Set([
                    ...CHEST_SOURCES,
                    ...usedChestMappings.map(m => m.source),
                    ...chestMappings.map(m => m.source),
                    newMapping.source
                  ].filter(Boolean))).map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Level Start</label>
            {newMapping.category === "Bank" ? (
              <select
                value={newMapping.levelStart}
                onChange={e => setNewMapping({ ...newMapping, levelStart: e.target.value })}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="">Bitte wählen...</option>
                {['Wooden','Bronze','Silver','Golden','Precious','Magic'].map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={newMapping.levelStart}
                onChange={e => setNewMapping({ ...newMapping, levelStart: e.target.value === '' ? '' : Number(e.target.value) })}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                placeholder="z.B. 10"
              />
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Level Ende</label>
            {newMapping.category === "Bank" ? (
              <select
                value={newMapping.levelEnd}
                onChange={e => setNewMapping({ ...newMapping, levelEnd: e.target.value })}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="">Bitte wählen...</option>
                {['Wooden','Bronze','Silver','Golden','Precious','Magic'].map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={newMapping.levelEnd}
                onChange={e => setNewMapping({ ...newMapping, levelEnd: e.target.value === '' ? '' : Number(e.target.value) })}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                placeholder="z.B. 15"
              />
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Punkte *</label>
            <input
              type="number"
              value={newMapping.points}
              onChange={(e) => setNewMapping({...newMapping, points: e.target.value})}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="z.B. 64"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 rounded text-white font-semibold hover:bg-purple-700 transition"
          >
            Hinzufügen
          </button>
        </div>
      </form>

      {/* Liste der bestehenden Zuordnungen */}
      <div className="w-full max-w-6xl bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 text-purple-300">Bestehende Truhen-Zuordnungen</h3>
        {chestMappings.length === 0 ? (
          <p className="text-gray-400">Keine Truhen-Zuordnungen vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-2 text-left">Truhen-Name</th>
                  <th className="px-4 py-2 text-left">Kategorie</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Source</th>
                  <th className="px-4 py-2 text-left">Level</th>
                  <th className="px-4 py-2 text-left">Punkte</th>
                  <th className="px-4 py-2 text-left">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {[...chestMappings]
                  .sort((a, b) => {
                    // 1. Kategorie
                    const catA = (a.category || '').toLowerCase();
                    const catB = (b.category || '').toLowerCase();
                    if (catA !== catB) return catA.localeCompare(catB, 'de', {numeric:true});
                    // 2. Source
                    const srcA = (a.source || '').toLowerCase();
                    const srcB = (b.source || '').toLowerCase();
                    if (srcA !== srcB) return srcA.localeCompare(srcB, 'de', {numeric:true});
                    // 3. Type
                    const typeA = (a.type || '').toLowerCase();
                    const typeB = (b.type || '').toLowerCase();
                    if (typeA !== typeB) return typeA.localeCompare(typeB, 'de', {numeric:true});
                    // 4. Name
                    const nameA = (a.chestName || '').toLowerCase();
                    const nameB = (b.chestName || '').toLowerCase();
                    if (nameA !== nameB) return nameA.localeCompare(nameB, 'de', {numeric:true});
                    // 5. Level (Start, dann End)
                    const lvlA = a.levelStart !== undefined ? a.levelStart : a.level;
                    const lvlB = b.levelStart !== undefined ? b.levelStart : b.level;
                    if (lvlA !== undefined && lvlB !== undefined) {
                      if (!isNaN(lvlA) && !isNaN(lvlB)) {
                        if (Number(lvlA) !== Number(lvlB)) return Number(lvlA) - Number(lvlB);
                      } else {
                        const strA = String(lvlA || '').toLowerCase();
                        const strB = String(lvlB || '').toLowerCase();
                        if (strA !== strB) return strA.localeCompare(strB, 'de', {numeric:true});
                      }
                    }
                    // Falls alles gleich: timestamp als Fallback
                    return (a.timestamp || '').localeCompare(b.timestamp || '', 'de', {numeric:true});
                  })
                  .map((mapping) => {
                  // Firestore-IDs sind 20 Zeichen lang und bestehen nur aus [A-Za-z0-9_-]
                  const isValidId = mapping.id && /^[A-Za-z0-9_-]{20}$/.test(mapping.id);
                  return (
                    <tr key={mapping.id} className="border-b border-gray-700">
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <select
                            value={editingMapping.chestName}
                            onChange={(e) => setEditingMapping({...editingMapping, chestName: e.target.value})}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          >
                            <option value="">Bitte wählen...</option>
            {Array.from(new Set([
                ...allChestNames,
                ...(editingMapping.category ? getChestNamesForCategory(editingMapping.category) : []),
                ...(editingMapping.category === "Bank" ? [
                  "Wooden Chest",
                  "Bronze Chest",
                  "Silver Chest",
                  "Golden Chest",
                  "Precious Chest",
                  "Magic Chest"
                ] : []),
                ...usedChestMappings.map(m => m.chestName),
                ...chestMappings.map(m => m.chestName),
                editingMapping.chestName
              ].filter(Boolean))).sort((a,b)=>String(a).localeCompare(String(b),'de',{numeric:true})).map(chestName => (
                <option key={chestName} value={chestName}>{chestName}</option>
              ))}
                          </select>
                        ) : (
                          mapping.chestName
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <select
                            value={editingMapping.category}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val.toLowerCase().includes('bank')) val = 'Bank';
                              setEditingMapping({
                                ...editingMapping,
                                category: val,
                                chestName: ""
                              });
                            }}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          >
                            {Array.from(new Set([
                              ...categories,
                              ...usedChestMappings.map(m => m.category),
                              ...chestMappings.map(m => m.category),
                              editingMapping.category
                            ].filter(Boolean))).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          mapping.category
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <select
                            value={editingMapping.type}
                            onChange={(e) => setEditingMapping({...editingMapping, type: e.target.value})}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          >
                            <option value="">Bitte wählen...</option>
                            {(() => {
                              if (editingMapping.category === "Chests of Tartaros") {
                                const tartarosTypes = [10,15,20,25,30,35].map(lvl => `Tartaros Crypt Level ${lvl}`);
                                return tartarosTypes.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ));
                              }
                              return Array.from(new Set([
                                ...CHEST_TYPES,
                                "Elven Citadel",
                                "Cursed Citadel",
                                "Wooden",
                                "Bronze",
                                "Silver",
                                "Golden",
                                "Precious",
                                "Magic"
                              ])).map(type => (
                                <option key={type} value={type}>{type}</option>
                              ));
                            })()}
                          </select>
                        ) : (
                          mapping.type || ""
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <select
                            value={editingMapping.source}
                            onChange={(e) => setEditingMapping({...editingMapping, source: e.target.value})}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          >
                            <option value="">Bitte wählen...</option>
                            {Array.from(new Set([
                              ...CHEST_SOURCES,
                              ...usedChestMappings.map(m => m.source),
                              ...chestMappings.map(m => m.source),
                              editingMapping.source,
                              "Elven Citadel",
                              "Cursed Citadel",
                              "Level 30 Citadel"
                            ].filter(Boolean))).map(source => (
                              <option key={source} value={source}>{source}</option>
                            ))}
                          </select>
                        ) : (
                          mapping.source || ""
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          editingMapping.category === "Bank" ? (
                            <div className="flex gap-2">
                              <select
                                value={editingMapping.levelStart}
                                onChange={e => setEditingMapping({ ...editingMapping, levelStart: e.target.value })}
                                className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                              >
                                <option value="">Bitte wählen...</option>
                                <option value="Wooden">Wooden</option>
                                <option value="Bronze">Bronze</option>
                                <option value="Silver">Silver</option>
                                <option value="Golden">Golden</option>
                                <option value="Precious">Precious</option>
                                <option value="Magic">Magic</option>
                                <option value="Level 30 Citadel">Level 30 Citadel</option>
                              </select>
                              <span className="text-gray-400">-</span>
                              <select
                                value={editingMapping.levelEnd}
                                onChange={e => setEditingMapping({ ...editingMapping, levelEnd: e.target.value })}
                                className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                              >
                                <option value="">Bitte wählen...</option>
                                <option value="Wooden">Wooden</option>
                                <option value="Bronze">Bronze</option>
                                <option value="Silver">Silver</option>
                                <option value="Golden">Golden</option>
                                <option value="Precious">Precious</option>
                                <option value="Magic">Magic</option>
                                <option value="Level 30 Citadel">Level 30 Citadel</option>
                              </select>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={editingMapping.levelStart}
                                onChange={e => setEditingMapping({ ...editingMapping, levelStart: e.target.value === '' ? '' : Number(e.target.value) })}
                                className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                                placeholder="Start"
                              />
                              <span className="text-gray-400">-</span>
                              <input
                                type="number"
                                value={editingMapping.levelEnd}
                                onChange={e => setEditingMapping({ ...editingMapping, levelEnd: e.target.value === '' ? '' : Number(e.target.value) })}
                                className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                                placeholder="Ende"
                              />
                            </div>
                          )
                        ) : (
                          mapping.levelStart === mapping.levelEnd ?
                            mapping.levelStart :
                            `${mapping.levelStart} - ${mapping.levelEnd}`
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <input
                            type="number"
                            value={editingMapping.points}
                            onChange={(e) => setEditingMapping({...editingMapping, points: e.target.value})}
                            className="w-20 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
                          />
                        ) : (
                          (mapping.points === undefined || mapping.points === null || mapping.points === "") ? 0 : Number(mapping.points)
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === mapping.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-green-600 rounded text-white text-sm hover:bg-green-700 transition"
                            >
                              Speichern
                            </button>
                            <button
                              onClick={() => {setEditingId(null); setEditingMapping({});}}
                              className="px-3 py-1 bg-gray-600 rounded text-white text-sm hover:bg-gray-700 transition"
                            >
                              Abbrechen
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-2">
                              <button
                                onClick={() => isValidId ? handleEdit(mapping) : null}
                                className={`px-3 py-1 rounded text-white text-sm transition ${isValidId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 cursor-not-allowed'}`}
                                disabled={!isValidId}
                              >
                                Bearbeiten
                              </button>
                              <button
                                onClick={() => isValidId ? handleDelete(mapping.id) : null}
                                className={`px-3 py-1 rounded text-white text-sm transition ${isValidId ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 cursor-not-allowed'}`}
                                disabled={!isValidId}
                              >
                                Löschen
                              </button>
                            </div>
                            {!isValidId && (
                              <div className="text-xs text-red-400">Kann nicht bearbeitet oder gelöscht werden (ungültige ID)</div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="w-full flex justify-start mb-4">
        <button
          onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
          className="px-6 py-2 bg-blue-600 rounded text-white font-semibold text-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition"
          style={{ minWidth: 120 }}
        >
          &larr; Zurück
        </button>
      </div>
      <footer className="mt-auto text-gray-500 text-sm">{t && t.copyright}</footer>
    </div>
  );
}

export default ManageChestMappingPage;
