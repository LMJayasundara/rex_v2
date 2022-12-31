const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const main_menu = require('./src/menu');
const { readTable, createRow, updateRow, deleteRow } = require('./src/data-model');
const { checkPort } = require('./src/errors');
const { SerialPort } = require('serialport');

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

        checkPort().then((ports)=>{
            if(ports.length == 0){
                mainWindow.webContents.send('state', "err");
            }
        });
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

// ipcMain.handle('getTmpGig', () => {
//     getTmpGig()
// });

// function getTmpGig() {
//     readTable("tmpjig").then((data)=>{
//         return data
//     }).then((data)=>{
//         mainWindow.webContents.send('tmpGig', data);
//     });
// };