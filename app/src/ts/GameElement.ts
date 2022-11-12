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

	get text(): string { return this.element.innerText; }

	set text(text: string) { this.element.innerText = text; }

	get content(): string { return this.element.innerHTML; }

	set content(content: string) { this.element.innerHTML = content; }
}
