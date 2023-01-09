const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const main_menu = require('./src/menu');
const { readTable, createRow, updateRow, deleteRow, createTbl, addTbl, saveRow, getSavedFiles, readGigTable, dropTbl, getDetFile, updateRowConfig } = require('./src/datamodel');
const { SerialPort } = require('serialport');
const Modbus = require('jsmodbus');
const Store = require('electron-store');
const store = new Store();
const { autoUpdater, AppUpdater } = require("electron-updater");
const ProgressBar = require('electron-progressbar');

const val = require('./src/reg');
const map = (val.map);
const dis = (val.dis);
app.disableHardwareAcceleration();

//Basic flags
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let progressBar;
let mainWindow;
let supv_menu;
let serialPort;
let client;

function checkPort() {
    return new Promise((resolve) => {
        SerialPort.list().then((ports) => {
            resolve(ports);
        });
    });
}

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
        mainWindow.openDevTools();
        supv_menu = new main_menu(mainWindow);

        checkPort().then((ports) => {
            if (ports.length == 0) {
                mainWindow.webContents.send('error', { message: "emtPort", error: "Not any port detected!" });
            }
            else {
                const storedPort = store.get('port');
                // Check if any of the ports match the stored port
                const portIsUsed = ports.some((port) => port === storedPort);

                console.log(portIsUsed);

                if (storedPort === undefined || portIsUsed === true) {
                    mainWindow.webContents.send('error', { message: "errPort", error: "Port undefined or port already in used!" });
                }
                else {
                    serialPort = new SerialPort({
                        path: storedPort,
                        baudRate: 19200,
                        dataBits: 8,
                        parity: "even",
                        stopBits: 1,
                        flowControl: false
                    }, false);

                    serialPort.on('error', function (error) {
                        mainWindow.webContents.send('error', { message: "errPort", error: error.message });
                    });

                    client = new Modbus.client.RTU(serialPort, 1, 3000);
                };
            }
        });

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

ipcMain.handle('relaunch', (event, obj) => {
    if (obj != '') {
        console.log(obj);
        store.set('port', obj);
    }
    app.relaunch();
    app.quit(0);
});

ipcMain.handle('reqConfig', async() => {
    let data = await readTable('Config');
    mainWindow.webContents.send('resConfig', data);
});

ipcMain.handle('subConf', async(event, obj) => {
    await updateRowConfig(obj);
    const options = {
        type: 'info',
        buttons: ['OK'],
        defaultId: 0,
        cancelId: 0,
        title: 'Changed Config!',
        message: 'Config data change successful!',
        alwaysOnTop: true
    };
    dialog.showMessageBox(mainWindow, options);
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
    const options = {
        type: 'info',
        buttons: ['OK'],
        defaultId: 0,
        cancelId: 0,
        title: 'Save Gig!',
        message: 'Gig save successful!',
        alwaysOnTop: true
    };
    dialog.showMessageBox(mainWindow, options);
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
async function handleAction(action) {
    try {
        switch (action) {
            case 'upMainRoll':
                await client.writeSingleCoil(22, true);
                break;
            case 'downMainRoll':
                await client.writeSingleCoil(22, false);
                break;

            case 'pullGuidBoard':
                await client.writeSingleCoil(24, true);
                break;
            case 'resetGuidBoard':
                await client.writeSingleCoil(24, false);
                break;

            case 'btnBladeon':
                await client.writeSingleCoil(30, true);
                break;
            case 'btnBladeoff':
                await client.writeSingleCoil(30, false);
                break;

            case 'dragBraidIn':
                await client.writeSingleCoil(32, true);
                break;
            case 'resetDragBraidIn':
                await client.writeSingleCoil(32, false);
                break;

            case 'btnactHomeManual':
                await actHome();
                break;

            case 'getBraidOut':
                await client.writeSingleCoil(40, true);
                break;
            case 'resetGetBraidOut':
                await client.writeSingleCoil(40, false);
                break;

            case 'releaseDraggingRoll':
                await client.writeSingleCoil(28, true);
                break;
            case 'setDraggingRoll':
                await client.writeSingleCoil(28, false);
                break;

            case 'setHeat':
                await client.writeSingleCoil(10, true);
                break;
            case 'resetsetHeat':
                await client.writeSingleCoil(10, false);
                break;

            case 'runInkRoll':
                await client.writeSingleCoil(33, true);
                break;
            case 'stopInkRoll':
                await client.writeSingleCoil(33, false);
                break;

            case 'cutterFwd':
                await client.writeSingleCoil(12, true);
                break;
            case 'stpCutterFwd':
                await client.writeSingleCoil(12, false);
                break;

            case 'cutterRvs':
                await client.writeSingleCoil(34, true);
                break;
            case 'stpCutterRvs':
                await client.writeSingleCoil(34, false);
                break;
        }
    } catch (error) {
        dialog.showErrorBox(`${action} Error`, error.message);
    }
};

ipcMain.handle('upMainRoll', () => handleAction('upMainRoll'));
ipcMain.handle('downMainRoll', () => handleAction('downMainRoll'));
ipcMain.handle('pullGuidBoard', () => handleAction('pullGuidBoard'));
ipcMain.handle('resetGuidBoard', () => handleAction('resetGuidBoard'));
ipcMain.handle('btnBladeon', () => handleAction('btnBladeon'));
ipcMain.handle('btnBladeoff', () => handleAction('btnBladeoff'));
ipcMain.handle('dragBraidIn', () => handleAction('dragBraidIn'));
ipcMain.handle('resetDragBraidIn', () => handleAction('resetDragBraidIn'));
ipcMain.handle('btnactHomeManual', () => handleAction('btnactHomeManual'));
ipcMain.handle('getBraidOut', () => handleAction('getBraidOut'));
ipcMain.handle('resetGetBraidOut', () => handleAction('resetGetBraidOut'));
ipcMain.handle('releaseDraggingRoll', () => handleAction('releaseDraggingRoll'));
ipcMain.handle('setDraggingRoll', () => handleAction('setDraggingRoll'));
ipcMain.handle('setHeat', () => handleAction('setHeat'));
ipcMain.handle('resetsetHeat', () => handleAction('resetsetHeat'));
ipcMain.handle('runInkRoll', () => handleAction('runInkRoll'));
ipcMain.handle('stopInkRoll', () => handleAction('stopInkRoll'));
ipcMain.handle('cutterFwd', () => handleAction('cutterFwd'));
ipcMain.handle('stpCutterFwd', () => handleAction('stpCutterFwd'));
ipcMain.handle('cutterRvs', () => handleAction('cutterRvs'));
ipcMain.handle('stpCutterRvs', () => handleAction('stpCutterRvs'));

/////////////////////////////////// Execute Operations ///////////////////////////////////

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
async function exeStart(obj, trn) {
    try {
        await clearReg();
        await client.writeMultipleRegisters(41090, [0, 0, trn, 0, 1]); // curTrurns, turns, execute ack

        const config = await readTable('Config');
        const rpm1 = config[0].rpm1;
        const rpm2 = config[0].rpm2;
        const rmp3 = config[0].rpm3;
        const Green2Black = config[0].G2B;
        const Black2Blue = config[0].B2B;

        const data = await readGigTable(obj);

        for (const [i, element] of data.entries()) {
            let reg;
            let val;

            const lookupTable = {
                'Green-Green': element.gap,
                'Green-Black': element.gap + Green2Black,
                'Green-Blue': element.gap + Green2Black + Black2Blue,
                'Black-Green': element.gap - Green2Black,
                'Black-Black': element.gap,
                'Black-Blue': element.gap + Black2Blue,
                'Blue-Green': element.gap - Green2Black - Black2Blue,
                'Blue-Black': element.gap - Black2Blue,
                'Blue-Blue': element.gap
            };

            const prevColor = i > 0 ? data[i - 1].clr : null;
            const key = `${prevColor}-${element.clr}`;

            if (element.clr === 'Green') {
                reg = map[i][0];
                val = rpm1;
            } else if (element.clr === 'Black') {
                reg = map[i][1];
                val = rpm2;
            } else if (element.clr === 'Blue') {
                reg = map[i][2];
                val = rmp3;
            }
            console.log(i, reg, val, dis[i][0], lookupTable[key] || element.gap);
            await writeReg(reg, val, dis[i][0], lookupTable[key] || element.gap);
        }

        store.set('exeStatus', 'start');
        store.set('tbl', obj);
        await client.writeSingleCoil(2000, true);
    } catch (error) {
        dialog.showErrorBox(`Registers Cleared Error`, error.message);
    }
};

async function turnUpdate() {
    while (true) {
        const resp = await client.readHoldingRegisters(41090, 5);
        const data = resp.response._body._valuesAsArray.slice(0, 5);
        console.log(data[0], data[2], data[4]);
        mainWindow.webContents.send('exePro', `${data[0]} of ${data[2]}`);
        if ((data[0] === data[2]) || (data[4] === 0)) {
            console.log("stop");
            store.set('exeStatus', 'stop');
            store.set('tbl', null);
            store.set('exeObj', null);
            await client.writeMultipleRegisters(41090, [0, 0, 0, 0, 0])
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
};

// Start Execution
ipcMain.handle('exeStart', async (_, obj) => {
    if (store.get('exeStatus') === 'start') {
        showErrorDialog('Already running a execution! Wait until completion or stop the current execution!');
    } else {
        const shouldStartExecution = await showConfirmationDialog(
            'Do you want to start the execution? It will start the execution!'
        );

        if (shouldStartExecution && obj != null) {
            const exeObj = await getDetFile(obj);
            store.set('exeObj', exeObj);
            await exeStart(obj, exeObj[0].turn);
            await turnUpdate();
        } else if (obj == null) {
            showErrorDialog('Slect table to execute the programe!');
        }
    }
});

// Pre Print Execution
ipcMain.handle('exePre', async (_, obj) => {
    if (store.get('exeStatus') === 'start') {
        showErrorDialog('Already running a execution! Wait until completion or stop the current execution!');
    } else {
        const shouldStartExecution = await showConfirmationDialog(
            'Do you want to start the execution? It will start the execution!'
        );

        if (shouldStartExecution && obj != null) {
            const exeObj = await getDetFile(obj);
            store.set('exeObj', exeObj);
            await exeStart(obj, 1);
            await turnUpdate();
        } else if (obj == null) {
            showErrorDialog('Slect table to execute the programe!');
        }
    }
});

function showErrorDialog(detail) {
    const options = {
        type: 'error',
        buttons: ['OK'],
        defaultId: 0,
        cancelId: 0,
        title: 'Error!',
        message: 'Error!',
        detail,
        alwaysOnTop: true,
        noLink: true
    };
    dialog.showMessageBox(mainWindow, options);
}

async function showConfirmationDialog(detail) {
    const options = {
        type: 'warning',
        buttons: ['Yes', 'No'],
        defaultId: 1,
        cancelId: 1,
        title: 'Warning!',
        message: `Do you want to start the execution?`,
        detail
    };
    const returnValue = await dialog.showMessageBox(mainWindow, options);
    return returnValue.response === 0;
}

// Stop Execution
ipcMain.handle('exeStop', async () => {
    const options = {
        type: 'warning',
        buttons: ['Yes', 'No'],
        defaultId: 1,
        cancelId: 1,
        title: 'Warning!',
        message: `Do you want to stop the execution?`,
        detail: `It will stop the execution and activate the Home mode!`
    };
    const returnValue = await dialog.showMessageBox(mainWindow, options);
    if (returnValue.response === 0) {
        try {
            await client.writeSingleCoil(400, true);
            await client.writeMultipleRegisters(41090, [0, 0, 0, 0, 0]);
            await client.writeSingleCoil(400, false);
            await clearReg();
            await actHome();
        } catch (error) {
            dialog.showErrorBox(`Execute Stop Error`, error.message);
        };
    } else {
        return
    }
});

// Check Status
ipcMain.handle('exeStatus', async () => {
    console.log("exeStatus", store.get('exeStatus'));
    if (store.get('exeStatus') == 'start') {
        await turnUpdate();
    }
});

/////////////////////////////////// Mode Operations ///////////////////////////////////

ipcMain.handle('actMode', async (event, obj) => {
    actMode(obj);

    if (store.get('exeStatus') == 'start') {
        if (store.get('tbl') != null) {
            await readGigTable(store.get('tbl')).then((data) => {
                mainWindow.webContents.send('gigTblRes', data);
            });

            await getDetFile(store.get('tbl')).then((data) => {
                mainWindow.webContents.send('gigTblObj', data);
            });
        }
    }
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
        if (store.get('exeStatus') == 'start') {
            const options = {
                type: 'info',
                buttons: ['OK'],
                defaultId: 0,
                cancelId: 0,
                title: 'Execution Mode!',
                message: 'System in Execution Mode',
                detail: 'Plese wait untill the execution is completed',
                alwaysOnTop: true
            };
            const returnValue = await dialog.showMessageBox(mainWindow, options);
            if (returnValue.response === 0) {
                mainWindow.webContents.send('state', "sub11");
            }
        }
        else {
            if (curMode != null) {
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
            } else {
                const options = {
                    type: 'error',
                    buttons: ['OK'],
                    defaultId: 1,
                    cancelId: 1,
                    title: 'Error!',
                    message: 'Modbus Connection Error',
                    detail: 'Can not communicate with modbus device!',
                    alwaysOnTop: true,
                    noLink: true
                };
                const returnValue = await dialog.showMessageBox(mainWindow, options);
                if (returnValue.response === 0) {
                    mainWindow.webContents.send('state', "sub11");
                }
            }
        }
    }
};