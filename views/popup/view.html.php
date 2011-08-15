<?php
/**
 * @version		$Id: view.html.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package		Joomla Content Editor (JCE)
 * @copyright	Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @license		GNU/GPL
 * This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

jimport('joomla.application.component.view');

class WFViewPopup extends JView
{
    function display($tpl = null)
    {
        $app = JFactory::getApplication();
		
		JHTML::_('behavior.mootools');
		
		$this->document->addScript(JURI::root(true) . '/components/com_jce/media/js/popup.js');
		$this->document->addStylesheet(JURI::root(true) . '/components/com_jce/media/css/popup.css');

		// Get variables
        $img 	= JRequest::getVar('img');
        $title 	= JRequest::getWord('title');
        $mode 	= JRequest::getInt('mode', '0');
        $click 	= JRequest::getInt('click', '0');
        $print 	= JRequest::getInt('print', '0');

        $width 	= JRequest::getInt('w', JRequest::getInt('width', ''));
        $height = JRequest::getInt('h', JRequest::getInt('height', ''));

		// Cleanup img variable
		$img 	= preg_replace('/[^a-z\.\/_-]/i', '', $img);
		
		$title 	= isset($title) ? str_replace('_', ' ', $title) : basename($img);
		// img src must be passed
		if ($img) {
			$features = array (
	        	'img'	=>	str_replace(JURI::root(), '', $img),
	        	'title'	=>	$title,
				'alt'	=>	$title,
	        	'mode'	=>	$mode,
	        	'click'	=>	$click,
	        	'print'	=>	$print,
	        	'width'	=>	$width,
	        	'height'=>	$height
        	);

        	$this->assign('features', $features);
		} else {
			$app->redirect('index.php');
		}
		
		parent::display($tpl);	
    }
}
?>
