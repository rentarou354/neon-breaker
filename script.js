// ZzFX - Zuper Zmall Zound Zynth - Micro Edition
// MIT License - Copyright 2019 Frank Force
const zzfx = (p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0) => {
    let M=Math, R=44100, d=2*M.PI, G=u*=500*d/R/R, C=b*=(1+2*k*M.random()-k)*d/R, g=0, H=0, a=0, n=1, I=0, J=0, f=0, x, h;
    e=R*e+R*r; m*=R; B*=R; r*=R; c*=R; y*=500*d/R**3; A*=d/R; v*=d/R; z*=R; l=R*l|0;
    for(h=e+m+B+r+c|0;a<h;f+=1-q+D*(M.random()-.5),g=a/R,H=g*M.PI*2,x=f*(g<e?g/e:1-(g-e)/m)*(1-g/h)**B*(g<h-r?1:M.max(0,1-(g-h+r)/c)),x=M.sin(C+A*M.cos(H*F)+u*M.cos(H*E)+y*g**2+z*M.sin(g*d/l))*x,a++)J+=(x-J)*t;
    x=new(AudioContext||webkitAudioContext);h=x.createBuffer(1,h,R);h.getChannelData(0).set(new Float32Array(Array(h.length).fill(1).map((_,i)=>M.max(-1,M.min(1,J)))));
    b=x.createBufferSource();b.buffer=h;b.connect(x.destination);b.start();return b
};

// Game Code
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const messageEl = document.getElementById('message');
const subMessageEl = document.getElementById('sub-message');
const livesEl = document.getElementById('lives');
const messageContainer = document.getElementById('message-container');

// --- Asset Loading ---
const assets = {
    paddle: new Image(),
    ball: new Image(),
    brick: new Image(),
    unbreakable: new Image(),
    powerup: new Image()
};
let assetsLoaded = 0;
const assetCount = Object.keys(assets).length;

for (let key in assets) {
    assets[key].src = `assets/${key === 'unbreakable' ? 'brick-unbreakable' : key}.svg`;
    assets[key].onload = () => {
        assetsLoaded++;
        if (assetsLoaded === assetCount) {
            main();
        }
    };
}

// --- Game State & Variables ---
let gameState = 'menu'; // menu, running, levelComplete, gameOver
let score = 0;
let level = 0;
let lives = 3;

const paddleProps = { width: 150, height: 25, speed: 10 };
const ballProps = { radius: 10, speed: 5 };

let paddle;
let balls = [];
let bricks = [];
let particles = [];
let powerups = [];

// --- Levels ---
const levels = [
    // Level 1
    [
        [0,0,1,1,1,1,1,1,0,0],
        [0,1,1,2,1,1,2,1,1,0],
        [1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,0,0],
    ],
    // Level 2
    [
        [2,1,1,1,1,1,1,1,1,2],
        [1,2,1,1,1,1,1,1,2,1],
        [1,1,2,0,0,0,0,2,1,1],
        [1,1,1,2,2,2,2,1,1,1],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,2,2,1,1,0,0],
    ],
    // Level 3
    [
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,2,1,1,1,1,2,0,0],
        [0,2,1,1,0,0,1,1,2,0],
        [2,1,1,0,0,0,0,1,1,2],
        [1,1,0,0,0,0,0,0,1,1],
        [2,1,1,0,0,0,0,1,1,2],
        [0,2,1,1,0,0,1,1,2,0],
        [0,0,2,1,1,1,1,2,0,0],
        [0,0,0,1,1,1,1,0,0,0],
    ]
];

// --- Classes ---
class Paddle {
    constructor() {
        this.width = paddleProps.width;
        this.height = paddleProps.height;
        this.x = (canvas.width - this.width) / 2;
        this.y = canvas.height - this.height - 20;
        this.powerup = null;
        this.powerupTimer = 0;
    }

    draw() {
        ctx.drawImage(assets.paddle, this.x, this.y, this.width, this.height);
    }

    update() {
        if (this.powerup) {
            this.powerupTimer--;
            if (this.powerupTimer <= 0) {
                this.deactivatePowerup();
            }
        }
    }

    move(mouseX) {
        this.x = mouseX - this.width / 2;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }

    activatePowerup(type) {
        this.deactivatePowerup(); // Reset any existing powerup
        this.powerup = type;
        this.powerupTimer = 500; // Powerup duration
        if (type === 'wide') {
            this.width = paddleProps.width * 1.5;
            zzfx(...[,,440,.01,.1,.2,1,1.5,,,,,,,,,.1]); // Powerup activate sfx
        }
    }

    deactivatePowerup() {
        if (this.powerup === 'wide') {
            this.width = paddleProps.width;
        }
        this.powerup = null;
    }
}

class Ball {
    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = ballProps.radius;
    }

    draw() {
        ctx.drawImage(assets.ball, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        // Wall collision
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
            zzfx(...[,,220,.01,.02,.03,1,.1,-9.5,-0.1]); // Wall bounce sfx
        }
        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
            zzfx(...[,,220,.01,.02,.03,1,.1,-9.5,-0.1]); // Wall bounce sfx
        }
    }
}

class Brick {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 75;
        this.height = 30;
        this.type = type; // 1 for normal, 2 for unbreakable
        this.visible = true;
    }

    draw() {
        if (this.visible) {
            const img = this.type === 1 ? assets.brick : assets.unbreakable;
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = color;
        this.life = 100;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 100;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 50;
        this.type = type;
        this.speedY = 2;
    }

    update() {
        this.y += this.speedY;
    }

    draw() {
        ctx.drawImage(assets.powerup, this.x, this.y, this.width, this.height);
    }
}

// --- Game Functions ---
function buildLevel() {
    bricks = [];
    const levelLayout = levels[level];
    if (!levelLayout) return; // Safety check for end of game

    const brickWidth = 75; // Slightly reduce size for padding
    const brickHeight = 30;
    const padding = 5;
    const offsetTop = 60;

    const numColumns = levelLayout[0].length;
    const gridWidth = numColumns * (brickWidth + padding) - padding;
    const offsetLeft = (canvas.width - gridWidth) / 2;

    for (let r = 0; r < levelLayout.length; r++) {
        for (let c = 0; c < levelLayout[r].length; c++) {
            if (levelLayout[r][c] > 0) {
                let brickX = c * (brickWidth + padding) + offsetLeft;
                let brickY = r * (brickHeight + padding) + offsetTop;
                // Adjust brick properties to match new size
                const newBrick = new Brick(brickX, brickY, levelLayout[r][c]);
                newBrick.width = brickWidth;
                bricks.push(newBrick);
            }
        }
    }
}

function createParticles(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, '#FF00FF'));
    }
}

function resetBallAndPaddle() {
    paddle = new Paddle();
    balls = [new Ball(canvas.width / 2, paddle.y - ballProps.radius, ballProps.speed * (Math.random() > 0.5 ? 1 : -1), -ballProps.speed)];
}

function update() {
    if (gameState !== 'running') return;

    paddle.update();
    
    balls.forEach((ball, index) => {
        ball.update();

        // Ball falls off screen
        if (ball.y + ball.radius > canvas.height) {
            balls.splice(index, 1);
        }
    });

    if (balls.length === 0) {
        lives--;
        zzfx(...[,,99,,.1,.3,4,1.8,,,,,,,,,.1,,.6,.1]); // Lose life sfx
        if (lives <= 0) {
            gameState = 'gameOver';
            showMessage('Game Over', 'Click to Restart');
        } else {
            resetBallAndPaddle();
        }
    }

    particles.forEach((p, index) => {
        p.update();
        if (p.life <= 0) particles.splice(index, 1);
    });

    powerups.forEach((p, index) => {
        p.update();
        if (p.y > canvas.height) powerups.splice(index, 1);
    });

    handleCollisions();

    // Check for level complete
    const breakableBricks = bricks.filter(b => b.type === 1 && b.visible).length;
    if (breakableBricks === 0) {
        gameState = 'levelComplete';
        zzfx(...[1.01,,523,.2,.3,.6,1,.3,1,,,,,9,50,.2,,.2,.01]); // Level complete sfx
        level++;
        if (level >= levels.length) {
            showMessage('You Win!', 'Click to Play Again');
            level = 0; // Reset for next game
        } else {
            showMessage(`Level ${level + 1}`, 'Click to Start');
        }
    }
}

function handleCollisions() {
    balls.forEach(ball => {
        // Paddle collision
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width && ball.y + ball.radius > paddle.y && ball.y < paddle.y + paddle.height) {
            let collidePoint = ball.x - (paddle.x + paddle.width / 2);
            collidePoint = collidePoint / (paddle.width / 2);
            let angle = collidePoint * (Math.PI / 3);
            ball.dx = ballProps.speed * Math.sin(angle);
            ball.dy = -ballProps.speed * Math.cos(angle);
            zzfx(...[,,330,.01,.02,.03,1,.1,-9.5,-0.1]); // Paddle bounce sfx
        }

        // Brick collision
        bricks.forEach(brick => {
            if (brick.visible) {
                // AABB collision check
                if (ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + brick.width &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + brick.height) {

                    // Collision occurred, now determine direction
                    const prevBallX = ball.x - ball.dx;
                    const prevBallY = ball.y - ball.dy;

                    // Check if previous position was outside horizontally
                    if (prevBallX + ball.radius <= brick.x || prevBallX - ball.radius >= brick.x + brick.width) {
                        ball.dx = -ball.dx;
                    } else { // Must have been outside vertically
                        ball.dy = -ball.dy;
                    }

                    if (brick.type === 1) {
                        brick.visible = false;
                        score += 10;
                        createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2);
                        zzfx(...[1.2,,880,.01,.03,.04,2,.5,-1.2,,,,,,,,.1]); // Brick break sfx

                        // Powerup drop chance
                        if (Math.random() < 0.2) { // 20% chance
                            const powerupType = Math.random() < 0.5 ? 'wide' : 'multi';
                            powerups.push(new PowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2, powerupType));
                        }
                    } else {
                        zzfx(...[,,110,.01,.02,.03,1,.1,-9.5,-0.1]); // Unbreakable bounce sfx
                    }
                }
            }
        });
    });

    // Powerup collision
    powerups.forEach((p, index) => {
        if (p.x > paddle.x && p.x < paddle.x + paddle.width && p.y + p.height > paddle.y && p.y < paddle.y + paddle.height) {
            if (p.type === 'wide') {
                paddle.activatePowerup('wide');
            } else if (p.type === 'multi') {
                balls.push(new Ball(paddle.x + paddle.width / 2, paddle.y - ballProps.radius, -ballProps.speed, -ballProps.speed));
                balls.push(new Ball(paddle.x + paddle.width / 2, paddle.y - ballProps.radius, ballProps.speed, -ballProps.speed));
                zzfx(...[,,550,.01,.1,.2,1,1.5,,,,,,,,,.1]); // Multi-ball sfx
            }
            powerups.splice(index, 1);
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a subtle grid background
    ctx.strokeStyle = '#222';
    for (let i = 0; i < canvas.width; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
    for (let i = 0; i < canvas.height; i += 20) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

    // Only draw game objects if they exist
    if (paddle) {
        paddle.draw();
    }
    balls.forEach(ball => ball.draw());
    bricks.forEach(brick => brick.draw());
    particles.forEach(p => p.draw());
    powerups.forEach(p => p.draw());

    updateUI();
}

function updateUI() {
    scoreEl.textContent = score;
    levelEl.textContent = level + 1;
    livesEl.textContent = lives;
}

function showMessage(primary, secondary) {
    messageEl.textContent = primary;
    subMessageEl.textContent = secondary;
    messageContainer.style.display = 'block';
}

function hideMessage() {
    messageContainer.style.display = 'none';
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    score = 0;
    lives = 3;
    level = 0;
    gameState = 'levelComplete'; // Will immediately trigger level 1 setup
    showMessage(`Level ${level + 1}`, 'Click to Start');
}

// --- Event Listeners ---
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    paddle.move(e.clientX - rect.left);
});

canvas.addEventListener('click', () => {
    if (gameState === 'menu' || gameState === 'levelComplete') {
        gameState = 'running';
        hideMessage();
        resetBallAndPaddle();
        buildLevel();
    } else if (gameState === 'gameOver') {
        startGame();
    }
});

// --- Main Function ---
function main() {
    showMessage('Neon Breaker', 'Click to Play');
    gameLoop();
}
