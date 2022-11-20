export class GameElement {
	protected parent?: HTMLElement;
	protected element: HTMLElement;

	constructor(element: HTMLElement | string, parent?: HTMLElement) {
		if (element instanceof HTMLElement) {
			this.element = element;
		}
		else {
			this.element = document.createElement(element);
		}
		if (parent) {
			this.parent = parent;
			this.parent.appendChild(this.element);
		}
	}

	get HTMLElement(): HTMLElement { return this.element; }

	set text(text: string) { this.element.innerText = text; }
}
