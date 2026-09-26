# 🍔 BurguerSync Ourinhos — Real-Time Kitchen & Order Ecosystem

<p align="center">
  <img src="./frontend/assets/logo.svg" alt="BurguerSync Logo" width="340">
</p>

<p align="center">
  <strong>Ecossistema Web Full-Stack em Tempo Real para Hamburgueria Artesanal</strong><br>
  Desenvolvido com o poder da Inteligência Artificial do <strong>Google Antigravity</strong>, <strong>Google Stitch</strong> e <strong>Firebase Cloud Firestore</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Antigravity-v2.5.5-orange?style=for-the-badge&logo=google" alt="Google Antigravity">
  <img src="https://img.shields.io/badge/Firebase-Firestore%20v10-yellow?style=for-the-badge&logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/badge/Google%20Stitch-Design%20System-blue?style=for-the-badge&logo=material-design" alt="Google Stitch">
  <img src="https://img.shields.io/badge/JavaScript-ES6%20Modules-F7DF1E?style=for-the-badge&logo=javascript" alt="JavaScript">
  <img src="https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/SENAI-Ourinhos%20SP-red?style=for-the-badge" alt="SENAI Ourinhos">
</p>

---

## 🌐 Idiomas / Languages
- [Português do Brasil (PT-BR)](#-português-do-brasil)
- [English (EN)](#-english)

---

## 🇧🇷 Português do Brasil

### 📖 Sobre o Projeto
O **BurguerSync Ourinhos** é uma aplicação web full-stack desenvolvida para automatizar a captação de pedidos de clientes e a gestão de produção na cozinha em tempo real. Eliminando falhas de comunicação e gargalos de atendimento, o sistema integra o cardápio digital do cliente a um painel Kanban interativo na cozinha, com atualização instantânea (via `onSnapshot` do Firestore) sem necessidade de recarregar a página (F5).

### 🤖 Agentes e Skills do Google Antigravity Utilizados
Este projeto foi orquestrado e construído seguindo a **Arquitetura de 3 Camadas** com suporte dos seguintes agentes e packs:
- **`@orchestrator` (`/agente-orquestrador`):** Coordenação central de decisão, alinhamento técnico e ciclo de autorrecuperação (*Self-Annealing*).
- **`@app-builder` & `@frontend-design`:** Estruturação do front-end com base nos design tokens extraídos do Google Stitch (Dark Mode Neon, tipografia Inter e microinterações).
- **`@database-design` & `@firebase-mcp-server`:** Modelagem NoSQL no Cloud Firestore e configuração de escutadores em tempo real.
- **`@clean-code` & `@lint-and-validate`:** Garantia de código limpo, sem over-engineering, modular e seguro.

### ✨ Funcionalidades Principais
1. **Visão do Cliente (Cardápio & Checkout):**
   - Vitrine de produtos artesanais (*Ourinhos Smash Burguer*, *Monster Bacon SENAI*, *Batata Rústica Suprema*).
   - Carrinho flutuante inteligente com ajuste dinâmico de quantidades e observações personalizadas por item.
   - Cálculo automático de subtotal, taxa de entrega fixa e valor total.
   - Checkout completo com seleção de pagamento (PIX com chave dinâmica, Cartão na entrega ou Dinheiro com troco).
   - Validações de integridade de formulário e persistência local (*localStorage*) em caso de instabilidade.

2. **Visão da Cozinha (Kanban em Tempo Real):**
   - Quadro Kanban em 4 estágios lineares: `Recebido` ➔ `Em Preparo` ➔ `Saiu para Entrega` ➔ `Entregue`.
   - Transição de status em 1 clique utilizando `updateDoc` no Firestore.
   - Alerta sonoro de sino de cozinha sintetizado via Web Audio API ao receber novos pedidos.
   - Relógio digital em tempo real e indicadores de desempenho (KPIs de tempo médio e pedidos ativos).
   - Filtros instantâneos (Todos os pedidos, Apenas Prioridades com observações, e Apenas Delivery).

### 🏗️ Estrutura do Repositório
```text
PROJETO - AULA O7/
├── .env                         # Chaves e credenciais seguras (Firebase, GitHub)
├── index.html                   # Redirecionador raiz para GitHub Pages
├── README.md                    # Documentação principal bilíngue
├── frontend/                    # Aplicação Client-Side
│   ├── index.html               # SPA com Visão Cliente e Cozinha
│   ├── styles.css               # Design System Dark Mode Neon
│   ├── app.js                   # Lógica e integração com Firebase SDK v10
│   ├── firebase-config.js       # Configuração web do Firebase
│   └── assets/                  # Vetores SVG e logotipo oficial Stitch
├── backend/                     # Configurações de servidor
│   └── firebase-config.js       # Leitor de credenciais backend
├── execution/                   # Scripts determinísticos (Camada 3)
│   ├── seed_firestore.js        # Semeadura de pedidos no Firestore
│   ├── verify_sync.js           # Teste de sincronização em tempo real
│   └── deploy_github.js         # Publicação e automação no GitHub
├── documentation/               # Documentação técnica e rastreabilidade
│   ├── architecture_diagram.md  # Diagramas de arquitetura e fluxos
│   └── promptHistory.md         # Histórico integral de prompts
└── directives/                  # SOPs e Diretrizes de Negócio (Camada 1)
    ├── projeto.md               # SOP Mestre do BurguerSync
    └── design/design.md         # Especificação de Design do Stitch
```

---

## 🇺🇸 English

### 📖 About the Project
**BurguerSync Ourinhos** is a full-stack real-time web application built to streamline online burger ordering and kitchen dispatch operations. Eliminating communication errors and kitchen bottlenecks, the system seamlessly connects a digital customer menu to a live kitchen Kanban board powered by Google Cloud Firestore (`onSnapshot`), achieving zero-latency updates without page reloads.

### 🤖 Google Antigravity Agents & Skills
Built using the 3-Layer Architecture powered by Google Antigravity:
- **`@orchestrator`:** Strategic decisions, directive execution, and self-annealing recovery loops.
- **`@frontend-design` & `@app-builder`:** Visual aesthetics synchronized with Google Stitch tokens (Neon Dark mode, Inter typography, micro-interactions).
- **`@database-design` & `@firebase-mcp-server`:** Firestore NoSQL data modeling and bi-directional realtime sync.
- **`@clean-code`:** Concise, robust, and self-documenting implementation.

### 🚀 Key Features
- **Customer View:** Dynamic menu, persistent cart with custom order notes, realtime subtotal calculation, and multi-option checkout (Pix QR Code, Card on Delivery, Cash).
- **Kitchen Kanban:** 4-lane pipeline (`Received` ➔ `In Preparation` ➔ `Out for Delivery` ➔ `Delivered`), Web Audio synthesized kitchen bell chime, digital clock, and live KPIs.
- **Reliable Data Flow:** Offline-first state persistence in case of connection dropouts.

---

### 💻 Como Executar Localmente / How to Run Locally

```bash
# 1. Clone o repositório
git clone https://github.com/juliocesarws3-gif/burguersync2.git
cd burguersync2

# 2. Povoar o banco Firestore com pedidos de demonstração (Opcional)
node execution/seed_firestore.js

# 3. Iniciar um servidor local
npx serve .
# ou abrir frontend/index.html diretamente no navegador
```

---

<p align="center">
  Desenvolvido com dedicação por <strong>Julio Cesar</strong> sob mentoria <strong>SENAI Ourinhos</strong> & <strong>Google Antigravity</strong>.
</p>
