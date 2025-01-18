function buildPivotTableResumenCuadre (){
  erase();
  var filters = ws_menu.getRange(2,2,4,ws_menu.getLastColumn()).getValues()
  var checkBoxes = filters[1]
  for (i = 0; i <filters[0].length ; i++) {
    if(checkBoxes[i]== true){
      if ((filters[0][i].includes("Fecha")) && (filters[2][i]!== '')) {
        var fechaFiltro=filters[2][i];
        break;
      }
    }
  }
  if (typeof fechaFiltro == 'undefined') {
    fechaFiltro= new Date();
  }
  sourceData = ws_menu.getRange('Info!A1:AG');
  pivotTable = ws_menu.getRange('B7').createPivotTable(sourceData);
  var pivotValue = pivotTable.addPivotValue(28, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
  pivotValue.setDisplayName('Total Pagado ');
  pivotValue = pivotTable.addPivotValue(29, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
  pivotValue.setDisplayName('Total Por Cobrar ');
  pivotValue = pivotTable.addPivotValue(27, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
  pivotValue.setDisplayName('Total Valor ');
  pivotGroup = pivotTable.addRowGroup(5);
  pivotGroup = pivotTable.addColumnGroup(21);
  var criteria = SpreadsheetApp.newFilterCriteria().whenDateEqualTo(fechaFiltro).build();
  pivotTable.addFilter(2, criteria);
}

//------------------------------------------------------------------------------------------------------------------

function buildPivotTableXCobrarEfectivo (){
  var filters = ws_menu.getRange(2,2,4,ws_menu.getLastColumn()).getValues()
  var checkBoxes = filters[1]
  for (i = 0; i <filters[0].length ; i++) {
    if(checkBoxes[i]== true){
      if ((filters[0][i].includes("Fecha")) && (filters[2][i]!== '')) {
        var fechaFiltro=filters[2][i];
        break;
      }
    }
  }
  if (typeof fechaFiltro == 'undefined') {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    fechaFiltro= yesterday
  }
  erase();
  sourceData = ws_menu.getRange('Info!A1:AG');
  pivotTable = ws_menu.getRange('B7').createPivotTable(sourceData);
  var pivotGroup = pivotTable.addRowGroup(31);
  var pivotValue = pivotTable.addPivotValue(29, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
  pivotValue.setDisplayName(fechaFiltro.toLocaleDateString());
  var criteria = SpreadsheetApp.newFilterCriteria().whenDateEqualTo(fechaFiltro).build();
  pivotTable.addFilter(32, criteria);
  criteria = SpreadsheetApp.newFilterCriteria().setVisibleValues(["Efectivo"]).build();
  pivotTable.addFilter(21, criteria);
  criteria = SpreadsheetApp.newFilterCriteria().whenNumberNotEqualTo(0).build();
  pivotTable.addFilter(29, criteria);
}

function buildPivotTableResumenComision (){
  erase();
  var filters = ws_menu.getRange(2,2,4,ws_menu.getLastColumn()).getValues()
  var checkBoxes = filters[1]
  for (i = 0; i <filters[0].length ; i++) {
    if(checkBoxes[i]== true){
      if ((filters[0][i].includes("Fecha")) && (filters[2][i]!== '')) {
        var fechaFiltro=filters[2][i];
        break;
      }
    }
  }
  if (typeof fechaFiltro == 'undefined') {
    fechaFiltro= new Date();
  }
  var monthName = Utilities.formatDate(fechaFiltro, Session.getScriptTimeZone(), "MMMM");
  monthName = _translateMonth(monthName)
  sourceData = ws_menu.getRange('Info!A1:AG');
  pivotTable1 = ws_menu.getRange('B7').createPivotTable(sourceData);
  pivotGroup = pivotTable1.addRowGroup(4);
  var pivotValue = pivotTable1.addPivotValue(1, SpreadsheetApp.PivotTableSummarizeFunction.COUNTA);
  pivotValue.setDisplayName('Servicios Realizados en '+monthName);
  pivotValue = pivotTable1.addPivotValue(27, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
  pivotValue.setDisplayName('Total Folios');
  pivotValue = pivotTable1.addPivotValue(30, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
  pivotValue.setDisplayName('Total Comisión');
  var criteria = SpreadsheetApp.newFilterCriteria().whenCellNotEmpty().build();
  pivotTable1.addFilter(4, criteria);
  criteria = SpreadsheetApp.newFilterCriteria().setVisibleValues([monthName]).build();
  pivotTable1.addFilter(3, criteria);
  var b_vals = ws_menu.getRange("B8:B").getValues();
  var b_last = b_vals.filter(String).length;
  _secondPivotComision(monthName)
  _sumComisionRecolectores(b_last)
}



function _translateMonth(monthName) {
  const monthNames = {
    "January": "enero",
    "February": "febrero",
    "March": "marzo",
    "April": "abril",
    "May": "mayo", // Ensure "May" is included
    "June": "junio",
    "July": "julio",
    "August": "agosto",
    "September": "septiembre",
    "October": "octubre",
    "November": "noviembre",
    "December": "diciembre"
  };
  const month = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase(); // Capitalize first letter
  return monthNames[month] || monthName; // Return translation or original name
}


function _secondPivotComision(dateFilter){
  ws_menu.getRange("G6").setValue("Servicios prospectadora Karla en el mes de "+dateFilter)
  sourceData = ws_menu.getRange('Info!A1:AG');
  pivotTable1 = ws_menu.getRange(7,7).createPivotTable(sourceData);
  pivotGroup = pivotTable1.addRowGroup(5);
  var pivotValue = pivotTable1.addPivotValue(1, SpreadsheetApp.PivotTableSummarizeFunction.COUNTA);
  pivotValue.setDisplayName('Servicios Realizados');
  pivotValue = pivotTable1.addPivotValue(27, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
  pivotValue.setDisplayName('Total Folios');
  pivotValue = pivotTable1.addPivotValue(30, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
  pivotValue.setDisplayName('Total Comisión');
  var criteria = SpreadsheetApp.newFilterCriteria().setVisibleValues([dateFilter]).build();
  pivotTable1.addFilter(3, criteria);
  criteria = SpreadsheetApp.newFilterCriteria().setVisibleValues(["Karla"]).build();
  pivotTable1.addFilter(4, criteria);
   criteria = SpreadsheetApp.newFilterCriteria().whenTextDoesNotContain("Karla").build();
  pivotTable1.addFilter(5, criteria);
}

function _sumComisionRecolectores (lastRow){
  var lastRow_2_vals = ws_menu.getRange("G7:G").getValues();
  var lastRow_2 = lastRow_2_vals.filter(String).length;
  var recolectores = ws_menu.getRange(8,2,lastRow).getValues().flatMap(innerArray => innerArray);
  var recolectores2 = ws_menu.getRange(8,7,lastRow_2-1).getValues().flatMap(innerArray => innerArray)
  const dictionary = {};
  for (i = 0; i <recolectores.length ; i++) {
    dictionary[recolectores[i]] = [ws_menu.getRange(8+i,4).getValue()];
    dictionary[recolectores[i]].push(ws_menu.getRange(8+i,5).getValue());
    try{
      var index = recolectores2.indexOf(recolectores[i])
      if (index>=0){
        dictionary[recolectores[i]][0] += ws_menu.getRange(8+index,9).getValue()
        dictionary[recolectores[i]][1] += ws_menu.getRange(8+index,10).getValue()
      } else if (index == -1 && !recolectores.includes(recolectores2[i]) && recolectores2[i] != null) {
        dictionary[recolectores2[i]] = [ws_menu.getRange(8+i,9).getValue()];
        dictionary[recolectores2[i]].push(ws_menu.getRange(8+i,10).getValue());
      }
    } catch {continue}
  };
  var keys = Object.keys(dictionary)
  const transformedKeyList = keys.map(item => [item]);
  var vals = Object.values(dictionary)
  ws_menu.getRange(6,12,1,3).setValues([["Recolector","Total Folios","Total Comisión"]])
  ws_menu.getRange(7,12,keys.length).setValues(transformedKeyList)
  ws_menu.getRange(7,13,keys.length,2).setValues(vals).setNumberFormat("$#,##0.00")
}
