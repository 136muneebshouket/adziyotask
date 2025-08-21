const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/dbconnect");

const User = sequelize.define(
  "User",
  {
    // Model attributes are defined here
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("email", value ? value.trim() : null);
      },
      validate: {
        isEmail: true, // checks for email format
        notNull: { msg: "Email is required" },
        notEmpty: { msg: "Email cannot be empty" },
        len: [5, 200],
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("password", value || null);
      },
      validate: {
        notNull: { msg: "Password is required" },
        notEmpty: { msg: "Password cannot be empty" },
        len: {
          args: [8, 100], // min 8 characters
          msg: "Password must be at least 8 characters long",
        },
        isStrongEnough(value) {
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
          if (!regex.test(value)) {
            throw new Error(
              "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            );
          }
        },
      },
    },
  },
  {
    // Other model options go here
  }
);

module.exports = User;
