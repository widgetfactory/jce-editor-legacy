<?php
/**
 * $Id: default.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
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
defined( 'WF_EDITOR' ) or die('RESTRICTED');

$tabs = WFTabs::getInstance();
?>
<?php echo $tabs->render(); ?>
<div class="mceActionPanel">
	<button type="submit" id="insert" name="insert"><?php echo WFText::_('WF_LABEL_INSERT');?></button>
	<button type="button" id="cancel" name="cancel" onclick="tinyMCEPopup.close();"><?php echo WFText::_('WF_LABEL_CANCEL');?></button>
</div>