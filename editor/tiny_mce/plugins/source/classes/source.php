<?php

/**
 * @version		$Id: source.php 226 2011-06-13 09:59:05Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
require_once (WF_EDITOR_LIBRARIES . '/classes/plugin.php');

final class WFSourcePlugin extends WFEditorPlugin {

    /**
     * Constructor activating the default information of the class
     *
     * @access	protected
     */
    function __construct() {
        parent::__construct();
    }

    /**
     * Returns a reference to a plugin object
     *
     * This method must be invoked as:
     * 		<pre>  $advlink =AdvLink::getInstance();</pre>
     *
     * @access	public
     * @return	JCE  The editor object.
     * @since	1.5
     */
    public function & getInstance() {
        static $instance;

        if (!is_object($instance)) {
            $instance = new WFSourcePlugin();
        }
        return $instance;
    }

    public function display() {
        $document = WFDocument::getInstance();

        $view = $this->getView();

        $view->addTemplatePath(WF_EDITOR_PLUGIN . '/tmpl');

        $document->setTitle(WFText::_('WF_' . strtoupper($this->getName() . '_TITLE')));

        $theme  = $this->getParam('source.theme', 'textmate');
        //$editor = 'codemirror';
        
        $document->addScript(array('tiny_mce_popup'), 'tiny_mce');
        $document->addScript(array('editor', 'format'), 'plugins');
        $document->addStyleSheet(array('editor'), 'plugins');
        
        $document->addScript(array('codemirror-compressed'), 'jce.tiny_mce.plugins.source.js.codemirror');
        $document->addStyleSheet(array('codemirror', 'theme/' . $theme), 'jce.tiny_mce.plugins.source.css.codemirror');
        
        /*switch ($editor) {
            case 'ace':
                $document->addScript(array('ace', 'mode-html'), 'jce.tiny_mce.plugins.source.js.ace');
                
                if ($theme != 'textmate') {
                    $document->addScript(array('theme-' . $theme), 'jce.tiny_mce.plugins.source.js.ace');
                }
                break;
            case 'codemirror':
                $document->addScript(array('codemirror-compressed'), 'jce.tiny_mce.plugins.source.js.codemirror');
                $document->addStyleSheet(array('codemirror', 'theme/' . $theme), 'jce.tiny_mce.plugins.source.css.codemirror');

                break;
        }*/
    }
}
