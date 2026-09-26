# Especificação de UI/UX e Arquitetura Front-End: BurguerSync Ourinhos

Este documento detalha as diretrizes de design, estrutura e estilo para o aplicativo web BurguerSync Ourinhos, focado em criar uma experiência moderna, fluida e responsiva (estilo iFood).

## 1. Identidade Visual e Design System (Dark Mode)

A aplicação utiliza uma abordagem nativa em Dark Mode para reduzir a fadiga visual, destacando as fotografias dos produtos e chamadas para ação com cores vibrantes.

### Paleta de Cores (Hexadecimal)

* **Fundo Principal (Background):** `#121214` (Cinza super escuro, quase preto).


* **Fundo de Elementos (Cards/Modais):** `#202024` (Cinza chumbo para contraste de elevação).


* **Destaques e Interações Primárias (Neon):** `#FF9000` (Laranja/Amarelo neon para botões, ícones e preço).


* **Sucesso e Confirmações:** `#04D361` (Verde vibrante para finalização de pedidos e status positivos).


* **Texto Principal:** `#E1E1E6` (Cinza claro para alta legibilidade).
* **Texto Secundário/Mudo:** `#A8A8B3` (Cinza médio para descrições e placeholders).
* **Alerta/Observações da Cozinha:** `#F6E58D` (Amarelo claro para destacar restrições ou observações dos clientes).



### Tipografia e Hierarquia Visual

* **Fonte Base:** `Inter` ou `Roboto` (Sans-serif modernas, excelente legibilidade em telas pequenas).
* **Títulos (H1, H2):** 24px a 32px, `font-weight: 700` (Bold). Utilizado para saudações e títulos de seções (ex: "Cardápio", "Seu Carrinho").
* **Nomes dos Lanches:** 18px, `font-weight: 600` (Semi-bold).
* **Descrições:** 14px, `font-weight: 400` (Regular), cor secundária `#A8A8B3`.
* **Preços:** 16px a 18px, `font-weight: 700`, cor `#FF9000`.


* **Botões e Badges:** 14px, `font-weight: 600`, texto em maiúsculas (Uppercase) em botões de ação principal.

---

## 2. Estrutura HTML5 Semântica e Seletores Essenciais

A estruturação deve priorizar a semântica para acessibilidade (A11y) e SEO, utilizando marcações corretas (`<main>`, `<section>`, `<article>`, `<aside>`).

### Navegação Inicial

* A tela principal deve exibir 2 cartões de seleção destacados para roteamento:


* `#btn-visao-cliente`: Para a experiência de compra.


* `#btn-visao-cozinha`: Para o painel de gerenciamento em tempo real.





### Visão do Cliente (UX de Compra)

* **Container do Cardápio:** `<section id="vitrineLanches" class="grid-cardapio">`.


* **Cards de Produto:** `<article class="card-lanche">` contendo imagem, `.nome-lanche`, `.desc-lanche`, e `.preco-lanche`.


* **Botão de Adição:** `<button class="btn-add-carrinho">` (+ Adicionar ao Carrinho).




* **Carrinho de Compras:** `<aside id="carrinho" class="carrinho-flutuante">`.


* **Contador:** `<span id="contadorItens" class="badge-contador">` (Na barra superior ou rodapé).


* **Lista de Itens:** `<ul id="listaItensCarrinho">` com botões de quantidade (`.btn-qty-mais`, `.btn-qty-menos`) e remoção.


* **Observação de Item:** `<input type="text" class="input-obs-item">` (ex: "Sem cebola...").


* **Resumo:** `<div id="resumoValores">` (Subtotal, Taxa de entrega fixa de R$ 5,00, Total Geral).




* **Checkout (Cadastro e Pagamento):** `<form id="formCheckout">`.


* **Dados:** Campos para `#nomeCliente`, `#emailCliente`, `#whatsappCliente` e `#enderecoEntrega`.


* **Instruções de Entrega:** `<textarea id="obsEntrega">`.


* **Pagamento:** `<fieldset id="tipoPagamento">` estruturado em Tabs ou Radios.


* Opções para Cartão, Dinheiro (com `#inputTroco`) e Pix (`#containerPix` com QR Code/Copia e Cola).




* **Botão Final:** `<button id="btnFinalizarPedido" class="btn-success">` (Verde vibrante).





### Visão da Cozinha (Dashboard Kanban)

* **Painel Principal:** `<main id="painelCozinha" class="kanban-board">`.


* **Lista de Pedidos:** `<section id="listaPedidos">` organizada por horário de chegada.


* **Cards de Pedido:** `<article class="card-pedido">` contendo os dados do cliente, itens e `#obsCozinha` (destacadas em amarelo).


* **Ações de Status:** `<div class="controles-status">` com botões iterativos para avançar o fluxo.



---

## 3. Diretrizes de CSS3, Estilização e Responsividade

A aplicação deve ser construída sob o paradigma **Mobile-First**, garantindo usabilidade premium em smartphones antes de expandir para tablets e desktops.

### Layout Responsivo (Grid & Flexbox)

* **Mobile-First:** Utilizar `display: flex; flex-direction: column;` para listagens nativas no celular. O carrinho deve ser implementado como um *Bottom Sheet* ou botão flutuante (`position: fixed; bottom: 0;`).
* **Desktop/Tablet:** Utilizar CSS Grid para a `#vitrineLanches` (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));`), permitindo a exibição de múltiplos lanches lado a lado. Na visão da cozinha, aplicar Grid de colunas estilo Kanban para organizar os status.



### Efeitos Visuais e Animações (UI Fluida)

* **Cards de Lanches (`#202024`):** Bordas arredondadas (`border-radius: 12px`), com sombra sutil para profundidade (`box-shadow: 0 4px 6px rgba(0,0,0,0.3)`).
* **Hover States:** Animações suaves (`transition: all 0.2s ease-in-out`) ao passar o mouse ou tocar nos botões de pedido, causando uma leve elevação (`transform: translateY(-2px)`) e intensificação do brilho neon.


* **Botão Finalizar Pedido:** Aplicação de cor `#04D361` (Verde) com efeito pulsante leve para atrair o clique final.


* **Badges de Status (Cozinha):** Badges com brilho neon simulado via `box-shadow` (`0 0 8px [COR]`). A transição visual deve ser imediata ao mudar de status:


* `[Recebido]`: Cinza claro.
* `[Em Preparo]`: Laranja Neon (`#FF9000`).
* `[Saiu para Entrega]`: Azul ou Roxo vibrante.
* `[Entregue]`: Verde de confirmação (`#04D361`).



---

## 4. Arquitetura da Experiência e Dados Estáticos

Para o protótipo inicial e desenvolvimento do layout, os seguintes dados devem ser fixados no HTML/Estado:

Menu de Lanches Inicial:

1. **Ourinhos Smash Burguer:** Pão brioche, 2x smash 80g, queijo cheddar, bacon artesanal (R$ 28,00).
2. **Monster Bacon SENAI:** Pão australiano, 200g carne, muito bacon, onion rings, molho especial (R$ 34,00).
3. **Batata Rústica Suprema:** Batata frita crocante com cheddar e bacon ralado (R$ 18,00).

Fluxo Operacional (Cozinha):
O painel da cozinha deve apresentar feedback visual instantâneo. Quando o operador da cozinha clicar nos botões de ação direta do card, o pedido deve transitar visualmente na seguinte ordem linear:

1. `[Recebido]`
2. `[Em Preparo]`
3. `[Saiu para Entrega]`
4. `[Entregue]`