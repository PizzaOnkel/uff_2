import psutil

def is_node_server_running():
    # Prüft, ob ein Node.js-Prozess läuft
    for proc in psutil.process_iter(['name', 'cmdline']):
        try:
            if proc.info['name'] and 'node' in proc.info['name'].lower():
                # Optional: nach server.js im cmdline filtern
                if proc.info['cmdline'] and any('server.js' in str(arg) for arg in proc.info['cmdline']):
                    return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return False

def git_checkout_ghpages():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && git checkout gh-pages"', shell=True)
def build_react():
    # Hinweis: Node-Server sollte vorher laufen
    # if not is_node_server_running():
        # tkinter.messagebox.showwarning("Achtung", "Starte zuerst den Node-Server (Backend), bevor du den Build ausführst!")
        # return
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && npm run build"', shell=True)

def git_commit_and_push():
    # Hinweis: Build sollte vorher ausgeführt werden
    build_path = os.path.join(UFF2_PATH, "build")
    if not os.path.exists(build_path):
        tkinter.messagebox.showwarning("Achtung", "Bitte führe zuerst den Build aus (npm run build), bevor du committest und pushst!")
        return
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && git add . && git commit -m \"Deploy build\" && git push"', shell=True)

def git_commit_and_push_ghpages():
    # Hinweis: Build sollte vorher ausgeführt werden
    build_path = os.path.join(UFF2_PATH, "build")
    if not os.path.exists(build_path):
        tkinter.messagebox.showwarning("Achtung", "Bitte führe zuerst den Build aus (npm run build), bevor du committest und pushst!")
        return

    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && git add . && git commit -m \"Publish to gh-pages\" && git push"', shell=True)

# --- Imports ---
import tkinter as tk
import tkinter.messagebox
import subprocess
import os
import shutil
import datetime

# --- GIT-TOOLS ---
def git_status():
    try:
        result = subprocess.run(f'cd /d {UFF2_PATH} && git status', shell=True, capture_output=True, text=True)
        tkinter.messagebox.showinfo("Git Status", result.stdout)
    except Exception as e:
        tkinter.messagebox.showerror("Fehler bei git status", str(e))

def git_pull():
    try:
        # Vorher Status anzeigen und ggf. warnen
        result = subprocess.run(f'cd /d {UFF2_PATH} && git status', shell=True, capture_output=True, text=True)
        if "Unmerged paths" in result.stdout or "both modified" in result.stdout:
            tkinter.messagebox.showwarning("Merge-Konflikt", "Achtung: Es gibt ungelöste Merge-Konflikte! Bitte löse diese zuerst.")
            return
        if "Changes not staged for commit" in result.stdout or "Untracked files" in result.stdout:
            if not tkinter.messagebox.askyesno("Warnung", "Es gibt ungespeicherte Änderungen! Trotzdem Pull ausführen?"):
                return
        pull_result = subprocess.run(f'cd /d {UFF2_PATH} && git pull', shell=True, capture_output=True, text=True)
        tkinter.messagebox.showinfo("Git Pull", pull_result.stdout + "\n" + pull_result.stderr)
    except Exception as e:
        tkinter.messagebox.showerror("Fehler bei git pull", str(e))

def git_diff():
    try:
        result = subprocess.run(f'cd /d {UFF2_PATH} && git diff', shell=True, capture_output=True, text=True)
        if not result.stdout.strip():
            tkinter.messagebox.showinfo("Git Diff", "Keine Änderungen zum Anzeigen.")
        else:
            # Zeige Diff in eigenem Fenster, falls zu lang
            diff_win = tk.Toplevel()
            diff_win.title("Git Diff")
            text = tk.Text(diff_win, wrap="none", font=("Consolas", 10))
            text.insert("1.0", result.stdout)
            text.pack(expand=True, fill="both")
            diff_win.geometry("900x600")
    except Exception as e:
        tkinter.messagebox.showerror("Fehler bei git diff", str(e))

def git_log():
    try:
        result = subprocess.run(f'cd /d {UFF2_PATH} && git log --oneline -n 15', shell=True, capture_output=True, text=True)
        tkinter.messagebox.showinfo("Git Log (letzte 15)", result.stdout)

    except Exception as e:
        tkinter.messagebox.showerror("Fehler bei git log", str(e))

# --- Projektpfade ---
UFF2_PATH = r"c:\Users\user\Desktop\clan_dashboard_clean"
BACKUP_DIR = r"K:\B A C K U P - TOTAL BATTLE"

# --- Backup & Entwicklung ---
def backup_project():
    now = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_name = f"B A C K U P - Clan-Dashboard_uff_2_{now}"
    dest = os.path.join(BACKUP_DIR, backup_name)
    try:
        shutil.copytree(UFF2_PATH, dest)
        tkinter.messagebox.showinfo("Backup erfolgreich", f"Backup wurde erstellt: {dest}")
    except Exception as e:
        tkinter.messagebox.showerror("Backup fehlgeschlagen", f"Fehler: {e}")

def start_node_server():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && node server.js"', shell=True)

def start_react():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && npm start"', shell=True)

def git_checkout_deploy():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && git checkout deploy"', shell=True)

def git_checkout_main():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && git checkout main"', shell=True)

def open_build_folder():
    os.startfile(os.path.join(UFF2_PATH, "build"))

# --- GUI-Initialisierung und Layout ---
root = tk.Tk()
root.title("Clan-Dashboard Control Panel")
root.configure(bg="#232946")

# Breiteres Fenster
root.geometry("1200x900")

main_frame = tk.Frame(root, bg="#232946", padx=24, pady=24)
main_frame.pack(fill="both", expand=True)

# --- GIT STATUS & SICHERHEIT ---
git_frame = tk.LabelFrame(main_frame, text="Git-Status & Sicherheit", fg="#ff595e", bg="#232946", font=("Segoe UI", 12, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
git_frame.pack(fill="x", pady=(10, 10))
tk.Label(git_frame, text="Git-Status prüfen, Änderungen vergleichen, Pull ausführen und letzte Commits anzeigen. Hilft, Konflikte und Datenverlust zu vermeiden!", anchor="w", fg="#ff595e", bg="#232946", font=("Segoe UI", 10)).pack(fill="x")
btnrow = tk.Frame(git_frame, bg="#232946")
btnrow.pack(fill="x", pady=4)
tk.Button(btnrow, text="Git Status anzeigen", width=22, bg="#ff595e", fg="white", font=("Segoe UI", 10, "bold"), command=git_status).pack(side="left", padx=4)
tk.Button(btnrow, text="Git Pull (aktualisieren)", width=22, bg="#ff595e", fg="white", font=("Segoe UI", 10, "bold"), command=git_pull).pack(side="left", padx=4)
tk.Button(btnrow, text="Git Diff (Änderungen)", width=22, bg="#ff595e", fg="white", font=("Segoe UI", 10, "bold"), command=git_diff).pack(side="left", padx=4)
tk.Button(btnrow, text="Git Log (Commits)", width=22, bg="#ff595e", fg="white", font=("Segoe UI", 10, "bold"), command=git_log).pack(side="left", padx=4)
tk.Label(git_frame, text="Tipp: Vor jedem Push immer erst Pull & Status prüfen!", fg="#ff595e", bg="#232946", font=("Segoe UI", 9, "italic"), anchor="w").pack(fill="x", pady=(4,0))

# --- Backup-Bereich ---
backup_frame = tk.LabelFrame(main_frame, text="Backup & Sicherheit", fg="#eebc1d", bg="#232946", font=("Segoe UI", 12, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
backup_frame.pack(fill="x", pady=(10, 10))
tk.Label(backup_frame, text="Projekt-Backup auf externes Laufwerk (empfohlen vor jedem Deployment)", anchor="w", fg="#eebc1d", bg="#232946", font=("Segoe UI", 10)).pack(fill="x")
tk.Button(backup_frame, text="Backup jetzt erstellen", width=36, bg="#eebc1d", fg="#232946", font=("Segoe UI", 10, "bold"), command=backup_project).pack(pady=4)

tk.Label(main_frame, text="Clan-Dashboard Control Center", font=("Segoe UI", 22, "bold"), fg="#eebc1d", bg="#232946", pady=10).pack()

# --- Entwicklung ---
dev_frame = tk.LabelFrame(main_frame, text="Entwicklung", fg="#3fa7d6", bg="#232946", font=("Segoe UI", 12, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
dev_frame.pack(fill="x", pady=(18, 10))
tk.Label(dev_frame, text="1. Node-Server starten (Backend, nur 1x pro Sitzung!)", anchor="w", fg="#3fa7d6", bg="#232946", font=("Segoe UI", 10)).pack(fill="x")
tk.Button(dev_frame, text="1. Node Server starten", width=36, bg="#3fa7d6", fg="white", font=("Segoe UI", 10, "bold"), command=start_node_server).pack(pady=4)
tk.Label(dev_frame, text="2. React starten (Frontend für Entwicklung, öffnet Browser)", anchor="w", fg="#3fa7d6", bg="#232946", font=("Segoe UI", 10)).pack(fill="x")
tk.Button(dev_frame, text="2. React starten (Entwicklung)", width=36, bg="#3fa7d6", fg="white", font=("Segoe UI", 10, "bold"), command=start_react).pack(pady=4)


# --- Build-Ordner öffnen ---
### --- Projekt-Veröffentlichung (GitHub Pages) mit Scrollbar ---
publish_canvas = tk.Canvas(main_frame, bg="#232946", highlightthickness=0, height=380)
publish_scrollbar = tk.Scrollbar(main_frame, orient="vertical", command=publish_canvas.yview)
publish_canvas.configure(yscrollcommand=publish_scrollbar.set)
publish_scrollbar.pack(side="right", fill="y", padx=(0,8), pady=(18,10))
publish_canvas.pack(fill="x", pady=(18, 10), expand=False)

publish_frame = tk.LabelFrame(publish_canvas, text="Projekt-Veröffentlichung (GitHub Pages)", fg="#a259d9", bg="#232946", font=("Segoe UI", 14, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
publish_window = publish_canvas.create_window((0,0), window=publish_frame, anchor="nw", width=1100)

def on_publish_frame_configure(event):
    publish_canvas.configure(scrollregion=publish_canvas.bbox("all"))
publish_frame.bind("<Configure>", on_publish_frame_configure)

tk.Label(publish_frame, text="Schritt-für-Schritt Veröffentlichung deiner App auf GitHub Pages. Folge der Reihenfolge für ein sicheres Deployment!\n\nWICHTIG: Wenn du beim Branch-Wechsel eine Fehlermeldung bekommst, dass lokale Änderungen vorhanden sind, dann sichere oder parke deine Änderungen zuerst mit den folgenden Buttons:", wraplength=900, justify="left", fg="#a259d9", bg="#232946", font=("Segoe UI", 10, "italic"), pady=4).pack(fill="x")

# Änderungen sichern (commit)
def commit_local_changes():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && git add . && git commit -m "Lokale Änderungen sichern""', shell=True)
tk.Button(publish_frame, text="Änderungen sichern (commit)", width=36, bg="#ff595e", fg="white", font=("Segoe UI", 10, "bold"), command=commit_local_changes).pack(pady=2)

# Änderungen stashen (zwischenparken)
def stash_local_changes():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && git stash push -m "Zwischenablage durch Control Center""', shell=True)
tk.Button(publish_frame, text="Änderungen zwischenparken (stash)", width=36, bg="#eebc1d", fg="#232946", font=("Segoe UI", 10, "bold"), command=stash_local_changes).pack(pady=2)

tk.Label(publish_frame, text="Danach kannst du mit Schritt 1 weitermachen!", fg="#a259d9", bg="#232946", font=("Segoe UI", 9, "italic"), anchor="w").pack(fill="x", pady=(2,6))

# 1. Zu gh-pages wechseln
tk.Button(publish_frame, text="1. Zu 'gh-pages' Branch wechseln", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=git_checkout_ghpages).pack(pady=3)
# 2. Node Server starten (optional)
tk.Button(publish_frame, text="2. Node Server starten (Backend, optional)", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=start_node_server).pack(pady=3)
# 3. Build ausführen
tk.Button(publish_frame, text="3. Build ausführen (npm run build)", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=build_react).pack(pady=3)
# 4. Änderungen committen & pushen (gh-pages)
tk.Button(publish_frame, text="4. Änderungen committen & pushen (gh-pages)", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=git_commit_and_push_ghpages).pack(pady=3)
# 5. Zurück zu main wechseln
tk.Button(publish_frame, text="5. Zurück zu 'main' wechseln", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=git_checkout_main).pack(pady=3)
tk.Label(publish_frame, text="Nach Schritt 4 ist deine App sofort unter https://<username>.github.io/<repo> online!", fg="#a259d9", bg="#232946", font=("Segoe UI", 9), anchor="w").pack(fill="x", pady=(4,0))
build_frame = tk.LabelFrame(main_frame, text="Build-Ordner", fg="#eebc1d", bg="#232946", font=("Segoe UI", 12, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
build_frame.pack(fill="x", pady=(18, 10))
tk.Button(build_frame, text="Build-Ordner öffnen", width=36, bg="#eebc1d", fg="#232946", font=("Segoe UI", 10, "bold"), command=open_build_folder).pack(pady=3)

tk.Label(main_frame, text="Hinweis: Für die reine Entwicklung reichen die ersten beiden Buttons!", fg="#ff595e", bg="#232946", font=("Segoe UI", 10, "italic"), pady=10).pack()

root.mainloop()