<?php
/**
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author	Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
class WFSpellcheckerPluginConfig {
	public static function getConfig( &$settings ){

		$wf = WFEditor::getInstance();
                
                $engine = $wf->getParam('spellchecker.engine', 'browser', 'browser' );
                
                switch($engine) {
                    case 'browser':
                        $languages = '';
                        
                        break;
                    case 'googlespell':
                        $languages = $wf->getParam('spellchecker.googlespell_languages', '');
                        
                        // use a default
                        if (!$languages) {
                            $languages = $wf->getParam('spellchecker.languages', 'English=en', '' );
                        }
                        
                        break;
                    default:
                        $languages = $wf->getParam('spellchecker.languages', 'English=en', '' );
                        break;
                }
                
                // cast as array
                if ($languages) {
                    $languages = (array) $languages;
                }

                if (!empty($languages)) {
                    $settings['spellchecker_languages'] = '+' . implode(',', $languages);
                }

		$settings['spellchecker_engine'] 	= $engine;
		$settings['spellchecker_rpc_url'] 	= JURI::base(true).'/index.php?option=com_jce&view=editor&layout=plugin&plugin=spellchecker&component_id=' . $settings['component_id'];
	}
}
?>