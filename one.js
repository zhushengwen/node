/**
 * Created by Administrator on 2016-04-08.
 */
var tool = require('./tool');
var ftc = require('./ftc');
var send = require('./send');
var Promise = require('promise');
var count = 0;
exports.run = function (host, redis, callback2)
{
  count++;
  if(count>10)
  {
    return callback2();
  }
  //弹出一个地址
  var key = 'lists:' + host;
  new Promise(function (resolve, reject)
  {
    redis.rpop(key, function (e, d)
    {
      resolve(host + d);
    });
  }).then(function (url_org)
  {
    if (url_org) {
      do_one_url(url_org, host);
    } else {
      callback2();
    }

  }).catch(function (error)
  {
    //console.log(error);
    throw error;
    callback2();
  });
  function callback(rt)
  {
    if (rt) {
      callback2();
    } else {
      exports.run(host, redis, callback2);
    }
  }

  function do_one_url(url_org, host)
  {
    console.log('开始：'+count+':' + url_org);

    tool.downloadFromWeb(url_org, function (data)
    {
      process_data(url_org, data, host, redis, callback);
    }, false, false,callback);

  }
};

function process_data(org_url, data, host, redis, callback)
{
  var key = 'lists:' + host;
  var str = "href=(\"|')(" + host + "/)?(\\S+)(\"|')";
  str = str.replace(/\./g, "\\.").replace(/\//g, "\\/");
  var regexp = new RegExp(str, "ig");
  var match = data.match(regexp);
  if (match) {
    var urls = [];
    var hosts = [];
    for (var i = 0; i < match.length; i ++) //遍历当前数组
    {
      var rurl = match[i];
      var regexp = /href=("|')(.*)("|')/i;
      var match2 = rurl.match(regexp);
      if (match2) {
        var url = match2[2];
        var hl = host.length;
        if (url.indexOf(host) === 0) {
          url = url.substr(hl);
        } else if (url.indexOf('/') === 0) {
          url = url;
        } else {
          var parsesd = require('url').parse(org_url);
          var rel_url = parsesd.pathname;
          var start = rel_url.lastIndexOf('/');
          if (start === - 1) {
            url = "/" + url;
          } else {
            url = rel_url.substr(0, start + 1) + url;
          }
        }
        if (urls.indexOf(url) == - 1) {
          if (url && org_url != host + url) {
            urls.push(url);
          }
        }
      }
    }
    var save = function (i, callback, n)
    {
      var sht_url = urls[i];
      var ckey = 'COUNT:' + host;
      redis.pfadd(ckey, sht_url, function (e, d)
      {
        if (! e && d) {
          redis.lpush(key, sht_url, callback);
        } else {
          callback();
        }
      });
    };
    ftc.ftc(urls.length, save, 6, function ()
    {
      console.log('处理完毕:' + org_url);
      send.SaveContent(host, data, org_url, redis, function (rm)
      {
        //是否删除这条URL,删除,证明是有效POST,下次将不再使用,成功了
        if (rm) {
          callback(true);
        } else {
          redis.lpush(key, org_url.substr(host.length), function ()
          {
            callback();
          })
        }
      });
    });
  } else {
    callback();
  }
}