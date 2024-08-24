// Dummy Users and Connection Setup
const dummyUsers = {
  "UserA": {
      username: "UserA",
      tasks: [
          { id: "task-1", title: "Task 1", start: "2024-08-24T10:00:00", end: "2024-08-24T12:00:00" },
          { id: "task-2", title: "Task 2", start: "2024-08-24T14:00:00", end: "2024-08-24T15:00:00" }
      ],
      connections: []
  },
  "UserB": {
      username: "UserB",
      tasks: [
          { id: "task-3", title: "Task 3", start: "2024-08-24T09:00:00", end: "2024-08-24T10:30:00" },
          { id: "task-4", title: "Task 4", start: "2024-08-24T13:00:00", end: "2024-08-24T14:00:00" }
      ],
      connections: []
  },
  "UserC": {
      username: "UserC",
      tasks: [
          { id: "task-5", title: "Task 5", start: "2024-08-23T09:00:00", end: "2024-08-23T10:30:00" },
          { id: "task-6", title: "Task 6", start: "2024-08-23T13:00:00", end: "2024-08-23T14:00:00" }
      ],
      connections: []
  },
  "UserD": {
      username: "UserD",
      tasks: [
          { id: "task-7", title: "Task 7", start: "2024-08-23T07:00:00", end: "2024-08-23T09:30:00" },
          { id: "task-8", title: "Task 8", start: "2024-08-23T11:00:00", end: "2024-08-23T11:30:00" }
      ],
      connections: []
  }
};

// Store the dummy users in localStorage
localStorage.setItem('allUsers', JSON.stringify(dummyUsers));

// Set the current user to UserA for the demo
localStorage.setItem('currentUser', JSON.stringify(dummyUsers['UserA']));

let calendar; // Declare the calendar variable outside the function so it can be accessed globally

// Function to initialize the calendar with tasks from UserA or other users
function initializeCalendar() {
  const calendarEl = document.getElementById('calendar');
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Ensure each task has a unique ID
  tasks = tasks.map(task => {
      if (!task.id) {
          task.id = 'task-' + Date.now() + Math.random().toString(36).substring(7);
      }
      return task;
  });

  localStorage.setItem('tasks', JSON.stringify(tasks)); // Save back to localStorage

  if (calendar) {
      calendar.destroy();
  }

  // Initialize the calendar with tasks
  calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek',
      headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,listWeek'
      },
      events: tasks.map(task => ({
          id: task.id,
          title: task.name || task.title, // Support for both `name` and `title`
          start: task.start,
          end: task.end,
          allDay: false
      })),
      eventClick: function(info) {
          showTaskDetails(info.event);
      }
  });

  calendar.render();
}


// Function to handle connecting to another user
function connectToUser() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const allUsers = JSON.parse(localStorage.getItem('allUsers'));
  const connectUsername = document.getElementById('connectUsername').value.trim();

  if (connectUsername && allUsers[connectUsername] && connectUsername !== currentUser.username) {
      currentUser.connections.push(connectUsername);
      allUsers[currentUser.username].connections.push(connectUsername);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('allUsers', JSON.stringify(allUsers));

      // Re-initialize the calendar to include the connected user's tasks
      const freeTimes = findCommonFreeTime();
      displayFreeTimes(freeTimes);

      alert(`Connected with ${connectUsername}! Their schedule is now visible.`);
  } else {
      alert('Invalid username or you are already connected to this user.');
  }
}

// Function to find common free time between connected users
function findCommonFreeTime() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const connections = currentUser.connections || [];
  const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};

  let combinedTasks = JSON.parse(localStorage.getItem('tasks')) || currentUser.tasks || [];

  // Add the tasks of connected users
  connections.forEach(connection => {
      const userTasks = allUsers[connection].tasks || [];
      combinedTasks = combinedTasks.concat(userTasks);
  });

  combinedTasks.sort((a, b) => new Date(a.start) - new Date(b.start));

  const freeTimes = calculateFreeTime(combinedTasks);
  return freeTimes;
}

function calculateFreeTime(tasks) {
  let freeTimes = [];
  let previousEnd = null;

  tasks.forEach((task, index) => {
      const taskStart = new Date(task.start);
      if (previousEnd && taskStart > previousEnd) {
          freeTimes.push({
              start: previousEnd.toISOString(),
              end: taskStart.toISOString()
          });
      }
      previousEnd = new Date(task.end);
  });

  return freeTimes;
}

function displayFreeTimes(freeTimes) {
  const calendarEl = document.getElementById('calendar');
  const tasks = JSON.parse(localStorage.getItem('tasks')) || JSON.parse(localStorage.getItem('currentUser')).tasks || [];
  const connectedUserTasks = getConnectedUserTasks();

  const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek',
      headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,listWeek'
      },
      events: [
          /*...freeTimes.map(freeTime => ({
              title: 'Free Time',
              start: freeTime.start,
              end: freeTime.end,
              backgroundColor: '#00ff00',
              borderColor: '#00ff00',
              rendering: 'background'
          })),*/
          ...tasks,
          ...connectedUserTasks
      ]
  });

  calendar.render();
}

function getConnectedUserTasks() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const connections = currentUser.connections || [];
  const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
  let connectedUserTasks = [];

  connections.forEach(connection => {
      const userTasks = allUsers[connection].tasks || [];
      connectedUserTasks = connectedUserTasks.concat(userTasks);
  });

  return connectedUserTasks;
}

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

  // Generate a unique ID for the task
  const taskId = 'task-' + Date.now();

  // Save task to localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push({ id: taskId, name: taskValue, start: deadlineValue, end: endDateTime.toISOString() });
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Re-render tasks and update calendar
  initializeCalendar();
}

// Function to add a schedule
function addSchedule(event) {
  event.preventDefault();

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

  // Render schedules and update calendar
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

let currentEventId = null;

function showTaskDetails(event) {
    // Store the current event ID for deletion
    currentEventId = event.id;

    // Populate modal with event details
    document.getElementById('modalTaskName').textContent = event.title;
    document.getElementById('modalTaskStart').textContent = new Date(event.start).toLocaleString();
    document.getElementById('modalTaskEnd').textContent = new Date(event.end).toLocaleString();

    const durationInHours = (new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60);
    document.getElementById('modalTaskDuration').textContent = durationInHours.toFixed(2);

    // Show the modal
    document.getElementById('taskDetailsModal').style.display = "block";
}

function closeModal() {
  // Hide the modal
  document.getElementById('taskDetailsModal').style.display = "none";
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
  if (event.target == document.getElementById('taskDetailsModal')) {
      closeModal();
  }
}

// Close the modal when clicking on the close button
document.getElementById('closeModal').onclick = function() {
  closeModal();
}

// Delete the task when the delete button is clicked
document.getElementById('deleteTaskButton').onclick = function() {
  deleteTaskFromModal();
}

function deleteTaskFromModal() {
  // Get the tasks from localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Find and remove the task with the currentEventId
  tasks = tasks.filter(task => task.id !== currentEventId);

  // Update localStorage
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Re-render the calendar
  initializeCalendar();

  // Close the modal
  closeModal();
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

      const events = await response.json(); // Ensure this is JSON and properly structured

      if (!Array.isArray(events)) {
          throw new Error('Invalid response format: Expected an array of events.');
      }

      // Store the events in localStorage
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks = tasks.concat(events); // Merge events with existing tasks

      // Check the combined result
      console.log('Tasks after merging:', tasks);

      localStorage.setItem('tasks', JSON.stringify(tasks));


      // Initialize calendar with the imported events
      initializeCalendar();

      alert('Timetable imported successfully!');
  } catch (error) {
      console.error('Error importing timetable:', error);
      alert(`Error importing timetable: ${error.message}`);
  }
}


// Initialize UserA's calendar and other elements on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeCalendar(); // Show UserA's schedule only

  document.getElementById('taskForm').addEventListener('submit', addTask);
  document.getElementById('addScheduleButton').addEventListener('click', addSchedule);
  document.getElementById('importTimetableForm').addEventListener('submit', importTimetable);

  // Set up the connection functionality
  document.getElementById('connectUserForm').addEventListener('submit', function(event) {
      event.preventDefault();
      connectToUser();
  });

  // Dropdown functionality (if applicable)
  const dropdownButton = document.querySelector('.dropdown-button');
  const dropdownContent = document.querySelector('.dropdown-content');
  dropdownButton.addEventListener('click', function() {
      dropdownContent.classList.toggle('show');
  });
  window.addEventListener('click', function(event) {
      if (!event.target.matches('.dropdown-button')) {
          if (dropdownContent.classList.contains('show')) {
              dropdownContent.classList.remove('show');
          }
      }
  });
});
