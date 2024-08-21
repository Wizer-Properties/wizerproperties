$(function(){

    function scroll_bown(){
        $('.chat-history').animate({
            scrollTop: $('.chat-history').offset().top 
        }, 800);
    }

    $(".chatbot-send-btn").click(function(){
        var this_ = $(this)
        var content = $(".class-chatbot-input").val()
        if (content.trim().length == 0) return;

        var chatHistory = $(".chat-history")
        chatHistory.css("display", "block")
        
        var chatArea = chatHistory.find("ul").find(".chat-content-area")

        var contentHtml = '<li class="clearfix">' +
                '<div class="message my-message">' + content + '</div>'
            '</li>'

        $(".chatbot-loader").css("display", "block")
        chatArea.append(contentHtml)

        this_.attr("disabled", "");
        scroll_bown()

        $.ajax({
            url: "/core/api/chatbot-gpt-api/",
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken
            },
            data: {
                content: content
            },
            success: function(res){
                var data = JSON.parse(res.data)

                $(".chatbot-loader").css("display", "none")

                chatArea.append('<li class="clearfix">' +
                    '<div class="message other-message float-right">' + data.choices[0].message.content + "</div>" +
                "</li>")

                $(".class-chatbot-input").val("")
                this_.removeAttr("disabled")
                scroll_bown()
            },
            error: function(err){
                $(".chatbot-loader").css("display", "none")
                this_.removeAttr("disabled")
            }
        })
    })

    $(".class-chatbot-input").keypress(function(event) {
        if (event.keyCode === 13) {
            $(".chatbot-send-btn").click();
        }
    });

})