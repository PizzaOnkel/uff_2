
import csv
import json
from collections import defaultdict

CSV_PATH = 'Ergebnisse der CurrentTotalEventPage.csv'
JSON_PATH = 'firestore-export/results.json'
MAPPING_PATH = 'firestore-export/chestMappings.json'

def read_csv(path):
    # Suche die erste Zeile, die mit 'Name;' beginnt, als Header
    try:
        with open(path, encoding='utf-8') as f:
            lines = f.readlines()
    except UnicodeDecodeError:
        with open(path, encoding='latin1') as f:
            lines = f.readlines()
    header_idx = None
    for idx, line in enumerate(lines):
        if line.strip().startswith('Name;'):
            header_idx = idx
            break
    if header_idx is None:
        raise ValueError('Keine Headerzeile mit "Name;" gefunden!')
    # Nur ab Headerzeile weitergeben
    relevant_lines = lines[header_idx:]
    reader = csv.DictReader(relevant_lines, delimiter=';')
    return list(reader)

def read_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)

def build_chest_points_mapping(mapping_data):
    # Key: (Name, Type, Level) -> points
    mapping = {}
    for entry in mapping_data:
        name = entry.get('chestName')
        typ = entry.get('type')
        lvl = str(entry.get('levelStart'))
        points = entry.get('points', 0)
        mapping[(name, typ, lvl)] = points
    return mapping

def get_points_for_chest(chest, mapping):
    name = chest.get('Name')
    typ = chest.get('Type')
    lvl = str(chest.get('Level'))
    # Try exact match
    if (name, typ, lvl) in mapping:
        return mapping[(name, typ, lvl)]
    # Try fallback: ignore type
    for k in mapping:
        if k[0] == name and k[2] == lvl:
            return mapping[k]
    # Try fallback: ignore level
    for k in mapping:
        if k[0] == name and k[1] == typ:
            return mapping[k]
    # Try fallback: only name
    for k in mapping:
        if k[0] == name:
            return mapping[k]
    return 0

def aggregate_csv(csv_data):
    result = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    for row in csv_data:
        name = row.get('Name')
        for key in row:
            if 'Punkte' in key and row[key].strip():
                parts = key.split()
                if len(parts) >= 2:
                    category = parts[0]
                    level = parts[1] if parts[1].startswith('LV') or parts[1].isdigit() else ''
                else:
                    category = key
                    level = ''
                try:
                    points = int(row[key].replace('�','').replace('.','').replace(',','').strip())
                except Exception:
                    continue
                result[name][category][level] += points
    return result

def aggregate_json(json_data, mapping):
    result = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    for entry in json_data:
        name = entry.get('Clanmate')
        chests = entry.get('chests', [])
        for chest in chests:
            category = chest.get('Name')
            level = str(chest.get('Level', ''))
            points = get_points_for_chest(chest, mapping)
            result[name][category][level] += points
    return result

def compare(csv_agg, json_agg, output_path='vergleichsergebnis.csv'):
    rows = []
    header = ['Name', 'Kategorie', 'Level', 'CSV_Punkte', 'JSON_Punkte', 'Differenz']
    for name in csv_agg:
        if name not in json_agg:
            rows.append([name, '', '', 'nur CSV', '', ''])
            continue
        for category in csv_agg[name]:
            for level in csv_agg[name][category]:
                csv_points = csv_agg[name][category][level]
                json_points = json_agg[name][category][level]
                if csv_points != json_points:
                    diff = csv_points - json_points
                    rows.append([name, category, level, csv_points, json_points, diff])
    # Auch JSON-Einträge, die nicht im CSV sind
    for name in json_agg:
        if name not in csv_agg:
            for category in json_agg[name]:
                for level in json_agg[name][category]:
                    rows.append([name, category, level, '', json_agg[name][category][level], 'nur JSON'])
    # Schreibe als UTF-8 CSV
    with open(output_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f, delimiter=';')
        writer.writerow(header)
        for row in rows:
            writer.writerow(row)

if __name__ == "__main__":
    csv_data = read_csv(CSV_PATH)
    json_data = read_json(JSON_PATH)
    mapping_data = read_json(MAPPING_PATH)
    mapping = build_chest_points_mapping(mapping_data)
    csv_agg = aggregate_csv(csv_data)
    json_agg = aggregate_json(json_data, mapping)
    compare(csv_agg, json_agg, output_path='vergleichsergebnis.csv')
