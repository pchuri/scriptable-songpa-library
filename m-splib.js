let params = null
	
if (args.widgetParameter) {
	params = args.widgetParameter.split('/')
} else {
	params = [
	"testid",
	"testpw"
	]
}


const user_id = params[0]
const user_passwd = params[1]

let w= new WebView();
await login(w, user_id, user_passwd);
await loadStatus(w)

let name = await getName(w)
let count = await getCount(w)
let dooraeCount = await getDooraeCount(w)


let widget = new ListWidget()
let titleStack = widget.addStack()
titleStack.layoutHorizontally()
titleStack.addText(name)
titleStack.addText(" ")
titleStack.addText("도서대여")

let loanCountStack = widget.addStack()
loanCountStack.layoutHorizontally()
loanCountStack.addText("대출중")
loanCountStack.addText(": ")
let loanCount = count - dooraeCount
t = loanCountStack.addText(loanCount.toString())
t.font = Font.boldRoundedSystemFont(19)
loanCountStack.addText("권")

let dooraeStack = widget.addStack()
dooraeStack.layoutHorizontally()
dooraeStack.addText("책솔이")
dooraeStack.addText(": ")
dooraeStack.addText(dooraeCount)
dooraeStack.addText("권")

widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 10)
Script.setWidget(widget)


if (!config.runsInWidget ){			
	await w.loadURL('https://www.splib.or.kr/mobile')
	await w.present(true)
// 	await widget.presentSmall()
}


Script.complete();

async function login(webView, user_id, user_passwd)
{

	await webView.loadURL('https://www.splib.or.kr/mobile/mLogout.do')		
	await webView.waitForLoad()
	
	await webView.loadURL('https://www.splib.or.kr/mLoginForm.do')
	await webView.waitForLoad()
	
	let code = "$('form[name=login_form]').find('input[name=user_id]').val('" + user_id + "');"
		+ "$('form[name=login_form]').find('input[name=user_pwd]').val('" + user_passwd + "');"
		+ "loginChk();"

	await 	webView.evaluateJavaScript(code, false)		
	await webView.waitForLoad()
}

async function loadStatus(webView) {
	await webView.loadURL("https://www.splib.or.kr/kolaseek/mylib/loan/loanStatusList.do")
	await webView.waitForLoad()
}

async function getName(w) {
	 return await w.evaluateJavaScript("$('.title .name').text()", false)
}

async function getCount(w) {
	return await w.evaluateJavaScript("$('.svc01 .num').text().replace('(연체중)','')", false)
}

async function getDooraeCount(w) {
	await w.loadURL('https://www.splib.or.kr/kolaseek/mylib/doorae/dooraeList.do')
	await w.waitForLoad()
	
	await w.evaluateJavaScript("$('#searchStatus').val('0014'); $('#searchBtn').click(); 1", false)	
	await w.waitForLoad()
		
	return await w.evaluateJavaScript("$('.info .themeFC').text()", false)
}