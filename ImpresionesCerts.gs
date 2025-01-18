function loadSideBarImpresiones() {
  const hs = HtmlService.createTemplateFromFile("ImpresionesCertsHTML");
  const htmlContext = hs.evaluate()
  htmlContext.setWidth(850).setHeight(600)
  const ui = SpreadsheetApp.getUi();
  ui.showModelessDialog(htmlContext,"Gestión de Impresiones")
}
function getCertInfoFolio(){
  const allValues = ws_info.getDataRange().getValues()
  allValues.shift()
  let col_fecha = _getColumn(ws_info,"Fecha de Servicio");
  //let col_cert = _getColumn(ws_info,"Certificado");
  let col_fol = _getColumn(ws_info,"Folio");
  let col_mvz = _getColumn(ws_info,"Veterinario/MVZ");
  let col_mascota = _getColumn(ws_info,"Nombre de la Mascota");
  //var filteredFolios = allValues.filter(rowInfo => rowInfo[col_cert] == true)
  var foliosResumeInfo = allValues.map(row =>{
    const fechaString = typeof row[col_fecha] === 'object' ? String(row[col_fecha].toLocaleDateString('zh-Hans-CN',{year: 'numeric',month: '2-digit',day: '2-digit'})) : String(row[col_fecha]);
    return [row[col_fol],fechaString, row[col_mvz], row[col_mascota]];
  })
  return foliosResumeInfo
}

