chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

// M365 host suffixes for content script injection
const M365_HOSTS = [
  'microsoft',
  'microsoft.com',
  'microsoft365.com',
  'office.com',
  'office365.com',
  'sharepoint.com',
  'live.com',
];

// Programmatically inject content script when navigating to M365 pages.
// This works as a fallback when declarative content_scripts don't fire.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  try {
    const { hostname } = new URL(tab.url);
    const isM365 = M365_HOSTS.some(h => hostname === h || hostname.endsWith('.' + h));
    if (!isM365) return;

    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    }).catch(() => {});

    chrome.scripting.insertCSS({
      target: { tabId },
      files: ['content.css'],
    }).catch(() => {});
  } catch {
    // Invalid URL — ignore
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openSidePanel' && sender.tab) {
    chrome.sidePanel.open({ windowId: sender.tab.windowId })
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }
});
