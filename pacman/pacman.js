// 吃豆人游戏主程序
class PacmanGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 25;
        this.rows = 21;
        this.cols = 32;
        
        // 游戏状态
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = true;
        this.paused = false;
        
        // 游戏地图 (1=墙, 0=豆子, 2=能量豆, 3=空地)
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,2,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,2,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,1,1,1,1,1,3,1,1,1,1,1,1,3,1,1,1,1,1,0,1,1,1,1,1,1],
            [3,3,3,3,3,1,0,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,0,1,3,3,3,3,3],
            [1,1,1,1,1,1,0,1,1,3,1,1,3,3,3,3,3,3,3,3,1,1,3,1,1,0,1,1,1,1,1,1],
            [3,3,3,3,3,3,0,3,3,3,1,3,3,3,3,3,3,3,3,3,3,1,3,3,3,0,3,3,3,3,3,3],
            [1,1,1,1,1,1,0,1,1,3,1,3,3,3,3,3,3,3,3,3,3,1,3,1,1,0,1,1,1,1,1,1],
            [3,3,3,3,3,1,0,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,3,1,1,0,1,3,3,3,3,3],
            [1,1,1,1,1,1,0,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,0,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,2,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,2,1],
            [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
            [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        // 吃豆人
        this.pacman = {
            x: 16,
            y: 15,
            direction: 0, // 0=右, 1=下, 2=左, 3=上
            nextDirection: 0,
            mouthOpen: true,
            animationCounter: 0
        };
        
        // 幽灵
        this.ghosts = [
            { x: 15, y: 9, direction: 0, color: '#ff0000', mode: 'chase' },
            { x: 16, y: 9, direction: 2, color: '#ffb8ff', mode: 'chase' },
            { x: 15, y: 10, direction: 1, color: '#00ffff', mode: 'scatter' },
            { x: 16, y: 10, direction: 3, color: '#ffb852', mode: 'scatter' }
        ];
        
        // 方向向量
        this.directions = [
            { x: 1, y: 0 },   // 右
            { x: 0, y: 1 },   // 下
            { x: -1, y: 0 },  // 左
            { x: 0, y: -1 }   // 上
        ];
        
        this.powerPelletTimer = 0;
        this.powerPelletStartTime = 0;
        this.ghostScaredMode = false;
        this.collisionCooldown = 0; // 碰撞冷却时间
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case 'ArrowRight':
                    this.pacman.nextDirection = 0;
                    break;
                case 'ArrowDown':
                    this.pacman.nextDirection = 1;
                    break;
                case 'ArrowLeft':
                    this.pacman.nextDirection = 2;
                    break;
                case 'ArrowUp':
                    this.pacman.nextDirection = 3;
                    break;
                case ' ':
                    this.paused = !this.paused;
                    e.preventDefault();
                    break;
            }
        });
    }
    
    canMove(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
            return false;
        }
        return this.map[y][x] !== 1;
    }
    
    updatePacman() {
        // 尝试改变方向
        const nextDir = this.directions[this.pacman.nextDirection];
        const nextX = this.pacman.x + nextDir.x;
        const nextY = this.pacman.y + nextDir.y;
        
        if (this.canMove(nextX, nextY)) {
            this.pacman.direction = this.pacman.nextDirection;
        }
        
        // 移动吃豆人
        const dir = this.directions[this.pacman.direction];
        const newX = this.pacman.x + dir.x;
        const newY = this.pacman.y + dir.y;
        
        if (this.canMove(newX, newY)) {
            this.pacman.x = newX;
            this.pacman.y = newY;
            
            // 处理边界穿越
            if (this.pacman.x < 0) this.pacman.x = this.cols - 1;
            if (this.pacman.x >= this.cols) this.pacman.x = 0;
            
            // 吃豆子
            if (this.map[this.pacman.y][this.pacman.x] === 0) {
                this.map[this.pacman.y][this.pacman.x] = 3;
                this.score += 10;
            }
            
            // 吃能量豆
            if (this.map[this.pacman.y][this.pacman.x] === 2) {
                this.map[this.pacman.y][this.pacman.x] = 3;
                this.score += 50;
                this.ghostScaredMode = true;
                this.powerPelletStartTime = Date.now(); // 记录开始时间
                this.powerPelletTimer = 15000; // 15秒（毫秒）
            }
        }
        
        // 动画
        this.pacman.animationCounter++;
        if (this.pacman.animationCounter % 10 === 0) {
            this.pacman.mouthOpen = !this.pacman.mouthOpen;
        }
    }
    
    updateGhosts() {
        this.ghosts.forEach(ghost => {
            // 简单的AI：随机改变方向
            if (Math.random() < 0.1) {
                ghost.direction = Math.floor(Math.random() * 4);
            }
            
            const dir = this.directions[ghost.direction];
            const newX = ghost.x + dir.x;
            const newY = ghost.y + dir.y;
            
            if (this.canMove(newX, newY)) {
                ghost.x = newX;
                ghost.y = newY;
                
                // 处理边界穿越
                if (ghost.x < 0) ghost.x = this.cols - 1;
                if (ghost.x >= this.cols) ghost.x = 0;
            } else {
                // 如果不能移动，随机选择新方向
                ghost.direction = Math.floor(Math.random() * 4);
            }
        });
    }
    
    checkCollisions() {
        // 添加碰撞冷却时间，防止同一帧内多次触发
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
            return;
        }
        
        this.ghosts.forEach((ghost, index) => {
            if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                if (this.ghostScaredMode) {
                    // 吃掉幽灵
                    this.score += 200;
                    // 将幽灵重置到安全的初始位置（幽灵巢穴）
                    this.resetGhostToSafePosition(ghost, index);
                    // 设置短暂的碰撞冷却时间
                    this.collisionCooldown = 5;
                } else {
                    // 失去生命
                    this.lives--;
                    this.resetPositions();
                    // 设置碰撞冷却时间，防止重复扣血
                    this.collisionCooldown = 30;
                    if (this.lives <= 0) {
                        this.gameOver();
                    }
                }
            }
        });
    }
    
    resetGhostToSafePosition(ghost, index) {
        // 将幽灵重置到初始的安全位置
        const safePositions = [
            { x: 15, y: 9, direction: 0, color: '#ff0000', mode: 'chase' },
            { x: 16, y: 9, direction: 2, color: '#ffb8ff', mode: 'chase' },
            { x: 15, y: 10, direction: 1, color: '#00ffff', mode: 'scatter' },
            { x: 16, y: 10, direction: 3, color: '#ffb852', mode: 'scatter' }
        ];
        
        if (index < safePositions.length) {
            Object.assign(ghost, safePositions[index]);
        }
    }
    
    resetPositions() {
        this.pacman.x = 16;
        this.pacman.y = 15;
        this.pacman.direction = 0;
        
        // 重置无敌状态
        this.ghostScaredMode = false;
        this.powerPelletStartTime = 0;
        this.collisionCooldown = 0; // 重置碰撞冷却时间
        
        this.ghosts[0] = { x: 15, y: 9, direction: 0, color: '#ff0000', mode: 'chase' };
        this.ghosts[1] = { x: 16, y: 9, direction: 2, color: '#ffb8ff', mode: 'chase' };
        this.ghosts[2] = { x: 15, y: 10, direction: 1, color: '#00ffff', mode: 'scatter' };
        this.ghosts[3] = { x: 16, y: 10, direction: 3, color: '#ffb852', mode: 'scatter' };
    }
    
    update() {
        if (this.paused || !this.gameRunning) return;
        
        this.updatePacman();
        this.updateGhosts();
        this.checkCollisions();
        
        // 更新能量豆效果（基于实际时间）
        if (this.ghostScaredMode && this.powerPelletStartTime > 0) {
            const elapsedTime = Date.now() - this.powerPelletStartTime;
            if (elapsedTime >= 15000) { // 15秒
                this.ghostScaredMode = false;
                this.powerPelletStartTime = 0;
            }
        }
        
        // 检查是否吃完所有豆子
        if (this.checkWinCondition()) {
            this.nextLevel();
        }
        
        this.updateUI();
    }
    
    checkWinCondition() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.map[y][x] === 0 || this.map[y][x] === 2) {
                    return false;
                }
            }
        }
        return true;
    }
    
    nextLevel() {
        this.level++;
        this.resetLevel();
    }
    
    resetLevel() {
        // 重置地图
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,2,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,2,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,1,1,1,1,1,3,1,1,1,1,1,1,3,1,1,1,1,1,0,1,1,1,1,1,1],
            [3,3,3,3,3,1,0,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,0,1,3,3,3,3,3],
            [1,1,1,1,1,1,0,1,1,3,1,1,3,3,3,3,3,3,3,3,1,1,3,1,1,0,1,1,1,1,1,1],
            [3,3,3,3,3,3,0,3,3,3,1,3,3,3,3,3,3,3,3,3,3,1,3,3,3,0,3,3,3,3,3,3],
            [1,1,1,1,1,1,0,1,1,3,1,3,3,3,3,3,3,3,3,3,3,1,3,1,1,0,1,1,1,1,1,1],
            [3,3,3,3,3,1,0,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,3,1,1,0,1,3,3,3,3,3],
            [1,1,1,1,1,1,0,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,0,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,2,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,2,1],
            [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
            [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.resetPositions();
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制地图
        for (let y = 0; y < this.rows && y < this.map.length; y++) {
            for (let x = 0; x < this.cols && x < this.map[y].length; x++) {
                const tile = this.map[y][x];
                const drawX = x * this.tileSize;
                const drawY = y * this.tileSize;
                
                switch (tile) {
                    case 1: // 墙
                        this.ctx.fillStyle = '#0000ff';
                        this.ctx.fillRect(drawX, drawY, this.tileSize, this.tileSize);
                        break;
                    case 0: // 豆子
                        this.ctx.fillStyle = '#ffff00';
                        this.ctx.beginPath();
                        this.ctx.arc(drawX + this.tileSize/2, drawY + this.tileSize/2, 2, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    case 2: // 能量豆
                        this.ctx.fillStyle = '#ffff00';
                        this.ctx.beginPath();
                        this.ctx.arc(drawX + this.tileSize/2, drawY + this.tileSize/2, 6, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                }
            }
        }
        
        // 绘制吃豆人
        this.drawPacman();
        
        // 绘制幽灵
        this.drawGhosts();
        
        // 绘制暂停信息
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('暂停', this.canvas.width/2, this.canvas.height/2);
        }
    }
    
    drawPacman() {
        const drawX = this.pacman.x * this.tileSize + this.tileSize/2;
        const drawY = this.pacman.y * this.tileSize + this.tileSize/2;
        const radius = this.tileSize/2 - 2;
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        
        if (this.pacman.mouthOpen) {
            // 张嘴的吃豆人
            const startAngle = this.pacman.direction * Math.PI/2 + Math.PI/6;
            const endAngle = this.pacman.direction * Math.PI/2 - Math.PI/6;
            this.ctx.arc(drawX, drawY, radius, startAngle, endAngle);
            this.ctx.lineTo(drawX, drawY);
        } else {
            // 闭嘴的吃豆人
            this.ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
        }
        
        this.ctx.fill();
    }
    
    drawGhosts() {
        this.ghosts.forEach(ghost => {
            const drawX = ghost.x * this.tileSize + this.tileSize/2;
            const drawY = ghost.y * this.tileSize + this.tileSize/2;
            const radius = this.tileSize/2 - 2;
            
            // 幽灵颜色
            if (this.ghostScaredMode) {
                this.ctx.fillStyle = '#0000ff';
            } else {
                this.ctx.fillStyle = ghost.color;
            }
            
            // 绘制幽灵身体
            this.ctx.beginPath();
            this.ctx.arc(drawX, drawY - radius/2, radius, Math.PI, 0);
            this.ctx.rect(drawX - radius, drawY - radius/2, radius * 2, radius * 1.5);
            
            // 绘制幽灵底部的锯齿
            const zigzagHeight = 4;
            const zigzagWidth = radius * 2 / 4;
            this.ctx.moveTo(drawX - radius, drawY + radius);
            for (let i = 0; i < 4; i++) {
                const x = drawX - radius + i * zigzagWidth + zigzagWidth/2;
                this.ctx.lineTo(x, drawY + radius - zigzagHeight);
                this.ctx.lineTo(drawX - radius + (i + 1) * zigzagWidth, drawY + radius);
            }
            
            this.ctx.fill();
            
            // 绘制眼睛
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(drawX - radius/3, drawY - radius/3, 3, 0, Math.PI * 2);
            this.ctx.arc(drawX + radius/3, drawY - radius/3, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(drawX - radius/3, drawY - radius/3, 1, 0, Math.PI * 2);
            this.ctx.arc(drawX + radius/3, drawY - radius/3, 1, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
        
        // 更新无敌状态显示
        const powerModeDiv = document.getElementById('powerMode');
        const powerTimerSpan = document.getElementById('powerTimer');
        
        if (this.ghostScaredMode && this.powerPelletStartTime > 0) {
            const elapsedTime = Date.now() - this.powerPelletStartTime;
            const remainingTime = Math.max(0, Math.ceil((15000 - elapsedTime) / 1000));
            powerModeDiv.style.display = 'block';
            powerTimerSpan.textContent = remainingTime;
        } else {
            powerModeDiv.style.display = 'none';
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').style.display = 'block';
    }
    
    gameLoop() {
        this.update();
        this.render();
        
        if (this.gameRunning) {
            setTimeout(() => this.gameLoop(), 150); // 约6.7 FPS
        }
    }
}

// 重新开始游戏
function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    game = new PacmanGame();
}

// 启动游戏
let game;
window.addEventListener('load', () => {
    game = new PacmanGame();
});