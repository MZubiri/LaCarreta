import React from 'react';
import { Link } from 'react-router-dom';

export const Terms = () => {
  return (
    <div className="legal-page section container" style={{ maxWidth: '800px', padding: '4rem 1rem 6rem 1rem' }}>
      <span className="section-tag" style={{ textAlign: 'center' }}>Documento Legal</span>
      <h1 style={{ fontSize: '2.75rem', textAlign: 'center', marginBottom: '0.5rem' }}>Términos y Condiciones</h1>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: '3rem' }}>
        Última actualización: Septiembre 2026
      </p>

      <div className="legal-content" style={{ lineHeight: 1.8, color: '#444' }}>
        <h2>1. Información General</h2>
        <p>
          Florería La Carreta es un negocio de arreglos florales artesanales ubicado en 
          Cra 49 # 131 Sur-69, Caldas, Antioquia, Colombia. Al utilizar este sitio web 
          y realizar pedidos a través de él, aceptas estos términos y condiciones.
        </p>

        <h2>2. Productos y Precios</h2>
        <p>
          Todos los precios están expresados en Pesos Colombianos (COP) e incluyen IVA cuando aplique. 
          Las imágenes de los arreglos florales son de referencia; dado que trabajamos con flores naturales, 
          pueden existir variaciones menores en color, tamaño y disponibilidad de especies según la temporada. 
          En caso de sustitución, utilizaremos flores de igual o superior calidad manteniendo la estética del diseño.
        </p>

        <h2>3. Pedidos y Pagos</h2>
        <p>
          Los pedidos se confirman a través de WhatsApp o correo electrónico. No se realiza cobro automático 
          con tarjeta de crédito en este sitio web. Los métodos de pago aceptados son:
        </p>
        <ul>
          <li>Transferencia bancaria (Bancolombia)</li>
          <li>Nequi</li>
          <li>Daviplata</li>
          <li>Efectivo contra entrega</li>
        </ul>
        <p>El pedido se considera confirmado una vez verificado el pago o acordado el método de pago contra entrega.</p>

        <h2>4. Entregas</h2>
        <p>
          Realizamos entregas a domicilio en Caldas, La Estrella, Sabaneta, Envigado, Itagüí y Medellín. 
          Para entregas el mismo día, los pedidos deben confirmarse antes de las 12:00 PM. 
          Los horarios de entrega son por jornada (Mañana: 8AM-1PM o Tarde: 1PM-6PM) y no garantizamos 
          una hora exacta dentro de la jornada seleccionada.
        </p>
        <p>
          El costo de envío varía según la zona de entrega y será informado al confirmar el pedido por WhatsApp.
        </p>

        <h2>5. Cambios y Cancelaciones</h2>
        <p>
          Dado que los arreglos florales son productos perecederos preparados bajo pedido:
        </p>
        <ul>
          <li>Cancelaciones con más de 24 horas de anticipación: reembolso completo.</li>
          <li>Cancelaciones con menos de 24 horas: no se admiten reembolsos si el arreglo ya fue preparado.</li>
          <li>Cambios de dirección o fecha: sujetos a disponibilidad y deben solicitarse con al menos 12 horas de anticipación.</li>
        </ul>

        <h2>6. Garantía de Frescura</h2>
        <p>
          Garantizamos que todas las flores se entregan frescas y en óptimas condiciones. Si al recibir 
          el arreglo detectas un problema de calidad, contáctanos por WhatsApp dentro de las primeras 
          2 horas con fotografías del producto para evaluar y resolver la situación.
        </p>

        <h2>7. Contacto</h2>
        <p>
          Para cualquier consulta sobre estos términos, contáctanos a través de:
        </p>
        <ul>
          <li>WhatsApp: <a href="https://wa.me/573206468689">+57 320 646 8689</a></li>
          <li>Dirección: Cra 49 # 131 Sur-69, Caldas, Antioquia</li>
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
