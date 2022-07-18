import { StyleSheet, View } from 'react-native'
import React, { useState, useEffect } from 'react'

import Mk_FormatCheckbox from './Mk_FormatCheckbox';

export default function Mk_FormatSelector({ initialFormats, onFormatsChange, style })
{
    const [dvdChecked, setDvdChecked] = useState(false);
    const [bluChecked, setBluChecked] = useState(false);
    const [uhdChecked, setUhdChecked] = useState(false);

    useEffect(() => 
    {
        let dvd, blu, uhd;
        dvd = blu = uhd = false;

        initialFormats.forEach(format =>
        {
            switch (format)
            {
                case '4K':
                    uhd = true;
                    break;
                case 'Blu-ray':
                    blu = true;
                    break;
                case 'DVD':
                    dvd = true;
                    break;
            }
        });

        setUhdChecked(uhd);
        setBluChecked(blu);
        setDvdChecked(dvd);

    }, [initialFormats]);

    useEffect(() =>
    {
        let formats = [];

        if (dvdChecked) formats.push('DVD');
        if (bluChecked) formats.push('Blu-ray');
        if (uhdChecked) formats.push('4K');

        let changed = initialFormats.length !== formats.length;
        if (!changed)
        {
            // this assumes they're in the same order, which they should be
            for (let i = 0; i < formats.length; i++)
            {
                if (formats[i] !== initialFormats[i])
                {
                    changed = true;
                    break;
                }
            }
        }

        if (changed) onFormatsChange(formats);

    }, [dvdChecked, bluChecked, uhdChecked])

    return (
        <View style={[styles.ownedFormatsContainer, style]}>
            <Mk_FormatCheckbox
                formatName={'DVD'}
                checked={dvdChecked}
                onValueChange={(val) => setDvdChecked(val)}
            />

            <Mk_FormatCheckbox
                formatName={'Blu-ray'}
                checked={bluChecked}
                onValueChange={(val) => setBluChecked(val)}
            />

            <Mk_FormatCheckbox
                formatName={'4K'}
                checked={uhdChecked}
                onValueChange={(val) => setUhdChecked(val)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    ownedFormatsContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center'
    },
})