import cv2, os
path = r'C:\Users\Rika A\.openclaw\workspace\videos\OpenClaw AI Trader - Google Chrome 2026-04-10 09-34-27.mp4'
outdir = r'C:\Users\Rika A\.openclaw\workspace\videos\samples_many'
os.makedirs(outdir, exist_ok=True)
cap = cv2.VideoCapture(path)
if not cap.isOpened():
    raise SystemExit('open_failed')
fps = cap.get(cv2.CAP_PROP_FPS)
frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
duration = frames / fps if fps else 0
for t in range(0, int(duration), 10):
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, frame = cap.read()
    if ok:
        cv2.imwrite(os.path.join(outdir, f'sample_{t:03d}s.jpg'), frame)
print(outdir)
cap.release()
