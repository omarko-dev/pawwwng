// Constants and Configuration
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const BALL_RADIUS = 30;
const HAND_WIDTH = 100;
const HAND_HEIGHT = 150;
const HAND_FRICTION = 0.95; // Adjusted friction for smoother deceleration
const HAND_ACCELERATION = 3.0; // Adjusted acceleration for smoother movement
const HAND_MAX_SPEED = 10; // Cap the maximum speed for hands
const BALL_INITIAL_SPEED = 2;
const BALL_SPEED_INCREMENT = 1.05; // Reduced speed increment for gradual difficulty increase
const MESSAGE_DISPLAY_TIME = 3000;
const MESSAGE_FADE_OUT_TIME = 2000;
const GAME_OVER_DELAY = 1000;
const GAME_OVER_SOUND_VOLUME = 0.05;
const PAUSE_KEY = 'p';
const RESUME_KEY = 'r';
const DIFFICULTY_LEVELS = {
    easy: { ballSpeed: 2, handSpeed: 2 },
    medium: { ballSpeed: 3, handSpeed: 3 },
    hard: { ballSpeed: 4, handSpeed: 4 }
};

// Game Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const bestScoreElement = document.getElementById('bestScore');
const leftInstructionsElement = document.getElementById('leftInstructions');
const rightInstructionsElement = document.getElementById('rightInstructions');
const musicToggleElement = document.getElementById('musicToggle');
const musicIconElement = document.getElementById('musicIcon');
const musicMessageElement = document.getElementById('musicMessage');
const pauseMessageElement = document.getElementById('pauseMessage');

// Game State
let score = 0;
let bestScore = 0;
let gameOver = false;
let ballHit = false;
let gameStarted = false;
let gamePaused = false;
let currentDifficulty = DIFFICULTY_LEVELS.medium;

// Ball Object
const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: BALL_RADIUS,
    dx: BALL_INITIAL_SPEED,
    dy: -BALL_INITIAL_SPEED,
    image: new Image(),
    visible: false
};

// Hand Objects
const leftHand = {
    x: CANVAS_WIDTH / 4 - HAND_WIDTH / 2,
    y: CANVAS_HEIGHT - HAND_HEIGHT,
    width: HAND_WIDTH,
    height: HAND_HEIGHT,
    dx: 0,
    image: new Image()
};

const rightHand = {
    x: (CANVAS_WIDTH / 4) * 3 - HAND_WIDTH / 2,
    y: CANVAS_HEIGHT - HAND_HEIGHT,
    width: HAND_WIDTH,
    height: HAND_HEIGHT,
    dx: 0,
    image: new Image()
};

// Load Images
ball.image.src = 'assets/ball.png';
leftHand.image.src = 'assets/Left-Hand.png';
rightHand.image.src = 'assets/Right-Hand.png';

// Load Sounds
const hitSound = new Audio('assets/sound-effect.mp3');
const backgroundMusic = new Audio('assets/background-music.mp3');
backgroundMusic.loop = true;
const gameOverSound = new Audio('assets/cat-soundeffect.mp3');
gameOverSound.volume = GAME_OVER_SOUND_VOLUME;

// Drawing Functions
function drawBall() {
    if (ball.visible) {
        ctx.drawImage(ball.image, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
    }
}

function drawHand(hand) {
    ctx.drawImage(hand.image, hand.x, hand.y, hand.width, hand.height);
    ctx.beginPath();
    ctx.arc(hand.x + hand.width / 2, hand.y, hand.width / 2, 0, Math.PI * 2);
    ctx.closePath();
}

// Movement Functions
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > CANVAS_WIDTH || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        hitSound.play();
    }

    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        hitSound.play();
    }

    if (ball.y + ball.radius > CANVAS_HEIGHT - 50) {
        endGame();
    }

    checkCollisionWithHand(leftHand);
    checkCollisionWithHand(rightHand);
}

function checkCollisionWithHand(hand) {
    if (ball.x + ball.radius > hand.x + 20 && ball.x - ball.radius < hand.x + hand.width - 20 &&
        ball.y + ball.radius > hand.y + 20 && ball.y - ball.radius < hand.y + hand.height - 10 && !ballHit) {
        ball.dy = -ball.dy;
        ball.dy *= BALL_SPEED_INCREMENT;
        ball.dx *= BALL_SPEED_INCREMENT;
        score++;
        updateScore();
        ballHit = true;
        hitSound.play();
    }

    if (ball.y + ball.radius < hand.y) {
        ballHit = false;
    }
}

function moveHands() {
    leftHand.x += leftHand.dx;
    rightHand.x += rightHand.dx;

    leftHand.dx *= HAND_FRICTION;
    rightHand.dx *= HAND_FRICTION;

    // Cap the maximum speed for hands
    if (leftHand.dx > HAND_MAX_SPEED) leftHand.dx = HAND_MAX_SPEED;
    if (leftHand.dx < -HAND_MAX_SPEED) leftHand.dx = -HAND_MAX_SPEED;
    if (rightHand.dx > HAND_MAX_SPEED) rightHand.dx = HAND_MAX_SPEED;
    if (rightHand.dx < -HAND_MAX_SPEED) rightHand.dx = -HAND_MAX_SPEED;

    constrainHands();
}

function constrainHands() {
    if (leftHand.x < 0) leftHand.x = 0;
    if (leftHand.x + leftHand.width > CANVAS_WIDTH) leftHand.x = CANVAS_WIDTH - leftHand.width;

    if (rightHand.x < 0) rightHand.x = 0;
    if (rightHand.x + rightHand.width > CANVAS_WIDTH) rightHand.x = CANVAS_WIDTH - rightHand.width;

    if (leftHand.x + leftHand.width > rightHand.x) {
        leftHand.x = rightHand.x - leftHand.width;
    }
    if (rightHand.x < leftHand.x + leftHand.width) {
        rightHand.x = leftHand.x + leftHand.width;
    }
}

// Game Logic
function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function endGame() {
    gameOver = true;
    gameOverElement.style.display = 'block';
    if (score > bestScore) {
        bestScore = score;
    }
    bestScoreElement.textContent = `Best Score: ${bestScore}`;
    bestScoreElement.style.display = 'block';
    gameOverSound.play();
    setTimeout(() => {
        document.addEventListener('keydown', restartGame, { once: true });
    }, GAME_OVER_DELAY);
}

function restartGame() {
    score = 0;
    updateScore();
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    ball.dx = BALL_INITIAL_SPEED;
    ball.dy = -BALL_INITIAL_SPEED;
    ball.visible = false;
    gameOver = false;
    gameOverElement.style.display = 'none';
    bestScoreElement.style.display = 'none';
    gameStarted = false;
    update();
}

function update() {
    if (gameOver || gamePaused) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBall();
    drawHand(leftHand);
    drawHand(rightHand);
    if (gameStarted) {
        moveBall();
    }
    moveHands();
    requestAnimationFrame(update);
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (!gameStarted) {
        gameStarted = true;
        ball.visible = true;
        leftInstructionsElement.style.display = 'none';
        rightInstructionsElement.style.display = 'none';
        update();
    }
    if (e.key === 'ArrowLeft') {
        rightHand.dx -= HAND_ACCELERATION;
    } else if (e.key === 'ArrowRight') {
        rightHand.dx += HAND_ACCELERATION;
    } else if (e.key === 'a' || e.key === 'A') {
        leftHand.dx -= HAND_ACCELERATION;
    } else if (e.key === 'd' || e.key === 'D') {
        leftHand.dx += HAND_ACCELERATION;
    } else if (e.key === PAUSE_KEY) {
        gamePaused = true;
        pauseMessageElement.style.display = 'block';
    } else if (e.key === RESUME_KEY) {
        gamePaused = false;
        pauseMessageElement.style.display = 'none';
        update();
    }
});

musicToggleElement.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(error => console.error('Error playing background music:', error));
        musicIconElement.src = 'assets/volume.png';
    } else {
        backgroundMusic.pause();
        musicIconElement.src = 'assets/no-volume.png';
    }
});

// Show the music message and hide it after a few seconds with animation
musicMessageElement.style.display = 'block';
setTimeout(() => {
    musicMessageElement.style.animation = 'fadeOutMessage 2s ease-in-out forwards';
}, MESSAGE_DISPLAY_TIME);

update();
