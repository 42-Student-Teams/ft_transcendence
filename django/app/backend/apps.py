from django.apps import AppConfig
from django.db.utils import ProgrammingError, OperationalError

from backend.tournament_schedule import start_scheduler

class BackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend'

    def ready(self):
        from django.db import connection
        try:
            # Check if the tables exist before trying to delete
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM backend_matchrequest LIMIT 1;")
            print("Removing all rows from the match request table", flush=True)
            from backend.models import MatchRequest
            MatchRequest.objects.all().delete()

            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM backend_acknowledgedmatchrequest LIMIT 1;")
            print("Removing all rows from the match acknowledgement table", flush=True)
            from backend.models import AcknowledgedMatchRequest
            AcknowledgedMatchRequest.objects.all().delete()

            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM backend_gamesearchqueue LIMIT 1;")
            print("Removing all rows from the looking for game queue table", flush=True)
            from backend.models import GameSearchQueue
            GameSearchQueue.objects.all().delete()
        except (ProgrammingError, OperationalError):
            print("Skipping deletion since tables do not exist yet", flush=True)

        start_scheduler()


