import { Table } from './Table';
import { Move, Rotation, Vector } from './constants';
import { fromEvent, interval, Subscription } from 'rxjs';
import { Menu } from './Menu';
import { Value } from './Value';

export class Game {
	// Elements
	private table: Table;
	private menu: Menu;
	private level: Value;
	private score: Value;

	// Game Start & Finish
	private isPaused: boolean;
	private isGameOver: boolean;

	// Audio
	private song: HTMLAudioElement;

	// Movement
	private keypressSubs: Subscription;

	// Leveling
	private readonly STARTING_LEVEL = 1;
	private readonly BASE_TIME_INTERVAL = 2000; // 2 seconds
	private readonly NUM_BREAKS_TO_LEVEL_UP = 5;
	private numBreaks: number;
	private fallTimerSubs: Subscription;

	// Scoring
	private readonly BREAKS_SCORE = 100;
	private readonly BREAKS_SCORE_UPGRADE = 1.6;
	private readonly LEVEL_UP_SCORE = 250;
	private readonly LEVEL_UP_SCORE_UPGRADE = 1.5;

	constructor() {
		this.setup();
	}

	private processMovement(e: KeyboardEvent) {
		if (this.isGameOver) {
			this.clearElements();
			this.setup();
			this.resume();
		}
		else if (this.isPaused) {
			this.resume();
		}
		else {
			switch (e.key) {
				// Space - Drop
				case ' ': {
					this.table.movePiece(Move.drop);
					this.executeLogic();
					this.updateTimeInterval();
				}
					break;
				// a - Move left
				case 'a': {
					this.table.movePiece(Move.left);
				}
					break;
				// d - Move right
				case 'd': {
					this.table.movePiece(Move.right);
				}
					break;
				// s - Move down
				case 's': {
					this.table.movePiece(Move.down);
					this.executeLogic();
					this.updateTimeInterval();
				}
					break;
				// j - Rotate left
				case 'j': {
					this.table.rotatePiece(Rotation.left);
				}
					break;
				// k - Rotate right
				case 'k': {
					this.table.rotatePiece(Rotation.right);
				}
					break;
				// l - Save piece
				case 'l': {
					this.table.savePiece();
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
		}
	}

	private resume() {
		this.isPaused = false;
		this.song.play();
		this.menu.resume();
		this.createTimeInterval();
	}

	private pause() {
		this.removeTimeInterval();
		this.menu.pause();
		this.song.pause();
		this.isPaused = true;
	}

	private gameOver() {
		this.removeTimeInterval();
		this.menu.gameOver(this.score.value);
		this.isGameOver = true;
		this.song.pause();
	}

	private removeTimeInterval() {
		this.fallTimerSubs?.unsubscribe();
	}

	private createTimeInterval() {
		if (!this.table.isGameOver) {
			this.fallTimerSubs = interval(this.BASE_TIME_INTERVAL / this.level.value).subscribe(() => this.tick());
		}
	}

	private updateTimeInterval() {
		this.removeTimeInterval();
		this.createTimeInterval();
	}

	private executeLogic() {
		const numBreaks = this.table.lastNumberOfBreaks;
		if (numBreaks > 0) {
			// Breaks Score
			let score = this.BREAKS_SCORE + this.BREAKS_SCORE * (numBreaks - 1) * this.BREAKS_SCORE_UPGRADE;

			++this.numBreaks;
			const newLevel = Math.floor(this.numBreaks / this.NUM_BREAKS_TO_LEVEL_UP) + 1;
			if (newLevel > this.level.value) {

				// Level Up Score
				score += (newLevel - 2 > 0 ? this.LEVEL_UP_SCORE * this.LEVEL_UP_SCORE_UPGRADE * (newLevel - 2) : this.LEVEL_UP_SCORE);

				// Level Up
				this.level.value = newLevel;
				this.updateTimeInterval();
			}

			// Add Score
			this.score.value += score;
		}

		// Check GameOver
		if (this.table.isGameOver) {
			this.finish();
		}
	}

	private clearElements() {
		this.table.clear();
		this.menu.clear();
		this.level.clear();
		this.score.clear();
	}

	// GAME SETUP
	private setup() {
		// Interface
		this.table = new Table('game-table', { x: 20, y: 10 } as Vector);
		this.menu = new Menu('game-menu');

		// Leveling
		this.level = new Value('game-level', this.STARTING_LEVEL);
		this.numBreaks = 0;

		// Scoring
		this.score = new Value('game-score', 0);

		// Game start & finish
		this.isPaused = true;
		this.isGameOver = false;

		// Audio
		this.song = new Audio("https://ia600401.us.archive.org/3/items/Cartoon-OnOnft.DanielLevi/Cartoon-OnOnft.DanielLevi.mp3");
		this.song.volume = 0.4;
		this.song.loop = true;

		// Movement
		if (!this.keypressSubs) {
			this.keypressSubs = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(e => this.processMovement(e));
		}
	}

	// GAME TICK
	private tick() {
		this.table.movePiece(Move.down);
		this.executeLogic();
	}

	// GAME END
	private finish() {
		this.gameOver();
	}
}
