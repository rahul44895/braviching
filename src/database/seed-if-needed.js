// Guards seeding so it's safe to run on every boot (Render's free tier has no pre-deploy-command
// step, so migrate+seed have to fold into the start command itself -- see README's "Deploying to
// Render" section). Seeders use bulkInsert with fixed ids and aren't idempotent on their own, so
// this only runs them the first time: if `departments` already has rows, skip.
const { execSync } = require('child_process');
const { sequelize } = require('../models');

async function main() {
  const [[{ count }]] = await sequelize.query('SELECT COUNT(*) as count FROM departments');

  if (Number(count) > 0) {
    console.log('Seed data already present, skipping.');
    process.exit(0);
  }

  console.log('No seed data found, running seeders...');
  execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
  process.exit(0);
}

main().catch((err) => {
  // If `departments` doesn't exist yet, migrations haven't run -- that's a real problem, not
  // something to silently skip past.
  console.error('seed-if-needed failed:', err.message);
  process.exit(1);
});
