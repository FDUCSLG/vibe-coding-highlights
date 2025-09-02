// 游戏状态管理
class QuizGame {
    constructor() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.questions = [];
        this.userAnswers = [];
        this.currentQuestions = [];
        
        this.initializeEventListeners();
        this.loadQuestions();
        this.restoreGameState();
    }

    // 保存游戏状态到本地存储
    saveGameState() {
        const gameState = {
            currentScreen: this.getCurrentScreen(),
            currentQuestionIndex: this.currentQuestionIndex,
            score: this.score,
            userAnswers: this.userAnswers,
            currentQuestions: this.currentQuestions,
            timestamp: Date.now()
        };
        localStorage.setItem('quizGameState', JSON.stringify(gameState));
    }

    // 获取当前显示的屏幕
    getCurrentScreen() {
        if (document.getElementById('start-screen').classList.contains('active')) {
            return 'start';
        } else if (document.getElementById('game-screen').classList.contains('active')) {
            return 'game';
        } else if (document.getElementById('result-screen').classList.contains('active')) {
            return 'result';
        }
        return 'start'; // 默认返回开始屏幕
    }

    // 从本地存储恢复游戏状态
    restoreGameState() {
        try {
            const savedState = localStorage.getItem('quizGameState');
            if (!savedState) return;

            const gameState = JSON.parse(savedState);
            
            // 检查状态是否过期（24小时后过期）
            if (Date.now() - gameState.timestamp > 24 * 60 * 60 * 1000) {
                this.clearGameState();
                return;
            }

            // 恢复游戏状态
            this.currentQuestionIndex = gameState.currentQuestionIndex || 0;
            this.score = gameState.score || 0;
            this.userAnswers = gameState.userAnswers || [];
            this.currentQuestions = gameState.currentQuestions || [];

            // 恢复界面状态
            if (gameState.currentScreen === 'game' && this.currentQuestions.length > 0) {
                this.showGameScreen();
                this.displayQuestion();
                this.updateUI();
            } else if (gameState.currentScreen === 'result') {
                this.showResultScreen();
            }
        } catch (error) {
            console.error('恢复游戏状态失败:', error);
            this.clearGameState();
        }
    }

    // 清除保存的游戏状态
    clearGameState() {
        localStorage.removeItem('quizGameState');
    }

    // 题目库 - 按难度分类的250道计算机知识选择题
    loadQuestions() {
        // 简单题目 - 适合大一新生的基础知识
        const easyQuestions = [
            {
                question: "计算机的核心部件是什么？",
                options: ["鼠标", "CPU", "显示器", "音响"],
                correct: 1,
                difficulty: "easy",
                explanation: "CPU（中央处理器）是计算机的大脑，负责执行所有的计算和控制任务。"
            },
            {
                question: "以下哪个是操作系统？",
                options: ["QQ", "Windows", "Word", "微信"],
                correct: 1,
                difficulty: "easy",
                explanation: "Windows是操作系统，管理计算机的硬件和软件资源。其他都是应用软件。"
            },
            {
                question: "1GB大约等于多少MB？",
                options: ["100MB", "512MB", "1024MB", "2048MB"],
                correct: 2,
                difficulty: "easy",
                explanation: "1GB = 1024MB，这是计算机存储容量的基本换算关系。"
            },
            {
                question: "下面哪个是文本编辑软件？",
                options: ["计算器", "记事本", "音乐播放器", "游戏"],
                correct: 1,
                difficulty: "easy",
                explanation: "记事本是用来编辑和查看文本文件的软件。"
            },
            {
                question: "计算机的内存主要用来做什么？",
                options: ["播放音乐", "存储正在运行的程序", "连接网络", "打印文件"],
                correct: 1,
                difficulty: "easy",
                explanation: "内存（RAM）用来临时存储正在运行的程序和数据，断电后数据会丢失。"
            },
            {
                question: "下面哪个是网页浏览器？",
                options: ["Word", "Chrome", "Excel", "PowerPoint"],
                correct: 1,
                difficulty: "easy",
                explanation: "Chrome是网页浏览器，用来访问互联网上的网站。"
            },
            {
                question: "键盘上的\"Ctrl+C\"快捷键是用来做什么的？",
                options: ["关闭程序", "复制", "粘贴", "保存"],
                correct: 1,
                difficulty: "easy",
                explanation: "Ctrl+C是复制快捷键，可以复制选中的文本或文件。"
            },
            {
                question: "下面哪个文件格式是图片格式？",
                options: [".txt", ".jpg", ".doc", ".mp3"],
                correct: 1,
                difficulty: "easy",
                explanation: ".jpg是常见的图片文件格式，用来存储照片和图像。"
            },
            {
                question: "什么是计算机病毒？",
                options: ["硬件故障", "恶意程序", "网络故障", "软件更新"],
                correct: 1,
                difficulty: "easy",
                explanation: "计算机病毒是一种恶意程序，会破坏计算机系统或盗取用户信息。"
            },
            {
                question: "USB接口主要用来做什么？",
                options: ["连接显示器", "连接外设设备", "连接网线", "连接电源"],
                correct: 1,
                difficulty: "easy",
                explanation: "USB接口用来连接鼠标、键盘、U盘等各种外设设备。"
            },
            {
                question: "下面哪个是搜索引擎？",
                options: ["微信", "百度", "QQ音乐", "淘宝"],
                correct: 1,
                difficulty: "easy",
                explanation: "百度是搜索引擎，可以帮你在互联网上搜索信息。"
            },
            {
                question: "硬盘主要用来做什么？",
                options: ["临时存储", "长期存储文件", "运行程序", "连接网络"],
                correct: 1,
                difficulty: "easy",
                explanation: "硬盘用来长期存储文件和程序，关机后数据不会丢失。"
            },
            {
                question: "下面哪个是输入设备？",
                options: ["显示器", "键盘", "音响", "打印机"],
                correct: 1,
                difficulty: "easy",
                explanation: "键盘是输入设备，用来向计算机输入文字和指令。"
            },
            {
                question: "计算机关机时，哪里的数据会丢失？",
                options: ["硬盘", "内存", "U盘", "光盘"],
                correct: 1,
                difficulty: "easy",
                explanation: "内存中的数据在断电后会丢失，而硬盘、U盘、光盘中的数据可以长期保存。"
            },
            {
                question: "下面哪个是常见的音频文件格式？",
                options: [".txt", ".jpg", ".mp3", ".exe"],
                correct: 2,
                difficulty: "easy",
                explanation: ".mp3是音频文件格式，用来存储音乐和声音文件。"
            },
            {
                question: "以下哪个是文本编辑器？",
                options: ["记事本", "计算器", "画图", "录音机"],
                correct: 0,
                difficulty: "easy",
                explanation: "记事本是Windows自带的文本编辑器。"
            },
            {
                question: "计算机中，1MB等于多少KB？",
                options: ["1000KB", "1024KB", "512KB", "2048KB"],
                correct: 1,
                difficulty: "easy",
                explanation: "1MB = 1024KB，这是计算机科学中的标准换算。"
            },
            {
                question: "计算机中，鼠标属于什么设备？",
                options: ["输入设备", "输出设备", "存储设备", "处理设备"],
                correct: 0,
                difficulty: "easy",
                explanation: "鼠标是输入设备，用于向计算机输入指令。"
            }
        ];

        // 中等题目 - 稍有难度但大一能理解的概念
        const mediumQuestions = [
            {
                question: "编程中的\"变量\"是用来做什么的？",
                options: ["装饰程序", "存储数据", "运行程序", "连接网络"],
                correct: 1,
                difficulty: "medium",
                explanation: "变量就像一个盒子，用来存储程序中需要用到的数据，比如数字、文字等。"
            },
            {
                question: "下面哪个是正确的邮箱地址格式？",
                options: ["zhang.com", "zhang@com", "zhang@163.com", "@163.com"],
                correct: 2,
                difficulty: "medium",
                explanation: "正确的邮箱格式是：用户名@域名，比如zhang@163.com。"
            },
            {
                question: "什么是计算机程序？",
                options: ["一台机器", "一组指令", "一个文件夹", "一个网站"],
                correct: 1,
                difficulty: "medium",
                explanation: "计算机程序是告诉计算机如何完成某个任务的一系列指令。"
            },
            {
                question: "下面哪个是编程语言？",
                options: ["Word", "Python", "Windows", "Chrome"],
                correct: 1,
                difficulty: "medium",
                explanation: "Python是一种编程语言，用来编写程序。Word、Windows、Chrome都是软件。"
            },
            {
                question: "什么是Wi-Fi？",
                options: ["一种电脑病毒", "无线网络技术", "一个软件", "一种文件格式"],
                correct: 1,
                difficulty: "medium",
                explanation: "Wi-Fi是一种无线网络技术，让设备可以无线连接到互联网。"
            },
            {
                question: "下面哪个密码最安全？",
                options: ["123456", "password", "Abc123!@", "111111"],
                correct: 2,
                difficulty: "medium",
                explanation: "Abc123!@包含大小写字母、数字和特殊字符，是最安全的密码。"
            },
            {
                question: "在算法中，冒泡排序的时间复杂度是多少？",
                options: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
                correct: 2,
                difficulty: "medium",
                explanation: "冒泡排序的时间复杂度是O(n²)，效率较低。"
            },
            {
                question: "以下哪个是关系型数据库？",
                options: ["MongoDB", "Redis", "MySQL", "Neo4j"],
                correct: 2,
                difficulty: "medium",
                explanation: "MySQL是关系型数据库，其他是非关系型数据库。"
            },
            {
                question: "在计算机网络中，HTTP状态码200表示什么？",
                options: ["错误", "重定向", "成功", "未找到"],
                correct: 2,
                difficulty: "medium",
                explanation: "HTTP状态码200表示请求成功。"
            },
            {
                question: "以下哪个是软件开发生命周期的阶段？",
                options: ["需求分析", "硬件组装", "网络配置", "病毒扫描"],
                correct: 0,
                difficulty: "medium",
                explanation: "需求分析是软件开发生命周期的重要阶段。"
            },
            {
                question: "在面向对象编程中，多态的作用是什么？",
                options: ["提高性能", "实现不同对象对同一消息的不同响应", "减少代码量", "简化语法"],
                correct: 1,
                difficulty: "medium",
                explanation: "多态允许不同对象对同一消息产生不同的响应。"
            },
            {
                question: "以下哪个是网络协议？",
                options: ["FTP", "TXT", "DOC", "EXE"],
                correct: 0,
                difficulty: "medium",
                explanation: "FTP是文件传输协议，用于网络文件传输。"
            },
            {
                question: "在数据结构中，队列的特点是什么？",
                options: ["先进先出", "后进先出", "随机访问", "双向访问"],
                correct: 0,
                difficulty: "medium",
                explanation: "队列是先进先出(FIFO)的数据结构。"
            },
            {
                question: "以下哪个是软件测试的类型？",
                options: ["单元测试", "硬件测试", "网络测试", "病毒测试"],
                correct: 0,
                difficulty: "medium",
                explanation: "单元测试是软件测试的重要类型，测试单个功能模块。"
            },
            {
                question: "在算法中，快速排序的平均时间复杂度是多少？",
                options: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
                correct: 2,
                difficulty: "medium",
                explanation: "快速排序的平均时间复杂度是O(n log n)，效率较高。"
            },
            {
                question: "以下哪个是网络拓扑结构？",
                options: ["总线型", "树型", "星型", "以上都是"],
                correct: 3,
                difficulty: "medium",
                explanation: "这些都是常见的网络拓扑结构。"
            },
            {
                question: "在面向对象编程中，抽象的作用是什么？",
                options: ["隐藏复杂实现", "提高执行速度", "减少内存", "简化语法"],
                correct: 0,
                difficulty: "medium",
                explanation: "抽象隐藏了复杂的实现细节，只暴露必要的接口。"
            },
            {
                question: "以下哪个是数据库语言？",
                options: ["SQL", "HTML", "CSS", "JavaScript"],
                correct: 0,
                difficulty: "medium",
                explanation: "SQL是结构化查询语言，用于数据库操作。"
            },
            {
                question: "在计算机网络中，路由器的作用是什么？",
                options: ["存储数据", "连接不同网络", "处理数据", "显示信息"],
                correct: 1,
                difficulty: "medium",
                explanation: "路由器用于连接不同的网络，实现网络间的通信。"
            },
            {
                question: "以下哪个是软件架构模式？",
                options: ["MVC", "CPU", "RAM", "ROM"],
                correct: 0,
                difficulty: "medium",
                explanation: "MVC是模型-视图-控制器的软件架构模式。"
            }
        ];

        // 困难题目 - 对大一学生有一定挑战性的题目
        const hardQuestions = [
            {
                question: "FFT算法的时间复杂度为多少？",
                options: ["O(n)", "O(1)", "O(loglogn)", "O(nlogn)"],
                correct: 3,
                difficulty: "hard",
                explanation: "FFT算法的时间复杂度为O(nlogn)"
            },
            {
                question: "下面哪个是二进制数1010对应的十进制数？",
                options: ["8", "10", "12", "16"],
                correct: 1,
                difficulty: "hard",
                explanation: "二进制1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10（十进制）"
            },
            {
                question: "在编程中，什么是\"循环\"？",
                options: ["重复执行相同的代码", "删除代码", "保存代码", "运行代码"],
                correct: 0,
                difficulty: "hard",
                explanation: "循环是让程序重复执行某段代码的结构，比如打印1到10的数字。"
            },
            {
                question: "计算机中，什么是\"算法\"？",
                options: ["一种硬件", "解决问题的步骤", "一种软件", "一个程序"],
                correct: 1,
                difficulty: "hard",
                explanation: "算法是解决问题的一系列明确步骤，就像做菜的菜谱一样。"
            },
            {
                question: "下面哪个是正确的文件路径格式（Windows系统）？",
                options: ["C/Users/Desktop", "C:\\Users\\Desktop", "C:Users:Desktop", "C|Users|Desktop"],
                correct: 1,
                difficulty: "hard",
                explanation: "Windows系统中，文件路径使用反斜杠\\作为分隔符，如C:\\Users\\Desktop。"
            },
            {
                question: "什么是\"云计算\"？",
                options: ["天气预报", "通过互联网提供计算服务", "空中计算", "计算云朵"],
                correct: 1,
                difficulty: "hard",
                explanation: "云计算是通过互联网提供各种计算服务，如存储、计算能力等，就像用水龙头接水一样方便。"
            },
            {
                question: "以下哪个是并发控制机制？",
                options: ["锁机制", "排序机制", "查找机制", "计算机制"],
                correct: 0,
                difficulty: "hard",
                explanation: "锁机制是并发控制的重要手段，用于防止数据竞争。"
            },
            {
                question: "在算法中，分治法的基本步骤是什么？",
                options: ["分解、解决、合并", "输入、处理、输出", "开始、执行、结束", "定义、实现、测试"],
                correct: 0,
                difficulty: "hard",
                explanation: "分治法的基本步骤是分解、解决、合并。"
            },
            {
                question: "以下哪个是虚拟化技术？",
                options: ["Docker", "Word", "Excel", "PowerPoint"],
                correct: 0,
                difficulty: "hard",
                explanation: "Docker是容器虚拟化技术，用于应用程序的打包和部署。"
            },
            {
                question: "在数据库设计中，第三范式的要求是什么？",
                options: ["消除部分依赖", "消除传递依赖", "消除冗余", "以上都是"],
                correct: 3,
                difficulty: "hard",
                explanation: "第三范式要求消除部分依赖、传递依赖和冗余。"
            },
            {
                question: "以下哪个是微服务架构的特点？",
                options: ["单体应用", "服务解耦", "集中部署", "单一数据库"],
                correct: 1,
                difficulty: "hard",
                explanation: "服务解耦是微服务架构的核心特点，各个服务独立开发和部署。"
            },
            {
                question: "在算法中，贪心算法的特点是什么？",
                options: ["总是选择最优解", "局部最优选择", "全局最优解", "随机选择"],
                correct: 1,
                difficulty: "hard",
                explanation: "贪心算法在每一步都选择局部最优解，但不保证全局最优。"
            },
            {
                question: "以下哪个是区块链技术的特点？",
                options: ["中心化", "可篡改", "去中心化", "单一控制"],
                correct: 2,
                difficulty: "hard",
                explanation: "去中心化是区块链技术的核心特点，没有中央机构控制。"
            },
            {
                question: "在计算机网络中，负载均衡的作用是什么？",
                options: ["提高安全性", "分散网络流量", "减少延迟", "节省带宽"],
                correct: 1,
                difficulty: "hard",
                explanation: "负载均衡用于分散网络流量，提高系统的整体性能。"
            },
            {
                question: "以下哪个是人工智能的算法？",
                options: ["神经网络", "冒泡排序", "快速排序", "二分查找"],
                correct: 0,
                difficulty: "hard",
                explanation: "神经网络是人工智能的重要算法，用于模式识别和机器学习。"
            },
        ];

        // 合并所有题目并按难度排序
        this.questions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    }

    // 初始化事件监听器
    initializeEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('back-to-start-btn').addEventListener('click', () => this.showStartScreen());
    }

    // 开始游戏
    startGame() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        
        // 按难度选择5道题：2道简单，2道中等，1道困难
        this.currentQuestions = this.getRandomQuestions();
        
        this.showGameScreen();
        this.displayQuestion();
        this.updateUI();
        this.saveGameState();
    }

    // 按难度选择题目：2道简单，2道中等，1道困难
    getRandomQuestions() {
        // 按难度分类题目
        const easyQuestions = this.questions.filter(q => q.difficulty === 'easy');
        const mediumQuestions = this.questions.filter(q => q.difficulty === 'medium');
        const hardQuestions = this.questions.filter(q => q.difficulty === 'hard');
        
        // 从每个难度随机选择指定数量的题目
        const selectedEasy = this.shuffleArray([...easyQuestions]).slice(0, 2);
        const selectedMedium = this.shuffleArray([...mediumQuestions]).slice(0, 2);
        const selectedHard = this.shuffleArray([...hardQuestions]).slice(0, 1);
        
        // 按难度从易到难排序
        return [...selectedEasy, ...selectedMedium, ...selectedHard];
    }
    
    // 数组随机排序
    shuffleArray(array) {
        return array.sort(() => 0.5 - Math.random());
    }
    
    // 获取难度文本
    getDifficultyText(difficulty) {
        switch(difficulty) {
            case 'easy': return '简单';
            case 'medium': return '中等';
            case 'hard': return '困难';
            default: return '未知';
        }
    }

    // 显示游戏界面
    showGameScreen() {
        this.hideAllScreens();
        document.getElementById('game-screen').classList.add('active');
    }

    // 显示开始界面
    showStartScreen() {
        this.hideAllScreens();
        document.getElementById('start-screen').classList.add('active');
        this.clearGameState();
    }

    // 隐藏所有界面
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    // 显示题目
    displayQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const difficultyText = this.getDifficultyText(question.difficulty);
        document.getElementById('question-text').innerHTML = `
            <div class="question-header">
                <span class="difficulty-badge ${question.difficulty}">${difficultyText}</span>
            </div>
            <div class="question-content">${question.question}</div>
        `;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <input type="radio" name="question" value="${index}" id="option${index}">
                <label for="option${index}">${option}</label>
            `;
            
            // 为整个选项方框添加点击事件
            optionElement.addEventListener('click', () => this.selectOption(index));
            
            // 为单选按钮添加点击事件（防止重复触发）
            const radioButton = optionElement.querySelector('input[type="radio"]');
            radioButton.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                this.selectOption(index);
            });
            
            optionsContainer.appendChild(optionElement);
        });
    }

    // 选择选项
    selectOption(optionIndex) {
        // 清除之前的选择
        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected');
            // 清除之前选中的单选按钮
            const radio = option.querySelector('input[type="radio"]');
            if (radio) radio.checked = false;
        });
        
        // 标记当前选择
        event.currentTarget.classList.add('selected');
        
        // 选中当前选项的单选按钮
        const currentRadio = event.currentTarget.querySelector('input[type="radio"]');
        if (currentRadio) currentRadio.checked = true;
        
        // 启用下一题按钮
        document.getElementById('next-btn').disabled = false;
        
        // 保存用户答案
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
    }

    // 下一题
    nextQuestion() {
        // 计算当前题的分数
        this.calculateCurrentQuestionScore();
        
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.updateUI();
            document.getElementById('next-btn').disabled = true;
            this.saveGameState();
        } else {
            this.finishGame();
        }
    }

    // 完成游戏
    finishGame() {
        this.calculateScore();
        this.showResultScreen();
        this.saveGameState();
    }

    // 计算分数
    calculateScore() {
        this.score = 0;
        this.userAnswers.forEach((answer, index) => {
            if (answer === this.currentQuestions[index].correct) {
                this.score+=20;
            }
        });
    }

    // 显示结果界面
    showResultScreen() {
        this.hideAllScreens();
        document.getElementById('result-screen').classList.add('active');
        
        // 显示最终分数
        document.getElementById('final-score').textContent = this.score;
        
        // 显示分数评价
        const scoreText = this.getScoreText(this.score);
        document.getElementById('score-text').textContent = scoreText;
        
        // 显示答题详情
        this.displayScoreBreakdown();
    }

    // 获取分数评价
    getScoreText(score) {
        if (score === 100) return "太棒了！你是计算机天才！";
        if (score >= 80) return "很好！你对计算机知识掌握得很不错！";
        if (score >= 60) return "不错！继续学习，你会更棒的！";
        if (score >= 20) return "加油！多学习一些基础知识！";
        return "别灰心！多练习，下次会更好！";
    }

    // 显示答题详情
    displayScoreBreakdown() {
        const breakdownContainer = document.getElementById('score-breakdown');
        breakdownContainer.innerHTML = '';
        
        this.currentQuestions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correct;
            
            const breakdownItem = document.createElement('div');
            breakdownItem.className = 'breakdown-item';
            breakdownItem.innerHTML = `
                <div class="question-result">
                    <span class="result-icon ${isCorrect ? 'correct-icon' : 'incorrect-icon'}">
                        ${isCorrect ? '✅' : '❌'}
                    </span>
                    第${index + 1}题: ${question.question.substring(0, 30)}
                </div>
                <div class="result-details">
                    <div class="result-status">
                        ${isCorrect ? '正确' : '错误'}
                    </div>
                    ${!isCorrect ? `
                        <div class="correct-answer">正确答案: ${question.options[question.correct]}</div>
                        <div class="explanation">解释: ${question.explanation}</div>
                    ` : ''}
                </div>
            `;
            
            breakdownContainer.appendChild(breakdownItem);
        });
    }

    // 重新开始游戏
    restartGame() {
        this.startGame();
    }

    // 计算当前题的分数
    calculateCurrentQuestionScore() {
        // 检查当前题是否答对
        const currentAnswer = this.userAnswers[this.currentQuestionIndex];
        if (currentAnswer !== undefined && currentAnswer === this.currentQuestions[this.currentQuestionIndex].correct) {
            this.score+=20;
        }
        
        // 更新UI显示
        this.updateUI();
    }

    // 更新当前分数（保留以备后用）
    updateCurrentScore() {
        // 计算当前已答题目的分数
        let currentScore = 0;
        for (let i = 0; i <= this.currentQuestionIndex; i++) {
            if (this.userAnswers[i] !== undefined && this.userAnswers[i] === this.currentQuestions[i].correct) {
                currentScore++;
            }
        }
        this.score = currentScore;
        
        // 更新UI显示
        this.updateUI();
    }

    // 更新UI
    updateUI() {
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.currentQuestions.length;
        document.getElementById('current-score').textContent = this.score;
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new QuizGame();
});
