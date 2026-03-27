/**
 * Settings persistence via chrome.storage.sync.
 */
import { DEFAULT_APPS, DEFAULT_CATEGORIES } from './apps.js';

const STORAGE_KEY = 'classicWaffleSettings';
const SCHEMA_VERSION = 1;

function buildDefaults() {
  return {
    schemaVersion: SCHEMA_VERSION,
    appOrder: DEFAULT_APPS.map(a => a.id),
    hiddenApps: [],
    groups: DEFAULT_CATEGORIES.map(cat => ({
      id: cat.id,
      label: cat.label,
      appIds: DEFAULT_APPS
        .filter(a => a.category === cat.id)
        .sort((a, b) => a.defaultOrder - b.defaultOrder)
        .map(a => a.id),
    })),
    useGroups: true,
  };
}

function migrate(saved) {
  const defaults = buildDefaults();
  const knownIds = new Set(DEFAULT_APPS.map(a => a.id));

  // Remove apps that no longer exist in the registry
  saved.appOrder = saved.appOrder.filter(id => knownIds.has(id));
  saved.hiddenApps = saved.hiddenApps.filter(id => knownIds.has(id));

  // Add new apps that aren't in the user's order yet
  const userIds = new Set(saved.appOrder);
  for (const app of DEFAULT_APPS) {
    if (!userIds.has(app.id)) {
      saved.appOrder.push(app.id);
    }
  }

  // Ensure groups reference only valid app IDs
  if (saved.groups) {
    for (const group of saved.groups) {
      group.appIds = group.appIds.filter(id => knownIds.has(id));
    }
    // Add new apps to their default category group if they aren't in any group
    const groupedIds = new Set(saved.groups.flatMap(g => g.appIds));
    for (const app of DEFAULT_APPS) {
      if (!groupedIds.has(app.id)) {
        const targetGroup = saved.groups.find(g => g.id === app.category);
        if (targetGroup) {
          targetGroup.appIds.push(app.id);
        } else {
          // Category doesn't exist in user's groups — add to last group or create one
          const otherGroup = saved.groups.find(g => g.id === 'other');
          if (otherGroup) {
            otherGroup.appIds.push(app.id);
          } else {
            saved.groups.push({ id: app.category, label: app.category, appIds: [app.id] });
          }
        }
      }
    }
  } else {
    saved.groups = defaults.groups;
  }

  if (saved.useGroups === undefined) {
    saved.useGroups = defaults.useGroups;
  }

  saved.schemaVersion = SCHEMA_VERSION;
  return saved;
}

export async function loadSettings() {
  const defaults = buildDefaults();
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    if (!result[STORAGE_KEY]) return defaults;
    return migrate({ ...defaults, ...result[STORAGE_KEY] });
  } catch {
    return defaults;
  }
}

let saveTimer = null;

export function saveSettings(settings) {
  clearTimeout(saveTimer);
  return new Promise((resolve, reject) => {
    saveTimer = setTimeout(async () => {
      try {
        await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 300);
  });
}

export async function resetSettings() {
  await chrome.storage.sync.remove(STORAGE_KEY);
  return buildDefaults();
}
