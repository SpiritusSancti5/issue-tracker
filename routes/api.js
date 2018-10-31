/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get( (req, res) => 
         MongoClient.connect(CONNECTION_STRING, (err, db) => db.collection(req.params.project).find(req.query).toArray((err,docs)=>res.json(docs)))
    )
    
    .post(function (req, res){
      var project = req.params.project;
      var issue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };
      if(issue.issue_title && issue.issue_text && issue.created_by)
        MongoClient.connect(CONNECTION_STRING, (err, db) =>
          db.collection(project).insertOne(issue,(err,doc) => {
            issue._id = doc.insertedId;
            res.json(issue);
          })
        );
      else res.send('missing inputs');
    })
    
    .put(function (req, res){
      var project = req.params.project;
      var issue = req.body._id;
      delete req.body._id;
      var updates = req.body;
      for (var ele in updates) if (!updates[ele]) delete updates[ele];
      if (Object.keys(updates).length === 0) res.send('no updated field sent');
      else {
        updates.updated_on = new Date();
        MongoClient.connect(CONNECTION_STRING, (err, db) => 
          db.collection(project).findAndModify({_id:issue},[['_id',1]],{new: true}, (err,doc) => 
            {if (!err) res.send('successfully updated')}
          )
        );    
      }
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      var issue = req.body._id;
      if (issue)
        MongoClient.connect(CONNECTION_STRING, (err, db) =>
          db.collection(project).findAndRemove({_id:issue},(err,doc) => {if(!err) res.send('deleted '+issue)})
        );
      else res.send('_id error');
    });
    
};
