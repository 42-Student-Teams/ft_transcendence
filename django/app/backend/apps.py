import os

from django.apps import AppConfig
from django.db.utils import ProgrammingError, OperationalError

from backend.tournament_schedule import start_scheduler

from app.settings import logger

class BackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend'

    def ready(self):
        if os.environ.get('RUN_MAIN', None) != 'true':
            return
        from django.db import connection
        try:
            # Check if the tables exist before trying to delete
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM backend_matchrequest LIMIT 1;")
            logger.debug("Removing all rows from the match request table")
            from backend.models import MatchRequest
            MatchRequest.objects.all().delete()

            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM backend_acknowledgedmatchrequest LIMIT 1;")
            logger.debug("Removing all rows from the match acknowledgement table")
            from backend.models import AcknowledgedMatchRequest
            AcknowledgedMatchRequest.objects.all().delete()

            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM backend_gamesearchqueue LIMIT 1;")
            logger.debug("Removing all rows from the looking for game queue table")
            from backend.models import GameSearchQueue
            GameSearchQueue.objects.all().delete()

            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM backend_gamesearchqueue LIMIT 1;")
            logger.debug("Removing all rows from the looking for tournament queue table")
            from backend.models import TournamentSearchQueue
            TournamentSearchQueue.objects.all().delete()

            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM backend_tournament LIMIT 1;")
            logger.debug("Removing all rows from the tournament table")
            from backend.models import Tournament
            Tournament.objects.all().delete()

            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM backend_tournament LIMIT 1;")
            logger.debug("Removing all rows from the tournament pvp queue table")
            from backend.models import TournamentPvPQueue
            TournamentPvPQueue.objects.all().delete()
        except (ProgrammingError, OperationalError):
            logger.debug("Skipping deletion since tables do not exist yet")

        start_scheduler()


