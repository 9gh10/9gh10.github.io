const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const player = document.getElementById("player");

// ゲーム設定
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const PLAYER_COLOR = 'red';
const PLAYER_X = canvas.width * 2 / 5;
let PLAYER_Y = canvas.height - PLAYER_HEIGHT;
let playerVelocityY = 0;

const GRAVITY = 0.8;
const JUMP_POWER = -20;
let isJumping = false;

const OBSTACLE_WIDTH = 20;
const OBSTACLE_COLOR = 'green';
const OBSTACLE_SPAWN_RATE_MIN = 1000; // ms
const OBSTACLE_SPAWN_RATE_MAX = 2500; // ms
let obstacles = [];
let nextObstacleSpawnTime = 0;

// 45 km/h を ピクセル/秒 に変換 (1m = 10px と仮定)
// 45 km/h = 12.5 m/s = 125 px/s
const GAME_SPEED_PX_PER_SEC = 200;

let distance = 0; // 走行距離 (メートル)
let gameOver = false;
let lastTime = 0;

// --- プレイヤー --- //
function drawPlayer() {
    //ctx.fillStyle = PLAYER_COLOR;
    //ctx.fillRect(PLAYER_X, PLAYER_Y, PLAYER_WIDTH, PLAYER_HEIGHT);
    ctx.drawImage(player, PLAYER_X, PLAYER_Y);
}

function updatePlayer(deltaTime) {
    if (isJumping) {
        playerVelocityY += GRAVITY;
        PLAYER_Y += playerVelocityY;

        // 着地
        if (PLAYER_Y >= canvas.height - PLAYER_HEIGHT) {
            PLAYER_Y = canvas.height - PLAYER_HEIGHT;
            playerVelocityY = 0;
            isJumping = false;
        }
    }
}

function jump() {
    if (!isJumping) {
        isJumping = true;
        playerVelocityY = JUMP_POWER;
    }
}

// --- 障害物 --- //
function spawnObstacle() {
    const obstacleHeight = Math.random() * 50 + 20; // 20pxから80pxの高さ
    obstacles.push({
        x: canvas.width,
        y: canvas.height - obstacleHeight,
        width: OBSTACLE_WIDTH,
        height: obstacleHeight
    });
    // 次の障害物の出現時間を設定
    nextObstacleSpawnTime = Date.now() + Math.random() * (OBSTACLE_SPAWN_RATE_MAX - OBSTACLE_SPAWN_RATE_MIN) + OBSTACLE_SPAWN_RATE_MIN;
}

function updateObstacles(deltaTime) {
    const speed = GAME_SPEED_PX_PER_SEC * (deltaTime / 1000);
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= speed;

        // 画面外に出たら削除
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function drawObstacles() {
    ctx.fillStyle = OBSTACLE_COLOR;
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// --- 背景 --- //
function drawBackground() {
    // 地面
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
}

// --- ゲームロジック --- //
function checkCollision() {
    const player = { x: PLAYER_X, y: PLAYER_Y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    for (const obstacle of obstacles) {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            gameOver = true;
        }
    }
}

function updateDistance(deltaTime) {
    // 12.5 m/s * 経過時間(秒)
    distance += 12.5 * (deltaTime / 1000);
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`距離: ${Math.floor(distance)} m`, 10, 30);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = '30px Arial';
    ctx.fillText(`最終走行距離: ${Math.floor(distance)} m`, canvas.width / 2, canvas.height / 2 + 20);

    ctx.font = '20px Arial';
    ctx.fillText('クリックまたはキーを押してリスタート', canvas.width / 2, canvas.height / 2 + 70);
}

function resetGame() {
    PLAYER_Y = canvas.height - PLAYER_HEIGHT;
    playerVelocityY = 0;
    isJumping = false;
    obstacles = [];
    distance = 0;
    gameOver = false;
    lastTime = 0;
    nextObstacleSpawnTime = Date.now() + 2000; // 最初の障害物は2秒後
    gameLoop(0);
}

// --- メインループ --- //
function gameLoop(timestamp) {
    if (!lastTime) { // lastTimeが0の場合の初期化
        lastTime = timestamp;
    }
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 画面クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新
    updatePlayer(deltaTime);
    updateObstacles(deltaTime);
    if (!gameOver) {
        updateDistance(deltaTime);
    }

    // 描画
    drawBackground();
    drawPlayer();
    drawObstacles();

    // 衝突判定
    checkCollision();

    // ゲーム状態に応じた描画
    if (gameOver) {
        drawGameOver();
        return; // ゲームオーバーならここで処理終了
    }

    // スコア描画
    drawScore();

    // 障害物生成
    if (Date.now() > nextObstacleSpawnTime) {
        spawnObstacle();
    }

    requestAnimationFrame(gameLoop);
}

// --- イベントリスナー --- //
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // スペースでの画面スクロールを防止
        if (!gameOver) {
            jump();
        } else {
            // ゲームオーバー画面でキーが押されたらリスタート
            resetGame();
        }
    }
});

// クリックまたはタップでジャンプ/リスタート
function handleInteraction() {
    if (gameOver) {
        resetGame();
    } else {
        jump();
    }
}

canvas.addEventListener('click', handleInteraction);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // スクロールなどのデフォルト動作を防止
    handleInteraction();
});

// ゲーム開始
resetGame();
