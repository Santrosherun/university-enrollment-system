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

def send_welcome_email(to_email: str, user_name: str, username: str, raw_password: str, rol: str):
    """
    Envía un correo de bienvenida con las credenciales de acceso al nuevo usuario creado por el administrador.
    """
    if not resend.api_key:
        print("⚠️ Advertencia: RESEND_API_KEY no configurada. Correo de bienvenida omitido.")
        return False

    try:
        params = {
            "from": "Universidad del Caribe Colombiano <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "¡Bienvenido! Credenciales de Acceso al Sistema",
            "html": f"""
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #004a99; color: white; padding: 24px; text-align: center;">
                        <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Universidad del Caribe Colombiano</h2>
                        <p style="margin: 6px 0 0 0; font-size: 13px; color: #e0f2fe;">Plataforma de Gestión Académica y Financiera</p>
                    </div>
                    <div style="padding: 32px;">
                        <h3 style="color: #0f172a; font-size: 18px; margin-top: 0;">¡Hola, {user_name}!</h3>
                        <p style="color: #334155; line-height: 1.6;">El equipo de administración ha aprovisionado exitosamente tu cuenta de usuario institucional asignándote el rol de <strong style="color: #004a99;">{rol}</strong>.</p>
                        
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 24px 0;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a;"><strong>Credenciales de Autenticación Asignadas:</strong></p>
                            <p style="margin: 8px 0; color: #334155;">👤 <strong>Usuario:</strong> <span style="font-family: monospace; background: #fff; padding: 3px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 600; color: #0f172a;">{username}</span></p>
                            <p style="margin: 8px 0; color: #334155;">🔑 <strong>Clave de Acceso:</strong> <span style="font-family: monospace; background: #fff; padding: 3px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 600; color: #004a99;">{raw_password}</span></p>
                        </div>
                        
                        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">Por directrices de seguridad institucional, te sugerimos actualizar esta contraseña temporal desde tu panel de usuario tras tu primer inicio de sesión exitoso.</p>
                        
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Este es un mensaje transaccional automatizado. Por favor no respondas a esta dirección.</p>
                    </div>
                </div>
            """,
        }
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"❌ Error al enviar correo de bienvenida: {str(e)}")
        return False
