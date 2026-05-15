import io
from datetime import datetime

def generate_volante_pdf(data: dict) -> bytes:
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Volante {data.get('numero_volante', '')}</title>
        <style>
            @page {{
                size: A4;
                margin: 20mm;
                @top-center {{
                    content: "Documento Oficial — Universidad del Caribe Colombiano";
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    font-size: 8pt;
                    color: #888;
                }}
                @bottom-right {{
                    content: "Página " counter(page) " de " counter(pages);
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    font-size: 8pt;
                    color: #888;
                }}
            }}
            body {{
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #2b2b2b;
                line-height: 1.5;
                font-size: 10pt;
                margin: 0;
                padding: 0;
            }}
            .header {{
                text-align: center;
                border-bottom: 3px solid #004a99;
                padding-bottom: 12px;
                margin-bottom: 25px;
            }}
            .header h1 {{
                color: #004a99;
                font-size: 18pt;
                font-weight: 800;
                letter-spacing: 0.5px;
                margin: 0;
            }}
            .header h2 {{
                font-size: 12pt;
                color: #555;
                font-weight: 600;
                margin: 5px 0 0 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            .volante-id {{
                font-size: 11pt;
                margin-bottom: 20px;
                background-color: #f8fafc;
                padding: 8px 12px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
            }}
            .section-title {{
                background-color: #f1f5f9;
                padding: 8px 12px;
                font-weight: bold;
                font-size: 11pt;
                color: #0f172a;
                margin-top: 25px;
                margin-bottom: 12px;
                border-left: 4px solid #004a99;
                border-radius: 0 4px 4px 0;
            }}
            .info-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }}
            .info-table td {{
                padding: 8px 10px;
                border: 1px solid #cbd5e1;
                font-size: 9.5pt;
            }}
            .info-table td.label {{
                font-weight: bold;
                background-color: #f8fafc;
                width: 18%;
                color: #334155;
            }}
            .items-table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }}
            .items-table th {{
                background-color: #004a99;
                color: white;
                padding: 10px;
                text-align: left;
                font-size: 9.5pt;
                font-weight: 600;
            }}
            .items-table td {{
                padding: 10px;
                border-bottom: 1px solid #e2e8f0;
                font-size: 9.5pt;
            }}
            .items-table tr:nth-child(even) {{
                background-color: #f8fafc;
            }}
            .text-right {{
                text-align: right;
            }}
            .text-center {{
                text-align: center;
            }}
            .total-row {{
                font-weight: bold;
                font-size: 12pt;
                background-color: #eff6ff !important;
                border-top: 2px solid #004a99;
                border-bottom: 2px solid #004a99;
            }}
            .total-val {{
                color: #004a99;
                font-size: 13pt;
            }}
            .footer-note {{
                margin-top: 40px;
                font-size: 8pt;
                text-align: right;
                color: #64748b;
                border-top: 1px solid #e2e8f0;
                padding-top: 10px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>UNIVERSIDAD DEL CARIBE COLOMBIANO</h1>
            <h2>Volante de Pago de Matrícula</h2>
        </div>

        <div class="volante-id">
            <strong>Número de Referencia:</strong> <span style="font-family: monospace; color: #004a99; font-size: 12pt;">{data.get('numero_volante', '')}</span>
        </div>

        <div class="section-title">DATOS DEL ESTUDIANTE</div>
        <table class="info-table">
            <tr>
                <td class="label">Estudiante:</td>
                <td style="font-weight: bold; color: #000;">{data.get('estudiante_nombre', '')}</td>
                <td class="label">Documento:</td>
                <td>{data.get('documento', '')}</td>
            </tr>
            <tr>
                <td class="label">Programa:</td>
                <td>{data.get('programa', '')}</td>
                <td class="label">Periodo:</td>
                <td>{data.get('periodo', '')}</td>
            </tr>
        </table>

        <div class="section-title">DESGLOSE DE CONCEPTOS A PAGAR</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Concepto Liquidado</th>
                    <th class="text-center" style="width: 12%;">Cant.</th>
                    <th class="text-right" style="width: 22%;">Valor Unitario</th>
                    <th class="text-right" style="width: 22%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
"""
    for det in data.get('detalles', []):
        subt = det['cantidad'] * det['valor_unitario']
        html_content += f"""
                <tr>
                    <td style="font-weight: 500;">{det['nombre']}</td>
                    <td class="text-center">{det['cantidad']:.0f}</td>
                    <td class="text-right">${det['valor_unitario']:,.2f}</td>
                    <td class="text-right" style="font-weight: 600;">${subt:,.2f}</td>
                </tr>
"""
    
    html_content += f"""
                <tr class="total-row">
                    <td colspan="3" class="text-right" style="padding: 12px 10px;">TOTAL LIQUIDADO ORIGINAL:</td>
                    <td class="text-right total-val" style="padding: 12px 10px; color: #555;">${data.get('total', 0):,.2f}</td>
                </tr>
                {f"""
                <tr>
                    <td colspan="3" class="text-right" style="padding: 8px 10px; color: #059669; font-weight: bold;">(-) ABONOS REALIZADOS A LA FECHA:</td>
                    <td class="text-right" style="padding: 8px 10px; color: #059669; font-weight: bold;">-${data.get('pagado', 0):,.2f}</td>
                </tr>
                <tr class="total-row" style="background-color: #004a99 !important;">
                    <td colspan="3" class="text-right" style="padding: 12px 10px; color: white;">SALDO NETO PENDIENTE DE PAGO:</td>
                    <td class="text-right total-val" style="padding: 12px 10px; color: white; font-size: 15pt;">${data.get('saldo', 0):,.2f}</td>
                </tr>
                """ if data.get('pagado', 0) > 0 else f"""
                <tr class="total-row">
                    <td colspan="3" class="text-right" style="padding: 12px 10px;">TOTAL NETO A PAGAR:</td>
                    <td class="text-right total-val" style="padding: 12px 10px;">${data.get('total', 0):,.2f}</td>
                </tr>
                """}
            </tbody>
        </table>

        <div style="margin-top: 30px; font-size: 8.5pt; color: #475569; text-align: center; background-color: #f8fafc; padding: 10px; border-radius: 6px; border: 1px dashed #cbd5e1;">
            Este documento constituye un título oficial de recaudo. Realice su pago únicamente a través de los canales electrónicos autorizados (PSE) o en las ventanillas bancarias adscritas al convenio institucional.
        </div>

        <div class="footer-note">
            Generado por el Sistema de Matrículas Financieras — Fecha y hora de liquidación: {data.get('fecha_impresion', '')}
        </div>
    </body>
    </html>
    """

    try:
        from weasyprint import HTML
        return HTML(string=html_content).write_pdf()
    except Exception as e:
        print(f"Error renderizando PDF con WeasyPrint: {e}")
        # Retorno de fallback amigable en formato PDF si la librería carece de dependencias nativas en el S.O.
        # De este modo evitamos que la descarga falle con error 500 y permitimos depurar en consola
        fallback_pdf = f"%PDF-1.4\n1 0 obj\n<< /Title (Volante Fallback) >>\nendobj\n% Error WeasyPrint: {str(e).replace('(', '[').replace(')', ']')}"
        return fallback_pdf.encode('utf-8', errors='ignore')
