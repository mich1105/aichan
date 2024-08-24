// Function to add a task
function addTask() {
  const taskInput = document.getElementById('taskInput');
  const taskValue = taskInput.value;

  if (taskValue.trim() === '') {
      return;
  }

  // Save task to localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(taskValue);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Render tasks
  renderTasks();
}

// Function to add a schedule
function addSchedule() {
  const scheduleTitle = document.getElementById('scheduleTitle').value;
  const scheduleStart = document.getElementById('scheduleStart').value;
  const scheduleEnd = document.getElementById('scheduleEnd').value;

  if (scheduleTitle.trim() === '' || scheduleStart.trim() === '' || scheduleEnd.trim() === '') {
      return;
  }

  // Save schedule to localStorage
  let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
  schedules.push({ title: scheduleTitle, start: scheduleStart, end: scheduleEnd });
  localStorage.setItem('schedules', JSON.stringify(schedules));

  // Render schedules
  renderSchedules();
  initializeCalendar();
}


// Function to render schedules
function renderSchedules() {
  const suggestedSchedulesList = document.getElementById('suggestedSchedulesList');
  const schedules = JSON.parse(localStorage.getItem('schedules')) || [];

  suggestedSchedulesList.innerHTML = ''; // Clear the current list

  schedules.forEach(schedule => {
      const listItem = document.createElement('li');
      listItem.textContent = `${schedule.title} (From: ${new Date(schedule.start).toLocaleString()} To: ${new Date(schedule.end).toLocaleString()})`;
      suggestedSchedulesList.appendChild(listItem);
  });
}

// Function to initialize the calendar with tasks
function initializeCalendar() {
  var calendarEl = document.getElementById('calendar');
  var tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek',
      headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,listWeek'
      },
      events: tasks.map(task => ({
          title: task.title || 'Untitled',  // Ensure we are using the correct property
          start: task.start,
          end: task.end
      }))
  });

  calendar.render();
}

document.addEventListener('DOMContentLoaded', () => {
  // renderTasks();
  renderSchedules();
  initializeCalendar();

  // document.getElementById('addTaskButton').addEventListener('click', addTask);
  // document.getElementById('addScheduleButton').addEventListener('click', addSchedule);

  document.getElementById('taskForm').addEventListener('submit', addTask);
    document.getElementById('addScheduleButton').addEventListener('click', addSchedule);

    // Add event listener for timetable import
    document.getElementById('importTimetableForm').addEventListener('submit', importTimetable);
});

// Function to add a task
function addTask(event) {
  event.preventDefault();  // Prevent form from submitting and redirecting

  const taskInput = document.getElementById('taskInput');
  const taskDeadline = document.getElementById('taskDeadline');
  const taskDuration = document.getElementById('taskDuration');

  const taskValue = taskInput.value;
  const deadlineValue = taskDeadline.value;
  const durationValue = parseFloat(taskDuration.value);

  if (taskValue.trim() === '' || deadlineValue.trim() === '' || isNaN(durationValue)) {
      return;
  }

  // Calculate end time
  const startDateTime = new Date(deadlineValue);
  const endDateTime = new Date(startDateTime.getTime() + durationValue * 60 * 60 * 1000);

  // Save task to localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push({ name: taskValue, start: deadlineValue, end: endDateTime.toISOString() });
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Render tasks and update calendar
  renderTasks();
  initializeCalendar();
}




function deleteTask(index) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
  // Remove the task at the given index
  tasks.splice(index, 1);

  // Save the updated task list to localStorage
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Re-render the task list and calendar
  renderTasks();
  initializeCalendar();
}


// Function to initialize the calendar with tasks
function initializeCalendar() {
  var calendarEl = document.getElementById('calendar');
  var tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek',
      headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,listWeek'
      },
      events: tasks.map(task => ({
          title: task.name,
          start: task.start,
          end: task.end
      }))
  });

  calendar.render();
}

// document.addEventListener('DOMContentLoaded', () => {
//   renderTasks();
//   renderSchedules();
//   initializeCalendar();

//   document.getElementById('taskForm').addEventListener('submit', addTask);
//   document.getElementById('addScheduleButton').addEventListener('click', addSchedule);
// });

// document.addEventListener('DOMContentLoaded', () => {
//   renderTasks();
//   renderSchedules();
//   initializeCalendar();

//   document.getElementById('taskForm').addEventListener('submit', addTask);
//   document.getElementById('addScheduleButton').addEventListener('click', addSchedule);

//   // Add event listener for timetable import
//   document.getElementById('importTimetableForm').addEventListener('submit', importTimetable);
// });

// Function to add a task
function addTask(event) {
  event.preventDefault();  // Prevent form from submitting and redirecting

  const taskInput = document.getElementById('taskInput');
  const taskDeadline = document.getElementById('taskDeadline');
  const taskDuration = document.getElementById('taskDuration');

  const taskValue = taskInput.value;
  const deadlineValue = taskDeadline.value;
  const durationValue = parseFloat(taskDuration.value);

  if (taskValue.trim() === '' || deadlineValue.trim() === '' || isNaN(durationValue)) {
      return;
  }

  // Calculate end time
  const startDateTime = new Date(deadlineValue);
  const endDateTime = new Date(startDateTime.getTime() + durationValue * 60 * 60 * 1000);

  // Save task to localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push({ name: taskValue, start: deadlineValue, end: endDateTime.toISOString() });
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Initialize calendar with the updated tasks
  initializeCalendar();
}


function deleteTask(index) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Remove the task at the given index
  tasks.splice(index, 1);

  // Save the updated task list to localStorage
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Re-render the task list and calendar
  renderTasks();
  initializeCalendar();
}

// Function to initialize the calendar with tasks
function initializeCalendar() {
    var calendarEl = document.getElementById('calendar');
    var tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,listWeek'
        },
        events: tasks.map(task => ({
            title: task.name || 'Untitled',
            start: task.start,
            end: task.end
        }))
    });

    calendar.render();
}

// Function to import timetable
async function importTimetable(event) {
  event.preventDefault();

  const url = document.getElementById('timetableUrl').value;

  try {
      const response = await fetch('/importTimetable', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
      });

      if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const events = await response.json();

      // Store the events in localStorage
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks = tasks.concat(events);
      localStorage.setItem('tasks', JSON.stringify(tasks));

      // Initialize calendar with the imported events
      initializeCalendar();

      alert('Timetable imported successfully!');
  } catch (error) {
      console.error('Error importing timetable:', error);
      alert(`Error importing timetable: ${error.message}`);
  }
}
