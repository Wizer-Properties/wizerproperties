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

})