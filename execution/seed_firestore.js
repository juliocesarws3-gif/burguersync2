/**
 * execution/seed_firestore.js
 * Script determinístico da Camada 3 para povoamento inicial de pedidos no Firestore.
 */

const fs = require('fs');
const https = require('https');

// Carrega variáveis do arquivo .env
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

if (!projectId || !apiKey) {
  console.error('ERRO: Credenciais do Firebase não localizadas no .env');
  process.exit(1);
}

const sampleOrders = [
  {
    numeroPedido: 1043,
    cliente: {
      nome: 'Mariana Santos',
      email: 'mariana.santos@email.com',
      celular: '(14) 99123-8899',
      endereco: 'Rua São Paulo, 720 - Vila Brasil, Ourinhos - SP',
      obsEntrega: 'Interfone 12'
    },
    itens: [
      { nome: 'Monster Bacon SENAI', preco: 34.00, quantidade: 2, obsItem: 'Ponto da carne ao ponto para mal passado' },
      { nome: 'Coca-Cola Zero 350ml', preco: 6.00, quantidade: 1, obsItem: 'Bem gelada' }
    ],
    pagamento: {
      metodo: 'Pix',
      troco: ''
    },
    valores: {
      subtotal: 74.00,
      taxaEntrega: 5.00,
      total: 79.00
    },
    status: 'Recebido',
    obsCozinha: 'Ponto da carne ao ponto para mal passado. Molho extra se possível.',
    criadoEm: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    numeroPedido: 1042,
    cliente: {
      nome: 'Lucas Silva',
      email: 'lucas.silva@email.com',
      celular: '(14) 99876-5432',
      endereco: 'Rua Paraná, 450 - Centro, Ourinhos - SP',
      obsEntrega: 'Apartamento 42, interfone 04'
    },
    itens: [
      { nome: 'Ourinhos Smash Burguer', preco: 28.00, quantidade: 1, obsItem: 'Sem cebola, bem passado' },
      { nome: 'Batata Rústica Suprema', preco: 18.00, quantidade: 1, obsItem: 'Cheddar caprichado' }
    ],
    pagamento: {
      metodo: 'Pix',
      troco: ''
    },
    valores: {
      subtotal: 46.00,
      taxaEntrega: 5.00,
      total: 51.00
    },
    status: 'Em Preparo',
    obsCozinha: 'Sem cebola, carne bem passada! Caprichar no cheddar da batata.',
    criadoEm: new Date(Date.now() - 8 * 60 * 1000).toISOString()
  },
  {
    numeroPedido: 1041,
    cliente: {
      nome: 'Carlos Eduardo',
      email: 'carlos.edu@email.com',
      celular: '(14) 99765-4321',
      endereco: 'Av. Altino Arantes, 120 - Centro, Ourinhos - SP',
      obsEntrega: 'Portão branco ao lado da padaria'
    },
    itens: [
      { nome: 'Monster Bacon SENAI', preco: 34.00, quantidade: 1, obsItem: 'Normal' },
      { nome: 'Batata Rústica Suprema', preco: 18.00, quantidade: 1, obsItem: 'Bacon extra' }
    ],
    pagamento: {
      metodo: 'Cartao_Entrega',
      troco: ''
    },
    valores: {
      subtotal: 52.00,
      taxaEntrega: 5.00,
      total: 57.00
    },
    status: 'Saiu para Entrega',
    obsCozinha: 'Embalar para viagem com lacre reforçado.',
    entregador: 'Marcos (Moto 03)',
    criadoEm: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    numeroPedido: 1040,
    cliente: {
      nome: 'Ana Paula Mello',
      email: 'ana.mello@email.com',
      celular: '(14) 99654-3210',
      endereco: 'Rua Rio de Janeiro, 88 - Jardim Matilde, Ourinhos - SP',
      obsEntrega: 'Casa com cerca viva'
    },
    itens: [
      { nome: 'Ourinhos Smash Burguer', preco: 28.00, quantidade: 1, obsItem: 'Sem picles' },
      { nome: 'Refrigerante Guaraná', preco: 6.00, quantidade: 1, obsItem: 'Gelado' }
    ],
    pagamento: {
      metodo: 'Pix',
      troco: ''
    },
    valores: {
      subtotal: 34.00,
      taxaEntrega: 5.00,
      total: 39.00
    },
    status: 'Entregue',
    obsCozinha: 'Pedido entregue com sucesso.',
    criadoEm: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  }
];

function convertToFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        fields[key] = { integerValue: value.toString() };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(v => ({ mapValue: { fields: convertToFirestoreFields(v) } }))
        }
      };
    } else if (typeof value === 'object' && value !== null) {
      fields[key] = {
        mapValue: {
          fields: convertToFirestoreFields(value)
        }
      };
    }
  }
  return fields;
}

async function seedOrders() {
  console.log(`Iniciando semeadura de pedidos no projeto Firebase: ${projectId}...`);
  
  for (const order of sampleOrders) {
    const postData = JSON.stringify({
      fields: convertToFirestoreFields(order)
    });

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pedidos?key=${apiKey}`;

    await new Promise((resolve, reject) => {
      const u = new URL(url);
      const req = https.request({
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let respData = '';
        res.on('data', chunk => respData += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[SUCESSO] Pedido #${order.numeroPedido} (${order.cliente.nome}) inserido com status '${order.status}'.`);
            resolve();
          } else {
            console.error(`[ERRO] Falha ao inserir pedido #${order.numeroPedido}:`, res.statusCode, respData);
            resolve(); // continua
          }
        });
      });

      req.on('error', (err) => {
        console.error(`[ERRO DE REDE] Pedido #${order.numeroPedido}:`, err.message);
        resolve();
      });

      req.write(postData);
      req.end();
    });
  }

  console.log('Semeadura de pedidos concluída!');
}

seedOrders();
