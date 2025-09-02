class MazeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.gamePaused = false;
        
        // 游戏配置
        this.cellSize = 20;
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        
        // 游戏状态
        this.score = 0;
        this.lives = 3;
        this.startTime = 0;
        this.currentTime = 0;
        
        // 玩家
        this.player = {
            x: 1,
            y: 1,
            size: this.cellSize - 4,
            color: '#0000ff',
            invincible: false,
            invincibleTime: 0
        };
        
        // 出口
        this.exit = {
            x: this.cols - 2,
            y: this.rows - 2,
            size: this.cellSize - 4,
            color: '#ffff00'
        };
        
        // 静态墙壁
        this.staticWalls = [];
        
        // 活动墙壁
        this.movingWalls = [];
        
        // 初始化游戏
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.generateMaze();
        this.generateMovingWalls();
        this.updateDisplay();
    }
    
    generateMaze() {
        // 生成基础迷宫结构
        this.staticWalls = [];
        
        // 边界墙
        for (let x = 0; x < this.cols; x++) {
            this.staticWalls.push({x, y: 0, type: 'static'});
            this.staticWalls.push({x, y: this.rows - 1, type: 'static'});
        }
        for (let y = 0; y < this.rows; y++) {
            this.staticWalls.push({x: 0, y, type: 'static'});
            this.staticWalls.push({x: this.cols - 1, y, type: 'static'});
        }
        
        // 随机内部墙
        for (let i = 0; i < this.cols * this.rows / 8; i++) {
            let x = Math.floor(Math.random() * (this.cols - 2)) + 1;
            let y = Math.floor(Math.random() * (this.rows - 2)) + 1;
            
            // 避免在玩家起点和终点附近生成墙
            if ((x === 1 && y === 1) || (x === this.exit.x && y === this.exit.y)) {
                continue;
            }
            
            this.staticWalls.push({x, y, type: 'static'});
        }
        
        // 确保路径可达
        this.ensurePathExists();
    }
    
    ensurePathExists() {
        // 简单的路径生成算法
        let path = [];
        let current = {x: 1, y: 1};
        let target = {x: this.exit.x, y: this.exit.y};
        
        while (current.x !== target.x || current.y !== target.y) {
            path.push({...current});
            
            if (current.x < target.x) current.x++;
            else if (current.x > target.x) current.x--;
            
            if (current.y < target.y) current.y++;
            else if (current.y > target.y) current.y--;
        }
        path.push({...target});
        
        // 移除路径上的墙
        this.staticWalls = this.staticWalls.filter(wall => {
            return !path.some(pathCell => pathCell.x === wall.x && pathCell.y === wall.y);
        });
    }
    
    generateMovingWalls() {
        this.movingWalls = [];
        
        // 生成3-5个活动墙壁
        const numMovingWalls = Math.floor(Math.random() * 3) + 3;
        const minDistance = 4; // 移动墙壁之间的最小距离
        const maxAttempts = 50; // 最大尝试次数
        
        for (let i = 0; i < numMovingWalls; i++) {
            let wall = null;
            let attempts = 0;
            
            // 尝试找到一个分散的位置
            while (attempts < maxAttempts) {
                const x = Math.floor(Math.random() * (this.cols - 2)) + 1;
                const y = Math.floor(Math.random() * (this.rows - 2)) + 1;
                
                // 检查是否与玩家起点和终点冲突
                if ((x === 1 && y === 1) || (x === this.exit.x && y === this.exit.y)) {
                    attempts++;
                    continue;
                }
                
                // 检查是否与静态墙壁冲突
                const conflictWithStatic = this.staticWalls.some(staticWall => 
                    staticWall.x === x && staticWall.y === y
                );
                
                if (conflictWithStatic) {
                    attempts++;
                    continue;
                }
                
                // 检查与其他移动墙壁的距离
                const tooClose = this.movingWalls.some(existingWall => {
                    const distance = Math.sqrt(
                        Math.pow(existingWall.x - x, 2) + Math.pow(existingWall.y - y, 2)
                    );
                    return distance < minDistance;
                });
                
                if (!tooClose) {
                    wall = {
                         x: x,
                         y: y,
                         type: 'moving',
                         direction: Math.random() < 0.5 ? 'horizontal' : 'vertical',
                         speed: (Math.random() * 0.25 + 0.15) * 0.9, // 0.135 到 0.36 的速度，稍微降低
                         range: Math.floor(Math.random() * 3) + 3, // 移动范围 3-5，增加移动范围
                         startPos: 0,
                         currentOffset: 0
                     };
                    
                    if (wall.direction === 'horizontal') {
                        wall.startPos = wall.x;
                    } else {
                        wall.startPos = wall.y;
                    }
                    
                    break;
                }
                
                attempts++;
            }
            
            // 如果找到了合适的位置，添加墙壁
            if (wall) {
                this.movingWalls.push(wall);
            }
        }
    }
    
    updateMovingWalls() {
        this.movingWalls.forEach(wall => {
            // 计算下一个位置
            let nextX = wall.x;
            let nextY = wall.y;
            
            if (wall.direction === 'horizontal') {
                const nextOffset = wall.currentOffset + wall.speed;
                nextX = wall.startPos + nextOffset;
            } else {
                const nextOffset = wall.currentOffset + wall.speed;
                nextY = wall.startPos + nextOffset;
            }
            
            // 检查边界碰撞
            let hitBoundary = false;
            if (nextX <= 0 || nextX >= this.cols - 1 || nextY <= 0 || nextY >= this.rows - 1) {
                hitBoundary = true;
            }
            
            // 检查与静态墙壁的碰撞
            let hitStaticWall = false;
            if (!hitBoundary) {
                hitStaticWall = this.staticWalls.some(staticWall => 
                    Math.floor(nextX) === staticWall.x && Math.floor(nextY) === staticWall.y
                );
            }
            
            // 如果碰撞，反弹
            if (hitBoundary || hitStaticWall) {
                wall.speed = -wall.speed;
            } else {
                // 没有碰撞，正常移动
                if (wall.direction === 'horizontal') {
                    wall.currentOffset += wall.speed;
                    wall.x = wall.startPos + wall.currentOffset;
                } else {
                    wall.currentOffset += wall.speed;
                    wall.y = wall.startPos + wall.currentOffset;
                }
            }
            
            // 检查移动范围限制（作为额外的安全措施）
            if (Math.abs(wall.currentOffset) > wall.range) {
                wall.speed = -wall.speed;
            }
            
            // 确保墙壁不会超出边界（最终安全检查）
            wall.x = Math.max(1, Math.min(this.cols - 2, wall.x));
            wall.y = Math.max(1, Math.min(this.rows - 2, wall.y));
        });
    }
    
    updatePlayerState() {
        // 更新无敌状态
        if (this.player.invincible && Date.now() > this.player.invincibleTime) {
            this.player.invincible = false;
        }
    }
    
    checkCollision(x, y) {
        // 检查静态墙碰撞
        const staticWallHit = this.staticWalls.some(wall => wall.x === x && wall.y === y);
        if (staticWallHit) {
            return { type: 'static', hit: true };
        }
        
        // 检查活动墙碰撞 - 改进碰撞检测精度
        const movingWallHit = this.movingWalls.some(wall => {
            // 计算墙壁的实际占用范围
            const wallLeft = wall.x;
            const wallRight = wall.x + 1;
            const wallTop = wall.y;
            const wallBottom = wall.y + 1;
            
            // 玩家的占用范围
            const playerLeft = x;
            const playerRight = x + 1;
            const playerTop = y;
            const playerBottom = y + 1;
            
            // 检查矩形重叠
            return !(playerRight <= wallLeft || 
                    playerLeft >= wallRight || 
                    playerBottom <= wallTop || 
                    playerTop >= wallBottom);
        });
        
        if (movingWallHit) {
            return { type: 'moving', hit: true };
        }
        
        return { type: 'none', hit: false };
    }
    
    movePlayer(dx, dy) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        // 检查边界
        if (newX < 1 || newX >= this.cols - 1 || newY < 1 || newY >= this.rows - 1) {
            return;
        }
        
        // 检查碰撞
        const collision = this.checkCollision(newX, newY);
        if (collision.hit) {
            if (collision.type === 'static') {
                // 碰到静态墙壁，不移动，不掉血
                return;
            } else if (collision.type === 'moving' && !this.player.invincible) {
                // 碰到活动墙壁且不在无敌状态，掉血并获得无敌时间
                this.loseLife();
                this.player.invincible = true;
                this.player.invincibleTime = Date.now() + 3000; // 3秒无敌时间
                return;
            } else if (collision.type === 'moving' && this.player.invincible) {
                // 在无敌状态下碰到活动墙壁，不掉血但也不能移动
                return;
            }
        }
        
        // 移动玩家
        this.player.x = newX;
        this.player.y = newY;
        
        // 检查是否到达出口
        if (this.player.x === this.exit.x && this.player.y === this.exit.y) {
            this.winGame();
        }
        
        // 增加分数
        this.score += 1;
        this.updateDisplay();
    }
    
    loseLife() {
        this.lives--;
        this.updateDisplay();
        
        if (this.lives <= 0) {
            this.gameOver(false);
        } else {
            // 短暂暂停但不重置位置
            this.gamePaused = true;
            setTimeout(() => {
                this.gamePaused = false;
            }, 1000);
        }
    }
    
    winGame() {
        this.gameOver(true);
    }
    
    gameOver(won) {
        this.gameRunning = false;
        
        const gameOverDiv = document.getElementById('gameOver');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        
        if (won) {
            title.textContent = '恭喜通关！';
            title.style.color = '#48bb78';
            message.textContent = `你成功到达了迷宫出口！\n用时: ${this.currentTime}秒\n最终分数: ${this.score}`;
        } else {
            title.textContent = '游戏结束';
            title.style.color = '#e53e3e';
            message.textContent = `你的生命值耗尽了！\n最终分数: ${this.score}`;
        }
        
        gameOverDiv.style.display = 'flex';
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('timer').textContent = this.currentTime;
    }
    
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景网格
        this.ctx.strokeStyle = '#003300';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.cellSize);
            this.ctx.stroke();
        }
        
        // 绘制静态墙
        this.ctx.fillStyle = '#00aa00';
        this.staticWalls.forEach(wall => {
            this.ctx.fillRect(
                wall.x * this.cellSize + 2,
                wall.y * this.cellSize + 2,
                this.cellSize - 4,
                this.cellSize - 4
            );
        });
        
        // 绘制活动墙
        this.ctx.fillStyle = '#ff0000';
        this.movingWalls.forEach(wall => {
            this.ctx.fillRect(
                wall.x * this.cellSize + 2,
                wall.y * this.cellSize + 2,
                this.cellSize - 4,
                this.cellSize - 4
            );
        });
        
        // 绘制出口
        this.ctx.fillStyle = this.exit.color;
        this.ctx.fillRect(
            this.exit.x * this.cellSize + 2,
            this.exit.y * this.cellSize + 2,
            this.exit.size,
            this.exit.size
        );
        
        // 绘制玩家
        if (this.player.invincible) {
            // 无敌状态下闪烁效果
            const blinkRate = Math.floor(Date.now() / 200) % 2;
            this.ctx.fillStyle = blinkRate ? '#ffff00' : this.player.color;
        } else {
            this.ctx.fillStyle = this.player.color;
        }
        this.ctx.fillRect(
            this.player.x * this.cellSize + 2,
            this.player.y * this.cellSize + 2,
            this.player.size,
            this.player.size
        );
        
        // 如果游戏暂停，显示暂停提示
        if (this.gamePaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = '24px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('生命值减少！', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.currentTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.updateMovingWalls();
        this.updatePlayerState();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.score = 0;
        this.lives = 3;
        this.startTime = Date.now();
        this.currentTime = 0;
        
        // 重置玩家位置和状态
        this.player.x = 1;
        this.player.y = 1;
        this.player.invincible = false;
        this.player.invincibleTime = 0;
        
        // 重新生成迷宫和活动墙
        this.generateMaze();
        this.generateMovingWalls();
        
        this.updateDisplay();
        this.gameLoop();
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('restartBtn').style.display = 'inline-block';
    }
    
    restartGame() {
        this.startGame();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.movePlayer(1, 0);
                    break;
            }
        });
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            document.getElementById('gameOver').style.display = 'none';
            this.startGame();
        });
        
        // 触摸控制（移动设备）
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.gamePaused) return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) this.movePlayer(1, 0);
                else if (deltaX < -30) this.movePlayer(-1, 0);
            } else {
                if (deltaY > 30) this.movePlayer(0, 1);
                else if (deltaY < -30) this.movePlayer(0, -1);
            }
        });
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new MazeGame();
});
