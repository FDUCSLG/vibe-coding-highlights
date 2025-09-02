class Minesweeper {
    constructor() {
        this.board = [];
        this.rows = 9;
        this.cols = 9;
        this.mines = 10;
        this.gameState = 'ready'; // ready, playing, won, lost
        this.firstClick = true;
        this.revealedCells = 0;
        this.flaggedCells = 0;
        this.timer = 0;
        this.timerInterval = null;
        
        this.difficulties = {
            easy: { rows: 9, cols: 9, mines: 10 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 16, cols: 30, mines: 99 }
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeGame();
    }
    
    initializeElements() {
        this.gameBoard = document.getElementById('game-board');
        this.mineCountDisplay = document.getElementById('mine-count');
        this.timerDisplay = document.getElementById('timer');
        this.statusDisplay = document.getElementById('status-text');
        this.gameStatusDiv = document.getElementById('game-status');
        this.restartBtn = document.getElementById('restart-btn');
        this.difficultySelect = document.getElementById('difficulty-select');
    }
    
    setupEventListeners() {
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.difficultySelect.addEventListener('change', () => this.changeDifficulty());
        
        // 防止右键菜单
        this.gameBoard.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    changeDifficulty() {
        const difficulty = this.difficultySelect.value;
        const config = this.difficulties[difficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.mines = config.mines;
        this.restartGame();
    }
    
    initializeGame() {
        this.gameState = 'ready';
        this.firstClick = true;
        this.revealedCells = 0;
        this.flaggedCells = 0;
        this.timer = 0;
        this.updateTimer();
        this.stopTimer();
        
        this.createBoard();
        this.renderBoard();
        this.updateMineCount();
        this.updateStatus('点击开始游戏');
        this.gameStatusDiv.className = 'game-status';
    }
    
    createBoard() {
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
            }
        }
    }
    
    placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // 避免在第一次点击的位置和周围放置地雷
            if ((row === excludeRow && col === excludeCol) || 
                this.board[row][col].isMine ||
                this.isAdjacent(row, col, excludeRow, excludeCol)) {
                continue;
            }
            
            this.board[row][col].isMine = true;
            minesPlaced++;
        }
        
        this.calculateNeighborMines();
    }
    
    isAdjacent(row1, col1, row2, col2) {
        return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1;
    }
    
    calculateNeighborMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }
    
    countNeighborMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (this.isValidCell(newRow, newCol) && this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }
    
    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        this.gameBoard.style.display = 'grid';
        this.gameBoard.style.gap = '1px';
        this.gameBoard.style.width = 'fit-content';
        this.gameBoard.style.margin = '0 auto';
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => this.handleCellClick(e, row, col));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e, row, col));
                cell.addEventListener('dblclick', (e) => this.handleDoubleClick(e, row, col));
                
                this.gameBoard.appendChild(cell);
            }
        }
    }
    
    handleCellClick(e, row, col) {
        e.preventDefault();
        
        if (this.gameState === 'won' || this.gameState === 'lost') {
            return;
        }
        
        const cell = this.board[row][col];
        
        if (cell.isFlagged || cell.isRevealed) {
            return;
        }
        
        if (this.firstClick) {
            this.firstClick = false;
            this.gameState = 'playing';
            this.placeMines(row, col);
            this.startTimer();
            this.updateStatus('游戏进行中...');
            this.gameStatusDiv.className = 'game-status playing';
        }
        
        this.revealCell(row, col);
        this.updateDisplay();
        this.checkGameEnd();
    }
    
    handleRightClick(e, row, col) {
        e.preventDefault();
        
        if (this.gameState === 'won' || this.gameState === 'lost' || this.gameState === 'ready') {
            return;
        }
        
        const cell = this.board[row][col];
        
        if (cell.isRevealed) {
            return;
        }
        
        cell.isFlagged = !cell.isFlagged;
        this.flaggedCells += cell.isFlagged ? 1 : -1;
        
        this.updateDisplay();
        this.checkGameEnd();
    }
    
    handleDoubleClick(e, row, col) {
        e.preventDefault();
        
        if (this.gameState === 'won' || this.gameState === 'lost' || this.gameState === 'ready') {
            return;
        }
        
        const cell = this.board[row][col];
        
        // 只有已揭开的数字格子才能双击
        if (!cell.isRevealed || cell.isMine || cell.neighborMines === 0) {
            return;
        }
        
        // 计算周围标记的地雷数量
        let flaggedCount = 0;
        const neighbors = this.getNeighbors(row, col);
        
        for (const [nRow, nCol] of neighbors) {
            if (this.board[nRow][nCol].isFlagged) {
                flaggedCount++;
            }
        }
        
        // 如果标记的地雷数量等于数字，则揭开周围所有未标记的格子
        if (flaggedCount === cell.neighborMines) {
            for (const [nRow, nCol] of neighbors) {
                const neighborCell = this.board[nRow][nCol];
                if (!neighborCell.isRevealed && !neighborCell.isFlagged) {
                    this.revealCell(nRow, nCol);
                }
            }
            
            this.updateDisplay();
            this.checkGameEnd();
        }
    }
    
    getNeighbors(row, col) {
        const neighbors = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = row + i;
                const newCol = col + j;
                if (this.isValidCell(newRow, newCol)) {
                    neighbors.push([newRow, newCol]);
                }
            }
        }
        return neighbors;
    }
    
    revealCell(row, col) {
        const cell = this.board[row][col];
        
        if (cell.isRevealed || cell.isFlagged) {
            return;
        }
        
        cell.isRevealed = true;
        this.revealedCells++;
        
        if (cell.isMine) {
            this.gameState = 'lost';
            this.revealAllMines();
            return;
        }
        
        // 如果是空白格子，递归揭开相邻格子
        if (cell.neighborMines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (this.isValidCell(newRow, newCol)) {
                        this.revealCell(newRow, newCol);
                    }
                }
            }
        }
    }
    
    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isMine) {
                    this.board[row][col].isRevealed = true;
                }
            }
        }
    }
    
    updateDisplay() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                
                cellElement.className = 'cell';
                cellElement.textContent = '';
                
                if (cell.isFlagged) {
                    cellElement.classList.add('flagged');
                } else if (cell.isRevealed) {
                    cellElement.classList.add('revealed');
                    
                    if (cell.isMine) {
                        cellElement.classList.add('mine');
                    } else if (cell.neighborMines > 0) {
                        cellElement.textContent = cell.neighborMines;
                        cellElement.classList.add(`number-${cell.neighborMines}`);
                    }
                }
            }
        }
        
        this.updateMineCount();
    }
    
    updateMineCount() {
        const remainingMines = this.mines - this.flaggedCells;
        this.mineCountDisplay.textContent = remainingMines.toString().padStart(3, '0');
    }
    
    checkGameEnd() {
        if (this.gameState === 'lost') {
            this.stopTimer();
            this.updateStatus('游戏失败！点击重新开始');
            this.gameStatusDiv.className = 'game-status lost';
            return;
        }
        
        // 检查胜利条件：所有非地雷格子都被揭开
        const totalCells = this.rows * this.cols;
        const nonMineCells = totalCells - this.mines;
        
        if (this.revealedCells === nonMineCells) {
            this.gameState = 'won';
            this.stopTimer();
            this.updateStatus(`恭喜获胜！用时 ${this.timer} 秒`);
            this.gameStatusDiv.className = 'game-status won';
            
            // 自动标记所有剩余的地雷
            this.flagAllRemainingMines();
        }
    }
    
    flagAllRemainingMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (cell.isMine && !cell.isFlagged) {
                    cell.isFlagged = true;
                    this.flaggedCells++;
                }
            }
        }
        this.updateDisplay();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        this.timerDisplay.textContent = this.timer.toString().padStart(3, '0');
    }
    
    updateStatus(message) {
        this.statusDisplay.textContent = message;
    }
    
    restartGame() {
        this.stopTimer();
        this.initializeGame();
    }
}

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});