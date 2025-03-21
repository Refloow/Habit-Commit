document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("contribution-calendar");
    const monthLabels = document.querySelector(".month-labels");
    const dayLabels = document.querySelector(".day-labels");
    const weeksContainer = document.querySelector(".weeks-container");
    const yearSelect = document.getElementById("year-select");
    const workoutForm = document.getElementById("workout-form");
    const workoutDate = document.getElementById("workout-date");

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear];

    years.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    yearSelect.value = currentYear;

    const today = new Date().toISOString().split('T')[0];
    workoutDate.value = today; // Set the default date to today

    // Initialize Flatpickr with dark theme
    flatpickr(workoutDate, {
        defaultDate: today,
        theme: "dark"
    });

    fetch('/data')
        .then(response => response.json())
        .then(data => {
            renderLabels(currentYear);
            renderCalendar(data);
            yearSelect.addEventListener("change", (event) => {
                const selectedYear = parseInt(event.target.value);
                fetch('/data')
                    .then(response => response.json())
                    .then(data => {
                        const filteredData = {
                            year: selectedYear,
                            workouts: Object.fromEntries(
                                Object.entries(data.workouts).filter(([key]) => key.startsWith(selectedYear))
                            )
                        };
                        renderLabels(selectedYear);
                        renderCalendar(filteredData);
                    });
            });
        });

    workoutForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const date = document.getElementById("workout-date").value;
        const intensity = document.getElementById("workout-intensity").value;

        fetch('/data')
            .then(response => response.json())
            .then(data => {
                data.workouts[date] = parseInt(intensity);
                fetch('/data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }).then(() => {
                    renderCalendar(data);
                });
            });
    });

    function renderLabels(year) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        // Render month labels
        monthLabels.innerHTML = '<div></div>'; // Empty div for spacing
        monthNames.forEach((month) => {
            const monthLabel = document.createElement("div");
            monthLabel.textContent = month;
            monthLabels.appendChild(monthLabel);
        });

        // Render day labels
        dayLabels.innerHTML = ''; // Clear any existing labels
        dayNames.forEach((day) => {
            const dayLabel = document.createElement("div");
            dayLabel.textContent = day;
            dayLabels.appendChild(dayLabel);
        });
    }
    function renderCalendar(data) {
        weeksContainer.innerHTML = '';
    
        for (let i = 0; i < 53; i++) {
            const week = document.createElement("div");
            week.classList.add("week");
    
            for (let j = 0; j < 7; j++) {
                const day = document.createElement("div");
                day.classList.add("day");
                const date = new Date(data.year, 0, 1 + (i * 7) + j);
    
                if (date.getFullYear() === data.year) {
                    const isoDate = date.toISOString().split('T')[0];
                    const level = data.workouts[isoDate] || 0;
                    day.dataset.date = isoDate;
                    day.dataset.level = level;
    
                    // Tooltip text
                    const tooltip = document.createElement("div");
                    tooltip.classList.add("tooltip");
                    const tooltipText = document.createElement("span");
                    tooltipText.classList.add("tooltiptext");
                    if (level > 0) {
                        tooltipText.textContent = `Intensity ${level} workout on ${isoDate}`;
                    } else {
                        tooltipText.textContent = `No workout for ${isoDate}`;
                    }
                    tooltip.appendChild(tooltipText);
                    day.appendChild(tooltip);
                }
    
                // Add event listener for hover
                day.addEventListener("mouseover", () => {
                    const tooltip = day.querySelector(".tooltiptext");
                    tooltip.style.visibility = "visible";
                });
    
                day.addEventListener("mouseout", () => {
                    const tooltip = day.querySelector(".tooltiptext");
                    tooltip.style.visibility = "hidden";
                });
    
                week.appendChild(day);
            }
            weeksContainer.appendChild(week);
        }
    }
    
});
