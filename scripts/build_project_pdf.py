from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib import colors

root = Path(r'C:\Users\Rika A\.openclaw\workspace')
out = root / 'PROJECT_DOCUMENTATION_HACKATHON.pdf'

doc = SimpleDocTemplate(
    str(out),
    pagesize=A4,
    rightMargin=2 * cm,
    leftMargin=2 * cm,
    topMargin=2 * cm,
    bottomMargin=2 * cm,
)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleCustom', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=20, leading=24, textColor=colors.HexColor('#111827'), spaceAfter=14))
styles.add(ParagraphStyle(name='HeadingCustom', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=colors.HexColor('#111827'), spaceBefore=8, spaceAfter=8))
styles.add(ParagraphStyle(name='BodyCustom', parent=styles['BodyText'], fontName='Helvetica', fontSize=10.5, leading=15, alignment=TA_LEFT, spaceAfter=6))

story = []

def h(text):
    story.append(Paragraph(text, styles['HeadingCustom']))

def p(text):
    story.append(Paragraph(text, styles['BodyCustom']))

def bullets(items):
    flow = ListFlowable(
        [ListItem(Paragraph(item, styles['BodyCustom'])) for item in items],
        bulletType='bullet',
        start='circle',
        leftIndent=18,
    )
    story.append(flow)
    story.append(Spacer(1, 6))

story.append(Paragraph('ClawTrade — Project Documentation', styles['TitleCustom']))
p('ClawTrade adalah command center trading berbasis AI yang dirancang untuk membantu monitoring market, analisis, dan eksekusi dalam satu workflow terpadu.')
p('Dokumen ini disusun untuk kebutuhan submission hackathon dan menjelaskan gambaran project, teknologi AI yang digunakan, komponen teknis utama, serta cara kerja sistem secara ringkas dan terstruktur.')

h('1. Project Overview')
p('Sistem ini menampilkan data market secara live, lalu menggunakan AI untuk menganalisis struktur market dan menghasilkan rekomendasi trading yang lebih terarah. Hasil analisis mencakup bias trading, entry plan, take profit, dan reasoning yang dapat dipahami dengan cepat.')
p('Pengguna juga dapat menentukan mode kerja, mulai dari advisory hingga auto execute, dengan kontrol risiko yang tetap terjaga. Setelah tervalidasi, trade dapat diteruskan ke pipeline eksekusi berbasis OpenClaw.')

h('2. Problem Statement')
p('Dalam proses trading modern, pengguna sering kali harus berpindah antara banyak tools untuk memantau market, melakukan analisis, mengevaluasi risiko, dan mengeksekusi keputusan. Workflow seperti ini memakan waktu, rawan human error, dan membuat pengambilan keputusan menjadi kurang efisien.')
p('ClawTrade hadir untuk menyatukan proses tersebut ke dalam satu command center yang terintegrasi.')

h('3. Project Objectives')
bullets([
    'Menyediakan monitoring market secara real-time.',
    'Menghasilkan analisis trading berbasis AI yang explainable.',
    'Menjaga proses eksekusi tetap terstruktur dan risk-aware.',
    'Menunjukkan bagaimana OpenClaw dapat berfungsi sebagai orchestration layer untuk aksi operasional.',
])

h('4. Main Features')
bullets([
    'Live market monitoring.',
    'Candlestick chart real-time.',
    'AI trade analysis.',
    'Confidence score dan reasoning.',
    'Entry plan, stop loss, dan take profit.',
    'Mode advisory, semi-auto, dan auto execute.',
    'Execution pipeline berbasis OpenClaw.',
    'Order lifecycle tracking.',
    'Fallback data source dan cached snapshot untuk menjaga stabilitas demo.',
])

h('5. AI Technology Used')
p('ClawTrade menggunakan OpenAI Responses API sebagai engine analisis utama. Model GPT dipakai untuk membaca struktur market dan menghasilkan rekomendasi trading yang lebih terarah.')
p('AI digunakan untuk menghasilkan:')
bullets([
    'Market summary',
    'Action recommendation',
    'Confidence score',
    'Entry plan',
    'Stop loss',
    'Take profit',
    'Reasoning yang mudah dipahami',
])
p('AI dalam project ini dirancang untuk mendukung human-in-the-loop decision making, bukan untuk blind execution tanpa kontrol.')

h('6. Skills / Technical Components Used')
p('Komponen teknis utama yang digunakan pada project ini meliputi frontend, backend, data source, AI layer, dan execution layer.')
p('<b>Frontend:</b> React, Vite, lightweight-charts, Lucide React.')
p('<b>Backend:</b> Express.js, WebSocket, CORS, JSON API handling.')
p('<b>Data Source:</b> Binance REST API, Binance WebSocket, CoinGecko API sebagai fallback.')
p('<b>AI Layer:</b> OpenAI GPT analysis.')
p('<b>Execution Layer:</b> OpenClaw Gateway WebSocket, OpenClaw session flow, order lifecycle tracking.')

h('7. How the Project Works')
p('<b>Step 1 — Collect Live Market Data:</b> Sistem mengambil harga, volume, perubahan harga, dan candlestick dari Binance. Jika koneksi utama tidak tersedia, sistem dapat menggunakan CoinGecko atau cached snapshot sebagai fallback.')
p('<b>Step 2 — Analyze Market with AI:</b> Data market dikirim ke AI engine untuk membaca trend, volatilitas, market structure, dan konteks harga. Setelah itu AI menghasilkan bias trading, summary, confidence, entry plan, stop loss, take profit, dan reasoning.')
p('<b>Step 3 — Display Decision in Dashboard:</b> Hasil analisis ditampilkan langsung pada dashboard agar operator dapat memahami kondisi market dan mengevaluasi apakah trade layak dijalankan.')
p('<b>Step 4 — Validate Execution Mode:</b> Pengguna dapat memilih mode advisory, semi-auto, atau auto execute. Pada tahap ini, kontrol risiko tetap dijaga melalui risk guard.')
p('<b>Step 5 — Route to OpenClaw Execution Pipeline:</b> Jika trade tervalidasi, order dapat diteruskan ke OpenClaw execution pipeline sebagai orchestration layer menuju aksi yang lebih nyata.')
p('<b>Step 6 — Track Lifecycle:</b> Status order dilacak di dashboard, misalnya submitted, approved, executed, atau failed.')

h('8. System Architecture Summary')
bullets([
    'Frontend React menampilkan dashboard dan menerima input pengguna.',
    'Backend Express mengelola API, market data, dan integrasi AI.',
    'Binance dan CoinGecko menjadi sumber data market.',
    'OpenAI GPT digunakan untuk analisis trading.',
    'OpenClaw digunakan untuk orchestration dan execution handoff.',
    'Semua hasil ditampilkan kembali ke dashboard sebagai satu workflow terpadu.',
])

h('9. Innovation and Value')
p('Nilai utama dari ClawTrade terletak pada integrasi observasi market, analisis AI yang explainable, dan orchestration menuju eksekusi. Project ini bukan hanya dashboard market dan bukan hanya chatbot AI, tetapi gabungan keduanya menjadi workflow yang lebih dekat ke penggunaan nyata.')
p('Bagi juri hackathon, kekuatan project ini ada pada inovasi penggunaan AI dalam trading workflow, technical execution yang modular, real-world value, dan demonstrasi integrasi OpenClaw ke dalam sistem operasional.')

h('10. Conclusion')
p('ClawTrade adalah command center trading berbasis AI yang menggabungkan monitoring market, analisis, dan eksekusi dalam satu workflow terpadu.')
p('Melalui ClawTrade, kami menunjukkan bagaimana AI dapat bergerak dari sekadar memberikan insight menjadi bagian dari workflow operasional yang nyata, lebih terstruktur, dan lebih siap digunakan dalam skenario modern.')

doc.build(story)
print(out)
