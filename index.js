/*
 * @Description: 自动导入icon
 * @Author: chenjz
 * @Date: 2022-07-09 11:11:13
 * @LastEditors: chenjz
 * @LastEditTime: 2022-07-09 17:57:22
 */

// const Crawler = require('crawler')

// const c = new Crawler({
//   maxConnections: 1,
//   // rateLimit: 3000,
//   callback: function (error, res, done) {
//     if (error) {
//       console.log('error=>', error);
//     } else {
//       const $ = res.$;
//       console.log('res:', JSON.stringify(res.options));
//       // console.log('html=>', $('html').toString());
//     }
//     done();
//   }
// })

// c.queue({
//   // url: 'https://www.iconfont.cn/manage/index?spm=a313x.7781069.1998910419.20&manage_type=myprojects&projectId=3290617'
//   url: 'https://www.runshihua.com/'
// })


// const cheerio = require('cheerio');
// const https = require('https')

// const icon = 'https://www.iconfont.cn/manage/index?spm=a313x.7781069.1998910419.20&manage_type=myprojects&projectId=3290617'
// const weixin = 'https://mp.weixin.qq.com/s/ny2C_v9hbrX2fQyQMX1D7Q'



// https.get(icon, (res) => {
//   let html = '';
//   res.setEncoding('utf-8');
//   res.on('data', function (chunk) {
//     html += chunk;
//   })
//   res.on('end', function () {
//     const $ = cheerio.load(html, { decodeEntities: false });

//     // console.log($('#app').toString());
//     console.log('html:', html);
//   })
// })

// const request = require('request');
// request(icon, function (err, res, body) {
//   if (!err && res.statusCode === 200) {
//     console.log('body:', body);
//   }
// })

const { captureHeapSnapshot, findObjectWithProperties } = require('puppeteer-heap-snapshot')
const Puppeteer = require('puppeteer');

// async function fun() {
//   const browser = await Puppeteer.launch();
//   const page = await browser.newPage();

//   await page.goTo("https://google.com")

//   const heapSnapshot = await captureHeapSnapshot(await page.target());
//   const objects = findObjectsWithProperties(heapSnapshot, ["foo", "bar"]);
//   console.log('objects:', objects);
// }

// fun()

(async () => {
  const browser = await Puppeteer.launch({
    headless: false,   //有浏览器界面启动
    // slowMo: 100,       //放慢浏览器执行速度，方便测试观察
    args: [            //启动 Chrome 的参数，详见上文中的介绍
      '–no-sandbox',
      '--window-size=1280,960'
    ],
  });
  let page = await browser.newPage();
  // 进入阿里巴巴矢量库首页
  await page.goto('https://www.iconfont.cn/');
  // 跳转到登录页面
  const loginBtn = await page.$('.signin');
  await loginBtn.click();

  // 登录操作

  // 延迟后操作
  // await page.waitForTimeout(2000);
  // await page.type('#userid', '13822864901');
  // await page.type('#password', 'qazjiezi520');
  // await page.keyboard.press('Enter');

  // dom元素生成后操作
  page
    .waitForSelector('#userid')
    .then(async () => {
      await page.type('#userid', '13822864901');
      await page.type('#password', 'qazjiezi520');
      await page.keyboard.press('Enter');
    })

  // page
  //   .waitForSelector('a[href="/manage/index?manage_type=myprojects"]')
  //   .then(async () => {
  //     const loginBtn = await page.$('a[href="/manage/index?manage_type=myprojects"]');
  //     await loginBtn.click();
  //   })



})();