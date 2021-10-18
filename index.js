let filename;
let file;
let reader;
let filetype;
//他場所でも使うのでグローバルに

/*
const EncFileGet = document.getElementById("encfileget");
EncFileGet.addEventListener("click", () => {
    //try {
        let file = EncFileAdd.files[0];
        //alert(file);
        reader = new FileReader();
        reader.readAsText(file);
        enc_file(datetrim(dateset.value));
        
        reader.onload = ()=> {
            let blob = new Blob([reader.result], { type: file.type });
            let downlink = document.createElement('a');
            downlink.href = URL.createObjectURL(blob);
            downlink.download = file.name;
            downlink.click();
        }
    //} catch (error) {
    //    alert("エラーが発生しました");
    //}
}
)
*/
//入力されたファイルを処理してダウンロードする。
//検証では、テキストファイル以外は不可能だった、他だとどうやるのかは要検証
/*
const DecFileGet =document.getElementById("decfileget");
DecFileGet.addEventListener("click", () => {
    //try {
        let file = fileadd.files[0];
        //alert(file);
        reader = new FileReader();
        reader.readAsText(file);
        dnc_file(datetrim(dateset.value));
}
)
*/
let datetrim = (date) => {
    let matchtext = /\BT\B/;
    //YYYY-MM-DDThh:mm
    if (matchtext.test(date)) {
        let splitT = date.split("T");
        let splitdate = splitT[0].split('-');
        let splittime = splitT[1].split(':');
        return splitdate[0] + splitdate[1] + splitdate[2] + splittime[0] + splittime[1];
    } else {
        return "error";
    }
}
//JSで用意された日付入力機能は、YYYY-MM-DDThh:mmの形で出てくるので、処理に適する形であるYYYYMMDDhhmmに変換する

let dateget = () => {
    let date = new Date();
    let ans = date.getFullYear();
    ans += (date.getMonth() + 1) + date.getDate() + date.getHours() + date.getMinutes();
    return ans;
}
//現在の日付を上と同じ形で取得する。

let getJWT = () => {
    return localStorage.getItem('jwt')
}