const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const token = localStorage.getItem('token');

    // Protect Admin Page
    if (!currentUser || !token || currentUser.role !== 'admin') {
        window.location.href = 'dashboard.html';
        return;
    }

    const loadAnalytics = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                document.getElementById('stat-users').textContent = data.totalUsers;
                document.getElementById('stat-movies').textContent = data.totalMovies;
                document.getElementById('stat-watchlists').textContent = data.totalWatchlists;
                document.getElementById('stat-views').textContent = data.totalViews;
            } else {
                console.error("Failed to load analytics");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadMovies = async () => {
        try {
            const res = await fetch(`${API_BASE}/movies`);
            if (res.ok) {
                const movies = await res.json();
                const container = document.getElementById('admin-movie-list');
                container.innerHTML = '';
                
                movies.forEach(movie => {
                    const card = document.createElement('div');
                    card.classList.add('admin-movie-card');
                    card.innerHTML = `
                        <img src="${movie.poster}" alt="${movie.title}">
                        <div class="actions">
                            <button class="edit" data-id="${movie._id}">✎</button>
                            <button class="delete" data-id="${movie._id}">🗑</button>
                        </div>
                    `;
                    container.appendChild(card);
                    
                    // Attach events to buttons directly in loop to capture the movie object easily
                    card.querySelector('.edit').addEventListener('click', () => editMovieParams(movie));
                    card.querySelector('.delete').addEventListener('click', () => deleteMovie(movie._id));
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteMovie = async (id) => {
        if(confirm('Are you sure you want to delete this movie?')) {
            try {
                const res = await fetch(`${API_BASE}/admin/movies/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if(res.ok) {
                    loadMovies();
                    loadAnalytics();
                }
            } catch (err) { console.error(err); }
        }
    };

    const form = document.getElementById('movie-form');
    const msg = document.getElementById('form-msg');
    
    const editMovieParams = (movie) => {
        document.getElementById('form-title').textContent = 'Edit Movie';
        document.getElementById('cancel-edit').style.display = 'inline-block';
        
        document.getElementById('movie-id').value = movie._id;
        document.getElementById('m-title').value = movie.title;
        document.getElementById('m-category').value = movie.category;
        document.getElementById('m-poster').value = movie.poster;
        document.getElementById('m-banner').value = movie.banner;
        document.getElementById('m-video').value = movie.videoUrl || '';
        document.getElementById('m-trailer').value = movie.trailerUrl || '';
        document.getElementById('m-year').value = movie.year;
        document.getElementById('m-rating').value = movie.rating;
        document.getElementById('m-duration').value = movie.duration;
        document.getElementById('m-description').value = movie.description;
        
        window.scrollTo(0, 0);
    };

    document.getElementById('cancel-edit').addEventListener('click', () => {
        form.reset();
        document.getElementById('movie-id').value = '';
        document.getElementById('form-title').textContent = 'Add New Movie';
        document.getElementById('cancel-edit').style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('movie-id').value;
        const data = {
            title: document.getElementById('m-title').value,
            category: document.getElementById('m-category').value,
            poster: document.getElementById('m-poster').value,
            banner: document.getElementById('m-banner').value,
            videoUrl: document.getElementById('m-video').value,
            trailerUrl: document.getElementById('m-trailer').value,
            year: document.getElementById('m-year').value,
            rating: document.getElementById('m-rating').value,
            duration: document.getElementById('m-duration').value,
            description: document.getElementById('m-description').value,
        };

        try {
            let url = `${API_BASE}/admin/movies`;
            let method = 'POST';
            if (id) {
                url += `/${id}`;
                method = 'PUT';
            }

            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                msg.style.display = 'block';
                setTimeout(() => msg.style.display = 'none', 3000);
                document.getElementById('cancel-edit').click();
                loadMovies();
                loadAnalytics();
            }
        } catch (err) {
            console.error(err);
        }
    });

    document.getElementById('refresh-stats').addEventListener('click', loadAnalytics);

    loadAnalytics();
    loadMovies();
});
