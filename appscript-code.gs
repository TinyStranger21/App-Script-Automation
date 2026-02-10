/**
 * GOOGLE MAPS COMMUTE LOGGER (Fixed)
 * - Logs to "Commute Log" sheet
 * - Sends Email Alert
 * - Handles "Null Spreadsheet" errors
 */

function logAndEmailCommute() {
  // --- CONFIGURATION ---
  const HOME = "3400 Baseline Rd, Boulder, CO 80303"; 
  const WORK = "1301 Walnut St, Boulder, CO 80302";
  const SHEET_NAME = "Commute Log";
  const EMAIL_RECIPIENT = Session.getEffectiveUser().getEmail();
  // ---------------------

  console.log(`🚀 Starting Commute Check...`);

  // STEP 1: CALCULATE ROUTE
  const directions = Maps.newDirectionFinder()
    .setOrigin(HOME)
    .setDestination(WORK)
    .setMode(Maps.DirectionFinder.Mode.TRANSIT)
    .setDepart(new Date()) 
    .getDirections();

  if (!directions.routes || directions.routes.length === 0) {
    console.error("❌ ERROR: No route found between these addresses.");
    return;
  }

  const leg = directions.routes[0].legs[0];
  let busStep = null;

  // Find the bus segment
  for (let i = 0; i < leg.steps.length; i++) {
    if (leg.steps[i].travel_mode === "TRANSIT") {
      busStep = leg.steps[i];
      break; 
    }
  }

  // Prepare Data
  const timestamp = new Date();
  let routeName = "Walking/Other"; 
  let departTime = leg.departure_time.text;
  let arriveTime = leg.arrival_time.text;
  let duration = leg.duration.text;
  let details = "No bus step found.";

  if (busStep) {
    const transit = busStep.transit_details;
    routeName = transit.line.short_name || transit.line.name; 
    departTime = transit.departure_time.text;
    arriveTime = transit.arrival_time.text;
    details = `Catch ${routeName} towards ${transit.headsign}`;
  }

  // STEP 2: LOG TO SHEET
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // CRITICAL CHECK: Is the script attached to a sheet?
    if (!ss) {
      throw new Error("Script is not bound to a spreadsheet. Use 'openById' instead.");
    }

    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if missing
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["Timestamp", "Route", "Departure", "Arrival", "Duration", "Details"]);
    }

    sheet.appendRow([timestamp, routeName, departTime, arriveTime, duration, details]);
    console.log("✅ Sheet updated successfully.");
    
  } catch (e) {
    console.error("❌ SHEET ERROR: " + e.message);
    // If you are running this as a standalone script, paste your Sheet ID below:
    // const ss = SpreadsheetApp.openById("PASTE_YOUR_LONG_SHEET_ID_HERE");
  }

  // STEP 3: SEND EMAIL
  try {
    const subject = `Commute Alert: ${routeName} (${duration})`;
    const body = `
      Route: ${routeName}
      Depart: ${departTime}
      Arrive: ${arriveTime}
      Duration: ${duration}
      
      Details: ${details}
    `;
    
    MailApp.sendEmail(EMAIL_RECIPIENT, subject, body);
    console.log("✅ Email sent to " + EMAIL_RECIPIENT);

  } catch (e) {
    console.error("❌ EMAIL ERROR: " + e.message);
  }
}

/**
 * WEB HOOK RECEIVER
 * Listens for POST requests from your website.
 */
function doPost(e) {
  try {
    // 1. Parse the incoming data (sent from your website)
    const data = JSON.parse(e.postData.contents);
    const home = data.home;
    const work = data.work;

    // 2. Run your Commute Logic (We reuse your existing logic here)
    // We pass the addresses dynamically now!
    const result = calculateCommute(home, work);

    // 3. Send a response back to your website
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Route calculated!",
      data: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error if something breaks
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * REFACTORED COMMUTE FUNCTION
 * Now accepts arguments instead of hardcoded strings.
 * INCLUDES EMAIL AND SHEET LOGGING
 */
function calculateCommute(startAddress, endAddress) {
  const directions = Maps.newDirectionFinder()
    .setOrigin(startAddress)
    .setDestination(endAddress)
    .setMode(Maps.DirectionFinder.Mode.TRANSIT)
    .setDepart(new Date())
    .getDirections();

  if (!directions.routes || directions.routes.length === 0) {
    throw new Error("No route found.");
  }

  const leg = directions.routes[0].legs[0];
  
  // Find bus step for route details
  let busStep = null;
  for (let i = 0; i < leg.steps.length; i++) {
    if (leg.steps[i].travel_mode === "TRANSIT") {
      busStep = leg.steps[i];
      break;
    }
  }

  // Prepare data for logging
  const timestamp = new Date();
  let routeName = "Walking/Other";
  let departTime = leg.departure_time.text;
  let arriveTime = leg.arrival_time.text;
  let duration = leg.duration.text;
  let details = "No bus step found.";

  if (busStep) {
    const transit = busStep.transit_details;
    routeName = transit.line.short_name || transit.line.name;
    departTime = transit.departure_time.text;
    arriveTime = transit.arrival_time.text;
    details = `Catch ${routeName} towards ${transit.headsign}`;
  }

  // LOG TO SHEET (same as logAndEmailCommute)
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!ss) {
      throw new Error("Script is not bound to a spreadsheet.");
    }

    const SHEET_NAME = "Commute Log";
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["Timestamp", "Route", "Departure", "Arrival", "Duration", "Details"]);
    }

    sheet.appendRow([timestamp, routeName, departTime, arriveTime, duration, details]);
    console.log("✅ Sheet updated successfully.");
    
  } catch (e) {
    console.error("❌ SHEET ERROR: " + e.message);
  }

  // SEND EMAIL (same as logAndEmailCommute)
  try {
    const EMAIL_RECIPIENT = Session.getEffectiveUser().getEmail();
    const subject = `Commute Alert: ${routeName} (${duration})`;
    const body = `
      Route: ${routeName}
      Depart: ${departTime}
      Arrive: ${arriveTime}
      Duration: ${duration}
      
      Details: ${details}
    `;
    
    MailApp.sendEmail(EMAIL_RECIPIENT, subject, body);
    console.log("✅ Email sent to " + EMAIL_RECIPIENT);

  } catch (e) {
    console.error("❌ EMAIL ERROR: " + e.message);
  }

  // Return data for the website
  return {
    duration: duration,
    departure: departTime,
    arrival: arriveTime
  };
}
