import Game from './game.js';

window.addEventListener('load', function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    const game = new Game(canvas);

    async function startGame() {
        await game.init();
        // ここでスタート画面などを表示することも可能
        // 今回は即時スタート
        game.start();
    }

    startGame();
});