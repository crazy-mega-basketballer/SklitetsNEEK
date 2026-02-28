import { View, StyleSheet, Button } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

type Props = {
  rec?: string;
};


export default function Playing({ rec }: Props) {
  const audioSource = require("@/assets/sounds/www.mp3");
  
  const player = useAudioPlayer(audioSource);

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
});
