import { Color, Move, Rotation, Vector } from './constants';
import { Square } from './Square';
import { GameElement } from './GameElement';
import { Form, FORMS } from './Form';

export class Table extends GameElement {
	private size: Vector;
	private readonly grid: Square[];

	private location: Vector;
	private piece: Form;
	private nextPieces: Form[] = [];

	private colored: Square[] = [];
	private marked: Square[] = [];

	constructor(id: string, size: Vector) {
		super(document.getElementById(id));
		this.size = size;
		this.grid = [];

		for (let i = 0; i < size.x * size.y; ++i) {
			const square = new Square(this.element);
			this.grid.push(square);
		}

		// Populate nextPieces Array
		this.nextPieces.push(this.createPiece());
		this.nextPieces.push(this.createPiece());
		this.nextPieces.push(this.createPiece());

		// Get principal piece
		this.newPiece();
	}

	private at(x: number, y: number): Square { return this.grid[y + x * this.size.y]; }

	private randomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	private createPiece(): Form {
		return FORMS[this.randomInt(0, FORMS.length - 1)];
	}

	private newPiece(): void {

		// New piece to nextPieces array
		this.nextPieces.push(this.createPiece());

		// Get new principal piece
		this.piece = this.nextPieces.shift();
		this.location = {x: 0, y: Math.ceil((this.size.y - this.piece.size.y) / 2)} as Vector;
		this.colored = this.pieceSquares();

		// Draw piece
		this.drawPiece();
	}

	private isDeadSquare(square: Square): boolean {
		return square.solid && !this.colored.includes(square);
	}

	private isPlaceable(location: Vector, pieceLocations?: Vector[]): boolean {
		for (const l of pieceLocations ? pieceLocations : this.piece.locations) {
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
		const dropLocation = {...this.location} as Vector;

		for (++dropLocation.x; dropLocation.x <= this.size.x - this.piece.size.x && this.isPlaceable(dropLocation); ++dropLocation.x) { }
		--dropLocation.x;

		return this.piece.locations.map(s => ({x: s.x + dropLocation.x, y: s.y + dropLocation.y} as Vector));
	}

	private markSquares(): void {
		this.marked.forEach(s => s.unmark());
		this.marked = this.dropLocation().map(l => this.at(l.x, l.y));
		this.marked.forEach(s => s.mark());
	}

	private colorSquares(): void {
		this.colored.forEach(s => s.clear());
		this.colored = this.pieceSquares();
		this.colored.forEach(s => s.color = this.piece.color);
	}

	private drawPiece() {
		this.colorSquares();
		this.markSquares();
	}

	private killPiece() {
		this.colored = [];
		this.marked = [];
		this.location = null;
		this.piece = null;

		this.checkTetris();
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

		for (const l of lines) {
			for (let j = 0; j < this.size.y; ++j) {
				// Todo move rows down
			}
		}
		this.element.children

		// TODO: scoring
		//
		// for (const i of lines) {
		// 	// this.element.children
		// 	console.log('Line', i);
		// 	const squares = this.grid.splice(i * this.size.y, this.size.y);
		// 	squares.forEach(s => s.clear());
		// 	this.grid.unshift(...squares);
		// }
	}

	move(move: Move): void {
		switch (move) {
			// Left
			case Move.left: {
				const location = {...this.location};
				--location.y;
				if (this.isPlaceable(location)) {
					this.location = location;
				}
				else {
					return; // No printing needed
				}
			} break;
			// Right
			case Move.right: {
				const location = {...this.location};
				++location.y;
				if (this.isPlaceable(location)) {
					this.location = location;
				}
				else {
					return; // No printing needed
				}
			} break;
			// Down
			case Move.down: {
				const location = {...this.location};
				++location.x;
				if (this.isPlaceable(location)) {
					this.location = location;
				} else {
					this.killPiece();
				}
			} break;
			// Drop
			case Move.drop: {
				this.location = this.dropLocation().sort((a, b) => (a.x === b.x) ? (a.y - b.y) : (a.x - b.x))[0];
				this.colorSquares();
				this.killPiece();
			} break;
			default: {
			}
		}
		this.drawPiece();
	}

	rotate(rotation: Rotation): void {
		this.piece.rotate(rotation, (locations: Vector[]) => { return this.isPlaceable(this.location, locations); });
		this.drawPiece();
	}
}
