// 游戏状态
let balance = 100;
let isSpinning = false;

// 符号定义
const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];

// 每个老虎机的奖励分布（概率不同）
const machineRewards = {
    machine1: {
        '🍒': 0.3,
        '🍋': 0.25,
        '🍊': 0.2,
        '🍇': 0.15,
        '🔔': 0.05,
        '💎': 0.03,
        '7️⃣': 0.02
    },
    machine2: {
        '🍒': 0.25,
        '🍋': 0.3,
        '🍊': 0.2,
        '🍇': 0.15,
        '🔔': 0.05,
        '💎': 0.03,
        '7️⃣': 0.02
    },
    machine3: {
        '🍒': 0.2,
        '🍋': 0.25,
        '🍊': 0.3,
        '🍇': 0.15,
        '🔔': 0.05,
        '💎': 0.03,
        '7️⃣': 0.02
    }
};

// 符号价值
const symbolValues = {
    '🍒': 2,
    '🍋': 3,
    '🍊': 4,
    '🍇': 5,
    '🔔': 10,
    '💎': 20,
    '7️⃣': 50
};

// 更新余额显示
function updateBalance() {
    document.querySelector('.balance-number').textContent = balance;
}

// 根据概率选择符号
function selectSymbol(machineRewards) {
    const random = Math.random();
    let cumulative = 0;
    
    for (const [symbol, probability] of Object.entries(machineRewards)) {
        cumulative += probability;
        if (random <= cumulative) {
            return symbol;
        }
    }
    
    return symbols[0]; // 默认返回第一个符号
}

// 创建符号条带用于滚动效果
function createSymbolStrip() {
    const strip = [];
    // 创建一个包含多个符号的条带
    for (let i = 0; i < 20; i++) {
        strip.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    return strip;
}

// 高级旋转动画 - 包含加速、减速、弹跳效果
function spinReelAdvanced(reelElement, finalSymbol, delay = 0, duration = 2000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const symbolStrip = reelElement.querySelector('.symbol-strip');
            let currentPosition = 0;
            let speed = 50; // 初始速度（毫秒）
            let acceleration = 0.95; // 加速因子
            let deceleration = 1.05; // 减速因子
            let isDecelerating = false;
            let targetPosition = 0;
            
            // 创建符号条带
            const stripSymbols = createSymbolStrip();
            stripSymbols.push(finalSymbol); // 确保最终符号在条带末尾
            
            let animationId;
            let startTime = Date.now();
            
            function animate() {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / duration;
                
                if (progress < 0.7) {
                    // 加速阶段
                    speed *= acceleration;
                    if (speed < 20) speed = 20; // 最小速度限制
                } else if (!isDecelerating) {
                    // 开始减速
                    isDecelerating = true;
                    targetPosition = stripSymbols.length - 1;
                }
                
                if (isDecelerating) {
                    // 减速阶段
                    speed *= deceleration;
                    if (speed > 200) speed = 200; // 最大速度限制
                    
                    // 计算到目标位置的距离
                    const distanceToTarget = Math.abs(targetPosition - currentPosition);
                    if (distanceToTarget < 2 && speed > 100) {
                        speed = 100; // 接近目标时进一步减速
                    }
                }
                
                // 更新位置
                currentPosition++;
                if (currentPosition >= stripSymbols.length) {
                    currentPosition = 0;
                }
                
                // 显示当前符号
                symbolStrip.textContent = stripSymbols[currentPosition];
                
                // 添加旋转效果类
                if (!isDecelerating) {
                    symbolStrip.parentElement.classList.add('spinning-fast');
                } else {
                    symbolStrip.parentElement.classList.remove('spinning-fast');
                    symbolStrip.parentElement.classList.add('spinning-slow');
                }
                
                // 检查是否应该停止
                if (isDecelerating && currentPosition === targetPosition && elapsed > duration * 0.8) {
                    // 停止动画
                    symbolStrip.parentElement.classList.remove('spinning-fast', 'spinning-slow');
                    symbolStrip.textContent = finalSymbol;
                    
                    // 添加弹跳效果
                    symbolStrip.parentElement.classList.add('bouncing');
                    setTimeout(() => {
                        symbolStrip.parentElement.classList.remove('bouncing');
                        resolve();
                    }, 600);
                    return;
                }
                
                // 继续动画
                animationId = setTimeout(animate, speed);
            }
            
            animate();
        }, delay);
    });
}

// 检查结果
function checkResult(symbols) {
    // 检查是否有三个相同符号
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
        const winAmount = symbolValues[symbols[0]] * 3;
        balance += winAmount;
        return `🎉 JACKPOT! 三个 ${symbols[0]} - 赢得 ${winAmount} 金币！`;
    }
    
    // 检查是否有两个相同符号
    const symbolCounts = {};
    symbols.forEach(symbol => {
        symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });
    
    for (const [symbol, count] of Object.entries(symbolCounts)) {
        if (count === 2) {
            const winAmount = symbolValues[symbol];
            balance += winAmount;
            return `✨ 两个 ${symbol} - 赢得 ${winAmount} 金币！`;
        }
    }
    
    // 没有匹配
    balance -= 5; // 扣除游戏费用
    return '💸 没有匹配，继续努力！';
}

// 添加音效模拟（通过视觉反馈）
function addVisualFeedback(machineElement, type) {
    const frame = machineElement.querySelector('.machine-frame');
    
    switch(type) {
        case 'spin':
            frame.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
            setTimeout(() => {
                frame.style.boxShadow = '';
            }, 3000);
            break;
        case 'win':
            frame.style.boxShadow = '0 0 40px rgba(0, 255, 0, 0.8)';
            setTimeout(() => {
                frame.style.boxShadow = '';
            }, 2000);
            break;
        case 'jackpot':
            frame.style.boxShadow = '0 0 50px rgba(255, 0, 255, 1)';
            frame.style.animation = 'jackpotFlash 0.5s ease-in-out 6';
            setTimeout(() => {
                frame.style.boxShadow = '';
                frame.style.animation = '';
            }, 3000);
            break;
    }
}

// 旋转老虎机
async function spin(machineId) {
    if (isSpinning || balance < 5) {
        if (balance < 5) {
            alert('💰 余额不足！需要至少5金币才能游戏。');
        }
        return;
    }
    
    isSpinning = true;
    const machineElement = document.getElementById(machineId);
    const reels = machineElement.querySelectorAll('.reel');
    const resultElement = machineElement.querySelector('.result-display');
    const spinButton = machineElement.querySelector('.spin-btn');
    const lever = machineElement.querySelector('.lever');
    
    // 禁用按钮和拉杆
    spinButton.disabled = true;
    lever.style.pointerEvents = 'none';
    resultElement.textContent = '🎰 旋转中...';
    
    // 添加视觉反馈
    addVisualFeedback(machineElement, 'spin');
    
    // 拉杆动画
    const leverHandle = lever.querySelector('.lever-handle');
    leverHandle.style.transform = 'translateX(-50%) translateY(15px)';
    setTimeout(() => {
        leverHandle.style.transform = 'translateX(-50%) translateY(0)';
    }, 300);
    
    // 选择最终符号
    const machineReward = machineRewards[machineId];
    const finalSymbols = [
        selectSymbol(machineReward),
        selectSymbol(machineReward),
        selectSymbol(machineReward)
    ];
    
    // 同时旋转所有转轮，但有不同的延迟和持续时间
    const spinPromises = [];
    reels.forEach((reel, index) => {
        const delay = index * 200; // 错开启动时间
        const duration = 2000 + (index * 300); // 错开停止时间
        spinPromises.push(spinReelAdvanced(reel, finalSymbols[index], delay, duration));
    });
    
    // 等待所有转轮停止
    await Promise.all(spinPromises);
    
    // 检查结果
    const result = checkResult(finalSymbols);
    resultElement.textContent = result;
    
    // 根据结果添加特效
    if (result.includes('JACKPOT')) {
        addVisualFeedback(machineElement, 'jackpot');
    } else if (result.includes('赢得')) {
        addVisualFeedback(machineElement, 'win');
    }
    
    // 更新余额
    updateBalance();
    
    // 重新启用按钮和拉杆
    setTimeout(() => {
        spinButton.disabled = false;
        lever.style.pointerEvents = 'auto';
        isSpinning = false;
    }, 1000);
}

// 添加CSS动画样式
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes jackpotFlash {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .lever-handle {
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .result-display.win {
            animation: resultGlow 1s ease-in-out;
        }
        
        @keyframes resultGlow {
            0%, 100% { text-shadow: 0 0 10px #ffd700; }
            50% { text-shadow: 0 0 20px #ffd700, 0 0 30px #ffd700; }
        }
    `;
    document.head.appendChild(style);
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    // 添加动态样式
    addDynamicStyles();
    
    // 初始化余额显示
    updateBalance();
    
    // 为每个旋转按钮添加事件监听器
    document.querySelectorAll('.spin-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => spin(`machine${index + 1}`));
    });
    
    // 为拉杆添加事件监听器
    document.getElementById('lever1').addEventListener('click', () => spin('machine1'));
    document.getElementById('lever2').addEventListener('click', () => spin('machine2'));
    document.getElementById('lever3').addEventListener('click', () => spin('machine3'));
    
    // 初始化转轮显示
    document.querySelectorAll('.symbol-strip').forEach(strip => {
        strip.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    });
});