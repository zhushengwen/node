var AV = require('leanengine');
var APP_ID = "juxBYDjwvfSYC5rser4U7oiA-gzGzoHsz";
var APP_KEY = "Dxch4kjJhISfNJ0XmfYvyegR";
var MASTER_KEY = "ENfc9f94XRIQbsWIzSzCUIC5";
AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
var Url = AV.Object.extend('Urls');
var Host = AV.Object.extend('Hosts');
var Counter = AV.Object.extend('Counter');
/**
 * 一个简单的云代码方法
 */
var tool = require('./tool');
AV.Cloud.define('hello', function (request, response)
{
  IncCount(function (j)
  {
    console.log(j);
    GetUrl(j, function (post)
    {
      var url_org = post.get('url');
      console.log('开始：' + url_org);
      tool.downloadFromWeb(url_org, function (data)
      {
        var regexp = /href=("|')(http|https):\/\/([\w-]+\.)+[\w-]+(\/[\w\-\/\?%&=]*)?("|')/ig;
        var match = data.match(regexp);
        if (match) {
          var urls = [];
          var hosts = [];
          for (var i = 0; i < match.length; i ++) //遍历当前数组
          {

            var url = match[i];

            var regexp = /href=("|')((http|https):\/\/([^\/]+)\/?[^'"]*)("|')/i;
            var match2 = url.match(regexp);
            if (match2) {
              if (urls.indexOf(match2[2]) == - 1) {
                urls.push(match2[2]);
              }
              if (hosts.indexOf(match2[4]) == - 1) {
                hosts.push(match2[4]);
              }
            }
          }
          SaveContent(post, data, url_org);
          var i = 0;
          var n = urls.length;
          var save = function ()
          {
            if (i < n) {
              var url = urls[i ++];
              var match2 = url.match(/(http|https):\/\/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/g);
              if (match2) {
                var host = match2[0];

                SaveUrl(url, host, function ()
                {
                  if (i < hosts.length) {
                    SaveHost(hosts[i], save);
                  } else {
                    save();
                  }
                })

              }
            }
            ;

          };
          save();
        }
      });
    });
  });
  response.success('Hello world!');
});

module.exports = AV.Cloud;
function SaveI(i, callback)
{
  var create = function ()
  {

  };
  var query = new AV.Query(Counter);
  query.equalTo("count", "count");
  query.find({
    success: function (results)
    {
      if (results.length > 0) {
        var post = results[0];
        post.set("i",i);
        post.save(null, {
          success: function (post)
          {
            callback();
          }, error: create
        });
      } else {
        create();
      }
    }, error: create
  });
}


function IncCount(callback, fetch)
{
  var retcall = function (i)
  {
    return function ()
    {
      callback(i);
    };
  };
  var create = function ()
  {
    var cer = new Counter();
    cer.set('i', 0);
    cer.set("count", "count");
    cer.save(null, {
      success: retcall(0), error: retcall(0)
    });
  };
  var query = new AV.Query(Counter);
  query.equalTo("count", "count");
  query.find({
    success: function (results)
    {
      if (results.length > 0) {
        var post = results[0];
        if (fetch) {
          return callback(post.get('i'));
        }
        post.fetchWhenSave(true);
        post.increment("i");
        post.save(null, {
          success: function (post)
          {
            var i = post.get('i');
            if (i > 10000) {
             // post.destroy();
            }
            callback(i);
          }, error: retcall(post.get('i'))
        });
      } else {
        create();
      }
    }, error: create
  });
}

AV.Cloud.run('hello', {}, {
  success: function (result)
  {
    console.log("result is 'Hello world!'");
  }, error: function (error)
  {
    console.log("result is 'error!'");
  }
});

function SaveHost(host, callback)
{
  var todo = new Host();
  todo.set('host', host);
  todo.save(null, {
    success: function (todo)
    {
      callback(todo);
    }, error: function (err)
    {
      callback(0);
    }
  })
};
function SaveUrl(url, host, callback)
{
  var todo = new Url();
  todo.set('url', url);
  todo.set('host', host);
  todo.save(null, {
    success: function (todo)
    {
      console.log('OK:'+url);
      callback(todo);
    }, error: function (err)
    {
      console.log('ERR:'+url);
      callback(0);
    }
  })
}
function GetUrl(i, callback)
{
  var query = new AV.Query(Url);
  query.limit(1);
  query.addAscending('i');
  query.greaterThanOrEqualTo("i", i);
  query.find({
    success: function (results)
    {
      if (results.length > 0) {
        var post = results[0];
        SaveI(post.get('i')+1,function(){
          callback(post);
        });
      } else {
        console.log('End!');
      }
    }, error: function ()
    {
      console.log('Err!');
    }
  });
}
function SaveContent(post, content, url)
{
  console.log('--进入--');
  post.set('content', content);
  var regexp = /<title>([^<]*)<\/title>/;
  var match = content.match(regexp);
  if (match) {
    var title = match[1];
    post.set('key', title);
  }
  if (content.indexOf('duoshuo.com/embed.js') != - 1) {
    post.set('type', 'duoshuo');
    post.set('extra', yumin);
    var regexp = /\{short_name:"([^"]*)"\};/;
    var match = content.match(regexp);
    if (match) {
      var yumin = match[1];
      var regexp = /data-thread-key="([^"]*)"/;
      var match = content.match(regexp);

      if (match) {
        var thread_key = match[1];
        var duoshuo_url = "http://" + yumin + ".duoshuo.com/api/threads/listPosts.json?require=nonce&thread_key=" +
        thread_key;
      } else {
        var match2 = url.match(/(http|https):\/\/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/g);
        var host = match2[0];

        var duoshuo_url = "http://" + yumin + ".duoshuo.com/api/threads/listPosts.json?container_url=" + url +
        "&require=site%2Cvisitor%2Cnonce%2Clang%2Cunread%2Clog%2CextraCss&site_ims=1456654251&referer=" + host +
        "&v=16.2.24";
      }
      post.set('extra', duoshuo_url);
      console.log('找到：' + duoshuo_url);
      tool.downloadFromWeb(duoshuo_url, function (data)
      {
        if (data.indexOf('mm.ziliao.link') == - 1) {
          var json = JSON.parse(data);
          var nonce = json.nonce;
          var thread_key = json.thread.thread_id;
          postData(yumin, thread_key, nonce);
        }

      });
    }

  }
  post.save();
}

function postData(yumin, thread_id, nonce)
{
  var sendstr = "美图在这里:" + "http://mm.ziliao.link";
  sendstr = encodeURI(sendstr);
  var url = "http://" + yumin + ".duoshuo.com/api/posts/create.json";
  var Postdata = "thread_id=" + thread_id + "&parent_id=&nonce=" + nonce + "&message=" + sendstr +
  "&author_name=%E7%BE%8E%E5%9B%BE%E5%85%B1%E8%B5%8F&author_email=mm%40ziliao.link&v=15.11.15";
  tool.downloadFromWeb(url, function (data)
  {
    console.log('提交：' + url);
  }, Postdata);
}