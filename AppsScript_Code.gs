/**
 * ============================================================
 * STUDENT FORUM - GOOGLE APPS SCRIPT BACKEND
 * ============================================================
 * এই কোডটি আপনার Google Sheet-এ Extensions > Apps Script এ পেস্ট করুন।
 * তারপর Deploy > New deployment > Web app হিসেবে ডিপ্লয় করুন।
 * Execute as: Me
 * Who has access: Anyone
 * ডিপ্লয়ের পর যে URL পাবেন সেটি ওয়েবসাইটের config.js ফাইলে বসাতে হবে।
 * ============================================================
 */

// প্রতিটি শীটের নাম (দরকার হলে পরিবর্তন করতে পারেন, কিন্তু website config.js এও মিলাতে হবে)
const SHEETS = {
  STUDENTS: 'Students',
  TEACHERS: 'Teachers',
  COMMITTEE: 'Committee',
  SPECIAL_COMMITTEE: 'SpecialCommittee',
  FORUM_INFO: 'ForumInfo',
  SETTINGS: 'Settings',
  ADMIN: 'Admin',
  EVENTS: 'Events',
  EVENT_REGISTRATIONS: 'EventRegistrations',
  INCOME: 'Income',
  EXPENSES: 'Expenses',
  FEE_SETTINGS: 'FeeSettings',
  FEE_PAYMENTS: 'FeePayments'
};

// ============================================================
// প্রথমবার শীট সেটআপ করার ফাংশন - Apps Script এডিটরে এটি একবার Run করুন
// ============================================================
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Students শীট
  let sh = getOrCreateSheet(ss, SHEETS.STUDENTS);
  setHeaderIfEmpty(sh, [
    'ID', 'RegNo', 'Timestamp', 'Type', 'Name', 'FatherName', 'Mobile', 'Village',
    'PostOffice', 'Union', 'Upazila', 'Thana', 'BloodGroup', 'Profession', 'CurrentCountry',
    'LastClass', 'DakhilBatch', 'HighestEducationClass', 'HighestEducationInstitute',
    'MaritalStatus', 'Facebook', 'Email', 'Comment', 'PhotoURL', 'SignatureURL',
    'Gender', 'IsDeceased', 'Status'
  ]);

  // Teachers শীট
  sh = getOrCreateSheet(ss, SHEETS.TEACHERS);
  setHeaderIfEmpty(sh, [
    'ID', 'RegNo', 'Timestamp', 'Type', 'Name', 'FatherName', 'Mobile', 'Village',
    'PostOffice', 'Union', 'Upazila', 'Thana', 'BloodGroup', 'Designation',
    'HighestEducationClass', 'HighestEducationInstitute', 'MaritalStatus',
    'JoiningDate', 'RetirementDate', 'ServiceLength', 'Facebook', 'Email',
    'Comment', 'PhotoURL', 'SignatureURL', 'IsDeceased', 'Status'
  ]);

  // Committee শীট
  sh = getOrCreateSheet(ss, SHEETS.COMMITTEE);
  setHeaderIfEmpty(sh, [
    'ID', 'FormationDate', 'TermLength', 'Position', 'MemberName', 'Mobile', 'MemberStudentID'
  ]);

  // Special Committee শীট
  sh = getOrCreateSheet(ss, SHEETS.SPECIAL_COMMITTEE);
  setHeaderIfEmpty(sh, [
    'ID', 'CommitteeName', 'FormationDate', 'TermLength', 'Position', 'MemberName', 'Mobile', 'MemberStudentID'
  ]);

  // Forum Info শীট (একটাই রো থাকবে key-value আকারে)
  sh = getOrCreateSheet(ss, SHEETS.FORUM_INFO);
  setHeaderIfEmpty(sh, ['Key', 'Value']);
  const infoDefaults = {
    ForumName: 'শিক্ষার্থী ফোরাম',
    InstituteName: 'আপনার প্রতিষ্ঠানের নাম',
    Tagline: 'একতাই শক্তি',
    Slogan: 'শিক্ষা, ঐক্য, অগ্রগতি',
    FoundingYear: '২০০০',
    Mobile: '০১XXXXXXXXX',
    Facebook: 'https://facebook.com/',
    Email: 'info@example.com',
    Address: 'গ্রাম, ডাকঘর, উপজেলা, জেলা',
    LogoURL: '',
    AboutText: 'এখানে ফোরামের সংক্ষিপ্ত বিবরণ লিখুন।',
    PresidentSignatureURL: ''
  };
  fillDefaultsIfEmpty(sh, infoDefaults);

  // Settings শীট (পাসওয়ার্ড ইত্যাদি)
  sh = getOrCreateSheet(ss, SHEETS.SETTINGS);
  setHeaderIfEmpty(sh, ['Key', 'Value']);
  fillDefaultsIfEmpty(sh, { AdminPassword: 'changeme123' });

  // Events শীট (অনুষ্ঠান তালিকা)
  sh = getOrCreateSheet(ss, SHEETS.EVENTS);
  setHeaderIfEmpty(sh, ['ID', 'Name', 'EventDateTime', 'Venue', 'Fee', 'RegDeadline', 'CreatedAt']);

  // EventRegistrations শীট (অনুষ্ঠানে অংশগ্রহণের রেজিষ্ট্রেশন)
  sh = getOrCreateSheet(ss, SHEETS.EVENT_REGISTRATIONS);
  setHeaderIfEmpty(sh, [
    'ID', 'EventID', 'PersonType', 'PersonRegNo', 'PersonID', 'Name', 'PhotoURL',
    'BatchOrClass', 'Mobile', 'Address', 'PaymentMethod', 'ReceiverName',
    'AccountNumber', 'Amount', 'PaymentDate', 'Status', 'Timestamp'
  ]);

  // Income শীট (আয়)
  sh = getOrCreateSheet(ss, SHEETS.INCOME);
  setHeaderIfEmpty(sh, ['ID', 'InvoiceNo', 'Date', 'Name', 'Mobile', 'Address', 'Items', 'Total', 'CreatedAt']);

  // Expenses শীট (খরচ)
  sh = getOrCreateSheet(ss, SHEETS.EXPENSES);
  setHeaderIfEmpty(sh, ['ID', 'VoucherNo', 'Date', 'Items', 'Total', 'Paid', 'Due', 'CreatedAt']);

  // FeeSettings শীট (সদস্য ফি নির্ধারণ — ইতিহাস সংরক্ষিত থাকে, কার্যকরের তারিখ অনুযায়ী)
  sh = getOrCreateSheet(ss, SHEETS.FEE_SETTINGS);
  setHeaderIfEmpty(sh, ['ID', 'MemberType', 'Amount', 'EffectiveDate', 'CreatedAt']);

  // FeePayments শীট (সদস্যদের ফি প্রদান — পেন্ডিং/কনফার্মড)
  sh = getOrCreateSheet(ss, SHEETS.FEE_PAYMENTS);
  setHeaderIfEmpty(sh, [
    'ID', 'Date', 'MemberType', 'PersonRegNo', 'PersonID', 'Name', 'Mobile',
    'BatchOrClass', 'Profession', 'Address', 'FeeAmount', 'PaymentMethod',
    'DirectRecipientName', 'Status', 'Timestamp'
  ]);

  SpreadsheetApp.flush();
  Logger.log('Setup complete!');
}

function getOrCreateSheet(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function setHeaderIfEmpty(sh, headers) {
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
}

function fillDefaultsIfEmpty(sh, obj) {
  if (sh.getLastRow() <= 1) {
    Object.keys(obj).forEach(k => sh.appendRow([k, obj[k]]));
  }
}

// ============================================================
// WEB APP ENTRY POINTS
// ============================================================

function doGet(e) {
  try {
    const action = e.parameter.action;
    let result;

    switch (action) {
      case 'getForumInfo':
        result = getKeyValueSheet(SHEETS.FORUM_INFO);
        break;
      case 'getDashboard':
        result = getDashboardStats();
        break;
      case 'getStudents':
        result = getSheetAsObjects(SHEETS.STUDENTS);
        break;
      case 'getTeachers':
        result = getSheetAsObjects(SHEETS.TEACHERS);
        break;
      case 'getCommittee':
        result = getSheetAsObjects(SHEETS.COMMITTEE);
        break;
      case 'getSpecialCommittee':
        result = getSheetAsObjects(SHEETS.SPECIAL_COMMITTEE);
        break;
      case 'getEvents':
        result = getSheetAsObjects(SHEETS.EVENTS);
        break;
      case 'getEventRegistrations':
        result = getSheetAsObjects(SHEETS.EVENT_REGISTRATIONS);
        break;
      case 'getIncomes':
        result = getSheetAsObjects(SHEETS.INCOME);
        break;
      case 'getExpenses':
        result = getSheetAsObjects(SHEETS.EXPENSES);
        break;
      case 'getFeeSettings':
        result = getSheetAsObjects(SHEETS.FEE_SETTINGS);
        break;
      case 'getFeePayments':
        result = getSheetAsObjects(SHEETS.FEE_PAYMENTS);
        break;
      case 'getAllData':
        result = getAllDataBundle();
        break;
      case 'checkPassword':
        result = { valid: checkAdminPassword(e.parameter.password) };
        break;
      default:
        result = { error: 'Unknown action' };
    }
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    let result;

    // পাসওয়ার্ড প্রোটেক্টেড action গুলোর জন্য চেক করুন
    const PROTECTED = [
      'saveForumInfo', 'saveCommittee', 'saveSpecialCommittee', 'changePassword', 'addEvent', 'confirmEventRegistration',
      'addIncome', 'updateIncome', 'deleteIncome', 'addExpense', 'updateExpense', 'deleteExpense',
      'addFeeSetting', 'confirmFeePayment'
    ];
    if (PROTECTED.includes(action)) {
      if (!checkAdminPassword(body.password)) {
        return jsonResponse({ error: 'Unauthorized: ভুল পাসওয়ার্ড' });
      }
    }

    switch (action) {
      case 'addStudent':
        result = addRow(SHEETS.STUDENTS, body.data);
        break;
      case 'addTeacher':
        result = addRow(SHEETS.TEACHERS, body.data);
        break;
      case 'updateStudent':
        result = updateRowById(SHEETS.STUDENTS, body.data);
        break;
      case 'updateTeacher':
        result = updateRowById(SHEETS.TEACHERS, body.data);
        break;
      case 'saveForumInfo':
        result = saveKeyValueSheet(SHEETS.FORUM_INFO, body.data);
        break;
      case 'saveCommittee':
        result = replaceSheetRows(SHEETS.COMMITTEE, body.data);
        break;
      case 'saveSpecialCommittee':
        result = replaceSheetRows(SHEETS.SPECIAL_COMMITTEE, body.data);
        break;
      case 'changePassword':
        result = saveKeyValueSheet(SHEETS.SETTINGS, { AdminPassword: body.newPassword });
        break;
      case 'uploadImage':
        result = uploadImageToDrive(body.base64, body.filename, body.mimeType);
        break;
      case 'addEvent':
        result = addEventRow(body.data);
        break;
      case 'addEventRegistration':
        result = addEventRegistrationRow(body.data);
        break;
      case 'confirmEventRegistration':
        result = confirmEventRegistration(body.id);
        break;
      case 'addIncome':
        result = addIncomeRow(body.data);
        break;
      case 'updateIncome':
        result = updateRowById(SHEETS.INCOME, body.data);
        break;
      case 'deleteIncome':
        result = deleteRowById(SHEETS.INCOME, body.id);
        break;
      case 'addExpense':
        result = addExpenseRow(body.data);
        break;
      case 'updateExpense':
        result = updateRowById(SHEETS.EXPENSES, body.data);
        break;
      case 'deleteExpense':
        result = deleteRowById(SHEETS.EXPENSES, body.id);
        break;
      case 'addFeeSetting':
        result = addFeeSettingRow(body.data);
        break;
      case 'addFeePayment':
        result = addFeePaymentRow(body.data);
        break;
      case 'confirmFeePayment':
        result = confirmFeePayment(body.id);
        break;
      default:
        result = { error: 'Unknown action' };
    }
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getSheetAsObjects(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return [];
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  return rows
    .filter(r => r.some(cell => cell !== '' && cell !== null))
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => {
        let val = r[i];
        if (val instanceof Date) val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        obj[h] = val;
      });
      return obj;
    });
}

function getKeyValueSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 1) return {};
  const data = sh.getDataRange().getValues();
  const obj = {};
  data.forEach(row => {
    if (row[0]) obj[row[0]] = row[1];
  });
  return obj;
}

function saveKeyValueSheet(sheetName, dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  const data = sh.getDataRange().getValues();
  const keyRowMap = {};
  data.forEach((row, idx) => { if (row[0]) keyRowMap[row[0]] = idx + 1; });

  Object.keys(dataObj).forEach(key => {
    if (keyRowMap[key]) {
      sh.getRange(keyRowMap[key], 2).setValue(dataObj[key]);
    } else {
      sh.appendRow([key, dataObj[key]]);
    }
  });
  return { success: true };
}

function addRow(sheetName, dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

  const id = 'ID' + new Date().getTime();
  dataObj['ID'] = id;
  dataObj['Timestamp'] = new Date();
  if (!dataObj['Status']) dataObj['Status'] = 'Active';

  const row = headers.map(h => dataObj[h] !== undefined ? dataObj[h] : '');
  sh.appendRow(row);
  return { success: true, id: id };
}

// ID মিলিয়ে বিদ্যমান রো হালনাগাদ করে (এডিট ফিচারের জন্য)
function updateRowById(sheetName, dataObj) {
  if (!dataObj || !dataObj.ID) return { success: false, error: 'ID পাওয়া যায়নি' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('ID');
  if (idCol === -1) return { success: false, error: 'ID কলাম পাওয়া যায়নি' };

  for (let r = 1; r < values.length; r++) {
    if (values[r][idCol] === dataObj.ID) {
      const row = headers.map(h => dataObj[h] !== undefined ? dataObj[h] : values[r][headers.indexOf(h)]);
      sh.getRange(r + 1, 1, 1, row.length).setValues([row]);
      return { success: true, id: dataObj.ID };
    }
  }
  return { success: false, error: 'রেকর্ড খুঁজে পাওয়া যায়নি' };
}

// ============================================================
// অনুষ্ঠান (Events) সংক্রান্ত ফাংশন
// ============================================================

function addEventRow(dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.EVENTS);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

  const id = 'EVT' + new Date().getTime();
  dataObj['ID'] = id;
  dataObj['CreatedAt'] = new Date();

  const row = headers.map(h => dataObj[h] !== undefined ? dataObj[h] : '');
  sh.appendRow(row);
  return { success: true, id: id };
}

// শিক্ষার্থী/শিক্ষকের অনুষ্ঠানে অংশগ্রহণের রেজিষ্ট্রেশন (পাবলিক, পাসওয়ার্ড লাগবে না)
function addEventRegistrationRow(dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.EVENT_REGISTRATIONS);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

  const id = 'EVR' + new Date().getTime();
  dataObj['ID'] = id;
  dataObj['Status'] = 'Pending';
  dataObj['Timestamp'] = new Date();

  const row = headers.map(h => dataObj[h] !== undefined ? dataObj[h] : '');
  sh.appendRow(row);
  return { success: true, id: id };
}

// অ্যাডমিন কর্তৃক অনুষ্ঠান রেজিষ্ট্রেশন নিশ্চিতকরণ (প্রোটেক্টেড)
function confirmEventRegistration(id) {
  return updateRowById(SHEETS.EVENT_REGISTRATIONS, { ID: id, Status: 'Confirmed' });
}

// ============================================================
// আয়-ব্যয় সংক্রান্ত ফাংশন
// ============================================================
function addIncomeRow(dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.INCOME);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const id = 'INC' + new Date().getTime();
  dataObj['ID'] = id;
  dataObj['CreatedAt'] = new Date();
  const row = headers.map(h => dataObj[h] !== undefined ? dataObj[h] : '');
  sh.appendRow(row);
  return { success: true, id: id };
}

function addExpenseRow(dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.EXPENSES);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const id = 'EXP' + new Date().getTime();
  dataObj['ID'] = id;
  dataObj['CreatedAt'] = new Date();
  const row = headers.map(h => dataObj[h] !== undefined ? dataObj[h] : '');
  sh.appendRow(row);
  return { success: true, id: id };
}

// ============================================================
// ফি নির্ধারণ ও ফি প্রদান সংক্রান্ত ফাংশন
// ============================================================

// নতুন ফি নির্ধারণ যোগ করে (ইতিহাস সংরক্ষিত থাকে, ওভাররাইট হয় না)
function addFeeSettingRow(dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.FEE_SETTINGS);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const id = 'FEE' + new Date().getTime();
  dataObj['ID'] = id;
  dataObj['CreatedAt'] = new Date();
  const row = headers.map(h => dataObj[h] !== undefined ? dataObj[h] : '');
  sh.appendRow(row);
  return { success: true, id: id };
}

// সদস্যের ফি প্রদানের অনুরোধ (পাবলিক, পাসওয়ার্ড লাগবে না) — প্রথমে Pending থাকে
function addFeePaymentRow(dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.FEE_PAYMENTS);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const id = 'FPY' + new Date().getTime();
  dataObj['ID'] = id;
  dataObj['Status'] = 'Pending';
  dataObj['Timestamp'] = new Date();
  const row = headers.map(h => dataObj[h] !== undefined ? dataObj[h] : '');
  sh.appendRow(row);
  return { success: true, id: id };
}

// অ্যাডমিন কর্তৃক ফি প্রদান নিশ্চিতকরণ (প্রোটেক্টেড)
function confirmFeePayment(id) {
  return updateRowById(SHEETS.FEE_PAYMENTS, { ID: id, Status: 'Confirmed' });
}



// ID মিলিয়ে বিদ্যমান রো মুছে ফেলে (আয়/খরচ ডিলেট করার জন্য)
function deleteRowById(sheetName, id) {
  if (!id) return { success: false, error: 'ID পাওয়া যায়নি' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('ID');
  if (idCol === -1) return { success: false, error: 'ID কলাম পাওয়া যায়নি' };

  for (let r = 1; r < values.length; r++) {
    if (values[r][idCol] === id) {
      sh.deleteRow(r + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'রেকর্ড খুঁজে পাওয়া যায়নি' };
}

function replaceSheetRows(sheetName, rowsArray) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

  // পুরনো ডাটা মুছুন (হেডার বাদে)
  const lastRow = sh.getLastRow();
  if (lastRow > 1) {
    sh.getRange(2, 1, lastRow - 1, sh.getLastColumn()).clearContent();
  }

  // নতুন ডাটা লিখুন
  rowsArray.forEach((obj, idx) => {
    if (!obj.ID) obj.ID = 'ID' + new Date().getTime() + idx;
    const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');
    sh.getRange(idx + 2, 1, 1, row.length).setValues([row]);
  });
  return { success: true };
}

// একটি মাত্র এক্সিকিউশনে সব ডাটা একসাথে ফেরত দেয় — এতে আলাদা আলাদা ১১টি রিকোয়েস্টের বদলে
// মাত্র ১টি রিকোয়েস্ট লাগে, ফলে ওয়েবসাইট লোড হতে অনেক কম সময় লাগে
function getAllDataBundle() {
  return {
    forumInfo: getKeyValueSheet(SHEETS.FORUM_INFO),
    students: getSheetAsObjects(SHEETS.STUDENTS),
    teachers: getSheetAsObjects(SHEETS.TEACHERS),
    committee: getSheetAsObjects(SHEETS.COMMITTEE),
    specialCommittee: getSheetAsObjects(SHEETS.SPECIAL_COMMITTEE),
    events: getSheetAsObjects(SHEETS.EVENTS),
    eventRegistrations: getSheetAsObjects(SHEETS.EVENT_REGISTRATIONS),
    incomes: getSheetAsObjects(SHEETS.INCOME),
    expenses: getSheetAsObjects(SHEETS.EXPENSES),
    feeSettings: getSheetAsObjects(SHEETS.FEE_SETTINGS),
    feePayments: getSheetAsObjects(SHEETS.FEE_PAYMENTS)
  };
}

function checkAdminPassword(password) {
  const settings = getKeyValueSheet(SHEETS.SETTINGS);
  // Sheet-এ পাসওয়ার্ড শুধু সংখ্যা দিয়ে লেখা হলে Google Sheets এটাকে Number টাইপে রূপান্তর করে ফেলে,
  // অথচ ফরম থেকে আসা পাসওয়ার্ড সবসময় String — তাই strict (===) তুলনা ব্যর্থ হতো। String() দিয়ে ঠিক করা হলো।
  return String(settings.AdminPassword).trim() === String(password).trim();
}

function getDashboardStats() {
  const students = getSheetAsObjects(SHEETS.STUDENTS);
  const teachers = getSheetAsObjects(SHEETS.TEACHERS);

  const stats = {
    formerStudents: 0,
    currentStudents: 0,
    totalMale: 0,
    totalFemale: 0,
    deceasedStudents: 0,
    formerTeachers: 0,
    currentTeachers: 0,
    deceasedTeachers: 0,
    totalStaff: 0,
    professionCounts: {},
    countryCounts: {}
  };

  students.forEach(s => {
    if (s.Type === 'প্রাক্তন') stats.formerStudents++;
    if (s.Type === 'বর্তমান') stats.currentStudents++;
    if (s.Gender === 'ছাত্র') stats.totalMale++;
    if (s.Gender === 'ছাত্রী') stats.totalFemale++;
    if (String(s.IsDeceased).toLowerCase() === 'true' || s.IsDeceased === 'হ্যাঁ') stats.deceasedStudents++;
    if (s.Profession) {
      stats.professionCounts[s.Profession] = (stats.professionCounts[s.Profession] || 0) + 1;
    }
    if (s.CurrentCountry) {
      stats.countryCounts[s.CurrentCountry] = (stats.countryCounts[s.CurrentCountry] || 0) + 1;
    }
  });

  teachers.forEach(t => {
    if (t.Type === 'প্রাক্তন') stats.formerTeachers++;
    if (t.Type === 'বর্তমান') stats.currentTeachers++;
    if (String(t.IsDeceased).toLowerCase() === 'true' || t.IsDeceased === 'হ্যাঁ') stats.deceasedTeachers++;
  });

  stats.totalStaff = teachers.length;

  return stats;
}

// Base64 ছবি Google Drive-এ আপলোড করে public URL রিটার্ন করে
function uploadImageToDrive(base64Data, filename, mimeType) {
  try {
    // ফোল্ডার আছে কিনা চেক করুন, না থাকলে বানান
    const folderName = 'StudentForumUploads';
    let folder;
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }

    const decoded = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decoded, mimeType, filename);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    // Google Drive এর thumbnail endpoint <img> ট্যাগে সবচেয়ে নির্ভরযোগ্যভাবে কাজ করে
    // (uc?export=view প্রায়ই ব্রাউজারে ব্লক হয়ে যায়)
    const url = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1000';
    return { success: true, url: url, fileId: fileId };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
