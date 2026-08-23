import sounddevice as sd
from scipy.io.wavfile import write
import os

SAMPLE_RATE = 16000


def record_audio(
    filename="recordings/answer.wav",
    duration=10
):
    os.makedirs("recordings", exist_ok=True)

    print("🎤 Recording started...")
    print(f"Speak for {duration} seconds.")

    audio = sd.rec(
        int(duration * SAMPLE_RATE),
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype="int16"
    )

    sd.wait()

    write(
        filename,
        SAMPLE_RATE,
        audio
    )

    print("✅ Recording completed.")
    print(f"Saved to: {filename}")

    return filename