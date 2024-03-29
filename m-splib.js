let params = ["id", "pw"]
if (args.widgetParameter) {
    params = args.widgetParameter.split('/')
}

const SPLIB_URL = "https://www.splib.or.kr"
const LOGOUT_URL = SPLIB_URL + "/intro/program/memberLogout.do"
const INDEX_URL = SPLIB_URL + "/intro/index.do"
const LOAN_URL = SPLIB_URL + "/intro/program/mypage/loanStatusList.do"

const loadURL = async (webView, url) => {
    await webView.loadURL(url)
    await webView.waitForLoad()
}

const evalScriptAndWait = async (web, code, useCallback) => {
    await web.evaluateJavaScript(code, useCallback)
    await web.waitForLoad()
}

const getName = async (w) => {
    return await w.evaluateJavaScript("$('.centerItem strong').text()", false)
}

const getCount = async (w) => {
    return await w.evaluateJavaScript("$('.sortTopWrap .lt .resultTxt strong').text()", false)
}

const getDooraeCount = async (w) => {
    return await w.evaluateJavaScript("$(\"span\", $('a:contains(\"책솔이 \")')).text()", false)
}

const getBookList = (w) => {
    let code = `
books = []
items = []
$(".myArticleWrap.inputType .myArticle-list .infoBox").each(function(index, item) {
    bookTitle = $(item).children(".title")[0].innerText
    if (bookTitle.indexOf("[부록]") < 0) {
        libraryName = $(item).find("strong")[0].innerText
        items.push(libraryName)
	     books.push(items)
	     items = []
    }
})

books
`
    return  w.evaluateJavaScript(code, false)
}

const movePageOfBookList = async (w, num) => {
    let code = 'fnList(' + num + ')';
    await w.evaluateJavaScript(code, false)
    await w.waitForLoad()
}

const login = async (web, user_id, user_passwd) => {
    await loadURL(web, LOGOUT_URL)
    await loadURL(web, INDEX_URL)

    let code = "$('#userId').val('" + user_id + "');"
        + "$('#password').val('" + user_passwd + "');"
        + "$('#loginBtn').click(); 1"
    await evalScriptAndWait(web, code, false)
}

const user_id = params[0]
const user_passwd = params[1]

let w = new WebView();
await login(w, user_id, user_passwd);
let name = await getName(w)
let dooraeCount = await getDooraeCount(w)
await loadURL(w, LOAN_URL)

let count = await getCount(w)
let books = await getBookList(w)//
// let dooraeCount = await getDooraeCount(w)


let page = 1
status = {
    "책솔이": dooraeCount,
}
while (count > 0) {
    for (let i in books) {
        let item = books[i]
        let library = item[0]
        if (library in status) {
            status[library] = status[library] + 1
        } else {
            status[library] = 1
        }
    }
    /*
        if (count > 10) {
            page = page + 1
            await movePageOfBookList(w, page)
            books = await getBookList(w)
        }
    */
    count = count - 10
}

let widget = new ListWidget()
let titleStack = widget.addStack()
titleStack.layoutHorizontally()
titleStack.addText(name)
titleStack.addText(" ")
titleStack.addText("도서관")

const lineColor = new Color("58595B", 0.2);
let line = widget.addStack();
line.layoutHorizontally();
line.size = new Size(0, 1);
line.borderWidth = 0.5;
line.borderColor = lineColor;
line.addSpacer();
widget.addSpacer(2);

let font = Font.systemFont(17)
for(let i in status) {
    let stack = widget.addStack()
    stack.font = font
    stack.layoutHorizontally()
    stack.addText(i.replace("도서관","").replace("송파","")).font = font
    stack.addText(": ").font = font
    let c = status[i]
    stack.addText(c.toString()).font = Font.boldMonospacedSystemFont(18)
}

widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 10)
Script.setWidget(widget)


if (!config.runsInWidget ){
// 	await w.loadURL('https://www.splib.or.kr/intro/index.do')//
// 	await w.present(true)
    await widget.presentSmall()
}


Script.complete();
