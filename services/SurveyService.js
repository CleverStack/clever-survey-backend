var Q = require('q')
  , SurveyService;

module.exports = function (sequelize, ORMSurveyModel, ORMSurveyQuestionModel) {
  if (SurveyService && SurveyService.instance) {
    return SurveyService.instance;
  }

  SurveyService = require( 'services' ).BaseService.extend( {
    formatData: function(data, operation) {
      var d = {
        survey: {},
        surveyQuestions: []
      };

      d.survey.title = data.title || null;
      d.survey.description = data.description || null;
      d.survey.pointsPossible = data.pointsPossible || 0;

      data.surveyQuestions.forEach(function(item) {
        var o = {
          id: item.id || null,
          title: item.title || null,
          values: JSON.stringify(item.values),
          placeholder: item.placeholder || null,
          fieldType: item.fieldType   || null,
          orderNum: item.orderNum || null,
          points: item.points || null,
          isMultiple: (/false|true/.test( item.isMultiple ))  ? item.isMultiple: false,
          isAutoGrade: (/false|true/.test( item.isAutoGrade ))  ? item.isAutoGrade: false
        };

        d.surveyQuestions.push(o);
      });

      if (operation == 'create') {
        d.survey.id = null;
        d.survey.AccountId = data.accId;
      }

      return d;
    },

    getSurveyList: function(accId) {
      var deferred = Q.defer();

      this.find({
        where: { AccountId: accId },
        include: [ORMSurveyQuestionModel]
      })
      .then(deferred.resolve)
      .fail(deferred.reject);

      return deferred.promise;
    },

    getSurveyById: function(accId, srvId) {
      var deferred = Q.defer();

      this.findOne({
        where: { AccountId: accId, id: srvId },
        include: [ORMSurveyQuestionModel]
      })
      .then(deferred.resolve)
      .fail(deferred.reject);

      return deferred.promise;
    },

    createSurvey: function(data) {
      var deferred = Q.defer()
        , data = this.formatData(data, 'create');

      this.create(data.survey)
        .then(function(survey) {

          if (!data.surveyQuestions.length) {
            deferred.resolve( survey );
            return;
          }

          var sqData = data.surveyQuestions.map(function(x) {
            x.AccountId = survey.AccountId;
            x.SurveyId  = survey.id;
            return x;
          });

          ORMSurveyQuestionModel
            .bulkCreate(sqData)
            .success(function() {

              this.getSurveyById(survey.AccountId, survey.id)
                .then(deferred.resolve)
                .fail(deferred.reject);

            }.bind(this))
            .error(deferred.reject);
          }.bind(this))
        .fail(deferred.reject);

      return deferred.promise;
    },

    updateSurvey: function(data, srvId) {
      var deferred = Q.defer()
        , dataSurvey = this.formatData(data, 'update');

      this.findOne({
        where: {
          id: srvId,
          AccountId: data.accId
        }
      })
      .then(function(survey) {
        if (!survey) {
          deferred.resolve({
            statuscode: 403,
            message: 'invalid id'
          });
          return;
        }

        this.processUpdate(survey, dataSurvey)
            .then(deferred.resolve)
            .fail(deferred.reject);

      }.bind(this))
      .fail(deferred.resolve);

      return deferred.promise;
    },

    processUpdate: function(survey, data) {
      var deferred = Q.defer()
        , chainer  = new sequelize.Utils.QueryChainer()
        , questionToCreate = data.surveyQuestions.map(function(x) {
          x.id = null;
          x.AccountId = survey.AccountId;
          x.SurveyId = survey.id
          x.UserId = null;
          return x;
        });


      chainer.add(ORMSurveyQuestionModel.destroy({
        AccountId: survey.AccountId,
        SurveyId: survey.id
      }));
      chainer.add(survey.updateAttributes(data.survey));
      if (questionToCreate.length) {
        chainer.add(ORMSurveyQuestionModel.bulkCreate(questionToCreate));
      }

      chainer.runSerially()
        .success(function(results) {
          this.getSurveyById(survey.AccountId, survey.id)
          .then(deferred.resolve)
          .fail(deferred.reject);

      }.bind(this))
      .error(deferred.reject);

      return deferred.promise;
    },

    removeSurvey: function(accId, srvId) {
      var deferred = Q.defer()
        , chainer  = new sequelize.Utils.QueryChainer();

      chainer.add(ORMSurveyQuestionModel.destroy({
        SurveyId: srvId,
        AccountId: accId
      }));

      chainer.add(ORMSurveyModel.destroy({
        id: srvId,
        AccountId: accId
      }));

      chainer.runSerially()
        .success(function ( ) {
          deferred.resolve({
            statuscode: 200,
            message: 'survey and survey question has been deleted'
          });
        })
        .error(deferred.reject);

      return deferred.promise;
    }
  });

  SurveyService.instance = new SurveyService(sequelize);
  SurveyService.Model = ORMSurveyModel;

  return SurveyService.instance;
};
