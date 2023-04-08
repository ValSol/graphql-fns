import SparkMD5 from 'spark-md5';

// calculate md5 hash on client as at https://github.com/satazor/js-spark-md5
// 2097152 byte === 2MB
const chunkSize: number = 2097152;

const getFileMD5Hash = (file: any): Promise<string> =>
  new Promise((resolve: (result: any) => void, reject: (error?: any) => void) => {
    const blobSlice =
      File.prototype.slice ||
      (File as any).prototype.mozSlice ||
      (File as any).prototype.webkitSlice;
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    const loadNext = () => {
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    };

    fileReader.onload = (e: ProgressEvent) => {
      spark.append((e.target as any).result); // Append array buffer
      currentChunk += 1;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        resolve(spark.end());
      }
    };

    fileReader.onerror = (err: ProgressEvent) => {
      reject(err);
    };

    loadNext();
  });

export default getFileMD5Hash;
