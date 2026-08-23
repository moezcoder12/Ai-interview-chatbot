import edge_tts
import os
import uuid
from playsound import playsound

VOICE = "en-US-AndrewNeural"


async def speak(text):

    os.makedirs("recordings", exist_ok=True)

    filename = f"recordings/{uuid.uuid4()}.mp3"

    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE
    )

    await communicate.save(filename)

    playsound(filename)

    try:
        os.remove(filename)
    except:
        pass