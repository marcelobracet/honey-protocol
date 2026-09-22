-- Removes the lead created while verifying the quiz against live production on
-- 2026-09-22. The address belongs to our own domain and never consented in any
-- real sense, so it must not sit in a list that will one day be exported.
--
-- Written as a migration on purpose: the deletion runs once, during a build,
-- with no need to hand the production connection string to anyone.
delete from consents   where email = 'quiz-check@thehoneytrick.com';
delete from quiz_leads where email = 'quiz-check@thehoneytrick.com';
