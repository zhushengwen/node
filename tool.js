/**
 * Created by Administrator on 2015/11/7.
 */
exports.downloadFromWeb = function (url, callback, post, bin, errfun, use_proxy,headers)
{
  var args = require('url').parse(url);
  var opt = {
    host: args.hostname, path: args.path,  headers: {
      'Connection': 'keep-alive'
    }
  };
  if(args.port)
  {
    opt.port = args.port;
  }
  if(headers)
  {
    for(var i in headers)
    {
      opt['headers'][i] = headers[i];
    }
  }
  if (post) {
    opt.method = "POST";
  }
  if (use_proxy) {
    opt.host = "localhost";
    opt.path = url;
    opt.port = "8888";
  }
  if (bin) {
    opt.encoding = null;
  }

  var zlib = require('zlib');
  var req = require(args.protocol.slice(0,-1)).request(opt, function (res)
  {
    console.log(url);

    var buffs = [];
    var encoding = res.headers['content-encoding'];
    if (encoding === 'undefined') {
      res.setEncoding('utf-8');
    }

    res.on('data', function (d)
    {
      buffs.push(d);
    }).on('end', function (f)
    {
      var buffer = Buffer.concat(buffs);
      var defunc = function (err, decoded)
      {
        if (! bin && ! err) {
          buffer = decoded;
        }
        if(buffer)
        buffer = buffer.toString();
        else buffer = '';
        callback(buffer);
      };
      if (encoding == 'gzip') {
        zlib.gunzip(buffer, defunc);
      } else if (encoding == 'deflate') {
        zlib.inflate(buffer,defunc);
      } else {
       defunc(true);
      }

    });
  }).on('error', function (e)
  {
    console.log(url);
    console.error(e);
    if (errfun) {
      errfun();
    }
  });
  if (post) {
    req.write(post + "\n");
  }
  req.end();

};
exports.check = function (path)
{
  return exports.stat(path);
};

exports.checkFile = function (path)
{
  return exports.stat(path) == 1;
};

exports.checkDir = function (path)
{
  return exports.stat(path) == 2;
};

exports.stat = function (path)
{
  try {
    var stats = require('fs').statSync(path);
    if (stats) {
      if (stats.isFile()) {
        return 1;
      }
      if (stats.isDirectory()) {
        return 2;
      }
    }
  } catch (e) {
  }
  return 0;
};

exports.mkdir = function (dirpath, callback)
{
  var mkdir = arguments.callee;
  require('fs').stat(dirpath, function (er, stats)
  {
    if (stats && stats.isFile()) {
      callback(false);
    } else if (! er || (stats && ! stats.isDirectory())) {
      callback(dirpath);
    } else {
      //尝试创建父目录，然后再创建当前目录
      mkdir(require('path').dirname(dirpath), function ()
      {
        require('fs').mkdir(dirpath, function (err)
        {
          callback(err ? false : dirpath);
        });
      });
    }
  });
};

exports.mkdirSync = function (dirpath)
{
  switch (exports.check(dirpath)) {
    case 1:
      return false;
    case 2:
      return true;
    default:
      var path = require('path').dirname(dirpath);
      switch (exports.check(path)) {
        case 1:
          return false;
        //已经有父目录了,就创建该目录
        case 2:
          break;
        //如果连父目录都还没有,先创建父目录,再创建本目录
        default:
          exports.mkdirSync(path);
      }
      require('fs').mkdirSync(dirpath);
  }
  return exports.checkDir(dirpath);
};

exports.saveFile = function (filepath, data, callback)
{
  require('fs').writeFile(filepath, data, function (err)
  {
    if (err) {
      console.error(err);
    } else {
      console.log('写入成功:' + filepath);
    }
    if (callback) {
      callback(err);
    }
  });
};

exports.saveFileSync = function (filepath, data)
{
  require('fs').writeFileSync(filepath, data);
};

exports.cache = function (name, data)
{
  var path = __dirname + '/cache/';
  var exists = exports.checkDir(path) || exports.mkdirSync(path);
  var file = path + name;
  if (exists) {
    try {
      if (data) {
        require('fs').writeFileSync(file, JSON.stringify(data));
        return true;
      } else {
        if (exports.checkFile(file)) {
          return JSON.parse(require('fs').readFileSync(file));
        }
      }
    } catch (e) {
    }
  }
  return false;
};