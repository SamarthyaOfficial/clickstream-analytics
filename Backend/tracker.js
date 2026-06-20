// ---- 1. Get or create a session_id ----
let sessionId = localStorage.getItem("session_id");
if (!sessionId) {
  sessionId = "sess-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  localStorage.setItem("session_id", sessionId);
}

// ---- helper: send one event to the backend ----
function sendEvent(eventData) {
  fetch(`https://clickstream-analytics.onrender.com/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData)
  });
}

// ---- 2. Fire a page_view when the page loads ----
sendEvent({
  session_id: sessionId,
  event_type: "page_view",
  page_url: window.location.pathname
});

// ---- 3. Fire a click event on every click ----
document.addEventListener("click", function (e) {
  sendEvent({
    session_id: sessionId,
    event_type: "click",
    page_url: window.location.pathname,
    x: e.clientX,
    y: e.clientY
  });
});