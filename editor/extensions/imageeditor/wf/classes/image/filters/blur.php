<?php
/**
 * @package     Joomla.Platform
 * @subpackage  Image
 *
 * @copyright   Copyright (C) 2005 - 2012 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE
 */

defined('_JEXEC') or die;

/**
 * Image Filter class adjust the smoothness of an image.
 *
 * @package     Joomla.Platform
 * @subpackage  Image
 * @since       11.3
 */
class WFImageFilterBlur extends WFImageFilter
{
	/**
	 * Method to apply a filter to an image resource.
	 *
	 * @param   array  $options  An array of options for the filter.
	 *
	 * @return  void
	 *
	 * @since   11.3
	 * @throws  InvalidArgumentException
	 * @throws  RuntimeException
	 */
	public function execute(array $options = array())
	{
		// Verify that image filter support for PHP is available.
		if (!function_exists('imagefilter'))
		{
			throw new RuntimeException('The imagefilter function for PHP is not available.');
		}

		// Perform the smoothing filter.
		imagefilter($this->handle, IMG_FILTER_GAUSSIAN_BLUR);
	}
}
