$(document).ready(function(){
    $('.uploaded-file-with-view input[multiple]').change(function(){
            var files = this.files;
            var blobUrlsDom = '';


            for (let i = 0; i < files.length; i++) {
                var file = files[i];
                var blobUrl = URL.createObjectURL(file);

                blobUrlsDom += '<div class="uploaded-file-view-img">'+
                                '<button index="'+i+'"><i class="bi bi-x"></i></button>'+ 
                                ' <img src="'+blobUrl+'" alt="">'+
                            '</div>'
            }

            $(this).parents('.uploaded-file-with-view')
            .find('.uploaded-file-view-area').html(blobUrlsDom);
    });


    $(document).on('click', '.uploaded-file-view-img button', function(){
        var index_number = $(this).attr('index');
        var input_field = $(this).parents('.uploaded-file-with-view').find('input');
        var newFilesList = new DataTransfer();

        for (let i = 0; i < input_field[0].files.length; i++) {
            if (i != index_number) {
                var $file = input_field[0].files[i];
                var $newFile = new File([$file], $file.name, { type: $file.type });
                newFilesList.items.add($newFile);
            }
        };

        input_field.prop('files', newFilesList.files);
        $(this).parents('.uploaded-file-view-img').remove()
    });

    $('.uploaded-file-with-view input').change(function(){
        var is_multiple = $(this).attr('multiple');
        if( ![null, undefined].includes(is_multiple) ) return;

        var files = this.files;
        $(this).parent().find('.fileName').html(files[0]?.name || "Upload File")
    });


    var password_view = $('[box-type="password"]');
    if(password_view.length != 0){
        $('[box-type="password"]')
        .append('<span class="password-view"><i class="bi bi-eye-fill"></i></span>')
    };

    $(document).on('click', '.password-view', function(){
        var get_input = $(this).parents('[box-type="password"]').find('input');
        if(get_input.attr('type') == 'password'){
            $(this).html('<i class="bi bi-eye-slash-fill"></i>')
            get_input.attr('type', 'text')
        }else{
            $(this).html('<i class="bi bi-eye-fill"></i>')
            get_input.attr('type', 'password')
        };
    })


    var get_auth_sdf = $('.auth-form-row')

    $(document).on('click', '[log-modal-btn]', function(){
        $('body').attr('log-modal', $(this).attr('log-modal-btn'))
    });    
    

    $(document).on('click', '.add-to-favorite', function(){
        if(!user_type) return;
        localStorage.setItem("favorite-effect", true);
        $(this).attr('effect', true)
    })

    $(document).on('click', '.add-to-compare', function(){
        if(!user_type) return;
        localStorage.setItem("favorite-effect", true);
        $(this).attr('effect', true)

    });
});


// pop-ups start ======================================

function getElementWidthWhileHidden(element) {
    // Create a clone of the element
    var clone = element.cloneNode(true);
    clone.style.cssText = 'display: block !important;'
    element.parentNode.appendChild(clone);
    var width = clone.offsetWidth;
    var height = clone.offsetHeight;
    // Clean up: remove the clone from the DOM
    clone.parentNode.removeChild(clone);
    // Return the measured width
    return {width, height};
};

function positionFixedElement(el_obj) {
    var maxWidth = window.innerWidth - 30 - el_obj?.width;
    // Ensure desiredLeft and desiredTop are within the window bounds
    var finalLeft = Math.min(Math.max(el_obj?.desiredLeft, 0), maxWidth);
    // const finalTop = Math.min(Math.max(el_obj?.desiredTop, 0), maxHeight);

    el_obj.element.style.left = finalLeft+'px';
    el_obj.element.style.top = el_obj.height+'px';
};

$(document).on('click', '[pop-target]', function(){
    var target_name = $(this).attr('pop-target');
    var pop_element = $('[pop-element='+target_name+']');
    if(pop_element.length != 1) return;
    var get_el_offset = getElementWidthWhileHidden(pop_element[0]);
    var get_position = $(this).offset();
    var this_height = $(this).height();
    pop_element.addClass('pop-default-box');

    var rect = $(this)[0].getBoundingClientRect();
    var pop_top = rect.top  + window.pageXOffset + rect.height;

    var el_obj = {
        element : pop_element[0],
        width : get_el_offset.width,
        height : pop_top,
        desiredTop : get_position.top + this_height,
        desiredLeft : get_position.left,
    };

    positionFixedElement(el_obj);
    $('html').attr('pop-status', 'true');
    $('body').append('<div pop-overflow="true" pop-dispatch="true"></div>')
});


function pop_dispatch(){
    $('html').attr('pop-status', 'false');
    $('[pop-overflow]').remove();
    $('.pop-default-box').removeClass('pop-default-box');
};

$(document).on('click', '[pop-dispatch]', pop_dispatch)

/*
    ## how to apply

    <div pop-target="price-box">
        The button
    </div>

    <div pop-element="price-box">
        The context
    </div>
*/ 

// pop-ups end ======================================