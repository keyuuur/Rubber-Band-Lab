# AGENTS.md - CPS Rubber Band Basket Launch Web App

## Project Goal
Build a first-pass Google Apps Script web app for a 9th grade rubber band basket launch lab. Students use iPads, work in groups, record simple launch data, answer energy/force questions, confirm emailed video evidence, and submit to Google Sheets.

## Classroom Priorities
- iPad-friendly, low-reading, and easy to tap.
- One submission per group.
- Local autosave so refreshes do not erase work.
- Use the wording "Backup Proof Only" for the local proof screen.
- Sheet submission success must look clearly different from backup proof.
- Deterministic scoring out of 20.
- Raw submissions are preserved and best score is kept by group.

## Non-Negotiables
- Use raw Google Apps Script files only: `Code.gs`, `Index.html`, `Styles.html`, and `Script.html`.
- Use Google Sheets tabs: `Submissions_Raw`, `Best_Scores`, `Dashboard`, `Settings`, and `Troubleshooting_Log`.
- Period choices are limited to 1st hour and 7th hour.
- Video evidence is emailed to `patelk07@psdr3.org`; do not build video upload.
- Free-body diagram labels use dropdowns, not drag-and-drop.
- Do not add npm, frameworks, login, external databases, scheduled jobs, or extra polish beyond the handoff.

## First-Pass Agent Workflow
- Use one implementation agent for the main build.
- Keep planning, implementation, QA notes, and final fixes separate.
- Do not let multiple agents edit the same files at the same time.
- After implementation, create `FIRST_PASS_BUILD_NOTES.md` with setup, schema, deployment notes, known limits, and QA next steps.
