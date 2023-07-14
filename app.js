import { unlink, renameSync, readFile, readFileSync, writeFile } from 'fs';
import express from 'express';
import multer from 'multer';
import { extname, join } from 'path';

/*
Required .config file. Is a json structured file with environment data, this file must include:

  - UploadFolderPath: Where uploaded data will be managed
  - ListenPort: The port on which the application will be hosted
*/
const config = JSON.parse(
  readFileSync('./data/.config', 'utf-8'))

const logFilePath = './data/log.txt'
const app = express();
const upload = multer({ dest: config['UploadFolderPath'] });

app.use(express.static('public'));
app.post('/upload', upload.single('file'), (req, res) => {
  let allowedMIMEType = ['image', 'video', 'audio']

  //Verify if there is a file or if it's type is allowed. Non-allowed files types will be deleted.
  //Make a log (state 1 or 2, Deleted or Failed Delete) and send a Bad Request (400) response to the client.
  if (!req.file) return res.send({ state: 400, msg: 'Ingresa un archivo primero' });
  if (!allowedMIMEType.includes(req.file.mimetype.split('/')[0])) {
    unlink(req.file.path, (err) => {
      if (err) logToServer(req, 2);
      else logToServer(req, 1);
    });
    return res.send({ state: 400, msg: 'Tipo de archivo inválido' });
  }
  //Rename the file to include the original extension.
  //Make a log with state 0 (Saved) and send a OK (200) response to the client.
  const extension = extname(req.file.originalname);
  const newName = req.file.filename + extension;
  renameSync(req.file.path, join(config['UploadFolderPath'], newName));
  res.send({ state: 200, msg: 'Archivo recibido' });
  logToServer(req, 0)
});

app.listen(config['ListenPort'], () => {
  console.log(`Servidor iniciado en http://localhost:${config['ListenPort']}\n`);
});
function logToServer(req, state) {
  const file = req.file;
  let fileState;
  let date = new Date();
  let newLog = `>`;

  if (state == 0) fileState = `Saved`;
  if (state == 1) fileState = `Deleted`;
  if (state == 2) fileState = `Failed Delete`;

  newLog = newLog
    .concat(` ${date.toLocaleDateString().replace(/-/g, '/')} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} |`)
    .concat(` ${fileState} | `)
    .concat(` ${req.ip} |`)
    .concat(`${file.mimetype} ${file.filename} |`)
    .concat(` ${file.originalname}\n`);

  readFile(logFilePath, 'utf8', (error, oldLog) => {
    if (error) {
      console.error('Failed to read log:', error);
      return;
    }
    const log = newLog + oldLog;

    writeFile(logFilePath, log, (error) => {
      if (error) {
        console.error('Failed to write log:', error);
      } else {
        console.log('Log Success!');
      }
    });
  });
}