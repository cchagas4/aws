const jimp = require ('jimp');
const http = require ('http');
const fs = require ('fs');
const download = require ('download');
var AWS = require('aws-sdk');

const DOWNLOAD_FILE = '/tmp/rawfile';
const RESIZE_FILE = '/tmp/resizefile.png';
const DEFAULT_SIZE = 32;

// get reference to S3 client
var s3 = new AWS.S3();
var srcBucket = "rszd";
//Handler
module.exports.downloadAndResize = (event, context, lambdaCallback) => {
  if (!event.url) return lambdaCallback(new Error('missing event.url'));
  const start_orange = Date.now();
  console.log(`Request (orange box) starts now`);
  const size = event.size || DEFAULT_SIZE;

  console.log(`Download at ${DOWNLOAD_FILE} folder`);
  download(event.url, DOWNLOAD_FILE, (error) => {
    if (error) return lambdaCallback(error);
    console.log('Download Erro');
    });

    fileSize(DOWNLOAD_FILE , (error, dlFileSize) => {
      if (error) return lambdaCallback(error);
      resizeImage(DOWNLOAD_FILE +'/png-imagem-1.png', RESIZE_FILE, size, (error) => {
        if (error) return lambdaCallback(error);
        fileSize(RESIZE_FILE, (error, rsFileSize) => {
          lambdaCallback(null, {
            ok: true,
            dlFileSize,
            rsFileSize
          });
          console.log(`Request (orange box) ends now, operation` + `took ${Date.now() - start_orange}ms`);
          const start_purple = Date.now();
          console.log(`Etc Background Work (purple box) starts` + 'now');
          upload('application/json', RESIZE_FILE, null);
          removeFile(DOWNLOAD_FILE, (error) => {
            // Cannot call lambdaCallback
            if (error) return console.error(error);
            removeFile(RESIZE_FILE, (error) => {
              // Cannot call lambdaCallback
              if (error) return console.error(error);
              console.log(`Etc Background Work (purple box)`
                + 'ends now, operation took'
                + `${Date.now() - start_purple}ms`);
            });
          });
        });
      });
    });
  /*});*/
};

function downloadFile(url, destination, callback) {
  //console.log('DownloadFile');
  const file = fs.createWriteStream(destination);
  const request = http.get(url, (res) => {
    res.pipe(file);
  });
  request.once('error', (error) => callback(error));
  file.once('finish', () => callback());
}

function resizeImage(filename, newFilename, size, callback) {
  //console.log('ResizeImage');
  jimp.read(filename, (error, image) => {
    if (error) return callback(error);
    image
      .resize(size, jimp.AUTO)
      .write(newFilename, callback);
  });
}

function removeFile(filename, callback) {
  //console.log('RemoveFile');
  fs.unlink(filename, callback);
}

function fileSize(filename, callback) {
  //console.log('FileSize');
  fs.stat(filename, (error, data) => {
    if (error) return callback(error);
    callback(null, data.size);
  });
}

function upload(contentType, data, next) {
    // Stream the transformed image to a different S3 bucket.
    s3.putObject({
            Bucket: rszd,
            //Key: dstKey,
            Body: data,
            ContentType: contentType
        },
        next);
}

/*
exports.handler = (event, context, callback) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Cássia says Hello!'),
    };
    callback(null, response);
};
*/
