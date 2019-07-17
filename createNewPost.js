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
const template = fs.readFileSync('./template.md', 'utf8');
const getOutputPath = filename => {
  return path.join(__dirname, './source/_posts', filename + '.md');
};
const getParam = paramName => {
  return minimist(process.argv)[paramName];
};

(function() {
  const title = getParam('title');
  const tags = getParam('tag').split(',');
  const currentDate = new Date()
    .toLocaleString()
    .replace(/\d+\/\d+\/\d+/, res => {
      const _res = res.split('/').reverse();
      const mon = _res[2];
      const day = _res[1];
      _res[2] = day;
      _res[1] = mon;
      return _res.join('-');
    })
    .replace(',', '');

  let output = template
    .replace(/(?<=title: )\w+\b/, title.replace('-', ' '))
    .replace(/- Tag/, tags.map(tag => '- ' + tag).join('\n\t'))
    .replace(/(?<=date: )\w+\b/, currentDate);
  fs.writeFileSync(getOutputPath(title), output, 'utf8');
})();
