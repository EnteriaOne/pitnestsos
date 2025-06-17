
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    checkAuth() {
        const savedUser = localStorage.getItem('adminUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });

        // Admin navigation
        const adminNavBtns = document.querySelectorAll('.admin-nav-btn');
        adminNavBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                adminNavBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.showSection(btn.dataset.section);
            });
        });

        // Upload form
        const uploadForm = document.getElementById('uploadForm');
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpload();
        });

        // Category management
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        addCategoryBtn.addEventListener('click', () => {
            this.addCategory();
        });

        // Invite management
        const sendInviteBtn = document.getElementById('sendInviteBtn');
        sendInviteBtn.addEventListener('click', () => {
            this.sendInvitation();
        });

        // Password management
        const updatePasswordForm = document.getElementById('updatePasswordForm');
        updatePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updatePassword();
        });

        const resetPasswordForm = document.getElementById('resetPasswordForm');
        resetPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.resetUserPassword();
        });
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();
            
            if (result.success) {
                this.currentUser = result.user;
                localStorage.setItem('adminUser', JSON.stringify(result.user));
                this.showDashboard();
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed');
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('adminUser');
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        this.loadDashboardData();
    }

    async loadDashboardData() {
        await this.loadCategories();
        await this.loadContent();
        await this.loadInvitations();
        this.updateAnalytics();
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            const categories = await response.json();
            this.populateCategorySelects(categories);
            this.renderCategoryList(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    populateCategorySelects(categories) {
        const videoCategory = document.getElementById('videoCategory');
        videoCategory.innerHTML = '<option value="">Select Category</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            videoCategory.appendChild(option);
        });
    }

    renderCategoryList(categories) {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = categories.map(category => `
            <div class="category-item">
                <span class="category-name">${category}</span>
                <button class="delete-category" onclick="adminPanel.deleteCategory('${category}')">Delete</button>
            </div>
        `).join('');
    }

    async loadContent() {
        try {
            const response = await fetch('/api/videos');
            const videos = await response.json();
            this.renderContentList(videos);
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    renderContentList(videos) {
        const contentList = document.getElementById('contentList');
        
        if (videos.length === 0) {
            contentList.innerHTML = '<div style="color: #aaaaaa; text-align: center;">No videos uploaded yet</div>';
            return;
        }

        contentList.innerHTML = videos.map(video => `
            <div class="content-item">
                <div class="content-info">
                    <h4>${video.title}</h4>
                    <p>Category: ${video.category}</p>
                    <p>Uploaded: ${new Date(video.uploadDate).toLocaleDateString()}</p>
                    <p>URL: ${video.videoUrl}</p>
                </div>
                <div class="content-actions">
                    <button class="edit-btn" onclick="adminPanel.editVideo(${video.id})">Edit</button>
                    <button class="delete-btn" onclick="adminPanel.deleteVideo(${video.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    showSection(sectionName) {
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');
    }

    async handleUpload() {
        const title = document.getElementById('videoTitle').value;
        const description = document.getElementById('videoDescription').value;
        const category = document.getElementById('videoCategory').value;
        const videoUrl = document.getElementById('videoUrl').value;
        const thumbnail = document.getElementById('videoThumbnail').value;

        if (!title || !description || !category || !videoUrl) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    videoUrl,
                    thumbnail
                })
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Video uploaded successfully!');
                document.getElementById('uploadForm').reset();
                this.loadContent();
                this.updateAnalytics();
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        }
    }

    async addCategory() {
        const categoryName = document.getElementById('newCategory').value.trim();
        
        if (!categoryName) {
            alert('Please enter a category name');
            return;
        }

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: categoryName })
            });

            const result = await response.json();
            
            if (result.success) {
                document.getElementById('newCategory').value = '';
                this.loadCategories();
            } else {
                alert('Failed to add category');
            }
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category');
        }
    }

    async deleteCategory(categoryName) {
        if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/categories/${encodeURIComponent(categoryName)}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                this.loadCategories();
            } else {
                alert('Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    }

    async deleteVideo(videoId) {
        if (!confirm('Are you sure you want to delete this video?')) {
            return;
        }

        try {
            const response = await fetch(`/api/videos/${videoId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                this.loadContent();
                this.updateAnalytics();
            } else {
                alert('Failed to delete video');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Failed to delete video');
        }
    }

    editVideo(videoId) {
        alert('Edit functionality would be implemented here');
    }

    async updateAnalytics() {
        try {
            const [videosResponse, categoriesResponse] = await Promise.all([
                fetch('/api/videos'),
                fetch('/api/categories')
            ]);

            const videos = await videosResponse.json();
            const categories = await categoriesResponse.json();

            document.getElementById('totalVideos').textContent = videos.length;
            document.getElementById('totalCategories').textContent = categories.length;
        } catch (error) {
            console.error('Error updating analytics:', error);
        }
    }

    async sendInvitation() {
        const email = document.getElementById('inviteEmail').value.trim();
        const role = document.getElementById('inviteRole').value;

        if (!email) {
            alert('Please enter an email address');
            return;
        }

        if (!this.isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        try {
            // Simulate API call - replace with actual endpoint
            console.log(`Sending invitation to ${email} with role ${role}`);
            alert(`Invitation sent to ${email} successfully!`);
            
            document.getElementById('inviteEmail').value = '';
            this.loadInvitations();
        } catch (error) {
            console.error('Error sending invitation:', error);
            alert('Failed to send invitation');
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async loadInvitations() {
        // Simulate loading invitations - replace with actual API call
        const mockInvitations = [
            { email: 'user@example.com', role: 'user', status: 'pending', id: 1 },
            { email: 'editor@example.com', role: 'admin', status: 'pending', id: 2 }
        ];

        const invitesList = document.getElementById('invitesList');
        
        if (mockInvitations.length === 0) {
            invitesList.innerHTML = '<div style="color: #aaaaaa; text-align: center;">No pending invitations</div>';
            return;
        }

        invitesList.innerHTML = mockInvitations.map(invite => `
            <div class="invite-item">
                <div class="invite-info">
                    <div>${invite.email}</div>
                    <div class="invite-status">Role: ${invite.role} | Status: ${invite.status}</div>
                </div>
                <button class="revoke-invite" onclick="adminPanel.revokeInvitation(${invite.id})">Revoke</button>
            </div>
        `).join('');
    }

    async revokeInvitation(inviteId) {
        if (!confirm('Are you sure you want to revoke this invitation?')) {
            return;
        }

        try {
            // Simulate API call - replace with actual endpoint
            console.log(`Revoking invitation ${inviteId}`);
            alert('Invitation revoked successfully!');
            this.loadInvitations();
        } catch (error) {
            console.error('Error revoking invitation:', error);
            alert('Failed to revoke invitation');
        }
    }

    async updatePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            alert('New password must be at least 8 characters long');
            return;
        }

        try {
            // Simulate API call - replace with actual endpoint
            console.log('Updating password');
            alert('Password updated successfully!');
            document.getElementById('updatePasswordForm').reset();
        } catch (error) {
            console.error('Error updating password:', error);
            alert('Failed to update password');
        }
    }

    async resetUserPassword() {
        const email = document.getElementById('resetEmail').value.trim();

        if (!email) {
            alert('Please enter a user email');
            return;
        }

        if (!this.isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        if (!confirm(`Are you sure you want to send a password reset email to ${email}?`)) {
            return;
        }

        try {
            // Simulate API call - replace with actual endpoint
            console.log(`Sending password reset to ${email}`);
            alert(`Password reset email sent to ${email} successfully!`);
            document.getElementById('resetEmail').value = '';
        } catch (error) {
            console.error('Error sending password reset:', error);
            alert('Failed to send password reset email');
        }
    }
}

// Initialize the admin panel
const adminPanel = new AdminPanel();
