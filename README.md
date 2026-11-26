# Cuidar Transforma — Vila Esperança

Jogo educativo 2D em pixel art do PET-Saúde. O jogador explora um bairro fictício como agente comunitário, conversa com moradores e resolve missões relacionadas a dengue, alagamentos, calor extremo e descarte de resíduos.

## Por que foi feito

O jogo leva temas de vigilância em saúde e prevenção socioambiental a uma atividade interativa. A Vila Esperança reúne situações próximas do cotidiano em um mapa que pode ser explorado durante oficinas ou demonstrações. Diálogos, objetivos e retorno imediato ajudam a ligar cada ação ao problema que ela aborda.

## Como jogar

Use **WASD** ou **setas** para andar. Pressione **E** ou **Espaço** para interagir e use **1 a 4** nas escolhas e na triagem. A interface também oferece cliques e botões na tela. O painel de missões e a bússola ajudam a localizar objetivos pendentes.

| Missão | O que o jogo trabalha | Pontos |
| --- | --- | ---: |
| Operação Dengue | Identificar e corrigir situações com água parada. | 100 |
| Rua Alagada | Sinalizar a área de risco e cumprir os objetivos da rua. | 100 |
| Calor Extremo | Auxiliar o morador e ativar recursos de apoio na praça. | 100 |
| Bairro Limpo | Cuidar do descarte e completar o minijogo de triagem. | 150 |

A Vila Esperança tem praça central, bairro residencial, área ambiental, rua principal e entrada da comunidade. A pontuação total indicada no painel é 450. As missões são simulações educativas. Ao revisar textos sobre saúde e clima, valide as orientações com a equipe do PET-Saúde.

## Como foi feito

A página [index.html](index.html) carrega o Phaser 3.70.0 por CDN e abre a interface. O projeto roda no navegador com HTML, CSS e JavaScript, sem backend e sem etapa de build.

| Arquivo | Responsabilidade |
| --- | --- |
| [main.js](js/main.js) | Inicialização do Phaser e ajuste da escala da tela. |
| [worldScene.js](js/worldScene.js) | Mapa, personagem, NPCs, diálogos, objetivos e regras do jogo. |
| [uiManager.js](js/uiManager.js) | Estados da interface, painéis e indicadores. |
| [minigame.js](js/minigame.js) | Minijogo de triagem da coleta seletiva. |
| [assets.js](js/assets.js) e [audio.js](js/audio.js) | Geração de recursos gráficos e síntese de áudio. |
| [style.css](css/style.css) | Estilos, posicionamento e adaptação da interface. |

## Como rodar e validar

Na raiz do checkout, execute o comando abaixo com Python 3 instalado e abra http://localhost:8000. A primeira carga precisa de acesso à CDN do Phaser. Existe uma [versão publicada do jogo](https://jogo-petsaude.vercel.app/).

~~~bash
python -m http.server 8000
~~~

Ao mudar o jogo, confirme a entrada pelo menu, a movimentação e a escala em diferentes janelas. Abra e feche um diálogo mantendo E ou Espaço pressionado para verificar que ele não reabre sozinho. Teste os botões de tela, o minijogo e a conclusão das quatro missões, conferindo o placar final.

## Contexto para assistentes de IA

Leia [AGENTS.md](AGENTS.md) antes de alterar objetivos, controles, interface ou mensagens educativas.
