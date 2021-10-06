let enc_file = (enc_time) => {
    //enc_time:公開鍵・公開日時
    reader.onload = async function (fdata) {
        let P1 = getParam1()
        //P1パラメータis何？
        //let P2 = getParam2()
        //P2パラメータis何？
        //let k = new mcl.Fr()
        //Frってなんか乱数を入れるっぽい
        //k.setByCSPRNG()
        //setByCSRPNGは乱数を生成するらしい
        //k.deserialize(k.serialize())
        //なんでシリアライズしたあとにデシリアライズしてるの？もとに戻るだけでは？
        /*
        let P_KEY = enc_time//公開鍵
        let S_KEY = new mcl.G1()//秘密鍵、これを見るにG1は鍵を入れる？
        let data = await getSecretKey(P_KEY)//→getkey.js
        for (let i = 0; i < S_KEY["a_"].length; i++) {
            S_KEY["a_"][i] = data["a_"][i]
        }
        */
        //なぜか走らないが別に配列に入れてる、配列の要素名がa_なのはなぜ？
        //→長い文字列をa_で分割しているらしい
        //でもS_KEYってやつ、署名にしか使ってないな？
        //→じゃあ必要なのはgetPublickeyとgetSecretkey2だけになる

        //let [S, R] = generateSign(S_KEY, fdata.target.result, P1, P2, k)
        //下参照、なぜ暗号化なのに署名生成？
        const key = genAESkey() //mcl::Fr
        //なぜここでも鍵を作ってる？
        const encKey = await encKeyByTRE(enc_time, P1, key) //[IDdecに必要な情報, IDencされた鍵]
        //鍵を暗号化している？
        const encMsg = CryptoJS.AES.encrypt(fdata.target.result, key.getStr())
        //ここで中身の暗号化？
        var contents = encMsg + ',' + encKey
            + '__' + P1.getStr() + '__' + enc_time//+ '__' + P2.getStr() + '__' + S.getStr() + '__' + R.getStr()
        //暗号化されたデータとパスワードを結合
        //↑パスワードだけじゃなくてパラメータも暗号化してね？
        var blob_content = new Blob([contents]) //文字列で扱えるように変換

        //DLリンクを生成
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display:none";

        a.href = window.URL.createObjectURL(blob_content)

        a.download = filename + '.encrypted';
        a.click();
    }
    //reader.readAsDataURL(file);
    //ここでURLをfileに入れるのはなぜ？
}

// AESパスワードをタイムリリース暗号で暗号化
let encKeyByTRE = async (enc_time, P1, AESkey) => {
    let mpk = new mcl.G1()
    const data = await getPublicKey(P1)
    for (let i = 0; i < mpk["a_"].length; i++) {
        mpk["a_"][i] = data["a_"][i]
    }

    return TIMEenc(enc_time, P1, mpk, AESkey)
}
//MPKとは？？、予想：MasterPublicKey

//Enc(m)=[xP, m*H(e(Pt,xKt))]=(C1,C2)
//Kt=sPa
//Pt=H(TIME)
//x=random
//P=eclipse
//s=PKG,master key

//なんで*が＋になっているのか不明

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
//ここが暗号化本体っぽい？TREに合わせて調節しようね
/*
Cだとこんな感じだった

mclBnFr_setStr(&s, s_Str, strlen(s_Str), 10);//PKG マスター鍵
start_t = clock();
Time_Str = Time_dec;//公開鍵
printf("Public Key: %s\n", Time_Str);
mclBnG1_hashAndMapTo(&Q_TIME, Time_Str, strlen(Time_Str));
mclBnG1_mul(&S_TIME, &Q_TIME, &s);//時間鍵(秘密鍵)
mclBnG1_getStr(buf, sizeof(buf), &S_TIME, 16);
printf("T_TIME: %s\n",buf);
mclBnFr_setByCSPRNG(&x);
mclBnFr_setStr(&m, Mes, strlen(Mes), 16);
encS_t = clock();
C1_enc = Enc_C1(para2, x);//暗号化
C2_enc = Enc_C2(s, Q_TIME, para2, x, m);//暗号化
encE_t = clock();
decS_t = clock();
Dec = Dec_mes(S_TIME, C1_enc, C2_enc);//復号
*/

/*  
    署名文生成
    S_KEY:秘密鍵
    msg  :本文
    P1   :公開パラメータ1
    P2   :公開パラメータ2
    k    :ランダム数字

    return:署名文
*/
/*
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
}*/
//なにこれ？？？署名を生成してるっぽいけど...恐らく認証に使ってた可能性
//どうやらP2は署名のみに必要なパラメータっぽい

//[(P1*H(msg)+S_KEY*H(P2*k))*inv(k), P2*k]=[S,R]
//inv=逆関数？