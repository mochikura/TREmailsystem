let filename;//ファイル名
let file;//ファイル
let reader;//FileReader
let filetype;//Fileの形式
//他場所でも使うのでグローバルに

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

let isFun = (email) => {
    let pattern = /\w@fun.ac.jp$/
    return pattern.test(email)
}