const { execSync } = require('child_process');
const path = require('path');

const projectDir = 'C:\\Users\\аdmin\\orchids-projects\\nightvolt-artist-portal-1';

try {
  console.log('Installing @supabase/supabase-js...');
  const result = execSync('npm install @supabase/supabase-js --legacy-peer-deps', {
    cwd: projectDir,
    encoding: 'utf8',
    stdio: 'inherit'
  });
  console.log('Done!');
} catch (err) {
  console.error('Error:', err.message);
}
