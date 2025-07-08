// src/App.js

import React, { useState, useEffect } from 'react';
import { useFirebase } from './FirebaseContext.js';
// Importiere spezifische Firestore-Funktionen, die in dieser Datei verwendet werden
import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, query, getDocs, writeBatch } from 'firebase/firestore';
// Importiere Icons von lucide-react
import {
  Info, Calendar, Archive, ListOrdered, Crown, Mail, Settings, ArrowLeft, Award, Target,
  Upload, Plus, Save, Trash2, XCircle, CheckCircle, Send, Users, Shield, Trophy
} from 'lucide-react';


// Übersetzungen für verschiedene Sprachen (bleibt gleich)
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
    personalPlayerReport: "Persönlicher Spielerbericht", // Dieser Schlüssel wird nicht mehr verwendet, aber zur Konsistenz beibehalten
    currentTotalEvent: "Aktuelle Veranstaltungsperiode",
    furtherLinkIndividualDays: "Weiterführender Link zu den einzelnen Tagen",
    eventArchive: "Veranstaltungsarchiv",
    topTen: "Top Ten",
    hallOfChamps: "Halle der Champions",
    contactForm: "Kontaktformular",
    clanMembers: "Clan-Mitglieder", // Dieser Text wird nur noch im Admin-Panel verwendet
    addMember: "Mitglied hinzufügen", // Wird nicht mehr direkt verwendet, aber zur Konsistenz beibehalten
    memberName: "Name des Mitglieds", // Wird nicht mehr direkt verwendet, aber zur Konsistenz beibehalten
    memberRole: "Rolle (z.B. Krieger, Heiler)", // Wird nicht mehr direkt verwendet, aber zur Konsistenz beibehalten
    add: "Hinzufügen",
    cancel: "Abbrechen",
    delete: "Löschen",
    confirmDelete: "Löschen bestätigen",
    areYouSureDelete: "Bist du sicher, dass du \"{itemName}\" löschen möchtest?",
    noMembers: "Noch keine Clan-Mitglieder vorhanden. Füge neue Mitglieder hinzu!",
    loading: "Lade Clan Dashboard...",
    errorMessageAuth: "Fehler bei der Authentifizierung. Bitte versuchen Sie es später erneut.",
    errorMessageInit: "Fehler beim Starten der App. Bitte versuchen Sie es später erneut.",
    errorMessageFetch: "Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.",
    errorMessageAdd: "Fehler beim Hinzufügen des Eintrags.",
    errorMessageDelete: "Fehler beim Löschen des Eintrags.",
    errorMessageEmptyFields: "Alle erforderlichen Felder müssen ausgefüllt werden.",
    errorMessageDbNotReady: "Datenbank ist nicht bereit oder Benutzer ist nicht authentifiziert.",
    yourUserId: "Deine Benutzer-ID:",
    backToNavigation: "Zurück zur Navigation",
    backToInfo: "Zurück zur Info-Seite",
    pageUnderConstruction: "Diese Seite ist noch in Konstruktion. Interessante Inhalte folgen!",
    jsonUpload: "JSON-Datei hochladen",
    uploadFile: "Datei hochladen",
    selectJsonFile: "Datei auswählen",
    fileUploaded: "Datei erfolgreich hochgeladen: {fileName}",
    errorUploadingFile: "Fehler beim Hochladen der Datei.",
    errorParsingFile: "Fehler beim Parsen der Datei. Bitte stellen Sie sicher, dass es sich um eine gültige JSON-Datei handelt.",
    errorProcessingData: "Fehler beim Verarbeiten der hochgeladenen Daten.",
    normsDefinition: "Normen-Definition",
    normName: "Norm-Name",
    troopStrengthMin: "Truppenstärke (Min)",
    troopStrengthMax: "Truppenstärke (Max)",
    addNorm: "Norm hinzufügen",
    addPlayer: "Spieler hinzufügen",
    playerName: "Spielername",
    playerAlias: "Alias (Komma-getrennt)",
    playerRank: "Rang",
    playerTroopStrength: "Truppenstärke",
    savePlayer: "Spieler speichern",
    currentNorms: "Aktuelle Normen",
    currentPlayers: "Aktuelle Spieler",
    deleteNorm: "Norm löschen",
    deletePlayer: "Spieler löschen",
    normAdded: "Norm '{itemName}' hinzugefügt.",
    normDeleted: "Norm '{itemName}' gelöscht.",
    playerAdded: "Spieler '{itemName}' hinzugefügt.",
    playerDeleted: "Spieler '{itemName}' gelöscht.",
    troopStrengthManagement: "Truppenstärke-Verwaltung",
    newTroopStrength: "Neue Truppenstärke (z.B. G1)",
    addTroopStrength: "Truppenstärke hinzufügen",
    currentTroopStrengths: "Aktuelle Truppenstärken",
    deleteTroopStrength: "Delete Troop Strength",
    rankManagement: "Rang-Verwaltung",
    newRank: "Neuer Rang (z.B. Anfänger)",
    addRank: "Rang hinzufügen",
    currentRanks: "Aktuelle Ränge",
    deleteRank: "Rang löschen",
    assignNorm: "Norm zuweisen",
    selectTroopStrength: "Truppenstärke auswählen",
    normValue: "Normwert (Punkte)",
    normAssigned: "Norm '{normValue}' für Truppenstärke '{troopStrength}' zugewiesen.",
    normMappingDeleted: "Norm-Zuweisung für '{itemName}' gelöscht.",
    noTroopStrengths: "Keine Truppenstärken definiert.",
    noRanks: "Keine Ränge definiert.",
    noNormsDefined: "Keine Normen definiert.",
    adminPanel: "Admin-Panel",
    endCurrentPeriod: "Aktuelle Periode beenden",
    confirmEndPeriod: "Bist du sicher, dass du die aktuelle Veranstaltungsperiode beenden möchtest? Alle aktuellen Spielerdaten werden archiviert.",
    periodEndedSuccess: "Aktuelle Veranstaltungsperiode erfolgreich beendet und Daten archiviert.",
    periodEndedError: "Fehler beim Beenden der aktuellen Veranstaltungsperiode.",
    noCurrentPeriodData: "Keine aktuellen Spielerdaten vorhanden, um die Periode zu beenden.",
    eventName: "Veranstaltungsname",
    periodDate: "Datum der Periode",
    overallClanNormFulfillment: "Gesamte Clan-Normerfüllung",
    playerList: "Spielerliste",
    name: "Name",
    rank: "Rang",
    troopStrength: "Truppenstärke",
    clanChests: "Anzahl Clantruhen Truhen",
    totalPoints: "Punkte Total (Istzustand)",
    normTarget: "Normenvorgabe (Sollzustand)",
    difference: "Differenz",
    normFulfillment: "Normerfüllung (%)",
    noPlayersInCurrentEvent: "Es sind keine Spielerdaten für die aktuelle Veranstaltungsperiode vorhanden.",
    playerDetails: "Spielerdetails",
    backToCurrentEvent: "Zurück zur aktuellen Veranstaltungsperiode",
    aliases: "Aliase",
    chestCategories: "Truhenkategorien",
    eventArchiveTitle: "Veranstaltungsarchiv",
    noArchivedEvents: "Keine archivierten Veranstaltungen vorhanden.",
    viewDetails: "Details anzeigen",
    backToArchive: "Zurück zum Archiv",
    archivedPeriodDetails: "Details der archivierten Periode",
    periodEndedAt: "Periode beendet am",
    topTenTitle: "Top Ten Spieler",
    noTopPlayers: "Keine Top-Spielerdaten verfügbar.",
    hallOfChampsTitle: "Halle der Champions",
    noChampions: "Keine Champions verfügbar.",
    champion: "Champion",
    contactFormTitle: "Kontaktformular",
    contactFormDescription: "Sende uns eine Nachricht mit deinen Fragen, Ideen oder Vorschlägen.",
    yourName: "Dein Name",
    yourEmail: "Deine E-Mail",
    yourMessage: "Deine Nachricht",
    sendMessage: "Nachricht senden",
    messageSent: "Nachricht erfolgreich gesendet!",
    messageSendError: "Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.",
    adminAccessRestricted: "Zugriff auf das Admin-Panel ist eingeschränkt. Bitte melde dich an.",
    uff2StandardsEvaluation: "UFF_2_Standards Auswertung",
    uff2StandardsDescription: "Diese Seite zeigt die Auswertung der Spielerfortschritte basierend auf den UFF_2_Standards.",
  },
  en: {
    welcomeTitle: "Welcome to the Clan Dashboard!",
    selectLanguage: "Select Language:",
    goToInfoPage: "Go to Information Page",
    infoPageTitle: "About Our Clan and the Game",
    clanName: "Our Clan: Union For Friends 2",
    clanDescription: "We are a community of passionate players dedicated to adventure and shared success. Whether COT or KvK, we support each other and have fun doing it.",
    gameName: "The Game: Total Battle",
    gameDescription: "is a tactical, strategic war game. Whether you are raided or conduct raids yourself, we always adhere to netiquette.\nWe are in Kingdom No. 36 and follow the laws of Kingdom ROE 36*",
    normsInfo: "In this game and in our clan, you must meet norms to be successful yourself and to help the clan succeed.",
    statsInfo: "Here on this page you can find information about clan and personal statistics.",
    errorSuggestion: "If you find errors or have suggestions/ideas for this page, please use the contact form",
    goodLuck: "I wish you all a successful hunt.\nLet's go – good luck and have fun!",
    pizzaOnkel: "The PizzaOnkel",
    copyright: "© 2024 Clan-Dashboard. All rights reserved by PizzaOnkel.",
    goToNavigation: "Go to Navigation",
    navigationTitle: "Clan Navigation",
    personalPlayerReport: "Personal Player Report",
    currentTotalEvent: "Current Event Period",
    furtherLinkIndividualDays: "Further Link to Individual Days",
    eventArchive: "Event Archive",
    topTen: "Top Ten",
    hallOfChamps: "Hall of Champions",
    contactForm: "Contact Form",
    clanMembers: "Clan Members",
    addMember: "Add Member",
    memberName: "Member Name",
    memberRole: "Role (e.g., Warrior, Healer)",
    add: "Add",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Confirm Deletion",
    areYouSureDelete: "Are you sure you want to delete \"{itemName}\"?",
    noMembers: "No clan members yet. Add new members!",
    loading: "Loading Clan Dashboard...",
    errorMessageAuth: "Error during authentication. Please try again later.",
    errorMessageInit: "Error starting the app. Please try again later.",
    errorMessageFetch: "Error loading data. Please try again later.",
    errorMessageAdd: "Error adding entry.",
    errorMessageDelete: "Error deleting entry.",
    errorMessageEmptyFields: "All required fields must be filled.",
    errorMessageDbNotReady: "Database not ready or user not authenticated.",
    yourUserId: "Your User ID:",
    backToNavigation: "Back to Navigation",
    backToInfo: "Back to Info Page",
    pageUnderConstruction: "This page is still under construction. Exciting content coming soon!",
    jsonUpload: "JSON File Upload",
    uploadFile: "Upload File",
    selectJsonFile: "Select file",
    fileUploaded: "File uploaded successfully: {fileName}",
    errorUploadingFile: "Error uploading file.",
    errorParsingFile: "Error parsing file. Please ensure it's a valid JSON file.",
    errorProcessingData: "Error processing uploaded data.",
    normsDefinition: "Norms Definition",
    normName: "Norm Name",
    troopStrengthMin: "Troop Strength (Min)",
    troopStrengthMax: "Troop Strength (Max)",
    addNorm: "Add Norm",
    addPlayer: "Add Player",
    playerName: "Player Name",
    playerAlias: "Alias (comma-separated)",
    playerRank: "Rank",
    playerTroopStrength: "Troop Strength",
    savePlayer: "Save Player",
    currentNorms: "Current Norms",
    currentPlayers: "Current Players",
    deleteNorm: "Delete Norm",
    deletePlayer: "Delete Player",
    normAdded: "Norm '{itemName}' added.",
    normDeleted: "Norm '{itemName}' deleted.",
    playerAdded: "Player '{itemName}' added.",
    playerDeleted: "Player '{itemName}' deleted.",
    troopStrengthManagement: "Troop Strength Management",
    newTroopStrength: "New Troop Strength (e.g., G1)",
    addTroopStrength: "Add Troop Strength",
    currentTroopStrengths: "Current Troop Strengths",
    deleteTroopStrength: "Delete Troop Strength",
    rankManagement: "Rank Management",
    newRank: "New Rank (e.g., Beginner)",
    addRank: "Add Rank",
    currentRanks: "Current Ranks",
    deleteRank: "Delete Rank",
    assignNorm: "Assign Norm",
    selectTroopStrength: "Select Troop Strength",
    normValue: "Norm Value (Score)",
    normAssigned: "Norm '{normValue}' assigned for troop strength '{troopStrength}'.",
    normMappingDeleted: "Norm mapping for '{itemName}' deleted.",
    noTroopStrengths: "No troop strengths defined.",
    noRanks: "No ranks defined.",
    noNormsDefined: "No norms defined.",
    adminPanel: "Admin Panel",
    endCurrentPeriod: "End Current Period",
    confirmEndPeriod: "Are you sure you want to end the current event period? All current player data will be archived.",
    periodEndedSuccess: "Current event period successfully ended and data archived.",
    periodEndedError: "Error ending current event period.",
    noCurrentPeriodData: "No current player data available to end the period.",
    eventName: "Event Name",
    periodDate: "Period Date",
    overallClanNormFulfillment: "Overall Clan Norm Fulfillment",
    playerList: "Player List",
    name: "Name",
    rank: "Rank",
    troopStrength: "Troop Strength",
    clanChests: "Number of Clan Chests",
    totalPoints: "Total Points (Actual)",
    normTarget: "Norm Target (Expected)",
    difference: "Difference",
    normFulfillment: "Norm Fulfillment (%)",
    noPlayersInCurrentEvent: "No player data available for the current event period.",
    playerDetails: "Player Details",
    backToCurrentEvent: "Back to Current Event Period",
    aliases: "Aliases",
    chestCategories: "Chest Categories",
    eventArchiveTitle: "Event Archive",
    noArchivedEvents: "No archived events available.",
    viewDetails: "View Details",
    backToArchive: "Back to Archive",
    archivedPeriodDetails: "Archived Period Details",
    periodEndedAt: "Period Ended At",
    topTenTitle: "Top Ten Players",
    noTopPlayers: "No top player data available.",
    hallOfChampsTitle: "Hall of Champions",
    noChampions: "No champions available.",
    champion: "Champion",
    contactFormTitle: "Contact Form",
    contactFormDescription: "Send us a message with your questions, ideas, or suggestions.",
    yourName: "Your Name",
    yourEmail: "Your Email",
    yourMessage: "Your Message",
    sendMessage: "Send Message",
    messageSent: "Message sent successfully!",
    messageSendError: "Error sending message. Please try again later.",
    adminAccessRestricted: "Access to the Admin Panel is restricted. Please sign in.",
    uff2StandardsEvaluation: "UFF_2_Standards Evaluation",
    uff2StandardsDescription: "This page displays the evaluation of player progress based on UFF_2_Standards.",
  },
  es: {
    welcomeTitle: "¡Bienvenido al Panel del Clan!",
    selectLanguage: "Seleccionar idioma:",
    goToInfoPage: "Ir a la página de información",
    infoPageTitle: "Sobre Nuestro Clan y el Juego",
    clanName: "Nuestro Clan: Unión Para Amigos 2",
    clanDescription: "Somos una comunidad de jugadores apasionados dedicados a la aventura y al éxito compartido. Ya sea COT o KvK, nos apoyamos mutuamente y nos divertimos haciéndolo.",
    gameName: "El Juego: Total Battle",
    gameDescription: "es un juego de guerra táctico y estratégico. Ya sea que te asalten o realices asaltos tú mismo, siempre nos adherimos a la netiqueta.\nEstamos en el Reino No. 36 y seguimos las leyes del Reino ROE 36*",
    normsInfo: "En este juego y en nuestro clan, debes cumplir las normas para tener éxito y ayudar al clan a tener éxito.",
    statsInfo: "Aquí en esta página puedes encontrar información sobre las estadísticas del clan y personales.",
    errorSuggestion: "Si encuentras errores o tienes sugerencias/ideas para esta página, utiliza el formulario de contacto",
    goodLuck: "Les deseo a todos una caza exitosa.\n¡Vamos – buena suerte y diviértanse!",
    pizzaOnkel: "El PizzaOnkel",
    copyright: "© 2024 Clan-Dashboard. Todos los derechos reservados por PizzaOnkel.",
    goToNavigation: "Ir a la Navegación",
    navigationTitle: "Navegación del Clan",
    personalPlayerReport: "Informe Personal del Jugador",
    currentTotalEvent: "Período de Evento Actual",
    furtherLinkIndividualDays: "Enlace Adicional a Días Individuales",
    eventArchive: "Archivo de Eventos",
    topTen: "Top Diez",
    hallOfChamps: "Salón de Campeones",
    contactForm: "Formulario de Contacto",
    clanMembers: "Miembros del Clan",
    addMember: "Añadir Miembro",
    memberName: "Nombre del Miembro",
    memberRole: "Rol (ej. Guerrero, Sanador)",
    add: "Añadir",
    cancel: "Cancelar",
    delete: "Borrar",
    confirmDelete: "Confirmar Eliminación",
    areYouSureDelete: "¿Estás seguro de que quieres eliminar \"{itemName}\"?",
    noMembers: "Aún no hay miembros del clan. ¡Añade nuevos miembros!",
    loading: "Cargando Panel del Clan...",
    errorMessageAuth: "Error durante la autenticación. Por favor, inténtalo de nuevo más tarde.",
    errorMessageInit: "Error al iniciar la aplicación. Por favor, inténtalo de nuevo más tarde.",
    errorMessageFetch: "Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.",
    errorMessageAdd: "Error al añadir la entrada.",
    errorMessageDelete: "Error al eliminar la entrada.",
    errorMessageEmptyFields: "Todos los campos obligatorios deben ser rellenados.",
    errorMessageDbNotReady: "La base de datos no está lista o el usuario no está autenticado.",
    yourUserId: "Tu ID de Usuario:",
    backToNavigation: "Volver a la Navegación",
    backToInfo: "Volver a la Página de Información",
    pageUnderConstruction: "Esta página aún está en construcción. ¡Pronto habrá contenido emocionante!",
    jsonUpload: "Subir Archivo JSON",
    uploadFile: "Subir Archivo",
    selectJsonFile: "Seleccionar archivo",
    fileUploaded: "Archivo subido con éxito: {fileName}",
    errorUploadingFile: "Error al subir el archivo.",
    errorParsingFile: "Error al analizar el archivo. Asegúrate de que sea un archivo JSON válido.",
    errorProcessingData: "Error al procesar los datos subidos.",
    normsDefinition: "Definición de Normas",
    normName: "Nombre de la Norma",
    troopStrengthMin: "Fuerza de Tropas (Mín.)",
    troopStrengthMax: "Fuerza de Tropas (Máx.)",
    addNorm: "Añadir Norma",
    addPlayer: "Añadir Jugador",
    playerName: "Nombre del Jugador",
    playerAlias: "Alias (separado por comas)",
    playerRank: "Rango",
    playerTroopStrength: "Fuerza de Tropas",
    savePlayer: "Guardar Jugador",
    currentNorms: "Normas Actuales",
    currentPlayers: "Jugadores Actuales",
    deleteNorm: "Borrar Norma",
    deletePlayer: "Borrar Jugador",
    normAdded: "Norma '{itemName}' añadida.",
    normDeleted: "Norma '{itemName}' eliminada.",
    playerAdded: "Jugador '{itemName}' añadido.",
    playerDeleted: "Jugador '{itemName}' eliminado.",
    troopStrengthManagement: "Gestión de la Fuerza de Tropas",
    newTroopStrength: "Nueva Fuerza de Tropas (ej. G1)",
    addTroopStrength: "Añadir Fuerza de Tropas",
    currentTroopStrengths: "Fuerzas de Tropas Actuales",
    deleteTroopStrength: "Eliminar Fuerza de Tropas",
    rankManagement: "Gestión de Rangos",
    newRank: "Nuevo Rango (ej. Principiante)",
    addRank: "Añadir Rango",
    currentRanks: "Rangos Actuales",
    deleteRank: "Eliminar Rango",
    assignNorm: "Asignar Norma",
    selectTroopStrength: "Seleccionar Fuerza de Tropas",
    normValue: "Valor de la Norma (Puntuación)",
    normAssigned: "Norma '{normValue}' asignada para la fuerza de tropas '{troopStrength}'.",
    normMappingDeleted: "Asignación de norma para '{itemName}' eliminada.",
    noTroopStrengths: "No hay fuerzas de tropas definidas.",
    noRanks: "No hay rangos definidos.",
    noNormsDefined: "No hay normas definidas.",
    adminPanel: "Panel de Administración",
    endCurrentPeriod: "Finalizar Período Actual",
    confirmEndPeriod: "¿Estás seguro de que quieres finalizar el período de evento actual? Todos los datos de los jugadores actuales se archivarán.",
    periodEndedSuccess: "Período de evento actual finalizado y datos archivados con éxito.",
    periodEndedError: "Error al finalizar el período de evento actual.",
    noCurrentPeriodData: "No hay datos de jugadores actuales disponibles para finalizar el período.",
    eventName: "Nombre del Evento",
    periodDate: "Fecha del Período",
    overallClanNormFulfillment: "Cumplimiento General de la Norma del Clan",
    playerList: "Lista de Jugadores",
    name: "Nombre",
    rank: "Rango",
    troopStrength: "Fuerza de Tropas",
    clanChests: "Número de Cofres del Clan",
    totalPoints: "Puntos Totales (Actual)",
    normTarget: "Objetivo de la Norma (Esperado)",
    difference: "Diferencia",
    normFulfillment: "Cumplimiento de la Norma (%)",
    noPlayersInCurrentEvent: "No hay datos de jugadores disponibles para el período de evento actual.",
    playerDetails: "Detalles del Jugador",
    backToCurrentEvent: "Volver al Período de Evento Actual",
    aliases: "Alias",
    chestCategories: "Categorías de Cofres",
    eventArchiveTitle: "Archivo de Eventos",
    noArchivedEvents: "No hay eventos archivados disponibles.",
    viewDetails: "Ver Detalles",
    backToArchive: "Volver al Archivo",
    archivedPeriodDetails: "Detalles del Período Archivado",
    periodEndedAt: "Período Finalizado el",
    topTenTitle: "Diez Mejores Jugadores",
    noTopPlayers: "No hay datos de los mejores jugadores disponibles.",
    hallOfChampsTitle: "Salón de Campeones",
    noChampions: "No hay campeones disponibles.",
    champion: "Campeón",
    contactFormTitle: "Formulario de Contacto",
    contactFormDescription: "Envíanos un mensaje con tus preguntas, ideas o sugerencias.",
    yourName: "Tu Nombre",
    yourEmail: "Tu Correo Electrónico",
    yourMessage: "Tu Mensaje",
    sendMessage: "Enviar Mensaje",
    messageSent: "¡Mensaje enviado con éxito!",
    messageSendError: "Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.",
    adminAccessRestricted: "El acceso al Panel de Administración está restringido. Por favor, inicia sesión.",
    uff2StandardsEvaluation: "Evaluación de Estándares UFF_2",
    uff2StandardsDescription: "Esta página muestra la evaluación del progreso del jugador basada en los Estándares UFF_2.",
  },
  ru: {
    welcomeTitle: "Добро пожаловать на Панель клана!",
    selectLanguage: "Выбрать язык:",
    goToInfoPage: "Перейти на страницу информации",
    infoPageTitle: "О нашем клане и игре",
    clanName: "Наш клан: Union For Friends 2",
    clanDescription: "Мы — сообщество увлеченных игроков, посвященных приключениям и общему успеху. Будь то COT или KvK, мы поддерживаем друг друга и получаем от этого удовольствие.",
    gameName: "Игра: Total Battle",
    gameDescription: "это тактическая, стратегическая военная игра. Независимо от того, подвергаетесь ли вы нападению или сами проводите набеги, мы всегда придерживаемся сетевого этикета.\nМы находимся в Королевстве № 36 и следуем законам Королевства ROE 36*",
    normsInfo: "В этой игре и в нашем клане вы должны соответствовать нормам, чтобы быть успешным самому и помочь клану добиться успеха.",
    statsInfo: "Здесь, на этой странице, вы можете найти информацию о статистике клана и личной статистике.",
    errorSuggestion: "Если вы обнаружите ошибки или у вас есть предложения/идеи по этой странице, пожалуйста, используйте форму обратной связи",
    goodLuck: "Желаю всем удачной охоты.\nВперед – удачи и веселья!",
    pizzaOnkel: "ПиццаОнкель",
    copyright: "© 2024 Панель клана. Все права защищены PizzaOnkel.",
    goToNavigation: "Перейти к навигации",
    navigationTitle: "Навигация по клану",
    personalPlayerReport: "Личный отчет игрока",
    currentTotalEvent: "Текущий период события",
    furtherLinkIndividualDays: "Дальнейшая ссылка на отдельные дни",
    eventArchive: "Архив событий",
    topTen: "Топ Десять",
    hallOfChamps: "Зал Чемпионов",
    contactForm: "Контактная форма",
    clanMembers: "Члены клана",
    addMember: "Добавить члена",
    memberName: "Имя члена",
    memberRole: "Роль (например, Воин, Целитель)",
    add: "Добавить",
    cancel: "Отмена",
    delete: "Удалить",
    confirmDelete: "Подтвердить удаление",
    areYouSureDelete: "Вы уверены, что хотите удалить \"{itemName}\"?",
    noMembers: "Пока нет членов клана. Добавьте новых членов!",
    loading: "Загрузка панели клана...",
    errorMessageAuth: "Ошибка аутентификации. Пожалуйста, попробуйте еще раз позже.",
    errorMessageInit: "Ошибка при запуске приложения. Пожалуйста, попробуйте еще раз позже.",
    errorMessageFetch: "Ошибка при загрузке данных. Пожалуйста, попробуйте еще раз позже.",
    errorMessageAdd: "Ошибка при добавлении записи.",
    errorMessageDelete: "Ошибка при удалении записи.",
    errorMessageEmptyFields: "Все обязательные поля должны быть заполнены.",
    errorMessageDbNotReady: "База данных не готова или пользователь не аутентифицирован.",
    yourUserId: "Ваш ID пользователя:",
    backToNavigation: "Назад к навигации",
    backToInfo: "Назад к информационной странице",
    pageUnderConstruction: "Эта страница находится в разработке. Скоро будет интересный контент!",
    jsonUpload: "Загрузить JSON-файл",
    uploadFile: "Загрузить файл",
    selectJsonFile: "Выбрать файл",
    fileUploaded: "Файл успешно загружен: {fileName}",
    errorUploadingFile: "Ошибка при загрузке файла.",
    errorParsingFile: "Ошибка при анализе файла. Убедитесь, что это действительный JSON-файл.",
    errorProcessingData: "Ошибка при обработке загруженных данных.",
    normsDefinition: "Определение норм",
    normName: "Название нормы",
    troopStrengthMin: "Сила войск (мин)",
    troopStrengthMax: "Сила войск (макс)",
    addNorm: "Добавить норму",
    addPlayer: "Добавить игрока",
    playerName: "Имя игрока",
    playerAlias: "Псевдоним (через запятую)",
    playerRank: "Ранг",
    playerTroopStrength: "Сила войск",
    savePlayer: "Сохранить игрока",
    currentNorms: "Текущие нормы",
    currentPlayers: "Текущие игроки",
    deleteNorm: "Удалить норму",
    deletePlayer: "Удалить игрока",
    normAdded: "Норма '{itemName}' добавлена.",
    normDeleted: "Норма '{itemName}' удалена.",
    playerAdded: "Игрок '{itemName}' добавлен.",
    playerDeleted: "Игрок '{itemName}' удален.",
    troopStrengthManagement: "Управление силой войск",
    newTroopStrength: "Новая сила войск (например, G1)",
    addTroopStrength: "Добавить силу войск",
    currentTroopStrengths: "Текущие силы войск",
    deleteTroopStrength: "Удалить силу войск",
    rankManagement: "Управление рангами",
    newRank: "Новый ранг (например, Новичок)",
    addRank: "Добавить ранг",
    currentRanks: "Текущие ранги",
    deleteRank: "Удалить ранг",
    assignNorm: "Назначить норму",
    selectTroopStrength: "Выбрать силу войск",
    normValue: "Значение нормы (очки)",
    normAssigned: "Норма '{normValue}' назначена для силы войск '{troopStrength}'.",
    normMappingDeleted: "Назначение нормы для '{itemName}' удалено.",
    noTroopStrengths: "Не определены силы войск.",
    noRanks: "Не определены ранги.",
    noNormsDefined: "Не определены нормы.",
    adminPanel: "Панель администратора",
    endCurrentPeriod: "Завершить текущий период",
    confirmEndPeriod: "Вы уверены, что хотите завершить текущий период события? Все текущие данные игроков будут заархивированы.",
    periodEndedSuccess: "Текущий период события успешно завершен и данные заархивированы.",
    periodEndedError: "Ошибка при завершении текущего периода события.",
    noCurrentPeriodData: "Нет текущих данных игроков для завершения периода.",
    eventName: "Название события",
    periodDate: "Дата периода",
    overallClanNormFulfillment: "Общее выполнение нормы кланом",
    playerList: "Список игроков",
    name: "Имя",
    rank: "Ранг",
    troopStrength: "Сила войск",
    clanChests: "Количество сундуков клана",
    totalPoints: "Всего очков (фактически)",
    normTarget: "Целевая норма (ожидаемая)",
    difference: "Разница",
    normFulfillment: "Выполнение нормы (%)",
    noPlayersInCurrentEvent: "Нет данных игроков для текущего периода события.",
    playerDetails: "Детали игрока",
    backToCurrentEvent: "Назад к текущему периоду события",
    aliases: "Псевдонимы",
    chestCategories: "Категории сундуков",
    eventArchiveTitle: "Архив событий",
    noArchivedEvents: "Нет доступных архивных событий.",
    viewDetails: "Посмотреть детали",
    backToArchive: "Назад в архив",
    archivedPeriodDetails: "Детали архивного периода",
    periodEndedAt: "Период завершен",
    topTenTitle: "Десять лучших игроков",
    noTopPlayers: "Нет данных о лучших игроках.",
    hallOfChampsTitle: "Зал Чемпионов",
    noChampions: "Нет доступных чемпионов.",
    champion: "Чемпион",
    contactFormTitle: "Контактная форма",
    contactFormDescription: "Отправьте нам сообщение со своими вопросами, идеями или предложениями.",
    yourName: "Ваше имя",
    yourEmail: "Ваш адрес электронной почты",
    yourMessage: "Ваше сообщение",
    sendMessage: "Отправить сообщение",
    messageSent: "Сообщение успешно отправлено!",
    messageSendError: "Ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз позже.",
    adminAccessRestricted: "Доступ к панели администратора ограничен. Пожалуйста, войдите в систему.",
    uff2StandardsEvaluation: "Оценка стандартов UFF_2",
    uff2StandardsDescription: "Эта страница отображает оценку прогресса игрока на основе стандартов UFF_2.",
  },
  it: {
    welcomeTitle: "Benvenuto nella Dashboard del Clan!",
    selectLanguage: "Seleziona lingua:",
    goToInfoPage: "Vai alla pagina informazioni",
    infoPageTitle: "Informazioni sul Nostro Clan e il Gioco",
    clanName: "Il Nostro Clan: Union For Friends 2",
    clanDescription: "Siamo una comunità di giocatori appassionati dediti all'avventura e al successo condiviso. Che si tratti di COT o KvK, ci supportiamo a vicenda e ci divertiamo a farlo.",
    gameName: "Il Gioco: Total Battle",
    gameDescription: "è un gioco di guerra tattico e strategico. Che tu venga attaccato o conduca attacchi tu stesso, ci atteniamo sempre alla netiquette.\nSiamo nel Regno n. 36 e seguiamo le leggi del Regno ROE 36*",
    normsInfo: "In questo gioco e nel nostro clan, devi rispettare le norme per avere successo e aiutare il clan ad avere successo.",
    statsInfo: "Qui su questa pagina puoi trovare informazioni sulle statistiche del clan e personali.",
    errorSuggestion: "Se trovi errori o hai suggerimenti/idee per questa pagina, utilizza il modulo di contatto",
    goodLuck: "Auguro a tutti voi una caccia di successo.\nAndiamo – buona fortuna e divertitevi!",
    pizzaOnkel: "Il PizzaOnkel",
    copyright: "© 2024 Clan-Dashboard. Tutti i diritti riservati da PizzaOnkel.",
    goToNavigation: "Vai alla navigazione",
    navigationTitle: "Navigazione Clan",
    personalPlayerReport: "Rapporto Giocatore Personale",
    currentTotalEvent: "Periodo Evento Attuale",
    furtherLinkIndividualDays: "Link Ulteriore a Giorni Individuali",
    eventArchive: "Archivio Eventi",
    topTen: "Top Dieci",
    hallOfChamps: "Sala dei Campioni",
    contactForm: "Modulo di Contatto",
    clanMembers: "Membri del Clan",
    addMember: "Aggiungi Membro",
    memberName: "Nome Membro",
    memberRole: "Ruolo (es. Guerriero, Guaritore)",
    add: "Aggiungi",
    cancel: "Annulla",
    delete: "Elimina",
    confirmDelete: "Conferma Eliminazione",
    areYouSureDelete: "Sei sicuro di voler eliminare \"{itemName}\"?",
    noMembers: "Ancora nessun membro del clan. Aggiungi nuovi membri!",
    loading: "Caricamento Dashboard del Clan...",
    errorMessageAuth: "Errore durante l'autenticazione. Riprova più tardi.",
    errorMessageInit: "Errore all'avvio dell'app. Riprova più tardi.",
    errorMessageFetch: "Errore durante il caricamento dei dati. Riprova più tardi.",
    errorMessageAdd: "Errore durante l'aggiunta della voce.",
    errorMessageDelete: "Errore durante l'eliminazione della voce.",
    errorMessageEmptyFields: "Tutti i campi obbligatori devono essere compilati.",
    errorMessageDbNotReady: "Database non pronto o utente non autenticato.",
    yourUserId: "Il tuo ID Utente:",
    backToNavigation: "Torna alla Navigazione",
    backToInfo: "Torna alla Pagina Info",
    pageUnderConstruction: "Questa pagina è ancora in costruzione. Contenuti interessanti in arrivo!",
    jsonUpload: "Carica File JSON",
    uploadFile: "Carica File",
    selectJsonFile: "Seleziona file",
    fileUploaded: "File caricato con successo: {fileName}",
    errorUploadingFile: "Errore durante il caricamento del file.",
    errorParsingFile: "Errore durante l'analisi del file. Assicurati che sia un file JSON valido.",
    errorProcessingData: "Errore durante l'elaborazione dei dati caricati.",
    normsDefinition: "Definizione Norme",
    normName: "Nome Norma",
    troopStrengthMin: "Forza Truppe (Min)",
    troopStrengthMax: "Forza Truppe (Max)",
    addNorm: "Aggiungi Norma",
    addPlayer: "Aggiungi Giocatore",
    playerName: "Nome Giocatore",
    playerAlias: "Alias (separato da virgole)",
    playerRank: "Grado",
    playerTroopStrength: "Forza Truppe",
    savePlayer: "Salva Giocatore",
    currentNorms: "Norme Attuali",
    currentPlayers: "Giocatori Attuali",
    deleteNorm: "Elimina Norma",
    deletePlayer: "Elimina Giocatore",
    normAdded: "Norma '{itemName}' aggiunta.",
    normDeleted: "Norma '{itemName}' eliminata.",
    playerAdded: "Giocatore '{itemName}' aggiunto.",
    playerDeleted: "Giocatore '{itemName}' eliminato.",
    troopStrengthManagement: "Gestione Forza Truppe",
    newTroopStrength: "Nuova Forza Truppe (es. G1)",
    addTroopStrength: "Aggiungi Forza Truppe",
    currentTroopStrengths: "Forze Truppe Attuali",
    deleteTroopStrength: "Elimina Forza Truppe",
    rankManagement: "Gestione Gradi",
    newRank: "Nuovo Grado (es. Principiante)",
    addRank: "Aggiungi Grado",
    currentRanks: "Gradi Attuali",
    deleteRank: "Elimina Grado",
    assignNorm: "Assegna Norma",
    selectTroopStrength: "Seleziona Forza Truppe",
    normValue: "Valore Norma (Punti)",
    normAssigned: "Norma '{normValue}' assegnata per forza truppe '{troopStrength}'.",
    normMappingDeleted: "Assegnazione norma per '{itemName}' eliminata.",
    noTroopStrengths: "Nessuna forza truppe definita.",
    noRanks: "Nessun grado definito.",
    noNormsDefined: "Nessuna norma definita.",
    adminPanel: "Pannello Amministrazione",
    endCurrentPeriod: "Termina Periodo Attuale",
    confirmEndPeriod: "Sei sicuro di voler terminare il periodo evento attuale? Tutti i dati dei giocatori attuali verranno archiviati.",
    periodEndedSuccess: "Periodo evento attuale terminato e dati archiviati con successo.",
    periodEndedError: "Errore durante la terminazione del periodo evento attuale.",
    noCurrentPeriodData: "Nessun dato giocatore attuale disponibile per terminare il periodo.",
    eventName: "Nome Evento",
    periodDate: "Data Periodo",
    overallClanNormFulfillment: "Completamento Norma Clan Complessivo",
    playerList: "Lista Giocatori",
    name: "Nome",
    rank: "Grado",
    troopStrength: "Forza Truppe",
    clanChests: "Numero Bauli Clan",
    totalPoints: "Punti Totali (Attuale)",
    normTarget: "Obiettivo Norma (Previsto)",
    difference: "Differenza",
    normFulfillment: "Completamento Norma (%)",
    noPlayersInCurrentEvent: "Nessun dato giocatore disponibile per il periodo evento attuale.",
    playerDetails: "Dettagli Giocatore",
    backToCurrentEvent: "Torna al Periodo Evento Attuale",
    aliases: "Alias",
    chestCategories: "Categorie Bauli",
    eventArchiveTitle: "Archivio Eventi",
    noArchivedEvents: "Nessun evento archiviato disponibile.",
    viewDetails: "Visualizza Dettagli",
    backToArchive: "Torna all'Archivio",
    archivedPeriodDetails: "Dettagli del Periodo Archiviato",
    periodEndedAt: "Periodo Terminato il",
    topTenTitle: "Dieci Migliori Giocatori",
    noTopPlayers: "Nessun dato dei migliori giocatori disponibile.",
    hallOfChampsTitle: "Sala dei Campioni",
    noChampions: "Nessun campione disponibile.",
    champion: "Campione",
    contactFormTitle: "Modulo di Contatto",
    contactFormDescription: "Inviaci un messaggio con le tue domande, idee o suggerimenti.",
    yourName: "Il tuo Nome",
    yourEmail: "La tua Email",
    yourMessage: "Il tuo Messaggio",
    sendMessage: "Invia Messaggio",
    messageSent: "Messaggio inviato con successo!",
    messageSendError: "Errore durante l'invio del messaggio. Riprova più tardi.",
    adminAccessRestricted: "L'accesso al Pannello Amministrazione è limitato. Accedi.",
    uff2StandardsEvaluation: "Valutazione Standard UFF_2",
    uff2StandardsDescription: "Questa pagina mostra la valutazione del progresso del giocatore basata sugli Standard UFF_2.",
  },
  fr: {
    welcomeTitle: "Bienvenue sur le tableau de bord du clan !",
    selectLanguage: "Sélectionner la langue :",
    goToInfoPage: "Aller à la page d'informations",
    infoPageTitle: "À propos de notre clan et du jeu",
    clanName: "Notre clan : Union For Friends 2",
    clanDescription: "Nous sommes une communauté de joueurs passionnés dédiés à l'aventure et au succès partagé. Que ce soit COT ou KvK, nous nous soutenons mutuellement et nous amusons en le faisant.",
    gameName: "Le jeu : Total Battle",
    gameDescription: "est un jeu de guerre tactique et stratégique. Que vous soyez attaqué ou que vous meniez vous-même des raids, nous respectons toujours la nétiquette.\nNous sommes dans le Royaume n° 36 et suivons les lois du Royaume ROE 36*",
    normsInfo: "Dans ce jeu et dans notre clan, vous devez respecter les normes pour réussir vous-même et aider le clan à réussir.",
    statsInfo: "Ici, sur cette page, vous pouvez trouver des informations sur les statistiques du clan et personnelles.",
    errorSuggestion: "Si vous trouvez des erreurs ou avez des suggestions/idées pour cette page, veuillez utiliser le formulaire de contact",
    goodLuck: "Je vous souhaite à tous une chasse réussie.\nC'est parti – bonne chance et amusez-vous !",
    pizzaOnkel: "Le PizzaOnkel",
    copyright: "© 2024 Clan-Dashboard. Tous droits réservés par PizzaOnkel.",
    goToNavigation: "Aller à la navigation",
    navigationTitle: "Navigation du clan",
    personalPlayerReport: "Rapport personnel du joueur",
    currentTotalEvent: "Période d'événement actuelle",
    furtherLinkIndividualDays: "Lien supplémentaire vers les jours individuels",
    eventArchive: "Archives des événements",
    topTen: "Top Dix",
    hallOfChamps: "Hall des Champions",
    contactForm: "Formulaire de contact",
    clanMembers: "Membres du clan",
    addMember: "Ajouter un membre",
    memberName: "Nom du membre",
    memberRole: "Rôle (par exemple, Guerrier, Guérisseur)",
    add: "Ajouter",
    cancel: "Annuler",
    delete: "Supprimer",
    confirmDelete: "Confirmer la suppression",
    areYouSureDelete: "Êtes-vous sûr de vouloir supprimer \"{itemName}\" ?",
    noMembers: "Aucun membre du clan pour l'instant. Ajoutez de nouveaux membres !",
    loading: "Chargement du tableau de bord du clan...",
    errorMessageAuth: "Erreur d'authentification. Veuillez réessayer plus tard.",
    errorMessageInit: "Erreur lors du démarrage de l'application. Veuillez réessayer plus tard.",
    errorMessageFetch: "Erreur lors du chargement des données. Veuillez réessayer plus tard.",
    errorMessageAdd: "Erreur lors de l'ajout de l'entrée.",
    errorMessageDelete: "Erreur lors de la suppression de l'entrée.",
    errorMessageEmptyFields: "Tous les champs obligatoires doivent être remplis.",
    errorMessageDbNotReady: "La base de données n'est pas prête ou l'utilisateur n'est pas authentifié.",
    yourUserId: "Votre ID utilisateur :",
    backToNavigation: "Retour à la navigation",
    backToInfo: "Retour à la page d'informations",
    pageUnderConstruction: "Cette page est encore en construction. Du contenu intéressant arrive bientôt !",
    jsonUpload: "Télécharger un fichier JSON",
    uploadFile: "Télécharger un fichier",
    selectJsonFile: "Sélectionner un fichier",
    fileUploaded: "Fichier téléchargé avec succès : {fileName}",
    errorUploadingFile: "Erreur lors du téléchargement du fichier.",
    errorParsingFile: "Erreur lors de l'analyse du fichier. Veuillez vous assurer qu'il s'agit d'un fichier JSON valide.",
    errorProcessingData: "Erreur lors du traitement des données téléchargées.",
    normsDefinition: "Définition des normes",
    normName: "Nom de la norme",
    troopStrengthMin: "Force des troupes (Min)",
    troopStrengthMax: "Force des troupes (Max)",
    addNorm: "Ajouter une norme",
    addPlayer: "Ajouter un joueur",
    playerName: "Nom du joueur",
    playerAlias: "Alias (séparé par des virgules)",
    playerRank: "Rang",
    playerTroopStrength: "Force des troupes",
    savePlayer: "Sauvegarder le joueur",
    currentNorms: "Normes actuelles",
    currentPlayers: "Joueurs actuels",
    deleteNorm: "Supprimer la norme",
    deletePlayer: "Supprimer le joueur",
    normAdded: "Norme '{itemName}' ajoutée.",
    normDeleted: "Norme '{itemName}' supprimée.",
    playerAdded: "Joueur '{itemName}' ajouté.",
    playerDeleted: "Joueur '{itemName}' supprimé.",
    troopStrengthManagement: "Gestion de la force des troupes",
    newTroopStrength: "Nouvelle force des troupes (par exemple, G1)",
    addTroopStrength: "Ajouter une force des troupes",
    currentTroopStrengths: "Forces des troupes actuelles",
    deleteTroopStrength: "Supprimer la force des troupes",
    rankManagement: "Gestion des rangs",
    newRank: "Nouveau rang (par exemple, Débutant)",
    addRank: "Ajouter un rang",
    currentRanks: "Rangs actuels",
    deleteRank: "Supprimer le rang",
    assignNorm: "Attribuer une norme",
    selectTroopStrength: "Sélectionner la force des troupes",
    normValue: "Valeur de la norme (points)",
    normAssigned: "Norme '{normValue}' attribuée pour la force des troupes '{troopStrength}'.",
    normMappingDeleted: "Attribution de norme pour '{itemName}' supprimée.",
    noTroopStrengths: "Aucune force de troupes définie.",
    noRanks: "Aucun rang défini.",
    noNormsDefined: "Aucune norme définie.",
    adminPanel: "Panneau d'administration",
    endCurrentPeriod: "Terminer la période actuelle",
    confirmEndPeriod: "Êtes-vous sûr de vouloir terminer la période d'événement actuelle ? Toutes les données des joueurs actuels seront archivées.",
    periodEndedSuccess: "Période d'événement actuelle terminée et données archivées avec succès.",
    periodEndedError: "Erreur lors de la fin de la période d'événement actuelle.",
    noCurrentPeriodData: "Aucune donnée de joueur actuelle disponible pour terminer la période.",
    eventName: "Nom de l'événement",
    periodDate: "Date de la période",
    overallClanNormFulfillment: "Remplissement global des normes du clan",
    playerList: "Liste des joueurs",
    name: "Nom",
    rank: "Rang",
    troopStrength: "Force des troupes",
    clanChests: "Nombre de coffres de clan",
    totalPoints: "Points totaux (réels)",
    normTarget: "Objectif de la norme (prévu)",
    difference: "Différence",
    normFulfillment: "Remplissement de la norme (%)",
    noPlayersInCurrentEvent: "Aucune donnée de joueur disponible pour la période d'événement actuelle.",
    playerDetails: "Détails du joueur",
    backToCurrentEvent: "Retour à la période d'événement actuelle",
    aliases: "Alias",
    chestCategories: "Catégories de coffres",
    eventArchiveTitle: "Archives des événements",
    noArchivedEvents: "Aucun événement archivé disponible.",
    viewDetails: "Voir les détails",
    backToArchive: "Retour aux archives",
    archivedPeriodDetails: "Détails de la période archivée",
    periodEndedAt: "Période terminée le",
    topTenTitle: "Dix meilleurs joueurs",
    noTopPlayers: "Aucune donnée des meilleurs joueurs disponible.",
    hallOfChampsTitle: "Hall des Champions",
    noChampions: "Aucun champion disponible.",
    champion: "Champion",
    contactFormTitle: "Formulaire de contact",
    contactFormDescription: "Envoyez-nous un message avec vos questions, idées ou suggestions.",
    yourName: "Votre nom",
    yourEmail: "Votre e-mail",
    yourMessage: "Votre message",
    sendMessage: "Envoyer le message",
    messageSent: "Message envoyé avec succès !",
    messageSendError: "Erreur lors de l'envoi du message. Veuillez réessayer plus tard.",
    adminAccessRestricted: "L'accès au panneau d'administration est restreint. Veuillez vous connecter.",
    uff2StandardsEvaluation: "Évaluation des normes UFF_2",
    uff2StandardsDescription: "Cette page affiche l'évaluation de la progression du joueur basée sur les normes UFF_2.",
  },
};

/**
 * @function getTranslation
 * @description Hilfsfunktion zum Abrufen der übersetzten Texte basierend auf der aktuellen Sprache und einem Schlüssel.
 * Ersetzt Platzhalter im Text durch die übergebenen Parameter.
 * @param {string} lang - Der Sprachcode (z.B. 'de', 'en').
 * @param {string} key - Der Schlüssel des zu übersetzenden Textes.
 * @param {Object} [params={}] - Ein Objekt mit Platzhaltern und deren Werten (z.B. { itemName: "Beispiel" }).
 * @returns {string} Der übersetzte Text.
 */
const getTranslation = (lang, key, params = {}) => {
  let text = translations[lang]?.[key] || key;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    text = text.replace(`{${paramKey}}`, paramValue);
  }
  return text;
};

/**
 * @function DeleteConfirmModal
 * @description React-Komponente für ein modales Fenster zur Bestätigung des Löschvorgangs.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {Object} props.itemToDelete - Das Element, das gelöscht werden soll (enthält id und den Namen/Wert für die Anzeige).
 * @param {function} props.setShowDeleteConfirmModal - Setter-Funktion zum Steuern der Sichtbarkeit des Modals.
 * @param {function} props.setItemToDelete - Setter-Funktion zum Zurücksetzen des zu löschenden Elements.
 * @param {function} props.setErrorMessage - Setter-Funktion für Fehlermeldungen.
 * @param {function} props.deleteFunction - Die tatsächliche Löschfunktion, die aufgerufen wird.
 * @param {string} props.errorMessage - Fehlermeldung, die im Modal angezeigt werden soll.
 * @param {function} props.t - Übersetzungsfunktion.
 * @param {string} props.messageKey - Schlüssel für die Bestätigungsnachricht (z.B. 'areYouSureDelete').
 * @param {string} props.itemNameKey - Schlüssel für die Eigenschaft des Elementnamens im Übersetzungsobjekt.
 * @returns {JSX.Element} Das JSX-Element des DeleteConfirmModal.
 */
const DeleteConfirmModal = ({
  itemToDelete,
  setShowDeleteConfirmModal,
  setItemToDelete,
  setErrorMessage,
  deleteFunction,
  errorMessage,
  t,
  messageKey,
  itemNameKey,
}) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('confirmDelete')}</h3>
      <p className="text-gray-700 mb-4">
        {t(messageKey, { [itemNameKey]: itemToDelete?.name || itemToDelete?.troopStrength || itemToDelete?.rank || 'dieses Element' })}
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => {
            setShowDeleteConfirmModal(false);
            setItemToDelete(null);
            setErrorMessage('');
          }}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200 flex items-center"
        >
          <XCircle className="w-5 h-5 mr-2 text-gray-600" />
          {t('cancel')}
        </button>
        <button
          onClick={() => deleteFunction(itemToDelete.id)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 flex items-center"
        >
          <Trash2 className="w-5 h-5 mr-2 text-white" />
          {t('delete')}
        </button>
      </div>
      {errorMessage && <p className="text-red-500 text-sm mt-3">{errorMessage}</p>}
    </div>
  </div>
);

/**
 * @function EndPeriodConfirmModal
 * @description React-Komponente für ein modales Fenster zur Bestätigung des Beendens einer Veranstaltungsperiode.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.setShowEndPeriodConfirmModal - Setter-Funktion zum Steuern der Sichtbarkeit des Modals.
 * @param {function} props.endCurrentPeriod - Funktion zum Beenden der aktuellen Periode und Archivieren der Daten.
 * @param {string} props.errorMessage - Fehlermeldung, die im Modal angezeigt werden soll.
 * @param {function} props.t - Übersetzungsfunktion.
 * @returns {JSX.Element} Das JSX-Element des EndPeriodConfirmModal.
 */
const EndPeriodConfirmModal = ({
  setShowEndPeriodConfirmModal,
  endCurrentPeriod,
  errorMessage,
  t,
}) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('endCurrentPeriod')}</h3>
      <p className="text-gray-700 mb-4">
        {t('confirmEndPeriod')}
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => {
            setShowEndPeriodConfirmModal(false);
          }}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200 flex items-center"
        >
          <XCircle className="w-5 h-5 mr-2 text-gray-600" />
          {t('cancel')}
        </button>
        <button
          onClick={endCurrentPeriod}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 flex items-center"
        >
          <Archive className="w-5 h-5 mr-2 text-white" />
          {t('endCurrentPeriod')}
        </button>
      </div>
      {errorMessage && <p className="text-red-500 text-sm mt-3">{errorMessage}</p>}
    </div>
  </div>
);


/**
 * @function WelcomePage
 * @description Startseite der Anwendung. Ermöglicht die Auswahl der Sprache und die Navigation zur Informationsseite.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.setLanguage - Setter-Funktion zum Ändern der aktuellen Sprache.
 * @param {string} props.currentLanguage - Die aktuell ausgewählte Sprache.
 * @param {function} props.t - Übersetzungsfunktion.
 * @returns {JSX.Element} Das JSX-Element der WelcomePage.
 */
const WelcomePage = ({ navigateTo, setLanguage, currentLanguage, t }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 font-inter">
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-lg w-full">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">{t('welcomeTitle')}</h1>
      <div className="mb-6">
        <label htmlFor="language-select" className="block text-gray-300 text-lg mb-2">{t('selectLanguage')}</label>
        <select
          id="language-select"
          value={currentLanguage}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="ru">Русский</option>
          <option value="it">Italiano</option>
          <option value="fr">Français</option>
        </select>
      </div>
      <button
        onClick={() => navigateTo('info')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center mx-auto"
      >
        <Info className="w-6 h-6 text-blue-300 mr-2" />
        {t('goToInfoPage')}
      </button>
    </div>
  </div>
);

/**
 * @function InfoPage
 * @description Informationsseite über den Clan und das Spiel.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @returns {JSX.Element} Das JSX-Element der InfoPage.
 */
const InfoPage = ({ navigateTo, t }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 font-inter">
    <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-400">
        {t('infoPageTitle')}
      </h1>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-300 mb-3">{t('clanName')}</h2>
        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{t('clanDescription')}</p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-300 mb-3">{t('gameName')}</h2>
        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{t('gameDescription')}</p>
      </div>
      <p className="text-gray-300 leading-relaxed mb-4 whitespace-pre-line">{t('normsInfo')}</p>
      <p className="text-gray-300 leading-relaxed mb-4 whitespace-pre-line">{t('statsInfo')}</p>
      <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-line">{t('errorSuggestion')}</p>
      <p className="text-gray-300 leading-relaxed mb-6 font-semibold whitespace-pre-line">{t('goodLuck')}</p>
      <p className="text-gray-300 leading-relaxed mb-8 text-right font-bold">{t('pizzaOnkel')}</p>
      <div className="flex justify-center">
        <button
          onClick={() => navigateTo('navigation')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-blue-300 mr-2" />
          {t('goToNavigation')}
        </button>
      </div>
      <p className="text-gray-500 text-sm mt-8 text-center">{t('copyright')}</p>
    </div>
  </div>
);

/**
 * @function NavigationPage
 * @description Navigationsseite, die Links zu allen Hauptbereichen des Dashboards enthält.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @returns {JSX.Element} Das JSX-Element der NavigationPage.
 */
const NavigationPage = ({ navigateTo, t }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 font-inter">
    <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-400">
        {t('navigationTitle')}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button onClick={() => navigateTo('currentEvent')} className="p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition duration-200 text-left flex items-center">
          <Calendar className="w-7 h-7 text-green-300 mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-blue-300">{t('currentTotalEvent')}</h3>
            <p className="text-gray-400 text-sm">Zeigt die aktuellen Gesamtergebnisse der Veranstaltungsperiode an.</p>
          </div>
        </button>
        <button onClick={() => navigateTo('uff2Standards')} className="p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition duration-200 text-left flex items-center">
          <Award className="w-7 h-7 text-yellow-300 mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-blue-300">{t('uff2StandardsEvaluation')}</h3>
            <p className="text-gray-400 text-sm">{t('uff2StandardsDescription')}</p>
          </div>
        </button>
        <button onClick={() => navigateTo('eventArchive')} className="p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition duration-200 text-left flex items-center">
          <Archive className="w-7 h-7 text-purple-300 mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-blue-300">{t('eventArchive')}</h3>
            <p className="text-gray-400 text-sm">Übersicht über vergangene Veranstaltungen.</p>
          </div>
        </button>
        <button onClick={() => navigateTo('topTen')} className="p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition duration-200 text-left flex items-center">
          <ListOrdered className="w-7 h-7 text-pink-300 mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-blue-300">{t('topTen')}</h3>
            <p className="text-gray-400 text-sm">Zeigt die Top 10 Spieler in verschiedenen Kategorien an.</p>
          </div>
        </button>
        <button onClick={() => navigateTo('hallOfChamps')} className="p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition duration-200 text-left flex items-center">
          <Trophy className="w-7 h-7 text-orange-300 mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-blue-300">{t('hallOfChamps')}</h3>
            <p className="text-gray-400 text-sm">Zeigt die Champions aller Zeiten an.</p>
          </div>
        </button>
        <button onClick={() => navigateTo('contactForm')} className="p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition duration-200 text-left flex items-center">
          <Mail className="w-7 h-7 text-teal-300 mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-blue-300">{t('contactForm')}</h3>
            <p className="text-gray-400 text-sm">Kontaktiere die Administration.</p>
          </div>
        </button>
        <button onClick={() => navigateTo('adminPanel')} className="p-4 bg-red-700 rounded-lg shadow-md hover:bg-red-600 transition duration-200 text-left flex items-center">
          <Shield className="w-7 h-7 text-red-300 mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-red-300">{t('adminPanel')}</h3>
            <p className="text-gray-200 text-sm">Verwalte Clan-Einstellungen und Spielerdaten.</p>
          </div>
        </button>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => navigateTo('info')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-gray-300 mr-2" />
          {t('backToInfo')}
        </button>
      </div>
    </div>
  </div>
);

/**
 * @function PlaceholderPage
 * @description Eine generische Platzhalterkomponente für Seiten, die noch in Entwicklung sind.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {string} props.titleKey - Der Schlüssel für den Titel der Seite aus den Übersetzungen.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @returns {JSX.Element} Das JSX-Element der PlaceholderPage.
 */
const PlaceholderPage = ({ titleKey, navigateTo, t }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 font-inter">
    <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-400">
        {t(titleKey)}
      </h1>
      <p className="text-gray-300 text-lg mb-8">
        {t('pageUnderConstruction')}
      </p>
      <button
        onClick={() => navigateTo('navigation')}
        className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
      >
        <ArrowLeft className="w-6 h-6 text-gray-300 mr-2" />
        {t('backToNavigation')}
      </button>
    </div>
  </div>
);

/**
 * @function Uff2StandardsPage
 * @description Neue Seite für die UFF_2_Standards Auswertung.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @returns {JSX.Element} Das JSX-Element der Uff2StandardsPage.
 */
const Uff2StandardsPage = ({ navigateTo, t }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 font-inter">
    <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-400">
        {t('uff2StandardsEvaluation')}
      </h1>
      <p className="text-gray-300 text-lg mb-8">
        {t('uff2StandardsDescription')}
      </p>
      <button
        onClick={() => navigateTo('navigation')}
        className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
      >
        <ArrowLeft className="w-6 h-6 text-gray-300 mr-2" />
        {t('backToNavigation')}
      </button>
    </div>
  </div>
);


/**
 * @function PlayerDetailPage
 * @description Zeigt detaillierte Informationen zu einem einzelnen Spieler an, einschließlich seiner Truhenkategorien.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @param {Object} props.player - Das Spielerobjekt mit allen Details.
 * @returns {JSX.Element} Das JSX-Element der PlayerDetailPage.
 */
const PlayerDetailPage = ({ navigateTo, t, player }) => {
  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 font-inter">
        <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-400">
            {t('playerDetails')}
          </h1>
          <p className="text-gray-300 text-lg mb-8">Spielerdaten nicht gefunden.</p>
          <button
            onClick={() => navigateTo('currentEvent')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-gray-300 mr-2" />
            {t('backToCurrentEvent')}
          </button>
        </div>
      </div>
    );
  }

  // Definiert die Reihenfolge der Truhenkategorien gemäß der Projektbeschreibung für eine konsistente Anzeige.
  // Diese Liste sollte alle möglichen Kategorien aus der JSON-Datei enthalten.
  const chestCategoriesOrder = [
    "Arena Chest", "Arena Total", "Common LV5", "Common LV10", "Common LV15", "Common LV20", "Common LV25", "Common Total",
    "Rare LV10", "Rare LV15", "Rare LV20", "Rare LV25", "Rare LV30", "Rare Total",
    "Epic LV15", "Epic LV20", "Epic LV25", "Epic LV30", "Epic LV35", "Epic Total",
    "Tartaros LV15", "Tartaros LV20", "Tartaros LV25", "Tartaros LV30", "Tartaros LV35", "Tartaros Total",
    "Elven LV10", "Elven LV15", "Elven LV20", "Elven LV25", "Elven LV30", "Elven Total",
    "Cursed LV20", "Cursed LV25", "Cursed Total",
    "Wooden Chest", "Bronze Chest", "Silver Chest", "Golden Chest", "Precious Chest", "Magic Chest", "Bank Total",
    "Runic LV 20-24", "Runic LV 25-29", "Runic LV 30-34", "Runic LV 35-39", "Runic LV 40-44", "Runic LV 45", "Runic Total",
    "Heroic LV16", "Heroic LV17", "Heroic LV18", "Heroic LV19", "Heroic LV20", "Heroic LV21", "Heroic LV22", "Heroic LV23", "Heroic LV24", "Heroic LV25", "Heroic LV26", "Heroic LV27", "Heroic LV28", "Heroic LV29", "Heroic LV30", "Heroic LV31", "Heroic LV32", "Heroic LV33", "Heroic LV34", "Heroic LV35", "Heroic LV36", "Heroic LV37", "Heroic LV38", "Heroic LV39", "Heroic LV40", "Heroic LV41", "Heroic LV42", "Heroic LV43", "Heroic LV44", "Heroic LV45", "Heroic Total",
    "VotA LV 10-14", "VotA LV 15-19", "VotA LV 20-24", "VotA LV 25-29", "VotA LV 30-34", "VotA LV 35-39", "VotA LV 40-44", "VotA Total",
    "Quick March Chest", "Ancients Chest", "ROTA Total", "Epic Ancient squad", "EAs Total", "Union Chest", "Union Total", "Jormungandr's Chest", "Jormungandr Total",
    // "Points", "leerspalte", "Timestamp" - Diese sind keine Truhenkategorien im Sinne der Anzeige
  ];

  return (
    <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-400">
        {t('playerDetails')}: {player.name}
      </h1>
      <div className="mb-6 text-gray-300">
        <p className="text-lg mb-2"><span className="font-semibold">{t('name')}:</span> {player.name}</p>
        <p className="text-lg mb-2"><span className="font-semibold">{t('rank')}:</span> {player.rank}</p>
        <p className="text-lg mb-2"><span className="font-semibold">{t('troopStrength')}:</span> {player.troopStrength}</p>
        {player.aliases && player.aliases.length > 0 && (
          <p className="text-lg mb-2"><span className="font-semibold">{t('aliases')}:</span> {player.aliases.join(', ')}</p>
        )}
        <p className="text-lg mb-2"><span className="font-semibold">{t('normTarget')}:</span> {player.normCategory}</p>
        <p className="text-lg mb-2"><span className="font-semibold">{t('totalPoints')}:</span> {player.Points || 0}</p>
        <p className="text-lg mb-2"><span className="font-semibold">{t('normFulfillment')}:</span> {player.normFulfillment ? player.normFulfillment.toFixed(2) : 0}%</p>
      </div>
      <h2 className="text-2xl font-semibold text-blue-300 mb-4">{t('chestCategories')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* Filtert und zeigt nur relevante Truhenkategorien an, die im Spielerobjekt vorhanden sind */}
        {chestCategoriesOrder.filter(category => player[category] !== undefined).map(category => (
          <div key={category} className="bg-gray-700 p-3 rounded-md">
            <p className="text-gray-300 text-sm">{category}: <span className="font-medium text-gray-200">{player[category]}</span></p>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => navigateTo('currentEvent')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-gray-300 mr-2" />
          {t('backToCurrentEvent')}
        </button>
      </div>
    </div>
  );
};

// Definiert alle relevanten Truhenkategorien und "Points" für Top Ten und Hall of Champions.
// Diese Liste wird für die dynamische Erstellung der Tabellenspalten verwendet.
const ALL_CHEST_CATEGORIES = [
  "Arena Chest", "Arena Total", "Common LV5", "Common LV10", "Common LV15", "Common LV20", "Common LV25", "Common Total",
  "Rare LV10", "Rare LV15", "Rare LV20", "Rare LV25", "Rare LV30", "Rare Total",
  "Epic LV15", "Epic LV20", "Epic LV25", "Epic LV30", "Epic LV35", "Epic Total",
  "Tartaros LV15", "Tartaros LV20", "Tartaros LV25", "Tartaros LV30", "Tartaros LV35", "Tartaros Total",
  "Elven LV10", "Elven LV15", "Elven LV20", "Elven LV25", "Elven LV30", "Elven Total",
  "Cursed LV20", "Cursed LV25", "Cursed Total",
  "Wooden Chest", "Bronze Chest", "Silver Chest", "Golden Chest", "Precious Chest", "Magic Chest", "Bank Total",
  "Runic LV 20-24", "Runic LV 25-29", "Runic LV 30-34", "Runic LV 35-39", "Runic LV 40-44", "Runic LV 45", "Runic Total",
  "Heroic LV16", "Heroic LV17", "Heroic LV18", "Heroic LV19", "Heroic LV20", "Heroic LV21", "Heroic LV22", "Heroic LV23", "Heroic LV24", "Heroic LV25", "Heroic LV26", "Heroic LV27", "Heroic LV28", "Heroic LV29", "Heroic LV30", "Heroic LV31", "Heroic LV32", "Heroic LV33", "Heroic LV34", "Heroic LV35", "Heroic LV36", "Heroic LV37", "Heroic LV38", "Heroic LV39", "Heroic LV40", "Heroic LV41", "Heroic LV42", "Heroic LV43", "Heroic LV44", "Heroic LV45", "Heroic Total",
    "VotA LV 10-14", "VotA LV 15-19", "VotA LV 20-24", "VotA LV 25-29", "VotA LV 30-34", "VotA LV 35-39", "VotA LV 40-44", "VotA Total",
  "Quick March Chest", "Ancients Chest", "ROTA Total", "Epic Ancient squad", "EAs Total", "Union Chest", "Union Total", "Jormungandr's Chest", "Jormungandr Total",
  "Points" // "Points" ist eine spezielle Kategorie für die Gesamtpunktzahl
];


/**
 * @function CurrentEventPage
 * @description Zeigt die aktuellen Spielergebnisse und die Normerfüllung für die aktuelle Veranstaltungsperiode an.
 * Ermöglicht den Drilldown zu detaillierten Spielerberichten.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @param {Object} props.db - Die Firestore-Datenbankinstanz.
 * @param {string} props.appId - Die Anwendungs-ID für Firestore-Pfade.
 * @param {string} props.userId - Die ID des aktuell angemeldeten Benutzers.
 * @returns {JSX.Element} Das JSX-Element der CurrentEventPage.
 */
const CurrentEventPage = ({ navigateTo, t, db, appId, userId }) => {
  const [players, setPlayers] = useState([]);
  const [normsMapping, setNormsMapping] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  /**
   * @description Effekt-Hook zum Abrufen der Spielerdaten für das aktuelle Event und der Normen-Mappings.
   * Abonniert Änderungen in Echtzeit.
   */
  useEffect(() => {
    if (!db || !userId) return;

    // Spieler für das aktuelle Event abrufen
    const unsubscribePlayers = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/currentEventPlayers`),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(data);
      },
      (error) => console.error("Error fetching current event players:", error)
    );

    // Normen-Mappings abrufen
    const unsubscribeNorms = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/norms`),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNormsMapping(data);
      },
      (error) => console.error("Error fetching norms:", error)
    );

    return () => {
      unsubscribePlayers();
      unsubscribeNorms();
    };
  }, [db, userId, appId]);

  // Berechnet die Gesamtpunkte und die Normerfüllung für jeden Spieler.
  const playersWithCalculations = players.map(player => {
    // Finde die Norm für die Truppenstärke des Spielers
    const normTarget = normsMapping.find(norm => norm.troopStrength === player.troopStrength)?.norm || 0;
    const totalPoints = player.Points || 0; // Annahme: Gesamtpunkte sind im Feld "Points"
    const difference = totalPoints - normTarget;
    const normFulfillment = normTarget > 0 ? (totalPoints / normTarget) * 100 : 0;

    return {
      ...player,
      normTarget,
      totalPoints,
      difference,
      normFulfillment,
    };
  });

  // Berechnet die gesamte Clan-Normerfüllung.
  const totalActualPoints = playersWithCalculations.reduce((sum, player) => sum + player.totalPoints, 0);
  const totalNormTargets = playersWithCalculations.reduce((sum, player) => sum + player.normTarget, 0);
  const overallNormFulfillment = totalNormTargets > 0 ? (totalActualPoints / totalNormTargets) * 100 : 0;

  // Wenn ein Spieler ausgewählt wurde, zeige die Detailseite an.
  if (selectedPlayer) {
    return <PlayerDetailPage navigateTo={navigateTo} t={t} player={selectedPlayer} />;
  }

  return (
    <div className="w-full max-w-6xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-400">
        {t('currentTotalEvent')}
      </h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateTo('navigation')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300 mr-2" />
          <span>{t('backToNavigation')}</span>
        </button>
      </div>
      <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">{t('overallClanNormFulfillment')}</h2>
        <div className="w-full bg-gray-600 rounded-full h-8">
          <div
            className="bg-green-500 h-8 rounded-full text-right pr-2 flex items-center justify-end text-sm font-bold"
            style={{ width: `${Math.min(100, overallNormFulfillment)}%` }}
          >
            {overallNormFulfillment.toFixed(2)}%
          </div>
        </div>
        {overallNormFulfillment < 100 && (
          <p className="text-red-300 text-sm mt-2">Noch { (100 - overallNormFulfillment).toFixed(2) }% bis zur vollständigen Normerfüllung des Clans!</p>
        )}
      </div>
      <h2 className="text-2xl font-semibold text-blue-300 mb-4">{t('playerList')}</h2>
      {playersWithCalculations.length === 0 ? (
        <p className="text-center text-gray-400 text-lg py-10">
          {t('noPlayersInCurrentEvent')}
        </p>
      ) : (
        <div className="overflow-x-auto bg-gray-700 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('name')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('rank')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('troopStrength')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('totalPoints')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('normTarget')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('difference')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('normFulfillment')}</th>
                {/* Dynamisch Truhenkategorie-Header hinzufügen */}
                {ALL_CHEST_CATEGORIES.filter(cat => cat !== "Points").map(category => (
                  <th key={category} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{category}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {playersWithCalculations.map((player) => (
                <tr key={player.id} className="hover:bg-gray-600">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-300 cursor-pointer" onClick={() => navigateTo('playerReport', player)}>
                    {player.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player.rank}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player.troopStrength}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player.totalPoints}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player.normTarget}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player.difference}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="w-24 bg-gray-500 rounded-full h-4">
                      <div
                        className="bg-blue-400 h-4 rounded-full"
                        style={{ width: `${Math.min(100, player.normFulfillment)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2">{player.normFulfillment.toFixed(1)}%</span>
                  </td>
                  {/* Dynamisch Truhenkategorie-Daten hinzufügen */}
                  {ALL_CHEST_CATEGORIES.filter(cat => cat !== "Points").map(category => (
                    <td key={category} className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player[category] || 0}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/**
 * @function ArchivedPeriodDetailsPage
 * @description Zeigt detaillierte Spielerdaten für eine spezifische archivierte Veranstaltungsperiode an.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @param {Object} props.db - Die Firestore-Datenbankinstanz.
 * @param {string} props.appId - Die Anwendungs-ID für Firestore-Pfade.
 * @param {string} props.userId - Die ID des aktuell angemeldeten Benutzers.
 * @param {string} props.archivedPeriodId - Die ID der archivierten Periode, deren Details angezeigt werden sollen.
 * @returns {JSX.Element} Das JSX-Element der ArchivedPeriodDetailsPage.
 */
const ArchivedPeriodDetailsPage = ({ navigateTo, t, db, appId, userId, archivedPeriodId }) => {
  const [players, setPlayers] = useState([]);
  const [normsMapping, setNormsMapping] = useState([]);
  const [periodInfo, setPeriodInfo] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  /**
   * @description Effekt-Hook zum Abrufen der Periodeninformationen, Spielerdaten und Normen-Mappings für die archivierte Periode.
   * Abonniert Änderungen in Echtzeit.
   */
  useEffect(() => {
    if (!db || !userId || !archivedPeriodId) return;

    // Periodeninformationen abrufen
    const periodDocRef = doc(db, `artifacts/${appId}/public/data/eventArchive`, archivedPeriodId);
    const unsubscribePeriod = onSnapshot(periodDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setPeriodInfo(docSnap.data());
      } else {
        console.warn("Archived period not found:", archivedPeriodId);
        setPeriodInfo(null);
      }
    }, (error) => console.error("Error fetching archived period info:", error));

    // Spieler für die spezifische archivierte Periode abrufen
    const unsubscribePlayers = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/eventArchive/${archivedPeriodId}/players`),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(data);
      },
      (error) => console.error("Error fetching archived players:", error)
    );

    // Normen-Mappings abrufen (angenommen, Normen sind global oder werden aus einer konsistenten Quelle abgerufen)
    const unsubscribeNorms = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/norms`),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNormsMapping(data);
      },
      (error) => console.error("Error fetching norms:", error)
    );

    return () => {
      unsubscribePeriod();
      unsubscribePlayers();
      unsubscribeNorms();
    };
  }, [db, userId, appId, archivedPeriodId]);

  // Berechnet die Gesamtpunkte und die Normerfüllung für jeden Spieler in der archivierten Periode.
  const playersWithCalculations = players.map(player => {
    const normTarget = normsMapping.find(norm => norm.troopStrength === player.troopStrength)?.norm || 0;
    const totalPoints = player.Points || 0;
    const difference = totalPoints - normTarget;
    const normFulfillment = normTarget > 0 ? (totalPoints / normTarget) * 100 : 0;

    return {
      ...player,
      normTarget,
      totalPoints,
      difference,
      normFulfillment,
    };
  });

  // Berechnet die gesamte Clan-Normerfüllung für die archivierte Periode.
  const totalActualPoints = playersWithCalculations.reduce((sum, player) => sum + player.totalPoints, 0);
  const totalNormTargets = playersWithCalculations.reduce((sum, player) => sum + player.normTarget, 0);
  const overallNormFulfillment = totalNormTargets > 0 ? (totalActualPoints / totalNormTargets) * 100 : 0;

  // Wenn ein Spieler ausgewählt wurde, zeige die Detailseite an.
  if (selectedPlayer) {
    return <PlayerDetailPage navigateTo={navigateTo} t={t} player={selectedPlayer} />;
  }

  return (
    <div className="w-full max-w-6xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-400">
        {t('archivedPeriodDetails')}
      </h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateTo('eventArchive')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300 mr-2" />
          <span>{t('backToArchive')}</span>
        </button>
      </div>
      {periodInfo && (
        <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">{t('periodEndedAt')}: {new Date(periodInfo.periodEndedAt).toLocaleString()}</h2>
          <h3 className="text-xl font-semibold text-blue-300 mb-4">{t('overallClanNormFulfillment')}</h3>
          <div className="w-full bg-gray-600 rounded-full h-8">
            <div
              className="bg-green-500 h-8 rounded-full text-right pr-2 flex items-center justify-end text-sm font-bold"
              style={{ width: `${Math.min(100, overallNormFulfillment)}%` }}
            >
              {overallNormFulfillment.toFixed(2)}%
            </div>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-semibold text-blue-300 mb-4">{t('playerList')}</h2>
      {playersWithCalculations.length === 0 ? (
        <p className="text-center text-gray-400 text-lg py-10">
          Keine Spielerdaten für diese archivierte Periode vorhanden.
        </p>
      ) : (
        <div className="overflow-x-auto bg-gray-700 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('name')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('rank')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('troopStrength')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('totalPoints')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('normTarget')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('difference')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{t('normFulfillment')}</th>
                {ALL_CHEST_CATEGORIES.filter(cat => cat !== "Points").map(category => (
                  <th key={category} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">{category}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {playersWithCalculations.map((player) => (
                <tr key={player.id} className="hover:bg-gray-600">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-300 cursor-pointer" onClick={() => navigateTo('playerReport', player)}>
                    {player.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player.rank}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player.troopStrength}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player.totalPoints}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player.normTarget}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player.difference}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="w-24 bg-gray-500 rounded-full h-4">
                      <div
                        className="bg-blue-400 h-4 rounded-full"
                        style={{ width: `${Math.min(100, player.normFulfillment)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2">{player.normFulfillment.toFixed(1)}%</span>
                  </td>
                  {ALL_CHEST_CATEGORIES.filter(cat => cat !== "Points").map(category => (
                    <td key={category} className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{player[category] || 0}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/**
 * @function EventArchivePage
 * @description Zeigt eine Liste aller archivierten Veranstaltungsperioden an.
 * Ermöglicht die Navigation zu den Details jeder archivierten Periode.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @param {Object} props.db - Die Firestore-Datenbankinstanz.
 * @param {string} props.appId - Die Anwendungs-ID für Firestore-Pfade.
 * @param {string} props.userId - Die ID des aktuell angemeldeten Benutzers.
 * @returns {JSX.Element} Das JSX-Element der EventArchivePage.
 */
const EventArchivePage = ({ navigateTo, t, db, appId, userId }) => {
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [selectedArchivedPeriodId, setSelectedArchivedPeriodId] = useState(null);

  /**
   * @description Effekt-Hook zum Abrufen aller archivierten Events aus Firestore.
   * Abonniert Änderungen in Echtzeit.
   */
  useEffect(() => {
    if (!db || !userId) return;

    const archiveCollectionRef = collection(db, `artifacts/${appId}/public/data/eventArchive`);
    const q = query(archiveCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArchivedEvents(eventsData);
    }, (error) => {
      console.error("Error fetching archived events:", error);
    });

    return () => unsubscribe();
  }, [db, userId, appId]);

  // Wenn eine archivierte Periode ausgewählt wurde, zeige die Detailseite an.
  if (selectedArchivedPeriodId) {
    return (
      <ArchivedPeriodDetailsPage
        navigateTo={navigateTo}
        t={t}
        db={db}
        appId={appId}
        userId={userId}
        archivedPeriodId={selectedArchivedPeriodId}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-400">
        {t('eventArchiveTitle')}
      </h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateTo('navigation')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300 mr-2" />
          <span>{t('backToNavigation')}</span>
        </button>
      </div>
      {archivedEvents.length === 0 ? (
        <p className="text-center text-gray-400 text-lg py-10">
          {t('noArchivedEvents')}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedEvents.map((event) => (
            <div key={event.id} className="bg-gray-700 p-5 rounded-lg shadow-xl border border-gray-600 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-blue-300 mb-2">Archivierte Periode</h2>
                <p className="text-gray-300 text-lg mb-3">
                  {t('periodEndedAt')}: <span className="font-medium text-gray-200">{new Date(event.periodEndedAt).toLocaleString()}</span>
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => navigateTo('archivedPeriodDetails', event.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-200 flex items-center"
                >
                  <Info className="w-5 h-5 mr-2 text-blue-300" />
                  {t('viewDetails')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * @function fetchAllPlayers
 * @description Hilfsfunktion zum Abrufen aller Spielerdaten, sowohl der aktuellen als auch der archivierten.
 * Durchsucht die 'currentEventPlayers'-Sammlung und alle 'players'-Unterkollektionen in 'eventArchive'.
 * @param {Object} db - Die Firestore-Datenbankinstanz.
 * @param {string} appId - Die Anwendungs-ID für Firestore-Pfade.
 * @returns {Promise<Array<Object>>} Eine Promise, die ein Array aller Spielerobjekte zurückgibt.
 */
const fetchAllPlayers = async (db, appId) => {
  let allPlayers = [];

  // Aktuelle Event-Spieler abrufen
  const currentPlayersSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/currentEventPlayers`));
  currentPlayersSnapshot.forEach(doc => {
    allPlayers.push({ id: doc.id, ...doc.data() });
  });

  // Alle archivierten Perioden abrufen und deren Spieler hinzufügen
  const archivedPeriodsSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventArchive`));
  for (const periodDoc of archivedPeriodsSnapshot.docs) {
    const archivedPlayersSnapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/eventArchive/${periodDoc.id}/players`));
    archivedPlayersSnapshot.forEach(playerDoc => {
      allPlayers.push({ id: playerDoc.id, ...playerDoc.data() });
    });
  }
  return allPlayers;
};

/**
 * @function TopTenPage
 * @description Zeigt die Top-10-Spieler für jede definierte Truhenkategorie basierend auf allen verfügbaren Spielerdaten (aktuell und archiviert).
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @param {Object} props.db - Die Firestore-Datenbankinstanz.
 * @param {string} props.appId - Die Anwendungs-ID für Firestore-Pfade.
 * @param {string} props.userId - Die ID des aktuell angemeldeten Benutzers.
 * @returns {JSX.Element} Das JSX-Element der TopTenPage.
 */
const TopTenPage = ({ navigateTo, t, db, appId, userId }) => {
  const [topPlayers, setTopPlayers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * @description Effekt-Hook zum Abrufen und Berechnen der Top-10-Spieler.
   * Ruft alle Spielerdaten ab und sortiert sie nach jeder Kategorie.
   */
  useEffect(() => {
    const getTopPlayers = async () => {
      if (!db || !userId) {
        setError(t('errorMessageDbNotReady'));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const allPlayers = await fetchAllPlayers(db, appId);
        const calculatedTopPlayers = {};

        // Iteriert über alle definierten Kategorien und berechnet die Top 10.
        ALL_CHEST_CATEGORIES.forEach(category => {
          // Filtert Spieler, die einen Wert für die aktuelle Kategorie haben, und sortiert sie absteigend.
          const sortedPlayers = [...allPlayers]
            .filter(player => player[category] !== undefined && player[category] !== null)
            .sort((a, b) => (b[category] || 0) - (a[category] || 0));
          calculatedTopPlayers[category] = sortedPlayers.slice(0, 10);
        });
        setTopPlayers(calculatedTopPlayers);
      } catch (err) {
        console.error("Error fetching top players:", err);
        setError(t('errorMessageFetch'));
      } finally {
        setLoading(false);
      }
    };
    getTopPlayers();
  }, [db, appId, userId, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-700">{t('loading')}</p>
          <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-400">
        {t('topTenTitle')}
      </h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateTo('navigation')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300 mr-2" />
          <span>{t('backToNavigation')}</span>
        </button>
      </div>
      {error && (
        <div className="bg-red-600 p-3 rounded-md mb-4 text-center">
          <p className="text-white">{error}</p>
        </div>
      )}
      {Object.keys(topPlayers).length === 0 && !loading && !error ? (
        <p className="text-center text-gray-400 text-lg py-10">
          {t('noTopPlayers')}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_CHEST_CATEGORIES.map(category => (
            <div key={category} className="bg-gray-700 p-5 rounded-lg shadow-xl border border-gray-600">
              <h2 className="text-xl font-semibold text-blue-300 mb-3">{category}</h2>
              {topPlayers[category] && topPlayers[category].length > 0 ? (
                <ol className="list-decimal list-inside space-y-1 text-gray-300">
                  {topPlayers[category].map((player, index) => (
                    <li key={player.id} className="flex justify-between items-center">
                      <span>{index + 1}. {player.name}</span>
                      <span className="font-bold text-blue-200">{player[category] || 0}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-400 text-sm">Keine Daten für diese Kategorie.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * @function HallOfChampsPage
 * @description Zeigt die Champions für jede definierte Truhenkategorie an, d.h. den Spieler mit dem höchsten Wert in dieser Kategorie über alle Zeiten.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @param {Object} props.db - Die Firestore-Datenbankinstanz.
 * @param {string} props.appId - Die Anwendungs-ID für Firestore-Pfade.
 * @param {string} props.userId - Die ID des aktuell angemeldeten Benutzers.
 * @returns {JSX.Element} Das JSX-Element der HallOfChampsPage.
 */
const HallOfChampsPage = ({ navigateTo, t, db, appId, userId }) => {
  const [champions, setChampions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * @description Effekt-Hook zum Abrufen und Berechnen der Champions.
   * Ruft alle Spielerdaten ab und ermittelt den Champion für jede Kategorie.
   */
  useEffect(() => {
    const getChampions = async () => {
      if (!db || !userId) {
        setError(t('errorMessageDbNotReady'));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const allPlayers = await fetchAllPlayers(db, appId);
        const calculatedChampions = {};

        // Iteriert über alle definierten Kategorien und ermittelt den Champion.
        ALL_CHEST_CATEGORIES.forEach(category => {
          let currentChampion = null;
          allPlayers.forEach(player => {
            const value = player[category] || 0;
            // Wenn der aktuelle Spieler einen höheren Wert hat oder es noch keinen Champion gibt, setze ihn als Champion.
            if (value > 0 && (!currentChampion || value > (currentChampion[category] || 0))) {
              currentChampion = player;
            }
          });
          if (currentChampion) {
            calculatedChampions[category] = currentChampion;
          }
        });
        setChampions(calculatedChampions);
      } catch (err) {
        console.error("Error fetching champions:", err);
        setError(t('errorMessageFetch'));
      } finally {
        setLoading(false);
      }
    };
    getChampions();
  }, [db, appId, userId, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-700">{t('loading')}</p>
          <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-400">
        {t('hallOfChampsTitle')}
      </h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateTo('navigation')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300 mr-2" />
          <span>{t('backToNavigation')}</span>
        </button>
      </div>
      {error && (
        <div className="bg-red-600 p-3 rounded-md mb-4 text-center">
          <p className="text-white">{error}</p>
        </div>
      )}
      {Object.keys(champions).length === 0 && !loading && !error ? (
        <p className="text-center text-gray-400 text-lg py-10">
          {t('noChampions')}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_CHEST_CATEGORIES.map(category => (
            <div key={category} className="bg-gray-700 p-5 rounded-lg shadow-xl border border-gray-600">
              <h2 className="text-xl font-semibold text-blue-300 mb-3">{category} {t('champion')}</h2>
              {champions[category] ? (
                <div className="text-gray-300">
                  <p className="text-lg font-bold">{champions[category].name}</p>
                  <p className="text-sm">Wert: <span className="font-bold text-blue-200">{champions[category][category]}</span></p>
                  <p className="text-sm">Rang: {champions[category].rank}</p>
                  <p className="text-sm">Truppenstärke: {champions[category].troopStrength}</p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Kein Champion für diese Kategorie.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * @function ContactFormPage
 * @description Komponente für ein Kontaktformular, über das Benutzer Nachrichten an die Administration senden können.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @returns {JSX.Element} Das JSX-Element der ContactFormPage.
 */
const ContactFormPage = ({ navigateTo, t }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  /**
   * @function handleSubmit
   * @description Behandelt das Absenden des Kontaktformulars.
   * Führt eine einfache Validierung durch und simuliert das Senden der Nachricht.
   * @param {Object} e - Das Event-Objekt des Formulars.
   * @returns {Promise<void>} Eine Promise, die aufgelöst wird, wenn die Nachricht "gesendet" wurde.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setIsError(false);

    if (!name || !email || !message) {
      setStatusMessage(t('errorMessageEmptyFields'));
      setIsError(true);
      return;
    }

    // Simuliert das Senden einer E-Mail/Nachricht (in einer echten App wäre dies ein API-Aufruf)
    try {
      console.log("Sending message:", { name, email, message });
      setStatusMessage(t('messageSent'));
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      setStatusMessage(t('messageSendError'));
      setIsError(true);
    }
  };

  return (
    <div className="w-full max-w-xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-400">
        {t('contactFormTitle')}
      </h1>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateTo('navigation')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300 mr-2" />
          <span>{t('backToNavigation')}</span>
        </button>
      </div>
      <p className="text-gray-300 mb-6 text-center">{t('contactFormDescription')}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
            {t('yourName')}
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded-md w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder={t('yourName')}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
            {t('yourEmail')}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded-md w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder={t('yourEmail')}
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-gray-300 text-sm font-bold mb-2">
            {t('yourMessage')}
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
            className="shadow appearance-none border rounded-md w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder={t('yourMessage')}
          ></textarea>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <Send className="w-6 h-6 text-blue-300 mr-2" />
            {t('sendMessage')}
          </button>
        </div>
        {statusMessage && (
          <p className={`mt-4 text-center ${isError ? 'text-red-500' : 'text-green-500'}`}>
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
};

/**
 * @function AdminPanel
 * @description Administrationspanel zur Verwaltung von Truppenstärken, Rängen, Normen und Spielerdaten.
 * Ermöglicht das Hochladen von JSON-Dateien, das Hinzufügen/Löschen von Einträgen und das Beenden von Perioden.
 * Beinhaltet nun auch die Clan-Mitgliederverwaltung.
 * @param {Object} props - Die Eigenschaften der Komponente.
 * @param {function} props.navigateTo - Funktion zur Navigation zwischen Seiten.
 * @param {function} props.t - Übersetzungsfunktion.
 * @param {function} props.setErrorMessage - Setter-Funktion für Fehlermeldungen.
 * @param {string} props.errorMessage - Aktuelle Fehlermeldung.
 * @param {Object} props.db - Die Firestore-Datenbankinstanz.
 * @param {string} props.appId - Die Anwendungs-ID für Firestore-Pfade.
 * @param {string} props.userId - Die ID des aktuell angemeldeten Benutzers.
 * @returns {JSX.Element} Das JSX-Element des AdminPanels.
 */
const AdminPanel = ({ navigateTo, t, setErrorMessage, errorMessage, db, appId, userId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [newTroopStrength, setNewTroopStrength] = useState('');
  const [troopStrengthsList, setTroopStrengthsList] = useState([]);
  const [newRank, setNewRank] = useState('');
  const [ranksList, setRanksList] = useState([]);
  const [selectedTroopStrengthForNorm, setSelectedTroopStrengthForNorm] = useState('');
  const [normValue, setNormValue] = useState('');
  const [normsMapping, setNormsMapping] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [playerAlias, setPlayerAlias] = useState('');
  const [playerRank, setPlayerRank] = useState('');
  const [playerTroopStrength, setPlayerTroopStrength] = useState('');
  const [players, setPlayers] = useState([]);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showEndPeriodConfirmModal, setShowEndPeriodConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteFunctionToCall, setDeleteFunctionToCall] = useState(null);
  const [deleteMessageKey, setDeleteMessageKey] = useState('');
  const [deleteItemNameKey, setDeleteItemNameKey] = useState('');

  /**
   * @description Effekt-Hook zum Abrufen aller Verwaltungsdaten (Truppenstärken, Ränge, Normen, aktuelle Spieler) aus Firestore.
   * Abonniert Änderungen in Echtzeit.
   */
  useEffect(() => {
    if (!db || !userId) return;

    // Truppenstärken abrufen
    const unsubscribeTroopStrengths = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/troopStrengths`),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTroopStrengthsList(data);
      },
      (error) => console.error("Error fetching troop strengths:", error)
    );

    // Ränge abrufen
    const unsubscribeRanks = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/ranks`),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRanksList(data);
      },
      (error) => console.error("Error fetching ranks:", error)
    );

    // Normen-Mappings abrufen
    const unsubscribeNorms = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/norms`),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNormsMapping(data);
      },
      (error) => console.error("Error fetching norms:", error)
    );

    // Spieler für das aktuelle Event abrufen
    const unsubscribePlayers = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/currentEventPlayers`),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(data);
      },
      (error) => console.error("Error fetching current event players:", error)
    );

    // Cleanup-Funktion für alle Listener
    return () => {
      unsubscribeTroopStrengths();
      unsubscribeRanks();
      unsubscribeNorms();
      unsubscribePlayers();
    };
  }, [db, userId, appId]);

  // Wenn kein userId vorhanden ist, wird der Zugriff verweigert.
  if (!userId) {
    return (
      <div className="w-full max-w-xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-red-400">
          {t('adminPanel')}
        </h1>
        <p className="text-red-300 text-lg mb-8">
          {t('adminAccessRestricted')}
        </p>
        <button
          onClick={() => navigateTo('navigation')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-gray-300 mr-2" />
          {t('backToNavigation')}
        </button>
      </div>
    );
  }

  /**
   * @function addItemToFirestore
   * @description Eine generische Funktion zum Hinzufügen oder Aktualisieren eines Dokuments in einer Firestore-Sammlung.
   * @param {string} collectionName - Der Name der Sammlung (z.B. 'troopStrengths', 'ranks').
   * @param {Object} itemData - Die Daten des hinzuzufügenden/aktualisierenden Dokuments.
   * @param {string} successMessageKey - Der Schlüssel für die Erfolgsmeldung aus den Übersetzungen.
   * @param {string} itemDisplayName - Der Anzeigename des Elements für die Erfolgsmeldung.
   * @returns {Promise<boolean>} True, wenn erfolgreich, False bei einem Fehler.
   */
  const addItemToFirestore = async (collectionName, itemData, successMessageKey, itemDisplayName) => {
    if (!db || !userId) {
      setErrorMessage(t('errorMessageDbNotReady'));
      return false;
    }
    try {
      const colRef = collection(db, `artifacts/${appId}/public/data/${collectionName}`);
      // Versucht, einen eindeutigen Dokument-ID basierend auf 'name' oder 'troopStrength' zu verwenden,
      // andernfalls lässt Firestore eine ID generieren.
      const docRef = itemData.name || itemData.troopStrength ? doc(colRef, itemData.name || itemData.troopStrength) : doc(colRef);
      await setDoc(docRef, itemData);
      setErrorMessage(t(successMessageKey, { itemName: itemData.name || itemData.troopStrength || itemData.rank || itemData.id }));
      return true;
    } catch (e) {
      console.error(`Error adding item to ${collectionName}:`, e);
      setErrorMessage(t('errorMessageAdd'));
      return false;
    }
  };

  /**
   * @function deleteItemFromFirestore
   * @description Eine generische Funktion zum Löschen eines Dokuments aus einer Firestore-Sammlung.
   * @param {string} collectionName - Der Name der Sammlung.
   * @param {string} itemId - Die ID des zu löschenden Dokuments.
   * @param {string} successMessageKey - Der Schlüssel für die Erfolgsmeldung aus den Übersetzungen.
   * @param {string} itemDisplayName - Der Anzeigename des Elements für die Erfolgsmeldung.
   * @returns {Promise<boolean>} True, wenn erfolgreich, False bei einem Fehler.
   */
  const deleteItemFromFirestore = async (collectionName, itemId, successMessageKey, itemDisplayName) => {
    if (!db || !userId) {
      setErrorMessage(t('errorMessageDbNotReady'));
      return false;
    }
    try {
      const docRef = doc(db, `artifacts/${appId}/public/data/${collectionName}`, itemId);
      await deleteDoc(docRef);
      setErrorMessage(t(successMessageKey, { itemName: itemId }));
      return true;
    } catch (e) {
      console.error("Fehler beim Löschen des Dokuments: ", e);
      setErrorMessage(t('errorMessageDelete'));
      return false;
    } finally {
      // Schließt das Bestätigungsmodal und setzt die Zustände zurück, unabhängig vom Erfolg.
      setShowDeleteConfirmModal(false);
      setItemToDelete(null);
      setDeleteFunctionToCall(null);
    }
  };

  /**
   * @function handleFileChange
   * @description Behandelt die Auswahl einer Datei im Dateiupload-Feld.
   * @param {Object} event - Das Event-Objekt des Input-Feldes.
   */
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setErrorMessage('');
  };

  /**
   * @function handleFileUpload
   * @description Verarbeitet das Hochladen einer JSON-Datei mit Spielerdaten.
   * Parst die JSON-Datei und aktualisiert oder fügt Spielerdaten in Firestore hinzu.
   * Versucht, vorhandene Spieler anhand von Name oder Alias zu finden und zu aktualisieren.
   * @returns {Promise<void>}
   */
  const handleFileUpload = () => {
    if (!selectedFile) {
      setErrorMessage(t('errorUploadingFile'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonContent = JSON.parse(e.target.result);

        if (!Array.isArray(jsonContent)) {
          setErrorMessage("Die JSON-Datei muss ein Array von Spielerobjekten enthalten.");
          return;
        }

        if (!db || !userId) {
          setErrorMessage(t('errorMessageDbNotReady'));
          return;
        }

        const currentPlayersCollectionRef = collection(db, `artifacts/${appId}/public/data/currentEventPlayers`);
        const batch = writeBatch(db); // Korrektur: writeBatch(db) statt db.batch()

        for (const playerJson of jsonContent) {
          // Versucht, einen bestehenden Spieler anhand des Namens oder Alias zu finden
          const existingPlayersQuery = query(currentPlayersCollectionRef);
          const existingPlayersSnapshot = await getDocs(existingPlayersQuery);
          let existingPlayerDoc = null;

          // Zuerst nach exaktem Namen suchen
          existingPlayerDoc = existingPlayersSnapshot.docs.find(doc => doc.data().name === playerJson.Name);

          // Wenn nicht nach Name gefunden, nach Aliasen suchen
          if (!existingPlayerDoc && playerJson.Alias) {
            const aliases = playerJson.Alias.split(',').map(a => a.trim()).filter(a => a !== '');
            existingPlayerDoc = existingPlayersSnapshot.docs.find(doc =>
              doc.data().aliases && aliases.some(alias => doc.data().aliases.includes(alias))
            );
          }

          // Referenz zum Dokument (neu oder bestehend)
          const playerRef = existingPlayerDoc ? doc(currentPlayersCollectionRef, existingPlayerDoc.id) : doc(currentPlayersCollectionRef);

          // Bereitet die Spielerdaten vor, indem JSON-Schlüssel auf Firestore-Schlüssel abgebildet werden.
          // Initialisiert alle Truhenkategorien mit 0, falls nicht vorhanden.
          const playerData = {
            name: playerJson.Name || 'Unbekannt',
            rank: playerJson.Rang || 'Unbekannt',
            troopStrength: playerJson.Truppenstärke || 'Unbekannt',
            aliases: playerJson.Alias ? playerJson.Alias.split(',').map(a => a.trim()).filter(a => a !== '') : [],
            "Arena Chest": playerJson["Arena Chest"] || 0,
            "Arena Total": playerJson["Arena Total"] || 0,
            "Common LV5": playerJson["Common LV5"] || 0,
            "Common LV10": playerJson["Common LV10"] || 0,
            "Common LV15": playerJson["Common LV15"] || 0,
            "Common LV20": playerJson["Common LV20"] || 0,
            "Common LV25": playerJson["Common LV25"] || 0,
            "Common Total": playerJson["Common Total"] || 0,
            "Rare LV10": playerJson["Rare LV10"] || 0,
            "Rare LV15": playerJson["Rare LV15"] || 0,
            "Rare LV20": playerJson["Rare LV20"] || 0,
            "Rare LV25": playerJson["Rare LV25"] || 0,
            "Rare LV30": playerJson["Rare LV30"] || 0,
            "Rare Total": playerJson["Rare Total"] || 0,
            "Epic LV15": playerJson["Epic LV15"] || 0,
            "Epic LV20": playerJson["Epic LV20"] || 0,
            "Epic LV25": playerJson["Epic LV25"] || 0,
            "Epic LV30": playerJson["Epic LV30"] || 0,
            "Epic LV35": playerJson["Epic LV35"] || 0,
            "Epic Total": playerJson["Epic Total"] || 0,
            "Tartaros LV15": playerJson["Tartaros LV15"] || 0,
            "Tartaros LV20": playerJson["Tartaros LV20"] || 0,
            "Tartaros LV25": playerJson["Tartaros LV25"] || 0,
            "Tartaros LV30": playerJson["Tartaros LV30"] || 0,
            "Tartaros LV35": playerJson["Tartaros LV35"] || 0,
            "Tartaros Total": playerJson["Tartaros Total"] || 0,
            "Elven LV10": playerJson["Elven LV10"] || 0,
            "Elven LV15": playerJson["Elven LV15"] || 0,
            "Elven LV20": playerJson["Elven LV20"] || 0,
            "Elven LV25": playerJson["Elven LV25"] || 0,
            "Elven LV30": playerJson["Elven LV30"] || 0,
            "Elven Total": playerJson["Elven Total"] || 0,
            "Cursed LV20": playerJson["Cursed LV20"] || 0,
            "Cursed LV25": playerJson["Cursed LV25"] || 0,
            "Cursed Total": playerJson["Cursed Total"] || 0,
            "Wooden Chest": playerJson["Wooden Chest"] || 0,
            "Bronze Chest": playerJson["Bronze Chest"] || 0,
            "Silver Chest": playerJson["Silver Chest"] || 0,
            "Golden Chest": playerJson["Golden Chest"] || 0,
            "Precious Chest": playerJson["Precious Chest"] || 0,
            "Magic Chest": playerJson["Magic Chest"] || 0,
            "Bank Total": playerJson["Bank Total"] || 0,
            "Runic LV 20-24": playerJson["Runic LV 20-24"] || 0,
            "Runic LV 25-29": playerJson["Runic LV 25-29"] || 0,
            "Runic LV 30-34": playerJson["Runic LV 30-34"] || 0,
            "Runic LV 35-39": playerJson["Runic LV 35-39"] || 0,
            "Runic LV 40-44": playerJson["Runic LV 40-44"] || 0,
            "Runic LV 45": playerJson["Runic LV 45"] || 0,
            "Runic Total": playerJson["Runic Total"] || 0,
            "Heroic LV16": playerJson["Heroic LV16"] || 0,
            "Heroic LV17": playerJson["Heroic LV17"] || 0,
            "Heroic LV18": playerJson["Heroic LV18"] || 0,
            "Heroic LV19": playerJson["Heroic LV19"] || 0,
            "Heroic LV20": playerJson["Heroic LV20"] || 0,
            "Heroic LV21": playerJson["Heroic LV21"] || 0,
            "Heroic LV22": playerJson["Heroic LV22"] || 0,
            "Heroic LV23": playerJson["Heroic LV23"] || 0,
            "Heroic LV24": playerJson["Heroic LV24"] || 0,
            "Heroic LV25": playerJson["Heroic LV25"] || 0,
            "Heroic LV26": playerJson["Heroic LV26"] || 0,
            "Heroic LV27": playerJson["Heroic LV27"] || 0,
            "Heroic LV28": playerJson["Heroic LV28"] || 0,
            "Heroic LV29": playerJson["Heroic LV29"] || 0,
            "Heroic LV30": playerJson["Heroic LV30"] || 0,
            "Heroic LV31": playerJson["Heroic LV31"] || 0,
            "Heroic LV32": playerJson["Heroic LV32"] || 0,
            "Heroic LV33": playerJson["Heroic LV33"] || 0,
            "Heroic LV34": playerJson["Heroic LV34"] || 0,
            "Heroic LV35": playerJson["Heroic LV35"] || 0,
            "Heroic LV36": playerJson["Heroic LV36"] || 0,
            "Heroic LV37": playerJson["Heroic LV37"] || 0,
            "Heroic LV38": playerJson["Heroic LV38"] || 0,
            "Heroic LV39": playerJson["Heroic LV39"] || 0,
            "Heroic LV40": playerJson["Heroic LV40"] || 0,
            "Heroic LV41": playerJson["Heroic LV41"] || 0,
            "Heroic LV42": playerJson["Heroic LV42"] || 0,
            "Heroic LV43": playerJson["Heroic LV43"] || 0,
            "Heroic LV44": playerJson["Heroic LV44"] || 0,
            "Heroic LV45": playerJson["Heroic LV45"] || 0,
            "Heroic Total": playerJson["Heroic Total"] || 0,
            "VotA LV 10-14": playerJson["VotA LV 10-14"] || 0,
            "VotA LV 15-19": playerJson["VotA LV 15-19"] || 0,
            "VotA LV 20-24": playerJson["VotA LV 20-24"] || 0,
            "VotA LV 25-29": playerJson["VotA LV 25-29"] || 0,
            "VotA LV 30-34": playerJson["VotA LV 30-34"] || 0,
            "VotA LV 35-39": playerJson["VotA LV 35-39"] || 0,
            "VotA LV 40-44": playerJson["VotA LV 40-44"] || 0,
            "VotA Total": playerJson["VotA Total"] || 0,
            "Quick March Chest": playerJson["Quick March Chest"] || 0,
            "Ancients Chest": playerJson["Ancients Chest"] || 0,
            "ROTA Total": playerJson["ROTA Total"] || 0,
            "Epic Ancient squad": playerJson["Epic Ancient squad"] || 0,
            "EAs Total": playerJson["EAs Total"] || 0,
            "Union Chest": playerJson["Union Chest"] || 0,
            "Union Total": playerJson["Union Total"] || 0,
            "Jormungandr's Chest": playerJson["Jormungandr's Chest"] || 0,
            "Jormungandr Total": playerJson["Jormungandr Total"] || 0,
            "Points": playerJson["Points"] || 0,
            "leerspalte": playerJson["leerspalte"] || '',
            "Timestamp": playerJson.Timestamp || new Date().toISOString(),
          };

          // Weist die Normkategorie basierend auf der Truppenstärke aus dem vorhandenen Normen-Mapping zu.
          const assignedNorm = normsMapping.find(
            (norm) => norm.troopStrength === playerData.troopStrength
          )?.norm || 'N/A';
          playerData.normCategory = assignedNorm;

          // Fügt den Set-Vorgang zum Batch hinzu (aktualisiert oder erstellt das Dokument).
          batch.set(playerRef, playerData, { merge: true });
        }

        await batch.commit(); // Führt alle Batch-Vorgänge atomar aus.
        setErrorMessage(t('fileUploaded', { fileName: selectedFile.name }));
        setSelectedFile(null);
      } catch (error) {
        console.error("Error processing JSON file:", error);
        setErrorMessage(t('errorProcessingData'));
      }
    };
    reader.onerror = () => {
      setErrorMessage(t('errorParsingFile'));
    };
    reader.readAsText(selectedFile);
  };

  /**
   * @function handleAddTroopStrength
   * @description Fügt eine neue Truppenstärke zur Firestore-Sammlung 'troopStrengths' hinzu.
   * Überprüft, ob das Feld nicht leer ist.
   * @returns {Promise<void>}
   */
  const handleAddTroopStrength = async () => {
    if (!newTroopStrength.trim()) {
      setErrorMessage(t('errorMessageEmptyFields'));
      return;
    }
    const success = await addItemToFirestore('troopStrengths', { name: newTroopStrength.trim() }, 'normAdded', 'normName');
    if (success) {
      setNewTroopStrength('');
    }
  };

  /**
   * @function handleDeleteTroopStrength
   * @description Löscht eine Truppenstärke aus der Firestore-Sammlung 'troopStrengths'.
   * @param {string} id - Die ID der zu löschenden Truppenstärke.
   * @returns {Promise<void>}
   */
  const handleDeleteTroopStrength = async (id) => {
    await deleteItemFromFirestore('troopStrengths', id, 'normDeleted', 'normName');
  };

  /**
   * @function handleAddRank
   * @description Fügt einen neuen Rang zur Firestore-Sammlung 'ranks' hinzu.
   * Überprüft, ob das Feld nicht leer ist.
   * @returns {Promise<void>}
   */
  const handleAddRank = async () => {
    if (!newRank.trim()) {
      setErrorMessage(t('errorMessageEmptyFields'));
      return;
    }
    const success = await addItemToFirestore('ranks', { name: newRank.trim() }, 'normAdded', 'normName');
    if (success) {
      setNewRank('');
    }
  };

  /**
   * @function handleDeleteRank
   * @description Löscht einen Rang aus der Firestore-Sammlung 'ranks'.
   * @param {string} id - Die ID des zu löschenden Rangs.
   * @returns {Promise<void>}
   */
  const handleDeleteRank = async (id) => {
    await deleteItemFromFirestore('ranks', id, 'normDeleted', 'normName');
  };

  /**
   * @function handleAssignNorm
   * @description Weist einer ausgewählten Truppenstärke einen Normwert zu und speichert dies in Firestore.
   * Überprüft, ob beide Felder ausgefüllt sind.
   * @returns {Promise<void>}
   */
  const handleAssignNorm = async () => {
    if (!selectedTroopStrengthForNorm || normValue === '') {
      setErrorMessage(t('errorMessageEmptyFields'));
      return;
    }
    const success = await addItemToFirestore(
      'norms',
      { troopStrength: selectedTroopStrengthForNorm, norm: parseInt(normValue) },
      'normAssigned',
      'troopStrength'
    );
    if (success) {
      setSelectedTroopStrengthForNorm('');
      setNormValue('');
    }
  };

  /**
   * @function handleDeleteNormMapping
   * @description Löscht eine Norm-Zuweisung für eine Truppenstärke aus Firestore.
   * @param {string} troopStrength - Die Truppenstärke, deren Norm-Zuweisung gelöscht werden soll.
   * @returns {Promise<void>}
   */
  const handleDeleteNormMapping = async (troopStrength) => {
    await deleteItemFromFirestore('norms', troopStrength, 'normMappingDeleted', 'troopStrength');
  };

  /**
   * @function handleAddPlayer
   * @description Fügt einen neuen Spieler zur 'currentEventPlayers'-Sammlung in Firestore hinzu.
   * Initialisiert alle Truhenkategorien mit 0 und weist eine Normkategorie zu.
   * @returns {Promise<void>}
   */
  const handleAddPlayer = async () => {
    if (!playerName.trim() || !playerRank || !playerTroopStrength) {
      setErrorMessage(t('errorMessageEmptyFields'));
      return;
    }

    const assignedNorm = normsMapping.find(
      (norm) => norm.troopStrength === playerTroopStrength
    )?.norm || 'N/A';

    const newPlayer = {
      name: playerName.trim(),
      aliases: playerAlias.split(',').map(a => a.trim()).filter(a => a !== ''),
      rank: playerRank,
      troopStrength: playerTroopStrength,
      normCategory: assignedNorm,
      // Initialisiert alle Truhenkategorien mit 0
      ...Object.fromEntries(ALL_CHEST_CATEGORIES.map(cat => [cat, 0])),
      "leerspalte": "", // Setzt leerspalte auf leeren String
      "Timestamp": new Date().toISOString(), // Setzt den Timestamp
    };

    const success = await addItemToFirestore('currentEventPlayers', newPlayer, 'playerAdded', 'playerName');
    if (success) {
      setPlayerName('');
      setPlayerAlias('');
      setPlayerRank('');
      setPlayerTroopStrength('');
    }
  };

  /**
   * @function handleDeletePlayer
   * @description Löscht einen Spieler aus der 'currentEventPlayers'-Sammlung in Firestore.
   * @param {string} id - Die ID des zu löschenden Spielers.
   * @returns {Promise<void>}
   */
  const handleDeletePlayer = async (id) => {
    await deleteItemFromFirestore('currentEventPlayers', id, 'playerDeleted', 'playerName');
  };

  /**
   * @function confirmDelete
   * @description Zeigt das Löschbestätigungsmodal an und speichert die notwendigen Informationen für den Löschvorgang.
   * @param {Object} item - Das Element, das gelöscht werden soll.
   * @param {function} deleteFunc - Die Funktion, die zum Löschen des Elements aufgerufen werden soll.
   * @param {string} msgKey - Der Schlüssel für die Bestätigungsnachricht.
   * @param {string} nameKey - Der Schlüssel für den Namen des Elements in der Nachricht.
   */
  const confirmDelete = (item, deleteFunc, msgKey, nameKey) => {
    setItemToDelete(item);
    setDeleteFunctionToCall(() => deleteFunc);
    setDeleteMessageKey(msgKey);
    setDeleteItemNameKey(nameKey);
    setShowDeleteConfirmModal(true);
    setErrorMessage('');
  };

  /**
   * @function handleEndCurrentPeriod
   * @description Beendet die aktuelle Veranstaltungsperiode, archiviert alle aktuellen Spielerdaten
   * und löscht sie aus der aktuellen Sammlung.
   * @returns {Promise<void>}
   */
  const handleEndCurrentPeriod = async () => {
    if (!db || !userId) {
      setErrorMessage(t('errorMessageDbNotReady'));
      return;
    }

    if (players.length === 0) {
      setErrorMessage(t('noCurrentPeriodData'));
      setShowEndPeriodConfirmModal(false);
      return;
    }

    try {
      // 1. Erstellt einen neuen Archiveintrag mit einem Zeitstempel.
      const archiveCollectionRef = collection(db, `artifacts/${appId}/public/data/eventArchive`);
      const periodTimestamp = new Date().toISOString();
      const newArchiveDocRef = await addDoc(archiveCollectionRef, {
        periodEndedAt: periodTimestamp,
      });

      // 2. Verschiebt aktuelle Spieler in eine Unterkollektion unter dem neuen Archiveintrag.
      const batch = writeBatch(db); // Korrektur: writeBatch(db) statt db.batch()
      const currentPlayersCollectionRef = collection(db, `artifacts/${appId}/public/data/currentEventPlayers`);

      for (const player of players) {
        // Fügt Spieler zur Archiv-Unterkollektion hinzu.
        const archivedPlayerDocRef = doc(archiveCollectionRef, newArchiveDocRef.id, 'players', player.id);
        batch.set(archivedPlayerDocRef, player);

        // Löscht Spieler aus der aktuellen Event-Sammlung.
        const currentPlayerDocRef = doc(currentPlayersCollectionRef, player.id);
        batch.delete(currentPlayerDocRef);
      }

      await batch.commit(); // Führt alle Batch-Operationen atomar aus.
      setErrorMessage(t('periodEndedSuccess'));
      setShowEndPeriodConfirmModal(false);
    } catch (e) {
      console.error("Error ending current period:", e);
      setErrorMessage(t('periodEndedError'));
    }
  };

  return (
    <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-red-400">
        {t('adminPanel')}
      </h1>
      {errorMessage && (
        <div className="bg-red-600 p-3 rounded-md mb-4 text-center">
          <p className="text-white">{errorMessage}</p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateTo('navigation')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300 mr-2" />
          <span>{t('backToNavigation')}</span>
        </button>
        {/* Button zum Beenden der aktuellen Periode */}
        <button
          onClick={() => setShowEndPeriodConfirmModal(true)}
          className="px-5 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
        >
          <Archive className="w-6 h-6 text-purple-300 mr-2" />
          <span>{t('endCurrentPeriod')}</span>
        </button>
      </div>
      {/* JSON File Upload Section */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">{t('jsonUpload')}</h2>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
          <button
            onClick={handleFileUpload}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <Upload className="w-6 h-6 text-blue-300 mr-2" />
            {t('uploadFile')}
          </button>
        </div>
        {selectedFile && <p className="text-gray-400 text-sm mt-2">{t('selectJsonFile')}: {selectedFile.name}</p>}
      </div>
      {/* Clan Members Management Section (moved here as per instruction) */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">{t('clanMembers')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder={t('playerName')}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            placeholder={t('playerAlias')}
            value={playerAlias}
            onChange={(e) => setPlayerAlias(e.target.value)}
            className="p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={playerRank}
            onChange={(e) => setPlayerRank(e.target.value)}
            className="p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('playerRank')}</option>
            {ranksList.map(rank => (
              <option key={rank.id} value={rank.name}>{rank.name}</option>
            ))}
          </select>
          <select
            value={playerTroopStrength}
            onChange={(e) => setPlayerTroopStrength(e.target.value)}
            className="p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('playerTroopStrength')}</option>
            {troopStrengthsList.map(ts => (
              <option key={ts.id} value={ts.name}>{ts.name}</option>
            ))}
          </select>
          <button
            onClick={handleAddPlayer}
            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 col-span-full flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-green-300 mr-2" />
            {t('addPlayer')}
          </button>
        </div>
        <h3 className="text-xl font-semibold text-blue-300 mt-6 mb-3">{t('currentPlayers')}</h3>
        {players.length === 0 ? (
          <p className="text-gray-400">{t('noMembers')}</p>
        ) : (
          <ul className="space-y-2">
            {players.map(player => (
              <li key={player.id} className="bg-gray-600 p-3 rounded-md flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-gray-200">{player.name} ({player.rank})</span>
                  {player.aliases.length > 0 && (
                    <span className="text-gray-400 text-sm">Aliase: {player.aliases.join(', ')}</span>
                  )}
                  <span className="text-gray-400 text-sm">Truppenstärke: {player.troopStrength}</span>
                  <span className="text-gray-400 text-sm">Norm: {player.normCategory}</span>
                </div>
                <button
                  onClick={() => confirmDelete(player, handleDeletePlayer, 'playerDeleted', 'playerName')}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-sm flex items-center"
                >
                  <Trash2 className="w-5 h-5 mr-1 text-white" />
                  {t('deletePlayer')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Troop Strength Management Section */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">{t('troopStrengthManagement')}</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder={t('newTroopStrength')}
            value={newTroopStrength}
            onChange={(e) => setNewTroopStrength(e.target.value)}
            className="p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:ring-blue-500 focus:border-blue-500 flex-grow"
          />
          <button
            onClick={handleAddTroopStrength}
            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-green-300 mr-2" />
            {t('addTroopStrength')}
          </button>
        </div>
        <h3 className="text-xl font-semibold text-blue-300 mt-6 mb-3">{t('currentTroopStrengths')}</h3>
        {troopStrengthsList.length === 0 ? (
          <p className="text-gray-400">{t('noTroopStrengths')}</p>
        ) : (
          <ul className="space-y-2">
            {troopStrengthsList.map(ts => (
              <li key={ts.id} className="bg-gray-600 p-3 rounded-md flex justify-between items-center">
                <span className="text-gray-200">{ts.name}</span>
                <button
                  onClick={() => confirmDelete(ts, handleDeleteTroopStrength, 'normDeleted', 'normName')}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-sm flex items-center"
                >
                  <Trash2 className="w-5 h-5 mr-1 text-white" />
                  {t('deleteTroopStrength')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Rank Management Section */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">{t('rankManagement')}</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder={t('newRank')}
            value={newRank}
            onChange={(e) => setNewRank(e.target.value)}
            className="p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:ring-blue-500 focus:border-blue-500 flex-grow"
          />
          <button
            onClick={handleAddRank}
            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-green-300 mr-2" />
            {t('addRank')}
          </button>
        </div>
        <h3 className="text-xl font-semibold text-blue-300 mt-6 mb-3">{t('currentRanks')}</h3>
        {ranksList.length === 0 ? (
          <p className="text-gray-400">{t('noRanks')}</p>
        ) : (
          <ul className="space-y-2">
            {ranksList.map(rank => (
              <li key={rank.id} className="bg-gray-600 p-3 rounded-md flex justify-between items-center">
                <span className="text-gray-200">{rank.name}</span>
                <button
                  onClick={() => confirmDelete(rank, handleDeleteRank, 'normDeleted', 'normName')}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-sm flex items-center"
                >
                  <Trash2 className="w-5 h-5 mr-1 text-white" />
                  {t('deleteRank')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Norms Definition Section (Mapping Troop Strength to Norm Value) */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-blue-300 mb-4">{t('normsDefinition')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            value={selectedTroopStrengthForNorm}
            onChange={(e) => setSelectedTroopStrengthForNorm(e.target.value)}
            className="p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:ring-blue-500 focus:border-blue-500 col-span-1"
          >
            <option value="">{t('selectTroopStrength')}</option>
            {troopStrengthsList.map(ts => (
              <option key={ts.id} value={ts.name}>{ts.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder={t('normValue')}
            value={normValue}
            onChange={(e) => setNormValue(e.target.value)}
            className="p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:ring-blue-500 focus:border-blue-500 col-span-1"
          />
          <button
            onClick={handleAssignNorm}
            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 col-span-1 flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-green-300 mr-2" />
            {t('assignNorm')}
          </button>
        </div>
        <h3 className="text-xl font-semibold text-blue-300 mt-6 mb-3">{t('currentNorms')}</h3>
        {normsMapping.length === 0 ? (
          <p className="text-gray-400">{t('noNormsDefined')}</p>
        ) : (
          <ul className="space-y-2">
            {normsMapping.map(norm => (
              <li key={norm.id} className="bg-gray-600 p-3 rounded-md flex justify-between items-center">
                <span className="text-gray-200">Truppenstärke: {norm.troopStrength}, Norm: {norm.norm}</span>
                <button
                  onClick={() => confirmDelete(norm, handleDeleteNormMapping, 'normMappingDeleted', 'troopStrength')}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-sm flex items-center"
                >
                  <Trash2 className="w-5 h-5 mr-1 text-white" />
                  {t('deleteNorm')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showDeleteConfirmModal && (
        <DeleteConfirmModal
          itemToDelete={itemToDelete}
          setShowDeleteConfirmModal={setShowDeleteConfirmModal}
          setItemToDelete={setItemToDelete}
          setErrorMessage={setErrorMessage}
          deleteFunction={deleteFunctionToCall}
          errorMessage={errorMessage}
          t={t}
          messageKey={deleteMessageKey}
          itemNameKey={deleteItemNameKey}
        />
      )}
      {showEndPeriodConfirmModal && (
        <EndPeriodConfirmModal
          setShowEndPeriodConfirmModal={setShowEndPeriodConfirmModal}
          endCurrentPeriod={handleEndCurrentPeriod}
          errorMessage={errorMessage}
          t={t}
        />
      )}
    </div>
  );
};


/**
 * @function App
 * @description Die Hauptkomponente der React-Anwendung.
 * Verwaltet den globalen Zustand wie Firebase-Initialisierung, Authentifizierung,
 * aktuelle Seite und Fehlermeldungen. Rendert die entsprechende Seite basierend auf dem Navigationszustand.
 * @returns {JSX.Element} Das JSX-Element der gesamten Anwendung.
 */
function App() {
  // Die Firebase-Instanzen und der Benutzerstatus werden jetzt vom useFirebase-Hook bereitgestellt
  const { db, auth, userId, isAuthReady, errorMessage: firebaseErrorMessage, appId } = useFirebase();
  const [currentPage, setCurrentPage] = useState('welcome');
  const [currentLanguage, setCurrentLanguage] = useState('de');
  const [errorMessage, setErrorMessage] = useState(''); // Lokaler Fehlerzustand für Komponenten
  const [selectedPlayerForDetail, setSelectedPlayerForDetail] = useState(null);
  const [selectedArchivedPeriodId, setSelectedArchivedPeriodId] = useState(null);

  // Übersetzungsfunktion für die aktuelle Sprache
  const t = (key, params) => getTranslation(currentLanguage, key, params);

  // Kombiniere Firebase-Fehlermeldungen mit lokalen Fehlermeldungen
  useEffect(() => {
    if (firebaseErrorMessage) {
      setErrorMessage(firebaseErrorMessage);
    }
  }, [firebaseErrorMessage]);

  /**
   * @function navigateTo
   * @description Navigiert zu einer neuen Seite und setzt relevante Zustände zurück oder setzt sie.
   * @param {string} page - Der Name der Seite, zu der navigiert werden soll.
   * @param {Object|string|null} [data=null] - Optionale Daten, die an die neue Seite übergeben werden sollen (z.B. Spielerobjekt oder Archiv-ID).
   */
  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    setSelectedPlayerForDetail(null);
    setSelectedArchivedPeriodId(null);

    if (page === 'playerReport' && data) {
      setSelectedPlayerForDetail(data);
    } else if (page === 'archivedPeriodDetails' && data) {
      setSelectedArchivedPeriodId(data);
    }
    setErrorMessage(''); // Fehlermeldung beim Seitenwechsel zurücksetzen
  };

  console.log("App-Komponente rendert. isAuthReady:", isAuthReady); // Debug-Log

  // Zeigt einen Ladebildschirm an, bis die Authentifizierung abgeschlossen ist.
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-700">{t('loading')}</p>
          <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  /**
   * @function renderPage
   * @description Wählt die zu rendernde Komponente basierend auf dem aktuellen `currentPage`-Zustand aus.
   * @returns {JSX.Element} Die JSX-Komponente der aktuellen Seite.
   */
  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage navigateTo={navigateTo} setLanguage={setCurrentLanguage} currentLanguage={currentLanguage} t={t} />;
      case 'info':
        return <InfoPage navigateTo={navigateTo} t={t} />;
      case 'navigation':
        return <NavigationPage navigateTo={navigateTo} t={t} />;
      case 'playerReport':
        // Wenn direkt über Navigation aufgerufen, ohne spezifischen Spieler, zeige die aktuelle Event-Seite.
        // Von dort aus kann ein Spieler ausgewählt werden.
        if (!selectedPlayerForDetail) {
          return <CurrentEventPage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} />;
        }
        return <PlayerDetailPage navigateTo={navigateTo} t={t} player={selectedPlayerForDetail} />;
      case 'currentEvent':
        return <CurrentEventPage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} />;
      case 'uff2Standards':
        return <Uff2StandardsPage navigateTo={navigateTo} t={t} />;
      case 'eventArchive':
        return <EventArchivePage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} />;
      case 'archivedPeriodDetails':
        return <ArchivedPeriodDetailsPage navigateTo={navigateTo} t={t} db={db} appId={appId} userId={userId} archivedPeriodId={selectedArchivedPeriodId} />;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 sm:p-6 lg:p-8 font-inter flex flex-col items-center">
      {renderPage()}
    </div>
  );
}

export default App;
