// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: subway; share-sheet-inputs: plain-text;
/* eslint-disable require-await */
/* eslint-disable no-undef */

// Version 1.1.0

// Instructions
// When adding a widget to the screen add the station you are looking for as a parameter.
// In order to know the id of the station you are looking for follow the instructions here: https://github.com/Nahoot/HessenWay

// ---------------------------------------------------------
// THIS IS THE PART THAT SHOULD BE EDITED

// Access key to get information from RMV.
// In case you don't have one request one here: https://opendata.rmv.de/site/anmeldeseite.html
// It might take a few hours for you to receive your key in the email. 
// const accesskey = "a48ad8fd-4b85-4b3d-917c-e759d6b46a5f";

// BELOW THIS POINT THE SCRIPT SHOULD NOT BE CHANGED
// ---------------------------------------------------------

// Init constants

// Layout configuration
const widgetBackgroundColor = "#222222";
const widgetPadding = 10;
const titleTextSize = 14;
const bodyTextSize = 10;

const small = 0; medium = 1; large = 2;
const numberOfLines = [5, 10, 20];

const baseURL = 'https://www.rmv.de';
const departuresURL = '/hapi/departureBoard?lang=en&format=json&accessId=';

const rmvAccessKey = 'hessenway.rmv.api.key';

// Default station to look for.
// The station's id should be passed as parameter in the widget. If it doesn't it will default to the value below
let extId = args.widgetParameter
// console.log("ExtId:" + extId)
if(extId == null)
  extId = "3000010" // Hauptbahnhof
//  extId = "3002930" // flughafen
//  extId = "3001830" // Niederrad

// ---------------------------------------------------------
// Base functions

function getRMVDepartures(){
  const result = {};

  const resp = await get({  
    url: baseURL + departuresURL + Keychain.get(rmvAccessKey) + '&extId=' + extId
  })
  console.log("Request id: "+resp.requestId)
  result.origin = departures[0].stop;
  result.departures = resp.Departure;

  return result;
}

function getTransportationsSortedByTime(departures){
  let transports = [];
  departures.forEach(function(obj){
    //console.log(obj.name)
    const transport = {};

    // Get tranport type (bus, train, subway, etc..)
    transport.category = obj.Product.catOut.trim();
    // 2DO: Replace the text with the image directly
   
    // Get transport time. Always gets scheduled time. If the transport is delayed and there is "real time" use it instead
    // In the end turn the time string into a date object
    let time = obj.time;
    if ("rtTime" in obj){
      time = obj.rtTime
    }
    transport.time = formatTime(time);
    
    // Gets the line code (ex: S5, U3, RE70). Adds empty spaces for visualization in the table.
    // 2DO: Remove the spaces from here and move them to "printing" code
    transport.name = obj.name.trim().padEnd(6, String.fromCodePoint(0x2007)).padEnd(7, ' ')
   
    // Gets the transport final destination
    transport.destination = obj.direction.trim();
    
    transports.push(transport);
  })
  return transports.sort(function (a, b){
    if((a.time.getTime() === b.time.getTime()) || (a.time.getTime() < b.time.getTime())){
      return a;
    }
    return b;
  })
}

function printWidgetHeader(widget, origin){
  widget.setPadding(widgetPadding, widgetPadding, widgetPadding, widgetPadding)
  widget.backgroundColor = new Color(widgetBackgroundColor) 
  
  let titleStack = widget.addStack()
  titleStack.centerAlignContent()
  titleStack.addSpacer()
  let titleText = titleStack.addText(origin)
  titleText.centerAlignText()
  titleText.font = Font.boldSystemFont(titleTextSize)
  titleText = Color.white()
  titleStack.addSpacer()
}

function printWidgetBody(widget, departures, widgetSize = medium){
  // console.log(departures)

  var BreakException = {}
  let resultNumber = numberOfLines[widgetSize];
  try {
    departures.forEach(function(obj){
      console.log(obj.name)      
      let entryStack = widget.addStack()
      entryStack.layoutHorizontally()
    
      let cat = obj.category;
      let img = SFSymbol.named("bus.fill")
      if (cat == "Tram")
        img = SFSymbol.named("tram.circle")
      if (cat == "S")
        img = SFSymbol.named("tram")
      if (cat == "RE")
        img = SFSymbol.named("tram.fill")
      img.applyThinWeight()
      const bus = entryStack.addImage(img.image)
      
      bus.tintColor = Color.white()
      bus.imageSize = new Size(bodyTextSize, bodyTextSize)
      bus.leftAlignImage()
      entryStack.addSpacer(10)
    
      let date = entryStack.addDate(obj.time)
      date.applyTimeStyle()
      date.font = Font.thinMonospacedSystemFont(bodyTextSize)
      entryStack.addSpacer(10)
    
      let train = obj.name;
      train.font = Font.thinMonospacedSystemFont(bodyTextSize)
      entryStack.addSpacer(10)
        
      let direction = entryStack.addText(obj.destination)
      direction.font = Font.thinMonospacedSystemFont(bodyTextSize)
      entryStack.addSpacer()  
    
      if (!--resultNumber)
        throw BreakException;
    }
    )
  } catch (e){
    if (e !== BreakException) throw e
  }
}
// ---------------------------------------------------------

// Helper functions
function formatTime(sTime){
  const arrTime = sTime.split(':')
  let time = new Date()
  time.setHours(arrTime[0], arrTime[1], 0, 0)
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

async function promptForKey(){
  let alert = new Alert();
  alert.title = "API key";
  alert.message = "Paste below the API key you have received from RMV.";
  alert.addTextField("d9z9zz50-dd9d-459d-b0f8-d514e455d386");
  alert.addAction("OK");
  alert.addCancelAction("Cancel");
  alert.addDestructiveAction("Delete key!")
  let idx = await alert.present();
  console.log("Index: " + idx)
  if(idx == 0){
    console.log("Add key");
    Keychain.set(rmvAccessKey, alert.textFieldValue(0));
  }
  if(idx == 1){
    console.log("Remove key");
    Keychain.remove(rmvAccessKey);
  }
}

async function showWidgetPreview(){
  let alert = new Alert();
  alert.title = "Widget size";
  //alert.addTextField("3000010", "3000010");
  alert.addAction("Small");
  alert.addAction("Medium");
  alert.addAction("Large");
  alert.addCancelAction("Back");
  let idx = await alert.present();
  switch(idx){
    case 0:
      widget.presentSmall();
      break;
    case 1:
      let result = getRMVDepartures();
      let transports = getTransportationsSortedByTime(result.departures);
      printWidgetHeader(widget, result.origin);
      printWidgetBody(widget, transports);
      widget.presentMedium();
      break;
    case 2:
      widget.presentLarge();
      break;
    default:
      break;
  }
}
// Script flow

// Setup parameters

// 2DO: If running in widget get widget size
// if not get it from configuration 
// Use this for the visualization and presentation at the end
// config.widgetFamily == "small" || "medium" || "large" || "null"

const widget = new ListWidget();
Script.setWidget(widget)

if(config.runsInApp){
  let idx = 0;
  do{
    let alert = new Alert();
    alert.title = "Widget options";
    alert.addAction("Enter API key");
    alert.addAction("Show widget preview");
    //alert.addAction("Update widget");
    alert.addCancelAction("Exit menu");
    idx = await alert.present();
    console.log("Selected option: " + idx);
    switch(idx){
      case 0:
        await promptForKey();
        break;
      case 1:
        await showWidgetPreview();
        break;
      case 2:
        // 2DO: Update widget automatically
        break;
      default:
        break;
    }
  }while(idx != -1);
}
else{
  // 2DO: checks if key is in keychain
  // 2DO: makes HTTP request
  // 2DO: Builds widget

  if(!Keychain.contains(rmvAccessKey)){
    // Generate Widget visualization    
    widget.setPadding(widgetPadding, widgetPadding, widgetPadding, widgetPadding)
    widget.backgroundColor = new Color(widgetBackgroundColor) 
    
    let titleText = widget.addText("The key was not found. Please follow the instructions to obtain a key from RMV and add it in the configuration.")
    titleText.centerAlignText()
    titleText.font = Font.boldSystemFont(titleTextSize)
    titleText.textColor = Color.red()    
  }else{
    // Make call to RMV
    const resp = await get({  
      url: baseURL + departuresURL + Keychain.get(rmvAccessKey) + '&extId=' + extId
    })
    console.log("Request id: "+resp.requestId)
    const departures = resp.Departure;

    // Get origin
    const origin = departures[0].stop;
    // Get Departures
    // Turn result into a sorted array of local objects
    let transports = getTransportationsSortedByTime(departures);
    //console.log(transports);

    // Generate Widget visualization
    //const widget = new ListWidget();
    printWidgetHeader(widget, origin);
    printWidgetBody(widget, transports);
  }
}

Script.complete()