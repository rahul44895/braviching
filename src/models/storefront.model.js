module.exports = (sequelize, DataTypes) => {
  const Storefront = sequelize.define(
    'Storefront',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      client_id: { type: DataTypes.INTEGER, allowNull: false },
      platform: {
        type: DataTypes.ENUM('shopify', 'amazon', 'magento', 'headless'),
        allowNull: false,
      },
      url: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
    },
    {
      tableName: 'storefronts',
      createdAt: 'created_at',
      updatedAt: false,
      paranoid: true,
      deletedAt: 'deleted_at',
      indexes: [{ fields: ['client_id'] }],
    },
  );

  Storefront.associate = (models) => {
    Storefront.belongsTo(models.Client, { foreignKey: 'client_id' });
  };

  return Storefront;
};
