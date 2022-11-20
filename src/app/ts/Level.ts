import { GameElement } from './GameElement';

export class Level extends GameElement {
	private _level: number;

	constructor(id: string, startLevel?: number) {
		super(document.getElementById(id));
		this.level = startLevel;
	}

	set level(level: number) { this.element.textContent = `${(this._level = level)}`; }

	get level() { return this._level; }
}
