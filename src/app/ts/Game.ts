import { Table } from './Table';
import { Move, Rotation, Vector } from './constants';
import { fromEvent, interval, Subscription } from 'rxjs';
import { Menu } from './Menu';
import { Level } from './Level';

export class Game {
	// Elements
	private table: Table;
	private menu: Menu;
	private level: Value;
	private score: Value;

	// Game Start
	private isPaused: boolean;

	// Movement
	private moving: boolean;
	private keypressSubs: Subscription;

	// Leveling
	private readonly STARTING_LEVEL = 1;
	private readonly BASE_TIME_INTERVAL = 2000; // 2 seconds
	private readonly NUM_TETRIS_TO_LEVEL_UP = 15;
	private fallTimerSubs: Subscription;

	constructor() {
		this.setup();
	}

	// GAME SETUP
	private setup() {
		// Elements
		this.tableEl = new Table('game-table', { x: 20, y: 10 } as Vector);
		this.menuEl = new Menu('game-menu');
		this.levelEl = new Level('game-level');

		// Game start
		this.isPaused = true;

		// Leveling
		this.levelEl.level = this.STARTING_LEVEL;

		// Movement
		this.moving = false;
		this.keypressSubs = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(e => this.processMovement(e));
	}

	private processMovement(e: KeyboardEvent) {
		if (this.isPaused) {
			this.resume();
		}
		else {
			if (!this.moving) {
				this.moving = true;

				switch (e.key) {
					// Space - Drop
					case ' ': {
						this.tableEl.movePiece(Move.drop);
						this.updateTimeInterval();
					}
						break;
					// a - Move left
					case 'a': {
						this.tableEl.movePiece(Move.left);
					}
						break;
					// d - Move right
					case 'd': {
						this.tableEl.movePiece(Move.right);
					}
						break;
					// s - Move down
					case 's': {
						this.tableEl.movePiece(Move.down);
						this.updateTimeInterval();
					}
						break;
					// j - Rotate left
					case 'j': {
						this.tableEl.rotatePiece(Rotation.left);
					}
						break;
					// k - Rotate right
					case 'k': {
						this.tableEl.rotatePiece(Rotation.right);
					}
						break;
					// l - Save piece
					case 'l': {
						this.tableEl.savePiece();
						this.updateTimeInterval();
					}
						break;
					// Escape - Pause
					case 'Esc':
					case 'Escape': {
						this.pause();
					}
						break;
				}

				this.moving = false;
			}
		}
	}

	private resume() {
		this.isPaused = false;
		this.menuEl.resume();
		this.createTimeInterval();
	}

	private pause() {
		this.removeTimeInterval();
		this.menuEl.pause();
		this.isPaused = true;
	}

	private removeTimeInterval() {
		this.fallTimerSubs?.unsubscribe();
	}

	private createTimeInterval() {
		const actualInterval = this.BASE_TIME_INTERVAL / this.levelEl.level;
		this.fallTimerSubs = interval(actualInterval).subscribe(i => this.loop());
	}

	private updateTimeInterval() {
		this.removeTimeInterval();
		this.createTimeInterval();
	}

	// GAME LOOP
	private loop() {
		this.tableEl.movePiece(Move.down);

		// Check GameOver
		if (this.tableEl.isGameOver) {
			this.finish();
		}

		// Check LevelUp
		const newLevel = this.tableEl.numberOfTetris % this.NUM_TETRIS_TO_LEVEL_UP;
		if (newLevel > this.levelEl.level) {
			this.levelEl.level = newLevel;
			this.updateTimeInterval();
		}
	}

	// GAME END
	private finish() {
		this.keypressSubs.unsubscribe();
		this.fallTimerSubs.unsubscribe();
	}
}
