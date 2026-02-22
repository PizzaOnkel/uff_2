import csv
import json

# Dateipfade anpassen, falls nötig
CSV_PATH = 'Ergebnisse der CurrentTotalEventPage.csv'
JSON_PATH = 'firestore-export/results.json'

# CSV einlesen
def read_csv(path):
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

# JSON einlesen
def read_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)

# Hauptvergleichsfunktion
def compare(csv_data, json_data, key_fields=None):
    if not key_fields:
        # Versuche, einen gemeinsamen Schlüssel zu finden
        csv_keys = set(csv_data[0].keys())
        json_keys = set(json_data[0].keys())
        common = csv_keys & json_keys
        key_fields = list(common)
        print(f"Gemeinsame Schlüssel: {key_fields}")
        if not key_fields:
            print("Keine gemeinsamen Schlüssel gefunden!")
            return

    # Index für schnellen Vergleich
    json_index = {tuple(str(row[k]) for k in key_fields): row for row in json_data}

    for csv_row in csv_data:
        key = tuple(str(csv_row[k]) for k in key_fields)
        json_row = json_index.get(key)
        if not json_row:
            print(f"Kein Match in JSON für: {key}")
            continue
        for col in csv_row:
            csv_val = csv_row[col]
            json_val = json_row.get(col, None)
            if str(csv_val) != str(json_val):
                print(f"Unterschied bei {key} Spalte '{col}': CSV='{csv_val}' vs JSON='{json_val}'")

if __name__ == "__main__":
    csv_data = read_csv(CSV_PATH)
    json_data = read_json(JSON_PATH)
    compare(csv_data, json_data)
