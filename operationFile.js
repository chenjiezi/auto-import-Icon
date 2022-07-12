/*
 * @Description: 
 * @Author: chenjz
 * @Date: 2022-07-12 16:19:15
 * @LastEditors: chenjz
 * @LastEditTime: 2022-07-12 17:39:12
 */
const fs = require('fs');
const path = require('path');

const f = (p) => path.join(__dirname, p);
// 保留的文件
const retainFileList = [
  'iconfont.css',
  'iconfont.svg',
  'iconfont.ttf',
  'iconfont.woff',
  'iconfont.woff2'
];
// 进行修改的文件
const modifyFileList = 'iconfont.css';
const iconFile = f('static');
const projectId = '3290617';

module.exports = function () {
  fs.readdir(iconFile, (err, files) => {
    if (err) throw err;
    let iconDir = '';
    files.forEach(file => {
      if (file.startsWith(`font_${projectId}`)) {
        iconDir = file;
      }
    });
    if (iconDir) {
      let basePath = f(`static/${iconDir}`);
      fs.readdir(basePath, (err, files) => {
        if (err) throw err;
        console.log('图标资源中的文件有:', files);
        // 移除图标资源中不需要用到的文件
        files.forEach(file => {
          if (!retainFileList.includes(file)) {
            fs.rm(`${basePath}/${file}`, (err) => {
              if (err) throw err;
              console.log('删除文件：', file);
            })
          }
        });
        console.log('只保留的文件：', retainFileList);

        // 对文件内容进行修改
        if (modifyFileList) {
          const p = `${basePath}/${modifyFileList}`;
          fs.readFile(p, (err, data) => {
            if (err) throw err;
            let fileContent = data.toString();
            const updateContent = fileContent.replace(/url\(\'iconfont\./g, (target) => {
              return 'url(\'./static/iconfont.';
            })
            fs.writeFile(p, updateContent, (err) => {
              if (err) throw err;
              console.log('文件内容修改成功：', p);
              // 修改文件名称
              const renameErr = fs.renameSync(basePath, f('static/icon'));
              if (renameErr) throw renameErr;
              console.log('==========图标资源更新完毕========');
            })
          });
        }

      });
    } else {
      console.log(new Error('找不到图标资源'));
    }
  });
}