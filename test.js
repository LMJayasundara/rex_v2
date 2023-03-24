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
// const rotVal = [150, 150, 150];

// var tbl = [
//     { ind: 0, clr: 'Green', gap: 1 },
//     { ind: 1, clr: 'Black', gap: 2 },
//     { ind: 2, clr: 'Black', gap: 3 },
//     { ind: 3, clr: 'Black', gap: 40 },
//     { ind: 4, clr: 'Blue', gap: 50 },
//     { ind: 5, clr: 'Black', gap: 60 },
//     { ind: 6, clr: 'Black', gap: 4 },
//     { ind: 7, clr: 'Black', gap: 5 },
//     { ind: 8, clr: 'Green', gap: 6 }
// ];

// const Green2Black = 1;
// const Black2Blue = 2;

// tbl.forEach((element, i) => {
//     const lookupTable = {
//       'Green-Green': element.gap,
//       'Green-Black': element.gap + Green2Black,
//       'Green-Blue': element.gap + Green2Black + Black2Blue,
//       'Black-Green': element.gap - Green2Black,
//       'Black-Black': element.gap,
//       'Black-Blue': element.gap + Black2Blue,
//       'Blue-Green': element.gap - Green2Black - Black2Blue,
//       'Blue-Black': element.gap - Black2Blue,
//       'Blue-Blue': element.gap
//     };
//     const prevColor = i > 0 ? tbl[i - 1].clr : null;
//     const key = `${prevColor}-${element.clr}`;
//     console.log(i, map[i][0], 1, dis[i][0], element.gap, key, lookupTable[key] || element.gap);
// });


// for (const [i, element] of tbl.entries()) {
//     let reg;
//     let val;

//     const lookupTable = {
//       'Green-Green': element.gap,
//       'Green-Black': element.gap + Green2Black,
//       'Green-Blue': element.gap + Green2Black + Black2Blue,
//       'Black-Green': element.gap - Green2Black,
//       'Black-Black': element.gap,
//       'Black-Blue': element.gap + Black2Blue,
//       'Blue-Green': element.gap - Green2Black - Black2Blue,
//       'Blue-Black': element.gap - Black2Blue,
//       'Blue-Blue': element.gap
//     };

//     const prevColor = i > 0 ? tbl[i - 1].clr : null;
//     const key = `${prevColor}-${element.clr}`;

//     if (element.clr === 'Green') {
//         reg = map[i][0];
//         val = rotVal[0];
//     } else if (element.clr === 'Black') {
//         reg = map[i][1];
//         val = rotVal[1];
//     } else if (element.clr === 'Blue') {
//         reg = map[i][2];
//         val = rotVal[2];
//     }
//     console.log(i, reg, val, dis[i][0], lookupTable[key] || element.gap);
// }

// tbl.forEach((element, i) => {
//   if(element.clr == 'Green'){
//     console.log(i, map[i][0], 1, dis[i][0], element.gap, tbl[i-1].clr || null, tbl[1].clr);
//   }
//   else if(element.clr == 'Black'){
//     console.log(i, map[i][1], 2, dis[i][0], element.gap, tbl[i-1].clr || null, tbl[1].clr);
//   }
//   else if(element.clr == 'Blue'){
//     console.log(i, map[i][2], 3, dis[i][0], element.gap, tbl[i-1].clr || null, tbl[1].clr);
//   }
//   else{
//     console.log('error');
//   }
// })

// tbl.forEach((element, i) => {
//     if (element.clr == 'Green') {
//         console.log(i, map[i][0], 1, dis[i][0], element.gap, (i > 0 ? tbl[i - 1].clr : null), tbl[i].clr);

//         if((i > 0 ? tbl[i - 1].clr : null) == "Green" && tbl[i].clr == "Black") console.log(element.gap + Green2Black);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Green" && tbl[i].clr == "Blue") console.log(element.gap +(Green2Black+Black2Blue));
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Black" && tbl[i].clr == "Black") console.log(element.gap);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Black" && tbl[i].clr == "Blue") console.log(element.gap + Black2Blue);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Black" && tbl[i].clr == "Green") console.log(element.gap - Green2Black);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Blue" && tbl[i].clr == "Black") console.log(element.gap - Black2Blue);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Blue" && tbl[i].clr == "Green") console.log(element.gap - (Green2Black+Black2Blue));
//         else console.log(element.gap);
//     }
//     else if (element.clr == 'Black') {
//         console.log(i, map[i][1], 2, dis[i][0], element.gap, (i > 0 ? tbl[i - 1].clr : null), tbl[i].clr);

//         if((i > 0 ? tbl[i - 1].clr : null) == "Green" && tbl[i].clr == "Black") console.log(element.gap + Green2Black);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Green" && tbl[i].clr == "Blue") console.log(element.gap +(Green2Black+Black2Blue));
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Black" && tbl[i].clr == "Black") console.log(element.gap);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Black" && tbl[i].clr == "Blue") console.log(element.gap + Black2Blue);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Black" && tbl[i].clr == "Green") console.log(element.gap - Green2Black);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Blue" && tbl[i].clr == "Black") console.log(element.gap - Black2Blue);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Blue" && tbl[i].clr == "Green") console.log(element.gap - (Green2Black+Black2Blue));
//         else console.log(element.gap);
//     }
//     else if (element.clr == 'Blue') {
//         console.log(i, map[i][2], 3, dis[i][0], element.gap, (i > 0 ? tbl[i - 1].clr : null), tbl[i].clr);

//         if((i > 0 ? tbl[i - 1].clr : null) == "Green" && tbl[i].clr == "Black") console.log(element.gap + Green2Black);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Green" && tbl[i].clr == "Blue") console.log(element.gap +(Green2Black+Black2Blue));
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Black" && tbl[i].clr == "Black") console.log(element.gap);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Black" && tbl[i].clr == "Blue") console.log(element.gap + Black2Blue);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Black" && tbl[i].clr == "Green") console.log(element.gap - Green2Black);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Blue" && tbl[i].clr == "Black") console.log(element.gap - Black2Blue);
//         else if((i > 0 ? tbl[i - 1].clr : null) == "Blue" && tbl[i].clr == "Green") console.log(element.gap - (Green2Black+Black2Blue));
//         else console.log(element.gap);
//     }
//     else {
//         console.log('error');
//     }
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

//////////////////////////////////////////////////////////////////////

// async function exeStart(obj, trn) {
//         const rpm1 = 150
//         const rpm2 = 150
//         const rmp3 = 1550
//         const Green2Black = 3000;
//         const Black2Blue = 3500;

//         const data = await readTable(obj);

//         for (const [i, element] of data.entries()) {
//                 let reg;
//                 let val;

//                 const lookupTable = {
//                     'Green-Green': element.gap,
//                     'Green-Black': element.gap + Green2Black,
//                     'Green-Blue': element.gap + Green2Black + Black2Blue,
//                     'Black-Green': element.gap - Green2Black,
//                     'Black-Black': element.gap,
//                     'Black-Blue': element.gap + Black2Blue,
//                     'Blue-Green': element.gap - Green2Black - Black2Blue,
//                     'Blue-Black': element.gap - Black2Blue,
//                     'Blue-Blue': element.gap
//                 };

//                 const prevColor = i > 0 ? data[i - 1].clr : null;
//                 const key = `${prevColor}-${element.clr}`;

//                 if (element.clr === 'Green') {
//                     reg = map[i][0];
//                     val = rpm1;
//                 } else if (element.clr === 'Black') {
//                     reg = map[i][1];
//                     val = rpm2;
//                 } else if (element.clr === 'Blue') {
//                     reg = map[i][2];
//                     val = rmp3;
//                 }
//                 console.log(i, reg, val, dis[i][0], lookupTable[key] || element.gap);
//         }
// };


///////////////////////////////////////////////////////////////////////////////////////

// let register;
// const regval = [[3512, 4012, 4512],
// [3514, 4014, 4514],
// [3516, 4016, 4516],
// [3518, 4018, 4518],
// [3520, 4020, 4520],
// [3522, 4022, 4522],
// [3524, 4024, 4524],
// [3526, 4026, 4526],
// [3528, 4028, 4528],
// [3530, 4030, 4530],
// [3532, 4032, 4532],
// [3534, 4034, 4534],
// [3536, 4036, 4536],
// [3538, 4038, 4538],
// [3540, 4040, 4540]]

// var tbl = [
//     { ind: 0, clr: 'Green', gap: 0 },
//     { ind: 1, clr: 'Black', gap: 200 },
//     { ind: 2, clr: 'Black', gap: 500 },
//     { ind: 3, clr: 'Blue', gap: 1000 },
//     { ind: 4, clr: 'Black', gap: 1500 },
//     { ind: 5, clr: 'Black', gap: 1800 },
//     { ind: 6, clr: 'Green', gap: 2000 }
// ];

// const Green2Black = 320;
// const Black2Blue = 350;
// let greenindex = 0;
// let blackindex = 0;
// let blueindex = 0;

// const lastRow = tbl[tbl.length - 1];
// const lastRowGap = lastRow.gap;
// console.log(lastRowGap - Green2Black);

// for (const [i, element] of tbl.entries()) {
    
//     const lookupTable = {
//       'Green-Green': element.gap,
//       'Green-Black': element.gap + Green2Black,
//       'Green-Blue': element.gap + Green2Black + Black2Blue,
//       'Black-Green': element.gap - Green2Black,
//       'Black-Black': element.gap,
//       'Black-Blue': element.gap + Black2Blue,
//       'Blue-Green': element.gap - Green2Black - Black2Blue,
//       'Blue-Black': element.gap - Black2Blue,
//       'Blue-Blue': element.gap
//     };
//     const prevColor = i > 0 ? tbl[i - 1].clr : null;
//     const key = `${prevColor}-${element.clr}`;

//     if (element.clr === 'Green') {
//         register = regval[greenindex][0];
//         greenindex += 1;
//     } else if (element.clr === 'Black') {
//         register = regval[blackindex][1];
//         blackindex += 1;
//     } else if (element.clr === 'Blue') {
//         register = regval[blueindex][2];
//         blueindex += 1;
//     }
//     console.log(i, register, lookupTable[key] || element.gap, element.clr);
// };

///////////////////////////////////////////////////////////////////////////////////////



const regval = [[3512, 4012, 4512],
[3514, 4014, 4514],
[3516, 4016, 4516],
[3518, 4018, 4518],
[3520, 4020, 4520],
[3522, 4022, 4522],
[3524, 4024, 4524],
[3526, 4026, 4526],
[3528, 4028, 4528],
[3530, 4030, 4530],
[3532, 4032, 4532],
[3534, 4034, 4534],
[3536, 4036, 4536],
[3538, 4038, 4538],
[3540, 4040, 4540]]

var tbl = [
    { ind: 0, clr: 'Green', gap: 0 },
    { ind: 1, clr: 'Black', gap: 200 },
    { ind: 2, clr: 'Black', gap: 500 },
    { ind: 3, clr: 'Blue', gap: 1000 },
    { ind: 4, clr: 'Black', gap: 1500 },
    { ind: 5, clr: 'Black', gap: 1800 },
    { ind: 6, clr: 'Green', gap: 2000 }
];

const Green2Black = 320;
const Black2Blue = 350;
let greenindex = 0;
let blackindex = 0;
let blueindex = 0;

const lastRow = tbl[tbl.length - 1];
const lastRowGap = lastRow.gap;
console.log(lastRowGap);

for (const [i, element] of tbl.entries()) {
    let register;
    let distance = 0;
    
    if (element.clr === 'Green') {
        register = regval[greenindex][0];
        distance = element.gap;
        greenindex += 1;
    } else if (element.clr === 'Black') {
        register = regval[blackindex][1];
        distance = element.gap + Green2Black;
        blackindex += 1;
    } else if (element.clr === 'Blue') {
        register = regval[blueindex][2];
        distance = element.gap + Green2Black + Black2Blue;
        blueindex += 1;
    }
    console.log(i, register, distance, element.clr);
};