import { Request, Response } from 'express';
import { db } from '../database';

export const createContract = async (req: Request, res: Response) => {
  const trx = await db.transaction();
  try {
    const { landlordId, tenantId, propertyId, startDate, endDate, rent, deposit, currency, duration, status, specialConditions } = req.body;

    console.log('--- Création de contrat ---');
    console.log('ID du propriétaire (landlordId):', landlordId);
    console.log('ID du locataire (tenantId):', tenantId);

    // Récupérer tous les utilisateurs selon leur userType
    console.log('\n=== UTILISATEURS PAR TYPE ===');
    
    // Utilisateurs de type 'landlord'
    const landlords = await trx('users')
      .select('id', 'first_name', 'last_name', 'email', 'user_type')
      .where('user_type', 'landlord');
    
    console.log('\n🔑 BAilleurs (user_type: landlord):');
    landlords.forEach(landlord => {
      console.log(`  - ID: ${landlord.id} | Nom: ${landlord.first_name} ${landlord.last_name} | Email: ${landlord.email}`);
    });

    // Utilisateurs de type 'tenant'
    const tenants = await trx('users')
      .select('id', 'first_name', 'last_name', 'email', 'user_type')
      .where('user_type', 'tenant');
    
    console.log('\n🏠 Locataires (user_type: tenant):');
    tenants.forEach(tenant => {
      console.log(`  - ID: ${tenant.id} | Nom: ${tenant.first_name} ${tenant.last_name} | Email: ${tenant.email}`);
    });

    // Utilisateurs de type 'agent'
    const agents = await trx('users')
      .select('id', 'first_name', 'last_name', 'email', 'user_type')
      .where('user_type', 'agent');
    
    console.log('\n👨‍💼 Agents (user_type: agent):');
    agents.forEach(agent => {
      console.log(`  - ID: ${agent.id} | Nom: ${agent.first_name} ${agent.last_name} | Email: ${agent.email}`);
    });

    // Utilisateurs de type 'admin'
    const admins = await trx('users')
      .select('id', 'first_name', 'last_name', 'email', 'user_type')
      .where('user_type', 'admin');
    
    console.log('\n👑 Administrateurs (user_type: admin):');
    admins.forEach(admin => {
      console.log(`  - ID: ${admin.id} | Nom: ${admin.first_name} ${admin.last_name} | Email: ${admin.email}`);
    });

    // Statistiques
    console.log('\n📊 STATISTIQUES:');
    console.log(`  - Total bailleurs: ${landlords.length}`);
    console.log(`  - Total locataires: ${tenants.length}`);
    console.log(`  - Total agents: ${agents.length}`);
    console.log(`  - Total administrateurs: ${admins.length}`);
    console.log(`  - Total utilisateurs: ${landlords.length + tenants.length + agents.length + admins.length}`);

    console.log('\n=== FIN DES UTILISATEURS ===\n');

    const [newContract] = await trx('contracts').insert({
      landlord_id: landlordId,
      tenant_id: tenantId,
      property_id: propertyId,
      start_date: startDate,
      end_date: endDate,
      rent,
      deposit,
      currency,
      duration,
      status,
      special_conditions: specialConditions
    }).returning('*');

    await trx.commit();

    res.status(201).json(newContract);

  } catch (error) {
    await trx.rollback();
    console.error('Erreur lors de la création du contrat:', error);
    res.status(500).json({ message: 'Erreur lors de la création du contrat' });
  }
};
