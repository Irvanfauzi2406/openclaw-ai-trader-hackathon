import cv2, os, json
path = r'C:\Users\Rika A\.openclaw\workspace\videos\OpenClaw AI Trader - Google Chrome 2026-04-10 09-34-27.mp4'
cap = cv2.VideoCapture(path)
if not cap.isOpened():
    print('open_failed')
    raise SystemExit(1)
fps = cap.get(cv2.CAP_PROP_FPS)
frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
duration = frames / fps if fps else 0
print(json.dumps({'fps': fps, 'frames': frames, 'width': width, 'height': height, 'duration': duration}))
outdir = r'C:\Users\Rika A\.openclaw\workspace\videos\samples'
os.makedirs(outdir, exist_ok=True)
for t in [0, duration*0.25, duration*0.5, duration*0.75, max(duration-1, 0)]:
    cap.set(cv2.CAP_PROP_POS_MSEC, t*1000)
    ok, frame = cap.read()
    if ok:
        name = os.path.join(outdir, f'sample_{int(t):03d}s.jpg')
        cv2.imwrite(name, frame)
        print(name)
cap.release()
