/*
 * @Description: 操作图标资源
 * @Author: chenjz
 * @Date: 2022-07-12 16:19:15
 * @LastEditors: chenjz
 * @LastEditTime: 2022-07-13 15:06:00
 */
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve();
const f = (p) => path.join(__dirname, p);
const retainFileList = [
  'iconfont.css',
  'iconfont.svg',
  'iconfont.ttf',
  'iconfont.woff',
  'iconfont.woff2'
]; // 保留的文件 TODO:可配置
const modifyFileList = 'iconfont.css'; // 进行修改的文件 TODO:可配置
const projectId = '3290617'; // TODO:可配置

const iconFile = f('static');

export default function () {
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
              const targetFileDir = f('static/icon');
              // 删除原有icon文件
              if (fs.existsSync(targetFileDir)) {
                retainFileList.forEach(file => {
                  fs.rm(f('static/icon/' + file));
                })
                console.log('删除原有icon文件');
              }
              // 修改文件名称
              fs.renameSync(basePath, targetFileDir);
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