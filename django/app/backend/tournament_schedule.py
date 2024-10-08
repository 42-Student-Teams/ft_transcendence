from schedule import Scheduler
import threading
import time
import multiprocessing


from app.settings import logger

_scheduler_started = False

def process_tournaments():
    logger.debug(f"Processing tournaments [{multiprocessing.current_process().name}] [{threading.current_thread()}]...")
    from backend.models import Tournament

    tournaments = Tournament.objects.all()
    for tournament in tournaments:
        if tournament.op_lock:
            logger.debug(f'Tournament {tournaments.id} locked, skipping')
            continue
        logger.debug(f'Processing tournament {tournament.id}')
        tournament.pair_and_notify()





def run_continuously(self, interval=15):
    cease_continuous_run = threading.Event()

    class ScheduleThread(threading.Thread):

        @classmethod
        def run(cls):
            while not cease_continuous_run.is_set():
                self.run_pending()
                time.sleep(interval)

    continuous_thread = ScheduleThread()
    continuous_thread.setDaemon(True)
    continuous_thread.start()
    return cease_continuous_run

Scheduler.run_continuously = run_continuously

def start_scheduler():
    global _scheduler_started
    if _scheduler_started:
        return
    _scheduler_started = True
    scheduler = Scheduler()

    scheduler.every().second.do(process_tournaments)
    scheduler.run_continuously()
