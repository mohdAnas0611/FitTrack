const { db } = require('./database');
const fs = require('fs');
const path = require('path');

console.log('Seeding FitTrack database...');
db.init();
console.log('FitTrack Database seeded successfully!');
console.log('Demo Credentials:');
console.log('Email: demo@fittrack.app');
console.log('Password: demo123');
