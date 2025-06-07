#!/usr/bin/env node

// Simple build script for static deployment
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building location tracker for static deployment...');

try {
  // Create dist directory
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Build with minimal configuration
  console.log('Building frontend...');
  execSync('cd client && npx vite build --outDir ../dist --base ./', { stdio: 'inherit' });

  // Copy additional files needed for deployment
  console.log('Copying deployment files...');
  
  // Create a simple deployment package
  const packageInfo = {
    name: "location-tracker",
    version: "1.0.0",
    description: "React Location Tracking App",
    scripts: {
      "deploy": "gh-pages -d dist"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(packageInfo, null, 2));
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Static files are in the dist/ directory');
  console.log('🚀 Ready for deployment to GitHub Pages');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}