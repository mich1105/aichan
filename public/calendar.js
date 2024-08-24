document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    let storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];


    storedTasks = storedTasks.map(task => {
        if (!task.id) {
            task.id = 'task-' + Date.now() + Math.random().toString(36).substring(7);
        }
        return task;
    });

    localStorage.setItem('tasks', JSON.stringify(storedTasks)); 

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: storedTasks.map(task => ({
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
});
