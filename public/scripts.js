const dummyUsers = {
    "UserA": {
        username: "UserA",
        tasks: [
            { id: "task-1", title: "Task 1", start: "2024-08-31T10:00:00", end: "2024-08-31T12:00:00" },
            { id: "task-2", title: "Task 2", start: "2024-08-31T14:00:00", end: "2024-08-31T15:00:00" }
        ],
        connections: []
    },
    "dylan": {
        username: "dylan",
        tasks: [
            { id: "task-3", title: "Task 3", start: "2024-08-31T09:00:00", end: "2024-08-31T10:30:00" },
            { id: "task-4", title: "Task 4", start: "2024-08-31T13:00:00", end: "2024-08-31T14:00:00" }
        ],
        connections: []
    },
    "UserC": {
        username: "jotham",
        tasks: [
            { id: "task-5", title: "Task 5", start: "2024-08-30T09:00:00", end: "2024-08-30T10:30:00" },
            { id: "task-6", title: "Task 6", start: "2024-08-30T13:00:00", end: "2024-08-30T14:00:00" }
        ],
        connections: []
    },
    "UserD": {
        username: "aiko",
        tasks: [
            { id: "task-7", title: "Task 7", start: "2024-08-23T07:00:00", end: "2024-08-30T09:30:00" },
            { id: "task-8", title: "Task 8", start: "2024-08-23T11:00:00", end: "2024-08-30T11:30:00" }
        ],
        connections: []
    }
  };
  localStorage.setItem('allUsers', JSON.stringify(dummyUsers));
  localStorage.setItem('currentUser', JSON.stringify(dummyUsers['UserA']));
  
  let calendar; 
  function initializeCalendar() {
      const calendarEl = document.getElementById('calendar');
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks = tasks.map(task => {
          if (!task.id) {
              task.id = 'task-' + Date.now() + Math.random().toString(36).substring(7);
          }
          return task;
      });
      localStorage.setItem('tasks', JSON.stringify(tasks));
      if (calendar) {
          calendar.destroy();
      }
      calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'timeGridWeek',
          headerToolbar: {
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridDay,timeGridWeek,listWeek'
          },
          events: tasks.map(task => {
              let backgroundColor, borderColor;
  
              if (task.isJointActivity) {
                  backgroundColor = '#3F352C';
                  borderColor = '#3F352C';
              } else if (task.linkedFromTimetable) {
                  backgroundColor = '#BDA18C';
                  borderColor = '#BDA18C';
              } else if (task.fromConnectedUser) {
                  backgroundColor = '#E6DCD3';
                  borderColor = '#E6DCD3';
              } else {
                  backgroundColor = '#B4A79E';
                  borderColor = '#B4A79E';
              }
              return {
                  id: task.id,
                  title: task.name || task.title,
                  start: task.start,
                  end: task.end,
                  allDay: false,
                  backgroundColor: backgroundColor,
                  borderColor: borderColor
              };
          }),
          eventClick: function(info) {
              showTaskDetails(info.event);
          }
      });
      calendar.render();
      document.getElementById('disconnectButton').addEventListener('click', disconnectUser);
  }
  
  function connectToUser() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const allUsers = JSON.parse(localStorage.getItem('allUsers'));
      const connectUsername = document.getElementById('connectUsername').value.trim();
      if (connectUsername && allUsers[connectUsername] && connectUsername !== currentUser.username) {
          currentUser.connections.push(connectUsername);
          allUsers[currentUser.username].connections.push(connectUsername);
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          localStorage.setItem('allUsers', JSON.stringify(allUsers));
          const connectedUserTasks = allUsers[connectUsername].tasks.map(task => ({
              ...task,
              fromConnectedUser: true 
          }));
          let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
          tasks = tasks.concat(connectedUserTasks);
          localStorage.setItem('tasks', JSON.stringify(tasks));
          initializeCalendar();
          alert(`Connected with ${connectUsername}! Their schedule is now visible.`);
      } else {
          alert('Invalid username or you are already connected to this user.');
      }
  }
  
  function findCommonFreeTime() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const connections = currentUser.connections || [];
      const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
      let combinedTasks = JSON.parse(localStorage.getItem('tasks')) || currentUser.tasks || [];
    connections.forEach(connection => {
        const userTasks = allUsers[connection].tasks || [];
        combinedTasks = combinedTasks.concat(userTasks);
    });
      combinedTasks.sort((a, b) => new Date(a.start) - new Date(b.start));
      const freeTimes = calculateFreeTime(combinedTasks);
      return freeTimes;
  }
  
  function findCommonFreeTimeInRange(start, end, preference) {
      const freeTimes = findCommonFreeTime();
      return freeTimes.filter(time => {
          const startTime = new Date(time.start);
          const endTime = new Date(time.end);
          switch (preference) {
              case 'morning':
                  return startTime.getHours() >= 5 && endTime.getHours() <= 11;
              case 'day':
                  return startTime.getHours() >= 11 && endTime.getHours() <= 15;
              case 'afternoon':
                  return startTime.getHours() >= 15 && endTime.getHours() <= 18;
              case 'night':
                  return startTime.getHours() >= 18 && endTime.getHours() <= 23;
              default:
                  return true;
          }
      }).filter(time => new Date(time.start) >= start && new Date(time.end) <= end);
  }
  
  function calculateFreeTime(tasks) {
      let freeTimes = [];
      let previousEnd = new Date(tasks[0].start);
      tasks.forEach((task) => {
          const taskStart = new Date(task.start);
          if (previousEnd < taskStart) {
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

  function addTask(event) {
      event.preventDefault();  
      const taskInput = document.getElementById('taskInput');
      const taskDeadline = document.getElementById('taskDeadline');
      const taskDuration = document.getElementById('taskDuration');
      const taskValue = taskInput.value;
      const deadlineValue = taskDeadline.value;
      const durationValue = parseFloat(taskDuration.value);
      if (taskValue.trim() === '' || deadlineValue.trim() === '' || isNaN(durationValue)) {
          return;
      }
      const startDateTime = new Date(deadlineValue);
      const endDateTime = new Date(startDateTime.getTime() + durationValue * 60 * 60 * 1000);
      const taskId = 'task-' + Date.now();
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.push({ id: taskId, name: taskValue, start: deadlineValue, end: endDateTime.toISOString() });
      localStorage.setItem('tasks', JSON.stringify(tasks));
      initializeCalendar();
  }
  let currentEventId = null;
  function showTaskDetails(event) {
      currentEventId = event.id;
      document.getElementById('modalTaskName').textContent = event.title;
      document.getElementById('modalTaskStart').textContent = new Date(event.start).toLocaleString();
      document.getElementById('modalTaskEnd').textContent = new Date(event.end).toLocaleString();
      const durationInHours = (new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60);
      document.getElementById('modalTaskDuration').textContent = durationInHours.toFixed(2);
      const task = findTaskById(event.id);
      const profileContainer = document.getElementById('profilePhotos');
      profileContainer.innerHTML = ''; 
      if (task.isJointActivity) {
          const profileImages = ['profile0.png', 'profile1.png', 'profile2.png'];
          profileImages.forEach((image, index) => {
              const img = document.createElement('img');
              img.src = `images/${image}`;
              img.alt = `Profile Photo ${index}`;
              img.className = 'profile-photo';
              profileContainer.appendChild(img);
          });
          document.getElementById('uploadPhotoSection').style.display = 'block';
          if (task.uploadedPhoto) {
              document.getElementById('uploadedPhotoPreview').src = task.uploadedPhoto;
              document.getElementById('uploadedPhotoPreview').style.display = 'block';
          } else {
              document.getElementById('uploadedPhotoPreview').style.display = 'none';
          }
          document.getElementById('uploadPhotoInput').onchange = function(event) {
              const file = event.target.files[0];
              const reader = new FileReader();
              reader.onload = function(e) {
                  document.getElementById('uploadedPhotoPreview').src = e.target.result;
                  document.getElementById('uploadedPhotoPreview').style.display = 'block';
                  task.uploadedPhoto = e.target.result;
                  saveTask(task);
              };
              reader.readAsDataURL(file);
          };
      } else {
          document.getElementById('uploadPhotoSection').style.display = 'none';
      }
      document.getElementById('taskDetailsModal').style.display = "block";
  }
  
  function findTaskById(id) {
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      return tasks.find(task => task.id === id);
  }
  
  function saveTask(updatedTask) {
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
      localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  document.getElementById('uploadPhotoInput').onchange = function(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
          document.getElementById('uploadedPhotoPreview').src = e.target.result;
          document.getElementById('uploadedPhotoPreview').style.display = 'block';
          document.getElementById('discardPhotoButton').style.display = 'flex';
      };
      reader.readAsDataURL(file);
  };
  
  document.getElementById('discardPhotoButton').onclick = function() {
      document.getElementById('uploadPhotoInput').value = '';
      document.getElementById('uploadedPhotoPreview').style.display = 'none';
      document.getElementById('discardPhotoButton').style.display = 'none';
  };
  
  function findTaskById(id) {
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      return tasks.find(task => task.id === id);
  }
  
  function closeModal() {
    document.getElementById('taskDetailsModal').style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target == document.getElementById('taskDetailsModal')) {
        closeModal();
    }
  }
  
  document.getElementById('closeModal').onclick = function() {
    closeModal();
  }
  
  document.getElementById('deleteTaskButton').onclick = function() {
    deleteTaskFromModal();
  }
  
  function deleteTaskFromModal() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== currentEventId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    initializeCalendar();
    closeModal();
  }
  
  function disconnectUser() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const allUsers = JSON.parse(localStorage.getItem('allUsers'));
      const connectUsername = document.getElementById('connectUsername').value.trim();
      if (connectUsername && currentUser.connections.includes(connectUsername)) {
          currentUser.connections = currentUser.connections.filter(username => username !== connectUsername);
          allUsers[currentUser.username].connections = allUsers[currentUser.username].connections.filter(username => username !== connectUsername);
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          localStorage.setItem('allUsers', JSON.stringify(allUsers));
          initializeCalendar(); 
          alert(`Disconnected from ${connectUsername}. Their schedule is now hidden.`);
      } else {
          alert('Invalid username or you are not connected to this user.');
      }
  }
  
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
          let events = await response.json();
          if (!Array.isArray(events)) {
              throw new Error('Invalid response format: Expected an array of events.');
          }
          let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
          events = events.map(event => ({
              ...event,
              linkedFromTimetable: true
          }));
          tasks = tasks.concat(events);
          localStorage.setItem('tasks', JSON.stringify(tasks));
          initializeCalendar();
          alert('Timetable imported successfully!');
      } catch (error) {
          console.error('Error importing timetable:', error);
          alert(`Error importing timetable: ${error.message}`);
      }
    }  
  
  document.addEventListener('DOMContentLoaded', () => {
      initializeCalendar(); 
      document.getElementById('taskForm').addEventListener('submit', addTask);
      document.getElementById('importTimetableForm').addEventListener('submit', importTimetable);
      document.getElementById('connectUserForm').addEventListener('submit', function(event) {
          event.preventDefault();
          connectToUser();
      });
      document.getElementById('disconnectButton').addEventListener('click', disconnectUser);
      document.getElementById('createActivityForm').addEventListener('submit', createActivityTogether);
      document.getElementById('closeModal').onclick = function() {
          closeModal();
      }
      document.getElementById('deleteTaskButton').onclick = function() {
          deleteTaskFromModal();
      }
      document.getElementById('uploadPhotoInput').onchange = function(event) {
          const file = event.target.files[0];
          const reader = new FileReader();
          reader.onload = function(e) {
              document.getElementById('uploadedPhotoPreview').src = e.target.result;
              document.getElementById('uploadedPhotoPreview').style.display = 'block';
              document.getElementById('discardPhotoButton').style.display = 'flex';
          };
          reader.readAsDataURL(file);
      };
      document.getElementById('discardPhotoButton').onclick = function() {
          document.getElementById('uploadPhotoInput').value = '';
          document.getElementById('uploadedPhotoPreview').style.display = 'none';
          document.getElementById('discardPhotoButton').style.display = 'none';
      };
  });
  
  document.getElementById('createActivityForm').addEventListener('submit', createActivityTogether);
  function createActivityTogether(event) {
      event.preventDefault();
      const activityTitle = document.getElementById('activityTitle').value;
      const activityStart = new Date(document.getElementById('activityStart').value);
      const activityEnd = new Date(document.getElementById('activityEnd').value);
      const activityDuration = parseFloat(document.getElementById('activityDuration').value);
      const selectedUsers = Array.from(document.getElementById('activityUsers').selectedOptions).map(option => option.value);
      const timePreference = document.getElementById('timePreference').value;
      if (activityTitle.trim() === '' || isNaN(activityDuration) || selectedUsers.length === 0) {
          alert('Please fill in all fields.');
          return;
      }
      const availableSlots = findCommonFreeTimeInRange(activityStart, activityEnd, timePreference);
      const suggestedSchedulesList = document.getElementById('suggestedSchedulesList');
      suggestedSchedulesList.innerHTML = '';
      if (availableSlots.length === 0) {
          suggestedSchedulesList.innerHTML = '<li>No common free time available within the selected period and time preference.</li>';
      } else {
          availableSlots.slice(0, 4).forEach((slot, index) => {
              const slotDuration = (new Date(slot.end) - new Date(slot.start)) / (1000 * 60 * 60);
              if (slotDuration >= activityDuration) {
                  const listItem = document.createElement('li');
                  listItem.textContent = `Option : ${new Date(slot.start).toLocaleString()}`;
                  const addButton = document.createElement('button');
                  addButton.textContent = 'Add to Timetable';
                  addButton.onclick = function() {
                      addSuggestedActivityToCalendar({
                          start: slot.start,
                          end: new Date(new Date(slot.start).getTime() + activityDuration * 60 * 60 * 1000).toISOString()
                      }, activityTitle, selectedUsers);
                  };
                  listItem.appendChild(addButton);
                  suggestedSchedulesList.appendChild(listItem);
              }
          });
      }
  }
  
  function findFreeTimeSlotsForUsers(start, end, duration, users, timePreference) {
      const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
      let combinedTasks = [];
      users.forEach(user => {
          const userTasks = allUsers[user].tasks || [];
          combinedTasks = combinedTasks.concat(userTasks);
      });
      combinedTasks.sort((a, b) => new Date(a.start) - new Date(b.start));
      let freeTimes = [];
      let previousEnd = start;
      combinedTasks.forEach(task => {
          const taskStart = new Date(task.start);
          if (previousEnd < taskStart) {
              let availableDuration = (taskStart - previousEnd) / (1000 * 60 * 60);
              if (availableDuration >= duration) {
                  let slotEnd = new Date(previousEnd.getTime() + duration * 60 * 60 * 1000);
                  freeTimes.push({ start: previousEnd.toISOString(), end: slotEnd.toISOString() });
              }
          }
          previousEnd = new Date(task.end);
      });
      if (previousEnd < end) {
          let availableDuration = (end - previousEnd) / (1000 * 60 * 60);
          if (availableDuration >= duration) {
              let slotEnd = new Date(previousEnd.getTime() + duration * 60 * 60 * 1000);
              freeTimes.push({ start: previousEnd.toISOString(), end: slotEnd.toISOString() });
          }
      }
      const filteredFreeTimes = freeTimes.filter(slot => {
          const slotStart = new Date(slot.start).getHours();
          switch (timePreference) {
              case 'morning':
                  return slotStart >= 6 && slotStart < 12;
              case 'day':
                  return slotStart >= 12 && slotStart < 18;
              case 'evening':
                  return slotStart >= 18 && slotStart < 21;
              case 'night':
                  return slotStart >= 21 && slotStart < 24;
              default:
                  return false;
          }
      });
      return filteredFreeTimes.slice(0, 4);
  }
  function addSuggestedActivityToCalendar(freeSlot, title, users) {
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.push({
          id: 'task-' + Date.now(),
          title: title,
          start: freeSlot.start,
          end: freeSlot.end,
          allDay: false,
          isJointActivity: true, 
          participants: users
      });
      localStorage.setItem('tasks', JSON.stringify(tasks));
      initializeCalendar();
  }
  freeTimeSlots.forEach(slot => {
      calendar.addEvent({
          title: `${title} (Suggested)`,
          start: slot.start,
          end: slot.end,
          backgroundColor: '#ff6600',
          borderColor: '#ff6600'
      });
  });