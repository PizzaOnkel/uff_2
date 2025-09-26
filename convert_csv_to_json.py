import csv
import json
from datetime import datetime

def convert_csv_to_json():
    """Konvertiert die CSV-Datei in ein JSON-Format für das React Dashboard"""
    
    # CSV-Datei lesen
    data = []
    with open('ChestData_2025-09-10_002.csv', 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            # Daten bereinigen und validieren
            clean_row = {}
            
            # Datum formatieren
            try:
                date_obj = datetime.strptime(row['Date'], '%Y-%m-%d')
                clean_row['Date'] = date_obj.strftime('%Y-%m-%d')
            except ValueError:
                print(f"Warnung: Ungültiges Datum gefunden: {row['Date']}")
                clean_row['Date'] = row['Date']
            
            # Andere Felder übernehmen und bereinigen
            clean_row['Clanmate'] = row['Clanmate'].strip()
            clean_row['ChestName'] = row['ChestName'].strip()
            clean_row['ChestLevel'] = int(row['ChestLevel']) if row['ChestLevel'].isdigit() else 0
            clean_row['ChestType'] = row['ChestType'].strip()
            clean_row['ChestPoints'] = int(row['ChestPoints']) if row['ChestPoints'].isdigit() else 0
            
            data.append(clean_row)
    
    # JSON-Datei schreiben
    output_filename = f'aktuelle_Punkte-Tabelle_{datetime.now().strftime("%Y-%m-%d")}.json'
    with open(output_filename, 'w', encoding='utf-8') as jsonfile:
        json.dump(data, jsonfile, indent=2, ensure_ascii=False)
    
    print(f"✅ CSV erfolgreich konvertiert!")
    print(f"📁 Output-Datei: {output_filename}")
    print(f"📊 Anzahl Datensätze: {len(data)}")
    
    # Statistiken anzeigen
    clanmates = set(row['Clanmate'] for row in data)
    chest_types = set(row['ChestType'] for row in data)
    
    print(f"👥 Clan-Mitglieder: {len(clanmates)}")
    print(f"📦 Verschiedene Chest-Typen: {len(chest_types)}")
    
    return output_filename

if __name__ == "__main__":
    try:
        output_file = convert_csv_to_json()
        print(f"\n🎉 Konvertierung abgeschlossen: {output_file}")
    except Exception as e:
        print(f"❌ Fehler bei der Konvertierung: {e}")
        import traceback
        traceback.print_exc()