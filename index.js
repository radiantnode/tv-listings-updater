'use strict';

var _ = require('lodash');
var config = require('./config');
var request = require('request');
var AWS = require('aws-sdk');
AWS.config = new AWS.Config(config.aws);
var s3 = new AWS.S3();

exports.handler = function (event, context)
{
  request({
    url: config.rovi.url,
    json: true,
    qs: {
      locale:               'en-US',
      duration:             240,
      inprogress:           true,
      oneairingpersourceid: false,
      format:               'json',
      apikey:               config.rovi.key
    }

  }, function(error, response, data){
    if(!error) {
      if(data && data.LinearScheduleResult && data.LinearScheduleResult.Schedule) {
        var airings = data.LinearScheduleResult.Schedule.Airings,
            results = [];

        // sanitize our results
        results = _.map(airings, function(item){
          // remove extra keys
          _.each(config.ignoredKeys, function(key){ delete item[key] });
          // force channel number to an int
          item['Channel'] = _.parseInt(item['Channel'], 10);
          return item;
        });

        results = JSON.stringify(results);
      }

      s3.putObject({
        Bucket: config.aws.bucket,
        Key: config.objectName,
        ACL: 'public-read',
        Body: results
      }, function(error, data) {
        if(!error) {
          context.succeed('Successfully saved TV listings!');
        } else {
          context.fail('Error saving TV listings: ' + error);
        }

      });

    } else {
      context.fail('Error retrieving TV listings: ' + error);
    }

  });

}

// TEST STUBBING:
// exports.handler(null, {
//   succeed: function (data) { console.log('SUCCEED: ' + data )},
//   fail: function (data) { console.log('FAIL: ' + data )}
// });