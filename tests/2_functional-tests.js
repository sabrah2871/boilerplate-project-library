/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { ObjectId } = require('mongodb');
let validId = '68274cafc41493b961f1f713';
let invalidId = '1234';
let comment = 'Komen dulu';

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title: "Title",
            })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isObject(res.body);
            assert.property(res.body, 'title');
            assert.propertyVal(res.body, 'title', 'Title');
          done();
        });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .keepOpen()
          .post('/api/books')
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'missing required field title');
          done();
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'commentcount');
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], 'comments');
            assert.property(res.body[0], '_id');
            assert.isArray(res.body[0].comments);
          done();
        });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .keepOpen()
          .get(`/api/books/${invalidId}`)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html')
            assert.equal(res.text, 'no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .keepOpen()
          .get(`/api/books/${validId}`)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.propertyVal(res.body, 'title', 'Title 1');
            const objId = new ObjectId(`${validId}`).toHexString();
            assert.propertyVal(res.body, '_id', objId);
          done();
        });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .keepOpen()
          .post(`/api/books/${validId}`)
          .send({comment: `${comment}`})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isObject(res.body);
            assert.property(res.body, '_id');
            assert.property(res.body, 'comments');
            assert.nestedPropertyVal(res.body, `comments[${res.body.comments.length-1}]`, `${comment}`);
          done();
        });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .keepOpen()
          .post(`/api/books/${validId}`)
          .send({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'missing required field comment');
          done();
        });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .keepOpen()
          .post(`/api/books/${invalidId}`)
          .send({comment:'komen dulu'})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'no book exists');
          done();
        });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .keepOpen()
          .delete(`/api/books/${validId}`)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'delete successful');
          done();
        });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
          .keepOpen()
          .delete(`/api/books/${invalidId}`)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            assert.equal(res.text, 'no book exists');
          done();
        });
      });

    });

  });

});
