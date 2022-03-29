var ss = SpreadsheetApp.openByUrl(url)
var ws_info = ss.getSheetByName("Info")
var ws_config = ss.getSheetByName("Config")
var ws_cli = ss.getSheetByName("Clientes")
var ws_pag = ss.getSheetByName("Pagos")
var usuario = Session.getActiveUser().getEmail()
//------------------------------------------------------------------------------------------------------------------------------------------------------
                                                          //FUNCIONES DE LA PAGINA DE PAGE
function userClicked(userInfo) {
  userInfo.folio = 'f-' + userInfo.folio
  userInfo.user = getUser(usuario);
  if (userInfo.user == null){ return usuario}
  user_properties = PropertiesService.getUserProperties().getProperties()
  Logger.log([userInfo.user,user_properties["lastFolio"]])
  if (user_properties["lastFolio"] == userInfo.folio) {return false}
  var lr = ws_info.getLastRow()+1
  var mes = "=TEXT("+columnToLetter(getColumn(ws_info,"Fecha de Servicio")+1)+ lr+",\"MMMM\")"
  var totalValor = "="+columnToLetter(getColumn(ws_info,"Total de Servicio")+1)+ lr+"+"+columnToLetter(getColumn(ws_info,"Total Producto")+1)+ lr
  var totalPagado = "="+columnToLetter(getColumn(ws_info,"Pagado Servicio")+1)+ lr+"+"+columnToLetter(getColumn(ws_info,"Pagado Producto")+1)+ lr
  var totalPorCobrar = "="+columnToLetter(getColumn(ws_info,"Por Cobrar Servicio")+1)+ lr+"+"+columnToLetter(getColumn(ws_info,"Por Cobrar Producto")+1)+ lr
  var comision = "="+columnToLetter(getColumn(ws_info,"Total Valor")+1)+ lr+"*0.1"
  
  userInfo.pros = user_properties["prospectador"];
  if(userInfo.date ===""){
    userInfo.date = new Date()
  }
  
  if (userInfo.peso !="Peso") {userInfo.peso = userInfo.peso.substr(userInfo.peso.indexOf('-')+2);} else {userInfo.peso=""}

  var gestion = []
  if (userInfo.pago == "Efectivo") {
    if (userInfo.resta == 0 && (userInfo.restaProd == 0.00 || userInfo.restaProd == null)){
      gestion.push("X cuadrar")
    } else if (userInfo.resta != 0 && (userInfo.restaProd == 0.00 || userInfo.restaProd == null)){
      gestion.push("X cuadrar")
      gestion.push("X cobrar")
    } else if (userInfo.resta == 0 && userInfo.restaProd != null) {
      gestion.push("X cuadrar")
      gestion.push("X cobrar")
    } else if (userInfo.resta != 0 && userInfo.restaProd != 0.00 ) {
      gestion.push("X cuadrar")
      gestion.push("X cobrar")
    }
  }else if(userInfo.pago == "Crédito"){
    gestion.push("Crédito")
  } else if(userInfo.pago == "Transferencia" ||userInfo.pago == "Cheque" || userInfo.pago == "Tarjeta"){
    if (userInfo.resta == 0 && (userInfo.restaProd == 0.00 || userInfo.restaProd == null)){
      gestion.push("X verificar")
    } else if (userInfo.resta != 0 && (userInfo.restaProd == 0.00 || userInfo.restaProd == null)){
      gestion.push("X verificar")
      gestion.push("X cobrar")
    } else if (userInfo.resta == 0 && userInfo.restaProd != 0.00 ) {
      gestion.push("X verificar")
      gestion.push("X cobrar")
    } else if (userInfo.resta != 0 && userInfo.restaProd != 0.00 ) {
      gestion.push("X verificar")
      gestion.push("X cobrar")
    }
  }
  ws_info.appendRow([userInfo.folio, userInfo.date, mes, userInfo.pros, userInfo.user, gestion.join(","), userInfo.vet, userInfo.region, userInfo.edad, userInfo.peso, userInfo.tipo, userInfo.mascota, userInfo.raza,userInfo.propietario, userInfo.cremacion, userInfo.paquete, userInfo.valor, userInfo.pagado, userInfo.resta, userInfo.factura,userInfo.pago ,userInfo.obs, userInfo.producto, userInfo.obsVideo, userInfo.valorProd, userInfo.pagadoProd, userInfo.restaProd, totalValor, totalPagado, totalPorCobrar, comision]) 
  PropertiesService.getUserProperties().setProperty("lastFolio", userInfo.folio)
  return true
}
//------------------------------------------------------------------------------------------------------------------------------------------------------

function getUser(u){  
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
//------------------------------------------------------------------------------------------------------------------------------------------------------
//FUNCION PARA CHEQUEAR DUPLICIDAD DE FOLIO
function checkFolios (f){
  var listFolios = ws_info.getRange(2,1,ws_info.getLastRow(),1).getValues().map(function(r){return r[0];});
  var position = listFolios.indexOf(f);
  listFolios.pop()
  if (position > -1){
    return [true,f]
  } else {
    return [false,f]
  }
}
//------------------------------------------------------------------------------------------------------------------------------------------------------
//FUNCION PARA ESCOGER PROSPECTADOR Y TIPO A PARTIR DE CLIENTE
function lookForProspect(vet) {
  var data = ws_cli.getDataRange().getValues();
  var vetList = data.map(function(r){return r[0];});
  var prospList = data.map(function(r){return r[1];});
  //var tipoList = data.map(function(r){return r[2];});
  var position = vetList.indexOf(vet);
  if (position > -1){
    PropertiesService.getUserProperties().setProperty("prospectador", prospList[position]);
    return [true,vet]//tipoList[position]
  } else {
    return [false,vet]
  }
}
//------------------------------------------------------------------------------------------------------------------------------------------------------
//FUNCION PARA RECOLECTAR CLIENTES DE LA TABLA DE CLIENTES
function getWords() {
var data = ws_cli.getRange(2,1, ws_cli.getLastRow(),1).getValues()
var options = {};
data.forEach(function(v){
  options[v[0]] = null;
});
return options;
}
//------------------------------------------------------------------------------------------------------------------------------------------------------
//FUNCION PARA RECOLECTAR MODEOS DE PRODUCTO SELECCIONADO 
function getModelos(m) {
  //Lista de productos
  var productos = ws_config.getRange(2,getColumn(ws_config,"Productos")+1,ws_config.getLastRow(),2).getValues();
  var productosLimpio = []
  productos.forEach(function(e){ if(e[0]!=""){productosLimpio.push(e)}});
  var modelos = []
  for (var i=0;i<=productosLimpio.length-1;i++){
    if (productosLimpio[i][0] == m) {
      modelos.push(productosLimpio[i][1])
    }
  }
  if (modelos == ""){
    return false
  }
  return modelos
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
                                                          //FUNCIONES DE LA PAGINA DE PAGOS
function getTableData(){
  var data = ws_pag.getDataRange().getDisplayValues();
  data.shift()
  return data;
}
function getTableHeader(){
  var data = ws_pag.getDataRange().getDisplayValues();
  return data.shift()
}
function registrarPago(f){
  var colFolio = ws_info.getRange("A1:A").getValues();
  var lrColA = colFolio.filter(String);
  var colPago = getColumn(ws_info,"Pago")+1
  var colGestion = getColumn(ws_info,"Gestión")+1
  var colCobrar = getColumn(ws_info,"Total Por Cobrar")+1
  var ver = false
  f.forEach(function(fol){
  var counter = 0
    lrColA.forEach(function(r){
      counter = counter +1
      if(r==fol){
        var pagoFolio = ws_info.getRange(counter,colPago).getValue()
        var prevGestRange = ws_info.getRange(counter,colGestion)
        var prevGestValue = prevGestRange.getValue()
        var prevCobrar = ws_info.getRange(counter,colCobrar).getDisplayValue()
        prevGestValue = prevGestValue.replace(", X cobrar","")
        prevGestValue = prevGestValue.replace("X cobrar,","")
        prevGestValue = prevGestValue.replace("X cobrar","")
        if(pagoFolio =="Efectivo") {
          if(prevGestValue.indexOf("X cuadrar")<0){ 
          prevGestRange.setValue(prevGestValue + ", X cuadrar")
          } else { prevGestRange.setValue(prevGestValue)}
        
        } else {
          if(prevGestValue.indexOf("X verificar")<0){
            prevGestRange.setValue(prevGestValue + ", X verificar")
          } else {prevGestRange.setValue(prevGestValue)}
        }
          
          ws_info.getRange(counter,getColumn(ws_info,"Cobrado por")+1).setValue(getUser(usuario))
          ws_info.getRange(counter,getColumn(ws_info,"Cobrado fecha")+1).setValue(new Date())
          ws_info.getRange(counter,getColumn(ws_info,"Total Pagado")+1).setValue(prevCobrar)
          ws_info.getRange(counter,colCobrar).clearContent()
          ver = true
      }
    })
  });
  
if (ver){
  return ScriptApp.getService().getUrl() + "?v=pagos";}
}
//------------------------------------------------------------------------------------------------------------------------------------------------------
                                        //FUNCIONES DE LA PAGINA DE MENU
  function menuClicked(client){
    var listClients = ws_cli.getRange(2,1,ws_cli.getLastRow(),1).getValues().map(function(r){return r[0];});
    var position = listClients.indexOf(client.mvz);
    listClients.pop()
    var user = getUser(usuario);
    
    if (position == -1){
      if (user != "") {
        ws_cli.appendRow([client.mvz.trim(),user])
      } else {return false}
      return true
    } else {
      return client.mvz
    }
  }
  