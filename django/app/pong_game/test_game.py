# keylogger using pynput module

import pynput, time, random, math
import threading
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

	def run_listener(self):
		with Listener(on_press=self.on_press, on_release=self.on_release) as listener:
			listener.join()

	def ball_loop(self):
		print(self.ball.dir)
		while self.run :
			# if self.board.width/2 - abs(self.ball.pos[0]) > self.ball.speed * abs(math.cos(self.ball.dir)):
			self.ball.pos[0] += self.ball.speed * math.cos(self.ball.dir)
			# else:
				# self.ball.pos[0] += self.ball.speed * math.cos(self.ball.dir)  (self.board.width/2 - abs(self.ball.pos[0]))

			# if self.board.height/2 - abs(self.ball.pos[0]) > self.ball.speed * math.cos(self.ball.dir):
			# 	self.ball.pos[0] += self.ball.speed * math.cos(self.ball.dir)
			# else:
			# 	self.ball.pos[0] += self.ball.speed * math.cos(self.ball.dir) - (self.board.height/2 - abs(self.ball.pos[0]))
			self.ball.pos[1] += self.ball.speed * math.sin(self.ball.dir)
			print(self.ball.pos[0], self.ball.pos[1])
			# time.sleep(1)
			if abs(self.ball.pos[1]) >= self.board.height/2:
				self.ball.dir -= 2 * self.ball.dir
			if abs(self.ball.pos[1] - self.player_r.pos) > self.player_r.size and self.ball.pos[0] >= self.board.length/2:
				self.winner = 1
				print('Second while loop is running...')
				self.run = False
			elif abs(self.ball.pos[1] - self.player_l.pos) > self.player_l.size and self.ball.pos[0] <= -self.board.length/2:
				self.winner = 2
				self.run = False


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
		

class Match:
	def __init__(self, win):
		self.keys = []
		self.win = win
		self.left = 0
		self.right = 0
		self.board = Board()

# Create an instance of KeyLogger
new_match= Match(win=3)
new_game = Game(board = new_match.board)

listener_thread = threading.Thread(target=new_game.run_listener)
ball_thread = threading.Thread(target=new_game.ball_loop)

listener_thread.start()
ball_thread.start()

# Wait for the listener thread to finish
listener_thread.join()

# Ensure ball_thread ends if the listener ends early
new_game.run = False
ball_thread.join()

print('winner : {0}'.format(new_game.winner))
if new_game.winner == 1:
	new_match.left += 1
elif new_game.winner == 2:
	new_match.right += 1

print('match_win : {0}'.format(new_match.win))
print('new_match.left : {0}'.format(new_match.left))
print('new_match.right : {0}'.format(new_match.right))

print('----')