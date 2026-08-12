module.exports = (sequelize, DataTypes) => {
  const MarketplaceAccount = sequelize.define(
    'MarketplaceAccount',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      client_id: { type: DataTypes.INTEGER, allowNull: false },
      platform: {
        type: DataTypes.ENUM('amazon', 'ebay', 'walmart', 'shopify'),
        allowNull: false,
      },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
    },
    {
      tableName: 'marketplace_accounts',
      createdAt: 'created_at',
      updatedAt: false,
      paranoid: true,
      deletedAt: 'deleted_at',
      indexes: [{ fields: ['client_id'] }],
    },
  );

  MarketplaceAccount.associate = (models) => {
    MarketplaceAccount.belongsTo(models.Client, { foreignKey: 'client_id' });
  };

  return MarketplaceAccount;
};
