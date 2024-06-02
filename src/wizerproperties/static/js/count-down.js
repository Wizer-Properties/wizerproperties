class Countdown {
    constructor() {
        this.c_list = document.querySelectorAll('[date-count]');
        this.start();
    }

    start() {
        this.updateAllCountdowns();
        this.countdownInterval = setInterval(() => this.updateAllCountdowns(), 1000);
    }

    updateAllCountdowns() {
        this.c_list?.forEach((element, index) => {
            var targetDate = element.getAttribute('date-count');
            this.updateCountdown(targetDate, index);
        });
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
            if (seconds < 10) seconds = '0' + seconds;
            element.innerHTML = (days && '<count>'+days+'</count> : ')+
                                '<count>'+hours+'</count> : '+
                                '<count>'+minutes+'</count> : '+
                                '<count>'+seconds+'</count>';
        }
    }
}