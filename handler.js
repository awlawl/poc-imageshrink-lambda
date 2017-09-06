'use strict';
var AWS = require('aws-sdk');
var fs = require('fs');
var child_process = require('child_process');

var mozjpeg = process.cwd() + '/mozcjpeg';

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT']

AWS.config.update({
  region: 'us-east-1'
});

module.exports.handler = (event, context, callback) => {
  var response = {
    body: JSON.stringify({
      message: '',
      input: event,
    })
  };

  var s3 = new AWS.S3();
  var options = {
    Bucket: '/awl-image-shrink',
    Key: '2017-08-26 19.07.02.jpg',
  };

  var beforeFile = '/tmp/before.jpg';
  var afterFile = '/tmp/shrunk.jpg';

  var fileStream = s3.getObject(options, function(err, data) {
    if (err) {
      response.message = 'Could not download s3 file.';
      console.log(err);
    } else {
      fs.writeFile(beforeFile, data.Body, function(err) {
        var beforeSize = fs.statSync(beforeFile).size;
        console.log('Before size ' + beforeSize);

        child_process.execFile(mozjpeg, ['-outfile', afterFile, beforeFile], function(err) {
          if (err) {
            response.message = 'Could not run mozjpeg.';
            console.dir(err);
          } else {
            var afterSize = fs.statSync(afterFile).size;
            var message = 'Test File shrunk ' + (afterSize / beforeSize) * 100.0 + '%';
            console.log(message);
            response.message = message;
          }
          callback(null,response);
        });
      });
    }
  });



/*exec(mozjpeg + ' -outfile ' + afterFile + ' ' + beforeFile, function(err) {
  if (err) {
    console.dir(err);
  } else {
    var afterSize = fs.statSync(afterFile).size;
    console.log('Test File shrunk ' + (afterSize / beforeSize) * 100.0);
  }

});*/



};
