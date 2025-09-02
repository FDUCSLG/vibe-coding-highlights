class Card {
    constructor(suit, rank) {
        this.suit = suit; // 0=黑桃, 1=红心, 2=梅花, 3=方块
        this.rank = rank; // 1=A, 11=J, 12=Q, 13=K
        this.faceUp = false;
        this.element = null;
    }

    get color() {
        return (this.suit === 1 || this.suit === 3) ? 'red' : 'black';
    }

    get suitSymbol() {
        const symbols = ['♠', '♥', '♣', '♦'];
        return symbols[this.suit];
    }

    get rankSymbol() {
        if (this.rank === 1) return 'A';
        if (this.rank === 11) return 'J';
        if (this.rank === 12) return 'Q';
        if (this.rank === 13) return 'K';
        return this.rank.toString();
    }

    createElement() {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.suit = this.suit;
        cardElement.dataset.rank = this.rank;
        cardElement.draggable = true;
        
        this.element = cardElement;
        this.updateDisplay();
        return cardElement;
    }

    updateDisplay() {
        if (!this.element) return;
        
        if (this.faceUp) {
            this.element.className = `card face-up ${this.color}`;
            this.element.innerHTML = `
                <div class="card-top">
                    <span>${this.rankSymbol}</span>
                    <span>${this.suitSymbol}</span>
                </div>
                <div class="card-center">${this.suitSymbol}</div>
                <div class="card-bottom">
                    <span>${this.rankSymbol}</span>
                    <span>${this.suitSymbol}</span>
                </div>
            `;
        } else {
            this.element.className = 'card face-down';
            this.element.innerHTML = '';
        }
    }

    flip() {
        this.faceUp = true;
        this.updateDisplay();
    }
}

class SpiderSolitaire {
    constructor() {
        this.tableau = Array(10).fill(null).map(() => []);
        this.foundations = Array(4).fill(null).map(() => []);
        this.emptySlots = Array(2).fill(null).map(() => []);
        this.stock = [];
        this.score = 500;
        this.selectedCards = [];
        this.draggedCards = [];
        this.dragSourceColumn = -1;
        this.dragSourceSlot = -1;
        this.dragSuccess = false;
        this.completedSequences = 0;
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.createDeck();
        this.shuffleDeck();
        this.dealInitialCards();
        this.updateDisplay();
    }

    createDeck() {
        this.stock = [];
        // 创建两副完整的牌（蜘蛛纸牌使用两副牌）
        // 只使用黑桃(0)和红心(1)两种花色
        const suits = [0, 1]; // 0=黑桃, 1=红心
        for (let deck = 0; deck < 2; deck++) {
            for (let suit of suits) {
                for (let rank = 1; rank <= 13; rank++) {
                    this.stock.push(new Card(suit, rank));
                }
            }
        }
    }

    shuffleDeck() {
        for (let i = this.stock.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.stock[i], this.stock[j]] = [this.stock[j], this.stock[i]];
        }
    }

    dealInitialCards() {
        // 发初始牌：前2列各5张，后8列各4张（总共42张牌）
        for (let col = 0; col < 10; col++) {
            const numCards = col < 2 ? 5 : 4; // 前2列发5张，后8列发4张
            for (let i = 0; i < numCards; i++) {
                if (this.stock.length > 0) {
                    const card = this.stock.pop();
                    if (i === numCards - 1) {
                        card.flip(); // 最后一张牌翻开
                    }
                    this.tableau[col].push(card);
                }
            }
        }
    }

    updateDisplay() {
        // 更新tableau显示
        for (let col = 0; col < 10; col++) {
            const columnElement = document.getElementById(`column-${col}`);
            columnElement.innerHTML = '';
            
            this.tableau[col].forEach((card, index) => {
                if (!card.element) {
                    card.createElement();
                }
                card.element.style.top = `${index * 25}px`;
                card.element.style.zIndex = index;
                columnElement.appendChild(card.element);
                
                // 添加点击事件
                card.element.onclick = (e) => this.handleCardClick(card, col, e);
                
                // 添加拖拽事件
                card.element.ondragstart = (e) => this.handleDragStart(card, col, e);
                card.element.ondragend = (e) => this.handleDragEnd(e);
            });
        }

        // 更新基础堆显示
        for (let i = 0; i < 4; i++) {
            const foundationElement = document.getElementById(`foundation-${i}`);
            foundationElement.innerHTML = '';
            
            if (this.foundations[i].length > 0) {
                const topCard = this.foundations[i][this.foundations[i].length - 1];
                if (!topCard.element) {
                    topCard.createElement();
                }
                // 重置卡牌位置样式，让它在基础堆中居中显示
                topCard.element.style.position = 'static';
                topCard.element.style.top = 'auto';
                topCard.element.style.left = 'auto';
                foundationElement.appendChild(topCard.element);
            }
        }

        // 更新空槽显示
        for (let i = 0; i < 2; i++) {
            const slotElement = document.getElementById(`empty-slot-${i}`);
            slotElement.innerHTML = '';
            
            if (this.emptySlots[i].length > 0) {
                slotElement.classList.add('occupied');
                // 显示空槽中的牌堆
                this.emptySlots[i].forEach((card, index) => {
                    if (!card.element) {
                        card.createElement();
                    }
                    card.element.style.top = `${index * 25}px`;
                    card.element.style.zIndex = index;
                    slotElement.appendChild(card.element);
                    
                    // 添加拖拽事件
                    card.element.ondragstart = (e) => this.handleSlotDragStart(card, i, e);
                    card.element.ondragend = (e) => this.handleDragEnd(e);
                });
                
                // 添加占位符
                const placeholder = document.createElement('div');
                placeholder.className = 'empty-slot-placeholder';
                placeholder.textContent = `空槽 ${i + 1}`;
                slotElement.appendChild(placeholder);
            } else {
                slotElement.classList.remove('occupied');
                // 添加占位符
                const placeholder = document.createElement('div');
                placeholder.className = 'empty-slot-placeholder';
                placeholder.textContent = `空槽 ${i + 1}`;
                slotElement.appendChild(placeholder);
            }
        }

        // 更新剩余牌数
        document.getElementById('stock-count').textContent = this.stock.length;
        document.getElementById('score').textContent = this.score;
        
        // 更新发牌按钮状态
        const dealBtn = document.getElementById('deal-btn');
        if (this.stock.length < 10) {
            dealBtn.disabled = true;
            dealBtn.textContent = `发牌 (需要10张牌，剩余${this.stock.length}张)`;
            dealBtn.style.opacity = '0.5';
        } else {
            dealBtn.disabled = false;
            dealBtn.textContent = '发牌';
            dealBtn.style.opacity = '1';
        }
    }

    handleCardClick(card, columnIndex, event) {
        event.stopPropagation();
        
        if (!card.faceUp) return;
        
        const cardIndex = this.tableau[columnIndex].indexOf(card);
        const sequence = this.getMovableSequence(columnIndex, cardIndex);
        
        if (sequence.length > 0) {
            this.selectCards(sequence);
        }
    }

    getMovableSequence(columnIndex, startIndex) {
        const column = this.tableau[columnIndex];
        const sequence = [];
        
        for (let i = startIndex; i < column.length; i++) {
            const card = column[i];
            if (!card.faceUp) break;
            
            if (sequence.length === 0) {
                sequence.push(card);
            } else {
                const prevCard = sequence[sequence.length - 1];
                if (card.rank === prevCard.rank - 1 && card.suit === prevCard.suit) {
                    sequence.push(card);
                } else {
                    break;
                }
            }
        }
        
        return sequence;
    }

    selectCards(cards) {
        // 清除之前的选择
        this.selectedCards.forEach(card => {
            card.element.classList.remove('selected');
        });
        
        this.selectedCards = cards;
        cards.forEach(card => {
            card.element.classList.add('selected');
        });
    }

    canMoveSequence(sequence, targetColumn) {
        if (sequence.length === 0) return false;
        
        const targetCards = this.tableau[targetColumn];
        if (targetCards.length === 0) return true;
        
        const topCard = targetCards[targetCards.length - 1];
        const firstCard = sequence[0];
        
        return topCard.faceUp && firstCard.rank === topCard.rank - 1;
    }

    canMoveToEmptySlot(sequence, slotIndex) {
        if (sequence.length === 0) return false;
        if (this.emptySlots[slotIndex].length > 0) return false;
        
        // 验证序列是否为有效的递减序列（同花色）
        if (sequence.length === 1) return true;
        
        const suit = sequence[0].suit;
        for (let i = 0; i < sequence.length - 1; i++) {
            const currentCard = sequence[i];
            const nextCard = sequence[i + 1];
            
            if (currentCard.suit !== suit || nextCard.suit !== suit) {
                return false;
            }
            
            if (nextCard.rank !== currentCard.rank - 1) {
                return false;
            }
        }
        
        return true;
    }

    moveSequenceToEmptySlot(sequence, fromColumn, toSlot) {
        if (!this.canMoveToEmptySlot(sequence, toSlot)) return false;
        
        // 从源列移除卡牌
        if (fromColumn !== -1) {
            const sourceColumn = this.tableau[fromColumn];
            const startIndex = sourceColumn.length - sequence.length;
            
            // 确保序列在源列的正确位置
            for (let i = 0; i < sequence.length; i++) {
                if (sourceColumn[startIndex + i] !== sequence[i]) {
                    console.error('序列不在源列的正确位置');
                    return false;
                }
            }
            
            // 从源列移除卡牌
            for (let i = 0; i < sequence.length; i++) {
                this.tableau[fromColumn].pop();
            }
            
            // 翻开源列的最后一张牌
            if (this.tableau[fromColumn].length > 0) {
                const lastCard = this.tableau[fromColumn][this.tableau[fromColumn].length - 1];
                if (!lastCard.faceUp) {
                    lastCard.flip();
                    this.score += 5;
                }
            }
        }
        
        // 添加到空槽
        this.emptySlots[toSlot] = [...sequence];
        
        this.selectedCards = [];
        this.checkForCompleteSequences();
        this.updateDisplay();
        return true;
    }

    moveSequenceFromEmptySlot(sequence, fromSlot, toColumn) {
        if (!this.canMoveSequence(sequence, toColumn)) return false;
        
        // 清空源空槽
        this.emptySlots[fromSlot] = [];
        
        // 添加到目标列
        sequence.forEach(card => {
            this.tableau[toColumn].push(card);
        });
        
        this.selectedCards = [];
        this.checkForCompleteSequences();
        this.updateDisplay();
        return true;
    }

    moveSequence(sequence, fromColumn, toColumn) {
        if (!this.canMoveSequence(sequence, toColumn)) return false;
        
        // 验证序列确实在源列的末尾
        const sourceColumn = this.tableau[fromColumn];
        const startIndex = sourceColumn.length - sequence.length;
        
        // 确保序列在源列的正确位置
        for (let i = 0; i < sequence.length; i++) {
            if (sourceColumn[startIndex + i] !== sequence[i]) {
                console.error('序列不在源列的正确位置');
                return false;
            }
        }
        
        // 从源列移除卡牌
        for (let i = 0; i < sequence.length; i++) {
            this.tableau[fromColumn].pop();
        }
        
        // 添加到目标列
        sequence.forEach(card => {
            this.tableau[toColumn].push(card);
        });
        
        // 翻开源列的最后一张牌
        if (this.tableau[fromColumn].length > 0) {
            const lastCard = this.tableau[fromColumn][this.tableau[fromColumn].length - 1];
            if (!lastCard.faceUp) {
                lastCard.flip();
                this.score += 5;
            }
        }
        
        this.selectedCards = [];
        this.checkForCompleteSequences();
        this.updateDisplay();
        return true;
    }

    checkForCompleteSequences() {
        for (let col = 0; col < 10; col++) {
            const column = this.tableau[col];
            if (column.length < 13) continue;
            
            // 检查最后13张牌是否形成完整序列（K到A）
            const last13 = column.slice(-13);
            if (this.isCompleteSequence(last13)) {
                this.moveToFoundation(last13, col);
            }
        }
    }

    isCompleteSequence(cards) {
        if (cards.length !== 13) return false;
        
        const suit = cards[0].suit;
        for (let i = 0; i < 13; i++) {
            const expectedRank = 13 - i; // K=13, Q=12, ..., A=1
            if (cards[i].rank !== expectedRank || cards[i].suit !== suit || !cards[i].faceUp) {
                return false;
            }
        }
        return true;
    }

    moveToFoundation(sequence, columnIndex) {
        // 检查是否还有可用的基础堆
        if (this.completedSequences >= 4) {
            console.warn('所有基础堆已满，无法移动更多完整序列');
            return;
        }
        
        // 移除完整序列
        for (let i = 0; i < 13; i++) {
            this.tableau[columnIndex].pop();
        }
        
        // 添加到基础堆
        const foundationIndex = this.completedSequences;
        this.foundations[foundationIndex] = sequence;
        this.completedSequences++;
        
        // 增加分数
        this.score += 100;
        
        // 翻开下一张牌
        if (this.tableau[columnIndex].length > 0) {
            const lastCard = this.tableau[columnIndex][this.tableau[columnIndex].length - 1];
            if (!lastCard.faceUp) {
                lastCard.flip();
                this.score += 5;
            }
        }
        
        // 更新显示
        this.updateDisplay();
        
        // 检查胜利条件
        if (this.completedSequences === 4) {
            this.showVictory();
        }
    }

    dealNewCards() {
        if (this.stock.length < 10) return false;
        
        // 检查是否所有列都有牌
        for (let col = 0; col < 10; col++) {
            if (this.tableau[col].length === 0) {
                alert('所有列都必须有牌才能发新牌！');
                return false;
            }
        }
        
        // 每列发一张牌
        for (let col = 0; col < 10; col++) {
            if (this.stock.length > 0) {
                const card = this.stock.pop();
                card.flip();
                this.tableau[col].push(card);
            }
        }
        
        this.score -= 1;
        this.checkForCompleteSequences();
        this.updateDisplay();
        return true;
    }

    showVictory() {
        const victoryMessage = document.createElement('div');
        victoryMessage.className = 'victory-message';
        victoryMessage.innerHTML = `
            <h2>恭喜！</h2>
            <p>你赢了！</p>
            <p>最终得分: ${this.score}</p>
            <button onclick="location.reload()">再玩一局</button>
        `;
        document.body.appendChild(victoryMessage);
    }

    handleDragStart(card, columnIndex, event) {
        if (!card.faceUp) {
            event.preventDefault();
            return;
        }
        
        const cardIndex = this.tableau[columnIndex].indexOf(card);
        const sequence = this.getMovableSequence(columnIndex, cardIndex);
        
        if (sequence.length === 0) {
            event.preventDefault();
            return;
        }
        
        this.draggedCards = sequence;
        this.dragSourceColumn = columnIndex;
        this.dragSourceSlot = -1;
        this.dragSuccess = false;
        
        // 设置拖拽数据
        event.dataTransfer.setData('text/plain', JSON.stringify({
            cards: sequence.map(c => ({ suit: c.suit, rank: c.rank })),
            sourceColumn: columnIndex,
            sourceType: 'column'
        }));
        
        // 添加拖拽样式
        sequence.forEach(c => c.element.classList.add('dragging'));
        
        event.dataTransfer.effectAllowed = 'move';
    }

    handleSlotDragStart(card, slotIndex, event) {
        const sequence = this.emptySlots[slotIndex];
        
        if (sequence.length === 0) {
            event.preventDefault();
            return;
        }
        
        this.draggedCards = [...sequence];
        this.dragSourceColumn = -1;
        this.dragSourceSlot = slotIndex;
        this.dragSuccess = false;
        
        // 设置拖拽数据
        event.dataTransfer.setData('text/plain', JSON.stringify({
            cards: sequence.map(c => ({ suit: c.suit, rank: c.rank })),
            sourceSlot: slotIndex,
            sourceType: 'slot'
        }));
        
        // 添加拖拽样式
        sequence.forEach(c => c.element.classList.add('dragging'));
        
        event.dataTransfer.effectAllowed = 'move';
    }

    handleDragEnd(event) {
        // 移除拖拽样式
        this.draggedCards.forEach(card => {
            if (card.element) {
                card.element.classList.remove('dragging');
            }
        });
        
        // 移除拖放区域高亮
        document.querySelectorAll('.drop-zone').forEach(element => {
            element.classList.remove('drop-zone');
        });
        
        // 如果拖拽未成功，不需要做任何恢复操作
        // 因为moveSequence只有在成功时才会移动卡牌
        // 失败的拖拽不会改变卡牌位置
        
        this.draggedCards = [];
        this.dragSourceColumn = -1;
        this.dragSourceSlot = -1;
        this.dragSuccess = false;
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(event) {
        event.preventDefault();
        const targetElement = event.currentTarget;
        
        if (this.draggedCards.length > 0) {
            if (targetElement.id && targetElement.id.startsWith('column-')) {
                const columnIndex = parseInt(targetElement.id.replace('column-', ''));
                if (this.canMoveSequence(this.draggedCards, columnIndex)) {
                    targetElement.classList.add('drop-zone');
                }
            } else if (targetElement.id && targetElement.id.startsWith('empty-slot-')) {
                const slotIndex = parseInt(targetElement.id.replace('empty-slot-', ''));
                if (this.canMoveToEmptySlot(this.draggedCards, slotIndex)) {
                    targetElement.classList.add('drop-zone');
                }
            }
        }
    }

    handleDragLeave(event) {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            event.currentTarget.classList.remove('drop-zone');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        
        const targetElement = event.currentTarget;
        
        if (this.draggedCards && this.draggedCards.length > 0) {
            let success = false;
            
            if (targetElement.id && targetElement.id.startsWith('column-')) {
                // 拖拽到游戏列
                const columnIndex = parseInt(targetElement.id.replace('column-', ''));
                
                if (this.dragSourceSlot !== -1) {
                    // 从空槽拖拽到游戏列
                    success = this.moveSequenceFromEmptySlot(this.draggedCards, this.dragSourceSlot, columnIndex);
                } else {
                    // 从游戏列拖拽到游戏列
                    success = this.moveSequence(this.draggedCards, this.dragSourceColumn, columnIndex);
                }
            } else if (targetElement.id && targetElement.id.startsWith('empty-slot-')) {
                // 拖拽到空槽
                const slotIndex = parseInt(targetElement.id.replace('empty-slot-', ''));
                
                if (this.dragSourceColumn !== -1) {
                    // 从游戏列拖拽到空槽
                    success = this.moveSequenceToEmptySlot(this.draggedCards, this.dragSourceColumn, slotIndex);
                }
                // 注意：不允许从空槽拖拽到空槽
            }
            
            if (success) {
                this.dragSuccess = true;
            }
        }
        
        // 移除拖拽样式
        targetElement.classList.remove('drag-over');
    }

    setupEventListeners() {
        // 新游戏按钮
        document.getElementById('new-game-btn').onclick = () => {
            location.reload();
        };
        
        // 发牌按钮
        document.getElementById('deal-btn').onclick = () => {
            this.dealNewCards();
        };
        
        // 提示按钮
        document.getElementById('hint-btn').onclick = () => {
            this.showHint();
        };
        
        // 列点击事件（用于移动卡牌）和拖放事件
        for (let col = 0; col < 10; col++) {
            const columnElement = document.getElementById(`column-${col}`);
            
            // 点击事件
            columnElement.onclick = (e) => {
                if (e.target.classList.contains('tableau-column') && this.selectedCards.length > 0) {
                    const fromColumn = this.findCardColumn(this.selectedCards[0]);
                    if (fromColumn !== -1 && fromColumn !== col) {
                        this.moveSequence(this.selectedCards, fromColumn, col);
                    }
                }
            };
            
            // 拖放事件
            columnElement.ondragover = (e) => this.handleDragOver(e);
            columnElement.ondragenter = (e) => this.handleDragEnter(col, e);
            columnElement.ondragleave = (e) => this.handleDragLeave(col, e);
            columnElement.ondrop = (e) => this.handleDrop(e);
        }
        
        // 为空槽设置拖放事件监听器
        for (let i = 0; i < 2; i++) {
            const slotElement = document.getElementById(`empty-slot-${i}`);
            
            // 拖放事件
            slotElement.ondragover = (e) => this.handleDragOver(e);
            slotElement.ondragenter = (e) => this.handleDragEnter(e);
            slotElement.ondragleave = (e) => this.handleDragLeave(e);
            slotElement.ondrop = (e) => this.handleDrop(e);
        }
        
        // 点击空白区域取消选择
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.card') && !e.target.closest('.tableau-column')) {
                this.selectedCards.forEach(card => {
                    card.element.classList.remove('selected');
                });
                this.selectedCards = [];
            }
        });
    }

    findCardColumn(card) {
        for (let col = 0; col < 10; col++) {
            if (this.tableau[col].includes(card)) {
                return col;
            }
        }
        return -1;
    }

    showHint() {
        // 简单的提示系统：寻找可能的移动
        for (let fromCol = 0; fromCol < 10; fromCol++) {
            const column = this.tableau[fromCol];
            if (column.length === 0) continue;
            
            for (let cardIndex = 0; cardIndex < column.length; cardIndex++) {
                const sequence = this.getMovableSequence(fromCol, cardIndex);
                if (sequence.length === 0) continue;
                
                for (let toCol = 0; toCol < 10; toCol++) {
                    if (fromCol === toCol) continue;
                    
                    if (this.canMoveSequence(sequence, toCol)) {
                        // 高亮提示
                        sequence[0].element.style.border = '3px solid #ffd700';
                        document.getElementById(`column-${toCol}`).style.background = 'rgba(255, 215, 0, 0.3)';
                        
                        setTimeout(() => {
                            sequence[0].element.style.border = '';
                            document.getElementById(`column-${toCol}`).style.background = '';
                        }, 2000);
                        
                        return;
                    }
                }
            }
        }
        
        alert('没有找到明显的移动提示！');
    }
}

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    new SpiderSolitaire();
});