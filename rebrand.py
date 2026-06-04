import os
import re

def update_html_files():
    base_dir = r"d:\clone\netflix-clone\frontend"
    for file in os.listdir(base_dir):
        if file.endswith('.html'):
            filepath = os.path.join(base_dir, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # 1. Replace Font
            content = re.sub(
                r'<link href="https://fonts\.googleapis\.com/css2\?family=Netflix\+Sans[^"]+" rel="stylesheet">',
                r'<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
                content
            )
            
            # 2. Remove yellow banner
            content = re.sub(
                r'<div style="background-color: #ffcc00;[^>]+>\s*.*?PORTFOLIO PROJECT.*?\s*</div>\n?',
                '',
                content,
                flags=re.DOTALL
            )
            
            # 3. Replace "New to Netflix?"
            content = content.replace("New to Netflix?", "New to VamsiFlix?")
            
            # 4. Make sure logo is VAMSIFLIX
            content = re.sub(r'>NETFLIX<', ">VAMSIFLIX<", content)
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {file}")

if __name__ == '__main__':
    update_html_files()
