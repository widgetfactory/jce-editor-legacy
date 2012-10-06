/**
 * plupload.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

// JSLint defined globals
/*global window:false, escape:false */

/*!@@version@@*/

(function() {
	var count = 0, runtimes = [], i18n = {}, mimes = {},
		xmlEncodeChars = {'<' : 'lt', '>' : 'gt', '&' : 'amp', '"' : 'quot', '\'' : '#39'},
		xmlEncodeRegExp = /[<>&\"\']/g, undef, delay = window.setTimeout,
		// A place to store references to event handlers
		eventhash = {},
		uid;

	// IE W3C like event funcs
	function preventDefault() {
		this.returnValue = false;
	}

	function stopPropagation() {
		this.cancelBubble = true;
	}

	// Parses the default mime types string into a mimes lookup map
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
                // add ogg
                "audio/ogg,ogg oga," +
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
                // Add ogg
                "video/ogg,ogg ogv," +
		"video/vnd.rn-realvideo,rv," +
		"application/vnd.oasis.opendocument.formula-template,otf," +
		"application/octet-stream,exe"
	);

	/**
	 * Plupload class with some global constants and functions.
	 *
	 * @example
	 * // Encode entities
	 * console.log(plupload.xmlEncode("My string &lt;&gt;"));
	 *
	 * // Generate unique id
	 * console.log(plupload.guid());
	 *
	 * @static
	 * @class plupload
	 */
	var plupload = {
		/**
		 * Plupload version will be replaced on build.
		 */
		VERSION : '@@version@@',

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
		FILE_EXTENSION_ERROR : -601,
		
		/**
		 * Runtime will try to detect if image is proper one. Otherwise will throw this error.
		 *
		 * @property IMAGE_FORMAT_ERROR
		 * @final
		 */
		IMAGE_FORMAT_ERROR : -700,
		
		/**
		 * While working on the image runtime will try to detect if the operation may potentially run out of memeory and will throw this error.
		 *
		 * @property IMAGE_MEMORY_ERROR
		 * @final
		 */
		IMAGE_MEMORY_ERROR : -701,
		
		/**
		 * Each runtime has an upper limit on a dimension of the image it can handle. If bigger, will throw this error.
		 *
		 * @property IMAGE_DIMENSIONS_ERROR
		 * @final
		 */
		IMAGE_DIMENSIONS_ERROR : -702,
		

		/**
		 * Mime type lookup table.
		 *
		 * @property mimeTypes
		 * @type Object
		 * @final
		 */
		mimeTypes : mimes,
		
		/**
		 * In some cases sniffing is the only way around :(
		 */
		ua: (function() {
			var nav = navigator, userAgent = nav.userAgent, vendor = nav.vendor, webkit, opera, safari;
			
			webkit = /WebKit/.test(userAgent);
			safari = webkit && vendor.indexOf('Apple') !== -1;
			opera = window.opera && window.opera.buildNumber;
			
			return {
				windows: navigator.platform.indexOf('Win') !== -1,
				ie: !webkit && !opera && (/MSIE/gi).test(userAgent) && (/Explorer/gi).test(nav.appName),
				webkit: webkit,
				gecko: !webkit && /Gecko/.test(userAgent),
				safari: safari,
				opera: !!opera
			};
		}()),
		
		/**
		 * Gets the true type of the built-in object (better version of typeof).
		 * @credits Angus Croll (http://javascriptweblog.wordpress.com/)
		 *
		 * @param {Object} o Object to check.
		 * @return {String} Object [[Class]]
		 */
		typeOf: function(o) {
			return ({}).toString.call(o).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
		},

		/**
		 * Extends the specified object with another object.
		 *
		 * @method extend
		 * @param {Object} target Object to extend.
		 * @param {Object..} obj Multiple objects to extend with.
		 * @return {Object} Same as target, the extended object.
		 */
		extend : function(target) {
			plupload.each(arguments, function(arg, i) {
				if (i > 0) {
					plupload.each(arg, function(value, key) {
						target[key] = value;
					});
				}
			});

			return target;
		},

		/**
		 * Cleans the specified name from national characters (diacritics). The result will be a name with only a-z, 0-9 and _.
		 *
		 * @method cleanName
		 * @param {String} s String to clean up.
		 * @return {String} Cleaned string.
		 */
		cleanName : function(name) {
			var i, lookup;

			// Replace diacritics
			lookup = [
				/[\300-\306]/g, 'A', /[\340-\346]/g, 'a', 
				/\307/g, 'C', /\347/g, 'c',
				/[\310-\313]/g, 'E', /[\350-\353]/g, 'e',
				/[\314-\317]/g, 'I', /[\354-\357]/g, 'i',
				/\321/g, 'N', /\361/g, 'n',
				/[\322-\330]/g, 'O', /[\362-\370]/g, 'o',
				/[\331-\334]/g, 'U', /[\371-\374]/g, 'u'
			];

			for (i = 0; i < lookup.length; i += 2) {
				name = name.replace(lookup[i], lookup[i + 1]);
			}

			// Replace whitespace
			name = name.replace(/\s+/g, '_');

			// Remove anything else
			name = name.replace(/[^a-z0-9_\-\.]+/gi, '');

			return name;
		},

		/**
		 * Adds a specific upload runtime like for example flash or gears.
		 *
		 * @method addRuntime
		 * @param {String} name Runtime name for example flash.
		 * @param {Object} obj Object containing init/destroy method.
		 */
		addRuntime : function(name, runtime) {			
			runtime.name = name;
			runtimes[name] = runtime;
			runtimes.push(runtime);

			return runtime;
		},

		/**
		 * Generates an unique ID. This is 99.99% unique since it takes the current time and 5 random numbers.
		 * The only way a user would be able to get the same ID is if the two persons at the same exact milisecond manages
		 * to get 5 the same random numbers between 0-65535 it also uses a counter so each call will be guaranteed to be page unique.
		 * It's more probable for the earth to be hit with an ansteriod. You can also if you want to be 100% sure set the plupload.guidPrefix property
		 * to an user unique key.
		 *
		 * @method guid
		 * @return {String} Virtually unique id.
		 */
		guid : function() {
			var guid = new Date().getTime().toString(32), i;

			for (i = 0; i < 5; i++) {
				guid += Math.floor(Math.random() * 65535).toString(32);
			}

			return (plupload.guidPrefix || 'p') + guid + (count++).toString(32);
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

			plupload.each(items, function(value, name) {
				query += (query ? '&' : '') + encodeURIComponent(name) + '=' + encodeURIComponent(value);
			});

			if (query) {
				url += (url.indexOf('?') > 0 ? '&' : '?') + query;
			}

			return url;
		},

		/**
		 * Executes the callback function for each item in array/object. If you return false in the
		 * callback it will break the loop.
		 *
		 * @param {Object} obj Object to iterate.
		 * @param {function} callback Callback function to execute for each item.
		 */
		each : function(obj, callback) {
			var length, key, i;

			if (obj) {
				length = obj.length;

				if (length === undef) {
					// Loop object items
					for (key in obj) {
						if (obj.hasOwnProperty(key)) {
							if (callback(obj[key], key) === false) {
								return;
							}
						}
					}
				} else {
					// Loop array items
					for (i = 0; i < length; i++) {
						if (callback(obj[i], i) === false) {
							return;
						}
					}
				}
			}
		},

		/**
		 * Formats the specified number as a size string for example 1024 becomes 1 KB.
		 *
		 * @method formatSize
		 * @param {Number} size Size to format as string.
		 * @return {String} Formatted size string.
		 */
		formatSize : function(size) {
			if (size === undef || /\D/.test(size)) {
				return plupload.translate('N/A');
			}
			
			// GB
			if (size > 1073741824) {
				return Math.round(size / 1073741824, 1) + " GB";
			}

			// MB
			if (size > 1048576) {
				return Math.round(size / 1048576, 1) + " MB";
			}

			// KB
			if (size > 1024) {
				return Math.round(size / 1024, 1) + " KB";
			}

			return size + " b";
		},

		/**
		 * Returns the absolute x, y position of an Element. The position will be returned in a object with x, y fields.
		 *
		 * @method getPos
		 * @param {Element} node HTML element or element id to get x, y position from.
		 * @param {Element} root Optional root element to stop calculations at.
		 * @return {object} Absolute position of the specified element object with x, y fields.
		 */
		 getPos : function(node, root) {
			var x = 0, y = 0, parent, doc = document, nodeRect, rootRect;

			node = node;
			root = root || doc.body;

			// Returns the x, y cordinate for an element on IE 6 and IE 7
			function getIEPos(node) {
				var bodyElm, rect, x = 0, y = 0;

				if (node) {
					rect = node.getBoundingClientRect();
					bodyElm = doc.compatMode === "CSS1Compat" ? doc.documentElement : doc.body;
					x = rect.left + bodyElm.scrollLeft;
					y = rect.top + bodyElm.scrollTop;
				}

				return {
					x : x,
					y : y
				};
			}

			// Use getBoundingClientRect on IE 6 and IE 7 but not on IE 8 in standards mode
			if (node && node.getBoundingClientRect && ((navigator.userAgent.indexOf('MSIE') > 0) && (doc.documentMode < 8))) {
				nodeRect = getIEPos(node);
				rootRect = getIEPos(root);

				return {
					x : nodeRect.x - rootRect.x,
					y : nodeRect.y - rootRect.y
				};
			}

			parent = node;
			while (parent && parent != root && parent.nodeType) {
				x += parent.offsetLeft || 0;
				y += parent.offsetTop || 0;
				parent = parent.offsetParent;
			}

			parent = node.parentNode;
			while (parent && parent != root && parent.nodeType) {
				x -= parent.scrollLeft || 0;
				y -= parent.scrollTop || 0;
				parent = parent.parentNode;
			}

			return {
				x : x,
				y : y
			};
		},

		/**
		 * Returns the size of the specified node in pixels.
		 *
		 * @param {Node} node Node to get the size of.
		 * @return {Object} Object with a w and h property.
		 */
		getSize : function(node) {
			return {
				w : node.offsetWidth || node.clientWidth,
				h : node.offsetHeight || node.clientHeight
			};
		},

		/**
		 * Parses the specified size string into a byte value. For example 10kb becomes 10240.
		 *
		 * @method parseSize
		 * @param {String/Number} size String to parse or number to just pass through.
		 * @return {Number} Size in bytes.
		 */
		parseSize : function(size) {
			var mul;

			if (typeof(size) == 'string') {
				size = /^([0-9]+)([mgk]?)$/.exec(size.toLowerCase().replace(/[^0-9mkg]/g, ''));
				mul = size[2];
				size = +size[1];

				if (mul == 'g') {
					size *= 1073741824;
				}

				if (mul == 'm') {
					size *= 1048576;
				}

				if (mul == 'k') {
					size *= 1024;
				}
			}

			return size;
		},

		/**
		 * Encodes the specified string.
		 *
		 * @method xmlEncode
		 * @param {String} s String to encode.
		 * @return {String} Encoded string.
		 */
		xmlEncode : function(str) {
			return str ? ('' + str).replace(xmlEncodeRegExp, function(chr) {
				return xmlEncodeChars[chr] ? '&' + xmlEncodeChars[chr] + ';' : chr;
			}) : str;
		},

		/**
		 * Forces anything into an array.
		 *
		 * @method toArray
		 * @param {Object} obj Object with length field.
		 * @return {Array} Array object containing all items.
		 */
		toArray : function(obj) {
			var i, arr = [];

			for (i = 0; i < obj.length; i++) {
				arr[i] = obj[i];
			}

			return arr;
		},
		
		/**
		 * Find an element in array and return it's index if present, otherwise return -1.
		 *
		 * @method inArray
		 * @param {mixed} needle Element to find
		 * @param {Array} array
		 * @return {Int} Index of the element, or -1 if not found
		 */
		inArray : function(needle, array) {			
			if (array) {
				if (Array.prototype.indexOf) {
					return Array.prototype.indexOf.call(array, needle);
				}
			
				for (var i = 0, length = array.length; i < length; i++) {
					if (array[i] === needle) {
						return i;
					}
				}
			}
			return -1;
		},

		/**
		 * Extends the language pack object with new items.
		 *
		 * @param {Object} pack Language pack items to add.
		 * @return {Object} Extended language pack object.
		 */
		addI18n : function(pack) {
			return plupload.extend(i18n, pack);
		},

		/**
		 * Translates the specified string by checking for the english string in the language pack lookup.
		 *
		 * @param {String} str String to look for.
		 * @return {String} Translated string or the input string if it wasn't found.
		 */
		translate : function(str) {
			return i18n[str] || str;
		},
		
		/**
		 * Checks if object is empty.
		 *
		 * @param {Object} obj Object to check.
		 * @return {Boolean}
		 */
		isEmptyObj : function(obj) {
			if (obj === undef) return true;
			
			for (var prop in obj) {
				return false;	
			}
			return true;
		},
		
		/**
		 * Checks if specified DOM element has specified class.
		 *
		 * @param {Object} obj DOM element like object to add handler to.
		 * @param {String} name Class name
		 */
		hasClass : function(obj, name) {
			var regExp;
		
			if (obj.className == '') {
				return false;
			}

			regExp = new RegExp("(^|\\s+)"+name+"(\\s+|$)");

			return regExp.test(obj.className);
		},
		
		/**
		 * Adds specified className to specified DOM element.
		 *
		 * @param {Object} obj DOM element like object to add handler to.
		 * @param {String} name Class name
		 */
		addClass : function(obj, name) {
			if (!plupload.hasClass(obj, name)) {
				obj.className = obj.className == '' ? name : obj.className.replace(/\s+$/, '')+' '+name;
			}
		},
		
		/**
		 * Removes specified className from specified DOM element.
		 *
		 * @param {Object} obj DOM element like object to add handler to.
		 * @param {String} name Class name
		 */
		removeClass : function(obj, name) {
			var regExp = new RegExp("(^|\\s+)"+name+"(\\s+|$)");
			
			obj.className = obj.className.replace(regExp, function($0, $1, $2) {
				return $1 === ' ' && $2 === ' ' ? ' ' : '';
			});
		},
    
		/**
		 * Returns a given computed style of a DOM element.
		 *
		 * @param {Object} obj DOM element like object.
		 * @param {String} name Style you want to get from the DOM element
		 */
		getStyle : function(obj, name) {
			if (obj.currentStyle) {
				return obj.currentStyle[name];
			} else if (window.getComputedStyle) {
				return window.getComputedStyle(obj, null)[name];
			}
		},

		/**
		 * Adds an event handler to the specified object and store reference to the handler
		 * in objects internal Plupload registry (@see removeEvent).
		 *
		 * @param {Object} obj DOM element like object to add handler to.
		 * @param {String} name Name to add event listener to.
		 * @param {Function} callback Function to call when event occurs.
		 * @param {String} (optional) key that might be used to add specifity to the event record.
		 */
		addEvent : function(obj, name, callback) {
			var func, events, types, key;
			
			// if passed in, event will be locked with this key - one would need to provide it to removeEvent
			key = arguments[3];
						
			name = name.toLowerCase();
						
			// Initialize unique identifier if needed
			if (uid === undef) {
				uid = 'Plupload_' + plupload.guid();
			}

			// Add event listener
			if (obj.addEventListener) {
				func = callback;
				
				obj.addEventListener(name, func, false);
			} else if (obj.attachEvent) {
				
				func = function() {
					var evt = window.event;

					if (!evt.target) {
						evt.target = evt.srcElement;
					}

					evt.preventDefault = preventDefault;
					evt.stopPropagation = stopPropagation;

					callback(evt);
				};
				obj.attachEvent('on' + name, func);
			} 
			
			// Log event handler to objects internal Plupload registry
			if (obj[uid] === undef) {
				obj[uid] = plupload.guid();
			}
			
			if (!eventhash.hasOwnProperty(obj[uid])) {
				eventhash[obj[uid]] = {};
			}
			
			events = eventhash[obj[uid]];
			
			if (!events.hasOwnProperty(name)) {
				events[name] = [];
			}
					
			events[name].push({
				func: func,
				orig: callback, // store original callback for IE
				key: key
			});
		},
		
		
		/**
		 * Remove event handler from the specified object. If third argument (callback)
		 * is not specified remove all events with the specified name.
		 *
		 * @param {Object} obj DOM element to remove event listener(s) from.
		 * @param {String} name Name of event listener to remove.
		 * @param {Function|String} (optional) might be a callback or unique key to match.
		 */
		removeEvent: function(obj, name) {
			var type, callback, key;
			
			// match the handler either by callback or by key	
			if (typeof(arguments[2]) == "function") {
				callback = arguments[2];
			} else {
				key = arguments[2];
			}
						
			name = name.toLowerCase();
			
			if (obj[uid] && eventhash[obj[uid]] && eventhash[obj[uid]][name]) {
				type = eventhash[obj[uid]][name];
			} else {
				return;
			}
			
				
			for (var i=type.length-1; i>=0; i--) {
				// undefined or not, key should match			
				if (type[i].key === key || type[i].orig === callback) {
										
					if (obj.removeEventListener) {
						obj.removeEventListener(name, type[i].func, false);		
					} else if (obj.detachEvent) {
						obj.detachEvent('on'+name, type[i].func);
					}
					
					type[i].orig = null;
					type[i].func = null;
					
					type.splice(i, 1);
					
					// If callback was passed we are done here, otherwise proceed
					if (callback !== undef) {
						break;
					}
				}			
			}	
			
			// If event array got empty, remove it
			if (!type.length) {
				delete eventhash[obj[uid]][name];
			}
			
			// If Plupload registry has become empty, remove it
			if (plupload.isEmptyObj(eventhash[obj[uid]])) {
				delete eventhash[obj[uid]];
				
				// IE doesn't let you remove DOM object property with - delete
				try {
					delete obj[uid];
				} catch(e) {
					obj[uid] = undef;
				}
			}
		},
		
		
		/**
		 * Remove all kind of events from the specified object
		 *
		 * @param {Object} obj DOM element to remove event listeners from.
		 * @param {String} (optional) unique key to match, when removing events.
		 */
		removeAllEvents: function(obj) {
			var key = arguments[1];
			
			if (obj[uid] === undef || !obj[uid]) {
				return;
			}
			
			plupload.each(eventhash[obj[uid]], function(events, name) {
				plupload.removeEvent(obj, name, key);
			});		
		}
	};
	

	/**
	 * Uploader class, an instance of this class will be created for each upload field.
	 *
	 * @example
	 * var uploader = new plupload.Uploader({
	 *     runtimes : 'gears,html5,flash',
	 *     browse_button : 'button_id'
	 * });
	 *
	 * uploader.bind('Init', function(up) {
	 *     alert('Supports drag/drop: ' + (!!up.features.dragdrop));
	 * });
	 *
	 * uploader.bind('FilesAdded', function(up, files) {
	 *     alert('Selected files: ' + files.length);
	 * });
	 *
	 * uploader.bind('QueueChanged', function(up) {
	 *     alert('Queued files: ' + uploader.files.length);
	 * });
	 *
	 * uploader.init();
	 *
	 * @class plupload.Uploader
	 */

	/**
	 * Constructs a new uploader instance.
	 *
	 * @constructor
	 * @method Uploader
	 * @param {Object} settings Initialization settings, to be used by the uploader instance and runtimes.
	 */
	plupload.Uploader = function(settings) {
		var events = {}, total, files = [], startTime, disabled = false;

		// Inital total state
		total = new plupload.QueueProgress();

		// Default settings
		settings = plupload.extend({
			chunk_size : 0,
			multipart : true,
			multi_selection : true,
			file_data_name : 'file',
			filters : []
		}, settings);

		// Private methods
		function uploadNext() {
			var file, count = 0, i;

			if (this.state == plupload.STARTED) {
				// Find first QUEUED file
				for (i = 0; i < files.length; i++) {
					if (!file && files[i].status == plupload.QUEUED) {
						file = files[i];
						file.status = plupload.UPLOADING;
						if (this.trigger("BeforeUpload", file)) {
							this.trigger("UploadFile", file);
						}
					} else {
						count++;
					}
				}

				// All files are DONE or FAILED
				if (count == files.length) {
					this.stop();
					this.trigger("UploadComplete", files);
				}
			}
		}

		function calc() {
			var i, file;

			// Reset stats
			total.reset();

			// Check status, size, loaded etc on all files
			for (i = 0; i < files.length; i++) {
				file = files[i];

				if (file.size !== undef) {
					total.size += file.size;
					total.loaded += file.loaded;
				} else {
					total.size = undef;
				}

				if (file.status == plupload.DONE) {
					total.uploaded++;
				} else if (file.status == plupload.FAILED) {
					total.failed++;
				} else {
					total.queued++;
				}
			}

			// If we couldn't calculate a total file size then use the number of files to calc percent
			if (total.size === undef) {
				total.percent = files.length > 0 ? Math.ceil(total.uploaded / files.length * 100) : 0;
			} else {
				total.bytesPerSec = Math.ceil(total.loaded / ((+new Date() - startTime || 1) / 1000.0));
				total.percent = total.size > 0 ? Math.ceil(total.loaded / total.size * 100) : 0;
			}
		}

		// Add public methods
		plupload.extend(this, {
			/**
			 * Current state of the total uploading progress. This one can either be plupload.STARTED or plupload.STOPPED.
			 * These states are controlled by the stop/start methods. The default value is STOPPED.
			 *
			 * @property state
			 * @type Number
			 */
			state : plupload.STOPPED,
			
			/**
			 * Current runtime name.
			 *
			 * @property runtime
			 * @type String
			 */
			runtime: '',

			/**
			 * Map of features that are available for the uploader runtime. Features will be filled
			 * before the init event is called, these features can then be used to alter the UI for the end user.
			 * Some of the current features that might be in this map is: dragdrop, chunks, jpgresize, pngresize.
			 *
			 * @property features
			 * @type Object
			 */
			features : {},

			/**
			 * Current upload queue, an array of File instances.
			 *
			 * @property files
			 * @type Array
			 * @see plupload.File
			 */
			files : files,

			/**
			 * Object with name/value settings.
			 *
			 * @property settings
			 * @type Object
			 */
			settings : settings,

			/**
			 * Total progess information. How many files has been uploaded, total percent etc.
			 *
			 * @property total
			 * @type plupload.QueueProgress
			 */
			total : total,

			/**
			 * Unique id for the Uploader instance.
			 *
			 * @property id
			 * @type String
			 */
			id : plupload.guid(),

			/**
			 * Initializes the Uploader instance and adds internal event listeners.
			 *
			 * @method init
			 */
			init : function() {
				var self = this, i, runtimeList, a, runTimeIndex = 0, items;

				if (typeof(settings.preinit) == "function") {
					settings.preinit(self);
				} else {
					plupload.each(settings.preinit, function(func, name) {
						self.bind(name, func);
					});
				}

				settings.page_url = settings.page_url || document.location.pathname.replace(/\/[^\/]+$/g, '/');

				// If url is relative force it absolute to the current page
				if (!/^(\w+:\/\/|\/)/.test(settings.url)) {
					settings.url = settings.page_url + settings.url;
				}

				// Convert settings
				settings.chunk_size = plupload.parseSize(settings.chunk_size);
				settings.max_file_size = plupload.parseSize(settings.max_file_size);

				// Add files to queue
				self.bind('FilesAdded', function(up, selected_files) {
					var i, file, count = 0, extensionsRegExp, filters = settings.filters;

					// Convert extensions to regexp
					if (filters && filters.length) {
						extensionsRegExp = [];
						
						plupload.each(filters, function(filter) {
							plupload.each(filter.extensions.split(/,/), function(ext) {
								if (/^\s*\*\s*$/.test(ext)) {
									extensionsRegExp.push('\\.*');
								} else {
									extensionsRegExp.push('\\.' + ext.replace(new RegExp('[' + ('/^$.*+?|()[]{}\\'.replace(/./g, '\\$&')) + ']', 'g'), '\\$&'));
								}
							});
						});
						
						extensionsRegExp = new RegExp(extensionsRegExp.join('|') + '$', 'i');
					}

					for (i = 0; i < selected_files.length; i++) {
						file = selected_files[i];
						file.loaded = 0;
						file.percent = 0;
						file.status = plupload.QUEUED;

						// Invalid file extension
						if (extensionsRegExp && !extensionsRegExp.test(file.name)) {
							up.trigger('Error', {
								code : plupload.FILE_EXTENSION_ERROR,
								message : plupload.translate('File extension error.'),
								file : file
							});

							continue;
						}

						// Invalid file size
						if (file.size !== undef && file.size > settings.max_file_size) {
							up.trigger('Error', {
								code : plupload.FILE_SIZE_ERROR,
								message : plupload.translate('File size error.'),
								file : file
							});

							continue;
						}

						// Add valid file to list
						files.push(file);
						count++;
					}

					// Only trigger QueueChanged event if any files where added
					if (count) {
						delay(function() {
							self.trigger("QueueChanged");
							self.refresh();
						}, 1);
					} else {
						return false; // Stop the FilesAdded event from immediate propagation
					}
				});

				// Generate unique target filenames
				if (settings.unique_names) {
					self.bind("UploadFile", function(up, file) {
						var matches = file.name.match(/\.([^.]+)$/), ext = "tmp";

						if (matches) {
							ext = matches[1];
						}

						file.target_name = file.id + '.' + ext;
					});
				}

				self.bind('UploadProgress', function(up, file) {
					file.percent = file.size > 0 ? Math.ceil(file.loaded / file.size * 100) : 100;
					calc();
				});

				self.bind('StateChanged', function(up) {
					if (up.state == plupload.STARTED) {
						// Get start time to calculate bps
						startTime = (+new Date());
						
					} else if (up.state == plupload.STOPPED) {						
						// Reset currently uploading files
						for (i = up.files.length - 1; i >= 0; i--) {
							if (up.files[i].status == plupload.UPLOADING) {
								up.files[i].status = plupload.QUEUED;
								calc();
							}
						}
					}
				});

				self.bind('QueueChanged', calc);

				self.bind("Error", function(up, err) {
					// Set failed status if an error occured on a file
					if (err.file) {
						err.file.status = plupload.FAILED;
						calc();

						// Upload next file but detach it from the error event
						// since other custom listeners might want to stop the queue
						if (up.state == plupload.STARTED) {
							delay(function() {
								uploadNext.call(self);
							}, 1);
						}
					}
				});

				self.bind("FileUploaded", function(up, file) {
					file.status = plupload.DONE;
					file.loaded = file.size;
					up.trigger('UploadProgress', file);

					// Upload next file but detach it from the error event
					// since other custom listeners might want to stop the queue
					delay(function() {
						uploadNext.call(self);
					}, 1);
				});

				// Setup runtimeList
				if (settings.runtimes) {
					runtimeList = [];
					items = settings.runtimes.split(/\s?,\s?/);

					for (i = 0; i < items.length; i++) {
						if (runtimes[items[i]]) {
							runtimeList.push(runtimes[items[i]]);
						}
					}
				} else {
					runtimeList = runtimes;
				}

				// Call init on each runtime in sequence
				function callNextInit() {
					var runtime = runtimeList[runTimeIndex++], features, requiredFeatures, i;

					if (runtime) {
						features = runtime.getFeatures();

						// Check if runtime supports required features
						requiredFeatures = self.settings.required_features;
						if (requiredFeatures) {
							requiredFeatures = requiredFeatures.split(',');

							for (i = 0; i < requiredFeatures.length; i++) {
								// Specified feature doesn't exist
								if (!features[requiredFeatures[i]]) {
									callNextInit();
									return;
								}
							}
						}

						// Try initializing the runtime
						runtime.init(self, function(res) {
							if (res && res.success) {
								// Successful initialization
								self.features = features;
								self.runtime = runtime.name;
								self.trigger('Init', {runtime : runtime.name});
								self.trigger('PostInit');
								self.refresh();
							} else {
								callNextInit();
							}
						});
					} else {
						// Trigger an init error if we run out of runtimes
						self.trigger('Error', {
							code : plupload.INIT_ERROR,
							message : plupload.translate('Init error.')
						});
					}
				}

				callNextInit();

				if (typeof(settings.init) == "function") {
					settings.init(self);
				} else {
					plupload.each(settings.init, function(func, name) {
						self.bind(name, func);
					});
				}
			},

			/**
			 * Refreshes the upload instance by dispatching out a refresh event to all runtimes.
			 * This would for example reposition flash/silverlight shims on the page.
			 *
			 * @method refresh
			 */
			refresh : function() {
				this.trigger("Refresh");
			},

			/**
			 * Starts uploading the queued files.
			 *
			 * @method start
			 */
			start : function() {
				if (files.length && this.state != plupload.STARTED) {
					this.state = plupload.STARTED;
					this.trigger("StateChanged");	
					
					uploadNext.call(this);				
				}
			},

			/**
			 * Stops the upload of the queued files.
			 *
			 * @method stop
			 */
			stop : function() {
				if (this.state != plupload.STOPPED) {
					this.state = plupload.STOPPED;	
					this.trigger("CancelUpload");				
					this.trigger("StateChanged");
				}
			},
			
			/** 
			 * Disables/enables browse button on request.
			 *
			 * @method disableBrowse
			 * @param {Boolean} disable Whether to disable or enable (default: true)
			 */
			disableBrowse : function() {
				disabled = arguments[0] !== undef ? arguments[0] : true;
				this.trigger("DisableBrowse", disabled);
			},

			/**
			 * Returns the specified file object by id.
			 *
			 * @method getFile
			 * @param {String} id File id to look for.
			 * @return {plupload.File} File object or undefined if it wasn't found;
			 */
			getFile : function(id) {
				var i;

				for (i = files.length - 1; i >= 0; i--) {
					if (files[i].id === id) {
						return files[i];
					}
				}
			},

			/**
			 * Removes a specific file.
			 *
			 * @method removeFile
			 * @param {plupload.File} file File to remove from queue.
			 */
			removeFile : function(file) {
				var i;

				for (i = files.length - 1; i >= 0; i--) {
					if (files[i].id === file.id) {
						return this.splice(i, 1)[0];
					}
				}
			},

			/**
			 * Removes part of the queue and returns the files removed. This will also trigger the FilesRemoved and QueueChanged events.
			 *
			 * @method splice
			 * @param {Number} start (Optional) Start index to remove from.
			 * @param {Number} length (Optional) Lengh of items to remove.
			 * @return {Array} Array of files that was removed.
			 */
			splice : function(start, length) {
				var removed;

				// Splice and trigger events
				removed = files.splice(start === undef ? 0 : start, length === undef ? files.length : length);

				this.trigger("FilesRemoved", removed);
				this.trigger("QueueChanged");

				return removed;
			},

			/**
			 * Dispatches the specified event name and it's arguments to all listeners.
			 *
			 *
			 * @method trigger
			 * @param {String} name Event name to fire.
			 * @param {Object..} Multiple arguments to pass along to the listener functions.
			 */
			trigger : function(name) {
				var list = events[name.toLowerCase()], i, args;

				// console.log(name, arguments);

				if (list) {
					// Replace name with sender in args
					args = Array.prototype.slice.call(arguments);
					args[0] = this;

					// Dispatch event to all listeners
					for (i = 0; i < list.length; i++) {
						// Fire event, break chain if false is returned
						if (list[i].func.apply(list[i].scope, args) === false) {
							return false;
						}
					}
				}

				return true;
			},
			
			/**
			 * Check whether uploader has any listeners to the specified event.
			 *
			 * @method hasEventListener
			 * @param {String} name Event name to check for.
			 */
			hasEventListener : function(name) {
				return !!events[name.toLowerCase()];
			},

			/**
			 * Adds an event listener by name.
			 *
			 * @method bind
			 * @param {String} name Event name to listen for.
			 * @param {function} func Function to call ones the event gets fired.
			 * @param {Object} scope Optional scope to execute the specified function in.
			 */
			bind : function(name, func, scope) {
				var list;

				name = name.toLowerCase();
				list = events[name] || [];
				list.push({func : func, scope : scope || this});
				events[name] = list;
			},

			/**
			 * Removes the specified event listener.
			 *
			 * @method unbind
			 * @param {String} name Name of event to remove.
			 * @param {function} func Function to remove from listener.
			 */
			unbind : function(name) {
				name = name.toLowerCase();

				var list = events[name], i, func = arguments[1];

				if (list) {
					if (func !== undef) {
						for (i = list.length - 1; i >= 0; i--) {
							if (list[i].func === func) {
								list.splice(i, 1);
									break;
							}
						}
					} else {
						list = [];
					}

					// delete event list if it has become empty
					if (!list.length) {
						delete events[name];
					}
				}
			},

			/**
			 * Removes all event listeners.
			 *
			 * @method unbindAll
			 */
			unbindAll : function() {
				var self = this;
				
				plupload.each(events, function(list, name) {
					self.unbind(name);
				});
			},
			
			/**
			 * Destroys Plupload instance and cleans after itself.
			 *
			 * @method destroy
			 */
			destroy : function() {	
				this.stop();						
				this.trigger('Destroy');
				
				// Clean-up after uploader itself
				this.unbindAll();
			}

			/**
			 * Fires when the current RunTime has been initialized.
			 *
			 * @event Init
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 */

			/**
			 * Fires after the init event incase you need to perform actions there.
			 *
			 * @event PostInit
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 */

			/**
			 * Fires when the silverlight/flash or other shim needs to move.
			 *
			 * @event Refresh
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 */
	
			/**
			 * Fires when the overall state is being changed for the upload queue.
			 *
			 * @event StateChanged
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 */

			/**
			 * Fires when a file is to be uploaded by the runtime.
			 *
			 * @event UploadFile
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 * @param {plupload.File} file File to be uploaded.
			 */

			/**
			 * Fires when just before a file is uploaded. This event enables you to override settings
			 * on the uploader instance before the file is uploaded.
			 *
			 * @event BeforeUpload
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 * @param {plupload.File} file File to be uploaded.
			 */

			/**
			 * Fires when the file queue is changed. In other words when files are added/removed to the files array of the uploader instance.
			 *
			 * @event QueueChanged
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 */
	
			/**
			 * Fires while a file is being uploaded. Use this event to update the current file upload progress.
			 *
			 * @event UploadProgress
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 * @param {plupload.File} file File that is currently being uploaded.
			 */

			/**
			 * Fires while a file was removed from queue.
			 *
			 * @event FilesRemoved
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 * @param {Array} files Array of files that got removed.
			 */

			/**
			 * Fires while when the user selects files to upload.
			 *
			 * @event FilesAdded
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 * @param {Array} files Array of file objects that was added to queue/selected by the user.
			 */

			/**
			 * Fires when a file is successfully uploaded.
			 *
			 * @event FileUploaded
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 * @param {plupload.File} file File that was uploaded.
			 * @param {Object} response Object with response properties.
			 */

			/**
			 * Fires when file chunk is uploaded.
			 *
			 * @event ChunkUploaded
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 * @param {plupload.File} file File that the chunk was uploaded for.
			 * @param {Object} response Object with response properties.
			 */

			/**
			 * Fires when all files in a queue are uploaded.
			 *
			 * @event UploadComplete
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 * @param {Array} files Array of file objects that was added to queue/selected by the user.
			 */

			/**
			 * Fires when a error occurs.
			 *
			 * @event Error
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 * @param {Object} error Contains code, message and sometimes file and other details.
			 */
			 
			 /**
			 * Fires when destroy method is called.
			 *
			 * @event Destroy
			 * @param {plupload.Uploader} uploader Uploader instance sending the event.
			 */
		});
	};

	/**
	 * File instance.
	 *
	 * @class plupload.File
	 * @param {String} name Name of the file.
	 * @param {Number} size File size.
	 */

	/**
	 * Constructs a new file instance.
	 *
	 * @constructor
	 * @method File
	 * @param {String} id Unique file id.
	 * @param {String} name File name.
	 * @param {Number} size File size in bytes.
	 */
	plupload.File = function(id, name, size) {
		var self = this; // Setup alias for self to reduce code size when it's compressed

		/**
		 * File id this is a globally unique id for the specific file.
		 *
		 * @property id
		 * @type String
		 */
		self.id = id;

		/**
		 * File name for example "myfile.gif".
		 *
		 * @property name
		 * @type String
		 */
		self.name = name;

		/**
		 * File size in bytes.
		 *
		 * @property size
		 * @type Number
		 */
		self.size = size;

		/**
		 * Number of bytes uploaded of the files total size.
		 *
		 * @property loaded
		 * @type Number
		 */
		self.loaded = 0;

		/**
		 * Number of percentage uploaded of the file.
		 *
		 * @property percent
		 * @type Number
		 */
		self.percent = 0;

		/**
		 * Status constant matching the plupload states QUEUED, UPLOADING, FAILED, DONE.
		 *
		 * @property status
		 * @type Number
		 * @see plupload
		 */
		self.status = 0;
	};

	/**
	 * Runtime class gets implemented by each upload runtime.
	 *
	 * @class plupload.Runtime
	 * @static
	 */
	plupload.Runtime = function() {
		/**
		 * Returns a list of supported features for the runtime.
		 *
		 * @return {Object} Name/value object with supported features.
		 */
		this.getFeatures = function() {
		};

		/**
		 * Initializes the upload runtime. This method should add necessary items to the DOM and register events needed for operation. 
		 *
		 * @method init
		 * @param {plupload.Uploader} uploader Uploader instance that needs to be initialized.
		 * @param {function} callback Callback function to execute when the runtime initializes or fails to initialize. If it succeeds an object with a parameter name success will be set to true.
		 */
		this.init = function(uploader, callback) {
		};
	};

	/**
	 * Runtime class gets implemented by each upload runtime.
	 *
	 * @class plupload.QueueProgress
	 */

	/**
	 * Constructs a queue progress.
	 *
	 * @constructor
	 * @method QueueProgress
	 */
	 plupload.QueueProgress = function() {
		var self = this; // Setup alias for self to reduce code size when it's compressed

		/**
		 * Total queue file size.
		 *
		 * @property size
		 * @type Number
		 */
		self.size = 0;

		/**
		 * Total bytes uploaded.
		 *
		 * @property loaded
		 * @type Number
		 */
		self.loaded = 0;

		/**
		 * Number of files uploaded.
		 *
		 * @property uploaded
		 * @type Number
		 */
		self.uploaded = 0;

		/**
		 * Number of files failed to upload.
		 *
		 * @property failed
		 * @type Number
		 */
		self.failed = 0;

		/**
		 * Number of files yet to be uploaded.
		 *
		 * @property queued
		 * @type Number
		 */
		self.queued = 0;

		/**
		 * Total percent of the uploaded bytes.
		 *
		 * @property percent
		 * @type Number
		 */
		self.percent = 0;

		/**
		 * Bytes uploaded per second.
		 *
		 * @property bytesPerSec
		 * @type Number
		 */
		self.bytesPerSec = 0;

		/**
		 * Resets the progress to it's initial values.
		 *
		 * @method reset
		 */
		self.reset = function() {
			self.size = self.loaded = self.uploaded = self.failed = self.queued = self.percent = self.bytesPerSec = 0;
		};
	};

	// Create runtimes namespace
	plupload.runtimes = {};

	// Expose plupload namespace
	window.plupload = plupload;
})();
/**
 * plupload.silverlight.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

// JSLint defined globals
/*global window:false, document:false, plupload:false, ActiveXObject:false */

(function(window, document, plupload, undef) {
	var uploadInstances = {}, initialized = {};

	function jsonSerialize(obj) {
		var value, type = typeof obj, isArray, i, key;

		// Treat undefined as null
		if (obj === undef || obj === null) {
			return 'null';
		}

		// Encode strings
		if (type === 'string') {
			value = '\bb\tt\nn\ff\rr\""\'\'\\\\';

			return '"' + obj.replace(/([\u0080-\uFFFF\x00-\x1f\"])/g, function(a, b) {
				var idx = value.indexOf(b);

				if (idx + 1) {
					return '\\' + value.charAt(idx + 1);
				}

				a = b.charCodeAt().toString(16);

				return '\\u' + '0000'.substring(a.length) + a;
			}) + '"';
		}

		// Loop objects/arrays
		if (type == 'object') {
			isArray = obj.length !== undef;
			value = '';

			if (isArray) {
				for (i = 0; i < obj.length; i++) {
					if (value) {
						value += ',';
					}

					value += jsonSerialize(obj[i]);
				}

				value = '[' + value + ']';
			} else {
				for (key in obj) {
					if (obj.hasOwnProperty(key)) {
						if (value) {
							value += ',';
						}

						value += jsonSerialize(key) + ':' + jsonSerialize(obj[key]);
					}
				}

				value = '{' + value + '}';
			}

			return value;
		}

		// Convert all other types to string
		return '' + obj;
	}

	function isInstalled(version) {
		var isVersionSupported = false, container = null, control = null, actualVer,
			actualVerArray, reqVerArray, requiredVersionPart, actualVersionPart, index = 0;

		try {
			try {
				control = new ActiveXObject('AgControl.AgControl');

				if (control.IsVersionSupported(version)) {
					isVersionSupported = true;
				}

				control = null;
			} catch (e) {
				var plugin = navigator.plugins["Silverlight Plug-In"];

				if (plugin) {
					actualVer = plugin.description;

					if (actualVer === "1.0.30226.2") {
						actualVer = "2.0.30226.2";
					}

					actualVerArray = actualVer.split(".");

					while (actualVerArray.length > 3) {
						actualVerArray.pop();
					}

					while ( actualVerArray.length < 4) {
						actualVerArray.push(0);
					}

					reqVerArray = version.split(".");

					while (reqVerArray.length > 4) {
						reqVerArray.pop();
					}

					do {
						requiredVersionPart = parseInt(reqVerArray[index], 10);
						actualVersionPart = parseInt(actualVerArray[index], 10);
						index++;
					} while (index < reqVerArray.length && requiredVersionPart === actualVersionPart);

					if (requiredVersionPart <= actualVersionPart && !isNaN(requiredVersionPart)) {
						isVersionSupported = true;
					}
				}
			}
		} catch (e2) {
			isVersionSupported = false;
		}

		return isVersionSupported;
	}

	plupload.silverlight = {
		trigger : function(id, name) {
			var uploader = uploadInstances[id], i, args;
			
			if (uploader) {
				args = plupload.toArray(arguments).slice(1);
				args[0] = 'Silverlight:' + name;

				// Detach the call so that error handling in the browser is presented correctly
				setTimeout(function() {
					uploader.trigger.apply(uploader, args);
				}, 0);
			}
		}
	};

	/**
	 * Silverlight implementation. This runtime supports these features: jpgresize, pngresize, chunks.
	 *
	 * @static
	 * @class plupload.runtimes.Silverlight
	 * @extends plupload.Runtime
	 */
	plupload.runtimes.Silverlight = plupload.addRuntime("silverlight", {
		/**
		 * Returns a list of supported features for the runtime.
		 *
		 * @return {Object} Name/value object with supported features.
		 */
		getFeatures : function() {
			return {
				jpgresize: true,
				pngresize: true,
				chunks: true,
				progress: true,
				multipart: true,
				multi_selection: true
			};
		},

		/**
		 * Initializes the upload runtime. This runtime supports these features: jpgresize, pngresize, chunks.
		 *
		 * @method init
		 * @param {plupload.Uploader} uploader Uploader instance that needs to be initialized.
		 * @param {function} callback Callback to execute when the runtime initializes or fails to initialize. If it succeeds an object with a parameter name success will be set to true.
		 */
		init : function(uploader, callback) {
			var silverlightContainer, filter = '', filters = uploader.settings.filters, i, container = document.body;

			// Check if Silverlight is installed, Silverlight windowless parameter doesn't work correctly on Opera so we disable it for now
			if (!isInstalled('2.0.31005.0') || (window.opera && window.opera.buildNumber)) {
				callback({success : false});
				return;
			}
			
			initialized[uploader.id] = false;
			uploadInstances[uploader.id] = uploader;

			// Create silverlight container and insert it at an absolute position within the browse button
			silverlightContainer = document.createElement('div');
			silverlightContainer.id = uploader.id + '_silverlight_container';

			plupload.extend(silverlightContainer.style, {
				position : 'absolute',
				top : '0px',
				background : uploader.settings.shim_bgcolor || 'transparent',
				zIndex : 99999,
				width : '100px',
				height : '100px',
				overflow : 'hidden',
				opacity : uploader.settings.shim_bgcolor || document.documentMode > 8 ? '' : 0.01 // Force transparent if bgcolor is undefined
			});

			silverlightContainer.className = 'plupload silverlight';

			if (uploader.settings.container) {
				container = document.getElementById(uploader.settings.container);
				if (plupload.getStyle(container, 'position') === 'static') {
					container.style.position = 'relative';
				}
			}

			container.appendChild(silverlightContainer);

			for (i = 0; i < filters.length; i++) {
				filter += (filter != '' ? '|' : '') + filters[i].title + " | *." + filters[i].extensions.replace(/,/g, ';*.');
			}

			// Insert the Silverlight object inide the Silverlight container
			silverlightContainer.innerHTML = '<object id="' + uploader.id + '_silverlight" data="data:application/x-silverlight," type="application/x-silverlight-2" style="outline:none;" width="1024" height="1024">' +
				'<param name="source" value="' + uploader.settings.silverlight_xap_url + '"/>' +
				'<param name="background" value="Transparent"/>' +
				'<param name="windowless" value="true"/>' +
				'<param name="enablehtmlaccess" value="true"/>' +
				'<param name="initParams" value="id=' + uploader.id + ',filter=' + filter + ',multiselect=' + uploader.settings.multi_selection + '"/>' +
				'</object>';

			function getSilverlightObj() {
				return document.getElementById(uploader.id + '_silverlight').content.Upload;
			}

			uploader.bind("Silverlight:Init", function() {
				var selectedFiles, lookup = {};
				
				// Prevent eventual reinitialization of the instance
				if (initialized[uploader.id]) {
					return;
				}
					
				initialized[uploader.id] = true;

				uploader.bind("Silverlight:StartSelectFiles", function(up) {
					selectedFiles = [];
				});

				uploader.bind("Silverlight:SelectFile", function(up, sl_id, name, size) {
					var id;

					// Store away silverlight ids
					id = plupload.guid();
					lookup[id] = sl_id;
					lookup[sl_id] = id;

					// Expose id, name and size
					selectedFiles.push(new plupload.File(id, name, size));
				});

				uploader.bind("Silverlight:SelectSuccessful", function() {
					// Trigger FilesAdded event if we added any
					if (selectedFiles.length) {
						uploader.trigger("FilesAdded", selectedFiles);
					}
				});

				uploader.bind("Silverlight:UploadChunkError", function(up, file_id, chunk, chunks, message) {
					uploader.trigger("Error", {
						code : plupload.IO_ERROR,
						message : 'IO Error.',
						details : message,
						file : up.getFile(lookup[file_id])
					});
				});

				uploader.bind("Silverlight:UploadFileProgress", function(up, sl_id, loaded, total) {
					var file = up.getFile(lookup[sl_id]);

					if (file.status != plupload.FAILED) {
						file.size = total;
						file.loaded = loaded;

						up.trigger('UploadProgress', file);
					}
				});

				uploader.bind("Refresh", function(up) {
					var browseButton, browsePos, browseSize;

					browseButton = document.getElementById(up.settings.browse_button);
					if (browseButton) {
						browsePos = plupload.getPos(browseButton, document.getElementById(up.settings.container));
						browseSize = plupload.getSize(browseButton);
	
						plupload.extend(document.getElementById(up.id + '_silverlight_container').style, {
							top : browsePos.y + 'px',
							left : browsePos.x + 'px',
							width : browseSize.w + 'px',
							height : browseSize.h + 'px'
						});
					}
				});

				uploader.bind("Silverlight:UploadChunkSuccessful", function(up, sl_id, chunk, chunks, text) {
					var chunkArgs, file = up.getFile(lookup[sl_id]);

					chunkArgs = {
						chunk : chunk,
						chunks : chunks,
						response : text
					};

					up.trigger('ChunkUploaded', file, chunkArgs);

					// Stop upload if file is maked as failed
					if (file.status != plupload.FAILED && up.state !== plupload.STOPPED) {
						getSilverlightObj().UploadNextChunk();
					}

					// Last chunk then dispatch FileUploaded event
					if (chunk == chunks - 1) {
						file.status = plupload.DONE;

						up.trigger('FileUploaded', file, {
							response : text
						});
					}
				});

				uploader.bind("Silverlight:UploadSuccessful", function(up, sl_id, response) {
					var file = up.getFile(lookup[sl_id]);

					file.status = plupload.DONE;

					up.trigger('FileUploaded', file, {
						response : response
					});
				});

				uploader.bind("FilesRemoved", function(up, files) {
					var i;

					for (i = 0; i < files.length; i++) {
						getSilverlightObj().RemoveFile(lookup[files[i].id]);
					}
				});

				uploader.bind("UploadFile", function(up, file) {
					var settings = up.settings, resize = settings.resize || {};

					getSilverlightObj().UploadFile(
						lookup[file.id],
						up.settings.url,
						jsonSerialize({
							name : file.target_name || file.name,
							mime : plupload.mimeTypes[file.name.replace(/^.+\.([^.]+)/, '$1').toLowerCase()] || 'application/octet-stream',
							chunk_size : settings.chunk_size,
							image_width : resize.width,
							image_height : resize.height,
							image_quality : resize.quality || 90,
							multipart : !!settings.multipart,
							multipart_params : settings.multipart_params || {},
							file_data_name : settings.file_data_name,
							headers : settings.headers
						})
					);
				});
				
				uploader.bind("CancelUpload", function() {
					getSilverlightObj().CancelUpload();
				});

				uploader.bind('Silverlight:MouseEnter', function(up) {
					var browseButton, hoverClass;
						
					browseButton = document.getElementById(uploader.settings.browse_button);
					hoverClass = up.settings.browse_button_hover;
					
					if (browseButton && hoverClass) {
						plupload.addClass(browseButton, hoverClass);
					}
				});
				
				uploader.bind('Silverlight:MouseLeave', function(up) {
					var browseButton, hoverClass;
						
					browseButton = document.getElementById(uploader.settings.browse_button);
					hoverClass = up.settings.browse_button_hover;
					
					if (browseButton && hoverClass) {
						plupload.removeClass(browseButton, hoverClass);
					}
				});
				
				uploader.bind('Silverlight:MouseLeftButtonDown', function(up) {
					var browseButton, activeClass;
						
					browseButton = document.getElementById(uploader.settings.browse_button);
					activeClass = up.settings.browse_button_active;
					
					if (browseButton && activeClass) {
						plupload.addClass(browseButton, activeClass);
						
						// Make sure that browse_button has active state removed from it
						plupload.addEvent(document.body, 'mouseup', function() {
							plupload.removeClass(browseButton, activeClass);	
						});
					}
				});
				
				uploader.bind('Sliverlight:StartSelectFiles', function(up) {
					var browseButton, activeClass;
						
					browseButton = document.getElementById(uploader.settings.browse_button);
					activeClass = up.settings.browse_button_active;
					
					if (browseButton && activeClass) {
						plupload.removeClass(browseButton, activeClass);
					}
				});
				
				uploader.bind("DisableBrowse", function(up, disabled) {
					getSilverlightObj().DisableBrowse(disabled);
				});
		
				uploader.bind("Destroy", function(up) {
					var silverlightContainer;
					
					plupload.removeAllEvents(document.body, up.id);
					
					delete initialized[up.id];
					delete uploadInstances[up.id];
					
					silverlightContainer = document.getElementById(up.id + '_silverlight_container');
					if (silverlightContainer) {
						container.removeChild(silverlightContainer);
					}
				});

				callback({success : true});
			});
		}
	});
})(window, document, plupload);
/**
 * plupload.flash.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

// JSLint defined globals
/*global window:false, document:false, plupload:false, ActiveXObject:false, escape:false */

(function(window, document, plupload, undef) {
	var uploadInstances = {}, initialized = {};

	function getFlashVersion() {
		var version;

		try {
			version = navigator.plugins['Shockwave Flash'];
			version = version.description;
		} catch (e1) {
			try {
				version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
			} catch (e2) {
				version = '0.0';
			}
		}

		version = version.match(/\d+/g);

		return parseFloat(version[0] + '.' + version[1]);
	}

	plupload.flash = {
		/**
		 * Will be executed by the Flash runtime when it sends out events.
		 *
		 * @param {String} id If for the upload instance.
		 * @param {String} name Event name to trigger.
		 * @param {Object} obj Parameters to be passed with event.
		 */
		trigger : function(id, name, obj) {
								
			// Detach the call so that error handling in the browser is presented correctly
			setTimeout(function() {
				var uploader = uploadInstances[id], i, args;
				
				if (uploader) {				
					uploader.trigger('Flash:' + name, obj);
				}
			}, 0);
		}
	};

	/**
	 * FlashRuntime implementation. This runtime supports these features: jpgresize, pngresize, chunks.
	 *
	 * @static
	 * @class plupload.runtimes.Flash
	 * @extends plupload.Runtime
	 */
	plupload.runtimes.Flash = plupload.addRuntime("flash", {
		
		/**
		 * Returns a list of supported features for the runtime.
		 *
		 * @return {Object} Name/value object with supported features.
		 */
		getFeatures : function() {
			return {
				jpgresize: true,
				pngresize: true,
				maxWidth: 8091,
				maxHeight: 8091,
				chunks: true,
				progress: true,
				multipart: true,
				multi_selection: true
			};
		},

		/**
		 * Initializes the upload runtime. This method should add necessary items to the DOM and register events needed for operation. 
		 *
		 * @method init
		 * @param {plupload.Uploader} uploader Uploader instance that needs to be initialized.
		 * @param {function} callback Callback to execute when the runtime initializes or fails to initialize. If it succeeds an object with a parameter name success will be set to true.
		 */
		init : function(uploader, callback) {
			var browseButton, flashContainer, waitCount = 0, container = document.body;

			if (getFlashVersion() < 10) {
				callback({success : false});
				return;
			}

			initialized[uploader.id] = false;
			uploadInstances[uploader.id] = uploader;

			// Find browse button and set to to be relative
			browseButton = document.getElementById(uploader.settings.browse_button);

			// Create flash container and insert it at an absolute position within the browse button
			flashContainer = document.createElement('div');
			flashContainer.id = uploader.id + '_flash_container';

			plupload.extend(flashContainer.style, {
				position : 'absolute',
				top : '0px',
				background : uploader.settings.shim_bgcolor || 'transparent',
				zIndex : 99999,
				width : '100%',
				height : '100%'
			});

			flashContainer.className = 'plupload flash';

			if (uploader.settings.container) {
				container = document.getElementById(uploader.settings.container);
				if (plupload.getStyle(container, 'position') === 'static') {
					container.style.position = 'relative';
				}
			}

			container.appendChild(flashContainer);
			
			// insert flash object
			(function() {
				var html, el;
				
				html = '<object id="' + uploader.id + '_flash" type="application/x-shockwave-flash" data="' + uploader.settings.flash_swf_url + '" ';
				
				if (plupload.ua.ie) {
					html += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ';
				}

				html += 'width="100%" height="100%" style="outline:0">'  +
					'<param name="movie" value="' + uploader.settings.flash_swf_url + '" />' +
					'<param name="flashvars" value="id=' + escape(uploader.id) + '" />' +
					'<param name="wmode" value="transparent" />' +
					'<param name="allowscriptaccess" value="always" />' +
				'</object>';
					
				if (plupload.ua.ie) {
					el = document.createElement('div');
					flashContainer.appendChild(el);
					el.outerHTML = html;
					el = null; // just in case
				} else {
					flashContainer.innerHTML = html;
				}
			}());

			function getFlashObj() {
				return document.getElementById(uploader.id + '_flash');
			}

			function waitLoad() {
								
				// Wait for 5 sec
				if (waitCount++ > 5000) {
					callback({success : false});
					return;
				}

				if (initialized[uploader.id] === false) { // might also be undefined, if uploader was destroyed by that moment
					setTimeout(waitLoad, 1);
				}
			}

			waitLoad();

			// Fix IE memory leaks
			browseButton = flashContainer = null;
			
			// destroy should always be available, after Flash:Init or before (#516)
			uploader.bind("Destroy", function(up) {
				var flashContainer;
				
				plupload.removeAllEvents(document.body, up.id);
				
				delete initialized[up.id];
				delete uploadInstances[up.id];
				
				flashContainer = document.getElementById(up.id + '_flash_container');
				if (flashContainer) {
					container.removeChild(flashContainer);
				}
			});

			// Wait for Flash to send init event
			uploader.bind("Flash:Init", function() {				
				var lookup = {}, i;

				try {
					getFlashObj().setFileFilters(uploader.settings.filters, uploader.settings.multi_selection);
				} catch (ex) {
					callback({success : false});
					return;
				}

				// Prevent eventual reinitialization of the instance
				if (initialized[uploader.id]) {
					return;
				}
				initialized[uploader.id] = true;

				uploader.bind("UploadFile", function(up, file) {
					var settings = up.settings, resize = uploader.settings.resize || {};

					getFlashObj().uploadFile(lookup[file.id], settings.url, {
						name : file.target_name || file.name,
						mime : plupload.mimeTypes[file.name.replace(/^.+\.([^.]+)/, '$1').toLowerCase()] || 'application/octet-stream',
						chunk_size : settings.chunk_size,
						width : resize.width,
						height : resize.height,
						quality : resize.quality,
						multipart : settings.multipart,
						multipart_params : settings.multipart_params || {},
						file_data_name : settings.file_data_name,
						format : /\.(jpg|jpeg)$/i.test(file.name) ? 'jpg' : 'png',
						headers : settings.headers,
						urlstream_upload : settings.urlstream_upload
					});
				});
				
				uploader.bind("CancelUpload", function() {
					getFlashObj().cancelUpload();
				});


				uploader.bind("Flash:UploadProcess", function(up, flash_file) {
					var file = up.getFile(lookup[flash_file.id]);

					if (file.status != plupload.FAILED) {
						file.loaded = flash_file.loaded;
						file.size = flash_file.size;

						up.trigger('UploadProgress', file);
					}
				});

				uploader.bind("Flash:UploadChunkComplete", function(up, info) {
					var chunkArgs, file = up.getFile(lookup[info.id]);

					chunkArgs = {
						chunk : info.chunk,
						chunks : info.chunks,
						response : info.text
					};

					up.trigger('ChunkUploaded', file, chunkArgs);

					// Stop upload if file is maked as failed
					if (file.status !== plupload.FAILED && up.state !== plupload.STOPPED) {
						getFlashObj().uploadNextChunk();
					}

					// Last chunk then dispatch FileUploaded event
					if (info.chunk == info.chunks - 1) {
						file.status = plupload.DONE;

						up.trigger('FileUploaded', file, {
							response : info.text
						});
					}
				});

				uploader.bind("Flash:SelectFiles", function(up, selected_files) {
					var file, i, files = [], id;

					// Add the selected files to the file queue
					for (i = 0; i < selected_files.length; i++) {
						file = selected_files[i];

						// Store away flash ref internally
						id = plupload.guid();
						lookup[id] = file.id;
						lookup[file.id] = id;

						files.push(new plupload.File(id, file.name, file.size));
					}

					// Trigger FilesAdded event if we added any
					if (files.length) {
						uploader.trigger("FilesAdded", files);
					}
				});

				uploader.bind("Flash:SecurityError", function(up, err) {
					uploader.trigger('Error', {
						code : plupload.SECURITY_ERROR,
						message : plupload.translate('Security error.'),
						details : err.message,
						file : uploader.getFile(lookup[err.id])
					});
				});

				uploader.bind("Flash:GenericError", function(up, err) {
					uploader.trigger('Error', {
						code : plupload.GENERIC_ERROR,
						message : plupload.translate('Generic error.'),
						details : err.message,
						file : uploader.getFile(lookup[err.id])
					});
				});

				uploader.bind("Flash:IOError", function(up, err) {
					uploader.trigger('Error', {
						code : plupload.IO_ERROR,
						message : plupload.translate('IO error.'),
						details : err.message,
						file : uploader.getFile(lookup[err.id])
					});
				});
				
				uploader.bind("Flash:ImageError", function(up, err) {
					uploader.trigger('Error', {
						code : parseInt(err.code, 10),
						message : plupload.translate('Image error.'),
						file : uploader.getFile(lookup[err.id])
					});
				});
				
				uploader.bind('Flash:StageEvent:rollOver', function(up) {
					var browseButton, hoverClass;
						
					browseButton = document.getElementById(uploader.settings.browse_button);
					hoverClass = up.settings.browse_button_hover;
					
					if (browseButton && hoverClass) {
						plupload.addClass(browseButton, hoverClass);
					}
				});
				
				uploader.bind('Flash:StageEvent:rollOut', function(up) {
					var browseButton, hoverClass;
						
					browseButton = document.getElementById(uploader.settings.browse_button);
					hoverClass = up.settings.browse_button_hover;
					
					if (browseButton && hoverClass) {
						plupload.removeClass(browseButton, hoverClass);
					}
				});
				
				uploader.bind('Flash:StageEvent:mouseDown', function(up) {
					var browseButton, activeClass;
						
					browseButton = document.getElementById(uploader.settings.browse_button);
					activeClass = up.settings.browse_button_active;
					
					if (browseButton && activeClass) {
						plupload.addClass(browseButton, activeClass);
						
						// Make sure that browse_button has active state removed from it
						plupload.addEvent(document.body, 'mouseup', function() {
							plupload.removeClass(browseButton, activeClass);	
						}, up.id);
					}
				});
				
				uploader.bind('Flash:StageEvent:mouseUp', function(up) {
					var browseButton, activeClass;
						
					browseButton = document.getElementById(uploader.settings.browse_button);
					activeClass = up.settings.browse_button_active;
					
					if (browseButton && activeClass) {
						plupload.removeClass(browseButton, activeClass);
					}
				});
				
				
				uploader.bind('Flash:ExifData', function(up, obj) {
					uploader.trigger('ExifData', uploader.getFile(lookup[obj.id]), obj.data);
				});
				
				
				uploader.bind('Flash:GpsData', function(up, obj) {
					uploader.trigger('GpsData', uploader.getFile(lookup[obj.id]), obj.data);
				});
				

				uploader.bind("QueueChanged", function(up) {
					uploader.refresh();
				});

				uploader.bind("FilesRemoved", function(up, files) {
					var i;

					for (i = 0; i < files.length; i++) {
						getFlashObj().removeFile(lookup[files[i].id]);
					}
				});

				uploader.bind("StateChanged", function(up) {
					uploader.refresh();
				});

				uploader.bind("Refresh", function(up) {
					var browseButton, browsePos, browseSize;

					// Set file filters incase it has been changed dynamically
					getFlashObj().setFileFilters(uploader.settings.filters, uploader.settings.multi_selection);

					browseButton = document.getElementById(up.settings.browse_button);
					if (browseButton) {
						browsePos = plupload.getPos(browseButton, document.getElementById(up.settings.container));
						browseSize = plupload.getSize(browseButton);
	
						plupload.extend(document.getElementById(up.id + '_flash_container').style, {
							top : browsePos.y + 'px',
							left : browsePos.x + 'px',
							width : browseSize.w + 'px',
							height : browseSize.h + 'px'
						});
					}
				});
				
				uploader.bind("DisableBrowse", function(up, disabled) {
					getFlashObj().disableBrowse(disabled);
				});
							
				callback({success : true});
			});
		}
	});
})(window, document, plupload);
/**
 * plupload.html5.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

// JSLint defined globals
/*global plupload:false, File:false, window:false, atob:false, FormData:false, FileReader:false, ArrayBuffer:false, Uint8Array:false, BlobBuilder:false, unescape:false */

(function(window, document, plupload, undef) {
    var html5files = {}, // queue of original File objects
    fakeSafariDragDrop;

    function readFileAsDataURL(file, callback) {
        var reader;

        // Use FileReader if it's available
        if ("FileReader" in window) {
            reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function() {
                callback(reader.result);
            };
        } else {
            return callback(file.getAsDataURL());
        }
    }

    function readFileAsBinary(file, callback) {
        var reader;

        // Use FileReader if it's available
        if ("FileReader" in window) {
            reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = function() {
                callback(reader.result);
            };
        } else {
            return callback(file.getAsBinary());
        }
    }

    function scaleImage(file, resize, mime, callback) {
        var canvas, context, img, scale,
        up = this;
			
        readFileAsDataURL(html5files[file.id], function(data) {
            // Setup canvas and context
            canvas = document.createElement("canvas");
            canvas.style.display = 'none';
            document.body.appendChild(canvas);
            context = canvas.getContext('2d');
                        
            // interpolation
            canvas.style.imageRendering = 'optimizeQuality';

            // Load image
            img = new Image();
            img.onerror = img.onabort = function() {
                // Failed to load, the image may be invalid
                callback({
                    success : false
                });
            };
            img.onload = function() {
                var width, height, percentage, jpegHeaders, exifParser;
				
                if (!resize['width']) {
                    resize['width'] = img.width;
                }
				
                if (!resize['height']) {
                    resize['height'] = img.height;	
                }
				
                scale = Math.min(resize.width / img.width, resize.height / img.height);

                if (scale < 1 || (scale === 1 && mime === 'image/jpeg')) {
                    width = Math.round(img.width * scale);
                    height = Math.round(img.height * scale);

                    // Scale image and canvas
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(img, 0, 0, width, height);
					
                    // Preserve JPEG headers
                    if (mime === 'image/jpeg') {
                        jpegHeaders = new JPEG_Headers(atob(data.substring(data.indexOf('base64,') + 7)));
                        if (jpegHeaders['headers'] && jpegHeaders['headers'].length) {
                            exifParser = new ExifParser();			
											
                            if (exifParser.init(jpegHeaders.get('exif')[0])) {
                                // Set new width and height
                                exifParser.setExif('PixelXDimension', width);
                                exifParser.setExif('PixelYDimension', height);
																							
                                // Update EXIF header
                                jpegHeaders.set('exif', exifParser.getBinary());
								
                                // trigger Exif events only if someone listens to them
                                if (up.hasEventListener('ExifData')) {
                                    up.trigger('ExifData', file, exifParser.EXIF());
                                }
								
                                if (up.hasEventListener('GpsData')) {
                                    up.trigger('GpsData', file, exifParser.GPS());
                                }
                            }
                        }
						
                        if (resize['quality']) {							
                            // Try quality property first
                            try {
                                data = canvas.toDataURL(mime, resize['quality'] / 100);	
                            } catch (e) {
                                data = canvas.toDataURL(mime);	
                            }
                        }
                    } else {
                        data = canvas.toDataURL(mime);
                    }

                    // Remove data prefix information and grab the base64 encoded data and decode it
                    data = data.substring(data.indexOf('base64,') + 7);
                    data = atob(data);

                    // Restore JPEG headers if applicable
                    if (jpegHeaders && jpegHeaders['headers'] && jpegHeaders['headers'].length) {
                        data = jpegHeaders.restore(data);
                        jpegHeaders.purge(); // free memory
                    }

                    // Remove canvas and execute callback with decoded image data
                    canvas.parentNode.removeChild(canvas);
                    callback({
                        success : true, 
                        data : data
                    });
                } else {
                    // Image does not need to be resized
                    callback({
                        success : false
                    });
                }
            };

            img.src = data;
        });
    }

    /**
	 * HMTL5 implementation. This runtime supports these features: dragdrop, jpgresize, pngresize.
	 *
	 * @static
	 * @class plupload.runtimes.Html5
	 * @extends plupload.Runtime
	 */
    plupload.runtimes.Html5 = plupload.addRuntime("html5", {
        /**
		 * Returns a list of supported features for the runtime.
		 *
		 * @return {Object} Name/value object with supported features.
		 */
        getFeatures : function() {
            var xhr, hasXhrSupport, hasProgress, canSendBinary, dataAccessSupport, sliceSupport;

            hasXhrSupport = hasProgress = dataAccessSupport = sliceSupport = false;
			
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
                hasProgress = !!xhr.upload;
                hasXhrSupport = !!(xhr.sendAsBinary || xhr.upload);
            }

            // Check for support for various features
            if (hasXhrSupport) {
                canSendBinary = !!(xhr.sendAsBinary || (window.Uint8Array && window.ArrayBuffer));
				
                // Set dataAccessSupport only for Gecko since BlobBuilder and XHR doesn't handle binary data correctly				
                dataAccessSupport = !!(File && (File.prototype.getAsDataURL || window.FileReader) && canSendBinary);
                sliceSupport = !!(File && (File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice)); 
            }

            // sniff out Safari for Windows and fake drag/drop
            fakeSafariDragDrop = plupload.ua.safari && plupload.ua.windows;

            return {
                html5: hasXhrSupport, // This is a special one that we check inside the init call
                dragdrop: (function() {
                    // this comes directly from Modernizr: http://www.modernizr.com/
                    var div = document.createElement('div');
                    return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
                }()),
                jpgresize: dataAccessSupport,
                pngresize: dataAccessSupport,
                multipart: dataAccessSupport || !!window.FileReader || !!window.FormData,
                canSendBinary: canSendBinary,
                // gecko 2/5/6 can't send blob with FormData: https://bugzilla.mozilla.org/show_bug.cgi?id=649150 
                cantSendBlobInFormData: !!(plupload.ua.gecko && window.FormData && window.FileReader && !FileReader.prototype.readAsArrayBuffer),
                progress: hasProgress,
                chunks: sliceSupport,
                // Safari on Windows has problems when selecting multiple files
                multi_selection: !(plupload.ua.safari && plupload.ua.windows),
                // WebKit and Gecko 2+ can trigger file dialog progrmmatically
                triggerDialog: (plupload.ua.gecko && window.FormData || plupload.ua.webkit) 
            };
        },

        /**
		 * Initializes the upload runtime.
		 *
		 * @method init
		 * @param {plupload.Uploader} uploader Uploader instance that needs to be initialized.
		 * @param {function} callback Callback to execute when the runtime initializes or fails to initialize. If it succeeds an object with a parameter name success will be set to true.
		 */
        init : function(uploader, callback) {
            var features, xhr;

            function addSelectedFiles(native_files) {
                var file, i, files = [], id, fileNames = {};

                // Add the selected files to the file queue
                for (i = 0; i < native_files.length; i++) {
                    file = native_files[i];
										
                    // Safari on Windows will add first file from dragged set multiple times
                    // @see: https://bugs.webkit.org/show_bug.cgi?id=37957
                    if (fileNames[file.name]) {
                        continue;
                    }
                    fileNames[file.name] = true;

                    // Store away gears blob internally
                    id = plupload.guid();
                    html5files[id] = file;

                    // Expose id, name and size
                    files.push(new plupload.File(id, file.fileName || file.name, file.fileSize || file.size)); // fileName / fileSize depricated
                }

                // Trigger FilesAdded event if we added any
                if (files.length) {
                    uploader.trigger("FilesAdded", files);
                }
            }

            // No HTML5 upload support
            features = this.getFeatures();
            if (!features.html5) {
                callback({
                    success : false
                });
                return;
            }

            uploader.bind("Init", function(up) {
                var inputContainer, browseButton, mimes = [], i, y, filters = up.settings.filters, ext, type, container = document.body, inputFile;

                // Create input container and insert it at an absolute position within the browse button
                inputContainer = document.createElement('div');
                inputContainer.id = up.id + '_html5_container';

                plupload.extend(inputContainer.style, {
                    position : 'absolute',
                    background : uploader.settings.shim_bgcolor || 'transparent',
                    width : '100px',
                    height : '100px',
                    overflow : 'hidden',
                    zIndex : 99999,
                    opacity : uploader.settings.shim_bgcolor ? '' : 0 // Force transparent if bgcolor is undefined
                });
                inputContainer.className = 'plupload html5';

                if (uploader.settings.container) {
                    container = document.getElementById(uploader.settings.container);
                    if (plupload.getStyle(container, 'position') === 'static') {
                        container.style.position = 'relative';
                    }
                }

                container.appendChild(inputContainer);
				
                    // Convert extensions to mime types list
                    no_type_restriction:
                    for (i = 0; i < filters.length; i++) {
                        ext = filters[i].extensions.split(/,/);

                        for (y = 0; y < ext.length; y++) {
						
                            // If there's an asterisk in the list, then accept attribute is not required
                            if (ext[y] === '*') {
                                mimes = [];
                                break no_type_restriction;
                            }
						
                            type = plupload.mimeTypes[ext[y]];

                            if (type && plupload.inArray(type, mimes) === -1) {
                                mimes.push(type);
                            }
                        }
                    }


                // Insert the input inside the input container
                inputContainer.innerHTML = '<input id="' + uploader.id + '_html5" ' + ' style="font-size:999px"' +
                ' type="file" accept="' + mimes.join(',') + '" ' +
                (uploader.settings.multi_selection && uploader.features.multi_selection ? 'multiple="multiple"' : '') + ' />';

                inputContainer.scrollTop = 100;
                inputFile = document.getElementById(uploader.id + '_html5');
				
                if (up.features.triggerDialog) {
                    plupload.extend(inputFile.style, {
                        position: 'absolute',
                        width: '100%',
                        height: '100%'
                    });
                } else {
                    // shows arrow cursor instead of the text one, bit more logical
                    plupload.extend(inputFile.style, {
                        cssFloat: 'right', 
                        styleFloat: 'right'
                    });
                }
				
                inputFile.onchange = function() {
                    // Add the selected files from file input
                    addSelectedFiles(this.files);
					
                    // Clearing the value enables the user to select the same file again if they want to
                    this.value = '';
                };
				
                /* Since we have to place input[type=file] on top of the browse_button for some browsers (FF, Opera),
				browse_button loses interactivity, here we try to neutralize this issue highlighting browse_button
				with a special classes
				TODO: needs to be revised as things will change */
                browseButton = document.getElementById(up.settings.browse_button);
                if (browseButton) {				
                    var hoverClass = up.settings.browse_button_hover,
                    activeClass = up.settings.browse_button_active,
                    topElement = up.features.triggerDialog ? browseButton : inputContainer;
					
                    if (hoverClass) {
                        plupload.addEvent(topElement, 'mouseover', function() {
                            plupload.addClass(browseButton, hoverClass);	
                        }, up.id);
                        plupload.addEvent(topElement, 'mouseout', function() {
                            plupload.removeClass(browseButton, hoverClass);	
                        }, up.id);
                    }
					
                    if (activeClass) {
                        plupload.addEvent(topElement, 'mousedown', function() {
                            plupload.addClass(browseButton, activeClass);	
                        }, up.id);
                        plupload.addEvent(document.body, 'mouseup', function() {
                            plupload.removeClass(browseButton, activeClass);	
                        }, up.id);
                    }

                    // Route click event to the input[type=file] element for supporting browsers
                    if (up.features.triggerDialog) {
                        plupload.addEvent(browseButton, 'click', function(e) {
                            var input = document.getElementById(up.id + '_html5');
                            if (input && !input.disabled) { // for some reason FF (up to 8.0.1 so far) lets to click disabled input[type=file]
                                input.click();
                            }
                            e.preventDefault();
                        }, up.id); 
                    }
                }
            });

            // Add drop handler
            uploader.bind("PostInit", function() {
                var dropElm = document.getElementById(uploader.settings.drop_element);

                if (dropElm) {
                    // Lets fake drag/drop on Safari by moving a input type file in front of the mouse pointer when we drag into the drop zone
                    // TODO: Remove this logic once Safari has official drag/drop support
                    if (fakeSafariDragDrop) {
                        plupload.addEvent(dropElm, 'dragenter', function(e) {
                            var dropInputElm, dropPos, dropSize;

                            // Get or create drop zone
                            dropInputElm = document.getElementById(uploader.id + "_drop");
                            if (!dropInputElm) {
                                dropInputElm = document.createElement("input");
                                dropInputElm.setAttribute('type', "file");
                                dropInputElm.setAttribute('id', uploader.id + "_drop");
                                dropInputElm.setAttribute('multiple', 'multiple');

                                plupload.addEvent(dropInputElm, 'change', function() {
                                    // Add the selected files from file input
                                    addSelectedFiles(this.files);
																		
                                    // Remove input element
                                    plupload.removeEvent(dropInputElm, 'change', uploader.id);
                                    dropInputElm.parentNode.removeChild(dropInputElm);									
                                }, uploader.id);
								
                                dropElm.appendChild(dropInputElm);
                            }

                            dropPos = plupload.getPos(dropElm, document.getElementById(uploader.settings.container));
                            dropSize = plupload.getSize(dropElm);
							
                            if (plupload.getStyle(dropElm, 'position') === 'static') {
                                plupload.extend(dropElm.style, {
                                    position : 'relative'
                                });
                            }
              
                            plupload.extend(dropInputElm.style, {
                                position : 'absolute',
                                display : 'block',
                                top : 0,
                                left : 0,
                                width : dropSize.w + 'px',
                                height : dropSize.h + 'px',
                                opacity : 0
                            });							
                        }, uploader.id);

                        return;
                    }

                    // Block browser default drag over
                    plupload.addEvent(dropElm, 'dragover', function(e) {
                        e.preventDefault();
                    }, uploader.id);

                    // Attach drop handler and grab files
                    plupload.addEvent(dropElm, 'drop', function(e) {
                        var dataTransfer = e.dataTransfer;

                        // Add dropped files
                        if (dataTransfer && dataTransfer.files) {
                            addSelectedFiles(dataTransfer.files);
                        }

                        e.preventDefault();
                    }, uploader.id);
                }
            });

            uploader.bind("Refresh", function(up) {
                var browseButton, browsePos, browseSize, inputContainer, zIndex;
					
                browseButton = document.getElementById(uploader.settings.browse_button);
                if (browseButton) {
                    browsePos = plupload.getPos(browseButton, document.getElementById(up.settings.container));
                    browseSize = plupload.getSize(browseButton);
                    inputContainer = document.getElementById(uploader.id + '_html5_container');
	
                    plupload.extend(inputContainer.style, {
                        top : browsePos.y + 'px',
                        left : browsePos.x + 'px',
                        width : browseSize.w + 'px',
                        height : browseSize.h + 'px'
                    });
					
                    // for WebKit place input element underneath the browse button and route onclick event 
                    // TODO: revise when browser support for this feature will change
                    if (uploader.features.triggerDialog) {
                        if (plupload.getStyle(browseButton, 'position') === 'static') {
                            plupload.extend(browseButton.style, {
                                position : 'relative'
                            });
                        }
						
                        zIndex = parseInt(plupload.getStyle(browseButton, 'zIndex'), 10);
                        if (isNaN(zIndex)) {
                            zIndex = 0;
                        }						
							
                        plupload.extend(browseButton.style, {
                            zIndex : zIndex
                        });						
											
                        plupload.extend(inputContainer.style, {
                            zIndex : zIndex - 1
                        });
                    }				
                }
            });
			
            uploader.bind("DisableBrowse", function(up, disabled) {
                var input = document.getElementById(up.id + '_html5');
                if (input) {
                    input.disabled = disabled;	
                }
            });
			
            uploader.bind("CancelUpload", function() {
                if (xhr && xhr.abort) {
                    xhr.abort();	
                }
            });

            uploader.bind("UploadFile", function(up, file) {
                var settings = up.settings, nativeFile, resize;
					
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
                        var chunkBlob, br, chunks, args, chunkSize, curChunkSize, mimeType, url = up.settings.url;													

						
                        function prepareAndSend(bin) {
                            var multipartDeltaSize = 0,
                            boundary = '----pluploadboundary' + plupload.guid(), formData, dashdash = '--', crlf = '\r\n', multipartBlob = '';
								
                            xhr = new XMLHttpRequest;
															
                            // Do we have upload progress support
                            if (xhr.upload) {
                                xhr.upload.onprogress = function(e) {
                                    file.loaded = Math.min(file.size, loaded + e.loaded - multipartDeltaSize); // Loaded can be larger than file size due to multipart encoding
                                    up.trigger('UploadProgress', file);
                                };
                            }
	
                            xhr.onreadystatechange = function() {
                                var httpStatus, chunkArgs;
																	
                                if (xhr.readyState == 4 && up.state !== plupload.STOPPED) {
                                    // Getting the HTTP status might fail on some Gecko versions
                                    try {
                                        httpStatus = xhr.status;
                                    } catch (ex) {
                                        httpStatus = 0;
                                    }
	
                                    // Is error status
                                    if (httpStatus >= 400) {
                                        up.trigger('Error', {
                                            code : plupload.HTTP_ERROR,
                                            message : plupload.translate('HTTP Error.'),
                                            file : file,
                                            status : httpStatus
                                        });
                                    } else {
                                        // Handle chunk response
                                        if (chunks) {
                                            chunkArgs = {
                                                chunk : chunk,
                                                chunks : chunks,
                                                response : xhr.responseText,
                                                status : httpStatus
                                            };
	
                                            up.trigger('ChunkUploaded', file, chunkArgs);
                                            loaded += curChunkSize;
	
                                            // Stop upload
                                            if (chunkArgs.cancelled) {
                                                file.status = plupload.FAILED;
                                                return;
                                            }
	
                                            file.loaded = Math.min(file.size, (chunk + 1) * chunkSize);
                                        } else {
                                            file.loaded = file.size;
                                        }
	
                                        up.trigger('UploadProgress', file);
										
                                        bin = chunkBlob = formData = multipartBlob = null; // Free memory
										
                                        // Check if file is uploaded
                                        if (!chunks || ++chunk >= chunks) {
                                            file.status = plupload.DONE;
																						
                                            up.trigger('FileUploaded', file, {
                                                response : xhr.responseText,
                                                status : httpStatus
                                            });										
                                        } else {										
                                            // Still chunks left
                                            uploadNextChunk();
                                        }
                                    }																	
                                }
                            };
							
	
                            // Build multipart request
                            if (up.settings.multipart && features.multipart) {
								
                                args.name = file.target_name || file.name;
								
                                xhr.open("post", url, true);
								
                                // Set custom headers
                                plupload.each(up.settings.headers, function(value, name) {
                                    xhr.setRequestHeader(name, value);
                                });
								
								
                                // if has FormData support like Chrome 6+, Safari 5+, Firefox 4, use it
                                if (typeof(bin) !== 'string' && !!window.FormData) {
                                    formData = new FormData();
	
                                    // Add multipart params
                                    plupload.each(plupload.extend(args, up.settings.multipart_params), function(value, name) {
                                        formData.append(name, value);
                                    });
	
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
                                    plupload.each(plupload.extend(args, up.settings.multipart_params), function(value, name) {
                                        multipartBlob += dashdash + boundary + crlf +
                                        'Content-Disposition: form-data; name="' + name + '"' + crlf + crlf;
		
                                        multipartBlob += unescape(encodeURIComponent(value)) + crlf;
                                    });
		
                                    mimeType = plupload.mimeTypes[file.name.replace(/^.+\.([^.]+)/, '$1').toLowerCase()] || 'application/octet-stream';
		
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
                                    } else if (features.canSendBinary) { // WebKit with typed arrays support
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
                            url = plupload.buildUrl(up.settings.url, plupload.extend(args, up.settings.multipart_params));
							
                            xhr.open("post", url, true);
							
                            xhr.setRequestHeader('Content-Type', 'application/octet-stream'); // Binary stream header
								
                            // Set custom headers
                            plupload.each(up.settings.headers, function(value, name) {
                                xhr.setRequestHeader(name, value);
                            });
												
                            xhr.send(bin); 
                        } // prepareAndSend


                        // File upload finished
                        if (file.status == plupload.DONE || file.status == plupload.FAILED || up.state == plupload.STOPPED) {
                            return;
                        }

                        // Standard arguments
                        args = {
                            name : file.target_name || file.name
                            };

                        // Only add chunking args if needed
                        if (settings.chunk_size && file.size > settings.chunk_size && (features.chunks || typeof(blob) == 'string')) { // blob will be of type string if it was loaded in memory 
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
                        } else {
                            curChunkSize = file.size;
                            chunkBlob = blob;
                        }
						
                        // workaround Gecko 2,5,6 FormData+Blob bug: https://bugzilla.mozilla.org/show_bug.cgi?id=649150
                        if (up.settings.multipart && features.multipart && typeof(chunkBlob) !== 'string' && fr && features.cantSendBlobInFormData && features.chunks && up.settings.chunk_size) { // Gecko 2,5,6
                            fr.onload = function() {
                                prepareAndSend(fr.result);
                            }
                            fr.readAsBinaryString(chunkBlob);
                        } else {
                            prepareAndSend(chunkBlob);
                        }
							
                    }

                    // Start uploading chunks
                    uploadNextChunk();
                }

                nativeFile = html5files[file.id];
								
                // Resize image if it's a supported format and resize is enabled
                if (features.jpgresize && up.settings.resize && /\.(png|jpg|jpeg)$/i.test(file.name)) {
                    scaleImage.call(up, file, up.settings.resize, /\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg', function(res) {
                        // If it was scaled send the scaled image if it failed then
                        // send the raw image and let the server do the scaling
                        if (res.success) {
                            file.size = res.data.length;
                            sendBinaryBlob(res.data);
                        } else if (features.chunks && up.settings.chunk_size) {
                            sendBinaryBlob(nativeFile); 
                        } else {
                            readFileAsBinary(nativeFile, sendBinaryBlob); // for browsers not supporting File.slice (e.g. FF3.6)
                        }
                    });
                // if there's no way to slice file without preloading it in memory, preload it
                } else if (!features.chunks && features.jpgresize) { 
                    readFileAsBinary(nativeFile, sendBinaryBlob); 
                } else {
                    sendBinaryBlob(nativeFile); 
                }
            });
			
			
            uploader.bind('Destroy', function(up) {
                var name, element, container = document.body,
                elements = {
                    inputContainer: up.id + '_html5_container',
                    inputFile: up.id + '_html5',
                    browseButton: up.settings.browse_button,
                    dropElm: up.settings.drop_element
                };

                // Unbind event handlers
                for (name in elements) {
                    element = document.getElementById(elements[name]);
                    if (element) {
                        plupload.removeAllEvents(element, up.id);
                    }
                }
                plupload.removeAllEvents(document.body, up.id);
				
                if (up.settings.container) {
                    container = document.getElementById(up.settings.container);
                }
				
                // Remove mark-up
                container.removeChild(document.getElementById(elements.inputContainer));
            });

            callback({
                success : true
            });
        }
    });
	
    function BinaryReader() {
        var II = false, bin;

        // Private functions
        function read(idx, size) {
            var mv = II ? 0 : -8 * (size - 1), sum = 0, i;

            for (i = 0; i < size; i++) {
                sum |= (bin.charCodeAt(idx + i) << Math.abs(mv + i*8));
            }

            return sum;
        }

        function putstr(segment, idx, length) {
            var length = arguments.length === 3 ? length : bin.length - idx - 1;
			
            bin = bin.substr(0, idx) + segment + bin.substr(length + idx);
        }

        function write(idx, num, size) {
            var str = '', mv = II ? 0 : -8 * (size - 1), i;

            for (i = 0; i < size; i++) {
                str += String.fromCharCode((num >> Math.abs(mv + i*8)) & 255);
            }

            putstr(str, idx, size);
        }

        // Public functions
        return {
            II: function(order) {
                if (order === undef) {
                    return II;
                } else {
                    II = order;
                }
            },

            init: function(binData) {
                II = false;
                bin = binData;
            },

            SEGMENT: function(idx, length, segment) {				
                switch (arguments.length) {
                    case 1:
                        return bin.substr(idx, bin.length - idx - 1);
                    case 2:
                        return bin.substr(idx, length);
                    case 3:
                        putstr(segment, idx, length);
                        break;
                    default:
                        return bin;	
                }
            },

            BYTE: function(idx) {
                return read(idx, 1);
            },

            SHORT: function(idx) {
                return read(idx, 2);
            },

            LONG: function(idx, num) {
                if (num === undef) {
                    return read(idx, 4);
                } else {
                    write(idx, num, 4);
                }
            },

            SLONG: function(idx) { // 2's complement notation
                var num = read(idx, 4);

                return (num > 2147483647 ? num - 4294967296 : num);
            },

            STRING: function(idx, size) {
                var str = '';

                for (size += idx; idx < size; idx++) {
                    str += String.fromCharCode(read(idx, 1));
                }

                return str;
            }
        };
    }
	
    function JPEG_Headers(data) {
		
        var markers = {
            0xFFE1: {
                app: 'EXIF',
                name: 'APP1',
                signature: "Exif\0" 
            },
            0xFFE2: {
                app: 'ICC',
                name: 'APP2',
                signature: "ICC_PROFILE\0" 
            },
            0xFFED: {
                app: 'IPTC',
                name: 'APP13',
                signature: "Photoshop 3.0\0" 
            }
        },
        headers = [], read, idx, marker = undef, length = 0, limit;
			
		
        read = new BinaryReader();
        read.init(data);
				
        // Check if data is jpeg
        if (read.SHORT(0) !== 0xFFD8) {
            return;
        }
		
        idx = 2;
        limit = Math.min(1048576, data.length);	
			
        while (idx <= limit) {
            marker = read.SHORT(idx);
			
            // omit RST (restart) markers
            if (marker >= 0xFFD0 && marker <= 0xFFD7) {
                idx += 2;
                continue;
            }
			
            // no headers allowed after SOS marker
            if (marker === 0xFFDA || marker === 0xFFD9) {
                break;	
            }	
			
            length = read.SHORT(idx + 2) + 2;	
			
            if (markers[marker] && 
                read.STRING(idx + 4, markers[marker].signature.length) === markers[marker].signature) {
                headers.push({ 
                    hex: marker,
                    app: markers[marker].app.toUpperCase(),
                    name: markers[marker].name.toUpperCase(),
                    start: idx,
                    length: length,
                    segment: read.SEGMENT(idx, length)
                });
            }
            idx += length;			
        }
					
        read.init(null); // free memory
						
        return {
			
            headers: headers,
			
            restore: function(data) {
                read.init(data);
				
                // Check if data is jpeg
                var jpegHeaders = new JPEG_Headers(data);
				
                if (!jpegHeaders['headers']) {
                    return false;
                }	
				
                // Delete any existing headers that need to be replaced
                for (var i = jpegHeaders['headers'].length; i > 0; i--) {
                    var hdr = jpegHeaders['headers'][i - 1];
                    read.SEGMENT(hdr.start, hdr.length, '')
                }
                jpegHeaders.purge();
				
                idx = read.SHORT(2) == 0xFFE0 ? 4 + read.SHORT(4) : 2;
								
                for (var i = 0, max = headers.length; i < max; i++) {
                    read.SEGMENT(idx, 0, headers[i].segment);						
                    idx += headers[i].length;
                }
				
                return read.SEGMENT();
            },
			
            get: function(app) {
                var array = [];
								
                for (var i = 0, max = headers.length; i < max; i++) {
                    if (headers[i].app === app.toUpperCase()) {
                        array.push(headers[i].segment);
                    }
                }
                return array;
            },
			
            set: function(app, segment) {
                var array = [];
				
                if (typeof(segment) === 'string') {
                    array.push(segment);	
                } else {
                    array = segment;	
                }
				
                for (var i = ii = 0, max = headers.length; i < max; i++) {
                    if (headers[i].app === app.toUpperCase()) {
                        headers[i].segment = array[ii];
                        headers[i].length = array[ii].length;
                        ii++;
                    }
                    if (ii >= array.length) break;
                }
            },
			
            purge: function() {
                headers = [];
                read.init(null);
            }
        };		
    }
	
	
    function ExifParser() {
        // Private ExifParser fields
        var data, tags, offsets = {}, tagDescs;

        data = new BinaryReader();

        tags = {
            tiff : {
                /*
				The image orientation viewed in terms of rows and columns.
	
				1 - The 0th row is at the visual top of the image, and the 0th column is the visual left-hand side.
				2 - The 0th row is at the visual top of the image, and the 0th column is the visual left-hand side.
				3 - The 0th row is at the visual top of the image, and the 0th column is the visual right-hand side.
				4 - The 0th row is at the visual bottom of the image, and the 0th column is the visual right-hand side.
				5 - The 0th row is at the visual bottom of the image, and the 0th column is the visual left-hand side.
				6 - The 0th row is the visual left-hand side of the image, and the 0th column is the visual top.
				7 - The 0th row is the visual right-hand side of the image, and the 0th column is the visual top.
				8 - The 0th row is the visual right-hand side of the image, and the 0th column is the visual bottom.
				9 - The 0th row is the visual left-hand side of the image, and the 0th column is the visual bottom.
				*/
                0x0112: 'Orientation',
                0x8769: 'ExifIFDPointer',
                0x8825:	'GPSInfoIFDPointer'
            },
            exif : {
                0x9000: 'ExifVersion',
                0xA001: 'ColorSpace',
                0xA002: 'PixelXDimension',
                0xA003: 'PixelYDimension',
                0x9003: 'DateTimeOriginal',
                0x829A: 'ExposureTime',
                0x829D: 'FNumber',
                0x8827: 'ISOSpeedRatings',
                0x9201: 'ShutterSpeedValue',
                0x9202: 'ApertureValue'	,
                0x9207: 'MeteringMode',
                0x9208: 'LightSource',
                0x9209: 'Flash',
                0xA402: 'ExposureMode',
                0xA403: 'WhiteBalance',
                0xA406: 'SceneCaptureType',
                0xA404: 'DigitalZoomRatio',
                0xA408: 'Contrast',
                0xA409: 'Saturation',
                0xA40A: 'Sharpness'
            },
            gps : {
                0x0000: 'GPSVersionID',
                0x0001: 'GPSLatitudeRef',
                0x0002: 'GPSLatitude',
                0x0003: 'GPSLongitudeRef',
                0x0004: 'GPSLongitude'
            }
        };

        tagDescs = {
            'ColorSpace': {
                1: 'sRGB',
                0: 'Uncalibrated'
            },

            'MeteringMode': {
                0: 'Unknown',
                1: 'Average',
                2: 'CenterWeightedAverage',
                3: 'Spot',
                4: 'MultiSpot',
                5: 'Pattern',
                6: 'Partial',
                255: 'Other'
            },

            'LightSource': {
                1: 'Daylight',
                2: 'Fliorescent',
                3: 'Tungsten',
                4: 'Flash',
                9: 'Fine weather',
                10: 'Cloudy weather',
                11: 'Shade',
                12: 'Daylight fluorescent (D 5700 - 7100K)',
                13: 'Day white fluorescent (N 4600 -5400K)',
                14: 'Cool white fluorescent (W 3900 - 4500K)',
                15: 'White fluorescent (WW 3200 - 3700K)',
                17: 'Standard light A',
                18: 'Standard light B',
                19: 'Standard light C',
                20: 'D55',
                21: 'D65',
                22: 'D75',
                23: 'D50',
                24: 'ISO studio tungsten',
                255: 'Other'
            },

            'Flash': {
                0x0000: 'Flash did not fire.',
                0x0001: 'Flash fired.',
                0x0005: 'Strobe return light not detected.',
                0x0007: 'Strobe return light detected.',
                0x0009: 'Flash fired, compulsory flash mode',
                0x000D: 'Flash fired, compulsory flash mode, return light not detected',
                0x000F: 'Flash fired, compulsory flash mode, return light detected',
                0x0010: 'Flash did not fire, compulsory flash mode',
                0x0018: 'Flash did not fire, auto mode',
                0x0019: 'Flash fired, auto mode',
                0x001D: 'Flash fired, auto mode, return light not detected',
                0x001F: 'Flash fired, auto mode, return light detected',
                0x0020: 'No flash function',
                0x0041: 'Flash fired, red-eye reduction mode',
                0x0045: 'Flash fired, red-eye reduction mode, return light not detected',
                0x0047: 'Flash fired, red-eye reduction mode, return light detected',
                0x0049: 'Flash fired, compulsory flash mode, red-eye reduction mode',
                0x004D: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
                0x004F: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
                0x0059: 'Flash fired, auto mode, red-eye reduction mode',
                0x005D: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
                0x005F: 'Flash fired, auto mode, return light detected, red-eye reduction mode'
            },

            'ExposureMode': {
                0: 'Auto exposure',
                1: 'Manual exposure',
                2: 'Auto bracket'
            },

            'WhiteBalance': {
                0: 'Auto white balance',
                1: 'Manual white balance'
            },

            'SceneCaptureType': {
                0: 'Standard',
                1: 'Landscape',
                2: 'Portrait',
                3: 'Night scene'
            },

            'Contrast': {
                0: 'Normal',
                1: 'Soft',
                2: 'Hard'
            },

            'Saturation': {
                0: 'Normal',
                1: 'Low saturation',
                2: 'High saturation'
            },

            'Sharpness': {
                0: 'Normal',
                1: 'Soft',
                2: 'Hard'
            },

            // GPS related
            'GPSLatitudeRef': {
                N: 'North latitude',
                S: 'South latitude'
            },

            'GPSLongitudeRef': {
                E: 'East longitude',
                W: 'West longitude'
            }
        };

        function extractTags(IFD_offset, tags2extract) {
            var length = data.SHORT(IFD_offset), i, ii,
            tag, type, count, tagOffset, offset, value, values = [], hash = {};

            for (i = 0; i < length; i++) {
                // Set binary reader pointer to beginning of the next tag
                offset = tagOffset = IFD_offset + 12 * i + 2;

                tag = tags2extract[data.SHORT(offset)];

                if (tag === undef) {
                    continue; // Not the tag we requested
                }

                type = data.SHORT(offset+=2);
                count = data.LONG(offset+=2);

                offset += 4;
                values = [];

                switch (type) {
                    case 1: // BYTE
                    case 7: // UNDEFINED
                        if (count > 4) {
                            offset = data.LONG(offset) + offsets.tiffHeader;
                        }

                        for (ii = 0; ii < count; ii++) {
                            values[ii] = data.BYTE(offset + ii);
                        }

                        break;

                    case 2: // STRING
                        if (count > 4) {
                            offset = data.LONG(offset) + offsets.tiffHeader;
                        }

                        hash[tag] = data.STRING(offset, count - 1);

                        continue;

                    case 3: // SHORT
                        if (count > 2) {
                            offset = data.LONG(offset) + offsets.tiffHeader;
                        }

                        for (ii = 0; ii < count; ii++) {
                            values[ii] = data.SHORT(offset + ii*2);
                        }

                        break;

                    case 4: // LONG
                        if (count > 1) {
                            offset = data.LONG(offset) + offsets.tiffHeader;
                        }

                        for (ii = 0; ii < count; ii++) {
                            values[ii] = data.LONG(offset + ii*4);
                        }

                        break;

                    case 5: // RATIONAL
                        offset = data.LONG(offset) + offsets.tiffHeader;

                        for (ii = 0; ii < count; ii++) {
                            values[ii] = data.LONG(offset + ii*4) / data.LONG(offset + ii*4 + 4);
                        }

                        break;

                    case 9: // SLONG
                        offset = data.LONG(offset) + offsets.tiffHeader;

                        for (ii = 0; ii < count; ii++) {
                            values[ii] = data.SLONG(offset + ii*4);
                        }

                        break;

                    case 10: // SRATIONAL
                        offset = data.LONG(offset) + offsets.tiffHeader;

                        for (ii = 0; ii < count; ii++) {
                            values[ii] = data.SLONG(offset + ii*4) / data.SLONG(offset + ii*4 + 4);
                        }

                        break;

                    default:
                        continue;
                }

                value = (count == 1 ? values[0] : values);

                if (tagDescs.hasOwnProperty(tag) && typeof value != 'object') {
                    hash[tag] = tagDescs[tag][value];
                } else {
                    hash[tag] = value;
                }
            }

            return hash;
        }

        function getIFDOffsets() {
            var Tiff = undef, idx = offsets.tiffHeader;

            // Set read order of multi-byte data
            data.II(data.SHORT(idx) == 0x4949);

            // Check if always present bytes are indeed present
            if (data.SHORT(idx+=2) !== 0x002A) {
                return false;
            }
		
            offsets['IFD0'] = offsets.tiffHeader + data.LONG(idx += 2);
            Tiff = extractTags(offsets['IFD0'], tags.tiff);

            offsets['exifIFD'] = ('ExifIFDPointer' in Tiff ? offsets.tiffHeader + Tiff.ExifIFDPointer : undef);
            offsets['gpsIFD'] = ('GPSInfoIFDPointer' in Tiff ? offsets.tiffHeader + Tiff.GPSInfoIFDPointer : undef);

            return true;
        }
		
        // At the moment only setting of simple (LONG) values, that do not require offset recalculation, is supported
        function setTag(ifd, tag, value) {
            var offset, length, tagOffset, valueOffset = 0;
			
            // If tag name passed translate into hex key
            if (typeof(tag) === 'string') {
                var tmpTags = tags[ifd.toLowerCase()];
                for (hex in tmpTags) {
                    if (tmpTags[hex] === tag) {
                        tag = hex;
                        break;	
                    }
                }
            }
            offset = offsets[ifd.toLowerCase() + 'IFD'];
            length = data.SHORT(offset);
						
            for (i = 0; i < length; i++) {
                tagOffset = offset + 12 * i + 2;

                if (data.SHORT(tagOffset) == tag) {
                    valueOffset = tagOffset + 8;
                    break;
                }
            }
			
            if (!valueOffset) return false;

			
            data.LONG(valueOffset, value);
            return true;
        }
		

        // Public functions
        return {
            init: function(segment) {
                // Reset internal data
                offsets = {
                    tiffHeader: 10
                };
				
                if (segment === undef || !segment.length) {
                    return false;
                }

                data.init(segment);

                // Check if that's APP1 and that it has EXIF
                if (data.SHORT(0) === 0xFFE1 && data.STRING(4, 5).toUpperCase() === "EXIF\0") {
                    return getIFDOffsets();
                }
                return false;
            },
			
            EXIF: function() {
                var Exif;
				
                // Populate EXIF hash
                Exif = extractTags(offsets.exifIFD, tags.exif);

                // Fix formatting of some tags
                if (Exif.ExifVersion && plupload.typeOf(Exif.ExifVersion) === 'array') {
                    for (var i = 0, exifVersion = ''; i < Exif.ExifVersion.length; i++) {
                        exifVersion += String.fromCharCode(Exif.ExifVersion[i]);	
                    }
                    Exif.ExifVersion = exifVersion;
                }

                return Exif;
            },

            GPS: function() {
                var GPS;
				
                GPS = extractTags(offsets.gpsIFD, tags.gps);
				
                // iOS devices (and probably some others) do not put in GPSVersionID tag (why?..)
                if (GPS.GPSVersionID) { 
                    GPS.GPSVersionID = GPS.GPSVersionID.join('.');
                }

                return GPS;
            },
			
            setExif: function(tag, value) {
                // Right now only setting of width/height is possible
                if (tag !== 'PixelXDimension' && tag !== 'PixelYDimension') return false;
				
                return setTag('exif', tag, value);
            },


            getBinary: function() {
                return data.SEGMENT();
            }
        };
    };
})(window, document, plupload);
/**
 * plupload.html4.js
 *
 * Copyright 2010, Ryan Demmer
 * Copyright 2009, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

// JSLint defined globals
/*global plupload:false, window:false */

(function(window, document, plupload, undef) {
	function getById(id) {
		return document.getElementById(id);
	}

	/**
	 * HTML4 implementation. This runtime has no special features it uses an form that posts files into an hidden iframe.
	 *
	 * @static
	 * @class plupload.runtimes.Html4
	 * @extends plupload.Runtime
	 */
	plupload.runtimes.Html4 = plupload.addRuntime("html4", {
		/**
		 * Returns a list of supported features for the runtime.
		 *
		 * @return {Object} Name/value object with supported features.
		 */
		getFeatures : function() {			
			// Only multipart feature
			return {
				multipart: true,
				
				// WebKit and Gecko 2+ can trigger file dialog progrmmatically
				triggerDialog: (plupload.ua.gecko && window.FormData || plupload.ua.webkit) 
			};
		},

		/**
		 * Initializes the upload runtime.
		 *
		 * @method init
		 * @param {plupload.Uploader} uploader Uploader instance that needs to be initialized.
		 * @param {function} callback Callback to execute when the runtime initializes or fails to initialize. If it succeeds an object with a parameter name success will be set to true.
		 */
		init : function(uploader, callback) {
			uploader.bind("Init", function(up) {
				var container = document.body, iframe, url = "javascript", currentFile,
					input, currentFileId, fileIds = [], IE = /MSIE/.test(navigator.userAgent), mimes = [],
					filters = up.settings.filters, i, ext, type, y;

				// Convert extensions to mime types list
				no_type_restriction:
				for (i = 0; i < filters.length; i++) {
					ext = filters[i].extensions.split(/,/);

					for (y = 0; y < ext.length; y++) {
						
						// If there's an asterisk in the list, then accept attribute is not required
						if (ext[y] === '*') {
							mimes = [];
							break no_type_restriction;
						}
						
						type = plupload.mimeTypes[ext[y]];

						if (type && plupload.inArray(type, mimes) === -1) {
							mimes.push(type);
						}
					}
				}
				
				mimes = mimes.join(',');

				function createForm() {
					var form, input, bgcolor, browseButton;

					// Setup unique id for form
					currentFileId = plupload.guid();
					
					// Save id for Destroy handler
					fileIds.push(currentFileId);

					// Create form
					form = document.createElement('form');
					form.setAttribute('id', 'form_' + currentFileId);
					form.setAttribute('method', 'post');
					form.setAttribute('enctype', 'multipart/form-data');
					form.setAttribute('encoding', 'multipart/form-data');
					form.setAttribute("target", up.id + '_iframe');
					form.style.position = 'absolute';

					// Create input and set attributes
					input = document.createElement('input');
					input.setAttribute('id', 'input_' + currentFileId);
					input.setAttribute('type', 'file');
					input.setAttribute('accept', mimes);
					input.setAttribute('size', 1);
					
					browseButton = getById(up.settings.browse_button);
					
					// Route click event to input element programmatically, if possible
					if (up.features.triggerDialog && browseButton) {
						plupload.addEvent(getById(up.settings.browse_button), 'click', function(e) {
							if (!input.disabled) {
								input.click();
							}
							e.preventDefault();
						}, up.id);
					}

					// Set input styles
					plupload.extend(input.style, {
						width : '100%',
						height : '100%',
						opacity : 0,
						fontSize: '99px', // force input element to be bigger then needed to occupy whole space
						cursor: 'pointer'
					});
					
					plupload.extend(form.style, {
						overflow: 'hidden'
					});

					// Show the container if shim_bgcolor is specified
					bgcolor = up.settings.shim_bgcolor;
					if (bgcolor) {
						form.style.background = bgcolor;
					}

					// no opacity in IE
					if (IE) {
						plupload.extend(input.style, {
							filter : "alpha(opacity=0)"
						});
					}

					// add change event
					plupload.addEvent(input, 'change', function(e) {
						var element = e.target, name, files = [], topElement;

						if (element.value) {
							getById('form_' + currentFileId).style.top = -0xFFFFF + "px";

							// Get file name
							name = element.value.replace(/\\/g, '/');
							name = name.substring(name.length, name.lastIndexOf('/') + 1);

							// Push files
							files.push(new plupload.File(currentFileId, name));
							
							// Clean-up events - they won't be needed anymore
							if (!up.features.triggerDialog) {
								plupload.removeAllEvents(form, up.id);								
							} else {
								plupload.removeEvent(browseButton, 'click', up.id);	
							}
							plupload.removeEvent(input, 'change', up.id);

							// Create and position next form
							createForm();

							// Fire FilesAdded event
							if (files.length) {
								uploader.trigger("FilesAdded", files);
							}							
						}
					}, up.id);

					// append to container
					form.appendChild(input);
					container.appendChild(form);

					up.refresh();
				}


				function createIframe() {
					var temp = document.createElement('div');

					// Create iframe using a temp div since IE 6 won't be able to set the name using setAttribute or iframe.name
					temp.innerHTML = '<iframe id="' + up.id + '_iframe" name="' + up.id + '_iframe" src="' + url + ':&quot;&quot;" style="display:none"></iframe>';
					iframe = temp.firstChild;
					container.appendChild(iframe);

					// Add IFrame onload event
					plupload.addEvent(iframe, 'load', function(e) {
						var n = e.target, el, result;

						// Ignore load event if there is no file
						if (!currentFile) {
							return;
						}

						try {
							el = n.contentWindow.document || n.contentDocument || window.frames[n.id].document;
						} catch (ex) {
							// Probably a permission denied error
							up.trigger('Error', {
								code : plupload.SECURITY_ERROR,
								message : plupload.translate('Security error.'),
								file : currentFile
							});

							return;
						}

						// Get result
						result = el.body.innerHTML;
						
						// Assume no error
						if (result) {
							currentFile.status = plupload.DONE;
							currentFile.loaded = 1025;
							currentFile.percent = 100;

							up.trigger('UploadProgress', currentFile);
							up.trigger('FileUploaded', currentFile, {
								response : result
							});
						}
					}, up.id);
				} // end createIframe
				
				if (up.settings.container) {
					container = getById(up.settings.container);
					if (plupload.getStyle(container, 'position') === 'static') {
						container.style.position = 'relative';
					}
				}
				
				// Upload file
				up.bind("UploadFile", function(up, file) {
					var form, input;
					
					// File upload finished
					if (file.status == plupload.DONE || file.status == plupload.FAILED || up.state == plupload.STOPPED) {
						return;
					}

					// Get the form and input elements
					form = getById('form_' + file.id);
					input = getById('input_' + file.id);

					// Set input element name attribute which allows it to be submitted
					input.setAttribute('name', up.settings.file_data_name);

					// Store action
					form.setAttribute("action", up.settings.url);

					// Append multipart parameters
					plupload.each(plupload.extend({name : file.target_name || file.name}, up.settings.multipart_params), function(value, name) {
						var hidden = document.createElement('input');

						plupload.extend(hidden, {
							type : 'hidden',
							name : name,
							value : value
						});

						form.insertBefore(hidden, form.firstChild);
					});

					currentFile = file;

					// Hide the current form
					getById('form_' + currentFileId).style.top = -0xFFFFF + "px";
					
					form.submit();
				});
				
				
				
				up.bind('FileUploaded', function(up) {
					up.refresh(); // just to get the form back on top of browse_button
				});				

				up.bind('StateChanged', function(up) {
					if (up.state == plupload.STARTED) {
						createIframe();
					} else if (up.state == plupload.STOPPED) {
						window.setTimeout(function() {
							plupload.removeEvent(iframe, 'load', up.id);
							if (iframe.parentNode) { // #382
								iframe.parentNode.removeChild(iframe);
							}
						}, 0);
					}
					
					plupload.each(up.files, function(file, i) {
						if (file.status === plupload.DONE || file.status === plupload.FAILED) {
							var form = getById('form_' + file.id);

							if(form){
								form.parentNode.removeChild(form);
							}
						}
					});
				});

				// Refresh button, will reposition the input form
				up.bind("Refresh", function(up) {
					var browseButton, topElement, hoverClass, activeClass, browsePos, browseSize, inputContainer, inputFile, zIndex;

					browseButton = getById(up.settings.browse_button);
					if (browseButton) {
						browsePos = plupload.getPos(browseButton, getById(up.settings.container));
						browseSize = plupload.getSize(browseButton);
						inputContainer = getById('form_' + currentFileId);
						inputFile = getById('input_' + currentFileId);
	
						plupload.extend(inputContainer.style, {
							top : browsePos.y + 'px',
							left : browsePos.x + 'px',
							width : browseSize.w + 'px',
							height : browseSize.h + 'px'
						});
						
						// for IE and WebKit place input element underneath the browse button and route onclick event 
						// TODO: revise when browser support for this feature will change
						if (up.features.triggerDialog) {
							if (plupload.getStyle(browseButton, 'position') === 'static') {
								plupload.extend(browseButton.style, {
									position : 'relative'
								});
							}
							
							zIndex = parseInt(browseButton.style.zIndex, 10);

							if (isNaN(zIndex)) {
								zIndex = 0;
							}

							plupload.extend(browseButton.style, {
								zIndex : zIndex
							});							

							plupload.extend(inputContainer.style, {
								zIndex : zIndex - 1
							});
						}

						/* Since we have to place input[type=file] on top of the browse_button for some browsers (FF, Opera),
						browse_button loses interactivity, here we try to neutralize this issue highlighting browse_button
						with a special class
						TODO: needs to be revised as things will change */
						hoverClass = up.settings.browse_button_hover;
						activeClass = up.settings.browse_button_active;
						topElement = up.features.triggerDialog ? browseButton : inputContainer;
						
						if (hoverClass) {
							plupload.addEvent(topElement, 'mouseover', function() {
								plupload.addClass(browseButton, hoverClass);	
							}, up.id);
							plupload.addEvent(topElement, 'mouseout', function() {
								plupload.removeClass(browseButton, hoverClass);
							}, up.id);
						}
						
						if (activeClass) {
							plupload.addEvent(topElement, 'mousedown', function() {
								plupload.addClass(browseButton, activeClass);	
							}, up.id);
							plupload.addEvent(document.body, 'mouseup', function() {
								plupload.removeClass(browseButton, activeClass);	
							}, up.id);
						}
					}
				});

				// Remove files
				uploader.bind("FilesRemoved", function(up, files) {
					var i, n;

					for (i = 0; i < files.length; i++) {
						n = getById('form_' + files[i].id);
						if (n) {
							n.parentNode.removeChild(n);
						}
					}
				});
				
				uploader.bind("DisableBrowse", function(up, disabled) {
					var input = document.getElementById('input_' + currentFileId);
					if (input) {
						input.disabled = disabled;	
					}
				});
				
				
				// Completely destroy the runtime
				uploader.bind("Destroy", function(up) {
					var name, element, form,
						elements = {
							inputContainer: 'form_' + currentFileId,
							inputFile: 'input_' + currentFileId,	
							browseButton: up.settings.browse_button
						};

					// Unbind event handlers
					for (name in elements) {
						element = getById(elements[name]);
						if (element) {
							plupload.removeAllEvents(element, up.id);
						}
					}
					plupload.removeAllEvents(document.body, up.id);
					
					// Remove mark-up
					plupload.each(fileIds, function(id, i) {
						form = getById('form_' + id);
						if (form) {
							container.removeChild(form);
						}
					});
					
				});

				// Create initial form
				createForm();
			});

			callback({success : true});
		}
	});
})(window, document, plupload);
