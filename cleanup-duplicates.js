const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'views', 'tenant', 'ContractsView.vue');

// Lire le contenu du fichier
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Erreur lors de la lecture du fichier:', err);
    return;
  }

  // Supprimer les déclarations en double de formatPropertyStatus et getStatusBadgeClass
  let result = data;
  
  // Supprimer la première occurrence des fonctions (garder la deuxième)
  result = result.replace(
    /\/\/ Formater le statut de la propriété pour l'affichage\s+const formatPropertyStatus = \(status: string\): string => \{[\s\S]*?\};/g,
    ''
  );
  
  result = result.replace(
    /\/\/ Classe CSS pour les badges de statut\s+const getStatusBadgeClass = \(status: string\): string => \{[\s\S]*?\};/g,
    ''
  );
  
  // Supprimer les lignes vides en trop
  result = result.replace(/\n{3,}/g, '\n\n');

  // Écrire le résultat dans le fichier
  fs.writeFile(filePath, result, 'utf8', (err) => {
    if (err) {
      console.error('Erreur lors de l\'écriture du fichier:', err);
      return;
    }
    console.log('Le fichier a été nettoyé avec succès !');
  });
});
