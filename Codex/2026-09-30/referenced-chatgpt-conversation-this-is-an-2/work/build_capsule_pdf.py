from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


OUTPUT = Path('outputs/capsule_contents_description_edited.pdf')
PAGE_WIDTH, PAGE_HEIGHT = letter

INK = HexColor('#162B42')
BLUE = HexColor('#2D6FA8')
GREEN = HexColor('#008755')
MUTED = HexColor('#496273')


def centered_text(pdf, text, y, font_name, font_size, color):
    pdf.setFont(font_name, font_size)
    pdf.setFillColor(color)
    pdf.drawString((PAGE_WIDTH - stringWidth(text, font_name, font_size)) / 2, y, text)


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(OUTPUT), pagesize=letter, pageCompression=1)
    pdf.setTitle('Capsule Contents Description')
    pdf.setAuthor('')

    # Simple civic accent, with no retained logo or branding mark.
    pdf.setStrokeColor(BLUE)
    pdf.setLineWidth(2.4)
    pdf.line(72, 714, 300, 714)
    pdf.setStrokeColor(GREEN)
    pdf.line(312, 714, 540, 714)

    body = [
        'These items were found in the orginal Washington School Time Capsule.',
        'Shawnee Parks and Recreation will return these items to a new Time Capsule',
        'to be placed in the Washington School Memorial in the rennovated Farrall Park.',
    ]
    y = 558
    for line in body:
        centered_text(pdf, line, y, 'Times-Roman', 19, INK)
        y -= 39

    pdf.setStrokeColor(HexColor('#B8C7D1'))
    pdf.setLineWidth(0.75)
    pdf.line(202, 386, 410, 386)

    centered_text(pdf, 'Any Questions?', 320, 'Times-Bold', 22, INK)
    centered_text(pdf, 'Contact: cord.bender@shawneeok.org', 262, 'Times-Roman', 18, MUTED)
    centered_text(pdf, 'Visit: www.shawneeok.org', 220, 'Times-Roman', 18, MUTED)

    pdf.setStrokeColor(GREEN)
    pdf.setLineWidth(1.1)
    pdf.line(72, 78, 540, 78)
    pdf.save()


if __name__ == '__main__':
    main()
