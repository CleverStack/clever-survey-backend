/**
 * @doc module
 * @name survey.controllers:ModulesSurveyController
 * @description
 * Sets up a controller within CleverStack
 */
module.exports = function( SurveyService ) {
    return (require('classes').Controller).extend(
    {
        service: SurveyService
    },
    {
        listAction: function() {
            var accId = this.req.user.id;

            SurveyService
            .getSurveyList( accId )
            .then( this.proxy( 'handleServiceMessage' ) )
            .fail( this.proxy( 'handleException' ) );
        },

        getAction: function() {
            var accId  = this.req.user.id,
                srvId  = this.req.params.id;

            SurveyService
            .getSurveyById( accId, srvId )
            .then( this.proxy( 'handleServiceMessage' ) )
            .fail( this.proxy( 'handleException' ) );
        },

        postAction: function() {
            var accId  = this.req.user.id
              , data    = this.req.body;

            if ( data.id ) {
                this.putAction();
                return;
            };

            data['accId'] = accId;

            SurveyService
            .createSurvey( data )
            .then( this.proxy( 'handleServiceMessage' ) )
            .fail( this.proxy( 'handleException' ) );
        },

        putAction: function() {
            var srvId  = this.req.params.id
              , userId = this.req.user.id
              , accId  = this.req.user.id
              , data   = this.req.body;

            data['userId'] = userId;
            data['accId']  = accId;

            SurveyService
            .updateSurvey( data, srvId )
            .then( this.proxy( 'handleServiceMessage' ) )
            .fail( this.proxy( 'handleException' ) );
        },

        deleteAction: function() {
            var accId = this.req.user.id,
                srvId = this.req.params.id;

            SurveyService
            .removeSurvey( accId, srvId )
            .then( this.proxy( 'handleServiceMessage' ) )
            .fail( this.proxy( 'handleException' ) );
        },

        handleServiceMessage : function(obj){
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
