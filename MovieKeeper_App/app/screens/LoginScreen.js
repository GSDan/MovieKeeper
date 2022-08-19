import { StyleSheet, Text, Image } from 'react-native'
import React, { useState } from 'react'
import { Formik } from 'formik';
import * as Yup from 'yup'

import Mk_Screen from '../components/Mk_Screen'
import colours from '../config/colours';
import Mk_Button from '../components/Mk_Button';
import { useLogin, useRegister } from '../hooks/userAuthentication';
import Mk_FormItem from '../components/Mk_FormItem';

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
        <Mk_Screen style={styles.screen} loading={registerLoading || loginLoading}>


            <Image style={styles.logo} source={require("../assets/adaptive-icon.png")} />

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

                        <Mk_FormItem
                            fieldname={'email'}
                            placeholder={'Email address'}
                            icon={'email'}
                            keyboardType='email-address'
                            handleChange={handleChange}
                            onBlur={setFieldTouched}
                            touched={touched}
                            errors={errors}
                        />

                        <Mk_FormItem
                            fieldname={'password'}
                            placeholder={'Password'}
                            icon={'key'}
                            secureTextEntry={true}
                            handleChange={handleChange}
                            onBlur={setFieldTouched}
                            touched={touched}
                            errors={errors}
                        />

                        {showRegister && (
                            <Mk_FormItem
                                fieldname={'confirmPassword'}
                                placeholder={'Confirm Password'}
                                secureTextEntry={true}
                                handleChange={handleChange}
                                onBlur={setFieldTouched}
                                touched={touched}
                                errors={errors}
                            />
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

        </Mk_Screen>
    )
}

const styles = StyleSheet.create({
    errorMessage: {
        width: '100%',
        color: 'red',
        textAlign: 'center'
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
    title: {
        width: '100%',
        textAlign: 'center',
        fontSize: 35,
        marginVertical: 15,
        color: colours.primary
    },
    logo: {
        height: '25%',
        width: '100%',
        resizeMode: 'contain'
    }
})