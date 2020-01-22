import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

import styles from '../styles/Main.style';
import api from '../services/api';

function Main({ navigation }) {
    const [devs, setDevs] = useState([]);
    const [currentRegion, setCurrentRegion] = useState(null);
    const [stack, setStack] = useState('');
    
    useEffect(() => {
        async function loadInitialPosition() {
            const { granted } = await requestPermissionsAsync();

            if (granted) {
                const { coords: { latitude, longitude } } = await getCurrentPositionAsync({
                    enableHighAccuracy: true,
                });

                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05
                });
            }
        }

        loadInitialPosition();
    }, []);

    async function loadDevs() {
        const { latitude, longitude } = currentRegion;

        const response = await api.get('/devs', {
            params: {
                latitude,
                longitude,
                stack
            }
        });

        setDevs(response.data.devs);

        console.log(response.data);
    }

    function handleRegionChanged(region) {
        setCurrentRegion(region);
    }

    if (!currentRegion) {
        return null;
    }

    return (
        <>
            <MapView 
                onRegionChangeComplete={handleRegionChanged}
                initialRegion={currentRegion} 
                style={styles.map}
            >
                {devs.map(({ _id, location, avatar_url, bio, name, stack }) => {
                    <Marker 
                        key={_id}
                        coordinate={{
                            latitude: location.coordinates[0], 
                            longitude: location.coordinates[1],
                        }}
                    >
                        <Image 
                            style={ styles.avatar } 
                            source={{ uri: avatar_url }} 
                        />

                        <Callout 
                            onPress={() => navigation.navigate('Profile', { github_username: 'Masterfoni' })}
                        >
                            <View style={ styles.callout }>
                                <Text style={ styles.devName }>{name}</Text>
                                <Text style={ styles.devBio }>{bio}</Text>
                                <Text style={ styles.devStack }>{stack.join(', ')}</Text>
                            </View>
                        </Callout>
                    </Marker>
                })}
            </MapView>

            <View style={styles.searchForm}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar devs por stack..."
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={stack}
                    onChangeText={setStack}
                />

                <TouchableOpacity onPress={()=>{ loadDevs(); }} style={styles.loadButton}>
                    <MaterialIcons name="my-location" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </>
    );
};

export default Main;