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

            var month = (date.getMonth() + 1 < 10) ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
            var formattedDay = (day < 10) ? '0' + day : day;
      
            next7Days.push({
                index : i,
                date: formattedDay,
                monthName: monthNameShort,
                dayName: dayName,
                year : date.getFullYear(),
                full_date : date.getFullYear()+'-'+month+'-'+formattedDay
            });

        };

        return next7Days;
    };

    function date_tmp(data){
        return '<div class="splide__slide date-field-box" is_selected="false" date-index="'+data?.index+'">'+
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

    function time_tmp(data, index){
        return '<div class="splide__slide date-field-box" is_selected="false" time-index="'+index+'">'+
                    '<span>'+data+'</span>'+
                '</div>'
    }
    
    var timeSlots = generateTimeArray();
      
    timeSlots.forEach((data, index) => {
        time_splide.add(time_tmp(data, index));
    });


    function format_time(time){
        if(!time) return;
        var timeArray = time.split(/:| /);
        var hours = parseInt(timeArray[0], 10);
        var minutes = parseInt(timeArray[1], 10);
        var period = timeArray[2];

        // Convert to 24-hour format
        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        // Add seconds and format the time
        var seconds = '00';
        return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds;
    }
      
      
    var url = new URL(window.location.href);
    var asset_type = url.searchParams.get("type");
    var asset_id = url.searchParams.get("id");
    var is_edit = url.searchParams.get("edit");
    var schedule_id = url.searchParams.get("schedule-id");
    

    var date_value;
    var time_value;

    $(document).on('click', '.date-picker-splide .date-field-box', function(){
        $('.date-picker-splide .date-field-box').attr('is_selected', false);
        $(this).attr('is_selected', true);
        var date_index = $(this).attr('date-index');
        date_value = next7DaysInfo[date_index];
        showing_date_time();
    });

    $(document).on('click', '.time-picker-splide .date-field-box', function(){
        $('.time-picker-splide .date-field-box').attr('is_selected', false);
        $(this).attr('is_selected', true);
        var date_index = $(this).attr('time-index');
        time_value = timeSlots[date_index];
        showing_date_time();
    });


    function showing_date_time(){
        var date_time_dom  =    (date_value?.dayName || '') +' '+
                                (date_value?.date || '') +' '+
                                (date_value?.monthName || '') + ', '+
                                (time_value  || '') +
                                (date_value?.year && ' (' + date_value?.year + ')')

        $('.display-time').html(date_time_dom);

        if(date_value && time_value){
            $('.create-schedule-btn').removeClass('d-none')
        }
    };




    var creating_schedule = false;

    $(document).on('click', '.create-schedule-btn', function(){
        if(creating_schedule) return;
        creating_schedule = true;

        var visiting_time = date_value?.full_date+'T'+format_time(time_value)+'Z';

        var SCHEDULE_API = is_edit == 'true' ? 
                            '/schedule/api/'+schedule_id+'/' : '/schedule/api/';

        $.ajax({
            url: SCHEDULE_API,
            type: is_edit == 'true' ? 'PATCH' : 'POST',
            data : {
                object_id : asset_id,
                content_type_name : asset_type,
                visiting_time : visiting_time,
            },
            headers: {
                'X-CSRFToken': csrfToken,
            },
            beforeSend: function() {
                
            },
            success: function (data) {
                creating_schedule = false;
                $('.alert_messages').html(
                    '<div class="alert alert-success text-center" role="alert"> Successfully '+
                    (is_edit == 'true' ? 'Update The' : 'Created A') +
                    ' Schedule </div>'
                );

                setTimeout(() => {
                    window.location.href = '/dashboard/'
                }, 1500);
            },
            error: function (error) {
                creating_schedule = false
                $('.alert_messages').html('<div class="alert alert-danger text-center" role="alert"> Something is wrong. Unable to create schedule </div>')
            }
        });       
    });


    var ASSET_API_URL = asset_type == 'property' ? 
                        '/property/api/details/'+asset_id+'/schedule/' :
                        '/building/api/details/'+asset_id+'/schedule/'

                            
    function property_facility_tmp(data){
        var facility_tmp = '';

        if(data?.building?.have_fitness_area){
            facility_tmp += '<span>GYM</span>'
        };

        if(data?.building?.have_grocery){
            facility_tmp += '<span>Grocery</span>'
        };

        if(data?.building?.have_guard_house){
            facility_tmp += '<span>Security</span>'
        };

        if(data?.building?.have_river_view){
            facility_tmp += '<span>River View</span>'
        };

        if(data?.building?.have_sauna){
            facility_tmp += '<span>Sauna</span>'
        };

        if(data?.building?.have_sky_lounge){
            facility_tmp += '<span>Sky Lounge</span>'
        };
        
        return facility_tmp;
    }

    function property_data_tmp(data){
        return '<p class="sub-title">'+
                    data?.number_of_bedroom+
                    ' bedroom ' +
                    data?.building?.type+
                    ' for sale at ' +
                    data?.title+
                    '</p>'+
                    '<p class="details"> '+ data?.description+' </p>'+

                    '<div class="property-contains">'+
                        '<div class="property-short-info-box">'+
                            '<div class="property-short-info-icon">'+
                                '<img src="/static/media/icons/bed.svg" alt="bed-icon">'+
                            '</div>'+
                            '<span class="property-value"> '+ data?.number_of_bedroom+' </span>'+
                            '<span class="property-label">Beds</span>'+
                        '</div>'+
                        '<div class="property-short-info-box">'+
                            '<div class="property-short-info-icon">'+
                                '<img src="/static/media/icons/bath.svg" alt="bath-icon">'+
                            '</div>'+
                            '<span class="property-value"> '+ data?.number_of_bathroom +' </span>'+
                            '<span class="property-label">Baths</span>'+
                        '</div>'+
                        '<div class="property-short-info-box">'+
                            '<div class="property-short-info-icon">'+
                                '<img src="/static/media/icons/plan-size.svg" alt="plan-size-icon">'+
                            '</div>'+
                            '<span class="property-value"> '+ data?.unit_area+ '</span>'+
                            '<span class="property-label"> SqM</span>'+
                        '</div>'+
                        '<div class="property-short-info-box">'+
                            '<div class="property-short-info-icon">'+
                                '<img src="/static/media/icons/stairs.svg" alt="stairs-icon">'+
                            '</div>'+
                            '<span class="property-value"> '+ data?.floor_number+' </span>'+
                            '<span class="property-label">Floor</span>'+
                        '</div>'+
                    '</div>'
    }

    function asset_tmp(data){
        return  '<div class="search-result-box-wrapper">'+
                    '<div class="row">'+
                        '<div class="col-sm-4">'+
                            '<div class="search-result-box-img">'+
                                '<img src="'+(data?.image_path || data?.building?.image_path)+'" alt="image" loading="lazy">' +
                            '</div>'+
                        '</div>'+
                        '<div class="col-sm-8">'+
                            '<div class="search-result-box">'+
                                '<h1> '+(data?.title || data?.building?.title)+' </h1>'+
                                '<div class="location">'+
                                    '<div class="icon">'+
                                        '<i class="bi bi-geo-alt"></i>'+
                                        data?.building?.address+
                                    '</div>'+
                                '</div>'+
                                ( asset_type == 'property' ? property_data_tmp(data) : '') +
                                '<div class="property-faciluty">'+
                                    property_facility_tmp(data) +
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'
    };

    function get_asset_details(){
        $.ajax({
            url: ASSET_API_URL,
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                var data = data;

                if(asset_type == 'building'){
                    data = {
                        building : data
                    }
                };

                $('.property-single-box').html(asset_tmp(data))
            },
            error: function (error) {
                console.log("error")
            }
        });
    };

    get_asset_details();


    function get_edit_data(){
        $.ajax({
            url: '/schedule/api/'+schedule_id+'/',
            type: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            success: function (data) {
                var now = new Date(data?.visiting_time)
                now.setHours(now.getHours() - 7);
                var edited_date = dayjs(now).format('dddd DD MMM, h:mm A (YYYY)');
                $('[label-name="update-date-field"]').html('<div class="edited_date">Created Schedule : '+edited_date+'</div>')

            },
            error: function (error) {
                console.log("error")
            }
        });
    }

    if(is_edit == 'true'){
        get_edit_data()
        $('.create-schedule-title').html('Update Schedule')
        $('.create-schedule-btn').html('Update')
    }else{
        $('.create-schedule-title').html('Create Schedule')
    };
})