import React from "react";

const ChestMappingSuggestions = ({ usedChestMappings, importUsedMapping, importing, sortField, setSortField, sortOrder, setSortOrder, handleAddIgnoreFromSuggestion }) => (
  <div className="w-full max-w-4xl bg-yellow-900 bg-opacity-30 rounded-lg p-6 mb-8">
    <h3 className="text-2xl font-semibold mb-4 text-yellow-300">Automatisch erkannte, noch nicht gepflegte Truhen-Mappings</h3>
    <div className="flex gap-4 mb-4">
      <button onClick={() => setSortField('category')} className={`px-4 py-2 rounded-lg font-bold shadow ${sortField === 'category' ? 'bg-yellow-500 text-white' : 'bg-yellow-800 text-yellow-200'}`}>Sortiere nach Kategorie</button>
      <button onClick={() => setSortField('chestName')} className={`px-4 py-2 rounded-lg font-bold shadow ${sortField === 'chestName' ? 'bg-yellow-500 text-white' : 'bg-yellow-800 text-yellow-200'}`}>Sortiere nach Name</button>
      <button onClick={() => setSortField('level')} className={`px-4 py-2 rounded-lg font-bold shadow ${sortField === 'level' ? 'bg-yellow-500 text-white' : 'bg-yellow-800 text-yellow-200'}`}>Sortiere nach Level</button>
      <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className={`px-4 py-2 rounded-lg font-bold shadow ${sortOrder === 'asc' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{sortOrder === 'asc' ? 'A → Z' : 'Z → A'}</button>
    </div>
    {usedChestMappings.length === 0 ? (
      <p className="text-gray-400">Keine neuen Vorschläge gefunden.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-yellow-800">
              <th className="px-4 py-2 text-left">Truhen-Name</th>
              <th className="px-4 py-2 text-left">Kategorie</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Source</th>
              <th className="px-4 py-2 text-left">Level</th>
              <th className="px-4 py-2 text-left">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {usedChestMappings
              .slice()
              .sort((a, b) => {
                let cmp = 0;
                if (sortField === 'category') {
                  cmp = (a.category || '').localeCompare(b.category || '', 'de', { sensitivity: 'base' });
                  if (cmp === 0) cmp = (a.chestName || '').localeCompare(b.chestName || '', 'de', { sensitivity: 'base' });
                } else if (sortField === 'chestName') {
                  cmp = (a.chestName || '').localeCompare(b.chestName || '', 'de', { sensitivity: 'base' });
                  if (cmp === 0) cmp = (a.category || '').localeCompare(b.category || '', 'de', { sensitivity: 'base' });
                } else if (sortField === 'level') {
                  cmp = (a.level || '').toString().localeCompare((b.level || '').toString(), 'de', { sensitivity: 'base', numeric: true });
                }
                return sortOrder === 'asc' ? cmp : -cmp;
              })
              .map((mapping) => (
                <tr key={mapping.id} className="border-b border-yellow-700">
                  <td className="px-4 py-2">{mapping.chestName}</td>
                  <td className="px-4 py-2">{mapping.category}</td>
                  <td className="px-4 py-2">{mapping.type}</td>
                  <td className="px-4 py-2">{mapping.source}</td>
                  <td className="px-4 py-2">{mapping.level}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      disabled={importing}
                      className="px-3 py-1 bg-yellow-600 rounded text-white text-sm hover:bg-yellow-700 transition"
                      onClick={() => importUsedMapping(mapping)}
                    >
                      Ins Mapping übernehmen
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 rounded text-white text-sm hover:bg-red-700 transition"
                      onClick={() => handleAddIgnoreFromSuggestion(mapping)}
                    >
                      Ignorieren
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default ChestMappingSuggestions;
