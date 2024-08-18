import Component from "../library/component.js";
import state from "../store/state.js";
import { usernameFromToken } from "../utils/jwtUtils.js";
import { wsSend } from "../utils/wsUtils.js";

function updateFromSocket(msg_obj) {
	console.log(msg_obj);
	if (!Object.hasOwn(window, 'gameState')) {
		return;
	}
	if ('waiting_between_points' in msg_obj) {
		let cnv = document.getElementById('myCanvas');
		if (!cnv) {
			return;
		}
		if (msg_obj['waiting_between_points']) {
			cnv.style.backgroundColor = '#9c9c9e';
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
		if (!('timestamp' in msg_obj) || msg_obj['timestamp'] === null) {
			msg_obj['timestamp'] = 0;
		}
		if (window.gameState.currentUsername === window.gameState.opponent_username) {
			if (msg_obj['timestamp'] >= window.gameState.lastTimestamp) {
				window.gameState.youPaddle.x = msg_obj['opponent_paddle_pos']['x'];
				window.gameState.youPaddle.y = msg_obj['opponent_paddle_pos']['y'];
			}
			window.gameState.opponentPaddle.x = msg_obj['author_paddle_pos']['x'];
			window.gameState.opponentPaddle.y = msg_obj['author_paddle_pos']['y'];
		} else {
			if (msg_obj['timestamp'] >= window.gameState.lastTimestamp) {
				window.gameState.youPaddle.x = msg_obj['author_paddle_pos']['x'];
				window.gameState.youPaddle.y = msg_obj['author_paddle_pos']['y'];
			}
			window.gameState.opponentPaddle.x = msg_obj['opponent_paddle_pos']['x'];
			window.gameState.opponentPaddle.y = msg_obj['opponent_paddle_pos']['y'];
		}
		window.gameState.ball.x = msg_obj['ball_pos']['x'];
		window.gameState.ball.y = msg_obj['ball_pos']['y'];
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
       			<h1  id=left_player class="display-5">...</h1>
        		<br/>
        		<h1 class="display-5 mx-3"> x </h1>
        		<h1  id=right_player class="display-5">...</h1>
     		 </div>
      		<div class="d-flex justify-content-center align-items-center">
        		<div class="game-container d-flex justify-content-center align-items-center gap-5">
        	  		<div class="score-display">
        	    		<h1 id="score-left" class="display-1">0</h1>
        	  		</div>
        			<div class="col text-center">
        	    		<div class="game-canva rounded">
        	    			<div class="canvanbutton">
								<button class="btn btn-primary" id=start-game>New Game</button>
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
			'fast': state.currentGameData['speed']
		});
	}

	startGame(obj_) {
		wsSend('client_update', { 'update': 'lol' }, state.gameSocket);
		window.thisElement.innerHTML = window.gameHtml;

		window.gameState = {
			color: obj_.ball_color,
			speed: obj_.fast,
			ai: obj_.is_bot,
			youPaddle: null,
			opponentPaddle: null,
			ball: null,
			currentUsername: usernameFromToken(),
			opponent_username: obj_.opponent_username,
			author_username: obj_.author_username,
			lastTimestamp: 0,
			started: false,
		};

		if (window.gameState.author_username === window.gameState.currentUsername) {
			document.getElementById('left_player').innerText = 'You';
			document.getElementById('right_player').innerText = obj_.opponent_username;
		} else {
			document.getElementById('left_player').innerText = obj_.opponent_username;
			document.getElementById('right_player').innerText = 'You';
		}

		let myModal = document.getElementById('exampleModal');

		console.log('Gameoptions', obj_);

		document.getElementById("start-game").style.display = "none";
		document.getElementById('score-right').innerText = 0;
		document.getElementById('score-left').innerText = 0;
		document.getElementById('Winner-text').innerText = "";

		class Paddle {
			constructor() {

			}

			render = () => {
				ctx.fillStyle = "#FF0000";
				ctx.fillRect(this.x, this.y, config.paddleWidth, config.paddleHeight);
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
				wsSend('client_update', { 'pad': this.y, 'timestamp': window.gameState.lastTimestamp }, state.gameSocket);
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

		let startTime = Date.now() + 3 * 60 * 1000;
		let stopperTime = true;
		window.gameState.youPaddle = new Paddle(); //paddle1
		window.gameState.opponentPaddle = new Paddle(); //paddle2
		let endTime = startTime - Date.now();

		const controller = window.gameState.ai ? {
			38: { pressed: false, func: window.gameState.youPaddle.moveUp },
			40: { pressed: false, func: window.gameState.youPaddle.moveDown },
		} : {
			87: { pressed: false, func: window.gameState.opponentPaddle.moveUp },
			83: { pressed: false, func: window.gameState.opponentPaddle.moveDown },
			38: { pressed: false, func: window.gameState.youPaddle.moveUp },
			40: { pressed: false, func: window.gameState.youPaddle.moveDown },
		};

		window.gameState.ball = {
			r: 8,
			color: obj_.color,
		}


		const resetBall = () => {
			if (paddle1.score === 3 || paddle2.score === 3) {
				paddle1.score > paddle2.score ? document.getElementById('Winner-text').innerText = `${paddle1.name} wins!` : document.getElementById('Winner-text').innerText = `${paddle2.name} wins!`;
				paddle1.score = 0;
				paddle2.score = 0;
				document.getElementById("start-game").style.display = "block";
				canvas.style.backgroundColor = '#9c9c9e';
				endTime = startTime - Date.now();
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
				const sparetime = startTime - Date.now();
				const minutes = Math.floor(sparetime / 60000);
				const seconds = Math.floor((sparetime % 60000) / 1000);
				timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
			} else {
				const minutes = Math.floor(endTime / 60000);
				const seconds = Math.floor((endTime % 60000) / 1000);
				timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
			}
		};


		const handleKeyDown = (e) => {
			e.preventDefault();
			if (!window.gameState.started) {
				return;
			}
			controller[e.keyCode] && (controller[e.keyCode].pressed = true)
		}

		const handleKeyUp = (e) => {
			e.preventDefault();
			if (!window.gameState.started) {
				return;
			}
			controller[e.keyCode] && (controller[e.keyCode].pressed = false)
		}

		const runPressedButtons = () => {
			Object.keys(controller).forEach(key => {
				controller[key].pressed && controller[key].func()
			})
		}

		const paintBall = () => {
			ctx.beginPath();
			ctx.arc(window.gameState.ball.x, window.gameState.ball.y, window.gameState.ball.r,
				0, 2 * Math.PI, false);
			ctx.fillStyle = window.gameState.ball.color;
			ctx.fill();
		}

		const render = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			window.gameState.youPaddle.render();
			window.gameState.opponentPaddle.render();
			paintBall();
		}

		document.addEventListener("keydown", handleKeyDown)
		document.addEventListener("keyup", handleKeyUp)

		/*const MovePaddleAI = () => {
			console.log('AI');
			if (window.gameState.ball.y < paddle1.y && window.gameState.ball.dx < 0) {
				window.gameState.opponentPaddle.moveUp();
			}

			if (ball.y > paddle1.y && ball.dx < 0) {
				window.gameState.opponentPaddle.moveDown();
			}
		}*/


		function getAuthorScoreElem() {
			if (window.gameState.currentUsername === window.gameState.opponent_username) {
				return document.getElementById('');
			} else {

			}
		}


		const animate = () => {
			render();
			runPressedButtons();
			//checkWallCollisions();
			//checkPaddleCollisions();
			//moveBall();
			/*if (obj.ai) {
				MovePaddleAI();
			}*/
			//checkWin();
			//updateTimer();
			window.requestAnimationFrame(animate);
		}

		animate();

		canvas.style.backgroundColor = '#EBEBED';
		//resetBall();
		stopperTime = false;
		startTime = Date.now() + 3 * 60 * 1000 + 1000;
	}
}

export { updateFromSocket };
