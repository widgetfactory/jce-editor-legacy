/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function() {    
    var each = tinymce.each, extend = tinymce.extend, hasXhrSupport = false, dataAccessSupport = false, canSendBinary = false;
    
    if (window.XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
        hasXhrSupport = !!(xhr.sendAsBinary || xhr.upload);
    }

    // Check for support for various features
    if (hasXhrSupport) {				
        canSendBinary = !!(xhr.sendAsBinary || (window.Uint8Array && window.ArrayBuffer));
        // Set dataAccessSupport only for Gecko since BlobBuilder and XHR doesn't handle binary data correctly				
        dataAccessSupport = !!(File && (File.prototype.getAsDataURL || window.FileReader) && canSendBinary);
    }
    
    var multipart = dataAccessSupport || !!window.FileReader || !!window.FormData;
    
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
        SECURITY_ERROR : -400,

        /**
		 * Initialization error. Will be triggered if no runtime was initialized.
		 *
		 * @property INIT_ERROR
		 * @final
		 */
        INIT_ERROR : -500,

        /**
		 * File size error. If the user selects a file that is too large it will be blocked and an error of this type will be triggered.
		 *
		 * @property FILE_SIZE_ERROR
		 * @final
		 */
        FILE_SIZE_ERROR : -600,

        /**
		 * File extension error. If the user selects a file that isn't valid according to the filters setting.
		 *
		 * @property FILE_EXTENSION_ERROR
		 * @final
		 */
        FILE_EXTENSION_ERROR : -601
    }
    
    tinymce.create('tinymce.plugins.Upload', {
        init : function(ed, url) {
            var self = this;
            self.editor = ed;
            
            ed.onInit.add(function() {
                // Block browser default drag over
                ed.dom.bind(ed.getBody(), 'dragover', function(e) {
                    e.preventDefault();
                });

                // Attach drop handler and grab files
                ed.dom.bind(ed.getBody(), 'drop', function(e) {
                    var dataTransfer = e.dataTransfer;

                    // Add dropped files
                    if (dataTransfer && dataTransfer.files) {
                        each(dataTransfer.files, function(file) {
                            self.upload(file);
                        });
                    }

                    e.preventDefault();
                });
            });
            
            this.state = 0;
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
        
        upload : function(file) {
            var self = this, ed = this.editor, args = {}, url = ed.getParam('site_url') + 'index.php?option=com_jce&view=editor&layout=plugin&plugin=upload';
            
            function w3cBlobSlice(blob, start, end) {
                var blobSlice;
					
                if (File.prototype.slice) {
                    try {
                        blob.slice();	// depricated version will throw WRONG_ARGUMENTS_ERR exception
                        return blob.slice(start, end);
                    } catch (e) {
                        // depricated slice method
                        return blob.slice(start, end - start); 
                    }
                // slice method got prefixed: https://bugzilla.mozilla.org/show_bug.cgi?id=649672	
                } else if (blobSlice = File.prototype.webkitSlice || File.prototype.mozSlice) {
                    return blobSlice.call(blob, start, end);	
                } else {
                    return null; // or throw some exception	
                }
            }	

            function sendBinaryBlob(blob) {
                var chunk = 0, loaded = 0,
                fr = ("FileReader" in window) ? new FileReader : null;
						

                function uploadNextChunk() {
                    var chunkBlob, br, chunks, args, chunkSize, curChunkSize, mimeType;//, url = up.settings.url;													

						
                    function prepareAndSend(bin) {
                        var multipartDeltaSize = 0,
                        boundary = '----pluploadboundary' + ed.dom.uniqueId(), formData, dashdash = '--', crlf = '\r\n', multipartBlob = '';
								
                        xhr = new XMLHttpRequest;
															
                        // Do we have upload progress support
                        if (xhr.upload) {
                            xhr.upload.onprogress = function(e) {
                                file.loaded = Math.min(file.size, loaded + e.loaded - multipartDeltaSize); // Loaded can be larger than file size due to multipart encoding
                            //up.trigger('UploadProgress', file);
                            };
                        }
	
                        xhr.onreadystatechange = function() {
                            var httpStatus, chunkArgs;
																	
                            if (xhr.readyState == 4 && self.state !== state.STOPPED) {
                                // Getting the HTTP status might fail on some Gecko versions
                                try {
                                    httpStatus = xhr.status;
                                } catch (ex) {
                                    httpStatus = 0;
                                }
	
                                // Is error status
                                if (httpStatus >= 400) {
                                /*up.trigger('Error', {
                                        code : plupload.HTTP_ERROR,
                                        message : plupload.translate('HTTP Error.'),
                                        file : file,
                                        status : httpStatus
                                    });*/
                                } else {
                                    // Handle chunk response
                                    if (chunks) {
                                        chunkArgs = {
                                            chunk : chunk,
                                            chunks : chunks,
                                            response : xhr.responseText,
                                            status : httpStatus
                                        };
	
                                        //up.trigger('ChunkUploaded', file, chunkArgs);
                                        loaded += curChunkSize;
	
                                        // Stop upload
                                        if (chunkArgs.cancelled) {
                                            file.status = state.FAILED;
                                            return;
                                        }
	
                                        file.loaded = Math.min(file.size, (chunk + 1) * chunkSize);
                                    } else {
                                        file.loaded = file.size;
                                    }
	
                                    //up.trigger('UploadProgress', file);
										
                                    bin = chunkBlob = formData = multipartBlob = null; // Free memory
										
                                    // Check if file is uploaded
                                    if (!chunks || ++chunk >= chunks) {
                                        file.status = state.DONE;
																						
                                    /*up.trigger('FileUploaded', file, {
                                            response : xhr.responseText,
                                            status : httpStatus
                                        });*/										
                                    } else {										
                                        // Still chunks left
                                        uploadNextChunk();
                                    }
                                }																	
                            }
                        };
							
	
                        // Build multipart request
                        if (multipart) {
								
                            args.name = file.target_name || file.name;
								
                            xhr.open("post", url, true);
								
                            // Set custom headers
                            /*each(up.settings.headers, function(value, name) {
                                xhr.setRequestHeader(name, value);
                            });*/
								
								
                            // if has FormData support like Chrome 6+, Safari 5+, Firefox 4, use it
                            if (typeof(bin) !== 'string' && !!window.FormData) {
                                formData = new FormData();
	
                                // Add multipart params
                                /*each(plupload.extend(args, up.settings.multipart_params), function(value, name) {
                                    formData.append(name, value);
                                });*/
	
                                // Add file and send it
                                formData.append(up.settings.file_data_name, bin);								
                                xhr.send(formData);
	
                                return;
                            }  // if no FormData we can still try to send it directly as last resort (see below)
								
								
                            if (typeof(bin) === 'string') {
                                // Trying to send the whole thing as binary...
		
                                // multipart request
                                xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
		
                                // append multipart parameters
                                /*each(extend(args, up.settings.multipart_params), function(value, name) {
                                    multipartBlob += dashdash + boundary + crlf +
                                    'Content-Disposition: form-data; name="' + name + '"' + crlf + crlf;
		
                                    multipartBlob += unescape(encodeURIComponent(value)) + crlf;
                                });*/
		
                                mimeType = self.mimeTypes[file.name.replace(/^.+\.([^.]+)/, '$1').toLowerCase()] || 'application/octet-stream';
		
                                // Build RFC2388 blob
                                multipartBlob += dashdash + boundary + crlf +
                                'Content-Disposition: form-data; name="' + up.settings.file_data_name + '"; filename="' + unescape(encodeURIComponent(file.name)) + '"' + crlf +
                                'Content-Type: ' + mimeType + crlf + crlf +
                                bin + crlf +
                                dashdash + boundary + dashdash + crlf;
		
                                multipartDeltaSize = multipartBlob.length - bin.length;
                                bin = multipartBlob;
								
							
                                if (xhr.sendAsBinary) { // Gecko
                                    xhr.sendAsBinary(bin);
                                } else if (canSendBinary) { // WebKit with typed arrays support
                                    var ui8a = new Uint8Array(bin.length);
                                    for (var i = 0; i < bin.length; i++) {
                                        ui8a[i] = (bin.charCodeAt(i) & 0xff);
                                    }
                                    xhr.send(ui8a.buffer);
                                }
                                return; // will return from here only if shouldn't send binary
                            } 							
                        }
							
                        // if no multipart, or last resort, send as binary stream
                        //url = plupload.buildUrl(up.settings.url, plupload.extend(args, up.settings.multipart_params));
							
                        xhr.open("post", url, true);
							
                        xhr.setRequestHeader('Content-Type', 'application/octet-stream'); // Binary stream header
								
                        // Set custom headers
                        /*plupload.each(up.settings.headers, function(value, name) {
                            xhr.setRequestHeader(name, value);
                        });*/
												
                        xhr.send(bin); 
                    } // prepareAndSend


                    // File upload finished
                    if (file.status == state.DONE || file.status == state.FAILED || self.state == state.STOPPED) {
                        return;
                    }

                    // Standard arguments
                    args = {
                        name : file.target_name || file.name
                    };

                    // Only add chunking args if needed
                    /*if (settings.chunk_size && file.size > settings.chunk_size && (features.chunks || typeof(blob) == 'string')) { // blob will be of type string if it was loaded in memory 
                        chunkSize = settings.chunk_size;
                        chunks = Math.ceil(file.size / chunkSize);
                        curChunkSize = Math.min(chunkSize, file.size - (chunk * chunkSize));

                        // Blob is string so we need to fake chunking, this is not
                        // ideal since the whole file is loaded into memory
                        if (typeof(blob) == 'string') {
                            chunkBlob = blob.substring(chunk * chunkSize, chunk * chunkSize + curChunkSize);
                        } else {
                            // Slice the chunk
                            chunkBlob = w3cBlobSlice(blob, chunk * chunkSize, chunk * chunkSize + curChunkSize);
                        }

                        // Setup query string arguments
                        args.chunk = chunk;
                        args.chunks = chunks;
                    } else {*/
                    curChunkSize = file.size;
                    chunkBlob = blob;
                    //}

                    prepareAndSend(chunkBlob);
							
                }

                // Start uploading chunks
                uploadNextChunk();
            }
        },
        
        getInfo : function() {
            return {
                longname : 'Drag & Drop Uplaod',
                author : 'Ryan Demmer',
                authorurl : 'http://tinymce.moxiecode.com',
                infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/visualblocks',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('upload', tinymce.plugins.Upload);
})();

