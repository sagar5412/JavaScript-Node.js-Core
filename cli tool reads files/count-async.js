#!/usr/bin/env node

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, relative } from 'path';

// Recursively find all JS files (closure maintains state through recursion)
async function findJSFiles(dir, files = [], baseDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    // Skip node_modules and hidden directories
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await findJSFiles(fullPath, files, baseDir); // recursion
      }
    } else if (entry.isFile() && extname(entry.name) === '.js') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Count async/await usage in file content
function countAsyncAwait(content) {
  // Remove strings/comments to reduce false positives
  const sanitized = content
    .replace(/`([^`\\]|\\.)*`/g, '')      // template literals
    .replace(/"([^"\\]|\\.)*"/g, '')      // double quotes
    .replace(/'([^'\\]|\\.)*'/g, '')      // single quotes
    .replace(/\/\*[\s\S]*?\*\//g, '')      // multi-line comments
    .replace(/\/\/.*/g, '');               // single-line comments

  const asyncMatches = sanitized.match(/\basync\b/g) || [];
  const awaitMatches = sanitized.match(/\bawait\b/g) || [];

  // Match specific patterns
  const asyncFunctionPattern = /\basync\s+function\s+\w+\s*\(/g;
  const asyncArrowPattern = /\basync\s*(?:\([^)]*\)|\w+)\s*=>/g;
  const asyncMethodPattern = /\basync\s+\w+\s*\(/g;

  return {
    asyncCount: asyncMatches.length,
    awaitCount: awaitMatches.length,
    asyncFunctions: (sanitized.match(asyncFunctionPattern) || []).length,
    asyncArrows: (sanitized.match(asyncArrowPattern) || []).length,
    asyncMethods: (sanitized.match(asyncMethodPattern) || []).length,
  };
}

// Main analysis logic
async function analyzeDirectory(dirPath) {
  const targetDir = dirPath || process.cwd();
  console.log(`📁 Scanning: ${targetDir}\n`);
  
  const stats = await stat(targetDir);
  if (!stats.isDirectory()) {
    console.error('❌ Error: Path is not a directory');
    process.exit(1);
  }

  // Sequential processing (conservative memory usage)
  const jsFiles = await findJSFiles(targetDir);
  console.log(`📄 Found ${jsFiles.length} JavaScript files\n`);

  if (jsFiles.length === 0) {
    console.log('No JavaScript files found');
    return;
  }

  // Process each file and accumulate results
  const results = [];
  for (const file of jsFiles) {
    try {
      const content = await readFile(file, 'utf-8');
      const counts = countAsyncAwait(content);
      
      // Only store files with async/await
      if (counts.asyncCount > 0 || counts.awaitCount > 0) {
        results.push({
          file: relative(targetDir, file),
          ...counts
        });
      }
    } catch (error) {
      console.warn(`⚠️  Warning: Could not read ${file} - ${error.message}`);
    }
  }

  // Display per-file results
  if (results.length > 0) {
    console.log('📊 Files with async/await usage:\n');
    for (const r of results) {
      console.log(`  ${r.file}`);
      console.log(`    async: ${r.asyncCount} | await: ${r.awaitCount}`);
      console.log(`    functions: ${r.asyncFunctions} | arrows: ${r.asyncArrows}`);
      console.log('');
    }
  }

  // Calculate totals using reduce (closure captures accumulator)
  const totals = results.reduce((acc, r) => ({
    asyncCount: acc.asyncCount + r.asyncCount,
    awaitCount: acc.awaitCount + r.awaitCount,
    asyncFunctions: acc.asyncFunctions + r.asyncFunctions,
    asyncArrows: acc.asyncArrows + r.asyncArrows,
    asyncMethods: acc.asyncMethods + r.asyncMethods,
    filesWithAsync: acc.filesWithAsync + 1
  }), {
    asyncCount: 0, awaitCount: 0, asyncFunctions: 0, 
    asyncArrows: 0, asyncMethods: 0, filesWithAsync: 0
  });

  // Display summary
  console.log('═══════════════════════════════════════');
  console.log('📈 SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`Files analyzed: ${jsFiles.length}`);
  console.log(`Files using async/await: ${totals.filesWithAsync}`);
  console.log(`Total 'async' keywords: ${totals.asyncCount}`);
  console.log(`Total 'await' keywords: ${totals.awaitCount}`);
  console.log(`Async functions: ${totals.asyncFunctions}`);
  console.log(`Async arrows: ${totals.asyncArrows}`);
  console.log(`Async methods: ${totals.asyncMethods}`);
  
  if (totals.asyncCount > 0 && totals.awaitCount > 0) {
    const ratio = (totals.awaitCount / totals.asyncCount).toFixed(2);
    console.log(`\nAwait/async ratio: ${ratio}`);
  }
}

// CLI entry point
const targetPath = process.argv[2];
analyzeDirectory(targetPath).catch(err => {
  console.error(`❌ Fatal error: ${err.message}`);
  process.exit(1);
});