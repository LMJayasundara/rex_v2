const { ipcRenderer } = require('electron');

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