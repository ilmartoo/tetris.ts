import { Table } from './Table';
import { Move, Rotation, Vector } from './constants';

export class Game {
	private table: Table;

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
			switch (e.key) {
				// Space - Drop
				case ' ': {
					this.table.move(Move.drop);
				} break;
				// a - Move left
				case 'a': {
					this.table.move(Move.left);
				} break;
				// d - Move right
				case 'd': {
					this.table.move(Move.right);
				} break;
				// s - Move down
				case 's': {
					this.table.move(Move.down);
				} break;
				// j - Rotate left
				case 'j': {
					this.table.rotate(Rotation.left);
				} break;
				// k - Rotate right
				case 'k': {
					this.table.rotate(Rotation.right);
				} break;
			}
		});
	}

	private loop() {

	}

	private finish() {

	}
}
