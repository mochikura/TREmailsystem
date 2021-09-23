let loadScript = (url, callback) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url
    if (script.readyState) {
        script.onreadystatechange = () => {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
                script.onreadystatechange = null
                callback()
            }
        }
    } else {
        script.onload = () => callback()
    }
    document.getElementsByTagName('head')[0].appendChild(script)
}
//他サーバから取り寄せたAPIとかファイルをJSに読み込ませたいときに使う

window.onload = () => {
    mcl.init(0).then(() => {
        alert("mcl読み込みOK");
    })
}
//mclの読み込み

let getJWT = () => {
    return localStorage.getItem('jwt')
}

/*
let getSign = (S_KEY, msg, P1, P2, k) => {
    const h2 = new mcl.Fr()
    const h3 = new mcl.Fr()
    h2.setHashOf(msg)
    let R_G2 = mcl.mul(P2, k)
    let buffer = R_G2.getStr(16)
    h3.setHashOf(buffer)
    let h2_P1 = mcl.mul(P1, h2)
    let h3_S = mcl.mul(S_KEY, h3)
    let h2_h3 = mcl.add(h2_P1, h3_S)
    let k_inv = mcl.inv(k)
    let S_G1 = mcl.mul(h2_h3, k_inv)
    let sig = mcl.pairing(S_G1, R_G2)
    return sig.getStr(16)
}
*/
//謎、必要性がわからない、署名生成？

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
let veriSign = (P_KEY, msg, P1, P2, Ppub, k) => {
    const h2 = new mcl.Fr()
    const h3 = new mcl.Fr()
    h2.setHashOf(msg)
    let Q = mcl.hashAndMapToG1(P_KEY)
    let R_G2 = mcl.mul(P2, k)
    let buffer = R_G2.getStr(16)
    h3.setHashOf(buffer)
    let eP = mcl.pairing(P1, P2)
    let eP1 = mcl.pow(eP, h2)
    let PQ = mcl.pairing(Q, Ppub)
    let PQ1 = mcl.pow(PQ, h3)
    let eP2 = mcl.mul(eP1, PQ1)
    return eP2.getStr(16)
}
//謎、必要性がわからない、署名検証？
*/

function getSubstring(str, string1, string2) {
    index1 = str.indexOf(string1) + string1.length + 1
    index2 = str.indexOf(string2)
    return str.substring(index1, index2)
}
// 文章から文字列以降を取得する、どっかで使うならとっておく、使わないなら消す