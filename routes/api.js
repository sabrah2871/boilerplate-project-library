/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

module.exports = function (app) {

  require('dotenv').config();
  const { MongoClient, ObjectId} = require('mongodb');
  const mongoDB = process.env.DB;
  const client = new MongoClient(mongoDB);
  const database = client.db();
  const collection = database.collection('books');

  async function populateDocument() {
    try {
      await client.connect();
      const newBook = await collection.insertMany([
        {
          _id: new ObjectId('68274cafc41493b961f1f713'),
          title: 'Title 1',
          comments: [],
          commentcount: 0
        },
        {
          _id: new ObjectId('68274cafc41493b961f1f714'),
          title: 'Title 2',
          comments: [],
          commentcount: 0
        },
        {
          _id: new ObjectId('68274cafc41493b961f1f715'),
          title: 'Title 3',
          comments: [],
          commentcount: 0
        },
        {
          _id: new ObjectId('68274cafc41493b961f1f716'),
          title: 'Title 4',
          comments: [],
          commentcount: 0
        }
      ]);
    } catch (error) {
      throw new Error('could not populate document');
    } finally {
      await client.close();
    };
  };

  // async function readAllBooks() {
  //   try {
  //     await client.connect();
  //     const allBooks = await collection.find({}).toArray();
  //     return allBooks;
  //   } catch (error) {
  //     throw new Error('error finding collection');
  //   } finally {
  //     await client.close();
  //   };
  // };


  async function findBookById(id) {
    try {
      await client.connect();
      let objectId = new ObjectId(id);
      const foundDocument = await collection.findOne({_id:objectId} );
      return foundDocument ? foundDocument : 'no book exists';
    } catch (error) {
      return 'error reading documentqq';
    } finally {
      await client.close();
    };
  };

  async function saveBook(title) {
    try {
      await client.connect();
      const newBook = await collection.insertOne({
          title: title,
          comments: [],
          commentcount: 0
        });
      return newBook.insertedId.toHexString();
    } catch (error) {
      throw new Error('error writing collection');
    } finally {
      await client.close();
    };
  };

  async function updateComment(id, comment) {
    if (!comment) {
      return 'missing required field comment';
    } else {
      try {
        await client.connect();
        let objectId = new ObjectId(id);
        const result = await collection.updateOne(
          { _id: objectId }, 
          {
            $push:{ comments: comment },
            $inc: { commentcount: 1 }
          }
        );
        if (result.modifiedCount > 0) {
          const updatedDocument = await findBookById(id);
          return updatedDocument;
        } else {
          return 'no book exists';
        }
      } catch (error) {
        throw new Error('no book exists') ;
      } finally {
        await client.close();
      };
    };
  };

  async function deleteAll() {
    try {
      await client.connect();
      await collection.deleteMany();
      return 'complete delete successful';
    } catch (error) {
      throw new Error('complete delete unsuccessful');
    } finally {
      await client.close();
    };
  };

  async function deleteById(id) {
    let bookid = new ObjectId(id);
    try {
      await client.connect();
      const deleteResult = await collection.deleteOne({_id: bookid});
      return deleteResult.deletedCount === 1 ? 'delete successful' : 'no book exists';
    } catch (error) {
      throw new Error('error delete collection');
    } finally {
      await client.close();
    };
  };

  app.route('/api/books/populate')
    .get(function (req, res) {
      populateDocument();
      res.send('collection populated');
    });

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      async function proses() {
        try {
          await client.connect();
          const allBooks = await collection.find({}).toArray();
          return res.json(allBooks);
        } finally {
        await client.close();
        };
      };
      proses();
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.send('missing required field title');
      } else {
        async function proses() {
          try {
            const bookResult = await saveBook(title);
            const newBook = await findBookById(bookResult);
            return res.json({
              _id: newBook._id, 
              title: newBook.title
            });
          } catch (error) {
            return res.send(error.message);
          }
        };
        proses();
      };
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      async function proses() {
        try {
          await client.connect();
          await collection.deleteMany();
          return res.send('complete delete successful');
        } finally {
          await client.close();
        };
      };
      proses();
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if (!ObjectId.isValid(bookid)) {
        res.send('no book exists');
      } else {
      async function proses() {
        try {
          await client.connect();
          const foundDocument = await collection.findOne({_id:new ObjectId(bookid)} );
          if(foundDocument) {
            return res.json(foundDocument);
          } else {
            return res.send('no book exists');
          };
        } finally {
          await client.close();
        };
      };
      proses();
    };
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!ObjectId.isValid(bookid)) {
        res.send('no book exists');
      } else {
        if (!comment) {
          res.send('missing required field comment');
        } else {
          async function proses() {
            try {
              await client.connect();
              let objectId = new ObjectId(bookid);
              const result = await collection.updateOne(
                { _id: objectId }, 
                {
                  $push:{ comments: comment },
                  $inc: { commentcount: 1 }
                }
              );
              if (result.modifiedCount > 0) {
                const updatedDocument = await findBookById(objectId);
                return res.json(updatedDocument);
              } else {
                return res.send('no book exists');
              }
            } finally {
              await client.close();
            };
          };
          proses();
        };
      };
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      if (!ObjectId.isValid(bookid)) {
        res.send('no book exists');
      } else {
        async function proses() {
          try {
            await client.connect();
            const deleteResult = await collection.deleteOne({_id: new ObjectId(bookid)});
            return deleteResult.deletedCount === 1 ? res.send('delete successful') : res.send('no book exists');
          } finally {
            await client.close();
          };
        };
        proses();
      };
    });
  
};
