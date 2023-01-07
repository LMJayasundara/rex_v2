// function gut(a) {
//     var o = [], s = a.length, l = Math.floor(s / 2), c;
//     for (c = 0; c < s; c++)o.push(a[l += (s % 2 ? c % 2 ? +c : -c : c % 2 ? -c : +c)]);
//     return o
// }

// // console.log(gut([1, 2, 3, 5]));

// function fillTbl(len, mid, gap, bins) {
//     let arr = new Array(bins).fill(null);
//     let midIndex = Math.floor(arr.length / 2);
  
//     for (let [index, val] of arr.entries()) {
//       if(index == midIndex){
//         arr[index] = [index,'Blue', mid];
//       }
//       else if(index > 2 && index < (arr.length -3) && index != midIndex){
//             arr[index] = [index, 'Black', mid - ((midIndex - index) * gap)]
//       }
//       else if(index === 0 || index === (bins-1)){
//         arr[index] = [index, 'Green', null]
//       }
//       else{
//         arr[index] = [index, 'Black', null]
//       }
//     };
//     return arr;
// }

// console.log(fillTbl(200, 100, 10, 18));

///////////////////////////////////////////////////////////////////////////////////////////////////

// const val = require('./reg');
// const map = (val.map);
// const dis = (val.dis);

// var tbl = [
//   { ind: 0, clr: 'Green', gap: 1 },
//   { ind: 1, clr: 'Black', gap: 2 },
//   { ind: 2, clr: 'Black', gap: 3 },
//   { ind: 3, clr: 'Black', gap: 40 },
//   { ind: 4, clr: 'Blue', gap: 50 },
//   { ind: 5, clr: 'Black', gap: 60 },
//   { ind: 6, clr: 'Black', gap: 4 },
//   { ind: 7, clr: 'Black', gap: 5 },
//   { ind: 8, clr: 'Green', gap: 6 }
// ];

// tbl.forEach((element, i) => {
//   if(element.clr == 'Green'){
//     console.log(i, map[i][0], 1, dis[i][0], element.gap);
//   }
//   else if(element.clr == 'Black'){
//     console.log(i, map[i][1], 2, dis[i][0], element.gap);
//   }
//   else if(element.clr == 'Blue'){
//     console.log(i, map[i][2], 3, dis[i][0], element.gap);
//   }
//   else{
//     console.log('error');
//   }
// })

////////////////////////////////////////////////////////////////////

// const numRegisters = 800;
// const values = new Uint16Array(numRegisters).fill(0);
// console.log(values);

////////////////////////////////////////////////////////////////////

// async function clearReg() {
//     return new Promise((resolve, reject) => {
//       const numRegisters = 100;
//       const values = new Array(numRegisters).fill(0);
//       var start = 41387;
//       for (let i = 0; i < 10; i++) {
//         client.writeMultipleRegisters(start, values);
//         start = start + 100;
//       }
//       resolve();
//     }).catch((error) => {
//         dialog.showErrorBox(`Error`, error.message);
//     });
// };

///////////////////

// async function clearReg() {
//     return new Promise((resolve, reject) => {
//       const numRegisters = 100;
//       const values = new Array(numRegisters).fill(0);
//       var start = 41387;
//       for (let i = 0; i < 10; i++) {
//         client.writeMultipleRegisters(start, values)
//           .then(() => {
//             // Promise was fulfilled, do nothing
//           })
//           .catch((error) => {
//             // Promise was rejected, handle the error
//             console.log(error.message);
//             reject(error);
//           });
//         start = start + 100;
//       }
//       resolve();
//     });
// };

///////////////////

// async function writeCoil(mapReg, mapVal, disReg, disVal) {
//     return new Promise((resolve, reject) => {
//         client.writeSingleRegister(mapReg, mapVal).then((response) => {
//             resolve();
//         }).catch((error) => {
//             dialog.showErrorBox(`Error in ${mapReg}`, error.message);
//         });
//     }).then(()=>{
//         client.writeSingleRegister(disReg, disVal).then((response) => {
//         }).catch((error) => {
//             dialog.showErrorBox(`Error in ${disReg}`, error.message);
//         });
//     }).catch((error) =>{
//         dialog.showErrorBox(`Error`, error.message);
//     });
// };

// ipcMain.handle('exeStart', (event, obj) => {
//     clearReg().then(()=>{
//         readGigTable(obj).then((data) => {
//             // console.log(data);
//             return data;
//         })
//         .then((data) => {
//             data.forEach(async(element, i) => {
//                 if (element.clr == 'Green') {
//                     console.log(i, map[i][0], rotVal[0], dis[i][0], element.gap);
//                     await writeCoil(map[i][0], rotVal[0], dis[i][0], element.gap);
//                 }
//                 else if (element.clr == 'Black') {
//                     console.log(i, map[i][1], rotVal[1], dis[i][0], element.gap);
//                     await writeCoil(map[i][1], rotVal[1], dis[i][0], element.gap);
//                 }
//                 else if (element.clr == 'Blue') {
//                     console.log(i, map[i][2], rotVal[2], dis[i][0], element.gap);
//                     await writeCoil(map[i][2], rotVal[2], dis[i][0], element.gap);
//                 }
//                 else {
//                     console.log('error');
//                 }
//             });
//         });
//     });
// });
