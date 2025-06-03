# RabbitMQ-Projet

## Lancer le projet

1. Cloner le projet
```bash
git clone https://github.com/Orden14/RabbitMQ-Projet.git && cd RabbitMQ-Projet
```

2. Pull RabbitMQ via Docker
```bash
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
```
