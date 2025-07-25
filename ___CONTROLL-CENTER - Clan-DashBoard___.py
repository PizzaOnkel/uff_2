def git_checkout_ghpages():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && git checkout gh-pages"', shell=True)
def build_react():
    # Hinweis: Node-Server sollte vorher laufen
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


UFF2_PATH = r"c:\Users\user\Desktop\clan_dashboard_clean"
BACKUP_DIR = r"K:\B A C K U P - TOTAL BATTLE"

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

def build_react():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && npm run build"', shell=True)

def git_commit_and_push():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && git add . && git commit -m \"Deploy build\" && git push"', shell=True)

def git_checkout_main():
    subprocess.Popen(f'start cmd /K "cd /d {UFF2_PATH} && git checkout main"', shell=True)

def open_build_folder():
    os.startfile(os.path.join(UFF2_PATH, "build"))




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

# --- Deployment-Bereiche nebeneinander ---
deploy_row = tk.Frame(main_frame, bg="#232946")
deploy_row.pack(fill="both", expand=True, pady=(18, 10))

# --- gh-pages links ---
ghpages_frame = tk.LabelFrame(deploy_row, text="Deployment-Prozess (gh-pages)", fg="#a259d9", bg="#232946", font=("Segoe UI", 12, "bold"), bd=2, relief="ridge", padx=16, pady=12, labelanchor="n")
ghpages_frame.pack(side="left", fill="both", expand=True, padx=(0, 12))
tk.Label(ghpages_frame, text="GitHub Pages: Automatische Veröffentlichung als statische Website direkt über GitHub. Ideal für React-Apps ohne eigenen Server. Die Seite ist nach dem Push sofort öffentlich unter https://<username>.github.io/<repo>.", wraplength=520, justify="left", fg="#a259d9", bg="#232946", font=("Segoe UI", 9, "italic"), pady=4).pack(fill="x")
tk.Button(ghpages_frame, text="3. Zu 'gh-pages' Branch wechseln", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=git_checkout_ghpages).pack(pady=3)
tk.Label(ghpages_frame, text="Wechselt auf den speziellen Branch für GitHub Pages.", fg="#a259d9", bg="#232946", font=("Segoe UI", 8), anchor="w").pack(fill="x")
tk.Button(ghpages_frame, text="4. Build ausführen (npm run build)", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=build_react).pack(pady=3)
tk.Label(ghpages_frame, text="Erstellt die statischen Dateien für die Veröffentlichung.", fg="#a259d9", bg="#232946", font=("Segoe UI", 8), anchor="w").pack(fill="x")
tk.Button(ghpages_frame, text="5. Änderungen committen & pushen (gh-pages)", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=git_commit_and_push_ghpages).pack(pady=3)
tk.Label(ghpages_frame, text="Veröffentlicht die gebaute App direkt auf GitHub Pages.", fg="#a259d9", bg="#232946", font=("Segoe UI", 8), anchor="w").pack(fill="x")
tk.Button(ghpages_frame, text="6. Zurück zu 'main' wechseln", width=36, bg="#a259d9", fg="white", font=("Segoe UI", 10, "bold"), command=git_checkout_main).pack(pady=3)
tk.Label(ghpages_frame, text="Wechselt zurück zum Hauptentwicklungs-Branch.", fg="#a259d9", bg="#232946", font=("Segoe UI", 8), anchor="w").pack(fill="x")

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
tk.Button(build_frame, text="Build-Ordner öffnen", width=36, bg="#eebc1d", fg="#232946", font=("Segoe UI", 10, "bold"), command=open_build_folder).pack(pady=3)

tk.Label(main_frame, text="Hinweis: Für die reine Entwicklung reichen die ersten beiden Buttons!", fg="#ff595e", bg="#232946", font=("Segoe UI", 10, "italic"), pady=10).pack()

root.mainloop()