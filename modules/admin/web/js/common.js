'use strict';

$('.datepicker').datepicker({
    dateFormat: 'yy-mm-dd'
});

$('.list-search').click(function () {
    var $btn = $(this).attr('disabled', true);
    var $input = $btn.closest('.input-group').find('input');
    window.location = location.pathname + '?search=' + encodeURIComponent($.trim($input.val()));
});

$('.action-submit').click(function () {
    var $btn = $(this);
    if (!$btn.data('confirm') || confirm($btn.data('confirm'))) {
        var $form = $btn.closest('form');
        $btn.parent().find('button').attr('disabled', true);
        $form.attr('action', $btn.data('url')).submit();
    }    
});

$('.delete-object-ajax').click(function () {
    var $btn = $(this);
    if (!$btn.data('confirm') || confirm($btn.data('confirm'))) {
        var $btns = $btn.parent().find('button').attr('disabled', true);
        $.post($btn.data('url')).done(function () {
            location.reload();
        }).fail(function (xhr) {
            console.error(xhr);
            $btns.removeAttr('disabled');
        });
    }
});

$('.uploader').each(function () {
    var $uploader = $(this);
    var $field = $($uploader.data('id'));
    $uploader.ajaxUploader()
        .on('uploader.selected', function (event, data) {
            $uploader.find('.uploader-overflow').hide();
        })
        .on('uploader.overflow', function (event, data) {
            $uploader.find('.uploader-overflow').text(data).show();
        })
        .on('uploader.file.appended', function (event, data) {
            data.$item = $uploader.find('.sample').clone().removeClass('sample').show();
            $uploader.find('.uploader-list').prepend(data.$item);
            data.$item.find('.uploader-filename').text(data.file.name +' ('+ data.file.size +')');
            data.$item.find('.uploader-remove').click(function () {
                if (!data.isConfirmRemove() || confirm('Remove uploaded file?')) {
                    $field.val(removeValueFromString(data.response, $field.val()));
                    data.remove();
                    data.$item.remove();
                }
            });            
        })
        .on('uploader.file.validated', function (event, data) {
            if (data.image) {
                data.$item.addClass('thumb').find('.uploader-thumb').append(data.image);
            }
        })
        .on('uploader.file.started', function (event, data) {
            data.$item.removeClass('pending').addClass('processing');
            data.$item.find('.uploader-message').text('Uploading...');
        })
        .on('uploader.file.progress', function (event, data) {
            data.$item.find('.progress-bar').css('width', data.percent + '%');
        })
        .on('uploader.file.uploaded', function (event, data) {
            data.$item.removeClass('pending processing').addClass('done');
            data.$item.find('.uploader-message').text('Uploaded');
            $field.val(addValueToString(data.response, $field.val()));
        })
        .on('uploader.file.error', function (event, data) {
            data.$item.removeClass('pending processing').addClass('failed');
            data.$item.find('.uploader-message').text(data.error || 'Uploading is failed');
        });
    $uploader.data('uploader').initItems();
});

function addValueToString (value, str) {
    let array = str ? str.split(',') : [];
    array.push(value);
    return array.join(',');
}

function removeValueFromString (value, str) {
    var array = str ? str.split(',') : [];
    var index = array.indexOf(value);
    index > -1 && array.splice(index, 1);
    return array.join(',');
}