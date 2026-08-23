import sounddevice as sd
from scipy.io.wavfile import write
import os


def record_audio(
    filename="recordings/answer.wav",
    duration=10,
    samplerate=16000
):

    os.makedirs("recordings", exist_ok=True)

    print("🎤 Speak your answer...")

    recording = sd.rec(
        int(duration * samplerate),
        samplerate=samplerate,
        channels=1,
        dtype="int16"
    )

    sd.wait()

    write(
        filename,
        samplerate,
        recording
    )

    print("✅ Recording saved")

    return filename