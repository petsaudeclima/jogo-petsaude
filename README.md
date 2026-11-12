# Cuidar Transforma – Vila Esperança | PET-Saúde

Jogo educativo 2D pixel-art desenvolvido com **Phaser 3** sobre vigilância em saúde, cuidados comunitários e prevenção de riscos socioambientais na Vila Esperança.

---

## 📁 Estrutura do Projeto

```text
jogo-petsaude/
├── index.html            # Estrutura HTML do jogo, container do Phaser e HUD com Bússola
├── css/
│   └── style.css         # Estilização da interface, HUD, Bússola e canvas
├── js/
│   ├── audio.js          # Síntese sonora procedural chiptune (Web Audio API)
│   ├── assets.js         # Geração procedural de texturas e sprites pixel-art (2.5D)
│   ├── minigame.js       # Minigame de triagem da coleta seletiva
│   ├── worldScene.js     # Cena principal: mapa 2400x1800, 5 regiões, diálogos e missões
│   └── main.js           # Inicialização e configuração do Phaser 3
└── README.md             # Documentação e instruções do projeto
```

---

## 🗺️ Mapa Expandido da Vila Esperança (2400 × 1800)

O mapa foi ampliado para **2400 × 1800 pixels**, dividido em 5 regiões conectadas e detalhadas:

1. **🏛️ Praça da Esperança (Centro - X: 1200, Y: 900)**:
   - Ampla praça pavimentada em pedra portuguesa, canteiros floridos, bancos e postes coloniais.
   - Ponto de Resfriamento com bebedouro público e tenda comunitária.
   - Encontro com a **Coordenadora** e o **Seu Antônio**.

2. **🏡 Bairro Residencial (Norte - X: 1200, Y: 390)**:
   - Conjunto de casas coloniais coloridas (azul, amarelo, verde, terracota), cercas e quintais.
   - Encontro com **João**, vaso de planta e caixa d'água destampada da **Operação Dengue**.

3. **🌿 Área Ambiental (Oeste - X: 450, Y: 860)**:
   - Clareira de terra batida com composteira comunitária, árvores e arbustos nativos.
   - Pneus e garrafas acumulando água.
   - Encontro com o **Morador** e a **Estação de Coleta Seletiva**.

4. **🚗 Rua Principal (Leste - X: 2020, Y: 900)**:
   - Ampla avenida asfaltada de pista dupla com calçadas e postes de iluminação.
   - Bueiro entupido com resíduos e área de alagamento com risco de leptospirose.

5. **🚪 Entrada da Comunidade (Sul - X: 1200, Y: 1550)**:
   - Via principal de acesso ao bairro, ladeada por casas coloniais, jardins e a placa *"Bem-vindos à Vila Esperança"*.

---

## 🧭 Bússola e Guia de Orientação

Integrada ao painel da interface (HUD), a bússola calcula em tempo real a distância em metros e a direção cardeal/colateral (Norte, Sul, Leste, Oeste, etc.) para os objetivos pendentes de cada uma das 4 frentes de cuidado.

---

## 💬 Sistema Definitivo de Diálogos

- **Fechamento Instantâneo**: Pressionar `[ESPAÇO]`, `[E]` ou clicar fecha o diálogo de imediato.
- **Prevenção de Reabertura Involuntária**: Trava de liberação obrigatória da tecla (`keys.isUp`) e debounce de 250ms impedem que manter a tecla pressionada feche e reabra o diálogo em loop.
- **Permanência no Local**: O jogador pode fechar a conversa e continuar ao lado do NPC sem que o diálogo reabra sozinho.
- **Reabertura Intencional**: Uma nova interação ocorre somente com um novo toque intencional na tecla.
- **Movimentação Imediata**: WASD e setas respondem no mesmo instante após o fechamento.

---

## 🎯 Missões e Cuidados Preventivos (450 Pontos)

1. **🪣 Operação Dengue (3 cuidados - 100 pts)**: Vaso com areia, pneus/garrafas recolhidos e caixa d'água vedada.
2. **🌊 Rua Alagada (2 cuidados - 100 pts)**: Desobstrução segura de bueiro e sinalização com cones.
3. **☀️ Calor Extremo (2 cuidados - 100 pts)**: Guarda-sol e água fresca para o Seu Antônio, tenda e bebedouro ativados.
4. **♻️ Bairro Limpo (2 cuidados - 150 pts)**: Conscientização sobre lixeira suspensa e minigame de triagem concluído.

---

## 🎮 Controles

- **W, A, S, D** ou **Setas do Teclado**: Movimentar o Agente Comunitário (Velocidade 190)
- **E** ou **Espaço**: Interagir com objetos/moradores e fechar diálogos
- **1, 2, 3, 4**: Escolher alternativas e separar resíduos na triagem
- **Mouse / Clique**: Também suportado para fechar diálogos e selecionar opções
