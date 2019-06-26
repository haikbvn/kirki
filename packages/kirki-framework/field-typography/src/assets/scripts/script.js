/* global kirkiTypographyControls, kirkiGoogleFonts, kirkiPostMessage, WebFont */
function kirkiTypographyCompositeControlFontProperties( id, value ) {
	var control, isGoogle, fontWeights, hasItalics, fontWeightControl, fontStyleControl, closest;

	control = wp.customize.control( id );
	if ( 'undefined' === typeof control ) {
		return;
	}

	value             = value || control.setting.get();
	isGoogle          = value['font-family'] && kirkiGoogleFonts.items[ value['font-family'] ];
	fontWeights       = [ 400, 700 ];
	hasItalics        = ! isGoogle;
	fontWeightControl = wp.customize.control( id + '[font-weight]' );
	fontStyleControl  = wp.customize.control( id + '[font-style]' );

	if ( isGoogle ) {

		/**
		 * Get font-weights from google-font variants.
		 */
		fontWeights = [];
		_.each( kirkiGoogleFonts.items[ value['font-family'] ].variants, function( variant ) {
			if ( -1 !== variant.indexOf( 'i' ) ) {
				hasItalics = true;
			}
			variant = 'regular' === variant || 'italic' === variant ? 400 : parseInt( variant, 10 );
			if ( -1 === fontWeights.indexOf( variant ) ) {
				fontWeights.push( parseInt( variant, 10 ) );
			}

			if ( ! hasItalics ) {
				fontStyleControl.setting.set( 'normal' );
			}

			// if ( hasItalics && control.active() ) {
			// 	fontStyleControl.activate();
			// } else {
			// 	fontStyleControl.deactivate();
			// }
		} );

		/**
		 * If the selected font-family doesn't support the selected font-weight, switch to a supported one.
		 */
		if ( -1 === fontWeights.indexOf( parseInt( value['font-weight'], 10 ) ) ) {

			// Find the font-weight closest to our previous value.
			closest = fontWeights.reduce( function( prev, curr ) {
				return ( Math.abs( curr - parseInt( value['font-weight'], 10 ) ) < Math.abs( prev - parseInt( value['font-weight'], 10 ) ) ? curr : prev );
			} );
			fontWeightControl.doSelectAction( 'selectOption', closest.toString() );
			fontWeightControl.setting.set( closest.toString() );
		}

		/**
		 * If there's only 1 font-weight to choose from, we can hide the control.
		 */
		if ( 1 < fontWeights.length && control.active() ) {
			fontWeightControl.activate();
		} else {
			fontWeightControl.deactivate();
		}

		/**
		 * Hide/show font-weight options depending on which are available for this font-family.
		 */
		if ( fontWeightControl ) {
			_.each( [ 100, 200, 300, 400, 500, 600, 700, 800, 900 ], function( weight ) {
				if ( -1 === fontWeights.indexOf( weight ) ) {
					fontWeightControl.doSelectAction( 'enableOption', weight.toString() );
				} else {
					fontWeightControl.doSelectAction( 'disableOption', weight.toString() );
				}
			} );
		}
	}

	wp.hooks.addAction(
		'kirki.dynamicControl.initKirkiControl',
		'kirki',
		function( controlInit ) {
			if ( fontWeightControl && id + '[font-weight]' === controlInit.id ) {
				_.each( [ 100, 200, 300, 400, 500, 600, 700, 800, 900 ], function( weight ) {
					if ( -1 === fontWeights.indexOf( weight ) ) {
						fontWeightControl.doSelectAction( 'enableOption', weight.toString() );
					} else {
						fontWeightControl.doSelectAction( 'disableOption', weight.toString() );
					}
				} );
			}
		}
	);
}

jQuery( document ).ready( function() {
	_.each( kirkiTypographyControls, function( id ) {
		kirkiTypographyCompositeControlFontProperties( id );
		wp.customize( id, function( value ) {
			value.bind( function( newval ) {
				kirkiTypographyCompositeControlFontProperties( id, newval );
			} );
		} );
	} );
} );

/**
 * Hook in the kirkiPostMessageStylesOutput filter.
 *
 * Handles postMessage styles for typography controls.
 */
jQuery( document ).ready( function() {
	wp.hooks.addFilter(
		'kirkiPostMessageStylesOutput',
		'kirki',

		/**
		 * Append styles for this control.
		 *
		 * @param {string} styles      - The styles.
		 * @param {Object} value       - The control value.
		 * @param {Object} output      - The control's "output" argument.
		 * @param {string} controlType - The control type.
		 * @returns {string} - Returns the CSS as a string.
		 */
		function( styles, value, output, controlType ) {
			var googleFont = '',
				processedValue;

			if ( 'kirki-typography' === controlType ) {
				styles += output.element + '{';
				_.each( value, function( val, key ) {
					if ( output.choice && key !== output.choice ) {
						return;
					}
					processedValue = kirkiPostMessage.util.processValue( output, val );
					if ( false !== processedValue ) {
						styles += key + ':' + processedValue + ';';
					}
				} );
				styles += '}';

				// Check if this is a googlefont so that we may load it.
				if ( ! _.isUndefined( WebFont ) && value['font-family'] ) {

					// Calculate the googlefont params.
					googleFont = value['font-family'].replace( /\"/g, '&quot;' ); // eslint-disable-line no-useless-escape
					if ( value['font-weight'] && value['font-style'] ) {
						googleFont += ':' + value['font-weight'];
						if ( 'italic' === value['font-style'] ) {
							googleFont += 'i';
						}
					} else if ( value.variant ) {
						if ( 'regular' === value.variant ) {
							googleFont += ':400';
						} else if ( 'italic' === value.variant ) {
							googleFont += ':400i';
						} else {
							googleFont += ':' + value.variant;
						}
					}
					googleFont += ':cyrillic,cyrillic-ext,devanagari,greek,greek-ext,khmer,latin,latin-ext,vietnamese,hebrew,arabic,bengali,gujarati,tamil,telugu,thai';
					WebFont.load( {
						google: {
							families: [ googleFont ]
						}
					} );
				}
			}
			return styles;
		}
	);
} );