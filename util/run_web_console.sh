#!/usr/bin/sh

# Provides interactive shell to the django container

name=$(sudo docker ps | grep ft_transcendence-web | awk '{print $1}')
sudo docker exec -it $name ash
