const bcrypt = require('bcryptjs');
const knex = require('knex')(require('./knexfile').development);

const email = 'terencemusimbi11@gmail.com';
const newPassword = 'NouveauMotDePasse123!';

(async () => {
  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const updated = await knex('users')
      .where('email', email)
      .update({
        password: hashedPassword,
        updated_at: new Date()
      });
    
    if (updated) {
      console.log('Mot de passe mis a jour avec succes');
      console.log('Nouveau mot de passe: ' + newPassword);
    } else {
      console.log('Utilisateur non trouve');
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await knex.destroy();
  }
})();
