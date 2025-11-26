# MSquare Hugo Starter

Quick Hugo starter for a fast demo. Includes:
- Hugo templates for projects (list + single)
- Tailwind CSS pipeline (optional) + CDN fallback
- Alpine.js + Glide.js for lightweight interactivity
- Netlify deploy config

## Quick start (fastest, no CSS build)
1. Copy your images into `static/images/originals/` or `assets/images/originals/`.
2. Start Hugo locally:
   ```
   hugo server -D
   ```
3. Visit http://localhost:1313

## Optional: build Tailwind locally (recommended for production)
1. Install dependencies:
   ```
   npm install
   ```
2. Build CSS:
   ```
   npm run build:css
   ```
   This outputs `static/css/tailwind.css`. The site uses CDN tailwind by default; switch head partial to use local file if you build.

## Deploy
Push to Git and connect repository to Netlify. Build command: `hugo --minify`, publish directory: `public/`.
