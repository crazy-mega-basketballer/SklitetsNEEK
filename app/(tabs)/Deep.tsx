import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, PermissionsAndroid, Platform, Dimensions } from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(-160);
  const [dbDisplay, setDbDisplay] = useState(0);

  // 1. Исправляем ошибки типов useRef
  // Указываем, что в ref может храниться либо Audio.Recording, либо null
  const recordingRef = useRef<Audio.Recording | null>(null);
  // Указываем, что здесь может быть ID таймера (number) или null
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Разрешение на микрофон',
            message: 'Приложению нужен доступ к микрофону для измерения шума',
            buttonNeutral: 'Спросить позже',
            buttonNegative: 'Отмена',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startListening = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Создаем конфигурацию вручную, используя прямые числовые значения.
      // Это обходной путь, если библиотека не экспортирует константы.
      const recordingOptions = {
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: 2,      // MPEG_4
          audioEncoder: 3,      // AAC
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: 1633772320, // kAudioFormatMPEG4AAC (в формате Little Endian для 'aac ')
          audioQuality: 96,         // Max quality
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      const { recording } = await Audio.Recording.createAsync(
        recordingOptions,
        undefined,
        100
      );

      recordingRef.current = recording;
      setIsRecording(true);

      intervalRef.current = setInterval(async () => {
        try {
          if (recordingRef.current) {
            const status = await recordingRef.current.getStatusAsync();
            console.log(status)
            if (status.isRecording && status.metering !== undefined) {
              setNoiseLevel(status.metering);
              const calculatedDb = Math.round((status.metering + 160) * 0.6);
              setDbDisplay(calculatedDb);
            }
          }
        } catch (e) {
          console.log('Ошибка при получении статуса', e);
        }
      }, 100);

    } catch (err) {
      console.error('Ошибка при запуске записи', err);
    }
  };

  const stopListening = async () => {
    // 3. Исправляем ошибки "does not exist on type never"
    // Теперь TypeScript знает, что у recordingRef.current есть метод stopAndUnloadAsync
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRecording(false);
    setNoiseLevel(-160);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const screenWidth = Dimensions.get('window').width;
  const progressPercent = ((noiseLevel + 160) / 160) * 100;
  const barWidth = (progressPercent / 100) * (screenWidth - 40);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Шумомер</Text>
      
      <View style={styles.circleContainer}>
        <Text style={styles.dbText}>{dbDisplay} дБ</Text>
      </View>

      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: barWidth > 0 ? barWidth : 0 }]} />
      </View>
      
      <Text style={styles.hint}>
        {isRecording ? "Слушаю..." : "Нажмите старт для начала"}
      </Text>

      <Button
        title={isRecording ? "СТОП" : "СТАРТ"}
        onPress={isRecording ? stopListening : startListening}
        color={isRecording ? 'red' : 'green'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  circleContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dbText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  barContainer: {
    width: '100%',
    height: 20,
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  bar: {
    height: '100%',
    backgroundColor: 'green',
  },
  hint: {
    marginBottom: 20,
    color: '#666',
  },
});