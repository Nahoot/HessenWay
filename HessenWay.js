// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: subway; share-sheet-inputs: plain-text;
/* eslint-disable require-await */
/* eslint-disable no-undef */

// Version 1.0.0
const baseURL = 'https://www.rmv.de'
const tripURL = '/hapi/departureBoard?lang=en&format=json&accessId=a48ad8fd-4b85-4b3d-917c-e759d6b46a5f'

let extId = args.widgetParameter
// console.log("ExtId:" + extId)
if(extId == null)
  extId = "3002930" // flughafen
//   extId = "3001830" // Niederrad
// originExtId=3002930&


const resp = await get({  
  url: baseURL + tripURL + '&extId=' + extId
})

const w = new ListWidget()
w.setPadding(10, 10, 10, 10)
w.backgroundColor = new Color("#222222") 
// const t = new UITable()

let titleStack = w.addStack()
titleStack.centerAlignContent()
titleStack.addSpacer()
let titleText = titleStack.addText(resp.Departure[0].stop)
titleText.centerAlignText()
titleText.font = Font.boldSystemFont(14)
titleText = Color.white()
titleStack.addSpacer()

console.log("Request id: "+resp.requestId)
let departures = resp.Departure
// console.log(departures)

var BreakException = {}
let resultNumber = 10
try {
departures.forEach(function(obj){
   console.log(obj.name)      
  let entryStack = w.addStack()
  entryStack.layoutHorizontally()
  
  let img = SFSymbol.named("bus.fill")
  if (obj.Product.catOut.trim() == "Tram")
    img = SFSymbol.named("tram.circle")
  if (obj.Product.catOut.trim() == "S")
    img = SFSymbol.named("tram")
  if (obj.Product.catOut.trim() == "RE")
    img = SFSymbol.named("tram.fill")
  img.applyThinWeight()
  const bus = entryStack.addImage(img.image)
  
  bus.tintColor = Color.white()
  bus.imageSize = new Size(10, 10)
  bus.leftAlignImage()
  entryStack.addSpacer(10)
//   let date = entryStack.addDate(formatTime(obj.time))
//   date.applyTimeStyle()
//   date.font = Font.systemFont(10)
//   entryStack.addSpacer(10)
  
  let rtTime = obj.time
  if ("rtTime" in obj){
    rtTime = obj.rtTime
  }
  let date = entryStack.addDate(formatTime(rtTime))
  date.applyTimeStyle()
  date.font = Font.thinMonospacedSystemFont(10)
  entryStack.addSpacer(10)
  
  
  let train = entryStack.addText(obj.name.trim().padEnd(6, String.fromCodePoint(0x2007)).padEnd(7, ' '))  
  train.font = Font.thinMonospacedSystemFont(10)
  entryStack.addSpacer(10)
  
  
  let direction = entryStack.addText(obj.direction.trim())
  direction.font = Font.thinMonospacedSystemFont(10)
  entryStack.addSpacer()
//   train.textColor = Color.white()
//   train.font = Font.systemFont(10)
  
//   let time = formatTime(obj.time)
//   let rttime = formatTime(obj.rtTime)
//   train = w.addText(getTime(time) +" "+ getTime(rttime) +" "+ obj.name.trim() +" "+ obj.direction.trim())  
  
  
  if (!--resultNumber)
    throw BreakException;
//   const r = new UITableRow()
//   const name = UITableCell.text(obj.name, "subtitle")
//   name.titleColor = Color.white()
//   r.addCell(name)
//   const direction = UITableCell.text(obj.direction, "subtitle")
//   direction.titleColor = Color.white()
//   r.addCell(direction)
//   t.addRow(r)
})
} catch (e){
  if (e !== BreakException) throw e
}
// for(let depart in departures){
//   console.log("Depart: "+depart)
//   const stack =w.addStack()
//   stack.centerAlignContent()
//   const img= await loadImage("https://www.ecb.europa.eu/shared/img/flags/"+rate+".gif")
//   const imgw =stack.addImage(img)
//   imgw.imageSize=new Size(20, 20)
//   stack.addSpacer(10)  
//   const name = stack.addText(depart.name)
//   name.textColor = Color.white()
//   stack.addSpacer(10)
//   const textw = stack.addText(depart.direction)
//   textw.textColor = Color.white()
//   stack.addSpacer(5)
// }



// const downloadAlert = new Alert()
// downloadAlert.message = resp.Departure[0].name
// downloadAlert.addAction('Yes')
// downloadAlert.addCancelAction('No')
// 
// if (await downloadAlert.presentAlert() === 0) {
//       }

Script.setWidget(w)
Script.complete()
// w.presentSmall()
w.presentMedium()
// w.presentLarge()

function getTime(time){
  let sTime = time.getHours().toString()+ ":" + time.getMinutes().toString()
  console.log("Time: " +sTime)
  return sTime
}

function formatTime(sTime){
  const arrTime = sTime.split(':')
  let time = new Date()
  time.setHours(arrTime[0], arrTime[1])
  return time
}

async function get(opts) {
      const request = new Request(opts.url)
      request.headers = {
        ...opts.headers,
        ...this.defaultHeaders
      }
      var result=await request.loadJSON()
//       console.log(result)
      return result
    
}