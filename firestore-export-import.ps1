# PowerShell-Skript für Firestore-Export und Import in den Emulator

# === Konfiguration ===
$nodePath = "C:\Users\user\AppData\Local\SICGames\TotalBattleChestTracker\Server\node.exe"
$serviceAccount = "serviceAccount.json"
$backupFile = "firestore-backup.json"
$importScript = "importFirestore.js"
$projectDir = "C:\Users\user\Desktop\clan_dashboard_clean"

# === Prüfe node.exe ===
Write-Host "Teste node.exe..."
& "$nodePath" -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "Node.js konnte nicht gefunden werden! Prüfe den Pfad."
    exit 1
}

# === Firestore-Export (Backup) ===
Write-Host "Starte Firestore-Export..."
npx firestore-export --accountCredentials=$serviceAccount --backupFile=$backupFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Export fehlgeschlagen! Prüfe Zugangsdaten und Internetverbindung."
    exit 1
}

# === Import in Emulator ===
Write-Host "Importiere Daten in den Emulator..."
$env:FIRESTORE_EMULATOR_HOST="localhost:8080"
Set-Location $projectDir
& "$nodePath" $importScript $serviceAccount $backupFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Import fehlgeschlagen! Prüfe Emulator und Backup-Datei."
    exit 1
}

Write-Host "FERTIG! Firestore-Daten wurden exportiert und in den Emulator importiert."
