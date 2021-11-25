let initEncFirebase = () => {
    const config = {
        apiKey: "AIzaSyCx4_OCPkQG2F7W-JJK_4cYoMYQ244ZwjE",
        databaseURL: "https://test1-e311b-default-rtdb.firebaseio.com/",
        storageBucket: "test1-e311b.appspot.com",
    };
    firebase.initializeApp(config);
}

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
    //console.log(document.documentElement.clientWidth+" "+document.documentElement.clientHeight)
    //filedomは、使用するウィンドウのdom要素
    filedom = document.getElementsByTagName('html')[0].children[1].children[0].contentWindow.document
    initEncUI();
    //initEncFirebase();
}

let initEncUI = () => {
    //menuはメール送信などの並び
    let menu = filedom.getElementById('topMenu')
    //menuの更に上に暗号化・署名用の場所を差し込む
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

    //ここからレイアウト調整
    let htmldom = filedom.getElementById("htmlDiv")
    let htmlsize = parseInt(htmldom.style.height)
    let textdom = filedom.getElementById("textDiv")
    let textsize = parseInt(textdom.style.height)
    let srcdom = filedom.getElementById("srcDiv")
    let srcsize = parseInt(srcdom.style.height)

    htmldom.style.height = (htmlsize - 42) + "px"
    textdom.style.height = (textsize - 42) + "px"
    srcdom.style.height = (srcsize - 42) + "px"

    //署名検証用のパスワードを入れる場所
    let passtd = filedom.createElement('td')
    passtd.setAttribute('style', 'padding-left: 6px;')
    passtd.innerHTML = `
    <div class="fromnameWrap" style="border-color: rgb(170, 170, 170); width: 120px;">
	<input id="passwordSign" type="password" class="fromname outline" placeholder="Password" maxlength="32" tabindex="1" style="height: 18px; width: 116px;" autocomplete="off">
	</div>`
    let senderWrap = filedom.getElementById("headerWrap").children[0].children[0].children[0].children[2].children[0].children[0].children[0]
    senderWrap.append(passtd)

    //署名検証用のログインボタン
    let signintd = filedom.createElement('td')
    signintd.setAttribute('style', 'padding-left: 6px;')
    signintd.innerHTML = `
    <div><span class="roundTypeBtn"><span class="roundTypeBtnInner" id="sigsignin">サインイン</span></span>
    </div>`
    senderWrap.append(signintd)

    //上部のファイルエンコード手段を選ぶ場所の選択による表示切り替え
    //console.log(senderWrap)
    let filedata = filedom.getElementById("encfile")
    filedom.getElementById("selectEnc").onchange = function () {
        let encValue = filedom.getElementById("selectEnc").value
        if (encValue == "tre") {
            filedom.getElementById("tre").style.display = "";
            filedom.getElementById("ibe").style.display = "none";
            htmldom.style.height = (htmlsize - 80) + "px"
            textdom.style.height = (textsize - 80) + "px"
            srcdom.style.height = (srcsize - 80) + "px"
        } else if (encValue == "ibe") {
            filedom.getElementById("tre").style.display = "none";
            filedom.getElementById("ibe").style.display = "";
            htmldom.style.height = (htmlsize - 80) + "px"
            textdom.style.height = (textsize - 80) + "px"
            srcdom.style.height = (srcsize - 80) + "px"
        }
    }

    //ファイル選択したら一旦ファイル選択を解除
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
    filedata.onclick = () => {
        filedata.value = ""
    }
    //ファイル名の表示
    filedata.onchange = () => {
        console.log(filedom)
        filedom.getElementById("trefilename").innerHTML = filedata.files[0].name
        filedom.getElementById("ibefilename").innerHTML = filedata.files[0].name
    }

    //TREの暗号化ボタンを押したとき
    let dateset = filedom.getElementById("date");
    filedom.getElementById("trefileget").onclick = () => {
        if (filedata.value == "") {
            alert("ファイルが選択されていません")
            return
        }
        if (datetrim(dateset.value) == "error") {
            alert("日付が選択されていません")
            return
        }
        file = filedata.files[0];
        filename = file.name
        reader = new FileReader();
        reader.readAsText(file);
        enctre_file(datetrim(dateset.value));
    }

    //IBEの暗号化ボタンを押したとき
    //※今後ログイン失敗時のアラートが必要
    filedom.getElementById("ibefileget").onclick = () => {
        //let sendemail = senderWrap.children[1].children[2].children[0].innerHTML
        let rcvemail
        try {
            rcvemail = filedom.getElementById("tolist").children[0].getAttribute('email')
        } catch {
            alert("宛先を入力してください")
            return
        }
        //使い手側の例外処理
        if (filedom.getElementById("encfile").value == "") {
            alert("ファイルが選択されていません")
            return
        }
        if (filedom.getElementById("emailIBS").value == "") {
            alert("IDを入力してください")
            return
        }
        if (filedom.getElementById("passwordIBS").value == "") {
            alert("パスワードを入力してください")
            return
        }
        if (rcvemail == "") {
            alert("宛先を入力してください")
            return
        }
        if (!isFun(rcvemail)) {
            alert("宛先が学内メールアドレスではありません")
            return
        }
        file = filedata.files[0];
        filename = file.name
        reader = new FileReader();
        reader.readAsText(file);
        encibe_file()
        //サインイン処理完成したらこの5行消す
        /*
        firebase.auth().signInWithEmailAndPassword(email, passwd).then(res => {
            res.user.getIdToken().then(idToken => {
                localStorage.setItem('jwt', idToken.toString())
                let file = filedata.files[0];
                reader = new FileReader();
                reader.readAsText(file);
                encibe_file();
            })
        }, err => {
            //alert(err.message)
            alert("サインインに失敗しました")
        })*/
    }

    //ログイン時処理
    let sendBtn_flag = false
    filedom.getElementById("sigsignin").onclick = () => {
        //console.log(senderWrap)
        let emailSign = document.getElementById("emailSign")
        let passwdSign = document.getElementById("passwordSign")
        /*
        firebase.auth().signInWithEmailAndPassword(emailSign, passwdSign).then(res => {
            res.user.getIdToken().then(idToken => {
                localStorage.setItem('jwt', idToken.toString())
                if (!sendBtn_flag) {
            createBtn()
            sendBtn_flag = true;
        }
                alert('サインインに成功しました')
            })
        }, err => {
            //alert(err.message)
            alert("サインインに失敗しました")
        })*/
        //alert(email + " signin")
        if (!sendBtn_flag) {
            createBtn()
            sendBtn_flag = true;
        }//サインイン処理完成したら消す
    }
}

//これいらないかも
function getSubstring(str, string1, string2) {
    index1 = str.indexOf(string1) + string1.length + 1
    index2 = str.indexOf(string2)
    return str.substring(index1, index2)
}
// 文章から文字列以降を取得する、どっかで使うならとっておく、使わないなら消す


// by Sona34
let createBtn = () => {

    let menu = filedom.getElementById('topMenu');

    let btns = menu.children[0];

    // create spanTag and setAttribute
    let span = document.createElement('span');
    span.setAttribute('class', 'roundTypeBtn');
    span.setAttribute('asvwidth', '1');

    // create _spanTag and setAttribute
    let _span = document.createElement('span')
    _span.setAttribute('class', 'roundTypeBtnInner')
    _span.onclick = SendByIBS
    _span.innerText = 'ID署名付きで送信'

    // _span insert into span
    span.append(_span);
    // span insert into <div class='topBtns'>
    btns.prepend(span);

    // debug
    //console.log(btns);
}

let SendByIBS = () => {
    let toList = filedom.getElementById('tolist')
    let email
    for(let i = 0; i < toList.children.length; i++){
        try {
            email = toList.children[i].getAttribute('email')
        } catch {
            alert("宛先を入力してください")
            return
        }
        if (email == "") {
            alert("宛先を入力してください")
            return
        }
        if (!isFun(email)) {
            alert("宛先が学内メールアドレスではありません")
            return
        }
    }


        // e-mail addressを取得
        //email = toList.children[0].getAttribute('email');

        /*if (isFun(email)) {*/

        let originalMsg = filedom.getElementById('textDoc').value;
        let msg = originalMsg;
        if (originalMsg.includes('\n----- Original Message -----')) {
            msg = originalMsg.before('\n----- Original Message -----');
        }

        let begin = "\n-----BEGIN SIGNATURE-----\n";
        //let sigInfo = await signByIBS(msg)
        let sigInfo = "TEST SIGNATURE";
        let end = "\n-----END SIGNATURE-----";
        filedom.getElementById('textDoc').value = originalMsg + begin + JSON.stringify(sigInfo) + end;
        //}

    filedom.getElementById('sendBtn').children[0].click()
}

/*
let isFun = (email) => {
    let pattern = /\w@fun.ac.jp$/
    return pattern.test(email)
}*///→index.jsに移動