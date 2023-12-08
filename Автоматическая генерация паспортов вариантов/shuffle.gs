const NKRIT=10;

function Side()
{ 
  var ui = HtmlService.createHtmlOutputFromFile('interface')
  .setTitle('Генератор паспортов вариантов').setWidth(600).setHeight(600);
  SpreadsheetApp.getUi().showSidebar(ui);
}


function onOpen() {
  var ui = SpreadsheetApp.getUi();
   ui.createMenu('scripts')
   .addItem('interface', 'Side') 
   .addToUi();
  
}

function Spisok(){
  var tabl=SpreadsheetApp.getActiveSheet().getRange('C3:D8').getValues();
  Logger.log('tabl='+tabl)
  return tabl;
  
}

function saveP(arr,stat,shag){
  let L=arr.length;
  let l=arr[0].length;
  let rowName=[];
  let colName=[];
  // -----------------------
  for (let i=0; i<L; i++) {
   rowName[i]=[];
   rowName[i][0]='вар.'+(i+1);
  }
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('паспорта').getRange(2, 2,L,1).setValues(rowName);
  // ----------------------
  colName[0]=[];
  for (let i=0; i<l; i++) {
   
   colName[0][i]='зад.'+(i+1);
  }
  
  // ----------------------
  let s=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('паспорта');
  s.getRange(1, 3,1,l).setValues(colName);
  s.getRange(2, 3,L,l).setValues(arr);
  let LL=L;
  L=stat.length;
  for (let i=2;i<LL+3;i+=shag){
    s.getRange(i, 2,1,l+1).setFontColor('red');
   // Logger.log('LL='+LL+' L='+L+' l='+l);
  }
  //==================================
  // L=stat.length;
  l=stat[0].length;
   // -----------------------
  rowName=[];
  for (let i=0; i<L; i++) {
   rowName[i]=[];
   rowName[i][0]='экз.'+(i+1);
  }
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('статистика').getRange(2, 2,L,1).setValues(rowName);
  // ----------------------
  colName=[];
  colName[0]=[];
  for (let i=0; i<l; i++) {
   
   colName[0][i]='зад.'+(i+1);
  }
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('статистика').getRange(1, 3,1,l).setValues(colName);
  // ----------------------
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('статистика').getRange(2, 3,L,l).setValues(stat);
}

function reset (){
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('паспорта').getDataRange().setFontColor('black').clearContent();
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('статистика').clearContents();
}  

function getNastr(){
  let M=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('настройки').getRange('B2').getValue();
  let N=[],delta=[],v0=[];
  [N,delta,v0]=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('настройки').getRange(3,2,3,M).getValues();
  return {M:M,N:N,delta:delta,v0:v0}

}

function newNastr(N,M,delta,v0){
  reset();
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('настройки').getRange('B2').setValue(M);
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('настройки').getRange(3,2,3,M).setValues([N,delta,v0]);
}

//вычисляет все взаимно простые числа с inputNumber, меньшие его и больше lim
function coPrimeNumbers0(inputNumber,lim) {
	    // массив, где будем хранить все найденные числа
    var sequence = [];
    // проходим все числа от lim до введённого числа
    for (let j = lim; j < inputNumber; j++) {
    	// если НОД=1,
        if (nod(j,inputNumber)==1) {
        	// то добавляем это число в массив
            sequence.push(j);
        }
    }
    //возвращаем массив с взаимно простыми делителями
    return sequence;
};

function nod(a,b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b > a) {var temp = a; a = b; b = temp;}
    while (true) {
        if (b == 0) return a;
        a %= b;
        if (a == 0) return b;
        b %= a;
    }
}

function step(n,k){
//  n=25;
//  k=10;
 let rez=1
 for (let i=0;i<k;i++){
    rez*=n;
  } 
  return rez;
}

function fact(k){
  let kk=1;
  for (let i=0;i<k;i++){
    kk=kk*(i+1);
  }
  return kk
}
function Sochet(n,k){
  let f=1;
  if (n==k||k==0)return f;
  let kk=fact(k);
  for (let i=0;i<k;i++){
    f=f*(n-i);
  }
  return   f=f/kk;
}

function rndInt(min, max) {
  // случайное число от min до max
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
 }

