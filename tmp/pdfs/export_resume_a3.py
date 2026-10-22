from pathlib import Path
from pypdf import PdfReader, PdfWriter

source = Path('/Users/mingyeongbin/SIKSA-CLIENT/tmp/pdfs/resume-a3-figma-export.pdf')
destination = Path('/Users/mingyeongbin/SIKSA-CLIENT/output/pdf/민경빈_이력서_A3_가로.pdf')
reader = PdfReader(source)
assert len(reader.pages) == 1
original_text = reader.pages[0].extract_text()
writer = PdfWriter()
writer.clone_document_from_reader(reader)
page = writer.pages[0]
page.scale_to(420 * 72 / 25.4, 297 * 72 / 25.4)
writer.add_metadata({'/Title': '민경빈 프론트엔드 개발자 이력서', '/Author': '민경빈'})
with destination.open('wb') as stream:
    writer.write(stream)
result = PdfReader(destination)
assert len(result.pages) == 1
assert result.pages[0].extract_text() == original_text
print({'file': str(destination), 'pages': len(result.pages), 'size_mm': [round(float(x) * 25.4 / 72, 3) for x in (result.pages[0].mediabox.width, result.pages[0].mediabox.height)], 'text_preserved': True, 'bytes': destination.stat().st_size})
