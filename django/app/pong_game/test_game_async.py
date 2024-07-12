# keylogger using pynput module

import pynput, time, random, math
import threading
import asyncio
from pynput.keyboard import Key, Listener

class Ball:
	def __init__(self):
		self.speed = 1 #speed magnitude
		self.times = 1 #they move x times magnitude size in one second
		self.dir = random.uniform(-math.pi/2, math.pi/2) + random.choice([0, 1]) * math.pi
		self.pos = [0, 0]
		
class Player:
	def __init__(self):
		self.size = 0 #tbd
		self.speed = 1 #tbd
		self.pos = 0 #tbd
		
class Board:
	def __init__(self):
		self.length = 100 #tbd
		self.height = 100 #tbd

class Game:
	def __init__(self, board):
		self.ball = Ball()
		self.player_l = Player()
		self.player_r = Player()
		self.board = board
		self.winner = 0
		self.run = True

	async def ball_loop(self):
		print(self.ball.dir)
		while self.run:
			self.ball.pos[0] += self.ball.speed * math.cos(self.ball.dir)
			self.ball.pos[1] += self.ball.speed * math.sin(self.ball.dir)
			print(self.ball.pos[0], self.ball.pos[1])
			if abs(self.ball.pos[1]) >= self.board.height/2:
				self.ball.dir = -self.ball.dir
			if abs(self.ball.pos[1] - self.player_r.pos) > self.player_r.size and self.ball.pos[0] >= self.board.length/2:
				self.winner = 1
				self.run = False
			elif abs(self.ball.pos[1] - self.player_l.pos) > self.player_l.size and self.ball.pos[0] <= -self.board.length/2:
				self.winner = 2
				self.run = False
			await asyncio.sleep(1 / self.ball.times)


	def on_press(self, key):

		try:
			if format(key.char) == '1':
				print('alphanumeric key {0} pressed'.format(key.char))
				self.winner = 1
			elif format(key.char) == '2':
				print('alphanumeric key {0} pressed'.format(key.char))
				self.winner = 2
			else:
				self.run = False
				return False
		except AttributeError:
				print('special key {0} pressed'.format(key))

	def on_release(self, key):
		if key == Key.esc:
				return False
		
	async def key_input(self):
		loop = asyncio.get_event_loop()
		with Listener(on_press=self.on_press, on_release=self.on_release) as listener:
			await loop.run_in_executor(None, listener.join)

		# with Listener(on_press = self.on_press,
		# 			on_release = self.on_release) as listener:
							
		# 	listener.join()

class Match:
	def __init__(self, win):
		self.keys = []
		self.win = win
		self.left = 0
		self.right = 0
		self.board = Board()


async def start_game(match):
	new_game = Game(board = match.board)

	# with Listener(on_press = new_game.on_press,
	# 			on_release = new_game.on_release) as listener:
						
	# 	listener.join()
	task1 = asyncio.create_task(new_game.key_input())
	task2 = asyncio.create_task(new_game.ball_loop())

	await task1
	await task2
	print('winner : {0}'.format(new_game.winner))
	if new_game.winner == 1:
		match.left += 1
	elif new_game.winner == 2:
		match.right += 1

	print('match_win : {0}'.format(match.win))
	print('new_match.left : {0}'.format(match.left))
	print('new_match.right : {0}'.format(match.right))

	print('----')


new_match= Match(win=3)
asyncio.run(start_game(new_match))