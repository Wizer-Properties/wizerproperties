$(document).ready(function(){
// date-picker-splide
    var date_splide = new Splide( '.date-picker-splide' , {
        perPage: 4,
        gap : '15px',
        pagination : false,
        breakpoints: {
            860: {
                perPage: 3
            },
      }
    }).mount();


    var time_splide = new Splide( '.time-picker-splide' , {
        perPage: 5,
        gap : '15px',
        pagination : false,
        breakpoints: {
            860: {
                perPage: 3
            },
      }
    }).mount();


    function getNext7Days() {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
        var now = new Date();
        var currentHour = now.getHours();
        var currentMinute = now.getMinutes();
      
        if (currentHour > 22 || (currentHour === 22 && currentMinute >= 0)) {
            now.setDate(now.getDate() + 1);
        };
      
        var next7Days = [];
      
        for (let i = 0; i < 30; i++) {
            var date = new Date(now);
            date.setDate(now.getDate() + i);
            var dayName = days[date.getDay()];
            var monthNameShort = monthsShort[date.getMonth()];
            var day = date.getDate();
      
            next7Days.push({
                date: day,
                monthName: monthNameShort,
                dayName: dayName,
            });
        };

        return next7Days;
    };

    function date_tmp(data){
        return '<div class="splide__slide date-field-box" selected="false">'+
                    '<span> '+data?.dayName+' </span>'+
                    '<span> '+data?.date+' </span>'+
                    '<span> '+data?.monthName+' </span>'+
                '</div>'
    };
      
    var next7DaysInfo = getNext7Days();

    next7DaysInfo.forEach((dayInfo) => {
        date_splide.add(date_tmp(dayInfo));
    });



    function generateTimeArray() {
        var timeArray = [];
        var now = new Date();
        var startTime = new Date();
        startTime.setHours(9, 0, 0, 0); // Always start at 9:00 AM
        var endTime = new Date();
        endTime.setHours(21, 0, 0, 0); // End at 9:00 PM
      
        // Check if the current time is between 9:00 PM and 9:00 AM
        if (now >= endTime || now < startTime) {
            now = new Date(startTime); // Set the current time to 9:00 AM
        } else {
            var minutes = now.getMinutes();
      
            if (minutes < 30) {
                now.setMinutes(30);
            } else {
                now.setHours(now.getHours() + 1);
                now.setMinutes(0);
            }
        }
      
        let currentTime = new Date(Math.max(now, startTime));
      
        while (currentTime < endTime) {
            var formattedTime = currentTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            });
            timeArray.push(formattedTime);        
            currentTime.setMinutes(currentTime.getMinutes() + 30);
        }

        timeArray.push('9:00 PM');
        return timeArray;
    }

    function time_tmp(data){
        return '<div class="splide__slide date-field-box" selected="false">'+
                    '<span>'+data+'</span>'+
                '</div>'
    }
      
    var timeSlots = generateTimeArray();
      
    timeSlots.forEach((data) => {
        time_splide.add(time_tmp(data));
    });
      
      
      
      
 
      
      
})