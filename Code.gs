//var id = PropertiesService.getScriptProperties().getProperty("gest_folios_test_env")// test env
var id = PropertiesService.getScriptProperties().getProperty("gest_folios_prod_env")// prod env
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
  if(Route[e.parameters.v]){
    return Route[e.parameters.v]();
  } else {
      return Route["home"]();
  }
}
function loadHome() {
  return _render("home",{usuarios:"test"})
}

function loadForm() {
  var ss = SpreadsheetApp.openById(id)
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
  var ss = SpreadsheetApp.openById(id)
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
  //var profile = queryUserFolios(ws_rev_fol)
  //var today = new Date().toLocaleDateString('es-MX',{day: '2-digit',month: 'short',year: 'numeric'})
  return _render("resumen_registro_diario",{profile: userName, today:hoy})
}
