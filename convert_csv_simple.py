import csv
import json
from collections import defaultdict
import sys

def convert_csv_to_json(csv_filename="ChestData_2025-09-10_002.csv"):
    """Konvertiert CSV zu JSON im Dashboard-Format"""
    
    try:
        data = defaultdict(lambda: defaultdict(list))
        error_count = 0
        total_lines = 0
        
        print(f"📂 Lade CSV-Datei: {csv_filename}")
        
        with open(csv_filename, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=',')
            
            for line_num, row in enumerate(reader, start=2):
                total_lines += 1
                try:
                    date = row['Date'].strip()
                    clanmate = row['Clanmate'].strip()
                    chest_name = row['ChestName'].strip()
                    
                    # Robuste ChestLevel-Konvertierung
                    try:
                        chest_level = int(row['ChestLevel']) if row['ChestLevel'].strip() else 0
                    except (ValueError, TypeError):
                        chest_level = 0
                        error_count += 1
                        if error_count <= 5:  # Zeige nur erste 5 Fehler
                            print(f"⚠️  Zeile {line_num}: ChestLevel '{row['ChestLevel']}' -> 0 gesetzt")
                    
                    chest_type = row['ChestType'].strip()
                    chest_type_str = f"Level {chest_level} {chest_type}"

                    chest = {
                        "Name": chest_name,
                        "Type": chest_type_str,
                        "Source": chest_type_str,
                        "Level": chest_level
                    }

                    data[date][clanmate].append(chest)
                    
                except KeyError as e:
                    error_count += 1
                    print(f"❌ Zeile {line_num}: Fehlende Spalte {e}")
                except Exception as e:
                    error_count += 1
                    print(f"❌ Zeile {line_num}: {e}")

        # JSON-Struktur erstellen
        result = {}
        for date, clanmates in data.items():
            clanmate_list = []
            for clanmate, chests in clanmates.items():
                clanmate_list.append({
                    "Clanmate": clanmate,
                    "chests": chests
                })
            result[date] = clanmate_list

        # JSON-Datei schreiben - gleicher Name wie CSV, nur mit .json Endung
        output_filename = csv_filename.rsplit('.', 1)[0] + '.json'
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Konvertierung erfolgreich!")
        print(f"📁 Output: {output_filename}")
        print(f"📊 Verarbeitete Zeilen: {total_lines}")
        print(f"⚠️  Fehler: {error_count}")
        
        # Statistiken
        total_entries = sum(len(clanmates) for clanmates in data.values())
        dates_count = len(data)
        all_clanmates = set()
        for clanmates in data.values():
            all_clanmates.update(clanmates.keys())
        
        print(f"📅 Verschiedene Daten: {dates_count}")
        print(f"👥 Clan-Mitglieder: {len(all_clanmates)}")
        
        return output_filename
        
    except FileNotFoundError:
        print(f"❌ Datei '{csv_filename}' nicht gefunden!")
        return None
    except Exception as e:
        print(f"❌ Fehler: {e}")
        return None

if __name__ == "__main__":
    print("🔄 CSV zu JSON Konverter - FINALE VERSION")
    print("=" * 50)
    
    # Dateiname interaktiv abfragen
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    else:
        filename = input("📁 CSV-Dateiname eingeben (oder Enter für ChestData_2025-09-10_002.csv): ").strip()
        if not filename:
            filename = "ChestData_2025-09-10_002.csv"
    
    print(f"\n🔍 Verarbeite: {filename}")
    
    result = convert_csv_to_json(filename)
    
    if result:
        print(f"\n🎉 Erfolgreich konvertiert: {result}")
    else:
        print(f"\n❌ Konvertierung fehlgeschlagen!")
    
    input("\n⏸️  Drücke Enter zum Beenden...")