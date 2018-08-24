function convertRangeToCsvFile(range) 
{
  // get available data range in the spreadsheet
  var activeRange = range;
  try {
    var data = activeRange.getValues();
    var csvFile = undefined;

    // loop through the data in the range and build a string with the csv data
    if (data.length > 1) {
      var csv = "";
      for (var row = 0; row < data.length; row++) {
        for (var col = 0; col < data[row].length; col++) {
          if (data[row][col].toString().indexOf(",") != -1) {
            data[row][col] = "\"" + data[row][col] + "\"";
          }
        }

        // join each row's columns
        // add a carriage return to end of each row, except for the last one
        if (row < data.length-1) {
          csv += data[row].join(",") + "\r\n";
        }
        else {
          csv += data[row];
        }
      }
      csvFile = csv;
    }
    return csvFile;
  }
  catch(err) {
    Logger.log(err);
    Browser.msgBox(err);
  }
}

/*
 * Sheet, int -> int
 * return the last non empty row in the sheet according to the column
 */
function GetLastNonEmptyRow(sheet, col)
{
  var lastRow = sheet.getLastRow();
  var firstRow = 1;
  var a1 = getA1Notation(col, firstRow, col, lastRow);
  var range = sheet.getRange(a1);
  var rows = range.getDisplayValues().map(function(tab){ return tab[0];});
  for(var i = 0; i < rows.length; i++)
  {
    if(rows[i] == "")
    {
      if(i == 0)
      {
        return 1;
      }
      
      return i;
    }
  }
  
  return lastRow;
}

function getIdFromUrl(url) 
{ 
  return url.match(/[-\w]{25,}/); 
}

/************************* SHEETS ********************************/
/*
 * list[headers], string, int, bool -> int
 * Returns the column where the header is
 */
function column(cols, header, firstCol, startZero)
{
  var index = cols.indexOf(header);
  if(index < 0)
  {
    throw new Error("Pas de colonne dont la clé est " + header);
  }
  
  return index + firstCol - (startZero?firstCol:0);
}

/*
 * int -> char
 * Returns the letter notation of the column
 * column >= 1
 */
function num2Col(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function col2num(letter)
{
  var column = 0, length = letter.length;
  for (var i = 0; i < length; i++)
  {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

/*
 * int, int, int, int, -> a1Notation
 * Returns the A1 Notation, eg : 1, 12, 2, 22 -> "A12:B22"
 */
function getA1Notation(col1, row1, opt_col2, opt_row2)
{
  if ((opt_col2 == null && opt_row2 != null) || (opt_col2 != null && opt_row2 == null))
  {
    // One of the optionnal argument is null and not the other
    throw new Error("getA1Notation : One of the optionnal argument is null and not the other");
  }
  
  if(opt_col2 == null)
  {
    return num2Col(col1) + row1.toString();
  }
  
  return num2Col(col1) + row1.toString() + ":" + num2Col(opt_col2) + opt_row2.toString();
}
/* 
 * Spreadsheet, str -> Sheet
 * Open a sheet in a Spreadsheet by ID
 */
function openSheetByID(ss, id)
{
  var sheets = ss.getSheets();
  
  for(var i = 0; i < sheets.length; i++)
  {
    if(sheets[i].getSheetId() == id)
    {
     return sheets[i]; 
    }
  }
  
  throw new Error("Pas de sheet ayant " + id + " pour id dans la spreadsheet " + ss.getName());
}

/*
 * Sheet, str, int, int -> int
 * Returns the Row in which the id is
 */
function getRowIndexByID(sheet, ID, idCol, firstRow)
{
  var lastRow = sheet.getLastRow();
  
  var range;
  
  if (lastRow != firstRow)
  {
    range = sheet.getRange(getA1Notation(idCol, firstRow, idCol, lastRow));
  }
  else
  {
    range = sheet.getRange(getA1Notation(idCol, firstRow));
  }
  
  var ids = range.getValues();
  
  for (var i = 0; i < ids.length; i++)
  {
    if (ID == ids[i][0])
    {
     return i + firstRow; 
    }
  }
  
  return -1;
}

/****************************** SHEET LAYOUT *********************************/
/*
 * sheet, list[str] -> bool
 * 
 */
function isGoodFormat(sheet, cols) 
{
  var range = sheet.getRange(1, env.firstCol, 1, cols.length);
  var values = range.getValues()[0];
  
  for (var i = 0; i < values.length; i++)
  {
    if(values[i] != cols[i])
    {
      SpreadsheetApp.getActiveSpreadsheet().toast("La colonne " + num2Col((i + env.firstCol)) + " est " + values[i] + "\nAttendu : " + cols[i], 
        "Colonnes pas au bon format dans " + sheet.getName(), 10);
      return false;
    }
  }
  
  return true;
}

/****************************** MATHS *****************************************/
/*
 * void -> str
 * Returns a unique string ID
 */
function uniqid() 
{
  return (Math.floor((Math.random()*1000000))).toString(32)+''+(new Date().getTime()).toString(32)
}

/****************************** FORMATS ******************************************/
/* 
 * str -> list[str]
 * lu1330-1430, ma1530-1630 -> [lundi de 13:30 à 14:30, mardi de 15:30 à 16h30]
 */
function getSlotArray(slotString)
{
  if(slotString == "" || slotString == null)
  {
   return []; 
  }
  
  var days =
      {
        lu: "lundi",
        ma: "mardi",
        me: "mercredi",
        je: "jeudi",
        ve: "vendredi",
        sa: "samedi",
        di: "dimanche",
      };
  
  var slots = slotString.split(",");
  
  for(var i = 0; i < slots.length; i++)
  {
    slots[i] = slots[i].trim();
    var string = days[slots[i].substring(0,2)] + " de " + slots[i].substring(2,4) + ":" + slots[i].substring(4,6)
    + " à " + slots[i].substring(7,9) + ":" + slots[i].substring(9,11);
    slots[i] = string;
  }
  
  return slots;
}

/*
 * str -> list[str]
 * absenceString : "21/12/2018, 22/06/2018 ..."
 */
function getDateArray(dateString)
{
  if (dateString == null || dateString == "")
  {
    return []; 
  }
  
  var dates = dateString.split(",");
  
  for(var i = 0; i < dates.length; i++)
  {
    dates[i] = dates[i].trim();
  }
  
  return dates;
}

/*
 * Sheet, str, list[headers], int, int -> void
 * Removes the duplicated lines, uses the column as a filter 
 * /!\ : sorts the sheet
 */
function removeDuplicates(sheet, colKey, cols, firstCol, firstRow)
{
  Logger.log("Remove duplicates")
  var a1notation = getA1Notation(firstCol, firstRow, sheet.getLastColumn(), sheet.getLastRow());
  Logger.log(a1notation)
  var range = sheet.getRange(a1notation);
  var col = column(cols, colKey);
  if (col <= -1)
  {
    throw new Error("Remove duplicates, no column with this key : " + colKey + " in " + cols); 
  }
  range.sort(col);
  var values = range.getDisplayValues();
  col = col - firstCol;
  
  var row = 0;
  
  while (row < values.length)
  {
    var j = row+1;
    while(j < values.length && (values[j][col] == values[row][col]))
    {
      values[j][col] = "";
      j++;
    }
    row = j;
  }
  
  range.setValues(values);
  
  for (var row = values.length - 1; row>=0; row--) 
  {
    if(values[row][col] == "")
    {
      sheet.deleteRow(row + firstRow);
    }
  }
  
  Logger.log("Remove duplicates --END--")
}

/*
 * int, Object -> Object[]
 * returns an array of length len filled with value
 */
function filledRow(len, value) 
{
  return Array.apply(null, Array(len)).map(function(val, idx) { return value});
}
