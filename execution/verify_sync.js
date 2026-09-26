/**
 * execution/verify_sync.js
 * Script da Camada 3 para verificar a sincronização e recuperação dos pedidos do Firestore.
 */

const fs = require('fs');
const https = require('https');

const envFile = fs.readFileSync('.env', 'utf8');
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

const projectId = envVars.FIREBASE_projectId;
const apiKey = envVars.FIREBASE_apiKey;

const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pedidos?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.documents && parsed.documents.length > 0) {
        console.log(`[VERIFICADO] Total de pedidos encontrados no Firestore: ${parsed.documents.length}`);
        parsed.documents.forEach((doc, idx) => {
          const f = doc.fields;
          const num = f.numeroPedido?.integerValue || idx + 1;
          const cliente = f.cliente?.mapValue?.fields?.nome?.stringValue || 'Desconhecido';
          const status = f.status?.stringValue || 'N/A';
          const total = f.valores?.mapValue?.fields?.total?.doubleValue || f.valores?.mapValue?.fields?.total?.integerValue || '0';
          console.log(` -> Pedido #${num} | Cliente: ${cliente} | Status: ${status} | Total: R$ ${total}`);
        });
      } else {
        console.log('[AVISO] Nenhum pedido encontrado no Firestore.');
      }
    } catch (e) {
      console.error('[ERRO] Falha ao parsear resposta:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('[ERRO REDE]:', err.message);
});
