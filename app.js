import express from 'express';
import multer from 'multer';
import * as fc from './file-control.js';

fc.verifyDotEnv();

const app = express();
const upload = multer({ dest: process.env.UPLOAD_FOLDER_PATH });

app.use(express.static('public'));
app.post('/upload', upload.single('file'), (req, res) => {
  const allowedMIMEType = ['image', 'video', 'audio', 'text'];
  const file = req.file;

  //Verify if there is a file or if it's type is allowed. Non-allowed files types will be deleted.
  //Make a log (state 1 or 2, Deleted or Failed Delete) and send a Bad Request (400) response to the client.
  if (!file) return res.send({ state: 400, msg: 'Ingresa un archivo primero' });

  if (!allowedMIMEType.includes(req.file.mimetype.split('/')[0])) {
    fc.newLog(req,
      fc.deleteFile(file.path)
    )
    return res.send({ state: 400, msg: 'Tipo de archivo inválido' });
  }

  //Rename the file to include the original extension.
  //Make a log with state 0 (Saved) and send a OK (200) response to the client.
  fc.addExtension(file);
  fc.newLog(req, 0);
  res.send({ state: 200, msg: 'Archivo recibido' });
});

app.listen(process.env.MAIN_PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${process.env.MAIN_PORT}\n`);
});