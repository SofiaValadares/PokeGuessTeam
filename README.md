# PokeGuessTeam

Projeto desenvolvido em **HTML, CSS e JavaScript puro** para simular uma Pokédex interativa onde o jogador monta times Pokémon e disputa uma partida de dedução por turnos.

## Link publicado

- Produção: [https://poke-guess-team.vercel.app/](https://poke-guess-team.vercel.app/)

## Visão geral

O **PokeGuessTeam** é um jogo local de adivinhação de times Pokémon.

Cada partida funciona assim:
- cada lado possui um time com **6 Pokémon**;
- os jogadores tentam descobrir o time adversário por meio de **palpites exatos**;
- o jogo mostra pistas visuais por slot com informações já confirmadas;
- o placar acompanha os acertos de cada lado;
- a partida pode ser jogada em **modo local** ou em **modo contra IA**.

## Modos de jogo

### 1. Partida local
- o jogador principal cria a partida;
- informa o nome do adversário;
- monta o time principal;
- monta o time do convidado;
- inicia a partida com alternância de turnos.

### 2. Partida contra IA
- o jogador principal inicia pela Home usando o botão **Jogar contra IA**;
- monta apenas o próprio time;
- a IA recebe um time gerado automaticamente;
- durante a partida, a IA executa os próprios palpites automaticamente.

## Funcionalidades principais

- cadastro de treinador com sprite e persistência local;
- perfil do jogador com nível e experiência;
- histórico local de partidas;
- montagem de time com:
  - busca;
  - filtro por geração;
  - time aleatório;
  - drag-and-drop para reordenar;
  - remoção individual;
- painel de dedução por slots;
- exibição de tipos, cor, geração, altura e peso já descobertos;
- lista visual de sugestões de chute com **sprite + nome do Pokémon**;
- bloqueio de palpites repetidos conforme o jogador atual;
- no modo contra IA, a lista do jogador também exclui os palpites já feitos pela IA;
- placar com nome, avatar e pontuação de cada lado;
- feedback visual após cada palpite;
- finalização automática da partida com retorno para a Home;
- persistência da partida em `localStorage`.

## Tecnologias usadas

- HTML5
- CSS3
- JavaScript ES Modules
- `localStorage`
- `fetch()` para carregar componentes HTML

## Estrutura do projeto

```text
index.html
main.js
assets/
components/
config/
ds/
enums/
models/
pages/
store/
```

### Pastas principais

- `assets/` — sprites de jogadores e Pokémon
- `components/` — componentes reutilizáveis
- `config/` — dados e regras globais, incluindo a IA
- `models/` — modelos de domínio da aplicação
- `pages/` — telas principais do sistema
- `store/` — persistência e gerenciamento de estado local
- `ds/` — estilos globais e variáveis de design

## Fluxo da aplicação

### Registro
- o usuário cadastra o próprio treinador;
- escolhe um sprite;
- o perfil fica salvo localmente.

### Home
- visualiza o perfil;
- pode apagar o perfil;
- pode iniciar:
  - uma partida local;
  - uma partida contra IA.

### Seleção de time
- escolhe 6 Pokémon;
- pode reorganizar a ordem dos slots;
- no modo contra IA, apenas o time do jogador é escolhido manualmente.

### Partida
- o painel esquerdo mostra os slots com pistas do time adversário;
- o painel direito mostra pontuação e acertos;
- o campo de chute lista os Pokémon ainda disponíveis;
- a IA joga automaticamente quando for a vez dela.

## Como rodar localmente

Como o projeto usa **ES Modules** e `fetch()` para carregar componentes HTML, o ideal é executar com um servidor local.

### Opção 1: Python

Na raiz do projeto, rode:

```bash
python3 -m http.server 5500
```

Depois acesse:

- [http://localhost:5500/](http://localhost:5500/)

### Opção 2: Live Server

Se usar VS Code, também é possível abrir o projeto com uma extensão de servidor local, como Live Server.

## Deploy no Vercel

O projeto foi deixado pronto para deploy estático no Vercel.

Arquivo adicionado:
- [vercel.json](vercel.json)

### Como publicar

1. envie o projeto para um repositório no GitHub;
2. importe o repositório no Vercel;
3. configure como projeto estático;
4. publique.

Como o roteamento da aplicação usa **hash routes** (`#/home`, `#/game`, etc.), não é necessário backend nem build step.

## Persistência de dados

O projeto salva dados localmente no navegador, incluindo:
- perfil do jogador;
- experiência e nível;
- histórico de partidas;
- estado da partida em andamento.

## Destaques de implementação

- arquitetura em componentes HTML carregados dinamicamente;
- separação entre `pages`, `components`, `models`, `store` e `config`;
- controle de estado da partida via classe `MatchState`;
- IA com escolha automática de time e heurística simples para palpites;
- interface inspirada em uma Pokédex, com duas telas e visual temático.

## Observações

- o projeto não depende de bibliotecas externas;
- toda a interface foi feita com HTML, CSS e JavaScript puro;
- os dados são locais ao navegador do usuário.
