const https = require('https');
const cheerio = require('cheerio')
const fs = require("fs");

/** 获取所有分类标签和href */
const getTags = (url) => {
    return new Promise( (resovle, reject) => {
        https.get(url, res => {
            let html = '';
            res.on('data', data => html += data)
            let list = []
            res.on('end', () => {
                let $ = cheerio.load(html, {decodeEntities: false})
                const tagListNodes = $('.list_tags').find('.zf10').nextAll()
                tagListNodes.each( (index,node) => {
                    const path = $(node).attr('href')
                    // const tag = $(node).html()
                    // console.log(tag);
                    list.push(path)
                })
                // list = list.filter( (t,i) => i<3)  爬取全部的是50个标签的图片  需要几个过滤几个图片
                resovle(list)
            })
        })
    })
}




/** 获取原图 */
const getOriginal = (url) => {
    if(!url) return;
    return new Promise( async (resovel, reject)=>{
        await https.get(url, async res => {
            let html = ''
            res.on('data', data => html+=data)
            res.on('end', ()=> {
                let $ = cheerio.load(html, {decodeEntities: false})
                const allNodes = $('.swiper-slide')
                let newImg = []
                allNodes.each( (index,node) => {
                    const url = $(node).find('a').attr('src')
                    newImg.push(url)
                })
                // const newImg = $('.arc_main_pic_img').attr('src')
                resovel(newImg)
            })
            res.on('err', err => reject(err))
        })
    })
}

/** 通过href拿到所有图片 */
const getImgs = (url) => {
    return new Promise( (resovle, reject) => {
        https.get(url, res => {
            let html = ''
            let list = []
            res.on('data', data => html += data)
            res.on('end', async () => {
                let $ = cheerio.load(html, {decodeEntities: false})
                const tagName = $('h1').html()
                const images = $('.egeli_pic_m').find('.egeli_pic_li').nextAll()
                let reslist = []
                images.each( async(index, node) => {
                    let newUrl = ''
                    const url = $(node).find('img').attr('src')
                    const name = $(node).find('img').attr('alt')
                    const tag = tagName
                    const type = 1

                    let path = $(node).find('dl').find('dd').find('a').attr('href')
                    if(!path) return;
                    // newUrl = await getOriginal(path)
                    // console.log('newUrlnewUrl',newUrl);

                    if(url&&path){
                        reslist.push(getOriginal(path))
                        list.push({url, name, tag, type,newUrl})
                    }
                })
                console.log('list的长度',list.length);
                await Promise.all(reslist).then((res) => {
                    console.log(res.length,'返回的长度');
                    for (let i in list) {
                        list[i]['newUrl'] = res[i]
                    }
                })
                resovle(list)
            })
            res.on('err', err => reject(err))
        })
    })
}


/** 把数据写入到json文件里面 */
const writeFile = (data) => {
    let oldData = fs.readFileSync('./11.json','utf-8')
    if(oldData){
        console.log('有之前的数据');
        oldData = JSON.parse(oldData)
    }else{
        oldData = []
    }
    let newData = []
    oldData ? newData = [...oldData, ...data] : newData = data
    fs.writeFileSync('./11.json',JSON.stringify(newData), (err) => {
        if(err) console.log(err);
        console.log('写入成功');
    })
}

/** 设置的i代表爬取多少页的照片   一页16张 */
getTags('https://sj.enterdesk.com/').then(async res => {
    res.forEach( async url => {
        for (let i = 1; i < 2; i++) {
            const httpsUrl = url.replace('http','https') + `${i}.html`
                const images = await getImgs(httpsUrl)
                console.log(images);
            // writeFile(images)
        }
    })
})