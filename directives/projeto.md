# 📘 SOP Mestre: BurguerSync Ourinhos

**Status:** Planejamento / Inicialização | **Versão:** 2.5.5

## 1. Visão Geral e Objetivo Principal

A BurguerSync é uma aplicação web focada na captação de pedidos e gestão de cozinha em tempo real para o estabelecimento "BurguerSync Ourinhos". O sistema automatiza o fluxo de vendas, resolvendo a comunicação entre o cliente e a cozinha através de uma atualização dinâmica e instantânea.

## 2. Arquitetura do Projeto (Antigravity v2.5.5)

* **Layer 1 (Diretiva, Lógica de Negócio e Estratégia):** Este documento de SOP, o documento modelo de estrutura, e a especificação de UI contida no arquivo `directives/design/design.md`. Concentra e isola todas as regras de negócio para não poluir os scripts de execução.


* **Layer 2 (Orquestração / Gemini IA):** Agente interpretando regras de UX/UI e coordenando o fluxo de dados bidirecional. Todo arquivo intermediário gerado neste estágio (logs de compilação, testes preliminares ou mockups) deve ser armazenado estritamente no diretório `.tmp/`.
* **Layer 3 (Execução & Determinismo):** Código-fonte base determinístico (JS/HTML/CSS), gerenciadores de estado da UI e scripts de integração direta com o Firebase. Os entregáveis finais estabilizados desta camada devem ser direcionados para deploy em nuvem (GitHub Pages).



## 3. Escopo Tecnológico & Requisitos (Tech Stack)

* **Frontend / Interface:** HTML5 e CSS3 puros com base nas diretrizes de design pré-fornecidas.


* **Backend / Persistência de Dados:** Integração com Firebase Cloud Firestore, atuando como banco de dados NoSQL.


* **Comunicação:** SDK Web v10 do Firebase importado utilizando Módulos ES6 via rede CDN.


* **Variáveis de Ambiente:** Leitura dinâmica das chaves de API e credenciais diretamente a partir do arquivo `.env`.


* **Deploy Cloud:** Publicação automatizada na nuvem utilizando o GitHub Pages.



## 4. Diretrizes de UX/UI e Referências Visuais

* **Inspiração Real e Estrutura:** O design deve seguir estritamente o layout estabelecido no documento `directives/design/design.md`.


* **Experiência do Usuário (Navegação):** A tela inicial fornecerá um sistema de roteamento simplificado por abas ou seções distintas, alternando entre a **Visão do Cliente** e a **Visão da Cozinha**.


* **Validação de Interface:** O sistema impedirá o envio de requisições malformadas através de validações obrigatórias antes da submissão do pedido (exigindo Nome, Celular, Endereço e um mínimo de 1 item presente no carrinho).



## 5. Fluxo Operacional de Execução

1. **Kickoff e Estrutura:** Criação da estrutura de pastas, configuração do `.env` e modelagem da interface HTML5 e estilos CSS3.


2. **Modelagem de Dados Layer 2:** Configuração da coleção principal denominada `pedidos` dentro do Firestore. Os documentos seguirão um esquema rígido: `cliente`, `itens` (array), `pagamento` (contendo método e troco), `valores` (incluindo taxa de entrega fixada em 5.00), `status` do preparo, e o `horario` gravado através de `serverTimestamp()`.


3. **Desenvolvimento Visão Cliente (Layer 3):** Implementação do evento no botão "Finalizar Pedido" para inserir o documento (`addDoc`), em seguida aplicar a lógica de limpar o carrinho e expor uma mensagem final amigável contendo o número do pedido e instruções específicas do tipo de pagamento.


4. **Desenvolvimento Visão Cozinha (Layer 3):** Implementação de um escutador em tempo real (`onSnapshot`) filtrando a coleção `pedidos` com a ordenação `orderBy("horario", "desc")`. A renderização da lista da cozinha será acionada automaticamente, sem a necessidade de recarregar a página web (F5).


5. **Controle de Fluxo Interno:** Os botões na interface da cozinha emitirão chamadas da função `updateDoc` ao banco, garantindo que o atributo de status de um pedido seja alterado instantaneamente para todos os observadores.



## 6. Definição de Sucesso (Deliverables)

* **Entregáveis Finais em Nuvem:** Aplicação Full-Stack de tempo real entregue funcionalmente através do GitHub Pages, comunicando-se perfeitamente de modo bidirecional com o Firestore e suportando gestão assíncrona.


* **Arquivos de Suporte e Locais:**
* Repositório isolando arquivos gerados temporariamente na pasta `.tmp/`.
* Configurações sigilosas separadas no `.env`.





## 7. Tratamento de Erros, Resiliência e Self-Annealing

* **Detecção de Falhas (Interrupção de Rede):** O sistema deve prever falhas de latência do Firebase. O código Layer 3 envolverá chamadas assíncronas em blocos `try/catch` para monitoramento.
* **Self-Annealing e Recuperação:** Ao detectar erro de submissão na tela do cliente, a UI não irá expurgar os dados digitados do cache local até a transação ser concretizada no banco. Qualquer erro de payload no Firebase despejará relatórios detalhados em `.tmp/` sem quebrar a UI, alertando o usuário elegantemente em tela para tentar novamente em instantes.
* **Evolução Documental:** Correções frequentes de schema de banco de dados devem ser relatadas neste arquivo SOP em vez de serem fixadas com "gambiarra" no código (mantendo o distanciamento entre as layers 1 e 3).