
import express from 'express';
import path from 'path';

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage (for demo purposes)
let videos: any[] = [];
let categories: string[] = ['Entertainment', 'Gaming', 'Music', 'Sports', 'News', 'Education'];
let users: any[] = [{
  email: 'admin@pitnest.com',
  password: 'AdminPN123',
  role: 'admin'
}];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API Routes
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ success: true, user: { email: user.email, role: user.role } });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/videos', (req, res) => {
  res.json(videos);
});

app.post('/api/videos', (req, res) => {
  const { title, description, category, videoUrl, thumbnail } = req.body;
  const video = {
    id: Date.now(),
    title,
    description,
    category,
    videoUrl,
    thumbnail: thumbnail || 'https://via.placeholder.com/300x200',
    uploadDate: new Date().toISOString()
  };
  videos.push(video);
  res.json({ success: true, video });
});

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  if (!categories.includes(name)) {
    categories.push(name);
  }
  res.json({ success: true, categories });
});

app.delete('/api/categories/:name', (req, res) => {
  const { name } = req.params;
  categories = categories.filter(cat => cat !== name);
  res.json({ success: true, categories });
});

app.delete('/api/videos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  videos = videos.filter(video => video.id !== id);
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PitNest streaming platform running at http://0.0.0.0:${PORT}`);
});
