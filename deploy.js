#!/usr/bin/env node

// Deployment script for location tracker
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Deploying Location Tracker to GitHub Pages...');

try {
  // Check if dist directory exists
  if (!fs.existsSync('dist')) {
    console.error('❌ Build directory not found. Run build first.');
    process.exit(1);
  }

  // Check if gh-pages is available
  console.log('📦 Deploying with gh-pages...');
  execSync('npx gh-pages -d dist -m "Deploy location tracker app"', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('✅ Deployment completed successfully!');
  console.log('🌐 Your app will be available at: https://yourusername.github.io/repository-name');
  console.log('📝 Remember to update the URL with your actual GitHub username and repository name');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\n📋 Manual deployment steps:');
  console.log('1. Create a new repository on GitHub');
  console.log('2. Copy contents of dist/ folder to your repository');
  console.log('3. Enable GitHub Pages in repository settings');
  console.log('4. Select source as main branch');
  process.exit(1);
}