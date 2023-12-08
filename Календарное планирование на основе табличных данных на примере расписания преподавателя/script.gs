function constHOURS(fromStr) { // подсчитывает часы и минуты в мс
  let sepIdx1 = fromStr.indexOf(":");
  let hoursStr = fromStr.substring(0, sepIdx1);
  let minsStr = fromStr.substring(sepIdx1 + 1);
  const MILLIS_PER_HOURS1 = 1000 * 60 * 60 * hoursStr + 1000 * 60 * minsStr;


  return MILLIS_PER_HOURS1;
}


function calendar() { // главная функция


  var cal = CalendarApp.getCalendarById("rejeverfaj@gmail.com"); // соеденяем с календарем(указываем индекс календаря)
  var spreadsheet = SpreadsheetApp.getActive();
  var teklist = spreadsheet.getSheetByName('верхниз');
  var table = SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(teklist); //подключаем соответствующий лист таблицы
  var teklist2 = spreadsheet.getSheetByName('2023 ОСЕНЬ');
  var table2 = SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(teklist2);


  var dlinna = table.getLastRow();
  var dlinna2 = table2.getLastRow();
  var shirina2 = table2.getLastColumn();


  var data = table.getRange("A3:E" + dlinna).getValues(); // записываем значения из таблицы дат верхниз
  var data2 = table2.getRange("A1:I" + dlinna2).getValues(); // записываем значения из таблицы расписания 2023 ОСЕНЬ


  var y = 0; // элементы для подсчета дня недели(для верхней и нижней недели соответственно)
  var t = 0;




  for (var j = 3; j < data2.length; j++) { // название мероприятия
    if (j % 2 == 1) { // верхняя неделя
      var couple = '';
      y += 1; // счетчик дня недели
      for (var column = 2; column < shirina2; column++) { // номер пары временных промежутков(столбца)
        couple = data2[j][column]; // записываем название
        var row = j + 1; // номер строки
        var data23 = table2.getRange(row, column + 1); // диапазон объедененной ячейки
        for (var i = 0; i < data.length; i++) { // записываем временной промежуток
          if (i % 2 == 1) { // отделяем верхнюю неделю
            if (couple == '') { // записано ли мероприятие в объединенной ячейке
              couple = (data23.isPartOfMerge() ? data23.getMergedRanges()[0].getCell(1, 1) : data23).getValue(); // записываем название мероприятия из объединенной ячейки
            }
            if (couple != '') { // проверка, есть ли мероприятие
              startDate = data[i][2]; // начальная дата
              // endDate = data[i][3];
              const MILLIS_PER_DAY = 1000 * 60 * 60 * 24 * (y - 1); // считаем сколько дней в мс нужно прибавить к дате начала
              const now = new Date(startDate);
              const newDate = new Date(now.getTime() + MILLIS_PER_DAY); // меняем день недели(дата)
              newDate.setHours(0); // обнуляем часы у даты


              var time = data2[2][column]; // выписывем временной промежуток из таблицы


              let sepIdx = time.indexOf("-"); // разделительный знак


              let fromStr = time.substring(0, sepIdx); // выписываем начальное время
              let toStr = time.substring(sepIdx + 1);// выписываем конечное время


              fromStr = fromStr.trim(); // убераем лишние пробелы
              toStr = toStr.trim();


              var stime = new Date(newDate.getTime() + constHOURS(fromStr)); // полное начальное время
              var etime = new Date(newDate.getTime() + constHOURS(toStr)); // полное конечное время


              cal.createEvent(couple, stime, etime); // выводдим данные в календарь
              // }
            }
          }
        }


      }
    }
    if (j % 2 == 0) { // нижняя неделя
      var couple = '';
      t += 1;
      for (var column = 2; column < shirina2; column++) { // номер пары временных промежутков(столбца)
        couple = data2[j][column]; // записываем название
        var row = j + 1;
        var data23 = table2.getRange(row, column + 1);
        for (var i = 0; i < data.length; i++) { // записываем временной промежуток
          if (i % 2 == 0) { // отделяем нижнюю неделю
            if (couple == '') { // записано ли мероприятие в объединенной ячейке
              couple = (data23.isPartOfMerge() ? data23.getMergedRanges()[0].getCell(1, 1) : data23).getValue(); // записываем название мероприятия, если ячейки объеденены
            }
            if (couple != '') { // проверка, есть ли мероприятие
              startDate = data[i][2];
              const MILLIS_PER_DAY = 1000 * 60 * 60 * 24 * (t - 1);
              const now = new Date(startDate);
              const newDate = new Date(now.getTime() + MILLIS_PER_DAY); // день недели(дата в итоге)
              newDate.setHours(0);


              var time = data2[2][column];


              let sepIdx = time.indexOf("-");


              let fromStr = time.substring(0, sepIdx);
              let toStr = time.substring(sepIdx + 1);


              fromStr = fromStr.trim();
              toStr = toStr.trim();


              var stime = new Date(newDate.getTime() + constHOURS(fromStr));
              var etime = new Date(newDate.getTime() + constHOURS(toStr));


              cal.createEvent(couple, stime, etime); // выводдим данные в календарь
            }
          }
        }
      }
    }
  }
}
