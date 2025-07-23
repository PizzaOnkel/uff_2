// emailConfig.js
// EmailJS Konfiguration für das Clan Dashboard
// 
// ANLEITUNG ZUR EINRICHTUNG:
// 
// 1. Besuche https://www.emailjs.com/ und erstelle einen Account
// 2. Erstelle einen neuen Service (Gmail, Outlook, etc.)
// 3. Erstelle zwei E-Mail-Templates:
//    - Template für Kontaktformular
//    - Template für Admin-Registrierung
// 4. Ersetze die Platzhalter unten mit deinen echten Werten
// 5. Stelle sicher, dass die Template-Parameter übereinstimmen

export const EMAILJS_CONFIG = {
  // Deine EmailJS Service-ID (z.B. 'service_abc123')
  SERVICE_ID: 'service_proy5xl',
  
  // Template für Kontaktformular
  TEMPLATE_ID_CONTACT: 'template_s5h2p0z',
  
  // Template für Admin-Registrierung
  TEMPLATE_ID_ADMIN: 'template_22sj8u1',
  
  // Dein EmailJS Public Key (User ID) - NUR DEN PUBLIC KEY VERWENDEN!
  PUBLIC_KEY: 'NLUS5nZ0apdX33KXW',
  
  // Deine E-Mail-Adresse für Benachrichtigungen
  RECIPIENT_EMAIL: 'Superdampf1965@gmail.com'
};

// Template-Parameter für Kontaktformular:
// - from_name: Name des Absenders
// - from_email: E-Mail des Absenders
// - message: Nachricht
// - to_email: Empfänger-E-Mail
// - subject: Betreff
// - timestamp: Zeitstempel

// Template-Parameter für Admin-Registrierung:
// - applicant_name: Name des Antragstellers
// - applicant_email: E-Mail des Antragstellers
// - clan_role: Rolle im Clan
// - reason: Begründung
// - requested_role: Angeforderte Admin-Rolle
// - to_email: Empfänger-E-Mail
// - subject: Betreff
// - timestamp: Zeitstempel

// Beispiel für ein Kontaktformular-Template:
/*
Neue Kontaktanfrage

Von: {{from_name}} ({{from_email}})
Betreff: {{subject}}
Datum: {{timestamp}}

Nachricht:
{{message}}

---
Gesendet vom Clan Dashboard
*/

// Beispiel für ein Admin-Registrierungs-Template:
/*
Neue Admin-Registrierungsanfrage

Antragsteller: {{applicant_name}} ({{applicant_email}})
Rolle im Clan: {{clan_role}}
Angeforderte Admin-Rolle: {{requested_role}}
Datum: {{timestamp}}

Begründung:
{{reason}}

---
Bitte logge dich in das Admin-Panel ein, um diese Anfrage zu bearbeiten.
*/
