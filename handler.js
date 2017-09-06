'use strict';
var AWS = require('aws-sdk');
var fs = require('fs');
var execFile = require('child_process').execFile;

var mozjpeg = process.cwd() + '/mozcjpeg';

process.env[‘PATH’] = process.env[‘PATH’] + ‘:’ + process.env[‘LAMBDA_TASK_ROOT’]

AWS.config.update({
  region: 'us-east-1'
});

module.exports.handler = (event, context, callback) => {
  const response = {
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
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

  fs.writeFileSync('/tmp/whatever','hi');

  var myFile = fs.createWriteStream(beforeFile);
  myFile.on('close', function() {
    var beforeSize = fs.statSync(beforeFile).size;
    execFile(mozjpeg, ['-outfile', afterFile, beforeFile], function(err) {
      if (err) console.dir(err);
      var afterSize = fs.statSync(afterFile).size;
      console.log('Test File shrunk ' + (afterSize / beforeSize) * 100.0);
    });

  });

  var fileStream = s3.getObject(options).createReadStream();
  fileStream.pipe(myFile);

  callback(null, response);
};
