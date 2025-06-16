import { Sequelize } from 'sequelize';

// Define model types
type ModelType = {
  name: string;
  path: string;
  initialize: (sequelize: Sequelize) => any;
};

// List of models to initialize with their paths
const modelList: ModelType[] = [
  { name: 'Address', path: './Address', initialize: null },
  { name: 'Identity', path: './Identity', initialize: null },
  { name: 'User', path: './User', initialize: null },
  { name: 'Property', path: './Property', initialize: null },
  { name: 'PropertyImage', path: './PropertyImage', initialize: null },
  { name: 'Review', path: './Review', initialize: null },
  { name: 'Booking', path: './Booking', initialize: null },
  { name: 'Favorite', path: './Favorite', initialize: null },
];

// Initialize models
const initModels = async (sequelize: Sequelize) => {
  // First, import all models
  const imports = await Promise.all(
    modelList.map(async (modelDef) => {
      const module = await import(modelDef.path);
      return {
        ...modelDef,
        initialize: module.initialize
      };
    })
  );

  // Then initialize all models
  const models = imports.reduce((acc, modelDef) => {
    const model = modelDef.initialize(sequelize);
    return { ...acc, [modelDef.name]: model };
  }, {} as Record<string, any>);

  // Finally, set up associations
  Object.values(models).forEach(model => {
    if (typeof model.associate === 'function') {
      model.associate(models);
    }
  });

  return models;
};

export { initModels };

export type Models = Awaited<ReturnType<typeof initModels>>;
