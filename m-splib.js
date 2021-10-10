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

let w = new WebView();
await login(w, user_id, user_passwd);
await loadStatus(w)

let name = await getName(w)
let count = await getCount(w)
let books = await getBookList(w)// 
// let dooraeCount = await getDooraeCount(w)


let page = 1
status = {}
while (count > 0) {
	for (let i in books) {
		let item = books[i]
		let library = item[2]
		if (library in status) {
			status[library] = status[library] + 1
		} else {
			status[library] = 1
		}
	}

	if (count > 10) {
		page = page + 1
		await movePageOfBookList(w, page)
		books = await getBookList(w)
	}
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
	await w.loadURL('https://www.splib.or.kr/mobile')
// 	await w.present(true)
	await widget.presentSmall()
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

function getBookList(w) {
	let code = `
books = []
items = []
$(".boardWrap.mobileShow .board-list tbody tr").each(function(index, item) {
    col = $("th", item).text()
    if (col === "등록번호" || col === "서명" || col === "소장도서관") {
        items.push($("td", item).text())
    }
    if (col === "상태") {
        items.push($("td span span", item).text());	
		books.push(items)
		items = []
    }
})

books
`
 return  w.evaluateJavaScript(code, false)
}

async function movePageOfBookList(w, num) {
	let code = 'fnList(' + num + ')';
	await w.evaluateJavaScript(code, false)
	await w.waitForLoad()
}
