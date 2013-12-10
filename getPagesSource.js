// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

function init(script_tag, url, func) {

    var html = '', node = script_tag; //.firstChild;
    if(script_tag == null) {
        html = initRMFromXML();
    } else {
        html = eval(script_tag.text);
    }
    return func(html);
}

function normalize_object(object) {
    object.browser = "Google Chrome " + get_browser_version();
    object.os = detectOS();
    object.url = document.URL;
    object.screen_size = $(window).width() + " x " + $(window).height();
    object.clean_url = window.location.host+window.location.pathname;
    return object;
}

function detectOS() {
    var OSName="Unknown OS";
    if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
    if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
    if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
    if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
    return OSName;
}

function get_browser_version(){
    var N=navigator.appName, ua=navigator.userAgent, tem;
    var M=ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    M=M? [M[1], M[2]]: [N, navigator.appVersion, '-?'];
    return M[1];
    }

function loadXMLRMSettings(url) {

    jqXHR = $.ajax({
        url: url,
        datatype: 'json',
        async: false,
        success: function(msg) {
            console.log(msg);
        },
        error: function(msg) {
            console.log(msg);
        }
    })

    return jQuery.parseJSON(jqXHR.responseText);
}


function initRMFromXML() {
    var settings_array = loadXMLRMSettings("http://jstor.adyax.com/redmine_settings.json");

    for (var i = 0, l = settings_array.redmine.project.length; i < l; i ++) {
        if (window.location.host == settings_array.redmine.project[i].name)  {
            return settings_array.redmine.project[i];
        }
    }
}

chrome.extension.sendMessage({
    action: "getSource",
    source: init(document.getElementById("adyax_feedback"), document.URL, normalize_object)
});
