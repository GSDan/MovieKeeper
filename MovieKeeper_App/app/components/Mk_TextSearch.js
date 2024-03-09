import { StyleSheet, TextInput, View } from 'react-native';
import React from 'react';
import Mk_RoundButton from './Mk_RoundButton';

import colours from '../config/colours';

const Mk_TextSearch = ({
	placeholder,
	onPress,
	onChangeText,
	style,
	icon = 'magnify',
	value = null,
	btnColour = colours.secondary,
	shouldAutoFocus = false,
}) => {
	return (
		<View style={[styles.searchContainer, style]}>
			<TextInput
				style={styles.searchInput}
				placeholder={placeholder}
				value={value}
				onChangeText={onChangeText}
				autoFocus={shouldAutoFocus}></TextInput>

			{onPress != null && (
				<Mk_RoundButton
					icon={icon}
					style={{ marginLeft: 10, backgroundColor: btnColour }}
					onPress={onPress}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	searchContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		width: '100%',
		height: 50,
		alignItems: 'center',
	},
	searchInput: {
		borderColor: colours.secondary,
		borderWidth: 2,
		padding: 8,
		paddingLeft: 12,
		borderRadius: 10,
		width: '70%',
		minHeight: 50,
		backgroundColor: colours.white,
	},
});

export default Mk_TextSearch;
