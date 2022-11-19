import { Holder } from './Holder';
import { Form } from './Form';

export class HolderQueue {
	private queue: Holder[] = [];

	constructor(ids: string[]) {
		ids.forEach(id => this.queue.push(new Holder(id)));
	}

	next(piece: Form): Form {
		const next = this.queue[0].piece;

		for (let i = 0; i < this.queue.length - 1; ++i) {
			if (this.queue[i + 1].piece) {
				this.queue[i].piece = this.queue[i + 1].piece;
			}
		}
		this.queue[this.queue.length - 1].piece = piece;

		return next;
	}
}

