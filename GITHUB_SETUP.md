# Инструкция по публикации на GitHub

## Быстрый способ (через скрипт)

1. Запустите `UPLOAD_TO_GITHUB.bat`
2. Следуйте инструкциям на экране

## Ручной способ

### 1. Создайте репозиторий на GitHub

1. Перейдите на https://github.com/new
2. Название репозитория: `Yandex-AdBlock-Promo` (или любое другое)
3. **НЕ** ставьте галочки на "Add a README file", ".gitignore" или "license"
4. Нажмите "Create repository"

### 2. Инициализируйте git в проекте

Откройте PowerShell или командную строку в папке проекта и выполните:

```bash
git init
git add .
git commit -m "Initial commit: Yandex AdBlock Promo extension"
```

### 3. Подключите удалённый репозиторий

Замените `slavola59` на ваш логин GitHub:

```bash
git remote add origin https://github.com/slavola59/Yandex-AdBlock-Promo.git
```

### 4. Отправьте код на GitHub

```bash
git branch -M main
git push -u origin main
```

Если возникнет ошибка с веткой, попробуйте:

```bash
git push -u origin master
```

## Что будет опубликовано

- `manifest.json` - манифест расширения
- `background.js` - фоновый скрипт
- `content.js` - скрипт для работы со страницей
- `generate_icons.py` - скрипт для генерации иконок
- `icon16.png`, `icon48.png`, `icon128.png` - иконки расширения
- `README.md` - документация
- `.gitignore` - файл игнорирования
- `ИНСТРУКЦИЯ_ПО_УСТАНОВКЕ.txt` - инструкция по установке

**НЕ будет опубликовано:**
- `YandexClear-extension.zip` (если добавить в .gitignore)
- Временные файлы

## После публикации

1. Обновите описание репозитория на GitHub
2. Добавьте теги (tags) для версий, если нужно
3. Создайте Release с архивом расширения (опционально)
