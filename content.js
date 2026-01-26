// Множество для отслеживания уже скрытых элементов
const hiddenElements = new WeakSet();

// Общее количество скрытых элементов на странице
let totalHiddenCount = 0;

// Логируем, что скрипт загружен
console.log('YandexClear: Скрипт загружен!', location.href);

// Функция для проверки, содержит ли элемент текст "промо"
function containsPromoText(element) {
  const text = element.textContent?.toLowerCase().trim() || '';
  // Проверяем, содержит ли элемент слово "промо" или "promo" как отдельное слово
  return /\b(промо|promo)\b/i.test(text);
}

// Функция для поиска родительского контейнера результата поиска
function findResultContainer(element) {
  if (!element) return null;
  
  // Сначала ищем li.serp-item или li[data-cid] - это основной контейнер результата
  const liSelectors = [
    'li.serp-item',
    'li[class*="serp-item"]',
    'li[data-cid]',
    'li[class*="SerpItem"]'
  ];
  
  for (const selector of liSelectors) {
    try {
      const found = element.closest(selector);
      if (found) {
        return found;
      }
    } catch (e) {
      // Игнорируем ошибки селекторов
    }
  }
  
  // Если не нашли li, ищем другие контейнеры
  const selectors = [
    '[class*="serp-item"]',
    '[class*="SerpItem"]',
    '[class*="serp-item-wrapper"]',
    '[class*="Organic"]',
    '[class*="organic"]',
    '[class*="organic-wrapper"]',
    '[data-cid]',
    '[class*="result"]',
    '[class*="Result"]',
    '[class*="search-result"]',
    '[class*="SearchResult"]',
    '[class*="serp"]',
    '[class*="Serp"]',
    'li[class*="serp"]',
    'li[class*="item"]',
    'div[class*="serp"]',
    'div[class*="item"]'
  ];
  
  for (const selector of selectors) {
    try {
      const found = element.closest(selector);
      if (found) {
        return found;
      }
    } catch (e) {
      // Игнорируем ошибки селекторов
    }
  }
  
  // Если не нашли через селекторы, идём вверх по DOM и ищем контейнер результата
  let current = element;
  let depth = 0;
  const maxDepth = 20;
  
  while (current && depth < maxDepth) {
    // Проверяем различные признаки контейнера результата
    if (current.tagName === 'LI' && (
        current.classList?.toString().toLowerCase().includes('serp') ||
        current.hasAttribute('data-cid')
    )) {
      return current;
    }
    
    if (current.classList && current.classList.length > 0) {
      const classList = current.classList.toString().toLowerCase();
      // Ищем характерные классы Яндекса
      if (classList.includes('serp') || 
          classList.includes('item') || 
          classList.includes('result') ||
          classList.includes('organic') ||
          classList.includes('ad') ||
          classList.includes('advertising') ||
          classList.includes('promo') ||
          current.hasAttribute('data-cid') ||
          current.hasAttribute('data-log-node') ||
          current.hasAttribute('data-fast-name')) {
        // Проверяем, что это не слишком общий контейнер (например, весь список результатов)
        const rect = current.getBoundingClientRect();
        if (rect.height > 50 && rect.height < 2000) {
          return current;
        }
      }
    }
    
    // Также проверяем по тегу
    if (current.tagName === 'LI' || 
        (current.tagName === 'DIV' && current.hasAttribute('data-cid'))) {
      return current;
    }
    
    current = current.parentElement;
    depth++;
  }
  
  return null;
}

// Функция для поиска всех возможных контейнеров результатов поиска
function findAllResultContainers() {
  const containers = new Set();
  
  // Список селекторов для поиска контейнеров результатов
  const containerSelectors = [
    'li[class*="serp"]',
    'li[class*="Serp"]',
    'li[class*="item"]',
    'li[class*="Item"]',
    'li[class*="result"]',
    'li[class*="Result"]',
    'div[class*="serp-item"]',
    'div[class*="SerpItem"]',
    'div[class*="serp"]',
    'div[class*="Serp"]',
    'div[class*="organic"]',
    'div[class*="Organic"]',
    'div[data-cid]',
    'article[class*="serp"]',
    'article[class*="item"]',
    '[class*="serp-item"]',
    '[class*="SerpItem"]',
    '[data-cid]',
    '[data-log-node]'
  ];
  
  containerSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Проверяем, что это не слишком общий контейнер
        const rect = el.getBoundingClientRect();
        if (rect.height > 30 && rect.height < 3000 && rect.width > 100) {
          containers.add(el);
        }
      });
    } catch (e) {
      // Игнорируем ошибки
    }
  });
  
  // Также ищем все элементы с классами, содержащими характерные слова
  try {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.classList && el.classList.length > 0) {
        const classList = el.classList.toString().toLowerCase();
        if ((classList.includes('serp') || 
             classList.includes('item') || 
             classList.includes('result') ||
             classList.includes('organic')) &&
            !containers.has(el)) {
          const rect = el.getBoundingClientRect();
          if (rect.height > 30 && rect.height < 3000 && rect.width > 100) {
            containers.add(el);
          }
        }
      }
    });
  } catch (e) {
    // Игнорируем ошибки
  }
  
  return Array.from(containers);
}

// Функция для проверки, содержит ли элемент текст "промо" (более агрессивная проверка)
function hasPromoText(element) {
  if (!element) return false;
  
  // Проверяем textContent
  const textContent = element.textContent?.toLowerCase() || '';
  if (textContent.includes('промо') || textContent.includes('promo')) {
    return true;
  }
  
  // Проверяем innerText (видимый текст)
  const innerText = element.innerText?.toLowerCase() || '';
  if (innerText.includes('промо') || innerText.includes('promo')) {
    return true;
  }
  
  // Проверяем innerHTML
  const innerHTML = element.innerHTML?.toLowerCase() || '';
  if (innerHTML.includes('промо') || innerHTML.includes('promo')) {
    return true;
  }
  
  // Проверяем все текстовые узлы внутри элемента
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let textNode;
  while (textNode = walker.nextNode()) {
    const text = textNode.textContent?.trim().toLowerCase();
    if (text === 'промо' || text === 'promo' || 
        text.includes('промо') || text.includes('promo')) {
      return true;
    }
  }
  
  return false;
}

// Функция для проверки, является ли элемент промо-результатом
function isPromoResult(liElement) {
  if (!liElement) return false;
  
  // Проверяем наличие классов, указывающих на промо
  const classList = liElement.classList?.toString() || '';
  if (classList.includes('Organic_withAdvLabel') || 
      classList.includes('Organic_withPromoOffer')) {
    return true;
  }
  
  // Проверяем наличие элементов с классами промо-меток внутри li
  const hasAdvLabel = liElement.querySelector('.AdvLabel, .OrganicAdvLabel, .AdvLabel-Text, [class*="AdvLabel"]');
  if (hasAdvLabel) {
    // Проверяем, содержит ли этот элемент текст "Промо"
    const text = hasAdvLabel.textContent?.toLowerCase() || '';
    if (text.includes('промо') || text.includes('promo')) {
      return true;
    }
  }
  
  // Проверяем наличие элементов с классами Organic_withAdvLabel или Organic_withPromoOffer
  const hasPromoClass = liElement.querySelector('[class*="Organic_withAdvLabel"], [class*="Organic_withPromoOffer"]');
  if (hasPromoClass) {
    return true;
  }
  
  // Проверяем весь текст внутри li на наличие "промо"
  const liText = liElement.textContent?.toLowerCase() || '';
  // Ищем "Промо" как отдельное слово или в метке
  if (/\b(промо|promo)\b/i.test(liText)) {
    // Дополнительная проверка - ищем элемент AdvLabel с текстом "Промо"
    const advLabel = liElement.querySelector('.AdvLabel, .OrganicAdvLabel');
    if (advLabel) {
      const advText = advLabel.textContent?.toLowerCase() || '';
      if (advText.includes('промо') || advText.includes('promo')) {
        return true;
      }
    }
  }
  
  return false;
}

// Функция для скрытия результатов с пометкой "промо"
function hidePromoResults() {
  const promoElements = new Set();
  
  // Стратегия 1: Ищем все li.serp-item и проверяем их содержимое (самый надёжный способ)
  try {
    const serpItems = document.querySelectorAll('li.serp-item, li[class*="serp-item"], li[data-cid]');
    
    serpItems.forEach(li => {
      if (hiddenElements.has(li)) return;
      
      // Проверяем наличие AdvLabel с текстом "Промо" внутри
      // AdvLabel - это специфичный элемент Яндекса для меток рекламы, поэтому это надёжный признак
      const advLabel = li.querySelector('.AdvLabel, .OrganicAdvLabel, .AdvLabel-Text, [class*="AdvLabel"]');
      if (advLabel) {
        const text = advLabel.textContent?.trim().toLowerCase() || '';
        // Проверяем точное совпадение или что текст начинается/заканчивается на "промо"/"promo"
        // Это исключает случайные упоминания слова "промо" в описании сайта
        if (text === 'промо' || text === 'promo' || 
            text.startsWith('промо') || text.startsWith('promo') ||
            text.endsWith('промо') || text.endsWith('promo')) {
          promoElements.add(li);
          hiddenElements.add(li);
          return;
        }
      }
      
      // Проверяем наличие классов Organic_withAdvLabel или Organic_withPromoOffer внутри
      const hasPromoClass = li.querySelector('[class*="Organic_withAdvLabel"], [class*="Organic_withPromoOffer"]');
      if (hasPromoClass) {
        promoElements.add(li);
        hiddenElements.add(li);
        return;
      }
      
      // Проверяем весь текст li на наличие "промо" и наличие элемента AdvLabel
      // Это дополнительная проверка на случай, если "промо" добавлено динамически
      const liText = li.textContent?.toLowerCase() || '';
      if (liText.includes('промо') || liText.includes('promo')) {
        // Дополнительная проверка - должен быть элемент AdvLabel с точным текстом "Промо"
        // Это гарантирует, что мы скрываем только реальные промо-результаты, а не обычные сайты
        // где случайно упоминается слово "промо" в описании
        const hasAdvLabel = li.querySelector('.AdvLabel, .OrganicAdvLabel, [class*="AdvLabel"]');
        if (hasAdvLabel) {
          const advText = hasAdvLabel.textContent?.trim().toLowerCase() || '';
          // Строгая проверка - текст должен быть точно "промо" или "promo"
          if (advText === 'промо' || advText === 'promo' ||
              advText.startsWith('промо') || advText.startsWith('promo') ||
              advText.endsWith('промо') || advText.endsWith('promo')) {
            promoElements.add(li);
            hiddenElements.add(li);
          }
        }
      }
    });
  } catch (e) {
    console.error('YandexClear: Ошибка при поиске serp-item:', e);
  }
  
  // Стратегия 2: Ищем элементы с текстом "Промо" в AdvLabel и находим родительский li
  try {
    const advLabels = document.querySelectorAll('.AdvLabel, .OrganicAdvLabel, .AdvLabel-Text, [class*="AdvLabel"]');
    
    advLabels.forEach(el => {
      const text = el.textContent?.trim().toLowerCase() || '';
      // Строгая проверка - текст должен быть точно "промо" или "promo"
      // AdvLabel - это специфичный элемент Яндекса, поэтому если в нём есть "промо",
      // это точно промо-результат, а не случайное упоминание
      if (text === 'промо' || text === 'promo' ||
          text.startsWith('промо') || text.startsWith('promo') ||
          text.endsWith('промо') || text.endsWith('promo')) {
        // Ищем родительский li.serp-item
        let li = el.closest('li.serp-item');
        if (!li) li = el.closest('li[class*="serp-item"]');
        if (!li) li = el.closest('li[data-cid]');
        
        if (li && !hiddenElements.has(li)) {
          promoElements.add(li);
          hiddenElements.add(li);
        }
      }
    });
  } catch (e) {
    console.error('YandexClear: Ошибка при поиске AdvLabel:', e);
  }
  
  // Стратегия 3: Ищем элементы с классами Organic_withAdvLabel или Organic_withPromoOffer
  try {
    const promoDivs = document.querySelectorAll('[class*="Organic_withAdvLabel"], [class*="Organic_withPromoOffer"]');
    
    promoDivs.forEach(el => {
      // Ищем родительский li.serp-item
      let li = el.closest('li.serp-item');
      if (!li) li = el.closest('li[class*="serp-item"]');
      if (!li) li = el.closest('li[data-cid]');
      
      if (li && !hiddenElements.has(li)) {
        promoElements.add(li);
        hiddenElements.add(li);
      }
    });
  } catch (e) {
    console.error('YandexClear: Ошибка при поиске промо-классов:', e);
  }
  
  // Скрываем найденные элементы
  promoElements.forEach(element => {
    element.style.display = 'none';
    element.style.visibility = 'hidden';
    element.style.height = '0';
    element.style.overflow = 'hidden';
    element.style.margin = '0';
    element.style.padding = '0';
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
    // Добавляем атрибут для отслеживания
    element.setAttribute('data-yandexclear-hidden', 'true');
  });
  
  if (promoElements.size > 0) {
    console.log('YandexClear: Скрыто промо-результатов:', promoElements.size);
  }
  
  // Обновляем общее количество скрытых элементов
  const newCount = promoElements.size;
  if (newCount > 0) {
    totalHiddenCount += newCount;
    
    // Отправляем общее количество скрытых элементов в background script
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: 'updateBadge',
        count: totalHiddenCount,
        isTotal: true
      }).catch(() => {
        // Игнорируем ошибки, если background script не готов
      });
    }
  }
  
  return promoElements.size;
}

// Используем MutationObserver для отслеживания динамически добавляемых результатов
const observer = new MutationObserver((mutations) => {
  let shouldCheck = false;
  
  mutations.forEach((mutation) => {
    // Проверяем добавленные узлы
    if (mutation.addedNodes.length > 0) {
      shouldCheck = true;
      // Немедленно проверяем добавленные узлы
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (hasPromoText(node)) {
            const container = findResultContainer(node);
            if (container && !hiddenElements.has(container)) {
              hidePromoResults();
              return;
            }
          }
        }
      });
    }
    // Также проверяем изменения текста (на случай, если "промо" добавляется динамически)
    if (mutation.type === 'characterData' || mutation.type === 'childList') {
      shouldCheck = true;
    }
    // Проверяем изменения атрибутов (на случай, если "промо" добавляется через атрибуты)
    if (mutation.type === 'attributes') {
      shouldCheck = true;
    }
  });
  
  if (shouldCheck) {
    // Используем debounce, но с более короткой задержкой
    clearTimeout(observer.timeoutId);
    observer.timeoutId = setTimeout(() => {
      hidePromoResults();
    }, 100);
  }
});

// Периодическая проверка на случай, если что-то пропустили
let checkInterval = null;

// Функция инициализации
function init() {
  console.log('YandexClear: Инициализация расширения');
  
  // Сбрасываем счётчик при инициализации
  totalHiddenCount = 0;
  
  // Скрываем промо результаты при загрузке страницы
  hidePromoResults();
  
  // Множественные проверки с разными задержками (на случай динамической загрузки)
  setTimeout(() => hidePromoResults(), 100);
  setTimeout(() => hidePromoResults(), 300);
  setTimeout(() => hidePromoResults(), 500);
  setTimeout(() => hidePromoResults(), 1000);
  setTimeout(() => hidePromoResults(), 1500);
  setTimeout(() => hidePromoResults(), 2000);
  setTimeout(() => hidePromoResults(), 3000);
  setTimeout(() => hidePromoResults(), 5000);
  setTimeout(() => hidePromoResults(), 7000);
  setTimeout(() => hidePromoResults(), 10000);
  
  // Начинаем наблюдение за изменениями DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,  // Отслеживаем изменения атрибутов
    attributeFilter: ['class', 'data-promo', 'data-ad', 'aria-label', 'title'],  // Конкретные атрибуты
    characterData: true  // Отслеживаем изменения текста (на случай динамического добавления "промо")
  });
  
  // Периодическая проверка каждые 500 мс (более часто, чтобы не пропустить)
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  checkInterval = setInterval(() => {
    hidePromoResults();
  }, 500);
}

// Запускаем после полной загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Также обрабатываем навигацию в SPA (если Яндекс использует AJAX)
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Сбрасываем счётчик при навигации
    totalHiddenCount = 0;
    // Перезапускаем проверку
    setTimeout(() => {
      hidePromoResults();
    }, 300);
    setTimeout(() => {
      hidePromoResults();
    }, 1000);
    setTimeout(() => {
      hidePromoResults();
    }, 2000);
  }
});

urlObserver.observe(document, { subtree: true, childList: true });

// Также отслеживаем изменения URL через popstate (навигация назад/вперёд)
window.addEventListener('popstate', () => {
  totalHiddenCount = 0;
  setTimeout(() => {
    hidePromoResults();
  }, 300);
});

// Отслеживаем изменения через history API
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  originalPushState.apply(history, args);
  totalHiddenCount = 0;
  setTimeout(() => {
    hidePromoResults();
  }, 300);
};

history.replaceState = function(...args) {
  originalReplaceState.apply(history, args);
  totalHiddenCount = 0;
  setTimeout(() => {
    hidePromoResults();
  }, 300);
};


