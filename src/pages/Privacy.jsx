import React from 'react';
import { Link } from 'react-router-dom';

export const Privacy = () => {
  return (
    <div className="legal-page section container" style={{ maxWidth: '800px', padding: '4rem 1rem 6rem 1rem' }}>
      <span className="section-tag" style={{ textAlign: 'center' }}>Documento Legal</span>
      <h1 style={{ fontSize: '2.75rem', textAlign: 'center', marginBottom: '0.5rem' }}>Política de Privacidad</h1>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: '3rem' }}>
        Última actualización: Septiembre 2026
      </p>

      <div className="legal-content" style={{ lineHeight: 1.8, color: '#444' }}>
        <h2>1. Responsable del Tratamiento</h2>
        <p>
          Florería La Carreta, ubicada en Cra 49 # 131 Sur-69, Caldas, Antioquia, Colombia, 
          es responsable del tratamiento de los datos personales recopilados a través de este sitio web, 
          en cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.
        </p>

        <h2>2. Datos que Recopilamos</h2>
        <p>Recopilamos únicamente los datos necesarios para procesar tus pedidos:</p>
        <ul>
          <li><strong>Nombre completo:</strong> Para identificar al cliente y personalizar la entrega.</li>
          <li><strong>Número de teléfono:</strong> Para coordinar la entrega y resolver dudas del pedido.</li>
          <li><strong>Correo electrónico (opcional):</strong> Para enviar confirmación de pedido.</li>
          <li><strong>Dirección de entrega:</strong> Para realizar la entrega a domicilio.</li>
          <li><strong>Mensaje de la tarjeta:</strong> Para personalizar la dedicatoria del arreglo.</li>
        </ul>

        <h2>3. Finalidad del Tratamiento</h2>
        <p>Tus datos personales se utilizan exclusivamente para:</p>
        <ul>
          <li>Procesar y entregar tus pedidos de arreglos florales.</li>
          <li>Contactarte para confirmar detalles de entrega.</li>
          <li>Enviar confirmaciones de pedido por correo electrónico (si lo proporcionas).</li>
          <li>Atender consultas y reclamos relacionados con tu pedido.</li>
        </ul>

        <h2>4. Compartición de Datos</h2>
        <p>
          No vendemos, alquilamos ni compartimos tus datos personales con terceros, 
          salvo con nuestro personal de entregas para cumplir con el servicio contratado.
        </p>

        <h2>5. Almacenamiento y Seguridad</h2>
        <p>
          Los datos de pedidos se almacenan en servidores protegidos con medidas de seguridad 
          técnicas y administrativas adecuadas. La comunicación entre tu navegador y nuestro 
          servidor está cifrada mediante HTTPS/SSL.
        </p>

        <h2>6. Derechos del Titular</h2>
        <p>De acuerdo con la ley colombiana, tienes derecho a:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada.</li>
          <li>Ser informado sobre el uso que se da a tus datos.</li>
          <li>Revocar la autorización y solicitar la supresión de tus datos.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
        </ul>

        <h2>7. Cookies</h2>
        <p>
          Este sitio utiliza almacenamiento local del navegador (localStorage) para mantener 
          tu carrito de compras y preferencia de idioma. No utilizamos cookies de rastreo 
          ni herramientas de seguimiento de terceros.
        </p>

        <h2>8. Contacto</h2>
        <p>
          Para ejercer tus derechos o realizar consultas sobre esta política, contáctanos:
        </p>
        <ul>
          <li>WhatsApp: <a href="https://wa.me/573206468689">+57 320 646 8689</a></li>
          <li>Dirección: Cra 49 # 131 Sur-69, Caldas, Antioquia, Colombia</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', maxWidth: '240px' }}>
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};
