# Generated by Django 5.0 on 2024-08-05 11:07

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_jwtuser_avatar_jwtuser_blocked_users_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='jwtuser',
            name='status',
            field=models.CharField(default='Offline', max_length=20),
        ),
        migrations.CreateModel(
            name='MatchRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ball_color', models.CharField(max_length=50)),
                ('created_at', models.FloatField()),
                ('request_author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='author', to='backend.user')),
                ('target_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='target', to='backend.user')),
            ],
        ),
    ]
