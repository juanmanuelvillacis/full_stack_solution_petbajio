// Creamos esta función include para leer el código en el resto de script pestañas
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function render(file,argsObject) {
  var tmp = HtmlService.createTemplateFromFile(file);
  if (argsObject){
    var keys = Object.keys(argsObject);
    keys.forEach(function(key){
      tmp[key] = argsObject[key]
    });
  }
  return tmp.evaluate();
}

function getColumn(ws,tittle){
  var headers = ws.getRange(1,1,1,ws.getLastColumn()).getValues();
  var position = headers[0].indexOf(tittle);
  return position
}

function formatNumber(n) {
  // format number 1000000 to 1,234,567
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
function columnToLetter(column){
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
