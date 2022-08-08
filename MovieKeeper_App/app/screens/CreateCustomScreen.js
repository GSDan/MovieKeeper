import { StyleSheet, Switch, Text, View, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, { useContext, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik'
import * as Yup from 'yup'

import Mk_Screen from '../components/Mk_Screen'
import colours from '../config/colours';
import Mk_FormItem from '../components/Mk_FormItem';
import Mk_Button from '../components/Mk_Button';
import Mk_FormatSelector from '../components/Mk_FormatSelector';
import Stars from "../components/Mk_Stars";
import { addCustomToLibrary } from '../api/libraryItems';
import { AuthContext } from '../hooks/userAuthentication';

const validationSchema = (isTV) => Yup.object().shape({
    Title: Yup.string().required().label('Title'),
    Year: Yup.date().required().max(new Date().getFullYear(), 'Please enter a valid year').label('Year'),
    Genre: Yup.string().label('Genre'),
    Actors: Yup.string().label('Lead Actors'),
    Director: Yup.string().label('Director'),
    ...(isTV && {
        TotalSeasons: Yup.number().required().min(1, "Must have at least one season").label('Number of Seasons')
    })
});

const CreateCustomScreen = () =>
{
    const [isTV, setIsTV] = useState(false);
    const [initialFormats, setInitialFormats] = useState([]);
    const [selectedFormats, setSelectedFormats] = useState([]);
    const [userRating, setUserRating] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const authContext = useContext(AuthContext);

    const createItem = async (formVals) =>
    {
        const media = {
            'Title': formVals.Title,
            'Year': formVals.Year,
            'Genre': formVals.Genre,
            'Director': formVals.Director,
            'Actors': formVals.Actors,
            'Type': isTV ? 'TV' : 'movie',
            'TotalSeasons': formVals.TotalSeasons
        }

        setLoading(true);
        try
        {
            await addCustomToLibrary(media, userRating, selectedFormats);
        }
        catch (error)
        {
            setLoading(false)
            setError('Oops, something went wrong. Please try again.')
            return console.log(error)
        }

        authContext.setShouldRefreshContent(true);

        Toast.show((mode === 'edit' ? 'Updated ' : 'Added ') + media.Title, {
            duration: Toast.durations.LONG,
        });

        navigation.popToTop();
    }

    return (
        <Mk_Screen loading={loading}>
            <ScrollView>
                <KeyboardAwareScrollView>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ backgroundColor: 'purple' }}>
                        <View>
                            <Text style={styles.header}>Add a Custom Item</Text>
                            <Text style={styles.subheader}>Couldn't find that obscure arthouse opus magnus which we probably haven't heard of? Add it here!</Text>

                            {error && <Text style={styles.errorMessage}>{error}</Text>}

                            <View style={styles.typeToggleContainer}>

                                <MaterialCommunityIcons
                                    style={styles.switchIcon}
                                    name={'movie-open'}
                                    color={isTV ? colours.secondary_light : colours.primary}
                                    size={30} />
                                <Switch
                                    style={styles.switch}
                                    trackColor={{ false: colours.secondary_light, true: colours.secondary_light }}
                                    thumbColor={colours.primary}
                                    onValueChange={setIsTV}
                                    value={isTV} />
                                <MaterialCommunityIcons
                                    style={styles.switchIcon}
                                    name={'television-classic'}
                                    color={isTV ? colours.primary : colours.secondary_light}
                                    size={30} />
                            </View>

                            <Text style={styles.fieldHeader}>Owned Format</Text>

                            <Mk_FormatSelector
                                style={{ marginBottom: 10 }}
                                initialFormats={initialFormats}
                                onFormatsChange={setSelectedFormats} />

                            <Text style={styles.fieldHeader}>Your Rating</Text>

                            <Stars
                                value={userRating}
                                isTouchable={true}
                                containerStyle={styles.starContainer}
                                starStyle={styles.stars}
                                onPress={setUserRating} />

                            <Formik
                                initialValues={{
                                    Title: '',
                                    Year: '',
                                    Genre: '',
                                    Actors: '',
                                    Director: '',
                                    ...(isTV && { TotalSeasons: '' })
                                }}
                                onSubmit={createItem}
                                validationSchema={validationSchema(isTV)}>
                                {({ handleChange, handleSubmit, errors, setFieldTouched, touched }) => (
                                    <>
                                        <Mk_FormItem
                                            fieldname={'Title'}
                                            placeholder={'Title'}
                                            icon={'format-title'}
                                            handleChange={handleChange}
                                            onBlur={setFieldTouched}
                                            touched={touched}
                                            errors={errors}
                                        />

                                        <Mk_FormItem
                                            fieldname={'Year'}
                                            placeholder={'Year'}
                                            icon={'calendar'}
                                            keyboardType={'numeric'}
                                            handleChange={handleChange}
                                            onBlur={setFieldTouched}
                                            touched={touched}
                                            errors={errors}
                                        />

                                        <Mk_FormItem
                                            fieldname={'Genre'}
                                            placeholder={'Genre'}
                                            icon={'filmstrip-box-multiple'}
                                            handleChange={handleChange}
                                            onBlur={setFieldTouched}
                                            touched={touched}
                                            errors={errors}
                                        />

                                        <Mk_FormItem
                                            fieldname={'Director'}
                                            placeholder={'Director'}
                                            icon={'chair-rolling'}
                                            handleChange={handleChange}
                                            onBlur={setFieldTouched}
                                            touched={touched}
                                            errors={errors}
                                        />

                                        <Mk_FormItem
                                            fieldname={'Actors'}
                                            placeholder={'Lead Actors'}
                                            icon={'account-multiple'}
                                            handleChange={handleChange}
                                            onBlur={setFieldTouched}
                                            touched={touched}
                                            errors={errors}
                                        />

                                        {isTV &&
                                            <Mk_FormItem
                                                fieldname={'TotalSeasons'}
                                                placeholder={'Number of Seasons'}
                                                icon={'television-classic'}
                                                keyboardType={'numeric'}
                                                handleChange={handleChange}
                                                onBlur={setFieldTouched}
                                                touched={touched}
                                                errors={errors}
                                            />
                                        }

                                        <Mk_Button
                                            text={'Create'}
                                            style={styles.createButton}
                                            onPress={handleSubmit} />
                                    </>
                                )}
                            </Formik>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAwareScrollView>
            </ScrollView>
        </Mk_Screen >
    )
}

export default CreateCustomScreen

const styles = StyleSheet.create({
    createButton: {
        marginTop: 10
    },
    errorMessage: {
        width: '100%',
        color: 'red',
        textAlign: 'center'
    },
    fieldHeader: {
        textAlign: 'center',
        marginHorizontal: 15,
        marginBottom: 6,
        color: colours.medium
    },
    fieldSpacer: {
        flex: 2,
        marginRight: 10,
        alignSelf: 'center',
        alignItems: 'flex-end',
    },
    header: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 15,
    },
    starContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10
    },
    stars: {
        width: 27,
        height: 27,
        marginHorizontal: 1
    },
    subheader: {
        textAlign: 'center',
        marginHorizontal: 15,
        marginBottom: 10,
        color: colours.medium
    },
    switch: {
        alignSelf: 'center'
    },
    switchIcon: {
        marginHorizontal: 10
    },
    textInput: {
        flex: 8,
        borderColor: colours.secondary,
        borderWidth: 2,
        padding: 8,
        paddingLeft: 12,
        borderRadius: 10
    },
    typeToggleContainer: {
        flexDirection: 'row',
        marginVertical: 5,
        marginHorizontal: 10,
        height: 45,
        maxWidth: 500,
        alignSelf: 'center',
        alignItems: 'center'
    },
})