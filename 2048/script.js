class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.size = 4;
        this.won = false;
        this.over = false;
        
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.messageContainer = document.getElementById('game-message');
        this.messageText = document.getElementById('message-text');
        this.restartButton = document.getElementById('restart-button');
        this.tryAgainButton = document.getElementById('try-again-button');
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // 初始化网格
        this.grid = [];
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }
        
        this.score = 0;
        this.won = false;
        this.over = false;
        
        // 更新显示
        this.updateScore();
        this.clearContainer();
        
        // 添加初始方块
        this.addRandomTile();
        this.addRandomTile();
        
        this.updateDisplay();
        this.hideMessage();
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.over && !this.won) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });
        
        // 重新开始按钮
        this.restartButton.addEventListener('click', () => {
            this.init();
        });
        
        this.tryAgainButton.addEventListener('click', () => {
            this.init();
        });
        
        // 触摸事件支持
        let startX, startY;
        
        this.tileContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        this.tileContainer.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            let endX = e.changedTouches[0].clientX;
            let endY = e.changedTouches[0].clientY;
            
            let diffX = startX - endX;
            let diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    this.move('left');
                } else {
                    this.move('right');
                }
            } else {
                if (diffY > 0) {
                    this.move('up');
                } else {
                    this.move('down');
                }
            }
            
            startX = null;
            startY = null;
        });
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    move(direction) {
        let moved = false;
        let newGrid = JSON.parse(JSON.stringify(this.grid));
        
        if (direction === 'left') {
            for (let i = 0; i < this.size; i++) {
                let row = newGrid[i].filter(val => val !== 0);
                for (let j = 0; j < row.length - 1; j++) {
                    if (row[j] === row[j + 1]) {
                        row[j] *= 2;
                        this.score += row[j];
                        row[j + 1] = 0;
                        if (row[j] === 2048 && !this.won) {
                            this.won = true;
                            this.showMessage('你赢了！', 'game-won');
                        }
                    }
                }
                row = row.filter(val => val !== 0);
                while (row.length < this.size) {
                    row.push(0);
                }
                newGrid[i] = row;
            }
        } else if (direction === 'right') {
            for (let i = 0; i < this.size; i++) {
                let row = newGrid[i].filter(val => val !== 0);
                for (let j = row.length - 1; j > 0; j--) {
                    if (row[j] === row[j - 1]) {
                        row[j] *= 2;
                        this.score += row[j];
                        row[j - 1] = 0;
                        if (row[j] === 2048 && !this.won) {
                            this.won = true;
                            this.showMessage('你赢了！', 'game-won');
                        }
                    }
                }
                row = row.filter(val => val !== 0);
                while (row.length < this.size) {
                    row.unshift(0);
                }
                newGrid[i] = row;
            }
        } else if (direction === 'up') {
            for (let j = 0; j < this.size; j++) {
                let column = [];
                for (let i = 0; i < this.size; i++) {
                    if (newGrid[i][j] !== 0) {
                        column.push(newGrid[i][j]);
                    }
                }
                for (let i = 0; i < column.length - 1; i++) {
                    if (column[i] === column[i + 1]) {
                        column[i] *= 2;
                        this.score += column[i];
                        column[i + 1] = 0;
                        if (column[i] === 2048 && !this.won) {
                            this.won = true;
                            this.showMessage('你赢了！', 'game-won');
                        }
                    }
                }
                column = column.filter(val => val !== 0);
                while (column.length < this.size) {
                    column.push(0);
                }
                for (let i = 0; i < this.size; i++) {
                    newGrid[i][j] = column[i];
                }
            }
        } else if (direction === 'down') {
            for (let j = 0; j < this.size; j++) {
                let column = [];
                for (let i = 0; i < this.size; i++) {
                    if (newGrid[i][j] !== 0) {
                        column.push(newGrid[i][j]);
                    }
                }
                for (let i = column.length - 1; i > 0; i--) {
                    if (column[i] === column[i - 1]) {
                        column[i] *= 2;
                        this.score += column[i];
                        column[i - 1] = 0;
                        if (column[i] === 2048 && !this.won) {
                            this.won = true;
                            this.showMessage('你赢了！', 'game-won');
                        }
                    }
                }
                column = column.filter(val => val !== 0);
                while (column.length < this.size) {
                    column.unshift(0);
                }
                for (let i = 0; i < this.size; i++) {
                    newGrid[i][j] = column[i];
                }
            }
        }
        
        // 检查是否有移动
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== newGrid[i][j]) {
                    moved = true;
                    break;
                }
            }
            if (moved) break;
        }
        
        if (moved) {
            this.grid = newGrid;
            this.addRandomTile();
            this.updateDisplay();
            this.updateScore();
            
            if (this.isGameOver()) {
                this.over = true;
                this.showMessage('游戏结束！', 'game-over');
            }
        }
    }
    
    isGameOver() {
        // 检查是否还有空格
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 检查是否还能合并
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if ((i < this.size - 1 && this.grid[i + 1][j] === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === current)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    updateDisplay() {
        this.clearContainer();
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    this.createTile(this.grid[i][j], i, j);
                }
            }
        }
    }
    
    createTile(value, row, col) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        
        const x = col * 122; // 107px width + 15px margin
        const y = row * 122; // 107px height + 15px margin
        
        tile.style.left = x + 'px';
        tile.style.top = y + 'px';
        
        this.tileContainer.appendChild(tile);
    }
    
    clearContainer() {
        this.tileContainer.innerHTML = '';
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }
        
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    showMessage(text, className) {
        this.messageText.textContent = text;
        this.messageContainer.className = `game-message ${className}`;
        this.messageContainer.style.display = 'flex';
    }
    
    hideMessage() {
        this.messageContainer.style.display = 'none';
    }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});