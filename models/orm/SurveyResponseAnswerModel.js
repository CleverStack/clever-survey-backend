module.exports = function(sequelize, DataTypes) {
    return sequelize.define("SurveyResponseAnswer", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        userInput: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        pointsAwarded: {
          type: DataTypes.INTEGER,
          allowNull: true
        }
    },
    {
      paranoid:true
    });
};
