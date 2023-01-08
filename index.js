const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const main_menu = require('./src/menu');
const { readTable, createRow, updateRow, deleteRow, createTbl, addTbl, saveRow, getSavedFiles, readGigTable, dropTbl } = require('./src/datamodel');
const { checkPort } = require('./src/errors');
const { SerialPort } = require('serialport');
const Modbus = require('jsmodbus');
const Store = require('electron-store');
const store = new Store();
const { autoUpdater, AppUpdater } = require("electron-updater");
const ProgressBar = require('electron-progressbar');
const { log } = require('console');

app.disableHardwareAcceleration();

//Basic flags
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Create the progress bar
let progressBar;

let mainWindow;
let supv_menu;
// let client;

const serialPort = new SerialPort({
    path: "COM4",
    baudRate: 19200,
    dataBits: 8,
    parity: "even",
    stopBits: 1,
    flowControl: false
}, false);

serialPort.on('error', function (err) {
    const options = {
        type: 'error',
        title: 'Error!',
        buttons: ['Ok'],
        message: 'Modbus Connection Error!',
        detail: err.message
    };
    const response = dialog.showMessageBoxSync(mainWindow, options);
    if (response == 0) {
        app.relaunch();
        app.quit(0);
    }
});

const client = new Modbus.client.RTU(serialPort, 1, 10000);

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
        mainWindow.openDevTools();

        // checkPort().then((ports)=>{
        //     if(ports.length == 0){
        //         mainWindow.webContents.send('state', "err");
        //     }
        // });

        mainWindow.webContents.send('version', app.getVersion());
    });

    mainWindow.loadFile(path.join(__dirname, '/template/index.html'));
};

autoUpdater.on('update-available', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Update', 'Later'],
        noLink: true,
        title: 'Application Update',
        message: 'A new version of the application is available.',
        detail: 'The app will be restarted to install the update.'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.downloadUpdate();
    });
});

autoUpdater.on('download-progress', (progress) => {
    if (!progressBar) {
        progressBar = new ProgressBar({
            title: 'Downloading update',
            text: 'Downloading update...',
            browserWindow: {
                parent: mainWindow,
                modal: true,
                resizable: false,
                minimizable: false,
                maximizable: false
            }
        });
    } else {
        progressBar.detail = `Downloading complete ${(progress.percent).toFixed()}%`;
        progressBar.value = (progress.percent).toFixed() / 100;
    }
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        noLink: true,
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
});

autoUpdater.on('error', (error) => {
    dialog.showErrorBox('Error', error.message);
});

app.whenReady().then(() => {
    autoUpdater.checkForUpdates();
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

    if (username == '' || password == '') {
        // dialog.showErrorBox('Error', "Username and Password Required!");
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Error',
            message: 'Username and Password Required!',
            alwaysOnTop: true
        });
    }
    else {
        readTable("Users").then((data) => {
            return data;
        }).then((data) => {
            data.forEach((cred) => {
                if (cred.User_Name == username && cred.User_Password == password) {
                    const menu = Menu.buildFromTemplate(supv_menu);
                    Menu.setApplicationMenu(menu);
                    mainWindow.webContents.send('state', "sub11");
                }
                else {
                    // dialog.showErrorBox('Error', "Invalid Username or Password!");
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'Error',
                        message: 'Invalid Username or Password!',
                        alwaysOnTop: true
                    });
                }
            });
        });
    };
});

function showErr(error) {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Error',
        message: error.message,
        alwaysOnTop: true
    });
};

ipcMain.handle('error', (event, err) => {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Error',
        message: err,
        alwaysOnTop: true
    });
});

ipcMain.handle('getCrtlist', () => {
    getCrtlist()
});

function getCrtlist() {
    readTable("Files").then((data) => {
        return data
    }).then((data) => {
        mainWindow.webContents.send('crtlist', data);
    });
};

ipcMain.handle('saveCrtlist', (event, obj) => {
    addCrtlist(obj)
});

function addCrtlist(obj) {
    createRow("Files", obj)
        .then((error) => {
            if (error) showErr(error);
            getCrtlist();
        });
};

ipcMain.handle('updateCrtlist', (event, obj) => {
    updateCrtlist(obj)
});

function updateCrtlist(obj) {
    updateRow("Files", obj)
        .then((error) => {
            if (error) showErr(error);
            getCrtlist();
        });
};

ipcMain.handle('deleteCrtlist', (event, obj) => {
    deleteCrtlist(obj)
});

function deleteCrtlist(obj) {
    deleteRow("Files", obj)
        .then((error) => {
            if (error) showErr(error);
            getCrtlist();
        })
        .then(() => {
            dropTbl(obj).then((error) => {
                if (error) showErr(error);
            })
        });
};

ipcMain.handle('saveTmpGig', (event, obj) => {
    saveRow(obj).then(() => {
        saveTmpGig(obj);
    });
});

function saveTmpGig(obj) {
    const { tblName, data } = obj;
    createTbl(tblName).then(() => {
        data.forEach((element, i) => {
            setTimeout(() => {
                addTbl(tblName, element);
            }, 50);
        });
        console.log("Data added");
    });
};

ipcMain.handle('exeTbl', () => {
    getSavedFiles().then((data) => {
        mainWindow.webContents.send('exeTblRes', data);
    });
});

ipcMain.handle('getGigData', (event, obj) => {
    readGigTable(obj).then((data) => {
        mainWindow.webContents.send('gigTblRes', data);
    });
});

/////////////////////////////////// Manual Operations ///////////////////////////////////
// Main Roll
ipcMain.handle('upMainRoll', (event, obj) => {
    console.log('upMainRoll');
    client.writeSingleCoil(22, true).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('MainRoll Up Error', error.message);
    });
});

ipcMain.handle('downMainRoll', (event, obj) => {
    console.log('downMainRoll');
    client.writeSingleCoil(22, false).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('MainRoll Down Error', error.message);
    });
});

// Guid Board
ipcMain.handle('pullGuidBoard', (event, obj) => {
    console.log('pullGuidBoard');
    client.writeSingleCoil(24, true).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('GuidBoard Pull Error', error.message);
    });
});

ipcMain.handle('resetGuidBoard', (event, obj) => {
    console.log('resetGuidBoard');
    client.writeSingleCoil(24, false).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('GuidBoard Reset Error', error.message);
    });
});

// Cutter
ipcMain.handle('btnBladeon', (event, obj) => {
    console.log('btnBladeon');
    client.writeSingleCoil(30, true).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Blade On Error', error.message);
    });
});

ipcMain.handle('btnBladeoff', (event, obj) => {
    console.log('btnBladeoff');
    client.writeSingleCoil(30, false).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Blade Off Error', error.message);
    });
});

// Braid In
ipcMain.handle('dragBraidIn', (event, obj) => {
    console.log('dragBraidIn');
    client.writeSingleCoil(32, true).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Braid In Error', error.message);
    });
});

ipcMain.handle('resetDragBraidIn', (event, obj) => {
    console.log('resetDragBraidIn');
    client.writeSingleCoil(32, false).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Braid In Reset Error', error.message);
    });
});

// Home
ipcMain.handle('btnactHomeManual', (event, obj) => {
    console.log('btnactHomeManual');
    actHome();
});

// Braid Out
ipcMain.handle('getBraidOut', (event, obj) => {
    console.log('getBraidOut');
    client.writeSingleCoil(40, true).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Braid Out Error', error.message);
    });
});

ipcMain.handle('resetGetBraidOut', (event, obj) => {
    client.writeSingleCoil(40, false).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Braid Out Reset Error', error.message);
    });
});

// Dragging Roll
ipcMain.handle('releaseDraggingRoll', (event, obj) => {
    console.log('releaseDraggingRoll');
    client.writeSingleCoil(28, true).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Release Dragging Roll Error', error.message);
    });
});

ipcMain.handle('setDraggingRoll', (event, obj) => {
    console.log('setDraggingRoll');
    client.writeSingleCoil(28, false).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Set Dragging Roll Error', error.message);
    });
});

// Set Heat Seal
ipcMain.handle('setHeat', (event, obj) => {
    console.log('setHeat');
    client.writeSingleCoil(10, true).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Set Heat Error', error.message);
    });
});

ipcMain.handle('resetsetHeat', (event, obj) => {
    console.log('resetsetHeat');
    client.writeSingleCoil(10, false).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Reset Heat Error', error.message);
    });
});

// Ink Roll
ipcMain.handle('runInkRoll', (event, obj) => {
    console.log('runInkRoll');
    client.writeSingleCoil(33, true).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Run Ink Roll Error', error.message);
    });
});

ipcMain.handle('stopInkRoll', (event, obj) => {
    console.log('stopInkRoll');
    client.writeSingleCoil(33, false).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Stop Ink Roll Error', error.message);
    });
});

// Cutter Fwd
ipcMain.handle('cutterFwd', (event, obj) => {
    console.log('cutterFwd');
    client.writeSingleCoil(12, true).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Cutter Forward Error', error.message);
    });
});

ipcMain.handle('stpCutterFwd', (event, obj) => {
    console.log('stpCutterFwd');
    client.writeSingleCoil(12, false).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Cutter Forward Stop Error', error.message);
    });
});

// Cutter Rvs
ipcMain.handle('cutterRvs', (event, obj) => {
    console.log('cutterRvs');
    client.writeSingleCoil(34, true).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Cutter Reverse Error', error.message);
    });
});

ipcMain.handle('stpCutterRvs', (event, obj) => {
    console.log('stpCutterRvs');
    client.writeSingleCoil(34, false).then((response) => {
    }).catch((error) => {
        dialog.showErrorBox('Cutter Reverse Stop Error', error.message);
    });
});

/////////////////////////////////// Execute Operations ///////////////////////////////////

const val = require('./reg');
const map = (val.map);
const dis = (val.dis);
const rotVal = [150, 150, 150];

async function clearReg() {
    try {
        const numRegisters = 100;
        const values = new Array(numRegisters).fill(0);
        for (let i = 41387; i < 41387 + 1000; i += 100) {
            await client.writeMultipleRegisters(i, values);
        }
    } catch (error) {
        dialog.showErrorBox(`Registers Cleared Error`, error.message);
    }
};

async function writeReg(mapReg, mapVal, disReg, disVal) {
    try {
        await client.writeSingleRegister(mapReg, mapVal);
        await client.writeSingleRegister(disReg, disVal);
    } catch (error) {
        const reg = error.message.includes('mapReg') ? mapReg : disReg;
        dialog.showErrorBox(`Error in ${reg}`, error.message);
    }
};

// Start Execution
async function exeStart(obj) {
    try {
        await clearReg();
        const data = await readGigTable(obj);
        for (const [i, element] of data.entries()) {
            let reg;
            let val;
            if (element.clr === 'Green') {
                reg = map[i][0];
                val = rotVal[0];
            } else if (element.clr === 'Black') {
                reg = map[i][1];
                val = rotVal[1];
            } else if (element.clr === 'Blue') {
                reg = map[i][2];
                val = rotVal[2];
            }
            console.log(i, reg, val, dis[i][0], element.gap);
            await writeReg(reg, val, dis[i][0], element.gap);
        }
        store.set('exeStatus', 'start');
        await client.writeSingleCoil(2000, true);
    } catch (error) {
        dialog.showErrorBox(`Registers Cleared Error`, error.message);
    }
};

// Start Execution
ipcMain.handle('exeStart', (_, obj) => {
    exeStart(obj);
});

// Stop Execution
ipcMain.handle('exeStop', (_, obj) => {
    console.log("stop");
    store.set('exeStatus', 'stop');
    // master.writeSingleCoil(400, true)
    // master.writeSingleCoil(400, false)

    // clear tbl reg data
    // clear params data
    // act home mode
});

// Pause Execution
ipcMain.handle('exePause', (_, obj) => {
    console.log("pause");
    store.set('exeStatus', 'pause');
    // master.writeSingleCoil(104, true)
    // master.writeSingleCoil(104, false)
});

// Pre Print Execution
ipcMain.handle('exePre', (_, obj) => {
    console.log("pre");
    store.set('exeStatus', 'pre');
});

// Check Status
ipcMain.handle('exeStatus', () => {
    console.log(store.get('exeStatus'));
});

/////////////////////////////////// Mode Operations ///////////////////////////////////

ipcMain.handle('actMode', (event, obj) => {
    actMode(obj);
});

async function chkMode() {
    let M500, M501, sensors = 0;
    let mode = null;
    try {
        // Read M500 and M501
        const resp = await client.readCoils(500, 2);
        M500 = resp.response._body._valuesAsArray[0];
        M501 = resp.response._body._valuesAsArray[1];

        // Read sensors
        const respSen = await client.readCoils(20482, 4);
        const data = respSen.response._body._valuesAsArray.slice(0, 4);
        data.every(element => element === 1) ? sensors = 1 : sensors = 0;
    } catch (error) {
        console.log("ChkMode Read Sensor Error", error.message);
    }

    if (M500 == 0 && M501 == 0 && sensors == 0) {
        mode = "Normal";
    } else if (M500 == 1 && M501 == 0) {
        mode = "Manual";
    } else if (M500 == 0 && M501 == 1) {
        mode = "Home";
    } else if (M500 == 0 && M501 == 0 && sensors == 1) {
        mode = "Auto";
    }
    return mode;
};

async function waitForCoil1004() {
    while (true) {
        const resp = await client.readCoils(1004, 1);
        const data = resp.response._body._valuesAsArray.slice(0, 1);
        if (data[0] === 1) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
};

// Activate Home Mode
async function actHome() {
    try {
        await client.writeMultipleCoils(500, [0, 1]);
        mainWindow.webContents.send('state', "sub11");
        const options = {
            type: 'info',
            buttons: ['OK'],
            defaultId: 0,
            cancelId: 0,
            title: 'Home Mode!',
            message: 'Activate the Home Mode',
            alwaysOnTop: true
        };
        dialog.showMessageBox(mainWindow, options);
        await waitForCoil1004();

        // Read sensors
        const respSen = await client.readCoils(20482, 4);
        const data = respSen.response._body._valuesAsArray.slice(0, 4);
        const sensors = data.every(element => element === 1) ? 1 : 0;

        if (sensors === 1) {
            await client.writeMultipleCoils(500, [0, 0]);
            const options = {
                type: 'info',
                buttons: ['OK'],
                defaultId: 0,
                cancelId: 0,
                title: 'Home Mode!',
                message: 'Completed Home Mode',
                alwaysOnTop: true
            };
            dialog.showMessageBox(mainWindow, options);
        } else {
            const options = {
                type: 'error',
                buttons: ['OK', 'Cancel'],
                defaultId: 0,
                cancelId: 1,
                title: 'Home Mode!',
                message: 'Uncompleted Home Mode',
                detail: 'Sensors are not in position! Do you want to run Home mode again!',
                alwaysOnTop: true,
                noLink: true
            };
            const returnValue = await dialog.showMessageBox(mainWindow, options);
            if (returnValue.response === 0) {
                actHome();
            } else {
                await client.writeMultipleCoils(500, [0, 0]);
                mainWindow.webContents.send('state', "sub11");
            }
        }
    } catch (error) {
        console.log('Act Home Error', error.message);
    }
};

async function actMode(mode) {
    let curMode = await chkMode();

    if (curMode == "Home") {
        const options = {
            type: 'info',
            buttons: ['OK'],
            defaultId: 0,
            cancelId: 0,
            title: 'Home Mode!',
            message: 'System in Home Mode',
            detail: 'Plese wait untill the Home Mode is completed',
            alwaysOnTop: true
        };
        const returnValue = await dialog.showMessageBox(mainWindow, options);
        if (returnValue.response === 0) {
            mainWindow.webContents.send('state', "sub11");
        }
    }
    else if (curMode == mode) {
        return;
    }
    else {
        const options = {
            type: 'warning',
            buttons: ['Yes', 'No'],
            defaultId: 0,
            cancelId: 1,
            title: 'Warning!',
            message: `Machine in ${curMode} Mode`,
            detail: `Do you want to change it to ${mode} Mode?`
        };

        const returnValue = await dialog.showMessageBox(mainWindow, options);
        if (returnValue.response === 0) {
            if (mode == "Auto") {
                actHome();
            } else if (mode == "Manual") {
                await client.writeMultipleCoils(500, [1, 0]);
            }
        } else {
            mainWindow.webContents.send('state', "sub11");
        }
    }
};