-- No event log or visitor table. One total per day and counter.
CREATE TABLE IF NOT EXISTS counters (
  day TEXT NOT NULL,
  event TEXT NOT NULL,
  total INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, event)
) WITHOUT ROWID;
