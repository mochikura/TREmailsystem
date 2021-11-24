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
let decdom, obs, iframe, framedom;
//ややこしいのが、元画面がフレームで分かれているので、それぞれdocumentを別に設定する必要がある
window.onload = () => {
    mcl.init(0).then(() => {
    })
    //initFirebase();
    let _htm = document.getElementsByTagName('html')
    decdom = _htm[0].children[1].children[0].contentWindow.document
    console.log(decdom)
    //frameが読み込まれるたびにこのinitdecを実行する必要あり
    obs = new MutationObserver(() => { initDec() })
    let config = {
        childList: true,
        subtree: true,
        characterDataOldValue: true
    }
    //console.log(decdom.getElementById("contents"))
    obs.observe(decdom.getElementById("contents"), config)
}

let initDec = () => {
    iframe = decdom.getElementById('viewmail-iframe')
    //console.log(iframe);
    iframe.onload = () => {
        framedom = iframe.contentWindow.document;
        initDecUI();
    }
    //obs.disconnect()
}

/*
レイアウト追加処理について

decdomに指定されたiframeが読み込まれるたび（厳密にはそれ以下のdom要素に変化があるたび）initDecが発動するようにする。
manifestのall_framesがtrueなので、ページ内の全iframeにこの処理が埋め込まれる。
decdom：対象iframe内のhtmldocumentを取得、今回の場合はメールリストとメールプレビューの部分に当たる
obs：対象dom要素の動きを取得するもの、今回の場合はそれ以下に変化があると処理が発動する。
iframe：メールプレビューのところのiframeが入る
framedom：iframeのところのdocument要素

*/
let resizeflag = 0;
//レイアウト調整用
function decpagesize(decdomsize) {
    //console.log(iframe)
    let framesize = iframe.clientHeight;
    let menusize = framedom.getElementById("mbox-btn-list").clientHeight
    //console.log(framesize + " " + menusize + " " + decdomsize + " " + (framesize - decdomsize - menusize))
    return framesize - decdomsize - menusize
}

//画面サイズが変わるたびにフレームのサイズを変更する必要がある
var timeoutId;
window.addEventListener("resize", function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
        switch (resizeflag) {
            case 0:
                break;
            case 1:
                framedom.getElementById("viewmail-main").style.height = decpagesize(0) + "px"
                break;
            case 2:
                framedom.getElementById("viewmail-main").style.height = decpagesize(71) + "px"
                break;
            case 3:
                framedom.getElementById("viewmail-main").style.height = decpagesize(48) + "px"
                break;
            case 4:
                framedom.getElementById("viewmail-main").style.height = decpagesize(73) + "px"
                break;

        }
    }, 50);
});

let initDecUI = () => {
    //署名検証
    let RecvByIBS = () => {
        alert("Veristart");
        // メール部分
        let divBody = framedom.getElementById('viewmail-textHtml');
        // メール本文
        let recvBody = divBody.children[0].children[0].children[0].children[0].children[0].children[0];
        // ヘッダー部分
        let divHeader = framedom.getElementById('viewmail_header');
        // pre の部分のテキスト情報
        let header = divHeader.children[0].children[0].children[1].children[0].children[0].children[0].innerText;
        // 送信者のMailAddress
        let srcID = header.match(/From:.+\<(.+@fun\.ac\.jp)\>/)[1];
        // 受信者のMailAddress
        let myID = header.match(/To:.+\<+(\w+@fun.ac.jp)\>+/);

        if (myID == null) {
            myID = header.match(/To: (\w+@fun.ac.jp)/);
        }

        // viewmail-normal-header から 日付時刻情報を取得
        let divNormalHeader = framedom.getElementById('viewmail-normal-header');
        let time = divNormalHeader.children[0].children[0].children[2].children[1].children[0].children[0].innerText;
        time = time.replaceAll('/', '-');

        let plaMsg = recvBody.innerText.split("\n-----BEGIN SIGNATURE-----\n");

        // テキスト部分の分割
        payMsg = plaMsg[plaMsg.length - 1];

        // 署名部分の分割
        let signat = payMsg.replace("\n-----END SIGNATURE-----", "");

        //署名部分のコンソール表示
        //console.log(signat);


        // パラメータ生成
        const [P1, P2, S, R] = parseParam(signat);

        // パラメータをもとに署名検証
        let [msg, validity] = verifySign(payMsg, P1, P2, S, R, srcID, time);

        recvBody.innerText = msg;
        window.alert(validity ? "〇有効〇" : "×無効×");
    }
    //ボタン追加
    let btndiv = framedom.getElementById('mbox-btn-list')
    let li = framedom.createElement('li')
    li.innerHTML = `
    <li id="VeriIBS" class="action_mail bar_long"><a class="roundTypeBtn"><span class="roundTypeBtnInner">
    IDベース署名検証
    </span></a></li>
    <li id="dec-list" class="action_mail"><a class="roundTypeBtn"><span class="roundTypeBtnInner"><span class="ico_action deep_td">
    ファイル復号
    </span></span></a></li>
    `
    btndiv.append(li)
    //画面リサイズ
    framedom.getElementById("viewmail-main").style.height = decpagesize(0) + "px"
    resizeflag = 1
    //署名検証のレイアウト
    let veripage = framedom.createElement('div')
    veripage.setAttribute('id', 'decPage')
    veripage.setAttribute('style', 'width:100%')
    veripage.setAttribute('class', 'mailBox_btn')
    /*display: block; margin-block-start: 1em; margin-block: 1em; padding-inline-start: 10px; margin-inline-start:0px; margin-inline-end:0px;*/
    let verihtml = `
    <div style="margin: 0 0 2px 0; padding: 5px 0 5px 6px; position: relative; z-index: -1; border-bottom: 1px solid #cbcbcb; background-color: #FBFBFB;">
    <h3 style="line-height:15px;">Veri IBE Sign in</h3><ul style="padding:2px 0 2px 0;">
    <li style="margin-right:4px;"><input id="emailSign" type="text" placeholder="email" style="height: 18px;" autocomplete="off"></li>
    <li style="margin-right:4px;"><input id="passwordSign" type="password" placeholder="Password" style="height: 18px;" autocomplete="off"></li>
    <li style="margin-right:4px;"><a class="roundTypeBtn" id="VeriSignIn"><span class="roundTypeBtnInner">サインイン&署名検証</span></a></li>
    <li><a href="https://key.project15.tk/signup" target="_blank" rel="noopener norefferer">Sign Up</a></li></ul><br><br>
    <p id="log" style="margin-top:6px;">情報を入力してサインインしてください</p>
    </div>`
    //ボタン押したらこのレイアウトが追加される
    framedom.getElementById("VeriIBS").onclick = function () {
        if (framedom.getElementById("decpage") == null) {
            page.after(decpage)
        }
        decpage.innerHTML = verihtml
        //画面リサイズ
        framedom.getElementById("viewmail-main").style.height = decpagesize(71) + "px"
        resizeflag = 2
        //署名検証場所
        framedom.getElementById("VeriSignIn").onclick = () => {
            let emailIBS = framedom.getElementById("emailSign").value
            let passwdIBS = framedom.getElementById("passwordSign").value
            if (emailIBS == "") {
                alert("IDを入力してください")
            }
            if (passwdIBS == "") {
                alert("パスワードを入力してください")
            }
            RecvByIBS()
            /*firebase.auth().signInWithEmailAndPassword(emailIBS, passwdIBS).then(res => {
                res.user.getIdToken().then(idToken => {
                    localStorage.setItem('jwt', idToken.toString())
                    RecvByIBS()
                })
            }, err => {
                //alert(err.message)
                alert('サインインに失敗しました')
            })*/
        }
    }
    //ファイル復号方法のレイアウト
    let decdiv = framedom.getElementById('viewmail-main')
    let div = framedom.createElement('div')
    div.setAttribute('class', 'deep_td b-m-mpanel')
    div.setAttribute('unselectable', 'on')
    div.setAttribute('style', 'width 150px; left: 129px; top: 61px; cursor: pointer; display: none;')
    div.setAttribute('id', 'view-dec-list')
    //<div class="deep_td b-m-mpanel" unselectable="on" style="width 150px; left: 129px; top: 61px; cursor: pointer; display: none;" id="view-dec-list">
    div.innerHTML = `
    <div id="tredec" class="b-m-item" unselectable="on" title="タイムリリース暗号">
    <div class="b-m-ibody" unselectable="on">
    <div style="margin-right:8px; overflow:hidden;">
    <nobr unselectable="on">
    <img src="../extension/images/base/ico_noicon.gif" style="vertical-align:-3px;">
    <span unselectable="on">タイムリリース暗号</span>
    </nobr></div></div></div>
    
    <div id="ibedec" class="b-m-item" unselectable="on" title="IDベース暗号">
    <div class="b-m-ibody" unselectable="on">
    <div style="margin-right:8px; overflow:hidden;">
    <nobr unselectable="on">
    <img src="../extension/images/base/ico_noicon.gif" style="vertical-align:-3px;">
    <span unselectable="on">IDベース暗号</span>
    </nobr></div></div></div>
    `

    //ファイル復号場所のレウアウト
    let page = framedom.getElementById("mbox-mail-header")
    let decpage = framedom.createElement('div')
    decpage.setAttribute('id', 'decPage')
    decpage.setAttribute('style', 'width:100%')
    decpage.setAttribute('class', 'mailBox_btn')
    /*display: block; margin-block-start: 1em; margin-block: 1em; padding-inline-start: 10px; margin-inline-start:0px; margin-inline-end:0px;*/
    let ibehtml = `
    <div style="margin: 0 0 2px 0; padding: 5px 0 46px 6px; position: relative; z-index: -1; border-bottom: 1px solid #cbcbcb; background-color: #FBFBFB; line-height:26px; cursor: pointer;">
    <h3 style="line-height:15px;">IDベースファイル復号</h3><ul style="padding:2px 0 9px 0;">
    <li style="margin-right:4px;"><input id="emailIBE" type="text" placeholder="email" style="height: 18px;" autocomplete="off"></li>
    <li style="margin-right:4px;"><input id="passwordIBE" type="password" placeholder="Password" style="height: 18px;" autocomplete="off"></li>
    <li style="margin-right:4px;"><a class="roundTypeBtn" id="ibedecset"><span class="roundTypeBtnInner">ファイルを選択</span></a></li>
    <li style="margin-right:4px;"><a class="roundTypeBtn" id="ibedecstart"><span class="roundTypeBtnInner">サインイン&復号</span></a></li>
    <li><a href="https://key.project15.tk/signup" target="_blank" rel="noopener norefferer">Sign Up</a></li><br>
    <span id="decfilename" style="line-height:15px;">ファイルが選択されていません</span>
    <input type="file" id="ibedecfile" style="display:none;">
    </div>`
    //IBE
    let trehtml = `
    <div style="margin: 0 0 2px 0; padding: 9px 0 9px 6px; position: relative; z-index: -1; border-bottom: 1px solid #cbcbcb; background-color: #FBFBFB; line-height:26px; cursor: pointer;">
    <a class="roundTypeBtn" id="tredecset"><span class="roundTypeBtnInner">ファイルを選択</span></a>
    <span id="decfilename" style="margin-left:3px;">ファイルが選択されていません</span>
    <a class="roundTypeBtn" id="tredecstart"><span class="roundTypeBtnInner">復号</span></a>
    <input type="file" id="tredecfile" style="display:none;">
    </div>`
    //TRE


    //documentがreadyしきってからじゃないとhtmlの挿入ができないっぽい
    $(document).ready(function () {
        framedom.getElementById("dec-list").onclick = function () {
            if (framedom.getElementById("view-dec-list") == null) {
                decdiv.before(div)
            }

            //復号方法の設定以外の場所をクリックしたらそのレイアウトが消えるようにする
            //なぜここが動くのか不明
            //なんかclosestで親を手当り次第探し回ってるから引っかからなかったらnullがでるっぽい？
            //console.log(framedom.getElementById("view-dec-list"))
            framedom.body.onclick = (e) => {
                if (e.target.closest("#dec-list") != null) {
                    //console.log(e.target+"view-dec-list")
                    framedom.getElementById("view-dec-list").style.display = "";
                } else if (e.target.closest("#view-dec-list") == null) {
                    //console.log(e.target+"dec-list")
                    framedom.getElementById("view-dec-list").style.display = "none";
                } else {
                }
            }

            //Mouseが上に来たときに色が変わるようにする
            //mouseoverは上に乗ったら、mouseoutは上から外れたら
            framedom.getElementById("tredec").onmouseover = function () {
                framedom.getElementById("tredec").className = 'b-m-ifocus';
            }
            framedom.getElementById("tredec").onmouseout = function () {
                framedom.getElementById("tredec").className = 'b-m-item';
            }

            //TREを押したらそっちのレイアウトが出るようにする
            framedom.getElementById("tredec").onclick = function () {
                framedom.getElementById("view-dec-list").style.display = "none";
                if (framedom.getElementById("decpage") == null) {
                    page.after(decpage)
                }
                decpage.innerHTML = trehtml
                //画面リサイズ
                framedom.getElementById("viewmail-main").style.height = decpagesize(48) + "px"
                resizeflag = 3
                //ファイル選択しようとしたらファイルを消す
                framedom.getElementById("tredecfile").onclick = () => {
                    framedom.getElementById("tredecfile").value = ""
                }
                framedom.getElementById("tredecset").onclick = function () {
                    framedom.getElementById("tredecfile").click()
                    framedom.getElementById("decfilename").innerHTML = "ファイルが選択されていません"
                }

                //復号部分
                framedom.getElementById("tredecstart").onclick = function () {
                    if (framedom.getElementById("tredecfile").value != "") {
                        //console.log(framedom.getElementById("ibedecfile").files[0])
                        //alert(framedom.getElementById("tredecfile").files[0].name + " TREstart")
                        file = framedom.getElementById("tredecfile").files[0];
                        filename = file.name
                        const TIMEfiletext=/.timeencrypted$/
                        if(!TIMEfiletext.test(filename)){
                            alert("選択ファイルが違います\n異なる暗号化方法を使用している可能性があるので確認してください。")
                            return
                        }
                        reader = new FileReader();
                        reader.readAsText(file);
                        dectre_file()
                    } else {
                        alert("ファイルが設定されていません")
                    }
                }
                //ファイル名を表示
                framedom.getElementById("tredecfile").onchange = function () {
                    framedom.getElementById("decfilename").innerHTML = framedom.getElementById("tredecfile").files[0].name;
                };

            }

            //Mouseが上に来たときに色が変わるようにする
            //mouseoverは上に乗ったら、mouseoutは上から外れたら
            framedom.getElementById("ibedec").onmouseover = function () {
                framedom.getElementById("ibedec").className = 'b-m-ifocus';
            }
            framedom.getElementById("ibedec").onmouseout = function () {
                framedom.getElementById("ibedec").className = 'b-m-item';
            }

            //IBEを押したらそっちのレイアウトが出るようにする
            framedom.getElementById("ibedec").onclick = function () {
                framedom.getElementById("view-dec-list").style.display = "none";
                if (framedom.getElementById("decpage") == null) {
                    page.after(decpage)
                }
                decpage.innerHTML = ibehtml
                //画面リサイズ
                framedom.getElementById("viewmail-main").style.height = decpagesize(73) + "px"
                resizeflag = 4
                //ファイル選択しようとしたらファイルを消す
                framedom.getElementById("ibedecfile").onclick = () => {
                    framedom.getElementById("ibedecfile").value = ""
                    framedom.getElementById("decfilename").innerHTML = "ファイルが選択されていません"
                }
                framedom.getElementById("ibedecset").onclick = function () {
                    framedom.getElementById("ibedecfile").click()
                }
                framedom.getElementById("ibedecfile").onchange = function () {
                    framedom.getElementById("decfilename").innerHTML = framedom.getElementById("ibedecfile").files[0].name
                };
                //ファイル復号部分
                framedom.getElementById("ibedecstart").onclick = () => {
                    if (framedom.getElementById("ibedecfile").value != "") {
                        let emailIBE = framedom.getElementById("emailIBE").value
                        let passwdIBE = framedom.getElementById("passwordIBE").value
                        if (emailIBE == "") {
                            alert("IDを入力してください")
                        }
                        if (passwdIBE == "") {
                            alert("パスワードを入力してください")
                        }
                        //console.log(framedom.getElementById("ibedecfile").files[0])
                        let divHeader = framedom.getElementById('viewmail_header');
                        let senddom = divHeader.children[0].children[0].children[1].children[0].children[0].children[0].innerText
                        const sendID = senddom.match(/From:.+\<(.+@fun\.ac\.jp)\>/)[1]
                        if (!isFun(sendID)) {
                            alert("送信者のemailが学内メールアドレスではありません")
                            return
                        }
                        file = framedom.getElementById("ibedecfile").files[0];
                        filename = file.name
                        const IDfiletext=/.idencrypted$/
                        if(!IDfiletext.test(filename)){
                            alert("選択ファイルが違います\n異なる暗号化方法を使用している可能性があるので確認してください。")
                            return
                        }
                        reader = new FileReader();
                        reader.readAsText(file);
                        decibe_file()
                        /*
                        firebase.auth().signInWithEmailAndPassword(emailIBE, passwdIBE).then(res => {
                            res.user.getIdToken().then(idToken => {
                                localStorage.setItem('jwt', idToken.toString())
                                file = framedom.getElementById("ibedecfile").files[0];
                                reader = new FileReader();
                                reader.readAsText(file);
                                decibe_file()
                            })
                        }, err => {
                            //alert(err.message)
                            alert("サインインに失敗しました")
                        })*/
                    } else {
                        alert("ファイルが設定されていません")
                    }
                }
            }
        }
    })
}
/*
let getJWT = () => {
    return localStorage.getItem('jwt')
}
*/
