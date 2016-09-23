$.ajaxPrefilter( function (options) {
  if (options.crossDomain && jQuery.support.cors) {
    var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
    options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
    //options.url = "http://cors.corsproxy.io/url=" + options.url;
  }
});

$.get(
    'https://urnik.fri.uni-lj.si/timetable/2015_2016_zimski/allocations?student=63130185',
    function (response) {
        console.log("> ", response);
        $("body").html(response);
});