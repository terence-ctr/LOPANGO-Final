const { Sequelize } = require('sequelize');
const path = require('path');

async function checkTables() {
  try {
    // Créer une connexion directe à SQLite
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './data/database.sqlite',
      logging: console.log
    });

    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    // Vérifier si la table SequelizeMeta existe
    const [tables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    console.log('\n📋 Tables dans la base de données:');
    console.table(tables);

    // Si la table SequelizeMeta n'existe pas, la créer
    if (!tables.some(t => t.name === 'SequelizeMeta')) {
      console.log('\n⏳ Création de la table SequelizeMeta...');
      await sequelize.getQueryInterface().createTable('SequelizeMeta', {
        name: {
          type: 'VARCHAR(255)',
          allowNull: false,
          primaryKey: true
        }
      });
      console.log('✅ Table SequelizeMeta créée avec succès.');
    }

    // Vérifier si la table users existe
    const [usersTable] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    );

    if (usersTable.length === 0) {
      console.log('\n❌ La table users n\'existe pas. Exécution des migrations...');
      const { execSync } = require('child_process');
      execSync('npx sequelize-cli db:migrate --config ./server/config/database.js', { stdio: 'inherit' });
      console.log('✅ Migrations exécutées avec succès.');
    } else {
      console.log('\n✅ La table users existe déjà.');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des tables:');
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkTables().catch(console.error);
