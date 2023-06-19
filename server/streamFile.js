import { createReadStream } from "fs";

/**
 * @param {server.HttpResponse} res
 * @param {{filePath: string, size: number}} fileStats
 */
export const streamFile = (res, { filePath, size }) => {
  const readStream = createReadStream(filePath);
  const destroyReadStream = () => !readStream.destroyed && readStream.destroy();

  /**
   * @param {Error} error
   */
  const onError = (error) => {
    destroyReadStream();
    throw error;
  };

  /**
   * @param {Buffer} chunk
   */
  const onDataChunk = (chunk) => {
    const arrayBufferChunk = toArrayBuffer(chunk);

    const lastOffset = res.getWriteOffset();
    const [ok, done] = res.tryEnd(arrayBufferChunk, size);

    if (!done && !ok) {
      readStream.pause();

      res.onWritable((offset) => {
        const [ok, done] = res.tryEnd(
          arrayBufferChunk.slice(offset - lastOffset),
          size
        );

        if (!done && ok) {
          readStream.resume();
        }

        return ok;
      });
    }
  };

  res.onAborted(destroyReadStream);
  readStream
    .on("data", onDataChunk)
    .on("error", onError)
    .on("end", destroyReadStream);
};

/**
 * @param {Buffer} buffer
 * @returns {ArrayBuffer}
 */
const toArrayBuffer = (buffer) => {
  const { buffer: arrayBuffer, byteOffset, byteLength } = buffer;
  return arrayBuffer.slice(byteOffset, byteOffset + byteLength);
};
