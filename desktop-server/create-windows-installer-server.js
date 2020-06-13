const electronInstaller = require("electron-winstaller")

async function buildInstaller() {
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: "./out/rikonserver",
      outputDirectory: "./out/rikon",
      authors: "Kofi Oghenerukevwe H.",
      exe: "rikonserver.exe",
      version: "1.0.0"
    })
    console.log("It worked!")
  } catch (e) {
    console.log(`No dice: ${e.message}`)
  }
}

buildInstaller()
