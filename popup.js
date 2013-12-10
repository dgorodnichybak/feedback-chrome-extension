chrome.extension.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
        console.log(request.source);
        firstStep(ext_wrapper, request.source);
    }
});

function firstStep(ext_wrapper, object) {
    var first_step = "<span><b>Browser: </b>" + object.browser + "</span><br />";
    first_step += "<span><b>OS: </b>" + object.os +"</span><br />";
    first_step += "<span><b>URL: </b>" + object.url + "</span><br />";
    first_step += "<span><b>Screen size: </b>" + object.screen_size + "</span><br />";

    if(object.roles){
        first_step += "<span><b>User: </b></span> <br />";
        for (var key in object.roles) {
            var val = object.roles[key];
            first_step += " - " + val + "<br />";
        }
    }

    if(object.preprocess_css){
        first_step += "<span><b>Preprocess CSS: </b>" + object.preprocess_css + "</span><br />";
    }

    if(object.preprocess_js){
        first_step += "<span><b>Preprocess CSS: </b>" + object.preprocess_js + "</span><br />"; 
    }

    if(object.varnish){
        first_step += "<span><b>Varnish: </b>" + object.varnish + "</span><br />"; 
    }

    $(ext_wrapper).html(first_step);
    $(ext_wrapper).append("<div id=\"ext_links\"><a href=# id=\"ext_second_step\">next_step</a></div>").each(function() {
        $( "#ext_second_step" ).bind( "click", function() {
            secondStep(ext_wrapper, object);
        });
    });
}

function secondStep(ext_wrapper, object) {
    chrome.tabs.captureVisibleTab(null, {}, function (image) {
        console.log(image);
        var second_step = "<div id=\"ext_links\"><a href=# id=\"ext_previous_step\">previous step</a> &nbsp;&nbsp;&nbsp; ";
        second_step += "<a href=# id=\"ext_third_step\">next step</a></div>";
        $(ext_wrapper).html("<img src=\"" + image + "\" style=\"width:100%\">");
        object.screenshot = image;
        $(ext_wrapper).append(second_step).each(function() {
            $( "#ext_previous_step" ).bind( "click", function() {
                firstStep(ext_wrapper, object);
            });
            $( "#ext_third_step" ).bind( "click", function() {
                thirdStep(ext_wrapper, object);
            });
        });
    });

}

function thirdStep(ext_wrapper, object) {
    $(ext_wrapper).html("");
    var third_step = "<textarea id=\"ext_description_field\"></textarea><br />";
    third_step += "<div id=\"ext_links\"><a href=# id=\"ext_previous_step\">previous step</a> &nbsp;&nbsp;&nbsp; ";
    third_step += "<a href=# id=\"ext_send_issue\">send issue</a></div>";
    $(ext_wrapper).append(third_step).each(function() {
        $( "#ext_previous_step" ).bind( "click", function() {
            secondStep(ext_wrapper, object);
        });
        $( "#ext_send_issue" ).bind( "click", function() {
            sendIssue(object);
        });
    });

    if (object.description) {
        $("#ext_description_field").val(object.description);
    }

    $("#ext_description_field").change(function() {
        object.description = $("#ext_description_field").val();
        //alert( "Handler for .change() called." );
    });
}


function sendIssue(object) {
    console.log(object);
    $.post(
        "http://sliceautomation.adyax.com/find_issue",
        {
            url: document.URL.split('#')[0],
        }, function(data) {
            $("#issue_button").attr("src","http://feedback.adyax.com/images/disabled_button.png");
            $("#issue_button").parent().attr("href","#");
            $('#issue_button').parent().attr('onclick', 'alert(\'Issue already created. ' + object.full_server_url + '/issues/' + data.id_in_redmine + '\')');
            if (data == "empty") {
                //[>=============  Create issue in RM  ============<]
                $.post(
                    "http://jstor.adyax.com/issues",
                    {
                        //subject: window.adyax_feedback.redmine.issue_title,
                        subject: object.url.replace(/^https?:\/\//,'').split('#')[0],
                        assigned_to_id: object.assigne_target, 
                        project_id: object.prj_id,
                        base64_image: object.screenshot,
                        //description: window.dimension_fields + window.child_fields + "\n\n" +d.getElementById("issue_description").value,
                        description: "test", //d.getElementById("issue_description").value,
                        api_key: object.redmine_API_access_key,
                        redmine_url: object.full_server_url
                    })
                    .done(function(issue_id_in_redmine) {
                        console.log(object.full_server_url + "/issues/" + issue_id_in_redmine);
                        alert(object.full_server_url + "/issues/" + issue_id_in_redmine);

                        //[>=============  Create issue in SA  ============<]
                        $.post(
                            "http://sliceautomation.adyax.com/issue_urls",
                            {
                                url: object.url.replace(/^https?:\/\//,'').split('#')[0],
                                issue_id: issue_id_in_redmine
                            },function(data_sa){
                });
                            //[>=============  !Create issue in SA  ============<]

                    })
                    .fail(function(msg) {
                        console.log(msg);
                    })


            } else {
                //[>=============  !Update issue in RM  ============<]
                $.ajax({
                    type: "post",
                    url: 'http://jstor.adyax.com/issues/' + data.id_in_redmine,
                    data: { 
                        _method:'put', 
                        api_key: object.redmine_API_access_key,
                        redmine_url: object.full_server_url,
                        //subject: window.adyax_feedback.redmine.issue_title,
                        subject: object.url.replace(/^https?:\/\//,'').split('#')[0],
                        description: "test", //d.getElementById("issue_description").value, 
                        //description: dimension_fields + child_fields + "\n\n" +d.getElementById("issue_description").value, 
                        assigned_to_id: object.assigne_target, 
                        project_id: object.prj_id,
                        base64_image: object.screenshot,

                    },
                    datatype: 'json',
                    success: function(msg) {
                        if(msg == ""){
                            console.log(object.full_server_url + "/issues/" + issue_id);
                            alert(object.full_server_url + "/issues/" + issue_id);
                        } else {
                            $.post( "http://sliceautomation.adyax.com/find_issue",
                                   {
                                       url: object.url.replace(/^https?:\/\//,'').split('#')[0],
                                   },function(dt){
                                       $.ajax({
                                           type: "post",
                                           url: "http://sliceautomation.adyax.com/issue_urls/"+dt.id,
                                           data: { 
                                               _method:'put', 
                                               url: object.url.replace(/^https?:\/\//,'').split('#')[0],
                                               issue_id: dt.id_in_redmine
                                           },
                                           datatype: 'json'})
                                           alert("" + object.full_server_url + "/issues/" + dt.id_in_redmine);
                                   });
                        }

                    },
                    error: function(msg) {
                        console.log(msg);
                    }
                });
            }
        }
    )
}








function onWindowLoad() {

    var ext_wrapper = document.querySelector('#wrapper');

    chrome.tabs.executeScript(null, {
        file: "getPagesSource.js"
    }, function() {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.extension.lastError) {
            ext_wrapper.innerText = 'There was an error injecting script : \n' + chrome.extension.lastError.message;
        }
    });

}

window.onload = onWindowLoad;

