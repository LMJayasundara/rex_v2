function gut(a) {
    var o = [], s = a.length, l = Math.floor(s / 2), c;
    for (c = 0; c < s; c++)o.push(a[l += (s % 2 ? c % 2 ? +c : -c : c % 2 ? -c : +c)]);
    return o
}

// console.log(gut([1, 2, 3, 5]));

function fillTbl(len, mid, gap, bins) {
    let arr = new Array(bins).fill(null);
    let midIndex = Math.floor(arr.length / 2);
  
    for (let [index, val] of arr.entries()) {
      if(index == midIndex){
        arr[index] = [index,'Blue', mid];
      }
      else if(index > 2 && index < (arr.length -3) && index != midIndex){
            arr[index] = [index, 'Black', mid - ((midIndex - index) * gap)]
      }
      else if(index === 0 || index === (bins-1)){
        arr[index] = [index, 'Green', null]
      }
      else{
        arr[index] = [index, 'Black', null]
      }
    };
    return arr;
}

console.log(fillTbl(200, 100, 10, 18));