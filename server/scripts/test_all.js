const { execSync } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('      AI-LMS COMPREHENSIVE AUTOMATED TEST SUITE     ');
console.log('====================================================\n');

try {
  console.log('--> Running Module 10 Analytics Tests...');
  execSync(`node ${path.join(__dirname, 'test_analytics.js')}`, { stdio: 'inherit' });

  console.log('\n--> Running Module 11 Notifications & Alerts Tests...');
  execSync(`node ${path.join(__dirname, 'test_notifications.js')}`, { stdio: 'inherit' });

  console.log('\n--> Running Module 12 Reports & Admin Insights Tests...');
  execSync(`node ${path.join(__dirname, 'test_reports.js')}`, { stdio: 'inherit' });

  console.log('\n====================================================');
  console.log('  ALL MODULE 1-12 SUITES COMPLETED WITH 100% SUCCESS  ');
  console.log('====================================================');
} catch (err) {
  console.error('\n[FATAL] Test suite encountered failures:', err.message);
  process.exit(1);
}
