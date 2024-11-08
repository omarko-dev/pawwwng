const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const leftInstructionsElement = document.getElementById('leftInstructions');
const rightInstructionsElement = document.getElementById('rightInstructions');
const musicToggleElement = document.getElementById('musicToggle');
const musicIconElement = document.getElementById('musicIcon');

let score = 0;
let gameOver = false;
let ballHit = false; // Flag to track ball collision with pawns
let gameStarted = false; // Flag to track if the game has started

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 40, // Increased the radius of the ball
    dx: 2, // Reduced initial speed
    dy: -2, // Reduced initial speed
    image: new Image(),
    visible: false // Ball is initially invisible
};

const leftHand = {
    x: canvas.width / 4 - 65, // Adjusted to ensure the whole arm is visible
    y: canvas.height - 180, // Stick to the bottom and stretch upwards
    width: 130, // Adjusted the width of the hand
    height: 180, // Adjusted the height of the hand
    dx: 0,
    image: new Image()
};

const rightHand = {
    x: (canvas.width / 4) * 3 - 65, // Adjusted to ensure the whole arm is visible
    y: canvas.height - 180, // Stick to the bottom and stretch upwards
    width: 130, // Adjusted the width of the hand
    height: 180, // Adjusted the height of the hand
    dx: 0,
    image: new Image()
};

ball.image.src = 'assets/ball.png';
leftHand.image.src = 'assets/Left-Hand.png';
rightHand.image.src = 'assets/Right-Hand.png';

const friction = 0.98; // Lowered friction for smoother gameplay
const acceleration = 1.5; // Lowered acceleration for smoother gameplay

const hitSound = new Audio('assets/sound-effect.mp3'); // Load the sound effect
const backgroundMusic = new Audio('assets/background-music.mp3'); // Load the background music
backgroundMusic.loop = true; // Loop the background music

function drawBall() {
    if (ball.visible) {
        ctx.drawImage(ball.image, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
    }
}

function drawHand(hand) {
    ctx.drawImage(hand.image, hand.x, hand.y, hand.width, hand.height);
    // Draw a circle on top of the hand for collision detection
    ctx.beginPath();
    ctx.arc(hand.x + hand.width / 2, hand.y, hand.width / 2, 0, Math.PI * 2);
    ctx.closePath();
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        hitSound.play(); // Play sound effect
    }

    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        hitSound.play(); // Play sound effect
    }

    if (ball.y + ball.radius > canvas.height - 50) { // End the game when the ball is close to the bottom
        endGame();
    }

    // Check collision with left hand
    if (ball.x > leftHand.x && ball.x < leftHand.x + leftHand.width && ball.y + ball.radius > leftHand.y && !ballHit) {
        ball.dy = -ball.dy;
        ball.dy *= 1.02; // Slightly increase speed to make the game harder
        ball.dx *= 1.02; // Slightly increase speed to make the game harder
        score++;
        updateScore();
        ballHit = true; // Set the flag to true when the ball hits a pawn
        hitSound.play(); // Play sound effect
    }

    // Check collision with right hand
    if (ball.x > rightHand.x && ball.x < rightHand.x + rightHand.width && ball.y + ball.radius > rightHand.y && !ballHit) {
        ball.dy = -ball.dy;
        ball.dy *= 1.02; // Slightly increase speed to make the game harder
        ball.dx *= 1.02; // Slightly increase speed to make the game harder
        score++;
        updateScore();
        ballHit = true; // Set the flag to true when the ball hits a pawn
        hitSound.play(); // Play sound effect
    }

    // Reset the ballHit flag when the ball moves away from the pawns
    if (ball.y + ball.radius < leftHand.y || ball.y + ball.radius < rightHand.y) {
        ballHit = false;
    }
}

function moveHands() {
    leftHand.x += leftHand.dx;
    rightHand.x += rightHand.dx;

    leftHand.dx *= friction;
    rightHand.dx *= friction;

    if (leftHand.x < 0) leftHand.x = 0;
    if (rightHand.x < 0) rightHand.x = 0;
    if (leftHand.x + leftHand.width > canvas.width) leftHand.x = canvas.width - leftHand.width;
    if (rightHand.x + rightHand.width > canvas.width) rightHand.x = canvas.width - rightHand.width;

    if (leftHand.x + leftHand.width > rightHand.x) {
        leftHand.x = rightHand.x - leftHand.width;
    }
    if (rightHand.x < leftHand.x + leftHand.width) {
        rightHand.x = leftHand.x + leftHand.width;
    }
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function endGame() {
    gameOver = true;
    gameOverElement.style.display = 'block';
    setTimeout(() => {
        document.addEventListener('keydown', restartGame, { once: true });
    }, 1000);
}

function restartGame() {
    score = 0;
    updateScore();
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 2; // Reset initial speed
    ball.dy = -2; // Reset initial speed
    ball.visible = false; // Make the ball invisible again
    gameOver = false;
    gameOverElement.style.display = 'none';
    gameStarted = false; // Reset game started flag
    update();
}

function update() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawHand(leftHand);
    drawHand(rightHand);
    if (gameStarted) {
        moveBall();
    }
    moveHands();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', (e) => {
    if (!gameStarted) {
        gameStarted = true;
        ball.visible = true; // Make the ball visible when the game starts
        leftInstructionsElement.style.display = 'none'; // Hide left instructions when the game starts
        rightInstructionsElement.style.display = 'none'; // Hide right instructions when the game starts
        update(); // Start the game loop
    }
    if (e.key === 'ArrowLeft') {
        rightHand.dx -= acceleration;
    } else if (e.key === 'ArrowRight') {
        rightHand.dx += acceleration;
    } else if (e.key === 'a') {
        leftHand.dx -= acceleration;
    } else if (e.key === 'd') {
        leftHand.dx += acceleration;
    }
});

musicToggleElement.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        musicIconElement.src = 'assets/volume.png';
    } else {
        backgroundMusic.pause();
        musicIconElement.src = 'assets/no-volume.png';
    }
});

update();