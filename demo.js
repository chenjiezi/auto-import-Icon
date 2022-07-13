/*
 * @Description: 
 * @Author: chenjz
 * @Date: 2022-07-13 10:55:35
 * @LastEditors: chenjz
 * @LastEditTime: 2022-07-13 14:47:10
 */
const fs = require('fs');
const path = require('path');

const delDirPath = path.join(__dirname, '/test')

function removeDir(dirPath) {
  async function _removeDir() {
    try {
      const stat = await fs.stat(dirPath);
      console.log('stat:', stat);
    } catch (e) {
      console.error(e);
    }
  }
  _removeDir();
}

removeDir(delDirPath);
console.log('========');

