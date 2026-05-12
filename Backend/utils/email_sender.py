import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

def send_tuition_email(to_email: str, student_name: str, volante_numero: str, pdf_content: bytes):
    """
    Envía un correo electrónico al estudiante con su volante de matrícula adjunto.
    """
    if not resend.api_key:
        print("⚠️ Advertencia: RESEND_API_KEY no configurada. El correo no se envió.")
        return False

    try:
        params = {
            "from": "UniEnroll <onboarding@resend.dev>", # Nota: En producción usar dominio verificado
            "to": [to_email],
            "subject": f"Tu Volante de Matrícula {volante_numero} está listo",
            "html": f"""
                <h1>¡Hola, {student_name}!</h1>
                <p>Tu proceso de inscripción ha sido exitoso.</p>
                <p>Adjunto encontrarás tu volante de matrícula con número <strong>{volante_numero}</strong>.</p>
                <p>Por favor, realiza el pago antes de la fecha de vencimiento para asegurar tu cupo.</p>
                <br>
                <p>Saludos,<br>Departamento de Admisiones</p>
            """,
            "attachments": [
                {
                    "filename": f"Volante_{volante_numero}.pdf",
                    "content": list(pdf_content), # Resend espera una lista de bytes o string base64
                }
            ],
        }

        email = resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"❌ Error al enviar correo: {str(e)}")
        return False
