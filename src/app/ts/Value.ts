import { GameElement } from './GameElement';

export class Value extends GameElement {
	private _value: number;

	constructor(id: string, startLevel?: number) {
		super(document.getElementById(id));
		this.value = startLevel;
	}

	set value(value: number) { this.element.textContent = `${(this._value = value)}`; }

	get value() { return this._value; }
}
