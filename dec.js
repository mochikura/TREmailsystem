//予想ではあるが、encodeの時点で、encfile自体に署名を設けることで、そのファイル自体が本当に自分宛てのものであるのかそうでないかを判別する。
//今回のタイムリリースの場合相手ではなく時間で暗号を設けるので、今回はその部分を除く必要がありそう。
//myIDとscrIDの宣言あり
let dectre_file = async () => {
    reader.onload = async function (fdata) {
        //var contents = encMsg + ',' + encKey + '__' + P1.getStr() + '__' + enc_time
        let cut_str = ","     //区切るやつを定義しておく。
        let cut_str2 = "__"

        //Cstrに暗号化されたファイルを格納、getC関数で暗号化されたパスワードを格納。
        var Cstr2 = fdata.target.result.split(cut_str2);
        let P1 = new mcl.G1()
        let dec_time
        //let S = new mcl.G1()
        //let R = new mcl.G2()

        P1.setStr(Cstr2[1])
        dec_time=Cstr2[2]
        if(dateget<dectime){
            alert("まだ復号できない時刻です");
            return;
        }
        //S.setStr(Cstr2[3])
        //R.setStr(Cstr2[4])

        var Cstr = Cstr2[0].split(cut_str);
        var encKey = getC(Cstr[1], Cstr[2])
        //let time = document.getElementById("date").value
        //time = time.replaceAll('/', '-')

        //復号
        let AESkey = await decKeyByTRE(encKey, time)

        var encfile = Cstr[0]
        var decrypted = CryptoJS.AES.decrypt(encfile, AESkey) //file type + file source.
            .toString(CryptoJS.enc.Latin1) // -> to Latin1
            //Latin1ってなんだよ→なにやら文字コードのことらしい
        /*
        if (!/^data:/.test(decrypted)) {//check dataURL
            alert("あなた宛てのファイルではありません。")
            return false
        }

        //署名検証
        let [msg, validity] = await verifySign(decrypted, P1, P2, S, R, srcID, time)
        window.alert(validity ? "〇有効〇" : "×無効×")
        */
        //DLリンクを生成。
        if (validity == true) {
            const a = document.createElement("a")
            document.body.appendChild(a)
            a.style = "display:none"

            a.href = decrypted

            a.download = file.name.replace('.encrypted', '')
            a.click()
        }
    }
    reader.readAsText(file)
}

let decKeyByTRE = async (encKey, time) => {
    let S_KEY = new mcl.G2()
    let data = await getSecretKey2(time)
    for (let i = 0; i < S_KEY["a_"].length; i++) {
        S_KEY["a_"][i] = data["a_"][i]
    }

    return TIMEdec(encKey, S_KEY).getStr()
}
//サーバ班との兼ね合いもあるが、IDが鍵取得に使われているのでこれをどうにかして除かないと...

//Dec(m)=C2/H(e(Tt,C1))

// Dec([U, v]) = v - h(e(U, sk))
let TIMEdec = (c, sk) => {
    const U = new mcl.G1()
    const v = new mcl.Fr()

    for (i = 0; i < U["a_"].length; i++) {
        U["a_"][i] = c[0]["a_"][i]
    }
    for (i = 0; i < U["a_"].length; i++) {
        v["a_"][i] = c[1]["a_"][i]
    }

    const e = mcl.pairing(U, sk)
    return mcl.sub(v, mcl.hashToFr(e.serialize()))
}
//計算式に当てはめ、参考資料を見て変えようね

/*
    検証用署名文生成
    S_KEY:ID公開鍵
    msg  :本文
    P1   :公開パラメータ1
    P2   :公開パラメータ2
    Ppub :PKG公開鍵
    k    :ランダム数字

    return:署名文
*/
/*
let verifySign = async (msg, P1, P2, S, R, P_KEY, time) => {
    try {
        let Ppub = new mcl.G2()
        let data = await getPublicKey2(P2, time)
        if (data == null) {
            return "公開鍵を得られませんでした", false
        }
        for (let i = 0; i < Ppub["a_"].length; i++) {
            Ppub["a_"][i] = data["a_"][i]
        }

        const h2 = new mcl.Fr()
        const h3 = new mcl.Fr()
        h2.setHashOf(msg)
        let Q = mcl.hashAndMapToG1(P_KEY)
        h3.setHashOf(R.getStr(16))
        let eP = mcl.pairing(P1, P2)
        let eP1 = mcl.pow(eP, h2)
        let PQ = mcl.pairing(Q, Ppub)
        let PQ1 = mcl.pow(PQ, h3)
        let eP2 = mcl.mul(eP1, PQ1)
        let sig = mcl.pairing(S, R)

        return [msg, sig.isEqual(eP2)]
    } catch (e) {
        return [msg, false]
    }
}
*/
//e(S,R)=(e(P1,P2)^H(msg))*e((H1(P_KEY),Ppub)^R)
//署名検証かな？？
//多分今回の場合いらない

// パスワードを取得する(復号用)
function getC(str1, str2) {
    c1 = new mcl.G1()
    c2 = new mcl.Fr()
    c1.deserializeHexStr(str1)
    c2.deserializeHexStr(str2)
    return [c1, c2]
}