const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const token = localStorage.getItem('token');

    if (!currentUser || !token) {
        window.location.href = 'index.html';
        return;
    }

    // Modal elements
    const editModal = document.getElementById('edit-modal');
    const avatarModal = document.getElementById('avatar-modal');
    const openEditModalBtn = document.getElementById('open-edit-modal');
    const openAvatarModalBtn = document.getElementById('open-avatar-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal');
    const closeAvatarModalBtn = document.getElementById('close-avatar-modal');

    // UI elements
    const heroName = document.getElementById('hero-name');
    const heroAvatar = document.getElementById('hero-avatar');
    const navProfileIcon = document.getElementById('nav-profile-icon');
    
    const editName = document.getElementById('edit-name');
    const editEmail = document.getElementById('edit-email');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const editMsg = document.getElementById('edit-msg');

    let currentAvatarUrl = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png';

    // 1. Fetch User Data
    const loadUserProfile = async () => {
        try {
            const res = await fetch(`${API_BASE}/profile/${currentUser._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                heroName.textContent = data.name;
                currentAvatarUrl = data.avatar || currentAvatarUrl;
                heroAvatar.src = currentAvatarUrl;
                navProfileIcon.style.backgroundImage = `url('${currentAvatarUrl}')`;
                
                editName.value = data.name;
                editEmail.value = data.email;

                // Set member since
                if (data.createdAt) {
                    const date = new Date(data.createdAt);
                    document.getElementById('stat-member-since').textContent = date.getFullYear();
                }

                // Highlight correct avatar in modal
                document.querySelectorAll('.avatar-opt').forEach(opt => {
                    opt.classList.remove('selected');
                    if(opt.getAttribute('data-src') === currentAvatarUrl) {
                        opt.classList.add('selected');
                    }
                });
                
                // Set main profile form name and email
                const profileNameInput = document.getElementById('profile-name');
                const profileEmailInput = document.getElementById('profile-email');
                if (profileNameInput) profileNameInput.value = data.name;
                if (profileEmailInput) profileEmailInput.value = data.email;
            }
        } catch (err) { console.error(err); }
    };

    // 2. Load Movies, History, Watchlist
    const loadDashboardData = async () => {
        try {
            // Get all movies to populate rows
            const moviesRes = await fetch(`${API_BASE}/movies`);
            const allMovies = await moviesRes.json();

            // Get History
            const historyRes = await fetch(`${API_BASE}/history?userId=${currentUser._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let history = [];
            if (historyRes.ok) history = await historyRes.json();

            // Get Watchlist
            const watchlistRes = await fetch(`${API_BASE}/watchlist?userId=${currentUser._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let watchlist = [];
            if (watchlistRes.ok) watchlist = await watchlistRes.json();

            // Populate Stats
            document.getElementById('stat-movies-watched').textContent = history.length;
            document.getElementById('stat-watchlist').textContent = watchlist.length;

            let totalMinutes = 0;
            history.forEach(h => {
                const movie = allMovies.find(m => m._id === h.movieId);
                if (movie && movie.duration) {
                    // Parse "2h 10m"
                    const hoursMatch = movie.duration.match(/(\d+)h/);
                    const minsMatch = movie.duration.match(/(\d+)m/);
                    const hVal = hoursMatch ? parseInt(hoursMatch[1]) : 0;
                    const mVal = minsMatch ? parseInt(minsMatch[1]) : 0;
                    totalMinutes += (hVal * 60) + mVal;
                } else {
                    totalMinutes += 120; // default 2 hours if unknown
                }
            });
            document.getElementById('stat-hours').textContent = Math.round(totalMinutes / 60);

            // Populate Rows
            renderMovieRow('continue-watching-row', 'continue-watching-section', history.filter(h => h.progress > 0), allMovies, true);
            renderMovieRow('history-row', 'history-section', history, allMovies, false);
            renderMovieRow('favorites-row', 'favorites-section', watchlist, allMovies, false);

        } catch (err) { console.error(err); }
    };

    const renderMovieRow = (rowId, sectionId, items, allMovies, isContinue) => {
        const row = document.getElementById(rowId);
        const section = document.getElementById(sectionId);
        row.innerHTML = '';

        if (items.length === 0) return;
        section.style.display = 'block';

        items.forEach(item => {
            const movie = allMovies.find(m => m._id === item.movieId);
            if (!movie) return;

            const card = document.createElement('div');
            card.classList.add('movie-card');
            
            // Reusing script.js createMovieCard logic conceptually
            card.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="play-btn-overlay">&#9658;</div>
                <div class="movie-title-overlay">${movie.title}</div>
            `;
            
            if (isContinue && item.progress) {
                card.innerHTML += `
                    <div style="position: absolute; bottom: 0; left: 0; height: 4px; background: #e50914; width: ${item.progress}%"></div>
                `;
            }

            card.addEventListener('click', () => {
                window.location.href = `video-player.html?id=${movie._id}`;
            });

            row.appendChild(card);
        });
    };

    // Modal Logic
    openEditModalBtn.addEventListener('click', () => editModal.classList.add('active'));
    closeEditModalBtn.addEventListener('click', () => editModal.classList.remove('active'));
    
    openAvatarModalBtn.addEventListener('click', () => avatarModal.classList.add('active'));
    closeAvatarModalBtn.addEventListener('click', () => avatarModal.classList.remove('active'));

    // Avatar Selection
    document.querySelectorAll('.avatar-opt').forEach(opt => {
        opt.addEventListener('click', async (e) => {
            document.querySelectorAll('.avatar-opt').forEach(o => o.classList.remove('selected'));
            e.target.classList.add('selected');
            const newAvatar = e.target.getAttribute('data-src');
            
            // Instantly save new avatar
            await saveProfile(editName.value, newAvatar);
            avatarModal.classList.remove('active');
        });
    });

    // Save Name from Modal
    saveProfileBtn.addEventListener('click', async () => {
        const selectedOpt = document.querySelector('.avatar-opt.selected');
        const selectedAvatar = selectedOpt ? selectedOpt.getAttribute('data-src') : currentAvatarUrl;
        await saveProfile(editName.value, selectedAvatar);
        
        editMsg.style.display = 'block';
        setTimeout(() => {
            editMsg.style.display = 'none';
            editModal.classList.remove('active');
        }, 1500);
    });

    // Save Name from Main Form
    const mainSaveBtn = document.getElementById('save-profile');
    const mainProfileMsg = document.getElementById('profile-msg');
    const mainProfileName = document.getElementById('profile-name');
    
    if (mainSaveBtn) {
        mainSaveBtn.addEventListener('click', async () => {
            const selectedOpt = document.querySelector('.avatar-opt.selected');
            const selectedAvatar = selectedOpt ? selectedOpt.getAttribute('data-src') : currentAvatarUrl;
            await saveProfile(mainProfileName.value, selectedAvatar);
            
            mainProfileMsg.style.display = 'block';
            setTimeout(() => mainProfileMsg.style.display = 'none', 3000);
        });
    }

    const saveProfile = async (name, avatar) => {
        try {
            const res = await fetch(`${API_BASE}/profile/${currentUser._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ name, avatar })
            });
            if (res.ok) {
                const data = await res.json();
                
                // Update local storage
                currentUser.name = data.user.name;
                currentUser.avatar = data.user.avatar;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Update UI immediately
                heroName.textContent = data.user.name;
                heroAvatar.src = data.user.avatar;
                navProfileIcon.style.backgroundImage = `url('${data.user.avatar}')`;
                currentAvatarUrl = data.user.avatar;
                
                editName.value = data.user.name;
                const mainProfileName = document.getElementById('profile-name');
                if (mainProfileName) mainProfileName.value = data.user.name;
            }
        } catch (err) { console.error(err); }
    };

    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }

    // Init
    loadUserProfile();
    loadDashboardData();
});
