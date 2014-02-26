var Q = require('q')
  , shortId = require('shortid')
  , _ = require('underscore')
  , SurveyResponseService;

module.exports = function( sequelize, ORMSurveyResponseModel, ORMSurveyModel, ORMSurveyQuestionModel, ORMSurveyResponseAnswerModel ) {
  if (SurveyResponseService && SurveyResponseService.instance) {
    return SurveyResponseService.instance;
  }

  SurveyResponseService = require( 'services' ).BaseService.extend( {
      formatData: function( data, operation ) {
          var d = {};
          d['pointsAwarded'] = data.pointsAwarded  || null;

          if ( operation == 'create' ) {
              d['id'] = null;
              d['SurveyId'] = data.SurveyId;
              d['status'] = "Not Taken";
              d['AccountId'] = data.accId;
              d['token'] = data.token|| shortId.seed(1000).generate();
          }

          return d;
      },

      createSurveyResponse: function( data ) {
          var deferred = Q.defer()
            , obj = this.formatData(data, 'create');

          this.findOne({ where: [
              'SurveyResponses.ResponseId = ? AND SurveyResponses.SurveyId = ? AND Surveys.AccountId = ?',
              data.ResponseId, data.SurveyId, data.accId
              ], include: [ SurveyModel ] })
          .then(function( psrv ) {
              if ( psrv ) {
                  deferred.resolve(null);
                  return;
              };

              this.create( obj )
                  .then( deferred.resolve )
                  .fail( deferred.reject );
          }.bind(this))
          .fail( deferred.reject );

          return deferred.promise;
      },

      getSurveyResponseByToken: function( tkn ) {
          var deferred = Q.defer();

          this.findOne({ where: { token: tkn }, include: [ SurveyModel ] })
              .then(function( surveyResponse ) {

                  if ( !surveyResponse ) {
                      deferred.resolve({statuscode:400, message:'Invalid Survey'});
                      return;
                  }

                  if ( surveyResponse.status !== 'Not Taken' ) {
                      deferred.resolve({statuscode:400, message:'You have already submitted this Survey.'});
                      return;
                  }

                  this.getSurveyQuestionsAndAnswers( surveyResponse )
                      .then(function( questions ) {
                          var responseSurveyJSON = JSON.parse( JSON.stringify( surveyResponse ) );
                          responseSurveyJSON['survey']['surveyQuestions'] = questions;

                          deferred.resolve( responseSurveyJSON );
                      })
                      .fail( deferred.reject );

              }.bind(this))
              .fail( deferred.reject );

          return deferred.promise;
      },

      createSurveyResponseAnswer: function( data ) {
          var deferred = Q.defer();

          this.findOne({ where: { token: data.tkn } })
              .then(function( surveyResponse ) {

                  if ( !surveyResponse ) {
                      deferred.resolve({statuscode:400, message:'invalid data'});
                      return;
                  }

                  this.gradeSurvey( surveyResponse.AccountId, surveyResponse.id ,data['survey']['surveyQuestions'] )
                      .then( function( data ) {

                          this.saveAnswer( data['surveyResponseAnswers'] )
                              .then( function( result ) {
                                  surveyResponse
                                  .updateAttributes({status: data['status']})
                                  .success( deferred.resolve )
                                  .error( deferred.reject );
                              })
                              .fail( deferred.reject );
                      }.bind(this))
                      .fail( deferred.reject );

              }.bind(this))
              .fail( deferred.reject );

          return deferred.promise;
      },

      // Automatic Survey Grading
      gradeSurvey: function(accId, surveyResponseId, questions ) {
          var deferred = Q.defer()
            , answers  = []
            , status = 'Completed';

          if ( !questions || !Array.isArray(questions) || !questions.length ) {
              deferred.resolve({statuscode:400, message:'invalid data'});
          } else {
              questions.forEach(function( qn ) {

                  var o = {
                      SurveyQuestionId: qn.id,
                      SurveyResponseId: surveyResponseId,
                      AccountId: accId,
                      userInput: qn.surveyResponseAnswers.userInput && JSON.stringify(qn.surveyResponseAnswers.userInput),
                      pointsAwarded: 0
                  };

                  if ( !qn.isAutoGrade ) {
                      status = 'Completed - Incomplete grading';
                  } else {
                      // qn.points
                      var item;
                      while( item = qn.values.pop() ) {
                          if ( item['isCorrect'] && ( o.userInput.indexOf(item['key']) != -1 ) ) {
                              o['pointsAwarded'] = qn.points;
                          }
                      }
                  }

                  answers.push( o );
              });

              deferred.resolve({
                  status: status,
                  surveyResponseAnswers: answers
              });
          }

          return deferred.promise;
      },

      saveAnswer: function( surveyAnswers ) {
          var deferred = Q.defer();

          SurveyResponseAnswerModel
          .bulkCreate( surveyAnswers )
          .success( deferred.resolve )
          .error( deferred.reject );

          return deferred.promise;
      },

      getSurveyResponses: function( accId, responseId ) {
          var deferred = Q.defer();

          this.find({
              where: { AccountId: accId, ResponseId: responseId },
              include: [ SurveyModel ]
          })
          .then(function( surveyResponse ) {

              if ( !surveyResponse.length ) {
                  deferred.resolve([]);
                  return;
              }

              this.handleSurveyAnswers( surveyResponse )
                  .then( deferred.resolve )
                  .fail( deferred.reject );
          }.bind(this))
          .fail( deferred.reject );

          return deferred.promise;
      },

      handleSurveyAnswers: function( surveyResponses ) {
          var promises = []
            , service = this
            , finalData = [];

          surveyResponses.forEach(function( item ) {
              var obj = JSON.parse( JSON.stringify( item ));
              finalData.push(obj);
              promises.push( service.getSurveyQuestionsAndAnswers(obj) );
          });

          return Q.all(promises).then(function(questions) {
              finalData.forEach(function(survey, i) {
                  survey.surveyQuestions = questions[i];
              });
              return finalData;
          });
      },

      getSurveyQuestionsAndAnswers: function( surveyResponse ) {
          var deferred = Q.defer()
            , chainer  = new Sequelize.Utils.QueryChainer;

          chainer.add(
              SurveyQuestionModel.findAll({
                  where: { SurveyId: surveyResponse.SurveyId, AccountId: surveyResponse.AccountId }
              })
          );

          chainer.add(
              SurveyResponseAnswerModel.findAll({
                  where:{ SurveyResponseId: surveyResponse.id, AccountId: surveyResponse.AccountId }
              })
          );

          chainer.run()
          .success(function( results ) {
              var srvQ = results[0];
              var srvA = results[1];
              var total = [];

              if ( !srvA || !srvA.length ) {
                  deferred.resolve( srvQ );
                  return;
              }

              var l = srvQ.length, quest;
              while (l--) {
                  quest = JSON.parse( JSON.stringify( srvQ[l] ) ) ;
                  srvA.forEach(function( answ ) {

                      if ( quest.id == answ.SurveyQuestionId ) {
                          quest['surveyResponseAnswers'] = {
                              id: answ.id,
                              userInput: answ.userInput,
                              pointsAwarded: answ.pointsAwarded
                          };
                      }
                  });

                  total.push( quest );
              }

              deferred.resolve( total );
          })
          .error( deferred.reject );

          return deferred.promise;
      },

      processSurveyResponseUpdate: function( srvId, data ) {
          var deferred = Q.defer();

          this.updatePointsAwarded( data.surveyQuestions )
              .then( function( hasUnrated ) {
                  // If status hasn't change, return.
                  if ( hasUnrated && ( data['status'] == "Completed - Incomplete grading" ) ) {
                      deferred.resolve( data );
                      return;
                  }

                  this.updateSurveyStatus( srvId, hasUnrated )
                      .then( function( newstatus ) {
                          data['status'] = newstatus;
                          deferred.resolve( data );
                      })
                      .fail( deferred.reject );
              }.bind(this))
              .fail( deferred.reject );

          return deferred.promise;
      },

      updateSurveyStatus: function( srvId, isRateUncomplete ) {
          var deferred = Q.defer()
            , sts = ( isRateUncomplete ) ? 'Completed - Incomplete grading': "Completed";

          SurveyResponseModel
          .update({ status: sts },{ id: srvId })
          .success( function() {
              deferred.resolve( sts );
          })
          .error( deferred.reject );

          return deferred.promise;
      },

      // Manual Survey Grading
      updatePointsAwarded: function( surveyQuestions ) {
          var deferred = Q.defer()
            , cntUnrated = 0
            , chainer  = new Sequelize.Utils.QueryChainer;

          var l = surveyQuestions.length, sq, sa;

          while ( l-- ) {
              sq = surveyQuestions[ l ];
              sa = sq.surveyResponseAnswers;

              if ( !sa.pointsAwarded ) {
                  cntUnrated++;
              }

              if ( (sa.pointsAwarded !== undefined) && (sa.pointsAwarded !== null) ) {
                  chainer.add(
                      SurveyResponseAnswerModel.update(
                          { pointsAwarded: sa.pointsAwarded },
                          { id: sa.id, AccountId: sq.AccountId, SurveyQuestionId: sq.id }
                      )
                  );
              }
          };

          chainer
          .run()
          .success( function() {
              deferred.resolve( cntUnrated );
          })
          .error( deferred.reject );
          return deferred.promise;
      }
  });

  SurveyResponseService.instance = new SurveyResponseService(sequelize);
  SurveyResponseService.Model = ORMSurveyResponseModel;

  return SurveyResponseService.instance;
};
