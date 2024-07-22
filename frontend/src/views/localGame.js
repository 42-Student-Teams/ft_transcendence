import NavBar from '../components/home/navbar.js';
import Component from "../library/component.js";

export default class LocalGame extends Component {
    constructor() {
        super({ element: document.getElementById("app") });

        // store.events.subscribe("languageIdChange", () => this.renderAll());

        this.render();
        this.components = { 
            navBar: new NavBar(),
         };
    }

    async render() {

            const view = /*html*/ `
    	<div class="h-100 d-flex flex-column">
      <div class="row chat-rm-margin">
        <nav class="navbar navbar-expand pl-4 bg-white shadow-sm" id="navBar"></nav>
      </div>
      <h1 class="pt-5 text-center display-1">Local Game</h1>
      <div class="d-flex flex-row justify-content-center">
        <h1 class="display-5">Inaranjo</h1>
        <br/>
        <h1 class="display-5 mx-3"> x </h1>
        <h1 class="display-5">Jackito</h1>
      </div>
      <div class="d-flex justify-content-center align-items-center">
        <div class="game-container d-flex justify-content-center align-items-center gap-5">
          <div class="col text-center">
            <h1 class="display-1">3</h1>
          </div>
          <div class="col text-center">
            <div class="game-canva rounded">
			<canvas id="myCanvas"></canvas>

            </div>
			</div>
			<div class="col text-center">
            <h1 class="display-1">0</h1>
			</div>
			</div>
			</div>
			</div>
			`;
			
			this.element.innerHTML = view;
			this.handleEvent();
		}
		
		async handleEvent() {
			
			// JavaScript for bouncing ball and moving rectangle animation
			const canvas = document.getElementById('myCanvas');
			const ctx = canvas.getContext('2d');
 
		// Initial ball properties
		let x = canvas.width / 2;
		let y = canvas.height / 2;
		const ballRadius = 3;
		let isMoving = true; // Flag to check if the ball is moving
		
		// Rectangle properties
		let rectY1 = canvas.height / 2;
		let rectY2 = canvas.height / 2;
		const rectHeight = 20;
		const rectWidth = 6;
		const rectSpeed = 10; // Speed at which the rectangle moves
		
		// Function to generate random velocity
		function getRandomVelocity() {
			let speed = 2 + Math.random() * 3; // Random speed between 2 and 5
			let angle = Math.random() * 2 * Math.PI; // Random angle between 0 and 2*PI
			return {
				dx: speed * Math.cos(angle),
				dy: speed * Math.sin(angle)
			};
		}
		
		let { dx, dy } = getRandomVelocity();
		
		function drawBall() {
			ctx.beginPath();
			ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
			ctx.fillStyle = "red";
			ctx.fill();
			ctx.closePath();
		}
		
		function drawRectangle(rectX, rectY, color) {
			ctx.beginPath();
			ctx.rect(rectX, rectY, rectWidth, rectHeight); 
			ctx.fillStyle = color;
			ctx.fill();
			ctx.closePath();
		}
		
		function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawRectangle(0, rectY1, "blue"); // Draw the rectangle
			drawRectangle(canvas.width - rectWidth, rectY2,  "green"); // Draw the rectangle
			drawBall(); // Draw the ball
			
			if (isMoving) {
				// Boundary collision detection for the ball
				if (y + dy < ballRadius || y + dy > canvas.height - ballRadius) {
					dy = -dy; // Reverse vertical direction
				}
				if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) {
					dx = -dx; // Reverse horizontal direction
				}
				
				x += dx;
				y += dy;
			}
		}
		
		// Start the animation
		let intervalId = setInterval(draw, 10); // Update every 10 milliseconds
		// setInterval(dra	w, 10); // Update every 10 milliseconds
		
		// Event listener for keydown to stop the ball or move the rectangle
							


		
		let keysPressed = {};
		document.addEventListener('keydown', (event) => {
			keysPressed[event.code] = true;
			// if (keysPressed['Space']) {
			//     isMoving = !isMoving; // Toggle the movement flag
			//     if (!isMoving) {
			//         clearInterval(intervalId); // Stop the animation
			//     } else {
			//         intervalId = setInterval(draw, 10); // Restart the animation
			//     }
			// }
			if (keysPressed['KeyW'] && rectY1 > 0 ) {
				rectY1 -= Math.min(rectY1, rectSpeed); // Move up
			} 
			if (keysPressed['KeyS'] && rectY1 < canvas.height - rectHeight) {
				rectY1 += Math.min(canvas.height - rectY1, rectSpeed); // Move down
			}
			// Move rectangle with arrow keys
			if (keysPressed['ArrowUp'] && rectY2 > 0 ) {
				rectY2 -= Math.min(rectY2, rectSpeed); // Move up
			} 
			if (keysPressed['ArrowDown']  && rectY2 < canvas.height - rectHeight) {
				rectY2 += Math.min(canvas.height - rectY2, rectSpeed); // Move down
			}
		});
		
		document.addEventListener('keyup', (event) => {
			delete keysPressed[event.code];
		});

	}
}
