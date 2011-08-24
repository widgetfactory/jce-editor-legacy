<?php
/**
 * @version   $Id: token.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author    Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

defined('_JEXEC') or die('ERROR_403');

class WFToken
{
	/**
	 * Create a token-string
	 * From JSession::_createToken
	 * @copyright Copyright (C) 2005 - 2010 Open Source Matters. All rights reserved.
	 * @license   GNU/GPL, see LICENSE.php
	 * @access protected
	 * @param int $length lenght of string
	 * @return string $id generated token
	 */
	private function _createToken( $length = 32 )
	{
		static $chars = '0123456789abcdef';
		$max      = strlen( $chars ) - 1;
		$token      = '';
		$name       =  session_name();
		for( $i = 0; $i < $length; ++$i ) {
			$token .= $chars[ (rand( 0, $max )) ];
		}

		return md5($token.$name);
	}

	public function getToken()
	{
		$session  =JFactory::getSession();
		$user     =JFactory::getUser();
		$token    = $session->get('session.token', null, 'wf');

		//create a token
		if ( $token === null) {
			$token = self::_createToken(12);
			$session->set('session.token', $token, 'wf');
		}

		$hash = 'wf' . JUtility::getHash($user->get( 'id', 0 ) . $token);

		return $hash;
	}

	/**
	 * Check the received token
	 */
	public static function checkToken($method = 'POST')
	{
		$token = self::getToken();
		// check POST and GET for token		
		return JRequest::getVar($token, JRequest::getVar($token, '', 'GET', 'alnum'), 'POST', 'alnum');
	}
}
