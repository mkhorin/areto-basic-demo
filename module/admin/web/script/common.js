'use strict';

$('.datepicker').datepicker({
    dateFormat: 'yy-mm-dd'
});

$('.list-search').click(function () {
    const $btn = $(this).attr('disabled', true);
    const $input = $btn.closest('.input-group').find('input');
    window.location = location.pathname
        + '?search='
        + encodeURIComponent($.trim($input.val()));
});

$('.list-search-input').keyup(function (event) {
    if (event.keyCode === 13) {
        $(this).parent().find('.list-search').click();
    }
});

$('.action-submit').click(function () {
    const $btn = $(this);
    if (!$btn.data('confirm') || confirm($btn.data('confirm'))) {
        const $form = $btn.closest('form');
        $btn.parent().find('button').attr('disabled', true);
        $form.attr('action', $btn.data('url')).submit();
    }    
});

$('.delete-object-ajax').click(function () {
    const $btn = $(this);
    if (!$btn.data('confirm') || confirm($btn.data('confirm'))) {
        const $buttons = $btn.parent().find('button').attr('disabled', true);
        postAjax($btn.data('url')).done(function () {
            location.reload();
        }).fail(function (xhr) {
            console.error(xhr);
            $buttons.removeAttr('disabled');
        });
    }
});

$('.uploader').each(function () {
    const $uploader = $(this);
    const $field = $($uploader.data('id'));
    $uploader.ajaxUploader()
        .on('uploader.selected', function () {
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
        .on('uploader.file.validated', function (event, {image, $item}) {
            if (image) {
                $item.addClass('preview').find('.uploader-preview').append(image);
            }
        })
        .on('uploader.file.started', function (event, {$item}) {
            $item.removeClass('pending').addClass('processing');
            $item.find('.uploader-message').text('Uploading...');
        })
        .on('uploader.file.progress', function (event, {$item, percent}) {
            $item.find('.progress-bar').css('width', percent + '%');
        })
        .on('uploader.file.uploaded', function (event, {$item, response}) {
            $item.removeClass('pending processing').addClass('done');
            $item.find('.uploader-message').text('Uploaded');
            $field.val(addValueToString(response, $field.val()));
        })
        .on('uploader.file.error', function (event, {$item, error}) {
            $item.removeClass('pending processing').addClass('failed');
            $item.find('.uploader-message').text(error || 'Uploading failed');
        });
    $uploader.data('uploader').initItems();
});

function addValueToString (value, str) {
    const array = str ? str.split(',') : [];
    array.push(value);
    return array.join(',');
}

function removeValueFromString (value, str) {
    const array = str ? str.split(',') : [];
    const index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array.join(',');
}

function postAjax (url, data) {
    return $.post(url, {csrf: getCsrfToken(), ...data});
}

function getCsrfToken () {
    return document.body.dataset.csrf;
}