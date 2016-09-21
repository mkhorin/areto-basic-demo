'use strict';

$('.checkbox-control').change(function () {
    $(this).prev().val(this.checked ? 1 : 0);
}).change();