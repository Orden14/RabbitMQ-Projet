# RabbitMQ-Projet

## Auteurs

- Thomas L. - 20230012
- David W. - 20230637
- Antoine H. - 20230367

## Concept

Ce projet est une démonstration de l'utilisation de RabbitMQ pour la gestion de tâches asynchrones. Il met en œuvre un système de calcul distribué où les tâches sont envoyées par un producteur et traitées par des workers. Le consumer récupère les résultats et les affiche.

## Installation du projet

1. Cloner le projet
```bash
git clone https://github.com/Orden14/RabbitMQ-Projet.git && cd RabbitMQ-Projet
```

2. Installer les dépendances
```bash
npm install
```

3. Pull et run RabbitMQ via Docker  
/!\ Si vous utilisez votre propre instance RabbitMQ, vous pouvez sauter cette étape et configurer les variables d'environnement dans le fichier `.env`
```bash
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
```

4. Lancer le projet  
Suivre le guide des commandes ci-dessous pour démarrer les différents composants du projet.

## Guide des commandes

Lancer le consumer et les 4 workers en même temps
```bash
npm run start:all
```

Lancer le consumer uniquement
```bash
npm run start:consumer
```

Lancer un worker spécifique (argument optionnel)
```bash
npm run start:worker [add/sub/mul/div]
```

Lancer le producer (argument optionnel)
```bash
npm run start:producer [add/sub/mul/div/all]
```
