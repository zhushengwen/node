var tool = require('./tool');

exports.SaveContent = function (host, content, url, redis, callback)
{

  var post = {};
  console.log('--进入--');
  // post.set('content', content);
  var regexp = /<title>([^<]*)<\/title>/;
  var match = content.match(regexp);
  if (match) {
    var title = match[1];
    //post.set('key', title);
    post.key = title;
  }
  if (content.indexOf('class="ds-thread"') != - 1) {
    //post.set('type', 'duoshuo');
    post.type = 'duoshuo';
    post.extra = yumin;
    post.date = new Date().toJSON();
    //post.set('extra', yumin);
    var regexp = /\{short_name:"([^"]*)"\};/;
    var match = content.match(regexp);
    if (! match) {
      match = content.match(/"short_name":"([^"]*)"/);
    }
    if (match) {
      var yumin = match[1];
      var regexp = /data-thread-key="([^"]*)"/;
      var match = content.match(regexp);
      var thread_key = null;
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
      post.extra = duoshuo_url;
      console.log('找到：' + duoshuo_url);
      tool.downloadFromWeb(duoshuo_url, function (data)
      {
        if (data.indexOf('mm.ziliao.link') == - 1 && data.indexOf('fydzv') == - 1) {
          var json = JSON.parse(data);
          var nonce = json.nonce;
          if (json.thread && json.thread.thread_id) {
            var thread_key = json.thread.thread_id;
            postData(yumin, thread_key, nonce, function ()
            {
              SaveData(host, data, redis, function ()
              {
                callback(true);
              });
            });
          } else {
            callback(false);
          }
        } else {
          callback(false);
        }

      }, false, false, function ()
      {
        callback(true);
      });
    } else {
      callback(false);
    }
  } else {
    callback(false);
  }
  //post.save(SaveGoodHost);
  //todo save and callback
};

function postData(yumin, thread_id, nonce, callback)
{
  var sendstr = "点开有惊喜:" + "https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&tn=monline_3_dg&wd=fydzv.com&oq=fydzv%3A&rsv_pq=b50f011b0024d950&rsv_t=2973TgR9yyAFW4NM4VXsWaxaawgEiSED%2Blo1f7u9UFGAGPsNW0aXj8hvohZadHEUY5uk&rsv_enter=1&inputT=6692&rsv_sug3=14&rsv_sug1=9&rsv_sug7=000&rsv_sug2=0&rsv_sug4=7598&rsv_sug=1";
  sendstr = encodeURI(sendstr);
  var url = "http://" + yumin + ".duoshuo.com/api/posts/create.json";
  var Postdata = "thread_id=" + thread_id + "&parent_id=&nonce=" + nonce + "&message=" + sendstr +
  "&author_name=%E7%BE%8E%E5%9B%BE%E5%85%B1%E8%B5%8F&author_email=mm%40ziliao.link&v=15.11.15";
  var header = {'Cookie': 'duoshuo_unique=61ba27e229054400'};
  tool.downloadFromWeb(url, function (data)
  {
    console.log('提交：' + url);
    callback();
  }, Postdata, false, callback,false);
}

function SaveData(host, data, redis, callback)
{
  var key = 'GOODPOST:' + host;
  redis.lpush(key, JSON.stringify(data), callback);
}