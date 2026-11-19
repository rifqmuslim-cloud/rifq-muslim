'use strict';
/**
 * RIFQ Muslim - content sync.
 *
 * The API serves the shared Islamic content and the country/city datasets from
 * server/data. Those files are generated from the single source of truth in
 * mobile/src/data so the app and the backend can never drift apart.
 *
 * Run with: node scripts/sync-content.js
 */
const fs = require('fs');
const path = require('path');
