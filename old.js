exports.gostart = function (host, redis, callback2)
{
  var des = [
    "http://www.iguoguo.net", "http://www.mobileui.cn", "http://www.xueui.cn", "http://www.lipian.com",
    "http://www.0512dz.com", "http://www.vipfenxiang.com", "http://www.touxiao.com", "http://www.hunbohui.cn",
    "http://www.niudana.com", "http://www.benbenla.cn", "http://www.xingtan001.com", "http://blog.xiachufang.com",
    "http://www.zhuankezhijia.com", "http://www.blogchina.com", "http://www.mantuhui.com", "http://cn.engadget.com",
    "http://ear.duomi.com", "http://v.gxdxw.cn", "http://www.lbldy.com", "http://www.qwq4.com", "http://shuabao.net",
    "http://www.dongxipuzi.com", "http://www.ishuhui.com", "http://www.joke98.com", "http://www.aiyingli.com",
    "http://www.exiaoba.com", "http://www.gua5.com", "http://www.shejidaren.com", "http://www.fisherv.com",
    "http://sudasuta.com", "http://www.secretmine.net", "http://www.mydll.com.cn", "http://m.vipcn.com",
    "http://www.chaojizuowen.com", "http://www.51kuqiao.com", "http://top.canypp.com", "http://lol.sgamer.com",
    "http://www.gamelook.com.cn", "http://www.2cyxw.com", "http://www.imedia.com.cn", "http://www.11ey.com",
    "http://xin.sgamer.com", "http://live.sportscn.com", "http://www.ovip.cn", "http://www.voonge.com",
    "http://nonzen.com", "http://www.sayloving.com", "http://www.lanjingtmt.com", "http://www.255star.com",
    "http://www.moneydao.net", "http://www.xiaoyuxitong.com", "http://www.iwin10.cc", "http://www.xitongzhijia.net",
    "http://www.gezila.com", "http://www.lxxcom.com", "http://www.chagexin.com", "http://www.eyunsou.com",
    "http://news.tielu.cn", "http://www.zhitouwang.cn", "http://www.dooo.cc", "http://hicape.com",
    "http://www.dilidili.com", "http://www.huaidan2.com", "http://www.fzdm.com", "http://www.77vcd.com",
    "http://www.vice.cn", "http://www.dianshi.com", "http://www.win8.net", "http://iphone.265g.com",
    "http://www.xihuankan.net", "http://www.sino-manager.com", "http://www.forexpress.hk", "http://www.aboutrun.com",
    "http://www.gjnews.cn", "http://www.chuapp.com", "http://zhoukan.cc", "http://www.tingfanyin.com",
    "http://geekcar.com", "http://www.52wubi.com", "http://www.xinjunshi.com", "http://www.junpin360.com",
    "http://wh.focus.cn"
  ];

  var len = des.length;
  var idx = Math.floor(Math.random() * len);

  return des[idx] + '/';

}