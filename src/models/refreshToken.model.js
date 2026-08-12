module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define(
    'RefreshToken',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      token_hash: { type: DataTypes.STRING, allowNull: false },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      revoked_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'refresh_tokens',
      createdAt: 'created_at',
      updatedAt: false,
      timestamps: true,
    },
  );

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return RefreshToken;
};
