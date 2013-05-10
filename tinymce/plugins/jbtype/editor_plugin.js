(function () {
    tinymce.PluginManager.requireLangPack('jbtype');
    var each = tinymce.each;
    var icons = new Array('jb_info', 'jb_warning', 'jb_film', 'jb_pin', 'jb_lightbulb', 'jb_recycle', 'jb_camera', 'jb_comment', 'jb_chat', 'jb_document', 'jb_accessible', 'jb_star', 'jb_heart', 'jb_previous', 'jb_cart', 'jb_sound', 'jb_new', 'jb_code', 'jb_attachment', 'jb_calculator', 'jb_cut', 'jb_dollar', 'jb_pound', 'jb_euro', 'jb_mail', 'jb_support', 'jb_next');
    var boxes = new Array('jb_blackbox', 'jb_greenbox', 'jb_bluebox', 'jb_redbox', 'jb_yellowbox', 'jb_brownbox', 'jb_purplebox');
    var colours = new Array('jb_black', 'jb_blue', 'jb_red', 'jb_green', 'jb_yellow', 'jb_white', 'jb_brown', 'jb_purple');
    var discs = new Array('jb_bluedisc', 'jb_greendisc', 'jb_reddisc', 'jb_browndisc', 'jb_greydisc', 'jb_charcoaldisc', 'jb_purpledisc', 'jb_orangedisc', 'jb_yellowdisc', 'jb_blackdisc');
    var iconic = new Array('jb_iconic_download', 'jb_iconic_info', 'jb_iconic_star', 'jb_iconic_heart', 'jb_iconic_tag', 'jb_iconic_arrival', 'jb_iconic_truck', 'jb_iconic_arrow', 'jb_iconic_article', 'jb_iconic_email', 'jb_iconic_beaker', 'jb_iconic_bolt', 'jb_iconic_book', 'jb_iconic_box', 'jb_iconic_calendar', 'jb_iconic_comment', 'jb_iconic_tick', 'jb_iconic_cloud', 'jb_iconic_document', 'jb_iconic_image', 'jb_iconic_quote', 'jb_iconic_lightbulb', 'jb_iconic_search', 'jb_iconic_mail', 'jb_iconic_dash', 'jb_iconic_movie');
    tinymce.create('tinymce.plugins.JBType', {
        init: function (ed, url) {
            var t = this;
            t.editor = ed;
            t.url = url;
            
            tinymce.DOM.loadCSS(url + '/css/menu_' + ed.getParam('jbtype_icons', 'coquette') + '.css');
            
            ed.onInit.add(function () {
                ed.dom.loadCSS(url + "/css/content.css");
                ed.formatter.register('jb_dropcap', {
                    inline: 'span',
                    classes: 'jb_dropcap mceItemTypography'
                });
                each(boxes, function (name) {
                    ed.formatter.register(name, {
                        block: 'p',
                        classes: name + ' mceItemTypography'
                    });
                });
                each(icons, function (name) {
                    ed.formatter.register(name, {
                        inline: 'span',
                        classes: name + ' mceItemTypography'
                    });
                });
                each(colours, function (name) {
                    ed.formatter.register(name, {
                        inline: 'span',
                        classes: name + ' mceItemTypography'
                    });
                });
                each(discs, function (name) {
                    ed.formatter.register(name, {
                        inline: 'span',
                        classes: name + ' mceItemTypography'
                    });
                });
                each(iconic, function (name) {
                    ed.formatter.register(name, {
                        inline: 'span',
                        classes: name + ' mceItemTypography'
                    });
                });
            });
            ed.addCommand('mceJBType', function (ui, v) {
                t.addType(v);
            });
            ed.onBeforeSetContent.add(function (ed, o) {
                o.content = o.content.replace(/\{jb_(\w+)\}([^\{]+?)\{\/jb_\1\}/g, function (a, b, c) {
                    if (/(blackbox|greenbox|bluebox|redbox|yellowbox|brownbox|purplebox)/.test(b)) {
                        return '<p class="mceItemTypography jb_' + b + '">' + c + '</p>';
                    }
                    return '<span class="mceItemTypography jb_' + b + '">' + c + '</span>';
                });
            });
            ed.onPostProcess.add(function (ed, o) {
                o.content = o.content.replace(/<(p|span)([^>]+)class="([^"]*)jb_([a-z0-9-_]+)([^"]*)"([^>]*)>([\w\W]+?)<\/\1>/gi, '{jb_$4}$7{/jb_$4}');
            });
            ed.onNodeChange.add(function (ed, cm, n) {
                var c, matches;
                if (c = cm.get('jbtype')) {
                    var formatNames = [];
                    each(c.items, function (item) {
                        formatNames.push(item.value);
                    });
                    matches = ed.formatter.matchAll(formatNames);
                    c.select(matches[0]);
                }
            });
        },
        getInfo: function () {
            return {
                longname: 'JB Type',
                author: 'Ryan Demmer',
                authorurl: 'http://www.joomlacontenteditor.net',
                infourl: 'http://www.joomlabamboo.com/joomla-extensions/jb-type-joomla-typography-plugin',
                version: '2.0.5'
            };
        },
        createControl: function (n, cm) {
            var t = this,
                ed = t.editor;
            switch (n) {
                case 'jbtype':
                    var list = cm.createListBox('jbtype', {
                        title: 'jbtype.desc',
                        onselect: function (v) {
                            if (v) {
                                ed.execCommand('mceJBType', false, v);
                            }
                        }
                    });
                    list.add('jbtype.dropcap', 'jb_dropcap');
                    list.add('jbtype.boxes', '', {
                        'class': 'jb_menu_title'
                    });
                    each(boxes, function (k) {
                        list.add('jbtype.' + k, k, {
                            'class': k
                        });
                    });
                    list.add('jbtype.icons', '', {
                        'class': 'jb_menu_title'
                    });
                    each(icons, function (k) {
                        list.add('jbtype.' + k, k, {
                            'class': 'jb_icons ' + k,
                            icon: k
                        });
                    });
                    list.add('jbtype.iconic', '', {
                        'class': 'jb_menu_title'
                    });
                    each(iconic, function (k) {
                        list.add('jbtype.' + k, k, {
                            'class': 'jb_icons ' + k,
                            icon: k
                        });
                    });
                    list.add('jbtype.discs', '', {
                        'class': 'jb_menu_title'
                    });
                    each(discs, function (k) {
                        list.add('jbtype.' + k, k, {
                            'class': 'jb_icons ' + k,
                            icon: k
                        });
                    });
                    list.add('jbtype.colours', '', {
                        'class': 'jb_menu_title'
                    });
                    each(colours, function (k) {
                        list.add('jbtype.' + k, k, {
                            'class': k
                        });
                    });
                    return list;
                    break;
            }
            return null;
        },
        addType: function (v) {
            var ed = this.editor,
                dom = ed.dom,
                s = ed.selection,
                n = s.getNode();
            switch (v) {
                case 'jb_blackbox':
                case 'jb_greenbox':
                case 'jb_bluebox':
                case 'jb_redbox':
                case 'jb_yellowbox':
                case 'jb_brownbox':
                case 'jb_purplebox':
                    n = s.getNode();
                    if (n.nodeName != 'P') {
                        s.select(dom.getParent(n, 'p'));
                        n.removeAttribute('class');
                        if (n.nodeName == 'SPAN') {
                            dom.remove(n, true);
                        }
                        n = s.getNode();
                    }
                    n.removeAttribute('class');
                    each(dom.select('span.mceItemTypography', n), function (el) {
                        var cls = /jb_([a-z0-9-]+)/.exec(el.className);
                        if (cls) {
                            dom.removeClass(el, cls[0]);
                            dom.removeClass(el, 'mceItemTypography');
                        };

                    });
                    break;
                case 'jb_dropcap':
                    n = s.getNode();
                    if (n.nodeName == 'P') {
                        s.select(n);
                    }
                    if (s.isCollapsed()) {
                        alert(ed.getLang('jbtype.no_selection', 'Please select some text'));
                        return false;
                    }
                    var text = s.getContent({
                        format: 'text'
                    });
                    var dc = text.charAt(0).toUpperCase();
                    s.setContent('<span class="mceItemTypography jb_dropcap">' + dc + '</span>' + text.substring(1));
                    s.collapse();
                    return true;
                    break;
                default:
                    if (s.isCollapsed()) {
                        alert(ed.getLang('jbtype.no_selection', 'Please select some text'));
                        return false;
                    }
                    n.removeAttribute('class');
                    if (n.nodeName == 'SPAN' && !s.isCollapsed()) {
                        s.select(n);
                    }
                    break;
            }
            ed.formatter.apply(v);
            s.collapse();
            ed.addVisual();
        }
    });
    tinymce.PluginManager.add('jbtype', tinymce.plugins.JBType);
})();