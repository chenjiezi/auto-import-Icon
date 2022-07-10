/*
 * @Description: 自动导入icon
 * @Author: chenjz
 * @Date: 2022-07-09 11:11:13
 * @LastEditors: chenjz
 * @LastEditTime: 2022-07-09 17:57:22
 */
const Puppeteer = require('puppeteer');
const https = require('https');
const request = require('request');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '/target.zip');
const stream = fs.createWriteStream(filePath);
// TODO: 跳转页面，等待dom加载完，再进行后续操作

(async () => {
  const browser = await Puppeteer.launch({
    headless: true,   //有浏览器界面启动
    // slowMo: 100,       //放慢浏览器执行速度，方便测试观察
    args: [            //启动 Chrome 的参数，详见上文中的介绍
      '–no-sandbox',
      '--window-size=1920,1080'
    ],
  });
  let page = await browser.newPage();
  // page.on('load', (load) => console.log('Page loaded!', load));
  page.on('response', (response) => {
    if (response.url().includes('login.json')) {
      console.log('response.url():', response.url());
      console.log('response.headers():', response.headers()['set-cookie']);
    }
  });
  // await page.setViewport({
  //   width: 1920,
  //   height: 1080
  // });
  await page.goto('https://www.iconfont.cn/login');
  console.log('去登录页');
  try {
    await page
      .waitForSelector('#userid')
      .then(async () => {
        await page.type('#userid', '13822864901');
        await page.type('#password', 'qazjiezi520');
        await page.keyboard.press('Enter');
        console.log('登录成功~~');
      });
    console.log('去首页');
    await page
      .waitForSelector('.home')
      .then(async () => {
        const cookies = await page.cookies();
        let cookie = '';
        let ctoken = '';
        const prejectId = '3290617';
        cookies.forEach(c => {
          if (c.name === 'EGG_SESS_ICONFONT') {
            cookie += `${c.name}=${c.value};`;
          }
          if (c.name === 'ctoken') {
            ctoken = c.value;
            cookie += `${c.name}=${c.value};`;
          }
        })
        console.log('获取cookie=>', cookie);
        await browser.close();
        // request(`https://www.iconfont.cn/api/project/download.zip?pid=${prejectId}&ctoken=${ctoken}`, {
        //   headers: {
        //     'cookie': cookie
        //   }
        // })
        //   .pipe(stream)
        //   .on('close', async function () {
        //     console.log('图标资源压缩包下载完毕!')
        //     await browser.close();
        //   })
      });
    
  } catch (e) {
    console.log('捕获错误:', e.toString())
    await browser.close();
  }
})();


// (async () => {
//   const browser = await Puppeteer.launch({
//     headless: false,   //有浏览器界面启动
//     // slowMo: 100,       //放慢浏览器执行速度，方便测试观察
//     args: [            //启动 Chrome 的参数，详见上文中的介绍
//       '–no-sandbox',
//       '--window-size=500,500'
//     ],
//   });
//   let page = await browser.newPage();
//   // 进入阿里巴巴矢量库首页
//   console.log('进入阿里巴巴矢量库首页')
//   await page.goto('https://www.iconfont.cn/');

//   console.log('跳转到登录页面')
//   // 跳转到登录页面
//   const loginBtn = await page.$('.signin');
//   await loginBtn.click();

//   // 登录操作
//   await page
//     .waitForSelector('#userid')
//     .then(async () => {
//       await page.type('#userid', '13822864901');
//       await page.type('#password', 'qazjiezi520');
//       await page.keyboard.press('Enter');
//       console.log('自动登录')
//   })

//   await page.waitForTimeout(2000)
  
//   await page
//     .waitForSelector('.nav-item-link')
//     .then(async () => {
//       page.$x('//span[text()="资源管理"]/parent::a').then(a => {
//         a[0].click();
//       });
//     })

//   await page.waitForTimeout(2000)

//   await page.$x('//a[text()="我的项目"]').then(a => {
//     a[0].click();
//   });

//   await page.waitForTimeout(2000)
//   const href = await page.$eval('#J_project_detail > div:nth-child(2) > a', el => el.href);

//   console.log('href:', href);

//   const cookies = await page.cookies();

//   let cookie = '';
  
//   cookies.forEach(c => {
//     if (c.name === 'EGG_SESS_ICONFONT' || c.name === 'ctoken') {
//       console.log(c.name+'=>', c.value)
//       cookie += `${c.name}=${c.value};`;
//     }
//   })

//   request(href,{
//     "headers": {
//       "cookie": cookie
//     }
//   })
//   .pipe(stream)
//   .on('close', function (err) {
//     if (err) {
//       console.log('err:', err)
//     }
//   })

//   // await page.waitForTimeout(2000)
  
//   // await browser.close();

// })();
