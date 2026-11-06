'use strict';
window.DpxPedidos = Object.freeze({
  url(mensaje) {
    return `https://wa.me/593999006555?text=${encodeURIComponent(mensaje)}`;
  },
  producto(nombre) {
    return this.url(`Hola, vi «${nombre}» en la página de D'Panes Express. Quisiera consultar el precio y la disponibilidad.\nCantidad: \nFecha solicitada: \nRetiro o entrega: `);
  }
});
