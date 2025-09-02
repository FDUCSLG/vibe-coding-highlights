// 游戏配置
const GAME_CONFIG = {
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 300,
    GROUND_HEIGHT: 30,
    GRAVITY: 0.6,
    JUMP_FORCE: -12,
    GAME_SPEED: 6,
    OBSTACLE_SPAWN_RATE: 0.008
};

// 游戏状态
let gameState = {
    isRunning: false,
    score: 0,
    gameSpeed: GAME_CONFIG.GAME_SPEED
};

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 恐龙类
class Dinosaur {
    constructor() {
        this.x = 75;
        this.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - 75;
        this.width = 60;
        this.height = 75;
        this.velocityY = 0;
        this.isJumping = false;
        this.groundY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - 75;
        this.isCharging = false;
        this.chargeStartTime = 0;
        this.maxChargeTime = 150; // 最大蓄力时间（毫秒）
        this.minJumpForce = -10;  // 最小跳跃力度
        this.maxJumpForce = -16;  // 最大跳跃力度
        this.isDucking = false;   // 是否正在下蹲
        this.duckForce = 2;       // 下蹲加速度
    }
    
    startCharge() {
        if (!this.isJumping && !this.isCharging) {
            this.isCharging = true;
            this.chargeStartTime = Date.now();
        }
    }
    
    jump() {
        if (this.isCharging && !this.isJumping) {
            const chargeTime = Math.min(Date.now() - this.chargeStartTime, this.maxChargeTime);
            const chargeRatio = chargeTime / this.maxChargeTime;
            const jumpForce = this.minJumpForce + (this.maxJumpForce - this.minJumpForce) * chargeRatio;
            
            this.velocityY = jumpForce;
            this.isJumping = true;
            this.isCharging = false;
        } else if (!this.isJumping && !this.isCharging) {
            // 快速点击的情况，使用最小跳跃力度
            this.velocityY = this.minJumpForce;
            this.isJumping = true;
        }
    }
    
    update() {
        // 应用重力
        this.velocityY += GAME_CONFIG.GRAVITY;
        
        // 如果正在下蹲且在空中，增加下落速度
        if (this.isDucking && this.isJumping) {
            this.velocityY += this.duckForce;
        }
        
        this.y += this.velocityY;
        
        // 检查是否着地
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.isJumping = false;
            this.isDucking = false; // 着地时停止下蹲
        }
    }
    
    duck() {
        if (this.isJumping) {
            this.isDucking = true;
        }
    }
    
    stopDuck() {
        this.isDucking = false;
    }
    
    draw() {
        // 根据状态改变恐龙颜色
        if (this.isCharging) {
            const chargeTime = Math.min(Date.now() - this.chargeStartTime, this.maxChargeTime);
            const chargeRatio = chargeTime / this.maxChargeTime;
            const red = Math.floor(83 + (255 - 83) * chargeRatio);
            ctx.fillStyle = `rgb(${red}, 83, 83)`;
        } else if (this.isDucking) {
            ctx.fillStyle = '#4169E1'; // 下蹲时显示蓝色
        } else {
            ctx.fillStyle = '#535353';
        }
        
        // 根据下蹲状态调整恐龙形状
        const duckHeight = this.isDucking ? this.height * 0.7 : this.height;
        const duckY = this.isDucking ? this.y + (this.height - duckHeight) : this.y;
        
        ctx.fillRect(this.x, duckY, this.width, duckHeight);
        
        // 绘制恐龙的眼睛
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 37, duckY + 15, 12, 12);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 40, duckY + 18, 6, 6);
        
        // 绘制恐龙的腿
        let legColor = '#535353';
        if (this.isCharging) {
            const chargeRatio = Math.min((Date.now() - this.chargeStartTime) / this.maxChargeTime, 1);
            const red = Math.floor(83 + (255 - 83) * chargeRatio);
            legColor = `rgb(${red}, 83, 83)`;
        } else if (this.isDucking) {
            legColor = '#4169E1';
        }
        
        ctx.fillStyle = legColor;
        if (!this.isDucking) {
            ctx.fillRect(this.x + 15, this.y + 67, 12, 22);
            ctx.fillRect(this.x + 37, this.y + 67, 12, 22);
        } else {
            // 下蹲时腿部位置调整
            ctx.fillRect(this.x + 15, duckY + duckHeight - 15, 18, 15);
            ctx.fillRect(this.x + 33, duckY + duckHeight - 15, 18, 15);
        }
        
        // 绘制蓄力指示器
        if (this.isCharging) {
            const chargeTime = Math.min(Date.now() - this.chargeStartTime, this.maxChargeTime);
            const chargeRatio = chargeTime / this.maxChargeTime;
            
            // 绘制蓄力条背景
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(this.x - 7, this.y - 22, 75, 12);
            
            // 绘制蓄力条
            ctx.fillStyle = `hsl(${120 * chargeRatio}, 100%, 50%)`;
            ctx.fillRect(this.x - 7, this.y - 22, 75 * chargeRatio, 12);
        }
        
        // 绘制下蹲指示器
        if (this.isDucking) {
            ctx.fillStyle = '#4169E1';
            ctx.font = '18px Arial';
            ctx.fillText('↓', this.x + 22, this.y - 7);
        }
    }
    
    getBounds() {
        const duckHeight = this.isDucking ? this.height * 0.7 : this.height;
        const duckY = this.isDucking ? this.y + (this.height - duckHeight) : this.y;
        
        return {
            x: this.x,
            y: duckY,
            width: this.width,
            height: duckHeight
        };
    }
}

// 障碍物类
class Obstacle {
    constructor() {
        this.x = GAME_CONFIG.CANVAS_WIDTH;
        this.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - 60;
        this.width = 30;
        this.height = 60;
    }
    
    update() {
        this.x -= gameState.gameSpeed;
    }
    
    draw() {
        // 绘制仙人掌
        ctx.fillStyle = '#228B22';
        // 主干
        ctx.fillRect(this.x + 12, this.y, 6, this.height);
        // 左臂
        ctx.fillRect(this.x + 3, this.y + 15, 12, 6);
        ctx.fillRect(this.x + 3, this.y + 15, 6, 22);
        // 右臂
        ctx.fillRect(this.x + 15, this.y + 30, 12, 6);
        ctx.fillRect(this.x + 21, this.y + 22, 6, 15);
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// 游戏对象
let dinosaur = new Dinosaur();
let obstacles = [];
let groundOffset = 0;

// 碰撞检测
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 生成障碍物
function spawnObstacle() {
    if (Math.random() < GAME_CONFIG.OBSTACLE_SPAWN_RATE) {
        obstacles.push(new Obstacle());
    }
}

// 更新游戏状态
function updateGame() {
    if (!gameState.isRunning) return;
    
    // 更新恐龙
    dinosaur.update();
    
    // 生成障碍物
    spawnObstacle();
    
    // 更新障碍物
    obstacles.forEach(obstacle => obstacle.update());
    
    // 移除屏幕外的障碍物
    obstacles = obstacles.filter(obstacle => !obstacle.isOffScreen());
    
    // 检查碰撞
    const dinosaurBounds = dinosaur.getBounds();
    for (let obstacle of obstacles) {
        if (checkCollision(dinosaurBounds, obstacle.getBounds())) {
            gameOver();
            return;
        }
    }
    
    // 更新分数
    gameState.score += 1;
    
    // 增加游戏速度
    if (gameState.score % 500 === 0) {
        gameState.gameSpeed += 0.5;
    }
    
    // 更新地面偏移
    groundOffset -= gameState.gameSpeed;
    if (groundOffset <= -40) {
        groundOffset = 0;
    }
}

// 绘制地面
function drawGround() {
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.GROUND_HEIGHT);
    
    // 绘制地面纹理
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    for (let i = groundOffset; i < GAME_CONFIG.CANVAS_WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT);
        ctx.lineTo(i + 20, GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT + 5);
        ctx.stroke();
    }
}

// 绘制云朵
function drawClouds() {
    ctx.fillStyle = '#c0c0c0';
    const cloudY = 45;
    const cloudOffset = (gameState.score * 0.5) % 1350;
    
    for (let i = -cloudOffset; i < GAME_CONFIG.CANVAS_WIDTH + 150; i += 300) {
        // 绘制简单的云朵
        ctx.beginPath();
        ctx.arc(i, cloudY, 22, 0, Math.PI * 2);
        ctx.arc(i + 30, cloudY, 30, 0, Math.PI * 2);
        ctx.arc(i + 60, cloudY, 22, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    
    // 绘制背景元素
    drawClouds();
    drawGround();
    
    // 绘制恐龙
    dinosaur.draw();
    
    // 绘制障碍物
    obstacles.forEach(obstacle => obstacle.draw());
    
    // 更新分数显示
    document.getElementById('score').textContent = Math.floor(gameState.score / 10);
}

// 游戏循环
function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// 开始游戏
function startGame() {
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.gameSpeed = GAME_CONFIG.GAME_SPEED;
    dinosaur = new Dinosaur();
    obstacles = [];
    groundOffset = 0;
    document.getElementById('gameOver').style.display = 'none';
}

// 游戏结束
function gameOver() {
    gameState.isRunning = false;
    document.getElementById('finalScore').textContent = Math.floor(gameState.score / 10);
    document.getElementById('gameOver').style.display = 'block';
}

// 重新开始游戏
function restartGame() {
    startGame();
}

// 键盘事件监听
let spacePressed = false;

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (gameState.isRunning) {
            if (!spacePressed) {
                spacePressed = true;
                dinosaur.startCharge();
            }
        } else {
            startGame();
        }
    } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        event.preventDefault();
        if (gameState.isRunning) {
            dinosaur.duck();
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (gameState.isRunning && spacePressed) {
            spacePressed = false;
            dinosaur.jump();
        }
    } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        event.preventDefault();
        if (gameState.isRunning) {
            dinosaur.stopDuck();
        }
    }
});

// 触摸事件监听（移动端支持）
let touchPressed = false;

canvas.addEventListener('mousedown', () => {
    if (gameState.isRunning) {
        touchPressed = true;
        dinosaur.startCharge();
    } else {
        startGame();
    }
});

canvas.addEventListener('mouseup', () => {
    if (gameState.isRunning && touchPressed) {
        touchPressed = false;
        dinosaur.jump();
    }
});

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    if (gameState.isRunning) {
        touchPressed = true;
        dinosaur.startCharge();
    } else {
        startGame();
    }
});

canvas.addEventListener('touchend', (event) => {
    event.preventDefault();
    if (gameState.isRunning && touchPressed) {
        touchPressed = false;
        dinosaur.jump();
    }
});

// 初始化游戏
function initGame() {
    drawGame();
    // 显示开始提示
    ctx.fillStyle = '#535353';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('按空格键开始游戏', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2);
}

// 启动游戏循环
gameLoop();
initGame();

// 防止页面滚动
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
    }
});