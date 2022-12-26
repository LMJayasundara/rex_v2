const { ipcRenderer } = require('electron');
var crtlist = null;

window.onload = function () {
    crtlist = document.getElementById("crtlist");
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
    let template = "";
    const list = results;
    list.forEach(element => {
        template += `
            <tr>
            <tr>
                <td>${element.File_No}</td>
                <td>${element.Item_Des}</td>
                <td>${element.Dra_No}</td>
                <td>${element.Dra_Iss}</td>
                <td>${element.Jig_Sts}</td>
            </tr>
            </tr>
        `
    });
    crtlist.innerHTML = template;
});

var table = document.getElementById("fetch"), rIndex;
table.addEventListener('click', event => {
    for(var i = 1; i < table.rows.length; i++){
        table.rows[i].onclick = function(){
            rIndex = this.rowIndex;
            
            document.getElementById("FileNo11").value = this.cells[0].innerHTML;
            document.getElementById("ItemDescripition11").value = this.cells[1].innerHTML;
            document.getElementById("DrawingNo11").value = this.cells[2].innerHTML;
            document.getElementById("DrawingIssue11").value = this.cells[3].innerHTML;
        }
    }
});