# Instruções para assistentes de IA

Cuidar Transforma é um jogo educativo de navegador do PET-Saúde. Leia README.md. A aplicação usa Phaser 3.70.0 por CDN, JavaScript sem bundler e uma interface HTML/CSS sobre o jogo.

- Para missões, siga worldScene.js, uiManager.js e os elementos correspondentes em index.html. Preserve a relação entre meta, pontuação, bússola e conclusão. Para triagem, revise minigame.js e o fluxo de retorno à cena.
- Para controles, preserve o comportamento de teclado e botões de tela. Ao mudar diálogos, teste a liberação de E e Espaço, a prevenção de reabertura involuntária e a retomada da movimentação.
- Preserve a inicialização do Phaser, a ordem de carregamento dos scripts e a execução por servidor estático. Teste redimensionamento, pausa, áudio após primeira interação e a partida completa.
- Trate textos de saúde e clima como conteúdo educativo. Consulte a equipe do PET-Saúde antes de mudar orientações destinadas ao jogador.
