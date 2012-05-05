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
class WFImageFilterConvolution extends WFImageFilter
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
		if (!function_exists('imageconvolution'))
		{
			throw new RuntimeException('The imageconvolution function for PHP is not available.');
		}

		// Validate that the matrix value exists and is an array.
		if (!isset($options['matrix']) || !is_array($options['matrix']))
		{
			throw new InvalidArgumentException('No valid matrix value was given.  Expected array.');
		}
                
                // Validate that the divisor value exists and is a float.
		if (!isset($options['div']) || !is_float($options['div']))
		{
			throw new InvalidArgumentException('No valid divisor value was given.  Expected float.');
		}
                
                // Validate that the offset value exists and is an integer or float.
		if (!isset($options['offset']) || !is_float($options['offset']))
		{
			throw new InvalidArgumentException('No valid color offset value was given.  Expected float.');
		}

		// Perform the smoothing filter.
		imageconvolution($this->handle, $options['matrix'], $options['div'], $options['offset']);
	}
}
