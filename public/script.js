
class PitNest {
    constructor() {
        this.videos = [];
        this.categories = [];
        this.currentPage = 'home';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadCategories();
        await this.loadVideos();
        this.renderPage();
    }

    setupEventListeners() {
        // Hamburger menu
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const menuOverlay = document.getElementById('menuOverlay');
        const closeMenu = document.querySelector('.close-menu');

        hamburgerBtn.addEventListener('click', () => {
            menuOverlay.style.display = 'block';
        });

        closeMenu.addEventListener('click', () => {
            menuOverlay.style.display = 'none';
        });

        menuOverlay.addEventListener('click', (e) => {
            if (e.target === menuOverlay) {
                menuOverlay.style.display = 'none';
            }
        });

        // Bottom navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                this.currentPage = item.dataset.page;
                this.renderPage();
            });
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.querySelector('.search-btn');
        
        const performSearch = () => {
            const query = searchInput.value.toLowerCase();
            this.renderVideos(query);
        };

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.addEventListener('change', (e) => {
            this.renderVideos('', e.target.value);
        });

        // Video modal
        const videoModal = document.getElementById('videoModal');
        const closeVideo = document.querySelector('.close-video');
        
        closeVideo.addEventListener('click', () => {
            videoModal.style.display = 'none';
            document.getElementById('videoPlayer').src = '';
        });

        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                videoModal.style.display = 'none';
                document.getElementById('videoPlayer').src = '';
            }
        });
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            this.categories = await response.json();
            this.populateCategoryFilter();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadVideos() {
        try {
            const response = await fetch('/api/videos');
            this.videos = await response.json();
        } catch (error) {
            console.error('Error loading videos:', error);
        }
    }

    populateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    renderPage() {
        const pageTitle = document.getElementById('pageTitle');
        
        switch (this.currentPage) {
            case 'home':
                pageTitle.textContent = 'Home';
                this.renderVideos();
                break;
            case 'explore':
                pageTitle.textContent = 'Explore';
                this.renderVideos();
                break;
            case 'category':
                pageTitle.textContent = 'Categories';
                this.renderCategories();
                break;
        }
    }

    renderVideos(searchQuery = '', categoryFilter = '') {
        const videoGrid = document.getElementById('videoGrid');
        let filteredVideos = this.videos;

        // Apply search filter
        if (searchQuery) {
            filteredVideos = filteredVideos.filter(video => 
                video.title.toLowerCase().includes(searchQuery) ||
                video.description.toLowerCase().includes(searchQuery)
            );
        }

        // Apply category filter
        if (categoryFilter) {
            filteredVideos = filteredVideos.filter(video => 
                video.category === categoryFilter
            );
        }

        if (filteredVideos.length === 0) {
            videoGrid.innerHTML = '<div style="text-align: center; color: #aaaaaa; grid-column: 1/-1;">No videos found</div>';
            return;
        }

        videoGrid.innerHTML = filteredVideos.map(video => `
            <div class="video-card" onclick="pitNest.playVideo('${video.id}')">
                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <div class="video-meta">
                        <span>${video.category}</span>
                        <span>${new Date(video.uploadDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCategories() {
        const videoGrid = document.getElementById('videoGrid');
        
        videoGrid.innerHTML = this.categories.map(category => {
            const categoryVideos = this.videos.filter(video => video.category === category);
            return `
                <div class="video-card" onclick="pitNest.filterByCategory('${category}')">
                    <div class="category-card">
                        <div class="category-info">
                            <h3 class="video-title">${category}</h3>
                            <div class="video-meta">
                                <span>${categoryVideos.length} videos</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterByCategory(category) {
        document.getElementById('categoryFilter').value = category;
        this.currentPage = 'home';
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelector('[data-page="home"]').classList.add('active');
        this.renderPage();
        this.renderVideos('', category);
    }

    playVideo(videoId) {
        const video = this.videos.find(v => v.id == videoId);
        if (!video) return;

        const modal = document.getElementById('videoModal');
        const player = document.getElementById('videoPlayer');
        const title = document.getElementById('videoTitle');
        const description = document.getElementById('videoDescription');
        const category = document.getElementById('videoCategory');
        const date = document.getElementById('videoDate');

        // Convert various video URLs to embeddable format
        let embedUrl = this.getEmbedUrl(video.videoUrl);
        
        player.src = embedUrl;
        title.textContent = video.title;
        description.textContent = video.description;
        category.textContent = video.category;
        date.textContent = new Date(video.uploadDate).toLocaleDateString();

        modal.style.display = 'block';
    }

    getEmbedUrl(url) {
        // YouTube
        if (url.includes('youtube.com/watch')) {
            const videoId = url.split('v=')[1]?.split('&')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        
        // Vimeo
        if (url.includes('vimeo.com/')) {
            const videoId = url.split('vimeo.com/')[1];
            return `https://player.vimeo.com/video/${videoId}`;
        }
        
        // Dailymotion
        if (url.includes('dailymotion.com/video/')) {
            const videoId = url.split('video/')[1]?.split('?')[0];
            return `https://www.dailymotion.com/embed/video/${videoId}`;
        }
        
        // Default: try to use the URL as is
        return url;
    }
}

// Initialize the application
const pitNest = new PitNest();
