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

  let total = 0;

  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    const name = item[nameKey] || item.nameEs || item.name_es || 'Arreglo Floral';
    message += `- ${item.quantity}x ${name} (${formatCOP(item.price)} c/u) = ${formatCOP(itemTotal)}%0A`;
  });

  message += `%0A*Total del Pedido:* ${formatCOP(total)}%0A%0A`;

  message += isSpanish ? `*Datos de Entrega (Caldas / Antioquia):*%0A` : `*Delivery Details:*%0A`;
  message += `${isSpanish ? 'Nombre' : 'Name'}: ${customerData.name}%0A`;
  message += `${isSpanish ? 'Teléfono' : 'Phone'}: ${customerData.phone}%0A`;
  message += `${isSpanish ? 'Dirección' : 'Address'}: ${customerData.address}%0A`;
  message += `${isSpanish ? 'Fecha deseada' : 'Desired date'}: ${customerData.date}%0A`;
  message += `${isSpanish ? 'Jornada' : 'Time'}: ${customerData.time}%0A`;

  if (customerData.message) {
    message += `%0A*${isSpanish ? 'Mensaje para la tarjeta' : 'Card message'}:*%0A${customerData.message}%0A`;
  }

  if (customerData.notes) {
    message += `%0A*${isSpanish ? 'Notas especiales' : 'Special notes'}:*%0A${customerData.notes}%0A`;
  }

  return `https://wa.me/${phoneNumber}?text=${message}`;
};
