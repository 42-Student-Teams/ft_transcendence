import NavBar from '../components/home/navbar.js';
import Component from "../library/component.js";
import state from "../store/state.js";
import {wsSend} from "../utils/wsUtils.js";

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
       			<h1  id=left_player class="display-5">Player 1</h1>
        		<br/>
        		<h1 class="display-5 mx-3"> x </h1>
        		<h1  id=right_player class="display-5">Player 2</h1>
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
		
			<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
						<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<p>Modal body text goes here.</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
						<button type="button" class="btn btn-primary">Save changes</button>
					</div>
					</div>
				</div>
			</div>
		</div>
			`;

		//this.element.innerHTML = view;
		/* of course it gives errors because we don't remder the navbar */
		this.element.innerHTML = /*html*/ `<button class="btn btn-primary" id="start-game">test</button>`;
		this.handleEvent(view);
	}

	async handleEvent(view) {

		const gameOptions = localStorage.getItem("local-game");

		const obj = JSON.parse(gameOptions);

		document.getElementById("start-game").addEventListener("click", async (event) => {
			this.element.innerHTML = view;
			this.startGame(obj);
		});

		wsSend('request_game', {'target_user': null, 'ball_color': obj.color, 'bot': obj.ai});
	}

	startGame(obj) {

		const config = {
			canvasWidth: 900,
			canvasHeight: 500,
			paddleWidth: 10,
			paddleHeight: 80,
			paddleSpeed: 8,
			ballXSpeed: obj.speed * 6 || 1,
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
				this.time_ap = 0
				this.time_disp = 0
				this.happened = false
				this.effect = false
				this.x = 50
				this.y = 50
				this.size = 200
				this.effect_time = 5000
				this.app_time = 7000
				this.off_time = 14000
	
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


		const startBall = () => {
			ball.dx = config.ballXSpeed * Math.sign(Math.random() - 1)
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
				paddle1.score > paddle2.score ? document.getElementById('Winner-text').innerText = `${paddle1.name} wins!` : document.getElementById('Winner-text').innerText = `${paddle2.name} wins!`;
				
				// uncomment sendData when the backend is ready
				//sendData();
				paddle1.score = 0;
				paddle2.score = 0;
				document.getElementById("start-game").style.display = "block";
				canvas.style.backgroundColor = '#9c9c9e';
				endTime = Date.now() - startTime;
				stopperTime = true;

			}
			else {
				canvas.style.backgroundColor = '#EBEBED';
				setTimeout(() => {
					startBall();
				}, 1000);
			}
		}

		const updateTimer = () => {
			if (stopperTime == false) {
				const sparetime = Date.now() - startTime;
				const minutes = Math.floor(sparetime / 60000);
				const seconds = Math.floor((sparetime % 60000) / 1000);
				timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

		const render_pu = () => {
			let r = Math.random();
			if (r < 0.1 &&  bigpad.happened == false && stopperTime == false && Date.now() - bigpad.time_disp > bigpad.off_time ) {
				bigpad.time_ap = Date.now();
				bigpad.happened = true;	
			}
			if (bigpad.happened == true) {
				ctx.fillStyle = "#FFFF00";
				ctx.fillRect(bigpad.x, bigpad.y, bigpad.size, bigpad.size);
				if (Date.now() - bigpad.time_ap > bigpad.app_time)
					bigpad.happened = false;
					bigpad.time_disp = Date.now();
			}
		}

		const render = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			render_pu()
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
			startTime = Date.now();

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
				&& ball.y <= bigpad.y + bigpad.size && ball.y >= bigpad.y 
				&& ball	.x <= bigpad.x + bigpad.size && ball.x >= bigpad.x ) {
				paddle1.size = paddle1.size + 20;
				bigpad.time_disp = Date.now();
				bigpad.happened = false;
				bigpad.effect = true;
			}
			if (Date.now() - bigpad.time_disp > bigpad.effect_time && bigpad.effect == true) {	
				paddle1.size = paddle1.size - 20;
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
