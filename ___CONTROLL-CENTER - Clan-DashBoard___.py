import tkinter as tk
import subprocess
import os

UFF2_PATH = r"c:\Users\user\Desktop\clan-dashboard\uff_2_clean\uff_2"

def start_node_server():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && node server.js"', shell=True)

def start_react():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && npm start"', shell=True)

def build_react():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && npm run build"', shell=True)

def open_build_folder():
    os.startfile(os.path.join(UFF2_PATH, "build"))

root = tk.Tk()
root.title("Clan-Dashboard Control Panel")

tk.Label(root, text="1. Node-Server starten (Backend, nur 1x pro Sitzung!)", anchor="w", fg="blue").pack(fill="x", padx=10)
tk.Button(root, text="1. Node Server starten", width=40, command=start_node_server).pack(pady=5)

tk.Label(root, text="2. React starten (Frontend für Entwicklung, öffnet Browser)", anchor="w", fg="blue").pack(fill="x", padx=10)
tk.Button(root, text="2. React starten (Entwicklung)", width=40, command=start_react).pack(pady=5)

tk.Label(root, text="3. React builden (für Deployment, nur wenn du veröffentlichen willst)", anchor="w", fg="blue").pack(fill="x", padx=10)
tk.Button(root, text="3. React build (für Deployment)", width=40, command=build_react).pack(pady=5)

tk.Label(root, text="4. Build-Ordner öffnen (diese Dateien auf Webserver kopieren)", anchor="w", fg="blue").pack(fill="x", padx=10)
tk.Button(root, text="4. Build-Ordner öffnen", width=40, command=open_build_folder).pack(pady=5)

tk.Label(root, text="Hinweis: Für die reine Entwicklung reichen die ersten beiden Buttons!", fg="red").pack(pady=10)

root.mainloop()