"""Generate a small original, instrumental piano-like loop with no external assets."""
import math, wave, struct
from pathlib import Path
rate = 22050
duration = 24
samples = [0.0] * (rate * duration)
chords = [(48, 52, 55, 60), (45, 48, 52, 57), (41, 45, 48, 53), (43, 47, 50, 55)]
for beat in range(32):
    chord = chords[(beat // 8) % 4]
    notes = [chord[beat % 4] + (12 if beat % 8 > 3 else 0)]
    if beat % 8 == 0:
        notes.append(chord[0] - 12)
    for note in notes:
        freq = 440 * 2 ** ((note - 69) / 12)
        start = int(beat * .75 * rate)
        for n in range(min(int(3.5 * rate), len(samples) - start)):
            t = n / rate
            envelope = (1 - math.exp(-t * 80)) * math.exp(-t * 2.1)
            tone = sum(math.sin(2 * math.pi * freq * h * t) * math.exp(-t * h * .17) / h ** 2 for h in range(1, 5))
            samples[start + n] += tone * envelope * .2
target = Path(__file__).parent / 'assets/audio/background.wav'
with wave.open(str(target), 'wb') as audio:
    audio.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
    audio.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, s)) * 24000)) for s in samples))
print(target)
