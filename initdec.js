let initFirebase = () => {
    const config = {
        apiKey: "AIzaSyCUrozEOMGg8d-ctz_xDnIWPIGNbZAuPTo",
        databaseURL: "https://ibs-auth-d749c.firebaseio.com",
        storageBucket: "ibs-auth-d749c.appspot.com",
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
    let _htm = document.getElementsByTagName('html')
    decdom = _htm[0].children[1].children[0].contentWindow.document
    //console.log(decdom)
    //frameが読み込まれるたびにこのinitdecを実行する必要あり
    obs = new MutationObserver(() => { initDec() })
    let config = { childList: true }
    obs.observe(decdom.getElementById("contents"), config)
}

let initDec = () => {
    iframe = decdom.getElementById('viewmail-iframe')
    //console.log(iframe);
    iframe.onload = () => {
        framedom = iframe.contentWindow.document;
        initDecUI();
        //initFirebase();
    }
    obs.disconnect()
}

let resizeflag = 0;
//レイアウト調整用
function decpagesize(decdomsize) {
    console.log(iframe)
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
        alert("Veristart")
    }
    //ボタン追加
    let btndiv = framedom.getElementById('mbox-btn-list')
    let li = framedom.createElement('li')
    li.innerHTML = `
    <li id="VeriIBS" class="action_mail bar_long"><a class="roundTypeBtn"><span class="roundTypeBtnInner">
    IDベース署名検証
    </span></a></li>
    <li id="dec-list" class="action_mail"><a class="roundTypeBtn"><span class="roundTypeBtnInner"><span class="ico_action deep_td">
    ファイル暗号化
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
    <li style="margin-right:4px;"><input id="emailIBS" type="text" placeholder="email" style="height: 18px;" autocomplete="off"></li>
    <li style="margin-right:4px;"><input id="passwordIBS" type="password" placeholder="Password" style="height: 18px;" autocomplete="off"></li>
    <li style="margin-right:4px;"><a class="roundTypeBtn" id="VeriSignIn"><span class="roundTypeBtnInner">署名検証&サインイン</span></a></li>
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
            RecvByIBS()
            console.log("Receive")
            /*firebase.auth().signInWithEmailAndPassword(email, passwd).then(res => {
                res.user.getIdToken().then(idToken => {
                    localStorage.setItem('jwt', idToken.toString())
                    RecvByIBS()
                })
            }, err => {
                //alert(err.message)
                alert('Failed sign in')
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
    <h3 style="line-height:15px;">File IBE Sign in</h3><ul style="padding:2px 0 9px 0;">
    <li style="margin-right:4px;"><input id="emailIBS" type="text" placeholder="email" style="height: 18px;" autocomplete="off"></li>
    <li style="margin-right:4px;"><input id="passwordIBS" type="password" placeholder="Password" style="height: 18px;" autocomplete="off"></li>
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
                        alert(framedom.getElementById("tredecfile").files[0].name + " TREstart")
                        let file = framedom.getElementById("tredecfile").files[0];
                        reader = new FileReader();
                        reader.readAsText(file);
                        dectre_file()
                        /*
                        firebase.auth().signInWithEmailAndPassword(email, passwd).then(res => {
                            res.user.getIdToken().then(idToken => {
                                localStorage.setItem('jwt', idToken.toString())
                                alert('Successful get token')
                            })
                        }, err => {
                            //alert(err.message)
                            alert('Failed sign in')
                        })*/
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
                    framedom.getElementById("decfilename").innerHTML = framedom.getElementById("ibedecfile").files[0].name;
                };
                //ファイル復号部分
                framedom.getElementById("ibedecstart").onclick = () => {
                    if (framedom.getElementById("ibedecfile").value != "") {
                        //console.log(framedom.getElementById("ibedecfile").files[0])
                        alert(framedom.getElementById("ibedecfile").files[0].name + " IBEstart")
                        file = framedom.getElementById("ibedecfile").files[0];
                        reader = new FileReader();
                        reader.readAsText(file);
                        decibe_file()
                        /*
                        firebase.auth().signInWithEmailAndPassword(email, passwd).then(res => {
                            res.user.getIdToken().then(idToken => {
                                localStorage.setItem('jwt', idToken.toString())
                                alert('Successful get token')
                            })
                        }, err => {
                            //alert(err.message)
                            alert('Failed sign in')
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