const { Sequelize } = require("sequelize");


  // username: "postgres",
  // password: "Mm@136",
  // database: "postgres",
  // host: "localhost",
  // dialect: "postgres",
  // dialectModule: pg,

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize("postgres", "postgres", "Mm@136", {
  host: "localhost",
  dialect: "postgres",
});

module.exports = sequelize;
