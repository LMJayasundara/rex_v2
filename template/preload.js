const { ipcRenderer } = require('electron');
var crtlist, itmdes, tmpTbl, sltplc, sltclr = null;
const tmpTblmap = new Map();

window.onload = function () {
    crtlist = document.getElementById("crtlist");
    tmpTbl = document.getElementById("tmpTbl");
    itmdes = document.getElementById("itmdes");
    sltplc = document.getElementById("sltplc");
    sltclr = document.getElementById("sltclr");

    btnSave = document.getElementById("btnSave");
    btnUpdate = document.getElementById("btnUpdate");
    btnDelete = document.getElementById("btnDelete");
    renderGetCrtlist();
    btnSave.onclick = renderAddProduct;
    btnUpdate.onclick = renderUpdateProduct;
    btnDelete.onclick = renderDeleteProduct;
};

async function renderGetCrtlist() {
    await ipcRenderer.invoke('getCrtlist');
};

async function renderAddProduct(e) {
    e.preventDefault();
    var FileNo = document.getElementById('FileNo11').value;
    var ItemDescripition = document.getElementById('ItemDescripition11').value;
    var DrawingNo = document.getElementById('DrawingNo11').value;
    var DrawingIssue = document.getElementById('DrawingIssue11').value

    const obj = {
        File_No: FileNo,
        Item_Des: ItemDescripition,
        Dra_No: DrawingNo,
        Dra_Iss: DrawingIssue,
        Jig_Sts: 'Work'
    };

    if(FileNo != '' || Item_Des != '' || Dra_No != '' || Dra_Iss != ''){
        await ipcRenderer.invoke('saveCrtlist', obj);
    }
    FileNo = "";
    ItemDescripition = "";
    DrawingNo = "";
    DrawingIssue = "";
};

async function renderUpdateProduct(e) {
    e.preventDefault();
    const obj = {
        File_No: document.getElementById('FileNo11').value,
        Item_Des: document.getElementById('ItemDescripition11').value,
        Dra_No: document.getElementById('DrawingNo11').value,
        Dra_Iss: document.getElementById('DrawingIssue11').value
    }
    await ipcRenderer.invoke('updateCrtlist', obj)
};

async function renderDeleteProduct(e) {
    e.preventDefault();
    const obj = {
        File_No: document.getElementById('FileNo11').value
    }
    await ipcRenderer.invoke('deleteCrtlist', obj)
};

function hideall(){
    document.getElementById('login_container').style.display = 'none';
    document.getElementById('error_container').style.display = 'none';
    document.getElementById('new_file_container').style.display = 'none';
    document.getElementById('create_jigs_container').style.display = 'none';
    document.getElementById('execute_container').style.display = 'none';
    document.getElementById('operate_machine_container').style.display = 'none';
    document.getElementById('change_config_container').style.display = 'none';
    document.getElementById('change_password_container').style.display = 'none';
    document.getElementById('about_container').style.display = 'none';
};

const loginBtn = document.getElementById('loginBtn');
loginBtn.addEventListener('click', function(e){
    e.preventDefault();
    var username = document.getElementById("InputName");
    var password = document.getElementById("InputPassword");
    const obj = {username:username.value, password:password.value};
    ipcRenderer.invoke("login", obj);
    username.value = '';
    password.value = '';
});

ipcRenderer.on("state", (event, sts)=>{
    if(sts == 'sub11'){
        document.body.style.background = "none";
        hideall();
        document.getElementById('new_file_container').style.display = 'block';
    }

    else if(sts == 'sub12'){
        hideall();
        document.getElementById('create_jigs_container').style.display = 'block';
    }

    else if(sts == 'sub21'){
        hideall();
        document.getElementById('execute_container').style.display = 'block';
    }

    else if(sts == 'sub31'){
        hideall();
        document.getElementById('operate_machine_container').style.display = 'block';
    }

    else if(sts == 'sub32'){
        hideall();
        document.getElementById('change_config_container').style.display = 'block';
    }

    else if(sts == 'sub33'){
        hideall();
        document.getElementById('change_password_container').style.display = 'block';
    }

    else if(sts == 'sub41'){
        hideall();
        document.getElementById('about_container').style.display = 'block';
    }

    else if(sts == 'sub51'){
        hideall();
        document.body.style.background = null;
        document.getElementById('login_container').style.display = 'block';
    }

    else if(sts == 'err'){
        hideall();
        document.getElementById('error_container').style.display = 'block';
    }
});

ipcRenderer.on('crtlist', (event, results) => {
    let crtlisttbl = "";
    let itmdesdrop = '';
    const list = results;
    list.forEach(element => {
        crtlisttbl += `
            <tr>
            <tr>
                <td>${element.File_No}</td>
                <td>${element.Item_Des}</td>
                <td>${element.Dra_No}</td>
                <td>${element.Dra_Iss}</td>
                <td>${element.Jig_Sts}</td>
            </tr>
            </tr>
        `;
        itmdesdrop +=`
            <option>${element.Item_Des}</option>
        `;
    });
    crtlist.innerHTML = crtlisttbl;
    itmdes.innerHTML = `<option selected>Choose...</option>`+itmdesdrop;

    var fetchdrop = document.getElementById("fetchdrop");
    fetchdrop.addEventListener('click', function() {
        var text = itmdes.options[itmdes.selectedIndex].text;
        const findls = Array.from(list).find(file => (file.Item_Des === text));
        if(findls != undefined){
            document.getElementById('filno').value = findls.File_No;
            document.getElementById('drano').value = findls.Dra_No;
            document.getElementById('iss').value = findls.Dra_Iss;
        };
    });
});

var fetchtbl = document.getElementById("fetchtbl"), rIndex;
fetchtbl.addEventListener('click', event => {
    for(var i = 1; i < fetchtbl.rows.length; i++){
        fetchtbl.rows[i].onclick = function(){
            rIndex = this.rowIndex;
            
            document.getElementById("FileNo11").value = this.cells[0].innerHTML;
            document.getElementById("ItemDescripition11").value = this.cells[1].innerHTML;
            document.getElementById("DrawingNo11").value = this.cells[2].innerHTML;
            document.getElementById("DrawingIssue11").value = this.cells[3].innerHTML;
        }
    }
});

function clearInputs() {
    const inputs = document.querySelectorAll("#input_container input");
    inputs.forEach(input => input.value = "");
};

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
};

function renderTmpGig() {
    let len = parseInt(document.getElementById('crdlen').value);
    let mid = parseInt(document.getElementById('midpnt').value);
    let gap = parseInt(document.getElementById('kkdis').value);
    let bins = parseInt(document.getElementById('ttlmrk').value);

    var results = fillTbl(len, mid, gap, bins);
    let tmpGigtbl = "";
    let itmdesdrop = '';
    results.forEach((element, i) => {
        tmpGigtbl += `
            <tr>
                <td>${element[0]+1}</td>
                <td>${element[1]}</td>
                <td contenteditable=${element[2] == null ? "true" : "false"}>${element[2] == null ? '': element[2]}</td>
            </tr>
        `;
        itmdesdrop +=`
            <option>${element[0]+1}</option>
        `;

        tmpTblmap.set(i, element);
    });
    tmpTbl.innerHTML = tmpGigtbl;
    sltplc.innerHTML = `<option selected>Choose...</option>`+itmdesdrop;
};

async function updateTmpTbl() {
    let val = (tmpTbl.rows[parseInt(sltplc.value)-1].cells[2].innerHTML);
    tmpTblmap.set(parseInt(sltplc.value)-1, [parseInt(sltplc.value)-1, sltclr.value, val]);

    return new Promise((resolve, reject) => {
        tmpTblmap.forEach((element, i) => {
            tmpTblmap.set(i, [element[0], element[1], tmpTbl.rows[i].cells[2].innerHTML]);
        });
        resolve();
    }).then(()=>{
        let tmpGigtbl = "";
        tmpTblmap.forEach((element, i) => {
            tmpGigtbl += `
                <tr>
                    <td>${element[0]+1}</td>
                    <td>${element[1]}</td>
                    <td contenteditable=${i<3 || i>(tmpTblmap.size - 2) ? "true" : "false"}>${element[2] == null ? '': element[2]}</td>
                </tr>
            `;
        });
    
        tmpTbl.innerHTML = tmpGigtbl;
    });
};

function saveTmpTbl(){
    // await ipcRenderer.invoke('getTmpGig');
    console.log(tmpTblmap);
}

// ipcRenderer.on('tmpGig', (event, results) => {
//     console.log(results);
//     let tmpGigtbl = "";
//     results.forEach(element => {
//         tmpGigtbl += `
//             <tr>
//             <tr>
//                 <td>${element.ind}</td>
//                 <td>${element.clr}</td>
//                 <td contenteditable="true">${element.gap}</td>
//             </tr>
//             </tr>
//         `;
//     });
//     tmpTbl.innerHTML = tmpGigtbl;
// });