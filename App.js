import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, ScrollView, View, TouchableOpacity, StatusBar, ProgressBarAndroid } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions'
import * as MediaLibrary from 'expo-media-library'
import _ from "lodash"
let jokes = require("./jokes.json")

function Button({ onPress, text, style = { backgroundColor: '#009dff' }, textStyle = { fontSize: 20, color: '#fff', padding: 5 } }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={style}>
      <Text style={textStyle}>{text}</Text>
    </TouchableOpacity>
  )
}

export default function App() {
  const [data, setData] = useState('https://cdn2.thecatapi.com/images/d7j.jpg');
  const [loading, setLoading] = useState(true);
  const [joke, setJoke] = useState("");

  function getJoke() {
    let joke = _.sample(jokes)
    return `${joke.buildup} ${joke.punchline}`
  }

  const getCat = () => {
    fetch("https://api.thecatapi.com/v1/images/search")
      .then(response => response.json())
      .then((json) => {
        if (json[0].breeds) {
          for (let key in json[0].breeds[0]) {
            let v = json[0].breeds[0][key];
            json[0].breeds[0][key] = v.toString() + "\n\n"
          }
        }
        setData(json);
        setJoke(getJoke())
        setLoading(true)
      });
  }
  
  const download = async () => {
    try {
      const { uri } = await FileSystem.downloadAsync(data[0].url, FileSystem.documentDirectory + data[0].id + ".jpg");

      const perm = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);

      if (perm.status !== 'granted') return;

      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync('Downloads')
      if (!album) await MediaLibrary.createAlbumAsync('Downloads', asset, false);
      else await MediaLibrary.addAssetsToAlbumAsync([asset], album)
      alert("Saved successfully")
      console.log(asset)
    } catch (err) {
      alert("Error Occured: " + err)
      console.error(err)
    }
  }


  useEffect(getCat, []);
  return (
    <View style={styles.container}>
      <Image  style={{ width: '100%', height: '50%', marginBottom: 10 }}
      source={{ uri: data[0].url }} 
      onLoad={() => setLoading(false)} 
      />
      <Text >Kitties! Kitties everywhere!</Text>
      <View style={styles.horizontal}>
        <Button onPress={getCat}
          text="Get gotoss!"
          style={{ backgroundColor: '#009dff', borderRadius: 5 }}
          textStyle={{ fontSize: 16, color: '#fff', padding: 5 }}
        />
        <Button
          onPress={download}
          text="Save gotoss!"
          style={{ backgroundColor: '#00942a', borderRadius: 5, margin: 5 }}
          textStyle={{ fontSize: 16, color: '#fff', padding: 5 }}
        />
      </View>
      <BreedInfo data={data} joke={joke}/>
      {loading && <ProgressBarAndroid/>}
      <StatusBar style="auto" />
    </View>
  );
}

function BreedInfo({ data, joke }) {
  
  if (data[0]?.breeds?.length > 0) return(
  <ScrollView contentContainerStyle={styles.scroll}>
    <Text style={styles.breeds}>Breed: {data[0].breeds[0]?.name || "unkown"}
      Affection Level: {data[0]?.breeds[0]?.affection_level || "unkown"}
      Intelligence Level: {data[0].breeds[0]?.intelligence || "unkown"}
      Energy Level: {data[0].breeds[0]?.energy_level || "unkown"}
      Description: {data[0].breeds[0]?.description || "unkown"}</Text>
  </ScrollView>)
  else return <Text style={styles.breeds}>{joke}</Text>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 50,
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  breeds: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },

});
