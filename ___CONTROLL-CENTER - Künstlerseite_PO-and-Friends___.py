# --- npm run deploy Button ---
def run_deploy():
    try:
        subprocess.Popen(f'start cmd /K "cd /d {PROJECT_PATH} && npm run deploy"', shell=True)
    except Exception as e:
        tkinter.messagebox.showerror("Fehler bei npm run deploy", str(e))

def git_commit_only():
    try:
        subprocess.Popen(f'start cmd /K "cd /d {PROJECT_PATH} && git add . && git commit -m \"Quick Commit\""', shell=True)
    except Exception as e:
        tkinter.messagebox.showerror("Fehler beim Commit", str(e))

def git_push_only():
    try:
        # Prüfe, ob ein Upstream-Branch existiert
        result = subprocess.run(f'cd /d {PROJECT_PATH} && git rev-parse --abbrev-ref --symbolic-full-name "@{{u}}"', shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            # Kein Upstream: setze ihn beim Push
            subprocess.Popen(f'start cmd /K "cd /d {PROJECT_PATH} && git push --set-upstream origin main"', shell=True)
        else:
            subprocess.Popen(f'start cmd /K "cd /d {PROJECT_PATH} && git push"', shell=True)
    except Exception as e:
        tkinter.messagebox.showerror("Fehler beim Push", str(e))

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
    subprocess.Popen(f'start cmd /K "cd /d {PROJECT_PATH} && git checkout gh-pages"', shell=True)

def build_react():
    # Build ohne Node-Server-Check (nicht erforderlich für Künstlerseite)
    subprocess.Popen(f'start cmd /K "cd /d {PROJECT_PATH} && set PUBLIC_URL=/uff_2 && npm run build"', shell=True)

def git_commit_and_push():
    # Hinweis: Build sollte vorher ausgeführt werden
    build_path = os.path.join(PROJECT_PATH, "build")
    if not os.path.exists(build_path):
        tkinter.messagebox.showwarning("Achtung", "Bitte führe zuerst den Build aus (npm run build), bevor du committest und pushst!")
        return
    subprocess.Popen(f'start cmd /K "cd /d {PROJECT_PATH} && git add . && git commit -m \"Deploy build\" && git push"', shell=True)

def git_commit_and_push_ghpages():
    # Hinweis: Build sollte vorher ausgeführt werden
    build_path = os.path.join(PROJECT_PATH, "build")
    if not os.path.exists(build_path):
        tkinter.messagebox.showwarning("Achtung", "Bitte führe zuerst den Build aus (npm run build), bevor du committest und pushst!")
        return
    subprocess.Popen(f'start cmd /K "cd /d {PROJECT_PATH} && git add . && git commit -m \"Publish to gh-pages\" && git push"', shell=True)

# --- Imports ---
import tkinter as tk
import tkinter.messagebox
import subprocess
import os
import shutil
from tkinter import ttk
import datetime

# --- GIT-TOOLS ---
def git_status():
    try:
        result = subprocess.run(f'cd /d {PROJECT_PATH} && git status', shell=True, capture_output=True, text=True)
        tkinter.messagebox.showinfo("Git Status", result.stdout)
    except Exception as e:
        tkinter.messagebox.showerror("Fehler bei git status", str(e))

def git_pull():
    try:
        # Vorher Status anzeigen und ggf. warnen
        result = subprocess.run(f'cd /d {PROJECT_PATH} && git status', shell=True, capture_output=True, text=True)
        if "Unmerged paths" in result.stdout or "both modified" in result.stdout:
            tkinter.messagebox.showwarning("Merge-Konflikt", "Achtung: Es gibt ungelöste Merge-Konflikte! Bitte löse diese zuerst.")
            return
        if "Changes not staged for commit" in result.stdout or "Untracked files" in result.stdout:
            if not tkinter.messagebox.askyesno("Warnung", "Es gibt ungespeicherte Änderungen! Trotzdem Pull ausführen?"):
                return
        pull_result = subprocess.run(f'cd /d {PROJECT_PATH} && git pull', shell=True, capture_output=True, text=True)
        tkinter.messagebox.showinfo("Git Pull", pull_result.stdout + "\n" + pull_result.stderr)
    except Exception as e:
        tkinter.messagebox.showerror("Fehler bei git pull", str(e))

def git_diff():
    try:
        result = subprocess.run(f'cd /d {PROJECT_PATH} && git diff', shell=True, capture_output=True, text=True)
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
        result = subprocess.run(f'cd /d {PROJECT_PATH} && git log --oneline -n 15', shell=True, capture_output=True, text=True)
        tkinter.messagebox.showinfo("Git Log (letzte 15)", result.stdout)
    except Exception as e:
        tkinter.messagebox.showerror("Fehler bei git log", str(e))

# --- Projektpfade ---
PROJECT_PATH = r"c:\Users\user\Desktop\clan_dashboard_clean"
BACKUP_DIR = r"K:\B A C K U P - KÜNSTLERSEITE"

# --- Backup & Entwicklung ---
def backup_project():
    import zipfile
    now = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_name = f"B A C K U P - Künstlerseite_PO-Friends_{now}.zip"
    dest = os.path.join(BACKUP_DIR, backup_name)
    try:
        # Zähle alle Dateien für den Fortschritt
        total_files = 0
        for rootdir, dirs, files in os.walk(PROJECT_PATH):
            # Überspringe node_modules und build Ordner
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'build', '.git', '__pycache__', 'firestore-export']]
            total_files += len(files)
        if total_files == 0:
            tkinter.messagebox.showwarning("Backup", "Keine Dateien zum Sichern gefunden!")
            return
        
        # Erstelle Backup-Verzeichnis falls nicht vorhanden
        os.makedirs(BACKUP_DIR, exist_ok=True)
        
        progress_var.set(0)
        progress_bar['maximum'] = total_files
        progress_bar.update()
        
        # Erstelle ZIP-Archiv
        copied = 0
        with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for rootdir, dirs, files in os.walk(PROJECT_PATH):
                # Überspringe große/unwichtige Ordner
                dirs[:] = [d for d in dirs if d not in ['node_modules', 'build', '.git', '__pycache__', 'firestore-export']]
                for file in files:
                    file_path = os.path.join(rootdir, file)
                    arcname = os.path.relpath(file_path, PROJECT_PATH)
                    zipf.write(file_path, arcname)
                    copied += 1
                    progress_var.set(copied)
                    progress_bar.update()
        
        progress_var.set(total_files)
        progress_bar.update()
        
        # Zeige Dateigröße
        size_mb = os.path.getsize(dest) / (1024 * 1024)
        tkinter.messagebox.showinfo("Backup erfolgreich", 
            f"Komprimiertes Backup wurde erstellt:\n{dest}\n\nGröße: {size_mb:.1f} MB")
    except Exception as e:
        tkinter.messagebox.showerror("Backup fehlgeschlagen", f"Fehler: {e}")
    finally:
        progress_var.set(0)
        progress_bar.update()

def start_react():
    subprocess.Popen(f'start cmd /K "cd /d {PROJECT_PATH} && npm start"', shell=True)

def git_checkout_deploy():
    subprocess.Popen(f'start cmd /K "cd /d {PROJECT_PATH} && git checkout deploy"', shell=True)

def git_checkout_main():
    subprocess.Popen(f'start cmd /K "cd /d {PROJECT_PATH} && git checkout main"', shell=True)

def open_build_folder():
    os.startfile(os.path.join(PROJECT_PATH, "build"))

# --- GUI-Initialisierung und Layout ---
root = tk.Tk()
root.title("P.O. & Friends - Künstlerseite Control Panel")
root.configure(bg="#232946")

# Breiteres Fenster
root.geometry("1200x900")

main_frame = tk.Frame(root, bg="#232946", padx=24, pady=24)
main_frame.pack(fill="both", expand=True)

# --- Online React öffnen ---
import webbrowser
def open_online_react():
    webbrowser.open('https://pizzaonkel.github.io/uff_2/')
tk.Button(main_frame, text="🌐 Online-Künstlerseite öffnen", width=36, bg="#43a047", fg="white", font=("Segoe UI", 11, "bold"), command=open_online_react).pack(pady=(0, 16))

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
tk.Button(backup_frame, text="💾 Backup jetzt erstellen", width=36, bg="#eebc1d", fg="#232946", font=("Segoe UI", 10, "bold"), command=backup_project).pack(pady=4)
# Fortschrittsbalken für Backup
progress_var = tk.IntVar()
progress_bar = ttk.Progressbar(backup_frame, variable=progress_var, maximum=100, length=400)
progress_bar.pack(pady=(0, 8))

tk.Label(main_frame, text="🎵 P.O. & Friends - Künstlerseite Control Center 🎵", font=("Segoe UI", 20, "bold"), fg="#eebc1d", bg="#232946", pady=10).pack()

# --- Entwicklung ---
dev_frame = tk.LabelFrame(main_frame, text="Entwicklung", fg="#3fa7d6", bg="#232946", font=("Segoe UI", 12, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
dev_frame.pack(fill="x", pady=(18, 10))
tk.Label(dev_frame, text="React Development Server starten (öffnet automatisch Browser)", anchor="w", fg="#3fa7d6", bg="#232946", font=("Segoe UI", 10)).pack(fill="x")
tk.Button(dev_frame, text="▶ React starten (Entwicklung)", width=36, bg="#3fa7d6", fg="white", font=("Segoe UI", 10, "bold"), command=start_react).pack(pady=4)

# --- Deployment-Bereiche nebeneinander ---
deploy_row = tk.Frame(main_frame, bg="#232946")
deploy_row.pack(fill="both", expand=True, pady=(18, 10))

# --- Deployment-Prozess (Standard, z.B. main-Branch) ---
main_deploy_frame = tk.LabelFrame(deploy_row, text="Deployment-Prozess (GitHub Pages)", fg="#a259d9", bg="#232946", font=("Segoe UI", 12, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
main_deploy_frame.pack(side="left", fill="both", expand=True, padx=(0, 12))
tk.Label(main_deploy_frame, text="Standard-Deployment: Commit, Build und automatisches Deployment auf GitHub Pages. Die Website wird nach dem Deployment unter pizzaonkel.github.io/uff_2/ verfügbar sein.", wraplength=520, justify="left", fg="#a259d9", bg="#232946", font=("Segoe UI", 9, "italic"), pady=4).pack(fill="x")
tk.Button(main_deploy_frame, text="1. Committen (nur Commit)", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=git_commit_only).pack(pady=3)
tk.Label(main_deploy_frame, text="Fügt alle Änderungen zum Commit hinzu und erstellt einen Commit.", fg="#a259d9", bg="#232946", font=("Segoe UI", 8), anchor="w").pack(fill="x")
tk.Button(main_deploy_frame, text="2. Build ausführen (npm run build)", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=build_react).pack(pady=3)
tk.Label(main_deploy_frame, text="Erstellt die statischen Dateien für die Veröffentlichung.", fg="#a259d9", bg="#232946", font=("Segoe UI", 8), anchor="w").pack(fill="x")

# --- Deploy-Button für npm run deploy ---
tk.Button(main_deploy_frame, text="3. 🚀 Deploy (npm run deploy)", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=run_deploy).pack(pady=3)
tk.Label(main_deploy_frame, text="Führt automatisches Deployment auf GitHub Pages durch.", fg="#a259d9", bg="#232946", font=("Segoe UI", 8), anchor="w").pack(fill="x")

# --- deploy-Branch rechts ---
deploy_frame = tk.LabelFrame(deploy_row, text="Deployment-Prozess (deploy-Branch)", fg="#43d675", bg="#232946", font=("Segoe UI", 12, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
deploy_frame.pack(side="right", fill="both", expand=True, padx=(12, 0))
tk.Label(deploy_frame, text="Eigener Deploy-Branch: Für eigene Server oder individuelle Deployments. Die gebaute App wird nicht automatisch auf GitHub Pages veröffentlicht, sondern z.B. manuell auf einen Webserver kopiert oder von einem anderen System verarbeitet.", wraplength=520, justify="left", fg="#43d675", bg="#232946", font=("Segoe UI", 9, "italic"), pady=4).pack(fill="x")
tk.Button(deploy_frame, text="7. Zu 'deploy' Branch wechseln", width=36, bg="#43d675", fg="white", font=("Segoe UI", 10, "bold"), command=git_checkout_deploy).pack(pady=3)
tk.Label(deploy_frame, text="Wechselt auf den eigenen Deploy-Branch.", fg="#43d675", bg="#232946", font=("Segoe UI", 8), anchor="w").pack(fill="x")
tk.Button(deploy_frame, text="8. Build ausführen (npm run build)", width=36, bg="#43d675", fg="white", font=("Segoe UI", 10, "bold"), command=build_react).pack(pady=3)
tk.Label(deploy_frame, text="Erstellt die statischen Dateien für die Veröffentlichung.", fg="#43d675", bg="#232946", font=("Segoe UI", 8), anchor="w").pack(fill="x")
tk.Button(deploy_frame, text="9. Änderungen committen & pushen (deploy)", width=36, bg="#43d675", fg="white", font=("Segoe UI", 10, "bold"), command=git_commit_and_push).pack(pady=3)
tk.Label(deploy_frame, text="Veröffentlicht die gebaute App im Deploy-Branch (z.B. für eigenen Server).", fg="#43d675", bg="#232946", font=("Segoe UI", 8), anchor="w").pack(fill="x")
tk.Button(deploy_frame, text="10. Zurück zu 'main' wechseln", width=36, bg="#43d675", fg="white", font=("Segoe UI", 10, "bold"), command=git_checkout_main).pack(pady=3)
tk.Label(deploy_frame, text="Wechselt zurück zum Hauptentwicklungs-Branch.", fg="#43d675", bg="#232946", font=("Segoe UI", 8), anchor="w").pack(fill="x")

# --- Build-Ordner öffnen ---
build_frame = tk.LabelFrame(main_frame, text="Build-Ordner", fg="#eebc1d", bg="#232946", font=("Segoe UI", 12, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
build_frame.pack(fill="x", pady=(18, 10))
tk.Button(build_frame, text="📁 Build-Ordner öffnen", width=36, bg="#eebc1d", fg="#232946", font=("Segoe UI", 10, "bold"), command=open_build_folder).pack(pady=3)

# --- Schnell-Deployment Bereich (3-Schritte) ---
quickdeploy_frame = tk.LabelFrame(main_frame, text="⚡ Schnell-Deployment (3-Schritte)", fg="#FFD700", bg="#232946", font=("Segoe UI", 12, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
quickdeploy_frame.pack(fill="x", pady=(18, 10))
tk.Label(quickdeploy_frame, text="Einfacher 3-Schritte-Workflow für schnelles Deployment, unabhängig vom Branch.", fg="#FFD700", bg="#232946", font=("Segoe UI", 10, "italic"), anchor="w").pack(fill="x")
btnrow_qd = tk.Frame(quickdeploy_frame, bg="#232946")
btnrow_qd.pack(fill="x", pady=4)
tk.Button(btnrow_qd, text="1. Committen (nur Commit)", width=28, bg="#FFD700", fg="#232946", font=("Segoe UI", 10, "bold"), command=git_commit_only).pack(side="left", padx=6)
tk.Button(btnrow_qd, text="2. Build erstellen (npm run build)", width=28, bg="#FFD700", fg="#232946", font=("Segoe UI", 10, "bold"), command=build_react).pack(side="left", padx=6)
tk.Button(btnrow_qd, text="3. Pushen (nur Push)", width=28, bg="#FFD700", fg="#232946", font=("Segoe UI", 10, "bold"), command=git_push_only).pack(side="left", padx=6)
tk.Label(quickdeploy_frame, text="Hinweis: Diese Buttons führen KEINEN Branch-Wechsel aus und sind für schnelles, manuelles Deployment gedacht!", fg="#FFD700", bg="#232946", font=("Segoe UI", 9, "italic"), anchor="w").pack(fill="x", pady=(4,0))

tk.Label(main_frame, text="💡 Tipp: Für reine Entwicklung reicht der React-Start-Button!", fg="#ff595e", bg="#232946", font=("Segoe UI", 10, "italic"), pady=10).pack()

root.mainloop()
