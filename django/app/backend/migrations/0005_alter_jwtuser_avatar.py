# Generated by Django 5.0 on 2024-08-14 08:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_alter_jwtuser_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jwtuser',
            name='avatar',
            field=models.ImageField(default='default_avatar.png', max_length=200, upload_to='avatars'),
        ),
    ]
