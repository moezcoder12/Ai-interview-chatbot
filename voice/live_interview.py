from audio_recorder import record_audio
from speech_to_text import transcribe_audio
from text_to_speech import speak


question = """
Please introduce yourself.
"""
print(question)

speak(question)

audio_file = record_audio(
    duration=10
)
answer = transcribe_audio(
    audio_file
)

print("\nCandidate Answer:")
print(answer)

speak(
    f"Your answer was: {answer}"
)