# Generated by Django 5.0 on 2024-08-20 19:06

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_acknowledgedmatchrequest_match_key_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='GameSearchQueue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='search_queue', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
