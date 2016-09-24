$(function(){
    $("#getScheduleButton").on('click',getSchedulButtonClicked);
    $("#file").on('click', function(){
        this.href = 'data:text/plain;charset=utf-8,'
          + encodeURIComponent($("#result").val());
    })
})

function getSchedulButtonClicked(){
    $("#results").show();
    $("#resultsLoader").show();
    $("#resultsForm").hide();

    var schedule = $("#schedule").val();
    var studentId = $("#studentId").val();
    $.ajax({
        method: "GET",
        url: "https://fri-urnik-exporter.herokuapp.com/schedule/"+schedule+"/"+studentId,
        timeout: 20000
    })
    .done(function( data ) {
        console.log(data);
        var output = generateData(data);
        $("#resultsLoader").hide();
        $("#resultsForm").show();
        $("#result").val(output);
    })
    .fail(function(err){
        $("#results").hide();
    })
}

function generateData(data){
    var output ="BEGIN:VCALENDAR\n";
    output+="PRODID:"+data.prodid+"\n";
    output+="VERSION:"+data.version+"\n";
    for(var i = 0; i < data.events.length; i++){
        output+="BEGIN:VEVENT\n";
        output+="UID:"+data.events[i].uid+"\n";
        output+="DTSTAMP:"+data.events[i].dtstamp+"\n";
        output+="DTSTART:"+data.events[i].dtstart+"\n";
        output+="DTEND:"+data.events[i].dtend+"\n";
        output+="LOCATION:"+data.events[i].location+"\n";
        output+="DESCRIPTION:"+data.events[i].description+"\n";
        output+="SUMMARY:"+data.events[i].summary+"\n";
        output+="PRIORITY:"+data.events[i].priority+"\n";
        output+="RRULE:"+data.events[i].rrule+"\n";
        output+="END:VEVENT\n\n"
    }
    output+="END:VCALENDAR";
    return output;
}
