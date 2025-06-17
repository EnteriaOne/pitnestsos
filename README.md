
# PitNest - Video Streaming Platform

A modern video streaming platform built with TypeScript, Express.js, and vanilla JavaScript.

## Features

- **User Interface**
  - Responsive design with mobile-first approach
  - Top navigation bar with logo and search
  - Hamburger menu with terms and privacy links
  - Bottom navigation (Home, Explore, Category)

- **Video Streaming**
  - Support for various video URLs
  - Video modal player
  - Category-based filtering
  - Search functionality

- **Admin Panel**
  - Content upload and management
  - Category management
  - User role management
  - Invite system with password reset
  - Reports & Analytics dashboard

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: Replit/Cloudflare Workers compatible

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5000`

## Admin Access

- Email: `admin@pitnest.com`
- Password: `AdminPN123`

## Deployment

This project is configured for deployment on Replit and is Cloudflare Workers compatible.

## Project Structure

```
├── public/           # Static files
│   ├── index.html   # Main homepage
│   ├── admin.html   # Admin dashboard
│   ├── styles.css   # Main styles
│   ├── admin.css    # Admin styles
│   ├── script.js    # Main JavaScript
│   └── admin.js     # Admin JavaScript
├── index.ts         # Express server
├── package.json     # Dependencies
└── tsconfig.json    # TypeScript config
```

## License

ISC
