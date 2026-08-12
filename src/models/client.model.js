module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define(
    'Client',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      company_name: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: 'clients',
      createdAt: 'created_at',
      updatedAt: false,
      paranoid: true,
      deletedAt: 'deleted_at',
    },
  );

  Client.associate = (models) => {
    Client.hasMany(models.Storefront, { foreignKey: 'client_id' });
    Client.hasMany(models.MarketplaceAccount, { foreignKey: 'client_id' });
    Client.hasMany(models.Campaign, { foreignKey: 'client_id' });
    Client.hasMany(models.Task, { foreignKey: 'client_id' });
    Client.hasMany(models.ClientAssignment, { foreignKey: 'client_id' });
    Client.hasOne(models.User, { foreignKey: 'client_id' });
  };

  return Client;
};
