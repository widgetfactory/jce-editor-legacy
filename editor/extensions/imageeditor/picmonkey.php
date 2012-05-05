<?php

/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('RESTRICTED');

class WFImageEditorExtension_Picmonkey extends WFImageEditorExtension {

    public function display() {
        parent::display();

        $document = WFDocument::getInstance();

        $document->addScript(array('tiny_mce_popup'), 'tiny_mce');
        $document->addScript(array('jquery/jquery-' . WF_JQUERY . '.min.js'), 'libraries');
        $document->addScript(array('plugin'), 'libraries');

        $document->addScript('picmonkey', 'extensions/imageeditor/picmonkey/js');

        $document->addScriptDeclaration('tinyMCEPopup.onInit.add(WFImageEditor.picmonkey.init, WFImageEditor.picmonkey);');
    }

    public function isEnabled() {
        $plugin = WFEditorPlugin::getInstance();
        return $plugin->checkAccess('imageeditor.picmonkey.enable', 1);
    }

    public function getParams() {
        $plugin = WFEditorPlugin::getInstance();
        $token  = WFToken::getToken();

        $url    = JURI::root() . 'index.php?option=com_jce&view=editor&layout=plugin&plugin=' . $plugin->getName() . '&dialog=editor&' . $token . '=1';

        return array(
            '_apikey' => '00112233445566778899aabbccddeeff',
            '_export' => $url . '&format=raw&action=saveImage',
            '_export_agent' => 'server',
            '_export_method' => 'POST',
            '_export_field' => 'data'
        );
    }

    public function save() {
        WFToken::checkToken() or die('RESTRICTED');

        return file_get_contents(JRequest::getVar('_export'));
    }

}