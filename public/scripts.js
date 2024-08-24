// Function to add a task
// function addTask() {
//   const taskInput = document.getElementById('taskInput');
//   const taskValue = taskInput.value;

//   if (taskValue.trim() === '') {
//       return;
//   }

//   // Save task to localStorage
//   let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
//   tasks.push(taskValue);
//   localStorage.setItem('tasks', JSON.stringify(tasks));

//   // Render tasks
//   renderTasks();
// }

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


function showTaskDetails(event) {
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

// Initialize the calendar when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeCalendar);

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

  const dropdownButton = document.querySelector('.dropdown-button');
  const dropdownContent = document.querySelector('.dropdown-content');
  dropdownButton.addEventListener('click', function() {
    dropdownContent.classList.toogle('show');
  });
  window.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-button')) {
      if (drowdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
      }
    }
  })
});
document.querySelector('.dropbtn').addEventListener('click', function(event) {
  event.stopPropagation();
  var dropdownContent = document.querySelector('.dropdown-content');
  dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
});
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      for (var i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.style.display === 'block') {
              openDropdown.style.display = 'none';
          }
      }
  }
}

document.querySelectorAll('.dropdown-content input').forEach(function(checkbox) {
  checkbox.addEventListener('change', updateSelectedOptions);
});
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

  // Generate a unique ID for the task
  const taskId = 'task-' + Date.now();

  // Save task to localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push({ id: taskId, name: taskValue, start: deadlineValue, end: endDateTime.toISOString() });
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Re-render tasks and update calendar
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
let calendar; // Declare the calendar variable outside the function so it can be accessed globally

function initializeCalendar() {
    var calendarEl = document.getElementById('calendar');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Migrate tasks to ensure each has a unique ID
    tasks = tasks.map(task => {
        if (!task.id) {
            task.id = 'task-' + Date.now() + Math.random().toString(36).substring(7);
        }
        return task;
    });

    localStorage.setItem('tasks', JSON.stringify(tasks)); // Save the updated tasks back to localStorage

    // Destroy existing calendar instance if it exists
    if (calendar) {
        calendar.destroy();
    }

    // Initialize a new calendar instance
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,listWeek'
        },
        events: tasks.map(task => ({
            id: task.id,
            title: task.name,
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

  // Generate a unique ID for the task
  const taskId = 'task-' + Date.now();

  // Save task to localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push({ id: taskId, name: taskValue, start: deadlineValue, end: endDateTime.toISOString() });
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Re-render tasks and update calendar
  initializeCalendar(); // This should now correctly refresh the calendar without needing a manual refresh
}


let currentEventId = null;

function showTaskDetails(event) {
    // Store the current event ID for deletion
    currentEventId = event.id;  // Ensure this captures the correct ID
    console.log("Current Event ID:", currentEventId);

    // Populate modal with event details
    document.getElementById('modalTaskName').textContent = event.title;
    document.getElementById('modalTaskStart').textContent = new Date(event.start).toLocaleString();
    document.getElementById('modalTaskEnd').textContent = new Date(event.end).toLocaleString();
    
    const durationInHours = (new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60);
    document.getElementById('modalTaskDuration').textContent = durationInHours.toFixed(2);

    // Show the modal
    document.getElementById('taskDetailsModal').style.display = "block";
}

function deleteTaskFromModal() {
  console.log("Delete button clicked");

  // Get the tasks from localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  console.log("Current tasks:", tasks);

  // Find and remove the task with the currentEventId
  tasks = tasks.filter(task => task.id !== currentEventId);
  console.log("Tasks after deletion:", tasks);

  // Update localStorage
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Re-render the calendar
  initializeCalendar();

  // Close the modal
  closeModal();
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
