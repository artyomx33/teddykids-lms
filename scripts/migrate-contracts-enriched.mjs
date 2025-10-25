#!/usr/bin/env node

/**
 * Migration Script: contracts_enriched_v2 → employes_current_state
 * 
 * Purpose: Automatically replace field names and table references
 * Approach: Replace simple fields, remove computed fields
 * 
 * Run: node scripts/migrate-contracts-enriched.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');

// Field mapping from contracts_enriched_v2 to employes_current_state
const FIELD_MAPPINGS = {
  // Simple field renames (direct mapping)
  'end_date': 'contract_end_date',
  'start_date': 'contract_start_date',
  'birth_date': 'date_of_birth',
  'full_name': 'employee_name',
  
  // Computed fields (will be removed and calculated frontend)
  'needs_six_month_review': '/* REMOVED: Calculate with useReviewCalculations hook */',
  'needs_yearly_review': '/* REMOVED: Calculate with useReviewCalculations hook */',
  'next_review_due': '/* REMOVED: Calculate with useReviewCalculations hook */',
  'last_review_date': '/* REMOVED: Get from staff_reviews table */',
};

const TABLE_MAPPING = {
  'contracts_enriched_v2': 'employes_current_state'
};

function findTargetFiles() {
  const files = [];
  
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walkDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        // Exclude type definition files
        if (!entry.name.endsWith('.d.ts') && !fullPath.includes('/types.ts')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('contracts_enriched')) {
            files.push(fullPath);
          }
        }
      }
    }
  }
  
  walkDir(path.join(projectRoot, 'src'));
  return files;
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = [];
  const originalContent = content;
  
  // Step 1: Replace table names
  for (const [oldTable, newTable] of Object.entries(TABLE_MAPPING)) {
    const patterns = [
      { from: `.from('${oldTable}')`, to: `.from('${newTable}')` },
      { from: `.from("${oldTable}")`, to: `.from("${newTable}")` },
    ];
    
    for (const { from, to } of patterns) {
      if (content.includes(from)) {
        content = content.replaceAll(from, to);
        changes.push(`Table: ${from} → ${to}`);
      }
    }
  }
  
  // Step 2: Replace field names in select statements
  for (const [oldField, newField] of Object.entries(FIELD_MAPPINGS)) {
    // Skip computed fields (they need different handling)
    if (newField.startsWith('/*')) continue;
    
    // Pattern: 'field_name' or "field_name" in select/where/order
    const patterns = [
      // In select()
      { regex: new RegExp(`'${oldField}'`, 'g'), replacement: `'${newField}'` },
      { regex: new RegExp(`"${oldField}"`, 'g'), replacement: `"${newField}"` },
      // In .gte(), .lte(), .eq(), etc
      { regex: new RegExp(`\\.gte\\('${oldField}'`, 'g'), replacement: `.gte('${newField}'` },
      { regex: new RegExp(`\\.lte\\('${oldField}'`, 'g'), replacement: `.lte('${newField}'` },
      { regex: new RegExp(`\\.eq\\('${oldField}'`, 'g'), replacement: `.eq('${newField}'` },
      { regex: new RegExp(`\\.order\\('${oldField}'`, 'g'), replacement: `.order('${newField}'` },
      { regex: new RegExp(`\\.not\\('${oldField}'`, 'g'), replacement: `.not('${newField}'` },
      // In property access (less aggressive - only in obvious query contexts)
      { regex: new RegExp(`\\.${oldField}(?=\\s*[,;)]|\\s*\\?)`, 'g'), replacement: `.${newField}` },
    ];
    
    for (const { regex, replacement } of patterns) {
      const before = content;
      content = content.replace(regex, replacement);
      if (content !== before) {
        changes.push(`Field: ${oldField} → ${newField}`);
      }
    }
  }
  
  // Step 3: Remove computed fields from SELECT statements
  const computedFieldsPattern = /(needs_six_month_review|needs_yearly_review|next_review_due|last_review_date)/g;
  
  // Remove from select statements (but keep property access)
  content = content.replace(
    /\.select\([^)]*?(needs_six_month_review|needs_yearly_review|next_review_due|last_review_date)[^)]*?\)/g,
    (match) => {
      changes.push(`Removed computed fields from SELECT`);
      return match
        .replace(/, needs_six_month_review/g, '')
        .replace(/needs_six_month_review, /g, '')
        .replace(/, needs_yearly_review/g, '')
        .replace(/needs_yearly_review, /g, '')
        .replace(/, next_review_due/g, '')
        .replace(/next_review_due, /g, '')
        .replace(/, last_review_date/g, '')
        .replace(/last_review_date, /g, '');
    }
  );
  
  // Step 4: Add TODO comments where computed fields are used
  if (content.match(/\.(needs_six_month_review|needs_yearly_review)/)) {
    changes.push(`⚠️  Uses computed fields - needs useReviewCalculations hook`);
  }
  
  return {
    content,
    changes,
    wasModified: content !== originalContent,
    originalContent
  };
}

// Main execution
console.log('🔍 Finding files using contracts_enriched_v2...\n');

const targetFiles = findTargetFiles();
console.log(`Found ${targetFiles.length} files:\n`);

targetFiles.forEach((file, i) => {
  console.log(`${i + 1}. ${path.relative(projectRoot, file)}`);
});

console.log('\n' + '='.repeat(80));
console.log(DRY_RUN ? '🧪 DRY RUN MODE - No files will be modified' : '🚀 MIGRATION MODE - Files will be modified');
console.log('='.repeat(80) + '\n');

let migratedCount = 0;
let skippedCount = 0;

for (const filePath of targetFiles) {
  const relativePath = path.relative(projectRoot, filePath);
  const result = migrateFile(filePath);
  
  if (result.wasModified) {
    console.log(`\n📝 ${relativePath}`);
    result.changes.forEach(change => console.log(`   - ${change}`));
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, result.content, 'utf8');
      console.log(`   ✅ File updated`);
    } else {
      console.log(`   🧪 Would update (dry-run)`);
    }
    migratedCount++;
  } else {
    console.log(`\n⏭️  ${relativePath} - No changes needed`);
    skippedCount++;
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Summary:`);
console.log(`   ✅ Migrated: ${migratedCount} files`);
console.log(`   ⏭️  Skipped: ${skippedCount} files`);

if (DRY_RUN) {
  console.log(`\n💡 This was a dry run. Run without --dry-run to apply changes.`);
  console.log(`   node scripts/migrate-contracts-enriched.mjs`);
} else {
  console.log(`\n✅ Migration complete!`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Review changes: git diff`);
  console.log(`   2. Create useReviewCalculations hook for computed fields`);
  console.log(`   3. Update components using needs_*_review fields`);
  console.log(`   4. Test all affected components`);
  console.log(`   5. Run: npm run lint`);
}

console.log('\n');

