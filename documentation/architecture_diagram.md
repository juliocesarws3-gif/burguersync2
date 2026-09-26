# 🏛️ Arquitetura do Sistema: BurguerSync Ourinhos

Documento técnico descritivo da arquitetura em 3 Camadas do sistema BurguerSync Ourinhos, detalhando fluxos de dados, componentes e integração com Firebase Cloud Firestore e Google Stitch.

---

## 1. Visão Geral das Camadas

```mermaid
graph TD
    subgraph "Camada 1: Diretivas (Estratégia & Regras de Negócio)"
        D1["directives/projeto.md (SOP Mestre)"]
        D2["directives/design/design.md (Design System)"]
        D3["Google Stitch Design Theme & Assets"]
    end

    subgraph "Camada 2: Orquestração (Google Antigravity / Gemini)"
        O1["Antigravity IDE Agent"]
        O2["Sincronização de Tokens e Layout"]
        O3["Automação e Self-Annealing"]
    end

    subgraph "Camada 3: Execução Determinística"
        E1["frontend/ (SPA HTML5 + Tailwind + CSS3)"]
        E2["frontend/app.js (Firebase Web SDK v10)"]
        E3["backend/firebase-config.js"]
        E4["execution/seed_firestore.js"]
        E5["execution/deploy_github.js"]
    end

    subgraph "Serviços em Nuvem"
        FB[("Firebase Cloud Firestore\n(NoSQL Realtime)")]
        GH["GitHub Repository\n(burguersync2)"]
        GP["GitHub Pages\n(Deploy Web)"]
    end

    D1 --> O1
    D2 --> O2
    D3 --> O2
    O1 --> E1
    O2 --> E2
    O3 --> E4
    O3 --> E5

    E2 <-->|"addDoc / onSnapshot"| FB
    E4 -->|"POST / Seed"| FB
    E5 -->|"REST API / Git Push"| GH
    GH -->|"Auto Deploy"| GP
```

---

## 2. Fluxo Bidirecional de Pedidos em Tempo Real

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 👤 Cliente (Web/Mobile)
    participant UI as 🖥️ Frontend (Cardápio & Carrinho)
    participant DB as 🔥 Firebase Firestore
    participant Cozinha as 👨‍🍳 Visão Cozinha (Kanban)
    actor Operador as 🍔 Cozinheiro / Expedição

    Cliente->>UI: Seleciona Lanches & Adiciona ao Carrinho
    Cliente->>UI: Preenche dados de entrega & Escolhe Pix/Cartão
    Cliente->>UI: Clica em "Finalizar Pedido"
    UI->>DB: addDoc("pedidos", payload)
    Note over UI,DB: Validação estrita e persistência no Firestore
    DB-->>UI: Confirmação com ID do Pedido
    UI->>Cliente: Exibe Toast de Sucesso & Chave Pix
    
    DB-->>Cozinha: Evento Realtime via onSnapshot
    Cozinha->>Cozinha: Toca alerta sonoro (Chime)
    Cozinha->>Operador: Novo Cartão surge na Coluna "Recebido"

    Operador->>Cozinha: Clica em "Iniciar Preparo"
    Cozinha->>DB: updateDoc(docRef, { status: "Em Preparo" })
    DB-->>Cozinha: Atualiza Kanban instantaneamente

    Operador->>Cozinha: Clica em "Saiu para Entrega"
    Cozinha->>DB: updateDoc(docRef, { status: "Saiu para Entrega" })

    Operador->>Cozinha: Clica em "Confirmar Entrega"
    Cozinha->>DB: updateDoc(docRef, { status: "Entregue" })
```

---

## 3. Esquema de Dados (Firestore NoSQL)

Coleção: `pedidos`

```json
{
  "numeroPedido": 1043,
  "cliente": {
    "nome": "Mariana Santos",
    "email": "mariana.santos@email.com",
    "celular": "(14) 99123-8899",
    "endereco": "Rua São Paulo, 720 - Vila Brasil, Ourinhos - SP",
    "obsEntrega": "Interfone 12"
  },
  "itens": [
    {
      "nome": "Monster Bacon SENAI",
      "preco": 34.00,
      "quantidade": 2,
      "obsItem": "Ponto da carne ao ponto para mal passado"
    }
  ],
  "pagamento": {
    "metodo": "Pix",
    "troco": ""
  },
  "valores": {
    "subtotal": 68.00,
    "taxaEntrega": 5.00,
    "total": 73.00
  },
  "status": "Recebido",
  "obsCozinha": "Ponto da carne ao ponto para mal passado. Molho extra se possível.",
  "criadoEm": "2026-09-26T14:50:00.000Z",
  "horario": "serverTimestamp()"
}
```
