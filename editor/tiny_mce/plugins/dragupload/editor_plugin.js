/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved.
 * @copyright   Copyright 2009, Moxiecode Systems AB
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 * 
 * * Based on plupload - http://www.plupload.com
 */

(function() {    
    var each = tinymce.each, extend = tinymce.extend, JSON = tinymce.util.JSON;
    var isWin = navigator.platform.indexOf('Win') !== -1, isSafari = tinymce.isWebKit && navigator.vendor.indexOf('Apple') !== -1;
    
    var mimes = {};

    function toArray(list) {
        return Array.prototype.slice.call(list || [], 0);
    }
    
    // Parses the default mime types string into a mimes lookup map (from plupload.js)
    (function(mime_data) {
        var items = mime_data.split(/,/), i, y, ext;

        for (i = 0; i < items.length; i += 2) {
            ext = items[i + 1].split(/ /);

            for (y = 0; y < ext.length; y++) {
                mimes[ext[y]] = items[i];
            }
        }
    })(
        "application/msword,doc dot," +
        "application/pdf,pdf," +
        "application/pgp-signature,pgp," +
        "application/postscript,ps ai eps," +
        "application/rtf,rtf," +
        "application/vnd.ms-excel,xls xlb," +
        "application/vnd.ms-powerpoint,ppt pps pot," +
        "application/zip,zip," +
        "application/x-shockwave-flash,swf swfl," +
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx," +
        "application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx," +
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx," +
        "application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx," + 
        "application/vnd.openxmlformats-officedocument.presentationml.template,potx," +
        "application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx," +
        "application/x-javascript,js," +
        "application/json,json," +
        "audio/mpeg,mpga mpega mp2 mp3," +
        "audio/x-wav,wav," +
        "audio/mp4,m4a," +
        "image/bmp,bmp," +
        "image/gif,gif," +
        "image/jpeg,jpeg jpg jpe," +
        "image/photoshop,psd," +
        "image/png,png," +
        "image/svg+xml,svg svgz," +
        "image/tiff,tiff tif," +
        "text/plain,asc txt text diff log," +
        "text/html,htm html xhtml," +
        "text/css,css," +
        "text/csv,csv," +
        "text/rtf,rtf," +
        "video/mpeg,mpeg mpg mpe," +
        "video/quicktime,qt mov," +
        "video/mp4,mp4," +
        "video/x-m4v,m4v," +
        "video/x-flv,flv," +
        "video/x-ms-wmv,wmv," +
        "video/avi,avi," +
        "video/webm,webm," +
        "video/vnd.rn-realvideo,rv," +
        "application/vnd.oasis.opendocument.formula-template,otf," +
        "application/octet-stream,exe"
        );
    
    var state = {
        /**
         * Inital state of the queue and also the state ones it's finished all it's uploads.
         *
         * @property STOPPED
         * @final
         */
        STOPPED : 1,

        /**
         * Upload process is running
         *
         * @property STARTED
         * @final
         */
        STARTED : 2,

        /**
         * File is queued for upload
         *
         * @property QUEUED
         * @final
         */
        QUEUED : 1,

        /**
         * File is being uploaded
         *
         * @property UPLOADING
         * @final
         */
        UPLOADING : 2,

        /**
         * File has failed to be uploaded
         *
         * @property FAILED
         * @final
         */
        FAILED : 4,

        /**
         * File has been uploaded successfully
         *
         * @property DONE
         * @final
         */
        DONE : 5,

        // Error constants used by the Error event

        /**
         * Generic error for example if an exception is thrown inside Silverlight.
         *
         * @property GENERIC_ERROR
         * @final
         */
        GENERIC_ERROR : -100,

        /**
         * HTTP transport error. For example if the server produces a HTTP status other than 200.
         *
         * @property HTTP_ERROR
         * @final
         */
        HTTP_ERROR : -200,

        /**
         * Generic I/O error. For exampe if it wasn't possible to open the file stream on local machine.
         *
         * @property IO_ERROR
         * @final
         */
        IO_ERROR : -300,

        /**
         * Generic I/O error. For exampe if it wasn't possible to open the file stream on local machine.
         *
         * @property SECURITY_ERROR
         * @final
         */
        SECURITY_ERROR : -400
    }

    tinymce.create('tinymce.plugins.DragUpload', {
        
        files   : [],
        
        plugins : [],
        
        init : function(ed, url) {                        
            function cancel() {
                // Block browser default drag over
                ed.dom.bind(ed.getBody(), 'dragover', function(e) {
                    var dataTransfer = e.dataTransfer;
                    
                    // cancel dropped files
                    if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {                        
                        e.preventDefault();
                    }
                }); 
                    
                ed.dom.bind(ed.getBody(), 'drop', function(e) {
                    var dataTransfer = e.dataTransfer;

                    // cancel dropped files
                    if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {                        
                        e.preventDefault();
                    }
                });
            }
            
            // check for support - Opera is disabled because of various bugs, support is basically IE 10+, Firefox 4+, Chrome 7+, Safari 5+
            if (!window.FormData || tinymce.isOpera) {                
                ed.onInit.add(function() {
                    cancel();
                });
                return;
            }
            
            var self = this;
            self.editor = ed;
            self.plugin_url = url;
            
            ed.onPreInit.add(function() {
                if (!ed.settings.compress.css)
                    ed.dom.loadCSS(url + "/css/content.css");
            });
            
            ed.onInit.add(function() {
                each(ed.plugins, function(o, k) {
                    if (ed.getParam(k + '_dragdrop_upload') && tinymce.is(o.getUploadURL, 'function') && tinymce.is(o.insertUploadedFile, 'function')) {                                                
                        self.plugins.push(o);
                    }
                });
                
                // no supported plugins
                if (self.plugins.length == 0) {
                    cancel();
                    return;
                }
                
                // fake drag & drop in Windows Safari
                if (isSafari && isWin) {
                    ed.dom.bind(ed.getBody(), 'dragenter', function(e) {                        
                        var dataTransfer = e.dataTransfer;

                        // cancel dropped files
                        if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {
                        
                            var dropInputElm;

                            // Get or create drop zone
                            dropInputElm = ed.dom.get(ed.getBody().id + "_dragdropupload");

                            if (!dropInputElm) {
                                dropInputElm = ed.dom.add(ed.getBody(), "input", {
                                    'type' : 'file',
                                    'id' : ed.getBody().id + "_dragdropupload",
                                    'multiple' : 'multiple',
                                    'style' : {
                                        position : 'absolute',
                                        display : 'block',
                                        top : 0,
                                        left : 0,
                                        width : '100%',
                                        height : '100%',
                                        opacity : '0'
                                    }
                                });
                            }

                            ed.dom.bind(dropInputElm, 'change', function(e) {                                                            
                                // Add the selected files from file input
                                each(dropInputElm.files, function(file) {                                    
                                    if (tinymce.inArray(self.files, file) == -1) {
                                        self.addFile(file);
                                    }
                                });

                                // Remove input element
                                ed.dom.unbind(dropInputElm, 'change');
                                ed.dom.remove(dropInputElm);

                                // upload...
                                each(self.files, function(file) {                        
                                    self.upload(file);
                                });
                            });
                        }
                    });
                    
                    ed.dom.bind(ed.getBody(), 'drop', function(e) {
                        var dataTransfer = e.dataTransfer;

                        // cancel dropped files
                        if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {
                            e.preventDefault();
                        }
                    });

                    return;
                }
                
                // Block browser default drag over
                ed.dom.bind(ed.getBody(), 'dragover', function(e) {
                    e.preventDefault();
                });

                // Attach drop handler and grab files
                ed.dom.bind(ed.getBody(), 'drop', function(e) {
                    var dataTransfer = e.dataTransfer;

                    // Add dropped files
                    if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {                        
                        /*each(dataTransfer.items, function(item) {
                            if (item.webkitGetAsEntry) {
                                var entry = item.webkitGetAsEntry();
                                
                                if (entry.isDirectory) {                                    
                                    var reader = entry.createReader(), entries = [];
                                    
                                    var readEntries = function() {
                                        reader.readEntries (function(results) {
                                            if (!results.length) {
                                                each(entries, function(entry) {
                                                    if (entry.isFile) {

                                                    }
                                                });
                                            } else {
                                                entries = entries.concat(toArray(results));
                                                readEntries();
                                            }
                                        }, function(){});
                                    };

                                    readEntries(); // Start reading dirs.
                                }
                            }
                        });*/
                        
                        each(dataTransfer.files, function(file) {                                                        
                            self.addFile(file);
                        });
                        
                        e.preventDefault();
                    }
                    
                    // upload...
                    each(self.files, function(file) {                        
                        self.upload(file);
                    });
                });

            /*ed.onPaste.add(function(ed, e) {
                    if(e.clipboardData) {
                        var items = e.clipboardData.items;
                        
                        if (items) {
                            each(items, function(item) {
                                var file = item.getAsFile();
                                    
                                if (file && file.type) {
                                    self.addFile(file);
                                }
                                    
                                // upload...
                                each(self.files, function(file) {                        
                                    self.upload(file);
                                });

                                e.preventDefault();
                            });
                        }
                    }
                });*/

            });

            // Setup plugin events
            self.FilesAdded         = new tinymce.util.Dispatcher(this);
            self.UploadProgress     = new tinymce.util.Dispatcher(this);
            self.FileUploaded       = new tinymce.util.Dispatcher(this);
            self.UploadError        = new tinymce.util.Dispatcher(this);
            
            this.settings = {
                multipart   : true,
                multi_selection : true,
                file_data_name : 'file',
                filters : []
            };
            
            self.FileUploaded.add(function(file, o) {
                var n = file.marker, s;
                
                function showError(error) {
                    ed.windowManager.alert(error || ed.getLang('upload.response_error', 'Invalid Upload Response'));
                    ed.dom.remove(n);
                                
                    return false;
                }
                
                if (n) {                                                                                         
                    if (o && o.response) {
                        var r = JSON.parse(o.response);
                        
                        if (!r) {
                            return showError();
                        }
                            
                        if (r.error) {
                            
                            var txt = r.text || r.error;

                            ed.windowManager.alert(txt);
                            ed.dom.remove(n);
                                
                            return false;
                        }
                        
                        if (file.status == state.DONE) {
                            r.type = file.type;
                            
                            if (file.uploader) {
                                o = file.uploader;
                                
                                if (s = o.insertUploadedFile(r)) {                                    
                                    if (ed.dom.replace(s, n)) {
                                        ed.nodeChanged();
                                            
                                        return true;
                                    }
                                }
                            }
                            
                            //ed.dom.remove(n);
                            
                            /*each(self.plugins, function(o, k) {                                                                
                                try {
                                    if (!s) {
                                        if (s = o.insertUploadedFile(r)) {
                                            if (ed.dom.replace(s, n)) {
                                                ed.nodeChanged();
                                            
                                                return true;
                                            }
                                        
                                            ed.dom.remove(n);
                                        }
                                    } 
 
                                } catch(e) {
                                //return showError(e);
                                }
                            });*/
                            
                            // remove from list
                            self.files.splice(tinymce.inArray(self.files, file), 1);
                        }
                    } else {
                        return showError();
                    }
                    
                    ed.dom.remove(n);
                }
            });
            
            self.UploadError.add(function(o) {
                ed.windowManager.alert(o.code + ' : ' + o.message);
                
                if (o.file && o.file.marker) {
                    ed.dom.remove(o.file.marker);
                }
                
            });
            
            self.UploadProgress.add(function(file) {
                file.marker.innerHTML = '<span class="upload-progress">' + Math.round(file.loaded / file.size * 100) + '</span>';
            });
        },
        
        /**
         * Builds a full url out of a base URL and an object with items to append as query string items.
         *
         * @param {String} url Base URL to append query string items to.
         * @param {Object} items Name/value object to serialize as a querystring.
         * @return {String} String with url + serialized query string items.
         */
        buildUrl : function(url, items) {
            var query = '';

            each(items, function(value, name) {
                query += (query ? '&' : '') + encodeURIComponent(name) + '=' + encodeURIComponent(value);
            });

            if (query) {
                url += (url.indexOf('?') > 0 ? '&' : '?') + query;
            }

            return url;
        },
        
        addFile : function(file) {
            var ed = this.editor, self = this, fileNames = {}, url;
            
            // get first url for the file type
            each(self.plugins, function(o, k) {                                
                if (!file.upload_url) {
                    if (url = o.getUploadURL(file)) {
                        file.upload_url = url;
                        file.uploader   = o;
                    }
                }
            });
                
            if (file.upload_url) {                                           
                // dispatch event
                self.FilesAdded.dispatch(file);
                
                var w = 300, h = 300;
                
                ed.execCommand('mceInsertContent', false, '<span id="__mce_tmp" data-mce-type="marker" class="mceItemUpload"></span>', {
                    skip_undo : 1
                });
                
                if (/image\/(gif|png|jpeg|jpeg)/.test(file.type)) {
                    w = h = Math.round(Math.sqrt(file.size));
                }

                var n = ed.dom.get('__mce_tmp');

                ed.dom.setAttrib(n, 'id', '');
                ed.dom.setStyles(n, {
                    'width'     : w, 
                    'height'    : h
                });
                ed.undoManager.add();
                
                file.marker = n;
                
                // add files to queue
                self.files.push(file);
            }
        },
        
        upload : function(file) {
            var self = this, ed = this.editor;
            
            var args = {
                'action'        : 'upload', 
                'format'        : 'raw',
                'method'        : 'dragdrop',
                'component_id'  : ed.settings.component_id
            };
            
            args[ed.settings.token] = '1';
            
            var url = file.upload_url;

            function sendFile(bin) {
                var xhr = new XMLHttpRequest, formData = new FormData();
	
                // progress
                if (xhr.upload) {
                    xhr.upload.onprogress = function(e) {
                        if (e.lengthComputable) {
                            file.loaded = Math.min(file.size, e.loaded);
                            self.UploadProgress.dispatch(file);
                        }
                    };
                }
                
                xhr.onreadystatechange = function() {
                    var httpStatus;
																	
                    if (xhr.readyState == 4 && self.state !== state.STOPPED) {
                        // Getting the HTTP status might fail on some Gecko versions
                        try {
                            httpStatus = xhr.status;
                        } catch (ex) {
                            httpStatus = 0;
                        }
	
                        // Is error status
                        if (httpStatus >= 400) {
                            self.UploadError.dispatch({
                                code : state.HTTP_ERROR,
                                message : ed.getLang('upload.http_error', 'HTTP Error'),
                                file : file,
                                status : httpStatus
                            });
                        } else {                                    
                            file.loaded = file.size;
	
                            self.UploadProgress.dispatch(file);
										
                            bin = formData = null; // Free memory
										
                            file.status = state.DONE;
																						
                            self.FileUploaded.dispatch(file, {
                                response    : xhr.responseText,
                                status      : httpStatus
                            });
                        }																	
                    }
                };
                
                extend(args, {
                    'name' : file.target_name || file.name
                });
								
                xhr.open("post", url, true);
								
                // Set custom headers
                each(self.settings.headers, function(value, name) {
                    xhr.setRequestHeader(name, value);
                });
                
                // Add multipart params
                each(extend(args, self.settings.multipart_params), function(value, name) {
                    formData.append(name, value);
                });

                // Add file and send it
                formData.append(self.settings.file_data_name, bin);								
                xhr.send(formData);

                return;
							
                        
            } // sendFile


            // File upload finished
            if (file.status == state.DONE || file.status == state.FAILED || self.state == state.STOPPED) {
                return;
            }

            // Standard arguments
            extend(args, {
                name : file.target_name || file.name
            });
                    
            // send the file object
            sendFile(file);
        },
        
        getInfo : function() {
            return {
                longname    : 'Drag & Drop Upload',
                author      : 'Ryan Demmer',
                authorurl   : 'http://www.joomlacontenteditor.net',
                infourl     : 'http://www.joomlacontenteditor.net',
                version     : '@@version@@'
            };  
        }
    });

    // Register plugin
    tinymce.PluginManager.add('dragupload', tinymce.plugins.DragUpload);
})();

