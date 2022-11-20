import { GameElement } from './GameElement';

export class Menu extends GameElement {
	private readonly START_HTML = '<div class="title center-text">PRESS ANY KEY TO START</div>';
	private readonly PAUSE_HTML = '<div class="title center-text"><span>GAME PAUSED<br><span class="subtitle">Press any key to resume</span></span></div>';
	private readonly HOWTO_HTML =
		'<div class="tecla center-text">ESC</div> <div class="center-text">Pauses the game</div>' +
		'<div class="tecla center-text">A</div> <div class="center-text">Moves the piece left</div>' +
		'<div class="tecla center-text">D</div> <div class="center-text">Moves the piece right</div>' +
		'<div class="tecla center-text">S</div> <div class="center-text">Moves the piece down</div>' +
		'<div class="tecla center-text">␣</div> <div class="center-text">Drops the piece</div>' +
		'<div class="tecla center-text">J</div> <div class="center-text">Rotates the piece left</div>' +
		'<div class="tecla center-text">K</div> <div class="center-text">Rotates the piece right</div>' +
		'<div class="tecla center-text">L</div> <div class="center-text">Saves the piece for later</div>';

	constructor(id: string) {
		super(document.getElementById(id));
		this.element.innerHTML = this.START_HTML + this.HOWTO_HTML;
	}

	pause() {
		this.element.innerHTML = this.PAUSE_HTML + this.HOWTO_HTML;
		this.element.classList.remove('resumed');
	}

	resume() {
		this.element.classList.add('resumed');
	}

}
