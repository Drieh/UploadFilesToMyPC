import fs from 'fs';
import * as dotenv from 'dotenv';
import PromptSync from 'prompt-sync';
import * as pth from 'path';

export function verifyDotEnv() {
    if (!fs.existsSync('./.env')) setupEnvFile()
    return dotenv.config()
}
export function deleteFile(path) {
    try {
        fs.unlinkSync(path);
        return 1;
    } catch (error) {
        console.error(error);
        return 2;
    }
}
export function newLog(req, state) {
    const logFilePath = process.env.LOG_PATH;
    const file = req.file;
    let fileState;
    let date = new Date();
    let oldLog = '';

    if (state == 0) fileState = `Saved`;
    else if (state == 1) fileState = `Deleted`;
    else if (state == 2) fileState = `Failed Delete`;
    else fileState = `Unknow`;

    let newLog = '>'
        .concat(` ${date.toLocaleDateString().replace(/-/g, '/')} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} |`)
        .concat(` ${fileState} |`)
        .concat(` ${req.ip} |`)
        .concat(` ${file.mimetype} ${file.filename} |`)
        .concat(` ${file.originalname}\n`);

    if (fs.existsSync(logFilePath)) oldLog = fs.readFileSync(logFilePath, 'utf-8');
    else console.log('No log file, creating new one')

    fs.writeFile(logFilePath, (newLog + oldLog), (error) => {
        if (error) {
            console.error('Failed to write log:', error);
        } else {
            console.log('Log Success!');
        }
    });
}
export function addExtension(file) {
    fs.renameSync(file.path, pth.join(
        process.env.UPLOAD_FOLDER_PATH,
        (file.filename + pth.extname(file.originalname))
    ));
}
function setupEnvFile() {

    const p = PromptSync();
    console.log("There isn't a .env file. Creating a new one. Leave empy for default.\n");

    let mPort = p('Main port for users (default: 80): ');
    while (!isNum(mPort)) {
        console.log(mPort, '.asd.')
        if (mPort == '') mPort = 80;
        else mPort = p("That isn't a number, try again: ");
    }
    let cPort = p('Control port for admin (default: 81): ');
    while (!isNum(cPort)) {
        if (cPort == '') cPort = 81;
        else cPort = p("That isn't a number, try again: ");
    }

    let uploadsFolder = p('Directory where uploads will be managed (default: "./u"): ');
    while (!fs.existsSync(uploadsFolder)) {
        if (uploadsFolder == '') uploadsFolder = './u';
        else {
            try {
                fs.mkdirSync(uploadsFolder);

            } catch (error) {
                console.error('Error while creating directory.')
                uploadsFolder = p('Try another one: ')
            }
        }
    }

    let logPath = p('Path to log.txt (default: "./log.txt"): ');
    while (!fs.existsSync(logPath)) {
        if (logPath == '') logPath = './';
        else logPath = p("That path doesn't exists, try again: ");
    }
    if (fs.statSync(logPath).isDirectory()) logPath = logPath.concat('log.txt');

    fs.writeFileSync('./.env',
`{
    MAIN_PORT=${mPort}
    CTRL_PORT=${cPort}
    UPLOAD_FOLDER_PATH="${uploadsFolder}"
    LOG_PATH="${logPath}"
}`);
    console.log('\nRemember to update your .gitignore if your upload folder or log.txt file are inside the proyect folder!\n')
    return dotenv.config();
}
function isNum(value) {
    if (value === '' || value === null) return false;
    return /^[0-9]+$/.test(value);
}