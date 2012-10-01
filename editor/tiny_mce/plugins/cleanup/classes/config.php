<?php

/**
 * @package     JCE
 * @copyright   Copyright (C) 2005 - 2011 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license     GNU/GPL 2 or later
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
class WFCleanupPluginConfig {

    private static $invalid_elements = array('iframe', 'object', 'param', 'embed', 'audio', 'video', 'source', 'script', 'style', 'applet', 'body', 'bgsound', 'base', 'basefont', 'frame', 'frameset', 'head', 'html', 'id', 'ilayer', 'layer', 'link', 'meta', 'name', 'title', 'xml');

    public static function getConfig(&$settings) {
        $wf = WFEditor::getInstance();
        wfimport('admin.models.editor');
        $model = new WFModelEditor();

        $settings['cleanup_pluginmode'] = $wf->getParam('cleanup.pluginmode', 0, 0, 'boolean');
        $settings['verify_html'] = $wf->getParam('editor.verify_html', 0, 1, 'boolean');

        // set schema
        $settings['schema'] = $wf->getParam('editor.schema', 'html4', 'html4');

        // Get Extended elements
        $settings['extended_valid_elements'] = $wf->getParam('editor.extended_elements', '', '');
        // Configuration list of invalid elements as array
        $settings['invalid_elements'] = explode(',', $wf->getParam('editor.invalid_elements', '', ''));

        // Add elements to invalid list (removed by plugin)
        $model->addKeys($settings['invalid_elements'], self::$invalid_elements);

        // remove extended_valid_elements
        if ($settings['extended_valid_elements']) {
            preg_match_all('#(\w+)(\[([^\]]+)\])?#', $settings['extended_valid_elements'], $extended);

            if ($extended && count($extended) > 1) {
                $settings['invalid_elements'] = array_diff($settings['invalid_elements'], $extended[1]);
            }
        }

        // remove it if it is the same as the default
        if ($settings['invalid_elements'] === self::$invalid_elements) {
            $settings['invalid_elements'] = array();
        }

        $settings['invalid_attributes'] = $wf->getParam('editor.invalid_attributes', 'dynsrc,lowsrc', 'dynsrc,lowsrc', 'string', true);
        $settings['invalid_attribute_values'] = $wf->getParam('editor.invalid_attribute_values', '', '', 'string', true);
    }

}

?>