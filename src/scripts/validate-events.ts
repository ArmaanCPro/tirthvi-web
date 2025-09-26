#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { validateEventFile } from '../lib/schemas/event';

async function validateAllEvents() {
  const eventsDir = path.join(process.cwd(), 'src/data/events');
  
  if (!fs.existsSync(eventsDir)) {
    console.error('Events directory not found:', eventsDir);
    process.exit(1);
  }
  
  const files = fs.readdirSync(eventsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  if (jsonFiles.length === 0) {
    console.log('No JSON files found to validate');
    return;
  }
  
  console.log(`Validating ${jsonFiles.length} event files...\n`);
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const file of jsonFiles) {
    const filePath = path.join(eventsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Validating ${file}:`);
    
    if (!content.trim()) {
      console.log('  ❌ Empty file\n');
      invalidCount++;
      continue;
    }
    
    const validation = validateEventFile(filePath, content);
    
    if (validation.success) {
      console.log('  ✅ Valid');
      validCount++;
    } else {
      console.log('  ❌ Invalid:');
      validation.errors.forEach(error => {
        console.log(`    - ${error}`);
      });
      invalidCount++;
    }
    
    console.log('');
  }
  
  console.log(`\nValidation Summary:`);
  console.log(`✅ Valid files: ${validCount}`);
  console.log(`❌ Invalid files: ${invalidCount}`);
  console.log(`📊 Total files: ${jsonFiles.length}`);
  
  if (invalidCount > 0) {
    process.exit(1);
  }
}

validateAllEvents().catch(console.error);
