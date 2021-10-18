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
let filedom/*, fileEnc*/;
window.onload = () => {
    mcl.init(0).then(() => {
    })
    console.log(document.documentElement.clientWidth+" "+document.documentElement.clientHeight)
    //window.resizeBy(0,22)
    filedom = document.getElementsByTagName('html')[0].children[1].children[0].contentWindow.document
    initEncUI();
    initFileEnc();

}

let initEncUI = () => {
    let menu = filedom.getElementById('topMenu')
    let encdiv = filedom.createElement('div')
    encdiv.innerHTML = `
    <div style="margin: 10px 20px 10px;">
    <select id="selectEnc">
    <option value="select">選択してください</option>
    <option value="tre">タイムリリース暗号</option>
    <option value="ibe">IDベース暗号</option>
    </select>
    <section id="tre" style="display: none; font-size:12px;">
    <span>復号時刻</span>
    <input type="datetime-local" id="date" min="2020-01-01T00:00" step="1800">
    <span class="roundTypeBtn"><span class="roundTypeBtnInner" id="trefileset">ファイルを選択</span></span>
    <span class="roundTypeBtn"><span class="roundTypeBtnInner" id="trefileget">暗号化</span></span><br>
    <span id="trefilename">ファイルが選択されていません</span>
    </section>
    <section id="ibe" style="display: none; font-size:12px;">
    <span><input id="emailIBS" type="text" placeholder="email" style="height: 18px;" autocomplete="off"></span>
    <span><input id="passwordIBS" type="password" placeholder="Password" style="height: 18px;" autocomplete="off"></span>
    <span class="roundTypeBtn"><span class="roundTypeBtnInner" id="ibefileset">ファイルを選択</span></span>
    <span class="roundTypeBtn" id="ibefileget"><span class="roundTypeBtnInner">サインイン&暗号化</span></span><br>
    <span id="ibefilename">ファイルが選択されていません</span>
    </section>
    <input type="file" id="encfile" style="display:none;">
    </div>`
    menu.before(encdiv)
    let filedata=filedom.getElementById("encfile")
    filedom.getElementById("selectEnc").onchange = function () {
        let encValue = filedom.getElementById("selectEnc").value
        if(encValue=="tre"){
            filedom.getElementById("tre").style.display="";
            filedom.getElementById("ibe").style.display="none";
        }else if(encValue=="ibe"){
            filedom.getElementById("tre").style.display="none";
            filedom.getElementById("ibe").style.display="";
        }
    }

    filedom.getElementById("trefileset").onclick = () => {
        filedata.click()
        filedom.getElementById("trefilename").innerHTML = "ファイルが選択されていません"
        filedom.getElementById("ibefilename").innerHTML = "ファイルが選択されていません"
    }
    filedom.getElementById("ibefileset").onclick = () => {
        filedata.click()
        filedom.getElementById("trefilename").innerHTML = "ファイルが選択されていません"
        filedom.getElementById("ibefilename").innerHTML = "ファイルが選択されていません"
    }
    filedata.onclick=()=>{
        filedata.value=""
    }
    filedata.onchange=()=>{
        console.log(filedom)
        filedom.getElementById("trefilename").innerHTML= filedata.files[0].name
        filedom.getElementById("ibefilename").innerHTML= filedata.files[0].name
    }
    let dateset=filedom.getElementById("date");
    filedom.getElementById("trefileget").onclick = () =>{
        if(filedata.value==""){
            alert("ファイルが選択されていません")
            return
        }
        if(datetrim(dateset.value)=="error"){
            alert("日付が選択されていません")
            return
        }
        let file = filedata.files[0];
        reader = new FileReader();
        reader.readAsText(file);
        enctre_file(datetrim(dateset.value));
    }
    filedom.getElementById("ibefileget").onclick = () =>{
        if(filedom.getElementById("encfile").value==""){
            alert("ファイルが選択されていません")
            return
        }
        //ここにサインイン処理を追加
        let file = filedata.files[0];
        reader = new FileReader();
        reader.readAsText(file);
        //encibe_file(datetrim(dateset.value));
        alert("IBEencode_start")
    }
}

let initFileEnc = () => {
    //console.log(fileEnc);
    //fileEnc.setAttribute("onchange", "setFile(this.files);");
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