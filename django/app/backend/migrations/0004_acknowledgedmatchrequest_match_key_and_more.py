# Generated by Django 5.0 on 2024-08-08 13:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0003_acknowledgedmatchrequest_matchrequest'),
    ]

    operations = [
        migrations.AddField(
            model_name='acknowledgedmatchrequest',
            name='match_key',
            field=models.CharField(null=True),
        ),
        migrations.AddField(
            model_name='matchrequest',
            name='match_key',
            field=models.CharField(null=True),
        ),
        migrations.DeleteModel(
            name='User',
        ),
    ]
