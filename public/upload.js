function responseManager(serverResponse) {
    const data = serverResponse
    const state = data['state']
    document.querySelector('#msg-box').innerHTML = data['msg'];
    console.log(`Request state: ${data['state']}`);

    if (state == 200) uploadSuccess(true);
    else uploadSuccess(false)
}
function uploadSuccess(success) {
    if (success) {
        document.querySelector("#msg-box").classList.remove("bcg_col-red"); 
        document.querySelector("#msg-box").classList.add("bcg_col-green");
        document.querySelector('#audio-success-sent').play();
    }
    else {
        document.querySelector("#msg-box").classList.remove("bcg_col-green"); 
        document.querySelector("#msg-box").classList.add("bcg_col-red");
        document.querySelector('#audio-failed-sent').play();
    }
}
document.querySelector('#upload-form').addEventListener('submit', (event) => {
    event.preventDefault();

    var formData = new FormData();
    var fileInput = document.querySelector('#file-input').files[0];
    formData.append('file', fileInput);

    fetch("/upload", {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(res => responseManager(res))
    .finally(() => {
        document.querySelector('#upload-form').reset();
        document.querySelector('#preview').innerHTML = '';
    })
    .catch(error => console.log(error));
});