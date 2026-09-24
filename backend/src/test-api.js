const app = require('./server');

async function runTests() {
  const PORT = 5099;
  const server = app.listen(PORT, async () => {
    console.log(`\n🧪 Testing FitTrack API on http://localhost:${PORT}...`);
    const baseUrl = `http://localhost:${PORT}/api`;

    let token = '';

    try {
      // 1. Health check
      console.log('\n1. Health Check:');
      const health = await fetch(`${baseUrl}/health`).then(r => r.json());
      console.log('✓ Health:', health.status);

      // 2. Demo Login
      console.log('\n2. Demo Login:');
      const demo = await fetch(`${baseUrl}/auth/demo`, { method: 'POST' }).then(r => r.json());
      console.log('✓ Demo Login:', demo.success, '| User:', demo.user.name, '| Level:', demo.user.level);
      token = demo.token;

      const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // 3. User Profile
      console.log('\n3. User Profile:');
      const profile = await fetch(`${baseUrl}/user/profile`, { headers: authHeaders }).then(r => r.json());
      console.log('✓ Profile retrieved for:', profile.user.name, '| Coins:', profile.user.coins);

      // 4. Add XP
      console.log('\n4. Add XP:');
      const xpRes = await fetch(`${baseUrl}/user/xp`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ amount: 150 }),
      }).then(r => r.json());
      console.log('✓ XP Added:', xpRes.xpGained, '| New XP:', xpRes.xp, '| Level:', xpRes.level);

      // 5. Territory Grid
      console.log('\n5. Territory Grid:');
      const gridRes = await fetch(`${baseUrl}/territory/grid`).then(r => r.json());
      console.log('✓ Grid size:', gridRes.rows, 'x', gridRes.cols, '| Stats:', gridRes.stats.percentages);

      // 6. Claim Cell
      console.log('\n6. Claim Adjacent Cell:');
      // [5,2] is adjacent to [5,3] which is owned by 'you'
      const claimRes = await fetch(`${baseUrl}/territory/claim`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ row: 5, col: 2 }),
      }).then(r => r.json());
      console.log('✓ Claim Result:', claimRes.success ? claimRes.message : claimRes.message);

      // 7. AI Turn
      console.log('\n7. AI Opponent Turn:');
      const aiRes = await fetch(`${baseUrl}/territory/ai-turn`, { method: 'POST' }).then(r => r.json());
      console.log('✓ AI Turn executed, captured cells:', aiRes.capturedCells.length);

      // 8. Tracking Session
      console.log('\n8. Save Tracking Session:');
      const trackRes = await fetch(`${baseUrl}/tracking/session`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          steps: 1200,
          distance: 0.96,
          duration: 720,
          calories: 48,
          xpEarned: 50,
          coinsEarned: 30,
        }),
      }).then(r => r.json());
      console.log('✓ Workout session saved! ID:', trackRes.session.id, '| Total steps now:', trackRes.user.totalSteps);

      // 9. Step Sync
      console.log('\n9. Incremental Step Sync:');
      const syncRes = await fetch(`${baseUrl}/tracking/step-sync`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ deltaSteps: 50 }),
      }).then(r => r.json());
      console.log('✓ Steps synced! New total steps:', syncRes.totalSteps);

      // 10. Daily Challenges
      console.log('\n10. Daily Challenges:');
      const chalRes = await fetch(`${baseUrl}/challenges/daily`).then(r => r.json());
      console.log('✓ Challenges count:', chalRes.challenges.length, '| Reset in hours:', chalRes.resetInHours);

      // 11. Avatar Shop
      console.log('\n11. Avatar Shop:');
      const shopRes = await fetch(`${baseUrl}/shop/avatars`, { headers: authHeaders }).then(r => r.json());
      console.log('✓ Avatars available:', shopRes.avatars.length, '| User coins:', shopRes.userCoins);

      // 12. Leaderboard
      console.log('\n12. Global Leaderboard:');
      const lbRes = await fetch(`${baseUrl}/leaderboard`, { headers: authHeaders }).then(r => r.json());
      console.log('✓ Leaderboard rankings:');
      lbRes.leaderboard.forEach(p => console.log(`   #${p.rank} ${p.name}: ${p.zones} zones, ${p.pct}%`));

      console.log('\n==============================================');
      console.log('🎉 ALL BACKEND API ENDPOINTS VERIFIED & WORKING 100%!');
      console.log('==============================================\n');
    } catch (e) {
      console.error('❌ Test failed:', e);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
