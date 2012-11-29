<?php
/**
* @version		$Id: config.php 257 2011-06-30 11:37:36Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
class WFAdvlistPluginConfig {
	public static function getConfig( &$settings ){
		$wf = WFEditor::getInstance();
                
                $number = $wf->getParam('list.number_styles', 'default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman', 'default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman');
		$bullet = $wf->getParam('list.bullet_styles', 'default,circle,disc,square', 'default,circle,disc,square');
                
                if ($number) {
                    $items = array();
                    
                    foreach(explode(',', $number) as $item) {
                        $title = $item == 'default' ? 'def' : str_replace('-', '_', $item);
                        $style = $item == 'default' ? '' : $item;
                        
                        $items[] = array('title' => 'advlist.' . $title, 'styles' => array('listStyleType' => $style));
                    }
                    
                    $settings['advlist_number_styles'] 	= json_encode($items);
                }
                
                if ($bullet) {
                    $items = array();
                    
                    foreach(explode(',', $bullet) as $item) {
                        $title = $item == 'default' ? 'def' : str_replace('-', '_', $item);
                        $style = $item == 'default' ? '' : $item;
                        
                        $items[] = array('title' => 'advlist.' . $title, 'styles' => array('listStyleType' => $style));
                    }
                    
                    $settings['advlist_bullet_styles'] 	= json_encode($items);
                }
	}
}
?>
