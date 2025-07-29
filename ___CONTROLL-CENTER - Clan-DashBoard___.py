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
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && npm run build"', shell=True)
    if not is_node_server_running():
        tkinter.messagebox.showwarning("Achtung", "Starte zuerst den Node-Server (Backend), bevor du den Build ausführst!")
        return
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
import tkinter.ttk
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

# Progressbar und Label für Backup (werden dynamisch angezeigt)
backup_progress_var = tk.DoubleVar()
backup_progressbar = tkinter.ttk.Progressbar(backup_frame, variable=backup_progress_var, maximum=100, length=420)
backup_progress_label = tk.Label(backup_frame, text="", fg="#eebc1d", bg="#232946", font=("Segoe UI", 10, "italic"))

def show_backup_progress():
    backup_progressbar.pack(pady=(6,2))
    backup_progress_label.config(text="Backup läuft... Bitte warten.")
    backup_progress_label.pack()
    backup_frame.update()

def hide_backup_progress():
    backup_progressbar.pack_forget()
    backup_progress_label.pack_forget()
    backup_progress_var.set(0)
    backup_frame.update()

def backup_project():
    now = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_name = f"B A C K U P - Clan-Dashboard_uff_2_{now}"
    dest = os.path.join(BACKUP_DIR, backup_name)
    def count_files(path):
        total = 0
        for root, dirs, files in os.walk(path):
            total += len(files)
        return total
    def copytree_with_progress(src, dst):
        total_files = count_files(src)
        copied = 0
        for root, dirs, files in os.walk(src):
            rel_path = os.path.relpath(root, src)
            dest_dir = os.path.join(dst, rel_path)
            os.makedirs(dest_dir, exist_ok=True)
            for file in files:
                src_file = os.path.join(root, file)
                dest_file = os.path.join(dest_dir, file)
                try:
                    shutil.copy2(src_file, dest_file)
                except Exception as e:
                    pass
                copied += 1
                percent = (copied / total_files) * 100 if total_files else 100
                backup_progress_var.set(percent)
                backup_progress_label.config(text=f"Backup läuft... ({copied}/{total_files} Dateien)")
                backup_frame.update()
        return copied, total_files
    show_backup_progress()
    try:
        copied, total = copytree_with_progress(UFF2_PATH, dest)
        backup_progress_var.set(100)
        backup_progress_label.config(text=f"Backup abgeschlossen! {copied} Dateien kopiert.")
        backup_frame.update()
        backup_frame.after(1200, hide_backup_progress)
        tkinter.messagebox.showinfo("Backup erfolgreich", f"Backup wurde erstellt: {dest}")
    except Exception as e:
        hide_backup_progress()
        tkinter.messagebox.showerror("Backup fehlgeschlagen", f"Fehler: {e}")

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

tk.Label(
    publish_frame,
    text=(
        "Schritt-für-Schritt Veröffentlichung deiner App auf GitHub Pages. "
        "Bitte führe die folgenden drei Schritte in der Reihenfolge aus:\n\n"
        "1. Commiten: Speichert alle Änderungen im lokalen Git-Repository.\n"
        "2. npm run build: Baut das React-Projekt für die Produktion.\n"
        "3. npm run deploy: Veröffentlicht die gebaute App automatisch auf GitHub Pages.\n\n"
        "Nach Schritt 3 ist deine App sofort unter folgendem Link online!"
    ),
    wraplength=900,
    justify="left",
    fg="#a259d9",
    bg="#232946",
    font=("Segoe UI", 10, "italic"),
    pady=4
).pack(fill="x")

# Button zum Öffnen der GitHub Pages Seite
import webbrowser
def open_github_pages():
    webbrowser.open_new("https://pizzaonkel.github.io/uff_2/")
tk.Button(publish_frame, text="Zu deiner veröffentlichten App (GitHub Pages)", width=44, bg="#eebc1d", fg="#232946", font=("Segoe UI", 10, "bold"), command=open_github_pages).pack(pady=(2,10))

def commit_local_changes():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && git add . && git commit -m \"Deploy build\""', shell=True)

def build_react():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && npm run build"', shell=True)

def npm_run_deploy():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && npm run deploy"', shell=True)

# Nur die drei gewünschten Buttons:
tk.Button(publish_frame, text="1. Commiten", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=commit_local_changes).pack(pady=6)
tk.Button(publish_frame, text="2. npm run build", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=build_react).pack(pady=6)
tk.Button(publish_frame, text="3. npm run deploy", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=npm_run_deploy).pack(pady=6)
build_frame = tk.LabelFrame(main_frame, text="Build-Ordner", fg="#eebc1d", bg="#232946", font=("Segoe UI", 12, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
build_frame.pack(fill="x", pady=(18, 10))
tk.Button(build_frame, text="Build-Ordner öffnen", width=36, bg="#eebc1d", fg="#232946", font=("Segoe UI", 10, "bold"), command=open_build_folder).pack(pady=3)

tk.Label(main_frame, text="Hinweis: Für die reine Entwicklung reichen die ersten beiden Buttons!", fg="#ff595e", bg="#232946", font=("Segoe UI", 10, "italic"), pady=10).pack()

root.mainloop()