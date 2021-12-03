let params = null
	
if (args.widgetParameter) {
	params = args.widgetParameter.split('/')
} else {
	params = [
	"testId",
	"testPassword"
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
	await w.loadURL('https://www.splib.or.kr/intro/index.do')
	await w.present(true)
//	await widget.presentSmall()
}


Script.complete();

async function login(webView, user_id, user_passwd)
{

	await webView.loadURL('https://www.splib.or.kr/intro/program/memberLogout.do')		
	await webView.waitForLoad()
	
	await webView.loadURL('https://www.splib.or.kr/intro/index.do')
	await webView.waitForLoad()
	
	let code = "$('#userId').val('" + user_id + "');"
		+ "$('#password').val('" + user_passwd + "');"
		+ "$('#loginBtn').click(); 1"

	await 	webView.evaluateJavaScript(code, false)		
	await webView.waitForLoad()
}

async function loadStatus(webView) {
	await webView.loadURL("https://www.splib.or.kr/intro/program/mypage/loanStatusList.do")
	await webView.waitForLoad()
}

async function getName(w) {
	 return await w.evaluateJavaScript("$('.title .name').text()", false)
}

async function getCount(w) {
	return await w.evaluateJavaScript("$('.sortTopWrap .lt .resultTxt strong').text()", false)
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
$(".myArticleWrap.inputType .myArticle-list .infoBox .info strong").each(function(index, item) {
	 items.push(item.innerText)
	 books.push(items)
	 items = []
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
