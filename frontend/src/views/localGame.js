import * as bootstrap from 'bootstrap';
import Component from "../library/component.js";
import store from "../store/index.js";
import state from "../store/state.js";
import { usernameFromToken } from "../utils/jwtUtils.js";
import { game } from "../utils/langPack.js";
import { navigateTo } from "../utils/router.js";
import { wsSend } from "../utils/wsUtils.js";
import { BiggerPad, Paddle } from "./localGame.js";

function updateFromSocket(msg_obj) {
	if (msg_obj['paddle_moved'] || ('update' in msg_obj && msg_obj['bigpad']['active'])) {
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
		if (document.getElementById('score-left')) {
			document.getElementById('score-left').innerText = msg_obj['author_points'];
		}
		document.getElementById('score-left').innerText = msg_obj['author_points'];
		checkGameOver();
	} else if ('opponent_points' in msg_obj) {
		console.log(`Opponent points: ${msg_obj['opponent_points']}`);
		if (document.getElementById('score-right')) {
			document.getElementById('score-right').innerText = msg_obj['opponent_points'];
		}
		checkGameOver();
	} else if ('countdown' in msg_obj) {
		console.log(`Countdown: ${msg_obj['countdown']}`);
		document.getElementById('Timer').innerText = msg_obj['countdown'];
		if (msg_obj['countdown'] === 0) {
			window.gameState.started = true;
			window.gameState.stopperTime = false;
			window.gameState.startTime = Date.now();
			if (document.getElementById('Timer')) {
				document.getElementById('Timer').innerText = '';
			}
		}
	} else {
		if (!window.gameState.currentUsername) {
			return;
		}
		let ourTimestamp = 0;
		if (window.gameState.currentUsername === window.gameState.author_username) {
			ourTimestamp = msg_obj['author_timestamp'];
		} else {
			ourTimestamp = msg_obj['opponent_timestamp'];
		}
		if (window.gameState.youPaddle == null) {
			window.gameState.youPaddle = new Paddle();
		}
		if (window.gameState.opponentPaddle == null) {
			window.gameState.opponentPaddle = new Paddle();
		}
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
		if (window.gameState.ball == null) {
			window.gameState.ball = { r: 8, color: 'red' };
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

if (typeof refreshUserProfile === 'function') {
	refreshUserProfile();
}

function checkGameOver() {
	const leftScore = parseInt(document.getElementById('score-left').innerText);
	const rightScore = parseInt(document.getElementById('score-right').innerText);

	if (leftScore === 3 || rightScore === 3) {
		const winnerText = leftScore > rightScore ? document.getElementById('left_player').innerText : document.getElementById('right_player').innerText;
	}
}


export default class LocalGame extends Component {
	constructor() {
		super({ element: document.getElementById("app") });
		this.currentLang = store.state.language;
		this.render();
	}

	async render() {

		const langPack = game[this.currentLang];
		const tournament = {
			p1: 'Player 1',
			p2: 'Player 2',
			p3: 'Player 3',
			p4: 'Player 4',
		};
		const score = {
			round1: [5, 10],
			round2: [3, 5],
			round3: [1, 2],
		};

		const winner = {
			round1: "Player 2",
			round2: "Player 4",
			round3: "Player 2",
		};

		const view = /*html*/ `
		<div class="h-100 d-flex flex-column">
			<h1 class="pt-5 text-center display-1">${langPack.gameTitle}</h1>
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
								<button class="btn btn-primary" id=start-game> ${langPack.newGame}</button>
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
							<h5 class= "modal-title w-100 text-center" > ${langPack.gameOver} </h5>
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
							<button type="button" class="btn btn-primary" data-bs-dismiss="modal" id="back-to-home" >${langPack.backToHome}</button>
							<button type="button" class="btn btn-success" data-bs-dismiss="modal" id="Modal-New-Game" >${langPack.newGame}</button>
						</div>
					</div>
				</div>
			</div>
			<div class="modal fade" id="modalTournamentBracket" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">Tournament Bracket</h5>
						</div>
						<div class="modal-body">
							<div class="tournament-bracket">
								<div class="bg-info round round-1">
									<h6>Round 1</h6>
									<div class="match">
										<div>${tournament.p1} (${score.round1[0]})</div>
										<div>vs</div>
										<div>${tournament.p2} (${score.round1[1]})</div>
										<strong>Winner: ${winner.round1}</strong>
									</div>
									<div class="match">
										<div>${tournament.p3} (${score.round2[0]})</div>
										<div>vs</div>
										<div>${tournament.p4} (${score.round2[1]})</div>
										<strong>Winner: ${winner.round2}</strong>
									</div>
								</div>
								<div class="round round-2">
									<h6>Final</h6>
									<div class="match">
										<div>${winner.round1}</div>
										<div>vs</div>
										<div>${winner.round2}</div>
										<i class="fa-solid fa-trophy"> </i>
										<span>Winner of the Tournament </span>
										<strong> ${winner.round3}</strong>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
			`;

		this.element.innerHTML = /*html*/ `
		<button class="btn btn-primary" type="button" id="start-game">
			<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
			<span role="status">${langPack.pleaseWait}</span>
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
			'joining_author': state.currentGameData['joining_author'],
			'tournament_id': state.currentGameData['tournament_id'],
			'opponent_nickname': state.currentGameData['opponent_nickname'],
			'author_nickname': state.currentGameData['author_nickname'],
			'match_key': state.currentGameData['match_key'],
		});
	}

	startGame(obj_) {

		let toasts = document.querySelectorAll('.tournament-toast');
		for (let toast of toasts) {
			try {
				document.body.removeChild(toast);
			} catch (error) {
				//console.log()
			}
		}

		window.startGame = this.startGame;
		const langPack = game[store.state.language];

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
			stopperTime: true,
			startTime: Date.now(),
			endTime: 0,
			lookTime: 0,
			myModal: new bootstrap.Modal(document.getElementById('exampleModal'), { keyboard: true }),
			bigpad: null,
		};

		let pressedKeys = new Set();
		const listenedToKeys = [87, 83, 38, 40];

		if (window.gameState.author_username === window.gameState.currentUsername) {
			document.getElementById('left_player').innerText = langPack.you;
			document.getElementById('right_player').innerText = obj_.opponent_username;
			if (obj_.opponent_nickname) {
				document.getElementById('right_player').innerText = obj_.opponent_nickname;
			}
		} else {
			document.getElementById('left_player').innerText = obj_.author_username;
			if (obj_.author_nickname) {
				document.getElementById('left_player').innerText = obj_.author_nickname;
			}
			document.getElementById('right_player').innerText = langPack.you;
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
				this.aipos_cal = 0;
				this.size = config.paddleHeight;
				this.speed = config.paddleSpeed;
				this.id = alphanum(5);
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
		//const myModale = new bootstrap.Modal(document.getElementById('modalTournamentBracket'), { keyboard: true });
		//console.log('Modal', myModale);

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
			else if (window.gameState && window.gameState.started == true) {
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
			}

			//checkWallCollisions();
			//checkPaddleCollisions();
			//moveBall();
			/*if (obj.ai) {
				MovePaddleAI();
			}*/
			//checkWin();
			//myModale.show();
			updateTimer();
			window.requestAnimationFrame(animate);
		}

		animate();

		canvas.style.backgroundColor = '#EBEBED';
		//myModale.dispose();
		//resetBall();

	}
}

export { BiggerPad, Paddle, updateFromSocket };
