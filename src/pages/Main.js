import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

import styles from '../styles/Main.style';
import api from '../services/api';
import { connect, disconnect, subscribeToNewDevs } from '../services/socket';

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

    useEffect(() => {
        subscribeToNewDevs(dev => setDevs([...devs, dev]));
    }, [devs]);

    function setupWebsocket() {
        disconnect();

        const { latitude, longitude } = currentRegion;

        connect(
            latitude,
            longitude,
            stack,
        );
    }

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
        setupWebsocket();
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
                {devs.map(({ _id, location, avatar_url, bio, name, stack, github_username }) => 
                    <Marker 
                        key={_id}
                        coordinate={{
                            latitude: location.coordinates[1], 
                            longitude: location.coordinates[0],
                        }}
                    >
                        <Image 
                            style={ styles.avatar } 
                            source={{ uri: avatar_url }} 
                        />

                        <Callout 
                            onPress={() => navigation.navigate('Profile', { github_username })}
                        >
                            <View style={ styles.callout }>
                                <Text style={ styles.devName }>{name}</Text>
                                <Text style={ styles.devBio }>{bio}</Text>
                                <Text style={ styles.devStack }>{stack.join(', ')}</Text>
                            </View>
                        </Callout>
                    </Marker>
                )}
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
                    <MaterialIcons name="search" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </>
    );
};

export default Main;