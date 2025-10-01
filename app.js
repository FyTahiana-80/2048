class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.gameWon = false;
        this.gameOver = false;
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        // Initialiser la grille vide
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        
        // Créer les cellules de la grille
        this.createGridCells();
        
        // Ajouter deux tuiles au départ
        this.addRandomTile();
        this.addRandomTile();
        
        // Mettre à jour l'affichage
        this.updateDisplay();
        this.hideGameMessage();
    }

    createGridCells() {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';
        
        for (let i = 0; i < this.size; i++) {
            const row = document.createElement('div');
            row.className = 'grid-row';
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                row.appendChild(cell);
            }
            gridContainer.appendChild(row);
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
            return true;
        }
        return false;
    }

    updateDisplay() {
        const tileContainer = document.getElementById('tile-container');
        tileContainer.innerHTML = '';

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]} tile-new`;
                    tile.textContent = this.grid[i][j];
                    tile.style.top = `${i * 121.25}px`;
                    tile.style.left = `${j * 121.25}px`;
                    tileContainer.appendChild(tile);
                }
            }
        }

        document.getElementById('score').textContent = this.score;
        document.getElementById('best-score').textContent = this.bestScore;
    }

    move(direction) {
        if (this.gameOver || this.gameWon) return;

        let moved = false;
        const oldGrid = this.grid.map(row => [...row]);

        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }

        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
            
            if (this.checkWin()) {
                this.gameWon = true;
                this.showGameMessage('Vous avez gagné !', 'win');
            } else if (this.isGameOver()) {
                this.gameOver = true;
                this.showGameMessage('Game Over !', 'lose');
            }

            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('bestScore', this.bestScore);
            }
            
            // Animation du score
            const scoreElement = document.getElementById('score');
            scoreElement.classList.add('score-update');
            setTimeout(() => {
                scoreElement.classList.remove('score-update');
            }, 400);
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(cell => cell !== 0);
            const newRow = [];
            
            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    newRow.push(row[j] * 2);
                    this.score += row[j] * 2;
                    j++; // Sauter la prochaine tuile car elle a été fusionnée
                } else {
                    newRow.push(row[j]);
                }
            }
            
            while (newRow.length < this.size) {
                newRow.push(0);
            }
            
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(cell => cell !== 0);
            const newRow = [];
            
            for (let j = row.length - 1; j >= 0; j--) {
                if (j > 0 && row[j] === row[j - 1]) {
                    newRow.unshift(row[j] * 2);
                    this.score += row[j] * 2;
                    j--; // Sauter la prochaine tuile car elle a été fusionnée
                } else {
                    newRow.unshift(row[j]);
                }
            }
            
            while (newRow.length < this.size) {
                newRow.unshift(0);
            }
            
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const col = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    col.push(this.grid[i][j]);
                }
            }
            
            const newCol = [];
            for (let i = 0; i < col.length; i++) {
                if (i < col.length - 1 && col[i] === col[i + 1]) {
                    newCol.push(col[i] * 2);
                    this.score += col[i] * 2;
                    i++; // Sauter la prochaine tuile car elle a été fusionnée
                } else {
                    newCol.push(col[i]);
                }
            }
            
            while (newCol.length < this.size) {
                newCol.push(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newCol[i]) {
                    moved = true;
                }
                this.grid[i][j] = newCol[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const col = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    col.push(this.grid[i][j]);
                }
            }
            
            const newCol = [];
            for (let i = col.length - 1; i >= 0; i--) {
                if (i > 0 && col[i] === col[i - 1]) {
                    newCol.unshift(col[i] * 2);
                    this.score += col[i] * 2;
                    i--; // Sauter la prochaine tuile car elle a été fusionnée
                } else {
                    newCol.unshift(col[i]);
                }
            }
            
            while (newCol.length < this.size) {
                newCol.unshift(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newCol[i]) {
                    moved = true;
                }
                this.grid[i][j] = newCol[i];
            }
        }
        return moved;
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    isGameOver() {
        // Vérifier s'il reste des cellules vides
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }

        // Vérifier s'il reste des mouvements possibles (fusions horizontales)
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size - 1; j++) {
                if (this.grid[i][j] === this.grid[i][j + 1]) {
                    return false;
                }
            }
        }

        // Vérifier s'il reste des mouvements possibles (fusions verticales)
        for (let i = 0; i < this.size - 1; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === this.grid[i + 1][j]) {
                    return false;
                }
            }
        }

        return true;
    }

    showGameMessage(message, type) {
        const gameMessage = document.getElementById('game-message');
        const messageText = document.getElementById('message-text');
        messageText.textContent = message;
        gameMessage.classList.add('show');
    }

    hideGameMessage() {
        const gameMessage = document.getElementById('game-message');
        gameMessage.classList.remove('show');
    }

    setupEventListeners() {
        // Événements clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.move('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.move('down');
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.move('left');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.move('right');
            }
        });

        // Boutons nouvelle partie et rejouer
        document.getElementById('new-game').addEventListener('click', () => {
            this.init();
        });

        document.getElementById('retry-button').addEventListener('click', () => {
            this.init();
        });

        // Support tactile pour mobile
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const minSwipeDistance = 30;

        const gameContainer = document.querySelector('.game-container');

        gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            e.preventDefault();
        }, { passive: false });

        gameContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        gameContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
            e.preventDefault();
        }, { passive: false });

        this.handleSwipe = () => {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);

            // Ignorer les petits mouvements
            if (absDeltaX < minSwipeDistance && absDeltaY < minSwipeDistance) {
                return;
            }

            if (absDeltaX > absDeltaY) {
                // Mouvement horizontal
                if (deltaX > 0) {
                    this.move('right');
                } else {
                    this.move('left');
                }
            } else {
                // Mouvement vertical
                if (deltaY > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }
        };
    }
}

// Initialiser le jeu au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});