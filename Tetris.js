// Constants
const ROWS = 20;
const COLS = 10;
const MAP = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const ELEMENTS = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => document.createElement("div")));
const PATTERNS = [
    [[1, 1, 1], [0, 0, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1], [1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 1, 1, 1]],
    [[1, 1, 1], [1, 0, 0]]
];

// Tetris shapes' class
class Shape {
    constructor() {
        this.pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
        this.row = 0;
        this.col = Math.floor(COLS / 2 - this.pattern[0].length / 2);
    }

    canDraw() {
        for (let i = 0; i < this.pattern.length; ++i) {
            for (let j = 0; j < this.pattern[i].length; ++j) {
                if (this.pattern[i][j] && (this.row + i < 0 || this.row + i >= ROWS || this.col + j < 0 || this.col + j >= COLS || MAP[this.row + i][this.col + j])) {
                    return false;
                }
            }
        }
        return true;
    }

    draw() {
        if (!this.canDraw()) {
            gameOver();
            return;
        }

        for (let i = 0; i < this.pattern.length; ++i) {
            for (let j = 0; j < this.pattern[i].length; ++j) {
                if (this.pattern[i][j]) {
                    ELEMENTS[this.row + i][this.col + j].className = "full";
                }
            }
        }
    }

    clear() {
        for (let i = 0; i < this.pattern.length; ++i) {
            for (let j = 0; j < this.pattern[i].length; ++j) {
                if (this.pattern[i][j] && this.row + i >= 0 && this.row + i < ROWS && this.col + j >= 0 && this.col + j < COLS) {
                    ELEMENTS[this.row + i][this.col + j].className = "empty";
                }
            }
        }
    }

    fall() {
        this.clear();
        this.row++;
        if (!this.canDraw()) {
            this.row--;
            this.draw();
            return false;
        }
        this.draw();
        return true;
    }


    rotate() {
        const rotated = this.pattern[0].map((_, idx) => this.pattern.map(row => row[idx]).reverse());
        this.clear();
        const prevPattern = this.pattern;
        this.pattern = rotated;
        if (!this.canDraw()) {
            this.pattern = prevPattern;
        }
        this.draw();
    }

    move(delta) {
        this.clear();
        this.col += delta;
        if (!this.canDraw()) {
            this.col -= delta;
        }
        this.draw();
    }

    saveToMap() {
        for (let i = 0; i < this.pattern.length; ++i) {
            for (let j = 0; j < this.pattern[i].length; ++j) {
                if (this.pattern[i][j] && this.row + i >= 0 && this.row + i < ROWS && this.col + j >= 0 && this.col + j < COLS) {
                    MAP[this.row + i][this.col + j] = 1;
                }
            }
        }
    }
}


// ... (rest of the code - game logic, initialization, event handlers)

// ... (rest of the code - game logic, initialization, event handlers)
// The rest of the code (gameLoop, gameOver, showNextShape, deleteCompleteLines, getTopRowId, event handlers, and window.onload) remains largely the same, with minor adjustments to accommodate the changes in the Shape class.  Ensure you use `let` and `const` for variable declarations and handle potential out-of-bounds array accesses after rotations and movements. Be mindful to use  `this.pattern[i].length` in inner loops now, as rotated shapes may have different inner array lengths.// HTML elements
var playground, startButton, resetButton, scoreDisplay, gameOverOverlay, nextShapeDisplay;
// Objects and variables
var fallingShape;
var nextShape;
var gameIsRunning = false;
var level = 1;
var score = 0;

function addScore(lines) {
    switch(lines) {
        case 1:
            score += 40 * level;
            break;
        case 2:
            score += 100 * level;
            break;
        case 3:
            score += 300 * level;
            break;
        case 4:
            score += 1200 * level;
            break;
        default:
            break;
    }
    document.getElementById("score").innerHTML = "" + score;
}

function gameLoop() {
    if(!gameIsRunning) return;
    if(!fallingShape.fall()) {
        fallingShape.saveToMap();
        deleteCompleteLines(fallingShape.row, fallingShape.pattern.length);
        delete fallingShape;
        fallingShape = nextShape;
        fallingShape.draw();
        nextShape = new Shape();
        showNextShape();
    }
    if(gameIsRunning) setTimeout(gameLoop, 1000 / level);
}

function gameOver() {
    gameIsRunning = false;
    gameOverOverlay.classList.toggle("invisible");
}

function showNextShape() {
    nextShapeDisplay.innerHTML = "";
    nextShapeDisplay.style.height = nextShape.pattern.length * 30 + "px";
    nextShapeDisplay.style.width = nextShape.pattern[0].length * 30 + "px";
    for(var i = 0 ; i < nextShape.pattern.length ; ++i) {
        for(var j = 0 ; j < nextShape.pattern[0].length ; ++j) {
            nextShapeDisplay.innerHTML += nextShape.pattern[i][j] > 0 ? "<div class='block bg-dark'></div>" : "<div class='block'></div>";
        }
    }
}


// Handle key events
window.onkeydown = (e) => {
    if (!gameIsRunning) return;
    switch (e.key) {
        case "ArrowUp":
            fallingShape.rotate();
            break;
        case "ArrowLeft":
            fallingShape.move(-1); // Move left
            break;
        case "ArrowRight":
            fallingShape.move(1); // Move right
            break;
        case "ArrowDown":
            fallingShape.fall();
            break;
        default:
            break;
    }
};

window.onload = () => {
    playground = document.getElementById("playground");
    startButton = document.getElementById("start-btn");
    resetButton = document.getElementById("reset-btn");
    scoreDisplay = document.getElementById("score");
    gameOverOverlay = document.getElementById("game-over-message");
    nextShapeDisplay = document.getElementById("next-shape");
    //Touch event listeners for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    playground.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    playground.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;

        const deltaX = touchEndX - touchStartX;

        if (Math.abs(deltaX) > 30) { // Adjust threshold as needed
            if (deltaX > 0) {
                fallingShape.move(1); // Swipe right
            } else {
                fallingShape.move(-1); // Swipe left
            }
        } else {
            fallingShape.rotate();// Tap to rotate
        }
    });


    startButton.addEventListener("click", (e) => {
        // Create objects
        fallingShape = new Shape();
        nextShape = new Shape();
        showNextShape();
        // Startign the game
        gameIsRunning = true;
        fallingShape.draw();
        setTimeout(gameLoop, 1000 / level);
        // Change buttons
        startButton.classList.toggle("invisible");
        resetButton.classList.toggle("invisible");
    });

    resetButton.addEventListener("click", (e) => {
        // Set default values
        if(gameIsRunning) {
            gameIsRunning = false;
        }
        else {
            gameOverOverlay.classList.toggle("invisible");
        }
        level = 1;
        score = 0;
        scoreDisplay.innerHTML = "0";
        for(var row = 0 ; row < ROWS ; ++row) {
            for(var col = 0 ; col < COLS ; ++col) {
                MAP[row][col] = 0;
                ELEMENTS[row][col].className = "empty";
            }
        }
        nextShapeDisplay.innerHTML = "";
        // Delete objects
        delete fallingShape;
        delete nextShape;
        // Change buttons
        startButton.classList.toggle("invisible");
        resetButton.classList.toggle("invisible");
    });

    // Create the playground
    for(var row = 0 ; row < ROWS ; ++row){
        for(var col = 0 ; col < COLS ; ++col){
            ELEMENTS[row][col].className = "empty";
            playground.appendChild(ELEMENTS[row][col]);
        }
    }
}