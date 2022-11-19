import { Table } from './Table';
import { Move, Rotation, Vector } from './constants';

export class Game {
	private table: Table;
	private moving = false;

	constructor() {
		this.setup();
		this.loop();
		this.finish();
	}

	private setup() {
		this.table = new Table('game-table', {x: 20, y: 10} as Vector);

		this.setupKeypressListener()
	}

	private setupKeypressListener(): void {
		document.addEventListener('keypress', (e) => {
			if (!this.moving) {
				this.moving = true;

				switch (e.key) {
					// Space - Drop
					case ' ': {
						this.table.movePiece(Move.drop);
					} break;
					// a - Move left
					case 'a': {
						this.table.movePiece(Move.left);
					} break;
					// d - Move right
					case 'd': {
						this.table.movePiece(Move.right);
					} break;
					// s - Move down
					case 's': {
						this.table.movePiece(Move.down);
					} break;
					// j - Rotate left
					case 'j': {
						this.table.rotatePiece(Rotation.left);
					} break;
					// k - Rotate right
					case 'k': {
						this.table.rotatePiece(Rotation.right);
					} break;
					// l - Save piece
					case 'l': {
						this.table.savePiece();
					} break;
				}

				this.moving = false;
			}
		});
	}

	private loop() {

	}

	private finish() {

	}
}
