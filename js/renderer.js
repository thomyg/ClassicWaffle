/**
 * Renders the app grid into the DOM.
 */
import { DEFAULT_APPS } from './apps.js';

function createTile(app) {
  const link = document.createElement('a');
  link.href = app.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'app-tile';
  link.draggable = true;
  link.dataset.appId = app.id;
  link.title = app.name;

  const icon = document.createElement('img');
  icon.src = app.icon;
  icon.alt = app.name;
  icon.className = 'app-icon';
  icon.width = 40;
  icon.height = 40;
  icon.loading = 'lazy';

  const label = document.createElement('span');
  label.className = 'app-label';
  label.textContent = app.name;

  link.appendChild(icon);
  link.appendChild(label);
  return link;
}

function getVisibleApps(settings) {
  const hiddenSet = new Set(settings.hiddenApps);
  const appMap = new Map(DEFAULT_APPS.map(a => [a.id, a]));
  return settings.appOrder
    .filter(id => !hiddenSet.has(id) && appMap.has(id))
    .map(id => appMap.get(id));
}

function renderFlat(container, settings) {
  const fragment = document.createDocumentFragment();
  const grid = document.createElement('div');
  grid.className = 'app-grid';

  for (const app of getVisibleApps(settings)) {
    grid.appendChild(createTile(app));
  }

  fragment.appendChild(grid);
  container.appendChild(fragment);
}

function renderGrouped(container, settings) {
  const hiddenSet = new Set(settings.hiddenApps);
  const appMap = new Map(DEFAULT_APPS.map(a => [a.id, a]));
  const fragment = document.createDocumentFragment();

  for (const group of settings.groups) {
    const visibleApps = group.appIds
      .filter(id => !hiddenSet.has(id) && appMap.has(id))
      .map(id => appMap.get(id));

    if (visibleApps.length === 0) continue;

    const section = document.createElement('section');
    section.className = 'app-group';
    section.dataset.groupId = group.id;

    const header = document.createElement('h2');
    header.className = 'group-header';
    header.textContent = group.label;
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'app-grid';
    for (const app of visibleApps) {
      grid.appendChild(createTile(app));
    }
    section.appendChild(grid);
    fragment.appendChild(section);
  }

  // Render ungrouped apps (apps in appOrder but not in any group)
  const groupedIds = new Set(settings.groups.flatMap(g => g.appIds));
  const ungrouped = settings.appOrder
    .filter(id => !groupedIds.has(id) && !hiddenSet.has(id) && appMap.has(id))
    .map(id => appMap.get(id));

  if (ungrouped.length > 0) {
    const section = document.createElement('section');
    section.className = 'app-group';
    section.dataset.groupId = '_ungrouped';

    const header = document.createElement('h2');
    header.className = 'group-header';
    header.textContent = 'Other';
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'app-grid';
    for (const app of ungrouped) {
      grid.appendChild(createTile(app));
    }
    section.appendChild(grid);
    fragment.appendChild(section);
  }

  container.appendChild(fragment);
}

export function renderGrid(container, settings) {
  container.innerHTML = '';

  if (settings.useGroups) {
    renderGrouped(container, settings);
  } else {
    renderFlat(container, settings);
  }
}
