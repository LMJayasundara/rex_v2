const { SerialPort } = require('serialport');

function checkPort(){
    return new Promise((resolve) => {
        SerialPort.list().then((ports)=>{
            resolve(ports);
        });
    });
}

module.exports = {
    checkPort
}