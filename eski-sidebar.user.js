// ==UserScript==
// @name          EksiSozluk sidebar gereci
// @namespace     http://github.com/cnkt
// @description	  Basliklar icin bilgiler iceren bir sidebar olusturur
// @include       http://www.eksisozluk.com/show.asp*
// ==/UserScript==


function addJQuery(callback) {
    var script = document.createElement("script");
    script.setAttribute("src", "//code.jquery.com/jquery-latest.min.js");
    script.addEventListener('load', function () {
        var script = document.createElement("script");
        script.textContent = "(" + callback.toString() + ")();";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
}

function main() {

    $('head').append("<style>#eksi-sidebar{-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;-webkit-box-shadow:0 0 20px #eeeeee;-moz-box-shadow:0 0 20px #eeeeee;box-shadow:0 0 20px #eeeeee;background-color:#f8f8f8;background-image:-moz-linear-gradient(top, #ffffff, #eeeeee);background-image:-ms-linear-gradient(top, #ffffff, #eeeeee);background-image:-webkit-gradient(linear, 0 0, 0 100%, from(#ffffff), to(#eeeeee));background-image:-webkit-linear-gradient(top, #ffffff, #eeeeee);background-image:-o-linear-gradient(top, #ffffff, #eeeeee);background-image:linear-gradient(top, #ffffff, #eeeeee);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffff', endColorstr='#eeeeee', GradientType=0);font-family:'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;border:1px solid #999999;margin:10px;padding:10px;width:300px;}#eksi-sidebar .topic-thumbnail{margin:10px;}.pull-right{float:right;}.pull-left{float:left;}</style>");

    var searchApiRoot = 'https://www.googleapis.com/freebase/v1/search?limit=1&query=';
    var baslik = $('.title a').eq(0).text();

    var searchResult = $.getJSON(
        searchApiRoot + encodeURIComponent(baslik),
        null,
        function (result) {
            if (result.result.length == 0) {
                console.log('//eksi-sidebar : Sonuc gelmedi.');
                return;
            } else {
                getTopic(result.result[0]);
            }
        }
    );

    function getTopic(data) {
        console.log(data);
        var topicApiRoot = 'https://www.googleapis.com/freebase/v1/topic';
        var query =  (data.id) ? data.id : data.mid
        $.getJSON(topicApiRoot + query + '?callback=?&filter=suggest&filter=/common/topic/article&filter=/common/topic/image', null, function (topic) {
            showTopic(topic);
        });
    }

    function showTopic(topic) {
        //$('.rightcol').append('<div id="eksi-sidebar"></div>');
        $('.title').eq(0).after('<div id="eksi-sidebar" class="pull-right"></div>');
        var $topic = $("#eksi-sidebar");
        $topic.empty();
        var image_url = '';
        if (topic['property']['/common/topic/image'] != null) {
            images = topic['property']['/common/topic/image']['values'];
            image_url = 'https://usercontent.googleapis.com/freebase/v1/image' + images[images.length - 1]['id'] + '?maxwidth=100';
        }
        $topic.append('<h3>' + topic['property']['/type/object/name']['values'][0]['text'] + '</h3>');
        $topic.append('<img class="topic-thumbnail pull-left" src="' + image_url + '"/>');
        var $fact_box = $('<div class="topic-facts"></div>');
        $fact_box.append('<p class="notable-for">' + topic['property']['/common/topic/notable_for']['values'][0]['text'] + '</p>');
        var $description = $('<div class="topic-description"></div>');
        $description.text(topic['property']['/common/topic/article']['values'][0]['property']['/common/document/text']['values'][0]['value'].split("\n")[0]);
        $fact_box.append($description);
        $topic.append($fact_box);
        $topic.show();
        console.log(topic['property']);
    }
}

addJQuery(main);