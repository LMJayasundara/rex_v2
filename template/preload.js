const { ipcRenderer } = require('electron');
var crtlist, itmdes, sltplc, sltclr = null;
var tmpTbl, exeTbl, gigTbl = null;
const tmpTblmap = new Map();

window.onload = function () {
    crtlist = document.getElementById("crtlist");
    tmpTbl = document.getElementById("tmpTbl");
    itmdes = document.getElementById("itmdes");
    sltplc = document.getElementById("sltplc");
    sltclr = document.getElementById("sltclr");

    exeTbl = document.getElementById("exeTbl");
    gigTbl = document.getElementById("gigTbl");

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

    if (FileNo != '' || Item_Des != '' || Dra_No != '' || Dra_Iss != '') {
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

function hideall() {
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
loginBtn.addEventListener('click', function (e) {
    e.preventDefault();
    var username = document.getElementById("InputName");
    var password = document.getElementById("InputPassword");
    const obj = { username: username.value, password: password.value };
    ipcRenderer.invoke("login", obj);
    username.value = '';
    password.value = '';
});

ipcRenderer.on("state", (event, sts) => {
    if (sts == 'sub11') {
        hideall();
        document.body.style.background = "none";
        document.getElementById('new_file_container').style.display = 'block';
    }

    else if (sts == 'sub12') {
        hideall();
        document.getElementById('create_jigs_container').style.display = 'block';
    }

    else if (sts == 'sub21') {
        hideall();
        ipcRenderer.invoke('exeTbl');
        document.getElementById('execute_container').style.display = 'block';
    }

    else if (sts == 'sub31') {
        hideall();
        document.getElementById('operate_machine_container').style.display = 'block';
    }

    else if (sts == 'sub32') {
        hideall();
        document.getElementById('change_config_container').style.display = 'block';
    }

    else if (sts == 'sub33') {
        hideall();
        document.getElementById('change_password_container').style.display = 'block';
    }

    else if (sts == 'sub41') {
        hideall();
        document.getElementById('about_container').style.display = 'block';
    }

    else if (sts == 'sub51') {
        hideall();
        document.body.style.background = null;
        document.getElementById('login_container').style.display = 'block';
    }

    else if (sts == 'err') {
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
        itmdesdrop += `
            <option>${element.Item_Des}</option>
        `;
    });
    crtlist.innerHTML = crtlisttbl;
    itmdes.innerHTML = `<option selected>Choose...</option>` + itmdesdrop;

    var fetchdrop = document.getElementById("fetchdrop");
    fetchdrop.addEventListener('click', function () {
        var text = itmdes.options[itmdes.selectedIndex].text;
        const findls = list.find(file => (file.Item_Des === text));
        if (findls) {
            document.getElementById('filno').value = findls.File_No;
            document.getElementById('drano').value = findls.Dra_No;
            document.getElementById('iss').value = findls.Dra_Iss;
        };
    });
});

const fetchtbl = document.getElementById("fetchtbl");
fetchtbl.addEventListener('click', event => {
    let targetElement = event.target;
    while (targetElement && targetElement.tagName !== 'TR') {
        targetElement = targetElement.parentNode;
    }
    if (targetElement && targetElement.parentNode.tagName === 'TBODY') {
        document.getElementById("FileNo11").value = targetElement.cells[0].innerHTML;
        document.getElementById("ItemDescripition11").value = targetElement.cells[1].innerHTML;
        document.getElementById("DrawingNo11").value = targetElement.cells[2].innerHTML;
        document.getElementById("DrawingIssue11").value = targetElement.cells[3].innerHTML;
    }
});

function clearInputs() {
    const inputs = document.querySelectorAll("#input_container input");
    inputs.forEach(input => input.value = "");
};

function fillTbl(mid, gap, bins) {
    let arr = new Array(bins).fill(null);
    let midIndex = Math.floor(arr.length / 2);

    for (let [index, val] of arr.entries()) {
        if (index == midIndex) {
            arr[index] = [index, 'Blue', mid];
        }
        else if (index > 2 && index < (arr.length - 3) && index != midIndex) {
            arr[index] = [index, 'Black', mid - ((midIndex - index) * gap)]
        }
        else if (index === 0 || index === (bins - 1)) {
            arr[index] = [index, 'Green', null]
        }
        else {
            arr[index] = [index, 'Black', null]
        }
    };
    return arr;
};

function renderTmpGig() {
    let mid = parseInt(document.getElementById('midpnt').value);
    let gap = parseInt(document.getElementById('kkdis').value);
    let bins = parseInt(document.getElementById('ttlmrk').value);

    var results = fillTbl(mid, gap, bins);
    let tmpGigtbl = "";
    let itmdesdrop = '';
    results.forEach((element, i) => {
        tmpGigtbl += `
            <tr>
                <td>${element[0] + 1}</td>
                <td>${element[1]}</td>
                <td contenteditable=${element[2] == null ? "true" : "false"}>${element[2] == null ? '' : element[2]}</td>
            </tr>
        `;
        itmdesdrop += `
            <option>${element[0] + 1}</option>
        `;
        tmpTblmap.set(i, element);
    });
    tmpTbl.innerHTML = tmpGigtbl;
    sltplc.innerHTML = `<option selected>Choose...</option>` + itmdesdrop;
};

async function updateTmpTbl() {
    let val = (tmpTbl.rows[parseInt(sltplc.value) - 1].cells[2].innerHTML);
    tmpTblmap.set(parseInt(sltplc.value) - 1, [parseInt(sltplc.value) - 1, sltclr.value, val]);

    return new Promise((resolve, reject) => {
        tmpTblmap.forEach((element, i) => {
            tmpTblmap.set(i, [element[0], element[1], tmpTbl.rows[i].cells[2].innerHTML]);
        });
        resolve();
    }).then(() => {
        let tmpGigtbl = "";
        tmpTblmap.forEach((element, i) => {
            tmpGigtbl += `
                <tr>
                    <td>${element[0] + 1}</td>
                    <td>${element[1]}</td>
                    <td contenteditable=${i < 3 || i > (tmpTblmap.size - 2) ? "true" : "false"}>${element[2] == null ? '' : element[2]}</td>
                </tr>
            `;
        });
        tmpTbl.innerHTML = tmpGigtbl;
    });
};

async function saveTmpTbl() {
    let len = parseInt(document.getElementById('crdlen').value);
    let md = parseInt(document.getElementById('midpnt').value);
    let mark = parseInt(document.getElementById('ttlmrk').value);
    let turn = parseInt(document.getElementById('notrn').value);
    let adj = parseInt(document.getElementById('adjval').value);
    let kk = parseInt(document.getElementById('kkdis').value);
    let FileNo = document.getElementById('filno').value;

    return new Promise((resolve, reject) => {
        tmpTblmap.forEach((element, i) => {
            tmpTblmap.set(i, [element[0], element[1], tmpTbl.rows[i].cells[2].innerHTML]);
        });
        resolve();
    }).then(async () => {
        const obj = {
            tblName: FileNo,
            data: tmpTblmap,
            saved: 1,
            len: len,
            md: md,
            mark: mark,
            turn: turn,
            adj: adj,
            kk: kk,

        };
        await ipcRenderer.invoke('saveTmpGig', obj);
    });
};

ipcRenderer.on('exeTblRes', (event, results) => {
    let exeSaveTbl = "";
    results.forEach(element => {
        exeSaveTbl += `
            <tr>
            <tr>
                <td>${element.File_No}</td>
                <td>${element.Item_Des}</td>
                <td>${element.Jig_Sts}</td>
                <td>${element.turn}</td>

                <td style="display: none;">${element.Dra_No}</td>
                <td style="display: none;">${element.Dra_Iss}</td>
                <td style="display: none;">${element.len}</td>
                <td style="display: none;">${element.mark}</td>
            </tr>
            </tr>
        `;
    });
    exeTbl.innerHTML = exeSaveTbl;
});

const mainExeTbl = document.getElementById("mainExeTbl");
mainExeTbl.addEventListener('click', event => {
    let targetElement = event.target;
    while (targetElement && targetElement.tagName !== 'TR') {
        targetElement = targetElement.parentNode;
    }
    if (targetElement && targetElement.parentNode.tagName === 'TBODY') {
        // const rowIndex = targetElement.rowIndex;
        var obj = targetElement.cells[0].innerHTML;
        ipcRenderer.invoke('getGigData', obj);

        document.getElementById("exeDraNo").value = targetElement.cells[4].innerHTML;
        document.getElementById("exeIss").value = targetElement.cells[5].innerHTML;
        document.getElementById("exeCrdln").value = targetElement.cells[6].innerHTML;
        document.getElementById("exeTtlMrk").value = targetElement.cells[7].innerHTML;
        document.getElementById("exePro").value = 0;
    }
});

ipcRenderer.on('gigTblRes', (event, results) => {
    let tbl = "";
    results.forEach(element => {
        tbl += `
            <tr>
            <tr>
                <td>${element.ind}</td>
                <td>${element.clr}</td>
                <td>${element.gap}</td>
            </tr>
            </tr>
        `;
    });
    gigTbl.innerHTML = tbl;
});