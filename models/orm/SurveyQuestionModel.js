module.exports = function(sequelize, DataTypes) {
    return sequelize.define("SurveyQuestion", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        values: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        placeholder: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fieldType:{
            type: DataTypes.STRING,
            allowNull: true
        },
        isMultiple: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            default: false
        },
        isAutoGrade: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            default: false
        },
        orderNum: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull:true
        }
    },
    {
        instanceMethods: {
            toJSON: function () {
                var data = this.values;
                delete data.updatedAt;
                delete data.createdAt;

                data.values = JSON.parse( data.values );

                return data;
            }
        }
    });
};
