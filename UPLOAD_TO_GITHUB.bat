@echo off
chcp 65001 >nul
echo ================================================
echo  ПУБЛИКАЦИЯ НА GITHUB
echo ================================================
echo.

REM Проверяем наличие git
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ОШИБКА: Git не установлен или не найден в PATH
    echo Установите Git с https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Проверяем, инициализирован ли репозиторий
if not exist .git (
    echo Инициализация git репозитория...
    git init
    echo.
)

REM Проверяем наличие иконок
if not exist icon16.png (
    echo ВНИМАНИЕ: Иконки не найдены!
    echo Генерируем иконки...
    python generate_icons.py
    if %errorlevel% neq 0 (
        echo ОШИБКА: Не удалось сгенерировать иконки
        echo Установите Pillow: pip install Pillow
        pause
        exit /b 1
    )
    echo.
)

REM Добавляем все файлы
echo Добавление файлов в git...
git add .

REM Проверяем, есть ли изменения
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo Нет изменений для коммита.
    echo.
) else (
    echo Создание коммита...
    git commit -m "Initial commit: Yandex AdBlock Promo extension"
    echo.
)

REM Проверяем, есть ли удалённый репозиторий
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ================================================
    echo  НАСТРОЙКА УДАЛЁННОГО РЕПОЗИТОРИЯ
    echo ================================================
    echo.
    echo Если у вас ещё нет репозитория на GitHub:
    echo 1. Перейдите на https://github.com/new
    echo 2. Создайте новый репозиторий (например: Yandex-AdBlock-Promo)
    echo 3. НЕ инициализируйте его с README, .gitignore или лицензией
    echo.
    set /p REPO_URL="Введите URL вашего репозитория (например: https://github.com/slavola59/Yandex-AdBlock-Promo.git): "
    if not "%REPO_URL%"=="" (
        git remote add origin %REPO_URL%
        echo Удалённый репозиторий добавлен.
        echo.
    ) else (
        echo URL не введён. Пропускаем настройку удалённого репозитория.
        echo.
    )
)

REM Отправляем на GitHub
echo ================================================
echo  ОТПРАВКА НА GITHUB
echo ================================================
echo.
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo Отправка изменений на GitHub...
    git push -u origin main
    if %errorlevel% neq 0 (
        echo Попытка отправить в ветку master...
        git push -u origin master
        if %errorlevel% neq 0 (
            echo.
            echo ОШИБКА: Не удалось отправить на GitHub
            echo Проверьте:
            echo - Правильность URL репозитория
            echo - Наличие прав доступа
            echo - Настройки аутентификации GitHub
            pause
            exit /b 1
        )
    )
    echo.
    echo ================================================
    echo  УСПЕШНО ОПУБЛИКОВАНО НА GITHUB!
    echo ================================================
) else (
    echo Удалённый репозиторий не настроен.
    echo Настройте его вручную:
    echo   git remote add origin https://github.com/ВАШ_ЛОГИН/НАЗВАНИЕ_РЕПОЗИТОРИЯ.git
    echo   git push -u origin main
)

echo.
pause
