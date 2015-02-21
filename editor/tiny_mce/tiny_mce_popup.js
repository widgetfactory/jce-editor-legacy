(function () {
    var i, nl = document.getElementsByTagName('script'), base, src, p, li, query = '', it, scripts = [];

    for (i = 0; i < nl.length; i++) {
        src = nl[i].src;

        if (src && src.indexOf("tiny_mce_popup.js") != -1) {
            base = src.substring(0, src.lastIndexOf('/'));

            if ((p = src.indexOf('?')) != -1)
                query = src.substring(p + 1);
        }
    }

    nl = null; // IE leak fix

    function include(u) {
        scripts.push(base + '/classes/' + u);
    }

    function load() {
        var i, html = '';

        for (i = 0; i < scripts.length; i++)
            html += '<script type="text/javascript" src="' + scripts[i] + '"></script>\n';

        document.write(html);
    }

    // tinymce.*
    include('Popup.js');

    load();
}());
