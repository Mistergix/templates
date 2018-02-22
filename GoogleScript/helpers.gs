/************************* SHEETS ********************************/
/*
 * list[headers], header -> int
 * Returns the column where the header is
 */
function column(cols, header)
{
  var index = cols.indexOf(header);
  if(index < 0)
  {
    return -1;
  }
  
  return index + env.firstCol;
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
 * Sheet, str, int -> int
 * Returns the Row in which the id is
 */
function getRowIndexByTutorID(sheet, tutorID, idCol)
{
  var firstRow = env.firstRow;
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
    if (tutorID == ids[i][0])
    {
     return i + env.firstRow; 
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
  var range = sheet.getRange(1, 1, 1, cols.length);
  var values = range.getValues()[0];
  
  for (var i = 0; i < values.length; i++)
  {
    if(values[i] != cols[i])
    {
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
 * str -> str
 * Fri Dec 22 2017 00:00:00 GMT+0100 (CET)
 */
function convertToFrenchDate(dateString) 
{
  if(dateString == null || dateString == "")
  {
    return "";
  }
  var date = new Date(dateString);
  
  var formattedDate = Utilities.formatDate(date, "GMT+02", "dd/MM/yyyy");
  
  return formattedDate;
}
