from faster_whisper import WhisperModel

model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8"
)


def transcribe_audio(audio_path: str):
    segments, info = model.transcribe(
    audio_path,
    beam_size=5,
    language="en",
    vad_filter=True
    )

    text = ""

    for segment in segments:
        text += segment.text + " "

    return text.strip()