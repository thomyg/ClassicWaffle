/**
 * Content script — injects the classic waffle icon + floating app launcher into M365 pages.
 * Uses Shadow DOM for style isolation from the host page.
 */
(function () {
  const WAFFLE_ID = 'classic-waffle-host';
  const STORAGE_KEY = 'classicWaffleSettings';

  const DEFAULT_CATEGORIES = [
    { id: 'core', label: 'Productivity' },
    { id: 'collab', label: 'Collaboration' },
    { id: 'business', label: 'Business Apps' },
    { id: 'planning', label: 'Planning & Tasks' },
    { id: 'admin', label: 'IT & Admin' },
    { id: 'other', label: 'Other' },
  ];

  const DEFAULT_APPS = [
    { id: 'outlook', name: 'Outlook', url: 'https://outlook.office.com', icon: 'icons/apps/outlook.svg', category: 'core', defaultOrder: 0 },
    { id: 'teams', name: 'Teams', url: 'https://teams.microsoft.com', icon: 'icons/apps/teams.svg', category: 'core', defaultOrder: 1 },
    { id: 'word', name: 'Word', url: 'https://www.office.com/launch/word', icon: 'icons/apps/word.svg', category: 'core', defaultOrder: 2 },
    { id: 'excel', name: 'Excel', url: 'https://www.office.com/launch/excel', icon: 'icons/apps/excel.svg', category: 'core', defaultOrder: 3 },
    { id: 'powerpoint', name: 'PowerPoint', url: 'https://www.office.com/launch/powerpoint', icon: 'icons/apps/powerpoint.svg', category: 'core', defaultOrder: 4 },
    { id: 'onenote', name: 'OneNote', url: 'https://www.office.com/launch/onenote', icon: 'icons/apps/onenote.svg', category: 'core', defaultOrder: 5 },
    { id: 'onedrive', name: 'OneDrive', url: 'https://onedrive.live.com', icon: 'icons/apps/onedrive.svg', category: 'core', defaultOrder: 6 },
    { id: 'sharepoint', name: 'SharePoint', url: 'https://www.office.com/launch/sharepoint', icon: 'icons/apps/sharepoint.svg', category: 'core', defaultOrder: 7 },
    { id: 'viva-engage', name: 'Viva Engage', url: 'https://web.yammer.com', icon: 'icons/apps/viva-engage.svg', category: 'collab', defaultOrder: 8 },
    { id: 'stream', name: 'Stream', url: 'https://www.microsoft365.com/launch/stream', icon: 'icons/apps/stream.svg', category: 'collab', defaultOrder: 9 },
    { id: 'whiteboard', name: 'Whiteboard', url: 'https://whiteboard.microsoft.com', icon: 'icons/apps/whiteboard.svg', category: 'collab', defaultOrder: 10 },
    { id: 'loop', name: 'Loop', url: 'https://loop.microsoft.com', icon: 'icons/apps/loop.svg', category: 'collab', defaultOrder: 11 },
    { id: 'clipchamp', name: 'Clipchamp', url: 'https://app.clipchamp.com', icon: 'icons/apps/clipchamp.svg', category: 'collab', defaultOrder: 12 },
    { id: 'sway', name: 'Sway', url: 'https://sway.office.com', icon: 'icons/apps/sway.svg', category: 'collab', defaultOrder: 13 },
    { id: 'powerbi', name: 'Power BI', url: 'https://app.powerbi.com', icon: 'icons/apps/powerbi.svg', category: 'business', defaultOrder: 14 },
    { id: 'powerapps', name: 'Power Apps', url: 'https://make.powerapps.com', icon: 'icons/apps/powerapps.svg', category: 'business', defaultOrder: 15 },
    { id: 'powerautomate', name: 'Power Automate', url: 'https://make.powerautomate.com', icon: 'icons/apps/powerautomate.svg', category: 'business', defaultOrder: 16 },
    { id: 'powerpages', name: 'Power Pages', url: 'https://make.powerpages.microsoft.com', icon: 'icons/apps/powerpages.svg', category: 'business', defaultOrder: 17 },
    { id: 'dynamics365', name: 'Dynamics 365', url: 'https://dynamics.microsoft.com', icon: 'icons/apps/dynamics365.svg', category: 'business', defaultOrder: 18 },
    { id: 'todo', name: 'To Do', url: 'https://to-do.office.com', icon: 'icons/apps/todo.svg', category: 'planning', defaultOrder: 19 },
    { id: 'planner', name: 'Planner', url: 'https://tasks.office.com', icon: 'icons/apps/planner.svg', category: 'planning', defaultOrder: 20 },
    { id: 'lists', name: 'Lists', url: 'https://www.microsoft365.com/launch/lists', icon: 'icons/apps/lists.svg', category: 'planning', defaultOrder: 21 },
    { id: 'forms', name: 'Forms', url: 'https://forms.office.com', icon: 'icons/apps/forms.svg', category: 'planning', defaultOrder: 22 },
    { id: 'bookings', name: 'Bookings', url: 'https://outlook.office.com/bookings', icon: 'icons/apps/bookings.svg', category: 'planning', defaultOrder: 23 },
    { id: 'calendar', name: 'Calendar', url: 'https://outlook.office.com/calendar', icon: 'icons/apps/calendar.svg', category: 'planning', defaultOrder: 24 },
    { id: 'people', name: 'People', url: 'https://outlook.office.com/people', icon: 'icons/apps/people.svg', category: 'planning', defaultOrder: 25 },
    { id: 'admin', name: 'Admin', url: 'https://admin.microsoft.com', icon: 'icons/apps/admin.svg', category: 'admin', defaultOrder: 26 },
    { id: 'compliance', name: 'Compliance', url: 'https://compliance.microsoft.com', icon: 'icons/apps/compliance.svg', category: 'admin', defaultOrder: 27 },
    { id: 'security', name: 'Security', url: 'https://security.microsoft.com', icon: 'icons/apps/security.svg', category: 'admin', defaultOrder: 28 },
    { id: 'entra', name: 'Entra', url: 'https://entra.microsoft.com', icon: 'icons/apps/entra.svg', category: 'admin', defaultOrder: 29 },
    { id: 'intune', name: 'Intune', url: 'https://intune.microsoft.com', icon: 'icons/apps/intune.svg', category: 'admin', defaultOrder: 30 },
    { id: 'copilot', name: 'Copilot', url: 'https://copilot.microsoft.com', icon: 'icons/apps/copilot.svg', category: 'other', defaultOrder: 31 },
    { id: 'designer', name: 'Designer', url: 'https://designer.microsoft.com', icon: 'icons/apps/designer.svg', category: 'other', defaultOrder: 32 },
    { id: 'm365', name: 'Microsoft 365', url: 'https://www.microsoft365.com', icon: 'icons/apps/m365.svg', category: 'other', defaultOrder: 33 },
    { id: 'delve', name: 'Delve', url: 'https://delve.office.com', icon: 'icons/apps/delve.svg', category: 'other', defaultOrder: 34 },
  ];

  function buildDefaults() {
    return {
      appOrder: DEFAULT_APPS.map(a => a.id),
      hiddenApps: [],
      groups: DEFAULT_CATEGORIES.map(cat => ({
        id: cat.id,
        label: cat.label,
        appIds: DEFAULT_APPS.filter(a => a.category === cat.id).map(a => a.id),
      })),
      useGroups: true,
    };
  }

  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEY);
      if (!result[STORAGE_KEY]) return buildDefaults();
      return { ...buildDefaults(), ...result[STORAGE_KEY] };
    } catch {
      return buildDefaults();
    }
  }

  const PANEL_CSS = `
    :host {
      all: initial;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    }

    .waffle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      color: inherit;
      opacity: 0.85;
      transition: background 0.1s, opacity 0.1s;
      flex-shrink: 0;
      position: relative;
    }
    .waffle-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      opacity: 1;
    }
    .waffle-btn.active {
      background: rgba(255, 255, 255, 0.15);
      opacity: 1;
    }

    .waffle-panel {
      display: none;
      position: fixed;
      top: 48px;
      left: 8px;
      width: 340px;
      max-height: calc(100vh - 64px);
      background: #2d2d2d;
      border: 1px solid #404040;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
      z-index: 2147483647;
      overflow-y: auto;
      padding: 8px 6px;
      color: #e0e0e0;
      font-size: 13px;
    }
    .waffle-panel.open {
      display: block;
    }

    .waffle-panel::-webkit-scrollbar { width: 6px; }
    .waffle-panel::-webkit-scrollbar-track { background: transparent; }
    .waffle-panel::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px 4px;
    }
    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: #e0e0e0;
    }

    .group-header {
      font-size: 11px;
      font-weight: 600;
      color: #a0a0a0;
      padding: 12px 10px 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .app-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2px;
      padding: 0 4px;
    }

    .app-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: #e0e0e0;
      padding: 10px 4px 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.12s ease;
      min-height: 76px;
    }
    .app-tile:hover {
      background: #383838;
    }
    .app-tile:active {
      background: #444;
    }

    .app-icon {
      width: 40px;
      height: 40px;
      pointer-events: none;
    }

    .app-label {
      margin-top: 4px;
      font-size: 11px;
      line-height: 1.2;
      text-align: center;
      color: #e0e0e0;
      max-width: 64px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      pointer-events: none;
    }

    /* Light theme support */
    @media (prefers-color-scheme: light) {
      .waffle-btn:hover { background: rgba(0, 0, 0, 0.06); }
      .waffle-btn.active { background: rgba(0, 0, 0, 0.1); }
      .waffle-panel {
        background: #ffffff;
        border-color: #e0e0e0;
        color: #242424;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .panel-title { color: #242424; }
      .group-header { color: #616161; }
      .app-tile { color: #242424; }
      .app-tile:hover { background: #f0f0f0; }
      .app-tile:active { background: #e0e0e0; }
      .app-label { color: #242424; }
      .waffle-panel::-webkit-scrollbar-thumb { background: #ccc; }
    }

    .backdrop {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2147483646;
    }
    .backdrop.open {
      display: block;
    }
  `;

  const WAFFLE_SVG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="5" height="5" rx="1"/>
    <rect x="7.5" y="1" width="5" height="5" rx="1"/>
    <rect x="14" y="1" width="5" height="5" rx="1"/>
    <rect x="1" y="7.5" width="5" height="5" rx="1"/>
    <rect x="7.5" y="7.5" width="5" height="5" rx="1"/>
    <rect x="14" y="7.5" width="5" height="5" rx="1"/>
    <rect x="1" y="14" width="5" height="5" rx="1"/>
    <rect x="7.5" y="14" width="5" height="5" rx="1"/>
    <rect x="14" y="14" width="5" height="5" rx="1"/>
  </svg>`;

  function resolveIconUrl(iconPath) {
    return chrome.runtime.getURL(iconPath);
  }

  function renderPanel(panel, settings) {
    panel.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'panel-header';
    const title = document.createElement('span');
    title.className = 'panel-title';
    title.textContent = 'Microsoft 365';
    header.appendChild(title);
    panel.appendChild(header);

    const hiddenSet = new Set(settings.hiddenApps);
    const appMap = new Map(DEFAULT_APPS.map(a => [a.id, a]));

    if (settings.useGroups) {
      for (const group of settings.groups) {
        const visibleApps = group.appIds
          .filter(id => !hiddenSet.has(id) && appMap.has(id))
          .map(id => appMap.get(id));
        if (visibleApps.length === 0) continue;

        const gh = document.createElement('div');
        gh.className = 'group-header';
        gh.textContent = group.label;
        panel.appendChild(gh);

        const grid = document.createElement('div');
        grid.className = 'app-grid';
        for (const app of visibleApps) {
          grid.appendChild(createTile(app));
        }
        panel.appendChild(grid);
      }
    } else {
      const grid = document.createElement('div');
      grid.className = 'app-grid';
      for (const id of settings.appOrder) {
        if (hiddenSet.has(id) || !appMap.has(id)) continue;
        grid.appendChild(createTile(appMap.get(id)));
      }
      panel.appendChild(grid);
    }
  }

  function createTile(app) {
    const link = document.createElement('a');
    link.href = app.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'app-tile';
    link.title = app.name;

    const icon = document.createElement('img');
    icon.src = resolveIconUrl(app.icon);
    icon.alt = app.name;
    icon.className = 'app-icon';
    icon.width = 40;
    icon.height = 40;

    const label = document.createElement('span');
    label.className = 'app-label';
    label.textContent = app.name;

    link.appendChild(icon);
    link.appendChild(label);
    return link;
  }

  function createWaffle() {
    const host = document.createElement('div');
    host.id = WAFFLE_ID;
    host.style.cssText = 'display:inline-flex;align-items:center;position:relative;';

    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = PANEL_CSS;
    shadow.appendChild(style);

    // Backdrop to close on outside click
    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    shadow.appendChild(backdrop);

    // Waffle button
    const btn = document.createElement('div');
    btn.className = 'waffle-btn';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', 'App launcher');
    btn.title = 'App launcher';
    btn.innerHTML = WAFFLE_SVG;
    shadow.appendChild(btn);

    // Floating panel
    const panel = document.createElement('div');
    panel.className = 'waffle-panel';
    shadow.appendChild(panel);

    let isOpen = false;
    let loaded = false;

    function toggle() {
      isOpen = !isOpen;
      panel.classList.toggle('open', isOpen);
      backdrop.classList.toggle('open', isOpen);
      btn.classList.toggle('active', isOpen);

      if (isOpen && !loaded) {
        loaded = true;
        loadSettings().then(settings => renderPanel(panel, settings));
      }
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      panel.classList.remove('open');
      backdrop.classList.remove('open');
      btn.classList.remove('active');
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape') {
        close();
      }
    });

    backdrop.addEventListener('click', close);

    // Reload settings when storage changes (user changed settings in side panel)
    chrome.storage.onChanged.addListener(() => {
      loaded = false;
      if (isOpen) {
        loaded = true;
        loadSettings().then(settings => renderPanel(panel, settings));
      }
    });

    return host;
  }

  function inject() {
    if (document.getElementById(WAFFLE_ID)) return true;

    const selectors = [
      '[aria-label="Microsoft 365 Copilot"]',
      '[aria-label*="Copilot"]',
      '[data-testid="collapse-button"]',
    ];

    let anchor = null;
    for (const sel of selectors) {
      anchor = document.querySelector(sel);
      if (anchor) break;
    }
    if (!anchor) return false;

    const container = anchor.closest('div')?.parentElement || anchor.parentElement;
    if (!container) return false;

    const waffle = createWaffle();
    container.insertBefore(waffle, container.firstChild);
    return true;
  }

  if (!inject()) {
    const observer = new MutationObserver(() => {
      if (inject()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 30000);
  }
})();
