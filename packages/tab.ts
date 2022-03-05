export function getTab(params?: chrome.tabs.QueryInfo) {
  return new Promise<chrome.tabs.Tab>((resolve) => {
    chrome.tabs?.query?.({ active: true, currentWindow: true, ...(params || {}) }, (tabs) => {
      const tabInfo = tabs?.[0];
      resolve(tabInfo);
    });
  });
}
