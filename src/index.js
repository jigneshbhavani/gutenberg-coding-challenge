/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import edit from './edit';
import save from './save';

registerBlockType( 'xwp/country-card', {
	apiVersion: 1,
	edit,
	save,
} );
