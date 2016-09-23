var jsdom = require("jsdom");


 
module.exports = {
    getSchedule : function(schedule, studentId, callback){
        if(!schedule || !studentId){
            callback(null,"no-arguments");
            return;
        }
        _createCalendar(schedule,studentId,callback);
    },
    getScheduleFromBrowser: function (schedule, studentId, callback){
        if(!schedule || !studentId){
            callback(null,"no-arguments");
            return;
        }
        _createCalendarCrossOrigin(schedule,studentId,callback);
    }
    
}

function _createCalendar(schedule, studentId, callback){
    var vCalendar = {
        version:'1.0',
        prodid:'FRI-urnik',
        events:[]
    }
    var year = /20\d\d/i.exec(schedule)[0];
    if(!year){
        callback(null, "wrong-schedule");
        return
    }
    jsdom.env('https://urnik.fri.uni-lj.si/timetable/'+schedule+'/allocations?student='+studentId,
        ["http://code.jquery.com/jquery.js"],
        function (err, window) {
            if(err){
                callback(null,err);
                return;
            }
            var cells = window.$("tr");
            for(var i = 0; i < cells.length;i++){
                for(var k = 0; k < cells[i].childNodes.length; k++){
                    if(cells[i].childNodes[k].nodeName.toLowerCase()=="td"){
                        var hour;
                        var className = cells[i].childNodes[k].attributes.class.nodeValue;
                        if(className =="hour"){
                            hour = cells[i].childNodes[k].childNodes[0].nodeValue;
                        }else if(className.indexOf("allocated")!=-1){
                            var day = className.substring(0,3);
                            var length = cells[i].childNodes[k].attributes[2].nodeValue;
                            var what = cells[i].childNodes[k].childNodes[1].childNodes[3].childNodes[0].nodeValue;
                            var where = cells[i].childNodes[k].childNodes[1].childNodes[6].childNodes[0].nodeValue;
                            
                            var vEvent = _createEvent(year,day,hour,length,what,where,studentId);
                            vCalendar.events.push(vEvent);
                        }
                    }
                }
            }
            callback(vCalendar,null);
        }
    );
} 

function _createCalendarCrossOrigin(schedule, studentId, callback){
    var vCalendar = {
        version:'1.0',
        prodid:'FRI-urnik',
        events:[]
    }
    var year = /20\d\d/i.exec(schedule)[0];
    if(!year){
        callback(null, "wrong-schedule");
        return
    }
    var url = 'http://www.whateverorigin.org/get?url='+'https://urnik.fri.uni-lj.si/timetable/'+schedule+'/allocations?student='+studentId;
    jsdom.env({
        html:"<html><body></body></html>",
        scripts:["http://code.jquery.com/jquery.js"],
        done: function (err, window) {
            if(err){
                callback(null,err);
                return;
            }
            window.$.ajaxPrefilter( function (options) {
            if (options.crossDomain && window.jQuery.support.cors) {
                var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
                options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
                //options.url = "http://cors.corsproxy.io/url=" + options.url;
            }
            });

            window.$.get(
                'https://urnik.fri.uni-lj.si/timetable/2015_2016_zimski/allocations?student=63130185',
                function (response) {
                    
                    window.$("body").html(response);
                    var cells = window.$("tr");
                    for(var i = 0; i < cells.length;i++){
                        for(var k = 0; k < cells[i].childNodes.length; k++){
                            if(cells[i].childNodes[k].nodeName.toLowerCase()=="td"){
                                var hour;
                                var className = cells[i].childNodes[k].attributes.class.nodeValue;
                                if(className =="hour"){
                                    hour = cells[i].childNodes[k].childNodes[0].nodeValue;
                                }else if(className.indexOf("allocated")!=-1){
                                    var day = className.substring(0,3);
                                    var length = cells[i].childNodes[k].attributes[2].nodeValue;
                                    var what = cells[i].childNodes[k].childNodes[1].childNodes[3].childNodes[0].nodeValue;
                                    var where = cells[i].childNodes[k].childNodes[1].childNodes[6].childNodes[0].nodeValue;
                                    
                                    var vEvent = _createEvent(year,day,hour,length,what,where,studentId);
                                    vCalendar.events.push(vEvent);
                                }
                            }
                        }
                    }
                    callback(vCalendar,null);
            });
        }
    });
}

function _createEvent(year,day, hour, length, what, where,studentId){
    var date = _getFirstDayInOctober(new Date(year,9,1,hour.split(":")[0],0,0,0),day);
    //20141010T080000
    var vEvent = {
        uid:studentId,
        dtstamp: date.getFullYear()+""+("0"+(date.getMonth()+1)).slice(-2)+""+("0"+date.getDate()).slice(-2)+"T"+("0"+date.getHours()).slice(-2)+"0000",
        dtstart: date.getFullYear()+""+("0"+(date.getMonth()+1)).slice(-2)+""+("0"+date.getDate()).slice(-2)+"T"+("0"+date.getHours()).slice(-2)+"0000",
        dtend: date.getFullYear()+""+("0"+(date.getMonth()+1)).slice(-2)+""+("0"+date.getDate()).slice(-2)+"T"+("0"+(date.getHours()+ parseInt(length))).slice(-2)+"0000",
        location: "Vecna pot 113, Ljubljana",
        description: what +" - "+where,
        summary:what +" - "+where,
        priority:3,
        rrule:"FREQ=WEEKLY"
    }
    return vEvent;
}

function _getFirstDayInOctober(date, day){
    if(day =="MON" && date.getDay() == 1){
        return date;
    }
    else if(day =="TUE" && date.getDay() == 2){
        return date;
    }
    else if(day == "WED" && date.getDay() == 3){
        return date;
    }
    else if(day == "THU" && date.getDay() == 4){
        return date;
    }
    else if(day == "FRI" && date.getDay() == 5){
        return date;
    }
    else{
        date = _addDays(date, 1);
        return _getFirstDayInOctober(date, day);
    }
}

function _addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}