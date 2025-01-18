function loadSideBar() {
  const hs = HtmlService.createTemplateFromFile("sidebarHTML");
  const htmlContext = hs.evaluate()
  const ui = SpreadsheetApp.getUi();
  ui.showSidebar(htmlContext)
}
function modifyProspectador(foliosList,nuevoProsp){
  var foliosArray = ws_info.getRange("A:A").getDisplayValues().filter(String);
  foliosArray = foliosArray.map(v => v.join(","));
  col = _getColumn(ws_info,"Prospectador")+1
  foliosList.forEach(function (f){
    var index = foliosArray.indexOf(f)
    
    if (index > 0){
      var range = ws_info.getRange(index+1,col)
      range.setValue(nuevoProsp)
      range.setBackgroundRGB(255,165,0)
    }
  })

}
function seeModifiedProspectador() {
  col = _getColumn(ws_info,"Prospectador")+1
  var filter = ws_info.getFilter();
  if (filter === null) {
    ws_info.getDataRange().createFilter();
  } 
  let color = SpreadsheetApp.newColor().setRgbColor("#FFA500").build()
  var criteria = SpreadsheetApp.newFilterCriteria().setVisibleBackgroundColor(color)
  .build();
  ws_info.getFilter().setColumnFilterCriteria(col, criteria);
  ws_info.activate()
}

function getRecolectores(){
  col = _getColumn(ws_config,"Prospectadores/Recolectores")
  options = ws_config.getRange(col+1,1,ws_config.getLastRow()).getValues().filter(String)
  options.shift()
  options = options.map(v => v.join(","));
  return options
}
