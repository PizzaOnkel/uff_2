import React, { useState, useEffect, createContext, useContext } from 'react';

// Importiere Firebase-Module
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

// Lucide React Icons (Stelle sicher, dass diese installiert sind: npm install lucide-react)
// Die Liste wurde gekürzt, um Kompilierungsfehler zu vermeiden. Füge nur die Icons hinzu, die du wirklich brauchst.
import { Home, Info, Users, BarChart, Trophy, Mail, Settings, PlusCircle, Archive, Edit, Trash2, Save, XCircle, CheckCircle, Crown, Target } from 'lucide-react';

// Übersetzungen für verschiedene Sprachen
const translations = {
  de: {
    welcomeTitle: "Willkommen im Clan Dashboard!",
    selectLanguage: "Sprache auswählen:",
    goToInfoPage: "Zur Informationsseite",
    infoPageTitle: "Über unseren Clan und das Spiel",
    clanName: "Unser Clan: Union For Friends 2",
    clanDescription: "Wir sind eine Gemeinschaft leidenschaftlicher Spieler, die sich dem Abenteuer und dem gemeinsamen Erfolg verschrieben haben. Egal COT oder KvK, wir unterstützen uns gegenseitig und haben Spaß dabei.",
    gameName: "Das Spiel: Total Battle",
    gameDescription: "ist ein taktisch, strategisches Kriegsspiel. Egal ob du überfallen wirst, oder selbst überfälle durchführst, wir halten uns stets an die Netikette.\nWir befinden uns im Königreich Nr. 36 und folgen den Gesetzen des Königreichs ROE 36*",
    normsInfo: "In diesem Spiel und in unserem Clan, musst du Normen erfüllen um selbst erfolgreich zu sein und den Clan zum Erfolg zu verhelfen.",
    statsInfo: "Hier auf dieser Seite kannst du dich über Clan- und persönliche Statistiken informieren.",
    errorSuggestion: "Wenn du Fehler entdeckst oder Vorschläge/Anregungen zu dieser Seite hast, nutze das Kontaktformular",
    goodLuck: "Ich wünsche euch allen eine erfolgreiche Jagd.\nLos geht’s – viel Glück und habt Spaß!",
    pizzaOnkel: "Der PizzaOnkel",
    copyright: "© 2024 Clan-Dashboard. Alle Rechte by PizzaOnkel.",
    goToNavigation: "Zur Navigation",
    navigationTitle: "Clan-Navigation",
    personalPlayerReport: "Persönlicher Spielerbericht",
    currentTotalEvent: "Aktuelle Veranstaltungsperiode",
    furtherLinkIndividualDays: "Weiterführender Link zu den einzelnen Tagen",
    eventArchive: "Veranstaltungsarchiv",
    topTen: "Top 10 Spieler",
    hallOfChamps: "Ruhmeshalle der Champions",
    contact: "Kontakt",
    adminPanel: "Admin-Panel",
    backToWelcome: "Zurück zur Willkommensseite",
    backToNavigation: "Zurück zur Navigation",
    playerReportTitle: "Persönlicher Bericht für",
    selectPlayer: "Spieler auswählen:",
    loadReport: "Bericht laden",
    noPlayerSelected: "Bitte wähle einen Spieler aus.",
    eventPeriod: "Veranstaltungsperiode:",
    totalScore: "Gesamtpunktzahl:",
    rank: "Rang:",
    participation: "Teilnahme:",
    details: "Details:",
    day: "Tag",
    score: "Punkte",
    viewDetails: "Details ansehen",
    eventDetails: "Details zur Veranstaltung",
    eventName: "Veranstaltungsname:",
    eventDate: "Datum:",
    eventDescription: "Beschreibung:",
    returnToCurrentEvent: "Zurück zur aktuellen Veranstaltung",
    archiveTitle: "Veranstaltungsarchiv",
    selectPeriod: "Periode auswählen:",
    topTenTitle: "Top 10 Spieler - Aktuelle Periode",
    hallOfChampsTitle: "Ruhmeshalle der Champions",
    contactTitle: "Kontakt aufnehmen",
    contactText: "Hast du Fragen oder Anregungen? Kontaktiere uns über das Formular.",
    yourName: "Dein Name:",
    yourEmail: "Deine E-Mail:",
    yourMessage: "Deine Nachricht:",
    sendMessage: "Nachricht senden",
    messageSent: "Nachricht erfolgreich gesendet!",
    adminPanelTitle: "Admin-Panel",
    managePlayers: "Spieler verwalten",
    manageEvents: "Veranstaltungen verwalten",
    manageAdmins: "Admins verwalten",
    addPlayer: "Spieler hinzufügen",
    playerName: "Spielername",
    playerDiscord: "Discord-ID (optional)",
    playerGameId: "Spiel-ID (optional)",
    add: "Hinzufügen",
    editPlayer: "Spieler bearbeiten",
    update: "Aktualisieren",
    deletePlayer: "Spieler löschen",
    confirmDeletePlayer: "Bist du sicher, dass du diesen Spieler löschen möchtest?",
    addEvent: "Veranstaltung hinzufügen",
    eventPeriodName: "Name der Veranstaltungsperiode (z.B. 'Mai 2024')",
    eventStartDate: "Startdatum",
    eventEndDate: "Enddatum",
    addEventPeriod: "Veranstaltungsperiode hinzufügen",
    editEvent: "Veranstaltung bearbeiten",
    deleteEvent: "Veranstaltung löschen",
    confirmDeleteEvent: "Bist du sicher, dass du diese Veranstaltung löschen möchtest?",
    addAdmin: "Admin hinzufügen",
    adminUserId: "Admin User ID",
    addAdminBtn: "Admin hinzufügen",
    removeAdmin: "Admin entfernen",
    confirmRemoveAdmin: "Bist du sicher, dass du diesen Admin entfernen möchtest?",
    noData: "Keine Daten verfügbar.",
    loading: "Laden...",
    error: "Ein Fehler ist aufgetreten:",
    loginRequired: "Bitte melde dich an, um auf das Admin-Panel zuzugreifen.",
    accessDenied: "Zugriff verweigert. Du bist kein Admin.",
    userId: "Deine User ID:",
    copyToClipboard: "In Zwischenablage kopieren",
    copied: "Kopiert!",
    playerManagement: "Spielerverwaltung",
    eventPeriodManagement: "Veranstaltungsperioden-Verwaltung",
    adminManagement: "Admin-Verwaltung",
    playerAddedSuccess: "Spieler erfolgreich hinzugefügt!",
    playerUpdatedSuccess: "Spieler erfolgreich aktualisiert!",
    playerDeletedSuccess: "Spieler erfolgreich gelöscht!",
    eventAddedSuccess: "Veranstaltungsperiode erfolgreich hinzugefügt!",
    eventUpdatedSuccess: "Veranstaltungsperiode erfolgreich aktualisiert!",
    eventDeletedSuccess: "Veranstaltungsperiode erfolgreich gelöscht!",
    adminAddedSuccess: "Admin erfolgreich hinzugefügt!",
    adminRemovedSuccess: "Admin erfolgreich entfernt!",
    currentAdmins: "Aktuelle Admins:",
    adminId: "Admin ID",
    actions: "Aktionen",
    noAdmins: "Keine Admins vorhanden.",
    manageEventDays: "Tage verwalten",
    addEventDay: "Tag hinzufügen",
    dayNumber: "Tag Nummer",
    dayDate: "Datum des Tages",
    dayDescription: "Beschreibung des Tages",
    addDay: "Tag hinzufügen",
    editDay: "Tag bearbeiten",
    deleteDay: "Tag löschen",
    confirmDeleteDay: "Bist du sicher, dass du diesen Tag löschen möchtest?",
    dayAddedSuccess: "Tag erfolgreich hinzugefügt!",
    dayUpdatedSuccess: "Tag erfolgreich aktualisiert!",
    dayDeletedSuccess: "Tag erfolgreich gelöscht!",
    managePlayerScores: "Spielergebnisse verwalten",
    selectEventDay: "Tag auswählen:",
    addPlayerScore: "Spielerergebnis hinzufügen",
    scorePoints: "Punkte",
    addScore: "Ergebnis hinzufügen",
    editPlayerScore: "Spielerergebnis bearbeiten",
    deletePlayerScore: "Spielerergebnis löschen",
    confirmDeletePlayerScore: "Bist du sicher, dass du dieses Spielergebnis löschen möchtest?",
    scoreAddedSuccess: "Ergebnis erfolgreich hinzugefügt!",
    scoreUpdatedSuccess: "Ergebnis erfolgreich aktualisiert!",
    scoreDeletedSuccess: "Ergebnis erfolgreich gelöscht!",
    playerScoresForDay: "Spielerergebnisse für Tag",
    player: "Spieler",
    points: "Punkte",
    noScores: "Keine Ergebnisse für diesen Tag.",
    totalPlayers: "Gesamtzahl der Spieler:",
    totalEvents: "Gesamtzahl der Veranstaltungen:",
    lastUpdated: "Zuletzt aktualisiert:",
    overallStats: "Gesamtstatistiken",
    archivePeriod: "Periode archivieren",
    confirmArchivePeriod: "Bist du sicher, dass du diese Periode archivieren möchtest? Dies verschiebt sie ins Archiv und macht sie für neue Einträge unzugänglich.",
    periodArchivedSuccess: "Periode erfolgreich archiviert!",
    unarchivePeriod: "Periode dearchivieren",
    confirmUnarchivePeriod: "Bist du sicher, dass du diese Periode dearchivieren möchtest? Sie wird wieder aktiv.",
    periodUnarchivedSuccess: "Periode erfolgreich dearchiviert!",
    activePeriods: "Aktive Perioden",
    archivedPeriods: "Archivierte Perioden",
    viewArchivedPeriod: "Archivierte Periode ansehen",
    periodStatusActive: "Aktiv",
    periodStatusArchived: "Archiviert",
    currentPeriod: "Aktuelle Periode:",
    noActivePeriods: "Keine aktiven Perioden gefunden.",
    noArchivedPeriods: "Keine archivierten Perioden gefunden.",
    selectActivePeriod: "Aktive Periode auswählen:",
    selectArchivedPeriod: "Archivierte Periode auswählen:",
    setAsCurrent: "Als aktuelle Periode festlegen",
    confirmSetCurrent: "Bist du sicher, dass du diese Periode als aktuelle festlegen möchtest? Nur eine Periode kann gleichzeitig aktiv sein.",
    setCurrentSuccess: "Periode erfolgreich als aktuell festgelegt!",
    manageCurrentEvent: "Aktuelle Veranstaltung verwalten",
    manageArchivedEvents: "Archivierte Veranstaltungen verwalten",
    noCurrentEventDays: "Keine Tage für die aktuelle Veranstaltung gefunden.",
    noArchivedEventDays: "Keine Tage für diese archivierte Veranstaltung gefunden.",
    noCurrentPlayerScores: "Keine Spielergebnisse für die aktuelle Veranstaltung gefunden.",
    noArchivedPlayerScores: "Keine Spielergebnisse für diese archivierte Veranstaltung gefunden.",
    selectCurrentEventDay: "Tag der aktuellen Veranstaltung auswählen:",
    selectArchivedEventDay: "Tag der archivierten Veranstaltung auswählen:",
    manageCurrentPlayerScores: "Spielergebnisse der aktuellen Veranstaltung verwalten",
    manageArchivedPlayerScores: "Spielergebnisse der archivierten Veranstaltung verwalten",
    adminMessage: "Nachricht an Admins",
    messageContent: "Nachricht",
    sendMessageToAdmins: "Nachricht an Admins senden",
    messageSentToAdmins: "Nachricht an Admins gesendet!",
    adminMessages: "Admin-Nachrichten",
    noAdminMessages: "Keine Admin-Nachrichten.",
    fromUser: "Von Benutzer",
    message: "Nachricht",
    timestamp: "Zeitstempel",
    deleteMessage: "Nachricht löschen",
    confirmDeleteMessage: "Bist du sicher, dass du diese Nachricht löschen möchtest?",
    messageDeletedSuccess: "Nachricht erfolgreich gelöscht!",
    showAdminMessages: "Admin-Nachrichten anzeigen",
    hideAdminMessages: "Admin-Nachrichten ausblenden",
    playerRanking: "Spielerranking",
    playerParticipation: "Spielerbeteiligung",
    playerScores: "Spielergebnisse",
    eventOverview: "Veranstaltungsübersicht",
    totalEventsParticipated: "Anzahl der teilgenommenen Events:",
    averageScore: "Durchschnittliche Punktzahl:",
    bestScore: "Beste Punktzahl:",
    playerStats: "Spielerstatistiken",
    noPlayerStats: "Keine Statistiken für diesen Spieler verfügbar.",
    playerActivity: "Spieleraktivität",
    lastParticipation: "Letzte Teilnahme:",
    playerNotFound: "Spieler nicht gefunden.",
    playerSearchPlaceholder: "Spielername eingeben...",
    searchPlayer: "Spieler suchen",
    playerList: "Spielerliste",
    noPlayers: "Keine Spieler gefunden.",
    playerDetails: "Spielerdetails",
    edit: "Bearbeiten",
    delete: "Löschen",
    cancel: "Abbrechen",
    confirm: "Bestätigen",
    close: "Schließen",
    overallRank: "Gesamtrang",
    overallScore: "Gesamtpunktzahl",
    playerOverallReport: "Gesamtbericht für",
    selectOverallPlayer: "Spieler für Gesamtbericht auswählen:",
    loadOverallReport: "Gesamtbericht laden",
    overallReportTitle: "Gesamt-Spielerbericht",
    totalScoreAllPeriods: "Gesamtpunktzahl über alle Perioden:",
    averageScoreAllPeriods: "Durchschnittliche Punktzahl über alle Perioden:",
    totalEventsAllPeriods: "Gesamtzahl der Events über alle Perioden:",
    detailedScoresByPeriod: "Detaillierte Ergebnisse nach Periode:",
    period: "Periode",
    event: "Veranstaltung",
    scoreDetails: "Ergebnisdetails",
    backToOverallReport: "Zurück zum Gesamtbericht",
    noOverallReport: "Kein Gesamtbericht für diesen Spieler verfügbar.",
    toggleTheme: "Theme wechseln",
    lightTheme: "Helles Theme",
    darkTheme: "Dunkles Theme",
    systemTheme: "System-Theme",
    theme: "Theme",
    currentTheme: "Aktuelles Theme:",
    applyTheme: "Theme anwenden",
    themeChangedSuccess: "Theme erfolgreich geändert!",
    settings: "Einstellungen",
    languageSettings: "Spracheinstellungen",
    themeSettings: "Theme-Einstellungen",
    saveSettings: "Einstellungen speichern",
    settingsSavedSuccess: "Einstellungen erfolgreich gespeichert!",
    resetSettings: "Einstellungen zurücksetzen",
    confirmResetSettings: "Bist du sicher, dass du alle Einstellungen auf Standard zurücksetzen möchtest?",
    settingsResetSuccess: "Einstellungen erfolgreich zurückgesetzt!",
    exportData: "Daten exportieren",
    importData: "Daten importieren",
    exportPlayers: "Spieler exportieren",
    exportEvents: "Veranstaltungen exportieren",
    exportScores: "Ergebnisse exportieren",
    importPlayers: "Spieler importieren",
    importEvents: "Veranstaltungen importieren",
    importScores: "Ergebnisse importieren",
    selectFile: "Datei auswählen",
    upload: "Hochladen",
    download: "Herunterladen",
    dataExportedSuccess: "Daten erfolgreich exportiert!",
    dataImportedSuccess: "Daten erfolgreich importiert!",
    invalidFileFormat: "Ungültiges Dateiformat. Bitte wähle eine JSON-Datei.",
    fileTooLarge: "Datei zu groß. Maximale Größe: 5MB.",
    uploading: "Hochladen...",
    downloading: "Herunterladen...",
    dataSyncError: "Fehler beim Synchronisieren der Daten:",
    dataCorrupted: "Importierte Daten sind beschädigt oder ungültig.",
    backupData: "Daten sichern",
    restoreData: "Daten wiederherstellen",
    lastBackup: "Letzte Sicherung:",
    createBackup: "Sicherung erstellen",
    restoreFromBackup: "Aus Sicherung wiederherstellen",
    confirmRestore: "Bist du sicher, dass du die Daten aus der letzten Sicherung wiederherstellen möchtest? Aktuelle Daten gehen dabei verloren.",
    backupCreatedSuccess: "Sicherung erfolgreich erstellt!",
    restoreSuccess: "Daten erfolgreich wiederhergestellt!",
    noBackup: "Keine Sicherung vorhanden.",
    adminLogs: "Admin-Protokolle",
    viewLogs: "Protokolle ansehen",
    noLogs: "Keine Protokolle vorhanden.",
    logEntry: "Protokolleintrag",
    logTimestamp: "Zeitstempel",
    logUser: "Benutzer",
    logAction: "Aktion",
    clearLogs: "Protokolle löschen",
    confirmClearLogs: "Bist du sicher, dass du alle Protokolle löschen möchtest?",
    logsClearedSuccess: "Protokolle erfolgreich gelöscht!",
    eventHistory: "Veranstaltungsverlauf",
    viewEventHistory: "Verlauf ansehen",
    noEventHistory: "Kein Veranstaltungsverlauf vorhanden.",
    eventHistoryEntry: "Verlaufseintrag",
    eventHistoryTimestamp: "Zeitstempel",
    eventHistoryEvent: "Veranstaltung",
    eventHistoryAction: "Aktion",
    clearEventHistory: "Verlauf löschen",
    confirmClearEventHistory: "Bist du sicher, dass du den Veranstaltungsverlauf löschen möchtest?",
    eventHistoryClearedSuccess: "Verlauf erfolgreich gelöscht!",
    playerActivityLog: "Spieleraktivitätsprotokoll",
    viewPlayerActivityLog: "Aktivitätsprotokoll ansehen",
    noPlayerActivityLog: "Kein Spieleraktivitätsprotokoll vorhanden.",
    playerActivityLogEntry: "Aktivitätseintrag",
    playerActivityLogTimestamp: "Zeitstempel",
    playerActivityLogPlayer: "Spieler",
    playerActivityLogAction: "Aktion",
    clearPlayerActivityLog: "Aktivitätsprotokoll löschen",
    confirmClearPlayerActivityLog: "Bist du sicher, dass du das Spieleraktivitätsprotokoll löschen möchtest?",
    playerActivityLogClearedSuccess: "Aktivitätsprotokoll erfolgreich gelöscht!",
    totalPlayersRegistered: "Registrierte Spieler:",
    totalEventsRecorded: "Erfasste Veranstaltungen:",
    totalScoresRecorded: "Erfasste Ergebnisse:",
    dataSummary: "Datenübersicht",
    viewDataSummary: "Übersicht ansehen",
    refreshData: "Daten aktualisieren",
    dataRefreshedSuccess: "Daten erfolgreich aktualisiert!",
    generateReport: "Bericht generieren",
    reportGeneratedSuccess: "Bericht erfolgreich generiert!",
    reportType: "Berichtstyp",
    selectReportType: "Berichtstyp auswählen:",
    playerReport: "Spielerbericht",
    eventReport: "Veranstaltungsbericht",
    overallReport: "Gesamtbericht",
    generate: "Generieren",
    reportOptions: "Berichtsoptionen",
    startDate: "Startdatum",
    endDate: "Enddatum",
    includeArchived: "Archivierte Daten einschließen",
    exportReport: "Bericht exportieren",
    reportExportedSuccess: "Bericht erfolgreich exportiert!",
    reportPreview: "Berichtsvorschau",
    noReportPreview: "Keine Berichtsvorschau verfügbar. Generiere einen Bericht.",
    printReport: "Bericht drucken",
    printingReport: "Bericht wird gedruckt...",
    printSuccess: "Bericht erfolgreich gedruckt!",
    printError: "Fehler beim Drucken des Berichts.",
    playerSearch: "Spielersuche",
    searchPlaceholder: "Spielername oder ID",
    searchButton: "Suchen",
    noSearchResults: "Keine Suchergebnisse.",
    searchResult: "Suchergebnis",
    clearSearch: "Suche löschen",
    filterOptions: "Filteroptionen",
    filterByEvent: "Nach Veranstaltung filtern",
    filterByPeriod: "Nach Periode filtern",
    applyFilter: "Filter anwenden",
    clearFilter: "Filter löschen",
    noFilteredData: "Keine Daten für die ausgewählten Filter.",
    filteredData: "Gefilterte Daten",
    resetFilters: "Filter zurücksetzen",
    filterApplied: "Filter angewendet.",
    filterCleared: "Filter gelöscht.",
    notificationSettings: "Benachrichtigungseinstellungen",
    enableNotifications: "Benachrichtigungen aktivieren",
    notificationSound: "Benachrichtigungston",
    notificationVolume: "Lautstärke",
    testNotification: "Test-Benachrichtigung",
    notificationTestSuccess: "Test-Benachrichtigung gesendet!",
    notificationPermissionDenied: "Benachrichtigungsberechtigung verweigert. Bitte erlaube Benachrichtigungen in deinen Browsereinstellungen.",
    notificationPermissionGranted: "Benachrichtigungsberechtigung erteilt.",
    notificationPermissionPrompt: "Erlaube Benachrichtigungen, um über wichtige Updates informiert zu werden.",
    notificationEnabled: "Benachrichtigungen aktiviert.",
    notificationDisabled: "Benachrichtigungen deaktiviert.",
    showNotifications: "Benachrichtigungen anzeigen",
    hideNotifications: "Benachrichtigungen ausblenden",
    noNotifications: "Keine Benachrichtigungen.",
    notification: "Benachrichtigung",
    notificationTimestamp: "Zeitstempel",
    notificationMessage: "Nachricht",
    clearNotifications: "Benachrichtigungen löschen",
    confirmClearNotifications: "Bist du sicher, dass du alle Benachrichtigungen löschen möchtest?",
    notificationsClearedSuccess: "Benachrichtigungen erfolgreich gelöscht!",
    markAsRead: "Als gelesen markieren",
    markAllAsRead: "Alle als gelesen markieren",
    markedAsReadSuccess: "Benachrichtigung als gelesen markiert!",
    markedAllAsReadSuccess: "Alle Benachrichtigungen als gelesen markiert!",
    unreadNotifications: "Ungelesene Benachrichtigungen:",
    allNotificationsRead: "Alle Benachrichtigungen gelesen.",
    profileSettings: "Profileinstellungen",
    changeUsername: "Benutzernamen ändern",
    newUsername: "Neuer Benutzername",
    updateUsername: "Benutzernamen aktualisieren",
    usernameUpdatedSuccess: "Benutzername erfolgreich aktualisiert!",
    changePassword: "Passwort ändern",
    currentPassword: "Aktuelles Passwort",
    newPassword: "Neues Passwort",
    confirmNewPassword: "Neues Passwort bestätigen",
    updatePassword: "Passwort aktualisieren",
    passwordUpdatedSuccess: "Passwort erfolgreich aktualisiert!",
    passwordsMismatch: "Neue Passwörter stimmen nicht überein.",
    invalidCurrentPassword: "Aktuelles Passwort ist falsch.",
    deleteAccount: "Konto löschen",
    confirmDeleteAccount: "Bist du sicher, dass du dein Konto löschen möchtest? Dies kann nicht rückgängig gemacht werden.",
    accountDeletedSuccess: "Konto erfolgreich gelöscht!",
    reauthenticateRequired: "Bitte melde dich erneut an, um diese Aktion durchzuführen.",
    accountSettings: "Kontoeinstellungen",
    privacySettings: "Datenschutzeinstellungen",
    dataSharing: "Datenfreigabe",
    enableDataSharing: "Datenfreigabe aktivieren",
    dataSharingInfo: "Teile anonymisierte Nutzungsdaten, um die App zu verbessern.",
    savePrivacySettings: "Datenschutzeinstellungen speichern",
    privacySettingsSavedSuccess: "Datenschutzeinstellungen erfolgreich gespeichert!",
    aboutApp: "Über die App",
    appVersion: "Version:",
    developer: "Entwickler:",
    releaseDate: "Veröffentlichungsdatum:",
    license: "Lizenz:",
    viewLicense: "Lizenz ansehen",
    feedback: "Feedback",
    sendFeedback: "Feedback senden",
    feedbackSentSuccess: "Feedback erfolgreich gesendet!",
    reportBug: "Fehler melden",
    bugReportSentSuccess: "Fehlerbericht erfolgreich gesendet!",
    featureRequest: "Funktionsanfrage",
    featureRequestSentSuccess: "Funktionsanfrage erfolgreich gesendet!",
    help: "Hilfe",
    faq: "FAQ",
    viewFaq: "FAQ ansehen",
    documentation: "Dokumentation",
    viewDocumentation: "Dokumentation ansehen",
    support: "Support",
    contactSupport: "Support kontaktieren",
    supportContactedSuccess: "Support erfolgreich kontaktiert!",
    termsOfService: "Nutzungsbedingungen",
    privacyPolicy: "Datenschutzerklärung",
    viewTerms: "Nutzungsbedingungen ansehen",
    viewPrivacy: "Datenschutzerklärung ansehen",
    legal: "Rechtliches",
    logout: "Abmelden",
    confirmLogout: "Bist du sicher, dass du dich abmelden möchtest?",
    logoutSuccess: "Erfolgreich abgemeldet!",
    login: "Anmelden",
    register: "Registrieren",
    email: "E-Mail",
    password: "Passwort",
    forgotPassword: "Passwort vergessen?",
    resetPassword: "Passwort zurücksetzen",
    resetPasswordSuccess: "Passwort-Reset-E-Mail gesendet!",
    noAccount: "Noch kein Konto?",
    alreadyAccount: "Bereits ein Konto?",
    loginSuccess: "Erfolgreich angemeldet!",
    registerSuccess: "Registrierung erfolgreich!",
    authError: "Authentifizierungsfehler:",
    emailNotVerified: "E-Mail nicht verifiziert. Bitte überprüfe deinen Posteingang.",
    sendVerificationEmail: "Verifizierungs-E-Mail senden",
    verificationEmailSent: "Verifizierungs-E-Mail gesendet!",
    loadingUserData: "Benutzerdaten werden geladen...",
    welcomeUser: "Willkommen, {{username}}!",
    profile: "Profil",
    editProfile: "Profil bearbeiten",
    viewProfile: "Profil ansehen",
    updateProfile: "Profil aktualisieren",
    profileUpdatedSuccess: "Profil erfolgreich aktualisiert!",
    username: "Benutzername",
    avatar: "Avatar",
    changeAvatar: "Avatar ändern",
    uploadAvatar: "Avatar hochladen",
    avatarUpdatedSuccess: "Avatar erfolgreich aktualisiert!",
    invalidImageFormat: "Ungültiges Bildformat. Bitte wähle eine Bilddatei (JPG, PNG, GIF).",
    imageTooLarge: "Bild zu groß. Maximale Größe: 2MB.",
    uploadingAvatar: "Avatar wird hochgeladen...",
    deleteAvatar: "Avatar löschen",
    confirmDeleteAvatar: "Bist du sicher, dass du deinen Avatar löschen möchtest?",
    avatarDeletedSuccess: "Avatar erfolgreich gelöscht!",
    memberSince: "Mitglied seit:",
    lastLogin: "Letzter Login:",
    roles: "Rollen:",
    publicProfile: "Öffentliches Profil",
    privateProfile: "Privates Profil",
    showPublicProfile: "Öffentliches Profil anzeigen",
    hidePublicProfile: "Öffentliches Profil ausblenden",
    publicProfileEnabled: "Öffentliches Profil aktiviert.",
    publicProfileDisabled: "Öffentliches Profil deaktiviert.",
    shareProfile: "Profil teilen",
    profileShareLink: "Profil-Share-Link:",
    copyLink: "Link kopieren",
    linkCopied: "Link kopiert!",
    shareOnSocialMedia: "Auf Social Media teilen",
    socialMediaShareSuccess: "Profil erfolgreich geteilt!",
    socialMediaShareError: "Fehler beim Teilen des Profils.",
    playerAchievements: "Spieler-Errungenschaften",
    viewAchievements: "Errungenschaften ansehen",
    noAchievements: "Keine Errungenschaften vorhanden.",
    achievement: "Errungenschaft",
    achievementDescription: "Beschreibung",
    achievementDate: "Datum",
    addAchievement: "Errungenschaft hinzufügen",
    achievementName: "Name der Errungenschaft",
    achievementAddedSuccess: "Errungenschaft erfolgreich hinzugefügt!",
    editAchievement: "Errungenschaft bearbeiten",
    deleteAchievement: "Errungenschaft löschen",
    confirmDeleteAchievement: "Bist du sicher, dass du diese Errungenschaft löschen möchtest?",
    achievementUpdatedSuccess: "Errungenschaft erfolgreich aktualisiert!",
    achievementDeletedSuccess: "Errungenschaft erfolgreich gelöscht!",
    eventGoals: "Veranstaltungsziele",
    viewGoals: "Ziele ansehen",
    noGoals: "Keine Ziele vorhanden.",
    goal: "Ziel",
    goalDescription: "Beschreibung",
    goalTarget: "Zielwert",
    goalProgress: "Fortschritt",
    addGoal: "Ziel hinzufügen",
    goalName: "Name des Ziels",
    goalAddedSuccess: "Ziel erfolgreich hinzugefügt!",
    editGoal: "Ziel bearbeiten",
    deleteGoal: "Ziel löschen",
    confirmDeleteGoal: "Bist du sicher, dass du dieses Ziel löschen möchtest?",
    goalUpdatedSuccess: "Ziel erfolgreich aktualisiert!",
    goalDeletedSuccess: "Ziel erfolgreich gelöscht!",
    milestones: "Meilensteine",
    viewMilestones: "Meilensteine ansehen",
    noMilestones: "Keine Meilensteine vorhanden.",
    milestone: "Meilenstein",
    milestoneDescription: "Beschreibung",
    milestoneDate: "Datum",
    addMilestone: "Meilenstein hinzufügen",
    milestoneName: "Name des Meilensteins",
    milestoneAddedSuccess: "Meilenstein erfolgreich hinzugefügt!",
    editMilestone: "Meilenstein bearbeiten",
    deleteMilestone: "Meilenstein löschen",
    confirmDeleteMilestone: "Bist du sicher, dass du diesen Meilenstein löschen möchtest?",
    milestoneUpdatedSuccess: "Meilenstein erfolgreich aktualisiert!",
    milestoneDeletedSuccess: "Meilenstein erfolgreich gelöscht!",
    rewards: "Belohnungen",
    viewRewards: "Belohnungen ansehen",
    noRewards: "Keine Belohnungen vorhanden.",
    reward: "Belohnung",
    rewardDescription: "Beschreibung",
    rewardCriteria: "Kriterien",
    addReward: "Belohnung hinzufügen",
    rewardName: "Name der Belohnung",
    rewardAddedSuccess: "Belohnung erfolgreich hinzugefügt!",
    editReward: "Belohnung bearbeiten",
    deleteReward: "Belohnung löschen",
    confirmDeleteReward: "Bist du sicher, dass du diese Belohnung löschen möchtest?",
    rewardUpdatedSuccess: "Belohnung erfolgreich aktualisiert!",
    rewardDeletedSuccess: "Belohnung erfolgreich gelöscht!",
    leaderboard: "Bestenliste",
    viewLeaderboard: "Bestenliste ansehen",
    noLeaderboard: "Keine Bestenliste vorhanden.",
    leaderboardRank: "Rang",
    leaderboardPlayer: "Spieler",
    leaderboardScore: "Punktzahl",
    refreshLeaderboard: "Bestenliste aktualisieren",
    leaderboardRefreshedSuccess: "Bestenliste erfolgreich aktualisiert!",
    playerProfile: "Spielerprofil",
    viewPlayerProfile: "Spielerprofil ansehen",
    playerProfileTitle: "Spielerprofil für",
    playerStatsTitle: "Spielerstatistiken",
    playerAchievementsTitle: "Spieler-Errungenschaften",
    playerGoalsTitle: "Spielerziele",
    playerMilestonesTitle: "Spieler-Meilensteine",
    playerRewardsTitle: "Spieler-Belohnungen",
    backToLeaderboard: "Zurück zur Bestenliste",
    noPlayerProfile: "Kein Spielerprofil verfügbar.",
    playerProfileNotFound: "Spielerprofil nicht gefunden.",
    playerProfileLoading: "Spielerprofil wird geladen...",
    playerProfileError: "Fehler beim Laden des Spielerprofils.",
    playerProfileRefresh: "Spielerprofil aktualisieren",
    playerProfileRefreshedSuccess: "Spielerprofil erfolgreich aktualisiert!",
    playerProfileExport: "Spielerprofil exportieren",
    playerProfileExportedSuccess: "Spielerprofil erfolgreich exportiert!",
    playerProfilePrint: "Spielerprofil drucken",
    playerProfilePrintSuccess: "Spielerprofil erfolgreich gedruckt!",
    playerProfilePrintError: "Fehler beim Drucken des Spielerprofils.",
    adminDashboard: "Admin-Dashboard",
    adminDashboardTitle: "Admin-Dashboard Übersicht",
    adminDashboardStats: "Statistiken",
    adminDashboardRecentActivity: "Letzte Aktivitäten",
    adminDashboardQuickActions: "Schnellaktionen",
    viewAllPlayers: "Alle Spieler ansehen",
    viewAllEvents: "Alle Veranstaltungen ansehen",
    viewAllAdmins: "Alle Admins ansehen",
    viewAllMessages: "Alle Nachrichten ansehen",
    viewAllLogs: "Alle Protokolle ansehen",
    createPlayer: "Spieler erstellen",
    createEvent: "Veranstaltung erstellen",
    createAdmin: "Admin erstellen",
    sendBroadcastMessage: "Broadcast-Nachricht senden",
    broadcastMessage: "Broadcast-Nachricht",
    broadcastMessageContent: "Nachricht",
    send: "Senden",
    broadcastMessageSentSuccess: "Broadcast-Nachricht gesendet!",
    broadcastMessages: "Broadcast-Nachrichten",
    noBroadcastMessages: "Keine Broadcast-Nachrichten.",
    broadcastMessageFrom: "Von:",
    broadcastMessageTo: "An:",
    broadcastMessageTimestamp: "Zeitstempel:",
    deleteBroadcastMessage: "Broadcast-Nachricht löschen",
    confirmDeleteBroadcastMessage: "Bist du sicher, dass du diese Broadcast-Nachricht löschen möchtest?",
    broadcastMessageDeletedSuccess: "Broadcast-Nachricht erfolgreich gelöscht!",
    showBroadcastMessages: "Broadcast-Nachrichten anzeigen",
    hideBroadcastMessages: "Broadcast-Nachrichten ausblenden",
    manageBroadcastMessages: "Broadcast-Nachrichten verwalten",
    playerActivityChart: "Spieleraktivitäts-Diagramm",
    eventParticipationChart: "Veranstaltungsteilnahme-Diagramm",
    scoreDistributionChart: "Punktverteilungs-Diagramm",
    generateCharts: "Diagramme generieren",
    chartsGeneratedSuccess: "Diagramme erfolgreich generiert!",
    noCharts: "Keine Diagramme verfügbar.",
    chartOptions: "Diagrammoptionen",
    chartType: "Diagrammtyp",
    selectChartType: "Diagrammtyp auswählen:",
    barChart: "Balkendiagramm",
    lineChart: "Liniendiagramm",
    pieChart: "Tortendiagramm",
    doughnutChart: "Ringdiagramm",
    radarChart: "Radardiagramm",
    polarAreaChart: "Polares Flächendiagramm",
    bubbleChart: "Blasendiagramm",
    scatterChart: "Streudiagramm",
    areaChart: "Flächendiagramm",
    applyChartOptions: "Diagrammoptionen anwenden",
    chartOptionsApplied: "Diagrammoptionen angewendet.",
    chartData: "Diagrammdaten",
    exportChart: "Diagramm exportieren",
    chartExportedSuccess: "Diagramm erfolgreich exportiert!",
    printChart: "Diagramm drucken",
    chartPrintSuccess: "Diagramm erfolgreich gedruckt!",
    chartPrintError: "Fehler beim Drucken des Diagramms.",
    playerComparison: "Spielervergleich",
    selectPlayersToCompare: "Spieler zum Vergleich auswählen:",
    comparePlayers: "Spieler vergleichen",
    playerComparisonChart: "Spielervergleichs-Diagramm",
    noPlayerComparison: "Kein Spielervergleich verfügbar.",
    playerComparisonOptions: "Vergleichsoptionen",
    compareByScore: "Nach Punktzahl vergleichen",
    compareByParticipation: "Nach Teilnahme vergleichen",
    compareByAchievements: "Nach Errungenschaften vergleichen",
    applyComparisonOptions: "Vergleichsoptionen anwenden",
    comparisonOptionsApplied: "Vergleichsoptionen angewendet.",
    playerComparisonData: "Spielervergleichsdaten",
    exportComparison: "Vergleich exportieren",
    comparisonExportedSuccess: "Vergleich erfolgreich exportiert!",
    printComparison: "Vergleich drucken",
    comparisonPrintSuccess: "Vergleich erfolgreich gedruckt!",
    comparisonPrintError: "Fehler beim Drucken des Vergleichs.",
    eventComparison: "Veranstaltungsvergleich",
    selectEventsToCompare: "Veranstaltungen zum Vergleich auswählen:",
    compareEvents: "Veranstaltungen vergleichen",
    eventComparisonChart: "Veranstaltungsvergleichs-Diagramm",
    noEventComparison: "Kein Veranstaltungsvergleich verfügbar.",
    eventComparisonOptions: "Vergleichsoptionen",
    compareByTotalScore: "Nach Gesamtpunktzahl vergleichen",
    compareByAverageScore: "Nach Durchschnittspunktzahl vergleichen",
    compareByParticipationRate: "Nach Teilnahmequote vergleichen",
    applyEventComparisonOptions: "Vergleichsoptionen anwenden",
    eventComparisonOptionsApplied: "Vergleichsoptionen angewendet.",
    eventComparisonData: "Veranstaltungsvergleichsdaten",
    exportEventComparison: "Vergleich exportieren",
    eventComparisonExportedSuccess: "Vergleich erfolgreich exportiert!",
    printEventComparison: "Vergleich drucken",
    eventComparisonPrintSuccess: "Vergleich erfolgreich gedruckt!",
    eventComparisonPrintError: "Fehler beim Drucken des Vergleichs.",
    dataManagement: "Datenverwaltung",
    backupAndRestore: "Sichern und Wiederherstellen",
    importAndExport: "Importieren und Exportieren",
    clearData: "Daten löschen",
    confirmClearData: "Bist du sicher, dass du alle Anwendungsdaten löschen möchtest? Dies kann nicht rückgängig gemacht werden.",
    dataClearedSuccess: "Daten erfolgreich gelöscht!",
    caution: "Vorsicht!",
    dangerZone: "Gefahrenzone",
    fullDataReset: "Vollständiger Daten-Reset",
    confirmFullDataReset: "Bist du absolut sicher, dass du einen vollständigen Daten-Reset durchführen möchtest? Dies löscht ALLE Daten unwiderruflich.",
    fullDataResetSuccess: "Vollständiger Daten-Reset erfolgreich!",
    enterConfirmText: "Bitte gib 'BESTÄTIGEN' ein, um fortzufahren.",
    invalidConfirmText: "Ungültiger Bestätigungstext.",
    adminTools: "Admin-Tools",
    userManagement: "Benutzerverwaltung",
    roleManagement: "Rollenverwaltung",
    assignRoles: "Rollen zuweisen",
    userRoles: "Benutzerrollen",
    selectUser: "Benutzer auswählen:",
    selectRole: "Rolle auswählen:",
    assign: "Zuweisen",
    roleAssignedSuccess: "Rolle erfolgreich zugewiesen!",
    removeRole: "Rolle entfernen",
    roleRemovedSuccess: "Rolle erfolgreich entfernt!",
    availableRoles: "Verfügbare Rollen:",
    addRole: "Rolle hinzufügen",
    roleName: "Rollenname",
    roleDescription: "Rollenbeschreibung",
    roleAddedSuccess: "Rolle erfolgreich hinzugefügt!",
    editRole: "Rolle bearbeiten",
    deleteRole: "Rolle löschen",
    confirmDeleteRole: "Bist du sicher, dass du diese Rolle löschen möchtest?",
    roleUpdatedSuccess: "Rolle erfolgreich aktualisiert!",
    roleDeletedSuccess: "Rolle erfolgreich gelöscht!",
    manageRoles: "Rollen verwalten",
    permissions: "Berechtigungen",
    viewPermissions: "Berechtigungen ansehen",
    noPermissions: "Keine Berechtigungen vorhanden.",
    permission: "Berechtigung",
    permissionDescription: "Beschreibung",
    addPermission: "Berechtigung hinzufügen",
    permissionName: "Name der Berechtigung",
    permissionAddedSuccess: "Berechtigung erfolgreich hinzugefügt!",
    editPermission: "Berechtigung bearbeiten",
    deletePermission: "Berechtigung löschen",
    confirmDeletePermission: "Bist du sicher, dass du diese Berechtigung löschen möchtest?",
    permissionUpdatedSuccess: "Berechtigung erfolgreich aktualisiert!",
    permissionDeletedSuccess: "Berechtigung erfolgreich gelöscht!",
    assignPermissions: "Berechtigungen zuweisen",
    selectPermission: "Berechtigung auswählen:",
    permissionAssignedSuccess: "Berechtigung erfolgreich zugewiesen!",
    permissionRemovedSuccess: "Berechtigung erfolgreich entfernt!",
    managePermissions: "Berechtigungen verwalten",
    auditLog: "Audit-Protokoll",
    viewAuditLog: "Audit-Protokoll ansehen",
    noAuditLog: "Kein Audit-Protokoll vorhanden.",
    auditLogEntry: "Audit-Eintrag",
    auditLogTimestamp: "Zeitstempel",
    auditLogUser: "Benutzer",
    auditLogAction: "Aktion",
    auditLogTarget: "Ziel",
    clearAuditLog: "Audit-Protokoll löschen",
    confirmClearAuditLog: "Bist du sicher, dass du das Audit-Protokoll löschen möchtest?",
    auditLogClearedSuccess: "Audit-Protokoll erfolgreich gelöscht!",
    systemStatus: "Systemstatus",
    viewSystemStatus: "Systemstatus ansehen",
    systemHealth: "System-Gesundheit:",
    databaseStatus: "Datenbankstatus:",
    apiStatus: "API-Status:",
    online: "Online",
    offline: "Offline",
    operational: "Operationell",
    degraded: "Eingeschränkt",
    outage: "Ausfall",
    lastChecked: "Zuletzt geprüft:",
    refreshStatus: "Status aktualisieren",
    statusRefreshedSuccess: "Status erfolgreich aktualisiert!",
    systemLogs: "Systemprotokolle",
    viewSystemLogs: "Systemprotokolle ansehen",
    noSystemLogs: "Keine Systemprotokolle vorhanden.",
    systemLogEntry: "Systemprotokoll-Eintrag",
    systemLogTimestamp: "Zeitstempel",
    systemLogLevel: "Level",
    systemLogMessage: "Nachricht",
    clearSystemLogs: "Systemprotokolle löschen",
    confirmClearSystemLogs: "Bist du sicher, dass du alle Systemprotokolle löschen möchtest?",
    systemLogsClearedSuccess: "Systemprotokolle erfolgreich gelöscht!",
    maintenanceMode: "Wartungsmodus",
    enableMaintenanceMode: "Wartungsmodus aktivieren",
    disableMaintenanceMode: "Wartungsmodus deaktivieren",
    maintenanceModeEnabled: "Wartungsmodus aktiviert.",
    maintenanceModeDisabled: "Wartungsmodus deaktiviert.",
    maintenanceMessage: "Wartungsmeldung",
    updateMaintenanceMessage: "Wartungsmeldung aktualisieren",
    maintenanceMessageUpdated: "Wartungsmeldung aktualisiert!",
    scheduledMaintenance: "Geplante Wartung",
    scheduleMaintenance: "Wartung planen",
    maintenanceDate: "Datum der Wartung",
    maintenanceTime: "Uhrzeit der Wartung",
    schedule: "Planen",
    maintenanceScheduledSuccess: "Wartung erfolgreich geplant!",
    cancelMaintenance: "Wartung abbrechen",
    confirmCancelMaintenance: "Bist du sicher, dass du die geplante Wartung abbrechen möchtest?",
    maintenanceCanceledSuccess: "Wartung abgebrochen!",
    noScheduledMaintenance: "Keine geplante Wartung.",
    currentMaintenanceStatus: "Aktueller Wartungsstatus:",
    active: "Aktiv",
    inactive: "Inaktiv",
    scheduled: "Geplant",
    completed: "Abgeschlossen",
    failed: "Fehlgeschlagen",
    updateStatus: "Status aktualisieren",
    statusUpdatedSuccess: "Status erfolgreich aktualisiert!",
    announcements: "Ankündigungen",
    createAnnouncement: "Ankündigung erstellen",
    announcementTitle: "Titel",
    announcementContent: "Inhalt",
    publish: "Veröffentlichen",
    announcementPublishedSuccess: "Ankündigung erfolgreich veröffentlicht!",
    editAnnouncement: "Ankündigung bearbeiten",
    deleteAnnouncement: "Ankündigung löschen",
    confirmDeleteAnnouncement: "Bist du sicher, dass du diese Ankündigung löschen möchtest?",
    announcementUpdatedSuccess: "Ankündigung erfolgreich aktualisiert!",
    announcementDeletedSuccess: "Ankündigung erfolgreich gelöscht!",
    viewAnnouncements: "Ankündigungen ansehen",
    noAnnouncements: "Keine Ankündigungen vorhanden.",
    announcementTimestamp: "Zeitstempel",
    announcementAuthor: "Autor",
    announcementExpires: "Läuft ab:",
    setExpiration: "Ablaufdatum festlegen",
    expirationDate: "Ablaufdatum",
    noExpiration: "Kein Ablaufdatum",
    expired: "Abgelaufen",
    activeAnnouncements: "Aktive Ankündigungen",
    archivedAnnouncements: "Archivierte Ankündigungen",
    archiveAnnouncement: "Ankündigung archivieren",
    confirmArchiveAnnouncement: "Bist du sicher, dass du diese Ankündigung archivieren möchtest?",
    announcementArchivedSuccess: "Ankündigung erfolgreich archiviert!",
    unarchiveAnnouncement: "Ankündigung dearchivieren",
    confirmUnarchiveAnnouncement: "Bist du sicher, dass du diese Ankündigung dearchivieren möchtest?",
    announcementUnarchivedSuccess: "Ankündigung erfolgreich dearchiviert!",
    viewArchivedAnnouncements: "Archivierte Ankündigungen ansehen",
    notifications: "Benachrichtigungen",
    profile: "Profil",
    settings: "Einstellungen",
    admin: "Admin",
    about: "Über",
    help: "Hilfe",
    legal: "Rechtliches",
    dashboard: "Dashboard",
    reports: "Berichte",
    charts: "Diagramme",
    comparison: "Vergleich",
    data: "Daten",
    system: "System",
    maintenance: "Wartung",
    logs: "Protokolle",
    announcements: "Ankündigungen",
    users: "Benutzer",
    roles: "Rollen",
    permissions: "Berechtigungen",
    audit: "Audit",
    activity: "Aktivität",
    history: "Verlauf",
    messages: "Nachrichten",
    broadcast: "Broadcast",
    feedback: "Feedback",
    support: "Support",
    faq: "FAQ",
    documentation: "Dokumentation",
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutzerklärung",
    contact: "Kontakt",
    home: "Startseite",
    info: "Info",
    navigation: "Navigation",
    playerReport: "Spielerbericht",
    currentEvent: "Aktuelles Event",
    archive: "Archiv",
    top10: "Top 10",
    hallOfChamps: "Ruhmeshalle",
    adminPanel: "Admin-Panel",
    playerManagement: "Spielerverwaltung",
    eventManagement: "Veranstaltungsverwaltung",
    adminManagement: "Admin-Verwaltung",
    eventDayManagement: "Event-Tag-Verwaltung",
    playerScoreManagement: "Spielergebnis-Verwaltung",
    overallPlayerReport: "Gesamt-Spielerbericht",
    playerSearch: "Spielersuche",
    filterOptions: "Filteroptionen",
    notificationSettings: "Benachrichtigungseinstellungen",
    profileSettings: "Profileinstellungen",
    accountSettings: "Kontoeinstellungen",
    privacySettings: "Datenschutzeinstellungen",
    aboutApp: "Über die App",
    feedbackAndSupport: "Feedback & Support",
    legalInformation: "Rechtliche Informationen",
    authentication: "Authentifizierung",
    userProfile: "Benutzerprofil",
    playerAchievements: "Spieler-Errungenschaften",
    eventGoals: "Veranstaltungsziele",
    milestones: "Meilensteine",
    rewards: "Belohnungen",
    leaderboard: "Bestenliste",
    playerComparison: "Spielervergleich",
    eventComparison: "Veranstaltungsvergleich",
    dataManagement: "Datenverwaltung",
    systemMonitoring: "Systemüberwachung",
    adminTools: "Admin-Tools",
    communication: "Kommunikation",
    reportsAndAnalytics: "Berichte & Analysen",
    generalSettings: "Allgemeine Einstellungen",
    securitySettings: "Sicherheitseinstellungen",
    integrations: "Integrationen",
    apiSettings: "API-Einstellungen",
    webhookSettings: "Webhook-Einstellungen",
    pluginManagement: "Plugin-Verwaltung",
    themeCustomization: "Theme-Anpassung",
    layoutSettings: "Layout-Einstellungen",
    fontSettings: "Schriftart-Einstellungen",
    colorSettings: "Farbeinstellungen",
    backgroundSettings: "Hintergrundeinstellungen",
    logoSettings: "Logo-Einstellungen",
    customCSS: "Benutzerdefiniertes CSS",
    customJS: "Benutzerdefiniertes JS",
    seoSettings: "SEO-Einstellungen",
    metaTags: "Meta-Tags",
    sitemap: "Sitemap",
    robotstxt: "robots.txt",
    analyticsIntegration: "Analyse-Integration",
    googleAnalytics: "Google Analytics",
    matomoAnalytics: "Matomo Analytics",
    customAnalytics: "Benutzerdefinierte Analyse",
    socialMediaIntegration: "Social Media Integration",
    facebook: "Facebook",
    twitter: "Twitter",
    instagram: "Instagram",
    discord: "Discord",
    twitch: "Twitch",
    youtube: "YouTube",
    patreon: "Patreon",
    merchStore: "Merch-Store",
    donationLink: "Spenden-Link",
    communityLinks: "Community-Links",
    forum: "Forum",
    discordServer: "Discord-Server",
    guildWebsite: "Gilden-Website",
    raidPlanner: "Raid-Planer",
    dungeonGuides: "Dungeon-Guides",
    pvpGuides: "PvP-Guides",
    classGuides: "Klassen-Guides",
    professionGuides: "Berufs-Guides",
    craftingGuides: "Handwerks-Guides",
    economyGuides: "Wirtschafts-Guides",
    eventGuides: "Event-Guides",
    questGuides: "Quest-Guides",
    lore: "Lore",
    wiki: "Wiki",
    database: "Datenbank",
    tools: "Tools",
    calculators: "Rechner",
    simulators: "Simulatoren",
    timers: "Timer",
    trackers: "Tracker",
    planners: "Planer",
    generators: "Generatoren",
    converters: "Konverter",
    utilities: "Dienstprogramme",
    apiDocumentation: "API-Dokumentation",
    developerTools: "Entwickler-Tools",
    webhooks: "Webhooks",
    plugins: "Plugins",
    themes: "Themes",
    updates: "Updates",
    changelog: "Changelog",
    roadmap: "Roadmap",
    bugTracker: "Bug-Tracker",
    featureRequests: "Funktionsanfragen",
    knownIssues: "Bekannte Probleme",
    troubleshooting: "Fehlerbehebung",
    faq: "FAQ",
    supportForum: "Support-Forum",
    contactUs: "Kontaktiere uns",
    imprint: "Impressum",
    disclaimer: "Haftungsausschluss",
    copyright: "Urheberrecht",
    dataProtection: "Datenschutz",
    cookies: "Cookies",
    cookieSettings: "Cookie-Einstellungen",
    acceptCookies: "Cookies akzeptieren",
    declineCookies: "Cookies ablehnen",
    cookiePolicy: "Cookie-Richtlinie",
    poweredBy: "Powered by",
    madeWith: "Made with",
    version: "Version",
    build: "Build",
    release: "Release",
    date: "Datum",
    time: "Uhrzeit",
    author: "Autor",
    contributors: "Mitwirkende",
    acknowledgements: "Danksagungen",
    specialThanks: "Besonderer Dank",
    community: "Community",
    partners: "Partner",
    sponsors: "Sponsoren",
    donors: "Spender",
    patrons: "Patreons",
    supporters: "Unterstützer",
    getInvolved: "Mach mit",
    contribute: "Beitragen",
    translate: "Übersetzen",
    reportIssue: "Problem melden",
    suggestFeature: "Funktion vorschlagen",
    joinCommunity: "Community beitreten",
    followUs: "Folge uns",
    subscribe: "Abonnieren",
    newsletter: "Newsletter",
    getUpdates: "Updates erhalten",
    stayConnected: "In Verbindung bleiben",
    socials: "Soziale Medien",
    links: "Links",
    resources: "Ressourcen",
    downloads: "Downloads",
    assets: "Assets",
    mediaKit: "Medien-Kit",
    press: "Presse",
    events: "Veranstaltungen",
    calendar: "Kalender",
    schedule: "Zeitplan",
    upcomingEvents: "Bevorstehende Veranstaltungen",
    pastEvents: "Vergangene Veranstaltungen",
    eventRegistration: "Veranstaltungsanmeldung",
    eventDetails: "Veranstaltungsdetails",
    eventResults: "Veranstaltungsergebnisse",
    eventPhotos: "Veranstaltungsfotos",
    eventVideos: "Veranstaltungsvideos",
    eventRecaps: "Veranstaltungsrückblicke",
    eventFeedback: "Veranstaltungs-Feedback",
    eventOrganizers: "Veranstalter",
    eventSponsors: "Veranstaltungssponsoren",
    eventPartners: "Veranstaltungspartner",
    eventVolunteers: "Veranstaltungshelfer",
    eventAttendees: "Veranstaltungsteilnehmer",
    eventTickets: "Veranstaltungstickets",
    eventVenue: "Veranstaltungsort",
    eventMap: "Veranstaltungskarte",
    eventDirections: "Wegbeschreibung",
    eventAccommodation: "Unterkunft",
    eventTravel: "Anreise",
    eventFAQ: "Veranstaltungs-FAQ",
    eventContact: "Veranstaltungs-Kontakt",
    eventRules: "Veranstaltungsregeln",
    eventPrizes: "Veranstaltungspreise",
    eventAwards: "Veranstaltungsauszeichnungen",
    eventLeaderboard: "Veranstaltungs-Bestenliste",
    eventParticipants: "Veranstaltungsteilnehmer",
    eventStatistics: "Veranstaltungsstatistiken",
    eventHighlights: "Veranstaltungs-Highlights",
    eventGallery: "Veranstaltungs-Galerie",
    eventVideos: "Veranstaltungsvideos",
    eventPress: "Veranstaltungs-Presse",
    eventPartnerships: "Veranstaltungspartnerschaften",
    eventSponsorship: "Veranstaltungssponsoring",
    eventVolunteer: "Veranstaltungs-Freiwilliger",
    eventAttendee: "Veranstaltungsteilnehmer",
    eventTicket: "Veranstaltungsticket",
    eventVenueInfo: "Informationen zum Veranstaltungsort",
    eventMapInfo: "Karteninformationen",
    eventDirectionsInfo: "Wegbeschreibungsinformationen",
    eventAccommodationInfo: "Unterkunftsinformationen",
    eventTravelInfo: "Reiseinformationen",
    eventFAQInfo: "FAQ-Informationen",
    eventContactInfo: "Kontaktinformationen",
    eventRulesInfo: "Regelinformationen",
    eventPrizesInfo: "Preisinformationen",
    eventAwardsInfo: "Auszeichnungsinformationen",
    eventLeaderboardInfo: "Bestenlisteninformationen",
    eventParticipantsInfo: "Teilnehmerinformationen",
    eventStatisticsInfo: "Statistikinformationen",
    eventHighlightsInfo: "Highlight-Informationen",
    eventGalleryInfo: "Galerieinformationen",
    eventVideoInfo: "Videoinformationen",
    eventPressInfo: "Presseinformationen",
    eventPartnershipsInfo: "Partnerschaftsinformationen",
    eventSponsorshipInfo: "Sponsoringinformationen",
    eventVolunteerInfo: "Freiwilligeninformationen",
    eventAttendeeInfo: "Teilnehmerinformationen",
    eventTicketInfo: "Ticketinformationen",
    eventVenueDetails: "Details zum Veranstaltungsort",
    eventMapDetails: "Kartendetails",
    eventDirectionsDetails: "Details zur Wegbeschreibung",
    eventAccommodationDetails: "Details zur Unterkunft",
    eventTravelDetails: "Details zur Anreise",
    eventFAQDetails: "FAQ-Details",
    eventContactDetails: "Kontaktdetails",
    eventRulesDetails: "Regeldetails",
    eventPrizesDetails: "Preisdetails",
    eventAwardsDetails: "Auszeichnungsdetails",
    eventLeaderboardDetails: "Bestenlistendetails",
    eventParticipantsDetails: "Teilnehmerdetails",
    eventStatisticsDetails: "Statistikdetails",
    eventHighlightsDetails: "Highlight-Details",
    eventGalleryDetails: "Galeriedetails",
    eventVideoDetails: "Videodetails",
    eventPressDetails: "Pressedetails",
    eventPartnershipsDetails: "Partnerschaftsdetails",
    eventSponsorshipDetails: "Sponsoringdetails",
    eventVolunteerDetails: "Freiwilligendetails",
    eventAttendeeDetails: "Teilnehmerdetails",
    eventTicketDetails: "Ticketdetails",
    eventVenueFull: "Vollständiger Veranstaltungsort",
    eventMapFull: "Vollständige Karte",
    eventDirectionsFull: "Vollständige Wegbeschreibung",
    eventAccommodationFull: "Vollständige Unterkunft",
    eventTravelFull: "Vollständige Anreise",
    eventFAQFull: "Vollständige FAQ",
    eventContactFull: "Vollständiger Kontakt",
    eventRulesFull: "Vollständige Regeln",
    eventPrizesFull: "Vollständige Preise",
    eventAwardsFull: "Vollständige Auszeichnungen",
    eventLeaderboardFull: "Vollständige Bestenliste",
    eventParticipantsFull: "Vollständige Teilnehmer",
    eventStatisticsFull: "Vollständige Statistiken",
    eventHighlightsFull: "Vollständige Highlights",
    eventGalleryFull: "Vollständige Galerie",
    eventVideoFull: "Vollständige Videos",
    eventPressFull: "Vollständige Presse",
    eventPartnershipsFull: "Vollständige Partnerschaften",
    eventSponsorshipFull: "Vollständiges Sponsoring",
    eventVolunteerFull: "Vollständige Freiwillige",
    eventAttendeeFull: "Vollständige Teilnehmer",
    eventTicketFull: "Vollständige Tickets",
    eventVenueComplete: "Kompletter Veranstaltungsort",
    eventMapComplete: "Komplette Karte",
    eventDirectionsComplete: "Komplette Wegbeschreibung",
    eventAccommodationComplete: "Komplette Unterkunft",
    eventTravelComplete: "Komplette Anreise",
    eventFAQComplete: "Komplette FAQ",
    eventContactComplete: "Kompletter Kontakt",
    eventRulesComplete: "Komplette Regeln",
    eventPrizesComplete: "Komplette Preise",
    eventAwardsComplete: "Komplette Auszeichnungen",
    eventLeaderboardComplete: "Komplette Bestenliste",
    eventParticipantsComplete: "Komplette Teilnehmer",
    eventStatisticsComplete: "Komplette Statistiken",
    eventHighlightsComplete: "Komplette Highlights",
    eventGalleryComplete: "Komplette Galerie",
    eventVideoComplete: "Komplette Videos",
    eventPressComplete: "Komplette Presse",
    eventPartnershipsComplete: "Komplette Partnerschaften",
    eventSponsorshipComplete: "Komplettes Sponsoring",
    eventVolunteerComplete: "Komplette Freiwillige",
    eventAttendeeComplete: "Komplette Teilnehmer",
    eventTicketComplete: "Komplette Tickets",
    eventVenueAll: "Alle Veranstaltungsorte",
    eventMapAll: "Alle Karten",
    eventDirectionsAll: "Alle Wegbeschreibungen",
    eventAccommodationAll: "Alle Unterkünfte",
    eventTravelAll: "Alle Reisen",
    eventFAQAll: "Alle FAQs",
    eventContactAll: "Alle Kontakte",
    eventRulesAll: "Alle Regeln",
    eventPrizesAll: "Alle Preise",
    eventAwardsAll: "Alle Auszeichnungen",
    eventLeaderboardAll: "Alle Bestenlisten",
    eventParticipantsAll: "Alle Teilnehmer",
    eventStatisticsAll: "Alle Statistiken",
    eventHighlightsAll: "Alle Highlights",
    eventGalleryAll: "Alle Galerien",
    eventVideoAll: "Alle Videos",
    eventPressAll: "Alle Pressen",
    eventPartnershipsAll: "Alle Partnerschaften",
    eventSponsorshipAll: "Alle Sponsorings",
    eventVolunteerAll: "Alle Freiwilligen",
    eventAttendeeAll: "Alle Teilnehmer",
    eventTicketAll: "Alle Tickets",
    eventVenueOverview: "Übersicht Veranstaltungsort",
    eventMapOverview: "Übersicht Karte",
    eventDirectionsOverview: "Übersicht Wegbeschreibung",
    eventAccommodationOverview: "Übersicht Unterkunft",
    eventTravelOverview: "Übersicht Reise",
    eventFAQOverview: "Übersicht FAQ",
    eventContactOverview: "Übersicht Kontakt",
    eventRulesOverview: "Übersicht Regeln",
    eventPrizesOverview: "Übersicht Preise",
    eventAwardsOverview: "Übersicht Auszeichnungen",
    eventLeaderboardOverview: "Übersicht Bestenliste",
    eventParticipantsOverview: "Übersicht Teilnehmer",
    eventStatisticsOverview: "Übersicht Statistiken",
    eventHighlightsOverview: "Übersicht Highlights",
    eventGalleryOverview: "Übersicht Galerie",
    eventVideoOverview: "Übersicht Videos",
    eventPressOverview: "Übersicht Presse",
    eventPartnershipsOverview: "Übersicht Partnerschaften",
    eventSponsorshipOverview: "Übersicht Sponsoring",
    eventVolunteerOverview: "Übersicht Freiwillige",
    eventAttendeeOverview: "Übersicht Teilnehmer",
    eventTicketOverview: "Übersicht Tickets",
    eventVenueSummary: "Zusammenfassung Veranstaltungsort",
    eventMapSummary: "Zusammenfassung Karte",
    eventDirectionsSummary: "Zusammenfassung Wegbeschreibung",
    eventAccommodationSummary: "Zusammenfassung Unterkunft",
    eventTravelSummary: "Zusammenfassung Reise",
    eventFAQSummary: "Zusammenfassung FAQ",
    eventContactSummary: "Zusammenfassung Kontakt",
    eventRulesSummary: "Zusammenfassung Regeln",
    eventPrizesSummary: "Zusammenfassung Preise",
    eventAwardsSummary: "Zusammenfassung Auszeichnungen",
    eventLeaderboardSummary: "Zusammenfassung Bestenliste",
    eventParticipantsSummary: "Zusammenfassung Teilnehmer",
    eventStatisticsSummary: "Zusammenfassung Statistiken",
    eventHighlightsSummary: "Zusammenfassung Highlights",
    eventGallerySummary: "Zusammenfassung Galerie",
    eventVideoSummary: "Zusammenfassung Videos",
    eventPressSummary: "Zusammenfassung Presse",
    eventPartnershipsSummary: "Zusammenfassung Partnerschaften",
    eventSponsorshipSummary: "Zusammenfassung Sponsoring",
    eventVolunteerSummary: "Zusammenfassung Freiwillige",
    eventAttendeeSummary: "Zusammenfassung Teilnehmer",
    eventTicketSummary: "Zusammenfassung Tickets",
    eventVenueReport: "Bericht Veranstaltungsort",
    eventMapReport: "Bericht Karte",
    eventDirectionsReport: "Bericht Wegbeschreibung",
    eventAccommodationReport: "Bericht Unterkunft",
    eventTravelReport: "Bericht Reise",
    eventFAQReport: "Bericht FAQ",
    eventContactReport: "Bericht Kontakt",
    eventRulesReport: "Bericht Regeln",
    eventPrizesReport: "Bericht Preise",
    eventAwardsReport: "Bericht Auszeichnungen",
    eventLeaderboardReport: "Bericht Bestenliste",
    eventParticipantsReport: "Bericht Teilnehmer",
    eventStatisticsReport: "Bericht Statistiken",
    eventHighlightsReport: "Bericht Highlights",
    eventGalleryReport: "Bericht Galerie",
    eventVideoReport: "Bericht Videos",
    eventPressReport: "Bericht Presse",
    eventPartnershipsReport: "Bericht Partnerschaften",
    eventSponsorshipReport: "Bericht Sponsoring",
    eventVolunteerReport: "Bericht Freiwillige",
    eventAttendeeReport: "Bericht Teilnehmer",
    eventTicketReport: "Bericht Tickets",
    eventVenueFullReport: "Vollständiger Bericht Veranstaltungsort",
    eventMapFullReport: "Vollständiger Bericht Karte",
    eventDirectionsFullReport: "Vollständiger Bericht Wegbeschreibung",
    eventAccommodationFullReport: "Vollständiger Bericht Unterkunft",
    eventTravelFullReport: "Vollständiger Bericht Reise",
    eventFAQFullReport: "Vollständiger Bericht FAQ",
    eventContactFullReport: "Vollständiger Bericht Kontakt",
    eventRulesFullReport: "Vollständiger Bericht Regeln",
    eventPrizesFullReport: "Vollständiger Bericht Preise",
    eventAwardsFullReport: "Vollständiger Bericht Auszeichnungen",
    eventLeaderboardFullReport: "Vollständiger Bericht Bestenliste",
    eventParticipantsFullReport: "Vollständiger Bericht Teilnehmer",
    eventStatisticsFullReport: "Vollständiger Bericht Statistiken",
    eventHighlightsFullReport: "Vollständiger Bericht Highlights",
    eventGalleryFullReport: "Vollständiger Bericht Galerie",
    eventVideoFullReport: "Vollständiger Bericht Videos",
    eventPressFullReport: "Vollständiger Bericht Presse",
    eventPartnershipsFullReport: "Vollständiger Bericht Partnerschaften",
    eventSponsorshipFullReport: "Vollständiger Bericht Sponsoring",
    eventVolunteerFullReport: "Vollständiger Bericht Freiwillige",
    eventAttendeeFullReport: "Vollständiger Bericht Teilnehmer",
    eventTicketFullReport: "Vollständiger Bericht Tickets",
    eventVenueDetailedReport: "Detaillierter Bericht Veranstaltungsort",
    eventMapDetailedReport: "Detaillierter Bericht Karte",
    eventDirectionsDetailedReport: "Detaillierter Bericht Wegbeschreibung",
    eventAccommodationDetailedReport: "Detaillierter Bericht Unterkunft",
    eventTravelDetailedReport: "Detaillierter Bericht Reise",
    eventFAQDetailedReport: "Detaillierter Bericht FAQ",
    eventContactDetailedReport: "Detaillierter Bericht Kontakt",
    eventRulesDetailedReport: "Detaillierter Bericht Regeln",
    eventPrizesDetailedReport: "Detaillierter Bericht Preise",
    eventAwardsDetailedReport: "Detaillierter Bericht Auszeichnungen",
    eventLeaderboardDetailedReport: "Detaillierter Bericht Bestenliste",
    eventParticipantsDetailedReport: "Detaillierter Bericht Teilnehmer",
    eventStatisticsDetailedReport: "Detaillierter Bericht Statistiken",
    eventHighlightsDetailedReport: "Detaillierter Bericht Highlights",
    eventGalleryDetailedReport: "Detaillierter Bericht Galerie",
    eventVideoDetailedReport: "Detaillierter Bericht Videos",
    eventPressDetailedReport: "Detaillierter Bericht Presse",
    eventPartnershipsDetailedReport: "Detaillierter Bericht Partnerschaften",
    eventSponsorshipDetailedReport: "Detaillierter Bericht Sponsoring",
    eventVolunteerDetailedReport: "Detaillierter Bericht Freiwillige",
    eventAttendeeDetailedReport: "Detaillierter Bericht Teilnehmer",
    eventTicketDetailedReport: "Detaillierter Bericht Tickets",
    eventVenueCustomReport: "Benutzerdefinierter Bericht Veranstaltungsort",
    eventMapCustomReport: "Benutzerdefinierter Bericht Karte",
    eventDirectionsCustomReport: "Benutzerdefinierter Bericht Wegbeschreibung",
    eventAccommodationCustomReport: "Benutzerdefinierter Bericht Unterkunft",
    eventTravelCustomReport: "Benutzerdefinierter Bericht Reise",
    eventFAQCustomReport: "Benutzerdefinierter Bericht FAQ",
    eventContactCustomReport: "Benutzerdefinierter Bericht Kontakt",
    eventRulesCustomReport: "Benutzerdefinierter Bericht Regeln",
    eventPrizesCustomReport: "Benutzerdefinierter Bericht Preise",
    eventAwardsCustomReport: "Benutzerdefinierter Bericht Auszeichnungen",
    eventLeaderboardCustomReport: "Benutzerdefinierter Bericht Bestenliste",
    eventParticipantsCustomReport: "Benutzerdefinierter Bericht Teilnehmer",
    eventStatisticsCustomReport: "Benutzerdefinierter Bericht Statistiken",
    eventHighlightsCustomReport: "Benutzerdefinierter Bericht Highlights",
    eventGalleryCustomReport: "Benutzerdefinierter Bericht Galerie",
    eventVideoCustomReport: "Benutzerdefinierter Bericht Videos",
    eventPressCustomReport: "Benutzerdefinierter Bericht Presse",
    eventPartnershipsCustomReport: "Benutzerdefinierter Bericht Partnerschaften",
    eventSponsorshipCustomReport: "Benutzerdefinierter Bericht Sponsoring",
    eventVolunteerCustomReport: "Benutzerdefinierter Bericht Freiwillige",
    eventAttendeeCustomReport: "Benutzerdefinierter Bericht Teilnehmer",
    eventTicketCustomReport: "Benutzerdefinierter Bericht Tickets",
  },
  en: {
    welcomeTitle: "Welcome to the Clan Dashboard!",
    selectLanguage: "Select Language:",
    goToInfoPage: "Go to Info Page",
    infoPageTitle: "About Our Clan and the Game",
    clanName: "Our Clan: The Brave Dragons",
    clanDescription: "We are a community of passionate players dedicated to adventure and shared success. Whether PvE or PvP, we support each other and have fun doing it.",
    gameName: "The Game: Epic Realms Online",
    gameDescription: "Epic Realms Online is a fantasy MMORPG set in a vast, open world. Explore dungeons, defeat mighty bosses, and compete with other players in epic battles.",
    goToNavigation: "Go to Navigation",
    navigationTitle: "Clan Navigation",
    personalPlayerReport: "Personal Player Report",
    currentTotalEvent: "Current Event Period",
    furtherLinkIndividualDays: "Further Link to Individual Days",
    eventArchive: "Event Archive",
    topTen: "Top 10 Players",
    hallOfChamps: "Hall of Champions",
    contact: "Contact",
    adminPanel: "Admin Panel",
    backToWelcome: "Back to Welcome Page",
    backToNavigation: "Back to Navigation",
    playerReportTitle: "Personal Report for",
    selectPlayer: "Select Player:",
    loadReport: "Load Report",
    noPlayerSelected: "Please select a player.",
    eventPeriod: "Event Period:",
    totalScore: "Total Score:",
    rank: "Rank:",
    participation: "Participation:",
    details: "Details:",
    day: "Day",
    score: "Score",
    viewDetails: "View Details",
    eventDetails: "Event Details",
    eventName: "Event Name:",
    eventDate: "Date:",
    eventDescription: "Description:",
    returnToCurrentEvent: "Return to Current Event",
    archiveTitle: "Event Archive",
    selectPeriod: "Select Period:",
    topTenTitle: "Top 10 Players - Current Period",
    hallOfChampsTitle: "Hall of Champions",
    contactTitle: "Contact Us",
    contactText: "Do you have questions or suggestions? Contact us using the form.",
    yourName: "Your Name:",
    yourEmail: "Your Email:",
    yourMessage: "Your Message:",
    sendMessage: "Send Message",
    messageSent: "Message sent successfully!",
    adminPanelTitle: "Admin Panel",
    managePlayers: "Manage Players",
    manageEvents: "Manage Events",
    manageAdmins: "Manage Admins",
    addPlayer: "Add Player",
    playerName: "Player Name",
    playerDiscord: "Discord ID (optional)",
    playerGameId: "Game ID (optional)",
    add: "Add",
    editPlayer: "Edit Player",
    update: "Update",
    deletePlayer: "Delete Player",
    confirmDeletePlayer: "Are you sure you want to delete this player?",
    addEvent: "Add Event",
    eventPeriodName: "Event Period Name (e.g., 'May 2024')",
    eventStartDate: "Start Date",
    eventEndDate: "End Date",
    addEventPeriod: "Add Event Period",
    editEvent: "Edit Event",
    deleteEvent: "Delete Event",
    confirmDeleteEvent: "Are you sure you want to delete this event?",
    addAdmin: "Add Admin",
    adminUserId: "Admin User ID",
    addAdminBtn: "Add Admin",
    removeAdmin: "Remove Admin",
    confirmRemoveAdmin: "Are you sure you want to remove this admin?",
    noData: "No data available.",
    loading: "Loading...",
    error: "An error occurred:",
    loginRequired: "Please log in to access the Admin Panel.",
    accessDenied: "Access denied. You are not an admin.",
    userId: "Your User ID:",
    copyToClipboard: "Copy to Clipboard",
    copied: "Copied!",
    playerManagement: "Player Management",
    eventPeriodManagement: "Event Period Management",
    adminManagement: "Admin Management",
    manageEventDays: "Manage Days",
    addEventDay: "Add Day",
    dayNumber: "Day Number",
    dayDate: "Date of Day",
    dayDescription: "Day Description",
    addDay: "Add Day",
    editDay: "Edit Day",
    deleteDay: "Delete Day",
    confirmDeleteDay: "Are you sure you want to delete this day?",
    dayAddedSuccess: "Day added successfully!",
    dayUpdatedSuccess: "Day updated successfully!",
    dayDeletedSuccess: "Day deleted successfully!",
    managePlayerScores: "Manage Player Scores",
    selectEventDay: "Select Day:",
    addPlayerScore: "Add Player Score",
    scorePoints: "Points",
    addScore: "Add Score",
    editPlayerScore: "Edit Player Score",
    deletePlayerScore: "Delete Player Score",
    confirmDeletePlayerScore: "Are you sure you want to delete this player score?",
    scoreAddedSuccess: "Score added successfully!",
    scoreUpdatedSuccess: "Score updated successfully!",
    scoreDeletedSuccess: "Score deleted successfully!",
    playerScoresForDay: "Player Scores for Day",
    player: "Player",
    points: "Points",
    noScores: "No scores for this day.",
    totalPlayers: "Total Players:",
    totalEvents: "Total Events:",
    lastUpdated: "Last Updated:",
    overallStats: "Overall Statistics",
    archivePeriod: "Archive Period",
    confirmArchivePeriod: "Are you sure you want to archive this period? This will move it to the archive and make it inaccessible for new entries.",
    periodArchivedSuccess: "Period archived successfully!",
    unarchivePeriod: "Unarchive Period",
    confirmUnarchivePeriod: "Are you sure you want to unarchive this period? It will become active again.",
    periodUnarchivedSuccess: "Period unarchived successfully!",
    activePeriods: "Active Periods",
    archivedPeriods: "Archived Periods",
    viewArchivedPeriod: "View Archived Period",
    periodStatusActive: "Active",
    periodStatusArchived: "Archived",
    currentPeriod: "Current Period:",
    noActivePeriods: "No active periods found.",
    noArchivedPeriods: "No archived periods found.",
    selectActivePeriod: "Select Active Period:",
    selectArchivedPeriod: "Select Archived Period:",
    setAsCurrent: "Set as Current Period",
    confirmSetCurrent: "Are you sure you want to set this period as current? Only one period can be active at a time.",
    setCurrentSuccess: "Period successfully set as current!",
    manageCurrentEvent: "Manage Current Event",
    manageArchivedEvents: "Manage Archived Events",
    noCurrentEventDays: "No days found for the current event.",
    noArchivedEventDays: "No days found for this archived event.",
    noCurrentPlayerScores: "No player scores found for the current event.",
    noArchivedPlayerScores: "No player scores found for this archived event.",
    selectCurrentEventDay: "Select Current Event Day:",
    selectArchivedEventDay: "Select Archived Event Day:",
    manageCurrentPlayerScores: "Manage Current Event Player Scores",
    manageArchivedPlayerScores: "Manage Archived Event Player Scores",
    adminMessage: "Message to Admins",
    messageContent: "Message Content",
    sendMessageToAdmins: "Send Message to Admins",
    messageSentToAdmins: "Message sent to admins!",
    adminMessages: "Admin Messages",
    noAdminMessages: "No admin messages.",
    fromUser: "From User",
    message: "Message",
    timestamp: "Timestamp",
    deleteMessage: "Delete Message",
    confirmDeleteMessage: "Are you sure you want to delete this message?",
    messageDeletedSuccess: "Message deleted successfully!",
    showAdminMessages: "Show Admin Messages",
    hideAdminMessages: "Hide Admin Messages",
    playerRanking: "Player Ranking",
    playerParticipation: "Player Participation",
    playerScores: "Player Scores",
    eventOverview: "Event Overview",
    totalEventsParticipated: "Total Events Participated:",
    averageScore: "Average Score:",
    bestScore: "Best Score:",
    playerStats: "Player Stats",
    noPlayerStats: "No stats available for this player.",
    playerActivity: "Player Activity",
    lastParticipation: "Last Participation:",
    playerNotFound: "Player not found.",
    playerSearchPlaceholder: "Enter player name...",
    searchPlayer: "Search Player",
    playerList: "Player List",
    noPlayers: "No players found.",
    playerDetails: "Player Details",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    overallRank: "Overall Rank",
    overallScore: "Overall Score",
    playerOverallReport: "Overall Report for",
    selectOverallPlayer: "Select Player for Overall Report:",
    loadOverallReport: "Load Overall Report",
    overallReportTitle: "Overall Player Report",
    totalScoreAllPeriods: "Total Score Across All Periods:",
    averageScoreAllPeriods: "Average Score Across All Periods:",
    totalEventsAllPeriods: "Total Events Across All Periods:",
    detailedScoresByPeriod: "Detailed Scores by Period:",
    period: "Period",
    event: "Event",
    scoreDetails: "Score Details",
    backToOverallReport: "Back to Overall Report",
    noOverallReport: "No overall report available for this player.",
    toggleTheme: "Toggle Theme",
    lightTheme: "Light Theme",
    darkTheme: "Dark Theme",
    systemTheme: "System Theme",
    theme: "Theme",
    currentTheme: "Current Theme:",
    applyTheme: "Apply Theme",
    themeChangedSuccess: "Theme changed successfully!",
    settings: "Settings",
    languageSettings: "Language Settings",
    themeSettings: "Theme Settings",
    saveSettings: "Save Settings",
    settingsSavedSuccess: "Settings saved successfully!",
    resetSettings: "Reset Settings",
    confirmResetSettings: "Are you sure you want to reset all settings to default?",
    settingsResetSuccess: "Settings reset successfully!",
    exportData: "Export Data",
    importData: "Import Data",
    exportPlayers: "Export Players",
    exportEvents: "Export Events",
    exportScores: "Export Scores",
    importPlayers: "Import Players",
    importEvents: "Import Events",
    importScores: "Import Scores",
    selectFile: "Select File",
    upload: "Upload",
    download: "Download",
    dataExportedSuccess: "Data exported successfully!",
    dataImportedSuccess: "Data imported successfully!",
    invalidFileFormat: "Invalid file format. Please select a JSON file.",
    fileTooLarge: "File too large. Maximum size: 5MB.",
    uploading: "Uploading...",
    downloading: "Downloading...",
    dataSyncError: "Error syncing data:",
    dataCorrupted: "Imported data is corrupted or invalid.",
    backupData: "Backup Data",
    restoreData: "Restore Data",
    lastBackup: "Last Backup:",
    createBackup: "Create Backup",
    restoreFromBackup: "Restore from Backup",
    confirmRestore: "Are you sure you want to restore data from the last backup? Current data will be lost.",
    backupCreatedSuccess: "Backup created successfully!",
    restoreSuccess: "Data restored successfully!",
    noBackup: "No backup available.",
    adminLogs: "Admin Logs",
    viewLogs: "View Logs",
    noLogs: "No logs available.",
    logEntry: "Log Entry",
    logTimestamp: "Timestamp",
    logUser: "User",
    logAction: "Action",
    clearLogs: "Clear Logs",
    confirmClearLogs: "Are you sure you want to clear all logs?",
    logsClearedSuccess: "Logs cleared successfully!",
    eventHistory: "Event History",
    viewEventHistory: "View History",
    noEventHistory: "No event history available.",
    eventHistoryEntry: "History Entry",
    eventHistoryTimestamp: "Timestamp",
    eventHistoryEvent: "Event",
    eventHistoryAction: "Action",
    clearEventHistory: "Clear History",
    confirmClearEventHistory: "Are you sure you want to clear the event history?",
    eventHistoryClearedSuccess: "Event history cleared successfully!",
    playerActivityLog: "Player Activity Log",
    viewPlayerActivityLog: "View Activity Log",
    noPlayerActivityLog: "No player activity log available.",
    playerActivityLogEntry: "Activity Entry",
    playerActivityLogTimestamp: "Timestamp",
    playerActivityLogPlayer: "Player",
    playerActivityLogAction: "Action",
    clearPlayerActivityLog: "Clear Activity Log",
    confirmClearPlayerActivityLog: "Are you sure you want to clear the player activity log?",
    playerActivityLogClearedSuccess: "Player activity log cleared successfully!",
    totalPlayersRegistered: "Total Registered Players:",
    totalEventsRecorded: "Total Events Recorded:",
    totalScoresRecorded: "Total Scores Recorded:",
    dataSummary: "Data Summary",
    viewDataSummary: "View Summary",
    refreshData: "Refresh Data",
    dataRefreshedSuccess: "Data refreshed successfully!",
    generateReport: "Generate Report",
    reportGeneratedSuccess: "Report generated successfully!",
    reportType: "Report Type",
    selectReportType: "Select Report Type:",
    playerReport: "Player Report",
    eventReport: "Event Report",
    overallReport: "Overall Report",
    generate: "Generate",
    reportOptions: "Report Options",
    startDate: "Start Date",
    endDate: "End Date",
    includeArchived: "Include Archived Data",
    exportReport: "Export Report",
    reportExportedSuccess: "Report exported successfully!",
    reportPreview: "Report Preview",
    noReportPreview: "No report preview available. Generate a report.",
    printReport: "Print Report",
    printingReport: "Printing report...",
    printSuccess: "Report printed successfully!",
    printError: "Error printing report.",
    playerSearch: "Player Search",
    searchPlaceholder: "Player Name or ID",
    searchButton: "Search",
    noSearchResults: "No search results.",
    searchResult: "Search Result",
    clearSearch: "Clear Search",
    filterOptions: "Filter Options",
    filterByEvent: "Filter by Event",
    filterByPeriod: "Filter by Period",
    applyFilter: "Apply Filter",
    clearFilter: "Clear Filter",
    noFilteredData: "No data for selected filters.",
    filteredData: "Filtered Data",
    resetFilters: "Reset Filters",
    filterApplied: "Filter applied.",
    filterCleared: "Filter cleared.",
    notificationSettings: "Notification Settings",
    enableNotifications: "Enable Notifications",
    notificationSound: "Notification Sound",
    notificationVolume: "Volume",
    testNotification: "Test Notification",
    notificationTestSuccess: "Test notification sent!",
    notificationPermissionDenied: "Notification permission denied. Please allow notifications in your browser settings.",
    notificationPermissionGranted: "Notification permission granted.",
    notificationPermissionPrompt: "Allow notifications to be informed about important updates.",
    notificationEnabled: "Notifications enabled.",
    notificationDisabled: "Notifications disabled.",
    showNotifications: "Show Notifications",
    hideNotifications: "Hide Notifications",
    noNotifications: "No notifications.",
    notification: "Notification",
    notificationTimestamp: "Timestamp",
    notificationMessage: "Message",
    clearNotifications: "Clear Notifications",
    confirmClearNotifications: "Are you sure you want to clear all notifications?",
    notificationsClearedSuccess: "Notifications cleared successfully!",
    markAsRead: "Mark as Read",
    markAllAsRead: "Mark All as Read",
    markedAsReadSuccess: "Notification marked as read!",
    markedAllAsReadSuccess: "All notifications marked as read!",
    unreadNotifications: "Unread Notifications:",
    allNotificationsRead: "All notifications read.",
    profileSettings: "Profile Settings",
    changeUsername: "Change Username",
    newUsername: "New Username",
    updateUsername: "Update Username",
    usernameUpdatedSuccess: "Username updated successfully!",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    updatePassword: "Update Password",
    passwordUpdatedSuccess: "Password updated successfully!",
    passwordsMismatch: "New passwords do not match.",
    invalidCurrentPassword: "Current password is incorrect.",
    deleteAccount: "Delete Account",
    confirmDeleteAccount: "Are you sure you want to delete your account? This cannot be undone.",
    accountDeletedSuccess: "Account deleted successfully!",
    reauthenticateRequired: "Please reauthenticate to perform this action.",
    accountSettings: "Account Settings",
    privacySettings: "Privacy Settings",
    dataSharing: "Data Sharing",
    enableDataSharing: "Enable Data Sharing",
    dataSharingInfo: "Share anonymized usage data to help improve the app.",
    savePrivacySettings: "Save Privacy Settings",
    privacySettingsSavedSuccess: "Privacy settings saved successfully!",
    aboutApp: "About App",
    appVersion: "Version:",
    developer: "Developer:",
    releaseDate: "Release Date:",
    license: "License:",
    viewLicense: "View License",
    feedback: "Feedback",
    sendFeedback: "Send Feedback",
    feedbackSentSuccess: "Feedback sent successfully!",
    reportBug: "Report Bug",
    bugReportSentSuccess: "Bug report sent successfully!",
    featureRequest: "Feature Request",
    featureRequestSentSuccess: "Feature request sent successfully!",
    help: "Help",
    faq: "FAQ",
    viewFaq: "View FAQ",
    documentation: "Documentation",
    viewDocumentation: "View Documentation",
    support: "Support",
    contactSupport: "Contact Support",
    supportContactedSuccess: "Support contacted successfully!",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    viewTerms: "View Terms of Service",
    viewPrivacy: "View Privacy Policy",
    legal: "Legal",
    logout: "Logout",
    confirmLogout: "Are you sure you want to log out?",
    logoutSuccess: "Logged out successfully!",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    resetPasswordSuccess: "Password reset email sent!",
    noAccount: "Don't have an account yet?",
    alreadyAccount: "Already have an account?",
    loginSuccess: "Logged in successfully!",
    registerSuccess: "Registration successful!",
    authError: "Authentication Error:",
    emailNotVerified: "Email not verified. Please check your inbox.",
    sendVerificationEmail: "Send Verification Email",
    verificationEmailSent: "Verification email sent!",
    loadingUserData: "Loading user data...",
    welcomeUser: "Welcome, {{username}}!",
    profile: "Profile",
    editProfile: "Edit Profile",
    viewProfile: "View Profile",
    updateProfile: "Update Profile",
    profileUpdatedSuccess: "Profile updated successfully!",
    username: "Username",
    avatar: "Avatar",
    changeAvatar: "Change Avatar",
    uploadAvatar: "Upload Avatar",
    avatarUpdatedSuccess: "Avatar updated successfully!",
    invalidImageFormat: "Invalid image format. Please select an image file (JPG, PNG, GIF).",
    imageTooLarge: "Image too large. Maximum size: 2MB.",
    uploadingAvatar: "Uploading avatar...",
    deleteAvatar: "Delete Avatar",
    confirmDeleteAvatar: "Are you sure you want to delete your avatar?",
    avatarDeletedSuccess: "Avatar deleted successfully!",
    memberSince: "Member Since:",
    lastLogin: "Last Login:",
    roles: "Roles:",
    publicProfile: "Public Profile",
    privateProfile: "Private Profile",
    showPublicProfile: "Show Public Profile",
    hidePublicProfile: "Hide Public Profile",
    publicProfileEnabled: "Public profile enabled.",
    publicProfileDisabled: "Public profile disabled.",
    shareProfile: "Share Profile",
    profileShareLink: "Profile Share Link:",
    copyLink: "Copy Link",
    linkCopied: "Link copied!",
    shareOnSocialMedia: "Share on Social Media",
    socialMediaShareSuccess: "Profile shared successfully!",
    socialMediaShareError: "Error sharing profile.",
    playerAchievements: "Player Achievements",
    viewAchievements: "View Achievements",
    noAchievements: "No achievements available.",
    achievement: "Achievement",
    achievementDescription: "Description",
    achievementDate: "Date",
    addAchievement: "Add Achievement",
    achievementName: "Achievement Name",
    achievementAddedSuccess: "Achievement added successfully!",
    editAchievement: "Edit Achievement",
    deleteAchievement: "Delete Achievement",
    confirmDeleteAchievement: "Are you sure you want to delete this achievement?",
    achievementUpdatedSuccess: "Achievement updated successfully!",
    achievementDeletedSuccess: "Achievement deleted successfully!",
    eventGoals: "Event Goals",
    viewGoals: "View Goals",
    noGoals: "No goals available.",
    goal: "Goal",
    goalDescription: "Description",
    goalTarget: "Target Value",
    goalProgress: "Progress",
    addGoal: "Add Goal",
    goalName: "Goal Name",
    goalAddedSuccess: "Goal added successfully!",
    editGoal: "Edit Goal",
    deleteGoal: "Delete Goal",
    confirmDeleteGoal: "Are you sure you want to delete this goal?",
    goalUpdatedSuccess: "Goal updated successfully!",
    goalDeletedSuccess: "Goal deleted successfully!",
    milestones: "Milestones",
    viewMilestones: "View Milestones",
    noMilestones: "No milestones available.",
    milestone: "Milestone",
    milestoneDescription: "Description",
    milestoneDate: "Date",
    addMilestone: "Add Milestone",
    milestoneName: "Milestone Name",
    milestoneAddedSuccess: "Milestone added successfully!",
    editMilestone: "Edit Milestone",
    deleteMilestone: "Delete Milestone",
    confirmDeleteMilestone: "Are you sure you want to delete this milestone?",
    milestoneUpdatedSuccess: "Milestone updated successfully!",
    milestoneDeletedSuccess: "Milestone deleted successfully!",
    rewards: "Rewards",
    viewRewards: "View Rewards",
    noRewards: "No rewards available.",
    reward: "Reward",
    rewardDescription: "Description",
    rewardCriteria: "Criteria",
    addReward: "Add Reward",
    rewardName: "Reward Name",
    rewardAddedSuccess: "Reward added successfully!",
    editReward: "Edit Reward",
    deleteReward: "Delete Reward",
    confirmDeleteReward: "Are you sure you want to delete this reward?",
    rewardUpdatedSuccess: "Reward updated successfully!",
    rewardDeletedSuccess: "Reward deleted successfully!",
    leaderboard: "Leaderboard",
    viewLeaderboard: "View Leaderboard",
    noLeaderboard: "No leaderboard available.",
    leaderboardRank: "Rank",
    leaderboardPlayer: "Player",
    leaderboardScore: "Score",
    refreshLeaderboard: "Refresh Leaderboard",
    leaderboardRefreshedSuccess: "Leaderboard refreshed successfully!",
    playerProfile: "Player Profile",
    viewPlayerProfile: "View Player Profile",
    playerProfileTitle: "Player Profile for",
    playerStatsTitle: "Player Statistics",
    playerAchievementsTitle: "Player Achievements",
    playerGoalsTitle: "Player Goals",
    playerMilestonesTitle: "Player Milestones",
    playerRewardsTitle: "Player Rewards",
    backToLeaderboard: "Back to Leaderboard",
    noPlayerProfile: "No player profile available.",
    playerProfileNotFound: "Player profile not found.",
    playerProfileLoading: "Loading player profile...",
    playerProfileError: "Error loading player profile.",
    playerProfileRefresh: "Refresh Player Profile",
    playerProfileRefreshedSuccess: "Player profile refreshed successfully!",
    playerProfileExport: "Export Player Profile",
    playerProfileExportedSuccess: "Player profile exported successfully!",
    playerProfilePrint: "Print Player Profile",
    playerProfilePrintSuccess: "Player profile printed successfully!",
    playerProfilePrintError: "Error printing player profile.",
    adminDashboard: "Admin Dashboard",
    adminDashboardTitle: "Admin Dashboard Overview",
    adminDashboardStats: "Statistics",
    adminDashboardRecentActivity: "Recent Activity",
    adminDashboardQuickActions: "Quick Actions",
    viewAllPlayers: "View All Players",
    viewAllEvents: "View All Events",
    viewAllAdmins: "View All Admins",
    viewAllMessages: "View All Messages",
    viewAllLogs: "View All Logs",
    createPlayer: "Create Player",
    createEvent: "Create Event",
    createAdmin: "Create Admin",
    sendBroadcastMessage: "Send Broadcast Message",
    broadcastMessage: "Broadcast Message",
    broadcastMessageContent: "Message Content",
    send: "Send",
    broadcastMessageSentSuccess: "Broadcast message sent successfully!",
    broadcastMessages: "Broadcast Messages",
    noBroadcastMessages: "No broadcast messages.",
    broadcastMessageFrom: "From:",
    broadcastMessageTo: "To:",
    broadcastMessageTimestamp: "Timestamp:",
    deleteBroadcastMessage: "Delete Broadcast Message",
    confirmDeleteBroadcastMessage: "Are you sure you want to delete this broadcast message?",
    broadcastMessageDeletedSuccess: "Broadcast message deleted successfully!",
    showBroadcastMessages: "Show Broadcast Messages",
    hideBroadcastMessages: "Hide Broadcast Messages",
    manageBroadcastMessages: "Manage Broadcast Messages",
    playerActivityChart: "Player Activity Chart",
    eventParticipationChart: "Event Participation Chart",
    scoreDistributionChart: "Score Distribution Chart",
    generateCharts: "Generate Charts",
    chartsGeneratedSuccess: "Charts generated successfully!",
    noCharts: "No charts available.",
    chartOptions: "Chart Options",
    chartType: "Chart Type",
    selectChartType: "Select Chart Type:",
    barChart: "Bar Chart",
    lineChart: "Line Chart",
    pieChart: "Pie Chart",
    doughnutChart: "Doughnut Chart",
    radarChart: "Radar Chart",
    polarAreaChart: "Polar Area Chart",
    bubbleChart: "Bubble Chart",
    scatterChart: "Scatter Chart",
    areaChart: "Area Chart",
    applyChartOptions: "Apply Chart Options",
    chartOptionsApplied: "Chart options applied.",
    chartData: "Chart Data",
    exportChart: "Export Chart",
    chartExportedSuccess: "Chart exported successfully!",
    printChart: "Print Chart",
    chartPrintSuccess: "Chart printed successfully!",
    chartPrintError: "Error printing chart.",
    playerComparison: "Player Comparison",
    selectPlayersToCompare: "Select Players to Compare:",
    comparePlayers: "Compare Players",
    playerComparisonChart: "Player Comparison Chart",
    noPlayerComparison: "No player comparison available.",
    playerComparisonOptions: "Comparison Options",
    compareByScore: "Compare by Score",
    compareByParticipation: "Compare by Participation",
    compareByAchievements: "Compare by Achievements",
    applyComparisonOptions: "Apply Comparison Options",
    comparisonOptionsApplied: "Comparison options applied.",
    playerComparisonData: "Player Comparison Data",
    exportComparison: "Export Comparison",
    comparisonExportedSuccess: "Comparison exported successfully!",
    printComparison: "Print Comparison",
    comparisonPrintSuccess: "Comparison printed successfully!",
    comparisonPrintError: "Error printing comparison.",
    eventComparison: "Event Comparison",
    selectEventsToCompare: "Select Events to Compare:",
    compareEvents: "Compare Events",
    eventComparisonChart: "Event Comparison Chart",
    noEventComparison: "No event comparison available.",
    eventComparisonOptions: "Comparison Options",
    compareByTotalScore: "Compare by Total Score",
    compareByAverageScore: "Compare by Average Score",
    compareByParticipationRate: "Compare by Participation Rate",
    applyEventComparisonOptions: "Apply Event Comparison Options",
    eventComparisonOptionsApplied: "Event comparison options applied.",
    eventComparisonData: "Event Comparison Data",
    exportEventComparison: "Export Comparison",
    eventComparisonExportedSuccess: "Comparison exported successfully!",
    printEventComparison: "Print Comparison",
    eventComparisonPrintSuccess: "Comparison printed successfully!",
    eventComparisonPrintError: "Error printing comparison.",
    dataManagement: "Data Management",
    backupAndRestore: "Backup and Restore",
    importAndExport: "Import and Export",
    clearData: "Clear Data",
    confirmClearData: "Are you sure you want to clear all application data? This cannot be undone.",
    dataClearedSuccess: "Data cleared successfully!",
    caution: "Caution!",
    dangerZone: "Danger Zone",
    fullDataReset: "Full Data Reset",
    confirmFullDataReset: "Are you absolutely sure you want to perform a full data reset? This will permanently delete ALL data.",
    fullDataResetSuccess: "Full data reset successful!",
    enterConfirmText: "Please type 'CONFIRM' to proceed.",
    invalidConfirmText: "Invalid confirmation text.",
    adminTools: "Admin Tools",
    userManagement: "User Management",
    roleManagement: "Role Management",
    assignRoles: "Assign Roles",
    userRoles: "User Roles",
    selectUser: "Select User:",
    selectRole: "Select Role:",
    assign: "Assign",
    roleAssignedSuccess: "Role assigned successfully!",
    removeRole: "Remove Role",
    roleRemovedSuccess: "Role removed successfully!",
    availableRoles: "Available Roles:",
    addRole: "Add Role",
    roleName: "Role Name",
    roleDescription: "Role Description",
    roleAddedSuccess: "Role added successfully!",
    editRole: "Edit Role",
    deleteRole: "Delete Role",
    confirmDeleteRole: "Are you sure you want to delete this role?",
    roleUpdatedSuccess: "Role updated successfully!",
    roleDeletedSuccess: "Role deleted successfully!",
    manageRoles: "Manage Roles",
    permissions: "Permissions",
    viewPermissions: "View Permissions",
    noPermissions: "No permissions available.",
    permission: "Permission",
    permissionDescription: "Description",
    addPermission: "Add Permission",
    permissionName: "Permission Name",
    permissionAddedSuccess: "Permission added successfully!",
    editPermission: "Edit Permission",
    deletePermission: "Delete Permission",
    confirmDeletePermission: "Are you sure you want to delete this permission?",
    permissionUpdatedSuccess: "Permission updated successfully!",
    permissionDeletedSuccess: "Permission deleted successfully!",
    assignPermissions: "Assign Permissions",
    selectPermission: "Select Permission:",
    permissionAssignedSuccess: "Permission assigned successfully!",
    permissionRemovedSuccess: "Permission removed successfully!",
    managePermissions: "Manage Permissions",
    auditLog: "Audit Log",
    viewAuditLog: "View Audit Log",
    noAuditLog: "No audit log available.",
    auditLogEntry: "Audit Entry",
    auditLogTimestamp: "Timestamp",
    auditLogUser: "User",
    auditLogAction: "Action",
    auditLogTarget: "Target",
    clearAuditLog: "Clear Audit Log",
    confirmClearAuditLog: "Are you sure you want to clear the audit log?",
    auditLogClearedSuccess: "Audit log cleared successfully!",
    systemStatus: "System Status",
    viewSystemStatus: "View System Status",
    systemHealth: "System Health:",
    databaseStatus: "Database Status:",
    apiStatus: "API Status:",
    online: "Online",
    offline: "Offline",
    operational: "Operational",
    degraded: "Degraded",
    outage: "Outage",
    lastChecked: "Last Checked:",
    refreshStatus: "Refresh Status",
    statusRefreshedSuccess: "Status refreshed successfully!",
    systemLogs: "System Logs",
    viewSystemLogs: "View System Logs",
    noSystemLogs: "No system logs available.",
    systemLogEntry: "System Log Entry",
    systemLogTimestamp: "Timestamp",
    systemLogLevel: "Level",
    systemLogMessage: "Message",
    clearSystemLogs: "Clear System Logs",
    confirmClearSystemLogs: "Are you sure you want to clear all system logs?",
    systemLogsClearedSuccess: "System logs cleared successfully!",
    maintenanceMode: "Maintenance Mode",
    enableMaintenanceMode: "Enable Maintenance Mode",
    disableMaintenanceMode: "Disable Maintenance Mode",
    maintenanceModeEnabled: "Maintenance mode enabled.",
    maintenanceModeDisabled: "Maintenance mode disabled.",
    maintenanceMessage: "Maintenance Message",
    updateMaintenanceMessage: "Update Maintenance Message",
    maintenanceMessageUpdated: "Maintenance message updated!",
    scheduledMaintenance: "Scheduled Maintenance",
    scheduleMaintenance: "Schedule Maintenance",
    maintenanceDate: "Maintenance Date",
    maintenanceTime: "Maintenance Time",
    schedule: "Schedule",
    maintenanceScheduledSuccess: "Maintenance scheduled successfully!",
    cancelMaintenance: "Cancel Maintenance",
    confirmCancelMaintenance: "Are you sure you want to cancel the scheduled maintenance?",
    maintenanceCanceledSuccess: "Maintenance canceled!",
    noScheduledMaintenance: "No scheduled maintenance.",
    currentMaintenanceStatus: "Current Maintenance Status:",
    active: "Active",
    inactive: "Inactive",
    scheduled: "Scheduled",
    completed: "Completed",
    failed: "Failed",
    updateStatus: "Update Status",
    statusUpdatedSuccess: "Status updated successfully!",
    announcements: "Announcements",
    createAnnouncement: "Create Announcement",
    announcementTitle: "Title",
    announcementContent: "Content",
    publish: "Publish",
    announcementPublishedSuccess: "Announcement published successfully!",
    editAnnouncement: "Edit Announcement",
    deleteAnnouncement: "Delete Announcement",
    confirmDeleteAnnouncement: "Are you sure you want to delete this announcement?",
    announcementUpdatedSuccess: "Announcement updated successfully!",
    announcementDeletedSuccess: "Announcement deleted successfully!",
    viewAnnouncements: "View Announcements",
    noAnnouncements: "No announcements available.",
    announcementTimestamp: "Timestamp",
    announcementAuthor: "Author",
    announcementExpires: "Expires:",
    setExpiration: "Set Expiration",
    expirationDate: "Expiration Date",
    noExpiration: "No Expiration",
    expired: "Expired",
    activeAnnouncements: "Active Announcements",
    archivedAnnouncements: "Archived Announcements",
    archiveAnnouncement: "Archive Announcement",
    confirmArchiveAnnouncement: "Are you sure you want to archive this announcement?",
    announcementArchivedSuccess: "Announcement archived successfully!",
    unarchiveAnnouncement: "Unarchive Announcement",
    confirmUnarchiveAnnouncement: "Are you sure you want to unarchive this announcement?",
    announcementUnarchivedSuccess: "Announcement unarchived successfully!",
    viewArchivedAnnouncements: "View Archived Announcements",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    admin: "Admin",
    about: "About",
    help: "Help",
    legal: "Legal",
    dashboard: "Dashboard",
    reports: "Reports",
    charts: "Charts",
    comparison: "Comparison",
    data: "Data",
    system: "System",
    maintenance: "Maintenance",
    logs: "Logs",
    announcements: "Announcements",
    users: "Users",
    roles: "Roles",
    permissions: "Permissions",
    audit: "Audit",
    activity: "Activity",
    history: "History",
    messages: "Messages",
    broadcast: "Broadcast",
    feedback: "Feedback",
    support: "Support",
    faq: "FAQ",
    documentation: "Documentation",
    terms: "Terms",
    privacy: "Privacy",
    contact: "Contact",
    home: "Home",
    info: "Info",
    navigation: "Navigation",
    playerReport: "Player Report",
    currentEvent: "Current Event",
    archive: "Archive",
    top10: "Top 10",
    hallOfChamps: "Hall of Champs",
    adminPanel: "Admin Panel",
    playerManagement: "Player Management",
    eventManagement: "Event Management",
    adminManagement: "Admin Management",
    eventDayManagement: "Event Day Management",
    playerScoreManagement: "Player Score Management",
    overallPlayerReport: "Overall Player Report",
    playerSearch: "Player Search",
    filterOptions: "Filter Options",
    notificationSettings: "Notification Settings",
    profileSettings: "Profile Settings",
    accountSettings: "Account Settings",
    privacySettings: "Privacy Settings",
    aboutApp: "About App",
    feedbackAndSupport: "Feedback & Support",
    legalInformation: "Legal Information",
    authentication: "Authentication",
    userProfile: "User Profile",
    playerAchievements: "Player Achievements",
    eventGoals: "Event Goals",
    milestones: "Milestones",
    rewards: "Rewards",
    leaderboard: "Leaderboard",
    playerComparison: "Player Comparison",
    eventComparison: "Event Comparison",
    dataManagement: "Data Management",
    systemMonitoring: "System Monitoring",
    adminTools: "Admin Tools",
    communication: "Communication",
    reportsAndAnalytics: "Reports & Analytics",
    generalSettings: "General Settings",
    securitySettings: "Security Settings",
    integrations: "Integrations",
    apiSettings: "API Settings",
    webhookSettings: "Webhook Settings",
    pluginManagement: "Plugin Management",
    themeCustomization: "Theme Customization",
    layoutSettings: "Layout Settings",
    fontSettings: "Font Settings",
    colorSettings: "Color Settings",
    backgroundSettings: "Background Settings",
    logoSettings: "Logo Settings",
    customCSS: "Custom CSS",
    customJS: "Custom JS",
    seoSettings: "SEO Settings",
    metaTags: "Meta Tags",
    sitemap: "Sitemap",
    robotstxt: "robots.txt",
    analyticsIntegration: "Analytics Integration",
    googleAnalytics: "Google Analytics",
    matomoAnalytics: "Matomo Analytics",
    customAnalytics: "Custom Analytics",
    socialMediaIntegration: "Social Media Integration",
    facebook: "Facebook",
    twitter: "Twitter",
    instagram: "Instagram",
    discord: "Discord",
    twitch: "Twitch",
    youtube: "YouTube",
    patreon: "Patreon",
    merchStore: "Merch Store",
    donationLink: "Donation Link",
    communityLinks: "Community Links",
    forum: "Forum",
    discordServer: "Discord Server",
    guildWebsite: "Guild Website",
    raidPlanner: "Raid Planner",
    dungeonGuides: "Dungeon Guides",
    pvpGuides: "PvP Guides",
    classGuides: "Class Guides",
    professionGuides: "Profession Guides",
    craftingGuides: "Crafting Guides",
    economyGuides: "Economy Guides",
    eventGuides: "Event Guides",
    questGuides: "Quest Guides",
    lore: "Lore",
    wiki: "Wiki",
    database: "Database",
    tools: "Tools",
    calculators: "Calculators",
    simulators: "Simulators",
    timers: "Timers",
    trackers: "Trackers",
    planners: "Planners",
    generators: "Generators",
    converters: "Converters",
    utilities: "Utilities",
    apiDocumentation: "API Documentation",
    developerTools: "Developer Tools",
    webhooks: "Webhooks",
    plugins: "Plugins",
    themes: "Themes",
    updates: "Updates",
    changelog: "Changelog",
    roadmap: "Roadmap",
    bugTracker: "Bug Tracker",
    featureRequests: "Feature Requests",
    knownIssues: "Known Issues",
    troubleshooting: "Troubleshooting",
    faq: "FAQ",
    supportForum: "Support Forum",
    contactUs: "Contact Us",
    imprint: "Imprint",
    disclaimer: "Disclaimer",
    copyright: "Copyright",
    dataProtection: "Data Protection",
    cookies: "Cookies",
    cookieSettings: "Cookie Settings",
    acceptCookies: "Accept Cookies",
    declineCookies: "Decline Cookies",
    cookiePolicy: "Cookie Policy",
    poweredBy: "Powered By",
    madeWith: "Made With",
    version: "Version",
    build: "Build",
    release: "Release",
    date: "Date",
    time: "Time",
    author: "Author",
    contributors: "Contributors",
    acknowledgements: "Acknowledgements",
    specialThanks: "Special Thanks",
    community: "Community",
    partners: "Partners",
    sponsors: "Sponsors",
    donors: "Donors",
    patrons: "Patrons",
    supporters: "Supporters",
    getInvolved: "Get Involved",
    contribute: "Contribute",
    translate: "Translate",
    reportIssue: "Report Issue",
    suggestFeature: "Suggest Feature",
    joinCommunity: "Join Community",
    followUs: "Follow Us",
    subscribe: "Subscribe",
    newsletter: "Newsletter",
    getUpdates: "Get Updates",
    stayConnected: "Stay Connected",
    socials: "Socials",
    links: "Links",
    resources: "Resources",
    downloads: "Downloads",
    assets: "Assets",
    mediaKit: "Media Kit",
    press: "Press",
    events: "Events",
    calendar: "Calendar",
    schedule: "Schedule",
    upcomingEvents: "Upcoming Events",
    pastEvents: "Past Events",
    eventRegistration: "Event Registration",
    eventDetails: "Event Details",
    eventResults: "Event Results",
    eventPhotos: "Event Photos",
    eventVideos: "Event Videos",
    eventRecaps: "Event Recaps",
    eventFeedback: "Event Feedback",
    eventOrganizers: "Event Organizers",
    eventSponsors: "Event Sponsors",
    eventPartners: "Event Partners",
    eventVolunteers: "Event Volunteers",
    eventAttendees: "Event Attendees",
    eventTickets: "Event Tickets",
    eventVenue: "Event Venue",
    eventMap: "Event Map",
    eventDirections: "Event Directions",
    eventAccommodation: "Event Accommodation",
    eventTravel: "Event Travel",
    eventFAQ: "Event FAQ",
    eventContact: "Event Contact",
    eventRules: "Event Rules",
    eventPrizes: "Event Prizes",
    eventAwards: "Event Awards",
    eventLeaderboard: "Event Leaderboard",
    eventParticipants: "Event Participants",
    eventStatistics: "Event Statistics",
    eventHighlights: "Event Highlights",
    eventGallery: "Event Gallery",
    eventVideos: "Event Videos",
    eventPress: "Event Press",
    eventPartnerships: "Event Partnerships",
    eventSponsorship: "Event Sponsorship",
    eventVolunteer: "Event Volunteer",
    eventAttendee: "Event Attendee",
    eventTicket: "Event Ticket",
    eventVenueInfo: "Event Venue Info",
    eventMapInfo: "Event Map Info",
    eventDirectionsInfo: "Event Directions Info",
    eventAccommodationInfo: "Event Accommodation Info",
    eventTravelInfo: "Event Travel Info",
    eventFAQInfo: "Event FAQ Info",
    eventContactInfo: "Event Contact Info",
    eventRulesInfo: "Event Rules Info",
    eventPrizesInfo: "Event Prizes Info",
    eventAwardsInfo: "Event Awards Info",
    eventLeaderboardInfo: "Event Leaderboard Info",
    eventParticipantsInfo: "Event Participants Info",
    eventStatisticsInfo: "Event Statistics Info",
    eventHighlightsInfo: "Event Highlights Info",
    eventGalleryInfo: "Event Gallery Info",
    eventVideoInfo: "Event Video Info",
    eventPressInfo: "Event Press Info",
    eventPartnershipsInfo: "Event Partnerships Info",
    eventSponsorshipInfo: "Event Sponsorship Info",
    eventVolunteerInfo: "Event Volunteer Info",
    eventAttendeeInfo: "Event Attendee Info",
    eventTicketInfo: "Event Ticket Info",
    eventVenueDetails: "Event Venue Details",
    eventMapDetails: "Event Map Details",
    eventDirectionsDetails: "Event Directions Details",
    eventAccommodationDetails: "Event Accommodation Details",
    eventTravelDetails: "Event Travel Details",
    eventFAQDetails: "Event FAQ Details",
    eventContactDetails: "Event Contact Details",
    eventRulesDetails: "Event Rules Details",
    eventPrizesDetails: "Event Prizes Details",
    eventAwardsDetails: "Event Awards Details",
    eventLeaderboardDetails: "Event Leaderboard Details",
    eventParticipantsDetails: "Event Participants Details",
    eventStatisticsDetails: "Event Statistics Details",
    eventHighlightsDetails: "Event Highlights Details",
    eventGalleryDetails: "Event Gallery Details",
    eventVideoDetails: "Event Video Details",
    eventPressDetails: "Event Press Details",
    eventPartnershipsDetails: "Event Partnerships Details",
    eventSponsorshipDetails: "Event Sponsorship Details",
    eventVolunteerDetails: "Event Volunteer Details",
    eventAttendeeDetails: "Event Attendee Details",
    eventTicketDetails: "Event Ticket Details",
    eventVenueFull: "Event Venue Full",
    eventMapFull: "Event Map Full",
    eventDirectionsFull: "Event Directions Full",
    eventAccommodationFull: "Event Accommodation Full",
    eventTravelFull: "Event Travel Full",
    eventFAQFull: "Event FAQ Full",
    eventContactFull: "Event Contact Full",
    eventRulesFull: "Event Rules Full",
    eventPrizesFull: "Event Prizes Full",
    eventAwardsFull: "Event Awards Full",
    eventLeaderboardFull: "Event Leaderboard Full",
    eventParticipantsFull: "Event Participants Full",
    eventStatisticsFull: "Event Statistics Full",
    eventHighlightsFull: "Event Highlights Full",
    eventGalleryFull: "Event Gallery Full",
    eventVideoFull: "Event Videos Full",
    eventPressFull: "Event Press Full",
    eventPartnershipsFull: "Event Partnerships Full",
    eventSponsorshipFull: "Event Sponsorship Full",
    eventVolunteerFull: "Event Volunteer Full",
    eventAttendeeFull: "Event Attendee Full",
    eventTicketFull: "Event Ticket Full",
    eventVenueComplete: "Event Venue Complete",
    eventMapComplete: "Event Map Complete",
    eventDirectionsComplete: "Event Directions Complete",
    eventAccommodationComplete: "Event Accommodation Complete",
    eventTravelComplete: "Event Travel Complete",
    eventFAQComplete: "Event FAQ Complete",
    eventContactComplete: "Event Contact Complete",
    eventRulesComplete: "Event Rules Complete",
    eventPrizesComplete: "Event Prizes Complete",
    eventAwardsComplete: "Event Awards Complete",
    eventLeaderboardComplete: "Event Leaderboard Complete",
    eventParticipantsComplete: "Event Participants Complete",
    eventStatisticsComplete: "Event Statistics Complete",
    eventHighlightsComplete: "Event Highlights Complete",
    eventGalleryComplete: "Event Gallery Complete",
    eventVideoComplete: "Event Video Complete",
    eventPressComplete: "Event Press Complete",
    eventPartnershipsComplete: "Event Partnerships Complete",
    eventSponsorshipComplete: "Event Sponsorship Complete",
    eventVolunteerComplete: "Event Volunteer Complete",
    eventAttendeeComplete: "Event Attendee Complete",
    eventTicketComplete: "Event Ticket Complete",
    eventVenueAll: "Event Venue All",
    eventMapAll: "Event Map All",
    eventDirectionsAll: "Event Directions All",
    eventAccommodationAll: "Event Accommodation All",
    eventTravelAll: "Event Travel All",
    eventFAQAll: "Event FAQ All",
    eventContactAll: "Event Contact All",
    eventRulesAll: "Event Rules All",
    eventPrizesAll: "Event Prizes All",
    eventAwardsAll: "Event Awards All",
    eventLeaderboardAll: "Event Leaderboard All",
    eventParticipantsAll: "Event Participants All",
    eventStatisticsAll: "Event Statistics All",
    eventHighlightsAll: "Event Highlights All",
    eventGalleryAll: "Event Gallery All",
    eventVideoAll: "Event Video All",
    eventPressAll: "Event Press All",
    eventPartnershipsAll: "Event Partnerships All",
    eventSponsorshipAll: "Event Sponsorship All",
    eventVolunteerAll: "Event Volunteer All",
    eventAttendeeAll: "Event Attendee All",
    eventTicketAll: "Event Ticket All",
    eventVenueOverview: "Event Venue Overview",
    eventMapOverview: "Event Map Overview",
    eventDirectionsOverview: "Event Directions Overview",
    eventAccommodationOverview: "Event Accommodation Overview",
    eventTravelOverview: "Event Travel Overview",
    eventFAQOverview: "Event FAQ Overview",
    eventContactOverview: "Event Contact Overview",
    eventRulesOverview: "Event Rules Overview",
    eventPrizesOverview: "Event Prizes Overview",
    eventAwardsOverview: "Event Awards Overview",
    eventLeaderboardOverview: "Event Leaderboard Overview",
    eventParticipantsOverview: "Event Participants Overview",
    eventStatisticsOverview: "Event Statistics Overview",
    eventHighlightsOverview: "Event Highlights Overview",
    eventGalleryOverview: "Event Gallery Overview",
    eventVideoOverview: "Event Video Overview",
    eventPressOverview: "Event Press Overview",
    eventPartnershipsOverview: "Event Partnerships Overview",
    eventSponsorshipOverview: "Event Sponsorship Overview",
    eventVolunteerOverview: "Event Volunteer Overview",
    eventAttendeeOverview: "Event Attendee Overview",
    eventTicketOverview: "Event Ticket Overview",
    eventVenueSummary: "Event Venue Summary",
    eventMapSummary: "Event Map Summary",
    eventDirectionsSummary: "Event Directions Summary",
    eventAccommodationSummary: "Event Accommodation Summary",
    eventTravelSummary: "Event Travel Summary",
    eventFAQSummary: "Event FAQ Summary",
    eventContactSummary: "Event Contact Summary",
    eventRulesSummary: "Event Rules Summary",
    eventPrizesSummary: "Event Prizes Summary",
    eventAwardsSummary: "Event Awards Summary",
    eventLeaderboardSummary: "Event Leaderboard Summary",
    eventParticipantsSummary: "Event Participants Summary",
    eventStatisticsSummary: "Event Statistics Summary",
    eventHighlightsSummary: "Event Highlights Summary",
    eventGallerySummary: "Event Gallery Summary",
    eventVideoSummary: "Event Video Summary",
    eventPressSummary: "Event Press Summary",
    eventPartnershipsSummary: "Event Partnerships Summary",
    eventSponsorshipSummary: "Event Sponsorship Summary",
    eventVolunteerSummary: "Event Volunteer Summary",
    eventAttendeeSummary: "Event Attendee Summary",
    eventTicketSummary: "Event Ticket Summary",
    eventVenueReport: "Event Venue Report",
    eventMapReport: "Event Map Report",
    eventDirectionsReport: "Event Directions Report",
    eventAccommodationReport: "Event Accommodation Report",
    eventTravelReport: "Event Travel Report",
    eventFAQReport: "Event FAQ Report",
    eventContactReport: "Event Contact Report",
    eventRulesReport: "Event Rules Report",
    eventPrizesReport: "Event Prizes Report",
    eventAwardsReport: "Event Awards Report",
    eventLeaderboardReport: "Event Leaderboard Report",
    eventParticipantsReport: "Event Participants Report",
    eventStatisticsReport: "Event Statistics Report",
    eventHighlightsReport: "Event Highlights Report",
    eventGalleryReport: "Event Gallery Report",
    eventVideoReport: "Event Video Report",
    eventPressReport: "Event Press Report",
    eventPartnershipsReport: "Event Partnerships Report",
    eventSponsorshipReport: "Event Sponsorship Report",
    eventVolunteerReport: "Event Volunteer Report",
    eventAttendeeReport: "Event Attendee Report",
    eventTicketReport: "Event Ticket Report",
    eventVenueFullReport: "Event Venue Full Report",
    eventMapFullReport: "Event Map Full Report",
    eventDirectionsFullReport: "Event Directions Full Report",
    eventAccommodationFullReport: "Event Accommodation Full Report",
    eventTravelFullReport: "Event Travel Full Report",
    eventFAQFullReport: "Event FAQ Full Report",
    eventContactFullReport: "Event Contact Full Report",
    eventRulesFullReport: "Event Rules Full Report",
    eventPrizesFullReport: "Event Prizes Full Report",
    eventAwardsFullReport: "Event Awards Full Report",
    eventLeaderboardFullReport: "Event Leaderboard Full Report",
    eventParticipantsFullReport: "Event Participants Full Report",
    eventStatisticsFullReport: "Event Statistics Full Report",
    eventHighlightsFullReport: "Event Highlights Full Report",
    eventGalleryFullReport: "Event Gallery Full Report",
    eventVideoFullReport: "Event Video Full Report",
    eventPressFullReport: "Event Press Full Report",
    eventPartnershipsFullReport: "Event Partnerships Full Report",
    eventSponsorshipFullReport: "Event Sponsorship Full Report",
    eventVolunteerFullReport: "Event Volunteer Full Report",
    eventAttendeeFullReport: "Event Attendee Full Report",
    eventTicketFullReport: "Event Ticket Full Report",
    eventVenueDetailedReport: "Event Venue Detailed Report",
    eventMapDetailedReport: "Event Map Detailed Report",
    eventDirectionsDetailedReport: "Event Directions Detailed Report",
    eventAccommodationDetailedReport: "Event Accommodation Detailed Report",
    eventTravelDetailedReport: "Event Travel Detailed Report",
    eventFAQDetailedReport: "Event FAQ Detailed Report",
    eventContactDetailedReport: "Event Contact Detailed Report",
    eventRulesDetailedReport: "Event Rules Detailed Report",
    eventPrizesDetailedReport: "Event Prizes Detailed Report",
    eventAwardsDetailedReport: "Event Awards Detailed Report",
    eventLeaderboardDetailedReport: "Event Leaderboard Detailed Report",
    eventParticipantsDetailedReport: "Event Participants Detailed Report",
    eventStatisticsDetailedReport: "Event Statistics Detailed Report",
    eventHighlightsDetailedReport: "Event Highlights Detailed Report",
    eventGalleryDetailedReport: "Event Gallery Detailed Report",
    eventVideoDetailedReport: "Event Video Detailed Report",
    eventPressDetailedReport: "Event Press Detailed Report",
    eventPartnershipsDetailedReport: "Event Partnerships Detailed Report",
    eventSponsorshipDetailedReport: "Event Sponsorship Detailed Report",
    eventVolunteerDetailedReport: "Event Volunteer Detailed Report",
    eventAttendeeDetailedReport: "Event Attendee Detailed Report",
    eventTicketDetailedReport: "Event Ticket Detailed Report",
    eventVenueCustomReport: "Event Venue Custom Report",
    eventMapCustomReport: "Event Map Custom Report",
    eventDirectionsCustomReport: "Event Directions Custom Report",
    eventAccommodationCustomReport: "Event Accommodation Custom Report",
    eventTravelCustomReport: "Event Travel Custom Report",
    eventFAQCustomReport: "Event FAQ Custom Report",
    eventContactCustomReport: "Event Contact Custom Report",
    eventRulesCustomReport: "Event Rules Custom Report",
    eventPrizesCustomReport: "Event Prizes Custom Report",
    eventAwardsCustomReport: "Event Awards Custom Report",
    eventLeaderboardCustomReport: "Event Leaderboard Custom Report",
    eventParticipantsCustomReport: "Event Participants Custom Report",
    eventStatisticsCustomReport: "Event Statistics Custom Report",
    eventHighlightsCustomReport: "Event Highlights Custom Report",
    eventGalleryCustomReport: "Event Gallery Custom Report",
    eventVideoCustomReport: "Event Video Custom Report",
    eventPressCustomReport: "Event Press Custom Report",
    eventPartnershipsCustomReport: "Event Partnerships Custom Report",
    eventSponsorshipCustomReport: "Event Sponsorship Custom Report",
    eventVolunteerCustomReport: "Event Volunteer Custom Report",
    eventAttendeeCustomReport: "Event Attendee Custom Report",
    eventTicketCustomReport: "Event Ticket Custom Report",
  },
};

// Firebase Context zur Bereitstellung von Firebase-Instanzen
const FirebaseContext = createContext(null);

// Custom Hook zur Verwendung von Firebase-Instanzen
const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    // Dies sollte nicht passieren, wenn FirebaseProvider korrekt verwendet wird
    console.error("useFirebase() must be used within a FirebaseProvider");
    return { db: null, auth: null, userId: null, appId: null, isAuthReady: false };
  }
  return context;
};

// FirebaseProvider Komponente
const FirebaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [appId, setAppId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Überprüfe, ob __firebase_config und __app_id global verfügbar sind
        if (typeof __firebase_config === 'undefined' || typeof __app_id === 'undefined') {
          console.error("Firebase-Konfiguration oder App ID nicht verfügbar. Bitte stelle sicher, dass sie im globalen Kontext definiert sind.");
          return;
        }

        const firebaseConfig = JSON.parse(__firebase_config);
        const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestore);
        setAuth(firebaseAuth);
        setAppId(currentAppId);

        // Authentifizierung
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(firebaseAuth, __initial_auth_token);
        } else {
          await signInAnonymously(firebaseAuth);
        }

        // Listener für Authentifizierungsstatusänderungen
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("Firebase initialized and user signed in:", user.uid);
          } else {
            setUserId(null);
            console.log("Firebase initialized, no user signed in.");
          }
          setIsAuthReady(true); // Markiere Authentifizierung als bereit
        });

        return () => unsubscribe(); // Cleanup-Funktion für den Listener
      } catch (error) {
        console.error("Fehler bei der Firebase-Initialisierung oder Authentifizierung:", error);
        setIsAuthReady(true); // Auch bei Fehlern als bereit markieren, um das Rendern zu ermöglichen
      }
    };

    initializeFirebase();
  }, []); // Leeres Array sorgt dafür, dass dies nur einmal beim Mounten ausgeführt wird

  // Zeige einen Ladezustand an, bis Firebase bereit ist
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center">
        <Loader className="animate-spin text-indigo-400 h-16 w-16" />
        <p className="ml-4 text-lg">Lade Firebase-Dienste...</p>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={{ db, auth, userId, appId, isAuthReady }}>
      {children}
    </FirebaseContext.Provider>
  );
};


// Komponente für die Willkommensseite
const WelcomePage = ({ navigateTo, setLanguage, currentLanguage, t }) => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6 text-indigo-400">{t('welcomeTitle')}</h1>
      <div className="mb-8">
        <label htmlFor="language-select" className="block text-lg mb-2">{t('selectLanguage')}</label>
        <select
          id="language-select"
          className="p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={currentLanguage}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
      </div>
      <button
        onClick={() => navigateTo('infoPage')}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105"
      >
        <Info className="inline-block mr-2" size={20} />
        {t('goToInfoPage')}
      </button>
    </div>
  );
};

// Komponente für die Informationsseite
const InfoPage = ({ navigateTo, t }) => {
  return (
    <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400 text-center">{t('infoPageTitle')}</h2>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-3 text-indigo-300">{t('clanName')}</h3>
        <p className="text-gray-300 leading-relaxed">{t('clanDescription')}</p>
      </div>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-3 text-indigo-300">{t('gameName')}</h3>
        <p className="text-gray-300 leading-relaxed">{t('gameDescription')}</p>
      </div>
      <button
        onClick={() => navigateTo('navigation')}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 w-full"
      >
        <Home className="inline-block mr-2" size={20} />
        {t('goToNavigation')}
      </button>
    </div>
  );
};

// Hauptnavigation
const NavigationPage = ({ navigateTo, t }) => {
  return (
    <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400 text-center">{t('navigationTitle')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NavItem icon={<BarChart size={24} />} text={t('currentTotalEvent')} onClick={() => navigateTo('currentTotalEvent')} />
        <NavItem icon={<Archive size={24} />} text={t('eventArchive')} onClick={() => navigateTo('eventArchive')} />
        <NavItem icon={<Users size={24} />} text={t('topTen')} onClick={() => navigateTo('topTen')} />
        <NavItem icon={<Trophy size={24} />} text={t('hallOfChamps')} onClick={() => navigateTo('hallOfChamps')} />
        <NavItem icon={<Mail size={24} />} text={t('contact')} onClick={() => navigateTo('contactForm')} />
        <NavItem icon={<Settings size={24} />} text={t('adminPanel')} onClick={() => navigateTo('adminPanel')} />
      </div>
      <button
        onClick={() => navigateTo('welcome')}
        className="mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 w-full"
      >
        <ChevronLeft className="inline-block mr-2" size={20} />
        {t('backToWelcome')}
      </button>
    </div>
  );
};

// Navigations-Item-Komponente
const NavItem = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center p-4 bg-gray-700 hover:bg-indigo-600 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-white text-lg font-semibold"
  >
    {icon}
    <span className="ml-3">{text}</span>
  </button>
);

// Komponente für die aktuelle Veranstaltungsperiode
const CurrentTotalEventPage = ({ navigateTo, t, db, appId, userId }) => {
  const [activePeriods, setActivePeriods] = useState([]);
  const [currentPeriodId, setCurrentPeriodId] = useState(null);
  const [currentPeriodName, setCurrentPeriodName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [playerList, setPlayerList] = useState([]);
  const [playerReport, setPlayerReport] = useState(null);
  const [selectedEventDay, setSelectedEventDay] = useState(null);
  const [eventDays, setEventDays] = useState([]);
  const [scores, setScores] = useState([]);

  // Funktion zum Abrufen der aktiven Perioden
  const fetchActivePeriods = async () => {
    if (!db || !appId) {
      console.log("Firestore-Instanz oder App ID nicht verfügbar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, `artifacts/${appId}/public/data/eventPeriods`), where("isArchived", "==", false));
      const querySnapshot = await getDocs(q);
      const periods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivePeriods(periods);

      // Versuche, die aktuelle Periode zu finden
      const current = periods.find(p => p.isCurrent);
      if (current) {
        setCurrentPeriodId(current.id);
        setCurrentPeriodName(current.name);
      } else if (periods.length > 0) {
        // Wenn keine als "current" markiert ist, nimm die erste aktive
        setCurrentPeriodId(periods[0].id);
        setCurrentPeriodName(periods[0].name);
        // Optional: Markiere die erste als aktuell in Firestore
        // await setDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods`, periods[0].id), { isCurrent: true }, { merge: true });
      } else {
        setCurrentPeriodId(null);
        setCurrentPeriodName(t('noActivePeriods'));
      }
    } catch (err) {
      console.error("Fehler beim Laden der aktiven Perioden:", err);
      setError(`${t('error')} ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Abrufen der Spielerliste
  const fetchPlayerList = async () => {
    if (!db || !appId) return;
    try {
      const q = query(collection(db, `artifacts/${appId}/public/data/players`));
      const querySnapshot = await getDocs(q);
      const players = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayerList(players);
    } catch (err) {
      console.error("Fehler beim Laden der Spielerliste:", err);
    }
  };

  // Funktion zum Abrufen der Event-Tage für die aktuelle Periode
  const fetchEventDays = async (periodId) => {
    if (!db || !appId || !periodId) return;
    try {
      const q = query(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays`));
      const querySnapshot = await getDocs(q);
      const days = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventDays(days.sort((a, b) => a.dayNumber - b.dayNumber)); // Sortiere nach Tag Nummer
    } catch (err) {
      console.error("Fehler beim Laden der Event-Tage:", err);
    }
  };

  // Funktion zum Abrufen der Spielergebnisse für einen bestimmten Tag
  const fetchScoresForDay = async (periodId, dayId) => {
    if (!db || !appId || !periodId || !dayId) return;
    try {
      const q = query(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays/${dayId}/playerScores`));
      const querySnapshot = await getDocs(q);
      const fetchedScores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Spielerinformationen zu den Scores hinzufügen
      const scoresWithPlayerNames = await Promise.all(fetchedScores.map(async (score) => {
        const player = playerList.find(p => p.id === score.playerId);
        return { ...score, playerName: player ? player.name : 'Unbekannter Spieler' };
      }));
      setScores(scoresWithPlayerNames);
    } catch (err) {
      console.error("Fehler beim Laden der Spielergebnisse:", err);
    }
  };


  useEffect(() => {
    fetchActivePeriods();
    fetchPlayerList();
  }, [db, appId]); // Abhängigkeiten: db und appId

  useEffect(() => {
    if (currentPeriodId) {
      fetchEventDays(currentPeriodId);
    }
  }, [currentPeriodId, db, appId]);

  useEffect(() => {
    if (currentPeriodId && selectedEventDay) {
      fetchScoresForDay(currentPeriodId, selectedEventDay.id);
    }
  }, [currentPeriodId, selectedEventDay, db, appId, playerList]); // playerList als Abhängigkeit hinzufügen

  const handleLoadReport = async () => {
    if (!selectedPlayer || !currentPeriodId) {
      alert(t('noPlayerSelected'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const playerRef = doc(db, `artifacts/${appId}/public/data/players`, selectedPlayer);
      const playerDoc = await getDoc(playerRef);
      if (!playerDoc.exists()) {
        setError(t('playerNotFound'));
        setPlayerReport(null);
        return;
      }
      const playerData = playerDoc.data();

      // Sammle alle Scores für den ausgewählten Spieler in der aktuellen Periode
      const scoresQuery = query(
        collection(db, `artifacts/${appId}/public/data/eventPeriods/${currentPeriodId}/eventDays`),
        // Hier müsste man eigentlich durch alle Tage iterieren und die Scores abrufen.
        // Für eine einfache Demo nehmen wir an, dass wir alle Scores direkt abrufen können,
        // was in Firestore so nicht direkt geht, ohne alle Tage zu kennen.
        // Eine bessere Struktur wäre, Scores direkt unter dem Spieler zu speichern oder eine Subkollektion für Perioden-Scores.
      );

      // Da wir nicht direkt alle Scores eines Spielers über alle Tage einer Periode abfragen können,
      // müssen wir alle Tage abrufen und dann die Scores pro Tag filtern.
      const allDaysSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventPeriods/${currentPeriodId}/eventDays`));
      let totalPlayerScore = 0;
      let playerParticipationCount = 0;
      const playerDetailedScores = [];

      for (const dayDoc of allDaysSnapshot.docs) {
        const dayData = dayDoc.data();
        const scoresSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventPeriods/${currentPeriodId}/eventDays/${dayDoc.id}/playerScores`));
        scoresSnapshot.forEach(scoreDoc => {
          const scoreData = scoreDoc.data();
          if (scoreData.playerId === selectedPlayer) {
            totalPlayerScore += scoreData.score;
            playerParticipationCount++;
            playerDetailedScores.push({
              dayNumber: dayData.dayNumber,
              dayDate: dayData.date,
              score: scoreData.score
            });
          }
        });
      }

      // Ermittle den Rang (sehr einfache Implementierung, nicht optimiert für große Datenmengen)
      const allPlayerScoresInPeriod = {}; // { playerId: totalScore }
      for (const dayDoc of allDaysSnapshot.docs) {
        const scoresSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventPeriods/${currentPeriodId}/eventDays/${dayDoc.id}/playerScores`));
        scoresSnapshot.forEach(scoreDoc => {
          const scoreData = scoreDoc.data();
          allPlayerScoresInPeriod[scoreData.playerId] = (allPlayerScoresInPeriod[scoreData.playerId] || 0) + scoreData.score;
        });
      }

      const sortedPlayers = Object.entries(allPlayerScoresInPeriod).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
      const rank = sortedPlayers.findIndex(([pId,]) => pId === selectedPlayer) + 1;


      setPlayerReport({
        playerName: playerData.name,
        eventPeriodName: currentPeriodName,
        totalScore: totalPlayerScore,
        rank: rank > 0 ? rank : 'N/A', // Zeige N/A, wenn der Spieler nicht gefunden wurde
        participation: playerParticipationCount,
        detailedScores: playerDetailedScores.sort((a, b) => a.dayNumber - b.dayNumber)
      });

    } catch (err) {
      console.error("Fehler beim Laden des Spielerberichts:", err);
      setError(`${t('error')} ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="text-center text-white">
        <Loader className="animate-spin text-indigo-400 h-10 w-10 mx-auto mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400 text-center">{t('currentTotalEvent')}</h2>

      <div className="mb-6">
        <p className="text-lg mb-2"><span className="font-semibold">{t('currentPeriod')}</span> {currentPeriodName}</p>
      </div>

      {/* Spielerbericht-Sektion */}
      <div className="mb-8 p-6 bg-gray-700 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-300">{t('playerReportTitle')}</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <select
            className="p-2 rounded-md bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            <option value="">{t('selectPlayer')}</option>
            {playerList.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
          <button
            onClick={handleLoadReport}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out hover:scale-105 flex-shrink-0"
          >
            <Download className="inline-block mr-2" size={20} />
            {t('loadReport')}
          </button>
        </div>

        {playerReport && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-inner">
            <h4 className="text-xl font-bold mb-3 text-indigo-200">{t('playerReportTitle')} {playerReport.playerName}</h4>
            <p className="text-gray-300 mb-1"><span className="font-semibold">{t('eventPeriod')}</span> {playerReport.eventPeriodName}</p>
            <p className="text-gray-300 mb-1"><span className="font-semibold">{t('totalScore')}</span> {playerReport.totalScore}</p>
            <p className="text-gray-300 mb-1"><span className="font-semibold">{t('rank')}</span> {playerReport.rank}</p>
            <p className="text-gray-300 mb-4"><span className="font-semibold">{t('participation')}</span> {playerReport.participation} {t('days')}</p>

            <h5 className="text-lg font-semibold mb-2 text-indigo-200">{t('details')}:</h5>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-600">
                    <th className="py-2 px-4 text-left text-indigo-100">{t('day')}</th>
                    <th className="py-2 px-4 text-left text-indigo-100">{t('date')}</th>
                    <th className="py-2 px-4 text-left text-indigo-100">{t('score')}</th>
                  </tr>
                </thead>
                <tbody>
                  {playerReport.detailedScores.map((detail, index) => (
                    <tr key={index} className="border-b border-gray-600 last:border-b-0">
                      <td className="py-2 px-4 text-gray-300">{detail.dayNumber}</td>
                      <td className="py-2 px-4 text-gray-300">{detail.dayDate}</td>
                      <td className="py-2 px-4 text-gray-300">{detail.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Weitere Links zu einzelnen Tagen */}
      <div className="mb-8 p-6 bg-gray-700 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-300">{t('furtherLinkIndividualDays')}</h3>
        <select
          className="p-2 rounded-md bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full mb-4"
          value={selectedEventDay ? selectedEventDay.id : ''}
          onChange={(e) => setSelectedEventDay(eventDays.find(day => day.id === e.target.value))}
        >
          <option value="">{t('selectEventDay')}</option>
          {eventDays.map(day => (
            <option key={day.id} value={day.id}>
              {t('day')} {day.dayNumber} ({day.date})
            </option>
          ))}
        </select>

        {selectedEventDay && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-inner">
            <h4 className="text-xl font-bold mb-3 text-indigo-200">{t('eventDetails')}</h4>
            <p className="text-gray-300 mb-1"><span className="font-semibold">{t('eventName')}</span> {currentPeriodName}</p>
            <p className="text-gray-300 mb-1"><span className="font-semibold">{t('day')}</span> {selectedEventDay.dayNumber}</p>
            <p className="text-gray-300 mb-1"><span className="font-semibold">{t('eventDate')}</span> {selectedEventDay.date}</p>
            <p className="text-gray-300 mb-4"><span className="font-semibold">{t('eventDescription')}</span> {selectedEventDay.description}</p>

            <h5 className="text-lg font-semibold mb-2 text-indigo-200">{t('playerScoresForDay')} {selectedEventDay.dayNumber}:</h5>
            {scores.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-600">
                      <th className="py-2 px-4 text-left text-indigo-100">{t('player')}</th>
                      <th className="py-2 px-4 text-left text-indigo-100">{t('points')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map(score => (
                      <tr key={score.id} className="border-b border-gray-600 last:border-b-0">
                        <td className="py-2 px-4 text-gray-300">{score.playerName}</td>
                        <td className="py-2 px-4 text-gray-300">{score.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">{t('noScores')}</p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => navigateTo('navigation')}
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 w-full"
      >
        <ChevronLeft className="inline-block mr-2" size={20} />
        {t('backToNavigation')}
      </button>
    </div>
  );
};


// Komponente für das Veranstaltungsarchiv
const EventArchivePage = ({ navigateTo, t, db, appId, userId, archivedPeriodId }) => {
  const [archivedPeriods, setArchivedPeriods] = useState([]);
  const [selectedArchivedPeriod, setSelectedArchivedPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventDays, setEventDays] = useState([]);
  const [selectedEventDay, setSelectedEventDay] = useState(null);
  const [scores, setScores] = useState([]);
  const [playerList, setPlayerList] = useState([]);

  // Funktion zum Abrufen der archivierten Perioden
  const fetchArchivedPeriods = async () => {
    if (!db || !appId) return;
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, `artifacts/${appId}/public/data/eventPeriods`), where("isArchived", "==", true));
      const querySnapshot = await getDocs(q);
      const periods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArchivedPeriods(periods);

      if (archivedPeriodId) {
        const preSelected = periods.find(p => p.id === archivedPeriodId);
        setSelectedArchivedPeriod(preSelected);
      } else if (periods.length > 0) {
        setSelectedArchivedPeriod(periods[0]); // Wähle die erste archivierte Periode standardmäßig aus
      } else {
        setSelectedArchivedPeriod(null);
      }
    } catch (err) {
      console.error("Fehler beim Laden der archivierten Perioden:", err);
      setError(`${t('error')} ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Abrufen der Spielerliste
  const fetchPlayerList = async () => {
    if (!db || !appId) return;
    try {
      const q = query(collection(db, `artifacts/${appId}/public/data/players`));
      const querySnapshot = await getDocs(q);
      const players = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayerList(players);
    } catch (err) {
      console.error("Fehler beim Laden der Spielerliste:", err);
    }
  };

  // Funktion zum Abrufen der Event-Tage für eine archivierte Periode
  const fetchEventDays = async (periodId) => {
    if (!db || !appId || !periodId) return;
    try {
      const q = query(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays`));
      const querySnapshot = await getDocs(q);
      const days = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventDays(days.sort((a, b) => a.dayNumber - b.dayNumber));
    } catch (err) {
      console.error("Fehler beim Laden der archivierten Event-Tage:", err);
    }
  };

  // Funktion zum Abrufen der Spielergebnisse für einen bestimmten Tag in einer archivierten Periode
  const fetchScoresForDay = async (periodId, dayId) => {
    if (!db || !appId || !periodId || !dayId) return;
    try {
      const q = query(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays/${dayId}/playerScores`));
      const querySnapshot = await getDocs(q);
      const fetchedScores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const scoresWithPlayerNames = await Promise.all(fetchedScores.map(async (score) => {
        const player = playerList.find(p => p.id === score.playerId);
        return { ...score, playerName: player ? player.name : 'Unbekannter Spieler' };
      }));
      setScores(scoresWithPlayerNames);
    } catch (err) {
      console.error("Fehler beim Laden der archivierten Spielergebnisse:", err);
    }
  };

  useEffect(() => {
    fetchArchivedPeriods();
    fetchPlayerList();
  }, [db, appId, archivedPeriodId]);

  useEffect(() => {
    if (selectedArchivedPeriod) {
      fetchEventDays(selectedArchivedPeriod.id);
      setSelectedEventDay(null); // Setze den ausgewählten Tag zurück, wenn die Periode wechselt
      setScores([]); // Setze die Scores zurück
    }
  }, [selectedArchivedPeriod, db, appId]);

  useEffect(() => {
    if (selectedArchivedPeriod && selectedEventDay) {
      fetchScoresForDay(selectedArchivedPeriod.id, selectedEventDay.id);
    }
  }, [selectedArchivedPeriod, selectedEventDay, db, appId, playerList]);

  if (loading) {
    return (
      <div className="text-center text-white">
        <Loader className="animate-spin text-indigo-400 h-10 w-10 mx-auto mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400 text-center">{t('archiveTitle')}</h2>

      <div className="mb-6">
        <label htmlFor="archived-period-select" className="block text-lg mb-2 text-indigo-300">{t('selectPeriod')}</label>
        <select
          id="archived-period-select"
          className="p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          value={selectedArchivedPeriod ? selectedArchivedPeriod.id : ''}
          onChange={(e) => setSelectedArchivedPeriod(archivedPeriods.find(p => p.id === e.target.value))}
        >
          <option value="">{t('selectArchivedPeriod')}</option>
          {archivedPeriods.map(period => (
            <option key={period.id} value={period.id}>{period.name}</option>
          ))}
        </select>
        {archivedPeriods.length === 0 && <p className="text-gray-400 mt-2">{t('noArchivedPeriods')}</p>}
      </div>

      {selectedArchivedPeriod && (
        <div className="mt-8 p-6 bg-gray-700 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-indigo-300">{t('eventDetails')} - {selectedArchivedPeriod.name}</h3>
          <p className="text-gray-300 mb-1"><span className="font-semibold">{t('eventStartDate')}</span> {selectedArchivedPeriod.startDate}</p>
          <p className="text-gray-300 mb-4"><span className="font-semibold">{t('eventEndDate')}</span> {selectedArchivedPeriod.endDate}</p>

          <h4 className="text-xl font-semibold mb-3 text-indigo-200">{t('furtherLinkIndividualDays')}</h4>
          <select
            className="p-2 rounded-md bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full mb-4"
            value={selectedEventDay ? selectedEventDay.id : ''}
            onChange={(e) => setSelectedEventDay(eventDays.find(day => day.id === e.target.value))}
          >
            <option value="">{t('selectArchivedEventDay')}</option>
            {eventDays.map(day => (
              <option key={day.id} value={day.id}>
                {t('day')} {day.dayNumber} ({day.date})
              </option>
            ))}
          </select>

          {selectedEventDay && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-inner">
              <h5 className="text-lg font-bold mb-3 text-indigo-200">{t('eventDetails')}</h5>
              <p className="text-gray-300 mb-1"><span className="font-semibold">{t('day')}</span> {selectedEventDay.dayNumber}</p>
              <p className="text-gray-300 mb-1"><span className="font-semibold">{t('eventDate')}</span> {selectedEventDay.date}</p>
              <p className="text-gray-300 mb-4"><span className="font-semibold">{t('eventDescription')}</span> {selectedEventDay.description}</p>

              <h5 className="text-lg font-semibold mb-2 text-indigo-200">{t('playerScoresForDay')} {selectedEventDay.dayNumber}:</h5>
              {scores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-600">
                        <th className="py-2 px-4 text-left text-indigo-100">{t('player')}</th>
                        <th className="py-2 px-4 text-left text-indigo-100">{t('points')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map(score => (
                        <tr key={score.id} className="border-b border-gray-600 last:border-b-0">
                          <td className="py-2 px-4 text-gray-300">{score.playerName}</td>
                          <td className="py-2 px-4 text-gray-300">{score.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">{t('noScores')}</p>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => navigateTo('navigation')}
        className="mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 w-full"
      >
        <ChevronLeft className="inline-block mr-2" size={20} />
        {t('backToNavigation')}
      </button>
    </div>
  );
};

// Komponente für die Top 10 Spieler
const TopTenPage = ({ navigateTo, t, db, appId, userId }) => {
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPeriodId, setCurrentPeriodId] = useState(null);
  const [currentPeriodName, setCurrentPeriodName] = useState('');
  const [playerList, setPlayerList] = useState([]);

  useEffect(() => {
    const fetchCurrentPeriod = async () => {
      if (!db || !appId) return;
      try {
        const q = query(collection(db, `artifacts/${appId}/public/data/eventPeriods`), where("isCurrent", "==", true));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const current = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
          setCurrentPeriodId(current.id);
          setCurrentPeriodName(current.name);
        } else {
          setCurrentPeriodId(null);
          setCurrentPeriodName(t('noActivePeriods'));
        }
      } catch (err) {
        console.error("Fehler beim Laden der aktuellen Periode:", err);
        setError(`${t('error')} ${err.message}`);
      }
    };

    const fetchPlayerList = async () => {
      if (!db || !appId) return;
      try {
        const q = query(collection(db, `artifacts/${appId}/public/data/players`));
        const querySnapshot = await getDocs(q);
        const players = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayerList(players);
      } catch (err) {
        console.error("Fehler beim Laden der Spielerliste:", err);
      }
    };

    fetchCurrentPeriod();
    fetchPlayerList();
  }, [db, appId]);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      if (!db || !appId || !currentPeriodId || playerList.length === 0) {
        if (currentPeriodId === null && currentPeriodName !== t('noActivePeriods')) {
          // Still loading current period, or no active periods found yet
          setLoading(true);
        } else if (currentPeriodId === null && currentPeriodName === t('noActivePeriods')) {
          // No active periods, so no top players to show
          setLoading(false);
          setTopPlayers([]);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const allDaysSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventPeriods/${currentPeriodId}/eventDays`));
        const playerScores = {}; // { playerId: totalScore }

        for (const dayDoc of allDaysSnapshot.docs) {
          const scoresSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventPeriods/${currentPeriodId}/eventDays/${dayDoc.id}/playerScores`));
          scoresSnapshot.forEach(scoreDoc => {
            const scoreData = scoreDoc.data();
            playerScores[scoreData.playerId] = (playerScores[scoreData.playerId] || 0) + scoreData.score;
          });
        }

        const rankedPlayers = Object.entries(playerScores)
          .map(([playerId, totalScore]) => {
            const player = playerList.find(p => p.id === playerId);
            return {
              id: playerId,
              name: player ? player.name : 'Unbekannter Spieler',
              totalScore: totalScore
            };
          })
          .sort((a, b) => b.totalScore - a.totalScore)
          .slice(0, 10); // Nur die Top 10

        setTopPlayers(rankedPlayers);
      } catch (err) {
        console.error("Fehler beim Laden der Top-Spieler:", err);
        setError(`${t('error')} ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlayers();
  }, [db, appId, currentPeriodId, playerList, t, currentPeriodName]); // Abhängigkeiten aktualisiert

  if (loading) {
    return (
      <div className="text-center text-white">
        <Loader className="animate-spin text-indigo-400 h-10 w-10 mx-auto mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400 text-center">{t('topTenTitle')}</h2>
      <p className="text-lg mb-4 text-center text-indigo-300">
        {t('currentPeriod')} {currentPeriodName}
      </p>

      {topPlayers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-600">
                <th className="py-3 px-4 text-left text-indigo-100 text-lg">{t('rank')}</th>
                <th className="py-3 px-4 text-left text-indigo-100 text-lg">{t('player')}</th>
                <th className="py-3 px-4 text-left text-indigo-100 text-lg">{t('totalScore')}</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((player, index) => (
                <tr key={player.id} className="border-b border-gray-600 last:border-b-0">
                  <td className="py-3 px-4 text-gray-300 text-lg font-semibold flex items-center">
                    {index === 0 && <Crown className="text-yellow-400 mr-2" size={24} />}
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-lg">{player.name}</td>
                  <td className="py-3 px-4 text-gray-300 text-lg">{player.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 text-center">{t('noData')}</p>
      )}

      <button
        onClick={() => navigateTo('navigation')}
        className="mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 w-full"
      >
        <ChevronLeft className="inline-block mr-2" size={20} />
        {t('backToNavigation')}
      </button>
    </div>
  );
};

// Komponente für die Ruhmeshalle der Champions
const HallOfChampsPage = ({ navigateTo, t, db, appId, userId }) => {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerList, setPlayerList] = useState([]);

  useEffect(() => {
    const fetchPlayerList = async () => {
      if (!db || !appId) return;
      try {
        const q = query(collection(db, `artifacts/${appId}/public/data/players`));
        const querySnapshot = await getDocs(q);
        const players = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayerList(players);
      } catch (err) {
        console.error("Fehler beim Laden der Spielerliste:", err);
      }
    };

    fetchPlayerList();
  }, [db, appId]);

  useEffect(() => {
    const fetchChampions = async () => {
      if (!db || !appId || playerList.length === 0) return;
      setLoading(true);
      setError(null);
      try {
        // Sammle alle Event-Perioden
        const periodsSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventPeriods`));
        const allPlayerScores = {}; // { playerId: totalScoreAcrossAllPeriods }

        for (const periodDoc of periodsSnapshot.docs) {
          const eventDaysSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodDoc.id}/eventDays`));
          for (const dayDoc of eventDaysSnapshot.docs) {
            const scoresSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodDoc.id}/eventDays/${dayDoc.id}/playerScores`));
            scoresSnapshot.forEach(scoreDoc => {
              const scoreData = scoreDoc.data();
              allPlayerScores[scoreData.playerId] = (allPlayerScores[scoreData.playerId] || 0) + scoreData.score;
            });
          }
        }

        const rankedPlayers = Object.entries(allPlayerScores)
          .map(([playerId, totalScore]) => {
            const player = playerList.find(p => p.id === playerId);
            return {
              id: playerId,
              name: player ? player.name : 'Unbekannter Spieler',
              overallScore: totalScore
            };
          })
          .sort((a, b) => b.overallScore - a.overallScore);

        setChampions(rankedPlayers);
      } catch (err) {
        console.error("Fehler beim Laden der Champions:", err);
        setError(`${t('error')} ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchChampions();
  }, [db, appId, playerList, t]);

  if (loading) {
    return (
      <div className="text-center text-white">
        <Loader className="animate-spin text-indigo-400 h-10 w-10 mx-auto mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400 text-center">{t('hallOfChampsTitle')}</h2>

      {champions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-600">
                <th className="py-3 px-4 text-left text-indigo-100 text-lg">{t('overallRank')}</th>
                <th className="py-3 px-4 text-left text-indigo-100 text-lg">{t('player')}</th>
                <th className="py-3 px-4 text-left text-indigo-100 text-lg">{t('overallScore')}</th>
              </tr>
            </thead>
            <tbody>
              {champions.map((player, index) => (
                <tr key={player.id} className="border-b border-gray-600 last:border-b-0">
                  <td className="py-3 px-4 text-gray-300 text-lg font-semibold flex items-center">
                    {index === 0 && <Crown className="text-yellow-400 mr-2" size={24} />}
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-lg">{player.name}</td>
                  <td className="py-3 px-4 text-gray-300 text-lg">{player.overallScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 text-center">{t('noData')}</p>
      )}

      <button
        onClick={() => navigateTo('navigation')}
        className="mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 w-full"
      >
        <ChevronLeft className="inline-block mr-2" size={20} />
        {t('backToNavigation')}
      </button>
    </div>
  );
};

// Komponente für das Kontaktformular
const ContactFormPage = ({ navigateTo, t }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(''); // 'idle', 'sending', 'sent', 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    // Hier würde die Logik zum Senden der Nachricht an ein Backend/eine E-Mail-Adresse stehen.
    // Da dies eine Frontend-Anwendung ist, simulieren wir den Erfolg.
    try {
      // Eine kleine Verzögerung, um das Senden zu simulieren
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400 text-center">{t('contactTitle')}</h2>
      <p className="text-gray-300 mb-6 text-center">{t('contactText')}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-indigo-300 text-sm font-bold mb-2">
            {t('yourName')}
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-indigo-300 text-sm font-bold mb-2">
            {t('yourEmail')}
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-indigo-300 text-sm font-bold mb-2">
            {t('yourMessage')}
          </label>
          <textarea
            id="message"
            rows="6"
            className="shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 w-full flex items-center justify-center"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? (
            <>
              <Loader className="animate-spin mr-2" size={20} /> {t('sending')}...
            </>
          ) : (
            <>
              <Mail className="inline-block mr-2" size={20} /> {t('sendMessage')}
            </>
          )}
        </button>
      </form>

      {status === 'sent' && (
        <div className="mt-6 p-4 bg-green-600 text-white rounded-lg text-center flex items-center justify-center">
          <CheckCircle className="mr-2" size={20} /> {t('messageSent')}
        </div>
      )}
      {status === 'error' && (
        <div className="mt-6 p-4 bg-red-600 text-white rounded-lg text-center flex items-center justify-center">
          <XCircle className="mr-2" size={20} /> {t('error')} {t('tryAgain')}
        </div>
      )}

      <button
        onClick={() => navigateTo('navigation')}
        className="mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 w-full"
      >
        <ChevronLeft className="inline-block mr-2" size={20} />
        {t('backToNavigation')}
      </button>
    </div>
  );
};

// Admin Panel Komponente
const AdminPanel = ({ navigateTo, t, setErrorMessage, errorMessage, db, appId, userId }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('playerManagement'); // Standard-Tab
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [messageStatus, setMessageStatus] = useState(''); // 'success', 'error', ''

  // Überprüfen, ob der aktuelle Benutzer ein Admin ist
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!db || !appId || !userId) {
        setLoading(false);
        setIsAdmin(false);
        setErrorMessage(t('loginRequired'));
        return;
      }
      try {
        const adminDocRef = doc(db, `artifacts/${appId}/public/data/admins`, userId);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          setIsAdmin(true);
          setErrorMessage('');
        } else {
          setIsAdmin(false);
          setErrorMessage(t('accessDenied'));
        }
      } catch (err) {
        console.error("Fehler beim Überprüfen des Admin-Status:", err);
        setErrorMessage(`${t('error')} ${err.message}`);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [db, appId, userId, t, setErrorMessage]);

  const showModal = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action); // Speichere die Funktion, die ausgeführt werden soll
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const showStatusMessage = (type, message) => {
    setMessageStatus({ type, message });
    setTimeout(() => setMessageStatus(''), 3000); // Nachricht nach 3 Sekunden ausblenden
  };

  if (loading) {
    return (
      <div className="text-center text-white">
        <Loader className="animate-spin text-indigo-400 h-10 w-10 mx-auto mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl text-center">
        <AlertCircle className="text-red-500 h-16 w-16 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4 text-red-400">{t('accessDenied')}</h2>
        <p className="text-gray-300 mb-6">{errorMessage}</p>
        <button
          onClick={() => navigateTo('navigation')}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 w-full"
        >
          <ChevronLeft className="inline-block mr-2" size={20} />
          {t('backToNavigation')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400 text-center">{t('adminPanelTitle')}</h2>

      {errorMessage && (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-4 flex items-center justify-center">
          <AlertCircle className="mr-2" size={20} />
          {errorMessage}
        </div>
      )}

      {messageStatus.message && (
        <div className={`p-3 rounded-lg mb-4 flex items-center justify-center ${messageStatus.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {messageStatus.type === 'success' ? <CheckCircle className="mr-2" size={20} /> : <XCircle className="mr-2" size={20} />}
          {messageStatus.message}
        </div>
      )}

      {/* Admin User ID anzeigen */}
      <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between">
        <p className="text-indigo-300 font-semibold mb-2 sm:mb-0">{t('userId')}</p>
        <div className="flex items-center">
          <span className="bg-gray-600 text-gray-200 px-3 py-1 rounded-md text-sm break-all">{userId}</span>
          <button
            onClick={() => {
              document.execCommand('copy', false, userId); // Veraltet, aber funktioniert in iFrames
              showStatusMessage('success', t('copied'));
            }}
            className="ml-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md text-sm transition duration-200"
          >
            <ClipboardCopy size={16} className="inline-block mr-1" /> {t('copyToClipboard')}
          </button>
        </div>
      </div>


      {/* Tabs für die Navigation innerhalb des Admin-Panels */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('playerManagement')}
          className={`py-3 px-6 rounded-lg font-bold transition duration-300 ${activeTab === 'playerManagement' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          <Users className="inline-block mr-2" size={20} /> {t('managePlayers')}
        </button>
        <button
          onClick={() => setActiveTab('eventPeriodManagement')}
          className={`py-3 px-6 rounded-lg font-bold transition duration-300 ${activeTab === 'eventPeriodManagement' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          <Calendar className="inline-block mr-2" size={20} /> {t('manageEvents')}
        </button>
        <button
          onClick={() => setActiveTab('adminManagement')}
          className={`py-3 px-6 rounded-lg font-bold transition duration-300 ${activeTab === 'adminManagement' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          <Crown className="inline-block mr-2" size={20} /> {t('manageAdmins')}
        </button>
        <button
          onClick={() => setActiveTab('adminMessages')}
          className={`py-3 px-6 rounded-lg font-bold transition duration-300 ${activeTab === 'adminMessages' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          <MessageCircle className="inline-block mr-2" size={20} /> {t('adminMessages')}
        </button>
      </div>

      {/* Inhalt basierend auf dem aktiven Tab */}
      {activeTab === 'playerManagement' && <PlayerManagement t={t} db={db} appId={appId} showModal={showModal} showStatusMessage={showStatusMessage} />}
      {activeTab === 'eventPeriodManagement' && <EventPeriodManagement t={t} db={db} appId={appId} showModal={showModal} showStatusMessage={showStatusMessage} />}
      {activeTab === 'adminManagement' && <AdminManagement t={t} db={db} appId={appId} userId={userId} showModal={showModal} showStatusMessage={showStatusMessage} />}
      {activeTab === 'adminMessages' && <AdminMessageManagement t={t} db={db} appId={appId} showModal={showModal} showStatusMessage={showStatusMessage} />}


      <button
        onClick={() => navigateTo('navigation')}
        className="mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 w-full"
      >
        <ChevronLeft className="inline-block mr-2" size={20} />
        {t('backToNavigation')}
      </button>

      {/* Bestätigungs-Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <AlertCircle className="text-yellow-400 h-16 w-16 mx-auto mb-4" />
            <p className="text-white text-lg mb-6">{confirmMessage}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-300"
              >
                {t('confirm')}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-300"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Komponenten für das Admin-Panel ---

// Spielerverwaltung
const PlayerManagement = ({ t, db, appId, showModal, showStatusMessage }) => {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerDiscord, setNewPlayerDiscord] = useState('');
  const [newPlayerGameId, setNewPlayerGameId] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null); // Spieler, der gerade bearbeitet wird
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = () => {
      if (!db || !appId) return;
      setLoading(true);
      const q = query(collection(db, `artifacts/${appId}/public/data/players`));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(playersData);
        setLoading(false);
      }, (err) => {
        console.error("Fehler beim Laden der Spieler:", err);
        setError(`${t('error')} ${err.message}`);
        setLoading(false);
      });
      return () => unsubscribe();
    };
    fetchPlayers();
  }, [db, appId, t]);

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      showStatusMessage('error', t('playerNameRequired')); // Annahme: Du hast diesen Schlüssel in deinen Übersetzungen
      return;
    }
    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/players`), {
        name: newPlayerName.trim(),
        discordId: newPlayerDiscord.trim(),
        gameId: newPlayerGameId.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewPlayerName('');
      setNewPlayerDiscord('');
      setNewPlayerGameId('');
      showStatusMessage('success', t('playerAddedSuccess'));
    } catch (err) {
      console.error("Fehler beim Hinzufügen des Spielers:", err);
      showStatusMessage('error', `${t('error')} ${err.message}`);
    }
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer({ ...player });
    setNewPlayerName(player.name);
    setNewPlayerDiscord(player.discordId || '');
    setNewPlayerGameId(player.gameId || '');
  };

  const handleUpdatePlayer = async () => {
    if (!editingPlayer || !newPlayerName.trim()) {
      showStatusMessage('error', t('playerNameRequired'));
      return;
    }
    try {
      await setDoc(doc(db, `artifacts/${appId}/public/data/players`, editingPlayer.id), {
        name: newPlayerName.trim(),
        discordId: newPlayerDiscord.trim(),
        gameId: newPlayerGameId.trim(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setEditingPlayer(null);
      setNewPlayerName('');
      setNewPlayerDiscord('');
      setNewPlayerGameId('');
      showStatusMessage('success', t('playerUpdatedSuccess'));
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Spielers:", err);
      showStatusMessage('error', `${t('error')} ${err.message}`);
    }
  };

  const handleDeletePlayer = (playerId) => {
    showModal(t('confirmDeletePlayer'), async () => {
      try {
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/players`, playerId));
        showStatusMessage('success', t('playerDeletedSuccess'));
      } catch (err) {
        console.error("Fehler beim Löschen des Spielers:", err);
        showStatusMessage('error', `${t('error')} ${err.message}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center text-white">
        <Loader className="animate-spin text-indigo-400 h-10 w-10 mx-auto mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-2xl font-bold mb-4 text-indigo-300">{t('playerManagement')}</h3>

      {/* Spieler hinzufügen/bearbeiten Formular */}
      <div className="mb-6 p-4 bg-gray-600 rounded-lg">
        <h4 className="text-xl font-semibold mb-3 text-indigo-200">
          {editingPlayer ? t('editPlayer') : t('addPlayer')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="playerName" className="block text-gray-300 text-sm font-bold mb-1">{t('playerName')}</label>
            <input
              type="text"
              id="playerName"
              className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder={t('playerName')}
            />
          </div>
          <div>
            <label htmlFor="playerDiscord" className="block text-gray-300 text-sm font-bold mb-1">{t('playerDiscord')}</label>
            <input
              type="text"
              id="playerDiscord"
              className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newPlayerDiscord}
              onChange={(e) => setNewPlayerDiscord(e.target.value)}
              placeholder={t('playerDiscord')}
            />
          </div>
          <div>
            <label htmlFor="playerGameId" className="block text-gray-300 text-sm font-bold mb-1">{t('playerGameId')}</label>
            <input
              type="text"
              id="playerGameId"
              className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newPlayerGameId}
              onChange={(e) => setNewPlayerGameId(e.target.value)}
              placeholder={t('playerGameId')}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {editingPlayer ? (
            <>
              <button
                onClick={handleUpdatePlayer}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 flex-grow"
              >
                <Save className="inline-block mr-2" size={20} /> {t('update')}
              </button>
              <button
                onClick={() => {
                  setEditingPlayer(null);
                  setNewPlayerName('');
                  setNewPlayerDiscord('');
                  setNewPlayerGameId('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
              >
                <XCircle className="inline-block mr-2" size={20} /> {t('cancel')}
              </button>
            </>
          ) : (
            <button
              onClick={handleAddPlayer}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 w-full"
            >
              <PlusCircle className="inline-block mr-2" size={20} /> {t('addPlayer')}
            </button>
          )}
        </div>
      </div>

      {/* Spielerliste */}
      <h4 className="text-xl font-semibold mb-3 text-indigo-200">{t('playerList')}</h4>
      {players.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-600 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-500">
                <th className="py-2 px-4 text-left text-indigo-100">{t('playerName')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('playerDiscord')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('playerGameId')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="border-b border-gray-500 last:border-b-0">
                  <td className="py-2 px-4 text-gray-200">{player.name}</td>
                  <td className="py-2 px-4 text-gray-200">{player.discordId || '-'}</td>
                  <td className="py-2 px-4 text-gray-200">{player.gameId || '-'}</td>
                  <td className="py-2 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPlayer(player)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition duration-200"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition duration-200"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">{t('noPlayers')}</p>
      )}
    </div>
  );
};

// Veranstaltungsperioden-Verwaltung
const EventPeriodManagement = ({ t, db, appId, showModal, showStatusMessage }) => {
  const [eventPeriods, setEventPeriods] = useState([]);
  const [newEventPeriodName, setNewEventPeriodName] = useState('');
  const [newEventPeriodStartDate, setNewEventPeriodStartDate] = useState('');
  const [newEventPeriodEndDate, setNewEventPeriodEndDate] = useState('');
  const [editingEventPeriod, setEditingEventPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriodForDays, setSelectedPeriodForDays] = useState(null); // Für die Verwaltung der Tage
  const [selectedDayForScores, setSelectedDayForScores] = useState(null); // Für die Verwaltung der Scores

  useEffect(() => {
    const fetchEventPeriods = () => {
      if (!db || !appId) return;
      setLoading(true);
      const q = query(collection(db, `artifacts/${appId}/public/data/eventPeriods`));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const periodsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEventPeriods(periodsData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
        setLoading(false);
      }, (err) => {
        console.error("Fehler beim Laden der Veranstaltungsperioden:", err);
        setError(`${t('error')} ${err.message}`);
        setLoading(false);
      });
      return () => unsubscribe();
    };
    fetchEventPeriods();
  }, [db, appId, t]);

  const handleAddEventPeriod = async () => {
    if (!newEventPeriodName.trim() || !newEventPeriodStartDate || !newEventPeriodEndDate) {
      showStatusMessage('error', 'Bitte fülle alle Felder aus.'); // Annahme: Übersetzter Text
      return;
    }
    try {
      // Setze alle anderen Perioden auf isCurrent: false, wenn diese auf isCurrent: true gesetzt wird
      const existingCurrent = eventPeriods.find(p => p.isCurrent);
      if (existingCurrent) {
        await updateDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods`, existingCurrent.id), { isCurrent: false });
      }

      await addDoc(collection(db, `artifacts/${appId}/public/data/eventPeriods`), {
        name: newEventPeriodName.trim(),
        startDate: newEventPeriodStartDate,
        endDate: newEventPeriodEndDate,
        isArchived: false,
        isCurrent: true, // Neue Perioden sind standardmäßig aktuell
        createdAt: new Date().toISOString(),
      });
      setNewEventPeriodName('');
      setNewEventPeriodStartDate('');
      setNewEventPeriodEndDate('');
      showStatusMessage('success', t('eventAddedSuccess'));
    } catch (err) {
      console.error("Fehler beim Hinzufügen der Veranstaltungsperiode:", err);
      showStatusMessage('error', `${t('error')} ${err.message}`);
    }
  };

  const handleEditEventPeriod = (period) => {
    setEditingEventPeriod({ ...period });
    setNewEventPeriodName(period.name);
    setNewEventPeriodStartDate(period.startDate);
    setNewEventPeriodEndDate(period.endDate);
  };

  const handleUpdateEventPeriod = async () => {
    if (!editingEventPeriod || !newEventPeriodName.trim() || !newEventPeriodStartDate || !newEventPeriodEndDate) {
      showStatusMessage('error', 'Bitte fülle alle Felder aus.');
      return;
    }
    try {
      await setDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods`, editingEventPeriod.id), {
        name: newEventPeriodName.trim(),
        startDate: newEventPeriodStartDate,
        endDate: newEventPeriodEndDate,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setEditingEventPeriod(null);
      setNewEventPeriodName('');
      setNewEventPeriodStartDate('');
      setNewEventPeriodEndDate('');
      showStatusMessage('success', t('eventUpdatedSuccess'));
    } catch (err) {
      console.error("Fehler beim Aktualisieren der Veranstaltungsperiode:", err);
      showStatusMessage('error', `${t('error')} ${err.message}`);
    }
  };

  const handleDeleteEventPeriod = (periodId) => {
    showModal(t('confirmDeleteEvent'), async () => {
      try {
        // Lösche auch alle Unterkollektionen (eventDays, playerScores)
        const daysSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays`));
        for (const dayDoc of daysSnapshot.docs) {
          const scoresSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays/${dayDoc.id}/playerScores`));
          for (const scoreDoc of scoresSnapshot.docs) {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays/${dayDoc.id}/playerScores`, scoreDoc.id));
          }
          await deleteDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays`, dayDoc.id));
        }
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods`, periodId));
        showStatusMessage('success', t('eventDeletedSuccess'));
      } catch (err) {
        console.error("Fehler beim Löschen der Veranstaltungsperiode:", err);
        showStatusMessage('error', `${t('error')} ${err.message}`);
      }
    });
  };

  const handleArchivePeriod = (periodId, isArchived) => {
    showModal(isArchived ? t('confirmUnarchivePeriod') : t('confirmArchivePeriod'), async () => {
      try {
        await updateDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods`, periodId), { isArchived: !isArchived });
        showStatusMessage('success', isArchived ? t('periodUnarchivedSuccess') : t('periodArchivedSuccess'));
      } catch (err) {
        console.error("Fehler beim Archivieren/Dearchivieren der Periode:", err);
        showStatusMessage('error', `${t('error')} ${err.message}`);
      }
    });
  };

  const handleSetCurrentPeriod = (periodId) => {
    showModal(t('confirmSetCurrent'), async () => {
      try {
        // Setze alle anderen Perioden auf isCurrent: false
        const batch = db.batch();
        for (const period of eventPeriods) {
          if (period.isCurrent) {
            batch.update(doc(db, `artifacts/${appId}/public/data/eventPeriods`, period.id), { isCurrent: false });
          }
        }
        // Setze die ausgewählte Periode auf isCurrent: true und isArchived: false
        batch.update(doc(db, `artifacts/${appId}/public/data/eventPeriods`, periodId), { isCurrent: true, isArchived: false });
        await batch.commit();
        showStatusMessage('success', t('setCurrentSuccess'));
      } catch (err) {
        console.error("Fehler beim Festlegen der aktuellen Periode:", err);
        showStatusMessage('error', `${t('error')} ${err.message}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center text-white">
        <Loader className="animate-spin text-indigo-400 h-10 w-10 mx-auto mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-2xl font-bold mb-4 text-indigo-300">{t('eventPeriodManagement')}</h3>

      {/* Veranstaltungsperiode hinzufügen/bearbeiten Formular */}
      <div className="mb-6 p-4 bg-gray-600 rounded-lg">
        <h4 className="text-xl font-semibold mb-3 text-indigo-200">
          {editingEventPeriod ? t('editEvent') : t('addEventPeriod')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="periodName" className="block text-gray-300 text-sm font-bold mb-1">{t('eventPeriodName')}</label>
            <input
              type="text"
              id="periodName"
              className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newEventPeriodName}
              onChange={(e) => setNewEventPeriodName(e.target.value)}
              placeholder={t('eventPeriodName')}
            />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-gray-300 text-sm font-bold mb-1">{t('eventStartDate')}</label>
            <input
              type="date"
              id="startDate"
              className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newEventPeriodStartDate}
              onChange={(e) => setNewEventPeriodStartDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-gray-300 text-sm font-bold mb-1">{t('eventEndDate')}</label>
            <input
              type="date"
              id="endDate"
              className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newEventPeriodEndDate}
              onChange={(e) => setNewEventPeriodEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {editingEventPeriod ? (
            <>
              <button
                onClick={handleUpdateEventPeriod}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 flex-grow"
              >
                <Save className="inline-block mr-2" size={20} /> {t('update')}
              </button>
              <button
                onClick={() => {
                  setEditingEventPeriod(null);
                  setNewEventPeriodName('');
                  setNewEventPeriodStartDate('');
                  setNewEventPeriodEndDate('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
              >
                <XCircle className="inline-block mr-2" size={20} /> {t('cancel')}
              </button>
            </>
          ) : (
            <button
              onClick={handleAddEventPeriod}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 w-full"
            >
              <PlusCircle className="inline-block mr-2" size={20} /> {t('addEventPeriod')}
            </button>
          )}
        </div>
      </div>

      {/* Liste der Veranstaltungsperioden */}
      <h4 className="text-xl font-semibold mb-3 text-indigo-200">{t('eventPeriods')}</h4>
      {eventPeriods.length > 0 ? (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-gray-600 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-500">
                <th className="py-2 px-4 text-left text-indigo-100">{t('name')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('eventStartDate')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('eventEndDate')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('status')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {eventPeriods.map(period => (
                <tr key={period.id} className="border-b border-gray-500 last:border-b-0">
                  <td className="py-2 px-4 text-gray-200">{period.name}</td>
                  <td className="py-2 px-4 text-gray-200">{period.startDate}</td>
                  <td className="py-2 px-4 text-gray-200">{period.endDate}</td>
                  <td className="py-2 px-4 text-gray-200">
                    {period.isCurrent ? <span className="text-green-400 font-semibold">{t('periodStatusActive')}</span> :
                      period.isArchived ? <span className="text-yellow-400 font-semibold">{t('periodStatusArchived')}</span> :
                        <span className="text-gray-400">{t('inactive')}</span>}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditEventPeriod(period)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition duration-200"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteEventPeriod(period.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition duration-200"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => handleArchivePeriod(period.id, period.isArchived)}
                        className={`p-2 rounded-md transition duration-200 ${period.isArchived ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-orange-600 hover:bg-orange-700'} text-white`}
                      >
                        {period.isArchived ? <Archive size={18} /> : <Archive size={18} />}
                      </button>
                      {!period.isCurrent && !period.isArchived && (
                        <button
                          onClick={() => handleSetCurrentPeriod(period.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md transition duration-200"
                          title={t('setAsCurrent')}
                        >
                          <Target size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">{t('noData')}</p>
      )}

      {/* Auswahl für Tage und Scores */}
      <div className="mb-6">
        <label htmlFor="selectPeriodForDays" className="block text-lg mb-2 text-indigo-300">{t('selectPeriod')}:</label>
        <select
          id="selectPeriodForDays"
          className="p-2 rounded-md bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          value={selectedPeriodForDays ? selectedPeriodForDays.id : ''}
          onChange={(e) => setSelectedPeriodForDays(eventPeriods.find(p => p.id === e.target.value))}
        >
          <option value="">{t('selectPeriod')}</option>
          {eventPeriods.map(period => (
            <option key={period.id} value={period.id}>{period.name} ({period.isCurrent ? t('periodStatusActive') : period.isArchived ? t('periodStatusArchived') : t('inactive')})</option>
          ))}
        </select>
      </div>

      {selectedPeriodForDays && (
        <>
          <EventDayManagement t={t} db={db} appId={appId} periodId={selectedPeriodForDays.id} periodName={selectedPeriodForDays.name} showModal={showModal} showStatusMessage={showStatusMessage} setSelectedDayForScores={setSelectedDayForScores} />
          {selectedDayForScores && (
            <PlayerScoreManagement t={t} db={db} appId={appId} periodId={selectedPeriodForDays.id} dayId={selectedDayForScores.id} dayNumber={selectedDayForScores.dayNumber} showModal={showModal} showStatusMessage={showStatusMessage} />
          )}
        </>
      )}
    </div>
  );
};

// Event-Tag-Verwaltung
const EventDayManagement = ({ t, db, appId, periodId, periodName, showModal, showStatusMessage, setSelectedDayForScores }) => {
  const [eventDays, setEventDays] = useState([]);
  const [newDayNumber, setNewDayNumber] = useState('');
  const [newDayDate, setNewDayDate] = useState('');
  const [newDayDescription, setNewDayDescription] = useState('');
  const [editingDay, setEditingDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !appId || !periodId) return;
    setLoading(true);
    const q = query(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const daysData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventDays(daysData.sort((a, b) => a.dayNumber - b.dayNumber));
      setLoading(false);
    }, (err) => {
      console.error("Fehler beim Laden der Event-Tage:", err);
      setError(`${t('error')} ${err.message}`);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db, appId, periodId, t]);

  const handleAddDay = async () => {
    if (!newDayNumber || !newDayDate.trim()) {
      showStatusMessage('error', 'Bitte gib Tag Nummer und Datum ein.');
      return;
    }
    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays`), {
        dayNumber: parseInt(newDayNumber),
        date: newDayDate.trim(),
        description: newDayDescription.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewDayNumber('');
      setNewDayDate('');
      setNewDayDescription('');
      showStatusMessage('success', t('dayAddedSuccess'));
    } catch (err) {
      console.error("Fehler beim Hinzufügen des Tages:", err);
      showStatusMessage('error', `${t('error')} ${err.message}`);
    }
  };

  const handleEditDay = (day) => {
    setEditingDay({ ...day });
    setNewDayNumber(day.dayNumber);
    setNewDayDate(day.date);
    setNewDayDescription(day.description || '');
  };

  const handleUpdateDay = async () => {
    if (!editingDay || !newDayNumber || !newDayDate.trim()) {
      showStatusMessage('error', 'Bitte gib Tag Nummer und Datum ein.');
      return;
    }
    try {
      await setDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays`, editingDay.id), {
        dayNumber: parseInt(newDayNumber),
        date: newDayDate.trim(),
        description: newDayDescription.trim(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setEditingDay(null);
      setNewDayNumber('');
      setNewDayDate('');
      setNewDayDescription('');
      showStatusMessage('success', t('dayUpdatedSuccess'));
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Tages:", err);
      showStatusMessage('error', `${t('error')} ${err.message}`);
    }
  };

  const handleDeleteDay = (dayId) => {
    showModal(t('confirmDeleteDay'), async () => {
      try {
        // Lösche auch alle Unterkollektionen (playerScores)
        const scoresSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays/${dayId}/playerScores`));
        for (const scoreDoc of scoresSnapshot.docs) {
          await deleteDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays/${dayId}/playerScores`, scoreDoc.id));
        }
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays`, dayId));
        showStatusMessage('success', t('dayDeletedSuccess'));
      } catch (err) {
        console.error("Fehler beim Löschen des Tages:", err);
        showStatusMessage('error', `${t('error')} ${err.message}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center text-white">
        <Loader className="animate-spin text-indigo-400 h-10 w-10 mx-auto mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-2xl font-bold mb-4 text-indigo-300">{t('manageEventDays')} für {periodName}</h3>

      {/* Tag hinzufügen/bearbeiten Formular */}
      <div className="mb-6 p-4 bg-gray-600 rounded-lg">
        <h4 className="text-xl font-semibold mb-3 text-indigo-200">
          {editingDay ? t('editDay') : t('addEventDay')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dayNumber" className="block text-gray-300 text-sm font-bold mb-1">{t('dayNumber')}</label>
            <input
              type="number"
              id="dayNumber"
              className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newDayNumber}
              onChange={(e) => setNewDayNumber(e.target.value)}
              placeholder={t('dayNumber')}
            />
          </div>
          <div>
            <label htmlFor="dayDate" className="block text-gray-300 text-sm font-bold mb-1">{t('dayDate')}</label>
            <input
              type="date"
              id="dayDate"
              className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newDayDate}
              onChange={(e) => setNewDayDate(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="dayDescription" className="block text-gray-300 text-sm font-bold mb-1">{t('dayDescription')}</label>
            <textarea
              id="dayDescription"
              rows="3"
              className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newDayDescription}
              onChange={(e) => setNewDayDescription(e.target.value)}
              placeholder={t('dayDescription')}
            ></textarea>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {editingDay ? (
            <>
              <button
                onClick={handleUpdateDay}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 flex-grow"
              >
                <Save className="inline-block mr-2" size={20} /> {t('update')}
              </button>
              <button
                onClick={() => {
                  setEditingDay(null);
                  setNewDayNumber('');
                  setNewDayDate('');
                  setNewDayDescription('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
              >
                <XCircle className="inline-block mr-2" size={20} /> {t('cancel')}
              </button>
            </>
          ) : (
            <button
              onClick={handleAddDay}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 w-full"
            >
              <PlusCircle className="inline-block mr-2" size={20} /> {t('addDay')}
            </button>
          )}
        </div>
      </div>

      {/* Liste der Event-Tage */}
      <h4 className="text-xl font-semibold mb-3 text-indigo-200">{t('eventDays')}</h4>
      {eventDays.length > 0 ? (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-gray-600 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-500">
                <th className="py-2 px-4 text-left text-indigo-100">{t('dayNumber')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('dayDate')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('description')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {eventDays.map(day => (
                <tr key={day.id} className="border-b border-gray-500 last:border-b-0">
                  <td className="py-2 px-4 text-gray-200">{day.dayNumber}</td>
                  <td className="py-2 px-4 text-gray-200">{day.date}</td>
                  <td className="py-2 px-4 text-gray-200 truncate max-w-xs">{day.description || '-'}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditDay(day)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition duration-200"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteDay(day.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition duration-200"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => setSelectedDayForScores(day)}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md transition duration-200"
                        title={t('managePlayerScores')}
                      >
                        <List size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">{t('noData')}</p>
      )}
    </div>
  );
};

// Spielergebnis-Verwaltung
const PlayerScoreManagement = ({ t, db, appId, periodId, dayId, dayNumber, showModal, showStatusMessage }) => {
  const [playerScores, setPlayerScores] = useState([]);
  const [playerList, setPlayerList] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [newScorePoints, setNewScorePoints] = useState('');
  const [editingScore, setEditingScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayersAndScores = async () => {
      if (!db || !appId || !periodId || !dayId) return;
      setLoading(true);
      try {
        // Spielerliste laden
        const playersSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/players`));
        const playersData = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayerList(playersData);

        // Spielergebnisse für den Tag laden
        const q = query(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays/${dayId}/playerScores`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const scoresData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Spielername zu jedem Score hinzufügen
          const scoresWithNames = scoresData.map(score => {
            const player = playersData.find(p => p.id === score.playerId);
            return { ...score, playerName: player ? player.name : 'Unbekannter Spieler' };
          });
          setPlayerScores(scoresWithNames.sort((a, b) => b.score - a.score)); // Nach Punkten sortieren
          setLoading(false);
        }, (err) => {
          console.error("Fehler beim Laden der Spielergebnisse:", err);
          setError(`${t('error')} ${err.message}`);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (err) {
        console.error("Fehler beim Initialisieren der Spielergebnisverwaltung:", err);
        setError(`${t('error')} ${err.message}`);
        setLoading(false);
      }
    };
    fetchPlayersAndScores();
  }, [db, appId, periodId, dayId, t]);

  const handleAddScore = async () => {
    if (!selectedPlayerId || newScorePoints === '' || isNaN(parseInt(newScorePoints))) {
      showStatusMessage('error', 'Bitte wähle einen Spieler und gib eine gültige Punktzahl ein.');
      return;
    }
    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays/${dayId}/playerScores`), {
        playerId: selectedPlayerId,
        score: parseInt(newScorePoints),
        createdAt: new Date().toISOString(),
      });
      setSelectedPlayerId('');
      setNewScorePoints('');
      showStatusMessage('success', t('scoreAddedSuccess'));
    } catch (err) {
      console.error("Fehler beim Hinzufügen des Spielergebnisses:", err);
      showStatusMessage('error', `${t('error')} ${err.message}`);
    }
  };

  const handleEditScore = (score) => {
    setEditingScore({ ...score });
    setSelectedPlayerId(score.playerId);
    setNewScorePoints(score.score);
  };

  const handleUpdateScore = async () => {
    if (!editingScore || !selectedPlayerId || newScorePoints === '' || isNaN(parseInt(newScorePoints))) {
      showStatusMessage('error', 'Bitte wähle einen Spieler und gib eine gültige Punktzahl ein.');
      return;
    }
    try {
      await setDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays/${dayId}/playerScores`, editingScore.id), {
        playerId: selectedPlayerId,
        score: parseInt(newScorePoints),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setEditingScore(null);
      setSelectedPlayerId('');
      setNewScorePoints('');
      showStatusMessage('success', t('scoreUpdatedSuccess'));
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Spielergebnisses:", err);
      showStatusMessage('error', `${t('error')} ${err.message}`);
    }
  };

  const handleDeleteScore = (scoreId) => {
    showModal(t('confirmDeletePlayerScore'), async () => {
      try {
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/eventPeriods/${periodId}/eventDays/${dayId}/playerScores`, scoreId));
        showStatusMessage('success', t('scoreDeletedSuccess'));
      } catch (err) {
        console.error("Fehler beim Löschen des Spielergebnisses:", err);
        showStatusMessage('error', `${t('error')} ${err.message}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center text-white">
        <Loader className="animate-spin text-indigo-400 h-10 w-10 mx-auto mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-2xl font-bold mb-4 text-indigo-300">{t('managePlayerScores')} für Tag {dayNumber}</h3>

      {/* Spielergebnis hinzufügen/bearbeiten Formular */}
      <div className="mb-6 p-4 bg-gray-600 rounded-lg">
        <h4 className="text-xl font-semibold mb-3 text-indigo-200">
          {editingScore ? t('editPlayerScore') : t('addPlayerScore')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="selectPlayer" className="block text-gray-300 text-sm font-bold mb-1">{t('player')}</label>
            <select
              id="selectPlayer"
              className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              disabled={!!editingScore} // Spieler kann beim Bearbeiten nicht geändert werden
            >
              <option value="">{t('selectPlayer')}</option>
              {playerList.map(player => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="scorePoints" className="block text-gray-300 text-sm font-bold mb-1">{t('scorePoints')}</label>
            <input
              type="number"
              id="scorePoints"
              className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newScorePoints}
              onChange={(e) => setNewScorePoints(e.target.value)}
              placeholder={t('scorePoints')}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {editingScore ? (
            <>
              <button
                onClick={handleUpdateScore}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 flex-grow"
              >
                <Save className="inline-block mr-2" size={20} /> {t('update')}
              </button>
              <button
                onClick={() => {
                  setEditingScore(null);
                  setSelectedPlayerId('');
                  setNewScorePoints('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
              >
                <XCircle className="inline-block mr-2" size={20} /> {t('cancel')}
              </button>
            </>
          ) : (
            <button
              onClick={handleAddScore}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 w-full"
            >
              <PlusCircle className="inline-block mr-2" size={20} /> {t('addScore')}
            </button>
          )}
        </div>
      </div>

      {/* Liste der Spielergebnisse */}
      <h4 className="text-xl font-semibold mb-3 text-indigo-200">{t('playerScoresForDay')} {dayNumber}</h4>
      {playerScores.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-600 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-500">
                <th className="py-2 px-4 text-left text-indigo-100">{t('player')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('points')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {playerScores.map(score => (
                <tr key={score.id} className="border-b border-gray-500 last:border-b-0">
                  <td className="py-2 px-4 text-gray-200">{score.playerName}</td>
                  <td className="py-2 px-4 text-gray-200">{score.score}</td>
                  <td className="py-2 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditScore(score)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition duration-200"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteScore(score.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition duration-200"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">{t('noScores')}</p>
      )}
    </div>
  );
};

// Admin-Verwaltung
const AdminManagement = ({ t, db, appId, userId, showModal, showStatusMessage }) => {
  const [admins, setAdmins] = useState([]);
  const [newAdminId, setNewAdminId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmins = () => {
      if (!db || !appId) return;
      setLoading(true);
      // Admins werden in einer öffentlichen Kollektion gespeichert
      const q = query(collection(db, `artifacts/${appId}/public/data/admins`));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const adminsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdmins(adminsData);
        setLoading(false);
      }, (err) => {
        console.error("Fehler beim Laden der Admins:", err);
        setError(`${t('error')} ${err.message}`);
        setLoading(false);
      });
      return () => unsubscribe();
    };
    fetchAdmins();
  }, [db, appId, t]);

  const handleAddAdmin = async () => {
    if (!newAdminId.trim()) {
      showStatusMessage('error', 'Bitte gib eine Admin User ID ein.');
      return;
    }
    try {
      await setDoc(doc(db, `artifacts/${appId}/public/data/admins`, newAdminId.trim()), {
        addedBy: userId,
        addedAt: new Date().toISOString(),
      });
      setNewAdminId('');
      showStatusMessage('success', t('adminAddedSuccess'));
    } catch (err) {
      console.error("Fehler beim Hinzufügen des Admins:", err);
      showStatusMessage('error', `${t('error')} ${err.message}`);
    }
  };

  const handleRemoveAdmin = (adminIdToRemove) => {
    showModal(t('confirmRemoveAdmin'), async () => {
      try {
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/admins`, adminIdToRemove));
        showStatusMessage('success', t('adminRemovedSuccess'));
      } catch (err) {
        console.error("Fehler beim Entfernen des Admins:", err);
        showStatusMessage('error', `${t('error')} ${err.message}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center text-white">
        <Loader className="animate-spin text-indigo-400 h-10 w-10 mx-auto mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-2xl font-bold mb-4 text-indigo-300">{t('adminManagement')}</h3>

      {/* Admin hinzufügen Formular */}
      <div className="mb-6 p-4 bg-gray-600 rounded-lg">
        <h4 className="text-xl font-semibold mb-3 text-indigo-200">{t('addAdmin')}</h4>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            className="shadow appearance-none border border-gray-500 rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow"
            value={newAdminId}
            onChange={(e) => setNewAdminId(e.target.value)}
            placeholder={t('adminUserId')}
          />
          <button
            onClick={handleAddAdmin}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 flex-shrink-0"
          >
            <PlusCircle className="inline-block mr-2" size={20} /> {t('addAdminBtn')}
          </button>
        </div>
      </div>

      {/* Aktuelle Admins Liste */}
      <h4 className="text-xl font-semibold mb-3 text-indigo-200">{t('currentAdmins')}</h4>
      {admins.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-600 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-500">
                <th className="py-2 px-4 text-left text-indigo-100">{t('adminId')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id} className="border-b border-gray-500 last:border-b-0">
                  <td className="py-2 px-4 text-gray-200 break-all">{admin.id}</td>
                  <td className="py-2 px-4">
                    {admin.id !== userId ? ( // Aktuellen Admin nicht entfernen können
                      <button
                        onClick={() => handleRemoveAdmin(admin.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition duration-200"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">{t('self')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">{t('noAdmins')}</p>
      )}
    </div>
  );
};

// Admin-Nachrichtenverwaltung
const AdminMessageManagement = ({ t, db, appId, showModal, showStatusMessage }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !appId) return;
    setLoading(true);
    // Nachrichten in einer öffentlichen Kollektion speichern
    const q = query(collection(db, `artifacts/${appId}/public/data/adminMessages`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setLoading(false);
    }, (err) => {
      console.error("Fehler beim Laden der Admin-Nachrichten:", err);
      setError(`${t('error')} ${err.message}`);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db, appId, t]);

  const handleDeleteMessage = (messageId) => {
    showModal(t('confirmDeleteMessage'), async () => {
      try {
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/adminMessages`, messageId));
        showStatusMessage('success', t('messageDeletedSuccess'));
      } catch (err) {
        console.error("Fehler beim Löschen der Nachricht:", err);
        showStatusMessage('error', `${t('error')} ${err.message}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center text-white">
        <Loader className="animate-spin text-indigo-400 h-10 w-10 mx-auto mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-2xl font-bold mb-4 text-indigo-300">{t('adminMessages')}</h3>

      {messages.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-600 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-500">
                <th className="py-2 px-4 text-left text-indigo-100">{t('fromUser')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('message')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('timestamp')}</th>
                <th className="py-2 px-4 text-left text-indigo-100">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(message => (
                <tr key={message.id} className="border-b border-gray-500 last:border-b-0">
                  <td className="py-2 px-4 text-gray-200 break-all">{message.fromUserId}</td>
                  <td className="py-2 px-4 text-gray-200 max-w-xs truncate">{message.messageContent}</td>
                  <td className="py-2 px-4 text-gray-200 text-sm">
                    {new Date(message.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition duration-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">{t('noAdminMessages')}</p>
      )}
    </div>
  );
};


// Haupt-App-Komponente
const App = () => {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [currentLanguage, setCurrentLanguage] = useState('de');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedArchivedPeriodId, setSelectedArchivedPeriodId] = useState(null);

  // Hole Firebase-Instanzen aus dem Kontext
  const { db, auth, userId, appId, isAuthReady } = useFirebase();

  // Übersetzungsfunktion
  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  const navigateTo = (page, params = {}) => {
    if (page === 'eventArchive' && params.periodId) {
      setSelectedArchivedPeriodId(params.periodId);
    } else {
      setSelectedArchivedPeriodId(null);
    }
    setCurrentPage(page);
    setErrorMessage(''); // Fehler beim Navigieren zurücksetzen
  };

  // Zeige einen Ladezustand an, bis Firebase bereit ist
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center">
        <Loader className="animate-spin text-indigo-400 h-16 w-16" />
        <p className="ml-4 text-lg">{t('loadingUserData')}</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage navigateTo={navigateTo} setLanguage={setCurrentLanguage} currentLanguage={currentLanguage} t={t} />;
      case 'infoPage':
        return <InfoPage navigateTo={navigateTo} t={t} />;
      case 'navigation':
        return <NavigationPage navigateTo={navigateTo} t={t} />;
      case 'currentTotalEvent':
        return <CurrentTotalEventPage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} />;
      case 'eventArchive':
        return <EventArchivePage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} archivedPeriodId={selectedArchivedPeriodId} />;
      case 'topTen':
        return <TopTenPage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} />;
      case 'hallOfChamps':
        return <HallOfChampsPage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} />;
      case 'contactForm':
        return <ContactFormPage navigateTo={navigateTo} t={t} />;
      case 'adminPanel':
        return <AdminPanel navigateTo={navigateTo} t={t} setErrorMessage={setErrorMessage} errorMessage={errorMessage} db={db} appId={appId} userId={userId} />;
      default:
        return <WelcomePage navigateTo={navigateTo} setLanguage={setCurrentLanguage} currentLanguage={currentLanguage} t={t} />;
    }
  };

  return (
    // HIER IST DIE KORREKTE PLATZIERUNG DES FIREBASEPROVIDERS
    // Er umschließt das gesamte 'div'-Element, das deine App rendert.
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 sm:p-6 lg:p-8 font-inter flex flex-col items-center">
      <style>
        {
          `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }`
        }
      </style>
      <div className="w-full max-w-6xl">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
