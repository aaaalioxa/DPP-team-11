//импорт LongRun
var exports = exports || {};
var module = module || { exports: exports };
Object.defineProperty(exports, "__esModule", { value: true });


/** 
 * Cоздание меню
 * при открытии таблицы
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Меню заданий')
    .addItem('Обновить таблицу экземпляров-ответов', 'updateTableSamplesAnswers')
    .addItem('Поиск заданий', 'showSidebarTasks')
    .addToUi();
  
    }

/** 
 * Показать sidebar для
 * отображения процесса выполнения
 * скрипта (создание/запись файлов с решениями
 * и создание таблицы с ссылками)
 */

function showSidebarInfoWorking() {
  const output = HtmlService.createHtmlOutputFromFile('sidebar')
    .setTitle('Информация о процессе')
  SpreadsheetApp.getUi().showSidebar(output);
}

/** 
 * Функция возвращает информацию о текущем состоянии
 * выполнения скрипта (создание/запись файлов с решениями
 * и создание таблицы с ссылками)
 */

function getInfoExecution(){
  const info = CacheService.getUserCache().get("statusOfExecution");
  console.log(info);
  return info;
}

/** 
 * Отображение сайдбара для поиска заданий
 * и их решений
 */

function showSidebarTasks() {
  const output = HtmlService.createHtmlOutputFromFile('sidebarTasks')
    .setTitle('Поиск заданий')
  SpreadsheetApp.getUi().showSidebar(output);
}

/** 
 * Поиск номера экземпляра задания в таблице с вариантами
 * idTable, nameSheet - id таблицы и имя листа в этой таблице,
 * в котором осуществляется поиск
 */

function searchSampleOfTask(numVariant, numTask, idTable, nameSheet){
  try {
    const table = SpreadsheetApp.openById(idTable);
    const sheet = table.getSheetByName(nameSheet);
    let numSample = -2;

    numTask--;
    numVariant--;

    const range = sheet.getRange(2+numVariant, 3+numTask);
    sheet.getRange(1, 1, 1, 1)
    const value = range.getValue();
    if(String(value) == "")
      numSample = -2;
    else numSample = range.getValue();

    numTask++;
    numVariant++;
    numSample++;
  
    const result = {numVariant:numVariant, numTask:numTask, numSample:numSample}
    return result;
    }
  catch(e)
  {
   console.log(e.message);
   return {numVariant:-1, numTask:-1, numSample:-1};
   }
}

/** 
 * Поиск ссылок экземпляра и решения задания
 * в активном листе таблицы
 */

function searchUrlFileOfSampleAndAnswer(numVariant, numTask, idTableOfVariants, nameSheetOfVariants, nameSheetOfSamples){
  try{
    const sample = searchSampleOfTask(numVariant, numTask, idTableOfVariants, nameSheetOfVariants);
    if(sample["numVariant"] != -1){
      const sheet = SpreadsheetApp.getActive().getSheetByName(nameSheetOfSamples);

      const numSample = sample["numSample"];
      const res_numTask = sample["numTask"];
  
      const nameSample = sheet.getRange(3*numSample, 2+res_numTask, 1, 1).getValue();
      const nameAnswer = sheet.getRange(3*numSample+1, 2+res_numTask, 1, 1).getValue();

      const urlSample = sheet.getRange(3*numSample, 2+res_numTask, 1, 1).getRichTextValue().getLinkUrl();
      const urlAnswer = sheet.getRange(3*numSample+1, 2+res_numTask, 1, 1).getRichTextValue().getLinkUrl();
  
      const output = {urlSample:urlSample, urlAnswer:urlAnswer, nameSample:nameSample, nameAnswer:nameAnswer};
      console.log(output);
      return output;
    }
    else {
      return {urlSample:"", urlAnswer:"", nameSample:"", nameAnswer:""}
    }
  }
  catch(e)
  {
   console.log(e.message);
   return {};
   }

}

/** 
 * Проверка на то, есть ли такой
 * экземпляр в таблице вариантов
 */

function sampleExist(numVariant, numTask, idTableOfVariants, nameSheetOfVariants){
  const sample = searchSampleOfTask(numVariant, numTask, idTableOfVariants, nameSheetOfVariants);
  if(sample["numVariant"] != -1){
    const numSample = sample["numSample"];

    if(numSample == -1)
      return false
    else return true;
  }
  else return false;
}


/** 
 * Получение текстового содержимого и изображений 
 * документа Google Doc с ссылкой documentUrl
 * и сохранение изображений из документа в папку 
 * documentImages в папке с id : id_MainFolder
 */

function getContentFromDocument(documentUrl, id_MainFolder){
  const documentId = documentUrl.match(/[-\w]{25,}/);
  const document = DocumentApp.openById(documentId);
  let documentName = "";
  documentName = document.getName();
  
  let text = [];
  text = document.getBody().getText().split("\n").filter(item => item != " " && item != "." && !(item.includes("Решение:")) && !(item.includes("Решение")));

  const mainFolder = DriveApp.getFolderById(id_MainFolder);
  const folders = mainFolder.getFoldersByName("documentImages");


  if(!folders.hasNext()){
    var documentImagesFolder = mainFolder.createFolder("documentImages");
  }
  else{
      var documentImagesFolder = folders.next();
    }


  const images = document.getBody().getImages();
  let imageName = "";
  let imageUrl = "";
  const imgCount = images.length;
  let imageArr = [];

  for (var i = 0; i < imgCount; i++){
    imageName = documentName + '-' + i;
    let temp_files = documentImagesFolder.getFilesByName(imageName);
    if(!temp_files.hasNext()){
      let image = images[i].getBlob().setName(imageName);
      let save = documentImagesFolder.createFile(image);
      imageUrl = `https://drive.google.com/uc?export=view&id=${save.getId()}`;
      imageArr.push({imageName:imageName, imageUrl:imageUrl});
      Logger.log(`Saved Image ${imageName} : ${imageUrl}`);
    }
    else {
      let tempFile = temp_files.next();
      imageUrl = `https://drive.google.com/uc?export=view&id=${tempFile.getId()}`;
      imageArr.push({imageName:tempFile.getName(), imageUrl:imageUrl});
    }
  }
  const result = {contentText : text, images : imageArr};
  return result;
}

/** 
 * Получение ссылки на главную папку, где
 * хранятся экземпляры, решения, по имени листа
 * (берется из левого верхнего угла)
 */

function getUrlMainFolder(nameSheet){
  const sheet = SpreadsheetApp.getActive().getSheetByName(nameSheet);
  let url = "";
  url = sheet.getRange(1,1, 1, 1).getRichTextValue().getLinkUrl();
  return url;
}

/** 
 * Получение имени активного листа
 */

function getNameThisSheet(){
  const sheet = SpreadsheetApp.getActive().getActiveSheet();
  let sheetName = "";
  sheetName = sheet.getName();
  return sheetName;
}


/** 
 * Переменная для хранения всей основной 
 * информации об экземплярах и решениях 
 * каждого задания из определенной папки
 */

let arrFolders = [];

/** 
 * Входная точка создания нехватающих 
 * файлов решений заданий, таблицы
 * с гиперссылками экземпляров и ответов.
 * Задания берутся из папки с id, который
 * вводится в диалоговое окно.
 * 
 * Запускает начальную функцию для 
 * LongRun выполнения нужных функций.
 * (для обхода ограничения в 6 минут)
 */

function updateTableSamplesAnswers(){
    const ui = SpreadsheetApp.getUi();
    const result = ui.prompt("Введите id папки", ui.ButtonSet.OK_CANCEL);
    if(result.getSelectedButton() == ui.Button.OK){
      const folderFromId = result.getResponseText()
      arrFolders = createArrFolders(folderFromId);  //7 секунд
    
      executeUpTabSampAnsw();
    }

}


/** 
 * Начальная функция для запуска 
 * функций в LongRun
 */

function executeUpTabSampAnsw() {
    var params = [];

    // shorten the executable time for testing. (default is 240 seconds)
    LongRun.instance.setMaxExecutionSeconds(100);

    executeLongRun("upTabSampAnswMain", arrFolders.length+1, params, "upTabSampAnswInitializer", "upTabSampAnswFinalizer");
}

/** 
 * Функция-инициализатор для LongRun, которая 
 * вызывается в самом начале
 */

function upTabSampAnswInitializer(startIndex, params) {
    if (startIndex == 0) {
        const infoExecution = JSON.stringify({status:"start", info:""});

        CacheService.getUserCache().put("statusOfExecution", infoExecution);

        console.log('*** executeLongRun started. ***');
        showSidebarInfoWorking();
    }
    console.log("testInitializer(startIndex=" + startIndex));
    // demonstrate loading data
}

/** 
 * Основная часть, которая вызывается каждую итерацию
 */

function upTabSampAnswMain(index, params) {
    const arrFolders = JSON.parse(CacheService.getUserCache().get("jsonArrFolders"));
    let infoExecution = "";

    if(index != arrFolders.length){
    arrFolders[index]['answers'] = createAnswersFiles(arrFolders, index);

    const jsonArrFolders = JSON.stringify(arrFolders);
    CacheService.getUserCache().put("jsonArrFolders", jsonArrFolders);
    infoExecution = JSON.stringify({status:"process", info:`Сделано : ${arrFolders[index]['name']}`});
    }
    else {
      createMainSheetWithAnswers(arrFolders);
      infoExecution = JSON.stringify({status:"process", info:"Табличка экземпляров сделана!"});
    }
    
    CacheService.getUserCache().put("statusOfExecution", infoExecution);
    console.log("upTabSampAnswMain(index=" + index));

    // demonstrate the process
    console.log("  processing " + "...");
}


/** 
 * Функция, вызывающаяся в самом конце выполнения LongRun
 */

function upTabSampAnswFinalizer(isFinished, params) {
    console.log("upTabSampAnswFinalizer(" + isFinished + ")");
    // demonstrate finalization
    if (isFinished) {
        const infoExecution = JSON.stringify({status:"completed", info:"Выполнение скрипта завершено!"});
        CacheService.getUserCache().put("statusOfExecution", infoExecution);
        console.log('--- executeLongRun finished. ---');
    }
}

/** 
 * Создание url файла по idFile.
 * Возвращает url.
 */

function createUrl(idFile){
  let id=idFile;
  try {
    const file = DriveApp.getFileById(id)
    const type= file.getMimeType();
    let url = '';
    if (file) {
      if (type=='application/vnd.google-apps.spreadsheet') {
        url+='https://docs.google.com/spreadsheets/d/'+id}
      if (type==MimeType.FOLDER) {
        url+='https://drive.google.com/drive/folders/'+id}   
      if (type==MimeType.GOOGLE_DOCS) {
        url+='https://docs.google.com/document/d/'+id}
      if (type==MimeType.PDF){
        url+='https://docs.google.com/file/d/'+id}
      if (type==MimeType.MICROSOFT_WORD){
        url+='https://docs.google.com/document/d/'+id}
    }
    else {console.log(' нет прав')}
    return url;
  }
  catch(e)
  {console.log(e.message);}
}

/** 
 * Создание таблицы "Таблица_id" с id файлов 
 * из arrFiles для  папки
 * с ответами answerFolder
 */

function createIdTable(arrFiles, answerFolder){
  const folder = answerFolder;

  const temp_ss = folder.getFilesByName("Таблица_id");

  if(temp_ss.hasNext()){
    var temp = temp_ss.next();
    if(temp.getMimeType() == MimeType.GOOGLE_SHEETS){
      var ss = SpreadsheetApp.open(temp);
    }
    else {
      var ss = SpreadsheetApp.create("Таблица_id");
      DriveApp.getFileById(ss.getId()).moveTo(folder);
    }
  }
  else {
    var ss = SpreadsheetApp.create("Таблица_id");
    DriveApp.getFileById(ss.getId()).moveTo(folder);
  }


  const sheet = ss.getActiveSheet();

  for(var i = 0; i < arrFiles.length; i++){
    sheet.getRange(2+i, 1).setValue(arrFiles[i]['name']);
    sheet.getRange(2+i, 2).setValue(arrFiles[i]['id']);
  }
}

/** 
 * Создание файлов для решений и 
 * таблицы с их id, а также передача
 * информации о всех этих файлах
 * в массив arrFolders в соответствующий массив
 * answers соответствующего задания
 * (numberFolder - индекс задания в массиве arrFolders)
 */

function createAnswersFiles(arrfolders, numberFolder){
  let number = 0;
  const arrFiles = arrfolders[numberFolder]['content'];
  const folderName = arrfolders[numberFolder]['name'];
  const folderId = arrfolders[numberFolder]['id_taskFolder'];
  let nameAnswerFolder = "";
  const arrAnswers = [];

  //папка задания, где хранятся папка экземпляров и папка решений
  const folder = DriveApp.getFolderById(folderId); 

  if(arrFiles.length != 0){
    const r = new RegExp("\\d+");
    var numOfTask = Number(folderName.match(r));

    nameAnswerFolder = "Задача " + String(numOfTask) + " ответы"

    var temp_folders = folder.getFoldersByName(nameAnswerFolder)

    if(!temp_folders.hasNext()){
      var answerFolder = folder.createFolder(nameAnswerFolder);
    }
    else {
      var answerFolder = temp_folders.next();
    }

    for(var i = 0; i < arrFiles.length; i++){
      number = Number(arrFiles[i]['name'].substr(-2, 2).replace('_', ''));
      name = "ОЗадача" + String(numOfTask) + "_" + String(number);

      var temp_files = answerFolder.getFilesByName(name);

      if(!temp_files.hasNext()){
        var answerFile = createAnswerFile(name);
        var answerID = answerFile.getId();
        arrAnswers.push({name:name, id:answerID, number:number});

        DriveApp.getFileById(answerID).moveTo(answerFolder);
      }
      else {
        var answerFile = temp_files.next();
        var answerID = answerFile.getId();
        arrAnswers.push({name:name, id:answerID, number:number});
      }
      console.log(`файл ${name} успешно записан`);
    }
    
    createIdTable(arrAnswers, answerFolder);
    console.log(`id таблица для ${nameAnswerFolder} создана`);
  }
  console.log(`Ответы для ${nameAnswerFolder} успешно сделаны`);
  return arrAnswers; 
}

/** 
 * Создание файла для решения
 * с именем name типа Google Doc
 */

function createAnswerFile(name){
  //var answerFile = DriveApp.createFile(name, "", MimeType.PDF);
  const answerFile = DocumentApp.create(name);
  return answerFile;
}

/** 
 * Создание массива с информацией об
 * экземплярах каждого задания и 
 * пока пустой информацией о решениях
 */

function createArrFolders(idFrom){
  const folder = DriveApp.getFolderById(idFrom);
  const folders   = folder.getFolders(); 
  const nameMainFolder = folder.getName();
  let tempArrFolders = [];
  let n = -1; //счетчик 
  
  while(folders.hasNext()) {
    var temp_folder1 = folders.next();
    var folders2 = temp_folder1.getFolders();
    while(folders2.hasNext()){
    var temp_folder2 = folders2.next();  
    if(temp_folder2.getName() == temp_folder1.getName() + ' экземпляры') { 
        n++;
        tempArrFolders.push({name:temp_folder1.getName(), id:temp_folder2.getId(), id_taskFolder:temp_folder1.getId(), content:[], answers:[], nameMainFolder:nameMainFolder, id_MainFolder:idFrom});
        files = temp_folder2.getFiles();
        while(files.hasNext()) {
          var file2 = files.next();
          var nameFile = file2.getName().replace(/\.[^/.]+$/, "") //убрать расширение файла из названия ".docx" и т.д
          tempArrFolders[n]['content'].push({name:nameFile, id:file2.getId()});
        }
        tempArrFolders[n]['content'].sort(compareElementsWithNumInUnderline);
    }
    }
  }
  tempArrFolders.sort(compareElementsWithNum);

  arrFolders = tempArrFolders;

  const jsonArrFolders = JSON.stringify(arrFolders);
  CacheService.getUserCache().put("jsonArrFolders", jsonArrFolders);


  return arrFolders;
}

/** 
 * Создание таблицы с гиперссылками экземпляров
 * и решений для каждого задания
 */

function createMainSheetWithAnswers(arrFolders){
  const table = SpreadsheetApp.getActive();
  const temp_sheet = table.getSheetByName(arrFolders[0]['nameMainFolder'])

  if(temp_sheet == null)
    var sheet = table.insertSheet(arrFolders[0]['nameMainFolder']);
  else {
    var sheet = temp_sheet;
  }

  const n1 = arrFolders.length;
  let n2 = 0;

  const maxSamples = maxSamplesInTask(arrFolders);
  const columnSamplesAnswersHeaders = [];
  const rowTaskHeaders = [];
  let rowsColumnsSamplesAnswers = [];
  let range = sheet.getRange(1,1); //начальные данныые

  for(var i = 0; i < maxSamples; i++){
    columnSamplesAnswersHeaders.push([]);
    columnSamplesAnswersHeaders[3*i].push("Экземпляр");
    columnSamplesAnswersHeaders.push([]);
    columnSamplesAnswersHeaders[3*i+1].push("Решение");
    columnSamplesAnswersHeaders.push([]);
    columnSamplesAnswersHeaders[3*i+2].push("");
  }

  const rangeSamplesAnswersHeaders =  sheet.getRange(3, 1, maxSamples*3, 1);

  rangeSamplesAnswersHeaders.setValues(columnSamplesAnswersHeaders);
  formatHeaders(rangeSamplesAnswersHeaders, '#f0efeb');


  rowTaskHeaders.push([]);
  for(var i = 0; i < n1; i++){
    rowTaskHeaders[0].push(arrFolders[i]['name']);
    n2 = arrFolders[i]['content'].length;
    for(var j = 0; j < n2; j++){
      rowsColumnsSamplesAnswers.push([]);
      rowsColumnsSamplesAnswers[3*j].push(returnHyperlink(arrFolders[i]['content'][j]['name'], createUrl(arrFolders[i]['content'][j]['id'])));

      rowsColumnsSamplesAnswers.push([]);
      rowsColumnsSamplesAnswers[3*j+1].push(returnHyperlink(arrFolders[i]['answers'][j]['name'], createUrl(arrFolders[i]['answers'][j]['id'])));

      rowsColumnsSamplesAnswers.push([]);
      rowsColumnsSamplesAnswers[3*j+2].push("");

    }
    range = sheet.getRange(3, 3+i, rowsColumnsSamplesAnswers.length, 1);
    range.setValues(rowsColumnsSamplesAnswers);
    formatBorders(range);

    rowsColumnsSamplesAnswers = [];
  }

  const rangeHeaders = sheet.getRange(1, 3, 1, n1);
  const rangeBackUrlMainFolder = sheet.getRange(1,1, 2, 1);

  rangeHeaders.setValues(rowTaskHeaders);
  formatHeaders(rangeHeaders, '#e2ece9');

  sheet.getRange(1,1).setValue(returnHyperlink(arrFolders[0]['nameMainFolder'], createUrl(arrFolders[0]['id_MainFolder'])));
  formatHeaders(rangeBackUrlMainFolder, '#fad2e1');

  sheet.getRange(1,1).setWrap(true);
}

//

/** 
 * Создание таблицы с гиперссылками экземпляров
 * и решений для каждого задания
 */

function maxSamplesInTask(arrFolders){
  const n = arrFolders.length;
  let max = 0;
  let temp = 0;

  for(let i = 0; i < n; i++){
    temp = arrFolders[i]['content'].length;
    if(max < temp)
    max = temp;
  }
  return max;
}

/** 
 * Сравнение a и b по номерам,
 * находящимся в имени по ключу "name"
 * (номер в названии не содержит "_")
 */

function compareElementsWithNum(a, b){
    const r = new RegExp("\\d+"); //для выделения номера из названия
    const aNum = Number(a['name'].match(r));
    const bNum = Number(b['name'].match(r));

    if (aNum > bNum) return 1;
    if (aNum == bNum) return 0;
    if (aNum < bNum) return -1;
}

/** 
 * Сравнение a и b по вторым номерам,
 * находящимся в имени по ключу "name"
 * (номер состоит из двух номеров,
 * написанных через "_")
 */

function compareElementsWithNumInUnderline(a, b){
    const aStr = a['name'].substr(-2, 2).replace('_', '');
    const bStr = b['name'].substr(-2, 2).replace('_', '');
    const aNum = Number(aStr);
    const bNum = Number(bStr);

    if (aNum > bNum) return 1;
    if (aNum == bNum) return 0;
    if (aNum < bNum) return -1;
}


/** 
 * Добавляем обводку боковых граней для
 * ячеек из range
 */

function formatBorders(range) {

  range
    .setBorder(
      true, true, true, true, null, null,
      null,
      SpreadsheetApp.BorderStyle.DOUBLE)
}

/** 
 * Форматирование заголовков из range
 * с цветом заднего фона color
 */

function formatHeaders(range, color) {
  range
    .setBorder(
      true, true, true, true, null, null,
      null,
      SpreadsheetApp.BorderStyle.DOUBLE)
    .setBackground(color)
    .setFontSize(12)
    .setFontFamily('Roboto')
    .setFontWeight('bold')
    .setFontLine('underline')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
}

/** 
 * Создание гиперссылки из
 * ссылки urlValue и
 * названия nameValue.
 * Возвращает выражение
 * для создания гиперссылки в гугл таблице
 * "=HYPERLINK(...;...)"
 */

function returnHyperlink(nameValue, urlValue) {
  let hyperlinkValue = '';

  hyperlinkValue = '=HYPERLINK("' + urlValue
      + '";"' + nameValue + '")';

  return hyperlinkValue;

}
