const cheerio = require('cheerio')
const https = require('https')
const http = require('http')
const fs = require('fs')


const tagNum = 20;  //需要多少个标签
const coverImgPage = 5; //需要多少页的封面图片
const detailImgNum = 6; //一组图片需要多少页的详情图


/** 默认使用http请求方式，如果是https，第二个参数传个ture就行 封装的请求方法 */
const nodeSpider = (url, https = false) => {
    return new Promise((resovle, reject) => {
        const request = https ? https : http
        request.get(url, async res => {
            let html = ''
            res.on('data', data => html += data)
            res.on('end', async () => {
                let $ = cheerio.load(html, { decodeEntities: false })
                resovle($)
            }),
                res.on('err', err => reject(err))
        })
    })
}

/** 获取所有的标签并让所有连接指向图片大小为1080*1920的网页地址 */
const getTags = async (url) => {
    const $ = await nodeSpider(url)
    const tagListNodes = $('.cont1').find('a').nextAll()
    let TagList = []
    tagListNodes.each((index, node) => {
        if (index < tagNum) {  //取前20个标签 后面是尺寸
            let name = $(node).html()
            let oldHref = $(node).attr('href')
            let newHref = oldHref.replace('_0_0_1.html', '_0_119_1.html') //这样可以把图片大小固定为1080*1920
            TagList.push({ name, href: newHref, index })
        }
    })
    return TagList;
}

/** 获取所有封面图片 */
const getCoverImgs = async (url) => {
    let coverImgList = []
    for (let i = 0; i < coverImgPage; i++) { //这里是一个分类下的一页，最多有五页 i
        const path = url.replace('1.html',`${i+1}.html`)
        const $ = await nodeSpider(path)
        const coverImgNodes = $('.tab_box').find('.clearfix').find('li')
        coverImgNodes.each((index, node) => {
            const path = $(node).find('a').attr('href')  //通过这个地址去到该图片的详细界面
            const coverUrl = $(node).find('a').find('img').attr('data-src')  //该网页是懒加载的，需要这个属性去拿真正的图片
            const name = $(node).find('a').find('img').attr('alt') //这就是封面图片，压缩过的，不清晰图
            coverImgList.push({ path, coverUrl, name })
        })
    }
    console.log(coverImgList.length,'这个是一个分类下面所有多少组的图片');
    return coverImgList
}

/** 从封面图片的路径进去找到关于这个封面更多的图片 */
const getDetailImgs = async (url) => {
    let detailImgs = []
    for (let i = 0; i < detailImgNum; i++) { //这个i表示一组图片需要几张最多8张图片，我们需要拿到几张
        const path = url.replace('.html', `_${i + 1}.html`)
        const $ = await nodeSpider(path)
        const detailUrl = $('.pic-meinv').find('a').find('.pic-large').attr('src')
        if (!detailUrl) return;
        detailImgs.push(detailUrl)
    }
    console.log(detailImgs);
    return detailImgs;
}

/** 把数据写入到json文件里面 */
const writeFile = (data) => {
    let oldData = fs.readFileSync('./data.json', 'utf-8')
    if (oldData) {
        console.log('有之前的数据');
        oldData = JSON.parse(oldData)
    } else {
        oldData = []
    }
    let newData = []
    oldData ? newData = [...oldData, ...data] : newData = data
    fs.writeFileSync('./data.json', JSON.stringify(newData), (err) => {
        if (err) console.log(err);
        console.log('写入成功');
    })
}

const getAllImgs = async (url) => {
    let AllImgs = []
    let AllTags = []
    const TagList = await getTags(url)
    AllTags = JSON.parse(JSON.stringify(TagList)) //获取了所有的标签
    let coverImgTask = []
    /** coverImgTask 获取到了所有分类下面的n组图片 */
    TagList.forEach(async (item, index) => {
        coverImgTask.push(getCoverImgs(item.href))
    })
    const AllCoverImg = await Promise.all(coverImgTask)
    AllImgs = TagList.map((item, index) => {
        item.coverImgList = AllCoverImg[index]
        return item;
    })
    // AllImgs.forEach( (item,index) => {
    //     item.coverImgList.forEach( (t,i) => {
    //         console.log(t);
    //         getDetailImgs(t.path)
    //     })
    // })

    /** 数组扁平化，拿到所有的封面图片及其对应路径 */
    // let AllCoverPath = []
    // AllImgs.forEach((item, index) => {
    //     item.coverImgList.forEach((t, i) => {
    //         t.className = item.name; //与分类产生关系 连接分类和组的key值
    //         t.classId = i+1
    //         AllCoverPath.push(t)
    //     })
    // })
    // console.log('已经拿到了扁平化之后的数组,这是多少组的',AllCoverPath.length);
    /** 通过路径获取其对应的详细图片 */
    // let detailImgTask = []
    /** 全量请求拿到所有的高分辨率图 */
    // AllCoverPath.forEach((item, index) => {
    //     detailImgTask.push(getDetailImgs(item.path))
    //     detailImgTask.push(getDetailImgs(item.path))
    // })
    // console.log('AllCoverPathAllCoverPath',AllCoverPath.length);
    // const AllDetailImg = await Promise.all(detailImgTask)
    /** 通过index还原回去所有图片 */
    // AllCoverPath = AllCoverPath.map((item, index) => {
    //     item.detailImgs = AllDetailImg[index]
    //     return item
    // })
    // writeFile(AllTags)
}

const getTagList = async(url) => {
    const TagList = await getTags(url)
    console.log(TagList);
}


const url = 'http://www.win4000.com/mobile.html'
getTagList(url)

// getAllImgs(url)