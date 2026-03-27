/**
 * Settings view controller — visibility, grouping, and reset.
 */
import { DEFAULT_APPS, DEFAULT_CATEGORIES } from './apps.js';
import { resetSettings } from './storage.js';

let settingsVisible = false;

export function initSettings(container, settingsContainer, settings, onSave, onRender) {
  const toggleBtn = document.getElementById('settings-toggle');
  const backBtn = document.getElementById('settings-back');

  toggleBtn.addEventListener('click', () => {
    settingsVisible = true;
    container.classList.add('hidden');
    settingsContainer.classList.remove('hidden');
    renderSettings(settingsContainer, settings, onSave, onRender, container);
  });

  backBtn.addEventListener('click', () => {
    settingsVisible = false;
    settingsContainer.classList.add('hidden');
    container.classList.remove('hidden');
    onRender(settings);
  });
}

function renderSettings(el, settings, onSave, onRender, gridContainer) {
  el.querySelector('.settings-content').innerHTML = '';
  const content = el.querySelector('.settings-content');

  // --- Groups toggle ---
  content.appendChild(buildToggleRow('Show groups', settings.useGroups, (val) => {
    settings.useGroups = val;
    onSave(settings);
  }));

  content.appendChild(buildSeparator());

  // --- App visibility & order ---
  const appSection = document.createElement('div');
  appSection.className = 'settings-section';

  const appHeader = document.createElement('h3');
  appHeader.className = 'settings-section-header';
  appHeader.textContent = 'Apps';
  appSection.appendChild(appHeader);

  const appDesc = document.createElement('p');
  appDesc.className = 'settings-desc';
  appDesc.textContent = 'Toggle visibility. Drag to reorder.';
  appSection.appendChild(appDesc);

  const appList = document.createElement('div');
  appList.className = 'settings-app-list';

  const hiddenSet = new Set(settings.hiddenApps);
  const appMap = new Map(DEFAULT_APPS.map(a => [a.id, a]));

  for (const id of settings.appOrder) {
    const app = appMap.get(id);
    if (!app) continue;

    const row = document.createElement('div');
    row.className = 'settings-app-row';
    row.draggable = true;
    row.dataset.appId = app.id;

    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '\u2261';
    row.appendChild(dragHandle);

    const icon = document.createElement('img');
    icon.src = app.icon;
    icon.alt = '';
    icon.className = 'settings-app-icon';
    icon.width = 24;
    icon.height = 24;
    row.appendChild(icon);

    const name = document.createElement('span');
    name.className = 'settings-app-name';
    name.textContent = app.name;
    row.appendChild(name);

    const toggle = document.createElement('label');
    toggle.className = 'toggle-switch';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !hiddenSet.has(app.id);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        settings.hiddenApps = settings.hiddenApps.filter(h => h !== app.id);
      } else {
        settings.hiddenApps.push(app.id);
      }
      onSave(settings);
    });
    const slider = document.createElement('span');
    slider.className = 'toggle-slider';
    toggle.appendChild(checkbox);
    toggle.appendChild(slider);
    row.appendChild(toggle);

    appList.appendChild(row);
  }

  initSettingsDragDrop(appList, settings, onSave);
  appSection.appendChild(appList);
  content.appendChild(appSection);

  // --- Group management ---
  if (settings.useGroups) {
    content.appendChild(buildSeparator());
    content.appendChild(buildGroupManager(settings, onSave));
  }

  // --- Reset ---
  content.appendChild(buildSeparator());

  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn-reset';
  resetBtn.textContent = 'Reset to defaults';
  resetBtn.addEventListener('click', async () => {
    if (!confirm('Reset all settings to defaults?')) return;
    const defaults = await resetSettings();
    Object.assign(settings, defaults);
    onRender(settings);
    renderSettings(el, settings, onSave, onRender, gridContainer);
  });
  content.appendChild(resetBtn);
}

function buildToggleRow(label, checked, onChange) {
  const row = document.createElement('div');
  row.className = 'settings-toggle-row';

  const text = document.createElement('span');
  text.textContent = label;
  row.appendChild(text);

  const toggle = document.createElement('label');
  toggle.className = 'toggle-switch';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = checked;
  checkbox.addEventListener('change', () => onChange(checkbox.checked));
  const slider = document.createElement('span');
  slider.className = 'toggle-slider';
  toggle.appendChild(checkbox);
  toggle.appendChild(slider);
  row.appendChild(toggle);

  return row;
}

function buildSeparator() {
  const sep = document.createElement('hr');
  sep.className = 'settings-separator';
  return sep;
}

function buildGroupManager(settings, onSave) {
  const section = document.createElement('div');
  section.className = 'settings-section';

  const header = document.createElement('h3');
  header.className = 'settings-section-header';
  header.textContent = 'Groups';
  section.appendChild(header);

  const desc = document.createElement('p');
  desc.className = 'settings-desc';
  desc.textContent = 'Rename groups or add new ones. Drag apps between groups in the main view.';
  section.appendChild(desc);

  for (const group of settings.groups) {
    const row = document.createElement('div');
    row.className = 'settings-group-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'group-name-input';
    input.value = group.label;
    input.addEventListener('change', () => {
      group.label = input.value.trim() || group.label;
      onSave(settings);
    });
    row.appendChild(input);

    const count = document.createElement('span');
    count.className = 'group-count';
    count.textContent = `${group.appIds.length} apps`;
    row.appendChild(count);

    // Only allow deleting non-default groups
    const isDefault = DEFAULT_CATEGORIES.some(c => c.id === group.id);
    if (!isDefault) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete-group';
      deleteBtn.textContent = '\u00d7';
      deleteBtn.title = 'Delete group';
      deleteBtn.addEventListener('click', () => {
        if (!confirm(`Delete group "${group.label}"? Apps will move to Other.`)) return;
        const otherGroup = settings.groups.find(g => g.id === 'other');
        if (otherGroup) {
          otherGroup.appIds.push(...group.appIds);
        }
        settings.groups = settings.groups.filter(g => g.id !== group.id);
        onSave(settings);
        // Re-render settings
        section.parentNode.parentNode.querySelector('.settings-content') &&
          renderSettings(
            section.closest('.settings-panel'),
            settings, onSave, () => {}, null
          );
      });
      row.appendChild(deleteBtn);
    }

    section.appendChild(row);
  }

  const addBtn = document.createElement('button');
  addBtn.className = 'btn-add-group';
  addBtn.textContent = '+ Add group';
  addBtn.addEventListener('click', () => {
    const name = prompt('Group name:');
    if (!name || !name.trim()) return;
    const id = 'custom_' + Date.now();
    settings.groups.push({ id, label: name.trim(), appIds: [] });
    onSave(settings);
    buildGroupManager(settings, onSave);
  });
  section.appendChild(addBtn);

  return section;
}

function initSettingsDragDrop(list, settings, onSave) {
  let draggedId = null;

  list.addEventListener('dragstart', (e) => {
    const row = e.target.closest('.settings-app-row');
    if (!row) return;
    draggedId = row.dataset.appId;
    row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedId);
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const row = e.target.closest('.settings-app-row');
    if (!row || row.dataset.appId === draggedId) return;

    const rect = row.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    row.classList.remove('drop-above', 'drop-below');
    row.classList.add(e.clientY < midY ? 'drop-above' : 'drop-below');
  });

  list.addEventListener('dragleave', (e) => {
    const row = e.target.closest('.settings-app-row');
    if (row) row.classList.remove('drop-above', 'drop-below');
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const row = e.target.closest('.settings-app-row');
    if (!row || !draggedId) return;

    const targetId = row.dataset.appId;
    if (draggedId === targetId) return;

    const rect = row.getBoundingClientRect();
    const insertBefore = e.clientY < rect.top + rect.height / 2;

    // Reorder in appOrder
    const order = settings.appOrder;
    const fromIdx = order.indexOf(draggedId);
    if (fromIdx !== -1) order.splice(fromIdx, 1);
    let toIdx = order.indexOf(targetId);
    if (!insertBefore) toIdx++;
    order.splice(toIdx, 0, draggedId);

    onSave(settings);

    // Re-render the list
    row.classList.remove('drop-above', 'drop-below');
    reorderListDOM(list, settings.appOrder);
  });

  list.addEventListener('dragend', () => {
    draggedId = null;
    for (const row of list.querySelectorAll('.settings-app-row')) {
      row.classList.remove('dragging', 'drop-above', 'drop-below');
    }
  });
}

function reorderListDOM(list, appOrder) {
  const rows = new Map();
  for (const row of list.querySelectorAll('.settings-app-row')) {
    rows.set(row.dataset.appId, row);
  }
  for (const id of appOrder) {
    const row = rows.get(id);
    if (row) list.appendChild(row);
  }
}
