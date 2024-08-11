import asyncio
import random
import threading
import time

from asgiref.sync import async_to_sync, sync_to_async
from channels.layers import get_channel_layer

from backend.models import JwtUser, AcknowledgedMatchRequest


def sign(n):
    if n < 0:
        return -1
    elif n == 0:
        return 0
    else:
        return 1


class Paddle():
    def __init__(self, side, config):
        self.side = side
        self.y = config.canvasHeight / 2 - config.paddleHeight / 2
        self.x = 0 if side == 0 else config.canvasWidth - config.paddleWidth
        self.config = config

    def check_collision(self, ball):
        return (self.y <= (ball.y + ball.r)) and (self.y + self.config.paddleHeight >= (ball.y - ball.r))

    # Only for bot
    def move_down(self):
        self.y += self.config.paddleSpeed;
        if self.y + self.config.paddleHeight > self.config.canvasHeight:
            self.y = self.config.paddleHeight - self.config.paddleHeight

    # Only for bot
    def move_up(self):
        self.y -= self.config.paddleSpeed;
        if self.y < self.config.paddleSpeed:
            self.y = 0


class Config():
    def __init__(self):
        self.canvasWidth = 900
        self.canvasHeight = 500
        self.paddleWidth = 10
        self.paddleHeight = 80
        self.paddleSpeed = 8
        self.ballXSpeed = 3
        self.ballYSpeed = 3
        self.ballSlice = 4


class Ball():
    def __init__(self):
        self.x = 0
        self.y = 0
        self.dx = 0
        self.dy = 0
        self.r = 8

    def move(self):
        self.x += self.dx
        self.y += self.dy

    def check_wall_collision(self, config):
        if self.y - self.r <= 0 or self.y + self.r >= config.canvasHeight:
            self.dy *= -1

    def reverse_direction(self, paddle: Paddle, config: Config):
        self.dy *= -1
        self.x += sign(self.dx) * 8
        self.dy = (self.y - (paddle.y + (config.paddleHeight / 2))) / config.ballSlice

    def check_paddle_collisions(self, config: Config, paddle1: Paddle, paddle2: Paddle):
        if self.x - self.r <= config.paddleWidth:
            if paddle1.check_collision(self):
                self.reverse_direction(paddle1, config)
            if paddle2.check_collision(self):
                self.reverse_direction(paddle2, config)

    def check_win_paddle(self, paddle: Paddle, config: Config):
        if paddle.x == 0:
            return self.x + self.r <= 0
        else:
            return self.x - self.r >= config.canvasWidth


def move_paddle_ai(ball: Ball, paddle: Paddle):
    if ball.y < paddle.y and ball.dx < 0:
        paddle.move_up()
    if ball.y > paddle.y and ball.dx < 0:
        paddle.move_down()

class GameController():
    def __init__(self, acknowledgement: AcknowledgedMatchRequest):
        self.acknowledgement = acknowledgement
        self.channel_layer = get_channel_layer()
        self.controller_channel = f'controller_{acknowledgement.match_key}'
        self.event_queue = []
        self.queue_lock = threading.Lock()
        self.running = False
        self.game_thread = None
        self.countdown_elapsed = 0
        self.restart_timeout = False
        self.author_score = 0
        self.opponent_score = 0

        self.config = Config()

        self.author_paddle = Paddle(0, self.config);
        self.opponent_paddle = Paddle(1, self.config);
        self.ball = Ball()
        self.reset_ball()

    async def start(self):
        print('Start!', flush=True)
        self.running = True
        #self.game_thread = threading.Thread(target=self.game_loop)
        self.reset_ball()
        #self.game_thread.start()
        asyncio.create_task(self.game_loop())

    async def stop(self):
        self.running = False
        if self.game_thread:
            self.game_thread.join()

    async def game_loop(self):
        print(f'Initial ballpos: {self.ball.x}, {self.ball.y}', flush=True)
        while self.running:
            if self.restart_timeout:
                print('Restart timeout!', flush=True)
                self.restart_timeout = False
                time.sleep(1)
                self.start_ball()
                self.send_game_update({
                    "waiting_between_points": False
                })
                continue
            if self.countdown_elapsed < 3:
                self.send_game_update({
                    'countdown': 3 - self.countdown_elapsed
                })
                time.sleep(1)
                self.countdown_elapsed += 1
                if self.countdown_elapsed >= 3:
                    self.start_ball()
                continue

            timestamp = None
            # Process all events in the queue
            while self.event_queue:
                with self.queue_lock:
                    event = self.event_queue.pop(0)
                    #print(f'Processing event {event}', flush=True)
                    #TODO: check for bounds
                    if 'pad' in event and event['pad'] is not None:
                        timestamp = event['timestamp']
                        if event['username'] == self.acknowledgement.request_author.username:
                            move_delta = event['pad'] - self.author_paddle.y
                            if move_delta < 0:
                                move_delta = - self.config.paddleSpeed
                            else:
                                move_delta = self.config.paddleSpeed
                            self.author_paddle.y += move_delta
                        else:
                            if self.acknowledgement.target_user is not None:
                                move_delta = event['pad'] - self.opponent_paddle.y
                                if move_delta < 0:
                                    move_delta = - self.config.paddleSpeed
                                else:
                                    move_delta = self.config.paddleSpeed
                                self.opponent_paddle.y += move_delta

            self.ball.check_wall_collision(self.config)
            self.ball.check_paddle_collisions(self.config, self.author_paddle, self.opponent_paddle)
            self.ball.move()
            if self.ball.check_win_paddle(self.author_paddle, self.config):
                self.author_score += 1
                self.send_game_update({"author_points": self.author_score})
                print('author scored!')
                self.reset_ball(True)
                continue
            elif self.ball.check_win_paddle(self.opponent_paddle, self.config):
                self.opponent_score += 1
                self.send_game_update({"opponent_points": self.opponent_score})
                print('opponent scored!')
                print(f'ballpos: {self.ball.x}, {self.ball.y}', flush=True)
                self.reset_ball(True)
                continue

            if self.acknowledgement.is_bot:
                move_paddle_ai(self.ball, self.opponent_paddle)

            # Send game state update to clients
            update = {
                "author_paddle_pos": {'x': self.author_paddle.x, 'y': self.author_paddle.y},
                "opponent_paddle_pos": {'x': self.opponent_paddle.x, 'y': self.opponent_paddle.y},
                "ball_pos": {'x': self.ball.x, 'y': self.ball.y},
            }
            if timestamp is not None:
                update['timestamp'] = timestamp
            self.send_game_update(update)

            # Wait for the next frame (e.g., 60 FPS => 16.67ms per frame)
            #time.sleep(1 / 60)
            await asyncio.sleep(0.05)

    async def send_game_update(self, update):
        update['type'] = 'relay_from_controller'
        self.send_channel(self.controller_channel, 'relay_from_controller', update)

    async def send_channel(self, channel, msgtype, content):
        async_to_sync(self.channel_layer.group_send)(
            channel, {"type": msgtype, "msg_obj": content}
        )

    async def client_update_relay(self, msg_obj):
        #print("Client update received in controller:", flush=True)
        #print(msg_obj, flush=True)
        if 'opponent_joined' in msg_obj:
            pass
        else:
            with self.queue_lock:
                self.event_queue.append(msg_obj)

    # Ported funcs
    def start_ball(self):
        self.ball.dx = self.config.ballXSpeed * sign(random.random() - 0.5)
        self.ball.dy = self.config.ballYSpeed * sign(random.random() - 0.5)

    def reset_ball(self, do_timeout=False):
        self.ball.x = self.config.canvasWidth / 2
        self.ball.y = self.config.canvasHeight / 2
        self.ball.dx = 0
        self.ball.dy = 0
        self.send_game_update({
            "waiting_between_points": True
        })
        print('Setting restart_timeout to True')
        self.restart_timeout = True
