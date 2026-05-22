const { execSync } = require('child_process');
const mysql = require('mysql2/promise');

async function checkMySQL() {
  for (let i = 0; i < 5; i++) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'Qwer134679@',
        database: 'bee_platform',
      });
      await conn.end();
      console.log('MySQL is running!');
      process.exit(0);
    } catch (e) {
      console.log(`Attempt ${i + 1}: MySQL not ready, retrying in 3s...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.log('MySQL failed to start after 5 attempts');
  process.exit(1);
}

checkMySQL();
