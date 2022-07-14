/*
 * @Description: 
 * @Author: chenjz
 * @Date: 2022-07-13 10:55:35
 * @LastEditors: chenjz
 * @LastEditTime: 2022-07-14 11:52:11
 */
import {
  readdir,
  rmdir,
  stat,
  unlink,
  rename
} from 'fs/promises';
import path, { resolve } from 'path';

const __dirname = path.resolve();
const basePath = path.join(__dirname, 'static'); // 
const iconDirName = 'icon'; // 图标资源目录
const iconDirPath = path.join(basePath, iconDirName);
// 删除文件
async function removeDir(dirPath) {
  async function _removeDir() {
    try {
      const statx = await stat(dirPath);
      if (statx.isDirectory()) {
        let fileList = await readdir(dirPath)
        fileList = fileList.map((file) => removeDir(`${dirPath}/${file}`));
        await Promise.all(fileList);
        await rmdir(dirPath);
      } else {
        await unlink(dirPath);
      }
    } catch (e) {
      console.error('removeDir=>', e);
    }
  }
  await _removeDir();
}



const folderPath = path.join(__dirname, 'static');
const filePath = path.join(__dirname, 'test.js');
import fsPromises from 'fs/promises';
async function fn() {
  // const res = await removeDir(folderPath);
  // const res1 = await rmdir(folderPath, {
  //   recursive: true
  // });
  // console.log('res:', res);
  // console.log('res1:', res1);
  console.log('========');
  const content = await fsPromises.readFile(path.join(folderPath, 'icon', 'iconfont.css'), 'utf-8');
  console.log('content:', content);
}
fn();




