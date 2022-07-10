import React, { useState } from 'react'
import { register, signIn, signOut, onAuthenticationStateChanged, getUser } from '../api/account'

const emailTakenMessage = 'An account with that email address already exists!';
const detailsIncorrect = "Couldn't find an account with that email & password combination";
const errorMessageMap = {
    'auth/email-already-in-use': emailTakenMessage,
    'auth/credential-already-in-use': emailTakenMessage,
    'auth/account-exists-with-different-credential': emailTakenMessage,
    'auth/network-request-failed': 'Network error - please try again later',
    'auth/too-many-requests': 'Too many attempts - please try again later',
    'auth/user-not-found': detailsIncorrect,
    'auth/wrong-password': detailsIncorrect
}

export const AuthContext = React.createContext();

export const useRegister = () =>
{
    const [state, setState] = useState({
        registerLoading: false,
        registerError: null,
    })

    const handleRegister = async (email, password) =>
    {
        setState({ registerLoading: true, registerError: null })

        try
        {
            await register(email, password)
        } catch (error)
        {
            setState({ registerLoading: false, registerError: errorMessageMap[error.code] })
        }
    }

    return [handleRegister, { ...state }]
}

export const useLogin = () => 
{
    const [state, setState] = useState({
        loginLoading: false,
        loginError: null,
    })

    const handleLogin = async (email, password) =>
    {
        setState({ loginLoading: true, loginError: null })

        try
        {
            await signIn(email, password);
        } catch (error)
        {
            setState({ loginLoading: false, loginError: errorMessageMap[error.code] })
        }
    }

    return [handleLogin, { ...state }]
}

export const useLogout = () => 
{
    const handleLogout = async () =>
    {
        await signOut();
    }

    return handleLogout;
}

export const useAuthChange = () => 
{
    const [state, setState] = useState({
        currentUser: getUser()
    })

    const handleAuthChange = (action) =>
    {
        try
        {
            onAuthenticationStateChanged((user) =>
            {
                setState({ currentUser: user })
                if (action) action(user);
            })

        } catch (error)
        {
            console.log(error)
        }

    }

    return [handleAuthChange, { ...state }]
}
