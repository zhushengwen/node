/**
 * Created by Administrator on 2016-03-19.
 */
var elasticsearch = require('elasticsearch');
var crypto = require('crypto');
var hosts = require('./hosts');

var file = __dirname + '/../../data/17.txt';
var exist = require('fs').existsSync(file);
var client = new elasticsearch.Client({
  host: exist ? 's.ziliao.link:19302' : 'localhost:9200'
  //,  log: 'trace'
});

//var redis = require("redis").createClient(6379, "localhost");
//redis.on("error", function(err){
//  console.log("Error: " + err);
//});
//redis.on("connect", function(){
//  console.log('Redis Connected!');
//});

function getCount(callback)
{
  client.search({
    searchType:'count',index: 'myindex', type: 'good_host', size: 1
  }).then(function (resp)
  {
    console.log(resp);
    callback(resp.hits.total);
  }, function (err)
  {
    console.trace(err.message);
    callback(NULL);
  });
}

function getItems(count,callback)
{
  client.search({
    index: 'myindex', type: 'good_host', size: count
  }).then(function (resp)
  {
    console.log(resp);
    callback(null,resp.hits.hits);
  }, function (err)
  {
    console.trace(err.message);
    callback(err);
  });
}
hosts.get(function(data){
  console.log(data);
})
//getCount(function (count)
//{
//  if(count)
//  {
//    getItems(count,function(err,resp){
//      if(!err)
//      {
//        console.log(resp);
//      }
//    })
//  }
//})