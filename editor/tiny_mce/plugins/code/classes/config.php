<?php

/**
 * @version		$Id: config.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
class WFCodePluginConfig {

    public static function getConfig(&$settings) {
        // Get JContentEditor instance
        wfimport('admin.models.editor');
        $model = new WFModelEditor();
        $wf = WFEditor::getInstance();

        if (!in_array('code', $settings['plugins'])) {
            $settings['plugins'][] = 'code';
        }

        $settings['code_php'] = $wf->getParam('editor.allow_php', 0, 0, 'boolean');
        $settings['code_script'] = $wf->getParam('editor.allow_javascript', 0, 0, 'boolean');
        $settings['code_style'] = $wf->getParam('editor.allow_css', 0, 0, 'boolean');

        $settings['code_cdata'] = $wf->getParam('editor.cdata', 1, 1, 'boolean');

        // Invalid Elements
        if ($settings['code_script']) {
            $model->removeKeys($settings['invalid_elements'], 'script');
        }
        if ($settings['code_style']) {
            $model->removeKeys($settings['invalid_elements'], 'style');
        }
    }

}

?>