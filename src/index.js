/**
 * auto import icon for node
 */
import puppeteer from "puppeteer";
import https from "https";
import fsPromises from 'fs/promises';
import compressing from "compressing";
import path from "path";
import operationFile from './operationFile.js';
import config from './config.js';

const LOGIN_URL = 'https://www.iconfont.cn/login';
const LOGIN_API = 'https://www.iconfont.cn/api/account/login.json';
const DOWNLOAD_URL = 'https://www.iconfont.cn/api/project/download.zip';

async function app() {
  try {
    console.log('=========开始自动导入图标资源============');
    const browser = await puppeteer.launch(config.puppeteerOptions || {});
    const page = await browser.newPage();
    await page.goto(LOGIN_URL);

    console.log('=========进入登录页面============');

    // 监听登录请求响应
    await page.on('response', async (response) => {
      if (response.url() === LOGIN_API) {
        if (response.status() === 200) {
          // 处理登录失败
          await handleLoginError(response);

          console.log('=========登录成功============');

          // 获取cookie
          const cookieObj = await getCookie();
          // 下载图标资源
          await downloadZip(cookieObj);
        } else {
          await browser.close();
          throw new Error(`登录失败[code=${response.status()}]`)
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
      console.log(`图标项目pid：${config.projectId}`);
      const url = `${DOWNLOAD_URL}?pid=${config.projectId}&ctoken${cookieObj.ctoken}`
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
          console.error(`登录失败：${JSON.stringify(json)}`);
          await browser.close();
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
}

app();
