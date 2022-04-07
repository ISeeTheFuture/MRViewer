const { app, BrowserWindow } = require('electron');

let win = null;  // BrowserWindow

app.on('will-finish-launching', () => {
    console.log('will-finish-launching');
});

// 앱 초기화
app.on('ready', (launchInfo) => {
    console.log(`ready : ${JSON.stringify(launchInfo)}`);
    console.log(`isReady : ${app.isReady()}`);

    win = new BrowserWindow({
        width: 1024,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation : false, // https://bug41.tistory.com/83
            devTools: true
        }
    });
    win.loadURL(`file://${__dirname}/../src/index.html`);

    const { type, versions } = process;
    console.log(`process type : ${type}`);
    console.log(`process version : ${JSON.stringify(versions)}`);
});

// 앱 종료 명령 없이 모든 창이 닫히면?
app.on('window-all-closed', () => {
    console.log('window-all-closed');
    app.quit();  // 애플리케이션을 종료
});

// 앱 종료, 창 닫기 직전
app.on('before-quit', (event) => {
    console.log('before-quit');
});

// 창 닫힘, 완전 종료 직전
app.on('will-quit', (event) => {
    console.log('will-quit');
});

// 완전 종료
app.on('quit', (event, exitCode) => {
    console.log(`quit : ${JSON.stringify(event)}, ${exitCode}`);
});