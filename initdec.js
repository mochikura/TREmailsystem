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
window.onload = () => {
    mcl.init(0).then(() => {
    })
    let _htm = document.getElementsByTagName('html')
    decdom = _htm[0].children[1].children[0].contentWindow.document
    //console.log(decdom)
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
    }
    obs.disconnect()
}
let initDecUI = () => {
    let RecvByIBS = () => {
        console.log(framedom)
    }
    //console.log(framedom)
    let btndiv = framedom.getElementById('mbox-btn-list')
    //console.log(div)
    let li = framedom.createElement('li')
    li.innerHTML = `
    <li id="VeriIBS" class="action_mail bar_long"><a class="roundTypeBtn"><span class="roundTypeBtnInner">
    IDベース署名検証
    </span></a></li>
    <li id="dec-list" class="action_mail"><a class="roundTypeBtn"><span class="roundTypeBtnInner"><span class="ico_action deep_td">
    選択してください
    </span></span></a></li>
    `
    btndiv.append(li)
    framedom.getElementById("VeriIBS").onclick = RecvByIBS

    let decdiv = framedom.getElementById('viewmail-main')
    //console.log(decdiv)
    let div = framedom.createElement('div')
    div.setAttribute('class', 'deep_td b-m-mpanel')
    div.setAttribute('unselectable', 'on')
    div.setAttribute('style', 'width 150px; left: 129px; top: 61px; cursor: pointer; display: none;')
    div.setAttribute('id', 'view-dec-list')
    //<div class="deep_td b-m-mpanel" unselectable="on" style="width 150px; left: 129px; top: 61px; cursor: pointer; display: none;" id="view-dec-list">
    div.innerHTML = `
    <div id="tredec" class="b-m-item !important" unselectable="on" title="タイムリリース暗号">
    <div class="b-m-ibody" unselectable="on">
    <div style="margin-right:8px; orverflow:hidden;">
    <nobr unselectable="on">
    <img src="../extension/images/base/ico_noicon.gif" style="vertical-align:-3px;">
    <span unselectable="on">タイムリリース暗号</span>
    </nobr></div></div></div>
    <div id="ibedec" class="b-m-item" unselectable="on" title="IDベース暗号">
    <div class="b-m-ibody" unselectable="on">
    <div style="margin-right:8px; orverflow:hidden;">
    <nobr unselectable="on">
    <img src="../extension/images/base/ico_noicon.gif" style="vertical-align:-3px;">
    <span unselectable="on">IDベース暗号</span>
    </nobr></div></div></div>
    `

    let page = framedom.getElementById("mbox-mail-header")
    let decpage = framedom.createElement('div')
    decpage.setAttribute('id', 'decPage')
    decpage.setAttribute('style', 'width:100%')
    decpage.setAttribute('class', 'mailBox_btn')
    /*display: block; margin-block-start: 1em; margin-block: 1em; padding-inline-start: 10px; margin-inline-start:0px; margin-inline-end:0px;*/
    let ibehtml = `
    <div style="margin: 0 0 2px 0; padding: 9px 0 5px 6px; position: relative; z-index: -1; border-bottom: 1px solid #cbcbcb; background-color: #FBFBFB;">
    <h3>Sign in</h3>
    <input id="emailIBS" type="text" placeholder="email">
    <input id="passwordIBS" type="password" placeholder="Password">
    <input id="SignIn" type="button" value="Signin">
    <a href="https://key.project15.tk/signup" target="_blank" rel="noopener norefferer">Sign Up</a>
    <p id="log"></p><br>
    </div>`

    let trehtml=`
    <div style="margin: 0 0 2px 0; padding: 9px 0 9px 6px; position: relative; z-index: -1; border-bottom: 1px solid #cbcbcb; background-color: #FBFBFB; line-height:26px; cursor: pointer;">
    <a class="roundTypeBtn" id="tredecset"><span class="roundTypeBtnInner">ファイルを選択</span></a>
    <span id="decfilename" style="margin-left:3px;">&nbsp;</span>
    <a class="roundTypeBtn" id="tredecstart"><span class="roundTypeBtnInner">復号</span></a>
    <input type="file" id="tredecfile" style="display:none;">
    </div>`
     /*<input type="file" id="dectrefile">*/

    //documentがreadyしきってからじゃないとだめかも？
    //console.log(framedom.getElementById("view-dec-list"))
    $(document).ready(function () {
        framedom.getElementById("dec-list").onclick = function () {
            if (framedom.getElementById("view-dec-list") == null) {
                decdiv.before(div)
            }
            //クリック時に追加じゃないと後でこのHTMLに追加する処理が追加できない
            //console.log(framedom.getElementById("view-dec-list"))
            framedom.getElementById("view-dec-list").style.display = "";

            //Mouseが上に来たときに色が変わるようにしたい
            framedom.getElementById("tredec").onMouseOver = function () {
                console.log("OK")
                document.getElementById("tredec").className = 'b-m-ifocus !important';
                document.getElementById("ibedec").className = 'b-m-item !important';
            }
            //console.log(framedom.getElementById("tredec"))

            //クリックしたら消える
            framedom.getElementById("tredec").onclick = function () {
                framedom.getElementById("view-dec-list").style.display = "none";
                if (framedom.getElementById("decpage") == null) {
                    //page.style.margin="0 0 9px 0";
                    page.after(decpage)
                }
                decpage.innerHTML=trehtml
                framedom.getElementById("tredecfile").onclick=()=>{
                    framedom.getElementById("tredecfile").value=""
                }
                framedom.getElementById("tredecset").onclick=function(){
                    framedom.getElementById("tredecfile").click()
                    
                }
                framedom.getElementById("tredecstart").onclick=function(){
                    console.log("TREstart")
                }
                framedom.getElementById("tredecfile").onchange=function(){
                    framedom.getElementById("decfilename").innerHTML = framedom.getElementById("tredecfile").files[0].name;
                };
                
            }

            //Mouseが上に来たときに色が変わるようにしたい
            framedom.getElementById("ibedec").onMouseOver = function () {
                document.getElementById("tredec").className = 'b-m-item';
                document.getElementById("ibedec").className = 'b-m-ifocus';
            }

            //クリックしたら消える
            framedom.getElementById("ibedec").onclick = function () {
                framedom.getElementById("view-dec-list").style.display = "none";
                if (framedom.getElementById("decpage") == null) {
                    //page.style.margin="0 0 9px 0";
                    page.after(decpage)
                }
                decpage.innerHTML=ibehtml
            }
            //console.log("check")
            //動かねぇ
            //documentのdeclist以外のどこかをクリックしたらdeclistが消える
            $(document).onclick = (e) => {
                console.log(e)
                if (!e.target.closest('#dec-list').length) {
                    framedom.getElementById("dec-list").style.display = "none";
                } else {
                    console.log("click");
                }
            };
        }
    })
}

let getJWT = () => {
    return localStorage.getItem('jwt')
}
