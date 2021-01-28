const https = require('https');
const cheerio = require('cheerio')
const html2md=require('html-to-md')

/** 
 *   url替换为文章地址
 *   type为网站类型
 *   替换 url 和 type   执行node spider.js  文件即可
 *   1 == hexo
 *   2 == 掘金
 *   3 == CSDN
 *   4 == 简书
 *   5 == 图雀
 *   6 == 微信公众号
 */


var url = 'https://juejin.im/post/6861725116389130254';
var type = '1';

function filterArticle(html,type) {
    console.log(type)
    let dom = ''
    switch (type){
        case '1':
            dom = '.markdown-body';
            break;
        case '2':
            dom = '.article-content' || 'markdown-body';
            break;
        case '3':
            dom = '#content_views';
            break;
        case '4':
            dom = '._2rhmJa';
            break;
        case '5':
            dom = '.post-body';
            break;
        default:
            dom = '.markdown-body';
            break;
    }
    console.log(dom)
    var $ = cheerio.load(html,{decodeEntities:false});
    var article = $(dom).html()
    return article;
}


https.get(url, (res) => {
    let html = ''
    res.on('data', (data) => {
        html += data
    })
    res.on('end', () => {
        console.log(type,'=============')
        let result = filterArticle(html,type)
        console.log(html2md(result))
    })
    res.on('error', () => {
        console.log(error)
    })
})