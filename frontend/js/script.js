const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const token = localStorage.getItem('token');
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';

    const isAuthPage = currentPage === 'login.html' || currentPage === 'register.html';
    const isDashboard = ['dashboard.html', 'movie-details.html', 'profile.html', 'my-list.html', 'video-player.html'].includes(currentPage);
    const isLanding = currentPage === 'index.html';

    // Force re-login if using legacy local storage user without backend ID or missing token
    if (currentUser && (!currentUser._id || !token)) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
    }

    if (currentUser && (isAuthPage || isLanding)) {
        window.location.href = 'dashboard.html';
        return;
    }
    if (!currentUser && isDashboard) {
        window.location.href = 'login.html';
        return;
    }

    // Navbar Profile Dropdown
    const profileBtn = document.getElementById('profile-menu-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', () => {
            profileDropdown.style.display = profileDropdown.style.display === 'none' ? 'block' : 'none';
        });
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.style.display = 'none';
            }
        });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar && !['video-player.html'].includes(currentPage)) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('black');
            } else {
                navbar.classList.remove('black');
            }
        });
    }

    // Dashboard User Details & Logout
    if (currentUser) {
        const welcomeText = document.getElementById('welcome-user');
        if (welcomeText) welcomeText.textContent = `Welcome, ${currentUser.name}`;
        
        if (currentUser.role === 'admin') {
            const adminLink = document.getElementById('admin-link');
            if (adminLink) adminLink.style.display = 'block';
        }
    }

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    // Form Helpers
    function showError(id, message) {
        const el = document.getElementById(id);
        if (!el) return;
        const group = el.closest('.form-group');
        if(group) {
            group.classList.add('error');
            group.querySelector('.error-text').textContent = message;
        }
    }
    function clearError(id) {
        const el = document.getElementById(id);
        if (!el) return;
        const group = el.closest('.form-group');
        if(group) group.classList.remove('error');
    }

    // Register Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirm-password').value;

            if (password !== confirm) {
                showError('confirm-password', 'Passwords do not match');
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    const successMsg = document.getElementById('success-message');
                    successMsg.textContent = 'Registration successful! Redirecting...';
                    successMsg.style.display = 'block';
                    setTimeout(() => window.location.href = 'login.html', 1500);
                } else {
                    showError('email', data.error);
                }
            } catch (error) {
                console.error(error);
            }
        });
    }

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            try {
                const res = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    const loginError = document.getElementById('login-error');
                    loginError.textContent = data.error;
                    loginError.style.display = 'block';
                }
            } catch (error) {
                console.error(error);
            }
        });
    }

    // Create Movie Card Helper
    function createMovieCard(movie, progress = null) {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.dataset.id = movie._id;
        
        const img = document.createElement('img');
        img.src = movie.poster;
        img.alt = movie.title;
        img.loading = 'lazy';
        // Fallback for broken images
        img.onerror = function() {
            this.onerror = null;
            this.src = `https://placehold.co/300x450/222222/e50914?text=${encodeURIComponent(movie.title)}`;
        };
        
        const infoOverlay = document.createElement('div');
        infoOverlay.classList.add('info-overlay');
        
        const title = document.createElement('div');
        title.classList.add('info-title');
        title.textContent = movie.title;
        
        const actions = document.createElement('div');
        actions.classList.add('info-actions');
        
        const trailerBtn = document.createElement('div');
        trailerBtn.classList.add('card-btn', 'play');
        trailerBtn.innerHTML = '▶';
        trailerBtn.title = "Watch Trailer";
        trailerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `video-player.html?id=${movie._id}&type=trailer`;
        });
        
        const addBtn = document.createElement('div');
        addBtn.classList.add('card-btn');
        addBtn.innerHTML = '+';
        addBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const originalText = addBtn.innerHTML;
            addBtn.innerHTML = '✔';
            try {
                await fetch(`${API_BASE}/watchlist`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ userId: currentUser._id, movieId: movie._id })
                });
            } catch(err) { console.error(err); }
            setTimeout(() => addBtn.innerHTML = originalText, 1500);
        });
        
        actions.appendChild(trailerBtn);
        actions.appendChild(addBtn);
        
        const meta = document.createElement('div');
        meta.classList.add('info-meta');
        meta.innerHTML = `${movie.rating || 8.0} Rating &nbsp;&nbsp; <span style="color: white; font-weight: normal;">${movie.year || ''}</span>`;
        
        infoOverlay.appendChild(title);
        infoOverlay.appendChild(actions);
        infoOverlay.appendChild(meta);

        card.appendChild(img);
        card.appendChild(infoOverlay);

        if (progress !== null && progress > 0) {
            const progBar = document.createElement('div');
            progBar.style.position = 'absolute';
            progBar.style.bottom = '0';
            progBar.style.left = '0';
            progBar.style.height = '4px';
            progBar.style.background = '#e50914';
            progBar.style.width = `${progress}%`;
            progBar.style.zIndex = '20';
            card.appendChild(progBar);
        }

        card.addEventListener('click', () => {
            window.location.href = `movie-details.html?id=${movie._id}`;
        });

        return card;
    }

    // Dashboard & My List Data Loading
    if (isDashboard && currentPage !== 'movie-details.html' && currentPage !== 'video-player.html' && currentPage !== 'profile.html') {
        try {
            let moviesData = [];
            
            if (currentPage === 'dashboard.html') {
                // Fetch concurrently for significantly faster loading
                const [moviesRes, histRes, wlRes] = await Promise.all([
                    fetch(`${API_BASE}/movies`),
                    fetch(`${API_BASE}/history?userId=${currentUser._id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE}/watchlist?userId=${currentUser._id}`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                
                moviesData = await moviesRes.json();
                const history = await histRes.json();
                const watchlist = await wlRes.json();
                
                const urlParams = new URLSearchParams(window.location.search);
                const filterType = urlParams.get('type');
                
                if (filterType === 'tv') {
                    moviesData = moviesData.filter(m => m.type === 'tv');
                    document.querySelectorAll('.movie-section h2').forEach(h => {
                        if(h.innerText.includes('Movies') || h.innerText.includes('Bollywood')) {
                            h.parentElement.style.display = 'none';
                        }
                    });
                    document.getElementById('nav-tv').classList.add('active');
                    document.getElementById('nav-home').classList.remove('active');
                } else if (filterType === 'movie') {
                    moviesData = moviesData.filter(m => m.type !== 'tv');
                    document.getElementById('nav-movies').classList.add('active');
                    document.getElementById('nav-home').classList.remove('active');
                }
                
                const movieRows = document.querySelectorAll('.movie-row');
                
                const continueWatchingRow = document.getElementById('continue-watching-row');
                const continueWatchingSection = document.getElementById('continue-watching-section');
                const recentlyWatchedRow = document.getElementById('recently-watched-row');
                const recentlyWatchedSection = document.getElementById('recently-watched-section');
                const recommendedRow = document.getElementById('recommended-row');
                const recommendedSection = document.getElementById('recommended-section');

                if (history.length > 0) {
                    if (continueWatchingSection) continueWatchingSection.style.display = 'block';
                    if (recentlyWatchedSection) recentlyWatchedSection.style.display = 'block';

                    let categoryCount = {};
                    history.forEach(h => {
                        const movie = moviesData.find(m => m._id === h.movieId);
                        if (movie) {
                            if (continueWatchingRow) continueWatchingRow.appendChild(createMovieCard(movie, h.progress || 10));
                            if (recentlyWatchedRow) recentlyWatchedRow.appendChild(createMovieCard(movie));
                            categoryCount[movie.category] = (categoryCount[movie.category] || 0) + 1;
                        }
                    });

                    // Recommendation logic
                    if (recommendedSection && recommendedRow) {
                        recommendedSection.style.display = 'block';
                        let topCat = Object.keys(categoryCount).length > 0 ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b) : null;
                        if (topCat) {
                            let recommendedMovies = moviesData.filter(m => m.category === topCat && !history.find(h => h.movieId === m._id)).slice(0, 10);
                            recommendedMovies.forEach(m => recommendedRow.appendChild(createMovieCard(m)));
                        }
                    }
                }

                // Populate Recently Added row
                const recentlyAddedRow = document.getElementById('recently-added-row');
                if (recentlyAddedRow) {
                    const recent = moviesData.filter(m => m.category === 'Recently Added');
                    recent.forEach(m => recentlyAddedRow.appendChild(createMovieCard(m)));
                }

                // Setup Hero Banner
                const heroBanner = document.getElementById('hero-banner');
                if (heroBanner && moviesData.length > 0) {
                    // Pick a random movie from top categories
                    const topMovies = moviesData.filter(m => m.category === 'Trending in India' || m.category === 'Telugu Blockbusters' || m.category === 'South Indian Action');
                    const heroMovie = topMovies.length > 0 ? topMovies[Math.floor(Math.random() * topMovies.length)] : moviesData[0];
                    
                    heroBanner.style.backgroundImage = `url('${heroMovie.banner || heroMovie.poster}')`;
                    document.getElementById('hero-title').textContent = heroMovie.title;
                    document.getElementById('hero-desc').textContent = heroMovie.description || "Watch now on Netflix.";
                    
                    const trailerBtn = document.getElementById('hero-trailer');
                    if (trailerBtn) {
                        trailerBtn.addEventListener('click', () => {
                            window.location.href = `video-player.html?id=${heroMovie._id}&type=trailer`;
                        });
                    }
                    const listBtn = document.getElementById('hero-add-list');
                    listBtn.addEventListener('click', async () => {
                        const originalText = listBtn.innerHTML;
                        listBtn.innerHTML = '✔ Added';
                        try {
                            await fetch(`${API_BASE}/watchlist`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ userId: currentUser._id, movieId: heroMovie._id })
                            });
                        } catch(err) { console.error(err); }
                        setTimeout(() => listBtn.innerHTML = originalText, 1500);
                    });
                }

                movieRows.forEach((row) => {
                    const category = row.dataset.category;
                    if (['ContinueWatching', 'RecentlyWatched', 'Recommended', 'Recently Added'].includes(category)) return;
                    
                    const categoryMovies = moviesData.filter(m => m.category === category);
                    categoryMovies.forEach(movie => {
                        row.appendChild(createMovieCard(movie));
                    });
                });

                // Search
                const searchInput = document.getElementById('search-input');
                const mainContent = document.getElementById('main-content');
                const searchContainer = document.getElementById('search-results-container');
                const searchResultsGrid = document.getElementById('search-results');
                const noMoviesMsg = document.getElementById('no-movies-msg');

                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        const query = e.target.value.toLowerCase().trim();
                        if (query.length > 0) {
                            mainContent.style.display = 'none';
                            searchContainer.style.display = 'block';
                            searchResultsGrid.innerHTML = '';
                            
                            const filtered = moviesData.filter(m => m.title.toLowerCase().includes(query));
                            if (filtered.length > 0) {
                                noMoviesMsg.style.display = 'none';
                                filtered.forEach(movie => searchResultsGrid.appendChild(createMovieCard(movie)));
                            } else {
                                noMoviesMsg.style.display = 'block';
                            }
                        } else {
                            mainContent.style.display = 'block';
                            searchContainer.style.display = 'none';
                        }
                    });
                }

            } else if (currentPage === 'my-list.html') {
                const [moviesRes, wlRes] = await Promise.all([
                    fetch(`${API_BASE}/movies`),
                    fetch(`${API_BASE}/watchlist?userId=${currentUser._id}`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                
                moviesData = await moviesRes.json();
                const watchlist = await wlRes.json();

                const grid = document.getElementById('watchlist-grid');
                const emptyMsg = document.getElementById('empty-watchlist-msg');

                if (watchlist.length === 0) {
                    emptyMsg.style.display = 'block';
                } else {
                    watchlist.forEach(w => {
                        const movie = moviesData.find(m => m._id === w.movieId);
                        if(movie) grid.appendChild(createMovieCard(movie));
                    });
                }
            }
        } catch (err) { console.error(err); }
    }

    // Movie Details Page
    if (currentPage === 'movie-details.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const container = document.getElementById('movie-details-container');

        if (movieId) {
            try {
                const res = await fetch(`${API_BASE}/movies/${movieId}`);
                if (res.ok) {
                    const movie = await res.json();
                    
                    const wlRes = await fetch(`${API_BASE}/watchlist?userId=${currentUser._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                    const watchlist = await wlRes.json();
                    const inWatchlist = watchlist.some(w => w.movieId === movie._id);

                    container.innerHTML = `
                        <div class="banner" style="background-image: linear-gradient(to top, rgba(20,20,20,1) 0%, rgba(20,20,20,0.3) 100%), url('${movie.banner}');">
                            <div class="banner-content">
                                <h1 class="banner-title">${movie.title}</h1>
                                <div class="banner-meta">
                                    <span>${movie.year}</span>
                                    <span class="rating">${movie.rating} Rating</span>
                                    <span>${movie.duration}</span>
                                </div>
                                <p class="banner-description">${movie.description}</p>
                                <div class="banner-buttons">
                                    <button class="btn-play" onclick="window.location.href='video-player.html?id=${movie._id}'">▶ Play</button>
                                    <button class="btn-watchlist" id="toggle-watchlist">
                                        ${inWatchlist ? '✓ Remove from Watchlist' : '+ Add to Watchlist'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;

                    const toggleBtn = document.getElementById('toggle-watchlist');
                    toggleBtn.addEventListener('click', async () => {
                        if (toggleBtn.textContent.includes('Add')) {
                            await fetch(`${API_BASE}/watchlist`, {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                                body: JSON.stringify({ userId: currentUser._id, movieId: movie._id })
                            });
                            toggleBtn.textContent = '✓ Remove from Watchlist';
                        } else {
                            await fetch(`${API_BASE}/watchlist/${movie._id}?userId=${currentUser._id}`, {
                                method: 'DELETE',
                                headers: {'Authorization': `Bearer ${token}`}
                            });
                            toggleBtn.textContent = '+ Add to Watchlist';
                        }
                    });
                }
            } catch (err) { console.error(err); }
        }
    }

    // Video Player
    if (currentPage === 'video-player.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        
        const video = document.getElementById('video-player');
        const playPauseBtn = document.getElementById('play-pause');
        const progressBar = document.getElementById('progress-bar');
        const progressFilled = document.getElementById('progress-filled');
        const volumeSlider = document.getElementById('volume-slider');
        const fullscreenBtn = document.getElementById('fullscreen');
        const timeDisplay = document.getElementById('time-display');
        const titleDisplay = document.getElementById('player-title');
        
        if (movieId) {
            fetch(`${API_BASE}/movies/${movieId}`)
                .then(res => res.json())
                .then(movie => {
                    titleDisplay.textContent = movie.title;
                    if (movie.videoUrl) video.src = movie.videoUrl;
                });
        }

        function togglePlay() {
            if (video.paused) {
                video.play();
                playPauseBtn.textContent = '⏸';
            } else {
                video.pause();
                playPauseBtn.textContent = '▶';
            }
        }

        playPauseBtn.addEventListener('click', togglePlay);
        video.addEventListener('click', togglePlay);

        function formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        video.addEventListener('timeupdate', () => {
            const percent = (video.currentTime / video.duration) * 100;
            progressFilled.style.width = `${percent}%`;
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`;
        });

        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        });

        volumeSlider.addEventListener('input', (e) => {
            video.volume = e.target.value;
        });

        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.getElementById('video-container').requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

        // Save progress on exit
        const saveProgress = () => {
            if (movieId && video.duration && token) {
                const progressPercent = (video.currentTime / video.duration) * 100;
                fetch(`${API_BASE}/history`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                    body: JSON.stringify({ userId: currentUser._id, movieId: movieId, progress: progressPercent }),
                    keepalive: true
                });
            }
        };

        window.addEventListener('beforeunload', saveProgress);
        document.getElementById('back-btn').addEventListener('click', (e) => {
            saveProgress();
        });
    }

    // Profile Page
    if (currentPage === 'profile.html') {
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        const saveBtn = document.getElementById('save-profile');
        const msg = document.getElementById('profile-msg');
        
        nameInput.value = currentUser.name;
        emailInput.value = currentUser.email;

        saveBtn.addEventListener('click', async () => {
            const newName = nameInput.value;
            const res = await fetch(`${API_BASE}/profile/${currentUser._id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify({ name: newName })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                msg.style.display = 'block';
                setTimeout(() => msg.style.display = 'none', 3000);
                
                // update UI immediately
                const welcomeText = document.getElementById('welcome-user');
                if (welcomeText) welcomeText.textContent = `Welcome, ${data.user.name}`;
            }
        });

        const avatars = document.querySelectorAll('.avatar-opt');
        avatars.forEach(av => {
            av.addEventListener('click', () => {
                avatars.forEach(a => a.classList.remove('selected'));
                av.classList.add('selected');
            });
        });
    }
});
