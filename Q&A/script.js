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
    
    // 清除已使用题目记录，重置题目池
    resetQuestionPool() {
        localStorage.removeItem('usedQuestions');
        console.log('题目池已重置，下次游戏将有更多新题目');
    }

    // 题目库 - 按难度分类的250道计算机知识选择题
    loadQuestions() {
        // 简单题目 - 需要基础理解和简单应用的题目
        const easyQuestions = [
            {
                question: "如果一个程序需要处理大量数据计算，以下哪个硬件组件的性能最关键？",
                options: ["显卡风扇", "CPU和内存", "音响系统", "键盘鼠标"],
                correct: 1,
                difficulty: "easy",
                explanation: "CPU负责计算处理，内存提供数据存取速度，这两者直接影响大量数据计算的效率。"
            },
            {
                question: "小明想要同时运行多个程序而不卡顿，他最应该关注电脑的哪个配置？",
                options: ["硬盘容量", "内存大小", "显示器尺寸", "网络速度"],
                correct: 1,
                difficulty: "easy",
                explanation: "内存大小决定了能同时运行多少程序。内存不足时系统会变慢，因为需要频繁使用虚拟内存。"
            },
            {
                question: "你有一个8GB的U盘，想存储一些高清电影。如果每部电影大约2GB，理论上最多能存几部？",
                options: ["2部", "3部", "4部", "5部"],
                correct: 1,
                difficulty: "easy",
                explanation: "8GB ÷ 2GB = 4部，但实际可用空间会少一些，因为文件系统本身占用空间，所以实际能存3部左右。"
            },
            {
                question: "你需要编写一个简单的程序，以下哪个软件最适合初学者？",
                options: ["Photoshop", "记事本或VS Code", "Excel", "浏览器"],
                correct: 1,
                difficulty: "easy",
                explanation: "记事本可以编写简单代码，VS Code是专业的代码编辑器，都适合编程学习。"
            },
            {
                question: "为什么关机前要保存文件？",
                options: ["让电脑运行更快", "内存中的数据会丢失", "减少病毒感染", "节省电费"],
                correct: 1,
                difficulty: "easy",
                explanation: "内存（RAM）是易失性存储，断电后数据会丢失。只有保存到硬盘等永久存储设备中，数据才能保留。"
            },
            {
                question: "你想访问一个网站但页面显示不出来，以下哪个可能是原因？",
                options: ["浏览器版本太新", "网络连接问题", "电脑内存太大", "硬盘空间太多"],
                correct: 1,
                difficulty: "easy",
                explanation: "网页无法显示通常是网络连接问题，比如断网、DNS解析失败或网站服务器故障。"
            },
            {
                question: "你在写作业时想快速复制一段文字到另一个文档，最高效的方法是？",
                options: ["重新打字", "用Ctrl+C和Ctrl+V", "截图后插入", "用手机拍照"],
                correct: 1,
                difficulty: "easy",
                explanation: "Ctrl+C复制，Ctrl+V粘贴，这是最快速的文本复制方法，比重新打字效率高很多。"
            },
            {
                question: "你收到一个可疑邮件附件'photo.jpg.exe'，应该怎么处理？",
                options: ["立即打开查看", "不要打开，可能是病毒", "转发给朋友", "保存到桌面"],
                correct: 1,
                difficulty: "easy",
                explanation: "双扩展名文件（如.jpg.exe）通常是恶意软件，伪装成图片但实际是可执行程序，不应打开。"
            },
            {
                question: "你的电脑突然变得很慢，以下哪个可能是原因？",
                options: ["屏幕太亮", "运行程序太多或感染病毒", "键盘太脏", "鼠标没电"],
                correct: 1,
                difficulty: "easy",
                explanation: "电脑变慢通常是因为内存不足（程序太多）、CPU占用过高、或者感染了恶意软件。"
            },
            {
                question: "你的手机无法充电，检查发现USB线没问题，可能的原因是？",
                options: ["手机屏幕坏了", "充电口或充电器故障", "手机内存不足", "网络信号差"],
                correct: 1,
                difficulty: "easy",
                explanation: "充电问题通常出现在充电口接触不良、充电器功率不足或损坏等硬件问题上。"
            },
            {
                question: "你想找一篇关于'人工智能发展历史'的学术论文，最好用哪个平台？",
                options: ["抖音", "百度学术或Google Scholar", "游戏平台", "购物网站"],
                correct: 1,
                difficulty: "easy",
                explanation: "学术搜索引擎如百度学术、Google Scholar专门收录学术论文，比普通搜索引擎更适合学术研究。"
            },
            {
                question: "你的电脑硬盘快满了，以下哪种方法最能有效释放空间？",
                options: ["重启电脑", "删除不需要的文件和程序", "关闭显示器", "拔掉鼠标"],
                correct: 1,
                difficulty: "easy",
                explanation: "硬盘用于长期存储，删除不需要的文件、卸载无用程序、清理临时文件是释放空间的有效方法。"
            },
            {
                question: "在线考试时，以下哪种输入方式最适合快速答题？",
                options: ["手写板", "键盘打字", "语音输入", "鼠标点击"],
                correct: 1,
                difficulty: "easy",
                explanation: "键盘打字是最快速、准确的文字输入方式，特别适合需要大量文字输入的场景。"
            },
            {
                question: "你正在写一份重要报告，突然停电了。如果之前没保存，数据会怎样？",
                options: ["自动保存到硬盘", "数据丢失", "保存到云端", "转移到U盘"],
                correct: 1,
                difficulty: "easy",
                explanation: "内存中未保存的数据在断电后会丢失，这就是为什么要养成经常保存文件的习惯。"
            },
            {
                question: "你想制作一个包含背景音乐的视频，需要什么格式的音频文件？",
                options: [".docx文档", ".jpg图片", ".mp3或.wav音频", ".exe程序"],
                correct: 2,
                difficulty: "easy",
                explanation: "视频制作需要音频文件，.mp3、.wav等是常见的音频格式，其他格式无法作为音频使用。"
            },
            {
                question: "你需要快速记录一些想法和代码片段，以下哪个最合适？",
                options: ["记事本或代码编辑器", "计算器", "画图软件", "音乐播放器"],
                correct: 0,
                difficulty: "easy",
                explanation: "记事本适合快速记录文字，代码编辑器有语法高亮功能，都适合记录想法和代码。"
            },
            {
                question: "你下载了一个500MB的软件，但只有400MB可用空间，会发生什么？",
                options: ["正常下载", "下载失败或不完整", "自动压缩文件", "文件会变小"],
                correct: 1,
                difficulty: "easy",
                explanation: "存储空间不足时下载会失败，这涉及1MB=1024KB的换算和空间管理概念。"
            },
            {
                question: "你在做演示时，需要控制幻灯片切换，最方便的输入设备是？",
                options: ["鼠标或演示器", "键盘", "触摸屏", "麦克风"],
                correct: 0,
                difficulty: "easy",
                explanation: "鼠标点击或专用演示器（激光笔）最适合演示控制，因为可以远距离操作且操作简单。"
            }
        ];

        // 中等题目 - 需要理解计算机科学概念和逻辑思维的题目
        const mediumQuestions = [
            {
                question: "在一个学生管理系统中，如果要存储1000个学生的姓名、学号和成绩，最合适的数据结构是？",
                options: ["单个变量", "数组或列表", "只用文本文件", "不需要存储"],
                correct: 1,
                difficulty: "medium",
                explanation: "数组或列表可以存储多个相同类型的数据，非常适合管理大量学生信息，每个元素可以是包含姓名、学号、成绩的结构。"
            },
            {
                question: "你设计一个网站注册系统，用户输入邮箱'user@domain'，以下哪个验证最重要？",
                options: ["检查长度", "验证@符号和域名格式", "检查颜色", "计算字符数量"],
                correct: 1,
                difficulty: "medium",
                explanation: "邮箱验证需要检查@符号存在、域名格式正确等，这涉及正则表达式和输入验证的概念。"
            },
            {
                question: "以下哪个最能体现'程序'的本质特征？",
                options: ["文件大小", "按顺序执行的指令集合", "编程语言类型", "运行时间长短"],
                correct: 1,
                difficulty: "medium",
                explanation: "程序的本质是一系列按特定顺序排列的指令，计算机按照这些指令执行任务，这是程序设计的核心概念。"
            },
            {
                question: "你要开发一个计算器程序，需要处理用户输入的数学表达式'2+3*4'，正确的计算顺序应该考虑什么？",
                options: ["从左到右计算", "运算符优先级", "随机顺序", "用户喜好"],
                correct: 1,
                difficulty: "medium",
                explanation: "数学表达式计算需要遵循运算符优先级，乘除法优先于加减法，这涉及编译原理和表达式解析算法。"
            },
            {
                question: "在设计一个校园网络时，以下哪个因素最影响网络性能？",
                options: ["路由器颜色", "带宽和延迟", "网线长度", "设备品牌"],
                correct: 1,
                difficulty: "medium",
                explanation: "网络性能主要由带宽（数据传输速率）和延迟（数据传输时间）决定，这是网络工程的核心概念。"
            },
            {
                question: "设计用户密码系统时，以下哪种策略最能提高安全性？",
                options: ["只要求8位数字", "强制复杂密码+定期更换", "允许简单密码", "不设密码"],
                correct: 1,
                difficulty: "medium",
                explanation: "安全的密码策略需要复杂性（大小写+数字+特殊字符）和时效性，这涉及信息安全和密码学基础。"
            },
            {
                question: "你需要对10000个学生成绩进行排序，如果使用冒泡排序大约需要1小时，那么使用快速排序大约需要多长时间？",
                options: ["1小时", "几分钟", "10小时", "1天"],
                correct: 1,
                difficulty: "medium",
                explanation: "冒泡排序O(n²)vs快速排序O(n log n)，对于10000个数据，快速排序比冒泡排序快约1000倍，体现了算法效率的重要性。"
            },
            {
                question: "设计一个图书管理系统，需要存储书籍信息并支持按书名、作者、ISBN查询，最适合的数据库类型是？",
                options: ["文本文件", "关系型数据库(如MySQL)", "图片文件", "音频文件"],
                correct: 1,
                difficulty: "medium",
                explanation: "关系型数据库支持结构化数据存储、索引查询、事务处理，非常适合图书管理这种有明确关系的数据。"
            },
            {
                question: "你开发的网站用户反馈'页面加载很慢'，通过检查发现服务器返回HTTP 200状态码，可能的原因是？",
                options: ["服务器拒绝访问", "数据传输量大或服务器处理慢", "页面不存在", "用户权限不足"],
                correct: 1,
                difficulty: "medium",
                explanation: "HTTP 200表示请求成功，但页面慢可能是数据量大、数据库查询慢、网络带宽不足等性能问题。"
            },
            {
                question: "你的团队要开发一个在线购物系统，在需求分析阶段最重要的是什么？",
                options: ["选择编程语言", "理解用户需求和业务流程", "购买服务器", "设计界面颜色"],
                correct: 1,
                difficulty: "medium",
                explanation: "需求分析阶段要深入理解用户需求、业务流程、功能要求，这决定了整个系统的设计方向和成功与否。"
            },
            {
                question: "在设计一个动物管理系统时，'狗'和'猫'都继承自'动物'类，它们都有'叫声'方法但实现不同，这体现了什么概念？",
                options: ["封装", "多态", "继承", "抽象"],
                correct: 1,
                difficulty: "medium",
                explanation: "多态允许不同子类对同一方法有不同实现，狗叫'汪汪'，猫叫'喵喵'，同样是'叫声'方法但行为不同。"
            },
            {
                question: "你要实现一个文件上传功能，需要使用哪种网络协议最合适？",
                options: ["HTTP/HTTPS", "SMS短信协议", "蓝牙协议", "红外协议"],
                correct: 0,
                difficulty: "medium",
                explanation: "HTTP/HTTPS是Web应用的标准协议，支持文件上传，安全可靠，而其他协议不适合Web文件传输。"
            },
            {
                question: "设计一个打印任务管理系统，多个用户同时提交打印任务，应该采用什么数据结构来管理任务顺序？",
                options: ["栈(后进先出)", "队列(先进先出)", "随机列表", "不需要排序"],
                correct: 1,
                difficulty: "medium",
                explanation: "打印任务应该按提交顺序处理，队列的先进先出特性完美符合这个需求，保证公平性。"
            },
            {
                question: "你开发了一个登录功能，如何确保它能正确处理各种情况？",
                options: ["只测试正确密码", "单元测试:正确密码、错误密码、空输入等", "让用户自己测试", "不需要测试"],
                correct: 1,
                difficulty: "medium",
                explanation: "单元测试需要覆盖各种边界情况和异常情况，确保代码在各种输入下都能正确工作。"
            },
            {
                question: "你需要处理1亿个数据的排序，在内存有限的情况下，最好选择哪种算法策略？",
                options: ["简单冒泡排序", "外部排序(如归并排序)", "不进行排序", "手工排序"],
                correct: 1,
                difficulty: "medium",
                explanation: "大数据排序需要外部排序算法，将数据分块处理，归并排序的O(n log n)复杂度和稳定性使其成为最佳选择。"
            },
            {
                question: "设计校园网络时，宿舍楼、教学楼、图书馆需要互联，以下哪种拓扑结构最合适？",
                options: ["星型(中心交换机)", "总线型", "环型", "随意连接"],
                correct: 0,
                difficulty: "medium",
                explanation: "星型拓扑以中心交换机连接各建筑，便于管理、扩展和故障排除，是现代网络的标准架构。"
            },
            {
                question: "设计一个图形界面库，用户只需调用drawShape()方法，不需要知道具体如何绘制，这体现了什么原则？",
                options: ["抽象", "具体化", "复杂化", "可视化"],
                correct: 0,
                difficulty: "medium",
                explanation: "抽象隐藏了复杂的绘制实现，用户只需要知道接口，不需要了解内部细节，这是良好的软件设计原则。"
            },
            {
                question: "你要查询学生数据库中'计算机专业且成绩>90分'的学生，应该使用什么语言？",
                options: ["SQL", "HTML", "CSS", "JavaScript"],
                correct: 0,
                difficulty: "medium",
                explanation: "SQL专门用于数据库查询，支持复杂的条件查询、连接、聚合等操作，是数据库操作的标准语言。"
            },
            {
                question: "公司有北京、上海、深圳三个办公室，需要实现网络互通，路由器的主要作用是什么？",
                options: ["存储文件", "连接不同网段并转发数据", "播放视频", "打印文档"],
                correct: 1,
                difficulty: "medium",
                explanation: "路由器工作在网络层，负责不同网络间的数据包转发和路径选择，实现跨地域网络通信。"
            },
            {
                question: "开发一个Web应用，采用MVC架构模式的主要优势是什么？",
                options: ["代码分离，便于维护和测试", "运行更快", "占用内存更少", "界面更美观"],
                correct: 0,
                difficulty: "medium",
                explanation: "MVC将业务逻辑(Model)、用户界面(View)、控制逻辑(Controller)分离，提高代码可维护性和可测试性。"
            }
        ];

        // 困难题目 - 对大一学生有一定挑战性的题目
        const hardQuestions = [
            {
                question: "设计一个高并发的在线购物系统，在秒杀活动中如何防止超卖问题？",
                options: ["使用分布式锁+库存预扣+异步处理", "直接操作数据库", "增加服务器数量", "限制用户访问"],
                correct: 0,
                difficulty: "hard",
                explanation: "高并发秒杀需要分布式锁保证原子性，库存预扣避免超卖，异步处理提高响应速度，这是完整的解决方案。"
            },
            {
                question: "分析以下递归算法T(n)=2T(n/2)+O(n)的时间复杂度，并说明原因：",
                options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
                correct: 1,
                difficulty: "hard",
                explanation: "根据主定理，T(n)=2T(n/2)+O(n)属于情况2，时间复杂度为O(n log n)，典型例子是归并排序。"
            },
            {
                question: "设计一个分布式缓存系统，如何解决缓存雪崩、缓存穿透、缓存击穿三大问题？",
                options: ["随机过期时间+布隆过滤器+互斥锁", "增加缓存容量", "使用更快的硬件", "减少缓存使用"],
                correct: 0,
                difficulty: "hard",
                explanation: "缓存雪崩用随机过期时间，缓存穿透用布隆过滤器，缓存击穿用互斥锁，这是经典的解决方案组合。"
            },
            {
                question: "实现一个LRU缓存，要求O(1)时间复杂度的get和put操作，应该使用什么数据结构？",
                options: ["哈希表+双向链表", "数组+栈", "二叉树+队列", "单链表+哈希表"],
                correct: 0,
                difficulty: "hard",
                explanation: "LRU缓存需要哈希表实现O(1)查找，双向链表实现O(1)插入删除，两者结合才能满足时间复杂度要求。"
            },
            {
                question: "设计一个微服务架构的电商系统，如何处理分布式事务保证数据一致性？",
                options: ["Saga模式+补偿机制", "单体事务", "忽略一致性", "手动回滚"],
                correct: 0,
                difficulty: "hard",
                explanation: "分布式事务可用Saga模式，通过编排本地事务和补偿机制来保证最终一致性，避免分布式锁的性能问题。"
            },
            {
                question: "分析MapReduce框架处理大数据的核心思想，其容错机制是什么？",
                options: ["数据分片+并行计算+检查点重启", "单机处理", "内存计算", "实时处理"],
                correct: 0,
                difficulty: "hard",
                explanation: "MapReduce通过数据分片实现并行，检查点机制在节点故障时重启任务，保证大规模数据处理的可靠性。"
            },
            {
                question: "设计一个支持百万级用户的实时聊天系统，如何选择合适的技术架构？",
                options: ["WebSocket+消息队列+分布式存储", "HTTP轮询+单机数据库", "FTP+文件存储", "邮件系统"],
                correct: 0,
                difficulty: "hard",
                explanation: "实时聊天需要WebSocket保持长连接，消息队列处理高并发，分布式存储保证可扩展性和可靠性。"
            },
            {
                question: "分析快速排序在最坏情况下退化为O(n²)的原因，如何优化？",
                options: ["选择随机pivot+三数取中法", "增加内存", "使用更快CPU", "减少数据量"],
                correct: 0,
                difficulty: "hard",
                explanation: "快排最坏情况是每次pivot都是最值，随机选择pivot和三数取中法可以有效避免这种情况。"
            },
            {
                question: "实现一个高可用的分布式数据库，如何处理脑裂问题？",
                options: ["Raft共识算法+奇数节点", "增加备份", "使用更好硬件", "手动切换"],
                correct: 0,
                difficulty: "hard",
                explanation: "脑裂问题需要共识算法如Raft保证一致性，奇数节点确保能选出唯一leader，避免多个主节点。"
            },
            {
                question: "设计一个搜索引擎的倒排索引，如何优化存储和查询性能？",
                options: ["分片存储+布隆过滤器+压缩算法", "单机存储", "内存缓存", "文件系统"],
                correct: 0,
                difficulty: "hard",
                explanation: "倒排索引需要分片存储支持水平扩展，布隆过滤器减少无效查询，压缩算法节省存储空间。"
            },
            {
                question: "分析B+树相比B树在数据库索引中的优势，为什么MySQL选择B+树？",
                options: ["叶子节点链表+更好的范围查询+更高的扇出比", "更简单的结构", "更少的内存使用", "更快的插入"],
                correct: 0,
                difficulty: "hard",
                explanation: "B+树叶子节点形成链表支持范围查询，非叶子节点不存数据提高扇出比，减少磁盘I/O次数。"
            },
            {
                question: "实现一个分布式限流系统，如何在保证准确性的同时提高性能？",
                options: ["滑动窗口+Redis+Lua脚本", "单机计数", "数据库记录", "文件存储"],
                correct: 0,
                difficulty: "hard",
                explanation: "滑动窗口算法保证限流准确性，Redis提供高性能存储，Lua脚本保证操作原子性。"
            },
            {
                question: "设计一个区块链共识机制，如何在拜占庭容错的前提下保证性能？",
                options: ["PBFT+分片+并行验证", "单节点验证", "中心化控制", "随机选择"],
                correct: 0,
                difficulty: "hard",
                explanation: "PBFT算法可容忍1/3恶意节点，分片技术提高吞吐量，并行验证加速共识过程。"
            },
            {
                question: "分析CDN系统的缓存策略，如何实现全球用户的最优访问体验？",
                options: ["地理位置路由+热点预测+智能缓存淘汰", "单点缓存", "随机分发", "固定路由"],
                correct: 0,
                difficulty: "hard",
                explanation: "CDN需要地理路由就近访问，热点预测提前缓存，智能淘汰算法优化存储利用率。"
            },
            {
                question: "实现一个机器学习推荐系统，如何解决冷启动和数据稀疏问题？",
                options: ["协同过滤+内容过滤+深度学习嵌入", "随机推荐", "热门推荐", "固定推荐"],
                correct: 0,
                difficulty: "hard",
                explanation: "协同过滤利用用户行为，内容过滤解决冷启动，深度学习嵌入处理稀疏数据，多策略融合效果最佳。"
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
        
        // 获取或初始化已使用题目记录
        let usedQuestions = JSON.parse(localStorage.getItem('usedQuestions') || '[]');
        
        // 如果已使用的题目太多，清空记录重新开始
        const totalQuestions = this.questions.length;
        if (usedQuestions.length > totalQuestions * 0.7) {
            usedQuestions = [];
            localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
        }
        
        // 过滤掉最近使用过的题目
        const availableEasy = easyQuestions.filter(q => !usedQuestions.includes(q.question));
        const availableMedium = mediumQuestions.filter(q => !usedQuestions.includes(q.question));
        const availableHard = hardQuestions.filter(q => !usedQuestions.includes(q.question));
        
        // 从可用题目中随机选择，如果可用题目不足则从全部题目中选择
        const selectedEasy = this.getRandomFromArray(
            availableEasy.length >= 2 ? availableEasy : easyQuestions, 2
        );
        const selectedMedium = this.getRandomFromArray(
            availableMedium.length >= 2 ? availableMedium : mediumQuestions, 2
        );
        const selectedHard = this.getRandomFromArray(
            availableHard.length >= 1 ? availableHard : hardQuestions, 1
        );
        
        // 记录本次使用的题目
        const currentQuestions = [...selectedEasy, ...selectedMedium, ...selectedHard];
        const newUsedQuestions = currentQuestions.map(q => q.question);
        usedQuestions.push(...newUsedQuestions);
        localStorage.setItem('usedQuestions', JSON.stringify(usedQuestions));
        
        // 将所有选中的题目混合并随机排序
        return this.shuffleArray(currentQuestions);
    }
    
    // 从数组中随机选择指定数量的元素（不重复）
    getRandomFromArray(array, count) {
        if (array.length <= count) {
            return [...array]; // 如果题目数量不足，返回所有题目
        }
        
        const shuffled = this.shuffleArray([...array]);
        return shuffled.slice(0, count);
    }
    
    // 使用Fisher-Yates洗牌算法进行真正的随机排序
    shuffleArray(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
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
