
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/postgres");

const Location = sequelize.define(
  "Location",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "locations",
  }
);

module.exports = Location;

  