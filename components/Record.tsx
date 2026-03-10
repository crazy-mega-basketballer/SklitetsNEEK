import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  useAudioPlayer,
} from 'expo-audio';

export default function Record() {
  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(audioRecorder);

  const audioSource = require("@/assets/sounds/www.mp3");
  const player = useAudioPlayer(audioSource);

  const [volume, setVolume] = useState<number>(0);
  
  // Используем ReturnType<typeof setInterval> для правильного типа
  const checkVolIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  let startRecordTime = Date.now();

  useEffect(() => {
    return () => {
      if (checkVolIntervalRef.current) {
        clearInterval(checkVolIntervalRef.current);
      }
    };
  }, []);

  const checkValume = () => {
    let valume = audioRecorder.getStatus().metering
    if (audioRecorder.getStatus().metering !== undefined) {
        valume = 160 + Math.floor(valume);
        setVolume(valume);
    }
  };

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();

    if (!checkVolIntervalRef.current) {
      checkVolIntervalRef.current = setInterval(() => {
        checkValume();
        startRecordTime = Date.now();
      }, 200);
    }
  };

  const stopRecording = async () => {
    await audioRecorder.stop();

    if (checkVolIntervalRef.current) {
      clearInterval(checkVolIntervalRef.current);
      checkVolIntervalRef.current = null;
    }

    setVolume(0);
    const newAudioSource = audioRecorder.uri;
    if (newAudioSource) {
      player.replace(newAudioSource);
    }
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        alert('Permission to access microphone was denied');
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  return (
    <View style={styles.container}>

      <Text style={styles.text}>{volume}</Text>

      <Pressable onPress={recorderState.isRecording ? stopRecording : record}
      style={styles.buttons}>
        <Text style={styles.butText}>{recorderState.isRecording ? 'Остановить запись' : 'Начать запись'}</Text>
      </Pressable>

      <Pressable onPress={() => player.play()}
        style={styles.buttons}>
        <Text style={styles.butText}>Проиграть</Text>
      </Pressable>

      <Pressable onPress={() => {
        player.seekTo(0);
        player.play();
      }}
      style={styles.buttons}>
        <Text style={styles.butText}>В начало</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: 500,
    justifyContent: 'center',
    backgroundColor: '#636363',
    borderRadius: 15,
  },
  text: {
    textAlign: 'center',
    fontSize: 35,
    padding: 15,
    color: '#d1d2bb'
  },
  buttons: {
    margin: 10,
    padding:10,
    borderRadius: 10,
    backgroundColor: '#d1d2bb',
  },
  butText: {
    textAlign: 'center',
    fontSize: 20,
  },
});