#!/usr/bin/env python3
"""
Скрипт для генерации иконок расширения Yandex AdBlock Promo
Требует установки Pillow: pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import math

def create_icon(size, filename):
    """Создаёт иконку заданного размера - буква Я синего цвета на белом фоне"""
    # Создаём изображение с белым фоном
    img = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Цвета: синяя буква Я на белом фоне
    text_color = '#4285F4'  # Синий (как у Яндекса)
    
    # Пытаемся использовать системный шрифт
    try:
        # Для Windows - используем Arial или другой системный шрифт
        font_size = int(size * 0.7)
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", font_size)
            except:
                font = ImageFont.truetype("C:/Windows/Fonts/calibri.ttf", font_size)
    except:
        try:
            # Для Linux
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(size * 0.7))
        except:
            # Базовый шрифт (может не поддерживать кириллицу)
            font = ImageFont.load_default()
            font_size = int(size * 0.6)
    
    # Рисуем букву Я
    text = "Я"
    
    # Получаем размеры текста для центрирования
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    except:
        # Если не получилось, используем приблизительные размеры
        text_width = size * 0.6
        text_height = size * 0.6
    
    # Центрируем текст
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1] if 'bbox' in locals() else (size - text_height) // 2
    
    draw.text((x, y), text, fill=text_color, font=font)
    
    # Сохраняем
    img.save(filename, 'PNG')
    print(f"Создана иконка: {filename} ({size}x{size})")

def main():
    """Генерирует все необходимые иконки"""
    sizes = [16, 48, 128]
    
    for size in sizes:
        filename = f"icon{size}.png"
        create_icon(size, filename)
    
    print("\nВсе иконки успешно созданы!")

if __name__ == "__main__":
    main()

