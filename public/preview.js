const fileInput = document.querySelector('#file-input');
const previewBox = document.querySelector('#preview');

fileInput.addEventListener('change', event => {
  const file = event.target.files[0];
  const reader = new FileReader();
  
  reader.onload = () => {
    const fileType = file.type.split('/')[0]; // Obtiene el tipo de archivo (imagen, audio, video)
    
    previewBox.innerHTML = ''; // Limpia cualquier vista previa anterior

    let previewType;
    if (fileType === 'image') {
      previewType = document.createElement('img');
    } else if (fileType === 'audio') {
      previewType = document.createElement('audio');
    } else if (fileType === 'video') {
      previewType = document.createElement('video');
    } else {
      return; // Si el tipo de archivo no es compatible, no muestra ninguna vista previa
    }
    previewType.src = reader.result;
    previewType.controls = true;
    previewBox.appendChild(previewType);
  };
  reader.readAsDataURL(file);
});