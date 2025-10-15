#!/usr/bin/env node

/**
 * Code Cleanup Utility for GiveNTake
 * 
 * This script helps identify and document code quality issues
 * Run with: node scripts/code-cleanup-check.js
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

// Issues to check for
const checks = {
  anyTypes: /:\s*any(\s|;|,|\)|\]|>)/g,
  consoleLogs: /console\.(log|error|warn|info)/g,
  unusedVars: /_\w+/g, // Variables starting with underscore
  unescapedQuotes: /[^&](can't|don't|won't|hasn't|haven't)/g,
};

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath);
  const issues = [];

  // Check for any types
  const anyMatches = [...content.matchAll(checks.anyTypes)];
  if (anyMatches.length > 0) {
    issues.push(`  - ${anyMatches.length} 'any' type(s) found`);
  }

  // Check for console statements
  const consoleMatches = [...content.matchAll(checks.consoleLogs)];
  if (consoleMatches.length > 0) {
    issues.push(`  - ${consoleMatches.length} console statement(s) found`);
  }

  // Check for unescaped quotes
  const quoteMatches = [...content.matchAll(checks.unescapedQuotes)];
  if (quoteMatches.length > 0) {
    issues.push(`  - ${quoteMatches.length} unescaped quote(s) found`);
  }

  if (issues.length > 0) {
    console.log(`\n📄 ${relativePath}`);
    issues.forEach(issue => console.log(issue));
  }

  return issues.length;
}

function scanDirectory(dir) {
  let totalIssues = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      totalIssues += scanDirectory(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      totalIssues += scanFile(fullPath);
    }
  }

  return totalIssues;
}

console.log('🔍 Scanning project for code quality issues...\n');
console.log('━'.repeat(60));

const totalIssues = scanDirectory(SRC_DIR);

console.log('\n' + '━'.repeat(60));
console.log(`\n✨ Scan complete! Found issues in files above.`);
console.log(`\n💡 Tip: Run 'npm run lint' for detailed line numbers.`);
console.log(`📖 See PROJECT_REVIEW_REPORT.md for detailed recommendations.\n`);
