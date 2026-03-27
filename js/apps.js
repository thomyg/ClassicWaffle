/**
 * M365 app registry — single source of truth for all available apps.
 */

export const DEFAULT_CATEGORIES = [
  { id: 'core', label: 'Productivity' },
  { id: 'collab', label: 'Collaboration' },
  { id: 'business', label: 'Business Apps' },
  { id: 'planning', label: 'Planning & Tasks' },
  { id: 'admin', label: 'IT & Admin' },
  { id: 'other', label: 'Other' },
];

export const DEFAULT_APPS = [
  // Core Productivity
  { id: 'outlook', name: 'Outlook', url: 'https://outlook.office.com', icon: 'icons/apps/outlook.svg', category: 'core', defaultOrder: 0 },
  { id: 'teams', name: 'Teams', url: 'https://teams.microsoft.com', icon: 'icons/apps/teams.svg', category: 'core', defaultOrder: 1 },
  { id: 'word', name: 'Word', url: 'https://www.office.com/launch/word', icon: 'icons/apps/word.svg', category: 'core', defaultOrder: 2 },
  { id: 'excel', name: 'Excel', url: 'https://www.office.com/launch/excel', icon: 'icons/apps/excel.svg', category: 'core', defaultOrder: 3 },
  { id: 'powerpoint', name: 'PowerPoint', url: 'https://www.office.com/launch/powerpoint', icon: 'icons/apps/powerpoint.svg', category: 'core', defaultOrder: 4 },
  { id: 'onenote', name: 'OneNote', url: 'https://www.office.com/launch/onenote', icon: 'icons/apps/onenote.svg', category: 'core', defaultOrder: 5 },
  { id: 'onedrive', name: 'OneDrive', url: 'https://onedrive.live.com', icon: 'icons/apps/onedrive.svg', category: 'core', defaultOrder: 6 },
  { id: 'sharepoint', name: 'SharePoint', url: 'https://www.office.com/launch/sharepoint', icon: 'icons/apps/sharepoint.svg', category: 'core', defaultOrder: 7 },

  // Collaboration
  { id: 'viva-engage', name: 'Viva Engage', url: 'https://web.yammer.com', icon: 'icons/apps/viva-engage.svg', category: 'collab', defaultOrder: 8 },
  { id: 'stream', name: 'Stream', url: 'https://www.microsoft365.com/launch/stream', icon: 'icons/apps/stream.svg', category: 'collab', defaultOrder: 9 },
  { id: 'whiteboard', name: 'Whiteboard', url: 'https://whiteboard.microsoft.com', icon: 'icons/apps/whiteboard.svg', category: 'collab', defaultOrder: 10 },
  { id: 'loop', name: 'Loop', url: 'https://loop.microsoft.com', icon: 'icons/apps/loop.svg', category: 'collab', defaultOrder: 11 },
  { id: 'clipchamp', name: 'Clipchamp', url: 'https://app.clipchamp.com', icon: 'icons/apps/clipchamp.svg', category: 'collab', defaultOrder: 12 },
  { id: 'sway', name: 'Sway', url: 'https://sway.office.com', icon: 'icons/apps/sway.svg', category: 'collab', defaultOrder: 13 },

  // Business Apps
  { id: 'powerbi', name: 'Power BI', url: 'https://app.powerbi.com', icon: 'icons/apps/powerbi.svg', category: 'business', defaultOrder: 14 },
  { id: 'powerapps', name: 'Power Apps', url: 'https://make.powerapps.com', icon: 'icons/apps/powerapps.svg', category: 'business', defaultOrder: 15 },
  { id: 'powerautomate', name: 'Power Automate', url: 'https://make.powerautomate.com', icon: 'icons/apps/powerautomate.svg', category: 'business', defaultOrder: 16 },
  { id: 'powerpages', name: 'Power Pages', url: 'https://make.powerpages.microsoft.com', icon: 'icons/apps/powerpages.svg', category: 'business', defaultOrder: 17 },
  { id: 'dynamics365', name: 'Dynamics 365', url: 'https://dynamics.microsoft.com', icon: 'icons/apps/dynamics365.svg', category: 'business', defaultOrder: 18 },

  // Planning & Tasks
  { id: 'todo', name: 'To Do', url: 'https://to-do.office.com', icon: 'icons/apps/todo.svg', category: 'planning', defaultOrder: 19 },
  { id: 'planner', name: 'Planner', url: 'https://tasks.office.com', icon: 'icons/apps/planner.svg', category: 'planning', defaultOrder: 20 },
  { id: 'lists', name: 'Lists', url: 'https://www.microsoft365.com/launch/lists', icon: 'icons/apps/lists.svg', category: 'planning', defaultOrder: 21 },
  { id: 'forms', name: 'Forms', url: 'https://forms.office.com', icon: 'icons/apps/forms.svg', category: 'planning', defaultOrder: 22 },
  { id: 'bookings', name: 'Bookings', url: 'https://outlook.office.com/bookings', icon: 'icons/apps/bookings.svg', category: 'planning', defaultOrder: 23 },
  { id: 'calendar', name: 'Calendar', url: 'https://outlook.office.com/calendar', icon: 'icons/apps/calendar.svg', category: 'planning', defaultOrder: 24 },
  { id: 'people', name: 'People', url: 'https://outlook.office.com/people', icon: 'icons/apps/people.svg', category: 'planning', defaultOrder: 25 },

  // IT & Admin
  { id: 'admin', name: 'Admin', url: 'https://admin.microsoft.com', icon: 'icons/apps/admin.svg', category: 'admin', defaultOrder: 26 },
  { id: 'compliance', name: 'Compliance', url: 'https://compliance.microsoft.com', icon: 'icons/apps/compliance.svg', category: 'admin', defaultOrder: 27 },
  { id: 'security', name: 'Security', url: 'https://security.microsoft.com', icon: 'icons/apps/security.svg', category: 'admin', defaultOrder: 28 },
  { id: 'entra', name: 'Entra', url: 'https://entra.microsoft.com', icon: 'icons/apps/entra.svg', category: 'admin', defaultOrder: 29 },
  { id: 'intune', name: 'Intune', url: 'https://intune.microsoft.com', icon: 'icons/apps/intune.svg', category: 'admin', defaultOrder: 30 },

  // Other
  { id: 'copilot', name: 'Copilot', url: 'https://copilot.microsoft.com', icon: 'icons/apps/copilot.svg', category: 'other', defaultOrder: 31 },
  { id: 'designer', name: 'Designer', url: 'https://designer.microsoft.com', icon: 'icons/apps/designer.svg', category: 'other', defaultOrder: 32 },
  { id: 'm365', name: 'Microsoft 365', url: 'https://www.microsoft365.com', icon: 'icons/apps/m365.svg', category: 'other', defaultOrder: 33 },
  { id: 'delve', name: 'Delve', url: 'https://delve.office.com', icon: 'icons/apps/delve.svg', category: 'other', defaultOrder: 34 },
];
