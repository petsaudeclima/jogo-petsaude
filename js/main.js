/**
 * CONFIGURAÇÃO DO PHASER E INICIALIZAÇÃO DO JOGO
 */
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 960,
    height: 540,
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [WorldScene]
};

window.addEventListener('load', () => {
    window.game = new Phaser.Game(config);
});
