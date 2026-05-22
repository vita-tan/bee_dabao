const { execSync } = require('child_process');

try {
  const result = execSync('netstat -ano | findstr :4176 | findstr LISTENING', { encoding: 'utf8' });
  const lines = result.trim().split('\n');
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && !isNaN(pid)) {
      console.log(`Killing PID ${pid}`);
      execSync(`taskkill /PID ${pid} /F`, { encoding: 'utf8' });
    }
  }
  console.log('Done');
} catch (e) {
  console.log('No process on port 4176');
}
