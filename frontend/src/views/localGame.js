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
       			<h1  id=left_player class="display-5">Inaranjo</h1>
        		<br/>
        		<h1 class="display-5 mx-3"> x </h1>
        		<h1  id=right_player class="display-5">Jackito</h1>
     		 </div>
      		<div class="d-flex justify-content-center align-items-center">
        		<div class="game-container d-flex justify-content-center align-items-center gap-5">
        	  		<div class="score-display">
        	    		<h1 id="score-left" class="display-1">0</h1>
        	  		</div>
        			<div class="col text-center">
        	    		<div class="game-canva rounded">
        	    			<div class="canvanbutton">
								<button class="btn btn-primary" id=start-game> New Game</button>
								<div id="Winner-text" class="position-absolute text-center h1"></div>
								<div id="Timer" class="position-absolute text-center h1"></div>
								<canvas id="myCanvas"></canvas>
        	    			</div>
        	    		</div>
					</div>
					<div class="score-display">
        	    		<h1 id="score-right" class="display-1">0</h1>
					</div>
				</div> 
			</div>
		</div>
			`;

		this.element.innerHTML = view;
		this.handleEvent();
	}

	async handleEvent() {



// 		const gameOptions = localStorage.getItem("local-game");

// 		let obj = JSON.parse(text);
// document.getElementById("demo").innerHTML = obj.name;

		// console.log(gameOptions);
		class Paddle {
			constructor(direction) {
				this.direction = direction
				this.y = config.canvasHeight / 2 - config.paddleHeight / 2
				direction === 1 ? this.x = 0 : this.x = config.canvasWidth - config.paddleWidth
				direction === 1 ? this.name = "Jackito" : this.name = "Inaranjo"
				this.score = 0
			}

			render = () => {
				ctx.fillStyle = "#FF0000";
				ctx.fillRect(this.x, this.y, config.paddleWidth, config.paddleHeight);
			}

			checkCollision = (ball) => {
				console.log("checking")
				return !!((this.y <= (ball.y + ball.r)) && (this.y + config.paddleHeight >= (ball.y - ball.r)))
			}

			moveDown = () => {
				this.y += config.paddleSpeed;
				(this.y + config.paddleHeight > canvas.height) && (this.y = canvas.height - config.paddleHeight)
			}

			moveUp = () => {
				this.y -= config.paddleSpeed
				this.y < 0 && (this.y = 0)
			}

			setWinner = () => {
				this.score++;
				if (this.direction === 1) {
					document.getElementById('score-right').innerText = this.score;
				} else {
					document.getElementById('score-left').innerText = this.score;
				}
			}

			win = () => {
				this.score++;
				if (this.direction === 1) {
					document.getElementById('score-right').innerText = this.score;
				} else {
					document.getElementById('score-left').innerText = this.score;
				}
			}
		}


		const canvas = document.getElementById("myCanvas")
		const ctx = canvas.getContext("2d");
		const timerElement = document.getElementById("Timer");

		const config = {
			canvasWidth: 900,
			canvasHeight: 500,
			paddleWidth: 10,
			paddleHeight: 80,
			paddleSpeed: 8,
			ballXSpeed: 9,
			ballYSpeed: 3,
			ballSlice: 4
		}

		canvas.width = config.canvasWidth
		canvas.height = config.canvasHeight
		
		let startTime = Date.now() + 3 * 60 * 1000;
		let stopperTime = true;
		const paddle1 = new Paddle(1)
		const paddle2 = new Paddle(-1)
		let endTime = startTime - Date.now()


		const startBall = () => {
			ball.dx = config.ballXSpeed * Math.sign(Math.random() - .5)
			ball.dy = config.ballYSpeed * Math.sign(Math.random() - .5)
		}

		const controller = {
			87: { pressed: false, func: paddle1.moveUp },
			83: { pressed: false, func: paddle1.moveDown },
			38: { pressed: false, func: paddle2.moveUp },
			40: { pressed: false, func: paddle2.moveDown },
		}

		const ball = {
			r: 8,
		}


		const resetBall = () => {
			ball.x = canvas.width / 2,
			ball.y = canvas.height / 2,
				// let's delay before starting each round
			ball.dx = 0
			ball.dy = 0
			if (paddle1.score === 3 || paddle2.score === 3) {
				paddle1.score > paddle2.score ? document.getElementById('Winner-text').innerText = `${paddle1.name} wins!`: document.getElementById('Winner-text').innerText = `${paddle2.name} wins!`;
				paddle1.score = 0;
				paddle2.score = 0;
				document.getElementById("start-game").style.display = "block";
				canvas.style.backgroundColor = '#9c9c9e';
				endTime = startTime - Date.now();
				stopperTime = true;

			}
			else{
				canvas.style.backgroundColor = '#EBEBED';
				setTimeout(() => {
					startBall();
				}, 1000);
			}
		}

		const updateTimer = () => {
			if (stopperTime == false) {
				const sparetime = startTime - Date.now();
				const minutes = Math.floor(sparetime / 60000);
				const seconds = Math.floor((sparetime % 60000) / 1000);
				timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
				console.log("hello");
			}
			else {
				const minutes = Math.floor(endTime / 60000);
				const seconds = Math.floor((endTime % 60000) / 1000);
				timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
			}
        };

		
		const handleKeyDown = (e) => {
			controller[e.keyCode] && (controller[e.keyCode].pressed = true)
		}
		
		const handleKeyUp = (e) => {
			controller[e.keyCode] && (controller[e.keyCode].pressed = false)
		}
		
		const runPressedButtons = () => {
			Object.keys(controller).forEach(key => {
				controller[key].pressed && controller[key].func()
			})
		}
		
		const moveBall = () => {
			ball.x += ball.dx
			ball.y += ball.dy
		}
		
		const checkWallCollisions = () => {
			((ball.y - ball.r <= 0) || (ball.y + ball.r >= canvas.height)) && (ball.dy = ball.dy * (-1))
		}
		
		const reverseDirection = (paddle) => {
			ball.dx = (-1) * ball.dx
			// added this after lecture to make sure that if you clipped it while the ball was several pixels past the border, it wouldn't reverse direction twice.
			ball.x += Math.sign(ball.dx) * 8
			// added this after lecture to add a slice to the hit.
			ball.dy = (ball.y - (paddle.y + (config.paddleHeight / 2))) / config.ballSlice
			
		}
		
		const checkPaddleCollisions = () => {
			if (ball.x - ball.r <= config.paddleWidth) {
				if (paddle1.checkCollision(ball)) { reverseDirection(paddle1) }
			}
			if (ball.x + ball.r >= canvas.width - config.paddleWidth) {
				if (paddle2.checkCollision(ball)) { reverseDirection(paddle2) }
			}
		}
		
		const checkWin = () => {
			(ball.x + ball.r <= 0) && win(paddle1);
			(ball.x - ball.r >= canvas.width) && win(paddle2)
		}
		
		const win = (paddle) => {
			paddle.win()
			resetBall()
		}
		
		
		const paintBall = () => {
			ctx.beginPath();
			ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI, false);
			ctx.fillStyle = 'green';
			ctx.fill();
			ctx.lineWidth = 5;
			ctx.strokeStyle = '#003300';
			ctx.stroke();
		}
		
		const render = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			paddle1.render()
			paddle2.render()
			paintBall()
		}
		
		document.addEventListener("keydown", handleKeyDown)
		document.addEventListener("keyup", handleKeyUp)
		
		document.getElementById("start-game").addEventListener("click", () => {
			document.getElementById("start-game").style.display = "none";
			canvas.style.backgroundColor = '#EBEBED';
			document.getElementById('score-right').innerText = 0;
			document.getElementById('score-left').innerText = 0;
			document.getElementById('Winner-text').innerText = "";
			resetBall();
			stopperTime = false;
			startTime = Date.now() + 3 * 60 * 1000 + 1000;

        });
		
		
		
		const animate = () => {
			render()
			runPressedButtons()
			checkWallCollisions()
			checkPaddleCollisions()
			moveBall()
			checkWin()
			updateTimer()
			window.requestAnimationFrame(animate)
		}
		
		animate()
	}
}
