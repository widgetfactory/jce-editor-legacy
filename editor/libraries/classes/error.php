<?php
/**
* @package   	JCE
* @copyright 	Copyright © 2009-2011 Ryan Demmer. All rights reserved.
* @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
class WFError {
	/**
	 * Format a JError object as a JSON string
	 */
	public function raiseError($error)
	{
		$data = array();

		$data[] = JError::translateErrorLevel($error->get('level')) . ' ' . $error->get('code') . ': ';

		if ($error->get('message')) {
			$data[] = $error->get('message');
		}

		if ($error->get('code') >= 500) {
			if ($error->get('line')) {
				$data[] = ' IN LINE ' . $error->get('line');
			}

			if ($error->get('function')) {
				$text = ' IN ';

				if ($error->get('class')) {
					$text = $error->get('class') . '::';
				}

				$text = $error->get('function');

				$data[] = $text;
			}

			if ($error->get('file')) {
				$data[] = 'IN FILE ' . $error->get('file');
			}
		}

		header('Content-Type: text/json');
		header('Content-Encoding: UTF-8');

		$output = array(
				'result'	=> '',
	        	'error'  	=> true,
				'code'	 	=> $error->get('code'),
				'text'		=> $data
		);

		exit(json_encode($output));
	}
}
?>