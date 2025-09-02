// 游戏配置
const CONFIG = {
    GRID_SIZE: 50,
    CELL_SIZE: 10,
    INITIAL_SPEED: 150,
    SPEED_BOOST_MULTIPLIER: 0.7,
    SPEED_BOOST_DURATION: 3000,
    FOOD_TYPES: {
        NORMAL: { emoji: '🍎', color: '#ff4757', points: 10, growth: 1 },
        SPEED: { emoji: '⚡', color: '#ffa502', points: 20, growth: 1 },
        GROWTH: { emoji: '🌟', color: '#2ed573', points: 30, growth: 2 },
        SPECIAL: { emoji: '💎', color: '#ff6b9d', points: 50, growth: 3 }
    },
    DIFFICULTIES: {
        easy: { name: '简单', walls: 0, speed: 150 },
        medium: { name: '中等', walls: 8, speed: 120 },
        hard: { name: '困难', walls: 16, speed: 100 }
    }
};

// 游戏状态
class GameState {
    constructor() {
        this.reset();
        this.difficulty = 'easy';
    }

    reset() {
        this.score = 0;
        this.length = 1;
        this.isPlaying = false;
        this.isPaused = false;
        this.gameOver = false;
        this.speedBoostActive = false;
        this.speedBoostTimer = 0;
    }
}

// 蛇类
class Snake {
    constructor() {
        this.reset();
    }

    reset() {
        this.body = [{ x: 25, y: 25 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
    }

    move() {
        this.direction = { ...this.nextDirection };
        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        this.body.unshift(head);
    }

    grow(segments = 1) {
        for (let i = 0; i < segments; i++) {
            const tail = { ...this.body[this.body.length - 1] };
            this.body.push(tail);
        }
    }

    checkSelfCollision() {
        const head = this.body[0];
        return this.body.slice(1).some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    checkWallCollision() {
        const head = this.body[0];
        return head.x < 0 || head.x >= CONFIG.GRID_SIZE || 
               head.y < 0 || head.y >= CONFIG.GRID_SIZE;
    }

    checkObstacleCollision(obstacles) {
        const head = this.body[0];
        return obstacles.some(obstacle => 
            obstacle.x === head.x && obstacle.y === head.y
        );
    }

    setDirection(newDirection) {
        // 防止反向移动
        if (this.direction.x !== -newDirection.x || this.direction.y !== -newDirection.y) {
            this.nextDirection = newDirection;
        }
    }
}

// 食物管理器
class FoodManager {
    constructor() {
        this.foods = [];
        this.maxFoods = 4;
    }

    generateFood(snake, obstacles) {
        if (this.foods.length >= this.maxFoods) return;

        let position;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            position = {
                x: Math.floor(Math.random() * CONFIG.GRID_SIZE),
                y: Math.floor(Math.random() * CONFIG.GRID_SIZE)
            };
            attempts++;
        } while (
            attempts < maxAttempts && (
                this.isPositionOccupied(position, snake, obstacles) ||
                this.foods.some(food => food.x === position.x && food.y === position.y)
            )
        );

        if (attempts < maxAttempts) {
            const foodType = this.getRandomFoodType();
            this.foods.push({
                ...position,
                type: foodType,
                ...CONFIG.FOOD_TYPES[foodType]
            });
        }
    }

    isPositionOccupied(position, snake, obstacles) {
        return snake.body.some(segment => 
            segment.x === position.x && segment.y === position.y
        ) || obstacles.some(obstacle => 
            obstacle.x === position.x && obstacle.y === position.y
        );
    }

    getRandomFoodType() {
        const types = Object.keys(CONFIG.FOOD_TYPES);
        const weights = [0.5, 0.25, 0.15, 0.1]; // 普通食物概率最高
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < types.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return types[i];
            }
        }
        return 'NORMAL';
    }

    checkCollision(snake) {
        const head = snake.body[0];
        const foodIndex = this.foods.findIndex(food => 
            food.x === head.x && food.y === head.y
        );
        
        if (foodIndex !== -1) {
            const food = this.foods[foodIndex];
            this.foods.splice(foodIndex, 1);
            return food;
        }
        return null;
    }

    clear() {
        this.foods = [];
    }
}

// 关卡生成器
class LevelGenerator {
    static generateObstacles(difficulty) {
        const obstacles = [];
        const config = CONFIG.DIFFICULTIES[difficulty];
        const wallCount = config.walls;

        for (let i = 0; i < wallCount; i++) {
            let position;
            let attempts = 0;
            const maxAttempts = 50;

            do {
                position = {
                    x: Math.floor(Math.random() * CONFIG.GRID_SIZE),
                    y: Math.floor(Math.random() * CONFIG.GRID_SIZE)
                };
                attempts++;
            } while (
                attempts < maxAttempts && (
                    this.isNearCenter(position) ||
                    obstacles.some(obs => obs.x === position.x && obs.y === position.y)
                )
            );

            if (attempts < maxAttempts) {
                obstacles.push(position);
            }
        }

        return obstacles;
    }

    static isNearCenter(position) {
        const center = CONFIG.GRID_SIZE / 2;
        const distance = Math.abs(position.x - center) + Math.abs(position.y - center);
        return distance < 5; // 避免在蛇的初始位置附近生成障碍物
    }
}

// 渲染器
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
        this.canvas.height = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
    }

    clear() {
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawSnake(snake) {
        snake.body.forEach((segment, index) => {
            const x = segment.x * CONFIG.CELL_SIZE;
            const y = segment.y * CONFIG.CELL_SIZE;
            
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.fillRect(x, y, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
                
                // 眼睛
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(x + 2, y + 2, 2, 2);
                this.ctx.fillRect(x + 6, y + 2, 2, 2);
            } else {
                // 蛇身
                this.ctx.fillStyle = index % 2 === 1 ? '#27ae60' : '#2ecc71';
                this.ctx.fillRect(x + 1, y + 1, CONFIG.CELL_SIZE - 2, CONFIG.CELL_SIZE - 2);
            }
        });
    }

    drawFood(foods) {
        foods.forEach(food => {
            const x = food.x * CONFIG.CELL_SIZE;
            const y = food.y * CONFIG.CELL_SIZE;
            
            // 绘制食物背景
            this.ctx.fillStyle = food.color;
            this.ctx.beginPath();
            this.ctx.arc(
                x + CONFIG.CELL_SIZE / 2, 
                y + CONFIG.CELL_SIZE / 2, 
                CONFIG.CELL_SIZE / 2 - 1, 
                0, 
                2 * Math.PI
            );
            this.ctx.fill();
            
            // 绘制食物图标
            this.ctx.font = `${CONFIG.CELL_SIZE - 2}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                food.emoji,
                x + CONFIG.CELL_SIZE / 2,
                y + CONFIG.CELL_SIZE / 2
            );
        });
    }

    drawObstacles(obstacles) {
        this.ctx.fillStyle = '#34495e';
        obstacles.forEach(obstacle => {
            const x = obstacle.x * CONFIG.CELL_SIZE;
            const y = obstacle.y * CONFIG.CELL_SIZE;
            this.ctx.fillRect(x, y, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
            
            // 添加纹理
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.fillRect(x + 1, y + 1, CONFIG.CELL_SIZE - 2, CONFIG.CELL_SIZE - 2);
            this.ctx.fillStyle = '#34495e';
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = '#ecf0f1';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= CONFIG.GRID_SIZE; i++) {
            const pos = i * CONFIG.CELL_SIZE;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }
    }
}

// 主游戏类
class SnakeGame {
    constructor() {
        this.gameState = new GameState();
        this.snake = new Snake();
        this.foodManager = new FoodManager();
        this.obstacles = [];
        
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        
        this.gameLoop = null;
        this.lastTime = 0;
        
        this.initializeUI();
        this.setupEventListeners();
        this.showScreen('menu-screen');
    }

    initializeUI() {
        this.elements = {
            screens: {
                menu: document.getElementById('menu-screen'),
                difficulty: document.getElementById('difficulty-screen'),
                controls: document.getElementById('controls-screen'),
                game: document.getElementById('game-screen')
            },
            buttons: {
                start: document.getElementById('start-btn'),
                difficulty: document.getElementById('difficulty-btn'),
                controls: document.getElementById('controls-btn'),
                backToMenu: document.getElementById('back-to-menu'),
                backToMenu2: document.getElementById('back-to-menu-2'),
                pause: document.getElementById('pause-btn'),
                restart: document.getElementById('restart-btn'),
                resume: document.getElementById('resume-btn'),
                menu: document.getElementById('menu-btn'),

            },
            info: {
                score: document.getElementById('score'),
                length: document.getElementById('length'),
                difficulty: document.getElementById('current-difficulty')
            },
            overlay: {
                container: document.getElementById('game-overlay'),
                title: document.getElementById('overlay-title'),
                message: document.getElementById('overlay-message')
            },
            effect: {
                indicator: document.getElementById('effect-indicator'),
                text: document.getElementById('effect-text'),
                timer: document.getElementById('effect-timer')
            }
        };
    }

    setupEventListeners() {
        // 菜单按钮
        this.elements.buttons.start.addEventListener('click', () => this.startGame());
        this.elements.buttons.difficulty.addEventListener('click', () => this.showScreen('difficulty-screen'));
        this.elements.buttons.controls.addEventListener('click', () => this.showScreen('controls-screen'));
        this.elements.buttons.backToMenu.addEventListener('click', () => this.showScreen('menu-screen'));
        this.elements.buttons.backToMenu2.addEventListener('click', () => this.showScreen('menu-screen'));
        
        // 难度选择
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.gameState.difficulty = btn.dataset.level;
                this.showScreen('menu-screen');
            });
        });
        
        // 游戏控制
        this.elements.buttons.pause.addEventListener('click', () => this.togglePause());
        this.elements.buttons.restart.addEventListener('click', () => this.restartGame());
        this.elements.buttons.resume.addEventListener('click', () => {
            if (this.gameState.gameOver) {
                this.restartGame();
            } else {
                this.togglePause();
            }
        });
        this.elements.buttons.menu.addEventListener('click', () => this.returnToMenu());
        

        
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        if (!this.gameState.isPlaying || this.gameState.isPaused) {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
            }
            return;
        }

        const directions = {
            'ArrowUp': { x: 0, y: -1 },
            'ArrowDown': { x: 0, y: 1 },
            'ArrowLeft': { x: -1, y: 0 },
            'ArrowRight': { x: 1, y: 0 },
            'KeyW': { x: 0, y: -1 },
            'KeyS': { x: 0, y: 1 },
            'KeyA': { x: -1, y: 0 },
            'KeyD': { x: 1, y: 0 }
        };

        if (directions[e.code]) {
            e.preventDefault();
            this.snake.setDirection(directions[e.code]);
        } else if (e.code === 'Space') {
            e.preventDefault();
            this.togglePause();
        }
    }

    showScreen(screenId) {
        Object.values(this.elements.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    startGame() {
        this.gameState.reset();
        this.snake.reset();
        this.foodManager.clear();
        this.obstacles = LevelGenerator.generateObstacles(this.gameState.difficulty);
        
        this.gameState.isPlaying = true;
        this.showScreen('game-screen');
        this.updateUI();
        
        // 生成初始食物
        for (let i = 0; i < 2; i++) {
            this.foodManager.generateFood(this.snake, this.obstacles);
        }
        
        this.startGameLoop();
    }

    startGameLoop() {
        const gameSpeed = CONFIG.DIFFICULTIES[this.gameState.difficulty].speed;
        const currentSpeed = this.gameState.speedBoostActive ? 
            gameSpeed * CONFIG.SPEED_BOOST_MULTIPLIER : gameSpeed;
        
        this.gameLoop = setTimeout(() => {
            this.update();
            this.render();
            
            if (this.gameState.isPlaying && !this.gameState.isPaused) {
                this.startGameLoop();
            }
        }, currentSpeed);
    }

    update() {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;
        
        // 更新速度提升效果
        if (this.gameState.speedBoostActive) {
            this.gameState.speedBoostTimer -= CONFIG.DIFFICULTIES[this.gameState.difficulty].speed;
            if (this.gameState.speedBoostTimer <= 0) {
                this.gameState.speedBoostActive = false;
                this.hideEffectIndicator();
            }
        }
        
        // 移动蛇
        this.snake.move();
        
        // 检查碰撞
        if (this.snake.checkWallCollision() || 
            this.snake.checkSelfCollision() || 
            this.snake.checkObstacleCollision(this.obstacles)) {
            this.gameOver();
            return;
        }
        
        // 检查食物碰撞
        const eatenFood = this.foodManager.checkCollision(this.snake);
        if (eatenFood) {
            this.handleFoodEaten(eatenFood);
        } else {
            // 如果没有吃到食物，移除尾部
            this.snake.body.pop();
        }
        
        // 生成新食物
        this.foodManager.generateFood(this.snake, this.obstacles);
        
        this.updateUI();
    }

    handleFoodEaten(food) {
        this.gameState.score += food.points;
        this.gameState.length += food.growth;
        
        // 增长蛇身
        this.snake.grow(food.growth);
        
        // 处理特殊效果
        if (food.type === 'SPEED') {
            this.gameState.speedBoostActive = true;
            this.gameState.speedBoostTimer = CONFIG.SPEED_BOOST_DURATION;
            this.showEffectIndicator('加速效果激活！', CONFIG.SPEED_BOOST_DURATION);
        } else if (food.type === 'GROWTH') {
            this.showEffectIndicator('额外成长！', 2000);
        } else if (food.type === 'SPECIAL') {
            this.showEffectIndicator('特殊奖励！', 2000);
        }
        

    }

    render() {
        this.renderer.clear();
        this.renderer.drawGrid();
        this.renderer.drawObstacles(this.obstacles);
        this.renderer.drawFood(this.foodManager.foods);
        this.renderer.drawSnake(this.snake);
    }

    updateUI() {
        this.elements.info.score.textContent = this.gameState.score;
        this.elements.info.length.textContent = this.snake.body.length;
        this.elements.info.difficulty.textContent = CONFIG.DIFFICULTIES[this.gameState.difficulty].name;
    }

    togglePause() {
        if (!this.gameState.isPlaying) return;
        
        this.gameState.isPaused = !this.gameState.isPaused;
        
        if (this.gameState.isPaused) {
            this.showOverlay('游戏暂停', '按空格键继续游戏');
            this.elements.buttons.pause.textContent = '继续';
        } else {
            this.hideOverlay();
            this.elements.buttons.pause.textContent = '暂停';
            this.startGameLoop();
        }
    }

    restartGame() {
        this.stopGameLoop();
        this.hideOverlay();
        this.startGame();
    }

    returnToMenu() {
        this.stopGameLoop();
        this.gameState.reset();
        this.showScreen('menu-screen');
    }

    gameOver() {
        this.gameState.isPlaying = false;
        this.gameState.gameOver = true;
        this.stopGameLoop();
        
        this.showGameOverOverlay(
            '游戏结束', 
            `最终得分: ${this.gameState.score}\n蛇的长度: ${this.snake.body.length}`
        );
        

    }

    stopGameLoop() {
        if (this.gameLoop) {
            clearTimeout(this.gameLoop);
            this.gameLoop = null;
        }
    }

    showOverlay(title, message) {
        this.elements.overlay.title.textContent = title;
        this.elements.overlay.message.textContent = message;
        this.elements.overlay.container.classList.remove('hidden');
        
        // 显示继续游戏按钮（用于暂停状态）
        this.elements.buttons.resume.textContent = '继续游戏';
        this.elements.buttons.resume.style.display = 'inline-block';
    }
    
    showGameOverOverlay(title, message) {
        this.elements.overlay.title.textContent = title;
        this.elements.overlay.message.textContent = message;
        this.elements.overlay.container.classList.remove('hidden');
        
        // 显示重新开始按钮（用于游戏结束状态）
        this.elements.buttons.resume.textContent = '重新开始';
        this.elements.buttons.resume.style.display = 'inline-block';
    }

    hideOverlay() {
        this.elements.overlay.container.classList.add('hidden');
    }

    showEffectIndicator(text, duration) {
        this.elements.effect.text.textContent = text;
        this.elements.effect.timer.style.setProperty('--duration', `${duration}ms`);
        this.elements.effect.indicator.classList.remove('hidden');
        
        setTimeout(() => {
            this.hideEffectIndicator();
        }, duration);
    }

    hideEffectIndicator() {
        this.elements.effect.indicator.classList.add('hidden');
    }


}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});