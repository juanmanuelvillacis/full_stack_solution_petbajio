function _returnSumCountPagosPage (){

  var vals = ws_info.getDataRange().getValues();
  var col_num1 = _getColumnInfo("Cobrado fecha");
  var col_num2 = _getColumnInfo("Cobrado por");
  var col_num3 = _getColumnInfo("Pago");
  var col_num4 = _getColumnInfo("Total Por Cobrar");
  vals = vals.filter(v =>(typeof v[col_num1] === "object" && 
                          v[col_num1].setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0) && 
                          v[col_num2] == userName &&
                          v[col_num3] == "Efectivo" &&
                          v[col_num4] != 0))
  const result = vals.reduce((acc, row) => {
  acc.sum += row[col_num4] || 0;
  acc.count++;
  return acc;
}, { sum: 0, count: 0 });
 return result
}

function _removeInfoSheetProtection(){
  var protections = ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)
  for (var i = 0; i < protections.length; i++) {
    if (protections[i].getDescription().indexOf("Info")>=0){
      protections[i].remove()
    }
  }
}

function _addInfoSheetProtection(){
  var protection = ws_info.protect().setDescription("Info sheet")
  var emails = ws_config.getRange(2,2, ws_config.getLastRow(),1).getValues().filter(function(row) {return row[0] !== ""; }).map(function(r){return r[0];});
  emails.forEach(e =>protection.addEditor(e) )
}

function _findBlankValues() {
  var columnToCheck = _getColumnInfo("Folio")+1; // Change this to the column number you want to check
  var numRows = ws_info.getLastRow();
  var values = ws_info.getRange(1, columnToCheck, numRows).getValues();
  var blankIndices = [];
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === "") { // Check if the value is blank
      blankIndices.push(i + 1); // Add 1 to convert from 0-indexed to 1-indexed row numbers
    }
  }
  if (blankIndices.length > 0) {
    var mensajeError = 'Un valor en blanco fue identificado en la columna Folios en la hoja Info en la(s) fila(s) '+ blankIndices.join(", ")
    _sendErrorNotification(_getUser(usuario),blankIndices.join(", "),"el la hoja Info",mensajeError)
  } 
}

function _getUser(u){ 
  var data = ws_config.getRange(2,1, ws_config.getLastRow(),2).getValues();
  var userList = data.map(function(r){return r[0];});
  var emailList = data.map(function(r){return r[1];});
  var position = emailList.indexOf(u);
  if (position > -1){
    return userList[position];
  } else {
    return null
  }
}
//-----------------------------------------------------------------------------------------------------
function _sendErrorNotification(perfil,fila=1,func,errorMessage) {
 var recipientEmail = 'petbajio@gmail.com,juanmanuelvillacis@gmail.com'; // Change to the email address where you want to send the error notification
  var subject = 'Notificación de Error en la fila '+fila;
  var message = 'Un error ocurrió al usuario '+perfil+ ' en '+func+ ':\n\n' + errorMessage;
  // Send the error notification email
  MailApp.sendEmail({
    to: recipientEmail,
    subject: subject,
    body: message,
  });
}
//-----------------------------------------------------------------------------------------------------
// Creamos esta función include para leer el código en el resto de script pestañas
function _include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
//-----------------------------------------------------------------------------------------------------
function _render(file,argsObject) {
  var tmp = HtmlService.createTemplateFromFile(file);
  if (argsObject){
    var keys = Object.keys(argsObject);
    keys.forEach(function(key){
      tmp[key] = argsObject[key]
    });
  }
  return tmp.evaluate();
}
//-----------------------------------------------------------------------------------------------------
function _getColumn(ws,tittle){
  var headers = ws.getRange(1,1,1,ws.getLastColumn()).getValues();
  var position = headers[0].indexOf(tittle);
  return position
}
//-----------------------------------------------------------------------------------------------------
function _getColumnInfo(tittle){
  var headers = ws_info.getRange(1,1,1,ws_info.getLastColumn()).getValues();
  var position = headers[0].indexOf(tittle);
  return position
}
//-----------------------------------------------------------------------------------------------------
function _formatNumber(n) {
  // format number 1000000 to 1,234,567
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
//-----------------------------------------------------------------------------------------------------
function _columnToLetter(column){
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
