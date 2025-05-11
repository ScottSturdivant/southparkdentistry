/**
 * Dynamic Business Hours Display
 * Updates the open/closed status in real-time based on current browser time
 */
document.addEventListener('DOMContentLoaded', function() {
    // Business hours configuration
    const businessHours = {
        monday: { open: '8:30', close: '17:00' },
        tuesday: { open: '8:30', close: '18:00' },
        wednesday: { open: '8:30', close: '17:00' },
        thursday: { open: '8:30', close: '18:00' },
        friday: { open: null, close: null },
        saturday: { open: null, close: null },
        sunday: { open: null, close: null }
    };

    // Days of the week (starting from Monday to match the configuration)
    const daysOfWeek = [
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ];

    // Element that will display the business hours status
    const hoursDisplay = document.getElementById('business-hours-status');
    if (!hoursDisplay) return;

    // Update the hours display based on current time
    function updateHoursDisplay() {
        const now = new Date();
        const currentDay = daysOfWeek[now.getDay()]; // 0 = Sunday, 1 = Monday, etc.
        
        // Check if we have hours for today
        const todayHours = businessHours[currentDay];
        
        if (todayHours && todayHours.open) {
            // Parse closing time
            const closeParts = todayHours.close.split(':');
            const closeHour = parseInt(closeParts[0], 10) + 12; // Convert to 24h format
            const closeMinute = parseInt(closeParts[1], 10);
            
            // Create a date object for closing time
            const closeTime = new Date();
            closeTime.setHours(closeHour, closeMinute, 0);
            
            // Check if we're still open
            if (now < closeTime) {
                hoursDisplay.textContent = `Open today until ${todayHours.close.replace('17:', '5:').replace('18:', '6:')} PM`;
            } else {
                // We've closed for today, find the next open day
                showNextOpenDay(currentDay);
            }
        } else {
            // Closed today, find the next open day
            showNextOpenDay(currentDay);
        }
    }
    
    // Find and display the next day we'll be open
    function showNextOpenDay(currentDay) {
        let nextDay = currentDay;
        let daysChecked = 0;
        let foundOpenDay = false;
        
        // Check up to 7 days to find the next open day
        while (daysChecked < 7 && !foundOpenDay) {
            // Move to the next day (with wrap-around)
            const currentIndex = daysOfWeek.indexOf(nextDay);
            const nextIndex = (currentIndex + 1) % 7;
            nextDay = daysOfWeek[nextIndex];
            daysChecked++;
            
            // Check if this day has open hours
            if (businessHours[nextDay] && businessHours[nextDay].open) {
                foundOpenDay = true;
                break;
            }
        }
        
        if (foundOpenDay) {
            const formattedDay = nextDay.charAt(0).toUpperCase() + nextDay.slice(1);
            hoursDisplay.textContent = `We are closed today. We will open ${formattedDay} at ${businessHours[nextDay].open} AM`;
        } else {
            // Fallback if somehow no open days are found
            hoursDisplay.textContent = 'Closed for the weekend. See you on Monday!';
        }
    }
    
    // Update immediately and then every minute
    updateHoursDisplay();
    setInterval(updateHoursDisplay, 60000);
});
