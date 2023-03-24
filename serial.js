// const { SerialPort } = require('serialport');
// const Modbus = require('jsmodbus');
// let serialPort;
// let client;

// serialPort = new SerialPort({
//     path: "COM7",
//     baudRate: 19200,
//     dataBits: 8,
//     parity: "even",
//     stopBits: 1,
//     flowControl: false
// }, false);

// serialPort.on('error', function (error) {
//     mainWindow.webContents.send('error', { message: "errPort", error: error.message });
// });

// client = new Modbus.client.RTU(serialPort, 2, 3000);
// async function handleAction() {
//     try {
//         await client.writeSingleCoil(1536+14, true);
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// handleAction()

//////////////////////////////////////////////////////////////////////

// 'use strict'

// const modbus = require('jsmodbus');
// const { SerialPort } = require('serialport');
// const socket = new SerialPort({
//     path: "COM7",
//     baudRate: 19200,
//     parity: 'none',
//     stopBits: 2,
//     dataBits: 8
// })

// // set Slave PLC ID
// const client = new modbus.client.RTU(socket, 1)

// socket.on('connect', function () {
//     console.log("connect");
//     client.writeSingleCoil(3076, false).then(function (resp) {
//         console.log(resp)
//         socket.close()
//     }, function (err) {
//         console.log(err)
//         socket.close()
//     })
// })

// socket.on('error', function (err) {
//     console.log(err)
// })

//////////////////////////////////////////////////////////////////////

'use strict'

const Modbus = require('jsmodbus')
const net = require('net')
const socket = new net.Socket()
const options = {
    'host': '192.168.1.111',
    'port': '502'
}
const client = new Modbus.client.TCP(socket);

socket.on('connect', async function () {
    console.log("connect");
    await client.writeSingleCoil(3076, true);

    let resp = await client.readCoils(2, 4);
    let M500 = resp.response._body._valuesAsArray.slice(0, 4);
    console.log(M500);
})

socket.on('error', console.error)
socket.connect(options)


////////////////////////////////////////////////////////////////////


// const Modbus = require('jsmodbus');
// const { app, BrowserWindow, ipcMain, Menu } = require('electron');
// const net = require('net');
// const socket = new net.Socket();

// let client;
// const options = {
//     'host': '192.168.1.111',
//     'port': '502'
// };

// socket.on('error', () => {
//     console.log("No connection detected!");
// });

// function createWindow() {
//     mainWindow = new BrowserWindow({
//         width: 1200,
//         height: 720,
//         minWidth: 1200,
//         minHeight: 720,
//         show: false,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false
//         }
//     });

//     mainWindow.on('closed', () => {
//         mainWindow = null;
//     });

//     mainWindow.once('ready-to-show', () => {
//         mainWindow.show();
//         Menu.setApplicationMenu(null);
//     });

//     mainWindow.loadFile(path.join(__dirname, '/template/index.html'));
// };

// socket.on('connect', function () {
//     client = new Modbus.client.TCP(socket);
//     createWindow();
//     app.on('activate', () => {
//         if (BrowserWindow.getAllWindows().length === 0) {
//             createWindow();
//         }
//     });
// });

// app.whenReady().then(() => {
//     autoUpdater.checkForUpdates();
//     socket.connect(options);
// });

// ipcMain.handle('upMainRoll', () => {
//     client.writeSingleCoil(28, false);
// });
