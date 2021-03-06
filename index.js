'use strict';
var cheerio = require('cheerio');

// http://stackoverflow.com/questions/14480345/how-to-get-the-nth-occurrence-in-a-string
function getPosition(str, m, i) {
  return str.split(m, i).join(m).length;
}

hexo.extend.filter.register('after_post_render',
function(data) {
  var config = hexo.config;
  if (config.post_asset_folder) {
    var link = data.permalink;
    var beginPos = getPosition(link, '/', 3) + 1;
    // In hexo 3.1.1, the permalink of "about" page is like ".../about/index.html".
    var endPos = link.lastIndexOf('/') + 1;
    link = link.substring(beginPos, endPos);

    var toprocess = ['excerpt', 'more', 'content'];
    for (var i = 0; i < toprocess.length; i++) {
      var key = toprocess[i];

      var $ = cheerio.load(data[key], {
        ignoreWhitespace: false,
        xmlMode: false,
        lowerCaseTags: false,
        decodeEntities: false
      });
      $('img').each(function() {
        // For windows style path, we replace '\' to '/'.
        if (!$(this).attr('src')) {
          return;
        }
        var src = $(this).attr('src').replace('\\', '/');
        //console.log(link);
        //console.log(src);
        if (!/http[s]*.*|\/\/.*/.test(src)) {
          for (var j = 0; j < config.assetimage.images.length; j++) {
            if (src.toLowerCase().endsWith(config.assetimage.images[j])) {
              // For "about" page, the first part of "src" can't be removed.
              // In addition, to support multi-level local directory.
              var linkArray = link.split('/').filter(function(elem) {
                return elem != '';
              });
              var srcArray = src.split('/').filter(function(elem) {
                return elem != '';
              });
              if (linkArray[linkArray.length - 1] == srcArray[0]) srcArray.shift();
              src = srcArray.join('/');
              if (config.assetimage.useqiniu) {
                $(this).attr('src', '//' + config.assetimage.qiniuurl + '/' + link + src);
                console.info('update img src as:-->' + '//' + config.assetimage.qiniuurl + '/' + link + src);
              } else {
                $(this).attr('src', '/' + link + src);
                console.info('update img src as:-->' + '/' + link + src);
              }
              break;
            }
          }
        }
      });
      $('a').each(function() {
        // For windows style path, we replace '\' to '/'.
        if (!$(this).attr('href')) {
          return;
        }
        var src = $(this).attr('href').replace('\\', '/');
        //console.log(link);
        //console.log(src);
        if (!/http[s]*.*|\/\/.*/.test(src)) {
          var needUpdate = false;
          for (var j = 0; j < config.assetimage.images.length; j++) {
            if (src.toLowerCase().endsWith(config.assetimage.images[j])) {
              needUpdate = true;
              break;
            }
          }
          if (!needUpdate) {
            for (var j = 0; j < config.assetimage.attachment.length; j++) {
              if (src.toLowerCase().endsWith(config.assetimage.attachment[j])) {
                needUpdate = true;
                break;
              }
            }
          }
          if (needUpdate) {
            // For "about" page, the first part of "src" can't be removed.
            // In addition, to support multi-level local directory.
            var linkArray = link.split('/').filter(function(elem) {
              return elem != '';
            });
            var srcArray = src.split('/').filter(function(elem) {
              return elem != '';
            });
            if (linkArray[linkArray.length - 1] == srcArray[0]) srcArray.shift();
            src = srcArray.join('/');
            if (config.assetimage.useqiniu) {
              $(this).attr('href', '//' + config.assetimage.qiniuurl + '/' + link + src);
              console.info('update a href as:-->' + '//' + config.assetimage.qiniuurl + '/' + link + src);
            } else {
              $(this).attr('href', '/' + link + src);
              console.info('update a href as:-->' + '/' + link + src);
            }
          }
        }
      });
      data[key] = $.html();
    }
  }
});
