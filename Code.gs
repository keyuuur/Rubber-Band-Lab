var APP_VERSION = '2026-05-12-ten-shot-trials';
var SCORE_VERSION = 'rbbl-score-v2';
var TEACHER_EMAIL = 'patelk07@psdr3.org';
var ALLOWED_PERIODS = ['1st hour', '7th hour'];
var ROUND1_TRIALS_PER_STRETCH = 10;
var ROUND2_TRIALS_PER_DISTANCE = 10;
var ROUND1_STRETCH_KEYS = ['small', 'medium', 'large'];
var ROUND2_DISTANCE_KEYS = ['3ft', '6ft', '9ft'];

var SHEET_NAMES = {
  raw: 'Submissions_Raw',
  best: 'Best_Scores',
  dashboard: 'Dashboard',
  settings: 'Settings',
  log: 'Troubleshooting_Log'
};

var RAW_COLUMNS = [
  'Timestamp', 'Submission_ID', 'Client_Attempt_ID', 'Group_Key', 'Period', 'Group_Name', 'Member_Names',
  'Score_Total', 'Score_Safety', 'Score_Round1_Data', 'Score_Round1_Science', 'Score_Round2_Video',
  'Score_FBD', 'Score_Conservation', 'Score_Final', 'Percent',
  'Emergency_Mode_Used', 'Needs_Review', 'Review_Reasons', 'App_Version', 'Score_Version', 'User_Agent',
  'Prediction_Choice', 'Prediction_Explanation',
  'Safety_Pompom_Only', 'Safety_Not_At_People', 'Setup_Basket_Backboard', 'Setup_Launch_Line', 'Setup_Round1_6ft', 'Setup_Video_Required'
].concat(
  buildRound1RawColumns_(),
  ['R1_Pattern_Choice', 'R1_Most_Elastic_Potential_Choice', 'R1_Best_For_6ft_Choice', 'Energy_Blank_1', 'Energy_Blank_2'],
  buildRound2RawColumns_(),
  [
    'Video_Email_Confirmed', 'Video_Sender_Email', 'Video_Clip_Description',
    'FBD_Before_Up', 'FBD_Before_Down', 'FBD_Air_Down', 'FBD_Air_Back',
    'Conservation_Q1', 'Conservation_Q2', 'Conservation_Q3', 'Final_Main_Idea', 'Final_Farther_Baskets_Stretch',
    'Raw_JSON'
  ]
);

var BEST_COLUMNS = [
  'Group_Key', 'Period', 'Group_Name', 'Member_Names', 'Best_Score_Total', 'Percent', 'Best_Submission_ID',
  'Best_Timestamp', 'Last_Submission_ID', 'Last_Timestamp', 'Submission_Count', 'Video_Email_Confirmed',
  'Video_Sender_Email', 'Needs_Review', 'Review_Reasons', 'Notes'
];

var LOG_COLUMNS = ['Timestamp', 'Type', 'Message', 'Details'];
var RESULT_CHOICES = ['Made', 'Missed short', 'Missed long', 'Missed side'];
var YES_NO_CHOICES = ['Yes', 'No'];
var STRETCH_CHOICES = ['Small', 'Medium', 'Large'];
var FORCE_CHOICES = ['Applied force', 'Magnetic force', 'Friction', 'Air resistance', 'Gravity', 'Normal force'];
var MAX_RAW_JSON_LENGTH = 30000;

function getRound1FieldNames_() {
  var fields = [];
  ROUND1_STRETCH_KEYS.forEach(function(stretch) {
    for (var i = 1; i <= ROUND1_TRIALS_PER_STRETCH; i++) {
      fields.push('r1_' + stretch + '_t' + i);
    }
  });
  return fields;
}

function getRound2FieldNames_() {
  var fields = [];
  ROUND2_DISTANCE_KEYS.forEach(function(distance) {
    fields.push('r2_' + distance + '_stretch');
    for (var i = 1; i <= ROUND2_TRIALS_PER_DISTANCE; i++) {
      fields.push('r2_' + distance + '_t' + i);
    }
    fields.push('r2_' + distance + '_video');
  });
  return fields;
}

function getRound2CompletionFieldNames_() {
  var fields = [];
  ROUND2_DISTANCE_KEYS.forEach(function(distance) {
    fields.push('r2_' + distance + '_stretch');
    for (var i = 1; i <= ROUND2_TRIALS_PER_DISTANCE; i++) {
      fields.push('r2_' + distance + '_t' + i);
    }
  });
  return fields;
}

function buildRound1RawColumns_() {
  return getRound1FieldNames_().map(columnFromFieldName_);
}

function buildRound2RawColumns_() {
  return getRound2FieldNames_().map(columnFromFieldName_);
}

function columnFromFieldName_(fieldName) {
  return fieldName.split('_').map(function(part) {
    if (/^t\d+$/.test(part)) return part.toUpperCase();
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('_');
}

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('CPS Rubber Band Basket Launch');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSettings() {
  ensureSheets_();
  return {
    ok: true,
    appVersion: APP_VERSION,
    scoreVersion: SCORE_VERSION,
    teacherEmail: TEACHER_EMAIL,
    allowedPeriods: ALLOWED_PERIODS,
    round1TrialsPerStretch: ROUND1_TRIALS_PER_STRETCH,
    round2TrialsPerDistance: ROUND2_TRIALS_PER_DISTANCE
  };
}

function submitLab(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var cleanPayload = sanitizePayload_(payload || {});
    var sheets = ensureSheets_();
    var validation = validateSubmission_(cleanPayload);
    if (!validation.ok) {
      logTrouble_(sheets.log, 'VALIDATION_FAILURE', validation.message, validation);
      return validation;
    }

    var groupKey = normalizeGroupKey_(cleanPayload.period, cleanPayload.group_name);
    var duplicate = findDuplicateAttempt_(sheets.raw, cleanPayload.client_attempt_id);
    if (duplicate) {
      return handleDuplicateAttempt_(sheets, duplicate, cleanPayload, groupKey);
    }

    var score = scoreSubmission(cleanPayload);
    var timestamp = new Date();
    var submissionId = generateSubmissionId_();
    var review = buildReviewFlags_(cleanPayload, score);
    var rawRecord = buildRawRecord_(timestamp, submissionId, groupKey, cleanPayload, score, review);

    appendRawSubmission_(sheets.raw, rawRecord);
    upsertBestScore_(sheets.best, rawRecord);
    rebuildDashboard_(sheets.dashboard, sheets.best);

    return {
      ok: true,
      duplicate: false,
      message: 'Submitted to Mr. Patel\'s Sheet.',
      submissionId: submissionId,
      timestamp: timestamp.toISOString(),
      score: score,
      needsReview: review.needsReview,
      reviewReasons: review.reasons.join('; ')
    };
  } catch (err) {
    try {
      var safeSheets = ensureSheets_();
      var safeDetails = safePayloadSummary_(payload);
      safeDetails.error_type = err && err.name ? err.name : 'Error';
      logTrouble_(safeSheets.log, 'SERVER_ERROR', err && err.message ? err.message : String(err), safeDetails);
    } catch (logErr) {
      // If logging fails, still return a clear student-safe message.
    }
    return {
      ok: false,
      errorCode: 'SERVER_ERROR',
      message: 'The Sheet did not save this time. Keep your answers and show Backup Proof Only to Mr. Patel.'
    };
  } finally {
    try {
      lock.releaseLock();
    } catch (ignored) {}
  }
}

function scoreSubmission(payload) {
  payload = payload || {};
  var score = {
    safety: 0,
    round1Data: 0,
    round1Science: 0,
    round2Video: 0,
    fbd: 0,
    conservation: 0,
    finalConclusion: 0,
    total: 0,
    percent: 0
  };

  var safetyFields = [
    'safety_pompom_only', 'safety_not_at_people', 'setup_basket_backboard',
    'setup_launch_line', 'setup_round1_6ft', 'setup_video_required'
  ];
  score.safety = safetyFields.every(function(field) { return isYesish_(payload[field]); }) ? 2 : 0;

  var r1Fields = getRound1FieldNames_();
  var r1Count = countFilled_(payload, r1Fields);
  score.round1Data = r1Count >= r1Fields.length ? 3 : (r1Count >= ROUND1_TRIALS_PER_STRETCH * 2 ? 2 : (r1Count >= ROUND1_TRIALS_PER_STRETCH ? 1 : 0));

  if (equalsChoice_(payload.r1_pattern_choice, 'More stretch usually made the pom-pom go farther.')) score.round1Science += 1;
  if (equalsChoice_(payload.r1_most_elastic_potential_choice, 'Large stretch')) score.round1Science += 1;
  if (equalsChoice_(payload.energy_blank_1, 'elastic') && equalsChoice_(payload.energy_blank_2, 'kinetic')) score.round1Science += 1;

  var r2Fields = getRound2CompletionFieldNames_();
  var r2Count = countFilled_(payload, r2Fields);
  score.round2Video = r2Count >= r2Fields.length ? 2 : (r2Count >= (ROUND2_TRIALS_PER_DISTANCE + 1) * 2 ? 1 : 0);
  if (equalsChoice_(payload.video_email_confirmed, 'Yes') && hasText_(payload.video_sender_email)) score.round2Video += 1;

  if (equalsChoice_(payload.fbd_before_up, 'Normal force')) score.fbd += 1;
  if (equalsChoice_(payload.fbd_before_down, 'Gravity')) score.fbd += 1;
  if (equalsChoice_(payload.fbd_air_down, 'Gravity')) score.fbd += 1;
  if (equalsChoice_(payload.fbd_air_back, 'Air resistance')) score.fbd += 1;

  if (equalsChoice_(payload.conservation_q1, 'False')) score.conservation += 1;
  if (equalsChoice_(payload.conservation_q2, 'True')) score.conservation += 1;
  if (equalsChoice_(payload.conservation_q3, 'True')) score.conservation += 1;

  if (String(payload.final_main_idea || '').charAt(0).toUpperCase() === 'A') score.finalConclusion += 1;
  if (equalsChoice_(payload.final_farther_baskets_stretch, 'more')) score.finalConclusion += 1;

  score.total = score.safety + score.round1Data + score.round1Science + score.round2Video + score.fbd + score.conservation + score.finalConclusion;
  score.percent = Math.round((score.total / 20) * 100);
  return score;
}

function ensureSheets_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('No active spreadsheet is attached to this Apps Script project.');
  }

  var raw = ensureSheetWithHeaders_(ss, SHEET_NAMES.raw, RAW_COLUMNS);
  var best = ensureSheetWithHeaders_(ss, SHEET_NAMES.best, BEST_COLUMNS);
  var dashboard = ss.getSheetByName(SHEET_NAMES.dashboard) || ss.insertSheet(SHEET_NAMES.dashboard);
  var settings = ss.getSheetByName(SHEET_NAMES.settings) || ss.insertSheet(SHEET_NAMES.settings);
  var log = ensureSheetWithHeaders_(ss, SHEET_NAMES.log, LOG_COLUMNS);

  writeSettings_(settings);
  rebuildDashboard_(dashboard, best);

  return { ss: ss, raw: raw, best: best, dashboard: dashboard, settings: settings, log: log };
}

function appendRawSubmission_(sheet, record) {
  var headers = getHeaders_(sheet);
  sheet.appendRow(headers.map(function(header) {
    return record[header] !== undefined ? record[header] : '';
  }));
}

function upsertBestScore_(sheet, rawRecord, options) {
  options = options || {};
  var headers = getHeaders_(sheet);
  var groupKeyIndex = headers.indexOf('Group_Key');
  var values = sheet.getDataRange().getValues();
  var existingRow = -1;
  for (var i = 1; i < values.length; i++) {
    if (values[i][groupKeyIndex] === rawRecord.Group_Key) {
      existingRow = i + 1;
      break;
    }
  }

  var currentCount = 0;
  var shouldReplaceBest = true;
  if (existingRow > -1) {
    var row = values[existingRow - 1];
    currentCount = Number(row[headers.indexOf('Submission_Count')]) || 0;
    var oldBest = Number(row[headers.indexOf('Best_Score_Total')]) || 0;
    shouldReplaceBest = rawRecord.Score_Total > oldBest || rawRecord.Score_Total === oldBest;
  }

  var record = {};
  if (existingRow > -1) {
    headers.forEach(function(header, index) {
      record[header] = values[existingRow - 1][index];
    });
  }

  if (shouldReplaceBest) {
    record.Group_Key = rawRecord.Group_Key;
    record.Period = rawRecord.Period;
    record.Group_Name = rawRecord.Group_Name;
    record.Member_Names = rawRecord.Member_Names;
    record.Best_Score_Total = rawRecord.Score_Total;
    record.Percent = rawRecord.Percent;
    record.Best_Submission_ID = rawRecord.Submission_ID;
    record.Best_Timestamp = rawRecord.Timestamp;
    record.Video_Email_Confirmed = rawRecord.Video_Email_Confirmed;
    record.Video_Sender_Email = rawRecord.Video_Sender_Email;
    record.Needs_Review = rawRecord.Needs_Review;
    record.Review_Reasons = rawRecord.Review_Reasons;
  }

  record.Last_Submission_ID = rawRecord.Submission_ID;
  record.Last_Timestamp = rawRecord.Timestamp;
  record.Submission_Count = existingRow > -1 && options.skipCountIncrement ? currentCount : currentCount + 1;
  record.Notes = record.Notes || '';

  var rowValues = headers.map(function(header) {
    return record[header] !== undefined ? record[header] : '';
  });

  if (existingRow > -1) {
    sheet.getRange(existingRow, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function normalizeGroupKey_(period, groupName) {
  return normalizeText_(period) + '|' + normalizeText_(groupName);
}

function generateSubmissionId_() {
  return 'RBBL-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 9000 + 1000);
}

function validateSubmission_(payload) {
  var schema = getPayloadSchema_();
  var unknownFields = [];
  Object.keys(payload || {}).forEach(function(key) {
    if (!schema[key]) unknownFields.push(key);
  });
  if (unknownFields.length) {
    return {
      ok: false,
      errorCode: 'UNKNOWN_FIELDS',
      message: 'The submission has unexpected data. Refresh the page and try again, or ask your teacher.',
      fields: unknownFields.slice(0, 10)
    };
  }

  var fieldError = validatePayloadValues_(payload, schema);
  if (fieldError) return fieldError;

  var missing = [];
  if (!hasText_(payload.period)) missing.push('period');
  if (!hasText_(payload.group_name)) missing.push('group_name');
  if (!hasText_(payload.client_attempt_id)) missing.push('client_attempt_id');

  if (missing.length) {
    return {
      ok: false,
      errorCode: 'MISSING_REQUIRED_FIELDS',
      message: 'Period, group name, and attempt ID are required.',
      missingFields: missing
    };
  }

  if (ALLOWED_PERIODS.indexOf(payload.period) === -1) {
    return {
      ok: false,
      errorCode: 'INVALID_PERIOD',
      message: 'Choose 1st hour or 7th hour.',
      allowedPeriods: ALLOWED_PERIODS
    };
  }

  if (countMemberNames_(payload.member_names) < 2) {
    return {
      ok: false,
      errorCode: 'NOT_ENOUGH_MEMBERS',
      message: 'Enter at least 2 group member names. Groups should be 3-4. Ask your teacher if your group has only 2.'
    };
  }

  if (equalsChoice_(payload.video_email_confirmed, 'Yes') && !hasText_(payload.video_sender_email)) {
    return {
      ok: false,
      errorCode: 'VIDEO_EMAIL_REQUIRED',
      message: 'If your group emailed video evidence, enter the school email that sent it.'
    };
  }

  if (hasText_(payload.video_sender_email) && !isEmailLike_(payload.video_sender_email)) {
    return {
      ok: false,
      errorCode: 'INVALID_VIDEO_EMAIL',
      message: 'Enter the school email that sent the video, like name@psdr3.org.'
    };
  }

  var rawJson = JSON.stringify(payload || {});
  if (rawJson.length > MAX_RAW_JSON_LENGTH) {
    return {
      ok: false,
      errorCode: 'SUBMISSION_TOO_LARGE',
      message: 'This submission has too much text. Shorten long answers and try again.'
    };
  }

  return { ok: true };
}

function getPayloadSchema_() {
  var schema = {
    client_attempt_id: { type: 'text', max: 120 },
    period: { type: 'text', max: 20 },
    group_name: { type: 'text', max: 80 },
    member_names: { type: 'text', max: 500 },
    user_agent: { type: 'text', max: 500 },
    emergency_mode_used: { type: 'boolean' },
    server_submission_id: { type: 'text', max: 120 },
    prediction_choice: { type: 'choice', choices: [
      'The pom-pom will usually go farther.',
      'The pom-pom will usually go shorter.',
      'The pullback will not matter much.'
    ] },
    prediction_explanation: { type: 'text', max: 1000 },
    safety_pompom_only: { type: 'boolean' },
    safety_not_at_people: { type: 'boolean' },
    setup_basket_backboard: { type: 'boolean' },
    setup_launch_line: { type: 'boolean' },
    setup_round1_6ft: { type: 'boolean' },
    setup_video_required: { type: 'boolean' },
    r1_pattern_choice: { type: 'choice', choices: [
      'More stretch usually made the pom-pom go farther.',
      'More stretch usually made the pom-pom go shorter.',
      'Stretch did not seem to matter.'
    ] },
    r1_most_elastic_potential_choice: { type: 'choice', choices: ['Small stretch', 'Medium stretch', 'Large stretch'] },
    r1_best_for_6ft_choice: { type: 'choice', choices: ['Small stretch', 'Medium stretch', 'Large stretch', 'No clear best stretch'] },
    energy_blank_1: { type: 'choice', choices: ['elastic', 'kinetic', 'magnetic', 'thermal'] },
    energy_blank_2: { type: 'choice', choices: ['elastic', 'kinetic', 'magnetic', 'thermal'] },
    video_email_confirmed: { type: 'choice', choices: YES_NO_CHOICES },
    video_sender_email: { type: 'text', max: 120 },
    video_clip_description: { type: 'choice', choices: ['Made basket', 'Missed short', 'Missed long', 'Missed side', 'Hit backboard', 'Other / not sure'] },
    fbd_before_up: { type: 'choice', choices: FORCE_CHOICES },
    fbd_before_down: { type: 'choice', choices: FORCE_CHOICES },
    fbd_air_down: { type: 'choice', choices: FORCE_CHOICES },
    fbd_air_back: { type: 'choice', choices: FORCE_CHOICES },
    conservation_q1: { type: 'choice', choices: ['True', 'False'] },
    conservation_q2: { type: 'choice', choices: ['True', 'False'] },
    conservation_q3: { type: 'choice', choices: ['True', 'False'] },
    final_main_idea: { type: 'choice', choices: [
      'A. Stretching the rubber band more can store more elastic potential energy, which can give the pom-pom more motion.',
      'B. Magnetic force made the pom-pom move toward the basket.',
      'C. The pom-pom moved because energy disappeared.',
      'D. The backboard created gravity.'
    ] },
    final_farther_baskets_stretch: { type: 'choice', choices: ['less', 'more', 'no'] }
  };

  getRound1FieldNames_().forEach(function(field) {
    schema[field] = { type: 'choice', choices: RESULT_CHOICES };
  });
  ROUND2_DISTANCE_KEYS.forEach(function(distance) {
    schema['r2_' + distance + '_stretch'] = { type: 'choice', choices: STRETCH_CHOICES };
    for (var i = 1; i <= ROUND2_TRIALS_PER_DISTANCE; i++) {
      schema['r2_' + distance + '_t' + i] = { type: 'choice', choices: RESULT_CHOICES };
    }
    schema['r2_' + distance + '_video'] = { type: 'choice', choices: YES_NO_CHOICES };
  });
  return schema;
}

function validatePayloadValues_(payload, schema) {
  var invalid = [];
  Object.keys(schema).forEach(function(field) {
    var rule = schema[field];
    var value = payload[field];
    if (!hasText_(value) && rule.type !== 'boolean') return;

    if (rule.type === 'text') {
      if (hasText_(value) && String(value).length > rule.max) {
        invalid.push(field + ' is too long');
      }
      return;
    }

    if (rule.type === 'choice') {
      if (hasText_(value) && !choiceAllowed_(value, rule.choices)) {
        invalid.push(field + ' has an invalid choice');
      }
      return;
    }

    if (rule.type === 'boolean' && !booleanAllowed_(value)) {
      invalid.push(field + ' has an invalid yes/no value');
    }
  });

  if (!invalid.length) return null;
  return {
    ok: false,
    errorCode: 'INVALID_FIELD_VALUE',
    message: 'One answer has an unexpected value. Refresh the page and try again, or ask your teacher.',
    details: invalid.slice(0, 10)
  };
}

function choiceAllowed_(value, choices) {
  return choices.some(function(choice) {
    return equalsChoice_(value, choice);
  });
}

function booleanAllowed_(value) {
  if (value === undefined || value === null || value === '') return true;
  if (value === true || value === false) return true;
  return ['true', 'false', 'yes', 'no'].indexOf(String(value).toLowerCase()) > -1;
}

function buildRawRecord_(timestamp, submissionId, groupKey, payload, score, review) {
  var record = {
    Timestamp: timestamp,
    Submission_ID: submissionId,
    Client_Attempt_ID: payload.client_attempt_id,
    Group_Key: groupKey,
    Period: payload.period,
    Group_Name: payload.group_name,
    Member_Names: payload.member_names,
    Score_Total: score.total,
    Score_Safety: score.safety,
    Score_Round1_Data: score.round1Data,
    Score_Round1_Science: score.round1Science,
    Score_Round2_Video: score.round2Video,
    Score_FBD: score.fbd,
    Score_Conservation: score.conservation,
    Score_Final: score.finalConclusion,
    Percent: score.percent,
    Emergency_Mode_Used: payload.emergency_mode_used === true,
    Needs_Review: review.needsReview,
    Review_Reasons: review.reasons.join('; '),
    App_Version: APP_VERSION,
    Score_Version: SCORE_VERSION,
    User_Agent: payload.user_agent || '',
    Raw_JSON: JSON.stringify(payload)
  };

  var fieldMap = {
    Prediction_Choice: 'prediction_choice',
    Prediction_Explanation: 'prediction_explanation',
    Safety_Pompom_Only: 'safety_pompom_only',
    Safety_Not_At_People: 'safety_not_at_people',
    Setup_Basket_Backboard: 'setup_basket_backboard',
    Setup_Launch_Line: 'setup_launch_line',
    Setup_Round1_6ft: 'setup_round1_6ft',
    Setup_Video_Required: 'setup_video_required',
    R1_Pattern_Choice: 'r1_pattern_choice',
    R1_Most_Elastic_Potential_Choice: 'r1_most_elastic_potential_choice',
    R1_Best_For_6ft_Choice: 'r1_best_for_6ft_choice',
    Energy_Blank_1: 'energy_blank_1',
    Energy_Blank_2: 'energy_blank_2',
    Video_Email_Confirmed: 'video_email_confirmed',
    Video_Sender_Email: 'video_sender_email',
    Video_Clip_Description: 'video_clip_description',
    FBD_Before_Up: 'fbd_before_up',
    FBD_Before_Down: 'fbd_before_down',
    FBD_Air_Down: 'fbd_air_down',
    FBD_Air_Back: 'fbd_air_back',
    Conservation_Q1: 'conservation_q1',
    Conservation_Q2: 'conservation_q2',
    Conservation_Q3: 'conservation_q3',
    Final_Main_Idea: 'final_main_idea',
    Final_Farther_Baskets_Stretch: 'final_farther_baskets_stretch'
  };

  getRound1FieldNames_().concat(getRound2FieldNames_()).forEach(function(fieldName) {
    fieldMap[columnFromFieldName_(fieldName)] = fieldName;
  });

  Object.keys(fieldMap).forEach(function(column) {
    record[column] = payload[fieldMap[column]];
  });

  return sanitizeRecordForSheet_(record);
}

function buildReviewFlags_(payload, score) {
  var reasons = [];
  var r1Fields = getRound1FieldNames_();
  var r2Fields = getRound2CompletionFieldNames_();
  if (!equalsChoice_(payload.video_email_confirmed, 'Yes')) reasons.push('Video email not confirmed');
  if (score.total < 12) reasons.push('Low score');
  if (countFilled_(payload, r1Fields) < r1Fields.length) reasons.push('Round 1 trials incomplete');
  if (countFilled_(payload, r2Fields) < r2Fields.length) reasons.push('Round 2 entries incomplete');
  return { needsReview: reasons.length > 0, reasons: reasons };
}

function handleDuplicateAttempt_(sheets, duplicate, payload, groupKey) {
  if (!duplicateAttemptMatches_(duplicate, payload, groupKey)) {
    logTrouble_(sheets.log, 'DUPLICATE_CONFLICT', 'A duplicate attempt ID had different group or answer data.', {
      attempt_id: payload.client_attempt_id,
      group_key: groupKey
    });
    return {
      ok: false,
      errorCode: 'DUPLICATE_ATTEMPT_CONFLICT',
      message: 'This iPad has a saved attempt ID that does not match this group work. Ask your teacher before submitting again.'
    };
  }

  upsertBestScore_(sheets.best, duplicate, { skipCountIncrement: true });
  rebuildDashboard_(sheets.dashboard, sheets.best);
  return {
    ok: true,
    duplicate: true,
    message: 'This attempt was already submitted. Returning the saved submission.',
    submissionId: duplicate.Submission_ID,
    timestamp: responseTimestamp_(duplicate.Timestamp),
    score: {
      total: Number(duplicate.Score_Total) || 0,
      percent: Number(duplicate.Percent) || 0
    },
    needsReview: duplicate.Needs_Review === true || duplicate.Needs_Review === 'TRUE',
    reviewReasons: duplicate.Review_Reasons || ''
  };
}

function responseTimestamp_(value) {
  if (value instanceof Date) return value.toISOString();
  return hasText_(value) ? String(value) : new Date().toISOString();
}

function duplicateAttemptMatches_(duplicate, payload, groupKey) {
  if (!duplicate || duplicate.Group_Key !== groupKey) return false;
  var storedPayload = parseRawJson_(duplicate.Raw_JSON);
  if (!storedPayload) return false;
  return payloadFingerprint_(storedPayload) === payloadFingerprint_(payload);
}

function parseRawJson_(rawJson) {
  if (!hasText_(rawJson)) return null;
  try {
    return JSON.parse(String(rawJson));
  } catch (err) {
    return null;
  }
}

function payloadFingerprint_(payload) {
  var schema = getPayloadSchema_();
  var ignored = {
    user_agent: true,
    emergency_mode_used: true,
    server_submission_id: true
  };
  var cleaned = sanitizePayload_(payload || {});
  var parts = [];
  Object.keys(schema).sort().forEach(function(field) {
    if (ignored[field]) return;
    var value = cleaned[field];
    parts.push(field + '=' + String(value === undefined || value === null ? '' : value));
  });
  return parts.join('|');
}

function rebuildDashboard_(dashboardSheet, bestSheet) {
  dashboardSheet.clear();
  dashboardSheet.getRange(1, 1, 1, 7).setValues([['Period', 'Groups', 'Average Best Score', 'Video Confirmed', 'Needs Review', 'Last Updated', 'Teacher Email']]);

  var bestValues = bestSheet.getDataRange().getValues();
  if (bestValues.length < 2) {
    dashboardSheet.getRange(2, 1, 1, 7).setValues([['No submissions yet', '', '', '', '', new Date(), TEACHER_EMAIL]]);
    return;
  }

  var headers = bestValues[0];
  var stats = {};
  ALLOWED_PERIODS.forEach(function(period) {
    stats[period] = { groups: 0, scoreSum: 0, video: 0, review: 0 };
  });

  for (var i = 1; i < bestValues.length; i++) {
    var row = bestValues[i];
    var period = row[headers.indexOf('Period')] || 'Unknown';
    if (!stats[period]) stats[period] = { groups: 0, scoreSum: 0, video: 0, review: 0 };
    stats[period].groups += 1;
    stats[period].scoreSum += Number(row[headers.indexOf('Best_Score_Total')]) || 0;
    if (row[headers.indexOf('Video_Email_Confirmed')] === 'Yes') stats[period].video += 1;
    if (row[headers.indexOf('Needs_Review')] === true || row[headers.indexOf('Needs_Review')] === 'TRUE') stats[period].review += 1;
  }

  var summaryRows = Object.keys(stats).map(function(period) {
    var s = stats[period];
    return [period, s.groups, s.groups ? Math.round((s.scoreSum / s.groups) * 10) / 10 : '', s.video, s.review, new Date(), TEACHER_EMAIL];
  });
  dashboardSheet.getRange(2, 1, summaryRows.length, 7).setValues(summaryRows);

  var detailStart = summaryRows.length + 4;
  dashboardSheet.getRange(detailStart, 1, 1, BEST_COLUMNS.length).setValues([BEST_COLUMNS]);
  dashboardSheet.getRange(detailStart + 1, 1, bestValues.length - 1, BEST_COLUMNS.length).setValues(bestValues.slice(1));
  dashboardSheet.autoResizeColumns(1, Math.min(BEST_COLUMNS.length, 12));
}

function findDuplicateAttempt_(sheet, attemptId) {
  var headers = getHeaders_(sheet);
  var attemptIndex = headers.indexOf('Client_Attempt_ID');
  if (attemptIndex === -1 || !attemptId) return null;

  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][attemptIndex] === attemptId) {
      var record = {};
      headers.forEach(function(header, index) {
        record[header] = values[i][index];
      });
      return record;
    }
  }
  return null;
}

function ensureSheetWithHeaders_(ss, name, headers) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  var currentHeaders = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else if (currentHeaders.join('|') !== headers.join('|')) {
    if (sheet.getMaxColumns() < headers.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function writeSettings_(sheet) {
  sheet.clear();
  sheet.getRange(1, 1, 8, 2).setValues([
    ['Setting', 'Value'],
    ['Allowed_Periods', ALLOWED_PERIODS.join(', ')],
    ['Teacher_Email', TEACHER_EMAIL],
    ['Round1_Trials_Per_Stretch', ROUND1_TRIALS_PER_STRETCH],
    ['Round2_Trials_Per_Distance', ROUND2_TRIALS_PER_DISTANCE],
    ['App_Version', APP_VERSION],
    ['Score_Version', SCORE_VERSION],
    ['Last_Checked', new Date()]
  ]);
  sheet.setFrozenRows(1);
}

function logTrouble_(sheet, type, message, details) {
  sheet.appendRow([new Date(), type, message, JSON.stringify(details || {})]);
}

function sanitizeRecordForSheet_(record) {
  var cleaned = {};
  Object.keys(record || {}).forEach(function(key) {
    cleaned[key] = safeSheetValue_(record[key]);
  });
  return cleaned;
}

function safeSheetValue_(value) {
  if (typeof value !== 'string') return value;
  if (/^[=+\-@\t\r]/.test(value)) return "'" + value;
  return value;
}

function safePayloadSummary_(payload) {
  payload = payload || {};
  return {
    attempt_id: payload.client_attempt_id || '',
    period: payload.period || '',
    group_key: payload.period && payload.group_name ? normalizeGroupKey_(payload.period, payload.group_name) : '',
    app_version: APP_VERSION
  };
}

function sanitizePayload_(payload) {
  var cleaned = {};
  Object.keys(payload || {}).forEach(function(key) {
    var value = payload[key];
    if (typeof value === 'string') {
      cleaned[key] = value.trim();
    } else {
      cleaned[key] = value;
    }
  });
  return cleaned;
}

function getHeaders_(sheet) {
  if (sheet.getLastColumn() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function countFilled_(payload, fields) {
  return fields.reduce(function(total, field) {
    return total + (hasText_(payload[field]) ? 1 : 0);
  }, 0);
}

function countMemberNames_(memberNames) {
  if (!hasText_(memberNames)) return 0;
  return String(memberNames)
    .split(/[\n,;]+/)
    .map(function(name) { return name.trim(); })
    .filter(function(name) { return name !== ''; })
    .length;
}

function hasText_(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function isYesish_(value) {
  return value === true || String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'yes';
}

function isEmailLike_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function equalsChoice_(actual, expected) {
  return normalizeText_(actual) === normalizeText_(expected);
}

function normalizeText_(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}
