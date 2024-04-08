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
			gravity: { y: 400 },
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

// // preload function to load the assets before the game starts
function preload() {
	this.load.image("sky", "assets/sky.png");
	this.load.image("bird", "assets/bird.png");
}
const VELOCITY = 200;

let bird = null;
const flapVelocity = 250;
let totalDelta = null;
const initialBirdPosion = { x: config.width / 15, y: config.height / 2 };

function create() {
	// Use setOrigin to set the origin of the image to the top left corner
	this.add.image(0, 0, "sky").setOrigin(0);
	bird = this.physics.add
		.sprite(initialBirdPosion.x, initialBirdPosion.y, "bird")
		.setOrigin(0);

	this.input.on("pointerdown", flap);
	this.input.keyboard.on("keydown-SPACE", flap);
}

function update(time, delta) {
	if (bird.y > config.height || bird.y < -bird.height) {
		restartPlayerPosition();
	}
}

// Flapping Function for the bird
const flap = () => {
	bird.body.velocity.y = -flapVelocity;
	console.log("flap", bird.body.velocity.y);
};

const gameOver = () => {};

const restartPlayerPosition = () => {
	bird.x = initialBirdPosion.x;
	bird.y = initialBirdPosion.y;
};
new Phaser.Game(config);
