// Google Apps Script: appends each contact-form submission as a row in the bound spreadsheet.
// Setup: see steps in the project chat / README. Deploy as Web app, Execute as: Me, Access: Anyone.

const HEADERS = ['Timestamp', 'Name', 'Email', 'College / Organisation', 'Phone', 'Inquiry Type', 'Event', 'Message'];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  const p = e.parameter;
  sheet.appendRow([new Date(), p.name, p.email, p.college, p.phone, p.category, p.event, p.message].map(clean));
  return ContentService.createTextOutput('ok');
}

// Stops values starting with = + - @ from being run as spreadsheet formulas.
function clean(v) {
  v = v == null ? '' : String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
