import { Move, Rotation, Vector } from './constants';
import { Square } from './Square';
import { GameElement } from './GameElement';
import { Form, FORMS } from './Form';
import { Holder } from './Holder';
import { HolderQueue } from './HolderQueue';

export class Table extends GameElement {
	private size: Vector;
	private readonly grid: Square[] = [];

	private lastNumTetris = 0;
	private gameOver = false;

	private location: Vector;
	private piece: Form;
	private nextPieces: HolderQueue = new HolderQueue([ 'next-1', 'next-2', 'next-3' ]);
	private readonly pieceBag: number[] = [];
	private readonly NUM_PIECE_BAGS = 3;

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
		this.nextPieces.next(this.getPiece());
		this.nextPieces.next(this.getPiece());
		this.nextPieces.next(this.getPiece());

		// Get principal piece
		this.newPiece();
	}

	get lastNumberOfTetris() {
		const tetris = this.lastNumTetris;
		this.lastNumTetris = 0;
		return tetris;
	}

	get isGameOver() { return this.gameOver; }

	private at(x: number, y: number): Square { return this.grid[y + x * this.size.y]; }

	private randomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	private getPiece(): Form {
		// Fill bag if empty
		if (this.pieceBag.length === 0) {
			this.fillPieceBag();
		}

		const index = this.randomInt(0, this.pieceBag.length - 1);
		return FORMS[this.pieceBag.splice(index, 1)[0]];
	}

	private fillPieceBag(): void {
		for (let i = 0; i < FORMS.length; ++i) {
			this.pieceBag.push(... [ ... new Array(this.NUM_PIECE_BAGS) ].map(() => i));
		}
	}

	private newPiece(): void {
		this.decorateSquares();
		this.unmarkSquares();

		// New piece
		const newLocation = this.fitNextPiece();
		if (newLocation) {
			this.piece = this.nextPieces.next(this.getPiece());
			this.location = newLocation;
			this.colored = this.pieceSquares();

			// Draw piece
			this.drawPiece();
		}
		else {
			this.gameOver = true;
		}
	}

	private fitNextPiece(): Vector {
		const nextPiece = this.nextPieces.peek();
		let spawnLocation = { x: 0, y: Math.ceil((this.size.y - nextPiece.size.y) / 2) };
		if (this.isPlaceable(spawnLocation, nextPiece)) {
			return spawnLocation;
		}
		return null;
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
		let numTetris = 0;
		let dropIndex = this.size.x - 1;
		let checkIndex = dropIndex;

		while (checkIndex >= 0) {
			let tetris = true;
			for (let col = 0; col < this.size.y; col++) {
				if (tetris) {
					tetris = this.isDeadSquare(this.at(checkIndex, col));
				}
			}

			if (tetris) {
				numTetris++;
			}
			else {
				if (numTetris > 0) {
					for (let col = 0; col < this.size.y; col++) {
						this.at(dropIndex, col).color = this.at(checkIndex, col).color;
					}
				}
				--dropIndex;
			}
			checkIndex = dropIndex - numTetris;
		}

		for (let i = 0; i < numTetris * this.size.y; i++) {
			this.grid[i].clear();
		}

		this.lastNumTetris = numTetris;
	}

	movePiece(move: Move): void {
		switch (move) {
			// Left
			case Move.left: {
				const location = { ... this.location };
				--location.y;
				if (this.isPlaceable(location)) {
					this.location = location;
					this.drawPiece();
				}
			}
				break;
			// Right
			case Move.right: {
				const location = { ... this.location };
				++location.y;
				if (this.isPlaceable(location)) {
					this.location = location;
					this.drawPiece();
				}
			}
				break;
			// Down
			case Move.down: {
				const location = { ... this.location };
				++location.x;
				if (this.isPlaceable(location)) {
					this.location = location;
					this.drawPiece();
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
				// Change pieces if saved piece can be placed
				const newLocation = this.fitNextPiece();
				if (newLocation) {
					this.canSave = false;

					const saved = this.holder.piece;
					this.holder.piece = this.piece;
					this.piece = saved;
					this.location = newLocation;

					this.drawPiece();
				}
			}
		}
	}
}
