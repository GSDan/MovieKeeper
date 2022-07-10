import { StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup'

import Mk_Screen from '../components/Mk_Screen'
import colours from '../config/colours';
import Mk_Button from '../components/Mk_Button';
import Mk_Logo from '../components/Mk_Logo';
import { useLogin, useRegister } from '../hooks/userAuthentication';

const validationSchema = (withConfirm) => Yup.object().shape({
    email: Yup.string().required().email().label('Email'),
    password: Yup.string().required().min(4).label('Password'),
    ...(withConfirm && {
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
    })
});

export default function LoginScreen()
{
    const [showRegister, setShowRegister] = useState(false);
    const [register, { registerLoading, registerError }] = useRegister();
    const [login, { loginLoading, loginError }] = useLogin();

    const signIn = async (formVals) =>
    {
        if (showRegister)
        {
            await register(formVals.email, formVals.password)
        }
        else
        {
            await login(formVals.email, formVals.password);
        }
    };

    return (
        <Mk_Screen style={styles.screen}>

            {(registerLoading || loginLoading) &&
                <ActivityIndicator
                    animating={registerLoading || loginLoading}
                    style={styles.loadingIndicator}
                    size="large" />
            }

            {!(registerLoading || loginLoading) && <>
                <Mk_Logo />

                <Text style={styles.title}>MovieKeeper</Text>

                {registerError &&
                    <Text style={styles.errorMessage}>{registerError}</Text>
                }

                {loginError &&
                    <Text style={styles.errorMessage}>{loginError}</Text>
                }

                <Formik
                    initialValues={{
                        email: '',
                        password: '',
                        ...(showRegister && { confirmPassword: '' })
                    }}
                    onSubmit={values => signIn(values)}
                    validationSchema={validationSchema(showRegister)}>
                    {({ handleChange, handleSubmit, errors, setFieldTouched, touched }) => (
                        <>
                            <View style={styles.fieldContainer}>
                                <View style={styles.fieldSpacer}>
                                    <MaterialCommunityIcons
                                        name={'email'}
                                        color={colours.medium}
                                        size={25} />
                                </View>
                                <TextInput
                                    style={styles.textInput}
                                    keyboardType='email-address'
                                    placeholder='Email address'
                                    autoCapitalize='none'
                                    onBlur={() => setFieldTouched("email")}
                                    autoCorrect={false}
                                    onChangeText={handleChange('email')} />
                                <View style={styles.fieldSpacer} />
                            </View>

                            {touched.email &&
                                <Text style={styles.errorMessage}>{errors.email}</Text>
                            }

                            <View style={styles.fieldContainer}>
                                <View style={styles.fieldSpacer}>
                                    <MaterialCommunityIcons
                                        name={'key'}
                                        color={colours.medium}
                                        size={25} />
                                </View>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder='Password'
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    secureTextEntry={true}
                                    onBlur={() => setFieldTouched("password")}
                                    onChangeText={handleChange('password')} />
                                <View style={styles.fieldSpacer} />
                            </View>

                            {touched.password &&
                                <Text style={styles.errorMessage}>{errors.password}</Text>
                            }

                            {showRegister && (
                                <>
                                    <View style={styles.fieldContainer}>
                                        <View style={styles.fieldSpacer} />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder='Confirm Password'
                                            autoCapitalize='none'
                                            autoCorrect={false}
                                            secureTextEntry={true}
                                            onChangeText={handleChange('confirmPassword')} />
                                        <View style={styles.fieldSpacer} />
                                    </View>

                                    <Text style={styles.errorMessage}>{errors.confirmPassword}</Text>
                                </>
                            )}

                            <Mk_Button
                                text={showRegister ? 'Register' : 'Login'}
                                style={styles.loginButton}
                                onPress={handleSubmit} />
                        </>
                    )}
                </Formik>

                <Mk_Button
                    text={showRegister ? 'Already got an account? Login' : 'Not got an account? Register'}
                    style={styles.registerButton}
                    onPress={() => setShowRegister(!showRegister)} />

            </>}
        </Mk_Screen>
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
        marginVertical: 3,
        marginHorizontal: 10,
        height: 40
    },
    fieldSpacer: {
        flex: 2,
        marginRight: 10,
        alignSelf: 'center',
        alignItems: 'flex-end',
    },
    loadingIndicator: {
        height: '100%',
        alignSelf: 'center',
        color: colours.primary
    },
    loginButton: {
        marginTop: 15
    },
    registerButton: {
        backgroundColor: colours.secondary,
        marginTop: 20
    },
    screen: {
        justifyContent: 'center',
    },
    textInput: {
        flex: 8,
        borderColor: colours.secondary,
        borderWidth: 2,
        padding: 8,
        paddingLeft: 12,
        borderRadius: 10,
    },
    title: {
        width: '100%',
        textAlign: 'center',
        fontSize: 35,
        marginVertical: 15,
        color: colours.medium
    }
})