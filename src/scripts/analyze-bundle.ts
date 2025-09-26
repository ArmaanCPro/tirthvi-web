#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function analyzeBundle() {
  console.log('🔍 Analyzing bundle size...\n');
  
  try {
    // Run Next.js bundle analyzer
    execSync('pnpm build', { stdio: 'inherit' });
    
    console.log('\n✅ Build completed successfully!');
    console.log('\n📊 Bundle analysis:');
    console.log('- Check .next/analyze/ for detailed bundle analysis');
    console.log('- Look for large dependencies that could be optimized');
    console.log('- Consider code splitting for large components');
    
    // Check if build artifacts exist
    const buildDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(buildDir)) {
      console.log('\n📁 Build artifacts found in .next/');
      
      // List main chunks
      const staticDir = path.join(buildDir, 'static', 'chunks');
      if (fs.existsSync(staticDir)) {
        const chunks = fs.readdirSync(staticDir);
        console.log(`\n📦 Found ${chunks.length} chunks:`);
        chunks.slice(0, 10).forEach(chunk => {
          const stats = fs.statSync(path.join(staticDir, chunk));
          console.log(`  - ${chunk}: ${(stats.size / 1024).toFixed(2)} KB`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error);
    process.exit(1);
  }
}

analyzeBundle().catch(console.error);
