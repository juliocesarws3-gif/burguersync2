/**
 * ============================================================================
 * BurguerSync Ourinhos - Core Application Engine (Layer 3)
 * Firebase Web SDK v10 (ES6 Modules) + Realtime Firestore Sync
 * ============================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// 1. Inicialização do Firebase & Firestore
let app, db, pedidosCol;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  pedidosCol = collection(db, "pedidos");
  console.log("🔥 [BurguerSync] Firebase inicializado com sucesso:", firebaseConfig.projectId);
} catch (error) {
  console.error("❌ [BurguerSync] Erro ao inicializar Firebase:", error);
}

// 2. Estado Global do Carrinho & Constantes
const TAXA_ENTREGA = 5.00;
let carrinho = carregarCarrinhoLocal();
let pedidosRemotos = [];
let filtroAtivo = "todos";
let somHabilitado = true;

// Itens estáticos do cardápio oficial
export const CARDAPIO_ITENS = [
  {
    id: "smash",
    nome: "Ourinhos Smash Burguer",
    preco: 28.00,
    badge: "SMASH 160G",
    desc: "Pão brioche na manteiga de garrafa, 2x smash burger 80g, duplo cheddar derretido e fatias crocantes de bacon artesanal.",
    imagem: "https://lh3.googleusercontent.com/aida/AEtjO1VV0CNAw9D5Xr3oCgWDC8_OT7OZr_mXfuDZi6eh7IuBlMXj7J91iQpNc6-7e3HrA2MezxIUmC5I3MebM2As_oyaJCeuen-0DE88YnWJ3_nAXncCb4bcEfPQEQpt3RKChqK7rnLQgF7f62DkOsK6-UDTYKK8EUkpKLmpi5b4Hb7WC4seOyfojSQpIDg5TWgSyoCV72Yy9H318qWUq-D2iQb6yOXquwN7q3ybBPGeX7Wf8UPbTVPH3VGk1wE"
  },
  {
    id: "monster",
    nome: "Monster Bacon SENAI",
    preco: 34.00,
    badge: "CHEF'S CHOICE",
    desc: "Pão australiano artesanal, hambúrguer alto de 200g grelhado no fogo, cascata de bacon, anéis de cebola dourados e molho especial.",
    imagem: "https://lh3.googleusercontent.com/aida/AEtjO1W8RGwNsOSs221LShc_Qs-Au412nTDPECq5rdpGDnRHpGKSYJUudNGOA_wgz9GnZCEcI5Qa1Y3A9JdcxL-JKJeE84QGkhdFkCIK9HkJGEGo6LjTMC3fLglDVxdsIXjg0qVquV9TCfN2dtSi-gObJKbVQYz6k0leHdQK6wOlyXBcvuM4hJicqSxV5vDZUDHaHZltD7ZAHTgMNfVjPKbljlkH343oT32dZYGokgQwCkbHXwOY9xzns6oh4yE"
  },
  {
    id: "batata",
    nome: "Batata Rústica Suprema",
    preco: 18.00,
    badge: "PORÇÃO COMPARTILHÁVEL",
    desc: "Batata frita rústica crocante servida com banho de queijo cheddar cremoso e farofa de bacon crocante ralado na hora.",
    imagem: "https://lh3.googleusercontent.com/aida/AEtjO1Xvk2nUdrKJ3Sl8bcwk3_rwTwkmfDOzUtRMYligYh0fdJo9DvKHWHeek0bQUZ-43bL5cnNmP8k7pMvNgqQQn-wRr7lJc6eJWv2WdKXBiKbUB5FPy-lvMGbNFi9VBwf7I-JHWV46JYU10PMnyISGEMk24Ufn9FZJZvO6uNtVysej6yAHfsIQLnZ-X5wGkjoWMEJ0kJ-JTlJzNvR_HttLX_pjmwDv-AdcULUNmSTdrfe10RO2Ve-rYq0UvI0"
  }
];

// 3. Sistema de Som (Web Audio API Synthesizer - Som de Notificação da Cozinha)
function tocarSinoCozinha() {
  if (!somHabilitado) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Toca dois tons harmônicos de sino de restaurante
    const tocarNota = (freq, delay, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + dur);
    };

    tocarNota(880, 0, 0.4);      // Lá (A5)
    tocarNota(1318.51, 0.12, 0.6); // Mi (E6)
  } catch (e) {
    console.warn("Áudio não reproduzido devido a restrição do navegador:", e);
  }
}

// 4. Roteamento e Troca de Telas (Cliente vs Cozinha)
export function navegarPara(view) {
  const secaoCliente = document.getElementById("secaoCliente");
  const secaoCozinha = document.getElementById("secaoCozinha");
  
  const btnClienteNav = document.getElementById("btn-visao-cliente");
  const btnCozinhaNav = document.getElementById("btn-visao-cozinha");
  const btnHeroCliente = document.getElementById("btn-hero-cliente");
  const btnHeroCozinha = document.getElementById("btn-hero-cozinha");

  if (view === "cozinha") {
    secaoCliente.classList.remove("active");
    secaoCozinha.classList.add("active");
    window.location.hash = "cozinha";

    // Atualiza classes ativas de navegação
    [btnClienteNav, btnHeroCliente].forEach(b => b && b.classList.remove("active-nav", "bg-surface-card", "text-primary", "font-bold", "shadow-sm"));
    [btnCozinhaNav, btnHeroCozinha].forEach(b => b && b.classList.add("active-nav", "bg-surface-card", "text-primary", "font-bold", "shadow-sm"));
  } else {
    secaoCozinha.classList.remove("active");
    secaoCliente.classList.add("active");
    window.location.hash = "cardapio";

    [btnCozinhaNav, btnHeroCozinha].forEach(b => b && b.classList.remove("active-nav", "bg-surface-card", "text-primary", "font-bold", "shadow-sm"));
    [btnClienteNav, btnHeroCliente].forEach(b => b && b.classList.add("active-nav", "bg-surface-card", "text-primary", "font-bold", "shadow-sm"));
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. Gestão do Carrinho de Compras
function carregarCarrinhoLocal() {
  try {
    const salvo = localStorage.getItem("burguersync_carrinho");
    if (salvo) return JSON.parse(salvo);
  } catch (e) {
    console.warn("Erro ao ler carrinho do cache:", e);
  }
  return [
    { nome: "Ourinhos Smash Burguer", preco: 28.00, qtd: 1, obs: "Sem cebola, bem passado" },
    { nome: "Batata Rústica Suprema", preco: 18.00, qtd: 1, obs: "Cheddar caprichado" }
  ];
}

function salvarCarrinhoLocal() {
  try {
    localStorage.setItem("burguersync_carrinho", JSON.stringify(carrinho));
  } catch (e) {
    console.warn("Erro ao salvar carrinho no cache:", e);
  }
}

export function adicionarAoCarrinho(nome, preco) {
  const item = carrinho.find(i => i.nome === nome);
  if (item) {
    item.qtd += 1;
  } else {
    carrinho.push({ nome, preco, qtd: 1, obs: "" });
  }
  salvarCarrinhoLocal();
  renderizarCarrinho();

  // Feedback visual com flash neon no carrinho
  const asideCarrinho = document.getElementById("carrinho");
  if (asideCarrinho) {
    asideCarrinho.classList.add("ring-2", "ring-primary");
    setTimeout(() => asideCarrinho.classList.remove("ring-2", "ring-primary"), 350);
  }
}

export function alterarQuantidade(nome, delta) {
  const item = carrinho.find(i => i.nome === nome);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) {
    removerItem(nome);
  } else {
    salvarCarrinhoLocal();
    renderizarCarrinho();
  }
}

export function removerItem(nome) {
  carrinho = carrinho.filter(i => i.nome !== nome);
  salvarCarrinhoLocal();
  renderizarCarrinho();
}

export function atualizarObsItem(nome, obs) {
  const item = carrinho.find(i => i.nome === nome);
  if (item) {
    item.obs = obs;
    salvarCarrinhoLocal();
  }
}

export function renderizarCarrinho() {
  const lista = document.getElementById("listaItensCarrinho");
  const contadorTopo = document.getElementById("contadorItensTopo");
  const contadorAside = document.getElementById("contadorItensAside");
  const subtotalEl = document.getElementById("valorSubtotal");
  const totalEl = document.getElementById("valorTotalGeral");
  const labelFinalizar = document.getElementById("labelFinalizar");
  const btnFinalizar = document.getElementById("btnFinalizarPedido");

  if (!lista) return;

  let totalQtd = 0;
  let subtotal = 0;

  lista.innerHTML = "";

  if (carrinho.length === 0) {
    lista.innerHTML = `
      <li class="py-8 text-center text-text-secondary flex flex-col items-center justify-center gap-2">
        <span class="material-symbols-outlined text-4xl text-surface-variant">remove_shopping_cart</span>
        <span class="text-sm">Seu carrinho está vazio.</span>
        <span class="text-xs text-text-secondary/70">Adicione itens saborosos do cardápio!</span>
      </li>
    `;
    if (btnFinalizar) btnFinalizar.disabled = true;
  } else {
    if (btnFinalizar) btnFinalizar.disabled = false;
    carrinho.forEach(item => {
      totalQtd += item.qtd;
      const itemSubtotal = item.preco * item.qtd;
      subtotal += itemSubtotal;

      const li = document.createElement("li");
      li.className = "cart-item bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs";
      li.innerHTML = `
        <div class="flex items-center justify-between gap-space-sm">
          <span class="font-body-md text-text-primary font-semibold truncate">${item.nome}</span>
          <span class="item-subtotal font-price-highlight text-primary-container shrink-0">R$ ${itemSubtotal.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="flex items-center justify-between gap-space-sm mt-1">
          <div class="flex items-center bg-surface-card rounded-lg p-0.5 gap-space-xs">
            <button type="button" class="btn-qty-menos w-7 h-7 flex items-center justify-center rounded bg-surface-card-hover text-text-primary hover:text-primary transition-all font-bold" data-item="${item.nome}">-</button>
            <span class="item-qty w-6 text-center text-[13px] text-text-primary font-bold">${item.qtd}</span>
            <button type="button" class="btn-qty-mais w-7 h-7 flex items-center justify-center rounded bg-surface-card-hover text-text-primary hover:text-primary transition-all font-bold" data-item="${item.nome}">+</button>
          </div>
          <button type="button" class="btn-remover-item text-error hover:text-error-container text-xs flex items-center gap-0.5 transition-colors" data-item="${item.nome}">
            <span class="material-symbols-outlined text-[16px]">delete</span>
            <span>Remover</span>
          </button>
        </div>
        <input type="text" class="input-obs-item mt-1 w-full bg-bg-main text-text-primary text-xs px-space-sm py-1.5 rounded-lg placeholder-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary-container" placeholder="Ex: Sem cebola, ponto..." value="${item.obs || ''}" data-item="${item.nome}">
      `;
      lista.appendChild(li);
    });
  }

  const totalGeral = subtotal > 0 ? subtotal + TAXA_ENTREGA : 0;

  if (contadorTopo) contadorTopo.textContent = totalQtd;
  if (contadorAside) contadorAside.textContent = totalQtd;
  if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  if (totalEl) totalEl.textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
  if (labelFinalizar) labelFinalizar.textContent = `Finalizar Pedido • R$ ${totalGeral.toFixed(2).replace('.', ',')}`;

  // Liga eventos dos botões recém renderizados
  lista.querySelectorAll(".btn-qty-menos").forEach(b => {
    b.onclick = () => alterarQuantidade(b.dataset.item, -1);
  });
  lista.querySelectorAll(".btn-qty-mais").forEach(b => {
    b.onclick = () => alterarQuantidade(b.dataset.item, 1);
  });
  lista.querySelectorAll(".btn-remover-item").forEach(b => {
    b.onclick = () => removerItem(b.dataset.item);
  });
  lista.querySelectorAll(".input-obs-item").forEach(inp => {
    inp.onchange = (e) => atualizarObsItem(inp.dataset.item, e.target.value);
  });
}

// 6. Seleção de Método de Pagamento
let metodoPagamentoAtual = "Pix";
export function selecionarPagamento(metodo) {
  metodoPagamentoAtual = metodo === "pix" ? "Pix" : (metodo === "cartao" ? "Cartao_Entrega" : "Dinheiro_Entrega");
  
  const tabPix = document.getElementById("tabPix");
  const tabCartao = document.getElementById("tabCartao");
  const tabDinheiro = document.getElementById("tabDinheiro");

  const containerPix = document.getElementById("containerPix");
  const containerCartao = document.getElementById("containerCartao");
  const containerDinheiro = document.getElementById("containerDinheiro");

  [tabPix, tabCartao, tabDinheiro].forEach(t => {
    if (t) {
      t.classList.remove("bg-surface-card", "text-primary", "shadow-sm", "active");
      t.classList.add("text-text-secondary");
    }
  });

  if (containerPix) containerPix.classList.add("hidden");
  if (containerCartao) containerCartao.classList.add("hidden");
  if (containerDinheiro) containerDinheiro.classList.add("hidden");

  if (metodo === "pix") {
    tabPix.classList.add("bg-surface-card", "text-primary", "shadow-sm", "active");
    tabPix.classList.remove("text-text-secondary");
    containerPix.classList.remove("hidden");
  } else if (metodo === "cartao") {
    tabCartao.classList.add("bg-surface-card", "text-primary", "shadow-sm", "active");
    tabCartao.classList.remove("text-text-secondary");
    containerCartao.classList.remove("hidden");
  } else if (metodo === "dinheiro") {
    tabDinheiro.classList.add("bg-surface-card", "text-primary", "shadow-sm", "active");
    tabDinheiro.classList.remove("text-text-secondary");
    containerDinheiro.classList.remove("hidden");
  }
}

export function copiarPix() {
  navigator.clipboard.writeText("burguersync.ourinhos@pix.com.br");
  mostrarToast("Chave Pix copiada!", "Código PIX copiado para a área de transferência.");
}

// 7. Envio do Pedido ao Firebase Firestore (Visão Cliente)
export async function submeterPedido(e) {
  if (e) e.preventDefault();

  if (carrinho.length === 0) {
    alert("Adicione pelo menos 1 item ao carrinho antes de finalizar!");
    return;
  }

  const nome = document.getElementById("nomeCliente")?.value?.trim();
  const email = document.getElementById("emailCliente")?.value?.trim();
  const celular = document.getElementById("whatsappCliente")?.value?.trim();
  const endereco = document.getElementById("enderecoEntrega")?.value?.trim();
  const obsEntrega = document.getElementById("obsEntrega")?.value?.trim() || "";
  const troco = document.getElementById("inputTroco")?.value?.trim() || "";

  if (!nome || !celular || !endereco) {
    alert("Por favor, preencha todos os campos obrigatórios (Nome, Celular e Endereço).");
    return;
  }

  const subtotal = carrinho.reduce((acc, cur) => acc + (cur.preco * cur.qtd), 0);
  const total = subtotal + TAXA_ENTREGA;
  const numPedido = Math.floor(1000 + Math.random() * 9000);

  // Compila observações da cozinha
  const obsItensText = carrinho.filter(i => i.obs).map(i => `${i.nome}: ${i.obs}`).join(" | ");
  const obsCozinha = obsItensText || (obsEntrega ? `Entrega: ${obsEntrega}` : "Sem observações adicionais");

  const novoPedido = {
    numeroPedido: numPedido,
    cliente: {
      nome,
      email: email || "",
      celular,
      endereco,
      obsEntrega
    },
    itens: carrinho.map(i => ({
      nome: i.nome,
      preco: i.preco,
      quantidade: i.qtd,
      obsItem: i.obs || ""
    })),
    pagamento: {
      metodo: metodoPagamentoAtual,
      troco: metodoPagamentoAtual === "Dinheiro_Entrega" ? troco : ""
    },
    valores: {
      subtotal,
      taxaEntrega: TAXA_ENTREGA,
      total
    },
    status: "Recebido",
    obsCozinha,
    criadoEm: new Date().toISOString(),
    horario: serverTimestamp()
  };

  const btnFinalizar = document.getElementById("btnFinalizarPedido");
  if (btnFinalizar) {
    btnFinalizar.disabled = true;
    btnFinalizar.innerHTML = `<span class="material-symbols-outlined animate-spin text-[20px]">sync</span> Processando...`;
  }

  try {
    const docRef = await addDoc(pedidosCol, novoPedido);
    console.log("✅ Pedido gravado no Firestore com ID:", docRef.id);

    // Resiliência / Self-Annealing: Limpa o carrinho somente após confirmação do Firestore
    carrinho = [];
    salvarCarrinhoLocal();
    renderizarCarrinho();

    // Mensagem de sucesso
    let msgExtra = "";
    if (metodoPagamentoAtual === "Pix") {
      msgExtra = "Chave Pix: burguersync.ourinhos@pix.com.br. Pedido encaminhado à cozinha.";
    } else if (metodoPagamentoAtual === "Cartao_Entrega") {
      msgExtra = "O motoboy levará a maquininha para o pagamento no ato da entrega.";
    } else {
      msgExtra = troco ? `Pagamento em dinheiro com troco para ${troco}.` : "Pagamento em dinheiro na entrega.";
    }

    mostrarToast(`Pedido #${numPedido} Enviado com Sucesso!`, msgExtra);
    tocarSinoCozinha();

  } catch (err) {
    console.error("❌ Erro ao enviar pedido ao Firestore:", err);
    alert("Ocorreu uma instabilidade na conexão com o banco. Seus dados continuam salvos no formulário e no carrinho. Tente novamente em instantes!");
  } finally {
    if (btnFinalizar) {
      btnFinalizar.disabled = false;
      btnFinalizar.innerHTML = `
        <span class="material-symbols-outlined text-[20px]">check_circle</span>
        <span id="labelFinalizar">Finalizar Pedido • R$ ${total.toFixed(2).replace('.', ',')}</span>
      `;
    }
  }
}

// 8. Escutador em Tempo Real do Firestore (Visão Cozinha)
let primeiroCarregamento = true;
export function iniciarEscutadorCozinha() {
  if (!db || !pedidosCol) return;

  const q = query(pedidosCol, orderBy("criadoEm", "desc"));

  onSnapshot(q, (snapshot) => {
    const pedidos = [];
    snapshot.forEach(docSnap => {
      pedidos.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Se novos pedidos chegaram após o carregamento inicial, toca o sino da cozinha
    if (!primeiroCarregamento && pedidos.length > pedidosRemotos.length) {
      tocarSinoCozinha();
      mostrarToast("Novo Pedido Recebido!", "A grelha foi notificada em tempo real.");
    }
    primeiroCarregamento = false;

    pedidosRemotos = pedidos;
    renderizarKanbanCozinha();
  }, (err) => {
    console.error("❌ Erro no escutador em tempo real da cozinha:", err);
  });
}

// 9. Renderização do Painel Kanban da Cozinha
export function renderizarKanbanCozinha() {
  const colRecebido = document.getElementById("listaPedidos-recebido");
  const colPreparo = document.getElementById("listaPedidos-preparo");
  const colEntrega = document.getElementById("listaPedidos-entrega");
  const colEntregue = document.getElementById("listaPedidos-entregue");

  if (!colRecebido || !colPreparo || !colEntrega || !colEntregue) return;

  colRecebido.innerHTML = "";
  colPreparo.innerHTML = "";
  colEntrega.innerHTML = "";
  colEntregue.innerHTML = "";

  const contadores = {
    recebido: 0,
    preparo: 0,
    entrega: 0,
    entregue: 0
  };

  // Filtragem (todos, prioridade, delivery)
  const filtrados = pedidosRemotos.filter(pedido => {
    if (filtroAtivo === "prioridade") {
      return Boolean(pedido.obsCozinha && pedido.obsCozinha !== "Sem observações adicionais");
    }
    if (filtroAtivo === "delivery") {
      return Boolean(pedido.cliente && pedido.cliente.endereco);
    }
    return true;
  });

  filtrados.forEach(pedido => {
    const statusNormalizado = normalizarStatus(pedido.status);
    if (contadores[statusNormalizado] !== undefined) {
      contadores[statusNormalizado]++;
    }

    const card = criarCardPedidoElement(pedido);

    if (statusNormalizado === "recebido") colRecebido.appendChild(card);
    else if (statusNormalizado === "preparo") colPreparo.appendChild(card);
    else if (statusNormalizado === "entrega") colEntrega.appendChild(card);
    else if (statusNormalizado === "entregue") colEntregue.appendChild(card);
  });

  // Atualiza contadores numéricos
  document.getElementById("count-recebido").textContent = `(${contadores.recebido})`;
  document.getElementById("count-preparo").textContent = `(${contadores.preparo})`;
  document.getElementById("count-entrega").textContent = `(${contadores.entrega})`;
  document.getElementById("count-entregue").textContent = `(${contadores.entregue})`;

  const totalAtivos = contadores.recebido + contadores.preparo + contadores.entrega;
  const kpiEl = document.getElementById("kpiTotalAtivos");
  if (kpiEl) kpiEl.textContent = `${totalAtivos} ${totalAtivos === 1 ? 'pedido' : 'pedidos'}`;
}

function normalizarStatus(status) {
  if (!status) return "recebido";
  const s = status.toLowerCase();
  if (s.includes("recebido")) return "recebido";
  if (s.includes("preparo")) return "preparo";
  if (s.includes("entrega")) return "entrega";
  if (s.includes("entregue")) return "entregue";
  return "recebido";
}

function formatarTempoDecorrido(isoString) {
  if (!isoString) return "Agora";
  const diffMin = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diffMin <= 1) return "Agora";
  if (diffMin < 60) return `Há ${diffMin} min`;
  const diffHoras = Math.floor(diffMin / 60);
  return `Há ${diffHoras}h`;
}

function criarCardPedidoElement(pedido) {
  const article = document.createElement("article");
  article.className = "card-pedido bg-surface-card rounded-xl p-space-md flex flex-col gap-space-sm shadow-md transition-all hover:bg-surface-card-hover relative";
  article.dataset.pedidoId = pedido.id;
  article.dataset.status = pedido.status;

  const num = pedido.numeroPedido ? `#${pedido.numeroPedido}` : `#${pedido.id.substring(0, 5)}`;
  const clienteNome = pedido.cliente?.nome || "Cliente";
  const clienteTel = pedido.cliente?.celular || "(14) 99999-9999";
  const endereco = pedido.cliente?.endereco || "Balcão";
  const tempo = formatarTempoDecorrido(pedido.criadoEm);
  const total = pedido.valores?.total ? `R$ ${Number(pedido.valores.total).toFixed(2).replace('.', ',')}` : "R$ 0,00";
  const metodoPag = pedido.pagamento?.metodo === "Pix" ? "PIX" : (pedido.pagamento?.metodo === "Cartao_Entrega" ? "Cartão" : "Dinheiro");

  // Itens HTML
  const itensHtml = (pedido.itens || []).map(i => `
    <div class="flex justify-between items-center text-text-primary font-medium text-xs">
      <span>${i.quantidade}x ${i.nome}</span>
      <span class="text-text-secondary font-normal">R$ ${(i.preco * i.quantidade).toFixed(2).replace('.', ',')}</span>
    </div>
  `).join("");

  // Observações da cozinha
  const temObs = pedido.obsCozinha && pedido.obsCozinha !== "Sem observações adicionais";
  const obsHtml = temObs ? `
    <div class="obs-cozinha-box">
      <span class="material-symbols-outlined text-kitchen-alert text-[18px] shrink-0 mt-0.5">warning</span>
      <span><strong>OBS:</strong> "${pedido.obsCozinha}"</span>
    </div>
  ` : "";

  // Botões de Ação por Status
  let controlesHtml = "";
  const sNorm = normalizarStatus(pedido.status);

  if (sNorm === "recebido") {
    controlesHtml = `
      <div class="controles-status flex items-center gap-space-xs mt-space-xs pt-space-xs">
        <button class="btn-mudar-status flex-1 flex items-center justify-center gap-space-xs bg-primary text-on-primary py-space-sm px-space-md rounded-lg font-bold text-xs uppercase shadow-[0_0_10px_rgba(255,144,0,0.45)] hover:brightness-110 transition-all" data-id="${pedido.id}" data-proximo="Em Preparo" type="button">
          <span class="material-symbols-outlined text-[18px]">local_fire_department</span>
          Iniciar Preparo 🔥
        </button>
      </div>
    `;
  } else if (sNorm === "preparo") {
    controlesHtml = `
      <div class="controles-status flex items-center gap-space-xs mt-space-xs pt-space-xs">
        <button class="btn-mudar-status flex-1 flex items-center justify-center gap-space-xs bg-status-delivery text-white py-space-sm px-space-sm rounded-lg font-bold text-xs uppercase shadow-[0_0_10px_rgba(59,130,246,0.45)] hover:opacity-90 transition-all" data-id="${pedido.id}" data-proximo="Saiu para Entrega" type="button">
          <span class="material-symbols-outlined text-[18px]">two_wheeler</span>
          Saiu para Entrega 🛵
        </button>
        <button class="btn-imprimir bg-surface-container hover:bg-surface-card-hover text-text-primary p-space-sm rounded-lg transition-all" title="Imprimir Comanda" type="button">
          <span class="material-symbols-outlined text-[20px]">print</span>
        </button>
      </div>
    `;
  } else if (sNorm === "entrega") {
    controlesHtml = `
      <div class="controles-status flex items-center gap-space-xs mt-space-xs pt-space-xs">
        <button class="btn-mudar-status flex-1 flex items-center justify-center gap-space-xs bg-status-done text-on-secondary py-space-sm px-space-md rounded-lg font-bold text-xs uppercase shadow-[0_0_12px_rgba(4,211,97,0.45)] hover:brightness-110 transition-all" data-id="${pedido.id}" data-proximo="Entregue" type="button">
          <span class="material-symbols-outlined text-[18px]">check_circle</span>
          Confirmar Entrega ✅
        </button>
      </div>
    `;
  } else {
    controlesHtml = `
      <div class="flex items-center justify-between text-xs text-text-secondary pt-1">
        <span class="flex items-center gap-1 text-status-done font-medium">
          <span class="material-symbols-outlined text-[16px]">verified</span>
          Entregue com Sucesso
        </span>
        <button class="btn-reabrir text-text-secondary hover:text-text-primary p-1 rounded" data-id="${pedido.id}" title="Reabrir Comanda" type="button">
          <span class="material-symbols-outlined text-[16px]">restart_alt</span>
        </button>
      </div>
    `;
  }

  article.innerHTML = `
    <div class="flex items-start justify-between gap-space-xs">
      <div class="flex flex-col">
        <span class="font-bold text-primary text-base">${num}</span>
        <span class="text-text-primary font-semibold text-sm">${clienteNome}</span>
        <span class="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
          <span class="material-symbols-outlined text-[14px] text-secondary">chat</span>
          ${clienteTel}
        </span>
      </div>
      <div class="flex flex-col items-end gap-1">
        <span class="badge-status text-[10px] px-2 py-0.5 rounded bg-surface-container text-text-secondary">
          ${tempo}
        </span>
        <span class="text-xs text-secondary font-semibold">${metodoPag} • ${total}</span>
      </div>
    </div>
    
    <div class="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col gap-1 text-text-secondary text-xs">
      <div class="flex items-center gap-1 text-text-primary font-medium truncate">
        <span class="material-symbols-outlined text-[16px] text-status-delivery">location_on</span>
        <span class="truncate">${endereco}</span>
      </div>
      <div class="mt-1 flex flex-col gap-0.5">
        ${itensHtml}
      </div>
    </div>

    ${obsHtml}
    ${controlesHtml}
  `;

  // Listener para avançar status
  article.querySelectorAll(".btn-mudar-status").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const novoStatus = btn.dataset.proximo;
      await atualizarStatusPedido(id, novoStatus);
    };
  });

  // Listener para reabrir pedido
  const btnReabrir = article.querySelector(".btn-reabrir");
  if (btnReabrir) {
    btnReabrir.onclick = async () => {
      await atualizarStatusPedido(btnReabrir.dataset.id, "Recebido");
    };
  }

  // Listener de impressão simulada
  const btnPrint = article.querySelector(".btn-imprimir");
  if (btnPrint) {
    btnPrint.onclick = () => {
      btnPrint.classList.add("text-status-done");
      mostrarToast("Comanda Enviada para Impressão", `Imprimindo comanda do pedido ${num}`);
      setTimeout(() => btnPrint.classList.remove("text-status-done"), 1200);
    };
  }

  return article;
}

// 10. Atualização de Status no Firestore (updateDoc)
export async function atualizarStatusPedido(docId, novoStatus) {
  try {
    const docRef = doc(db, "pedidos", docId);
    await updateDoc(docRef, {
      status: novoStatus,
      atualizadoEm: new Date().toISOString()
    });
    console.log(`[STATUS ATUALIZADO] Pedido ${docId} -> ${novoStatus}`);
    tocarSinoCozinha();
  } catch (err) {
    console.error(`❌ Erro ao atualizar status do pedido ${docId}:`, err);
    alert("Falha ao sincronizar alteração de status com o Firebase. Verifique sua conexão.");
  }
}

// 11. Toast Notifications & Helpers
export function mostrarToast(titulo, mensagem) {
  const toast = document.getElementById("toastSuccess");
  const tituloEl = document.getElementById("toastTitulo");
  const msgEl = document.getElementById("toastMensagem");

  if (!toast) return;

  if (tituloEl) tituloEl.textContent = titulo;
  if (msgEl) msgEl.textContent = mensagem;

  toast.classList.remove("translate-y-32", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    fecharToast();
  }, 5000);
}

export function fecharToast() {
  const toast = document.getElementById("toastSuccess");
  if (!toast) return;
  toast.classList.add("translate-y-32", "opacity-0");
  toast.classList.remove("translate-y-0", "opacity-100");
}

// 12. Inicialização Global do App
document.addEventListener("DOMContentLoaded", () => {
  // Configura relógio digital
  const relogioEl = document.getElementById("relogioDigital");
  function atualizarRelogio() {
    if (!relogioEl) return;
    const d = new Date();
    relogioEl.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }
  setInterval(atualizarRelogio, 1000);
  atualizarRelogio();

  // Roteamento por hash
  if (window.location.hash === "#cozinha") {
    navegarPara("cozinha");
  } else {
    navegarPara("cliente");
  }

  // Binds de navegação
  document.querySelectorAll("[data-navigate]").forEach(el => {
    el.onclick = (e) => {
      e.preventDefault();
      navegarPara(el.dataset.navigate);
    };
  });

  // Alerta sonoro toggle
  const btnSom = document.getElementById("btnAlertaSonoro");
  if (btnSom) {
    btnSom.onclick = () => {
      somHabilitado = !somHabilitado;
      const icon = document.getElementById("soundIcon");
      if (icon) {
        icon.textContent = somHabilitado ? "notifications_active" : "notifications_off";
        icon.className = `material-symbols-outlined text-[20px] ${somHabilitado ? "text-status-prep" : "text-text-secondary"}`;
      }
    };
  }

  // Filtros Kanban
  document.querySelectorAll(".filtro-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".filtro-btn").forEach(b => {
        b.classList.remove("bg-primary-container", "text-on-primary-container");
        b.classList.add("bg-surface-container-lowest", "text-text-secondary");
      });
      btn.classList.add("bg-primary-container", "text-on-primary-container");
      btn.classList.remove("bg-surface-container-lowest", "text-text-secondary");

      filtroAtivo = btn.dataset.filtro;
      renderizarKanbanCozinha();
    };
  });

  // Binds de pagamento
  window.selecionarPagamento = selecionarPagamento;
  window.copiarPix = copiarPix;
  window.submeterPedido = submeterPedido;
  window.fecharToast = fecharToast;
  window.adicionarAoCarrinho = adicionarAoCarrinho;

  // Renderiza vitrine e carrinho inicial
  renderizarCarrinho();

  // Inicia sincronização em tempo real com Firebase
  iniciarEscutadorCozinha();
});
