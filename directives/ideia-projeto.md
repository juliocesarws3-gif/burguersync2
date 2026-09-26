# Especificação do Projeto: BurguerSync Ourinhos (Full-Stack Realtime)

## 1. Visão Geral do Sistema
Aplicação de pedidos e gestão de cozinha em tempo real para a "BurguerSync Ourinhos", utilizando HTML5/CSS3 (gerados via Google Stitch e Gemini), Firebase Cloud Firestore (banco NoSQL) e deploy automatizado no GitHub Pages.

---

## 2. Camada 1: Front-End & Interface de Usuário
- Seguir estritamente o layout e design definido no arquivo `directives/design/design.md`.
- Tela inicial com navegação em abas/seções entre **Visão Cliente** e **Visão Cozinha**.
- Validação obrigatória de campos antes de enviar o pedido (Nome, Celular, Endereço e ao menos 1 item no carrinho).

---

## 3. Camada 2: Estrutura do Banco de Dados (Firebase Firestore)
- Conexão via SDK Web v10 do Firebase (Módulos ES6 via CDN).
- Leitura dinâmica de credenciais a partir do arquivo `.env`.
- **Coleção Principal:** `pedidos`
- **Estrutura dos Documentos Salvos:**
  - `cliente`: { nome, email, celular, endereco, obsEntrega }
  - `itens`: array de objetos [{ nome, preco, quantidade, obsItem }]
  - `pagamento`: { metodo ("Pix" | "Cartao_Entrega" | "Dinheiro_Entrega"), troco }
  - `valores`: { subtotal, taxaEntrega: 5.00, total }
  - `status`: string ("Recebido" | "Em Preparo" | "Saiu para Entrega" | "Entregue")
  - `horario`: serverTimestamp()

---

## 4. Camada 3: Lógica de Negócio e Atualização em Tempo Real (JS)
1. **Envio do Pedido (Visão Cliente):**
   - O clique em "Finalizar Pedido" dispara a gravação no Firestore (`addDoc`).
   - Limpa o carrinho e exibe mensagem amigável com número do pedido e instruções do pagamento escolhido (ex: chave Pix).
2. **Escutador Realtime (Visão Cozinha):**
   - Implementar `onSnapshot` escutando a coleção `pedidos` ordenada por `horario` descendente (`orderBy("horario", "desc")`).
   - A lista da cozinha deve se re-renderizar instantaneamente quando um novo pedido chegar sem precisar atualizar a página (F5).
3. **Atualização de Status (Visão Cozinha):**
   - O clique nos botões de mudança de status dispara o comando `updateDoc` no Firestore, alterando o campo `status` do documento correspondente.