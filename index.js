'use strict';

var _ = require('lodash');
var config = require('./config');
var request = require('request');
var mysql = require('mysql');
var connection = mysql.createConnection(config.database);
var moment = require('moment');

var updater = function (event, context)
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
            values = [];

        _.each(airings, function(item){
          // if(item.ParentNetworkId) return;

          values.push([
            item.Title,
            item.EpisodeTitle,
            item.Copy,
            moment(item.AiringTime).utc().format('YYYY-MM-DD HH:mm:ss'),
            item.Duration,
            _.parseInt(item.Channel, 10),
            item.CallLetters
          ]);
        });

        // check for values
        if(!values.length > 0) return context.fail('Received 0 results from API.');

        // first delete our old entries
        connection.query('DELETE FROM entries', function(err){
          if(!err) {
            // bulk insert our entries
            connection.query('INSERT INTO entries (Title, EpisodeTitle, Description, AiringTime, Duration, ChannelNumber, ChannelCallsign) VALUES ?', [values], function(err, results){
              if(!err) {
                console.log('Successfully inserted ' + results.affectedRows + ' entries with ' + results.warningCount + ' warnings.');
              } else {
                console.error("Couldn't insert entries", err);
              }

            });

          } else {
            console.error("Couldn't clear out old entries", err);
          }

        });

      }

    } else {
      console.error('Error retrieving TV listings: ' + error);
    }

  });

}

updater();