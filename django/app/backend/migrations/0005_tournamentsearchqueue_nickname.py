# Generated by Django 5.0 on 2024-08-27 12:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_tournament_all_participants_count_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentsearchqueue',
            name='nickname',
            field=models.CharField(default='none', max_length=255),
            preserve_default=False,
        ),
    ]
