/* Regenerate the browser allowlist after editing the collector's fixed catalogue. */
import {readFileSync,writeFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../analytics-service/metrics.json',import.meta.url),'utf8'));
writeFileSync(new URL('../nana-analytics-catalog.js',import.meta.url),'/* Shared fixed names. Keep in sync with analytics-service/metrics.json. */\nwindow.NANA_ANALYTICS_CATALOG = '+JSON.stringify(data)+';\n');
