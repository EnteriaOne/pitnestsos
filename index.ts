
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage (replace with database in production)
let users: any[] = [];
let services: any[] = [];
let orders: any[] = [];
let currentUserId = 1;
let currentServiceId = 1;
let currentOrderId = 1;

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/services', (req, res) => {
  const { category, search } = req.query;
  let filteredServices = services;
  
  if (category && category !== 'all') {
    filteredServices = filteredServices.filter(service => service.category === category);
  }
  
  if (search) {
    filteredServices = filteredServices.filter(service => 
      service.title.toLowerCase().includes(search.toString().toLowerCase()) ||
      service.description.toLowerCase().includes(search.toString().toLowerCase())
    );
  }
  
  res.json(filteredServices);
});

app.post('/api/services', (req, res) => {
  const { title, description, price, category, sellerId, sellerName } = req.body;
  
  const newService = {
    id: currentServiceId++,
    title,
    description,
    price: parseFloat(price),
    category,
    sellerId,
    sellerName,
    rating: 0,
    reviews: 0,
    createdAt: new Date().toISOString()
  };
  
  services.push(newService);
  res.json(newService);
});

app.post('/api/orders', (req, res) => {
  const { serviceId, buyerId, buyerName } = req.body;
  const service = services.find(s => s.id === parseInt(serviceId));
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  const newOrder = {
    id: currentOrderId++,
    serviceId: service.id,
    serviceTitle: service.title,
    price: service.price,
    sellerId: service.sellerId,
    sellerName: service.sellerName,
    buyerId,
    buyerName,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  res.json(newOrder);
});

app.get('/api/orders', (req, res) => {
  const { userId, type } = req.query;
  let userOrders = orders;
  
  if (userId && type === 'buyer') {
    userOrders = orders.filter(order => order.buyerId === parseInt(userId.toString()));
  } else if (userId && type === 'seller') {
    userOrders = orders.filter(order => order.sellerId === parseInt(userId.toString()));
  }
  
  res.json(userOrders);
});

// Initialize with sample data
const sampleServices = [
  {
    id: 1,
    title: "I will design a professional logo for your business",
    description: "Get a stunning, professional logo that represents your brand perfectly. Includes 3 concepts, unlimited revisions, and all file formats.",
    price: 25,
    category: "design",
    sellerId: 1,
    sellerName: "Sarah Designer",
    rating: 4.9,
    reviews: 127,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "I will develop a responsive website using React",
    description: "Full-stack web development with modern React, responsive design, and clean code. Perfect for businesses and portfolios.",
    price: 150,
    category: "programming",
    sellerId: 2,
    sellerName: "John Developer",
    rating: 4.8,
    reviews: 89,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "I will write engaging content for your website",
    description: "Professional copywriting that converts visitors into customers. SEO-optimized content that ranks well on search engines.",
    price: 45,
    category: "writing",
    sellerId: 3,
    sellerName: "Emma Writer",
    rating: 4.7,
    reviews: 203,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    title: "I will create animated videos for your social media",
    description: "Eye-catching animated videos perfect for Instagram, TikTok, and YouTube. Boost your engagement with professional animations.",
    price: 75,
    category: "video",
    sellerId: 4,
    sellerName: "Mike Animator",
    rating: 4.9,
    reviews: 156,
    createdAt: new Date().toISOString()
  }
];

services.push(...sampleServices);
currentServiceId = 5;

app.listen(port, '0.0.0.0', () => {
  console.log(`Freelance platform running at http://0.0.0.0:${port}`);
});
