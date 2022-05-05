/**
 * WordPress dependencies
 */
import { edit, globe } from '@wordpress/icons';
import { BlockControls } from '@wordpress/block-editor';
import {
	ComboboxControl,
	Placeholder,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import countries from '../assets/countries.json';
import './editor.scss';
import { getEmojiFlag } from './utils';
import Preview from './preview';

export default function Edit( { attributes, setAttributes } ) {
	const { countryCode, relatedPosts } = attributes;
	const options = Object.entries( countries ).map( ( [ code, name ] ) => ( {
		value: code,
		label: `${ getEmojiFlag( code ) }  ${ name } — ${ code }`,
	} ) );

	const [ isPreview, setIsPreview ] = useState();

	useEffect( () => setIsPreview( countryCode ), [ countryCode ] );

	const handleChangeCountry = () => {
		if ( isPreview ) {
			setIsPreview( false );
		} else if ( countryCode ) {
			setIsPreview( true );
		}
	};

	const handleChangeCountryCode = ( newCountryCode ) => {
		if ( newCountryCode && countryCode !== newCountryCode ) {
			setAttributes( {
				...attributes,
				countryCode: newCountryCode,
				relatedPosts: [],
			} );
		}
	};

	let posts = [];

	useEffect( () => {
		const getRelatedPosts = async () => {
			const postId = wp.data.select( 'core/editor' ).getCurrentPostId();

			await apiFetch( {
				path: `/wp/v2/posts?search=${ countries[ countryCode ] }&exclude=${ postId }&_fields=link,title,excerpt`,
			} ).then( ( response ) => {
				posts = response;
			} );

			setAttributes( {
				relatedPosts:
					posts?.map( ( relatedPost ) => ( {
						...relatedPost,
						title: relatedPost.title?.rendered || relatedPost.link,
						excerpt: relatedPost.excerpt?.rendered || '',
					} ) ) || [],
			} );
		};

		getRelatedPosts();
	}, [ countryCode, setAttributes ] );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={ __( 'Change Country', 'xwp-country-card' ) }
						icon={ edit }
						onClick={ handleChangeCountry }
						disabled={ ! Boolean( countryCode ) }
					/>
				</ToolbarGroup>
			</BlockControls>
			<div>
				{ isPreview ? (
					<Preview
						countryCode={ countryCode }
						relatedPosts={ relatedPosts }
					/>
				) : (
					<Placeholder
						icon={ globe }
						label={ __( 'XWP Country Card', 'xwp-country-card' ) }
						isColumnLayout={ true }
						instructions={ __(
							'Type in a name of a contry you want to display on your site.',
							'xwp-country-card'
						) }
					>
						<ComboboxControl
							label={ __( 'Country', 'xwp-country-card' ) }
							hideLabelFromVision
							options={ options }
							value={ countryCode }
							onChange={ handleChangeCountryCode }
							allowReset={ true }
						/>
					</Placeholder>
				) }
			</div>
		</>
	);
}
