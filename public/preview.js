const fileInput = document.querySelector('#file-input');
const previewBox = document.querySelector('#preview-box');

fileInput.addEventListener('change', event => {
  const file = event.target.files[0];
  const reader = new FileReader();
  
  reader.onload = () => {
    //Obtain file type and clean earlier previews
    const fileType = file.type.split('/')[0];
    const allowedMIMEType = ['image', 'video', 'audio'];
    previewBox.innerHTML = '';

    //Verify if fileType is valid. Create and attach the HTML element
    if (!allowedMIMEType.includes(fileType))
     return
    let type = fileType;
    if (fileType == 'image') type = 'img'
    const preview = document.createElement(type)
    preview.src = reader.result;
    preview.controls = true;
    previewBox.appendChild(preview);
  };
  reader.readAsDataURL(file);
});