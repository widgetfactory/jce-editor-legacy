<?php
/**
 * $Id: source.php 211 2011-06-05 12:28:14Z happy_noodle_boy $
 * @package     JCE SearchReplace
 * @copyright 	Copyright (C) 2005 - 2010 Ryan Demmer. All rights reserved.
 * @copyright 	Copyright (C) 2010 Moxiecode Systems AB. All rights reserved.
 * @author		Ryan Demmer
 * @author		Moxiecode
 * @license 	http://www.gnu.org/copyleft/lgpl.html GNU/LGPL, see licence.txt
 * JCE is free software. This version may have been modified pursuant
 * to the GNU Lesser General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU Lesser General Public License or
 * other free or open source software licenses.
 */
defined( '_JEXEC' ) or die('RESTRICTED');

require_once(dirname( __FILE__ ).DS.'classes'.DS.'source.php');

$plugin = WFSourcePlugin::getInstance();
$plugin->execute();
?>