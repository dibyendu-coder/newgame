// Game State
let gameState = {
    currentGame: null,
    score: 0,
    level: 1,
    combo: 0,
    maxCombo: 0
};

// Memory Game State
let memoryState = {
    cards: [],
    flipped: [],
    matched: 0,
    totalPairs: 8
};

// Sequence Game State
let sequenceState = {
    sequence: [],
    userSequence: [],
    isPlaying: false,
    speed: 600
};

// Quiz Game State
let quizState = {
    questions: [
        { q: "What is 2 + 2?", options: ["3", "4", "5", "6"], correct: 1 },
        { q: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
        { q: "What color is the sky?", options: ["Green", "Red", "Blue", "Yellow"], correct: 2 },
        { q: "How many legs does a spider have?", options: ["6", "8", "10", "12"], correct: 1 },
        { q: "What is 5 x 3?", options: ["10", "15", "20", "25"], correct: 1 },
        { q: "What is the largest planet?", options: ["Mars", "Saturn", "Jupiter", "Neptune"], correct: 2 },
        { q: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2 },
        { q: "What year did WWII end?", options: ["1943", "1944", "1945", "1946"], correct: 2 },
        { q: "What is 10 ÷ 2?", options: ["3", "4", "5", "6"], correct: 2 },
        { q: "What is the smallest prime number?", options: ["0", "1", "2", "3"], correct: 2 }
    ],
    currentQuestion: 0,
    answered: false,
    timeLimit: 10
};

// Initialize Game
function startGame(gameType) {
    gameState.currentGame = gameType;
    gameState.score = 0;
    gameState.level = 1;
    gameState.combo = 0;
    updateStats();

    document.getElementById('gameModeSelector').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';

    switch (gameType) {
        case 'memory':
            initMemoryGame();
            break;
        case 'sequence':
            initSequenceGame();
            break;
        case 'quiz':
            initQuizGame();
            break;
    }
}

// MEMORY GAME FUNCTIONS
function initMemoryGame() {
    memoryState.cards = [];
    memoryState.flipped = [];
    memoryState.matched = 0;

    const cardCount = 8 + (gameState.level - 1) * 2;
    memoryState.totalPairs = Math.min(cardCount / 2, 12);

    const symbols = ['🍎', '🍌', '🍊', '🍓', '🥝', '🍉', '🍒', '🥭', '🍑', '🍍', '🥑', '🍒'];
    
    for (let i = 0; i < memoryState.totalPairs; i++) {
        memoryState.cards.push(symbols[i], symbols[i]);
    }

    memoryState.cards.sort(() => Math.random() - 0.5);

    renderMemoryGrid();
    document.getElementById('memoryGame').style.display = 'block';
}

function renderMemoryGrid() {
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';

    memoryState.cards.forEach((card, index) => {
        const btn = document.createElement('button');
        btn.className = 'memory-card';
        btn.onclick = () => flipCard(index);
        btn.textContent = memoryState.flipped.includes(index) ? card : '?';
        
        if (memoryState.flipped.includes(index)) {
            btn.classList.add('flipped');
        }
        
        grid.appendChild(btn);
    });
}

function flipCard(index) {
    if (memoryState.flipped.includes(index) || sequenceState.isPlaying) return;

    memoryState.flipped.push(index);
    renderMemoryGrid();

    if (memoryState.flipped.length === 2) {
        const [first, second] = memoryState.flipped;
        
        if (memoryState.cards[first] === memoryState.cards[second]) {
            gameState.score += 10 * gameState.level;
            gameState.combo++;
            memoryState.matched++;

            setTimeout(() => {
                memoryState.flipped = memoryState.flipped.filter(i => i !== first && i !== second);
                renderMemoryGrid();

                if (memoryState.matched === memoryState.totalPairs) {
                    levelUpMemory();
                }
            }, 500);
        } else {
            gameState.combo = 0;
            setTimeout(() => {
                memoryState.flipped = [];
                renderMemoryGrid();
            }, 1000);
        }

        updateStats();
    }
}

function levelUpMemory() {
    gameState.level++;
    gameState.score += 50 * gameState.level;
    updateStats();

    setTimeout(() => {
        if (gameState.level <= 5) {
            initMemoryGame();
        } else {
            endGame();
        }
    }, 1000);
}

// SEQUENCE GAME FUNCTIONS
function initSequenceGame() {
    sequenceState.sequence = [];
    sequenceState.userSequence = [];
    sequenceState.isPlaying = false;
    sequenceState.speed = Math.max(300, 600 - (gameState.level - 1) * 50);

    document.getElementById('sequenceGame').style.display = 'block';
    playNextSequence();
}

function playNextSequence() {
    sequenceState.isPlaying = true;
    const nextColor = Math.floor(Math.random() * 4);
    sequenceState.sequence.push(nextColor);
    sequenceState.userSequence = [];

    setTimeout(() => {
        playSequence();
    }, 500);
}

function playSequence() {
    let i = 0;
    const playNext = () => {
        if (i < sequenceState.sequence.length) {
            activateButton(sequenceState.sequence[i]);
            i++;
            setTimeout(playNext, sequenceState.speed);
        } else {
            sequenceState.isPlaying = false;
            document.getElementById('sequenceMsg').textContent = 'Your turn!';
        }
    };
    playNext();
}

function userSequence(colorIndex) {
    if (sequenceState.isPlaying) return;

    sequenceState.userSequence.push(colorIndex);
    activateButton(colorIndex);

    if (sequenceState.userSequence[sequenceState.userSequence.length - 1] !== sequenceState.sequence[sequenceState.userSequence.length - 1]) {
        gameState.combo = 0;
        endGame();
        return;
    }

    if (sequenceState.userSequence.length === sequenceState.sequence.length) {
        gameState.score += 10 * gameState.level;
        gameState.combo++;
        gameState.level++;
        updateStats();

        document.getElementById('sequenceMsg').textContent = 'Level ' + gameState.level + '!';

        setTimeout(() => {
            if (gameState.level <= 10) {
                playNextSequence();
            } else {
                endGame();
            }
        }, 1500);
    }
}

function activateButton(index) {
    const buttons = document.querySelectorAll('.seq-btn');
    buttons[index].classList.add('active');
    
    setTimeout(() => {
        buttons[index].classList.remove('active');
    }, 200);
}

// QUIZ GAME FUNCTIONS
function initQuizGame() {
    quizState.currentQuestion = 0;
    quizState.answered = false;
    document.getElementById('quizGame').style.display = 'block';
    displayQuizQuestion();
}

function displayQuizQuestion() {
    if (quizState.currentQuestion >= quizState.questions.length) {
        gameState.level++;
        gameState.score += 100 * gameState.level;
        updateStats();

        if (gameState.level <= 3) {
            quizState.currentQuestion = 0;
            setTimeout(() => displayQuizQuestion(), 1000);
        } else {
            endGame();
        }
        return;
    }

    const question = quizState.questions[quizState.currentQuestion];
    quizState.answered = false;

    document.getElementById('quizQuestion').textContent = question.q;

    const optionsDiv = document.getElementById('quizOptions');
    optionsDiv.innerHTML = '';

    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = option;
        btn.onclick = () => answerQuestion(index, question.correct);
        optionsDiv.appendChild(btn);
    });
}

function answerQuestion(selectedIndex, correctIndex) {
    if (quizState.answered) return;
    quizState.answered = true;

    const options = document.querySelectorAll('.quiz-option');
    
    if (selectedIndex === correctIndex) {
        options[selectedIndex].classList.add('correct');
        gameState.score += 5 * gameState.level;
        gameState.combo++;
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[correctIndex].classList.add('correct');
        gameState.combo = 0;
    }

    updateStats();

    setTimeout(() => {
        quizState.currentQuestion++;
        displayQuizQuestion();
    }, 1500);
}

// Utility Functions
function updateStats() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('combo').textContent = gameState.combo;
}

function resetGame() {
    gameState.currentGame = null;
    document.getElementById('memoryGame').style.display = 'none';
    document.getElementById('sequenceGame').style.display = 'none';
    document.getElementById('quizGame').style.display = 'none';
    document.getElementById('gameModeSelector').style.display = 'block';
    document.getElementById('gameOver').style.display = 'none';
    gameState.score = 0;
    gameState.level = 1;
    gameState.combo = 0;
    updateStats();
}

function endGame() {
    document.getElementById('memoryGame').style.display = 'none';
    document.getElementById('sequenceGame').style.display = 'none';
    document.getElementById('quizGame').style.display = 'none';
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalLevel').textContent = gameState.level;
}

function backToMenu() {
    resetGame();
}
