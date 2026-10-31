// Храним счётчик скрытых элементов для каждой вкладки
const tabCounts = new Map();

// Обработчик сообщений от content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateBadge') {
    const tabId = sender.tab?.id;
    if (tabId) {
      let newCount;
      
      if (message.isTotal) {
        // Если это общее количество, просто используем его
        newCount = message.count;
        tabCounts.set(tabId, newCount);
      } else {
        // Иначе накапливаем
        const currentCount = tabCounts.get(tabId) || 0;
        newCount = currentCount + message.count;
        tabCounts.set(tabId, newCount);
      }
      
      // Обновляем badge
      chrome.action.setBadgeText({
        text: newCount > 0 ? String(newCount) : '',
        tabId: tabId
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: '#FF6B6B',
        tabId: tabId
      });
    }
  }
  return true;
});

// Сбрасываем счётчик при обновлении вкладки
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading' && changeInfo.url) {
    // Проверяем, является ли это страницей поиска Яндекса
    if (changeInfo.url.includes('yandex.ru/search') || changeInfo.url.includes('yandex.com/search')) {
      // Сбрасываем счётчик при загрузке новой страницы поиска
      tabCounts.set(tabId, 0);
      chrome.action.setBadgeText({
        text: '',
        tabId: tabId
      });
    }
  }
});

// Очищаем счётчик при закрытии вкладки
chrome.tabs.onRemoved.addListener((tabId) => {
  tabCounts.delete(tabId);
});

