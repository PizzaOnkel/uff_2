// Utility-Funktionen für die Berechtigungsverwaltung
export const PERMISSIONS = {
  MANAGE_PLAYERS: 'manage_players',
  UPLOAD: 'upload',
  DELETE: 'delete',
  MANAGE_RANKS: 'manage_ranks',
  MANAGE_TROOP_STRENGTHS: 'manage_troop_strengths',
  MANAGE_NORMS: 'manage_norms',
  MANAGE_CHEST_MAPPING: 'manage_chest_mapping',
  CREATE_PERIOD: 'create_period',
  MANAGE_ADMIN_REQUESTS: 'manage_admin_requests',
  VIEW_ADMIN_DATA: 'view_admin_data'
};

export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.MANAGE_PLAYERS]: {
    label: 'Spieler verwalten',
    description: 'Spieler erstellen, bearbeiten und löschen'
  },
  [PERMISSIONS.UPLOAD]: {
    label: 'Daten hochladen',
    description: 'JSON-Daten hochladen und importieren'
  },
  [PERMISSIONS.DELETE]: {
    label: 'Daten löschen',
    description: 'Spieler und Daten permanent löschen'
  },
  [PERMISSIONS.MANAGE_RANKS]: {
    label: 'Ränge verwalten',
    description: 'Clan-Ränge und Normen bearbeiten'
  },
  [PERMISSIONS.MANAGE_TROOP_STRENGTHS]: {
    label: 'Truppenstärken verwalten',
    description: 'Truppenstärken-Tabellen bearbeiten'
  },
  [PERMISSIONS.MANAGE_NORMS]: {
    label: 'Normen verwalten',
    description: 'Clan-Normen und -Regeln bearbeiten'
  },
  [PERMISSIONS.MANAGE_CHEST_MAPPING]: {
    label: 'Truhen-Zuordnungen verwalten',
    description: 'Truhen-Punkte-Zuordnungen bearbeiten'
  },
  [PERMISSIONS.CREATE_PERIOD]: {
    label: 'Neue Perioden erstellen',
    description: 'Neue Bewertungsperioden anlegen'
  },
  [PERMISSIONS.MANAGE_ADMIN_REQUESTS]: {
    label: 'Admin-Anfragen verwalten',
    description: 'Neue Admin-Anfragen genehmigen oder ablehnen'
  },
  [PERMISSIONS.VIEW_ADMIN_DATA]: {
    label: 'Admin-Daten einsehen',
    description: 'Zugriff auf alle Admin-Bereiche'
  }
};

export const ROLE_PERMISSIONS = {
  superAdmin: [
    PERMISSIONS.UPLOAD,
    PERMISSIONS.DELETE,
    PERMISSIONS.MANAGE_PLAYERS,
    PERMISSIONS.MANAGE_RANKS,
    PERMISSIONS.MANAGE_TROOP_STRENGTHS,
    PERMISSIONS.MANAGE_NORMS,
    PERMISSIONS.MANAGE_CHEST_MAPPING,
    PERMISSIONS.MANAGE_ADMIN_REQUESTS,
    PERMISSIONS.CREATE_PERIOD,
    PERMISSIONS.VIEW_ADMIN_DATA
  ],
  contentAdmin: [
    PERMISSIONS.MANAGE_PLAYERS,
    PERMISSIONS.MANAGE_RANKS,
    PERMISSIONS.MANAGE_TROOP_STRENGTHS,
    PERMISSIONS.MANAGE_NORMS,
    PERMISSIONS.MANAGE_CHEST_MAPPING,
    PERMISSIONS.VIEW_ADMIN_DATA
  ],
  viewer: [
    PERMISSIONS.VIEW_ADMIN_DATA
  ]
};

export const getPermissionsByRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

export const getPermissionLabel = (permissionId) => {
  return PERMISSION_DESCRIPTIONS[permissionId]?.label || permissionId;
};

export const getPermissionDescription = (permissionId) => {
  return PERMISSION_DESCRIPTIONS[permissionId]?.description || '';
};

export const getAllPermissions = () => {
  return Object.keys(PERMISSION_DESCRIPTIONS).map(id => ({
    id,
    ...PERMISSION_DESCRIPTIONS[id]
  }));
};
