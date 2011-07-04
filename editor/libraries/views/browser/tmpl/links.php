<?php
/**
* $Id: links.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
defined('_JEXEC') or die('ERROR_403');
?>
<div id="link-browser">
	<fieldset>
		<legend><?php echo WFText::_('WF_LABEL_LINKBROWSER');?></legend>
		<div id="link-options" class="tree">
			<ul class="root"><?php echo $this->list;?></ul>
		</div>
	</fieldset>
</div>
