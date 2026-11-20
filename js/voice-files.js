/* Recordings of the app's own lines, in the narrator's voice.
   Each entry links a line id (see RECORDING-SCRIPT.md) to its audio file, for example:
     "ojo.morning.1": "audio/voice/A1-04.mp3"
   Lines without a recording use a matching line from The Ojo Treasury narration where there is one,
   otherwise the device's voice. This file is rebuilt when new recordings are added. */
window.VOICE_FILES = {};
