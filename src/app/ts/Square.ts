import { Color } from './constants';
import { GameElement } from './GameElement';

export class Square extends GameElement {
	private _color: Color;

	constructor(parent?: HTMLElement, color?: Color) {
		super('div', parent);
		this.element.classList.add('grid-square');
		this._color = color ? color : Color.transparent;
	}

	get color() { return this._color; }

	set color(color: Color) {
		this._color = color;
		if (this._color === Color.transparent) {
			this.element.classList.remove('colored');
		} else {
			this.element.classList.add('colored');
		}
		this.element.style.setProperty('--color', color);
		this.unmark();
	}

	// Checks if square is colored (solid)
	get solid(): boolean { return this._color !== Color.transparent; }

	// Removes color
	clear(): void { this.color = Color.transparent; }

	// Draws borders
	mark(): void {
		if (!this.solid) {
			this.element.classList.add('mark');
		}
	}

	// Removes border
	unmark(): void { this.element.classList.remove('mark'); }
}
