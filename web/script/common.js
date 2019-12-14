'use strict';

$('.checkbox-control').change(function () {
    $(this).prev().val(this.checked ? 1 : 0);
}).change();

$('.captcha-refresh').click(function (event) {
    event.preventDefault();
    $(this).prev().attr('src', this.href + (new Date).getTime());
});

$('#category-nav').children('.list-group-item').filter(function () {
    return this.getAttribute('href') === location.pathname + location.search;
}).addClass('active');