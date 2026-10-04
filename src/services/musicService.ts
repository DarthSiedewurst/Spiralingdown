export default class MusicService {
  // Dynamisch alle Musikdateien importieren
  static gonzalesPlaylist = Object.values(
    import.meta.glob("../assets/music/*.mp3", { eager: true }),
  ).map((module: any) => module.default);

  // Zufälligen Track auswählen
  static getRandomTrackNumber() {
    return Math.floor(Math.random() * MusicService.gonzalesPlaylist.length);
  }

  static trackNumber = MusicService.getRandomTrackNumber();
  static gonzales = new Audio(MusicService.gonzalesPlaylist[MusicService.trackNumber]);

  public playMusic() {
    console.log("Tracknummer: " + MusicService.trackNumber);
    MusicService.gonzales.play();
    MusicService.gonzales.onended = () => {
      this.stopMusic();
      this.playMusic(); // Spielt den nächsten zufälligen Song
    };
  }

  public stopMusic() {
    MusicService.gonzales.pause();
    MusicService.gonzales.currentTime = 0;

    const newTrackNumber = MusicService.getRandomTrackNumber();
    while (newTrackNumber === MusicService.trackNumber) {
      MusicService.trackNumber = MusicService.getRandomTrackNumber();
    }
    MusicService.trackNumber = newTrackNumber;

    MusicService.gonzales = new Audio(MusicService.gonzalesPlaylist[MusicService.trackNumber]);
  }
}
