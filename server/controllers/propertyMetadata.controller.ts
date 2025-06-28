import { Request, Response } from 'express';
import { PropertyMetadata } from '../models/PropertyMetadata';

export const PropertyMetadataController = {
  // Récupérer toutes les métadonnées
  async getAllMetadata(req: Request, res: Response) {
    try {
            console.log('Fetching all metadata...');
      const [types, statuses, equipments, currencies] = await Promise.all([
        PropertyMetadata.getPropertyTypes(),
        PropertyMetadata.getPropertyStatuses(),
        PropertyMetadata.getPropertyEquipments(),
        PropertyMetadata.getCurrencies()
      ]);

            // Log all metadata IDs
      console.log('All metadata IDs:', {
        types: types.map(t => t.id),
        statuses: statuses.map(s => s.id),
        equipments: equipments.map(e => e.id),
        currencies: currencies.map(c => c.id)
      });

      res.json({ types, statuses, equipments, currencies });
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },
  // Récupérer tous les types de propriétés
  async getPropertyTypes(req: Request, res: Response) {
    try {
      const types = await PropertyMetadata.getPropertyTypes();
      res.json(types);
    } catch (error) {
      console.error('Erreur lors de la récupération des types de propriétés:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },
  
  // Récupérer un type de propriété par sa valeur
  async getPropertyTypeByValue(req: Request, res: Response) {
    try {
      const { value } = req.params;
      const types = await PropertyMetadata.getPropertyTypes();
      const type = types.find(t => t.value === value);
      
      if (!type) {
        return res.status(404).json({ message: 'Type de propriété non trouvé' });
      }
      
      res.json(type);
    } catch (error) {
      console.error('Erreur lors de la récupération du type de propriété:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Récupérer tous les statuts de propriétés
  async getPropertyStatuses(req: Request, res: Response) {
    try {
      const statuses = await PropertyMetadata.getPropertyStatuses();
      res.json(statuses);
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts de propriétés:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },
  
  // Récupérer un statut de propriété par sa valeur
  async getPropertyStatusByValue(req: Request, res: Response) {
    try {
      const { value } = req.params;
      const statuses = await PropertyMetadata.getPropertyStatuses();
      const status = statuses.find(s => s.value === value);
      
      if (!status) {
        return res.status(404).json({ message: 'Statut de propriété non trouvé' });
      }
      
      res.json(status);
    } catch (error) {
      console.error('Erreur lors de la récupération du statut de propriété:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Récupérer tous les équipements
  async getPropertyEquipments(req: Request, res: Response) {
    try {
      const equipments = await PropertyMetadata.getPropertyEquipments();
      res.json(equipments);
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },
  
  // Récupérer un équipement par sa valeur
  async getPropertyEquipmentByValue(req: Request, res: Response) {
    try {
      const { value } = req.params;
      const equipments = await PropertyMetadata.getPropertyEquipments();
      const equipment = equipments.find(e => e.value === value);
      
      if (!equipment) {
        return res.status(404).json({ message: 'Équipement non trouvé' });
      }
      
      res.json(equipment);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'équipement:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Récupérer toutes les devises
  async getCurrencies(req: Request, res: Response) {
    try {
      const currencies = await PropertyMetadata.getCurrencies();
      res.json(currencies);
    } catch (error) {
      console.error('Erreur lors de la récupération des devises:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Vérifier si un type de propriété existe
  async checkPropertyTypeExists(req: Request, res: Response) {
    try {
      const { value } = req.params;
      const exists = await PropertyMetadata.propertyTypeExists(value);
      res.json({ exists });
    } catch (error) {
      console.error('Erreur lors de la vérification du type de propriété:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Vérifier si un statut de propriété existe
  async checkPropertyStatusExists(req: Request, res: Response) {
    try {
      const { value } = req.params;
      const exists = await PropertyMetadata.propertyStatusExists(value);
      res.json({ exists });
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de propriété:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Vérifier si un équipement existe
  async checkPropertyEquipmentExists(req: Request, res: Response) {
    try {
      const { value } = req.params;
      const exists = await PropertyMetadata.propertyEquipmentExists(value);
      res.json({ exists });
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'équipement:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Vérifier si une devise existe
  async checkCurrencyExists(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const exists = await PropertyMetadata.currencyExists(code);
      res.json({ exists });
    } catch (error) {
      console.error('Erreur lors de la vérification de la devise:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

export default PropertyMetadataController;
