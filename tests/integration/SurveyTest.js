var expect = require ( 'chai' ).expect
  , request = require ( 'supertest' )
  , path = require( 'path' )
  , app = require ( path.resolve( __dirname + '/../../../../' ) + '/index.js' );
console.dir(app)
describe ( '/modules_survey', function () {
    describe ( 'POST /modules_survey', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .post ( '/modules_survey' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    console.dir( arguments)
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        status: 'Created record!'
                    } );
                    done ();
                } );
        } );
    } );

    describe ( 'GET /modules_survey', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .get ( '/modules_survey' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        status: 'Sending you the list of examples.'
                    } );
                    done ();
                } );
        } );
    } );

    describe ( 'GET /modules_survey/:id', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .get ( '/modules_survey/123' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        status: 'sending you record with id of 123'
                    } );
                    done ();
                } );
        } );
    } );

    describe ( 'PUT /modules_survey/:id', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .put ( '/modules_survey/123' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        status: 'updated record with id 123'
                    } );
                    done ();
                } );
        } );
    } );

    describe ( 'DELETE /modules_survey/:id', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .del ( '/modules_survey/123' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        status: 'deleted record with id 123'
                    } );
                    done ();
                } );
        } );
    } );

    describe ( 'GET /modules_survey/custom', function () {
        it ( 'should return valid status', function ( done ) {
            request ( app )
                .get ( '/modules_survey/custom' )
                .expect ( 'Content-Type', /json/ )
                .expect ( 200 )
                .end ( function ( err, res ) {
                    if ( err ) return done ( err );
                    expect ( res.body ).to.eql ( {
                        message: 'Hello from customAction inside ModulesSurveyController'
                    } );
                    done ();
                } );
        } );
    } );
});
