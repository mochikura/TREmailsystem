const dateshow = document.getElementById("showdate");
const dateset = document.getElementById("date");
dateshow.addEventListener("click", () => {
    alert(datetrim(dateset.value));
});
//入力された時刻がしっかりシステム側で処理されたかを確認

const fileadd = document.getElementById("encfile");
fileadd.addEventListener("click", () => {
    fileadd.value = "";
});
//リロードせずに続けてファイル選択するとおかしくなるので、ファイル選択ごとに初期化
let filename;
let file;
let reader;
//他場所でも使うのでグローバルに
fileadd.addEventListener("change", () => {
    file = fileadd.files[0];
    //alert(file);
    reader = new FileReader();
    reader.readAsText(file);
    filename = file.name;
    let filetype = file.type;
    let filesize = file.size;
    reader.onload = () => {
        //document.getElementById("filebi").innerHTML = reader.result;
        document.getElementById("filename").innerHTML = "ファイル名：" + filename;
        document.getElementById("filetype").innerHTML = "ファイル形式：" + filetype;
        document.getElementById("filesize").innerHTML = "ファイルサイズ：" + filesize;
    };
});
//入力されたファイルの情報を確認できる

const fileget = document.getElementById("encfileget");
fileget.addEventListener("click", () => {
    //try {
        let file = fileadd.files[0];
        //alert(file);
        reader = new FileReader();
        reader.readAsText(file);
        enc_file(datetrim(dateset.value));
        /*
        reader.onload = ()=> {
            let blob = new Blob([reader.result], { type: file.type });
            let downlink = document.createElement('a');
            downlink.href = URL.createObjectURL(blob);
            downlink.download = file.name;
            downlink.click();
        }
        */
    //} catch (error) {
    //    alert("エラーが発生しました");
    //}
}
)
//入力されたファイルを処理してダウンロードする。
//検証では、テキストファイル以外は不可能だった、他だとどうやるのかは要検証

let datetrim = (date) => {
    let matchtext = /\BT\B/;
    //YYYY-MM-DDThh:mm
    if (matchtext.test(date)) {
        let splitT = date.split("T");
        let splitdate = splitT[0].split('-');
        let splittime = splitT[1].split(':');
        return splitdate[0] + splitdate[1] + splitdate[2] + splittime[0] + splittime[1];
    } else {
        return "日付を入力してください";
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