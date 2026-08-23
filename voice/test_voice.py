from recorder import record_audio
from speech_to_text import transcribe_audio

audio_file = record_audio(duration=10)

text = transcribe_audio(audio_file)

print("\n==========================")
print("Transcript:")
print(text)
print("==========================")