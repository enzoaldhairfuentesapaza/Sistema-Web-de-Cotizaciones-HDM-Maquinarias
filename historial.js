import { supabase } from "./supabase.js";
let listaCotizacionesGlobal = [];

async function obtenerCotizaciones() {

  const { data, error } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

async function cargarLista() {

  const lista = await obtenerCotizaciones();

  listaCotizacionesGlobal = lista;

  renderTabla(lista);
}

function renderTabla(lista) {

  const tbody = document.getElementById("tablaCotizaciones");
  tbody.innerHTML = "";

  lista.forEach(c => {

    tbody.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.cliente}</td>
        <td>${new Date(c.fecha).toLocaleDateString()}</td>
        <td>${c.dni || "-"}</td>
        <td>${c.direccion || "-"}</td>
        <td>${c.total}</td>
        <td class="acciones">
            <button onclick='abrirCotizacion(${c.id})'>✏️</button>
            <button onclick='descargarPDF(${c.id})'>⬇️</button>
            <button onclick='borrarCotizacion(${c.id})'>🗑️</button>
        </td>
      </tr>
    `;
  });

}

async function borrarCotizacion(id) {

  const confirmar = confirm("¿Seguro que deseas borrar esta cotización?");
  if (!confirmar) return;

  const { error } = await supabase
    .from("cotizaciones")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Error al borrar la cotización");
    return;
  }

  alert("Cotización eliminada ✅");

  // refrescar tabla
  cargarLista();
}

async function descargarPDF(id) {

  const { data: cotizacion, error } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !cotizacion) {
    alert("No se pudo cargar la cotización");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const img = new Image();
  img.src = "plantillahdm.png";
  await new Promise(r => img.onload = r);

  doc.addImage(img, "PNG", 0, 0, 210, 297);

  doc.setFontSize(9);

  doc.text(cotizacion.dni || "-", 48, 62);
  doc.text(cotizacion.cliente || "-", 48, 68);
  doc.text(cotizacion.direccion || "-", 48, 74);
  doc.text(new Date(cotizacion.fecha).toLocaleDateString(), 48, 80);

  doc.setFontSize(20);
  doc.text(String(cotizacion.id), 161, 44);

  let y = 107;
  let total = 0;
  let index = 1;

  cotizacion.productos.forEach(p => {

    let precio = p.price;

    if (p.currency === "USD") precio *= 3.75;

    p.brandAdjustments?.forEach(a => precio *= (1 + a / 100));
    p.discounts.forEach(d => precio *= (1 - d / 100));

    const precioFinal = Math.round(precio);
    const subtotal = precioFinal * p.qty;
    total += subtotal;

    doc.text(String(index), 9, y);
    doc.text(p.code, 18, y);
    doc.text(p.unit, 44, y);
    doc.text(p.qty.toString(), 66, y);
    doc.text(p.brand, 85, y);
    doc.text(p.desc, 103, y);
    doc.text(precioFinal.toFixed(2), 180, y, { align: "right" });
    doc.text(subtotal.toFixed(2), 202, y, { align: "right" });

    y += 7;
    index++;
  });

  doc.text(total.toFixed(2), 202, 275, { align: "right" });

  doc.save(`Cotizacion_${cotizacion.id}.pdf`);
}


window.abrirCotizacion = function(numero) {

  // Guardamos el número en localStorage
  localStorage.setItem("cotizacionAbrir", numero);

  // Volvemos a index
  window.location.href = "index.html";
};

window.volver = function() {
  window.location.href = "index.html";
};

cargarLista();


const buscador = document.getElementById("buscadorCotizaciones");

buscador.addEventListener("input", () => {

  const texto = buscador.value.toLowerCase();

  const filtrado = listaCotizacionesGlobal.filter(c => {

    return (
      String(c.id).includes(texto) ||
      (c.cliente || "").toLowerCase().includes(texto) ||
      (c.dni || "").toLowerCase().includes(texto) ||
      (c.direccion || "").toLowerCase().includes(texto)
    );

  });

  renderTabla(filtrado);
});
    


window.borrarCotizacion = borrarCotizacion;
window.descargarPDF = descargarPDF;

