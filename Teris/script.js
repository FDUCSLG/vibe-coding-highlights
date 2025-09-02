// 游戏常量
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// 游戏状态
let gameBoard = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = true;
let gamePaused = false;
let dropTime = 0;
let dropInterval = 1000; // 初始下落间隔1秒

// 方块形状定义
const PIECES = [
    // I形
    [[1, 1, 1, 1]],
    // O形
    [[1, 1], [1, 1]],
    // T形
    [[0, 1, 0], [1, 1, 1]],
    // S形
    [[0, 1, 1], [1, 1, 0]],
    // Z形
    [[1, 1, 0], [0, 1, 1]],
    // J形
    [[1, 0, 0], [1, 1, 1]],
    // L形
    [[0, 0, 1], [1, 1, 1]]
];

// 经典俄罗斯方块颜色
const COLORS = [
    '#00FFFF', // 青色 - I形
    '#FFFF00', // 黄色 - O形
    '#800080', // 紫色 - T形
    '#00FF00', // 绿色 - S形
    '#FF0000', // 红色 - Z形
    '#0000FF', // 蓝色 - J形
    '#FFA500'  // 橙色 - L形
];

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

// 初始化游戏板
function initBoard() {
    gameBoard = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        gameBoard[y] = [];
        for (let x = 0; x < BOARD_WIDTH; x++) {
            gameBoard[y][x] = 0;
        }
    }
}

// 方块类
class Piece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2);
        this.y = 0;
    }
    
    // 旋转方块
    rotate() {
        const newShape = [];
        for (let i = 0; i < this.shape[0].length; i++) {
            newShape[i] = [];
            for (let j = 0; j < this.shape.length; j++) {
                newShape[i][j] = this.shape[this.shape.length - 1 - j][i];
            }
        }
        return newShape;
    }
    
    // 检查是否可以移动到指定位置
    canMove(newX, newY, newShape = this.shape) {
        for (let y = 0; y < newShape.length; y++) {
            for (let x = 0; x < newShape[y].length; x++) {
                if (newShape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= BOARD_WIDTH || 
                        boardY >= BOARD_HEIGHT || 
                        (boardY >= 0 && gameBoard[boardY][boardX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

// 生成新方块
function generatePiece() {
    const pieceIndex = Math.floor(Math.random() * PIECES.length);
    return new Piece(PIECES[pieceIndex], COLORS[pieceIndex]);
}

// 将方块放置到游戏板上
function placePiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y;
                if (boardY >= 0) {
                    gameBoard[boardY][currentPiece.x + x] = currentPiece.color;
                }
            }
        }
    }
}

// 清除完整的行
function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        let isComplete = true;
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (!gameBoard[y][x]) {
                isComplete = false;
                break;
            }
        }
        
        if (isComplete) {
            gameBoard.splice(y, 1);
            gameBoard.unshift(new Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; // 重新检查当前行
        }
    }
    
    if (linesCleared > 0) {
        // 计算分数
        const lineScores = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4行的分数
        score += lineScores[linesCleared] * level;
        lines += linesCleared;
        
        // 更新等级
        level = Math.floor(lines / 10) + 1;
        
        // 更新下落速度
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        
        updateDisplay();
    }
}

// 检查游戏是否结束
function isGameOver() {
    // 检查下一个方块是否能够放置在游戏板上
    // 如果下一个方块无法放置，说明游戏结束
    return !nextPiece.canMove(nextPiece.x, nextPiece.y, nextPiece.shape);
}

// 绘制游戏板
function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制已放置的方块
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (gameBoard[y][x]) {
                const blockX = x * BLOCK_SIZE;
                const blockY = y * BLOCK_SIZE;
                
                // 填充方块主体
                ctx.fillStyle = gameBoard[y][x];
                ctx.fillRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
                
                // 绘制经典的3D效果边框
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.strokeRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
                
                // 内部高光效果
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.strokeRect(blockX + 2, blockY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
            }
        }
    }
    
    // 绘制当前方块
    if (currentPiece) {
        drawPiece(currentPiece, ctx);
    }
}

// 绘制方块
function drawPiece(piece, context) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const blockX = (piece.x + x) * BLOCK_SIZE;
                const blockY = (piece.y + y) * BLOCK_SIZE;
                
                // 填充方块主体
                context.fillStyle = piece.color;
                context.fillRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
                
                // 绘制经典的3D效果边框
                context.strokeStyle = '#FFFFFF';
                context.lineWidth = 2;
                context.strokeRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
                
                // 内部高光效果
                context.strokeStyle = '#FFFFFF';
                context.lineWidth = 1;
                context.strokeRect(blockX + 2, blockY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
            }
        }
    }
}

// 绘制下一个方块
function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const blockSize = 20;
        const offsetX = (nextCanvas.width - nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * blockSize) / 2;
        
        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    const blockX = offsetX + x * blockSize;
                    const blockY = offsetY + y * blockSize;
                    
                    // 填充方块主体
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(blockX, blockY, blockSize, blockSize);
                    
                    // 绘制经典的3D效果边框
                    nextCtx.strokeStyle = '#FFFFFF';
                    nextCtx.lineWidth = 1;
                    nextCtx.strokeRect(blockX, blockY, blockSize, blockSize);
                    
                    // 内部高光效果
                    nextCtx.strokeStyle = '#FFFFFF';
                    nextCtx.lineWidth = 0.5;
                    nextCtx.strokeRect(blockX + 1, blockY + 1, blockSize - 2, blockSize - 2);
                }
            }
        }
    }
}

// 更新显示
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// 游戏主循环
function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    if (!gamePaused) {
        if (timestamp - dropTime > dropInterval) {
            if (currentPiece.canMove(currentPiece.x, currentPiece.y + 1)) {
                currentPiece.y++;
            } else {
                placePiece();
                clearLines();
                
                if (isGameOver()) {
                    gameOver();
                    return;
                }
                
                currentPiece = nextPiece;
                nextPiece = generatePiece();
            }
            dropTime = timestamp;
        }
    }
    
    drawBoard();
    drawNextPiece();
    requestAnimationFrame(gameLoop);
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').style.display = 'block';
}

// 重新开始游戏
function restartGame() {
    score = 0;
    level = 1;
    lines = 0;
    gameRunning = true;
    gamePaused = false;
    dropInterval = 1000;
    
    initBoard();
    currentPiece = generatePiece();
    nextPiece = generatePiece();
    dropTime = 0;
    
    document.getElementById('gameOver').style.display = 'none';
    updateDisplay();
    gameLoop(0);
}

// 暂停/继续游戏
function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        document.getElementById('pauseBtn').textContent = gamePaused ? '继续' : '暂停';
    }
}

// 键盘事件处理
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    // 空格键可以在任何时候切换暂停状态
    if (e.key === ' ') {
        e.preventDefault();
        togglePause();
        return;
    }
    
    // 其他按键只在游戏未暂停时生效
    if (gamePaused) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            if (currentPiece.canMove(currentPiece.x - 1, currentPiece.y)) {
                currentPiece.x--;
            }
            break;
        case 'ArrowRight':
            if (currentPiece.canMove(currentPiece.x + 1, currentPiece.y)) {
                currentPiece.x++;
            }
            break;
        case 'ArrowDown':
            if (currentPiece.canMove(currentPiece.x, currentPiece.y + 1)) {
                currentPiece.y++;
                score += 1; // 快速下降奖励
                updateDisplay();
            }
            break;
        case 'ArrowUp':
            const rotatedShape = currentPiece.rotate();
            if (currentPiece.canMove(currentPiece.x, currentPiece.y, rotatedShape)) {
                currentPiece.shape = rotatedShape;
            }
            break;
    }
});

// 暂停按钮事件
document.getElementById('pauseBtn').addEventListener('click', togglePause);

// 初始化游戏
function initGame() {
    initBoard();
    currentPiece = generatePiece();
    nextPiece = generatePiece();
    updateDisplay();
    gameLoop(0);
}

// 启动游戏
initGame();