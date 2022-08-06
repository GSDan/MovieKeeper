import { StyleSheet, View, Modal, Text, FlatList } from 'react-native'

import colours from '../config/colours';
import Mk_Button from './Mk_Button';
import Mk_CardWithAction from './Mk_CardWithAction';

const Mk_ModalSearchResults = ({
    show,
    data,
    itemButtonAction,
    cancelButtonAction,
    headerText,
    subHeaderText,
    style }) =>
{
    return (
        <Modal
            visible={show}
            animationType={'slide'}
            style={style}>
            <View style={styles.modal}>
                <Text style={styles.modalTitle}>{headerText}</Text>
                <Text style={styles.modalSubheader}>{subHeaderText}</Text>
                <FlatList
                    style={styles.modalList}
                    data={data}
                    keyExtractor={(listing) => listing.imdbID}
                    renderItem={({ item }) => (
                        <Mk_CardWithAction
                            movie={item}
                            action={{
                                'icon': 'check-circle-outline',
                                'onPress': () =>
                                {
                                    itemButtonAction(item);
                                },
                                'colour': colours.secondary_light
                            }}
                        />
                    )}
                    contentContainerStyle={{ flexGrow: 1 }}
                />
                <Mk_Button
                    style={styles.modalClose}
                    text={"Cancel"}
                    onPress={cancelButtonAction} />
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        width: '100%',
        height: '100%',
        alignContent: 'center',
        justifyContent: 'center'
    },
    modalTitle: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 15,
    },
    modalSubheader: {
        textAlign: 'center',
        marginBottom: 8,
    },
    modalClose: {
        marginVertical: 15,
    },
    modalList: {
        flex: 1,
        marginTop: 10,
        borderColor: colours.light_grey,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingTop: 10,
        backgroundColor: colours.light
    },
});

export default Mk_ModalSearchResults