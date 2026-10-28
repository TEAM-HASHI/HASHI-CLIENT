from pathlib import Path
from pypdf import PdfReader, PdfWriter

root = Path('/Users/mingyeongbin/SIKSA-CLIENT')
source = root / 'tmp/pdfs/posbank-a3-source.pdf'
destination = root / 'output/pdf/민경빈_포스뱅크_이력서_A3.pdf'
reader = PdfReader(source)
assert len(reader.pages) == 1
original_text = reader.pages[0].extract_text()
normalized_text = ''.join(original_text.split())
for expected in ['HASHI', '소상공인 상생 플랫폼', 'FrontPrep', 'RECOVERY30', '2025.03', '2025.06']:
    assert ''.join(expected.split()) in normalized_text, expected
assert 'Snapdeck' not in normalized_text
writer = PdfWriter()
writer.clone_document_from_reader(reader)
writer.pages[0].scale_to(420 * 72 / 25.4, 297 * 72 / 25.4)
writer.add_metadata({'/Title': '민경빈 포스뱅크 지원 이력서', '/Author': '민경빈'})
with destination.open('wb') as stream:
    writer.write(stream)
result = PdfReader(destination)
assert len(result.pages) == 1
assert result.pages[0].extract_text() == original_text
print({'file': str(destination), 'pages': 1, 'size_mm': [round(float(v) * 25.4 / 72, 3) for v in (result.pages[0].mediabox.width, result.pages[0].mediabox.height)], 'text_preserved': True, 'projects_verified': 4, 'bytes': destination.stat().st_size})
