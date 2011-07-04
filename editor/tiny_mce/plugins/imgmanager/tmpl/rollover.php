<?php
/**
 * @version		$Id: rollover.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('Restricted access');
?>
<table border="0" cellpadding="2">
	<tr>
		<td>
		<label for="onmouseover" class="hastip" title="<?php echo WFText::_('WF_LABEL_MOUSEOVER_DESC');?>">
			<?php echo WFText::_('WF_LABEL_MOUSEOVER');?>
		</label>
		</td>
		<td>
		<input id="onmouseover" type="text" value="" />
		</td>
	</tr>
	<tr>
		<td>
		<label for="onmouseout" class="hastip" title="<?php echo WFText::_('WF_LABEL_MOUSEOUT_DESC');?>">
			<?php echo WFText::_('WF_LABEL_MOUSEOUT');?>
		</label>
		</td>
		<td>
		<input id="onmouseout" type="text" value="" />
		</td>
	</tr>
</table>