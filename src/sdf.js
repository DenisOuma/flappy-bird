var config = {
	type: Phaser.AUTO,
	width: 900,
	height: 600,
	backgroundColor: "#1b1464",
	parent: "Child-swing",
	physics: {
		default: "matter",
		matter: {
			debug: true,
			// Enable collisions events between objects
			enableSleeping: true,
			setBounds: {
				x: 0,
				y: 0,
				width: 900,
				height: 600,
				thickness: 32,
			},
		},
	},
	scene: {
		preload: preload,
		create: create,
		update: update,
	},
};

var block;
var child;
var goal;
var pushBlock;
var cursors;
var prevConstraint;
var isSwinging = false;
var maxSwingAngle = Math.PI;
var currentSwingAngle = 0;
var swingMomentum = 0;
var swingSpeed = 10;
var maxSwingSpeed = 15;
var score = 0; // Initialize score
var scoreText;

var game = new Phaser.Game(config);

function preload() {
	this.load.image("block", "assets/sprites/block.png");
	this.load.image("ball", "assets/sprites/shinyball.png");
}

function create() {
	goal = this.matter.add.image(800, 60, "block", null, {
		ignoreGravity: true,
		inertia: Infinity,
	});
	pushBlock = this.matter.add.image(60, 500, "block", null, {
		ignoreGravity: true,
		inertia: Infinity,
	});

	block = this.matter.add.image(400, -40, "block", null, {
		ignoreGravity: true,
		inertia: Infinity,
	});

	// Display initial score
	scoreText = this.add
		.text(90, 15, "Player Score: " + score, { color: "#ff0000" })
		.setOrigin(0.5, 0.5);

	block.setMass(100000);
	block.setFriction(0.0);
	block.setFrictionAir(0.0);
	block.setFrictionStatic(0.0);
	block.setBounce(0);

	var swingingObjects = createSwingingObjects(this, block, 9);
	var swingingBalls = swingingObjects.swingingBalls;
	child = swingingObjects.child;

	cursors = this.input.keyboard.createCursorKeys();

	// Listen for pointer events to control the swinging behavior
	pushBlock.setInteractive();
	pushBlock.on("pointerdown", function (pointer) {
		if (!isSwinging) {
			startSwinging();
		} else {
			// Increase swing momentum when the pushBlock is clicked
			swingMomentum += 200;
			// Increase swing speed each time the player clicks
			swingSpeed += 200;
			// Clamp swing speed to the maximum swing speed
			swingSpeed = Math.min(swingSpeed, maxSwingSpeed);
		}
	});

	this.input.on("pointerup", function (pointer) {
		stopSwinging();
	});

	// Add collision event between child and goal
	this.matter.world.on("collisionstart", function (event) {
		event.pairs.forEach((pair) => {
			const { bodyA, bodyB } = pair;

			// Check if child collided with the goal
			if (
				(bodyA === child.body && bodyB === goal.body) ||
				(bodyA === goal.body && bodyB === child.body)
			) {
				// Increase score
				score++;
				// Update score text
				scoreText.setText("Player Score: " + score);
			}
		});
	});
}

function update() {
	if (cursors.left.isDown) {
		block.setVelocityX(0);
		this.matter.world.removeConstraint(prevConstraint);
	} else if (cursors.right.isDown) {
		block.setVelocityX(0);
	} else {
		block.setVelocityX(0);
	}

	if (cursors.up.isDown) {
		block.setVelocityY(-20);
	} else if (cursors.down.isDown) {
		block.setVelocityY(20);
	} else {
		block.setVelocityY(0);
	}

	// Apply swinging motion to the child playing block if swinging is active
	if (isSwinging) {
		// Increase the swing angle gradually until it reaches the maximum
		currentSwingAngle += swingMomentum;

		// Clamp the swing angle to the maximum
		currentSwingAngle = Math.min(currentSwingAngle, maxSwingAngle);

		// Calculate the position of the child block based on the swing angle
		var amplitude = 100; // Adjust the amplitude of swinging
		var x = block.x + Math.sin(currentSwingAngle) * amplitude;
		child.setPosition(x, child.y);

		// Update swing speed
		swingSpeed += 10;
		swingSpeed = Math.min(swingSpeed, maxSwingSpeed);

		// Apply swing velocity to the child block
		child.setVelocityX(Math.cos(currentSwingAngle) * swingSpeed);
	}
}

function createSwingingObjects(scene, block, numBalls) {
	var prev = block;
	var prevConstraint;
	var balls = [];

	var y = 150;
	var x = 400;

	for (var i = 0; i < numBalls; i++) {
		var ball = scene.matter.add.image(x, y, "ball", null, {
			shape: "circle",
			mass: 0.9,
			inertia: Infinity,
		});

		ball.setFriction(0.0);
		ball.setFrictionAir(0.0);
		ball.setFrictionStatic(0.0);
		ball.setBounce(0);

		prevConstraint = scene.matter.add.joint(prev, ball, i === 0 ? 95 : 28, 1);
		prev = ball;

		balls.push(ball);

		y += 15;
		x -= 35;
	}

	// Create the child block
	var child = scene.matter.add.image(prev.x, prev.y + 10, "block", null, {
		inertia: Infinity,
	});
	child.setFixedRotation();
	child.setMass(40);

	// Connecting the child block to the last swinging ball
	scene.matter.add.joint(prev, child, 85, 1);

	return { swingingBalls: balls, child: child };
}

// Activate swinging motion for the child block
function startSwinging() {
	isSwinging = true;
}

function stopSwinging() {
	// Deactivate swinging motion for the child block
	isSwinging = false;
	// Reset the swing angle when swinging stops
	currentSwingAngle = 0;
	// Reset swing momentum
	swingMomentum = 0;
	// Reset swing speed
	swingSpeed = 2;
}
