// 游戏画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameStatus = document.getElementById('gameStatus');

// 游戏状态
let gameState = 'playing'; // 'playing', 'gameOver'
let winner = null;

// 键盘输入状态
const keys = {};

// 地形数组
let terrain = [];

// 粒子系统
let particles = [];

// 血包系统
let healthPacks = [];
let lastHealthPackSpawn = 0;
const healthPackSpawnInterval = 5000; // 5秒生成一个血包

// 坦克类
class Tank {
    constructor(x, y, color, controls) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.color = color;
        this.angle = 0;
        this.speed = 2;
        this.controls = controls;
        this.bullets = [];
        this.lastShot = 0;
        this.shotCooldown = 300; // 射击冷却时间（毫秒）
        this.health = 3;
    }
    
    update() {
        if (gameState !== 'playing') return;
        
        // 移动控制
        let newX = this.x;
        let newY = this.y;
        let newAngle = this.angle;
        
        if (keys[this.controls.up]) {
            newX += Math.cos(this.angle) * this.speed;
            newY += Math.sin(this.angle) * this.speed;
        }
        if (keys[this.controls.down]) {
            newX -= Math.cos(this.angle) * this.speed;
            newY -= Math.sin(this.angle) * this.speed;
        }
        if (keys[this.controls.left]) {
            newAngle -= 0.05;
        }
        if (keys[this.controls.right]) {
            newAngle += 0.05;
        }
        
        // 边界检测
        if (newX >= 0 && newX <= canvas.width - this.width &&
            newY >= 0 && newY <= canvas.height - this.height) {
            // 地形碰撞检测
            if (!this.checkTerrainCollision(newX, newY)) {
                this.x = newX;
                this.y = newY;
            }
        }
        
        this.angle = newAngle;
        
        // 射击
        if (keys[this.controls.shoot] && Date.now() - this.lastShot > this.shotCooldown) {
            this.shoot();
            this.lastShot = Date.now();
        }
        
        // 更新子弹
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.active;
        });
        
        // 血包碰撞检测
        healthPacks.forEach((healthPack, index) => {
            if (healthPack.active &&
                this.x < healthPack.x + healthPack.width &&
                this.x + this.width > healthPack.x &&
                this.y < healthPack.y + healthPack.height &&
                this.y + this.height > healthPack.y) {
                
                // 回复生命值（最大不超过3点）
                if (this.health < 3) {
                    this.health++;
                    healthPack.active = false;
                    
                    // 创建回复效果粒子
                    for (let i = 0; i < 8; i++) {
                        particles.push(new Particle(
                            healthPack.x + healthPack.width / 2,
                            healthPack.y + healthPack.height / 2,
                            Math.random() * Math.PI * 2,
                            2 + Math.random() * 3,
                            '#00FF00'
                        ));
                    }
                }
            }
        });
    }
    
    checkTerrainCollision(x, y) {
        for (let obstacle of terrain) {
            if (x < obstacle.x + obstacle.width &&
                x + this.width > obstacle.x &&
                y < obstacle.y + obstacle.height &&
                y + this.height > obstacle.y) {
                return true;
            }
        }
        return false;
    }
    
    shoot() {
        const bulletX = this.x + this.width / 2 + Math.cos(this.angle) * 25;
        const bulletY = this.y + this.height / 2 + Math.sin(this.angle) * 25;
        this.bullets.push(new Bullet(bulletX, bulletY, this.angle, this.color));
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        
        // 绘制坦克主体
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // 绘制炮管
        ctx.fillStyle = '#333';
        ctx.fillRect(0, -3, 25, 6);
        
        // 绘制坦克装饰
        ctx.fillStyle = '#000';
        ctx.fillRect(-15, -15, 8, 8);
        ctx.fillRect(-15, 7, 8, 8);
        ctx.fillRect(7, -15, 8, 8);
        ctx.fillRect(7, 7, 8, 8);
        
        ctx.restore();
        
        // 绘制子弹
        this.bullets.forEach(bullet => bullet.draw());
    }
}

// 子弹类
class Bullet {
    constructor(x, y, angle, color) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 5;
        this.originalSpeed = 5;
        this.radius = 3;
        this.color = color;
        this.active = true;
        this.bounces = 0;
        this.maxBounces = 2; // 最大反射次数
        this.trail = []; // 子弹轨迹
        this.trailLength = 8;
        this.speedDecay = 0.85; // 反射后速度衰减系数
    }
    
    update() {
        // 保存当前位置到轨迹
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
        
        const nextX = this.x + Math.cos(this.angle) * this.speed;
        const nextY = this.y + Math.sin(this.angle) * this.speed;
        
        // 边界反射检测
        let reflected = false;
        if (nextX <= this.radius || nextX >= canvas.width - this.radius) {
            if (this.bounces < this.maxBounces) {
                this.angle = Math.PI - this.angle; // 水平反射
                this.speed *= this.speedDecay; // 速度衰减
                this.bounces++;
                reflected = true;
                this.createBounceEffect();
            } else {
                this.active = false;
                return;
            }
        }
        
        if (nextY <= this.radius || nextY >= canvas.height - this.radius) {
            if (this.bounces < this.maxBounces) {
                this.angle = -this.angle; // 垂直反射
                this.speed *= this.speedDecay; // 速度衰减
                this.bounces++;
                reflected = true;
                this.createBounceEffect();
            } else {
                this.active = false;
                return;
            }
        }
        
        // 地形碰撞和反射检测
        if (!reflected) {
            for (let obstacle of terrain) {
                if (nextX + this.radius > obstacle.x && nextX - this.radius < obstacle.x + obstacle.width &&
                    nextY + this.radius > obstacle.y && nextY - this.radius < obstacle.y + obstacle.height) {
                    
                    if (this.bounces < this.maxBounces) {
                        // 计算反射方向
                        const centerX = obstacle.x + obstacle.width / 2;
                        const centerY = obstacle.y + obstacle.height / 2;
                        
                        const deltaX = this.x - centerX;
                        const deltaY = this.y - centerY;
                        
                        // 判断碰撞面
                        if (Math.abs(deltaX / obstacle.width) > Math.abs(deltaY / obstacle.height)) {
                            // 水平面碰撞
                            this.angle = Math.PI - this.angle;
                        } else {
                            // 垂直面碰撞
                            this.angle = -this.angle;
                        }
                        
                        this.speed *= this.speedDecay; // 速度衰减
                        this.bounces++;
                        reflected = true;
                        this.createBounceEffect();
                        break;
                    } else {
                        this.active = false;
                        return;
                    }
                }
            }
        }
        
        // 更新位置
        if (reflected) {
            // 反射后重新计算位置
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
        } else {
            this.x = nextX;
            this.y = nextY;
        }
        
        // 坦克碰撞检测
        [player1, player2].forEach(tank => {
            if (this.color !== tank.color && 
                this.x + this.radius > tank.x && this.x - this.radius < tank.x + tank.width &&
                this.y + this.radius > tank.y && this.y - this.radius < tank.y + tank.height) {
                this.active = false;
                tank.health--;
                if (tank.health <= 0) {
                    gameState = 'gameOver';
                    winner = this.color === player1.color ? '玩家1' : '玩家2';
                    updateGameStatus();
                }
            }
        });
    }
    
    createBounceEffect() {
        // 创建反射粒子效果
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(
                this.x, 
                this.y, 
                Math.random() * Math.PI * 2, 
                2 + Math.random() * 3,
                this.color
            ));
        }
    }
    
    draw() {
        // 绘制子弹轨迹
        if (this.trail.length > 1) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // 绘制子弹主体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 根据反射次数添加视觉效果
        if (this.bounces > 0) {
            // 添加光晕效果
            const glowRadius = this.radius + this.bounces * 2;
            const gradient = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, glowRadius);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            
            // 添加闪烁效果
            if (Math.floor(Date.now() / 100) % 2) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 1, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
}

// 粒子类
class Particle {
    constructor(x, y, angle, speed, color) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.color = color;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = 2 + Math.random() * 3;
    }
    
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life -= this.decay;
        this.speed *= 0.98; // 粒子速度衰减
        
        return this.life > 0;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 血包类
class HealthPack {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.active = true;
        this.pulseTime = 0;
    }
    
    update() {
        this.pulseTime += 0.1;
    }
    
    draw() {
        if (!this.active) return;
        
        ctx.save();
        
        // 脉冲效果
        const pulse = 1 + Math.sin(this.pulseTime) * 0.2;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.scale(pulse, pulse);
        
        // 绘制红十字背景
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // 绘制白色十字
        ctx.fillStyle = '#FFFFFF';
        // 垂直线
        ctx.fillRect(-2, -this.height / 2 + 2, 4, this.height - 4);
        // 水平线
        ctx.fillRect(-this.width / 2 + 2, -2, this.width - 4, 4);
        
        // 添加光晕效果
        ctx.shadowColor = '#FF6B6B';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.restore();
    }
}

// 地形障碍物类
class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    draw() {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 添加纹理效果
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        // 添加边框
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// 生成随机地形
function generateTerrain() {
    terrain = [];
    
    // 生成随机障碍物
    for (let i = 0; i < 8; i++) {
        let x, y, width, height;
        let validPosition = false;
        let attempts = 0;
        
        while (!validPosition && attempts < 50) {
            width = 40 + Math.random() * 60;
            height = 40 + Math.random() * 60;
            x = Math.random() * (canvas.width - width);
            y = Math.random() * (canvas.height - height);
            
            // 确保障碍物不会阻挡坦克的初始位置
            const player1Area = { x: 50, y: 50, width: 100, height: 100 };
            const player2Area = { x: canvas.width - 150, y: canvas.height - 150, width: 100, height: 100 };
            
            if (!isOverlapping(x, y, width, height, player1Area) &&
                !isOverlapping(x, y, width, height, player2Area)) {
                validPosition = true;
            }
            attempts++;
        }
        
        if (validPosition) {
            terrain.push(new Obstacle(x, y, width, height));
        }
    }
    
    // 添加边界墙
    terrain.push(new Obstacle(0, 0, canvas.width, 10)); // 上墙
    terrain.push(new Obstacle(0, canvas.height - 10, canvas.width, 10)); // 下墙
    terrain.push(new Obstacle(0, 0, 10, canvas.height)); // 左墙
    terrain.push(new Obstacle(canvas.width - 10, 0, 10, canvas.height)); // 右墙
}

// 检查两个矩形是否重叠
function isOverlapping(x1, y1, w1, h1, rect2) {
    return x1 < rect2.x + rect2.width &&
           x1 + w1 > rect2.x &&
           y1 < rect2.y + rect2.height &&
           y1 + h1 > rect2.y;
}

// 生成血包
function spawnHealthPack() {
    let x, y;
    let validPosition = false;
    let attempts = 0;
    
    while (!validPosition && attempts < 50) {
        x = Math.random() * (canvas.width - 20);
        y = Math.random() * (canvas.height - 20);
        
        // 检查是否与地形重叠
        validPosition = true;
        for (let obstacle of terrain) {
            if (isOverlapping(x, y, 20, 20, obstacle)) {
                validPosition = false;
                break;
            }
        }
        
        // 检查是否与坦克重叠
        if (validPosition) {
            if (isOverlapping(x, y, 20, 20, {x: player1.x, y: player1.y, width: player1.width, height: player1.height}) ||
                isOverlapping(x, y, 20, 20, {x: player2.x, y: player2.y, width: player2.width, height: player2.height})) {
                validPosition = false;
            }
        }
        
        attempts++;
    }
    
    if (validPosition) {
        healthPacks.push(new HealthPack(x, y));
    }
}

// 创建玩家
const player1 = new Tank(100, 100, '#4169E1', {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    shoot: 'Space'
});

const player2 = new Tank(canvas.width - 140, canvas.height - 140, '#DC143C', {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    shoot: 'Enter'
});

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    e.preventDefault();
});

// 更新游戏状态显示
function updateGameStatus() {
    if (gameState === 'playing') {
        gameStatus.textContent = `游戏进行中... | 玩家1血量: ${player1.health}/3 | 玩家2血量: ${player2.health}/3`;
    } else if (gameState === 'gameOver') {
        gameStatus.textContent = `🎉 ${winner} 获胜！🎉`;
    }
}

// 重新开始游戏
function restartGame() {
    gameState = 'playing';
    winner = null;
    
    // 重置玩家位置和状态
    player1.x = 100;
    player1.y = 100;
    player1.angle = 0;
    player1.health = 3;
    player1.bullets = [];
    
    player2.x = canvas.width - 140;
    player2.y = canvas.height - 140;
    player2.angle = Math.PI;
    player2.health = 3;
    player2.bullets = [];
    
    // 清空粒子和血包
    particles = [];
    healthPacks = [];
    lastHealthPackSpawn = Date.now();
    
    // 重新生成地形
    generateTerrain();
    
    updateGameStatus();
}

// 游戏主循环
function gameLoop() {
    // 清空画布
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 血包生成逻辑
    if (gameState === 'playing' && Date.now() - lastHealthPackSpawn > healthPackSpawnInterval) {
        // 检查当前活跃血包数量，最多只能有2个
        const activeHealthPacks = healthPacks.filter(hp => hp.active).length;
        if (activeHealthPacks < 2) {
            spawnHealthPack();
        }
        lastHealthPackSpawn = Date.now();
    }
    
    // 绘制地形
    terrain.forEach(obstacle => obstacle.draw());
    
    // 更新和绘制血包
    healthPacks = healthPacks.filter(healthPack => {
        if (healthPack.active) {
            healthPack.update();
            healthPack.draw();
            return true;
        }
        return false;
    });
    
    // 更新和绘制粒子
    particles = particles.filter(particle => {
        const alive = particle.update();
        if (alive) {
            particle.draw();
        }
        return alive;
    });
    
    // 更新和绘制玩家
    player1.update();
    player1.draw();
    
    player2.update();
    player2.draw();
    
    // 更新游戏状态显示
    if (gameState === 'playing') {
        updateGameStatus();
    }
    
    requestAnimationFrame(gameLoop);
}

// 初始化游戏
function initGame() {
    generateTerrain();
    updateGameStatus();
    gameLoop();
}

// 启动游戏
initGame();

// 防止页面滚动
document.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
});