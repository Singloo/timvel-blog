const path = require("path");
const fs = require("fs-extra");
const fso = require("fs");
const OSS = require("ali-oss");
const { flattenDeep } = require("lodash");
const { from } = require("rxjs");
const { mergeMap } = require("rxjs/operators");
const { PassThrough } = require("stream");

require("dotenv").config({ path: path.join(__dirname, "..", "blog.env") });

const STATIC_FILE_PATH = path.join(__dirname, "..", "public");
// const TARGET_OSS_PATH = '';
const ALI_OSS_ENDPOINT = process.env["OSS_END_POINT"];

const client = new OSS({
  region: process.env["OSS_REGION"],
  accessKeyId: process.env["OSS_ACCESS_KEY"],
  accessKeySecret: process.env["OSS_ACCESS_SECRET"],
  bucket: process.env["OSS_BUCKET"],
  timeout: 1000 * 60,
});

const loopDir = (pth, filename = "") => {
  const stats = fs.lstatSync(path.join(pth, filename));
  if (!stats.isDirectory()) {
    return [{ pth, filename }];
  }
  const filenames = fs.readdirSync(path.join(pth, filename));
  return flattenDeep(
    filenames.map((fname) => loopDir(pth, path.join(filename, fname)))
  );
};

(async () => {
  try {
    const existingFiles = (await client.list()).objects.map((o) => o.name);
    //   console.log(fileNames);
    await client.deleteMulti(existingFiles);
    console.log("Existing files removed");
  } catch (err) {
    console.log("No files to remove");
  }
  console.log("Start uploading...");
  const filenames = loopDir(STATIC_FILE_PATH);
  const res = await Promise.all(
    filenames.map(({ pth, filename }) => {
      return client.put(filename, path.join(pth, filename));
    })
  );
  console.log("DONE");
})();
