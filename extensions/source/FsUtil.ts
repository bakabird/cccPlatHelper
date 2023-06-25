import fs from "fs-extra"

export default class FsUtil {
    public static walkDirectoryFiles(dir, walk: (path: string) => void) {
        let files = fs.readdirSync(dir)
        files.forEach(item => {
            let filepath1 = dir + '\\' + item
            let stat = fs.statSync(filepath1)
            if (stat.isFile()) {
                console.log(filepath1);
                walk(filepath1)
            } else {
                FsUtil.walkDirectoryFiles(filepath1, walk)
            }
        })
    }
}

