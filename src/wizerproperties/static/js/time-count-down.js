class Countdown {
    constructor({
        template = false , // "dd|hh|mm|ss" # not change-abel,
        labels = false , // "Day|Hour|Minute|Second" # you can change the name 
    }) {
        this.c_list = document.querySelectorAll('[date-count]');
        this.countDownTime = 1000;

        this.s_dd = template && template.includes("dd");
        this.s_hh = template && template.includes("hh");
        this.s_mm = template && template.includes("mm");
        this.s_ss = template && template.includes("ss");

        if( template && !template.includes("ss") ) {
            this.countDownTime = 60 * 1000;
        }

        if(labels){
            var label_data = labels.split("|")
            this.l_dd = label_data[0] || null
            this.l_hh = label_data[1] || null
            this.l_mm = label_data[2] || null
            this.l_ss = label_data[3] || null
        };

        this.start();
    }

    start() {
        this.updateAllCountdowns();
        this.countdownInterval = setInterval(() => this.updateAllCountdowns(), this.countDownTime);
    }

    updateAllCountdowns() {
        this.c_list?.forEach((element, index) => {
            var targetDate = element.getAttribute('date-count');
            this.updateCountdown(targetDate, index);
        });
    }

    htmlTemplate($dd, $hh, $mm, $ss){
        return(
            '<date_area class="date-area">'+
                ( $dd ?
                '<date_tmp class="date-tmp">'+
                    (this.s_dd ? '<count>'+$dd+'</count>' : '')+
                    (this.l_dd ? '<label>'+this.l_dd+'</label>' : '')+
                '</date_tmp> <prime> : </prime>' : '' )+
                ( $hh ?
                '<date_tmp class="date-tmp">'+
                    (this.s_hh  ? '<count>'+$hh+'</count>' : '')+
                    (this.l_hh ? '<label>'+this.l_hh+'</label>' : '')+
                '</date_tmp> <prime> : </prime> ' : '' )+
                ( $mm ?
                '<date_tmp class="date-tmp">'+
                    (this.s_mm ? '<count>'+$mm+'</count>' : '')+
                    (this.l_mm ? '<label>'+this.l_mm+'</label>' : '')+
                '</date_tmp>'+ ( this.s_ss ? '<prime> : </prime>' : '' ) : '' )+
                ( $ss ?
                '<date_tmp class="date-tmp">'+
                    (this.s_ss ? '<count>'+$ss+'</count>' : '')+
                    (this.l_ss ? '<label>'+this.l_ss+'</label>' : '')+
                '</date_tmp>' : '' )+
            '</date_area>'
        )
    }

    updateCountdown(targetDate, index) {
        var [year, month, day] = targetDate.split('-').map(Number);
        var target = new Date(year, month - 1, day);
        var now = new Date();
        var difference = target - now;
        var element = this.c_list[index];

        if (difference <= 0) {
            element.innerHTML = '00 : 00';
        } else {
            var days = Math.floor(difference / (1000 * 60 * 60 * 24));
            var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((difference % (1000 * 60)) / 1000);

            if (days < 10) days = '0' + days;
            if (hours < 10) hours = '0' + hours;
            if (minutes < 10) minutes = '0' + minutes;
            if (seconds < 10) seconds = '0' + seconds;

            if(!this.s_dd) days = false;
            if(!this.s_hh) hours = false;
            if(!this.s_mm) minutes = false;
            if(!this.s_ss) seconds = false;

            element.innerHTML = this.htmlTemplate(days, hours, minutes, seconds)
        }
    }
}