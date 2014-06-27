var moment = require('moment');

exports.getDifference = getDifference;
function getDifference(olderDate, newerDate) {

	var then = moment(olderDate);
	var to = moment(newerDate);

	//console.log('Then: ' + then);

	var timeDiff = {};

    // get the difference from now to then in ms
    ms = then.diff(to, 'milliseconds', true);

    //console.log('ms: ' + ms);

    // Years
    timeDiff.years = Math.floor(moment.duration(ms).asYears());
    then = then.subtract('years', timeDiff.years);

    ms = then.diff(to, 'milliseconds', true);

    // Months
    timeDiff.months = Math.floor(moment.duration(ms).asMonths());
    then = then.subtract('months', timeDiff.months).subtract('days', 1);

    ms = then.diff(to, 'milliseconds', true);

    // Days
    timeDiff.days = Math.floor(moment.duration(ms).asDays());
    then = then.subtract('days', timeDiff.days);


    ms = then.diff(to, 'milliseconds', true);

    // Hours
    timeDiff.hours = Math.floor(moment.duration(ms).asHours());
    then = then.subtract('hours', timeDiff.hours);


    ms = then.diff(to, 'milliseconds', true);

    // Minutes
    timeDiff.minutes = Math.floor(moment.duration(ms).asMinutes());
    then = then.subtract('minutes', timeDiff.minutes);

    ms = then.diff(to, 'milliseconds', true);
    timeDiff.seconds = Math.floor(moment.duration(ms).asSeconds());

    return timeDiff;

  }



// Needs some work to ensure not past min and max dates
exports.randomDate = randomDate;
function randomDate(minDate, maxDate)
{
    var randDate;

    minDate = moment(minDate);
    maxDate = moment(maxDate);

    diffDate = getDifference(maxDate, minDate);

    diffYears = Math.abs(diffDate.years);
    //console.log(diffDate);


    var randNumMonths = (Math.floor(Math.random() * (diffYears * 12)));
    var randNumDays = (Math.floor(Math.random() * 31));
    randDate = minDate.add("M", (randNumMonths < 2 ? randNumMonths : randNumMonths - 1));
    randDate = randDate.add("d", randNumDays);
    randDate = randDate.add("h", (Math.floor(Math.random() * 23)));
    randDate = randDate.add("m", (Math.floor(Math.random() * 59)))


    if(randDate.isAfter(maxDate)) 
    {
        randDate = maxDate;
    }
    //console.log(diffYears);
    //console.log(randDate);

    return randDate;

}