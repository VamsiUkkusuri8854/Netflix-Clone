import os
import re

FOOTER_HTML = """    <footer>
        <div class="footer-content" style="text-align: center;">
            <p style="margin-bottom: 20px;">Contact Us<br>Email: <a href="mailto:vamsiukkusuri@gmail.com" style="color: #e50914;">vamsiukkusuri@gmail.com</a><br>Phone: +91 8885427136</p>
            <div class="footer-links" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
                <a href="#" onclick="showAboutModal(event)">About</a>
                <a href="#" onclick="showContactModal(event)">Contact</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
            </div>
            <p class="country" style="margin-bottom: 5px;">© 2026 Vamsi. All Rights Reserved.</p>
            <p class="country">Developed by Vamsi.</p>
        </div>
    </footer>
"""

MODAL_HTML = """
    <div id="branding-modals">
        <div id="contactModal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.95); border:1px solid #333; padding:40px; z-index:9999; border-radius:8px; text-align:center; min-width:300px;">
            <h2 style="color:white; margin-bottom:20px;">Contact Us</h2>
            <p style="color:#b3b3b3; margin-bottom:10px;">Name: <span style="color:white;">Vamsi</span></p>
            <p style="color:#b3b3b3; margin-bottom:10px;">Email: <a href="mailto:vamsiukkusuri@gmail.com" style="color:#e50914;">vamsiukkusuri@gmail.com</a></p>
            <p style="color:#b3b3b3; margin-bottom:30px;">Phone: <span style="color:white;">+91 8885427136</span></p>
            <button onclick="document.getElementById('contactModal').style.display='none'" style="background:#e50914; color:white; border:none; padding:10px 20px; border-radius:4px; cursor:pointer;">Close</button>
        </div>
        
        <div id="aboutModal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.95); border:1px solid #333; padding:40px; z-index:9999; border-radius:8px; text-align:center; max-width:400px;">
            <h2 style="color:white; margin-bottom:20px;">About</h2>
            <p style="color:#b3b3b3; margin-bottom:30px; line-height:1.6;">This Netflix Clone project was developed and maintained by Vamsi for educational and portfolio purposes.</p>
            <button onclick="document.getElementById('aboutModal').style.display='none'" style="background:#e50914; color:white; border:none; padding:10px 20px; border-radius:4px; cursor:pointer;">Close</button>
        </div>
    </div>
    <script>
        function showContactModal(e) { e.preventDefault(); document.getElementById('contactModal').style.display='block'; }
        function showAboutModal(e) { e.preventDefault(); document.getElementById('aboutModal').style.display='block'; }
    </script>
"""

PROFILE_INFO = """
            <div class="stat-card glass" style="grid-column: 1 / -1; margin-top: 20px; text-align: center;">
                <h3>Project Information</h3>
                <div style="font-size: 1.1rem; margin-top: 10px;">
                    <p style="color:#b3b3b3;">Project Owner: <span style="color:white;">Vamsi</span></p>
                    <p style="color:#b3b3b3; margin-top:5px;">Support Email: <a href="mailto:vamsiukkusuri@gmail.com" style="color: #e50914;">vamsiukkusuri@gmail.com</a></p>
                </div>
            </div>
"""

def update_branding():
    base_dir = r"d:\clone\netflix-clone\frontend"
    for file in os.listdir(base_dir):
        if file.endswith('.html'):
            filepath = os.path.join(base_dir, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Replace footer
            if '<footer' in content:
                content = re.sub(r'<footer.*?</footer>', FOOTER_HTML, content, flags=re.DOTALL)
            
            # Inject modal before closing body
            if '<body' in content and 'branding-modals' not in content:
                content = content.replace('</body>', MODAL_HTML + '\n</body>')
                
            # Profile page specific updates
            if file == 'profile.html':
                if 'Project Owner: Vamsi' not in content:
                    content = content.replace('</section>\n\n        <!-- Continue Watching', PROFILE_INFO + '\n        </section>\n\n        <!-- Continue Watching')
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {file}")

if __name__ == '__main__':
    update_branding()
