import Phaser from "phaser";

// setting up the game configuration

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		// setting up the physics engine to be used in the game
		default: "arcade",
		arcade: {
			// gravity: { y: 400 },
			debug: true,
		},
	},
	// setting up the game scenes
	scene: {
		preload,
		create,
		update,
	},
};

const VELOCITY = 200;
const PIPES_TO_RENDER = 4;

let bird = null;
let pipes = null;

let pipeHorizontalDistance = 0;

// The Pippe Distance Range
const pipeVerticalDistanceRange = [150, 250];
const pipeHorizontalDistanceRange = [400, 500];

const flapVelocity = 250;
let totalDelta = null;
const initialBirdPosion = { x: config.width / 15, y: config.height / 2 };
// // preload function to load the assets before the game starts
function preload() {
	this.load.image("sky", "assets/sky.png");
	this.load.image("bird", "assets/bird.png");
	this.load.image("pipe", "assets/pipe.png");
}

function create() {
	// Use setOrigin to set the origin of the image to the top left corner
	this.add.image(0, 0, "sky").setOrigin(0);
	bird = this.physics.add
		.sprite(initialBirdPosion.x, initialBirdPosion.y, "bird")
		.setOrigin(0);
	bird.body.gravity.y = 400;

	pipes = this.physics.add.group();

	// Creating the pipes
	for (let i = 0; i < PIPES_TO_RENDER; i++) {
		const upperPipe = pipes.create(0, 0, "pipe").setOrigin(0, 1);
		const lowerPipe = pipes.create(0, 0, "pipe").setOrigin(0, 0);

		placePipe(upperPipe, lowerPipe);
	}

	pipes.setVelocityX(-VELOCITY);

	this.input.on("pointerdown", flap);
	this.input.keyboard.on("keydown-SPACE", flap);
}

function update(time, delta) {
	if (bird.y > config.height || bird.y < -bird.height) {
		restartPlayerPosition();
	}
	recyclePipes();
}

// Pipe Placement Function
const placePipe = (uPipe, lPipe) => {
	const rightMostX = getRightMostPipe();
	let pipeVerticalDistance = Phaser.Math.Between(...pipeVerticalDistanceRange);
	let pipeverticalPosition = Phaser.Math.Between(
		0 + 20,
		config.height - 20 - pipeVerticalDistance
	);
	let pipeHorizontalDistance = Phaser.Math.Between(
		...pipeHorizontalDistanceRange
	);

	uPipe.x = rightMostX + pipeHorizontalDistance;
	uPipe.y = pipeverticalPosition;

	lPipe.x = uPipe.x;
	lPipe.y = uPipe.y + pipeVerticalDistance;
};

// Recycle Function
const recyclePipes = () => {
	pipes.getChildren().forEach((pipe) => {
		if (pipe.getBounds().right <= 0) {
			placePipe(pipe);
		}
	});
};

// GetMostRightPipe

const getRightMostPipe = () => {
	let rightMostX = 0;
	pipes.getChildren().forEach((pipe) => {
		rightMostX = Math.max(pipe.x, rightMostX);
	});

	return rightMostX;
};

// Flapping Function for the bird
const restartPlayerPosition = () => {
	bird.x = initialBirdPosion.x;
	bird.y = initialBirdPosion.y;
};
const flap = () => {
	bird.body.velocity.y = -flapVelocity;
	// console.log("flap", bird.body.velocity.y);
};

const gameOver = () => {};

new Phaser.Game(config);
