module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Survey", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull : true
        },
        pointsPossible: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        instanceMethods: {
            toJSON: function () {
                var values = this.values;
                delete values.updatedAt;
                delete values.createdAt;
                delete values.AccountId;

                return values;
            }
        }
    });
};
