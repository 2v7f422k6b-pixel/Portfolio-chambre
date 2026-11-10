-- v2 is separate so historical prototype counters cannot masquerade as selected measures.
CREATE TABLE IF NOT EXISTS daily_metrics (
 day TEXT NOT NULL, event TEXT NOT NULL, samples INTEGER NOT NULL DEFAULT 0,
 value_sum INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(day,event)
) WITHOUT ROWID;
