export const formatCOP = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const generateWhatsAppLink = (cartItems, customerData, language = 'es', customPhone = null) => {
  const phoneNumber = customPhone ? customPhone.replace(/\D/g, '') : '573206468689';
  
  const isSpanish = language === 'es';
  const nameKey = isSpanish ? 'name_es' : 'name_en';

  let message = isSpanish 
    ? `¡Hola Florería La Carreta! Me gustaría realizar un pedido.`
    : `Hello Florería La Carreta! I would like to place an order.`;

  if (customerData.orderCode) {
    message += `%0A*Código de Pedido:* ${customerData.orderCode}%0A`;
  } else {
    message += `%0A%0A`;
  }

  message += isSpanish ? `*Detalles del pedido:*%0A` : `*Order Details:*%0A`;

  let subtotal = 0;

  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    const name = item[nameKey] || item.nameEs || item.name_es || 'Arreglo Floral';
    message += `- ${item.quantity}x ${name} (${formatCOP(item.price)} c/u) = ${formatCOP(itemTotal)}%0A`;
  });

  const deliveryFee = Number(customerData.deliveryFee || 0);
  const totalAmount = subtotal + deliveryFee;

  message += `%0A*Subtotal Arreglos:* ${formatCOP(subtotal)}%0A`;
  message += `*Costo Domicilio (${customerData.municipality || 'Medellín'}):* ${deliveryFee > 0 ? formatCOP(deliveryFee) : (isSpanish ? '¡Gratis! (Recoger en tienda)' : 'Free (Pickup)')}%0A`;
  message += `*💰 TOTAL A PAGAR:* ${formatCOP(totalAmount)}%0A%0A`;

  message += isSpanish ? `*Datos de Entrega y Contacto:*%0A` : `*Delivery & Contact Details:*%0A`;
  
  const buyerName = customerData.customerName || customerData.name || '';
  const buyerPhone = customerData.customerPhone || customerData.phone || '';
  const recipientName = customerData.recipientName || customerData.name || '';
  const recipientPhone = customerData.recipientPhone || customerData.phone || '';

  if (buyerName) {
    message += `👤 *${isSpanish ? 'Cliente (Comprador)' : 'Customer'}:* ${buyerName}%0A`;
  }
  if (buyerPhone) {
    message += `📱 *${isSpanish ? 'Teléfono Cliente' : 'Customer Phone'}:* ${buyerPhone}%0A`;
  }
  if (customerData.customerEmail || customerData.email) {
    message += `✉️ *${isSpanish ? 'Correo' : 'Email'}:* ${customerData.customerEmail || customerData.email}%0A`;
  }

  message += `%0A🎁 *${isSpanish ? 'Destinatario (Quien recibe)' : 'Recipient'}:* ${recipientName}%0A`;
  message += `📞 *${isSpanish ? 'Teléfono Destinatario' : 'Recipient Phone'}:* ${recipientPhone}%0A`;
  message += `📍 *${isSpanish ? 'Municipio' : 'Municipality'}:* ${customerData.municipality || 'Medellín'}%0A`;
  message += `🏠 *${isSpanish ? 'Dirección' : 'Address'}:* ${customerData.address}%0A`;
  message += `📅 *${isSpanish ? 'Fecha de entrega' : 'Delivery date'}:* ${customerData.date}%0A`;
  message += `⏰ *${isSpanish ? 'Horario de entrega' : 'Time slot'}:* ${customerData.time}%0A`;

  if (customerData.cardStyle) {
    message += `%0A💌 *${isSpanish ? 'Estilo de Tarjeta' : 'Card Style'}:* ${customerData.cardStyle}%0A`;
  }

  if (customerData.cardSender) {
    message += `✍️ *${isSpanish ? 'De parte de (Firma)' : 'From'}:* ${customerData.cardSender}%0A`;
  }

  if (customerData.message) {
    message += `*${isSpanish ? 'Mensaje para la tarjeta' : 'Dedication message'}:*%0A"${customerData.message}"%0A`;
  }

  if (customerData.notes) {
    message += `%0A*${isSpanish ? 'Indicaciones de entrega' : 'Delivery notes'}:*%0A${customerData.notes}%0A`;
  }

  if (customerData.orderCode) {
    message += `%0A🔍 *${isSpanish ? 'Rastreo de pedido en línea' : 'Track online'}:*%0Ahttps://floreria.molinazdev.lat/rastreo?codigo=${customerData.orderCode}`;
  }

  return `https://wa.me/${phoneNumber}?text=${message}`;
};
