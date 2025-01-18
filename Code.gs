var ws_info = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Info");
var ws_menu = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reportes");
var ws_config = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
var rangeA = ws_menu.getRange("A4:A").getValues();
var valuesColA = rangeA.filter(String);
var lenColA = rangeA.filter(String).length;
var lrC = ws_menu.getRange("C7:C").getValues().filter(String).length;
var lrB = ws_menu.getRange("B7:B").getValues().filter(String).length;
var certificadosFolderId = PropertiesService.getScriptProperties().getProperty("certificados_folder_prod")
//var certificadosFolderId= "14qeg1EorlbXxGjpdulRUbbhh-SlFmFBl" //TEST FOLDER
var hoy = new Date().toLocaleDateString('es-MX',{day: '2-digit',month: 'short',year: 'numeric'})

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('Pet Bajío')
      .addItem('Impresiones Certificados','loadSideBarImpresiones')
      .addSeparator()
      .addItem('Modificar Comisiones','loadSideBar')
      .addSeparator()
      .addItem("Carpeta Certificados","openDrive")
      .addSeparator()
      .addItem("Generar Doc Certificados","triggerCertificates")
      .addToUi();

 ws_info.getRange('B:B').setNumberFormat("dd/MM/yyyy");
 ws_info.getRange('AF:AF').setNumberFormat("dd/MM/yyyy");
}
function openDrive() {
  _render("https://drive.google.com/drive/folders/"+certificadosFolderId)
}

function update_historial_gestion_folios (){ // actualizar los ID
  var historialSheet = SpreadsheetApp.openById(historialSheetID)
  var ws_historial = historialSheet.getSheetByName("historial")
  var ws_info = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Info");
  var allValuesGestion = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Info").getDataRange().getValues()
  var lastColHistorial = columnToLetter(ws_historial.getLastColumn())
  var firstRowHistorial = ws_historial.getRange("A1:"+lastColHistorial+"1").getValues()
  var colGestion = _getColumn(ws_info,"Gestión");
  var colFecha = _getColumn(ws_info, "Fecha de Servicio");
  if (allValuesGestion[0].length !== firstRowHistorial[0].length){
    Browser.msgBox("Numero de columnas diferente entre historial y gestion");
    return;
  }
  var hoy = new Date();
  hoy.setDate(hoy.getDate() - 60);
  hoy.setHours(0, 0, 0, 0);
  fechaFiltro = hoy
  for (var i = allValuesGestion.length - 1; i > 0; i--) { // Recorre de abajo hacia arriba
    var fila = allValuesGestion[i];
    if (fila[colFecha] && fila[colGestion]) {
      var cumpleFecha = new Date(fila[colFecha]) < hoy;
      var cumpleGestion = fila[colGestion] === "Concluido";
      if (cumpleFecha && cumpleGestion) {
        ws_historial.appendRow(fila); // Pasa la fila a la hoja destino
        ws_info.deleteRow(i + 1);
      }
    }
  }
}
/*function onOpen_book(){
  var col = columnToLetter(getColumn("Info","Fecha de Servicio"))
  ws_info.getRange(col+":"+col).setNumberFormat("mm/dd/yyyy")
  var col2 = columnToLetter(getColumn("Info","Cobrado fecha"))
  ws_info.getRange(col2+":"+col2).setNumberFormat("mm/dd/yyyy")
}

function onEdit_menu(edit){
  if(edit.source.getActiveSheet().getName() != "Reportes"){
    return }
    var c = edit.range.getColumn();
    var r = edit.range.getRow();
    var v = edit.range.getValue();
    var ss= edit.source.getActiveSheet();
    // infoAMostrar range edit
    if (c==1 && r==3) {
      //Verificar que no se repitan las columnas
      var filterRange = ss.getRange(4,1,ss.getLastRow(),1).getValues()
      var filtered = filterRange.filter(el => el != "");
      if (filtered == ""){
        ss.getRange(4,1).setValue(v)
      } else {
        ss.getRange(lenColA+4,1).setValue(v)
      }
      edit.range.setValue("")
      var query = ss.getRange(6,3).getFormula()
      if (query !=""){
        var primeraParte = query.substr(0,query.indexOf('\"Info\"')+7)
        var porModificar = query.substr(query.indexOf('\"Info\"')+8)
        var ultimaParte = porModificar.substr(porModificar.indexOf('\"'))
        ss.getRange(6,3).setFormula(primeraParte+"\""+filtered+","+v+ultimaParte)
      }
    }
    if (c==1 && r>3) {
      var filterRange = ss.getRange(4,1,ss.getLastRow(),1).getValues()
      var filtered = filterRange.filter(el => el != "");
      if (filtered == ""){ss.getRange(6,3).clearContent()
      } else {
        var query = ss.getRange(6,3).getFormula()
        if (query !=""){
          var primeraParte = query.substr(0,query.indexOf('\"Info\"')+7)
          var porModificar = query.substr(query.indexOf('\"Info\"')+8)
          var ultimaParte = porModificar.substr(porModificar.indexOf('\"'))
          ss.getRange(6,3).setFormula(primeraParte+"\""+filtered+ultimaParte)
        }
      }
    }
}
*/
//------------------------------------------------------------------------------------------------------------------
function mostrarFolios () {
  cuerpoReporte("Mostrar Folios")
  cambiarColor("X cuadrar")
  agregarCheckBox("X cuadrar")
  adicionarSumas()
}
function xcuadrar () {
  cuerpoReporte("X cuadrar")
  cambiarColor("X cuadrar")
  agregarCheckBox("X cuadrar")
  adicionarSumas()
}
function xverificar () {
  cuerpoReporte("X verificar")
  cambiarColor("X verificar")
  agregarCheckBox("X verificar")
  adicionarSumas()
}
function credito () {
  cuerpoReporte("Crédito")
  cambiarColor("Crédito")
  agregarCheckBox("Crédito")
  adicionarSumas()
}
//------------------------------------------------------------------------------------------------------------------

function checkButton () {
  if (lrC ==0){return}
  var toCheckRange = ws_menu.getRange(7,2,lrC,1)
  var toCheckValues = toCheckRange.getValues()
  var colGestion = getColumn("Info","Gestión")
  var reporte = PropertiesService.getUserProperties().getProperty("reporte");
  var folToMod = [];
  for (var i=0; i<toCheckValues.length; i++){
    if (toCheckValues[i]=="true"){
      folToMod.push(ws_menu.getRange(i+7,3).getValue())
      ws_menu.getRange(i+7,2).setValue(false)
    }
  }
  var colFolio = ws_info.getRange("A1:A").getValues();
  var lrColA = colFolio.filter(String);
  var counter = 0       
  lrColA.forEach(function(r){
    counter = counter +1
    if(folToMod.includes(String(r))){
      var index = folToMod.indexOf(String(r))
      var prevGestValue = ws_info.getRange(counter,colGestion).getValue()
      prevGestValue = prevGestValue.replace(", "+String(reporte),"")
      prevGestValue = prevGestValue.replace(String(reporte)+",","")
      prevGestValue = prevGestValue.replace(String(reporte),"")
      ws_info.getRange(counter,colGestion).setValue(prevGestValue)
      ws_info.getRange(counter,getColumn("Info","Fecha Gestión")).setValue(new Date())
      folToMod.splice(index,1)
    }
  })
}
//------------------------------------------------------------------------------------------------------------------

function generarReporte () {
  if (valuesColA == ""){Browser.msgBox("ERROR","Info a Mostrar vacia, seleccione columnas.",Browser.Buttons.OK); return}
  var columnsFormula = "columnToLetter(getColumn(\"Info\",\""+valuesColA+"\"))"  
  var filters = ws_menu.getRange(2,2,4,ws_menu.getLastColumn()).getValues()
  var checkBoxes = filters[1]
  var param = {}
  for (i = 0; i <filters[0].length ; i++) {
    if(checkBoxes[i]== true){
      if ((filters[0][i].includes("Fecha")) || (filters[0][i].includes("fecha"))) {
        if (filters[2][i] !="" && filters[3][i] !="") {
          if (filters[2][i]>filters[3][i]){
          Browser.msgBox("ERROR DE PARÁMETROS DE FILTRADO","Rango de fecha inicial mayor a la fecha final",Browser.Buttons.OK);return 
          }
        }
        var fechaInicio=String(filters[2][i])
        var fechaFinal = String(filters[3][i])
        param[filters[0][i]] = new Array() 
        param[filters[0][i]].push(fechaInicio.substr(0,fechaInicio.indexOf('GMT')))
        param[filters[0][i]].push(fechaFinal.substr(0,fechaFinal.indexOf('GMT')))
      } else {
        param[filters[0][i]] = filters[2][i]
      }
    }
  }
  var filtersColumns = Object.keys(param).join(",")
  if (filtersColumns == "") {Browser.msgBox("ERROR DE PARÁMETROS DE FILTRADO","Selecione parámetros para filtrado",Browser.Buttons.OK); return}
  var filterFormula = ""
  for (const cols in param){
    if (filterFormula != ""){ filterFormula = filterFormula + " and "}
    if ((cols.includes("Fecha")) || cols.includes("fecha")){
      filterFormula = filterFormula+filtroFecha(filterFormula,cols,param)
    }else {filterFormula = filterFormula + "\"&columnToLetter(getColumn(\"Info\",\""+cols+"\"))&\" = \'"+param[cols]+"\'";}   
  }
  filterFormula = filterFormula +"\""
  ws_menu.getRange(6,3).setFormula("=query(Info!$A$1:$AI$100000,\"Select \"&"+columnsFormula+"&\" where "+filterFormula+")")  
  cleanQueryArea()
  cambiarColor("filtrado",valuesColA.length)
  agregarCheckBox("filtrado")
  adicionarSumas()
  PropertiesService.getUserProperties().setProperty("reporte", "filtrado");
}
//------------------------------------------------------------------------------------------------------------------

function filtroFecha (filterFormula,cols,param){
  if ((param[cols][0]!="") && (param[cols][1]=="")){
          filterFormula = "\"&columnToLetter(getColumn(\"Info\",\""+cols+"\"))&\" >= date \'\"&text(datevalue(\""+param[cols][0]+"\"),\"yyyy-mm-dd\")&\"\'";
        } else if ((param[cols][0] =="") && (param[cols][1]!="")){
        filterFormula = "\"&columnToLetter(getColumn(\"Info\",\""+cols+"\"))&\" <= date \'\"&text(datevalue(\""+param[cols][1]+"\"),\"yyyy-mm-dd\")&\"\'";
        } else if ((param[cols][0] !="") && (param[cols][1]!="")) {
          filterFormula = "\"&columnToLetter(getColumn(\"Info\",\""+cols+"\"))&\" >= date \'\"&text(datevalue(\""+param[cols][0]+"\"),\"yyyy-mm-dd\")&\"\' and \"&columnToLetter(getColumn(\"Info\",\""+cols+"\"))&\" <= date \'\"&text(datevalue(\""+param[cols][1]+"\"),\"yyyy-mm-dd\")&\"\'";
        }
  return filterFormula
}

//------------------------------------------------------------------------------------------------------------------

function cuerpoReporte (funcion) {
  var valuesReporte = ws_config.getRange(columnToLetter(getColumn("Config","Columnas para reporte "+funcion))+"2:"+columnToLetter((getColumn("Config","Columnas para reporte "+funcion)))).getValues().filter(String);
  if(lenColA <= 3){
    ws_menu.getRange(4,1,valuesReporte.length,1).setValues(valuesReporte)
  } else {
    ws_menu.getRange(4,1,lenColA,1).clearContent()
    ws_menu.getRange(4,1,valuesReporte.length,1).setValues(valuesReporte)
  }

  var filters = ws_menu.getRange(2,2,4,ws_menu.getLastColumn()).getValues()
  var checkBoxes = filters[1]
  var param = {}
  for (i = 0; i <filters[0].length ; i++) {
    if(checkBoxes[i]== true){
      if ((filters[0][i].includes("Fecha")) || (filters[0][i].includes("fecha"))) {
        if (filters[2][i] !="" && filters[3][i] !="") {
          if (filters[2][i]>filters[3][i]){
          Browser.msgBox("ERROR DE PARÁMETROS DE FILTRADO","Rango de fecha inicial mayor a la fecha final",Browser.Buttons.OK);return 
          }
        }
        var fechaInicio=String(filters[2][i])
        var fechaFinal = String(filters[3][i])
        param[filters[0][i]] = new Array() 
        param[filters[0][i]].push(fechaInicio.substr(0,fechaInicio.indexOf('GMT')))
        param[filters[0][i]].push(fechaFinal.substr(0,fechaFinal.indexOf('GMT')))
      } else {
        param[filters[0][i]] = filters[2][i]
      }
    }
  }
  var filtersColumns = Object.keys(param).join(",")
  var columnsFormula = "columnToLetter(getColumn(\"Info\",\""+valuesReporte.join(",")+"\"))"
  if (filtersColumns == "") {
    cleanQueryArea()
    ws_menu.getRange(6,3).setFormula("=query(Info!$A$1:$AI$100000,\"Select \"&"+columnsFormula+"&\" where \"&columnToLetter(getColumn(\"Info\",\"Gestión\"))&\" contains \'"+funcion+"\'\")")
    PropertiesService.getUserProperties().setProperty("reporte", funcion);
    return
  }
  var filterFormula = ""
  for (const cols in param){
    if (filterFormula != ""){ filterFormula = filterFormula + " and "}
    if ((cols.includes("Fecha")) || cols.includes("fecha")){
      filterFormula = filterFormula+filtroFecha(filterFormula,cols,param)
    }else {filterFormula = filterFormula + "\"&columnToLetter(getColumn(\"Info\",\""+cols+"\"))&\" = \'"+param[cols]+"\'";}   
  }
  filterFormula = filterFormula +" and \"&columnToLetter(getColumn(\"Info\",\"Gestión\"))&\" contains \'"+funcion+"\'\")"
  cleanQueryArea()
  ws_menu.getRange(6,3).setFormula("=query(Info!$A$1:$AI$100000,\"Select \"&"+columnsFormula+"&\" where "+filterFormula)
  PropertiesService.getUserProperties().setProperty("reporte", funcion);
}
//------------------------------------------------------------------------------------------------------------------
function cambiarColor(reporte){
  var lenColA = ws_menu.getRange("A4:A").getValues().filter(String).length
  var rowTitles = ws_menu.getRange("6:6").getValues();
  var lcRowTitles = rowTitles.filter(String).length;
  var colors = {"X cuadrar": "#def3ba","X verificar":"#e14444", "filtrado":"#cfe2f3", "Crédito": "#f6a46e"}
  ws_menu.getRange(6,3,1,lenColA).setBackground(colors[reporte]);
}
//------------------------------------------------------------------------------------------------------------------
function adicionarSumas(car){
var lrC3 = ws_menu.getRange("C7:C").getValues().filter(String).length;
var valuesColA = ws_menu.getRange("A4:A").getValues().filter(String)
  var rawColSum = ""
  /*if (car = "add"){
    if (ws_menu.getRange(lastRow,3).getValue()== "Total"){}
  }*/
  if (lrC3 == 0) {return}
  valuesColA.forEach(function(c){ if (String(c).includes("Total") || String(c).includes("Pagado") || String(c).includes("Cobrar") || String(c).includes("Comisión")){
    if (rawColSum == ""){rawColSum = c} else {rawColSum = rawColSum+","+c}
  }});
  if (rawColSum==""){return}
  var colSum = getDisplayColumn("Reportes",rawColSum)
  colSum.forEach(function (s){ ws_menu.getRange(lrC3+8,s+1).setFormula("=sum("+columnToLetter(s+1)+"7:"+columnToLetter(s+1)+(lrC3+6)+")")
  ws_menu.getRange(lrC3+8,3).setValue("Total")
  })
}
//------------------------------------------------------------------------------------------------------------------
function agregarCheckBox (reporte) {
var lrC2 = ws_menu.getRange("C7:C").getValues().filter(String).length-1;
var lrB2 = ws_menu.getRange("B7:B").getValues().filter(String).length;
  if (reporte == "filtrado") {
    if (lrB2 ==0) { return}
    ws_menu.getRange(7,2,lrB2,1).removeCheckboxes()
    return
  }
  if (lrC2 ==0) { return}
  if (lrB2 ==0) {
    ws_menu.getRange(7,2,lrC2,1).insertCheckboxes()
  } else if (lrC2<lrB2){
    ws_menu.getRange(lrC2+7,2,(lrB2+1)-lrC2,1).removeCheckboxes()
  } else if (lrC2>lrB2){
    ws_menu.getRange(lrB2+7,2,lrC2-lrB2,1).insertCheckboxes() 
  }
}
//------------------------------------------------------------------------------------------------------------------
function cleanQueryArea () {
  if (lrC == null){return}
  ws_menu.getRange(lrC+7,3,1,20).clearContent()
}
function erase(){
  var lenLc6 = ws_menu.getRange("C7").getDataRegion()
  //if (lrC==0){return}
  ws_menu.getRange(6,2,lenLc6.getLastRow()+1,lenLc6.getLastColumn()+1).getA1Notation()//.clearContent()
  ws_menu.getRange(6,2,lenLc6.getLastRow()+1,1).removeCheckboxes()
  ws_menu.getRange(6,2,1,15).setBackground("white");
  ws_menu.getRange("C6:Z1500").clearContent()
}

//------------------------------------------------------------------------------------------------------------------
function cleanCertificadosFolder (){
  var certificados = DriveApp.getFolderById("1qKbpkfNklQMAAN58H18HXEu7j3nr9HAx").getFiles();
  var today = new Date();
  var currentDay = today.getDate();
  today.setDate(currentDay - 2);
  while (certificados.hasNext()) {
    var file = certificados.next();
    //Utilities.sleep(1500);
    if (today > file.getDateCreated()) {
      try{
      file.setTrashed(true);
      }catch (error){
        Logger.log(error)
      }
      
    }
  }
}
//------------------------------------------------------------------------------------------------------------------
function getDataForCertificate(){
  if (lrC ==0){return}
  var toCheckRange = ws_menu.getRange(7,2,lrC,1)
  var toCheckValues = toCheckRange.getValues().filter(String)
  var folCertificate = [];

  for (var i=0; i<toCheckValues.length; i++){   
    if (toCheckValues[i]=="true"){
      folCertificate.push(ws_menu.getRange(i+7,3).getValue())
      ws_menu.getRange(i+7,2).setValue(false)
    //}else if(i==toCheckValues.length-2){
      // Browser.msgBox('Marque un folio en la columna B para elaborar el certificado');
      // return
    }
  }
  var colFolio = ws_info.getRange("A1:A").getValues();
  var colFolioString = colFolio.map(v => v[0].toString());
  var index = 0
  folCertificate.forEach(function (id){
    elborarCertificado(makeCertificadoDict(colFolioString.indexOf(id)+1))
  })
  Browser.msgBox('Ha sido elaborado los certificados para los folios '+folCertificate.toString());
}
function loadModelessDialog_() {
  const hs = HtmlService.createTemplateFromFile("managementHTML");
  const htmlContext = hs.evaluate()
  htmlContext.setWidth(850).setHeight(600)
  const ui = SpreadsheetApp.getUi();
  ui.showModelessDialog(htmlContext,"Panel de Administración")
}
  