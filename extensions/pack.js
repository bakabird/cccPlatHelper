var AdmZip = require("adm-zip");
var packageJSON = require('./package.json');

async function Run() {
	// creating archives
	var zip = new AdmZip();
	var dirs = ["dist", "i18n", "node_modules", "static"]
	zip.addLocalFile("package.json");
	for (let index = 0; index < dirs.length; index++) {
		const dir = dirs[index];
		await zip.addLocalFolderPromise(dir, {
			zipPath: dir
		})
		console.log("addDir " + dir);
	}
	zip.writeZip(/*target file name*/ `./release/${packageJSON.name}.${packageJSON.version}.zip`, () => {
		console.log("done")
	});
}

Run();