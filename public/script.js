
let currentUser = { id: 1, name: 'John Doe' };
let currentServices = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadServices();
    showSection('home');
});

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    const sections = ['home', 'services', 'sell', 'dashboard'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Show hero section for home
    const hero = document.querySelector('.hero');
    const categories = document.querySelector('.categories');
    
    if (sectionName === 'home') {
        hero.style.display = 'block';
        categories.style.display = 'block';
    } else {
        hero.style.display = 'none';
        categories.style.display = 'none';
        
        // Show the requested section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }
    
    // Load section-specific data
    if (sectionName === 'services') {
        loadServices();
    } else if (sectionName === 'dashboard') {
        loadDashboard();
    }
}

// Service functions
async function loadServices() {
    try {
        const response = await fetch('/api/services');
        const services = await response.json();
        currentServices = services;
        displayServices(services);
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

function displayServices(services) {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    
    if (services.length === 0) {
        servicesGrid.innerHTML = '<p>No services found.</p>';
        return;
    }
    
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card" onclick="showServiceDetails(${service.id})">
            <div class="service-card-content">
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                <div class="service-meta">
                    <div class="service-price">$${service.price}</div>
                    <div class="service-rating">
                        <i class="fas fa-star"></i>
                        <span>${service.rating} (${service.reviews})</span>
                    </div>
                </div>
                <div class="service-seller">by ${service.sellerName}</div>
            </div>
        </div>
    `).join('');
}

function showServiceDetails(serviceId) {
    const service = currentServices.find(s => s.id === serviceId);
    if (!service) return;
    
    const serviceDetails = document.getElementById('serviceDetails');
    serviceDetails.innerHTML = `
        <h2>${service.title}</h2>
        <p><strong>Price:</strong> $${service.price}</p>
        <p><strong>Category:</strong> ${service.category}</p>
        <p><strong>Seller:</strong> ${service.sellerName}</p>
        <p><strong>Rating:</strong> ${service.rating} ⭐ (${service.reviews} reviews)</p>
        <p><strong>Description:</strong></p>
        <p>${service.description}</p>
        <div style="margin-top: 2rem;">
            <button class="btn-primary" onclick="orderService(${service.id})">Order Now - $${service.price}</button>
        </div>
    `;
    
    document.getElementById('serviceModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('serviceModal').style.display = 'none';
}

async function orderService(serviceId) {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                serviceId: serviceId,
                buyerId: currentUser.id,
                buyerName: currentUser.name
            })
        });
        
        if (response.ok) {
            alert('Order placed successfully!');
            closeModal();
        } else {
            alert('Error placing order. Please try again.');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
    }
}

// Search and filter functions
function searchServices() {
    const searchTerm = document.getElementById('searchInput').value;
    showSection('services');
    filterServices(searchTerm);
}

function filterByCategory(category) {
    showSection('services');
    document.getElementById('categoryFilter').value = category;
    filterServices();
}

async function filterServices(searchTerm = '') {
    const category = document.getElementById('categoryFilter').value;
    const search = searchTerm || document.getElementById('searchInput').value;
    
    try {
        const params = new URLSearchParams();
        if (category !== 'all') params.append('category', category);
        if (search) params.append('search', search);
        
        const response = await fetch(`/api/services?${params}`);
        const services = await response.json();
        currentServices = services;
        displayServices(services);
    } catch (error) {
        console.error('Error filtering services:', error);
    }
}

// Create service function
async function createService(event) {
    event.preventDefault();
    
    const formData = {
        title: document.getElementById('serviceTitle').value,
        description: document.getElementById('serviceDescription').value,
        price: document.getElementById('servicePrice').value,
        category: document.getElementById('serviceCategory').value,
        sellerId: currentUser.id,
        sellerName: document.getElementById('sellerName').value
    };
    
    try {
        const response = await fetch('/api/services', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Service created successfully!');
            document.getElementById('serviceForm').reset();
            loadServices();
        } else {
            alert('Error creating service. Please try again.');
        }
    } catch (error) {
        console.error('Error creating service:', error);
        alert('Error creating service. Please try again.');
    }
}

// Dashboard functions
async function loadDashboard() {
    await loadOrders();
    await loadSales();
}

async function loadOrders() {
    try {
        const response = await fetch(`/api/orders?userId=${currentUser.id}&type=buyer`);
        const orders = await response.json();
        
        const ordersList = document.getElementById('ordersList');
        if (orders.length === 0) {
            ordersList.innerHTML = '<p>You have no orders yet.</p>';
            return;
        }
        
        ordersList.innerHTML = orders.map(order => `
            <div class="order-item">
                <h4>${order.serviceTitle}</h4>
                <p><strong>Price:</strong> $${order.price}</p>
                <p><strong>Seller:</strong> ${order.sellerName}</p>
                <p><strong>Status:</strong> <span class="order-status status-${order.status}">${order.status}</span></p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function loadSales() {
    try {
        const response = await fetch(`/api/orders?userId=${currentUser.id}&type=seller`);
        const sales = await response.json();
        
        const salesList = document.getElementById('salesList');
        if (sales.length === 0) {
            salesList.innerHTML = '<p>You have no sales yet.</p>';
            return;
        }
        
        salesList.innerHTML = sales.map(sale => `
            <div class="sale-item">
                <h4>${sale.serviceTitle}</h4>
                <p><strong>Price:</strong> $${sale.price}</p>
                <p><strong>Buyer:</strong> ${sale.buyerName}</p>
                <p><strong>Status:</strong> <span class="order-status status-${sale.status}">${sale.status}</span></p>
                <p><strong>Sale Date:</strong> ${new Date(sale.createdAt).toLocaleDateString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading sales:', error);
    }
}

function showTab(tabName) {
    // Hide all tabs
    document.getElementById('ordersTab').style.display = 'none';
    document.getElementById('salesTab').style.display = 'none';
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').style.display = 'block';
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('serviceModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
