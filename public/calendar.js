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
        events: storedTasks.map(task => {
            const endTime = new Date(task.start);
            endTime.setHours(endTime.getHours() + parseFloat(task.duration));
            return {
                title: task.title,
                start: task.start,
                end: endTime.toISOString(),
                allDay: false
            };
        })
    });

    calendar.render();
});
