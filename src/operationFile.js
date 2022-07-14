import fsPromises from 'fs/promises';
import path from 'path';
import config from './config.js';

let fileList = [];

export default async function () {
  try {
    console.log('=========对图标资源进行修改============');

    const files = await fsPromises.readdir(config.basePath);
    const primaryName = files.find(f => f.startsWith(`font_${config.projectId}`));
    const primaryPath = path.join(config.basePath, primaryName);
    let iconDirPath = path.join(config.basePath, config.iconfontFolder);

    // 删除原有存储图标资源的文件夹
    await fsPromises.rmdir(iconDirPath, { recursive: true });
    // 新图标资源文件夹重命名
    await fsPromises.rename(primaryPath, iconDirPath);

    // 删除不保留的文件
    if (config.retainFileList.length) {
      const iconFiles = await fsPromises.readdir(iconDirPath);
      const delFiles = iconFiles
        .filter(f => !config.retainFileList.includes(f))
        .map(f => fsPromises.rm(path.join(iconDirPath, f)));

      await Promise.all(delFiles);
      fileList = await fsPromises.readdir(iconDirPath);
    }

    // 修改文件内容
    if (config.modifyFileList.length) {
      const mlist = config.modifyFileList.filter(item => fileList.includes(item.fileName));
      mlist.forEach(async (m) => {
        const p = path.join(iconDirPath, m.fileName);
        const content = await fsPromises.readFile(p, 'utf-8');
        m.update && await fsPromises.writeFile(p, m.update(content));
      })
    }

    console.log('===============图标资源更新完毕=============');
  } catch (e) {
    console.error('operationFile=>', e);
  }
}