/*
 * File: /Users/origami/Desktop/timvel-blog/createNewPost.js
 * Project: /Users/origami/Desktop/timvel-blog
 * Created Date: Wednesday July 17th 2019
 * Author: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 * Last Modified: Wednesday July 17th 2019 12:35:41 pm
 * Modified By: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 */
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
require('dotenv').config({ path: path.join(__dirname, 'blog.env') });
global.fetch = require('node-fetch');
const Unsplash = require('unsplash-js').default;
const toJson = require('unsplash-js').toJson;

const unsplash = new Unsplash({
  accessKey: process.env['UNSPLASH_ACCESS_KEY'],
  secret: process.env['UNSPLASH_SECRET_KEY'],
});

const template = fs.readFileSync('./template.md', 'utf8');
const getOutputPath = (filename) => {
  return path.join(__dirname, './source/_posts', filename + '.md');
};
const getParam = (paramName) => {
  return minimist(process.argv)[paramName];
};

const getRandomPhotoUrl = async () => {
  const res = await toJson(await unsplash.photos.getRandomPhoto());
  return res.urls.regular;
};
//how to use it?
// run `node createNewPost.js --title my-title --tag my,tag`

(async function () {
  const imageUrl = await getRandomPhotoUrl();
  const title = getParam('title');
  const tags = getParam('tag').split(',');
  const currentDate = new Date()
    .toLocaleString()
    .replace(/\d+\/\d+\/\d+/, (res) => {
      const _res = res.split('/').reverse();
      const mon = _res[2];
      const day = _res[1];
      _res[2] = day;
      _res[1] = mon;
      return _res.join('-');
    })
    .replace(',', '');

  let output = template
    .replace(
      /(?<=title: )\w+\b/,
      title.replace(/-/g, ' ').replace(/^[a-z]/, (v) => v.toUpperCase()),
    )
    .replace(/- Tag/, tags.map((tag) => '- ' + tag).join('\n\t'))
    .replace(/(?<=date: )\w+\b/, currentDate)
    .replace('{{URL}}', imageUrl);

  fs.writeFileSync(getOutputPath(title), output, 'utf8');
  console.log('DONE');
})();
