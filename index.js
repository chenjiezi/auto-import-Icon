/*
 * @Description: 自动导入icon
 * @Author: chenjz
 * @Date: 2022-07-09 11:11:13
 * @LastEditors: chenjz
 * @LastEditTime: 2022-07-13 15:06:22
 */
import Puppeteer from "puppeteer";
import https from "https";
import fs from "fs";
import compressing from "compressing";
import path from "path";

import operationFile from './operationFile.js';

const __dirname = path.resolve();

(async () => {
  try {
    console.log('=========开始自动导入图标资源============');
    const browser = await Puppeteer.launch({
      headless: true,   //有浏览器界面启动
      // slowMo: 100,       //放慢浏览器执行速度，方便测试观察
      args: [            //启动 Chrome 的参数，详见上文中的介绍
        '–no-sandbox',
        '--window-size=500,500'
      ],
    });
    const username = '13822864901'; // 登录账号 TODO:可配置
    const password = 'qazjiezi520'; // 登录密码 TODO:可配置
    const projectId = '3290617'; // 项目id TODO:可配置
    const loginPage = 'https://www.iconfont.cn/login';
    const loginApi = 'https://www.iconfont.cn/api/account/login.json';
    const downloadUrl = 'https://www.iconfont.cn/api/project/download.zip';
    const saveCompressedPackage = true;

    let page = await browser.newPage();
    // 监听http请求响应
    await page.on('response', async (response) => {
      if (response.url() === loginApi) {
        console.log('=========登录请求响应============');
        if (response.status() === 200) {
          // 登录失败，返回错误信息
          try {
            const json = await response.json()
            if (json.code !== 200) {
              await browser.close();
              throw `登录请求响应实体：${JSON.stringify(json)}`;
            }
          } catch (e) {
            // 登录成功没有返回响应实体，会导致报错，如果登录成功，跳过这个报错。
            const loginSuccessErrMsg = 'ProtocolError: Could not load body for this request. This might happen if the request is a preflight request.';
            if (e.toString() !== loginSuccessErrMsg) {
              await browser.close();
              throw new Error(e);
            }
          }
          console.log('=========获取cookie============');
          const cookies = await page.cookies();
          const cookieObj = {}
          cookies.forEach(item => cookieObj[item.name] = item.value);
          // console.log('cookieObj:', cookieObj);
          console.log('=========下载图标资源压缩包============');
          const options = {
            hostname: 'www.iconfont.cn',
            path: `/api/project/download.zip?pid=${projectId}&ctoken${cookieObj.ctoken}`,
            headers: {
              cookie: `EGG_SESS_ICONFONT=${cookieObj.EGG_SESS_ICONFONT};ctoken=${cookieObj.ctoken};`
            },
            method: 'GET',
          };
          const req = https.request(options, async (res) => {
            let data = [];
            res.on('data', (chunk) => {
              console.log(`Received ${chunk.length} bytes of data.`);
              data.push(chunk);
            });
            res.on('end', () => {
              const content = Buffer.concat(data);
              // console.log('content:', content);
              console.log('=========图标资源压缩包下载完毕============');

              if (saveCompressedPackage) {
                const zipFilePath = path.join(__dirname, 'static/download.zip');
                fs.writeFile(zipFilePath, content, (err) => {
                  if (err) throw err;
                  console.log('压缩包保存路径：', zipFilePath);
                });
              }

              const decompressPath = path.join(__dirname, 'static/');
              compressing.zip.uncompress(content, decompressPath)
                .then(() => {
                  console.log('压缩包解压路径：', decompressPath);
                  console.log('=========对图标资源进行修改============');
                  operationFile();
                })
                .catch((err) => {
                  console.error('压缩包解压失败：' + err.toString());
                })
              // const zipFilePath = path.join(__dirname, 'static/download.zip');
              // fs.writeFile(zipFilePath, content, (err) => {
              //   if (err) throw err;
              //   console.log('=========图标资源压缩包下载完毕============');
              //   const decompressPath = path.join(__dirname, 'static/');
              //   compressing.zip.uncompress(content, decompressPath)
              //     .then(() => {
              //       console.log('压缩包解压路径：', decompressPath);
              //       console.log('=========对图标资源进行修改============');
              //       operationFile();
              //     })
              //     .catch((err) => {
              //       console.error('压缩包解压失败：' + err.toString());
              //     })
              // })
              browser.close();
            });
          });

          req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
          });
          req.end();
        } else {
          await browser.close();
          throw new Error(`登录请求失败[code=${response.status()}]`)
        }
      }
    });

    // 进入登录页面
    await page.goto(loginPage);

    await page
      .waitForSelector('#userid')
      .then(async () => {
        console.log('=========登录操作============');
        await page.type('#userid', username);
        await page.type('#password', password);
        await page.keyboard.press('Enter');
        console.log('=========登录表单验证============');
        _check();
      });

    async function _check() {
      const useridErrorLabel = await page.$('#userid-error');
      const passwordErrorLabel = await page.$('#password-error');
      let useridErrText = '';
      let passwordErrText = '';

      if (useridErrorLabel) {
        useridErrText = await page.$eval('#userid-error', el => el.textContent);
      }
      if (passwordErrorLabel) {
        passwordErrText = await page.$eval('#password-error', el => el.textContent);
      }
      useridErrText && console.log('iconfont：', useridErrText);
      passwordErrText && console.log('iconfont：', passwordErrText);
      if (useridErrText || passwordErrText) {
        await browser.close();
      }
    }
  } catch (e) {
    console.log('捕获错误:', e.toString())
    await browser.close();
  }

})();