//シリアライズ&デシリアライズの処理追加
//謎、何に使うのかわからない
let getParam1 = () => {
    let P1 = new mcl.Fr()
    P1.setByCSPRNG()
    let g = new mcl.G1()
    g.deserialize(mcl.hashAndMapToG1(P1.getStr()).serialize())
    return g
}

//シリアライズ&デシリアライズの処理追加
//謎、なんで存在するのかわからない
//乱数生成→ハッシュ化→シリアライズ→デシリアライズ
let getParam2 = () => {
    let P2 = new mcl.Fr()
    P2.setByCSPRNG()
    let g = new mcl.G2()
    g.deserialize(mcl.hashAndMapToG2(P2.getStr()).serialize())
    return g
}

//シリアライズ&デシリアライズの処理追加
//AES鍵を作るのはわからんでもないけどシリアライズは何？
let genAESkey = () => {
    const key = new mcl.Fr()
    key.setByCSPRNG()
    key.deserialize(key.serialize())
    return key
}

//シリアライズ&デシリアライズの処理追加
//なにやらサーバからとってきているのでそっち参照
//結論HTTP通信でサーバ側のgolangにある関数をアプリとして起動している
//つまり、このリンク先+リクエストヘッダとしてJWTトークンを送ってそれを用いて鍵を作ってるらしい？
//実はサーバ側のプログラムからこの関数を使ってると見られる部分があったので要検証
//仕組みとしては、「クライアント側の関数をサーバ側が起動している」と見られる。

//調べたところ、JWTをlocalstorageからとってきているのはセキュリティ上良くないことが判明
//だけど、じゃあどうやって鍵作るよ？

/*

*/

//でもこの鍵、何に使うの？？？マスター鍵ならわかるけど、2つも必要な理由が不明

let getSecretKey = async(ID) => {
      /*
    let token = getJWT()

    if (token === null || typeof token === 'undefined') {
        console.log('token is none')
        return null
    }
    
    let res = await axios.get('https://key.project15.tk/api/secretkey', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    let len = Object.keys(res.data).length
    console.log(res.data[0])
    let data = new Uint8Array(len)//byte配列を生成してる
    for (i = 0; i < len; i++) {
        data[i] = res.data[i]
    }
    console.log(data)
    let key = new mcl.G1()
    key.deserialize(data)//byte列だったからデシリアライズしてもとの数字？に戻してる
    return key
    */
   
   
    //  JWT実装までのTEST秘密鍵生成
   let key = getParam1();
   return key;
}

//シリアライズ&デシリアライズの処理追加
//上記と同様
let getPublicKey = async(P1) => {
    /*
    let token = getJWT()

    if (token === null || typeof token === 'undefined') {
        console.log('token is none')
        return null
    }

    let res = await axios.get('https://key.project15.tk/api/publickey', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'P1': JSON.stringify(P1.serialize())//P1のパラメータを取得している、通信にどうやらJSONを使ってる模様
        }
    })

    let len = Object.keys(res.data).length
    //console.log(res.data[0])
    let data = new Uint8Array(len)
    for (i = 0; i < len; i++) {
        data[i] = res.data[i]
    }
    let key = new mcl.G1()
    key.deserialize(data)
    return key
    */
    let key = getParam1();
    return key;
}

//デシリアライズ処理追加&日時情報追加
//上記と同様
let getSecretKey2 = async(time) => {
    /*
    let token = getJWT()

    if (token === null || typeof token === 'undefined') {
        console.log('token is none')
        return null
    }
    let res = await axios.get('https://key.project15.tk/api/secretkey2', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'time': time//時間を取得しているが何に使ってるのか？
        }
    })
    let len = Object.keys(res.data).length
    //console.log(res.data[0])
    let data = new Uint8Array(len)
    for (i = 0; i < len; i++) {
        data[i] = res.data[i]
    }
    let key = new mcl.G2()
    key.deserialize(data)
    return key
    */
    let key = getParam2();
    return key;
}
/*
//デシリアライズ処理追加&日時情報追加
//上記と同様
let getPublicKey2 = async(P2, time) => {
    
    let token = getJWT()

    if (token === null || typeof token === 'undefined') {
        console.log('token is none')
        return null
    }
    
    let res = await axios.get('https://key.project15.tk/api/publickey2', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'P2': JSON.stringify(P2.serialize()),
            'time': time
        }
    })
    let len = Object.keys(res.data).length
    console.log(res.data[0])
    let data = new Uint8Array(len)
    for (i = 0; i < len; i++) {
        data[i] = res.data[i]
    }
    let key = new mcl.G2()
    key.deserialize(data)
    return key
}*/

let parseParam = (sig) => {
    let sigInfo = JSON.parse(sig)
    let rawP1 = sigInfo['P1']
    let rawP2 = sigInfo['P2']
    let rawS = sigInfo['S']
    let rawR = sigInfo['R']

    let P1 = new mcl.G1()
    let P2 = new mcl.G2()
    let S = new mcl.G1()
    let R = new mcl.G2()

    for (let i = 0; i < P1["a_"].length; i++) {
        P1["a_"][i] = rawP1["a_"][i]
    }
    for (let i = 0; i < P2["a_"].length; i++) {
        P2["a_"][i] = rawP2["a_"][i]
    }
    for (let i = 0; i < S["a_"].length; i++) {
        S["a_"][i] = rawS["a_"][i]
    }
    for (let i = 0; i < R["a_"].length; i++) {
        R["a_"][i] = rawR["a_"][i]
    }

    return [P1, P2, S, R]
}