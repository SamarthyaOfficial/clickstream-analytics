const mongoose = require("mongoose");

// The blueprint: what every event document looks like
const eventSchema = new mongoose.Schema({
  session_id: { type: String, required: true },
  event_type: { type: String, required: true },   // "page_view" or "click"
  page_url:   { type: String, required: true },
  timestamp:  { type: Date, default: Date.now },   // auto-fills with current time if not given
  x: { type: Number },   // only for clicks; left empty for page_views
  y: { type: Number },
});

// Turn the blueprint into a usable "model" called Event
module.exports = mongoose.model("Event", eventSchema);