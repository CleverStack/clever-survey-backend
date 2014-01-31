/**
 * @doc module
 * @name survey.controllers:ModulesSurveyResponseController
 * @description
 * Sets up a controller within CleverStack
 */
 module.exports = function( SurveyService, SurveyResponseService ) {
    return (require( 'classes' ).Controller).extend(
    {
        service: null
    },
    /* @Prototype */
    {
        listAction: function() {
            this.send(400, 'Not implemented');
        },

        getAction: function() {
            this.send(400, 'Not implemented');
        },

        postAction: function() {
            var accId  = this.req.user.account.id
              , data   = this.req.body;

            if ( this.req.params.id || data.id ) {
                this.putAction();
                return;
            }

            if ( !data.RespondentId || !data.SurveyId ) {
                this.send('400', 'invalid ids');
                return;
            };

            data['accId'] = accId;

            SurveyResponseService
            .createRespondentSurvey( data )
            .then( this.proxy( 'handleServiceMessage' ) )
            .fail( this.proxy( 'handleException' ) );
        },

        applyAction: function() {
            var tkn = this.req.params.token;

            SurveyResponseService
            .getRespondentSurveyByToken( tkn )
            .then( this.proxy( 'handleServiceMessage' ) )
            .fail( this.proxy( 'handleException' ) );
        },

        submitAction: function() {
            var tkn = this.req.params.token
              , data = this.req.body;

            data['tkn'] = tkn;

            SurveyResponseService
            .createRespondentSurveyAnswer( data )
            .then( this.proxy( 'handleServiceMessage' ) )
            .fail( this.proxy( 'handleException' ) );
        },

        surveysAction: function() {
            var accId = this.req.user.account.id
              , respondentId = this.req.params.id;

            SurveyResponseService
            .getRespondentSurveys(accId, respondentId)
            .then( this.proxy( 'handleServiceMessage' ) )
            .fail( this.proxy( 'handleException' ) );
        },

        pointsAction: function() {
            this.send(200, 'okdd');
        },

        putAction: function() {
            var accId = this.req.user.account.id
              , srvId = this.req.params.id
              , data  = this.req.body;

            if ( accId != data.AccountId ) {
                this.send("invalid id", 400 );
                return;
            };

            SurveyResponseService
            .processRespondentSurveyUpdate( srvId, data )
            .then( this.proxy( 'handleServiceMessage' ) )
            .fail( this.proxy( 'handleException' ) )
        },

        deleteAction: function() {
            this.send(400, 'Not implemented');
        },

        handleServiceMessage: function(obj) {
            if ( !obj ) {
                this.send({}, 200);
            };

            if ( obj.statuscode ) {
                this.send( obj.message, obj.statuscode );
                return;
            };

            this.send( obj, 200 );
        }
    });
}
