# Generated by Django 5.0 on 2024-08-29 11:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_acknowledgedmatchrequest_gamehistory_gamesearchqueue_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jwtuser',
            name='first_name',
            field=models.CharField(max_length=20),
        ),
        migrations.AlterField(
            model_name='jwtuser',
            name='last_name',
            field=models.CharField(max_length=20),
        ),
        migrations.AlterField(
            model_name='jwtuser',
            name='username',
            field=models.CharField(max_length=20, unique=True),
        ),
    ]
