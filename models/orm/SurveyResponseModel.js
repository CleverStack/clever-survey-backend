module.exports = function(sequelize, DataTypes) {
    return sequelize.define("SurveyResponse", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        status: {
          type: DataTypes.ENUM,
          values: ['Not Taken', 'Completed', 'Completed - Incomplete grading'],
          allowNull: false
        },
        pointsAwarded: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        token: {
          type: DataTypes.STRING,
          allowNull: true
        }
    },
    {
      paranoid: true
    });
};
