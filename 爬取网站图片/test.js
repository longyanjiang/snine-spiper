const fs = require('fs')

// const data = [
//     {
//         name:'小九',
//         age:'12'
//     },
//     {
//         name:'小八',
//         age:'13'
//     }
// ]

// fs.writeFile("./11.json",JSON.stringify(data), error => {
//     if (error) return console.log("写入文件失败,原因是" + error.message);
//     console.log("写入成功");
// });
  

var data=fs.readFileSync("./11.json","utf-8");
console.log(JSON.parse(data));