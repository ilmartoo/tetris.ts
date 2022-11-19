import {Color, Rotation, Vector} from './constants';

export class Form {
	private readonly _size: Vector;
	private readonly _locations: Vector[];
	private readonly _color: Color;

	constructor(size: Vector, locations: Vector[], color: Color) {
		this._size = size;
		this._color = color;
		this._locations = locations;
	}

	get size() { return this._size; }

	get locations() { return this._locations; }

	get color() { return this._color; }

	rotate(direction: Rotation): Form {
		const locations: Vector[] = [...this._locations];
		const newLocations = direction === Rotation.left ? locations.map(l => ({x: this._size.y - l.y - 1, y: l.x} as Vector)) : locations.map(l => ({x: l.y, y: this._size.x - l.x - 1} as Vector));
		return new Form({x: this._size.y, y: this._size.x} as Vector, newLocations, this.color);
	}
}

const POS: Vector[][] = [
	[ { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 } ],
	[ { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 } ],
	[ { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 } ],
	[ { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 } ]
];

export const FORMS = [
	/* Line */ new Form({ x: 4, y: 1 }, [ POS[0][0], POS[1][0], POS[2][0], POS[3][0] ], Color.skyblue),
	/* Cube */ new Form({ x: 2, y: 2 }, [ POS[0][0], POS[0][1], POS[1][0], POS[1][1] ], Color.yellow),
	/* LR */ new Form({ x: 3, y: 2 }, [ POS[0][0], POS[1][0], POS[2][0], POS[2][1] ], Color.orange),
	/* LL */ new Form({ x: 3, y: 2 }, [ POS[0][1], POS[1][1], POS[2][1], POS[2][0] ], Color.blue),
	/* ZR */ new Form({ x: 2, y: 3 }, [ POS[0][0], POS[0][1], POS[1][1], POS[1][2] ], Color.red),
	/* ZL */ new Form({ x: 2, y: 3 }, [ POS[0][1], POS[0][2], POS[1][1], POS[1][0] ], Color.green),
	/* T */ new Form({ x: 2, y: 3 }, [ POS[0][1], POS[1][0], POS[1][1], POS[1][2] ], Color.purple)
];
