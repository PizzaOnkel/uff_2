import csv
import json
from collections import defaultdict

CSV_PATH = 'Ergebnisse der CurrentTotalEventPage.csv'
JSON_PATH = 'firestore-export/results.json'
MAPPING_PATH = 'firestore-export/chestMappings.json'

# Hilfsfunktionen wie im Original (read_csv, read_json, build_chest_points_mapping, get_points_for_chest)
# ...

def read_csv(path):
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
    relevant_lines = lines[header_idx:]
    reader = csv.DictReader(relevant_lines, delimiter=';')
    return list(reader)

def read_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)

def build_chest_points_mapping(mapping_data):
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
    if (name, typ, lvl) in mapping:
        return mapping[(name, typ, lvl)]
    for k in mapping:
        if k[0] == name and k[2] == lvl:
            return mapping[k]
    for k in mapping:
        if k[0] == name and k[1] == typ:
            return mapping[k]
    for k in mapping:
        if k[0] == name:
            return mapping[k]
    return 0

def aggregate_csv(csv_data):
    result = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: {'truhen': 0, 'punkte': 0})))
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
                    punkte = int(row[key].replace('�','').replace('.','').replace(',','').strip())
                except Exception:
                    continue
                result[name][category][level]['punkte'] += punkte
                result[name][category][level]['truhen'] += 1
    return result

def aggregate_json(json_data, mapping):
    result = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: {'truhen': 0, 'punkte': 0})))
    for entry in json_data:
        name = entry.get('Clanmate')
        chests = entry.get('chests', [])
        for chest in chests:
            category = chest.get('Name')
            level = str(chest.get('Level', ''))
            punkte = get_points_for_chest(chest, mapping)
            result[name][category][level]['punkte'] += punkte
            result[name][category][level]['truhen'] += 1
    return result

def compare_full(csv_agg, json_agg, output_path='vergleichsergebnis_full.csv'):
    rows = []
    header = ['Name', 'Kategorie', 'Level', 'Truhen_CSV', 'Truhen_JSON', 'Punkte_CSV', 'Punkte_JSON', 'Status']
    all_keys = set()
    for name in set(list(csv_agg.keys()) + list(json_agg.keys())):
        for category in set(list(csv_agg[name].keys()) + list(json_agg[name].keys())):
            for level in set(list(csv_agg[name][category].keys()) + list(json_agg[name][category].keys())):
                csv_truhen = csv_agg[name][category][level]['truhen'] if level in csv_agg[name][category] else 0
                json_truhen = json_agg[name][category][level]['truhen'] if level in json_agg[name][category] else 0
                csv_punkte = csv_agg[name][category][level]['punkte'] if level in csv_agg[name][category] else 0
                json_punkte = json_agg[name][category][level]['punkte'] if level in json_agg[name][category] else 0
                if csv_truhen == 0 and json_truhen > 0:
                    status = 'Fehlt in CSV'
                elif json_truhen == 0 and csv_truhen > 0:
                    status = 'Fehlt in JSON'
                elif csv_truhen != json_truhen or csv_punkte != json_punkte:
                    status = 'Abweichung'
                else:
                    status = 'Korrekt'
                rows.append([name, category, level, csv_truhen, json_truhen, csv_punkte, json_punkte, status])
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
    compare_full(csv_agg, json_agg, output_path='vergleichsergebnis_full.csv')
