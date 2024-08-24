const express = require('express');
const path = require('path');
const fetch = require('node-fetch');  // Ensure this is installed: npm install node-fetch
const ICAL = require('ical.js');      // Ensure this is installed: npm install ical.js
const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Serve the main page (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to add a schedule
app.post('/addSchedule', (req, res) => {
  const { title, start, end } = req.body;
  console.log(`Added schedule: ${title} from ${start} to ${end}`);
  res.json({ message: 'Schedule added successfully' });
});

// API route to suggest schedules
app.post('/suggestSchedules', (req, res) => {
  const { deadline, totalDuration } = req.body;
  const suggestedSchedules = suggestSchedules(deadline, totalDuration);
  res.json(suggestedSchedules);
});

// Function to suggest schedules
function suggestSchedules(deadline, totalDuration) {
  const currentTime = new Date();
  const availableTimeSlots = [];
  
  for (let i = 0; i < 24; i++) {
    const startTime = new Date(currentTime.getTime() + i * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + totalDuration * 60 * 60 * 1000);
    if (endTime <= new Date(deadline)) {
      availableTimeSlots.push({ start: startTime, end: endTime });
    }
  }

  return availableTimeSlots;
}

// API route to import timetable from a URL
app.post('/importTimetable', async (req, res) => {
  const { url } = req.body;

  try {
      const response = await fetch(url);
      const icalData = await response.text();
      const jcalData = ICAL.parse(icalData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

      const events = vevents.map(vevent => {
          const start = vevent.getFirstPropertyValue('dtstart').toJSDate();
          const end = vevent.getFirstPropertyValue('dtend').toJSDate();
          const summary = vevent.getFirstPropertyValue('summary'); // Extract the SUMMARY field

          // Handle any escaped characters in the SUMMARY field
          const cleanSummary = summary.replace(/\\,/g, ',').replace(/\\n/g, ' ').replace(/\\/g, '');

          return {
              title: cleanSummary, // Use the cleaned SUMMARY as the title
              start: start.toISOString(),
              end: end.toISOString()
          };
      });

      res.json(events);
  } catch (error) {
      console.error('Error importing timetable:', error);
      res.status(500).json({ message: 'Failed to import timetable.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
