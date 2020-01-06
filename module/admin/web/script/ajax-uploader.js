'use strict';

(function () {
    const defaultSettings = {
        fileAttrName: 'file',
        maxFiles: 1,
        minSize: 1,
        maxSize: 10000000,
        extensions: null,
        mimeTypes: null,
        tooSmall: 'File size cannot be smaller than {limit} B',
        tooBig: 'File size cannot exceed {limit} B',
        wrongExtension: 'Only these extensions are allowed: {extensions}',
        wrongMimeType: 'Only these MIME types are allowed: {mimeTypes}',
        imageOnly: false,
        maxHeight: null,
        maxWidth: null,
        minHeight: 1,
        minWidth: 1,
        notImage: 'The file is not an image',
        overHeight: 'The height cannot be larger than {limit} px',
        overWidth: 'The width cannot be larger than {limit} px',
        underHeight: 'The height cannot be smaller than {limit} px',
        underWidth: 'The width cannot be smaller than {limit} px',
        tooMany: 'Too many files',
        alreadyExists: 'This file has already been selected',
        deletionConfirmStatuses: ['done', 'uploading']
    };

    const methods = {
        settings: function (options) {
            // override default settings for new uploader
            return $.extend(defaultSettings, options);
        }
    };

    $.fn.ajaxUploader = function (method, params) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object') {
            return methods.settings.apply(this, arguments);
        } else if (method) {
            $.error('Not found uploader method:' +  method);
        }
        return this.each(function () {
            const $uploader = $(this);
            if (!$uploader.data('uploader')) {
                new Uploader($uploader);
            }
        });
    };

    // EVENTS

    // uploader.error
    // uploader.selected - select new files
    // uploader.overflow - select too many files
    // uploader.finished - all files uploaded

    // uploader.file.appended - new uploader file
    // uploader.file.validated - item validated
    // uploader.file.started - start upload
    // uploader.file.progress - progress upload - percents
    // uploader.file.uploaded - file uploaded
    // uploader.file.removed - remove file

    // UPLOADER

    function Uploader ($uploader) {
        const self = this;
        this.$uploader = $uploader;
        this.options = $.extend({}, defaultSettings, $uploader.data('options'));
        this.url = $uploader.data('url');
        this.files = [];
        this.$input = $uploader.find('.uploader-input-file');
        this.initDropZone();

        if (this.options.mimeTypes) {
            this.$input.attr('accept', this.options.mimeTypes.join(','));
        }
        if (this.options.maxFiles > 1) {
            this.$input.attr('multiple', true);
        }
        this.$input.change(function () {
            self.setFiles(this.files);
        });
        $uploader.data('uploader', this);
    }

    Uploader.prototype = {
        constructor: Uploader,

        isFinished: function () {
            for (let i = 0; i < this.files.length; ++i) {
                if (this.files[i].isProcessing()) {
                    return false;
                }
            }
            return true;
        },

        fireEvent: function (eventName, data) {
            this.$uploader.trigger('uploader.' + eventName, data);
        },

        initDropZone: function () {
            const self = this;
            this.$dropzone = this.$uploader.find(".uploader-dropzone");
            const dropzone = this.$dropzone.get(0);
            dropzone.ondragover = function () {
                //$dropZone.addClass('drag');
                return false;
            };
            dropzone.ondragleave = function () {
                //$dropZone.removeClass('drag');
                return false;
            };
            dropzone.ondrop = function (event) {
                event.preventDefault();
                self.setFiles(event.dataTransfer.files);
                return false;
            };
            dropzone.onclick = function () {
                self.$input.click();
            };
        },

        initItems: function () {
            const items = this.options.items;
            if (items instanceof  Array) {
                for (let i = 0; i < items.length; ++i) {
                    const file = new UFile(null, this);
                    this.files.push(file);
                    file.setFromData(items[i]);
                }
                if (items.length >= this.options.maxFiles) {
                    this.$dropzone.hide();
                }
            }
        },

        setFiles: function (files) {
            const counter = this.count();
            counter.total += files.length;
            if (counter.total > this.options.maxFiles) {
                this.fireEvent('overflow', this.options.tooMany);
            } else if (files.length) {
                for (let i = 0; i < files.length; ++i) {
                    this.files.push(new UFile(files[i], this));
                }
                if (counter.total === this.options.maxFiles) {
                    this.$dropzone.hide();
                }
                resetFormElement(this.$input);
                this.fireEvent('selected', counter);
                this.processNext();
            }
        },

        count: function () {
            const counter = {total: 0, failed: 0, done: 0};
            for (let i = 0; i < this.files.length; ++i) {
                if (!this.files[i].removed) {
                    if (this.files[i].failed) {
                        ++counter.failed;
                    }
                    if (this.files[i].status === File.STATUS_DONE) {
                        ++counter.done;
                    }
                    ++counter.total;
                }
            }
            return counter;
        },

        processNext: function () {
            setTimeout(function () {
                const data = this.getFirstFilesByStatus();
                if (UFile.STATUS_PENDING in data) {
                    data[UFile.STATUS_PENDING].append();
                } else if (UFile.STATUS_APPENDED in data) {
                    data[UFile.STATUS_APPENDED].validate();
                } else if (UFile.STATUS_VALIDATED in data && !(UFile.STATUS_UPLOADING in data)) {
                    data[UFile.STATUS_VALIDATED].upload();
                }
            }.bind(this), 250);
        },

        getFirstFilesByStatus: function () {
            const data = {};
            for (let i = 0; i < this.files.length; ++i) {
                const file = this.files[i];
                if (!file.removed && !file.failed && !(file.status in data)) {
                    data[file.status] = file;
                }
            }
            return data;
        }
    };

    // UFILE

    function UFile (file, uploader) {
        this.failed = false;
        this.removed = false;
        this.status = UFile.STATUS_PENDING;
        this.file = file;
        this.uploader = uploader;
    }

    UFile.STATUS_PENDING = 'pending';
    UFile.STATUS_APPENDED = 'appended';
    UFile.STATUS_VALIDATED = 'validated';
    UFile.STATUS_UPLOADING = 'uploading';
    UFile.STATUS_DONE = 'done';

    UFile.prototype = {
        constructor: UFile,

        setFromData: function (data) {
            this.file = data;
            this.status = UFile.STATUS_DONE;
            this.response = data.id;
            this.fireEvent('appended');
            this.fireEvent('uploaded');
        },

        fireEvent: function (eventName) {
            this.uploader.fireEvent('file.' + eventName, this);
        },

        isProcessing: function () {
            return !this.removed && !this.failed && this.status !== UFile.STATUS_DONE;
        },

        setError: function (error) {
            this.failed = true;
            this.error = error;
            this.fireEvent('error');
        },

        remove: function () {
            this.removed = true;
            if (this.xhr) {
                this.xhr.abort();
            }
            this.uploader.$dropzone.show();
            this.fireEvent('remove');
        },

        isDeletionConfirm: function () {
            return !this.failed && this.uploader.options.deletionConfirmStatuses.indexOf(this.status) > -1;
        },

        // APPEND

        append: function () {
            this.status = UFile.STATUS_APPENDED;
            this.fireEvent('appended');
            this.uploader.processNext();
        },

        // VALIDATE

        validate: function () {
            // SKIP VALIDATION
            /*this.status = UFile.STATUS_VALIDATED;
            this.fireEvent('validated');
            this.uploader.processNext();
            return; //*/
            // trying to load a file as an image and then start to validate
            this.image = new Image;
            this.image.onload = this.startValidate.bind(this);
            this.image.onerror = function () {
                this.image = null;
                this.startValidate();
            }.bind(this);
            this.image.src = window.URL.createObjectURL(this.file);
        },

        startValidate: function () {
            const error = this.validateFile();
            this.status = UFile.STATUS_VALIDATED;
            this.fireEvent('validated');
            if (error) {
                this.setError(error);
            }
            this.uploader.processNext();
        },

        validateFile: function () {
            const options = this.uploader.options;
            const file = this.file;
            if (this.isMatchFile()) {
                return options.alreadyExists;
            }
            if (options.extensions) {
                const index = file.name.lastIndexOf('.');
                const ext = index > -1 ? file.name.substr(index + 1, file.name.length).toLowerCase() : '';
                if (options.extensions.indexOf(ext) < 0) {
                    return options.wrongExtension.replace(/{extensions}/g, options.extensions.join(', '));
                }
            }
            if (options.mimeTypes && options.mimeTypes.indexOf(file.type) < 0) {
                return options.wrongMimeType.replace(/{mimeTypes}/g, options.mimeTypes.join(', '));
            }
            if (options.maxSize && options.maxSize < file.size) {
                return options.tooBig.replace(/{limit}/g, options.maxSize);
            }
            if (options.minSize && options.minSize > file.size) {
                return options.tooSmall.replace(/{limit}/g, options.minSize);
            }
            if (options.imageOnly) {
                return this.image ? this.validateImage() : options.notImage;
            }
            if (this.image) {
                return this.validateImage();
            }
            if (options.imageOnly) {
                return options.notImage;
            }
            return false;
        },

        isMatchFile: function () {
            const files = this.uploader.files;
            for (let i = 0; i < files.length; ++i) {
                if (!files[i].removed) {
                    if (files[i] === this) {
                        return false;
                    }
                    if (files[i].file.size === this.file.size && files[i].file.name === this.file.name) {
                        return true;
                    }
                }
            }
            return false;
        },

        validateImage: function () {
            const options = this.uploader.options;
            if (options.maxHeight && options.maxHeight < this.image.height) {
                return options.overHeight.replace(/{limit}/g, options.maxHeight);
            }
            if (options.maxWidth && options.maxWidth < this.image.width) {
                return options.overWidth.replace(/{limit}/g, options.maxWidth);
            }
            if (options.minHeight && options.minHeight > this.image.height) {
                return options.underHeight.replace(/{limit}/g, options.minHeight);
            }
            if (options.minWidth && options.minWidth > this.image.width) {
                return options.underWidth.replace(/{limit}/g, options.minWidth);
            }
            return false;
        },

        // UPLOAD

        upload: function () {
            this.xhr = new XMLHttpRequest;
            this.xhr.open('POST', this.uploader.url);
            this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            if (this.xhr.upload) {
                this.xhr.upload.addEventListener('progress', this.progressUploading.bind(this), false);
            }
            this.xhr.onreadystatechange = this.changeReadyState.bind(this);
            const data = new FormData;
            data.append(this.uploader.options.fileAttrName, this.file.name);
            data.append(this.uploader.options.fileAttrName, this.file);     
            this.status = UFile.STATUS_UPLOADING;
            this.fireEvent('started');
            this.xhr.send(data);
        },

        progressUploading: function (event) {
            // can be FALSE if server never sent Content-Length header in the response
            if (event.lengthComputable) {
                this.percent = parseInt(event.loaded * 100 / event.total);
                this.fireEvent('progress');
            }
        },

        changeReadyState: function () {
            if (this.xhr.readyState === 4) {
                if (this.xhr.status === 200) {
                    this.status = UFile.STATUS_DONE;
                    this.response = this.xhr.response;
                    this.fireEvent('uploaded');
                } else {
                    this.setError(this.xhr.response);
                }
                this.uploader.processNext();
            }
        }
    };

    function resetFormElement ($element) {
        $element.wrap('<form>').closest('form').get(0).reset();
        $element.unwrap();
    }
})();