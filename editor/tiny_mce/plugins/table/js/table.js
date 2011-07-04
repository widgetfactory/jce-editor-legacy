tinyMCEPopup.requireLangPack();

var TableDialog = {

    settings : {},
    //var action, orgTableWidth, orgTableHeight, dom = tinyMCEPopup.editor.dom;

    init : function() {
        tinyMCEPopup.resizeToInnerSize();
        
        if (!this.settings.file_browser) {
        	$('input.browser').removeClass('browser');
        }

        $.Plugin.init();

        if (this.settings.context == 'merge') {
            return this.initMerge();
        }

        addClassesToList('class', "table_styles");

        switch (this.settings.context) {
            case 'table':
                this.initTable();
                break;
            case 'cell':
                this.initCell();
                break;
            case 'row':
                this.initRow();
                break;
        }

        $('body').addClass(this.settings.context);

    },

    insert : function() {
        switch (this.settings.context) {
            case 'table':
                this.insertTable();
                break;
            case 'cell':
                this.updateCells();
                break;
            case 'row':
                this.updateRows();
                break;
            case 'merge':
                this.merge();
                break;
        }
    },

    initMerge : function() {
        var f = document.forms[0];

        f.numcols.value = tinyMCEPopup.getWindowArg('cols', 1);
        f.numrows.value = tinyMCEPopup.getWindowArg('rows', 1);
    },

    merge : function() {
        var func, f = document.forms[0];

        tinyMCEPopup.restoreSelection();

        func = tinyMCEPopup.getWindowArg('onaction');

        func({
            cols : f.numcols.value,
            rows : f.numrows.value
        });

        tinyMCEPopup.close();
    },

    insertTable : function() {
        var dom = tinyMCEPopup.editor.dom;

        var formObj = document.forms[0];
        var inst = tinyMCEPopup.editor, dom = inst.dom;
        var cols = 2, rows = 2, border = 0, cellpadding = -1, cellspacing = -1, align, width, height, className, caption, frame, rules;
        var html = '', capEl, elm;
        var cellLimit, rowLimit, colLimit;

        tinyMCEPopup.restoreSelection();

        if (!AutoValidator.validate(formObj)) {
            tinyMCEPopup.alert(inst.getLang('invalid_data'));
            return false;
        }

        elm = dom.getParent(inst.selection.getNode(), 'table');

        // Get form data
        cols = formObj.elements['cols'].value;
        rows = formObj.elements['rows'].value;
        border = formObj.elements['border'].value != "" ? formObj.elements['border'].value  : 0;
        cellpadding = formObj.elements['cellpadding'].value != "" ? formObj.elements['cellpadding'].value : "";
        cellspacing = formObj.elements['cellspacing'].value != "" ? formObj.elements['cellspacing'].value : "";
        align = getSelectValue(formObj, "align");
        frame = getSelectValue(formObj, "tframe");
        rules = getSelectValue(formObj, "rules");
        width = formObj.elements['width'].value;
        height = formObj.elements['height'].value;
        bordercolor = formObj.elements['bordercolor'].value;
        bgcolor = formObj.elements['bgcolor'].value;
        className = getSelectValue(formObj, "class");
        id = formObj.elements['id'].value;
        summary = formObj.elements['summary'].value;
        style = formObj.elements['style'].value;
        dir = formObj.elements['dir'].value;
        lang = formObj.elements['lang'].value;
        background = formObj.elements['backgroundimage'].value;
        caption = formObj.elements['caption'].checked;

        cellLimit = tinyMCEPopup.getParam('table_cell_limit', false);
        rowLimit = tinyMCEPopup.getParam('table_row_limit', false);
        colLimit = tinyMCEPopup.getParam('table_col_limit', false);

        // Validate table size
        if (colLimit && cols > colLimit) {
            tinyMCEPopup.alert(inst.getLang('table_dlg.col_limit').replace(/\{\$cols\}/g, colLimit));
            return false;
        } else if (rowLimit && rows > rowLimit) {
            tinyMCEPopup.alert(inst.getLang('table_dlg.row_limit').replace(/\{\$rows\}/g, rowLimit));
            return false;
        } else if (cellLimit && cols * rows > cellLimit) {
            tinyMCEPopup.alert(inst.getLang('table_dlg.cell_limit').replace(/\{\$cells\}/g, cellLimit));
            return false;
        }

        // Update table
        if (action == "update") {
            inst.execCommand('mceBeginUndoLevel');

            dom.setAttrib(elm, 'cellPadding', cellpadding, true);
            dom.setAttrib(elm, 'cellSpacing', cellspacing, true);
            dom.setAttrib(elm, 'border', border);
            dom.setAttrib(elm, 'align', align);
            dom.setAttrib(elm, 'frame', frame);
            dom.setAttrib(elm, 'rules', rules);
            dom.setAttrib(elm, 'class', className);
            dom.setAttrib(elm, 'style', style);
            dom.setAttrib(elm, 'id', id);
            dom.setAttrib(elm, 'summary', summary);
            dom.setAttrib(elm, 'dir', dir);
            dom.setAttrib(elm, 'lang', lang);

            capEl = inst.dom.select('caption', elm)[0];

            if (capEl && !caption)
                capEl.parentNode.removeChild(capEl);

            if (!capEl && caption) {
                capEl = elm.ownerDocument.createElement('caption');

                if (!tinymce.isIE)
                    capEl.innerHTML = '<br _mce_bogus="1"/>';

                elm.insertBefore(capEl, elm.firstChild);
            }

            if (width && inst.settings.inline_styles) {
                dom.setStyle(elm, 'width', width);
                dom.setAttrib(elm, 'width', '');
            } else {
                dom.setAttrib(elm, 'width', width, true);
                dom.setStyle(elm, 'width', '');
            }

            // Remove these since they are not valid XHTML
            dom.setAttrib(elm, 'borderColor', '');
            dom.setAttrib(elm, 'bgColor', '');
            dom.setAttrib(elm, 'background', '');

            if (height && inst.settings.inline_styles) {
                dom.setStyle(elm, 'height', height);
                dom.setAttrib(elm, 'height', '');
            } else {
                dom.setAttrib(elm, 'height', height, true);
                dom.setStyle(elm, 'height', '');
            }

            if (background != '')
                elm.style.backgroundImage = "url('" + background + "')";
            else
                elm.style.backgroundImage = '';

            /*		if (tinyMCEPopup.getParam("inline_styles")) {
             if (width != '')
             elm.style.width = getCSSSize(width);
             }*/

            if (bordercolor != "") {
                elm.style.borderColor = bordercolor;
                elm.style.borderStyle = elm.style.borderStyle == "" ? "solid" : elm.style.borderStyle;
                elm.style.borderWidth = border == "" ? "1px" : border;
            } else
                elm.style.borderColor = '';

            elm.style.backgroundColor = bgcolor;
            elm.style.height = getCSSSize(height);

            inst.addVisual();

            // Fix for stange MSIE align bug
            //elm.outerHTML = elm.outerHTML;

            inst.nodeChanged();
            inst.execCommand('mceEndUndoLevel');

            // Repaint if dimensions changed
            if (formObj.width.value != orgTableWidth || formObj.height.value != orgTableHeight)
                inst.execCommand('mceRepaint');

            tinyMCEPopup.close();
            return true;
        }

        // Create new table
        html += '<table';

        html += this.makeAttrib('id', id);
        html += this.makeAttrib('border', border);
        html += this.makeAttrib('cellpadding', cellpadding);
        html += this.makeAttrib('cellspacing', cellspacing);
        html += this.makeAttrib('_mce_new', '1');

        if (width && inst.settings.inline_styles) {
            if (style)
                style += '; ';

            // Force px
            if (/^[0-9\.]+$/.test(width))
                width += 'px';

            style += 'width: ' + width;
        } else
            html += this.makeAttrib('width', width);

        /*	if (height) {
        if (style)
        style += '; ';

        style += 'height: ' + height;
        }*/

        //html += this.makeAttrib('height', height);
        //html += this.makeAttrib('bordercolor', bordercolor);
        //html += this.makeAttrib('bgcolor', bgcolor);
        html += this.makeAttrib('align', align);
        html += this.makeAttrib('frame', frame);
        html += this.makeAttrib('rules', rules);
        html += this.makeAttrib('class', className);
        html += this.makeAttrib('style', style);
        html += this.makeAttrib('summary', summary);
        html += this.makeAttrib('dir', dir);
        html += this.makeAttrib('lang', lang);
        html += '>';

        if (caption) {
            if (!tinymce.isIE)
                html += '<caption><br _mce_bogus="1"/></caption>';
            else
                html += '<caption></caption>';
        }

        for (var y=0; y<rows; y++) {
            html += "<tr>";

            for (var x=0; x<cols; x++) {
                if (!tinymce.isIE)
                    html += '<td><br _mce_bogus="1"/></td>';
                else
                    html += '<td></td>';
            }

            html += "</tr>";
        }

        html += "</table>";

        inst.execCommand('mceBeginUndoLevel');

        // Move table
        if (inst.settings.fix_table_elements) {
            var patt = '';

            inst.focus();
            inst.selection.setContent('<br class="_mce_marker" />');

            tinymce.each('h1,h2,h3,h4,h5,h6,p'.split(','), function(n) {
                if (patt)
                    patt += ',';

                patt += n + ' ._mce_marker';
            });

            tinymce.each(inst.dom.select(patt), function(n) {
                inst.dom.split(inst.dom.getParent(n, 'h1,h2,h3,h4,h5,h6,p'), n);
            });

            dom.setOuterHTML(dom.select('br._mce_marker')[0], html);
        } else
            inst.execCommand('mceInsertContent', false, html);

        tinymce.each(dom.select('table[_mce_new]'), function(node) {
            var td = dom.select('td', node);

            inst.selection.select(td[0], true);
            inst.selection.collapse();

            dom.setAttrib(node, '_mce_new', '');
        });

        inst.addVisual();
        inst.execCommand('mceEndUndoLevel');

        tinyMCEPopup.close();
    },

    updateCells : function() {
        var self = this, el, ed = tinyMCEPopup.editor, inst = ed, tdElm, trElm, tableElm, formObj = document.forms[0];

        tinyMCEPopup.restoreSelection();
        el = ed.selection.getStart();
        tdElm = ed.dom.getParent(el, "td,th");
        trElm = ed.dom.getParent(el, "tr");
        tableElm = ed.dom.getParent(el, "table");

        // Cell is selected
        if (ed.dom.hasClass(tdElm, 'mceSelected')) {
            // Update all selected sells
            tinymce.each(ed.dom.select('td.mceSelected,th.mceSelected'), function(td) {
            	self.updateCell(td);
            });

            ed.addVisual();
            ed.nodeChanged();
            inst.execCommand('mceEndUndoLevel');
            tinyMCEPopup.close();
            return;
        }

        ed.execCommand('mceBeginUndoLevel');

        switch (getSelectValue(formObj, 'action')) {
            case "cell":
                var celltype = getSelectValue(formObj, 'celltype');
                var scope = getSelectValue(formObj, 'scope');

                function doUpdate(s) {
                    if (s) {
                    	self.updateCell(tdElm);

                        ed.addVisual();
                        ed.nodeChanged();
                        inst.execCommand('mceEndUndoLevel');
                        tinyMCEPopup.close();
                    }
                };

                if (ed.getParam("accessibility_warnings", 1)) {
                    if (celltype == "th" && scope == "")
                        tinyMCEPopup.confirm(ed.getLang('table_dlg.missing_scope', '', true), doUpdate);
                    else
                        doUpdate(1);

                    return;
                }

                this.updateCell(tdElm);
                break;

            case "row":
                var cell = trElm.firstChild;

                if (cell.nodeName != "TD" && cell.nodeName != "TH")
                    cell = this.nextCell(cell);

                do {
                    cell = this.updateCell(cell, true);
                } while ((cell = this.nextCell(cell)) != null);

                break;

            case "all":
                var rows = tableElm.getElementsByTagName("tr");

                for (var i=0; i<rows.length; i++) {
                    var cell = rows[i].firstChild;

                    if (cell.nodeName != "TD" && cell.nodeName != "TH")
                        cell = this.nextCell(cell);

                    do {
                        cell = this.updateCell(cell, true);
                    } while ((cell = this.nextCell(cell)) != null);
                }

                break;
        }

        ed.addVisual();
        ed.nodeChanged();
        inst.execCommand('mceEndUndoLevel');
        tinyMCEPopup.close();
    },

    updateRow : function(tr_elm, skip_id, skip_parent) {
        var inst = tinyMCEPopup.editor, dom = tinyMCEPopup.dom;
        var formObj = document.forms[0];
        var dom = inst.dom;
        var curRowType = tr_elm.parentNode.nodeName.toLowerCase();
        var rowtype = getSelectValue(formObj, 'rowtype');
        var doc = inst.getDoc();

        // Update row element
        if (!skip_id)
            tr_elm.setAttribute('id', formObj.id.value);

        tr_elm.setAttribute('align', getSelectValue(formObj, 'align'));
        tr_elm.setAttribute('vAlign', getSelectValue(formObj, 'valign'));
        tr_elm.setAttribute('lang', formObj.lang.value);
        tr_elm.setAttribute('dir', getSelectValue(formObj, 'dir'));
        tr_elm.setAttribute('style', dom.serializeStyle(dom.parseStyle(formObj.style.value)));
        dom.setAttrib(tr_elm, 'class', getSelectValue(formObj, 'class'));

        // Clear deprecated attributes
        tr_elm.setAttribute('background', '');
        tr_elm.setAttribute('bgColor', '');
        tr_elm.setAttribute('height', '');

        // Set styles
        tr_elm.style.height = getCSSSize(formObj.height.value);
        tr_elm.style.backgroundColor = formObj.bgcolor.value;

        if (formObj.backgroundimage.value != "")
            tr_elm.style.backgroundImage = "url('" + formObj.backgroundimage.value + "')";
        else
            tr_elm.style.backgroundImage = '';

        // Setup new rowtype
        if (curRowType != rowtype && !skip_parent) {
            // first, clone the node we are working on
            var newRow = tr_elm.cloneNode(1);

            // next, find the parent of its new destination (creating it if necessary)
            var theTable = dom.getParent(tr_elm, "table");
            var dest = rowtype;
            var newParent = null;
            for (var i = 0; i < theTable.childNodes.length; i++) {
                if (theTable.childNodes[i].nodeName.toLowerCase() == dest)
                    newParent = theTable.childNodes[i];
            }

            if (newParent == null) {
                newParent = doc.createElement(dest);

                if (dest == "thead") {
                    if (theTable.firstChild.nodeName == 'CAPTION')
                        inst.dom.insertAfter(newParent, theTable.firstChild);
                    else
                        theTable.insertBefore(newParent, theTable.firstChild);
                } else
                    theTable.appendChild(newParent);
            }

            // append the row to the new parent
            newParent.appendChild(newRow);

            // remove the original
            tr_elm.parentNode.removeChild(tr_elm);

            // set tr_elm to the new node
            tr_elm = newRow;
        }

        dom.setAttrib(tr_elm, 'style', dom.serializeStyle(dom.parseStyle(tr_elm.style.cssText)));
    },

    makeAttrib : function(attrib, value) {
        var formObj = document.forms[0];
        var valueElm = formObj.elements[attrib];

        if (typeof(value) == "undefined" || value == null) {
            value = "";

            if (valueElm)
                value = valueElm.value;
        }

        if (value == "")
            return "";

        // XML encode it
        value = value.replace(/&/g, '&amp;');
        value = value.replace(/\"/g, '&quot;');
        value = value.replace(/</g, '&lt;');
        value = value.replace(/>/g, '&gt;');

        return ' ' + attrib + '="' + value + '"';
    },

    initTable : function() {
    	var ed = tinyMCEPopup.editor, dom = tinyMCEPopup.dom;
    	
        var cols = 2, rows = 2, border = tinyMCEPopup.getParam('table_default_border', '0'), cellpadding = tinyMCEPopup.getParam('table_default_cellpadding', ''), cellspacing = tinyMCEPopup.getParam('table_default_cellspacing', '');
        var align = "", width = "", height = "", bordercolor = "", bgcolor = "", className = "";
        var id = "", summary = "", style = "", dir = "", lang = "", background = "", bgcolor = "", bordercolor = "", rules = "", frame = "";
        var inst = tinyMCEPopup.editor, dom = inst.dom;
        var formObj = document.forms[0];
        var elm = dom.getParent(inst.selection.getNode(), "table");

        action = tinyMCEPopup.getWindowArg('action');

        if (!action)
            action = elm ? "update" : "insert";

        if (elm && action != "insert") {
            var rowsAr = elm.rows;
            var cols = 0;
            for (var i=0; i<rowsAr.length; i++)
                if (rowsAr[i].cells.length > cols)
                    cols = rowsAr[i].cells.length;

            cols = cols;
            rows = rowsAr.length;

            st = dom.parseStyle(dom.getAttrib(elm, "style"));
            border = trimSize(getStyle(elm, 'border', 'borderWidth'));
            cellpadding = dom.getAttrib(elm, 'cellpadding', "");
            cellspacing = dom.getAttrib(elm, 'cellspacing', "");
            width = trimSize(getStyle(elm, 'width', 'width'));
            height = trimSize(getStyle(elm, 'height', 'height'));
            bordercolor = convertRGBToHex(getStyle(elm, 'bordercolor', 'borderLeftColor'));
            bgcolor = convertRGBToHex(getStyle(elm, 'bgcolor', 'backgroundColor'));
            align = dom.getAttrib(elm, 'align', align);
            frame = dom.getAttrib(elm, 'frame');
            rules = dom.getAttrib(elm, 'rules');
            className = tinymce.trim(dom.getAttrib(elm, 'class').replace(/mceItem.+/g, ''));
            id = dom.getAttrib(elm, 'id');
            summary = dom.getAttrib(elm, 'summary');
            style = dom.serializeStyle(st);
            dir = dom.getAttrib(elm, 'dir');
            lang = dom.getAttrib(elm, 'lang');
            background = getStyle(elm, 'background', 'backgroundImage').replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)", 'gi'), "$1");
            formObj.caption.checked = elm.getElementsByTagName('caption').length > 0;

            orgTableWidth = width;
            orgTableHeight = height;

            action = "update";
            $('#insert').button('option', 'label', ed.getLang('update', 'Update'));
        }

        // Update form
        selectByValue(formObj, 'align', align);
        selectByValue(formObj, 'tframe', frame);
        selectByValue(formObj, 'rules', rules);
        selectByValue(formObj, 'class', className, true, true);
        formObj.cols.value = cols;
        formObj.rows.value = rows;
        formObj.border.value = border;
        formObj.cellpadding.value = cellpadding;
        formObj.cellspacing.value = cellspacing;
        formObj.width.value = width;
        formObj.height.value = height;
        formObj.bordercolor.value = bordercolor;
        formObj.bgcolor.value = bgcolor;
        formObj.id.value = id;
        formObj.summary.value = summary;
        formObj.style.value = style;
        formObj.dir.value = dir;
        formObj.lang.value = lang;
        formObj.backgroundimage.value = background;

        updateColor('bordercolor_pick', 'bordercolor');
        updateColor('bgcolor_pick', 'bgcolor');

        // Resize some elements
        if (isVisible('backgroundimagebrowser'))
            document.getElementById('backgroundimage').style.width = '180px';

        // Disable some fields in update mode
        if (action == "update") {
            formObj.cols.disabled = true;
            formObj.rows.disabled = true;
        }
    },

    initRow : function() {
        var inst = tinyMCEPopup.editor;
        var dom = inst.dom;
        var trElm = dom.getParent(inst.selection.getStart(), "tr");
        var formObj = document.forms[0];
        var st = dom.parseStyle(dom.getAttrib(trElm, "style"));

        // Get table row data
        var rowtype = trElm.parentNode.nodeName.toLowerCase();
        var align = dom.getAttrib(trElm, 'align');
        var valign = dom.getAttrib(trElm, 'valign');
        var height = trimSize(getStyle(trElm, 'height', 'height'));
        var className = dom.getAttrib(trElm, 'class');
        var bgcolor = convertRGBToHex(getStyle(trElm, 'bgcolor', 'backgroundColor'));
        var backgroundimage = getStyle(trElm, 'background', 'backgroundImage').replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)", 'gi'), "$1");
        var id = dom.getAttrib(trElm, 'id');
        var lang = dom.getAttrib(trElm, 'lang');
        var dir = dom.getAttrib(trElm, 'dir');

        selectByValue(formObj, 'rowtype', rowtype);

        // Any cells selected
        if (dom.select('td.mceSelected,th.mceSelected', trElm).length == 0) {

            formObj.bgcolor.value = bgcolor;
            formObj.backgroundimage.value = backgroundimage;
            formObj.height.value = height;
            formObj.id.value = id;
            formObj.lang.value = lang;
            formObj.style.value = dom.serializeStyle(st);
            selectByValue(formObj, 'align', align);
            selectByValue(formObj, 'valign', valign);
            selectByValue(formObj, 'class', className, true, true);
            selectByValue(formObj, 'dir', dir);

            // Resize some elements
            if (isVisible('backgroundimagebrowser'))
                document.getElementById('backgroundimage').style.width = '180px';

            updateColor('bgcolor_pick', 'bgcolor');
            
            $('#insert').button('option', 'label', ed.getLang('update', 'Update'));
        } else
            tinyMCEPopup.dom.hide('action');
    },

    updateRows : function() {
        var self = this, inst = tinyMCEPopup.editor, dom = inst.dom, trElm, tableElm, formObj = document.forms[0];
        var action = getSelectValue(formObj, 'action');

        tinyMCEPopup.restoreSelection();
        trElm = dom.getParent(inst.selection.getStart(), "tr");
        tableElm = dom.getParent(inst.selection.getStart(), "table");

        // Update all selected rows
        if (dom.select('td.mceSelected,th.mceSelected', trElm).length > 0) {
            tinymce.each(tableElm.rows, function(tr) {
                var i;

                for (i = 0; i < tr.cells.length; i++) {
                    if (dom.hasClass(tr.cells[i], 'mceSelected')) {
                        self.updateRow(tr, true);
                        return;
                    }
                }
            });

            inst.addVisual();
            inst.nodeChanged();
            inst.execCommand('mceEndUndoLevel');
            tinyMCEPopup.close();
            return;
        }

        inst.execCommand('mceBeginUndoLevel');

        switch (action) {
            case "row":
                this.updateRow(trElm);
                break;

            case "all":
                var rows = tableElm.getElementsByTagName("tr");

                for (var i=0; i<rows.length; i++)
                    this.updateRow(rows[i], true);

                break;

            case "odd":
            case "even":
                var rows = tableElm.getElementsByTagName("tr");

                for (var i=0; i<rows.length; i++) {
                    if ((i % 2 == 0 && action == "odd") || (i % 2 != 0 && action == "even"))
                        this.updateRow(rows[i], true, true);
                }

                break;
        }

        inst.addVisual();
        inst.nodeChanged();
        inst.execCommand('mceEndUndoLevel');
        tinyMCEPopup.close();
    },

    initCell : function() {
        ed = tinyMCEPopup.editor;

        var inst = ed;
        var tdElm = ed.dom.getParent(ed.selection.getStart(), "td,th");
        var formObj = document.forms[0];
        var st = ed.dom.parseStyle(ed.dom.getAttrib(tdElm, "style"));

        // Get table cell data
        var celltype = tdElm.nodeName.toLowerCase();
        var align = ed.dom.getAttrib(tdElm, 'align');
        var valign = ed.dom.getAttrib(tdElm, 'valign');
        var width = trimSize(getStyle(tdElm, 'width', 'width'));
        var height = trimSize(getStyle(tdElm, 'height', 'height'));
        var bordercolor = convertRGBToHex(getStyle(tdElm, 'bordercolor', 'borderLeftColor'));
        var bgcolor = convertRGBToHex(getStyle(tdElm, 'bgcolor', 'backgroundColor'));
        var className = ed.dom.getAttrib(tdElm, 'class');
        var backgroundimage = getStyle(tdElm, 'background', 'backgroundImage').replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)", 'gi'), "$1");
        var id = ed.dom.getAttrib(tdElm, 'id');
        var lang = ed.dom.getAttrib(tdElm, 'lang');
        var dir = ed.dom.getAttrib(tdElm, 'dir');
        var scope = ed.dom.getAttrib(tdElm, 'scope');

        if (!ed.dom.hasClass(tdElm, 'mceSelected')) {
            formObj.bordercolor.value = bordercolor;
            formObj.bgcolor.value = bgcolor;
            formObj.backgroundimage.value = backgroundimage;
            formObj.width.value = width;
            formObj.height.value = height;
            formObj.id.value = id;
            formObj.lang.value = lang;
            formObj.style.value = ed.dom.serializeStyle(st);
            selectByValue(formObj, 'align', align);
            selectByValue(formObj, 'valign', valign);
            selectByValue(formObj, 'class', className, true, true);
            selectByValue(formObj, 'celltype', celltype);
            selectByValue(formObj, 'dir', dir);
            selectByValue(formObj, 'scope', scope);

            // Resize some elements
            if (isVisible('backgroundimagebrowser'))
                document.getElementById('backgroundimage').style.width = '180px';

            updateColor('bordercolor_pick', 'bordercolor');
            updateColor('bgcolor_pick', 'bgcolor');
            
            $('#insert').button('option', 'label', ed.getLang('update', 'Update'));
        } else
            tinyMCEPopup.dom.hide('action');
    },

    updateCell : function(td, skip_id) {
    	var ed = tinyMCEPopup.editor, dom = ed.dom;
    	
    	var inst = ed;
        var formObj = document.forms[0];
        var curCellType = td.nodeName.toLowerCase();
        var celltype = getSelectValue(formObj, 'celltype');
        var doc = inst.getDoc();
        var dom = ed.dom;

        if (!skip_id)
            td.setAttribute('id', formObj.id.value);

        td.setAttribute('align', formObj.align.value);
        td.setAttribute('vAlign', formObj.valign.value);
        td.setAttribute('lang', formObj.lang.value);
        td.setAttribute('dir', getSelectValue(formObj, 'dir'));
        td.setAttribute('style', ed.dom.serializeStyle(ed.dom.parseStyle(formObj.style.value)));
        td.setAttribute('scope', formObj.scope.value);
        ed.dom.setAttrib(td, 'class', getSelectValue(formObj, 'class'));

        // Clear deprecated attributes
        ed.dom.setAttrib(td, 'width', '');
        ed.dom.setAttrib(td, 'height', '');
        ed.dom.setAttrib(td, 'bgColor', '');
        ed.dom.setAttrib(td, 'borderColor', '');
        ed.dom.setAttrib(td, 'background', '');

        // Set styles
        td.style.width = getCSSSize(formObj.width.value);
        td.style.height = getCSSSize(formObj.height.value);
        if (formObj.bordercolor.value != "") {
            td.style.borderColor = formObj.bordercolor.value;
            td.style.borderStyle = td.style.borderStyle == "" ? "solid" : td.style.borderStyle;
            td.style.borderWidth = td.style.borderWidth == "" ? "1px" : td.style.borderWidth;
        } else
            td.style.borderColor = '';

        td.style.backgroundColor = formObj.bgcolor.value;

        if (formObj.backgroundimage.value != "")
            td.style.backgroundImage = "url('" + formObj.backgroundimage.value + "')";
        else
            td.style.backgroundImage = '';

        if (curCellType != celltype) {
            // changing to a different node type
            var newCell = doc.createElement(celltype);

            for (var c=0; c<td.childNodes.length; c++)
                newCell.appendChild(td.childNodes[c].cloneNode(1));

            for (var a=0; a<td.attributes.length; a++)
                ed.dom.setAttrib(newCell, td.attributes[a].name, ed.dom.getAttrib(td, td.attributes[a].name));

            td.parentNode.replaceChild(newCell, td);
            td = newCell;
        }

        dom.setAttrib(td, 'style', dom.serializeStyle(dom.parseStyle(td.style.cssText)));

        return td;
    },

    nextCell : function(elm) {
        while ((elm = elm.nextSibling) != null) {
            if (elm.nodeName == "TD" || elm.nodeName == "TH")
                return elm;
        }

        return null;
    },

    changedSize : function() {
        var formObj = document.forms[0];
        var st = tinyMCEPopup.dom.parseStyle(formObj.style.value);

        /*	var width = formObj.width.value;
         if (width != "")
         st['width'] = tinyMCEPopup.getParam("inline_styles") ? getCSSSize(width) : "";
         else
         st['width'] = "";*/

        var height = formObj.height.value;
        if (height != "")
            st['height'] = getCSSSize(height);
        else
            st['height'] = "";

        formObj.style.value = tinyMCEPopup.dom.serializeStyle(st);
    },

    changedBackgroundImage : function() {
        var formObj = document.forms[0];
        var st = tinyMCEPopup.dom.parseStyle(formObj.style.value);

        st['background-image'] = "url('" + formObj.backgroundimage.value + "')";

        formObj.style.value = dom.serializeStyle(st);
    },

    changedBorder : function() {
        var formObj = document.forms[0];
        var st = dom.parseStyle(formObj.style.value);

        // Update border width if the element has a color
        if (formObj.border.value != "" && formObj.bordercolor.value != "")
            st['border-width'] = formObj.border.value + "px";

        formObj.style.value = dom.serializeStyle(st);
    },

    changedColor : function() {
        var dom = tinyMCEPopup.editor.dom;
        
    	var formObj = document.forms[0];
        var st = dom.parseStyle(formObj.style.value);

        st['background-color'] = formObj.bgcolor.value;

        if (formObj.bordercolor.value != "") {
            st['border-color'] = formObj.bordercolor.value;

            // Add border-width if it's missing
            if (!st['border-width'])
                st['border-width'] = formObj.border.value == "" ? "1px" : formObj.border.value + "px";
        }

        formObj.style.value = dom.serializeStyle(st);
    },

    changedStyle : function() {
        var formObj = document.forms[0];
        var st = dom.parseStyle(formObj.style.value);

        if (st['background-image'])
            formObj.backgroundimage.value = st['background-image'].replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)", 'gi'), "$1");
        else
            formObj.backgroundimage.value = '';

        if (st['width'])
            formObj.width.value = trimSize(st['width']);

        if (st['height'])
            formObj.height.value = trimSize(st['height']);

        if (st['background-color']) {
            formObj.bgcolor.value = st['background-color'];
            updateColor('bgcolor_pick','bgcolor');
        }

        if (st['border-color']) {
            formObj.bordercolor.value = st['border-color'];
            updateColor('bordercolor_pick','bordercolor');
        }
    }

};
tinyMCEPopup.onInit.add(TableDialog.init, TableDialog);
