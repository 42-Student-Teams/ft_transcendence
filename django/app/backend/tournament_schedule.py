from schedule import Scheduler
import threading
import time


def process_tournaments():
    print("Processing tournaments...", flush=True)


def run_continuously(self, interval=30):
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
    scheduler = Scheduler()

    scheduler.every().second.do(process_tournaments)
    scheduler.run_continuously()
