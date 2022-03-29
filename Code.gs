var url = "https://docs.google.com/spreadsheets/d/1dbw1UIY2wUkJ9-777XlXK8I9hXbyG4N0X7i6d-qo8dk/edit#gid=0"
var Route = {};
Route.path = function(route,callback){
  Route[route] = callback;
}
function doGet(e) {
  Route.path("form",loadForm);
  Route.path("pagos",loadPagos);
  Route.path("home",loadHome);
  if(Route[e.parameters.v]){
    return Route[e.parameters.v]();
  } else {
      return Route["home"]();
  }
}

function loadHome() {
  var ss = SpreadsheetApp.openByUrl(url)
  var ws = ss.getSheetByName("Config")
  var usuarios = ws.getRange(2,1,ws.getLastRow(),1).getValues();
  usuarios.pop()
  var listUsuarios = usuarios.map(function(r){ if (r !=""){return "<option>"+r[0] + "</option>"; }}).join('');
  //Lista de productos
  return render("home",{usuarios: listUsuarios})
}
function loadForm() {
  var ss = SpreadsheetApp.openByUrl(url)
  var ws = ss.getSheetByName("Config")
  //Lista de productos
  var productos = ws.getRange(2,getColumn(ws,"Productos")+1,ws.getLastRow(),2).getValues();
  var productosLimpio = []
  productos.forEach(function(e){ if(e[0]!=""){productosLimpio.push(e)}});
  var res = {}
  var modelos = []
  for (var i=0;i<=productosLimpio.length;i++){
    //if(i==0){ res[productosLimpio[i][0]] = "<optgroup label=\'"+productosLimpio[i][0]+"\'> <option value=\'\' disabled selected>Escoja un producto</option>"}
    if(i <= productosLimpio.length-1){
      if(i == 0) {continue}
      else if(productos[i-1][0] == productosLimpio[i][0]) {
        modelos.push(productosLimpio[i-1][1])
        //res[productosLimpio[i][0]] = res[productosLimpio[i][0]] + productosLimpio[i][1]
      } else {
        modelos.push(productosLimpio[i-1][1])
        res[productosLimpio[i-1][0]] = modelos
        modelos = []
      }
    } else {
      if(productos[i-2][0] == productosLimpio[i-1][0]) {
      modelos.push(productosLimpio[i-1][1])     
      } else {modelos.push(productosLimpio[i-1][1])
        res[productosLimpio[i-1][0]] = modelos
        }
    }
  }
  res[productosLimpio[i-2][0]] = modelos
  return render("page",{productoList: res})
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
function loadPagos(){
  var ss = SpreadsheetApp.openByUrl(url)
  var ws = ss.getSheetByName("Pagos")
  var data = ws.getRange(2,1,ws.getLastRow(),1).getDisplayValues()
  data.pop()
  var htmlListArray = data.map(function(r){ return "<option>"+r[0] + "</option>"; }).join(''); 
  return render("pagos",{list: htmlListArray})
}
/*
function upload (e){
    console.log(e)
    var destination_id = "1zhiUoy966QMpzUq5ZH4GPoRZK"
    
    var img = e.imageFile;
    
    var contentType = 'image/png'
    var destination = DriveApp.getFolderById(destination_id)
    var img = img.getAs(contentType)
    destination.createFile(img)
  } */