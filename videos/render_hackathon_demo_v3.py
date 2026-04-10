from moviepy import VideoFileClip, AudioFileClip, concatenate_videoclips
from pathlib import Path

base = Path(r'C:\Users\Rika A\.openclaw\workspace\videos')
video_path = base / 'OpenClaw AI Trader - Google Chrome 2026-04-10 09-34-27.mp4'
audio_path = base / 'voiceover_id_v2.mp3'
out_path = base / 'hackathon_demo_final_v3.mp4'

# 6 narration blocks mapped more tightly to visual beats.
segments = [
    (0, 8),      # intro / hero
    (20, 31),    # live market + chart + risk
    (100, 112),  # AI summary and reasoning
    (60, 70),    # mode/pair interaction
    (120, 130),  # execution pipeline updated state
    (130, 145),  # closing hero / polished ending
]

video = VideoFileClip(str(video_path))
clips = [video.subclipped(start, end) for start, end in segments]
assembled = concatenate_videoclips(clips, method='compose')
audio = AudioFileClip(str(audio_path))

# Match final duration to audio for better sync feel.
if assembled.duration > audio.duration:
    assembled = assembled.subclipped(0, audio.duration)
elif audio.duration > assembled.duration:
    audio = audio.subclipped(0, assembled.duration)

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
