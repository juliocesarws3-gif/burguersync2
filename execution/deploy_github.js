/**
 * execution/deploy_github.js
 * Script determinístico da Camada 3 para criação do repositório no GitHub,
 * upload dos arquivos via GitHub Git Data API e ativação do GitHub Pages.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Carrega variáveis de ambiente
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

const token = envVars.GITHUB_PERSOANL_KEY;
const REPO_NAME = 'burguersync2';

if (!token) {
  console.error('ERRO: GITHUB_PERSOANL_KEY não definida no arquivo .env');
  process.exit(1);
}

function githubRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method: method,
      headers: {
        'User-Agent': 'BurguerSync-Deployer/1.0',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    if (postData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

// Lista recursivamente arquivos a incluir (ignorando node_modules, .git, .tmp)
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (file === 'node_modules' || file === '.git' || file === '.tmp' || file === '.env') {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function main() {
  console.log('🚀 Iniciando processo de publicação automatizada no GitHub...');

  // 1. Obter usuário logado
  const userRes = await githubRequest('/user');
  if (userRes.status !== 200) {
    console.error('Falha ao autenticar no GitHub:', userRes.data);
    process.exit(1);
  }
  const username = userRes.data.login;
  console.log(`👤 Usuário autenticado: ${username}`);

  // 2. Verificar se repositório já existe
  const repoRes = await githubRequest(`/repos/${username}/${REPO_NAME}`);
  if (repoRes.status === 404) {
    console.log(`📦 Repositório '${REPO_NAME}' não existe. Criando agora...`);
    const createRes = await githubRequest('/user/repos', 'POST', {
      name: REPO_NAME,
      description: 'BurguerSync Ourinhos - Ecossistema Realtime com Google Antigravity e Firebase',
      private: false,
      auto_init: true
    });

    if (createRes.status !== 201) {
      console.error('Erro ao criar repositório:', createRes.data);
      process.exit(1);
    }
    console.log(`✅ Repositório '${REPO_NAME}' criado com sucesso!`);
    // Aguarda 3 segundos para inicialização do repositório no GitHub
    await new Promise(r => setTimeout(r, 3000));
  } else {
    console.log(`📦 Repositório '${REPO_NAME}' já existe. Atualizando arquivos...`);
  }

  // 3. Obter branch padrão e último commit
  let branch = 'main';
  let refRes = await githubRequest(`/repos/${username}/${REPO_NAME}/git/refs/heads/${branch}`);
  if (refRes.status === 404) {
    branch = 'master';
    refRes = await githubRequest(`/repos/${username}/${REPO_NAME}/git/refs/heads/${branch}`);
  }

  let latestCommitSha = null;
  if (refRes.status === 200) {
    latestCommitSha = refRes.data.object.sha;
    console.log(`📌 Branch '${branch}' detectada no commit ${latestCommitSha.substring(0, 7)}`);
  }

  // 4. Coletar arquivos do projeto
  const allFiles = getAllFiles('.');
  console.log(`📂 Total de arquivos para envio: ${allFiles.length}`);

  const treeItems = [];

  for (const filePath of allFiles) {
    const relPath = path.relative('.', filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath);
    const base64Content = content.toString('base64');

    // Cria Blob
    const blobRes = await githubRequest(`/repos/${username}/${REPO_NAME}/git/blobs`, 'POST', {
      content: base64Content,
      encoding: 'base64'
    });

    if (blobRes.status === 201) {
      treeItems.push({
        path: relPath,
        mode: '100644',
        type: 'blob',
        sha: blobRes.data.sha
      });
      console.log(` -> Blob criado: ${relPath}`);
    } else {
      console.error(`Erro ao criar blob para ${relPath}:`, blobRes.data);
    }
  }

  // 5. Criar Tree
  console.log('🌲 Criando árvore de arquivos (Git Tree)...');
  const treePayload = { tree: treeItems };
  const treeRes = await githubRequest(`/repos/${username}/${REPO_NAME}/git/trees`, 'POST', treePayload);

  if (treeRes.status !== 201) {
    console.error('Erro ao criar tree:', treeRes.data);
    process.exit(1);
  }
  const treeSha = treeRes.data.sha;
  console.log(`✅ Git Tree criada: ${treeSha}`);

  // 6. Criar Commit
  console.log('💾 Criando commit no GitHub...');
  const commitPayload = {
    message: 'feat: ecossistema BurguerSync Ourinhos com Google Antigravity & Firebase',
    tree: treeSha,
    parents: latestCommitSha ? [latestCommitSha] : []
  };

  const commitRes = await githubRequest(`/repos/${username}/${REPO_NAME}/git/commits`, 'POST', commitPayload);
  if (commitRes.status !== 201) {
    console.error('Erro ao criar commit:', commitRes.data);
    process.exit(1);
  }
  const commitSha = commitRes.data.sha;
  console.log(`✅ Commit criado com sucesso: ${commitSha}`);

  // 7. Atualizar Referência da Branch
  if (latestCommitSha) {
    await githubRequest(`/repos/${username}/${REPO_NAME}/git/refs/heads/${branch}`, 'PATCH', {
      sha: commitSha,
      force: true
    });
  } else {
    await githubRequest(`/repos/${username}/${REPO_NAME}/git/refs`, 'POST', {
      ref: `refs/heads/${branch}`,
      sha: commitSha
    });
  }
  console.log(`🎉 Branch '${branch}' atualizada com sucesso!`);

  // 8. Ativar e Configurar GitHub Pages
  console.log('🌐 Configurando GitHub Pages...');
  const pagesRes = await githubRequest(`/repos/${username}/${REPO_NAME}/pages`, 'POST', {
    source: {
      branch: branch,
      path: '/'
    }
  });

  if (pagesRes.status === 201) {
    console.log(`🚀 GitHub Pages ativado com sucesso! URL: ${pagesRes.data.html_url}`);
  } else if (pagesRes.status === 409) {
    console.log(`ℹ️ GitHub Pages já estava configurado.`);
  } else {
    console.log(`Status de configuração do GitHub Pages: ${pagesRes.status}`);
  }

  const repoUrl = `https://github.com/${username}/${REPO_NAME}`;
  const pagesUrl = `https://${username}.github.io/${REPO_NAME}/`;

  console.log('\n======================================================');
  console.log(`✨ SUCESSO COMPLETO NA PUBLICAÇÃO! ✨`);
  console.log(`📦 Repositório GitHub: ${repoUrl}`);
  console.log(`🌐 Aplicação Web Live: ${pagesUrl}`);
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('Erro fatal no deploy:', err);
});
