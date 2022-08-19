import { StyleSheet, Text, TextInput, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react'

import colours from '../config/colours';

export default function Mk_FormItem({
    style,
    fieldname,
    placeholder,
    touched,
    errors,
    icon,
    keyboardType = 'default',
    secureTextEntry = false,
    onBlur,
    handleChange })
{
    return (
        <>
            <View style={styles.fieldContainer}>

                <View style={styles.fieldSpacer}>
                    {icon &&
                        <MaterialCommunityIcons
                            name={icon}
                            color={colours.primary}
                            size={25} />
                    }
                </View>

                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    selectionColor={colours.primary}
                    onBlur={() => onBlur(fieldname)}
                    onChangeText={handleChange(fieldname)} />
                <View style={styles.fieldSpacer} />
            </View>

            {touched[fieldname] && errors[fieldname] &&

                <Text style={styles.errorMessage}>{errors[fieldname]}</Text>
            }
        </>
    )
}

const styles = StyleSheet.create({
    errorMessage: {
        width: '100%',
        color: 'red',
        textAlign: 'center'
    },
    fieldContainer: {
        flexDirection: 'row',
        marginVertical: 5,
        marginHorizontal: 10,
        height: 45,
        alignSelf: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: 500,
    },
    fieldSpacer: {
        flex: 2,
        marginRight: 10,
        alignSelf: 'center',
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 8,
        borderColor: colours.secondary,
        borderWidth: 2,
        padding: 8,
        paddingLeft: 12,
        borderRadius: 10
    },
})