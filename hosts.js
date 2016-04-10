var tool = require('./tool');

exports.get = function (callback)
{
  var url = "https://api.leancloud.cn/1.1/classes/GoodHosts?limit=1000";
  tool.downloadFromWeb(url, callback, 0, 0, callback, false, {
    "X-LC-Id": "juxBYDjwvfSYC5rser4U7oiA-gzGzoHsz",
    "X-LC-Key": "Dxch4kjJhISfNJ0XmfYvyegR",
    "Host": "api.leancloud.cn",
    "User-Agent": "Violin",
    "Content-Type": "application/json"
  });
}