const { ipcRenderer } = require('electron');
var crtlist, crtForm, itmdes, sltplc, sltclr = null;
var tmpTbl, exeTbl, gigTbl = null;
const tmpTblmap = new Map();

window.onload = function () {
    crtlist = document.getElementById("crtlist");
    crtForm = document.getElementById('crtForm')
    tmpTbl = document.getElementById("tmpTbl");
    itmdes = document.getElementById("itmdes");
    sltplc = document.getElementById("sltplc");
    sltclr = document.getElementById("sltclr");

    exeTbl = document.getElementById("exeTbl");
    gigTbl = document.getElementById("gigTbl");

    btnSave = document.getElementById("btnSave");
    btnUpdate = document.getElementById("btnUpdate");
    btnDelete = document.getElementById("btnDelete");
    
    btnSave.onclick = renderAddProduct;
    btnUpdate.onclick = renderUpdateProduct;
    btnDelete.onclick = renderDeleteProduct;
    btnClear.onclick = renderClearProduct;

    renderGetCrtlist();
};

async function renderGetCrtlist() {
    await ipcRenderer.invoke('getCrtlist');
};

async function renderClearProduct() {
    crtForm.reset();
};

async function renderAddProduct(e) {
    e.preventDefault();
    var FileNo = document.getElementById('FileNo11').value;
    var ItemDes = document.getElementById('ItemDescripition11').value;
    var DrawingNo = document.getElementById('DrawingNo11').value;
    var DrawingIssue = document.getElementById('DrawingIssue11').value

    if (FileNo != '' && ItemDes != '' && DrawingNo != '' && DrawingIssue != '') {
        const obj = {
            File_No: FileNo,
            Item_Des: ItemDes,
            Dra_No: DrawingNo,
            Dra_Iss: DrawingIssue,
            Jig_Sts: 'Work'
        };
        await ipcRenderer.invoke('saveCrtlist', obj);
        crtForm.reset();
    }
    else {
        await ipcRenderer.invoke('error', "All Fields are Required!");
    }
};

async function renderUpdateProduct(e) {
    e.preventDefault();
    const obj = {
        File_No: document.getElementById('FileNo11').value,
        Item_Des: document.getElementById('ItemDescripition11').value,
        Dra_No: document.getElementById('DrawingNo11').value,
        Dra_Iss: document.getElementById('DrawingIssue11').value
    }
    await ipcRenderer.invoke('updateCrtlist', obj);
    crtForm.reset();
};

async function renderDeleteProduct(e) {
    e.preventDefault();
    const obj = {
        File_No: document.getElementById('FileNo11').value
    }
    await ipcRenderer.invoke('deleteCrtlist', obj);
    crtForm.reset();
};

function hideall() {
    document.getElementById('login_container').style.display = 'none';
    document.getElementById('error_container').style.display = 'none';
    document.getElementById('new_file_container').style.display = 'none';
    document.getElementById('create_jigs_container').style.display = 'none';
    document.getElementById('execute_container').style.display = 'none';
    document.getElementById('operate_machine_container').style.display = 'none';
    document.getElementById('change_config_container').style.display = 'none';
    document.getElementById('change_plc_container').style.display = 'none';
    document.getElementById('change_password_container').style.display = 'none';
    document.getElementById('about_container').style.display = 'none';
};

const loginBtn = document.getElementById('loginBtn');
loginBtn.addEventListener('click', function (e) {
    e.preventDefault();
    var username = document.getElementById("InputName");
    var password = document.getElementById("InputPassword");
    const obj = { username: username.value, password: password.value };
    ipcRenderer.invoke("exeStatus");
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
        ipcRenderer.invoke("actMode", 'Auto');
        ipcRenderer.invoke('exeTbl');
        document.getElementById('execute_container').style.display = 'block';
    }

    else if (sts == 'sub31') {
        hideall();
        ipcRenderer.invoke("actMode", 'Manual');
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

    else if (sts == 'sub53') {
        hideall();
        document.getElementById('change_plc_container').style.display = 'block';
    }
});

ipcRenderer.on("error", (event, sts) => {
    if (sts.message === "errPort") {
        hideall();
        document.body.style.background = "none";
        document.getElementById('errDis').innerHTML = sts.error;
        document.getElementById('error_container').style.display = 'block';
    }

    else if (sts.message === "emtPort") {
        hideall();
        document.body.style.background = "none";
        document.getElementById('errDis').innerHTML = sts.error;
        document.getElementById('error_container').style.display = 'block';
        document.getElementById('enterPort').style.display = 'none';
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
    tmpTblmap.clear();
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

function rmvTmpTbl() {
    tmpTblmap.clear();
    const table = document.getElementById('tmpTblx');
    const tbody = table.querySelector('tbody');

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
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

var exeSlcFile;
const mainExeTbl = document.getElementById("mainExeTbl");
mainExeTbl.addEventListener('click', event => {
    let targetElement = event.target;
    while (targetElement && targetElement.tagName !== 'TR') {
        targetElement = targetElement.parentNode;
    }
    if (targetElement && targetElement.parentNode.tagName === 'TBODY') {
        // const rowIndex = targetElement.rowIndex;
        var obj = targetElement.cells[0].innerHTML;
        exeSlcFile = obj;
        ipcRenderer.invoke('getGigData', obj);

        document.getElementById("exeDraNo").value = targetElement.cells[4].innerHTML;
        document.getElementById("exeIss").value = targetElement.cells[5].innerHTML;
        document.getElementById("exeCrdln").value = targetElement.cells[6].innerHTML;
        document.getElementById("exeTtlMrk").value = targetElement.cells[7].innerHTML;
        document.getElementById("exePro").value = 0;
    }
});

ipcRenderer.on('gigTblObj', (event, results) => {
    document.getElementById("exeDraNo").value = results[0].Dra_No;
    document.getElementById("exeIss").value = results[0].Dra_Iss;
    document.getElementById("exeCrdln").value = results[0].len;
    document.getElementById("exeTtlMrk").value = results[0].mark;
});

ipcRenderer.on('exePro', (event, results) => {
    document.getElementById("exePro").value = results;
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

const button = document.getElementById('relaunch');
button.addEventListener('click', (event) => {
    const port = document.getElementById('port').value;
    ipcRenderer.invoke('relaunch', port);
});

ipcRenderer.on('version', (event, results) => {
    document.getElementById('Vno').innerHTML = results;
});

/////////////////////////////////// Manual Operations ///////////////////////////////////
const btnUpMainRoll = document.getElementById("btnUpMainRoll");
const btnDownMainRoll = document.getElementById("btnDownMainRoll");
const btnPullGuidBoard = document.getElementById("btnPullGuidBoard");
const btnResetGuidBoard = document.getElementById("btnResetGuidBoard");
const btnBladeon = document.getElementById("btnBladeon");
const btnBladeoff = document.getElementById("btnBladeoff");
const btnDragBraidIn = document.getElementById("btnDragBraidIn");
const btnresetDragBraidIn = document.getElementById("btnresetDragBraidIn");
const btnactHomeManual = document.getElementById("btnactHomeManual");
const btnGetBraidOut = document.getElementById("btnGetBraidOut");
const btnresetGetBraidOut = document.getElementById("btnresetGetBraidOut");
const btnReleaseDraggingRoll = document.getElementById("btnReleaseDraggingRoll");
const btnSetDraggingRoll = document.getElementById("btnSetDraggingRoll");
const btnSetHeat = document.getElementById("btnSetHeat");
const btnresetSetHeat = document.getElementById("btnresetSetHeat");
const btnRunInkRoll = document.getElementById("btnRunInkRoll");
const btnStopInkRoll = document.getElementById("btnStopInkRoll");
const btnCutterFwd = document.getElementById("btnCutterFwd");
const btnStpCutterFwd = document.getElementById("btnStpCutterFwd");
const btnCutterRvs = document.getElementById("btnCutterRvs");
const btnStpCutterRvs = document.getElementById("btnStpCutterRvs");

// Main Roll
btnUpMainRoll.addEventListener('click', upMainRoll);
function upMainRoll() {
    ipcRenderer.invoke('upMainRoll');
    btnUpMainRoll.style.display = 'none';
    btnDownMainRoll.style.display = 'block';
};
btnDownMainRoll.addEventListener('click', downMainRoll);
function downMainRoll() {
    ipcRenderer.invoke('downMainRoll');
    btnUpMainRoll.style.display = 'block';
    btnDownMainRoll.style.display = 'none';
};

// Guid Board
btnPullGuidBoard.addEventListener('click', pullGuidBoard);
function pullGuidBoard() {
    ipcRenderer.invoke('pullGuidBoard');
    btnPullGuidBoard.style.display = 'none';
    btnResetGuidBoard.style.display = 'block';
};
btnResetGuidBoard.addEventListener('click', resetGuidBoard);
function resetGuidBoard() {
    ipcRenderer.invoke('resetGuidBoard');
    btnPullGuidBoard.style.display = 'block';
    btnResetGuidBoard.style.display = 'none';
};

// Cutter
btnBladeon.addEventListener('click', bladeon);
function bladeon() {
    ipcRenderer.invoke('btnBladeon');
    btnBladeon.style.display = 'none';
    btnBladeoff.style.display = 'block';
};
btnBladeoff.addEventListener('click', bladeoff);
function bladeoff() {
    ipcRenderer.invoke('btnBladeoff');
    btnBladeon.style.display = 'block';
    btnBladeoff.style.display = 'none';
};

// Braid In
btnDragBraidIn.addEventListener('click', dragBraidIn);
function dragBraidIn() {
    ipcRenderer.invoke('dragBraidIn');
    btnDragBraidIn.style.display = 'none';
    btnresetDragBraidIn.style.display = 'block';
};
btnresetDragBraidIn.addEventListener('click', resetDragBraidIn);
function resetDragBraidIn() {
    ipcRenderer.invoke('resetDragBraidIn');
    btnDragBraidIn.style.display = 'block';
    btnresetDragBraidIn.style.display = 'none';
};

// Home
btnactHomeManual.addEventListener('click', actHomeManual);
function actHomeManual() {
    ipcRenderer.invoke('btnactHomeManual');
    btnactHomeManual.classList.remove('btn-primary');
    btnactHomeManual.classList.add('btn-danger');
    setTimeout(() => {
        btnactHomeManual.classList.remove('btn-danger');
        btnactHomeManual.classList.add('btn-primary');
    }, 3000);
};

// Braid Out
btnGetBraidOut.addEventListener('click', getBraidOut);
function getBraidOut() {
    ipcRenderer.invoke('getBraidOut');
    btnGetBraidOut.style.display = 'none';
    btnresetGetBraidOut.style.display = 'block';
};
btnresetGetBraidOut.addEventListener('click', resetGetBraidOut);
function resetGetBraidOut() {
    ipcRenderer.invoke('resetGetBraidOut');
    btnGetBraidOut.style.display = 'block';
    btnresetGetBraidOut.style.display = 'none';
};

// Dragging Roll
btnReleaseDraggingRoll.addEventListener('click', releaseDraggingRoll);
function releaseDraggingRoll() {
    ipcRenderer.invoke('releaseDraggingRoll');
    btnReleaseDraggingRoll.style.display = 'none';
    btnSetDraggingRoll.style.display = 'block';
};
btnSetDraggingRoll.addEventListener('click', setDraggingRoll);
function setDraggingRoll() {
    ipcRenderer.invoke('setDraggingRoll');
    btnReleaseDraggingRoll.style.display = 'block';
    btnSetDraggingRoll.style.display = 'none';
};

// Set Heat Seal
btnSetHeat.addEventListener('click', setHeat);
function setHeat() {
    ipcRenderer.invoke('setHeat');
    document.getElementById('btnSetHeat').style.display = 'none';
    document.getElementById('btnresetSetHeat').style.display = 'block';
};
btnresetSetHeat.addEventListener('click', resetsetHeat);
function resetsetHeat() {
    ipcRenderer.invoke('resetsetHeat');
    document.getElementById('btnSetHeat').style.display = 'block';
    document.getElementById('btnresetSetHeat').style.display = 'none';
};

// Ink Roll
btnRunInkRoll.addEventListener('click', runInkRoll);
function runInkRoll() {
    ipcRenderer.invoke('runInkRoll');
    document.getElementById('btnRunInkRoll').style.display = 'none';
    document.getElementById('btnStopInkRoll').style.display = 'block';
};
btnStopInkRoll.addEventListener('click', stopInkRoll);
function stopInkRoll() {
    ipcRenderer.invoke('stopInkRoll');
    document.getElementById('btnRunInkRoll').style.display = 'block';
    document.getElementById('btnStopInkRoll').style.display = 'none';
};

// Cutter Fwd
btnCutterFwd.addEventListener('click', cutterFwd);
function cutterFwd() {
    ipcRenderer.invoke('cutterFwd');
    btnCutterFwd.style.display = 'none';
    btnStpCutterFwd.style.display = 'block';
};
btnStpCutterFwd.addEventListener('click', stpCutterFwd);
function stpCutterFwd() {
    ipcRenderer.invoke('stpCutterFwd');
    btnCutterFwd.style.display = 'block';
    btnStpCutterFwd.style.display = 'none';
};

// Cutter Rvs
btnCutterRvs.addEventListener('click', cutterRvs);
function cutterRvs() {
    ipcRenderer.invoke('cutterRvs');
    btnCutterRvs.style.display = 'none';
    btnStpCutterRvs.style.display = 'block';
};
btnStpCutterRvs.addEventListener('click', stpCutter2);
function stpCutter2() {
    ipcRenderer.invoke('stpCutterRvs');
    btnCutterRvs.style.display = 'block';
    btnStpCutterRvs.style.display = 'none';
};

/////////////////////////////////// Execute Operations ///////////////////////////////////
const exeStart = document.getElementById("exeStart");
const exeStop = document.getElementById("exeStop");
const exePre = document.getElementById("exePre");
const exePause = document.getElementById("exePause");

exeStart.addEventListener('click', () => {
    ipcRenderer.invoke('exeStart', exeSlcFile);
});

exeStop.addEventListener('click', () => {
    ipcRenderer.invoke('exeStop');
});

exePre.addEventListener('click', () => {
    ipcRenderer.invoke('exePre', exeSlcFile);
});

// exePause.addEventListener('click', ()=>{
//     ipcRenderer.invoke('exePause', exeSlcFile);
// });