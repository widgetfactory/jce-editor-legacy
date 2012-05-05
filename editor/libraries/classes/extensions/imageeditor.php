<?php

/**
 * @package   	JCE
 * @copyright 	Copyright © 2009-2012 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('RESTRICTED');

class WFImageEditorExtension extends WFExtension {

    /**
     * Constructor activating the default information of the class
     *
     * @access	protected
     */
    public function __construct($config = array()) {
        parent::__construct($config);
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
    public static function getInstance($type = 'wf', $config = array()) {
        static $instance;

        if (!is_object($instance)) {
            $editor = parent::loadExtensions(array(
                'types'     => array('imageeditor'),
                'extension' => $type
            ));
            
            if (!isset($config['name'])) {
                $config['name'] = $type;
            }

            $classname = 'WFImageEditorExtension_' . ucfirst($editor);

            if (class_exists($classname)) {
                $instance = new $classname($config);
            } else {
                $instance = new WFImageEditorExtension($config);
            }
        }

        return $instance;
    }

    public function display() {
        parent::display();

        $document = WFDocument::getInstance();

        // Load javascript
        $document->addScript(array('extensions/imageeditor'), 'libraries');

        $params = $this->getParams();

        if (!empty($params)) {
            $document->addScriptDeclaration('WFExtensions.ImageEditor.setParams("' . $this->get('name') . '",' . json_encode($params) . ');');
        }
    }

    /**
     *
     * @param object $player
     * @return
     */
    public function loadTemplate($tpl = '') {
        $path = WF_EDITOR_EXTENSIONS . DS . 'imageeditor' . DS . $this->get('name');

        $output = '';

        $file = 'default.php';

        if ($tpl) {
            $file = 'default_' . $tpl . '.php';
        }

        if (file_exists($path . DS . 'tmpl' . DS . $file)) {
            ob_start();

            include $path . DS . 'tmpl' . DS . $file;

            $output .= ob_get_contents();
            ob_end_clean();
        }

        return $output;
    }
}
