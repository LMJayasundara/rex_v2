const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const knex = require('knex');
const path = require('path');
const main_menu = require('./src/menu');
const { readTable, createRow, updateRow, deleteRow, createTbl, addTbl, saveRow, getSavedFiles, readGigTable } = require('./src/datamodel');
const { checkPort } = require('./src/errors');
const { SerialPort } = require('serialport');
const Store = require('electron-store');
const store = new Store();
const { autoUpdater, AppUpdater } = require("electron-updater");

//Basic flags
// autoUpdater.autoDownload = false;

let mainWindow;
let supv_menu;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 720,
        minWidth: 1200,
        minHeight: 720,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        Menu.setApplicationMenu(null);
        supv_menu = new main_menu(mainWindow);
        mainWindow.openDevTools()

        // checkPort().then((ports)=>{
        //     if(ports.length == 0){
        //         mainWindow.webContents.send('state', "err");
        //     }
        // });

        ////////////////////////////////////////////////////////////
        
        // const serialPort = new SerialPort({
        //     path: "COM",
        //     baudRate: 19200,
        //     dataBits: 8,
        //     parity: "even",
        //     stopBits: 1,
        //     flowControl: false
        // }, false);
        
        // serialPort.on('error', function (err) {
        //     mainWindow.webContents.send('state', "err");
        //     const options = {
        //         type: 'error',
        //         title: 'Error!',
        //         buttons: ['Ok'],
        //         message: 'Modbus Connection Error!',
        //         detail: err.message
        //     };
        //     const response = dialog.showMessageBoxSync(mainWindow, options);
        //     console.log(response);
        //     if (response == 0) {
        //         app.quit();
        //     }
        // });

        // mainWindow.setAlwaysOnTop(true, 'floating');

        ////////////////////////////////////////////////////////////

        // store.set('unicorn', 'shan');
        // console.log(store.get('unicorn'));

        /////////////////////////////////////////////////////////////

        // mainWindow.webContents.send('version', app.getVersion());
        // autoUpdater.checkForUpdates();

        // // Listen for update-available event
        // autoUpdater.on('update-available', () => {
        //     // Show a dialog window asking the user if they want to install the update
        //     const response = dialog.showMessageBox({
        //         type: 'info',
        //         title: 'Update Available',
        //         message: 'A new update is available. Do you want to install it now?',
        //         buttons: ['Yes', 'No']
        //     })
        //     if (response === 0) { // User clicked "Yes"
        //         // Install the update and restart the app
        //         autoUpdater.quitAndInstall()
        //     }
        // });

        // autoUpdater.on('error', (error) => {
        //     // Show an error dialog
        //     dialog.showErrorBox('Error', error.message);
        // });
    });

    mainWindow.loadFile(path.join(__dirname, '/template/index.html'));
};

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('relaunch', () => {
    app.relaunch();
    app.exit(0);
});

ipcMain.handle('login', (event, obj) => {
    const { username, password } = obj;

    readTable("Users").then((data)=>{
        return data;
    }).then((data)=>{
        data.forEach((cred)=>{
            if(cred.User_Name == username && cred.User_Password == password){
                const menu = Menu.buildFromTemplate(supv_menu);
                Menu.setApplicationMenu(menu);
                mainWindow.webContents.send('state', "sub11");
            }
        });
    });
});

function showErr(error){
    dialog.showErrorBox('Error', error.message, {
        detail: error.stack
    });
};

ipcMain.handle('getCrtlist', () => {
    getCrtlist()
});

function getCrtlist() {
    readTable("Files").then((data)=>{
        return data
    }).then((data)=>{
        mainWindow.webContents.send('crtlist', data);
    });
};

ipcMain.handle('saveCrtlist', (event, obj) => {
    addCrtlist(obj)
});

function addCrtlist(obj) {
    createRow("Files", obj)
    .then((error)=>{
        if (error) showErr(error);
        getCrtlist();
    });
};

ipcMain.handle('updateCrtlist', (event, obj) => {
    updateCrtlist(obj)
});

function updateCrtlist(obj) {
    updateRow("Files", obj)
    .then((error)=>{
        if (error) showErr(error);
        getCrtlist();
    });
};

ipcMain.handle('deleteCrtlist', (event, obj) => {
    deleteCrtlist(obj)
});

function deleteCrtlist(obj) {
    deleteRow("Files", obj)
    .then((error)=>{
        if (error) showErr(error);
        getCrtlist();
    });
};

ipcMain.handle('saveTmpGig', (event, obj) => {
    saveRow(obj).then(()=>{
        saveTmpGig(obj);
    });
});

function saveTmpGig(obj) {
    const { tblName, data } = obj;
    createTbl(tblName).then(()=>{
        data.forEach((element, i) => {
            setTimeout(() => {
                addTbl(tblName, element);
            }, 50);
        });
        console.log("Data added");
    });
};

ipcMain.handle('exeTbl', () => {
    getSavedFiles().then((data)=>{
        mainWindow.webContents.send('exeTblRes', data);
    });
});

ipcMain.handle('getGigData', (event, obj) => {
    readGigTable(obj).then((data)=>{
        mainWindow.webContents.send('gigTblRes', data);
    });
});