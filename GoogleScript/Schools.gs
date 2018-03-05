/*
 * void -> dict[schoolName : schoolID]
 *
 */
function getSchoolDictionnary()
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheet = openSheetByID(ss, "1156702694");
  
  var nameCol = column(env.schoolCols, headers.school);
  var idCol = column(env.schoolCols, headers.schoolID);
  
  var lastRow = sheet.getLastRow();
  
  var range = sheet.getRange(getA1Notation(nameCol, env.firstRow, nameCol, lastRow));
  var names = range.getValues();
  
  range = sheet.getRange(getA1Notation(idCol, env.firstRow, idCol, lastRow));
  var ids = range.getValues();
  
  names = names.map(function(tab){return tab[0]});
  ids = ids.map(function(tab){return tab[0]});
  
  var dict = {};
  
  for(var i = 0; i < names.length; i++)
  {
    dict[names[i]] = ids[i];
  }
  
  return dict;
}

/*
 * string -> dict[dataName : data]
 * Returns a dictionnary with data from the school
 */
function getSchoolDataFromID(schoolID)
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheet = openSheetByID(ss, "1156702694");
  var idCol = column(env.schoolCols, headers.schoolID);
  
  var lastRow = sheet.getLastRow();
  
  var range = sheet.getRange(getA1Notation(idCol, env.firstRow, idCol, lastRow));
  var ids = range.getValues().map(function(tab){return tab[0]});
  
  var index = ids.indexOf(schoolID);
  if (index < 0)
  {
    throw new Error("getSchoolDataFromID : no school with id : " + schoolID);
  }
  
  var row = env.firstRow + index;
  
  var data = sheet.getRange(row, env.firstCol, 1, env.schoolCols.length).getValues()[0];
  
  var schoolData = 
      {
        name : data[env.schoolCols.indexOf(headers.school)],
        address : data[env.schoolCols.indexOf(headers.address)],
        id : schoolID,
        
        coordinatorInfo :
        {
          fn : data[env.schoolCols.indexOf(headers.coordFN)],
          ln : data[env.schoolCols.indexOf(headers.coordLN)],
          mail : data[env.schoolCols.indexOf(headers.coordMail)],
          phone : data[env.schoolCols.indexOf(headers.coordPhone)],
          gender : data[env.schoolCols.indexOf(headers.coordGender)],
        }
        
      };
  
  return schoolData;
}

/*
 * void -> list[schoolName]
 * 
 */
function getSchoolList()
{
  var schoolDict = getSchoolDictionnary();
  var list = [];
  for(var school in schoolDict)
  {
    list.push(school);
  }
  
  return list;
}
