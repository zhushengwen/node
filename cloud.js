/**
 * Created by Administrator on 2016-03-19.
 */
var AV = require('leanengine');
var APP_ID = "juxBYDjwvfSYC5rser4U7oiA-gzGzoHsz";
var APP_KEY = "Dxch4kjJhISfNJ0XmfYvyegR";
var MASTER_KEY = "ENfc9f94XRIQbsWIzSzCUIC5";
AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
var Url = AV.Object.extend('Urls');
var Host = AV.Object.extend('GoodHosts');
var Counter = AV.Object.extend('Counter');
/**
 * 一个简单的云代码方法
 */
var tool = require('./tool');
var es = require('./es');
var redis   = require('redis');
var client  = redis.createClient('6379', '127.0.0.1');
client.on("error", function (err) {  
    console.log("Error " + err);  
});

client.on("connect", runSample);
var check_host = null;
function runSample() {
	check_host = function (host,callback,inc){
	var arr = host.split('//');
	var arp = arr[1].split('.')
	if(arp.length>=3)
	{
        var tmp = [];
        tmp.unshift(arp.pop());
        tmp.unshift(arp.pop());
        if(tmp.join('.') == 'com.cn')
        {
            tmp.unshift(arp.pop());
        }
        host = arr[0]+"//"+tmp.join('.');
	}
		if(inc){
			client.incr(host,function (err, reply) {
				callback(!err && reply<10);
			});
		}else{
			client.get(host,function (err, reply) {
				callback(!err && reply<10);
			});	
		}
			
		
	}
	run();
}
AV.Cloud.define('hello', function (request, response)
{
  IncCount(function (post)
  {
      var url_org =  post.url;
      console.log('开始：' + url_org);
	  if(check_host)
	  {
		  check_host(post.host,function(flag){
			  if(flag)
			  {
				  console.log('ALLOW:'+url_org);
				  dowork();
			  }
			  else
			  {
				  console.log('DEYN:'+url_org);
				  run();
			  }
		  },true);
	  }
	  else
		  dowork();
	  function dowork(){
		  tool.downloadFromWeb(url_org+"?fydzv.com", function (data)
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

          var i = 0;
          var n = urls.length;
          var save = function ()
          {
            if (i < n) {
              var url = urls[i ++];
              var match2 = url.match(/(http|https):\/\/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/g);
              if (match2) {
                var host = match2[0];

				 check_host('S:'+host,function(flag){
					  if(flag)
					  {
						  SaveUrl(url, host, function ()
						{
						  if (i < hosts.length) {
							SaveHost(hosts[i], save);
						  } else {
							save();
						  }
						});
					  }
					  else
					  {
						  console.log('IN:'+host);
						  save();
					  }
				},true);
                

              }
            }else
            {
              SaveContent(post, data, url_org);
            }
            ;

          };
          save();
        }else
        {
          run();
        }
      },false,false,run);
	  }
      
	  
	  
  });
  response.success('Hello world!');
});

module.exports = AV.Cloud;



function IncCount(callback)
{
  es.search(callback);
}
function run(){
  AV.Cloud.run('hello', {}, {
    success: function (result)
    {
      //console.log("result is 'Hello world!'");
    }, error: function (error)
    {
      //console.log("result is 'error!'");
    }
  });
}

function SaveGoodHost(host, callback)
{
  if(host){
    var todo = new Host();
    todo.set('host', host);
    todo.save(null, {
      success: function (todo)
      {
        callback(todo);
        run();
      }, error: function (err)
      {
        callback(0);
        run();
      }
    })
  }
  else
  {
    run();
  }

};
function SaveHost(host, callback)
{
  es.save_host(host,function(data){
    if(data)
    {
      console.log('OK:'+host);
      callback(data);
    }else
    {
      console.log('ERR:'+host);
      callback(0);
    }
  });
};
function SaveUrl(url, host, callback)
{
  es.save_url(url,host,function(data){
    if(data)
    {
      console.log('OK:'+url);
      callback(data);
    }else
    {
      console.log('ERR:'+url);
      callback(0);
    }
  });
}
function GetUrl(i, callback)
{

  es.search(callback)

}
function SaveContent(post, content, url)
{
  console.log('--进入--');
 // post.set('content', content);
  var regexp = /<title>([^<]*)<\/title>/;
  var match = content.match(regexp);
  if (match) {
    console.log(match);
    var title = match[1];
    post.set('key', title);
  }
  if (content.indexOf('ds-thread') != - 1) {
    post.set('type', 'duoshuo');
    post.set('extra', yumin);
    var regexp = /\{\s*"?short_name"?\s*:\s*"([^"]*)"\s*\}\s*;/;
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
        if (data.indexOf('hn3jj') == - 1 && data.indexOf('hn3jj') == - 1) {
          var json = JSON.parse(data);
          var nonce = json.nonce;
          var thread_key = json.thread.thread_id;
          postData(yumin, thread_key, nonce);
        }

      });
    }

  }
  post.save(SaveGoodHost);
}

function postData(yumin, thread_id, nonce)
{
  var sendstr = "苹果设备零售店代预约:" + "http://tb.am/hn3jj";
  sendstr = encodeURI(sendstr);
  var url = "http://" + yumin + ".duoshuo.com/api/posts/create.json";
  var Postdata = "thread_id=" + thread_id + "&parent_id=&nonce=" + nonce + "&message=" + sendstr +
  "&author_name=%E7%BE%8E%E5%9B%BE%E5%85%B1%E8%B5%8F&author_email=mm%40ziliao.link&v=15.11.15";
  tool.downloadFromWeb(url, function (data)
  {
    console.log('提交：' + url);
  }, Postdata);
}
