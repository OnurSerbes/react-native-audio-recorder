import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { Audio } from "expo-av";
import { useState, useEffect } from "react";

export default function App() {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    (async () => {
      if (!modalVisible && title != "") {
        saveRecording();
      }
    })();
  }, [modalVisible]);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(recording);
        setIsRecording(true);
      } else {
        setMessage("Please grant permission to app to access microphone");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    try {
      await recording.stopAndUnloadAsync();
    } catch (error) {
      console.log(error);
    }
    setIsRecording(false);
    setModalVisible(!modalVisible);
  }

  async function saveRecording() {
    try {
      // setRecording(undefined);
      // await recording.stopAndUnloadAsync();
      let updatedRecordings = [...recordings];
      const { sound, status } = await recording.createNewLoadedSoundAsync();
      updatedRecordings.push({
        sound: sound,
        file: recording.getURI(),
        id: parseInt(Math.random() * 1000),
        title: title,
      });
      setRecordings(updatedRecordings);
      setTitle("");
    } catch (error) {
      console.log(error);
    }
  }

  function deleteRecording(id) {
    const filteredData = recordings.filter((item) => item.id !== id);
    setRecordings(filteredData);
  }

  function recordingView(item) {
    console.log(item);
    return (
      <View style={styles.row}>
        <Text style={styles.fill}>{item.item.title}</Text>
        <Button
          style={styles.button}
          onPress={() => item.item.sound.replayAsync()}
          title="Play"
        ></Button>
        <Button
          style={styles.button}
          onPress={() => Sharing.shareAsync(item.item.file)}
          title="Share"
        ></Button>
        <Button
          style={styles.button}
          onPress={() => {
            deleteRecording(item.item.id);
          }}
          title="Delete"
        ></Button>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Text>{message}</Text>
        <FlatList
          data={recordings}
          keyExtractor={(item, index) => index}
          renderItem={recordingView}
        />
        <Button
          title={isRecording ? "Stop Recording" : "Start Recording"}
          onPress={isRecording ? stopRecording : startRecording}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View>
            <View style={styles.generalContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Recording name"
                  onChangeText={(title) => {
                    setTitle(title);
                  }}
                />
                <View style={styles.buttonContainer}>
                  <Button
                    title="Add"
                    onPress={() => setModalVisible(!modalVisible)}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fill: {
    flex: 1,
    margin: 16,
  },
  button: {
    margin: 16,
  },
  input: {
    textAlignVertical: "top",
    fontSize: 17,
    width: "100%",
    height: 40,
    marginTop: 10,
    marginBottom: 10,
    borderColor: "#ffffff",
    width: "100%",
    borderWidth: 2,
    borderRadius: 15,
    padding: 10,
    color: "#ffffff",
  },
  generalContainer: {
    margin: 30,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "gray",
    borderRadius: 15,
    elevation: 4,
  },
  inputContainer: {
    padding: 20,
    alignItems: "center",
  },
});
