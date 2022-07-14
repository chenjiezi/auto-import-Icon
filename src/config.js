export default {
  puppeteerOptions: {
    headless: true
  },
  username: '13822864901', // 登录账号
  password: 'qazjiezi520', // 登录密码
  projectId: '3290617', // 项目id
  basePath: './src/static',
  iconfontFolder: 'iconfont',
  saveCompressedPackage: false,
  compressedPackageFileName: 'download.zip',
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