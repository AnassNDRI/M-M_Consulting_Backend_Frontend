const express = require('express');
const path = require('path');

const app = express();

// Servir les fichiers statiques de l'application Angular depuis le dossier 'dist/your-app-name'
app.use(express.static(__dirname + '/dist/mm-consulting'));

// Rediriger toutes les requêtes vers le fichier index.html de l'application Angular
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/mm-consulting/index.html'));
});

// Démarrer l'application sur le port défini par Heroku ou sur le port 8080 en local
app.listen(process.env.PORT || 8080);
