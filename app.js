class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.gameWon = false;
        this.gameOver = false;
        this.isMoving = false;
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.isMoving = false;
        
        this.createGridCells();
        this.addRandomTile();
        this.addRandomTile();
        
        this.updateDisplay();
        this.hideGameMessage();
        
        // Mettre à jour les scores affichés
        this.updateScores();
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
                    const value = this.grid[i][j];
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    
                    // Positionnement responsive en pourcentages
                    const top = (i * (100 / this.size));
                    const left = (j * (100 / this.size));
                    
                    tile.style.top = `${top}%`;
                    tile.style.left = `${left}%`;
                    tile.style.width = `calc(${100 / this.size}% - 10px)`;
                    tile.style.height = `calc(${100 / this.size}% - 10px)`;
                    
                    tileContainer.appendChild(tile);
                    
                    // Animation d'apparition
                    setTimeout(() => {
                        tile.classList.add('tile-new');
                    }, 10);
                }
            }
        }

        this.updateScores();
    }

    updateScores() {
        const scoreElement = document.getElementById('score');
        const bestScoreElement = document.getElementById('best-score');
        
        scoreElement.textContent = this.score;
        bestScoreElement.textContent = this.bestScore;
        
        // Animation du score
        scoreElement.classList.add('score-update');
        setTimeout(() => {
            scoreElement.classList.remove('score-update');
        }, 400);
    }

    async move(direction) {
        if (this.gameOver || this.gameWon || this.isMoving) return false;

        this.isMoving = true;
        let moved = false;
        
        // Sauvegarder l'état avant le mouvement pour l'animation
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
            // Ajouter une nouvelle tuile après un court délai
            setTimeout(() => {
                this.addRandomTile();
                this.updateDisplay();
                
                if (this.checkWin()) {
                    this.gameWon = true;
                    setTimeout(() => {
                        this.showGameMessage('Vous avez gagné !', 'win');
                    }, 300);
                } else if (this.isGameOver()) {
                    this.gameOver = true;
                    setTimeout(() => {
                        this.showGameMessage('Game Over !', 'lose');
                    }, 300);
                }

                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                    localStorage.setItem('bestScore', this.bestScore);
                    this.updateScores();
                }
                
                this.isMoving = false;
            }, 150);
        } else {
            this.isMoving = false;
        }

        return moved;
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
                    j++;
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
                    j--;
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
                    i++;
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
                    i--;
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
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                const direction = e.key.replace('Arrow', '').toLowerCase();
                this.move(direction);
            }
        });

        // Boutons nouvelle partie et rejouer
        document.getElementById('new-game').addEventListener('click', () => {
            this.init();
        });

        document.getElementById('retry-button').addEventListener('click', () => {
            this.init();
        });

        // Support tactile amélioré pour mobile
        this.setupTouchControls();
        
        // Support des boutons virtuels pour mobile
        this.setupVirtualButtons();
    }

    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const minSwipeDistance = 30;

        const gameContainer = document.querySelector('.game-container');

        gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });

        gameContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        gameContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY, minSwipeDistance);
            e.preventDefault();
        }, { passive: false });
    }

    handleSwipe(startX, startY, endX, endY, minDistance) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Ignorer les petits mouvements
        if (absDeltaX < minDistance && absDeltaY < minDistance) {
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
    }

    setupVirtualButtons() {
        // Créer des boutons virtuels pour mobile si nécessaire
        if ('ontouchstart' in window || navigator.maxTouchPoints) {
            this.createVirtualControls();
        }
    }

    createVirtualControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'virtual-controls';
        controlsContainer.innerHTML = `
            <div class="control-row">
                <button class="control-btn" data-direction="up">↑</button>
            </div>
            <div class="control-row">
                <button class="control-btn" data-direction="left">←</button>
                <button class="control-btn" data-direction="down">↓</button>
                <button class="control-btn" data-direction="right">→</button>
            </div>
        `;

        // Ajouter le style pour les contrôles virtuels
        const style = document.createElement('style');
        style.textContent = `
            .virtual-controls {
                display: none;
                margin-top: 20px;
                text-align: center;
            }
            .control-row {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            .control-btn {
                width: 60px;
                height: 60px;
                font-size: 24px;
                background: #8f7a66;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                touch-action: manipulation;
                user-select: none;
                -webkit-user-select: none;
            }
            .control-btn:active {
                background: #7f6a56;
                transform: scale(0.95);
            }
            @media (max-width: 768px) and (orientation: portrait) {
                .virtual-controls {
                    display: block;
                }
            }
        `;
        document.head.appendChild(style);

        // Ajouter les écouteurs d'événements
        controlsContainer.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.getAttribute('data-direction');
                this.move(direction);
            });
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const direction = btn.getAttribute('data-direction');
                this.move(direction);
            });
        });

        document.querySelector('.container').appendChild(controlsContainer);
    }

    // Méthode pour redimensionner en cas de changement d'orientation
    handleResize() {
        this.updateDisplay();
    }
}

// Initialiser le jeu au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game2048();
    
    // Gérer le redimensionnement et changement d'orientation
    window.addEventListener('resize', () => {
        game.handleResize();
    });
    
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            game.handleResize();
        }, 100);
    });
});

// Empêcher le zoom sur double-tap pour mobile
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Empêcher le menu contextuel sur mobile
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});
