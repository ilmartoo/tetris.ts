import { GameElement } from './GameElement';
import { Form } from './Form';
import { Square } from './Square';

export class Holder extends GameElement {
	private _piece: Form;
	private squares: Square[];

	constructor(id: string, piece?: Form) {
		super(document.getElementById(id));
		if (piece) {
			this.piece = piece;
		}
	}

	get piece() { return this._piece; }

	set piece(piece: Form) {
		this.element.replaceChildren();

		this._piece = piece;
		this.squares = [];

		for (let i = 0; i < piece.size.x * piece.size.y; i++) {
			this.squares.push(new Square(this.element))
		}

		this._piece.locations.forEach(l => this.squares[l.y + l.x * this._piece.size.y].color = this._piece.color);

		this.element.style.setProperty('--rows', `${this._piece.size.x}`);
		this.element.style.setProperty('--cols', `${this._piece.size.y}`);
	}


}
