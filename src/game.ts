// --------------------------------------------------------------- //
// ---- Utils ---------------------------------------------------- //
// --------------------------------------------------------------- //

type Color = 'ORANGE' | 'BLUE' | 'SKYBLUE' | 'PURPLE' | 'RED' | 'YELLOW' | 'GREEN' | 'TRANSPARENT';
type Movement = 'LEFT' | 'RIGHT' | 'DOWN' | 'DROP';
type Rotation = 'LEFT' | 'RIGHT';

interface Vector {
  x: number; // X axis represents the row
  y: number; // Y axis represents the column
}

// --------------------------------------------------------------- //
// ---- Container ------------------------------------------------ //
// --------------------------------------------------------------- //

interface Container {
  element: HTMLElement;
  empty(): void;
}

function createContainer(element: HTMLElement): Container {
  return { element, empty() { this.element.innerHTML = ''; } };
}

function createContainerFromId(id: string): Container {
  const element: HTMLElement | null = document.getElementById(id);
  if (element == null) { throw Error(`DOM element with id '${id}' does not exist!`); }
  return createContainer(element);
}

function createContainerFromTagName(tag: string): Container {
  return createContainer(document.createElement(tag));
}

function appendContainerToNode<T extends Container>(parent: Node, container: T): T {
  parent.appendChild(container.element);
  return container;
}

// --------------------------------------------------------------- //
// ---- Value ---------------------------------------------------- //
// --------------------------------------------------------------- //

interface Value extends Container {
  value: number;
}

function createValue(container: Container, value: number = 0): Value {
  return {
    ...container,
    set value(v: number) { this.element.innerHTML = `${value = v}` },
    get value(): number { return value; }
  };
}

// --------------------------------------------------------------- //
// ---- Shape ---------------------------------------------------- //
// --------------------------------------------------------------- //

interface Shape {
  size: Vector;
  usedPositions: Vector[];
  color: Color;
}

function createShape(size: Vector, positions: Vector[], color: Color): Shape {
  return {
    size,
    usedPositions: [...positions],
    color,
  }
}

function rotateShape(shape: Shape, rotation: Rotation): Shape {
  return {
    ...shape,
    usedPositions: shape.usedPositions.map(
      rotation === 'LEFT'
        ? pos => ({ x: shape.size.y - pos.y - 1, y: pos.x })
        : pos => ({ x: pos.y, y: shape.size.x - pos.x - 1 })
    ),
  }
}

const SHAPES: Shape[] = [
  /* I */ createShape({ x: 4, y: 1 }, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }], 'SKYBLUE'),
  /* O */ createShape({ x: 2, y: 2 }, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 'YELLOW'),
  /* L */ createShape({ x: 3, y: 2 }, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }], 'ORANGE'),
  /* J */ createShape({ x: 3, y: 2 }, [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 0 }], 'BLUE'),
  /* Z */ createShape({ x: 2, y: 3 }, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }], 'RED'),
  /* S */ createShape({ x: 2, y: 3 }, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 1 }, { x: 1, y: 0 }], 'GREEN'),
  /* T */ createShape({ x: 2, y: 3 }, [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], 'PURPLE'),
];

const EMPTY_SHAPE = createShape({ x: 0, y: 0 }, [], 'TRANSPARENT');

// --------------------------------------------------------------- //
// ---- Piece ---------------------------------------------------- //
// --------------------------------------------------------------- //

interface Piece extends Shape {
  position: Vector;
  offsetPositions: Vector[];
}

function createPiece(shape: Shape, position: Vector): Piece {
  return {
    ...shape,
    position,
    offsetPositions: shape.usedPositions.map(p => ({ x: p.x + position.x, y: p.y + position.y })),
  };
}

const EMPTY_PIECE = createPiece(EMPTY_SHAPE, { x: 0, y: 0 });

// --------------------------------------------------------------- //
// ---- Square --------------------------------------------------- //
// --------------------------------------------------------------- //

interface Square extends Container {
  color: Color;
  isSolid(): boolean;
  clean(): void;
  mark(): void;
  unmark(): void;
}

function createSquare(color: Color = 'TRANSPARENT'): Square {
  const square: Square = {
    ...createContainerFromTagName('div'),
    get color(): Color { return color; },
    set color(c: Color) {
      this.element.style.setProperty('--color', color = c);
      if (!this.isSolid()) {
        this.element.classList.remove('colored');
      } else {
        this.element.classList.add('colored');
      }
      this.unmark();
    },
    isSolid() { return color !== 'TRANSPARENT'; },
    clean() { this.color = 'TRANSPARENT'; },
    mark() { if (!this.isSolid) { this.element.classList.add('mark') } },
    unmark() { this.element.classList.remove('mark'); },
  };
  square.color = color;
  return square;
}

// --------------------------------------------------------------- //
// ---- Holder --------------------------------------------------- //
// --------------------------------------------------------------- //

interface Holder extends Container {
  shape: Shape;
  squares: Square[];
}

function createHolder(container: Container, shape: Shape = EMPTY_SHAPE): Holder {
  const holder: Holder = {
    ...container,
    squares: [],
    get shape(): Shape { return shape; },
    set shape(s: Shape) {
      this.element.replaceChildren();
      this.squares = [];

      if ((shape = s).usedPositions.length) {
        for (let i = 0; i < s.size.x * s.size.y; i++) {
          this.squares.push(appendContainerToNode(this.element, createSquare(s.color)));
        }

        shape.usedPositions.forEach(l => this.squares[l.y + l.x * s.size.y].color = s.color);

        this.element.style.setProperty('--rows', `${s.size.x}`);
        this.element.style.setProperty('--cols', `${s.size.y}`);
      }

    }
  };
  holder.shape = shape;
  return holder;
}

interface HolderQueue {
  queue: Holder[];
  peek(): Shape;
  pop(): Shape;
}

function createHolderQueue(containers: Container[], generator: () => Shape): HolderQueue {
  return {
    queue: containers.map(c => createHolder(c, generator())),
    peek() { return this.queue[0].shape; },
    pop() {
      const next = this.queue[0].shape;
      this.queue[0].shape = generator();
      this.queue = [...this.queue.slice(1), this.queue[0]];
      return next;
    },
  }
}

// --------------------------------------------------------------- //
// ---- Menu ----------------------------------------------------- //
// --------------------------------------------------------------- //

const MENU_START_HTML = '<div class="title center-text">PRESS ANY KEY TO START</div>';
const MENU_PAUSE_HTML = '<div class="title center-text"><span>GAME PAUSED<br><span class="subtitle">Press any key to resume</span></span></div>';
const MENU_HOWTO_HTML =
  '<div class="tecla center-text">ESC</div> <div class="center-text">Pauses the game</div>' +
  '<div class="tecla center-text">A</div> <div class="center-text">Moves the piece left</div>' +
  '<div class="tecla center-text">D</div> <div class="center-text">Moves the piece right</div>' +
  '<div class="tecla center-text">S</div> <div class="center-text">Moves the piece down</div>' +
  '<div class="tecla center-text">␣</div> <div class="center-text">Drops the piece</div>' +
  '<div class="tecla center-text">J</div> <div class="center-text">Rotates the piece left</div>' +
  '<div class="tecla center-text">K</div> <div class="center-text">Rotates the piece right</div>' +
  '<div class="tecla center-text">L</div> <div class="center-text">Saves the piece for later</div>';
const MENU_GAME_OVER_HTML = (score: number) => `<div class="title center-text"><span>GAME OVER<br><br><span class="tecla">SCORE: ${score}</span></span></div>`;

interface Menu extends Container {
  pause(): void;
  resume(): void;
  gameOver(score: number): void;
}

function createMenu(container: Container): Menu {
  const menu = {
    ...container,
    pause() {
      this.element.innerHTML = MENU_PAUSE_HTML + MENU_HOWTO_HTML;
      this.element.classList.remove('resumed');
    },
    resume() { this.element.classList.add('resumed'); },
    gameOver(score: number) {
      this.element.innerHTML = MENU_GAME_OVER_HTML(score) + MENU_START_HTML;
      this.element.classList.remove('resumed');
    }
  }
  menu.element.innerHTML = MENU_START_HTML + MENU_HOWTO_HTML;
  return menu;
}

// --------------------------------------------------------------- //
// ---- Table ---------------------------------------------------- //
// --------------------------------------------------------------- //

const NEXT_PIECES_SHOWN = 3;
const NUMBER_OF_GENERATED_PIECES = 3;

const CONTAINER_HOLD_ID = 'tetris-ts-hold';
const CONTAINER_NEXT_ID = (i: number) => `tetris-ts-next-${i}`;

interface Table extends Container {
  size: Vector;
  grid: Square[];
  colored: Square[];
  marked: Square[];

  gameOver: boolean;
  canHoldPiece: boolean;

  holder: Holder;
  linesHistory: number[];

  piece: Piece;
  nextShape: HolderQueue;

  squareAt(x: number, y: number): Square;
  isSquareEmpty(square: Square): boolean;
  unmarkSquares(): void;
  cleanColoredSquares(): void;

  isShapePlaceable(shape: Shape, position: Vector): boolean;
  fitShape(shape: Shape): Vector | false;

  pieceSquares(): Square[];
  calculateDropPiece(): Piece;
  markPieceSquares(): void;
  colorPieceSquares(): void;

  drawPiece(): void;
  nextPiece(): void
  killPiece(): void;
  rotatePiece(rotation: Rotation): void;
  holdPiece(): boolean;
  movePiece(movement: Movement): void;

  removeLines(): void;
}

function createTable(container: Container, size: Vector): Table {
  return {
    ...container,
    size,
    grid: new Array(size.x * size.y).fill(null).map(() => appendContainerToNode(container.element, createSquare())),
    colored: [],
    marked: [],

    gameOver: false,
    canHoldPiece: true,

    holder: createHolder(createContainerFromId(CONTAINER_HOLD_ID)),
    linesHistory: [],

    nextShape: (() => {
      // Following pieces randomization
      const pieceBag: number[] = [];

      function nextShape(): Shape {
        if (pieceBag.length === 0) {
          // Fill with multiple pieces of each one of the types
          pieceBag.push(...SHAPES.reduce<number[]>((arr, _, i) => [...arr, ...new Array(NUMBER_OF_GENERATED_PIECES).fill(null).map(() => i)], []));
        }
        const index = Math.round(Math.random() * pieceBag.length) % pieceBag.length; // Random index with equal probabilities each one
        return SHAPES[pieceBag.splice(index, 1)[0]];
      }

      return createHolderQueue(new Array(NEXT_PIECES_SHOWN).fill(null).map((_, i) => createContainerFromId(CONTAINER_NEXT_ID(i + 1))), nextShape);
    })(),
    piece: { ...EMPTY_PIECE },

    squareAt(x: number, y: number) {
      const i = y + x * this.size.y;
      if (i > this.grid.length) { throw Error('Table square index out of range!'); }
      return this.grid[i];
    },
    isSquareEmpty(square: Square) {
      return square.isSolid() && !this.colored.includes(square);
    },
    unmarkSquares(): void {
      this.marked.forEach(s => s.unmark());
    },
    cleanColoredSquares(): void {
      this.colored.forEach(s => s.clean());
    },

    isShapePlaceable(shape: Shape, position: Vector) {
      for (const pos of shape.usedPositions) {
        const x = pos.x + position.x;
        const y = pos.y + position.y;
        if (x < 0 || y < 0 || x >= size.x || y >= size.y || this.isSquareEmpty(this.squareAt(x, y))) {
          return false;
        }
      }
      return true;
    },
    fitShape(shape: Shape) {
      let location = { x: 0, y: Math.ceil((size.y - shape.size.y) / 2) };
      return this.isShapePlaceable(shape, location) ? location : false;
    },

    pieceSquares() {
      return this.piece.offsetPositions.map(p => this.squareAt(p.x, p.y));
    },
    calculateDropPiece() {
      const dropLocation = { ...this.piece.position } as Vector;
      while (dropLocation.x <= (this.size.x - this.piece.size.x) && this.isShapePlaceable(this.piece, dropLocation)) { ++dropLocation.x; }
      --dropLocation.x;
      return createPiece(this.piece, dropLocation);
    },
    markPieceSquares() {
      this.unmarkSquares();
      this.marked = this.calculateDropPiece().offsetPositions.map(p => this.squareAt(p.x, p.y));
      this.marked.forEach(s => s.mark());
    },
    colorPieceSquares() {
      this.cleanColoredSquares();
      this.colored = this.pieceSquares();
      this.colored.forEach(s => s.color = this.piece.color);
    },

    drawPiece() {
      this.colorPieceSquares();
      this.markPieceSquares();
    },
    nextPiece() {
      this.cleanColoredSquares();
      this.unmarkSquares();

      const position = this.fitShape(this.nextShape.peek());
      if (position) {
        this.piece = createPiece(this.nextShape.pop(), position)
        this.colored = this.pieceSquares();

        this.drawPiece();
      }
      else {
        this.gameOver = true;
      }
    },
    killPiece() {
      // Remove references to new dead piece
      this.colored = [];
      this.marked = [];

      this.canHoldPiece = true;
      this.removeLines();

      this.nextPiece();
    },
    rotatePiece(rotation: Rotation) {
      const rotatedShape = rotateShape(this.piece, rotation);

      const diff = this.piece.size.y - this.piece.size.x;
      const position: Vector = {
        x: this.piece.position.x,
        y: this.piece.position.y < ((this.size.y - this.piece.size.y) / 2) ? this.piece.position.y : this.piece.position.y + diff
      };
      if (this.isShapePlaceable(rotatedShape, position)) {
        this.piece = createPiece(rotatedShape, position);
      }

      this.drawPiece();
    },
    holdPiece() {
      if (this.canHoldPiece) {
        // Save piece and set next piece
        if (!this.holder.shape) {
          this.canHoldPiece = false;
          this.holder.shape = this.piece;

          this.nextPiece();
          return true;
        }
        // Change pieces if saved shape can be placed
        else {
          const savedShape = this.holder.shape;
          const position = this.fitShape(savedShape);
          if (position) {
            this.canHoldPiece = false;
            this.holder.shape = this.piece;
            this.piece = createPiece(savedShape, position);

            this.drawPiece();
            return true;
          }
        }
      }
      return false;
    },
    movePiece(movement: Movement) {
      switch (movement) {
        // Left
        case 'LEFT': {
          const position = { ...this.piece.position };
          --position.y;
          if (this.isShapePlaceable(this.piece, position)) {
            this.piece = createPiece(this.piece, position);

            this.drawPiece();
          }
        }
          break;
        // Right
        case 'RIGHT': {
          const position = { ...this.piece.position };
          ++position.y;
          if (this.isShapePlaceable(this.piece, position)) {
            this.piece = createPiece(this.piece, position);

            this.drawPiece();
          }
        }
          break;
        // Down
        case 'DOWN': {
          const position = { ...this.piece.position };
          ++position.y;
          if (this.isShapePlaceable(this.piece, position)) {
            this.piece = createPiece(this.piece, position);

            this.drawPiece();
          }
          else {
            this.killPiece();
          }
        }
          break;
        // Drop
        case 'DROP': {
          this.piece = this.calculateDropPiece();
          this.drawPiece();
          this.killPiece();
        }
          break;
      }
    },

    removeLines() {
      let linesToBreak = 0;
      let dropIndex = this.size.x - 1;
      let checkIndex = dropIndex;

      while (checkIndex >= 0) {
        let isBreakLine = true;
        for (let col = 0; col < this.size.y; col++) {
          if (isBreakLine) {
            isBreakLine = this.isSquareEmpty(this.squareAt(checkIndex, col));
          }
        }

        if (isBreakLine) {
          ++linesToBreak;
        }
        else {
          if (linesToBreak > 0) {
            for (let col = 0; col < this.size.y; col++) {
              this.squareAt(dropIndex, col).color = this.squareAt(checkIndex, col).color;
            }
          }
          --dropIndex;
        }
        checkIndex = dropIndex - linesToBreak;
      }

      for (let i = 0; i < linesToBreak * this.size.y; i++) {
        this.grid[i].clean();
      }

      this.linesHistory.unshift(linesToBreak);
    }
  };
}

// --------------------------------------------------------------- //
// ---- Game ----------------------------------------------------- //
// --------------------------------------------------------------- //

const BASE_TIME_INTERVAL_MS = 2000; // 2 seconds
const LEVEL_TIME_DECREASE = 0.2;

const NUM_BREAKS_TO_LEVEL_UP = 5;

const LINES_SCORE = 100;
const LEVEL_UP_SCORE = 250;
const LINES_SCORE_MULTIPLIER = [1 << 0, 1 << 2, 1 << 3, 1 << 4];
const LEVEL_SUM_MULTIPLIER = 0.5;

const GAME_MENU_ID = 'tetris-ts-menu';
const GAME_TABLE_ID = 'tetris-ts-table';
const GAME_LEVEL_ID = 'tetris-ts-level';
const GAME_SCORE_ID = 'tetris-ts-score';

export default function play(): void {
  // Elements
  let table: Table;
  let menu: Menu;
  let level: Value;
  let score: Value;

  // Game Start & Finish
  let stepInterval: NodeJS.Timeout | undefined;
  let isPaused: boolean;
  let isGameOver: boolean;

  // Audio
  let song: HTMLAudioElement;

  // Scoring
  let lines: number;
  let breaks: number;
  let currentLineHistoryEntry: number;

  function processMovement(ev: KeyboardEvent) {
    if (isGameOver) {
      clearElements();
      setup();
      resume();
    }
    else if (isPaused) {
      resume();
    }
    else {
      switch (ev.key) {
        // Space - Drop
        case ' ': {
          table.movePiece('DROP');
          executeLogic();
          updateTimeInterval();
        }
          break;
        // a - Move left
        case 'a': {
          table.movePiece('LEFT');
        }
          break;
        // d - Move right
        case 'd': {
          table.movePiece('RIGHT');
        }
          break;
        // s - Move down
        case 's': {
          table.movePiece('DOWN');
          executeLogic();
          updateTimeInterval();
        }
          break;
        // j - Rotate left
        case 'j': {
          table.rotatePiece('LEFT');
        }
          break;
        // k - Rotate right
        case 'k': {
          table.rotatePiece('RIGHT');
        }
          break;
        // l - Save piece
        case 'l': {
          if (table.holdPiece()) {
            updateTimeInterval();
          }
        }
          break;
        // Escape - Pause
        case 'Esc':
        case 'Escape': {
          pause();
        }
          break;
      }
    }
  }

  function resume(): void {
    isPaused = false;
    song.play();
    menu.resume();
    createTimeInterval();
  }

  function pause(): void {
    removeTimeInterval();
    menu.pause();
    song.pause();
    isPaused = true;
  }

  function endGame(): void {
    removeTimeInterval();
    menu.gameOver(score.value);
    isGameOver = true;
    song.pause();
  }

  function removeTimeInterval(): void {
    clearInterval(stepInterval);
  }

  function createTimeInterval(): void {
    if (!stepInterval) {
      stepInterval = setInterval(() => tick(), BASE_TIME_INTERVAL_MS - (BASE_TIME_INTERVAL_MS * LEVEL_TIME_DECREASE * (level.value - 1)));
    }
  }

  function updateTimeInterval(): void {
    removeTimeInterval();
    createTimeInterval();
  }

  function executeLogic(): void {
    // Check GameOver
    if (table.gameOver) {
      finish();
    }
    else if (currentLineHistoryEntry < table.linesHistory.length) {
      currentLineHistoryEntry = table.linesHistory.length;
      const recentLines = table.linesHistory[0];

      let breakScore = (1 + (LEVEL_SUM_MULTIPLIER * (level.value - 1))) * LINES_SCORE * LINES_SCORE_MULTIPLIER[recentLines]
      if ((breaks % NUM_BREAKS_TO_LEVEL_UP) === 0) {
        ++level.value;
        breakScore *= LEVEL_UP_SCORE;
        updateTimeInterval();
      }
      score.value += breakScore;
    }
  }

  function clearElements(): void {
    table.empty();
    menu.empty();
    level.empty();
    score.empty();
  }

  // GAME TICK
  function tick(): void {
    table.movePiece('DOWN');
    executeLogic();
  }

  // GAME END
  function finish(): void {
    endGame();
  }

  // GAME SETUP
  function setup(): void {

    // Interface
    table = createTable(createContainerFromId(GAME_TABLE_ID), { x: 20, y: 10 });
    menu = createMenu(createContainerFromId(GAME_MENU_ID));

    level = createValue(createContainerFromId(GAME_LEVEL_ID), 1);
    score = createValue(createContainerFromId(GAME_SCORE_ID), 0);

    // Leveling
    lines = 0;
    breaks = 0;
    lines = 0;

    // Game start & finish
    isPaused = true;
    isGameOver = false;

    // Audio
    song = new Audio("assets/sound/music.mp3");
    song.volume = 0.4;
    song.loop = true;

    // Movement
    addEventListener('keydown', processMovement);

    table.nextPiece();
  }

  setup();
}

// --------------------------------------------------------------- //
// ---- Play ----------------------------------------------------- //
// --------------------------------------------------------------- //

addEventListener('load', () => play());
