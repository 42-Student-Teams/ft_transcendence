# Generated by Django 5.0 on 2024-08-26 23:57

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_acknowledgedmatchrequest_gamehistory_gamesearchqueue_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='acknowledgedmatchrequest',
            name='author_nickname',
            field=models.CharField(null=True),
        ),
        migrations.AddField(
            model_name='acknowledgedmatchrequest',
            name='opponent_nickname',
            field=models.CharField(null=True),
        ),
        migrations.AddField(
            model_name='acknowledgedmatchrequest',
            name='tournament_id',
            field=models.IntegerField(null=True),
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('op_lock', models.BooleanField(default=False)),
                ('name', models.CharField(max_length=255)),
                ('ball_color', models.CharField(max_length=50)),
                ('fast', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('waitlist', models.JSONField(blank=True, default=list)),
                ('active_participants_count', models.IntegerField(default=0)),
                ('initiated_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournaments_initiated', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]