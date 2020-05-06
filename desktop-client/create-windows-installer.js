const electronInstaller = require('electron-winstaller');

async function buildInstaller(){
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: './out/rikonhms',
      outputDirectory: './out/rikon',
      authors: 'Kofi Oghenerukevwe H.',
      exe: "rikonhms.exe",
      version: "1.0.0"
    });
    console.log('It worked!');
  } catch (e) {
    console.log(`No dice: ${e.message}`);
  }
}

buildInstaller()