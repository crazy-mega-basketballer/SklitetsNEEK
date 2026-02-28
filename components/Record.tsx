import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
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

  const [showPlayer, setShowPlayer] = useState<boolean>(false);
  
  // Используем ReturnType<typeof setInterval> для правильного типа
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        console.log(audioRecorder.getStatus().metering);
      }, 500);
    }
  };

  const stopRecording = async () => {
    await audioRecorder.stop();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setShowPlayer(true);
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
      <Button
        title={recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={recorderState.isRecording ? stopRecording : record}
      />
      {showPlayer ? (
        <View>
          <View style={styles.container}>
            <Button title="Play Sound" onPress={() => player.play()} />
            <Button
              title="Replay Sound"
              onPress={() => {
                player.seekTo(0);
                player.play();
              }}
            />
          </View>
        </View>
      ) : (
        <View>
          <Text>NETU</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#636363',
    padding: 10,
  },
});