function _include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
function _getColumn(ws,tittle){
  var headers = ws.getRange(1,1,1,ws.getLastColumn()).getValues();
  var position = headers[0].indexOf(tittle);
  return position
}
function getFoliosFromSheets(ws){
  if (ws = 'ws_info'){
    var foliosArray = ws_info.getRange("A2:A").getDisplayValues().filter(String);
  }
  if (foliosArray.length == 0){
    return 0
  }
  var foliosString = "{"
    foliosArray.forEach(function(f,i,array){
      if (i === array.length - 1){
        foliosString = foliosString + '"'+f+'"'+":null}"
      }else {
        foliosString = foliosString + '"'+f+'"'+":null,"
      }
  })
  return foliosString;
}

function ultimaFila(ws,col) {
  var colA = ws.getRange(col+"1:"+col).getValues();
  return colA.filter(String).length;
}
function ultimaFilaQuery(ws,col) {
  var colA = ws.getRange(col+"6:"+col).getValues();
  return colA.filter(String).length;
}
function columnToLetter(column){
  if (column ==""){return};
  var temp, letter = '';
  var all = "";
  if (column.length > 1){
  column.forEach(function(c){
    while (c > 0)
    {
      temp = (c - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      c = (c - temp - 1) / 26;
    }
    if (all == ""){
      all = letter
    } else {
      all = all +"," + letter
    }
    temp, letter = '';
  });
  } else {
    while (column > 0)
    {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter
  }
  return all;
}
function getColumn(ws,tittle){
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var ws = ss.getSheetByName(ws)
  var headers = ws.getRange(1,1,1,ws.getLastColumn()).getValues();
  var tittleList = tittle.split(",")
  var res = []
  tittleList.forEach(function(t){
    var position = headers[0].indexOf(t);
    if(position >= 0){
      res.push(position+1)
    }
  });
  return res
}
function getDisplayColumn(ws,tittle){
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var ws = ss.getSheetByName(ws)
  var headers = ws.getRange(6,2,1,ws.getLastColumn()).getDisplayValues();
  var headersTrim = [] 
  headers[0].forEach(h => headersTrim.push(String(h).trim())) 
  var tittleList = String(tittle).split(",")
  var res = []
  tittleList.forEach(function(t){
    var position = headersTrim.indexOf(t);
    if(position >= 0){
      res.push(position+1)
    }
  });
  return res
}
function getColumnByList(ws,tittle){
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var ws = ss.getSheetByName(ws)
  var headers = ws.getRange(1,1,1,ws.getLastColumn()).getValues();
  var res = []
  tittle = tittle.filter(String)
  tittle.forEach(function(t){
    var position = headers[0].indexOf(String(t));
    if(position >= 0){
      res.push(position+1)
    }
  });
  return res
}
function columnToLetterByList(column){
  var temp, letter = '';
  var all = "";
  if (column.length > 1){
  column.forEach(function(c){
    while (c > 0)
    {
      temp = (c - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      c = (c - temp - 1) / 26;
    }
    if (all == ""){
      all = letter
    } else {
      all = all +"," + letter
    }
    temp, letter = '';
  });
  } else {
    while (column > 0)
    {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter
  }
  return all;
}
function _sendErrorNotification(perfil,func,errorMessage) {
 var recipientEmail = 'petbajio@gmail.com,juanmanuelvillacis@gmail.com'; // Change to the email address where you want to send the error notification
  var subject = 'Notificación de Error en la función '+func;
  var message = 'Un error ocurrió al usuario '+perfil+ ' en '+func+ ':\n\n' + errorMessage;
  // Send the error notification email
  MailApp.sendEmail({
    to: recipientEmail,
    subject: subject,
    body: message,
  });
}
function _render(url) {
  var tmp = HtmlService.createHtmlOutput('<base target="_top"><h2> Redireccionando a la página seleccionada </h2> <script> var winRef = window.open("'+url+'"); google.script.host.close();</script>');
  SpreadsheetApp.getUi().showModalDialog(tmp, 'Opening Drive'); 
}