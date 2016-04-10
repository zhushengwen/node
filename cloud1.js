var AV = require('leanengine');
var APP_ID = "aPNbVACbeCo8sjBbRPlk3UcR";
var APP_KEY = "kBaw4p0sN6K3qPKxCnrmSdlh";
var MASTER_KEY = "U6vYm0Y63NRvLoJCRY9CCNcC";
AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
var File = AV.Object.extend('_File');
/**
 * 一个简单的云代码方法
 */
var ftc = require('./ftc');
var tool = require('./tool');
var fs = require('fs');
var client = require("redis").createClient(6379, "localhost");
client.on("error", function (err)
{
  console.log("Error: " + err);
});
client.on("connect", function ()
{
  read_lines();
});

AV.Cloud.define('hello', function (request, response)
{
  response.success('Hello world!');
});

module.exports = AV.Cloud;

function read_lines()
{
  var file = __dirname + '/to_load_unique.txt';
  var exist = fs.existsSync(file);
  if (exist) {
    var data = fs.readFileSync(file);
    data = data.toString();

    var images = data.split('\r\n');
    ftc.ftc(images.length, function (i, callback, n)
    {
      SaveSmallItemT(images[i], callback);
    }, 6, function ()
    {
      console.log('处理完毕！');
    });
  }

}

function SaveSmallItemT(image_url, callback)
{
  client.hexists('process', image_url, function (err, reply)
  {
    if (reply) {
      callback();
    } else {
      tool.downloadFromWeb(image_url, function (buffer)
      {
        var file = new AV.File(image_url, buffer);
        file.save().then(function (file)
        {
          var query = new AV.Query(File);
          query.get(file.id, {
            success: function (file)
            {
              var json = JSON.stringify(file);
              client.hset('process', image_url, json, function (err, replay)
              {
                callback(file);
              });
            }, error: function (error)
            {
              callback();
            }
          });
        }, function (err)
        {
          callback();
        });
      },false, true, callback);
    }
  });

}