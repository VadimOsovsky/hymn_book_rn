import React, { PureComponent } from "react";
import { Animated, Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, IconButton, Portal, Text, TouchableRipple } from "react-native-paper";
// @ts-ignore
import RadioBtn from "react-native-radio-button-android";
import i18n from "../../../i18n";
import { LyricsItem } from "../../../models/HymnItem";
import { MusicKeys, musicKeysArr } from "../../../models/MusicKeys";

interface OwnProps {
  lyrics: LyricsItem[];
  onAddLyrics: (newLyrics: LyricsItem) => void;
}

type Props = OwnProps;

type State = Readonly<{
  lyrics: LyricsItem[];
  visible: boolean;
  availableKeys: string[]
  selectedKey: string | null
  modalMaxHeight: Animated.Value
}>;

class AddLyricsBtn extends PureComponent<Props, State> {

  public readonly state: State = {
    lyrics: this.props.lyrics,
    visible: false,
    availableKeys: [],
    selectedKey: null,
    modalMaxHeight: new Animated.Value(0),
  };

  public componentWillMount(): void {
    this.setModalMaxHeight();
  }

  public componentWillReceiveProps(nextProps: Readonly<OwnProps>, nextContext: any): void {
    if (nextProps.lyrics) {
      this.setState({lyrics: nextProps.lyrics});
    }
  }

  private openDialog = () => {
    const availableKeys: string[] = [];
    const usedKeys: string[] = [];
    this.state.lyrics.forEach((item) => {
      usedKeys.push(item.key);
    });
    musicKeysArr.forEach((key) => {
      if (!usedKeys.includes(key)) {
        availableKeys.push(key);
      }
    });
    this.setState({
      availableKeys,
      selectedKey: null,
      visible: true,
    });
  }

  private hideDialog = () => {
    this.setState({visible: false});
  }

  private onAddLyrics = () => {
    const newLyricsItem: LyricsItem = {
      key: this.state.selectedKey as MusicKeys,
      text: "",
    };
    this.props.onAddLyrics(newLyricsItem);
    this.hideDialog();
  }

  private setModalMaxHeight = () => {
    const dims = Dimensions.get("window");
    const margin = dims.height > dims.width ? 250 : 200;

    Animated.spring(this.state.modalMaxHeight, {
      toValue: dims.height - margin,
      bounciness: 0,
    }).start();
  }

  private renderAddButton = () => {
    if (!this.state.lyrics.length) {
      return (
        <Button
          icon="add"
          onPress={this.openDialog}
        >{i18n.t("btn_add_lyrics")}</Button>
      );
    } else {
      return (
        <IconButton
          icon="add"
          size={20}
          onPress={this.openDialog}
        />
      );
    }
  }

  private renderRadioBtn = (key: string) => {
    return (
      <View key={key}>
        <TouchableRipple onPress={() => this.setState({selectedKey: key})}>
          <View style={style.radioContainer}>
            <RadioBtn value={this.state.selectedKey === key}/>
            <Text style={style.radioLabel}>{key || i18n.t("no_chords")}</Text>
          </View>
        </TouchableRipple>
      </View>
    );
  }

  public render() {
    return (
      <View>
        {this.renderAddButton()}
        <Portal>
          <Dialog
            visible={this.state.visible}
            onDismiss={this.hideDialog}>
            <Dialog.Title>{i18n.t("select_chords_key")}</Dialog.Title>

            <Dialog.Content>
              <Animated.View style={{maxHeight: this.state.modalMaxHeight}}
                             onLayout={this.setModalMaxHeight}>
                <ScrollView>
                  {this.state.availableKeys.map((key) => {
                    return this.renderRadioBtn(key);
                  })}
                </ScrollView>
              </Animated.View>
            </Dialog.Content>

            <Dialog.Actions>
              <Button onPress={this.hideDialog}>
                {i18n.t("btn_cancel")}
              </Button>
              <Button onPress={this.onAddLyrics} disabled={typeof this.state.selectedKey !== "string"}>
                {i18n.t("btn_add")}
              </Button>
            </Dialog.Actions>

          </Dialog>
        </Portal>
      </View>
    );
  }
}

export default AddLyricsBtn;

const style = StyleSheet.create({
  radioContainer: {
    width: "100%",
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  radioLabel: {
    opacity: 0.7,
    marginHorizontal: 10,
    fontFamily: "sans-serif-medium",
  },
});
