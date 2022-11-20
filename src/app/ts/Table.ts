import { Move, Rotation, Vector } from './constants';
import { Square } from './Square';
import { GameElement } from './GameElement';
import { Form, FORMS } from './Form';
import { Holder } from './Holder';
import { HolderQueue } from './HolderQueue';

export class Table extends GameElement {
	private size: Vector;
	private readonly grid: Square[] = [];

	private numTetris = 0;
	private gameOver = false;

	private location: Vector;
	private piece: Form;
	private nextPieces: HolderQueue = new HolderQueue([ 'next-1', 'next-2', 'next-3' ]);

	private holder: Holder = new Holder('hold');
	private canSave = true;

	private colored: Square[] = [];
	private marked: Square[] = [];

	constructor(id: string, size: Vector) {
		super(document.getElementById(id));
		this.size = size;

		for (let i = 0; i < size.x * size.y; ++i) {
			const square = new Square(this.element);
			this.grid.push(square);
		}

		// Populate nextPieces Array
		this.nextPieces.next(this.createPiece());
		this.nextPieces.next(this.createPiece());
		this.nextPieces.next(this.createPiece());

		// Get principal piece
		this.newPiece();
	}

	get numberOfTetris() { return this.numTetris; }

	get isGameOver() { return this.gameOver; }

	private at(x: number, y: number): Square { return this.grid[y + x * this.size.y]; }

	private randomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	private createPiece(): Form {
		return FORMS[this.randomInt(0, FORMS.length - 1)];
	}

	private newPiece(): void {

		// Remove traces from previous square
		this.unmarkSquares();
		this.decorateSquares();

		// New piece
		this.piece = this.nextPieces.next(this.createPiece());
		this.resetLocation();
		this.colored = this.pieceSquares();

		// Draw piece
		this.drawPiece();
	}

	private resetLocation(): void {
		this.location = { x: 0, y: Math.ceil((this.size.y - this.piece.size.y) / 2) };
	}

	private isDeadSquare(square: Square): boolean {
		return square.solid && !this.colored.includes(square);
	}

	private isPlaceable(location: Vector, piece?: Form): boolean {
		const _piece = piece ?? this.piece;
		for (const l of _piece.locations) {
			const x = l.x + location.x;
			const y = l.y + location.y;
			if (x < 0 || y < 0 || x >= this.size.x || y >= this.size.y || this.isDeadSquare(this.at(x, y))) {
				return false;
			}
		}
		return true;
	}

	private pieceSquares(): Square[] {
		return this.piece.locations.map(l => this.at(l.x + this.location.x, l.y + this.location.y));
	}

	private dropLocation(): Vector[] {
		const dropLocation = { ... this.location } as Vector;

		for (++dropLocation.x; dropLocation.x <= this.size.x - this.piece.size.x && this.isPlaceable(dropLocation); ++dropLocation.x) { }
		--dropLocation.x;

		return this.piece.locations.map(s => ({ x: s.x + dropLocation.x, y: s.y + dropLocation.y } as Vector));
	}

	private markSquares(): void {
		this.unmarkSquares();
		this.marked = this.dropLocation().map(l => this.at(l.x, l.y));
		this.marked.forEach(s => s.mark());
	}

	private unmarkSquares(): void {
		this.marked.forEach(s => s.unmark());
	}

	private colorSquares(): void {
		this.decorateSquares();
		this.colored = this.pieceSquares();
		this.colored.forEach(s => s.color = this.piece.color);
	}

	private decorateSquares(): void {
		this.colored.forEach(s => s.clear());
	}

	private drawPiece(): void {
		this.colorSquares();
		this.markSquares();
	}

	// Kills actual piece & creates new one
	private killPiece(): void {
		// Remove references to new dead piece
		this.colored = [];
		this.marked = [];
		this.location = null;
		this.piece = null;

		// Reset save permission
		this.canSave = true;

		// Check for tetris
		this.checkTetris();

		// Get new piece
		this.newPiece();
	}

	private checkTetris(): void {
		const lines: number[] = [];

		for (let i = 0; i < this.size.x; ++i) {
			let allDeadPieces = true;
			for (let j = 0; j < this.size.y; ++j) {
				const square = this.at(i, j);
				allDeadPieces = this.isDeadSquare(square);
			}
			if (allDeadPieces) {
				lines.push(i);
			}
		}

		// if (lines.length > 0) {
		// 	this.numTetris++;
		//
		// // for (const l of lines) {
		// // 	for (let j = 0; j < this.size.y; ++j) {
		// // 		// Todo move rows down
		// // 	}
		// // }
		// // this.element.children
		//
		// // TODO: scoring
		// //
		// // for (const i of lines) {
		// // 	// this.element.children
		// // 	console.log('Line', i);
		// // 	const squares = this.grid.splice(i * this.size.y, this.size.y);
		// // 	squares.forEach(s => s.clear());
		// // 	this.grid.unshift(...squares);
		// // }
		// }
	}

	movePiece(move: Move): void {
		switch (move) {
			// Left
			case Move.left: {
				const location = { ... this.location };
				--location.y;
				if (this.isPlaceable(location)) {
					this.location = location;
				}
				else {
					return; // No printing needed
				}
			}
				break;
			// Right
			case Move.right: {
				const location = { ... this.location };
				++location.y;
				if (this.isPlaceable(location)) {
					this.location = location;
				}
				else {
					return; // No printing needed
				}
			}
				break;
			// Down
			case Move.down: {
				const location = { ... this.location };
				++location.x;
				if (this.isPlaceable(location)) {
					this.location = location;
				}
				else {
					this.killPiece();
				}
			}
				break;
			// Drop
			case Move.drop: {
				const locations = this.dropLocation();
				this.location = locations[0];
				for (let i = 1; i < locations.length; i++) {
					if (this.location.x > locations[i].x) {
						this.location.x = locations[i].x;
					}
					if (this.location.y > locations[i].y) {
						this.location.y = locations[i].y;
					}
				}
				this.drawPiece();
				this.killPiece();
			}
				break;
		}
		this.drawPiece();
	}

	rotatePiece(rotation: Rotation): void {
		const rotatedPiece = this.piece.rotate(rotation);

		const diff = this.piece.size.y - this.piece.size.x;
		const location: Vector = {
			x: this.location.x,
			y: this.location.y < ((this.size.y - this.piece.size.y) / 2) ? this.location.y : this.location.y + diff
		};
		if (this.isPlaceable(location, rotatedPiece)) {
			this.location = location;
			this.piece = rotatedPiece;
		}

		// let max: number;
		// let base: number;
		// if (diff > 0) {
		// 	max = this.piece.size.y;
		// 	base = Math.floor(diff / 2);
		// }
		// else if (diff < 0) {
		// 	max = this.piece.size.x;
		// 	base = Math.round(diff / 2);
		// }


		// for(let i = base, j = 0; j < max; ++j, i += j * ((j & 1) ? 1 : -1)) {
		// 	const newLocation: Vector = {x: this.location.x, y: this.location.y - j};
		// 	if (this.isPlaceable(newLocation, rotatedPiece)) {
		// 		this.location = newLocation;
		// 		this.piece = rotatedPiece;
		// 		break;
		// 	}
		// }

		this.drawPiece();
	}

	savePiece(): void {
		if (this.canSave) {
			if (!this.holder.piece) {
				this.canSave = false;

				this.holder.piece = this.piece;

				this.newPiece();
			}
			else {
				this.canSave = false;

				const saved = this.holder.piece;
				this.holder.piece = this.piece;
				this.piece = saved;

				this.resetLocation();

				this.drawPiece();
			}
		}
	}
}
