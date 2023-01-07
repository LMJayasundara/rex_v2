const { app, Menu } = require('electron');

class main_menu {
    constructor(mainWindow){
        const supv_menu = [
            {
                label: 'Control Settings',
                submenu: [
                    {
                        label: 'Create A New File',
                        click: function () {
                            mainWindow.webContents.send('state', "sub11");
                        }
                    },
                    {
                        label: 'Create Jigs',
                        click: function () {
                            mainWindow.webContents.send('state', "sub12");
                        }
                    }
                ]
            },
            
            {
                label: 'Project',
                submenu: [
                    {
                        label: 'Execute',
                        click: function () {
                            mainWindow.webContents.send('state', "sub21");
                        }
                    },
                ]
            },

            {
                label: 'Tools',
                submenu: [
                    {
                        label: 'Operate Machine',
                        click: function () {
                            mainWindow.webContents.send('state', "sub31");
                        }
                    },
                    {
                        label: 'Change Password',
                        click: function () {
                            mainWindow.webContents.send('state', "sub33");
                        }
                    }
                ]
            },
        
            {
                label: 'Window',
                submenu: [
                    {
                        label: 'Relaod',
                        click: function () {
                            mainWindow.reload();
                            mainWindow.webContents.once('did-finish-load', () => {
                                mainWindow.webContents.send('version', app.getVersion());
                                mainWindow.webContents.send('state', 'sub11');
                            });
                        }
                    },
                    { role: 'togglefullscreen' },
                    { role: 'close' },
                    {
                        label: 'About',
                        click: function () {
                            mainWindow.webContents.send('state', "sub41");
                        }
                    }
                ]
            },
        
            {
                label: 'Developer',
                submenu: [
                    { role: 'toggleDevTools' },
                    {
                        label: 'Machine Config',
                        click: function () {
                            mainWindow.webContents.send('state', "sub32");
                        }
                    },
                    {
                        label: 'PLC Config',
                        click: function () {
                            mainWindow.webContents.send('state', "sub32");
                        }
                    }
                ]
            },

            {
                label: 'Logout',
                click: function () {
                    Menu.setApplicationMenu(null);
                    mainWindow.webContents.send('state', "sub51");
                }
            }
        ];

        return supv_menu;
    }
}

module.exports = main_menu;