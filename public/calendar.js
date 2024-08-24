document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

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
