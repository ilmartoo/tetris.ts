export enum Color {
	orange = 'orange',
	blue = 'blue',
	skyblue = 'skyblue',
	purple = 'purple',
	red = 'red',
	yellow = 'yellow',
	green = 'green',
	transparent = 'transparent'
}

export enum Move {
	left,
	right,
	down,
	drop
}

export enum Rotation {
	left,
	right
}

export interface Vector {
	x: number;
	y: number;
}
