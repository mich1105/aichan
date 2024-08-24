const express = require('express');
const path = require('path');
const fetch = require('node-fetch');  
const ICAL = require('ical.js');      
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/addSchedule', (req, res) => {
  const { title, start, end } = req.body;
  console.log(`Added schedule: ${title} from ${start} to ${end}`);
  res.json({ message: 'Schedule added successfully' });
});

app.post('/suggestSchedules', (req, res) => {
  const { deadline, totalDuration } = req.body;
  const suggestedSchedules = suggestSchedules(deadline, totalDuration);
  res.json(suggestedSchedules);
});

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
          const summary = vevent.getFirstPropertyValue('summary'); 


          const cleanSummary = summary.replace(/\\,/g, ',').replace(/\\n/g, ' ').replace(/\\/g, '');

          return {
              title: cleanSummary, 
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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
