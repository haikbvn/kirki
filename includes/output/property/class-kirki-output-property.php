<?php
/**
 * Handles CSS properties.
 * Extend this class in order to handle exceptions.
 *
 * @package     Kirki
 * @subpackage  Controls
 * @copyright   Copyright (c) 2016, Aristeides Stathopoulos
 * @license     http://opensource.org/licenses/https://opensource.org/licenses/MIT
 * @since       2.2.0
 */

if ( ! class_exists( 'Kirki_Output_Property' ) ) {

	class Kirki_Output_Property {

		protected $property;
		protected $value;

		public function __construct( $property, $value ) {
			$this->property = $property;
			$this->value    = $value;
			$this->process_value();
		}

		protected function process_value() {

		}

		public function get_value() {
			return $this->value;
		}
	}
}
