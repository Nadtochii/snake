//Constants
var ROWS=20, COLS=20;
//IDs
var EMPTY=0, SNAKE=1, FRUIT=2, GAME_OVER=-1;
//Directions
var LEFT=0, RIGHT=1, UP=2, DOWN=3;
//Key Codes
var KEY_LEFT=37, KEY_RIGHT=39, KEY_UP=38, KEY_DOWN=40;

var grid = {

    width: null,
    height: null,
    _grid:null,

    init: function(value, width, height) {
        this.height = height;
        this.width = width;

        this._grid = [];

        for (var i=0; i<width; i++) {
            this._grid.push([]);
            for (var j=0; j<height; j++) {
                this._grid[i].push(value);
            }
        }
    },

    set: function(value, x, y) {
        this._grid[x][y] = value;
    },

    get: function(x, y) {
        return this._grid[x][y];
    }
}

var snake = {

    direction: null,
    last: null,
    _queue: null,

    init: function(dir, x, y) {
        this.direction = dir;

        this._queue = [];
        this.insert(x, y);
    },

    insert: function(x, y) {
        this._queue.unshift({x:x, y:y});
        this.last = this._queue[0];
    },

    remove: function() {
        return this._queue.pop();
    }   
}

function setFood() {
    var empty = [];

    for (var i=0; i<grid.width; i++) {
        for (var j=0; j<grid.height; j++) {
            if (grid.get(i, j) === EMPTY) {
                empty.push({x:i, y:j});
            }
        }
    }

    var pos = empty[Math.floor(Math.random()*empty.length)];
    grid.set(FRUIT, pos.x, pos.y);
}

//Game objects
var canvas, cntx, keypress, frames, score;

function main() {
    document.getElementById("game_over").style.display = "none";

    canvas = document.createElement("canvas");
    canvas.width = COLS*20;
    canvas.height = ROWS*20;
    cntx = canvas.getContext("2d");

    var container = document.getElementById("container");

    container.appendChild(canvas);

    game = false;
    frames = 0;
    keystate = {};

    document.addEventListener("keydown", function(event) {
        keystate[event.keyCode] = true;
    });
    document.addEventListener("keyup", function(event) {
        delete keystate[event.keyCode];
    });

    init();
    loop();
}

function init() {
    grid.init(EMPTY, COLS, ROWS);
    score = 0;
    setScore(score);

    var sp = {x:Math.floor(COLS/2), y:ROWS-1};
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);

    setFood();
}

function loop() {
    if (game) {
        update();
    }

    draw();

    window.requestAnimationFrame(loop, canvas);
}

function update() {
    frames++;

    if (keystate[KEY_LEFT] && snake.direction !== RIGHT)
        snake.direction = LEFT;
    if (keystate[KEY_RIGHT] && snake.direction !== LEFT)
        snake.direction = RIGHT;
    if (keystate[KEY_UP] && snake.direction !== DOWN)
        snake.direction = UP;
    if (keystate[KEY_DOWN] && snake.direction !== UP)
        snake.direction = DOWN;

    if (frames%10 === 0) {
        var nx = snake.last.x;
        var ny = snake.last.y;

        switch (snake.direction) {
            case LEFT:
                nx--;
                break;
            case RIGHT:
                nx++;
                break;
            case UP:
                ny--;
                break;
            case DOWN:
                ny++;
                break;
        }

        if ( 0>nx || nx>grid.width-1 || 0>ny || ny>grid.height-1 || grid.get(nx, ny) === SNAKE ) {
            document.getElementById("game_over").style.display = "block";

            var tw = canvas.width/grid.width;
            var th = canvas.height/grid.height;
            for (var i=0; i<grid.width; i++) {
                for (var j=0; j<grid.height; j++) {
                    grid.set(GAME_OVER, i, j);
                }
            }
            return;
        }

        if (grid.get(nx, ny) === FRUIT) {
            score++;
            setScore(score);
            var tail = {x:nx, y:ny};
            setFood();
        } else {
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
            tail.x = nx;
            tail.y = ny;
        }
        grid.set(SNAKE, tail.x, tail.y);

        snake.insert(tail.x, tail.y);
    }
}

function draw() {
    var tw = canvas.width/grid.width;
    var th = canvas.height/grid.height;

    for (var i=0; i<grid.width; i++) {
        for (var j=0; j<grid.height; j++) {
            switch (grid.get(i, j)) {
                case SNAKE:
                    cntx.fillStyle = "#0ff";
                    break;
                case FRUIT:
                    cntx.fillStyle = "#f00";
                    break;
                case EMPTY:
                    cntx.fillStyle = "#fff";
                    break;
                case GAME_OVER:
                    cntx.fillStyle = "#DCDCDC";
                    break;
            }
            cntx.fillRect(i*tw, j*th, tw, th);
        }
    }
}

function setScore (score) {
    document.getElementById("score").innerHTML = "Score: " + score;
}

function action() {
    game = !game;
}

function newGame() {
    game = true;
    document.getElementById("game_over").style.display = "none";
    return init();
}
