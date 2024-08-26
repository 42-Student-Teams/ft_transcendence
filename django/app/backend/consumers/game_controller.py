import asyncio
from datetime import datetime
import random

from channels.layers import get_channel_layer

from backend.models import AcknowledgedMatchRequest


#import inspect

def sign(n):
    if n < 0:
        return -1
    elif n == 0:
        return 0
    else:
        return 1


class Paddle():
    def __init__(self, side, config):
        self.aipos_cal = 0
        self.size = config.paddleHeight
        self.speed = config.paddleSpeed
        self.side = side
        self.y = config.canvasHeight / 2 - config.paddleHeight / 2
        self.x = 0 if side == 0 else config.canvasWidth - config.paddleWidth
        self.config = config
        self.looktime = datetime.min

    def check_collision(self, ball):
        return (self.y <= (ball.y + ball.r)) and (self.y + self.size >= (ball.y - ball.r))

    # Only for bot
    def move_down(self):
        self.y += self.speed
        if self.y + self.size > self.config.canvasHeight:
            self.y = self.config.canvasHeight - self.size

    # Only for bot
    def move_up(self):
        self.y -= self.speed
        if self.y < 0:
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
        self.ballRadius = 8


class Ball():
    def __init__(self, config: Config):
        self.x = 0
        self.y = 0
        self.dx = 0
        self.dy = 0
        self.r = config.ballRadius

    def move(self):
        self.x += self.dx
        self.y += self.dy

    def check_wall_collision(self, config):
        if self.y - self.r <= 0 or self.y + self.r >= config.canvasHeight:
            self.dy *= -1

    def reverse_direction(self, paddle: Paddle, config: Config):
        self.dx *= -1
        self.x += sign(self.dx) * 8
        self.dy = (self.y - (paddle.y + (config.paddleHeight / 2))) / config.ballSlice

    def check_paddle_collisions(self, config: Config, paddle1: Paddle, paddle2: Paddle):
        if self.x - self.r <= config.paddleWidth:
            if paddle1.check_collision(self):
                print('COLLISION 1!!!!', flush=True)
                self.reverse_direction(paddle1, config)
        if self.x + self.r >= config.canvasWidth:
            if paddle2.check_collision(self):
                print(f'COLLISION 2! paddle2.x {paddle2.x}, y: {paddle2.y}, ball.x: {self.x}, y: {self.y}', flush=True)
                self.reverse_direction(paddle2, config)

    def check_win_paddle(self, paddle: Paddle, config: Config):
        if paddle.x == 0:
            return self.x + self.r <= 0
        else:
            return self.x - self.r >= config.canvasWidth


def move_paddle_ai(ball: Ball, paddle: Paddle, config: Config):
    '''if ball.y < paddle.y and ball.dx > 0:
        paddle.move_up()
    if ball.y > paddle.y and ball.dx > 0:
        paddle.move_down()'''
    if (ball.dx < 0 and ((datetime.now() - paddle.looktime).total_seconds() > 1) or
            (ball.x - ball.r <= config.paddleWidth and paddle.check_collision(ball))):
        b = ((ball.x - config.paddleWidth - ball.r) * abs(ball.dy / ball.dx))
        paddle.looktime = datetime.now()
        mod_ = ball.y + sign(ball.dy) * b
        mod_ = mod_ % (2 * (config.canvasHeight - 2 * ball.r))
        while mod_ > config.canvasHeight - ball.r or mod_ < ball.r:
            if mod_ > config.canvasHeight - ball.r:
                mod_ = 2 * (config.canvasHeight - ball.r) - mod_
            else:
                mod_ = ball.r + abs(mod_ - ball.r)
        paddle.aipos_cal = mod_ - paddle.size / 2
    if paddle.aipos_cal - paddle.y <= -paddle.speed and ball.dx < 0:
        paddle.move_up()
    if paddle.aipos_cal - paddle.y >= paddle.speed and ball.dx < 0:
        paddle.move_down()


class BiggerPad():
    def __init__(self, config: Config):
        self.r = random.uniform(0, 1)
        self.time_ap = 0
        self.time_disp = datetime.now()
        self.happened = False
        self.effect = False
        self.x = random.uniform(200, config.canvasWidth - 200)
        self.y = random.uniform(200, config.canvasHeight - 200)
        print(f'SET coords to x: {self.x}, y: {self.y}')
        self.size = 50
        self.effect_time = 8
        self.app_time = 20 // 14
        self.off_time = 10
        self.color = self.choosecolor()
        self.config = config
        self.happening_chance = 0.8 # default: 0.1

    def reset(self):
        self.time_disp = datetime.now()
        self.happened = False
        self.x = random.uniform(200, self.config.canvasWidth - 200)
        self.y = random.uniform(200, self.config.canvasHeight - 200)
        print(f'SET coords to x: {self.x}, y: {self.y}')

    @staticmethod
    def choosecolor():
        return random.choice(['#ffc107', '#198754', '#0d6efd'])

    def ft_effect(self, ball, paddle1, paddle2):
        #console.log("-----", this.color);
        if self.color == "#ffc107":
            print('BIG making paddle bigger', flush=True)
            if ball.dx > 0:
                paddle1.size = paddle1.size + 30
            else:
                paddle2.size = paddle2.size + 30
        elif self.color == "#198754":
            print('BIG making ball bigger', flush=True)
            ball.r = 2 * ball.r
        else:
            print('BIG Inverting ball', flush=True)
            ball.dx = 2 * ball.dx

    def stop(self, ball: Ball, paddle1: Paddle, paddle2: Paddle, config: Config):
        if self.color == "#ffc107":
            paddle1.size = config.paddleHeight
            paddle2.size = config.paddleHeight
        elif self.color == "#198754":
            ball.r = config.ballRadius
        else:
            ball.dx = ball.dx / 2

    @staticmethod
    def rects_overlap(l1, r1, l2, r2):
        if l1[0] > r2[0] or l2[0] > r1[0]:
            return False
        if r1[1] > l2[1] or r2[1] > l1[1]:
            return False
        return True

    def checkbig(self, ball: Ball, paddle1: Paddle, paddle2: Paddle, config: Config):
        r = random.uniform(0, 1)
        if r < self.happening_chance and not self.happened and (datetime.now() - self.time_disp).total_seconds() > self.off_time:
            self.time_ap = datetime.now()
            self.happened = True
            print('BIG HAPPENED!!!!!!!!!!!!!!!!!!!!!!', flush=True)
        if self.happened:
            # https://www.geeksforgeeks.org/find-two-rectangles-overlap/
            # Careful! (0;0) is in bottom left here!
            l1 = [ball.x - ball.r, config.canvasHeight - ball.y + ball.r]
            r1 = [ball.x + ball.r, config.canvasHeight - ball.y - ball.r]
            l2 = [self.x, config.canvasHeight - self.y]
            r2 = [self.x + self.size, config.canvasHeight - self.y - self.size]
            if self.rects_overlap(l1, r1, l2, r2):
                print('BIG BALL COLLISION!!!!!!!!!!!!!!!!!!!!!!', flush=True)
                self.ft_effect(ball, paddle1, paddle2)
                self.happened = False
                self.effect = True
                self.reset()
        if (datetime.now() - self.time_disp).total_seconds() > self.effect_time and self.effect:
            self.stop(ball, paddle1, paddle2, config)
            self.color = self.choosecolor()
            self.effect = False


class GameController():
    def __init__(self, acknowledgement: AcknowledgedMatchRequest):
        print(f'%%%%%%%%%%%%%%%%%%%%%%%%%\nINITTING CONTROLLER ID [{id(self)}]!\n%%%%%%%%%%%%%%%%%%%%%%%%%%\n', flush=True)
        self.acknowledgement = acknowledgement
        self.channel_layer = get_channel_layer()
        self.controller_channel = f'controller_{acknowledgement.match_key}'
        self.event_queue = []
        self.queue_lock = asyncio.Lock()
        self.running = False
        self.game_thread = None
        self.countdown_elapsed = 0
        self.restart_timeout = False
        self.author_score = 0
        self.opponent_score = 0

        self.config = Config()

        # The author of a match is always on the left, his opponent on the right
        self.author_paddle = Paddle(0, self.config)
        self.opponent_paddle = Paddle(1, self.config)
        self.ball = Ball(self.config)
        self.reset_ball()
        self.bigpad = BiggerPad(self.config)

    async def start(self):
        print('Start!', flush=True)
        self.running = True
        #self.game_thread = threading.Thread(target=self.game_loop)
        self.reset_ball()
        #self.game_thread.start()

        # This seems to be blocking
        #await asyncio.create_task(self.game_loop())
        asyncio.create_task(self.game_loop())

    async def stop(self):
        print("Stop!", flush=True)
        self.running = False
        if self.game_thread:
            self.game_thread.join()

    async def game_loop(self):
        print(f'Initial ballpos: {self.ball.x}, {self.ball.y}', flush=True)
        while self.running:
            if self.restart_timeout:
                print('Restart timeout!', flush=True)
                self.restart_timeout = False
                await asyncio.sleep(1)
                self.start_ball()
                await self.send_game_update({
                    "waiting_between_points": False
                })
                continue
            if self.countdown_elapsed <= 3:
                await self.send_game_update({
                    'countdown': 3 - self.countdown_elapsed
                })
                await asyncio.sleep(1)
                self.countdown_elapsed += 1
                if self.countdown_elapsed > 3:
                    self.start_ball()
                continue

            author_timestamp = None
            opponent_timestamp = None
            event = None
            # Process all events in the queue
            async with self.queue_lock:
                while self.event_queue:
                    event = self.event_queue.pop(0)
                    # TODO: check for bounds
                    if 'pad' in event and event['pad'] is not None:
                        if event['username'] == self.acknowledgement.request_author.username:
                            author_timestamp = event['timestamp']
                            move_delta = event['pad'] - self.author_paddle.y
                            if move_delta < 0:
                                move_delta = - self.author_paddle.speed
                            else:
                                move_delta = self.author_paddle.speed
                            self.author_paddle.y += move_delta
                        else:
                            opponent_timestamp = event['timestamp']
                            if self.acknowledgement.target_user is not None:
                                move_delta = event['pad'] - self.opponent_paddle.y
                                if move_delta < 0:
                                    move_delta = - self.opponent_paddle.speed
                                else:
                                    move_delta = self.opponent_paddle.speed
                                self.opponent_paddle.y += move_delta

            self.ball.check_wall_collision(self.config)
            self.ball.check_paddle_collisions(self.config, self.author_paddle, self.opponent_paddle)
            self.ball.move()
            if self.ball.check_win_paddle(self.author_paddle, self.config):
                self.author_score += 1
                await self.send_game_update({"opponent_points": self.author_score})
                print('author scored!')
                self.reset_ball(True)
                continue
            elif self.ball.check_win_paddle(self.opponent_paddle, self.config):
                self.opponent_score += 1
                await self.send_game_update({"author_points": self.opponent_score})
                print('opponent scored!')
                self.reset_ball(True)
                continue

            if self.acknowledgement.is_bot:
                move_paddle_ai(self.ball, self.opponent_paddle, self.config)

            self.bigpad.checkbig(self.ball, self.author_paddle, self.opponent_paddle, self.config)

            # Send game state update to clients
            update = {
                "author_paddle_pos": {
                    'x': self.author_paddle.x,
                    'y': self.author_paddle.y,
                    'size': self.author_paddle.size
                },
                "opponent_paddle_pos": {
                    'x': self.opponent_paddle.x,
                    'y': self.opponent_paddle.y,
                    'size': self.opponent_paddle.size
                },
                "ball_pos": {
                    'x': self.ball.x,
                    'y': self.ball.y,
                    'r': self.ball.r
                },
                "bigpad": {
                    'x': self.bigpad.x,
                    'y': self.bigpad.y,
                    'active': self.bigpad.happened,
                    'color': self.bigpad.color
                },
            }
            if author_timestamp is not None:
                update['author_timestamp'] = author_timestamp
                update['paddle_moved'] = True
            else:
                update['author_timestamp'] = 1

            if opponent_timestamp is not None:
                update['opponent_timestamp'] = opponent_timestamp
                update['paddle_moved'] = True
            else:
                update['opponent_timestamp'] = 1
            await self.send_game_update(update)

            if self.author_score == 3 or self.opponent_score == 3:
                pass
                # TODO someone won, we should probs close, the client has all the info to figure out stuff itself

            # Wait for the next frame (e.g., 60 FPS => 16.67ms per frame)
            #time.sleep(1 / 60)
            # await asyncio.sleep(0.05)
            await asyncio.sleep(0.017)

    async def send_game_update(self, update):
        update['type'] = 'relay_from_controller'
        update['controller_id'] = id(self)
        await self.send_channel(self.controller_channel, 'relay_from_controller', update)

    async def send_channel(self, channel, msgtype, content):
        await self.channel_layer.group_send(
            channel, {"type": msgtype, "msg_obj": content}
        )

    async def client_update_relay(self, msg_obj):
        if 'opponent_joined' in msg_obj:
            pass
        else:
            async with self.queue_lock:
                #print(f'CONTROLLER GOT EVENT: {msg_obj} ({inspect.stack()[1][3]})')
                print(f'CONTROLLER [{id(self)}] GOT EVENT: {msg_obj}')
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
