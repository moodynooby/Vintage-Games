// Get the game container and grid elements
const gameContainer = document.querySelector('.game-container');
const grid = document.querySelector('.grid');
const scoreElement = document.querySelector('#score');
const highScoreElement = document.querySelector('#high-score');
const newGameButton = document.querySelector('#new-game-btn');

// Initialize the game state
let board = Array(4).fill().map(() => Array(4).fill(0));
let score = 0;
let highScore = parseInt(getCookie('highScore')) || 0;
let gameHistory = JSON.parse(getCookie('gameHistory')) || [];

// Touch handling variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Function to set a cookie
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

// Function to get a cookie value
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
        if (cookieName === name) return decodeURIComponent(cookieValue);
    }
    return null;
}

// Function to generate a new tile
function generateTile() {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({x: j, y: i});
            }
        }
    }
    if (emptyCells.length > 0) {
        const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[y][x] = Math.random() < 0.9 ? 2 : 4;
        renderBoard();
    }
}

// Function to render the board
function renderBoard() {
    grid.innerHTML = '';
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            const value = board[y][x];
            if (value !== 0) {
                const tileElement = document.createElement('div');
                tileElement.classList.add('tile', `tile-${value}`);
                tileElement.textContent = value;
                tileElement.style.gridColumn = x + 1;
                tileElement.style.gridRow = y + 1;
                grid.appendChild(tileElement);
            }
        }
    }
    updateScore();
}

// Function to update score and high score
function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
    if (score > highScore) {
        highScore = score;
        setCookie('highScore', highScore, 365);
    }
    highScoreElement.textContent = `High Score: ${highScore}`;
}

// Function to handle user input (arrow keys and swipes)
function handleInput(direction) {
    let moved = false;
    const newBoard = JSON.parse(JSON.stringify(board));

    function slide(row) {
        const filtered = row.filter(cell => cell !== 0);
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1]) {
                filtered[i] *= 2;
                score += filtered[i];
                filtered[i + 1] = 0;
                moved = true;
            }
        }
        const newRow = filtered.filter(cell => cell !== 0);
        while (newRow.length < 4) {
            newRow.push(0);
        }
        return newRow;
    }

    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < 4; i++) {
            const row = newBoard[i];
            const newRow = direction === 'left' ? slide(row) : slide(row.reverse()).reverse();
            if (JSON.stringify(row) !== JSON.stringify(newRow)) {
                moved = true;
            }
            newBoard[i] = newRow;
        }
    } else {
        for (let i = 0; i < 4; i++) {
            const column = [newBoard[0][i], newBoard[1][i], newBoard[2][i], newBoard[3][i]];
            const newColumn = direction === 'up' ? slide(column) : slide(column.reverse()).reverse();
            if (JSON.stringify(column) !== JSON.stringify(newColumn)) {
                moved = true;
            }
            for (let j = 0; j < 4; j++) {
                newBoard[j][i] = newColumn[j];
            }
        }
    }

    if (moved) {
        board = newBoard;
        generateTile();
        renderBoard();
        if (isGameOver()) {
            updateGameHistory();
        }
    }
}

// Function to check if the game is over
function isGameOver() {
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (board[y][x] === 0) return false;
            if (y < 3 && board[y][x] === board[y + 1][x]) return false;
            if (x < 3 && board[y][x] === board[y][x + 1]) return false;
        }
    }
    return true;
}

// Function to handle touch events
function handleTouch(e) {
    if (!e.target.closest('.grid')) return;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30; // Minimum distance for a swipe

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                handleInput('right');
            } else {
                handleInput('left');
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                handleInput('down');
            } else {
                handleInput('up');
            }
        }
    }

    // Prevent scrolling when swiping
    e.preventDefault();
}

// Touch event listeners
grid.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: false });

grid.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling while touching the game
}, { passive: false });

grid.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    handleTouch(e);
}, { passive: false });

// Keyboard event listeners
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') handleInput('up');
    if (event.key === 'ArrowDown') handleInput('down');
    if (event.key === 'ArrowLeft') handleInput('left');
    if (event.key === 'ArrowRight') handleInput('right');
});

// New Game button functionality
newGameButton.addEventListener('click', () => {
    if (score > 0) {
        updateGameHistory();
    }
    board = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    generateTile();
    generateTile();
    renderBoard();
});

// Initialize the game
generateTile();
generateTile();
renderBoard();

// Add viewport meta tag for proper mobile scaling
if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewport);
}