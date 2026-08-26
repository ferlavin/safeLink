from io import BytesIO

from pypdf import PdfWriter
from pypdf.annotations import Link

from services.pdf_scanner import analyze_pdf, extract_urls_from_pdf


def _pdf_with_annotation(url: str) -> bytes:
    writer = PdfWriter()
    writer.add_blank_page(width=400, height=400)
    writer.add_annotation(
        page_number=0,
        annotation=Link(rect=(40, 40, 280, 90), url=url),
    )
    buf = BytesIO()
    writer.write(buf)
    return buf.getvalue()


def _pdf_with_hidden_url(url: str) -> bytes:
    writer = PdfWriter()
    writer.add_blank_page(width=400, height=400)
    buf = BytesIO()
    writer.write(buf)
    return buf.getvalue().replace(b"%%EOF", f"% {url}\n%%EOF".encode("ascii"))


def test_pdf_lee_hipervinculo_aunque_no_este_en_el_texto():
    url = "https://bancogalica.com/login"
    content = _pdf_with_annotation(url)
    found = extract_urls_from_pdf(content)
    assert any("bancogalica.com" in item for item in found)


def test_pdf_analiza_enlace_falso_como_riesgo():
    url = "https://bancogalica.com/login"
    result = analyze_pdf(_pdf_with_annotation(url), "factura.pdf")
    assert result["detalle"]["total_enlaces"] >= 1
    assert result["detalle"]["enlaces"]
    assert result["nivel_riesgo"] in {"alto", "critico"}
    assert result["detalle"]["resumen"][0] != "No se encontraron enlaces en el PDF"


def test_pdf_lee_url_escondida_en_el_archivo():
    url = "https://bancogalica.com/login"
    found = extract_urls_from_pdf(_pdf_with_hidden_url(url))
    assert any("bancogalica.com" in item for item in found)
