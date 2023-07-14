import { unlink, renameSync, readFile, readFileSync, writeFile } from 'fs';
import express from 'express';
import multer from 'multer';
import { extname, join } from 'path';

console.log(readFileSync('./data/.config', 'utf8'))


const config = JSON.parse(
  readFileSync('./data/.config', 'utf-8'))
const logFile = './data/log.txt'
const app = express();
const upload = multer({ dest: config['UploadFolderPath'] });

app.use(express.static('public'));
app.post('/upload', upload.single('file'), (req, res) => {
  let allowedMIMEType = ['image', 'video', 'audio']

  if (!req.file) return res.send({ state: 400, msg: 'Ingresa un archivo primero' });
  if (!allowedMIMEType.includes(req.file.mimetype.split('/')[0])) {
    unlink(req.file.path, (err) => {
      if (err) logToServer(req, 2);
      else logToServer(req, 1);
    });
    return res.send({ state: 400, msg: 'Tipo de archivo inválido' });
  }
  logToServer(req, 0)
  const extension = extname(req.file.originalname);
  const newName = req.file.filename + extension;
  // Renombrar el archivo en el servidor
  renameSync(req.file.path, join(dest, newName));
  res.send({ state: 200, msg: 'Archivo recibido' });
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
  if (state == 2) fileState = `Failed to delete`;

  newLog = newLog
    .concat(` ${date.toLocaleDateString().replace(/-/g, '/')} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} |`)
    .concat(` ${fileState} |`)
    .concat(` ${req.ip} |`)
    .concat(`${file.mimetype} ${file.filename} |`)
    .concat(` ${file.originalname}\n`);

  readFile(logFile, 'utf8', (error, oldLog) => {
    if (error) {
      console.error('Failed to read log:', error);
      return;
    }
    const log = newLog + oldLog;

    writeFile(logFile, log, (error) => {
      if (error) {
        console.error('Failed to write log:', error);
      } else {
        console.log('Log Success!');
      }
    });
  });
}