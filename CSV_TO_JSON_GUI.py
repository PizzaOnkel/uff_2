import csv
import json
from collections import defaultdict
import tkinter as tk
from tkinter import messagebox
import os  # neu hinzugefügt

def convert_csv_to_json():
    csv_filename = entry.get().strip()
    if not csv_filename:
        messagebox.showerror("Fehler", "Bitte Dateinamen eingeben.")
        return

    # Verzeichnis des aktuellen Scripts ermitteln
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Pfad zur CSV-Datei im Script-Verzeichnis
    csv_file = os.path.join(script_dir, csv_filename)

    try:
        data = defaultdict(lambda: defaultdict(list))
        with open(csv_file, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=',')  # Komma als Trennzeichen
            for row in reader:
                date = row['Date']
                clanmate = row['Clanmate']
                chest_name = row['ChestName']
                chest_level = int(row['ChestLevel'])
                chest_type = row['ChestType']

                chest_type_str = f"Level {chest_level} {chest_type}"

                chest = {
                    "Name": chest_name,
                    "Type": chest_type_str,
                    "Source": chest_type_str,
                    "Level": chest_level
                }

                data[date][clanmate].append(chest)

        # Pfad zur JSON-Ausgabedatei im Script-Verzeichnis
        json_file = os.path.join(script_dir, 'output.json')

        result = {}
        for date, clanmates in data.items():
            clanmate_list = []
            for clanmate, chests in clanmates.items():
                clanmate_list.append({
                    "Clanmate": clanmate,
                    "chests": chests
                })
            result[date] = clanmate_list

        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        messagebox.showinfo("Erfolg", f"Konvertierung abgeschlossen.\nDatei: {json_file}")

    except FileNotFoundError:
        messagebox.showerror("Fehler", f"Datei '{csv_filename}' nicht gefunden.")
    except Exception as e:
        messagebox.showerror("Fehler", f"Fehler bei der Verarbeitung:\n{e}")

# Tkinter GUI
root = tk.Tk()
root.title("CSV zu JSON Konverter")

frame = tk.Frame(root, padx=10, pady=10)
frame.pack()

label = tk.Label(frame, text="CSV-Dateiname (im Script-Verzeichnis):")
label.pack(anchor='w')

entry = tk.Entry(frame, width=50)
entry.pack()

button = tk.Button(frame, text="OK", command=convert_csv_to_json)
button.pack(pady=5)

root.mainloop()