// Bootstrap the testing environmen
var testEnv = require ( 'utils' ).testEnv();

var expect = require ( 'chai' ).expect
  , Service;

describe ( 'controllers.SurveyController', function () {
    var ctrl;

    beforeEach ( function ( done ) {
        testEnv ( function ( SurveyController, SurveyService ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };
            var res = {
                json: function () {}
            };
            var next = function () {};
            ctrl = new SurveyController ( req, res, next );

            Service = SurveyService;
            Service.create({
                name: 'ModulesSurvey 1',
                surveyQuestions: [
                  id: 1,
                  title: 'My Question',
                  values: [
                    { test: 'yup' }
                  ]
                ]
            })
            .then(function ( examples ) {
                done();
            })
            .fail(done);
        } );
    } );


    describe ( '.postAction()', function () {
        it ( 'should call .send() with valid status', function ( done ) {
            ctrl.req.user = { id: 1 };
            ctrl.req.params = { id: 1 };

            ctrl.send = function ( data ) {
                Service.findAll()
                    .then(function ( examples ) {
                        examples.should.have.length( 2 );
                        examples[ 1 ].name.should.equal( 'ModulesSurvey 2' );
                        done();
                    })
                    .fail(done);
            };
            ctrl.req.body = {
                name: 'ModulesSurvey 2'
            };
            ctrl.postAction();
        } );
    } );

    describe ( '.listAction()', function () {
        it ( 'should call .send() with valid status', function ( done ) {
            ctrl.req.user = { id: 1 };
            ctrl.req.params = { id: 1 };

            ctrl.send = function ( data ) {
                data.should.have.length( 1 );
                data[ 0 ].name.should.equal( 'ModulesSurvey 1' );
                done();
            };
            ctrl.listAction();
        } );
    } );

    describe ( '.getAction()', function () {
        it ( 'should call .send() with valid status', function ( done ) {
            ctrl.req.user = { id: 1 };
            ctrl.req.params = { id: 1 };

            ctrl.send = function ( data ) {
                data.id.should.equal( 1 );
                data.name.should.equal( 'ModulesSurvey 1' );
                done();
            };
            ctrl.getAction();
        } );
    } );

    describe ( '.putAction()', function () {
        it ( 'should call .send() with valid status', function ( done ) {
            ctrl.req.user = { id: 1 };
            ctrl.req.params = { id: 1 };

            ctrl.send = function ( data ) {
                data.id.should.equal( 1 );
                data.name.should.equal( 'ModulesSurvey Updated' );
                done();
            };
            ctrl.req.body = {
                name: 'ModulesSurvey Updated'
            };
            ctrl.putAction();
        } );
    } );

    describe ( '.deleteAction()', function () {
        it ( 'should call .send() with valid status', function ( done ) {
            ctrl.req.user = { id: 1 };
            ctrl.req.params = { id: 1 };

            ctrl.send = function ( data ) {
                expect( data ).to.eql ( undefined );
                done();
            };
            ctrl.deleteAction();
        } );
    } );
});
