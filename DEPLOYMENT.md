# Deployment Instructions for Location Tracker

## GitHub Pages Deployment

To deploy your location tracker app to GitHub Pages, follow these steps:

### 1. Update package.json
Add these configurations to your `package.json`:

```json
{
  "homepage": "https://yourusername.github.io/location-tracker",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist",
    "build": "vite build"
  }
}
```

Replace `yourusername` with your actual GitHub username and `location-tracker` with your repository name.

### 2. Build Configuration
Create a `vite.config.deploy.ts` file for production builds:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/location-tracker/', // Replace with your repo name
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared')
    }
  }
})
```

### 3. Deployment Commands
Run these commands in your terminal:

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### 4. GitHub Repository Setup
1. Create a new repository on GitHub
2. Push your code to the repository
3. Go to Settings > Pages in your repository
4. Select "Deploy from a branch" and choose "gh-pages"

### 5. Important Notes
- The database features will not work on GitHub Pages (static hosting only)
- Consider using localStorage for data persistence in the deployed version
- For full database functionality, use platforms like Vercel, Netlify, or Railway

### Alternative: Static Version
For a static version that works on GitHub Pages, the app will use localStorage instead of the database for data persistence.