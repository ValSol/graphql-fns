// @flow
import SparkMD5 from 'spark-md5';

// calculate md5 hash on client as at https://github.com/satazor/js-spark-md5
// 2097152 byte === 2MB
const chunkSize: number = 2097152;

const getFileMD5Hash = (file: Object): Promise<string> =>
  new Promise((resolve, reject) => {
    // $FlowFixMe
    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    const loadNext = () => {
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    };

    fileReader.onload = (e) => {
      // $FlowFixMe
      spark.append(e.target.result); // Append array buffer
      currentChunk += 1;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        resolve(spark.end());
      }
    };

    fileReader.onerror = (err) => {
      reject(err);
    };

    loadNext();
  });

export default getFileMD5Hash;
