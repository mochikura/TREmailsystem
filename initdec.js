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
        console.log("VeriIBS")
    }
    //console.log(framedom)
    let div = framedom.getElementById('mbox-btn-list')
    //console.log(div)
    let li = framedom.createElement('li')
    li.innerHTML = `
    <li id="VeriIBS"><a class="roundTypeBtn"><span class="roundTypeBtnInner">
    IDベース署名検証
    </span></a></li>
    <li><select id="selectEnc">
    <option value="select">選択してください</option>
    <option value="tre">タイムリリース暗号</option>
    <option value="ibe">IDベース暗号</option>
    </select></li>
    `
    /*
    li.onclick = RecvByIBS
    let a = framedom.createElement('a')
    a.setAttribute('class', 'roundTypeBtn')
    let span = framedom.createElement('span')
    span.setAttribute('class', 'roundTypeBtnInner')
    span.innerText = "IDベース署名検証"
    a.appendChild(span)
    li.appendChild(a)
    */
    div.append(li)
    
    framedom.getElementById("VeriIBS").onclick = RecvByIBS
}

let getJWT = () => {
    return localStorage.getItem('jwt')
}
