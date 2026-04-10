from moviepy import VideoFileClip, AudioFileClip, concatenate_videoclips
from pathlib import Path

base = Path(r'C:\Users\Rika A\.openclaw\workspace\videos')
video_path = base / 'OpenClaw AI Trader - Google Chrome 2026-04-10 09-34-27.mp4'
audio_path = base / 'voiceover_id.mp3'
out_path = base / 'hackathon_demo_final.mp4'

# Keep the strongest contiguous 75-second region from the raw recording.
# This aligns with the prepared narration and avoids overcomplicated multi-cut rendering.
start = 0
end = 75

video = VideoFileClip(str(video_path)).subclipped(start, end)
audio = AudioFileClip(str(audio_path))

if audio.duration < video.duration:
    video = video.subclipped(0, audio.duration)
elif audio.duration > video.duration:
    audio = audio.subclipped(0, video.duration)

final = video.with_audio(audio)
final.write_videofile(
    str(out_path),
    codec='libx264',
    audio_codec='aac',
    fps=video.fps or 24,
    preset='medium',
)

video.close()
audio.close()
final.close()
print(out_path)
