/*
 * @Description: 自动导入icon
 * @Author: chenjz
 * @Date: 2022-07-09 11:11:13
 * @LastEditors: chenjz
 * @LastEditTime: 2022-07-14 14:30:40
 */
import Puppeteer from "puppeteer";
import https from "https";
import fs from "fs";
import fsPromises from 'fs/promises';
import compressing from "compressing";
import path from "path";
import operationFile from './operationFile.js';
import config from './config.js';

const loginPage = 'https://www.iconfont.cn/login'; // 登录页面
const loginApi = 'https://www.iconfont.cn/api/account/login.json'; // 登录接口
const downloadUrl = 'https://www.iconfont.cn/api/project/download.zip'; // 图标资源下载地址

(async () => {
  try {
    console.log('=========开始自动导入图标资源============');
    // 启动浏览器
    const browser = await Puppeteer.launch(config.puppeteerOptions || {});
    // 创建页面标签
    const page = await browser.newPage();
    // 进入登录页面
    await page.goto(loginPage);

    console.log('=========进入登录页面============');

    // 监听登录请求响应
    await page.on('response', async (response) => {
      if (response.url() === loginApi) {
        if (response.status() === 200) {

          console.log('=========登录成功============');

          // 处理登录失败
          await handleLoginError(response);
          // 获取cookie
          const cookieObj = await getCookie();
          // 下载图标资源
          await downloadZip(cookieObj);
        } else {
          await browser.close();
          throw new Error(`登录请求失败[code=${response.status()}]`)
        }
      }
    });

    console.log('=========进行登录操作============');

    await page
      .waitForSelector('#userid')
      .then(async () => {
        await page.type('#userid', config.username);
        await page.type('#password', config.password);
        await page.keyboard.press('Enter');
        _check();
      });

    // 下载图标资源压缩包
    async function downloadZip(cookieObj) {
      console.log('=========下载图标资源压缩包============');
      const url = `${downloadUrl}?pid=${config.projectId}&ctoken${cookieObj.ctoken}`
      https.get(url, {
        headers: {
          cookie: `EGG_SESS_ICONFONT=${cookieObj.EGG_SESS_ICONFONT};ctoken=${cookieObj.ctoken};`
        }
      }, async (res) => {
        let data = [];

        res.on('data', (chunk) => {
          console.log(`Received ${chunk.length} bytes of data.`);
          data.push(chunk);
        });

        res.on('end', async () => {
          console.log('=========图标资源压缩包下载完毕============');
          const content = Buffer.concat(data);

          // 保留压缩包
          if (config.saveCompressedPackage) {
            const compressedPackagePath = path.join(config.basePath, config.compressedPackageFileName);
            fsPromises.writeFile(compressedPackagePath, content);
            console.log('压缩包保存路径：', compressedPackagePath);
          }
          // 解压压缩包
          compressing.zip.uncompress(content, config.basePath)
            .then(() => {
              console.log('压缩包解压路径：', config.basePath);
              // 对图标资源进行修改
              operationFile();
            })
            .catch((err) => {
              console.error('压缩包解压失败：' + err.toString());
            });

          await browser.close();
        });
      }).on('error', (e) => {
        console.error(`下载图标资源压缩包失败: ${e.message}`);
      });
    }

    // 处理登录报错
    async function handleLoginError(response) {
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
    }

    // 获取cookie
    async function getCookie() {
      const result = {};
      const cookies = await page.cookies();
      cookies.forEach(item => result[item.name] = item.value);
      return result;
    }

    // 登录表单验证
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