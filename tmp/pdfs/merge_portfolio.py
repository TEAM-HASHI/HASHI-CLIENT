from pathlib import Path
from pypdf import PdfReader, PdfWriter

root = Path('/Users/mingyeongbin/SIKSA-CLIENT')
sources = [root / f'tmp/pdfs/portfolio-{i:02d}-source.pdf' for i in (1, 2)]
output = root / 'output/pdf/민경빈_포트폴리오.pdf'
writer = PdfWriter()
expected = []
for path in sources:
    reader = PdfReader(path)
    assert len(reader.pages) == 1
    expected.append(reader.pages[0].extract_text())
    writer.append(reader)
writer.add_metadata({'/Title': '민경빈 포트폴리오', '/Author': '민경빈'})
with output.open('wb') as stream:
    writer.write(stream)
result = PdfReader(output)
assert len(result.pages) == 2
for index, page in enumerate(result.pages):
    assert page.extract_text() == expected[index], f'Text mismatch on page {index + 1}'
    print({'page': index + 1, 'points': [float(page.mediabox.width), float(page.mediabox.height)], 'characters': len(expected[index])})
print({'output': str(output), 'bytes': output.stat().st_size, 'text_preserved': True})
