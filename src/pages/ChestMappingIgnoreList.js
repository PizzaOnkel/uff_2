import React from "react";

const ChestMappingIgnoreList = ({ ignoreChests, newIgnore, setNewIgnore, handleAddIgnore, editingIgnoreId, editingIgnore, setEditingIgnoreId, setEditingIgnore, handleSaveEditIgnore, handleDeleteIgnore, handleEditIgnore }) => (
  <div className="w-full max-w-4xl bg-gray-800 bg-opacity-80 rounded-lg p-6 mb-8 mt-4">
    <h3 className="text-xl font-semibold mb-4 text-red-300">Ignorierte Vorschläge (Ignore-Liste)</h3>
    <form onSubmit={handleAddIgnore} className="flex flex-wrap gap-2 mb-4">
      <input type="text" placeholder="Name" value={newIgnore.Name} onChange={e => setNewIgnore({ ...newIgnore, Name: e.target.value })} className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600" />
      <input type="text" placeholder="Level" value={newIgnore.Level} onChange={e => setNewIgnore({ ...newIgnore, Level: e.target.value })} className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600" />
      <input type="text" placeholder="Type" value={newIgnore.Type} onChange={e => setNewIgnore({ ...newIgnore, Type: e.target.value })} className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600" />
      <input type="text" placeholder="Source" value={newIgnore.Source} onChange={e => setNewIgnore({ ...newIgnore, Source: e.target.value })} className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600" />
      <button type="submit" className="px-4 py-1 bg-red-600 rounded text-white font-semibold hover:bg-red-700 transition">Hinzufügen</button>
    </form>
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-red-800">
            <th className="px-2 py-1 text-left">Name</th>
            <th className="px-2 py-1 text-left">Level</th>
            <th className="px-2 py-1 text-left">Type</th>
            <th className="px-2 py-1 text-left">Source</th>
            <th className="px-2 py-1 text-left">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {ignoreChests.length === 0 ? (
            <tr><td colSpan={5} className="text-gray-400 px-2 py-1">Keine Ignore-Einträge vorhanden.</td></tr>
          ) : (
            ignoreChests.map((ignore) => (
              <tr key={ignore.id} className="border-b border-red-700">
                <td className="px-2 py-1">
                  {editingIgnoreId === ignore.id ? (
                    <input type="text" value={editingIgnore.Name || ''} onChange={e => setEditingIgnore({ ...editingIgnore, Name: e.target.value })} className="px-1 py-0.5 rounded bg-gray-700 text-white border border-gray-600" />
                  ) : (
                    ignore.Name || ''
                  )}
                </td>
                <td className="px-2 py-1">
                  {editingIgnoreId === ignore.id ? (
                    <input type="text" value={editingIgnore.Level || ''} onChange={e => setEditingIgnore({ ...editingIgnore, Level: e.target.value })} className="px-1 py-0.5 rounded bg-gray-700 text-white border border-gray-600" />
                  ) : (
                    ignore.Level || ''
                  )}
                </td>
                <td className="px-2 py-1">
                  {editingIgnoreId === ignore.id ? (
                    <input type="text" value={editingIgnore.Type || ''} onChange={e => setEditingIgnore({ ...editingIgnore, Type: e.target.value })} className="px-1 py-0.5 rounded bg-gray-700 text-white border border-gray-600" />
                  ) : (
                    ignore.Type || ''
                  )}
                </td>
                <td className="px-2 py-1">
                  {editingIgnoreId === ignore.id ? (
                    <input type="text" value={editingIgnore.Source || ''} onChange={e => setEditingIgnore({ ...editingIgnore, Source: e.target.value })} className="px-1 py-0.5 rounded bg-gray-700 text-white border border-gray-600" />
                  ) : (
                    ignore.Source || ''
                  )}
                </td>
                <td className="px-2 py-1">
                  {editingIgnoreId === ignore.id ? (
                    <>
                      <button onClick={handleSaveEditIgnore} className="px-2 py-0.5 bg-green-600 rounded text-white text-xs hover:bg-green-700 mr-1">Speichern</button>
                      <button onClick={() => { setEditingIgnoreId(null); setEditingIgnore({}); }} className="px-2 py-0.5 bg-gray-600 rounded text-white text-xs hover:bg-gray-700">Abbrechen</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditIgnore(ignore)} className="px-2 py-0.5 bg-blue-600 rounded text-white text-xs hover:bg-blue-700 mr-1">Bearbeiten</button>
                      <button onClick={() => handleDeleteIgnore(ignore.id)} className="px-2 py-0.5 bg-red-600 rounded text-white text-xs hover:bg-red-700">Löschen</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default ChestMappingIgnoreList;
