import os
import re

BANNER_HTML = """
<div style="background-color: #ffcc00; color: #000; text-align: center; padding: 12px; font-weight: bold; position: relative; z-index: 10000; width: 100%; font-family: sans-serif; box-sizing: border-box;">
    ⚠️ PORTFOLIO PROJECT: This is a developer demonstration created by Vamsi. Do NOT enter real Netflix passwords.
</div>
"""

def bypass_phishing_filters():
    base_dir = r"d:\clone\netflix-clone\frontend"
    for file in os.listdir(base_dir):
        if file.endswith('.html'):
            filepath = os.path.join(base_dir, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Replace titles
            content = re.sub(r'<title>.*?</title>', "<title>Vamsi's Portfolio - Streaming App</title>", content)
            
            # Replace logos
            content = re.sub(r'>NETFLIX<', ">VAMSIFLIX<", content)
            
            # Add banner to login, register, index
            if file in ['login.html', 'register.html', 'index.html']:
                if 'PORTFOLIO PROJECT' not in content:
                    # Inject right after opening body tag
                    content = re.sub(r'(<body[^>]*>)', r'\1' + BANNER_HTML, content, count=1)
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {file}")

if __name__ == '__main__':
    bypass_phishing_filters()
