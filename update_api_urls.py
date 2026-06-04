import os
import re

def update_api_urls():
    base_dir = r"d:\clone\netflix-clone\frontend"
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.js') or file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Replace API_BASE
                content = re.sub(r"var API_BASE\s*=\s*['\"]http://(?:127\.0\.0\.1|localhost):5000/api['\"];", "var API_BASE = '/api';", content)
                content = re.sub(r"const API_BASE\s*=\s*['\"]http://(?:127\.0\.0\.1|localhost):5000/api['\"];", "const API_BASE = '/api';", content)
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {filepath}")

if __name__ == '__main__':
    update_api_urls()
