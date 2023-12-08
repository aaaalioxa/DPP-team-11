function nedom() {
  let s=SpreadsheetApp.getActiveSheet();
  let [[omega],[R]]=s.getRange(2,2,2,1).getValues();
  let x = omega.match(/{.*}/)[0].slice(1,-1).split(',');
  x.forEach((el,i,arr)=>{arr[i]=el.trim()});
  let set=new Set(x); 
  let r=R.split(',');
  r.forEach((el,i,arr)=>{arr[i]=el.trim()[2];})
  let d=new Set(r);
  let dd='';
  d.forEach((value, valueAgain, set) => {
    dd+=value+','; });
  s.getRange(4,2).setValue('Расчет');
  s.getRange(5,2).setValue('D={'+dd.slice(0,-1)+'}');
  d.forEach(el=>{set.delete(el)});
  let sset='';
  if (set.size>0){
  set.forEach((value, set) => {
    sset+=value+','; });
    s.getRange(6,2).setValue('Ω\\D={'+sset.slice(0,-1)+'}');
  } else {
    s.getRange(6,2).setValue('Ω\\D=∅');
  }
  s.getRange('B4:B6').setFontColor('green').setFontFamily('Times New Roman').setFontSize(14).setFontStyle('Italic')
  
}
function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateTask() {
  let s = SpreadsheetApp.getActiveSheet();
  var abc = "abcdefghijklm";
  let omega = abc.slice(0, getRandomInt(4, 8));
  let num = getRandomInt(7, 13);
  var rs = "";
  let i = 0; 
  rs = omega[Math.floor(Math.random() * omega.length)] + 'R' + omega[Math.floor(Math.random() * omega.length)];
  while (i < num){
    rs = rs + ", " + omega[Math.floor(Math.random() * omega.length)] + 'R' + omega[Math.floor(Math.random() * omega.length)];
    i++;
  }
  let omega1 = omega[0];
  for (let i = 1; i < omega.length; i++) {
    omega1 += ", " + omega[i];
  }
  s.getRange(2, 2).setValue("Ω = {" + omega1 + '}');
  s.getRange(3, 2).setValue(rs);
  s.getRange(2, 2).setFontFamily('Times New Roman').setFontSize(14).setFontStyle('Italic')
}
function check() {
  let s=SpreadsheetApp.getActiveSheet();
  let [[omega],[R]]=s.getRange(2,2,2,1).getValues();
  let x = omega.match(/{.*}/)[0].slice(1,-1).split(',');
  x.forEach((el,i,arr)=>{arr[i]=el.trim()});
  let set=new Set(x);
  let r=R.split(',');
  r.forEach((el,i,arr)=>{arr[i]=el.trim()[2];})
  let d=new Set(r);
  let dd='';
  d.forEach((value, valueAgain, set) => {
    dd+=value+','; });
  s.getRange(4,2).setValue('Расчет');
  s.getRange(5,2).setValue('D={'+dd.slice(0,-1)+'}');
  d.forEach(el=>{set.delete(el)});
  d.forEach(el=>{set.delete(el)});
  let sset='';
  let right2 = "";
  if (set.size>0){
  set.forEach((value, set) => {
    sset+=value+','; });
    right2 = String(sset).replace(/[., ]/g,"");
  } else {
    right2 = '0';
  }
  
  var ans = s.getRange(9, 3).getValues();
  ans = String(ans).replace(/[., ]/g,"");
  var ans2 = s.getRange(10, 3).getValues();
  ans2 = String(ans2).replace(/[., ]/g,"");
  var right = String(dd).replace(/[., ]/g,"");

  let rl = String(right).length;
  let al = String(ans).length;
  let rl2 = String(right2).length;
  let al2 = String(ans2).length;

  if (rl == al){
    for (let i = 0; i <= rl; i++){
        if (String(ans).indexOf(String(right).substr(i,1))>=0){
            ans = String(ans).replace(String(right).substr(i,1),'');
        }
    }
  }
  if (rl2 == al2){
    for (let i = 0; i <= rl2; i++){
        if (String(ans2).indexOf(String(right2).substr(i,1))>=0){
            ans2 = String(ans2).replace(String(right2).substr(i,1),'');
        }
    }
  }
  if (ans.length == 0 && ans2.length == 0){
      s.getRange(12,3).setValue("Правильно");
      s.getRange(12,3).setFontColor('green').setFontFamily('Times New Roman').setFontSize(14);
  }
  else
  {
      s.getRange(12,3).setValue("Неправильно");
      s.getRange(12,3).setFontColor('red').setFontFamily('Times New Roman').setFontSize(14);
  }

}
function clean() {
  let s=SpreadsheetApp.getActiveSheet();
  s.getRange('B2:F3').clearContent();
  s.getRange('B5:D6').clearContent();
  s.getRange('C9:C10').clearContent();
  s.getRange('C12').clearContent();
}
