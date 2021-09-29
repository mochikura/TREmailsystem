function setFile(file) {
    //console.log(file.length)
    //let Uploadfiles = file.target
    let fileEnc=document.getElementById('multiUploadFile');
    let Uploadfile = fileEnc.files[0];
    //alert(file);
    reader = new FileReader();
    reader.readAsText(Uploadfile);
    let blob = new Blob([file], { type: Uploadfile.type });
    let toFile = new File([blob], Uploadfile.name+".encrypted", { type: Uploadfile.type });
    MultiUpload(toFile);
    //enc_file(datetrim(dateset.value));
}