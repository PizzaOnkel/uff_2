import csv
import json
from collections import defaultdict
import tkinter as tk
from tkinter import messagebox
import os

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
        error_lines = []
        line_count = 0
        
        with open(csv_file, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=',')
            
            for line_num, row in enumerate(reader, start=2):  # Start bei 2 wegen Header
                line_count += 1
                try:
                    date = row['Date'].strip()
                    clanmate = row['Clanmate'].strip()
                    chest_name = row['ChestName'].strip()
                    
                    # Robuste Konvertierung von ChestLevel
                    try:
                        chest_level = int(row['ChestLevel']) if row['ChestLevel'].strip() else 0
                    except (ValueError, TypeError):
                        chest_level = 0
                        error_lines.append(f"Zeile {line_num}: ChestLevel '{row['ChestLevel']}' nicht konvertierbar")
                    
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
                    error_lines.append(f"Zeile {line_num}: Fehlende Spalte {e}")
                except Exception as e:
                    error_lines.append(f"Zeile {line_num}: Unbekannter Fehler - {e}")

        # Zeige Fehler-Zusammenfassung an
        if error_lines:
            error_msg = f"Gefundene Probleme ({len(error_lines)} von {line_count} Zeilen):\n\n"
            error_msg += "\n".join(error_lines[:10])  # Zeige nur erste 10 Fehler
            if len(error_lines) > 10:
                error_msg += f"\n... und {len(error_lines) - 10} weitere Fehler"
            
            messagebox.showwarning("Warnungen", error_msg)

        # Pfad zur JSON-Ausgabedatei - gleicher Name wie CSV, nur mit .json Endung
        json_filename = csv_filename.rsplit('.', 1)[0] + '.json'
        json_file = os.path.join(script_dir, json_filename)

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

        success_msg = f"Konvertierung abgeschlossen!\n"
        success_msg += f"Datei: {json_file}\n"
        success_msg += f"Verarbeitete Zeilen: {line_count}\n"
        success_msg += f"Fehler: {len(error_lines)}"
        
        messagebox.showinfo("Erfolg", success_msg)

    except FileNotFoundError:
        messagebox.showerror("Fehler", f"Datei '{csv_filename}' nicht gefunden im Verzeichnis:\n{script_dir}")
    except UnicodeDecodeError:
        messagebox.showerror("Fehler", "Encoding-Problem. Versuche die Datei als UTF-8 zu speichern.")
    except Exception as e:
        messagebox.showerror("Fehler", f"Fehler bei der Verarbeitung:\n{e}")

def debug_csv():
    """Debug-Funktion um CSV-Struktur zu analysieren"""
    csv_filename = entry.get().strip()
    if not csv_filename:
        messagebox.showerror("Fehler", "Bitte Dateinamen eingeben.")
        return
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file = os.path.join(script_dir, csv_filename)
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            # Erste 5 Zeilen lesen
            lines = [f.readline().strip() for _ in range(5)]
            
        debug_info = "CSV Debug Info:\n\n"
        debug_info += f"Header: {lines[0]}\n\n"
        debug_info += "Erste Datenzeilen:\n"
        for i, line in enumerate(lines[1:], 1):
            debug_info += f"Zeile {i+1}: {line}\n"
            debug_info += f"Spalten: {len(line.split(','))}\n\n"
        
        messagebox.showinfo("CSV Debug", debug_info)
        
    except Exception as e:
        messagebox.showerror("Debug Fehler", f"Fehler beim Debug: {e}")

# Tkinter GUI
root = tk.Tk()
root.title("CSV zu JSON Konverter - Verbessert")

frame = tk.Frame(root, padx=20, pady=20)
frame.pack()

label = tk.Label(frame, text="CSV-Dateiname (im Script-Verzeichnis):")
label.pack(anchor='w')

entry = tk.Entry(frame, width=50)
entry.pack(pady=5)
entry.insert(0, "ChestData_2025-09-10_002.csv")  # Vorausgefüllt

button_frame = tk.Frame(frame)
button_frame.pack(pady=10)

convert_button = tk.Button(button_frame, text="Konvertieren", command=convert_csv_to_json, bg='lightgreen')
convert_button.pack(side='left', padx=5)

debug_button = tk.Button(button_frame, text="Debug CSV", command=debug_csv, bg='lightblue')
debug_button.pack(side='left', padx=5)

root.mainloop()