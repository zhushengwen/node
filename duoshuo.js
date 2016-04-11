/**
 * Created by Administrator on 2016-04-07.
 */
var hosts = require('./hosts');
var tool = require('./tool');
var one = require('./one');
var client = require("redis").createClient(6379, "localhost");
client.on("error", function (err)
{
  console.log("Error: " + err);
});
client.on("connect", function ()
{
  Fetch();
});

function doWork()
{

    var next_host = arguments.callee;
    client.RPOPLPUSH('lists', 'lists', function (e, host)
    {
      var key = 'lists:' + host;
      var do_one_host = function ()
      {
        one.count = 0;
        one.run(host, client, next_host);
      };
      client.exists(key, function (e, d)
      {
        if (!e && d) {
          do_one_host();
        } else {
          client.lpush(key, '/', function (e, d)
          {
            if (!e && d) {
              do_one_host();
            } else {
              next_host();
            }
          });
        }
      });
    });

}
function GetNew()
{
  hosts.get(function (data)
  {
    var json = JSON.parse(data);
    var list = json.results;
    var i = 0;
    if (list.length) {
      list.sort(function() {return 0.5 - Math.random()});
      console.log('Receive:'+list.length);
      (function ()
      {
        if (i < list.length) {
          var host = list[i ++].host;
          var cb = arguments.callee;
          client.sismember('hosts', host, function (e, b)
          {
            if (! b) {
              console.log('Add:'+host);
              client.sadd('hosts', host, function (e)
              {
                if (! e) {
                  client.rpush('lists', host, cb);
                } else {
                  cb();
                }
              });
            } else {
              cb();
            }
          });

        } else {
          //RPOPLPUSH
          doWork();
        }
      })();
    } else {
      doWork();
    }
  });
}
function Fetch()
{
  var time = new Date().getTime();
  client.get('last',function(e,d)
  {
    if(time-d>3600000)
    {
      client.set('last',time,GetNew);
    }
    else
    {
      doWork();
    }
  })
}
function error()
{

}