from moviepy import VideoFileClip, AudioFileClip, concatenate_videoclips
from pathlib import Path

base = Path(r'C:\Users\Rika A\.openclaw\workspace\videos')
video_path = base / 'OpenClaw AI Trader - Google Chrome 2026-04-10 09-34-27.mp4'
audio_path = base / 'voiceover_id.mp3'
out_path = base / 'hackathon_demo_final_v2.mp4'

# Tighter, more cinematic selection from the raw recording.
# Chosen from manual frame sampling analysis.
segments = [
    (0, 6),      # clean hero shot
    (20, 28),    # chart + AI console
    (50, 58),    # live fallback / active state change
    (60, 68),    # ETH pair switch
    (100, 112),  # lower section: decision summary + pipeline
    (120, 128),  # ETH switch / updated state
    (130, 138),  # polished ETH hero shot
    (150, 159),  # advisory mode state change for closing variety
]

video = VideoFileClip(str(video_path))
clips = [video.subclipped(start, end) for start, end in segments]
assembled = concatenate_videoclips(clips, method='compose')
audio = AudioFileClip(str(audio_path))

final_duration = min(assembled.duration, audio.duration)
assembled = assembled.subclipped(0, final_duration)
audio = audio.subclipped(0, final_duration)
final = assembled.with_audio(audio)

final.write_videofile(
    str(out_path),
    codec='libx264',
    audio_codec='aac',
    fps=video.fps or 24,
    preset='medium',
)

for clip in clips:
    clip.close()
video.close()
audio.close()
assembled.close()
final.close()
print(out_path)
