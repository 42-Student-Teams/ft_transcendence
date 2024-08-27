import Component from "../library/component.js";
import {wsSend} from "../utils/wsUtils.js";
import * as bootstrap from 'bootstrap';
import { navigateTo } from "../utils/router.js";

export default class TwoPlayerLocalGame extends Component {
	constructor() {
		super({ element: document.getElementById("app") });

		// store.events.subscribe("languageIdChange", () => this.renderAll());

		this.render();
	}

	async render() {

		const view = /*html*/ `


    	<div class="h-100 d-flex flex-column">
      		<h1 class="pt-5 text-center display-1">Local Game</h1>
     		<div class="d-flex flex-row justify-content-center">
       			<h1  id=left_player class="display-5">Player 190</h1>	
        		<br/>
        		<h1 class="display-5 mx-3"> x </h1>
        		<h1  id=right_player class="display-5">Player 290</h1>
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
		
			<div class="modal fade" id="exampleModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered">
					<div class="modal-content">
					<div class="modal-header">
						<h5 class= "modal-title w-100 text-center" > Game over </h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="d-flex flex-row p-2 justify-content-center bg-light rounded w-50 border container-fluid">
							<i class="fa-solid fa-trophy fa-xl fa-bounce p-1" style="color: #f7d459;"></i> 
							<br/>
							<div id= Modal-winner class="display-8 p-1 "></div>
						</div>
						<div class="d-flex flex-row p-2 mt-2 justify-content-center bg-light rounded w-50 border container-fluid">
							<i class="fa-solid fa-stopwatch-20 fa-xl p-1"></i> 
							<br/>
							<div id=Time class="display-8 p-1 "></div>

						</div>
					</div>
					<div class="modal-footer">
					<button type="button" class="btn btn-primary" data-bs-dismiss="modal" id="back-to-home" >Back to Home Page</button>
						<button type="button" class="btn btn-success" data-bs-dismiss="modal" id="Modal-New-Game" >New Game</button>
					</div>
					</div>
				</div>
			</div>
		</div>
			`;

		//this.element.innerHTML = view;
		/* of course it gives errors because we don't remder the navbar */
		this.element.innerHTML = /*html*/ ''; //`<button class="btn btn-primary" id="start-game">test</button>`;
		this.handleEvent(view);


		// document.getElementById('back-to-home').addEventListener('click', () => {
		// this.element.querySelector("#back-to-home").addEventListener("click", (event) => {
			// 	event.preventDefault();
			//     navigateTo("/");
			// });
		}

		async handleEvent(view) {

			const gameOptions = localStorage.getItem("local-game");

			const obj = JSON.parse(gameOptions);

			//document.getElementById("start-game").addEventListener("click", async (event) => {
				this.element.innerHTML = view;
				document.getElementById('left_player').innerText = "P1";
				document.getElementById('right_player').innerText = "P2";
				this.startGame(obj);
			//});
	}

	startGame(obj) {

		const config = {
			canvasWidth: 900,
			canvasHeight: 500,
			paddleWidth: 10,
			paddleHeight: 80,
			paddleSpeed: 8,
			ballXSpeed: obj.speed * 6 || 3,
			ballYSpeed: 3,
			ballSlice: 4
		}


		class Paddle {
			constructor(direction) {
				this.direction = direction
				this.y = config.canvasHeight / 2 - config.paddleHeight / 2
				direction === 1 ? this.x = 0 : this.x = config.canvasWidth - config.paddleWidth
				direction === 1 ? this.name = "Jackito" : obj.ai == true ? this.name = "AI" : this.name = "Inaranjo"
				this.score = 0
				this.aipos_cal = 0
				this.size = config.paddleHeight
				this.speed = config.paddleSpeed
			}

			render = () => {
				ctx.fillStyle = "#FF0000";
				ctx.fillRect(this.x, this.y, config.paddleWidth, this.size);
			}

			checkCollision = (ball) => {
				// console.log("checking")
				return !!((this.y <= (ball.y + ball.r)) && (this.y + this.size >= (ball.y - ball.r)))
			}

			moveDown = () => {
				this.y += this.speed;
				(this.y + this.size > canvas.height) && (this.y = canvas.height - this.size)
			}

			moveUp = () => {
				this.y -= this.speed
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

		class BiggerPad {
			constructor() {
				let r = Math.random();
				this.time_ap = 0
				this.time_disp = Date.now()
				this.happened = false
				this.effect = false
				this.x = Math.random() * (canvas.width - 200)
				this.y = Math.random() * (canvas.height - 200)
				this.size = 50
				this.effect_time = 8000
				this.app_time = 20000//14000
				this.off_time = 10000
				this.choosecolor();

			}
			reset = () => {
				this.time_disp = Date.now()
				this.happened = false
				this.x = Math.random() * (canvas.width - 200)
				this.y = Math.random() * (canvas.height - 200)
			}
			render = () => {
				let r = Math.random();
				if (r < 0.1 &&  bigpad.happened == false && stopperTime == false && Date.now() - bigpad.time_disp > bigpad.off_time ) {
					bigpad.time_ap = Date.now();
					bigpad.happened = true;
				}
				if (bigpad.happened == true) {
					ctx.fillStyle = this.color;
					ctx.fillRect(bigpad.x, bigpad.y, bigpad.size, bigpad.size);
					if (Date.now() - bigpad.time_ap > bigpad.app_time)
					{
						bigpad.happened = false;
						bigpad.reset();
					}

				}
			}
			choosecolor = () => {
				let r = Math.random();
				if (r > 1/3 && r <= 2/3) {
					this.color = "#ffc107";  //yellow
				}
				else if (r <= 1/3) {
					this.color = "#198754";  //green
				}
				else {
					this.color = "#0d6efd"; //blue
				}
			}
			ft_effect = () => {
				console.log("-----", this.color);
				if (this.color == "#ffc107")
				{
					if (ball.dx > 0)
						paddle1.size = paddle1.size + 30;
					else
						paddle2.size = paddle2.size + 30;
					console.log("yellow");
				}
				else if (this.color == "#198754")
				{
					console.log("green");
					ball.r = 2 * ball.r;
				}
				else
				{
					console.log("blue");
					ball.dx = 2 * ball.dx;
				}
			}
			stop = () => {
				if (this.color == "#ffc107") //yellow
				{
					if (paddle1.size > paddle2.size)
						paddle1.size = paddle1.size - 30;
					else
						paddle2.size = paddle2.size - 30;
					console.log("off_yellow");

				}
				else if (this.color == "#198754")
				{
					console.log("off_green");
					ball.r = ball.r / 2;
				}
				else
				{
					console.log("off_blue");
					ball.dx = ball.dx / 2;
				}
			}
		}




		const canvas = document.getElementById("myCanvas")
		const ctx = canvas.getContext("2d");
		const timerElement = document.getElementById("Timer");


		canvas.width = config.canvasWidth
		canvas.height = config.canvasHeight

		let startTime = Date.now();
		let stopperTime = true;
		const paddle1 = new Paddle(1)
		const paddle2 = new Paddle(-1)
		const bigpad = new BiggerPad()
		let endTime = 0
		let looktime = 0
		// document.getElementById('left-player') = paddle1.name;
		// document.getElementById('right-player') = paddle2.name;
		const myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
			keyboard: true
		});


		const startBall = () => {
			ball.dx = config.ballXSpeed * Math.sign(Math.random() - .5)
			ball.dy = config.ballYSpeed * Math.sign(Math.random() - .5)
		}

		const controller = obj.ai ? {
			38: { pressed: false, func: paddle2.moveUp },
			40: { pressed: false, func: paddle2.moveDown },
		} : {
			87: { pressed: false, func: paddle1.moveUp },
			83: { pressed: false, func: paddle1.moveDown },
			38: { pressed: false, func: paddle2.moveUp },
			40: { pressed: false, func: paddle2.moveDown },
		};

		const ball = {
			r: 8,
			color: obj.color,
		}


		const resetBall = () => {
			ball.x = canvas.width / 2,
			ball.y = canvas.height / 2,
			ball.dx = 0
			ball.dy = 0
			if (paddle1.score === 3 || paddle2.score === 3) {
				paddle1.score > paddle2.score ? document.getElementById('Modal-winner').innerText = `${paddle1.name}` : document.getElementById('Modal-winner').innerText = `${paddle2.name}`;

				// uncomment sendData when the backend is ready
				//sendData();
				paddle1.score = 0;
				paddle2.score = 0;
				document.getElementById("start-game").style.display = "block";
				canvas.style.backgroundColor = '#9c9c9e';
				endTime = Date.now() - startTime;
				stopperTime = true;
				myModal.show();
				document.getElementById("Timer").style.display = "none";

			}
			else {
				canvas.style.backgroundColor = '#EBEBED';
				setTimeout(() => {
					startBall();
				}, 1000);
			}
		}

		const updateTimer = () => {
			if (!document.getElementById('Time')) {
				return;
			}
			if (stopperTime == false) {
				const sparetime = Date.now() - startTime;
				const minutes = Math.floor(sparetime / 60000);
				const seconds = Math.floor((sparetime % 60000) / 1000);
				timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
				document.getElementById('Time').innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
			}
			else {
				const minutes = Math.floor(endTime / 60000);
				const seconds = Math.floor((endTime % 60000) / 1000);
				if (timerElement)
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
			ball.dy = (ball.y - (paddle.y + (paddle.size / 2))) / config.ballSlice

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
			ctx.fillStyle = ball.color;
			ctx.fill();
		}

		const render = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			bigpad.render()
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
			resetBall();
			stopperTime = false;
			startTime = Date.now();

		});

		this.element.querySelector("#back-to-home").addEventListener("click", (event) => {
			event.preventDefault();
            navigateTo("/");
		});

		this.element.querySelector("#Modal-New-Game").addEventListener("click", (event) => {
			event.preventDefault();
            endTime = 0;
			document.getElementById("Timer").style.display = "block";
		});

		// ready for post request @inaranjo modify route
        const sendData = async () => {
			try {
				// Make the POST request with the login credentials
				const apiurl = process.env.API_URL;

				const data = {
					date_partie: new Date(),
					joueur1_username: "jackito",
					joueur2_username: "naranjito",
					is_ai_opponent: obj.ai,
					duree_partie: 0,
					score_joueur1: paddle1.score,
					score_joueur2: paddle2.score
				};

				const jwt = localStorage.getItem('jwt');
				console.log(jwt);

				const response = await fetch(`${apiurl}/history_postGames`, {
					method: "POST",
					headers: {
						'Authorization': `Bearer ${jwt}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(data)
				});

				const jsonData = await response.json();


				if (response.ok) {

					console.log("Game result sent");
				}
				else {
					console.log("hello");
					console.error("Login failed:");
					throw new Error("Login failed: Invalid username or password.");
				}
			} catch (error) {
				// Handle network or other errors here
				console.error("An error occurred:", error);
			}
		};



		const MovePaddleAI = () => {

			if (ball.dx < 0 && (Date.now() - looktime > 1000 || (ball.x - ball.r <= config.paddleWidth && paddle1.checkCollision(ball)))) {

				let b = ((ball.x - config.paddleWidth - ball.r) * Math.abs(ball.dy / ball.dx));
				looktime = Date.now();
				let mod = ball.y + Math.sign(ball.dy) * b;
				mod = mod % (2 * (config.canvasHeight - 2 * ball.r));
				while (mod > config.canvasHeight - ball.r || mod < ball.r) {
					if (mod > config.canvasHeight - ball.r) {
						mod = 2 * (config.canvasHeight - ball.r) - mod;
					}
					else {
						mod = ball.r + Math.abs(mod - ball.r);
					}
				}
				paddle1.aipos_cal = mod - paddle1.size / 2;
			}

			if (paddle1.aipos_cal - paddle1.y <= - paddle1.speed && ball.dx < 0) {
				paddle1.moveUp();
			}

			if (paddle1.aipos_cal - paddle1.y >= paddle1.speed && ball.dx < 0) {
				paddle1.moveDown();
			}


		}

		const checkbig = () => {
			if (bigpad.happened == true
				&& ball.y - ball.r <= bigpad.y + bigpad.size && ball.y + ball.r >= bigpad.y
				&& ball.x  - ball.r <= bigpad.x + bigpad.size && ball.x + ball.r >= bigpad.x ) {
					bigpad.ft_effect();
					bigpad.happened = false;
					bigpad.effect = true;
					bigpad.reset();
			}
			if (Date.now() - bigpad.time_disp > bigpad.effect_time && bigpad.effect == true) {
				bigpad.stop();
				bigpad.choosecolor();
				bigpad.effect = false;
			}

		}


		const animate = () => {
			render()
			runPressedButtons()
			checkWallCollisions()
			checkPaddleCollisions()
			moveBall()
			if (obj.ai)
				MovePaddleAI()
			checkWin()
			checkbig()
			updateTimer()
			window.requestAnimationFrame(animate)
		}

		animate()
	}
}
