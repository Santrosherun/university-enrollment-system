from fpdf import FPDF
import io
from datetime import datetime

class VolantePDF(FPDF):
    def header(self):
        # Logo o Nombre de la Universidad
        self.set_font('Arial', 'B', 16)
        self.set_text_color(0, 74, 153) # Azul Institucional
        self.cell(0, 10, 'UNIVERSIDAD DEL CARIBE COLOMBIANO', 0, 1, 'C')
        self.set_font('Arial', 'B', 12)
        self.set_text_color(51, 51, 51)
        self.cell(0, 10, 'VOLANTE DE PAGO DE MATRÍCULA', 0, 1, 'C')
        self.ln(5)
        self.line(10, 32, 200, 32)
        self.ln(10)

    def footer(self):
        self.set_y(-30)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, 'Este volante es un documento oficial. Puede pagar en bancos autorizados o vía PSE.', 0, 1, 'C')
        self.cell(0, 10, f'Página {self.page_no()}', 0, 0, 'C')

def generate_volante_pdf(data: dict):
    pdf = VolantePDF()
    pdf.add_page()
    
    # Datos del Volante
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(40, 10, f"Número de Volante:", 0, 0)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 10, data['numero_volante'], 0, 1)
    
    pdf.ln(5)
    
    # Cuadro de Datos del Estudiante
    pdf.set_fill_color(242, 242, 242)
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(0, 8, " DATOS DEL ESTUDIANTE", 0, 1, 'L', True)
    
    pdf.set_font('Arial', 'B', 9)
    pdf.cell(30, 8, " Nombre:", 1, 0)
    pdf.set_font('Arial', '', 9)
    pdf.cell(70, 8, f" {data['estudiante_nombre']}", 1, 0)
    
    pdf.set_font('Arial', 'B', 9)
    pdf.cell(30, 8, " Documento:", 1, 0)
    pdf.set_font('Arial', '', 9)
    pdf.cell(0, 8, f" {data['documento']}", 1, 1)
    
    pdf.set_font('Arial', 'B', 9)
    pdf.cell(30, 8, " Programa:", 1, 0)
    pdf.set_font('Arial', '', 9)
    pdf.cell(70, 8, f" {data['programa']}", 1, 0)
    
    pdf.set_font('Arial', 'B', 9)
    pdf.cell(30, 8, " Periodo:", 1, 0)
    pdf.set_font('Arial', '', 9)
    pdf.cell(0, 8, f" {data['periodo']}", 1, 1)
    
    pdf.ln(10)
    
    # Cuadro de Conceptos
    pdf.set_fill_color(242, 242, 242)
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(0, 8, " CONCEPTOS A PAGAR", 0, 1, 'L', True)
    
    # Cabecera de Tabla
    pdf.set_font('Arial', 'B', 9)
    pdf.cell(90, 8, " Concepto", 1, 0, 'C', True)
    pdf.cell(30, 8, " Cantidad", 1, 0, 'C', True)
    pdf.cell(35, 8, " Valor Unitario", 1, 0, 'C', True)
    pdf.cell(35, 8, " Subtotal", 1, 1, 'C', True)
    
    # Filas
    pdf.set_font('Arial', '', 9)
    for det in data['detalles']:
        pdf.cell(90, 8, f" {det['nombre']}", 1, 0)
        pdf.cell(30, 8, f" {det['cantidad']}", 1, 0, 'C')
        pdf.cell(35, 8, f" ${det['valor_unitario']:,.2f}", 1, 0, 'R')
        pdf.cell(35, 8, f" ${ (det['cantidad'] * det['valor_unitario']):,.2f}", 1, 1, 'R')
        
    # Total
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(155, 10, "TOTAL A PAGAR: ", 1, 0, 'R', True)
    pdf.cell(35, 10, f" ${data['total']:,.2f}", 1, 1, 'R', True)
    
    pdf.ln(10)
    pdf.set_font('Arial', '', 8)
    pdf.cell(0, 5, f"Fecha de impresión: {data['fecha_impresion']}", 0, 1, 'R')

    # Retornar como bytes
    return pdf.output()
