# EmailJS Einrichtung für das Clan Dashboard

## Übersicht

Das Clan Dashboard verwendet EmailJS für E-Mail-Benachrichtigungen in folgenden Bereichen:
- **Kontaktformular**: Benachrichtigungen bei neuen Kontaktanfragen
- **Admin-Registrierung**: Benachrichtigungen bei neuen Admin-Anfragen

## Schritt-für-Schritt Anleitung

### 1. EmailJS Account erstellen

1. Besuche [emailjs.com](https://www.emailjs.com/)
2. Erstelle einen kostenlosen Account
3. Verifiziere deine E-Mail-Adresse

### 2. Email Service einrichten

1. Gehe zu "Email Services" im Dashboard
2. Klicke auf "Add New Service"
3. Wähle deinen E-Mail-Provider (Gmail, Outlook, etc.)
4. Folge den Anweisungen zur Verbindung
5. Notiere dir die **Service ID** (z.B. `service_abc123`)

### 3. Email Templates erstellen

#### Template für Kontaktformular

1. Gehe zu "Email Templates"
2. Klicke auf "Create New Template"
3. Wähle deinen Service aus
4. Erstelle ein Template mit folgenden Parametern:
   - `{{from_name}}` - Name des Absenders
   - `{{from_email}}` - E-Mail des Absenders
   - `{{message}}` - Nachricht
   - `{{subject}}` - Betreff
   - `{{timestamp}}` - Zeitstempel

**Beispiel-Template:**
```
Betreff: Neue Kontaktanfrage - {{subject}}

Von: {{from_name}} ({{from_email}})
Datum: {{timestamp}}

Nachricht:
{{message}}

---
Gesendet vom Clan Dashboard
```

5. Speichere das Template und notiere dir die **Template ID**

#### Template für Admin-Registrierung

1. Erstelle ein weiteres Template
2. Verwende folgende Parameter:
   - `{{applicant_name}}` - Name des Antragstellers
   - `{{applicant_email}}` - E-Mail des Antragstellers
   - `{{clan_role}}` - Rolle im Clan
   - `{{reason}}` - Begründung
   - `{{requested_role}}` - Angeforderte Admin-Rolle
   - `{{subject}}` - Betreff
   - `{{timestamp}}` - Zeitstempel

**Beispiel-Template:**
```
Betreff: Neue Admin-Registrierungsanfrage - {{subject}}

Antragsteller: {{applicant_name}} ({{applicant_email}})
Rolle im Clan: {{clan_role}}
Angeforderte Admin-Rolle: {{requested_role}}
Datum: {{timestamp}}

Begründung:
{{reason}}

---
Bitte logge dich in das Admin-Panel ein, um diese Anfrage zu bearbeiten.
```

3. Speichere das Template und notiere dir die **Template ID**

### 4. Public Key finden

1. Gehe zu "Integration" im Dashboard
2. Kopiere den **Public Key** (User ID)

### 5. Konfiguration eintragen

Öffne die Datei `src/utils/emailConfig.js` und ersetze die Platzhalter:

```javascript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_abc123',                    // Deine Service-ID
  TEMPLATE_ID_CONTACT: 'template_xyz789',         // Template für Kontaktformular
  TEMPLATE_ID_ADMIN: 'template_def456',           // Template für Admin-Registrierung
  PUBLIC_KEY: 'user_ghi012',                      // Dein Public Key
  RECIPIENT_EMAIL: 'deine-email@example.com'      // Deine E-Mail-Adresse
};
```

### 6. Testen

1. Starte das Projekt: `npm start`
2. Navigiere zum Admin-Bereich
3. Verwende die "E-Mail-Konfiguration testen" Seite
4. Sende eine Test-E-Mail
5. Überprüfe dein E-Mail-Postfach

## Troubleshooting

### Häufige Probleme

**Fehler: "EmailJS service is not available"**
- Überprüfe, ob der Service korrekt eingerichtet ist
- Stelle sicher, dass die Service-ID korrekt ist

**Fehler: "Template not found"**
- Überprüfe die Template-IDs
- Stelle sicher, dass die Templates aktiv sind

**Fehler: "Invalid public key"**
- Überprüfe den Public Key im EmailJS Dashboard
- Stelle sicher, dass keine Leerzeichen vorhanden sind

**E-Mails kommen nicht an**
- Überprüfe den Spam-Ordner
- Stelle sicher, dass die Empfänger-E-Mail korrekt ist
- Überprüfe die E-Mail-Service-Einstellungen

### Logs überprüfen

Öffne die Browser-Entwicklertools (F12) und schaue in die Konsole:
- ✅ = Erfolgreich gesendet
- ❌ = Fehler beim Senden
- ⚠️ = Warnung (meist nicht kritisch)

## Rate Limits

EmailJS hat folgende Limits für kostenlose Accounts:
- 200 E-Mails pro Monat
- 50 E-Mails pro Tag

Für höhere Limits ist ein kostenpflichtiger Plan erforderlich.

## Support

Bei Problemen:
1. Überprüfe die EmailJS-Dokumentation
2. Schaue in die Browser-Konsole
3. Teste die Konfiguration mit der Test-Seite
4. Überprüfe die Firestore-Regeln (falls Firebase-Fehler)

## Sicherheit

- Teile nie deine Private Keys
- Der Public Key kann sicher in der Client-Anwendung verwendet werden
- E-Mail-Templates können auf der EmailJS-Seite bearbeitet werden
