import Component from "../library/component.js";
import state from "../store/state.js";
import { usernameFromToken } from "../utils/jwtUtils.js";
import { wsSend } from "../utils/wsUtils.js";
import NavBar from '../components/home/navbar.js';
import * as bootstrap from 'bootstrap';
import { navigateTo } from "../utils/router.js";

function updateFromSocket(msg_obj) {
	if (msg_obj['paddle_moved'] ||  ('update' in msg_obj && msg_obj['bigpad']['active'])) {
		//console.log(msg_obj);
	}
	if (!Object.hasOwn(window, 'gameState')) {
		return;
	}
	if ('waiting_between_points' in msg_obj) {
		let cnv = document.getElementById('myCanvas');
		if (!cnv) {
			return;
		}
		if (msg_obj['waiting_between_points']) {
			/* equivalent of resetBall */
			cnv.style.backgroundColor = '#9c9c9e';
			//window.gameState.stopperTime = true;
			//window.gameState.endTime = Date.now() - window.gameState.startTime;

		} else {
			cnv.style.backgroundColor = '#EBEBED';
		}

	} else if ('author_points' in msg_obj) {
		console.log(`Author points: ${msg_obj['author_points']}`);
		document.getElementById('score-left').innerText = msg_obj['author_points'];
	} else if ('opponent_points' in msg_obj) {
		console.log(`Opponent points: ${msg_obj['opponent_points']}`);
		document.getElementById('score-right').innerText = msg_obj['opponent_points'];
	} else if ('countdown' in msg_obj) {
		console.log(`Countdown: ${msg_obj['countdown']}`);
		document.getElementById('Timer').innerText = msg_obj['countdown'];
		if (msg_obj['countdown'] === 0) {
			window.gameState.started = true;
			document.getElementById('Timer').innerText = '';
		}
	} else {
		let ourTimestamp = 0;
		if (window.gameState.currentUsername === window.gameState.author_username) {
			ourTimestamp = msg_obj['author_timestamp'];
		} else {
			ourTimestamp = msg_obj['opponent_timestamp'];
		}
		//ourTimestamp = 0;
		/*if (!('timestamp' in msg_obj) || msg_obj['timestamp'] === null) {
			console.error('Setting timestamp to 0!');
			msg_obj['timestamp'] = 0;
		}*/
		if (window.gameState.currentUsername === window.gameState.opponent_username) {
			if (ourTimestamp >= window.gameState.lastTimestamp) {
				console.log(`Timestamp ${ourTimestamp} is newer than last ${window.gameState.lastTimestamp}, setting y to ${msg_obj['opponent_paddle_pos']['y']}`);
				window.gameState.youPaddle.x = msg_obj['opponent_paddle_pos']['x'];
				window.gameState.youPaddle.y = msg_obj['opponent_paddle_pos']['y'];
			}
			window.gameState.youPaddle.size = msg_obj['opponent_paddle_pos']['size'];
			window.gameState.opponentPaddle.x = msg_obj['author_paddle_pos']['x'];
			window.gameState.opponentPaddle.y = msg_obj['author_paddle_pos']['y'];
			window.gameState.opponentPaddle.size = msg_obj['author_paddle_pos']['size'];
		} else {
			if (ourTimestamp >= window.gameState.lastTimestamp) {
				window.gameState.youPaddle.x = msg_obj['author_paddle_pos']['x'];
				window.gameState.youPaddle.y = msg_obj['author_paddle_pos']['y'];
			}
			window.gameState.youPaddle.size = msg_obj['author_paddle_pos']['size'];
			window.gameState.opponentPaddle.x = msg_obj['opponent_paddle_pos']['x'];
			window.gameState.opponentPaddle.y = msg_obj['opponent_paddle_pos']['y'];
			window.gameState.opponentPaddle.size = msg_obj['opponent_paddle_pos']['size'];
		}
		window.gameState.ball.x = msg_obj['ball_pos']['x'];
		window.gameState.ball.y = msg_obj['ball_pos']['y'];
		window.gameState.ball.r = msg_obj['ball_pos']['r'];

		window.gameState.bigpad.active = msg_obj['bigpad']['active'];
		window.gameState.bigpad.x = msg_obj['bigpad']['x'];
		window.gameState.bigpad.y = msg_obj['bigpad']['y'];
		window.gameState.bigpad.color = msg_obj['bigpad']['color'];
	}
}

export default class LocalGame extends Component {
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

		this.element.innerHTML = /*html*/ `
		<button class="btn btn-primary" type="button" id="start-game">
			<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
			<span role="status">Please wait...</span>
		</button>
		`;
		await this.handleEvent(view, this.element);
	}

	async handleEvent(view, element) {
		window.startGame = this.startGame;
		window.gameHtml = view;
		window.thisElement = element;

		/* 1) client initiates game request */
		wsSend('request_game', {
			'target_user': state.currentGameData['opponent_username'],
			'ball_color': state.currentGameData['color'],
			'ai': state.currentGameData['ai'],
			'fast': state.currentGameData['speed'],
			'search_for_game': state.currentGameData['search_for_game'],
		});
	}

	startGame(obj_) {
		console.log(`Starting game with obj_:`);
		console.log(obj_);
		wsSend('client_update', { 'update': 'lol' }, state.gameSocket);
		window.thisElement.innerHTML = window.gameHtml;

		if (document.getElementById("back-to-home")) {
			document.getElementById("back-to-home").addEventListener("click", (event) => {
				event.preventDefault();
				navigateTo("/");
			});
		}

		if (document.getElementById("Modal-New-Game")) {
			document.getElementById("Modal-New-Game").addEventListener("click", (event) => {
				event.preventDefault();
				window.gameState.endTime = 0;
				document.getElementById("Timer").style.display = "block";
			});
		}

		window.gameState = {
			color: obj_.ball_color,
			speed: obj_.fast,
			ai: obj_.is_bot,
			youPaddle: null,
			opponentPaddle: null,
			ball: { r: 8, color: obj_.ball_color },
			currentUsername: usernameFromToken(),
			opponent_username: obj_.opponent_username,
			author_username: obj_.author_username,
			lastTimestamp: 0,
			started: false,
			stopperTime: false,
			startTime: Date.now(),
			endTime: 0,
			lookTime: 0,
			myModal: new bootstrap.Modal(document.getElementById('exampleModal'), {keyboard: true}),
			bigpad: null,
		};

		let pressedKeys = new Set();
		const listenedToKeys = [87, 83, 38, 40];

		if (window.gameState.author_username === window.gameState.currentUsername) {
			document.getElementById('left_player').innerText = 'You';
			document.getElementById('right_player').innerText = obj_.opponent_username;
		} else {
			document.getElementById('left_player').innerText = obj_.author_username;
			document.getElementById('right_player').innerText = 'You';
		}

		console.log('Gameoptions', obj_);

		document.getElementById("start-game").style.display = "none";
		document.getElementById('score-right').innerText = "0";
		document.getElementById('score-left').innerText = "0";

		function alphanum(len) {
			const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			let result = '';
			for (let i = 0; i < len; i++) {
				result += chars.charAt(Math.floor(Math.random() * chars.length));
			}
			return result;
		}

		class Paddle {
			constructor() {
				this.aipos_cal = 0
				this.size = config.paddleHeight
				this.speed = config.paddleSpeed
			}

			render = () => {
				ctx.fillStyle = "#FF0000";
				ctx.fillRect(this.x, this.y, config.paddleWidth, this.size);
			}

			moveDown = () => {
				this.y += config.paddleSpeed;
				(this.y + config.paddleHeight > canvas.height) && (this.y = canvas.height - config.paddleHeight);
				window.gameState.lastTimestamp = Math.trunc(Date.now());
				wsSend('client_update', { 'pad': this.y, 'timestamp': window.gameState.lastTimestamp }, state.gameSocket);
			}

			moveUp = () => {
				this.y -= config.paddleSpeed;
				this.y < 0 && (this.y = 0);
				window.gameState.lastTimestamp = Math.trunc(Date.now());
				console.log(`[${this.id}] Sending client update ${this.y}, ${window.gameState.lastTimestamp}`)
				wsSend('client_update', { 'pad': this.y, 'timestamp': window.gameState.lastTimestamp }, state.gameSocket);
			}
		}

		class BiggerPad {
			constructor() {
				this.active = false;
				this.x = 0;
				this.y = 0;
				this.size = 50;
				this.color = "#000000";
			}

			render() {
				if (this.active) {
					ctx.fillStyle = this.color;
					ctx.fillRect(this.x, this.y, this.size, this.size);
				}
			}
		}


		const canvas = document.getElementById("myCanvas")
		canvas.style.backgroundColor = '#9c9c9e';
		const ctx = canvas.getContext("2d");
		const timerElement = document.getElementById("Timer");

		const config = {
			canvasWidth: 900,
			canvasHeight: 500,
			paddleWidth: 10,
			paddleHeight: 80,
			paddleSpeed: 8,
			ballXSpeed: obj_.speed * 6 || 3,
			ballYSpeed: 3,
			ballSlice: 4
		}

		canvas.width = config.canvasWidth
		canvas.height = config.canvasHeight

		window.gameState.youPaddle = new Paddle(); //paddle1
		window.gameState.opponentPaddle = new Paddle(); //paddle2
		window.gameState.bigpad = new BiggerPad();
		window.gameState.endTime = window.gameState.startTime - Date.now();

		function resetBall() {
			if (paddle1.score === 3 || paddle2.score === 3) {
				paddle1.score > paddle2.score ? document.getElementById('Winner-text').innerText = `${paddle1.name} wins!` : document.getElementById('Winner-text').innerText = `${paddle2.name} wins!`;
				paddle1.score = 0;
				paddle2.score = 0;
				document.getElementById("start-game").style.display = "block";
				canvas.style.backgroundColor = '#9c9c9e';
				window.gameState.endTime = window.gameState.startTime - Date.now();
				window.gameState.stopperTime = true;
			}
			else {
				canvas.style.backgroundColor = '#EBEBED';
				setTimeout(() => {
					startBall();
				}, 1000);
			}
		}

		function updateTimer() {
			if (window.gameState && !window.gameState.stopperTime) {
				const sparetime = Date.now() - window.gameState.startTime;
				const minutes = Math.floor(sparetime / 60000);
				const seconds = Math.floor((sparetime % 60000) / 1000);
				if (timerElement) {
					timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
				}
				if (document.getElementById('Time')) {
					document.getElementById('Time').innerText =
					`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
				}
			}
			else {
				const minutes = Math.floor(window.gameState.endTime / 60000);
				const seconds = Math.floor((window.gameState.endTime % 60000) / 1000);
				if (timerElement) {
					timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
				}
			}
		}


		document.handleKeyDown = function (e) {
			if (listenedToKeys.includes(e.keyCode)) {
				e.preventDefault();
				if (!window.gameState.started) {
					return;
				}
				pressedKeys.add(e.keyCode);
			}
		}

		document.handleKeyUp = function (e) {
			if (listenedToKeys.includes(e.keyCode)) {
				pressedKeys.delete(e.keyCode);
			}
		}

		const paintBall = () => {
			ctx.beginPath();
			ctx.arc(window.gameState.ball.x, window.gameState.ball.y, window.gameState.ball.r,
				0, 2 * Math.PI, false);
			ctx.fillStyle = window.gameState.ball.color;
			ctx.fill();
		}

		function render() {
			if (window.gameState === null) {
				return;
			}
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			window.gameState.youPaddle.render();
			window.gameState.opponentPaddle.render();
			window.gameState.bigpad.render();
			paintBall();
		}

		document.addEventListener("keydown", document.handleKeyDown);
		document.addEventListener("keyup", document.handleKeyUp);

		function animate() {
			render();

			if (/*window.gameState.ai*/ true) {
				if (pressedKeys.has(38)) {
					window.gameState.youPaddle.moveUp();
				}
				if (pressedKeys.has(40)) {
					window.gameState.youPaddle.moveDown();
				}
			} else {
				if (pressedKeys.has(87)) {
					window.gameState.opponentPaddle.moveUp();
				}
				if (pressedKeys.has(83)) {
					window.gameState.opponentPaddle.moveDown();
				}
				if (pressedKeys.has(38)) {
					window.gameState.youPaddle.moveUp();
				}
				if (pressedKeys.has(40)) {
					window.gameState.youPaddle.moveDown();
				}
			}

			//checkWallCollisions();
			//checkPaddleCollisions();
			//moveBall();
			/*if (obj.ai) {
				MovePaddleAI();
			}*/
			//checkWin();
			updateTimer();
			window.requestAnimationFrame(animate);
		}

		animate();

		canvas.style.backgroundColor = '#EBEBED';
		//resetBall();

	}
}

export { updateFromSocket };
