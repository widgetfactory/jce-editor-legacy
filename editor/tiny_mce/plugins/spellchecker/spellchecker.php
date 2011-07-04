<?php
/**
* @version		$Id: spellchecker.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
defined( '_JEXEC' ) or die( 'Restricted access' );

require_once( dirname( __FILE__ ) .DS. 'classes' .DS. 'spellchecker.php' );

$spellchecker = WFSpellcheckerPlugin::getInstance();
?>