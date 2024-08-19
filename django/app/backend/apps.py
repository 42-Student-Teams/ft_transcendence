from django.apps import AppConfig


class BackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend'

    def ready(self):
        from backend.models import MatchRequest, AcknowledgedMatchRequest
        print("Removing all rows from the match request table", flush=True)
        MatchRequest.objects.all().delete()
        print("Removing all rows from the match acknowledgement table", flush=True)
        AcknowledgedMatchRequest.objects.all().delete()
