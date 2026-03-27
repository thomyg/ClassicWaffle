import { loadSettings, saveSettings } from './js/storage.js';
import { renderGrid } from './js/renderer.js';
import { initDragDrop } from './js/dragdrop.js';
import { initSettings } from './js/settings.js';

async function init() {
  const settings = await loadSettings();
  const container = document.getElementById('app-container');
  const settingsPanel = document.getElementById('settings-panel');

  function render(s) {
    renderGrid(container, s);
    initDragDrop(container, s, (updated) => {
      saveSettings(updated);
      render(updated);
    });
  }

  render(settings);
  initSettings(container, settingsPanel, settings, saveSettings, render);
}

init();
