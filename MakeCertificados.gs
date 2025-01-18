function triggerCertificatesElaboration (foliosArrayString = ""){
  var allData = ws_info.getDataRange().getValues();
  allData.shift()
  var rowColCert = getColumn("Info","Certificado")
  var colAString = allData.map(row => row[0])
  if (foliosArrayString == ""){
    var foliosValidados = allData.filter(x => x[rowColCert-1]==="VALIDADO")
    var foliosValidadosColA = foliosValidados.map(row => row[0])
    var indexFoliosToCreateCert = foliosValidadosColA.map(folioInfo => colAString.indexOf(folioInfo)+1)
  }else {
    var foliosArray = JSON.parse(foliosArrayString)
    var indexFoliosToCreateCert = foliosArray.map(folioInfo => colAString.indexOf(folioInfo)+2)
  }
  if (indexFoliosToCreateCert.length == 0){return}
  var resArray = indexFoliosToCreateCert.map(idexFolio => makeCertificadoDict(idexFolio))
  elborarCertificado(resArray)
}

function makeCertificadoDict (row){ // modificar a get index of de la lista de folios col AA
  var certificadoDict = {"Fecha Certificado":[""],"Nombre de la Mascota":[""],"Especie":[""],"Edad":[""],"Raza":[""],"Propietario":[""],"Nombre MVZ":[""], "Cremación":[""],"Dedicatoria":[""]}
  var certificadoKeys = Object.keys(certificadoDict)
  const colFechaServ = getColumn("Info","Fecha de Servicio")
    const colMVZ = getColumn("Info","Veterinario/MVZ")
  certificadoKeys.forEach(function (keyCol){
    let col = getColumn("Info",keyCol);
    var value = ws_info.getRange(row,col).getValue()
    switch (keyCol) {
      case "Fecha Certificado":
        if (value != ""){
          certificadoDict[keyCol][0]= new Date(value).toLocaleDateString("es-MX", {day: "2-digit",month: "2-digit",year:"2-digit",}).trim();
          certificadoDict[keyCol].push(certificadoDict[keyCol][0].length)
        }
        else {
          certificadoDict[keyCol][0] = new Date(ws_info.getRange(row,colFechaServ).getValue()).toLocaleDateString("es-MX", {day: "2-digit",month: "2-digit",year:"2-digit",}).trim();
          certificadoDict[keyCol].push(certificadoDict[keyCol][0].length)
        }
        //cambia de nombre porque en la tabla está con Fecha certificado y el doc está sólo fecha
        //delete certificadoDict[keyCol]
        break
      case "Nombre MVZ":
        if (value != ""){
          certificadoDict[keyCol][0]= value.trim()
          certificadoDict[keyCol].push(certificadoDict[keyCol][0].length)
          break
        } 
        var newValMVZ = ws_info.getRange(row,colMVZ).getValue()
        if (newValMVZ == "NA" || newValMVZ.length == 1){
          certificadoDict[keyCol][0]= " "
          certificadoDict[keyCol].push(certificadoDict[keyCol][0].length)
          break
        }
        certificadoDict[keyCol][0]= String(newValMVZ).trim()
        certificadoDict[keyCol].push(newValMVZ.length)
        break
      case "Nombre de la Mascota":
      case "Raza":
      case "Propietario":
      case "Cremación":
        if (value == "NA" || value.length == 1){
          certificadoDict[keyCol][0]= ""
          certificadoDict[keyCol].push(certificadoDict[keyCol][0].length)
        }
        else {
          certificadoDict[keyCol][0] = value.trim()
          certificadoDict[keyCol].push(certificadoDict[keyCol][0].length)
        }
        break
      case "Edad":
        if (value >=100){
          var epoch = new Date(1899, 11, 30);
          var date = new Date(epoch.getTime() + value * 24 * 60 * 60 * 1000);
          certificadoDict[keyCol][0] = String(date.toLocaleDateString("es-MX", {day: "2-digit",month: "2-digit",year:"2-digit",}))+" - "+ String(certificadoDict["Fecha Certificado"][0])
        }else {
          certificadoDict[keyCol][0] = _splitStringIntoUnitsAndDecimals(value)
        }
          certificadoDict[keyCol].push(certificadoDict[keyCol][0].length)
        break
      case "Especie":
        certificadoDict[keyCol][0] = value
        certificadoDict[keyCol].push(certificadoDict[keyCol][0].length)
        break
      case "Dedicatoria":
        if (value.length > 1){
          certificadoDict[keyCol][0] = '"'+String(value)+'"'
          certificadoDict[keyCol].push(certificadoDict[keyCol][0].length)
        }else {
          certificadoDict[keyCol][0] = "";
          certificadoDict[keyCol].push(0)
        }
      break
    }  
  })
  return certificadoDict
}

function elborarCertificado (infoCertificado){
  /*var infoCertificado= [ { 'Fecha Certificado': [ '04/01/25', 8 ],
    'Nombre de la Mascota': [ 'Jack', 4 ],
    'Especie': [ 'Canino', 6 ],
    'Edad': [ '18 Años', 7 ],
    'Raza': [ 'Cocker', 6 ],
    'Propietario': [ 'Edgar Hurtado', 13 ],
    'Nombre MVZ': [ 'Lopet Cortázar', 14 ],
    'Cremación': [ 'Individual', 10 ],
    'Dedicatoria': 
     [ '"Querido amigo, te extrañaremos mucho"',
       36 ] } ]*/
    // crea el nuevo doc, copia y pega el texto del template
    const tempalteDocId = PropertiesService.getScriptProperties().getProperty("template_certificado_docs")
    const templateDoc = DocumentApp.openById(tempalteDocId);
    const templateBody = templateDoc.getBody();
    var templateMargins = [templateBody.getMarginTop(),templateBody.getMarginBottom(),templateBody.getMarginLeft(),templateBody.getMarginRight()]
    const baseText = templateBody.getNumChildren();
    var destinationFolder = DriveApp.getFolderById(certificadosFolderId);
    const newDoc = DocumentApp.create(new Date().toLocaleDateString('es-MX',{day: '2-digit',month: 'short',year: 'numeric',hour: '2-digit', minute: '2-digit', second: '2-digit',}));
    Docs.Documents.batchUpdate({ requests: [{ updateDocumentStyle: { documentStyle: { flipPageOrientation: true }, fields: "flipPageOrientation" } }] }, newDoc.getId());
    const newDocBody = newDoc.getBody();
    newDocBody.setMarginTop(templateMargins[0])
    newDocBody.setMarginBottom(templateMargins[1])
    newDocBody.setMarginLeft(templateMargins[2])
    newDocBody.setMarginRight(templateMargins[3])
    // paste baseText with same format in new page
    for (let i = 0; i < baseText; i++) {
      const element = templateBody.getChild(i);
      const paragraph = element.copy();
      if(paragraph.getText() == "{{Dedicatoria}}"){
        newDocBody.appendParagraph(paragraph).setIndentEnd(430)
      }else {
        newDocBody.appendParagraph(paragraph);
      }
    }
    var certificadoTittle = Object.keys(infoCertificado[0])
    var certLen = infoCertificado.length
    for (let x=0;x< certLen; x++){
      // para que no copia el baseText del último
      if (x < certLen - 1) {
        for (let i = 0; i < baseText; i++) {
          const element = templateBody.getChild(i);
          const paragraph = element.copy();
          if(paragraph.getText() == "{{Dedicatoria}}"){
            newDocBody.appendParagraph(paragraph).setIndentEnd(430)
          }else {
            newDocBody.appendParagraph(paragraph);
          }
        }
      }
      var lineAdjustDict = checkLineAdjustment(infoCertificado[x])
      var tittleToAdjust = Object.keys(lineAdjustDict)
      if (tittleToAdjust.length > 0){
        tittleToAdjust.forEach(tit =>{
          const foundElement = newDocBody.findText(tit);
          foundElement.getElement().asText().setFontSize(0,foundElement.getEndOffsetInclusive(),lineAdjustDict[tit])
        }) 
      }
      //replace Cert info into template 
      certificadoTittle.forEach(tittle =>{
        const foundElement = newDocBody.findText("{{"+tittle+"}}");
        let text = infoCertificado[x][tittle][0]
        if (tittle == "Dedicatoria"){
          var paragraphs = newDocBody.getParagraphs()
          if(text !=""){
            var lenDedicatoria = infoCertificado[x][tittle][1]
            if (lenDedicatoria <= 35 ){
              var index = 7;
            } else if (lenDedicatoria > 35 && lenDedicatoria < 70){
              var index = 5;
            }else {
              var index = 4;
            }
            while (index < 7) {
              paragraphs[x*21+index].removeFromParent();
                index +=1
              }
          }else {
            // si no es la primera hoja
            if (x > 0) {
              paragraphs[x*21+5].appendText("\n")
            }
          }
        }
        const textElement = foundElement.getElement();
        if (text.length <= 1){
          textElement.editAsText().replaceText("{{"+tittle+"}}", " ");
        } else {
          // Replace the first match with the new text
          textElement.editAsText().replaceText("{{"+tittle+"}}", text);
        }
      })     
    }
    newDoc.saveAndClose();
    DriveApp.getFileById(newDoc.getId()).moveTo(destinationFolder);
    openfile(newDoc.getUrl())
  /*}catch (error){
    Logger.log(error)
    _sendErrorNotification("PetBajío","elborarCertificado",error)
    return error
  }*/
}
function checkLineAdjustment(infoCertificado) {
  var resDict = {}
  //var infoCertificado= {"Nombre MVZ":["Hospital Veterinario San Juan", 29.0], "Fecha Certificado":["15/08/24", 8.0], "Nombre de la Mascota":["test", 4.0], "Propietario":["Cesar Chávez", 12.0], "Especie":["Canino", 6.0], "Edad":["2 Años", 6.0], "Raza":["Dom Mx", 6.0]}
    // cnatidad de letras base en cada linea
  let baseLenLine1 = 40
  let baseLenLine2 = 31
  let baseLenDedicatoria = infoCertificado["Dedicatoria"][1]
  const line1Dict = {
    "Especie": infoCertificado.Especie,
    "Propietario": infoCertificado.Propietario
  };
  const line2Dict = {
    "Raza": infoCertificado.Raza,
    "Nombre MVZ": infoCertificado["Nombre MVZ"]
  };
  const biggerWordLine2 = Object.keys(line2Dict).reduce((maxKey, currentKey) => {
    return line2Dict[currentKey][1] > line2Dict[maxKey][1] ? currentKey : maxKey;
  }, Object.keys(line2Dict)[0]);
  const biggerWordLine1 = Object.keys(line1Dict).reduce((maxKey, currentKey) => {
    return line1Dict[currentKey][1] > line1Dict[maxKey][1] ? currentKey : maxKey;
  }, Object.keys(line1Dict)[0]);
for (let key in infoCertificado) {
  switch (key) {
    case "Fecha Certificado":
    case "Especie":
    case "Propietario":
      baseLenLine1 = baseLenLine1 + infoCertificado[key][1]
    break
    case "Edad":
    case "Raza":
    case "Nombre MVZ":
      baseLenLine2 = baseLenLine2 + infoCertificado[key][1]
    break
  }
}
if (baseLenLine1 >= 81 && baseLenLine1 <= 83) {
  resDict["{{"+biggerWordLine1 +"}}"] = 18
}
if (baseLenLine2 >= 84 && baseLenLine2 <= 88) {
  resDict["{{"+biggerWordLine2+"}}"] = 18
}baseLenDedicatoria
if (baseLenDedicatoria >= 104 && baseLenDedicatoria <= 125) {
  resDict["{{Dedicatoria}}"] = 17
}
return resDict
}
function _splitStringIntoUnitsAndDecimals(inputString) {
  var decimalSeparator = /[.,]/; // Regular expression to match either ',' or '.'
  var splitArray = String(inputString).split(decimalSeparator);
  var units = splitArray[0];
  var decimals = splitArray[1];
  switch (true){
    case (units=="0"&& isNaN(decimals)):
      return ""
    case (units=="1"&& isNaN(decimals)):
      return units+" Año"
    case (units!="1"&& isNaN(decimals)):
      return units+" Años"
    case (units=="0"&& decimals!="0"):
      return decimals+" Meses"
    case (units=="1"&& decimals=="1"):
      return units+" Año "+ decimals+" Mes"
    case (units!="1"&& decimals!="1"):
      return units+" Años "+decimals+" Meses"
    case (units=="1"&& decimals!="1"):
      return units+" Año "+decimals+" Meses"
  }
}
function openfile(fileUrl) {
  _render(fileUrl)
}