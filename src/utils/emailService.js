// emailService.js
// E-Mail-Benachrichtigungen mit EmailJS

import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from './emailConfig';

// EmailJS initialisieren
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

// E-Mail für Kontaktformular senden
export const sendContactEmail = async (formData) => {
  try {
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      to_email: EMAILJS_CONFIG.RECIPIENT_EMAIL,
      subject: `Neue Kontaktanfrage von ${formData.name}`,
      timestamp: new Date().toLocaleString('de-DE')
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_CONTACT,
      templateParams
    );

    console.log('✅ Kontaktformular E-Mail erfolgreich gesendet:', result);
    return { 
      success: true, 
      messageId: result.text,
      message: 'E-Mail-Benachrichtigung gesendet'
    };
  } catch (error) {
    console.error('❌ Fehler beim Senden der Kontaktformular E-Mail:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'E-Mail-Benachrichtigung fehlgeschlagen'
    };
  }
};

// E-Mail für Admin-Registrierung senden
export const sendAdminRequestEmail = async (adminData) => {
  try {
    const templateParams = {
      applicant_name: adminData.name,
      applicant_email: adminData.email,
      clan_role: adminData.clanRole || 'Nicht angegeben',
      reason: adminData.reason || 'Keine Begründung angegeben',
      requested_role: adminData.requestedRole || 'Administrator',
      to_email: EMAILJS_CONFIG.RECIPIENT_EMAIL,
      subject: `Neue Admin-Registrierungsanfrage von ${adminData.name}`,
      timestamp: new Date().toLocaleString('de-DE')
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_ADMIN,
      templateParams
    );

    console.log('✅ Admin-Registrierung E-Mail erfolgreich gesendet:', result);
    return { 
      success: true, 
      messageId: result.text,
      message: 'E-Mail-Benachrichtigung gesendet'
    };
  } catch (error) {
    console.error('❌ Fehler beim Senden der Admin-Registrierung E-Mail:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'E-Mail-Benachrichtigung fehlgeschlagen'
    };
  }
};

// Funktion zum Testen der E-Mail-Konfiguration
export const testEmailConfiguration = async () => {
  try {
    const testParams = {
      to_email: EMAILJS_CONFIG.RECIPIENT_EMAIL,
      subject: 'Test E-Mail - Clan Dashboard',
      message: 'Dies ist eine Test-E-Mail zur Überprüfung der EmailJS-Konfiguration.',
      timestamp: new Date().toLocaleString('de-DE')
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_CONTACT,
      testParams
    );

    console.log('✅ Test-E-Mail erfolgreich gesendet:', result);
    return { success: true, message: 'Test-E-Mail erfolgreich gesendet' };
  } catch (error) {
    console.error('❌ Fehler beim Senden der Test-E-Mail:', error);
    return { success: false, error: error.message };
  }
};

// Alias für Kompatibilität
export const sendContactFormNotification = sendContactEmail;
export const sendAdminRegistrationNotification = sendAdminRequestEmail;

// E-Mail-Targets für Referenz
export const EMAIL_TARGETS = {
  CONTACT_FORM: EMAILJS_CONFIG.RECIPIENT_EMAIL,
  ADMIN_REQUESTS: EMAILJS_CONFIG.RECIPIENT_EMAIL
};
