/*
 * @Description: 
 * @Author: chenjz
 * @Date: 2022-07-14 12:13:21
 * @LastEditors: chenjz
 * @LastEditTime: 2022-07-14 14:30:52
 */
import path from "path";
const __dirname = path.resolve();

export default {
  puppeteerOptions: {
    headless: true
  },
  username: '13822864901', // 登录账号
  password: 'qazjiezi520', // 登录密码
  projectId: '3290617', // 项目id
  saveCompressedPackage: true,
  basePath: path.join(__dirname, 'static'),
  compressedPackageFileName: 'download.zip',
  iconDirName: 'icon',
  // 保留的文件
  retainFileList: [
    'iconfont.css',
    'iconfont.svg',
    'iconfont.ttf',
    'iconfont.woff',
    'iconfont.woff2'
  ],
  // 进行修改的文件
  modifyFileList: [
    {
      fileName: 'iconfont.css',
      update: (content) => {
        return content.replace(/url\(\'iconfont\./g, () => {
          return 'url(\'./static/iconfont.';
        });
      }
    }
  ]
}