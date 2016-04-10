/**
 * Created by Administrator on 2016-03-19.
 */
var elasticsearch = require('elasticsearch');
var crypto = require('crypto');

var init_host = 'www.2345.com';
var init_url = 'http://' + init_host + '/';
var file = __dirname + '/../../data/17.txt';
var exist = require('fs').existsSync(file);
var client = new elasticsearch.Client({
  host: exist ? 's.ziliao.link:19302' : 'localhost:9200'
  //,  log: 'trace'
});
var Post = function (_id, host)
{
  var doc = {};
  this.set = function (name, value)
  {
    doc[name] = value;
  };
  var _id = _id;
  var host = host;
  this.save = function (callback)
  {
    if (this.url == init_url) {
      callback();
      return;
    }
    doc.crawdate = new Date().toJSON();
    client.update({
      index: 'myindex', type: 'url', id: _id, body: {
        doc: doc
      }
    }, function (error, response)
    {
      if (error) {
        console.log(error);
        callback();
      } else {
        if ('type' in doc) {

          exports.save_good_host(host, function (ok)
          {
            if (ok) {
              callback(host);
              console.log('InseredInToDB:' + host);
            } else {
              callback();
            }
          });
        } else {
          callback();
        }
      }
    });
  };
}
exports.save_url = function (url, host, callback)
{
  exports.inc('url_counter', function (i)
  {
    client.create({
      index: 'myindex', type: 'url', id: crypto.createHash('md5').update(url).digest('hex'), body: {
        url: url, host: host, date: new Date().toJSON(), seq: i
      }
    }, function (error, response)
    {
      if (! error) {
        callback(response._id);
      } else {
        callback(0);
      }
    });
  });
};
exports.save_host = function (host, callback)
{
  exports.inc('host_counter', function (i)
  {
    client.create({
      index: 'myindex', type: 'host', id: crypto.createHash('md5').update(host).digest('hex'), body: {
        host: host, date: new Date().toJSON(), seq: i
      }
    }, function (error, response)
    {
      if (! error) {
        callback(response._id);
      } else {
        callback(0);
      }
    });
  });
};

exports.save_good_host = function (host, callback)
{
  exports.inc('good_host_counter', function (i)
  {
    client.create({
      index: 'myindex', type: 'good_host', id: crypto.createHash('md5').update(host).digest('hex'), body: {
        host: host, date: new Date().toJSON(), seq: i
      }
    }, function (error, response)
    {
      if (! error) {
        callback(response._id);
      } else {
        callback(0);
      }
    });
  });
};

exports.search = function (callback)
{
  exports.inc('search_counter', function (i)
  {
    console.log('ES-INDEXER:' + i);
    client.search({
      index: 'myindex', type: 'url', size: 1, body: {
        query: {
          "range": {
            "seq": {
              "gte": i, "boost": 2.0
            }
          }
        }, sort: {
          "seq": {"order": "asc"}
        }
      }
    }).then(function (resp)
    {
      var hits = resp.hits.hits;
      if (hits.length == 1) {
        var post = new Post(hits["0"]._id, hits["0"]._source.host);
        post.url = hits["0"]._source.url;
        var seq = hits["0"]._source.seq;
        if (seq > i) {
          exports.set('search_counter', function ()
          {
            callback(post);
          }, seq + 1);
        } else {
          callback(post);
        }
      } else {
        var post = new Post('initial_url', init_host);
        post.url = init_url;
        callback(post);
      }

    }, function (err)
    {
      console.trace(err.message);
      var post = new Post('initial_url', init_host);
      post.url = init_url;
      callback(post);
    });
  })

};
exports.inc = function (name, callback)
{
  client.update({
    index: 'myindex', type: 'mycounter', id: name, fields: 'iid', retryOnConflict: 5, body: {
      "script": "ctx._source.iid += bulk_size", "params": {"bulk_size": 1}, "lang": "groovy", "upsert": {
        "iid": 1
      }
    }
  }, function (error, response)
  {
    if (! error) {
      callback(response.get.fields.iid["0"]);
    } else {
      console.log(error);
    }
  });
};

exports.set = function (name, callback, num)
{
  client.update({
    index: 'myindex', type: 'mycounter', id: name, fields: 'iid', retryOnConflict: 5, body: {
      "script": "ctx._source.iid = bulk_size", "params": {"bulk_size": num}, "lang": "groovy", "upsert": {
        "iid": num
      }
    }
  }, function (error, response)
  {
    if (! error) {
      callback(response.get.fields.iid["0"]);
    } else {
      console.log(error);
    }
  });
};