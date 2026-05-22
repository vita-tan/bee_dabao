const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Qwer134679@',
    database: 'bee_platform',
  });
  await c.execute('SET FOREIGN_KEY_CHECKS=0');
  const tables = [
    'beekeeper_notifications', 'notifications',
    'subsidy_applications', 'subsidy_policies',
    'trace_codes', 'medications', 'honey_harvests',
    'inspections', 'hives', 'accounts',
    'apiaries', 'beekeepers', 'admins',
  ];
  for (const t of tables) {
    await c.execute('TRUNCATE TABLE ' + t);
    console.log('Truncated:', t);
  }
  await c.execute('SET FOREIGN_KEY_CHECKS=1');
  await c.end();
  console.log('Done');
})();
