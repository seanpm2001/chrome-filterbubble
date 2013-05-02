

//  var regexp = new RegExp(/^https?:\/\/(www|encrypted)\.google\..*\/.*&sky=ee(.*|)$/);
//  if (regexp.test(window.location.href)) {

//  }
//

const EXTENSION_TEXT = ' (filter bubble extension)';

function getQueryFromURL() {
    var regex = new RegExp('[\?\&]q=([^\&#]+)');
    if(regex.test(window.location.href)) {
        var q = window.location.href.split(regex);
        q = q[q.length - 2].replace(/\+/g," ");

        return decodeURIComponent(q);
    }
}

function updateResults() {
    var query = getQueryFromURL();
    console.log(query);
    
    getAOLResults(query, function(r){
        
        var cleanResults = [];
        var cleanResultsData = [];
        var dirtyResults = [];


        r.each(function(){
            console.log($(this).find('a').eq(0));

            // ignoring sub-links
            if ($(this).find('a').eq(0).hasClass('sitelink')) {
                return;
            }
            
            // ignoring news boxes
            if ($(this).find('div').eq(0).hasClass('univ_news')) {
                return;
            }

            var url = $(this).find('a').attr('href');
            var title = $(this).find('a').html();
            var desc = $(this).find('p:not(.find)').html();

            cleanResults.push(url);
            cleanResultsData.push({url:url, title:title, desc:desc});
        });


        var results = $('#ires li.g:not(#newsbox):not(.noknav)');
        results.each(function(){
            var url = $(this).find('a').attr('href');

            if (url.indexOf('http') !== -1)
                dirtyResults.push(url);
        });
        
      //r.children().filter('.result').each(function(){
      //    var url = $(this).find('a').attr('href');
      //    var matches = url.match(/&s_cu=(.*?)&/);

      //    cleanResults.push(decodeURIComponent(matches[1]));
      //});

        console.log(cleanResults);
        console.log(dirtyResults);


        var iter = 0;
        results.each(function(){
            var url = $(this).find('a').attr('href');
            if (url.indexOf('http') === -1)
                return;

            var index = cleanResults.indexOf(url);
            var span = $('<div>').css({
                'color': '#b8b8b8',
                'font-weight': 'bold',
                'font-size': 'small'
            });
            span.addClass('ddg_filterbubble_box');

            if (index != -1) {
                if (index != iter) {
                    //span.html('#' + (index + 1) + ' &#10132; ' + '#' + (iter + 1));
                    if (index > iter) {
                        span.html('&nbsp;' + (index - iter))
                            .attr('title', 'Moved up ' +(index - iter)+ ' spots' + 
                                            EXTENSION_TEXT);
                        span.addClass('ddg_filterbubble_box_move-up');
                    } else {
                        span.html('&nbsp;' +(iter - index))
                            .attr('title', 'Moved down ' +(iter - index)+ ' spots' +
                                            EXTENSION_TEXT);
                        span.addClass('ddg_filterbubble_box_move-down');
                    } 
                } else {
                    span.css('padding-right', '0px');
                }
                $(this).find('h3').prepend(span);
            } else {
              //var div = $('<div>').css({
              //            'background-image': 'url(http://duckduckgo.com/assets/icon_plus.v103.png)',
              //            'height': '16px',
              //            'width': '16px',
              //            'float': 'left',
              //            'background-repeat': 'no-repeat',
              //            'padding-right': '2px'
              //            });
              //$(this).find('h3').prepend(div);

              span.attr('title', 'Added result' + EXTENSION_TEXT)
                  .addClass('ddg_filterbubble_box_added');

              $(this).find('h3').prepend(span);

            }

            //console.log(cleanResults.indexOf(dirtyResults[iter]), dirtyResults[iter]);

            if (dirtyResults.indexOf(cleanResults[iter]) === -1) {
                
                // adds generated google result
                $(this).after(generateGoogleResult(cleanResultsData[iter]));
                //console.log(iter, cleanResults[iter], cleanResultsData[iter]);
                //console.log(generateGoogleResult(cleanResultsData[iter]));

            }

            iter += 1;



        });
    });

}


window.addEventListener("hashchange", updateResults, false);

$(document).ready(function(){
    //console.log(results);
    updateResults();
});


function generateGoogleResult(r) {
    var span = $('<span>').css({
                'color': 'red',
                'font-size': 'small'
            });
    span.css({ 
                'color': '#b8b8b8',
                'font-size': 'x-large',
                'font-weight': 'bold',
              })
        .html('-')
        .attr('title', 'Missing result' + EXTENSION_TEXT);
 
    var resultDiv = $('<div>').attr('class', 'vsc');
    resultDiv.append($('<h3>').prepend(span).append(
                        $('<a>').attr({href: r.url, class: 'l'})
                                .html(r.title)));
    resultDiv.append($('<div>').attr('class', 's').append(
                        $('<div>').attr('class', 'f kv').append(
                            $('<cite>').html(r.url))).append(
                        $('<span>').attr('class', 'st').html(r.desc))
                    );
    return $('<li>').attr('class', 'g').append(resultDiv);
}

function getAOLResults(query, callback) {
    var req = new XMLHttpRequest();
    //req.open('GET', 'http://search.aol.com/aol/search?enabled_terms=&count_override=200&s_it=comsearch51&q=' + encodeURIComponent(query), true);
    var url = 'http://search.aol.com/aol/search?enabled_terms=&s_it=comsearch51&q=' + encodeURIComponent(query);
    console.log(url);
    req.open('GET', url, true);

    req.onreadystatechange = function(data) {
        if (req.readyState != 4)  { return; } 
        console.log('response:', req.responseText);
        var r = $('div', req.responseText);

        r = r.find('.MSL li');
        console.log(r);
        callback(r);
    }

    req.send(null);
}


