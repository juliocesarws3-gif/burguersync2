# Rascunho Inicial de UI/UX: BurguerSync Ourinhos (iFood Style)

## 1. Conceito & Identidade Visual
Criar uma aplicação web moderna, fluida e responsiva (Mobile-First / estilo iFood) em Dark Mode.
- **Paleta:** Fundo escuro (#121214), cards cinza (#202024), destaques e botões em laranja/amarelo neon (#FF9000) e verde para confirmações (#04D361).
- **Navegação Inicial:** Tela principal limpa exibindo 2 cartões de seleção destacados:
  1. 🛍️ **Visão do Cliente (Fazer Pedido)**
  2. 👨‍🍳 **Visão da Cozinha (Painel em Tempo Real)**

---

## 2. Visão do Cliente (Experiência de Compra iFood)
### A. Vitrine de Lanches (Cards de Alto Apelo Visual)
- **Grid de Lanches:** Foto do hambúrguer, Nome, Descrição apetitosa, Preço em destaque (ex: R\$ 28,00) e botão "+ Adicionar ao Carrinho".
- **Lanches Iniciais:**
  1. *Ourinhos Smash Burguer* (Pão brioche, 2x smash 80g, queijo cheddar, bacon artesanal) - R\$ 28,00
  2. *Monster Bacon SENAI* (Pão australiano, 200g carne, muito bacon, onion rings, molho especial) - R\$ 34,00
  3. *Batata Rústica Suprema* (Batata frita crocante com cheddar e bacon ralado) - R\$ 18,00

### B. Carrinho de Compras Interativo
- Contador visual de itens na barra superior ou flutuante no rodapé.
- Lista dos itens adicionados com seletores de **quantidade (+/-)** e remoção.
- Campo de **Observação por Item** (ex: *"Sem cebola, cheddar bem derretido"*).
- Resumo financeiro: Subtotal, Taxa de entrega (fixa R\$ 5,00) e Total Geral.

### C. Cadastro de Entrega & Pagamento
- **Dados do Cliente:** Nome completo, E-mail, Celular/WhatsApp e Endereço de entrega (Rua, Número, Bairro, Ponto de referência).
- **Observação da Entrega:** Campo para instruções de entrega (ex: *"Deixar na portaria ou interfone 22"*).
- **Opções de Pagamento (Seleção por Radio/Tabs):**
  - **Pagamento na Entrega:** Cartão de Crédito/Débito ou Dinheiro (com campo para informar troco).
  - **Pagamento via Pix:** Exibição imediata de Chave Pix Copia e Cola / QR Code estático para transferência instantânea.
- **Botão Final:** *"Finalizar e Enviar Pedido para a Cozinha"* (Destaque verde vibrante).

---

## 3. Visão da Cozinha (Gerenciamento em Tempo Real)
- **Dashboard Organizado:** Cards em coluna única ou grid de Kanban organizados por horário de chegada.
- **Informações do Pedido:** Nome do cliente, telefone, endereço, lista de itens com quantidades e observações destacadas em amarelo.
- **Controle de Status Interativo:** Botões de ação direta no card do pedido para alternar o status:
  - `[Recebido]` ➔ `[Em Preparo]` ➔ `[Saiu para Entrega]` ➔ `[Entregue]`
- Transição visual imediata e cor de badge atualizada conforme o avanço do pedido.