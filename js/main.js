/**
 * CONFIGURAÇÃO DO PHASER, ESCALONAMENTO RESPONSIVO E INICIALIZAÇÃO DO JOGO
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

function updateViewportScale() {
    const container = document.getElementById('game-container');
    if (!container) return;

    const padding = 12;
    const availW = Math.max(320, window.innerWidth - padding);
    const availH = Math.max(200, window.innerHeight - padding);
    const scale = Math.min(availW / 960, availH / 540);

    container.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', updateViewportScale);

window.addEventListener('load', () => {
    updateViewportScale();
    window.game = new Phaser.Game(config);
});
