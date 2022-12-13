const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const main_menu = require('./src/menu');
const { readTable } = require('./src/data-model');

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