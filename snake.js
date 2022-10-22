import { createApp } from 'https://unpkg.com/petite-vue?module';

const cellsToCheckForNewTail = [
    { deltaX: 0, deltaY: -1 },
    { deltaX: 0, deltaY: 1 },
    { deltaX: -1, deltaY: 0 },
    { deltaX: 1, deltaY: 0 },
];

const newHeadDeltas = {
    '-x': {deltaX: -1, deltaY: 0},
    '+x': {deltaX: 1, deltaY: 0},
    '-y': {deltaX: 0, deltaY: -1},
    '+y': {deltaX: 0, deltaY: 1},
};

function Snake(props) {
    return {
        config: {
            boardWidth: 80,
            boardHeight: 50,
            initFps: 4,
            keys: {
                up: 38,
                down: 40,
                left: 37,
                right: 39,
            }
        },
        fps: 4,
        level: 1,
        puntuation: 0,
        eattenApples: 0,
        board: [],
        snake: {
            body: [],
            moveDir: '-x',
        },
        gameover: false,
        startNewGame() {
            this.gameover = false;
            this.puntuation = 0;
            this.level = 1;
            this.eattenApples = 0;
            this.initBoard();
            this.initSnake();
            this.createNewApple();
            this.bindKeyboardEvents();
            this.initGameLoop();
        },
        initBoard() {
            this.board = [];
            for (let y = 0; y < this.config.boardHeight; y++) {
                this.board.push(Array(this.config.boardWidth).fill('empty'));
            }
        },
        initSnake() {
            const headCoords = {
                x: 40,
                y: 25,
            }
            const length = 4;
            this.snake.body = [];
            this.snake.moveDir = '-x';
            for (let x = headCoords.x; x < headCoords.x + length; x++) {
                const newBodySegmentCoords = {x, y: headCoords.y};
                this.snake.body.push(newBodySegmentCoords);
                this.paintCell(newBodySegmentCoords, 'snake');
            }
        },
        bindKeyboardEvents() {
            if (!this.keydownEventListener) {
                this.keydownEventListener = window.addEventListener('keydown', this.keydown);
            }
        },
        keydown(event) {
            const newMoveDir =
                (event.keyCode === this.config.keys.down || event.keyCode === this.config.keys.right? '+': '-') +
                (event.keyCode === this.config.keys.down || event.keyCode === this.config.keys.up? 'y': 'x');
            const newHeadCoords = this.transformCoords(this.snake.body[0], newHeadDeltas[newMoveDir]);    
            if (!this.checkCell(newHeadCoords, 'snake')) {
                this.snake.moveDir = newMoveDir;
            }
        },
        createNewApple() {
            let newAppleCoords;
            do {
                newAppleCoords = {
                    x: this.getRandomIntInclusive(0, this.config.boardWidth - 1),
                    y: this.getRandomIntInclusive(0, this.config.boardHeight - 1),
                };
            } while (!this.newAppleIsValid(newAppleCoords));
            this.paintCell(newAppleCoords, 'apple');
        },
        newAppleIsValid(newAppleCoords) {
            // Avoid an apple on the same row or col of the snake head or matching snake body
            return !(
                newAppleCoords.x === this.snake.body[0].x
                || newAppleCoords.y === this.snake.body[0].y
                || this.checkCell(newAppleCoords, 'apple')
            );
        },
        getRandomIntInclusive(min, max) {
            const intMin = Math.ceil(min);
            const intMax = Math.floor(max);
            return Math.floor(Math.random() * (intMax - intMin + 1) + intMin); // The maximum is inclusive and the minimum is inclusive
        },
        initGameLoop() {
            this.fps = this.config.initFps;
            this.gameLoopId = setTimeout(this.gameLoop, 1000/this.fps);
        },
        updatePuntuation() {
            this.puntuation += this.level * 10;
            if (this.eattenApples > this.level * 2) {
                this.level++;
                this.fps *= 1.2;
            }
        },
        moveSnake() {
            const newHeadCoords = this.transformCoords(this.snake.body[0], newHeadDeltas[this.snake.moveDir]);
            if (this.checkCell(newHeadCoords, 'snake')) {
                this.endGame();
                return;

            }
            if (this.checkCell(newHeadCoords, 'apple')) {
                this.eattenApples++;
                this.updatePuntuation();
                this.createNewApple();
            } else {
                this.removeTail();
            }
            this.snake.body.unshift(newHeadCoords);
            this.paintCell(newHeadCoords, 'snake');
        },
        endGame() {
            clearTimeout(this.gameLoopId);
            window.removeEventListener('keydown', this.keydown);
            this.gameover = true;
        },
        removeTail() {
            this.paintCell(
                this.snake.body.pop(),
                'empty'
            );
        },
        transformCoords(coords, delta) {
            let newX = coords.x + delta.deltaX;
            if (newX === -1) {
                newX = this.config.boardWidth - 1;
            }
            if (newX === this.config.boardWidth) {
                newX = 0;
            }

            let newY = coords.y + delta.deltaY;
            if (newY === -1) {
                newY = this.config.boardHeight - 1;
            }
            if (newY === this.config.boardHeight) {
                newY = 0;
            }

            return {
                x: newX,
                y: newY,
            };
        },
        paintCell(coords, paint) {
            this.board[coords.y][coords.x] = paint;
        },
        checkCell(coords, paint) {
            return this.board[coords.y][coords.x] === paint;
        },
        gameLoop() {
            this.moveSnake();
            setTimeout(this.gameLoop, 1000/this.fps);
        }
    };
}

createApp(Snake()).mount();