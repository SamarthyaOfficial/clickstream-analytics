const express = require("express");// bring in the waiter tool
const Event = require("./event");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();   // loads the .env file so we can read MONGO_URI


const app = express();                // create our waiter
app.use(cors()); 
app.use(express.json()); 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.log("MongoDB connection error:", err));

// POST /api/events — receive an event and store it
app.post("/api/events", async (req, res) => {
  try {
    const newEvent = new Event(req.body);   // build an event from the data sent in
    await newEvent.save();                   // save it to MongoDB
    res.status(201).json({ message: "Event saved!", event: newEvent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// Define ONE menu item: when someone GETs "/", respond with a message
app.get("/", (req, res) => {
  res.send("Hello! My server is alive.");
});

app.get("/api/sessions/:id/events", async (req, res) => {
  try {
    const events = await Event.find({ session_id: req.params.id })
                              .sort({ timestamp: 1 });   // 1 = oldest first
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clicks?page_url=/home — all click events for one page (for the heatmap)
app.get("/api/clicks", async (req, res) => {
  try {
    const events = await Event.find({
      event_type: "click",
      page_url: req.query.page_url
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions — list every session with its total event count
app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: "$session_id",        // group all events by their session_id
          eventCount: { $sum: 1 }    // for each group, add 1 per event = the count
        }
      },
      { $sort: { eventCount: -1 } }  // optional: most active sessions first
    ]);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});