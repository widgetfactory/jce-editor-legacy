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
defined('JPATH_BASE') or die('RESTRICTED');

/**
 * Renders a select element
 */
class JElementLinkSearch extends JElement {

    /**
     * Element type
     *
     * @access	protected
     * @var		string
     */
    var $_name = 'LinkSearch';

    public function fetchElement($name, $value, &$node, $control_name) {
        jimport('joomla.plugin.helper');
        wfimport('admin.helpers.extension');

        $language   = JFactory::getLanguage();
        $plugins    = JPluginHelper::getPlugin('search');

        if (!$value) {
            $value = array();
        } else {
            $value = (array) $value;
        }

        //$html  = '<span style="display:inline-block;"><input class="checkbox-list-toggle-all" type="checkbox"'. $checked .' /><label>'. WFText::_('WF_PROFILES_TOGGLE_ALL') . '</label>'; 
        $html = '<span><ul class="checkbox-list">';

        foreach ($plugins as $item) {
            $plugin = WFExtensionHelper::getPlugin(null, $item->name, 'search');
            
            $extension = 'plg_' . $plugin->folder . '_' . $plugin->element;
            
            $language->load($extension) || $language->load($extension, JPATH_ADMINISTRATOR);
            $language->load($extension . '.sys') || $language->load($extension . '.sys', JPATH_ADMINISTRATOR);

            $checked = (in_array($plugin->element, $value) || empty($value)) ? ' checked="checked"' : '';
            $html   .= '<li><input type="checkbox" name="' . $control_name . '[' . $name . '][]" value="' . $plugin->element . '"' . $checked . ' /><label>' . JText::_($plugin->name) . '</label></li>';
        }

        $html .= '</ul></span>';

        return $html;
    }

}

?>
