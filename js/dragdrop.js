/**
 * Native HTML5 drag-and-drop for reordering app tiles.
 */
let draggedId = null;
let draggedEl = null;
let placeholder = null;
let activeController = null;

function createPlaceholder() {
  const el = document.createElement('div');
  el.className = 'app-tile drag-placeholder';
  return el;
}

function getDropTarget(e) {
  return e.target.closest('.app-tile[data-app-id]');
}

function removePlaceholder() {
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.removeChild(placeholder);
  }
}

export function initDragDrop(container, settings, onReorder) {
  // Tear down previous listeners before attaching new ones
  if (activeController) activeController.abort();
  activeController = new AbortController();
  const { signal } = activeController;

  placeholder = createPlaceholder();

  container.addEventListener('dragstart', (e) => {
    const tile = getDropTarget(e);
    if (!tile) return;

    draggedId = tile.dataset.appId;
    draggedEl = tile;
    tile.classList.add('dragging');

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedId);

    requestAnimationFrame(() => {
      tile.style.opacity = '0.3';
    });
  }, { signal });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const target = getDropTarget(e);
    if (!target || target === draggedEl) return;

    const grid = target.closest('.app-grid');
    if (!grid) return;

    const rect = target.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const insertBefore = e.clientX < midX;

    removePlaceholder();

    if (insertBefore) {
      grid.insertBefore(placeholder, target);
    } else {
      grid.insertBefore(placeholder, target.nextSibling);
    }
  }, { signal });

  container.addEventListener('dragleave', (e) => {
    if (!container.contains(e.relatedTarget)) {
      removePlaceholder();
    }
  }, { signal });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    removePlaceholder();

    const target = getDropTarget(e);
    if (!target || !draggedId) return;

    const targetId = target.dataset.appId;
    if (draggedId === targetId) return;

    const rect = target.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const insertBefore = e.clientX < midX;

    if (settings.useGroups) {
      reorderGrouped(settings, draggedId, targetId, target, insertBefore);
    } else {
      reorderFlat(settings, draggedId, targetId, insertBefore);
    }

    onReorder(settings);
  }, { signal });

  container.addEventListener('dragend', () => {
    removePlaceholder();
    if (draggedEl) {
      draggedEl.classList.remove('dragging');
      draggedEl.style.opacity = '';
    }
    draggedId = null;
    draggedEl = null;
  }, { signal });
}

function reorderFlat(settings, fromId, toId, insertBefore) {
  const order = settings.appOrder;
  const fromIdx = order.indexOf(fromId);
  if (fromIdx === -1) return;

  order.splice(fromIdx, 1);
  let toIdx = order.indexOf(toId);
  if (!insertBefore) toIdx++;
  order.splice(toIdx, 0, fromId);
}

function reorderGrouped(settings, fromId, toId, targetEl, insertBefore) {
  // Remove from source group
  for (const group of settings.groups) {
    const idx = group.appIds.indexOf(fromId);
    if (idx !== -1) {
      group.appIds.splice(idx, 1);
      break;
    }
  }

  // Find target group
  const groupSection = targetEl.closest('[data-group-id]');
  const targetGroupId = groupSection ? groupSection.dataset.groupId : null;
  const targetGroup = settings.groups.find(g => g.id === targetGroupId);

  if (targetGroup) {
    let toIdx = targetGroup.appIds.indexOf(toId);
    if (!insertBefore) toIdx++;
    targetGroup.appIds.splice(toIdx, 0, fromId);
  }

  // Also update flat appOrder to match
  const flatOrder = settings.appOrder;
  const fromIdx = flatOrder.indexOf(fromId);
  if (fromIdx !== -1) flatOrder.splice(fromIdx, 1);
  let toIdx = flatOrder.indexOf(toId);
  if (!insertBefore) toIdx++;
  flatOrder.splice(toIdx, 0, fromId);
}
