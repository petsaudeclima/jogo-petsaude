/**
 * GERADOR PROCEDURAL DE SPRITES E TILESETS PIXEL-ART
 * Constrói texturas 16x16 e 32x32 com paleta consistente de Vila Colonial do Recôncavo Baiano.
 */
class AssetGenerator {
    static create(scene) {
        // 1. Grama da praça
        this.makeTile(scene, 'tile-grass', 32, 32, (ctx) => {
            ctx.fillStyle = '#5b8c3b'; ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#3e6b28';
            ctx.fillRect(4, 4, 2, 2); ctx.fillRect(18, 10, 2, 2); ctx.fillRect(26, 24, 2, 2); ctx.fillRect(10, 22, 2, 2);
            ctx.fillStyle = '#72a84a';
            ctx.fillRect(8, 14, 2, 2); ctx.fillRect(22, 4, 2, 2); ctx.fillRect(14, 28, 2, 2);
        });

        // 2. Calçada de pedra portuguesa
        this.makeTile(scene, 'tile-path', 32, 32, (ctx) => {
            ctx.fillStyle = '#d8cfbc'; ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#b8ae9c';
            for (let x = 0; x < 32; x += 8) {
                ctx.fillRect(x, 0, 1, 32);
                ctx.fillRect(0, x, 32, 1);
            }
            ctx.fillStyle = '#8f8574';
            ctx.fillRect(9, 5, 6, 6); ctx.fillRect(17, 13, 6, 6); ctx.fillRect(1, 21, 6, 6);
        });

        // 3. Asfalto/Rua
        this.makeTile(scene, 'tile-road', 32, 32, (ctx) => {
            ctx.fillStyle = '#4a4e58'; ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#363942'; ctx.fillRect(0, 0, 32, 2); ctx.fillRect(0, 30, 32, 2);
            ctx.fillStyle = '#646875'; ctx.fillRect(8, 8, 3, 2); ctx.fillRect(20, 18, 2, 3);
        });

        // 4. Trilha de Terra / Área Ambiental
        this.makeTile(scene, 'tile-dirt', 32, 32, (ctx) => {
            ctx.fillStyle = '#8b6f47'; ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#735733';
            ctx.fillRect(4, 6, 4, 3); ctx.fillRect(20, 18, 3, 4); ctx.fillRect(10, 24, 4, 3);
            ctx.fillStyle = '#a08359';
            ctx.fillRect(14, 8, 3, 3); ctx.fillRect(24, 6, 3, 3); ctx.fillRect(6, 18, 2, 2);
        });

        // 5. Casas Coloniais (Fachadas 64x64)
        this.makeTile(scene, 'house-blue', 64, 64, (ctx) => {
            // Telhado de telhas de barro
            ctx.fillStyle = '#9c4221'; ctx.fillRect(0, 0, 64, 22);
            ctx.fillStyle = '#6e2d14';
            for (let y = 4; y < 22; y += 5) ctx.fillRect(0, y, 64, 2);
            // Parede azul colonial
            ctx.fillStyle = '#2b6cb0'; ctx.fillRect(4, 22, 56, 42);
            // Rodapé e detalhes
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(2, 22, 60, 3); ctx.fillRect(4, 61, 56, 3);
            // Janela
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(10, 32, 16, 18);
            ctx.fillStyle = '#4a2810'; ctx.fillRect(12, 34, 12, 14);
            // Porta de madeira
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(36, 32, 18, 30);
            ctx.fillStyle = '#6e2d14'; ctx.fillRect(38, 34, 14, 28);
        });

        this.makeTile(scene, 'house-yellow', 64, 64, (ctx) => {
            ctx.fillStyle = '#9c4221'; ctx.fillRect(0, 0, 64, 22);
            ctx.fillStyle = '#6e2d14';
            for (let y = 4; y < 22; y += 5) ctx.fillRect(0, y, 64, 2);
            ctx.fillStyle = '#e09f3e'; ctx.fillRect(4, 22, 56, 42);
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(2, 22, 60, 3); ctx.fillRect(4, 61, 56, 3);
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(38, 32, 16, 18);
            ctx.fillStyle = '#4a2810'; ctx.fillRect(40, 34, 12, 14);
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(10, 32, 18, 30);
            ctx.fillStyle = '#6e2d14'; ctx.fillRect(12, 34, 14, 28);
        });

        this.makeTile(scene, 'house-green', 64, 64, (ctx) => {
            ctx.fillStyle = '#9c4221'; ctx.fillRect(0, 0, 64, 22);
            ctx.fillStyle = '#6e2d14';
            for (let y = 4; y < 22; y += 5) ctx.fillRect(0, y, 64, 2);
            ctx.fillStyle = '#2e8540'; ctx.fillRect(4, 22, 56, 42);
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(2, 22, 60, 3); ctx.fillRect(4, 61, 56, 3);
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(12, 32, 16, 18);
            ctx.fillStyle = '#4a2810'; ctx.fillRect(14, 34, 12, 14);
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(36, 32, 18, 30);
            ctx.fillStyle = '#6e2d14'; ctx.fillRect(38, 34, 14, 28);
        });

        this.makeTile(scene, 'house-red', 64, 64, (ctx) => {
            ctx.fillStyle = '#7a3118'; ctx.fillRect(0, 0, 64, 22);
            ctx.fillStyle = '#54200e';
            for (let y = 4; y < 22; y += 5) ctx.fillRect(0, y, 64, 2);
            ctx.fillStyle = '#c53030'; ctx.fillRect(4, 22, 56, 42);
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(2, 22, 60, 3); ctx.fillRect(4, 61, 56, 3);
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(38, 32, 16, 18);
            ctx.fillStyle = '#4a2810'; ctx.fillRect(40, 34, 12, 14);
            ctx.fillStyle = '#f4f1ea'; ctx.fillRect(10, 32, 18, 30);
            ctx.fillStyle = '#6e2d14'; ctx.fillRect(12, 34, 14, 28);
        });

        // 6. Árvore Tropical (32x48)
        this.makeTile(scene, 'tree', 32, 48, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(16, 44, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#6e2d14'; ctx.fillRect(13, 24, 6, 20);
            ctx.fillStyle = '#2d5a27'; ctx.beginPath(); ctx.arc(16, 18, 14, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#48bb78'; ctx.beginPath(); ctx.arc(14, 14, 10, 0, Math.PI * 2); ctx.fill();
        });

        // 7. Arbusto Verdejante (28x22)
        this.makeTile(scene, 'bush', 28, 22, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(14, 19, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#22543d'; ctx.beginPath(); ctx.arc(10, 12, 8, 0, Math.PI * 2); ctx.arc(18, 12, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#2f855a'; ctx.beginPath(); ctx.arc(14, 9, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#48bb78'; ctx.beginPath(); ctx.arc(13, 7, 4, 0, Math.PI * 2); ctx.fill();
        });

        // 8. Pequena Pedra / Seixo (18x12)
        this.makeTile(scene, 'rock', 18, 12, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(9, 10, 8, 2, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#4a5568'; ctx.beginPath(); ctx.ellipse(9, 6, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#718096'; ctx.beginPath(); ctx.ellipse(8, 5, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#a0aec0'; ctx.fillRect(6, 4, 3, 2);
        });

        // 9. Flores Silvestres (24x16)
        this.makeTile(scene, 'flowers-wild', 24, 16, (ctx) => {
            ctx.fillStyle = '#38a169'; ctx.fillRect(4, 10, 2, 5); ctx.fillRect(12, 8, 2, 7); ctx.fillRect(18, 9, 2, 6);
            ctx.fillStyle = '#ecc94b'; ctx.fillRect(3, 8, 4, 3);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(11, 6, 4, 3);
            ctx.fillStyle = '#ed64a6'; ctx.fillRect(17, 7, 4, 3);
        });

        // 10. Cercas de Madeira (32x16 e 16x32)
        this.makeTile(scene, 'fence-h', 32, 16, (ctx) => {
            ctx.fillStyle = '#8c5932';
            ctx.fillRect(2, 4, 28, 3); ctx.fillRect(2, 10, 28, 3);
            ctx.fillStyle = '#5c381c';
            ctx.fillRect(4, 1, 4, 14); ctx.fillRect(14, 1, 4, 14); ctx.fillRect(24, 1, 4, 14);
        });
        this.makeTile(scene, 'fence-v', 16, 32, (ctx) => {
            ctx.fillStyle = '#5c381c';
            ctx.fillRect(4, 2, 8, 28);
            ctx.fillStyle = '#8c5932';
            ctx.fillRect(2, 6, 12, 3); ctx.fillRect(2, 22, 12, 3);
        });

        // 11. Poste de Iluminação Colonial (16x44)
        this.makeTile(scene, 'lamp-post', 16, 44, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(8, 42, 6, 2, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1a202c'; ctx.fillRect(7, 8, 2, 34); ctx.fillRect(5, 40, 6, 3);
            ctx.fillRect(4, 6, 8, 3); ctx.fillRect(5, 3, 6, 3);
            // Lanterna brilhante
            ctx.fillStyle = '#f6e05e'; ctx.fillRect(6, 9, 4, 6);
        });

        // 12. Placa de Boas-Vindas à Vila Esperança (54x40)
        this.makeTile(scene, 'sign-welcome', 54, 40, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(10, 36, 34, 3);
            // Suportes de madeira
            ctx.fillStyle = '#5c381c'; ctx.fillRect(10, 18, 4, 20); ctx.fillRect(40, 18, 4, 20);
            // Tabuleiro
            ctx.fillStyle = '#8c5932'; ctx.fillRect(2, 4, 50, 20);
            ctx.fillStyle = '#5c381c'; ctx.strokeRect(3, 5, 48, 18);
            // Texto estilizado
            ctx.fillStyle = '#fefcbf'; ctx.fillRect(6, 8, 42, 5); ctx.fillRect(12, 15, 30, 4);
        });

        // 13. Composteira Comunitária (34x28)
        this.makeTile(scene, 'compost-bin', 34, 28, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(2, 24, 30, 3);
            // Caixa de ripas
            ctx.fillStyle = '#4a2810'; ctx.fillRect(3, 6, 28, 20);
            ctx.fillStyle = '#6e401f';
            ctx.fillRect(4, 8, 26, 4); ctx.fillRect(4, 14, 26, 4); ctx.fillRect(4, 20, 26, 4);
            // Matéria orgânica visível
            ctx.fillStyle = '#2f855a'; ctx.fillRect(6, 7, 6, 3);
            ctx.fillStyle = '#d69e2e'; ctx.fillRect(14, 7, 8, 3);
        });

        // 14. Banco de Praça
        this.makeTile(scene, 'bench', 32, 20, (ctx) => {
            ctx.fillStyle = '#6e2d14'; ctx.fillRect(2, 6, 28, 6);
            ctx.fillStyle = '#3e1d08'; ctx.fillRect(4, 12, 4, 8); ctx.fillRect(24, 12, 4, 8);
        });

        // 15. Canteiro de Flores
        this.makeTile(scene, 'flowers-clean', 32, 20, (ctx) => {
            ctx.fillStyle = '#8b5a2b'; ctx.fillRect(2, 8, 28, 10);
            ctx.fillStyle = '#48bb78'; ctx.fillRect(4, 4, 6, 6); ctx.fillRect(14, 4, 6, 6); ctx.fillRect(22, 4, 6, 6);
            ctx.fillStyle = '#e53e3e'; ctx.fillRect(6, 3, 2, 2);
            ctx.fillStyle = '#ecc94b'; ctx.fillRect(16, 3, 2, 2);
            ctx.fillStyle = '#9f7aea'; ctx.fillRect(24, 3, 2, 2);
        });

        // 16. Agente Comunitário (Jogador - 24x32)
        this.makeCharacter(scene, 'player', '#2b6cb0', '#f4f1ea', '#3182ce');
        // Coordenadora
        this.makeCharacter(scene, 'npc-coordenadora', '#9b2c2c', '#ecc94b', '#2c5282');
        // Seu Antônio (Idoso com camisa clara)
        this.makeCharacter(scene, 'npc-antonio', '#d69e2e', '#e2e8f0', '#744210');
        // João
        this.makeCharacter(scene, 'npc-joao', '#285e61', '#cbd5e0', '#234e52');
        // Morador do Lixo
        this.makeCharacter(scene, 'npc-morador', '#7b341e', '#e2e8f0', '#4a5568');

        // 17. Itens das Missões (Estados ANTES e DEPOIS)
        // Vaso de planta
        this.makeTile(scene, 'pot-dirty', 24, 24, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(2, 20, 20, 3);
            ctx.fillStyle = '#c05621'; ctx.fillRect(5, 8, 14, 12);
            ctx.fillStyle = '#65733e'; ctx.fillRect(2, 18, 20, 4); // água parada suja
            ctx.fillStyle = '#2f855a'; ctx.fillRect(9, 2, 6, 7); // planta
        });
        this.makeTile(scene, 'pot-clean', 24, 24, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(2, 20, 20, 3);
            ctx.fillStyle = '#c05621'; ctx.fillRect(5, 8, 14, 12);
            ctx.fillStyle = '#d69e2e'; ctx.fillRect(2, 18, 20, 4); // areia grossa até a borda
            ctx.fillStyle = '#48bb78'; ctx.fillRect(9, 2, 6, 7);
        });

        // Garrafas e Pneus
        this.makeTile(scene, 'tires-dirty', 32, 24, (ctx) => {
            ctx.fillStyle = '#2d3748'; ctx.beginPath(); ctx.ellipse(10, 14, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1a202c'; ctx.beginPath(); ctx.ellipse(10, 14, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#2b6cb0'; ctx.fillRect(20, 8, 4, 10); // garrafa em pé acumulando água
            ctx.fillStyle = '#48bb78'; ctx.fillRect(25, 10, 4, 8);
        });
        this.makeTile(scene, 'tires-clean', 32, 24, (ctx) => {
            ctx.fillStyle = '#718096'; ctx.fillRect(4, 10, 24, 10); // pneus recolhidos e organizados
            ctx.fillStyle = '#2b6cb0'; ctx.fillRect(6, 16, 10, 4);  // garrafas emborcadas
        });

        // Caixa D'água
        this.makeTile(scene, 'tank-open', 36, 36, (ctx) => {
            ctx.fillStyle = '#2b6cb0'; ctx.fillRect(3, 8, 30, 26);
            ctx.fillStyle = '#4299e1'; ctx.fillRect(5, 10, 26, 8); // aberta com água exposta
        });
        this.makeTile(scene, 'tank-capped', 36, 36, (ctx) => {
            ctx.fillStyle = '#2b6cb0'; ctx.fillRect(3, 8, 30, 26);
            ctx.fillStyle = '#1a365d'; ctx.fillRect(1, 6, 34, 7); // tampa hermética
        });

        // Bueiro
        this.makeTile(scene, 'drain-clogged', 32, 32, (ctx) => {
            ctx.fillStyle = '#2d3748'; ctx.fillRect(4, 4, 24, 24);
            ctx.fillStyle = '#1a202c'; ctx.fillRect(6, 6, 20, 20);
            ctx.fillStyle = '#744210'; ctx.fillRect(7, 7, 18, 14); // entulho e folhas
            ctx.fillStyle = '#48bb78'; ctx.fillRect(10, 12, 6, 6);
        });
        this.makeTile(scene, 'drain-clean', 32, 32, (ctx) => {
            ctx.fillStyle = '#2d3748'; ctx.fillRect(4, 4, 24, 24);
            ctx.fillStyle = '#1a202c'; ctx.fillRect(6, 6, 20, 20);
            ctx.fillStyle = '#a0aec0'; // grade limpa
            for (let x = 8; x <= 24; x += 4) ctx.fillRect(x, 6, 2, 20);
        });

        // Poça e Sinalização
        this.makeTile(scene, 'flood-danger', 48, 32, (ctx) => {
            ctx.fillStyle = '#3182ce'; ctx.beginPath(); ctx.ellipse(24, 16, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
        });
        this.makeTile(scene, 'flood-barricade', 48, 32, (ctx) => {
            ctx.fillStyle = '#2b6cb0'; ctx.beginPath(); ctx.ellipse(24, 16, 20, 10, 0, 0, Math.PI * 2); ctx.fill();
            // Cones e cavalete
            ctx.fillStyle = '#dd6b20'; ctx.fillRect(6, 6, 8, 16); ctx.fillRect(34, 6, 8, 16);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(6, 12, 8, 4); ctx.fillRect(34, 12, 8, 4);
        });

        // Ponto de Resfriamento / Guarda-sol / Bebedouro
        this.makeTile(scene, 'parasol', 40, 44, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(20, 40, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#e2e8f0'; ctx.fillRect(19, 16, 3, 24);
            ctx.fillStyle = '#3182ce'; ctx.beginPath(); ctx.arc(20, 16, 18, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#f6e05e'; ctx.fillRect(10, 10, 20, 4);
        });
        this.makeTile(scene, 'cooling-tent', 54, 48, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(4, 38, 46, 8);
            ctx.fillStyle = '#2b6cb0'; ctx.beginPath(); ctx.moveTo(4, 20); ctx.lineTo(27, 4); ctx.lineTo(50, 20); ctx.fill();
            ctx.fillStyle = '#4299e1'; ctx.fillRect(6, 20, 42, 20);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 24, 14, 16); // entrada aberta
        });
        this.makeTile(scene, 'fountain-off', 24, 30, (ctx) => {
            ctx.fillStyle = '#718096'; ctx.fillRect(6, 12, 12, 16);
            ctx.fillStyle = '#a0aec0'; ctx.fillRect(4, 8, 16, 6);
        });
        this.makeTile(scene, 'fountain-on', 24, 30, (ctx) => {
            ctx.fillStyle = '#718096'; ctx.fillRect(6, 12, 12, 16);
            ctx.fillStyle = '#a0aec0'; ctx.fillRect(4, 8, 16, 6);
            ctx.fillStyle = '#63b3ed'; ctx.fillRect(11, 2, 3, 6); // jato de água límpida
        });

        // Resíduos / Coleta Seletiva
        this.makeTile(scene, 'trash-dump', 32, 24, (ctx) => {
            ctx.fillStyle = '#1a202c'; ctx.fillRect(4, 8, 12, 10); // saco preto rasgado
            ctx.fillStyle = '#e2e8f0'; ctx.fillRect(14, 12, 8, 8);  // papel espalhado
            ctx.fillStyle = '#c53030'; ctx.fillRect(22, 14, 6, 6);
        });
        this.makeTile(scene, 'trash-clean', 32, 24, (ctx) => {
            ctx.fillStyle = '#4a5568'; ctx.fillRect(6, 4, 20, 16); // lixeira suspensa fechada
            ctx.fillStyle = '#718096'; ctx.fillRect(14, 20, 4, 4);  // suporte metálico elevado
        });
    }

    static makeTile(scene, key, w, h, drawFn) {
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        drawFn(ctx);
        scene.textures.addCanvas(key, canvas);
    }

    static makeCharacter(scene, key, skinColor, shirtColor, pantsColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 24; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(12, 30, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
        // Pernas
        ctx.fillStyle = pantsColor; ctx.fillRect(8, 20, 3, 9); ctx.fillRect(13, 20, 3, 9);
        // Tronco
        ctx.fillStyle = shirtColor; ctx.fillRect(6, 11, 12, 10);
        // Cabeça
        ctx.fillStyle = '#e2a373'; ctx.fillRect(7, 4, 10, 8);
        // Cabelo / Boné
        ctx.fillStyle = skinColor; ctx.fillRect(6, 2, 12, 4);
        // Olhos
        ctx.fillStyle = '#1a202c'; ctx.fillRect(9, 7, 2, 2); ctx.fillRect(13, 7, 2, 2);
        scene.textures.addCanvas(key, canvas);
    }
}
