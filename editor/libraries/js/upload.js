/**
 * @version		$Id: upload.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

(function($) {
    $.widget("ui.uploader", {

        // uploader object
        uploader : {},

        // error count
        errors	: 0,

        uploading : false,

        options : {
            field			: $('input[name=file]:first'),
            size			: false,
            limit			: 5,
            debug			: false,
            filter			: null,
            swf				: 'uploader.swf',
            xap				: 'uploader.xap',
            runtimes		: 'html5,flash,silverlight,html4',
            chunk_size		: 0,
            urlstream_upload: true,
            insert			: true,
            buttons			: {},
            required		: ['multipart']
        },

        /**
         * File extension error. If the user selects a file that isn't valid according to the filters setting.
         *
         * @property FILE_EXTENSION_ERROR
         * @final
         */

        FILE_SIZE_ERROR : -600,

        FILE_EXTENSION_ERROR : -601,

        FILE_INVALID_ERROR : -800,

        _init : function() {
            var self = this;

            this.field 		= this.options.field;
            this.files 		= [];
            this.current	= null;

            $(this.field).css('display', 'none');

            // create target button
            this.target = document.createElement('button');

            $(this.target).addClass('uploadButton addQueue').attr('id', 'upload-add').button({
                label : $.Plugin.translate('add', 'Add'),
                icons : {
                    primary : 'ui-icon-circle-plus'
                }
            }).hide();

            // insert before field
            $(this.field).before(this.target);

            // create remove button
            var remove = document.createElement('button');

            $(remove).addClass('uploadButton removeQueue').click( function() {
                self._removeFiles();
            }).button({
                label : $.Plugin.translate('clear', 'Clear'),
                icons : {
                    primary : 'ui-icon-circle-minus'
                }
            }).hide();

            $(this.field).before(remove);

            $('button.uploadButton').show();

            $(this.field).remove();

            this._createUploader();
        },

        _createUploader : function() {
            var self 	= this;
            var target 	= this.target;
            var options = this.options, filters = [];

            if ($.isPlainObject(options.filter)) {
                $.each(options.filter, function(k, v) {
                    filters.push({
                        title : k,
                        extensions : v.replace(/\*\./g, '').replace(/;/, ',')
                    });
                });
            }

            // check size for older format and add kb label
            var size = this.options.size;
            // older version of file size, add kb
            if (!/kb/.test(size)) {
                size = parseFloat(size) + 'kb';
            }

            try {

                this.uploader = new plupload.Uploader({
                    container			: 'upload-body',
                    runtimes 			: options.runtimes,
                    unique_names		: false,
                    browse_button 		: 'upload-add',
                    drop_element		: 'upload-queue-block',
                    max_file_size 		: size,
                    url 				: options.url,
                    flash_swf_url 		: options.swf,
                    silverlight_xap_url : options.xap,
                    filters 			: filters,
                    chunk_size			: options.chunk_size,
                    multipart			: true,
                    required_features	: self.options.required.join(','),
                    rename				: true
                });

                $('#upload-add').addClass('loading');

                // on Uploader init
                this.uploader.bind('Init', function(up) {
                    $('#upload-add').removeClass('loading');
                    self._createDragDrop();

                    if (up.runtime == 'html4') {
                        up.features.canOpenDialog = false;
                    }
                });

                // on Uploader init
                this.uploader.bind('PostInit', function(up) {
                    // remove relative position applied by runtime!
                    $('#upload-body').css('position', '');

                    // set hover / active state classes
                    if (up.runtime == 'html4') {
                        up.settings.browse_button_hover 	= 'ui-state-hover';
                        up.settings.browse_button_active 	= 'ui-state-active';
                    }

                    // on Uploader refresh
                    up.bind('Refresh', function() {
                        $('form, div.plupload', '#upload-body').css($('#upload-add').position());
                    });

                });

                // on Uploader refresh
                this.uploader.bind('Refresh', function(up) {
                });

                // on add file
                this.uploader.bind('QueueChanged', function() {
                    var files = self.uploader.files;

                    if ($('#upload-queue-drag')) {
                        $('#upload-queue-drag').css('display', 'none');
                    }
                    self._createQueue(files);
                });

                // on upload file
                this.uploader.bind('UploadFile', function(up, file) {
                    self._onStart(file);
                });

                this.uploader.bind('StateChanged', function(up) {
                    if (up.state == plupload.STOPPED) {
                        self._onAllComplete();
                    }
                });

                this.uploader.bind('FileUploaded', function(up, file, o) {
                    var status = '';

                    switch(file.status) {
                        case plupload.DONE	:
                            status = 'complete';
                            break;
                        case plupload.FAILED:
                            status = 'error';
                            self.errors++;
                            break;
                    }
                    self._onComplete(file, $.parseJSON(o.response), status);
                });

                this.uploader.bind('Error', function(up, err) {
                    var file = err.file, message, details;

                    if (file) {
                        // create language key from message
                        var msg = err.message.replace(/[^a-z ]/gi, '').replace(/\s+/g, '_').toLowerCase();
                        // get details
                        details = $.Plugin.translate(err.code, err.code);

                        message = '<p><strong>' + $.Plugin.translate(msg, err.message) + '</strong></p>';

                        if (err.details) {
                            message += '<p>' + err.details + '</p>';
                        } else {
                            switch (err.code) {
                                case self.FILE_EXTENSION_ERROR:
                                case self.FILE_INVALID_ERROR:
                                    details = details.replace('%s', file.name);
                                    break;

                                case self.FILE_SIZE_ERROR:
                                    details = details.replace(/%([fsm])/g, function($0, $1) {
                                        switch ($1) {
                                            case 'f':
                                                return file.name;
                                            case 's':
                                                return plupload.formatSize(file.size);
                                            case 'm':
                                                return plupload.formatSize(up.settings.max_file_size);
                                        }
                                    });

                                    break;
                            }
                            message += '<p>' + details + '</p>';
                        }

                        $.Dialog.alert(message);
                    }

                });

                this.uploader.bind('FilesRemoved', function(files) {
                });

                this.uploader.bind("UploadProgress", function(o, file) {
                    self._onProgress(file);
                });

                // Set timeout between chunks for servers using mod_security
                if (this.uploader.settings.chunk_size) {
                    this.uploader.bind('ChunkUploaded', function(file, o) {
                        window.setTimeout( function() {
                        }, 1000);

                    });

                }

                this.uploader.init();
            } catch(e) {
                alert(e);
            }
        },

        _getUploader : function() {
            return this.uploader;
        },

        _onStart : function(file) {
            var el = file.element;
            // Add loader
            $(el).addClass('load');
            // disable insert, rename, name
            $('span.queue-item-rename, span.queue-item-insert', '#upload-queue').addClass('disabled');
            // show progressbar for flash
            if (this.uploader.runtime != 'html4') {
                // show progress bar
                $('span.queue-item-progress', el).show();
            }
        },

        _isError : function(err) {
            if (err) {
                if ($.isArray(err)) {
                    return err.length;
                }

                return true;
            }

            return false;
        },

        _onComplete: function(file, response, status) {
            // remove loader
            $(file.element).removeClass('load');

            if (this._isError(response.error)) {
                status = 'error';
                this.errors++;

                if ($.isArray(response.text)) {
                    response.text = response.text.join(' : ');
                }

                // show error text
                $(file.element).addClass('error').after('<li class="queue-item-error"><span>' + response.text + '</span></li>');
                // hide progress
                $('span.queue-item-progress', file.element).hide();
            } else {
                $(file.element).addClass(status);

                if (file.status == plupload.DONE) {
                    if (response.text && file.name != response.text) {
                        file.name = response.text;
                    }

                    var item = {
                        name 	: plupload.cleanName(file.name),
                        insert 	: $('span.queue-item-insert', file.element).hasClass('selected')
                    };

                    this._trigger('fileComplete', null, item);
                }
            }

            $('span.queue-item-status', file.element).addClass(status);
        },

        _onAllComplete: function() {
            this.uploading = false;

            this._trigger('uploadComplete');
        },

        _setProgress : function(el, percent) {
            $('span.queue-item-progress', el).css('width', percent + '%');
        },

        _onProgress : function(file) {
            $('span.queue-item-size', file.element).html(plupload.formatSize(file.loaded));

            var percent = file.percent;

            if (file.size == file.loaded) {
                percent = 100;
            }

            $('span.queue-item-size', file.element).html(percent + '%');

            this._setProgress(file.element, percent);
        },

        upload: function(args) {
            // Only if there are files to upload
            var files = this.uploader.files;

            if (files.length) {
                this.uploading = true;

				// set resize options
                this.uploader.settings.resize = args.resize;

                this.uploader.settings.multipart_params = args || {};

                this.uploader.start();
            }
            return false;
        },

        refresh : function() {
            if (!this.uploading)
                this.uploader.refresh();
        },

        close : function() {
            if (this.uploading)
                this.uploader.stop();

            this.uploader.destroy();
        },

        getErrors : function() {
            return this.errors;
        },

        isUploading : function() {
            return this.uploading;
        },

        _createDragDrop : function() {
            if (this.uploader.features.dragdrop) {
                $('<li id="upload-queue-drag">' + $.Plugin.translate('upload_drop', 'Drop files here') + '</li>').appendTo('ul#upload-queue').css('margin-top', 50).show('slow');
            }
        },

        /**
         * Rename a file in the uploader files list
         * @param {Object} file File object
         * @param {String} name New name
         */
        _renameFile : function(file, name) {
            this.uploader.getFile(file.id).name = name;

            this._trigger('fileRename', null, file);
        },

        _removeFiles : function() {
            this.uploader.splice();

            $(this.element).html('<li style="display:none;"></li>');

            this._createDragDrop();
        },

        /**
         * Remove a file from the queue
         * @param {String} file File to remove
         */
        _removeFile : function(file) {
            this._trigger('fileDelete', null, file);

            $(file.element).remove();
            this.uploader.removeFile(file);
        },

        _createQueue: function(files) {
            var self = this, doc = document, max_file_size = this.uploader.settings.max_file_size, input, info;

            $(this.element).empty();

            $.each(files, function(x, file) {
                // check for extension in file name
                if (/\.(php|php(3|4|5)|phtml|pl|py|jsp|asp|htm|shtml|sh|cgi)/i.test($.String.filename(file.name))) {
                    self.uploader.trigger('Error', {
                        code 	: self.FILE_INVALID_ERROR,
                        message : 'File invalid error',
                        file 	: file
                    });

                    self.uploader.removeFile(file);
                    return false;
                }

                // create file list element
                file.element = doc.createElement('li');

                var status 	 	= doc.createElement('span');
                var size	   	= doc.createElement('span');
                var name		= doc.createElement('span');
                var rename		= doc.createElement('span');
                var insert		= doc.createElement('span');
                var input   	= doc.createElement('input');

                // status
                $(status).attr({
                    'title' : $.Plugin.translate('delete', 'Delete'),
                    'role' : 'button'
                }).addClass('queue-item-status delete').click( function() {
                    if (self.uploading) {
                        return self._stop(file);
                    }

                    return self._removeFile(file);
                });
                
                var title = $.String.basename(file.name);

                // text
                $(name).attr({
                    'title' : title,
                    'role' : 'presentation'
                }).addClass('queue-item-name').append('<span class="queue-item-progress" role="presentation"></span><span class="queue-item-name-text">' + title + '</span>').appendTo(file.element);

                // size
                $(size).attr({
                    'title' : plupload.formatSize(file.size),
                    'role' : 'presentation'
                }).addClass('queue-item-size').html(plupload.formatSize(file.size));

                // input
                $(input).attr({
                    'type' : 'text',
                    'aria-hidden' : true
                }).appendTo(name).hide();

                // rename
                $(rename).attr({
                    'title' : $.Plugin.translate('rename', 'Rename'),
                    'role' : 'button'
                }).addClass('queue-item-rename').not('.disabled').click( function(e) {
                    $('span.queue-item-name-text', name).click();
                    e.preventDefault();
                });

                // insert
                $(insert).attr({
                    'title' : $.Plugin.translate('upload_insert', 'Insert after upload'),
                    'role' : 'button'
                }).click( function(e) {
                    // set all others disabled
                    $('li.queue-item span.queue-item-insert').each( function() {
                        if (this == e.target) {
                            $(this).toggleClass('disabled').toggleClass('selected');
                        } else {
                            $(this).addClass('disabled').removeClass('selected');
                        }
                    });

                }).addClass('queue-item-insert disabled').toggle(self.options.insert);

                var buttons = [size, rename, insert, status];

                // add optional buttons
                $.each(self.options.buttons, function(name, props) {
                    var btn = document.createElement('span');

                    $(btn).attr({
                        'title' : (props.title || name),
                        'role' : 'button'
                    }).addClass(props['class']).click( function() {
                        var fn = props.click || $.noop;

                        fn.call(self, this);
                    });

                    buttons.push(btn);
                });

                // create actions container
                $('<span class="queue-item-actions"></span>').appendTo(file.element).append(buttons);

                $('#upload-body').click( function(e) {
                    if ($(e.target).is('input, span.queue-item-rename, span.queue-item-name-text', file.element))
                        return;

                    $(input).blur();
                });

                $('span.queue-item-name-text', name).click( function(e) {
                    if (self.uploading) {
                        e.preventDefault();
                        return;
                    }

                    var txt = this;

                    $(this).hide();

                    $(input).val(data.name).show().attr('aria-hidden', false);

                    $(input).bind('blur', function() {
                        var v = $(input).val() + '.' + $.string.getExt($(txt).text());

                        self._renameFile(file, v);

                        // show name element
                        $(txt).show().text(v);

                        // remove input element
                        $(input).hide().attr('aria-hidden', true);
                    });

                    $(rename).bind('click.blur', function() {
                        $(input).blur();

                        $(rename).unbind('click.blur');
                    });

                    $(input).focus();
                });

                $(file.element).addClass('queue-item').addClass('file').addClass($.String.getExt(file.name)).appendTo($(self.element));

                self._trigger('fileSelect', null, file);
            });

        },

        _stop : function(file) {
            this.uploader.stop();

            $(file.element).removeClass('load');
        },

        destroy: function() {
            this.uploader.destroy();
            $.Widget.prototype.destroy.apply( this, arguments );
        }

    });

    $.extend($.ui.uploader, {
        version: "@@version@@"
    });

})(jQuery);