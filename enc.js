let enctre_file = async (enc_time) => {
    //enc_time:公開鍵・公開日時
    reader.onload = async function (fdata) {
        let P1 = getParam1()
        const key = genAESkey() //mcl::Fr
        const encKey = await encKeyByTRE(enc_time, P1, key) //[IDdecに必要な情報, IDencされた鍵]
        //鍵を暗号化している
        const encMsg = CryptoJS.AES.encrypt(fdata.target.result, key.getStr())
        //ここで中身の暗号化
        var contents = encMsg + ',' + encKey
            + '__' + P1.getStr() + '__' + enc_time//+ '__' + P2.getStr() + '__' + S.getStr() + '__' + R.getStr()
        //暗号化されたデータと暗号化された鍵、各パラメータを結合
        var blob_content = new Blob([contents]) //文字列で扱えるように変換

        //DLリンクを生成
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display:none";

        a.href = window.URL.createObjectURL(blob_content)

        a.download = filename + '.timeencrypted';
        a.click();
    }
    //reader.readAsDataURL(file);
    //ここでURLをfileに入れるのはなぜ？
}

// AESパスワードをタイムリリース暗号で暗号化
let encKeyByTRE = async (enc_time, P1, AESkey) => {
    let mpk = new mcl.G1()
    const data = await getKtTimeKey(P1)
    for (let i = 0; i < mpk["a_"].length; i++) {
        mpk["a_"][i] = data["a_"][i]
    }

    return TIMEenc(enc_time, P1, mpk, AESkey)
}
//MPKとはMasterPublicKey

//Enc(m)=[xP, m*H(e(Pt,xKt))]=(C1,C2)
//Kt=sPa
//Pt=H(TIME)
//x=random
//P=eclipse
//s=PKG,master key

// Enc(m) = [r P, m + h(e(r mpk, H(id)))]
let TIMEenc = (time, P, mpk, m) => {
    //let a_ = new Uint32Array(mpk["a_"])
    //console.log("mpk", a_)
    //console.log(mpk)
    const r = new mcl.Fr()
    r.setByCSPRNG()
    const Q = mcl.hashAndMapToG2(time)
    const e = mcl.pairing(mcl.mul(mpk, r), Q)

    return [mcl.mul(P, r).serializeToHexStr(), mcl.add(m, mcl.hashToFr(e.serialize())).serializeToHexStr()]
}

let encibe_file = async () => {
    reader.onload = async function (fdata) {
        let P1 = getParam1()
        let P2 = getParam2()
        let k = new mcl.Fr()
        k.setByCSPRNG()
        k.deserialize(k.serialize())

        const key = genAESkey()
        var sendid = filedom.getElementById("emailIBS").value
        let S_KEY = new mcl.G1()
        let data = await getSecretKey(sendid)
        for (let i = 0; i < S_KEY["a_"].length; i++) {
            S_KEY["a_"][i] = data["a_"][i]
        }
        let [S, R] = generateSign(S_KEY, fdata.target.result, P1, P2, k)

        var rcvid = filedom.getElementById("tolist").children[0].getAttribute('email')
        console.log(rcvid)
        const enckey = await encKeyByIBE(rcvid, P1, key)
        const encMsg = CryptoJS.AES.encrypt(fdata.target.result, key.getStr()).toString()
        const encKey2 = enckey[0].serializeToHexStr() + '__' + enckey[1].serializeToHexStr()
        var contents = encMsg + ',' + encKey2 + '__' + P1.getStr() + '__' + P2.getStr() + '__' + S.getStr() + '__' + R.getStr()
        //encMsg,enckey[0]__enckey[1]__P1__P2__S__R

        var blob_content = new Blob([contents]) //文字列で扱えるように変換
        //DLリンクを生成
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display:none";
        a.href = window.URL.createObjectURL(blob_content)
        a.download = filename + '.idencrypted'//file.name;
        a.click();
    }
}

// Enc(m) = [r P, m + h(e(r mpk, H(id)))]
let encKeyByIBE = async (id, P1, AESkey) => {
    let mpk = new mcl.G1()
    const data = await getPublicKey(P1)
    for (let i = 0; i < mpk["a_"].length; i++) {
        mpk["a_"][i] = data["a_"][i]
    }

    return IBEenc(id, P1, mpk, AESkey)
}
let IBEenc = (id, P, mpk, m) => {
    const r = new mcl.Fr()
    r.setByCSPRNG()
    const Q = mcl.hashAndMapToG2(id)
    const e = mcl.pairing(mcl.mul(mpk, r), Q)

    return [mcl.mul(P, r), mcl.add(m, mcl.hashToFr(e.serialize()))]
}
/*  
    署名文生成
    S_KEY:秘密鍵
    msg  :本文
    P1   :公開パラメータ1
    P2   :公開パラメータ2
    k    :ランダム数字

    return:署名文
*/

let generateSign = (S_KEY, msg, P1, P2, k) => {
    const h2 = new mcl.Fr();
    const h3 = new mcl.Fr();

    h2.setHashOf(msg);
    let R_G2 = mcl.mul(P2, k);

    h3.setHashOf(R_G2.getStr(16));
    let h2_P1 = mcl.mul(P1, h2);
    let h3_S = mcl.mul(S_KEY, h3);
    let h2_h3 = mcl.add(h2_P1, h3_S);
    let k_inv = mcl.inv(k);
    let S_G1 = mcl.mul(h2_h3, k_inv);

    return [S_G1, R_G2]
}

//[(P1*H(msg)+S_KEY*H(P2*k))*inv(k), P2*k]=[S,R]
//inv=逆関数

let signByIBS = async (msg) => {
    let P1 = getParam1();
    let P2 = getParam2();
    let k = new mcl.Fr();
    k.setByCSPRNG();
    let idPublicKey = fileDom.getElementById('fromWrap').innerText;
    console.log("idPublicKey: " + idPublicKey);

    let secretKey = await getSecretKey(idPublicKey);

    let sigInfo = {};
    let [S, R] = generateSign(secretKey, msg, P1, P2, k);

    sigInfo['P1'] = P1;
    sigInfo['P2'] = P2;
    sigInfo['S'] = S;
    sigInfo['R'] = R;

    return sigInfo;
}

