//var url = "https://docs.google.com/spreadsheets/d/1PxSWzAmR0IEiACVQ7hVzqX3ZiV1idY1UEUm-0XAgE0o/edit#gid=1379845311"//test env
var url = "https://docs.google.com/spreadsheets/d/1eToY9f4arRtnGHbV3mWJ8f2ZUbtmuF9b_rHxu5Fobxo/edit#gid=1379845311"
var Route = {};
Route.path = function(route,callback){
  Route[route] = callback;
}
function doGet(e) {
  Route.path("form",loadForm);
  Route.path("pagos",loadPagos);
  Route.path("home",loadHome);
  Route.path("pagos_credito",loadPagosCredito)
  Route.path("resumen_registro_diario",loadResumenRegistroDiario)
  Route.path("test",loadTest);
  if(Route[e.parameters.v]){
    return Route[e.parameters.v]();
  } else {
      return Route["home"]();
  }
}

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

function loadTest() {
  return _render("email_template",{cliente:"test"})
}
function loadHome() {
  return _render("home",{usuarios:"test"})
}

function loadForm() {
  var ss = SpreadsheetApp.openByUrl(url)
  var ws = ss.getSheetByName("Config")
  //Lista de productos
  var productos = ws.getRange(2,_getColumn(ws,"Productos")+1,ws.getLastRow(),2).getValues();
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
  return _render("page",{productoList: res})
}

function loadPagos(){
  var resCalculatePagosPage = _returnSumCountPagosPage()
  var efectivo = resCalculatePagosPage.sum
  var countFolios = resCalculatePagosPage.count
  return _render("pagos",{profile: userName, today:hoy, efectivo:efectivo, countFolios:countFolios})
}

function loadPagosCredito (){
  //var tmp = HtmlService.createTemplateFromFile("pagos_credito");
  var ss = SpreadsheetApp.openByUrl(url)
  var ws_config = ss.getSheetByName("Config")
  var usuarios = ws_config.getRange(2,1,ws_config.getLastRow(),3).getValues();
  usuarios = usuarios.filter(e => e[0] !== '');
  var usuario = Session.getActiveUser().getEmail()
  for (var i=0;i<=usuarios.length-1;i++){
    if (usuarios[i][1] == usuarioMail){
      if (usuarios[i][2]=='Admin'){
        return _render("pagos_credito")
      }else {return _render('sin_autorizacion',{mail: usuarioMail}) }
    }else { }
  }
}

function loadResumenRegistroDiario(){ 
  var profile = queryUserFolios(ws_rev_fol)
  //var today = new Date().toLocaleDateString('es-MX',{day: '2-digit',month: 'short',year: 'numeric'})
  return _render("resumen_registro_diario",{profile: profile, today:hoy})
}
// esta función es para modificar el query en el excel, que ya no se usariá
function queryUserFolios(ws){
  var profileName = userName;
  var queryFormulaRange = ws.getRange('A1');
  var queryFormula = queryFormulaRange.getFormula();
  if (queryFormula.includes(profileName)){
    return profileName
  }
  var data = ws_config.getRange(2,1, ws_config.getLastRow(),2).getValues();
  var userList = data.map(function(r){return r[0];});
  userList = userList.filter(String);
  for (i=0; i < userList.length; i++){
    if (queryFormula.includes(userList[i])){
      queryFormula = queryFormula.replace(new RegExp(userList[i], 'g'), profileName);
      queryFormulaRange.setFormula(queryFormula);
      SpreadsheetApp.flush();
      return profileName;
    }
  }
  if (queryFormula.renders('null')){
    queryFormula = queryFormula.replace(new RegExp('null', 'g'), profileName);
    queryFormulaRange.setFormula(queryFormula);
    SpreadsheetApp.flush();
    return profileName;
  }
  return false
}