# PokeTeamGuess

Projeto desenvolvido para a cadeira de **Frontend** na **CESAR School**.

## Sobre o projeto

O **PokeTeamGuess** é um jogo local de adivinhação de times Pokémon em que cada jogador monta um time com 6 Pokémon e tenta descobrir o time do adversário por meio de filtros, dedução e chutes por slot.

Fluxo principal atual:
- Home (`index.html`): montagem do time, importação do código do adversário, início de nova partida ou retomada de partida em andamento.
- Jogo (`guess.html`): painel de dedução por slot, controle de turnos, histórico de rodadas, placar e resultado final.

## Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- `localStorage` para persistência local
- Web Crypto API (troca de código criptografado entre jogadores)

## Estrutura do projeto

- `index.html` — página inicial e configuração da partida
- `register.html` — cadastro/edição de treinador
- `guess.html` — tela da partida
- `css/` — estilos globais e por página
- `js/user.js` — gerenciamento de dados do jogador, adversário e estado de partida
- `js/teamPage.js` — lógica da Home
- `js/guessPage.js` — lógica da partida
- `js/pokemonData.js` — base de dados dos Pokémon
- `assets/` — sprites e imagens

## Como executar

1. Abra a pasta do projeto no navegador/servidor local.
2. Cadastre o treinador em `register.html`.
3. Monte um time completo (6 Pokémon).
4. Copie seu código e importe o código do adversário na Home.
5. Clique em **Jogar** para iniciar nova partida.
6. Use **Voltar para Partida** para retomar uma partida salva em memória local.

## Funcionalidades principais implementadas

- Cadastro e perfil de treinador com estatísticas locais.
- Montagem de time com busca, remoção, time aleatório e drag-and-drop.
- Troca de código criptografado para carregar o adversário.
- Botão **Jogar** com validação de time completo + código adversário válido.
- Botão **Voltar para Partida** habilitado apenas quando existe partida salva.
- Persistência local do estado da partida (turnos, histórico, filtros, anotações, placar).
- Sistema de turnos com penalidade por chute errado.
- Histórico de rodadas com inserção e remoção dinâmica.
- Placar dinâmico com nomes dos jogadores.
- Filtros por slot com validação visual (acerto/erro), campos travados quando acertados e feedback por valor.

## Especificações do professor e atendimento

Legenda:
- `[x]` Atendido
- `[~]` Parcial / depende de alinhamento
- `[ ]` Não atendido

1. `[x]` Animação com figuras  
   Implementado com animação contínua dos sprites de batalha.

2. `[~]` Pelo menos dois jogadores humanos  
   Fluxo atual usa troca de código e partida local; item depende de alinhamento final com o professor quanto ao formato esperado.

3. `[x]` Tabela dinâmica (TABLE/TH/TR/TD) com inserção e remoção de linhas  
   Histórico de rodadas implementado de forma dinâmica em `guess.html`/`guessPage.js`.

4. `[x]` Lista dinâmica (OL/UL/LI) com inserção e remoção de linhas  
   Time da Home implementado com `UL/LI` e atualização dinâmica.

5. `[x]` Mudança dinâmica de estilo via JS em função de estado do jogo  
   Classes e estilos mudam por turno, acerto/erro, seleção de slot e resultado.

6. `[x]` Resposta a eventos programada em JS  
   Cliques, inputs, drag-and-drop, validação de filtros, chutes e turnos.

7. `[x]` Placar com pontuação e nomes dos jogadores  
   Placar mostra nome do jogador local, nome do adversário e pontuação.

8. `[~]` Duas páginas (configuração inicial + página do jogo)  
   Estrutura com páginas separadas está pronta, mas o formato de configuração inicial pode precisar ajuste conforme interpretação final do enunciado.

9. `[x]` Página do jogo receber nomes dos jogadores como parâmetros  
   A Home envia `playerName` e `opponentName` por query string, e a página do jogo utiliza esses parâmetros para exibição.

10. `[x]` Layout CSS nas páginas  
    Atendido.

11. `[x]` Páginas organizadas e estilizadas em padrão aceitável de jogo  
    Atendido.

12. `[x]` Atualização dinâmica de propriedades de objetos DOM  
    Atendido.

13. `[x]` Uso de classes JS para elementos lógicos básicos do jogo  
    Atendido (ex.: estrutura de rodada e histórico).

14. `[x]` Proibido usar bibliotecas CSS/JS/HTML de terceiros  
    Atendido (projeto em JS/CSS/HTML puro).

15. `[x]` Separação completa de HTML, CSS e JS  
    Atendido.

16. `[x]` Nada online nesta primeira unidade (jogo local em única tela)  
    Atendido no fluxo atual.

## Resumo de conformidade

- Atendidos: **14**
- Parciais: **2**
- Não atendidos: **0**
