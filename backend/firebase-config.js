/**
 * backend/firebase-config.js
 * Módulo de configuração e conexão backend/servidor com o Firebase Firestore.
 */

const fs = require('fs');
const path = require('path');

function getFirebaseConfig() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envFile.split('\n').forEach(line => {
      const clean = line.trim().replace(/,\s*$/, '');
      const idx = clean.indexOf('=');
      if (idx !== -1) {
        const key = clean.substring(0, idx).trim();
        let val = clean.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        envVars[key] = val;
      }
    });

    return {
      apiKey: envVars.FIREBASE_apiKey,
      authDomain: envVars.FIREBASE_authDomain,
      projectId: envVars.FIREBASE_projectId,
      storageBucket: envVars.FIREBASE_storageBucket,
      messagingSenderId: envVars.FIREBASE_messagingSenderId,
      appId: envVars.FIREBASE_appId
    };
  }

  return {
    apiKey: process.env.FIREBASE_apiKey,
    authDomain: process.env.FIREBASE_authDomain,
    projectId: process.env.FIREBASE_projectId,
    storageBucket: process.env.FIREBASE_storageBucket,
    messagingSenderId: process.env.FIREBASE_messagingSenderId,
    appId: process.env.FIREBASE_appId
  };
}

module.exports = {
  getFirebaseConfig
};
