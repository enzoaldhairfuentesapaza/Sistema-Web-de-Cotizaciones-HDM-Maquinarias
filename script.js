import { supabase } from "./supabase.js";

let editIndex = null;
let numeroCotizacionActual = 1;

let lastBrand = marca.value;

async function inicializarNumeroCotizacion() {
  numeroCotizacionActual = await obtenerSiguienteNumero();
  updatePDFPreview(numeroCotizacionActual);
}
inicializarNumeroCotizacion();

const brandAdjustmentsConfig = {
  CAT: [
    { label: "IGV 18%", value: 18 },
  ],
  CTP: [
    { label: "Margen 35%", value: 35 },
    { label: "Margen 40%", value: 40 },
    { label: "Margen 50%", value: 50 },

  ],
  Handook: [
    { label: "Margen 50%", value: 50 },
    { label: "Margen 70%", value: 70 },
  ],
  IPD: [
    { label: "Margen 50%", value: 50 },
    { label: "Margen 70%", value: 70 },
  ]
};

function updateBrandInputsTemp() {
  brandInputsTemp = [...document.querySelectorAll(".brand-input")]
    .map(i => Number(i.value))
    .filter(v => v > 0);
}


function renderBrandAdjustments() {
  const box = document.getElementById("brandAdjustmentsBox");
  box.innerHTML = "";

  const brand = marca.value;

  // ================= CAT =================
  if (brand === "CAT") {
    box.innerHTML = `
      <label class="brand-adjustment">
        <input type="checkbox" checked data-value="18">
        <span>+18%</span>
      </label>
    `;
    return;
  }

  // ================= CTP / Handook / IPD =================
  if (["CTP", "Handook", "IPD"].includes(brand)) {
    box.innerHTML = `
      <div class="discount-input-group">
        <input type="number" class="brand-input" placeholder="+ %" value="${brandInputsTemp[0] || ""}" oninput="updateBrandInputsTemp()" />
        <input type="number" class="brand-input" placeholder="+ %" value="${brandInputsTemp[1] || ""}" oninput="updateBrandInputsTemp()" />
      </div>
    `;
    return;
  }

  // ================= OTRO =================
  if (brand === "Otro") {

    // checkboxes existentes
    brandAdjustmentsTemp.forEach(value => {
      box.innerHTML += `
        <label class="brand-adjustment">
          <input type="checkbox" checked data-value="${value}">
          <span>+${value}%</span>
        </label>
      `;
    });

    // formulario dinámico
    box.innerHTML += `
      <div class="discount-action">
        <div class="discount-input-group">
          <input type="number" id="brandAdjInput" placeholder="%" />

          <div class="discount-mini-buttons">
            <button type="button" onclick="addBrandAdjustment()">+</button>
            <button type="button" onclick="removeBrandAdjustment()">−</button>
          </div>
        </div>
      </div>
    `;
  }
}


function addBrandAdjustment() {
  const input = document.getElementById("brandAdjInput");
  const value = Number(input.value);

  if (value > 0) {
    brandAdjustmentsTemp.push(value);
    input.value = "";
    renderBrandAdjustments();
  }
}

function removeBrandAdjustment() {
  brandAdjustmentsTemp.pop();
  renderBrandAdjustments();
}

function saveCurrentBrandMemory() {

  if (!lastBrand) return;

  const inputs = [...document.querySelectorAll(".brand-input")];

  if (inputs.length) {
    brandMemory[lastBrand] = inputs
      .map(i => Number(i.value))
      .filter(v => v > 0);
  }
}


function toggleOtraMarca() {
  otraMarca.style.display = marca.value === "Otro" ? "block" : "none";

  if (marca.value === "Otro") {
    brandAdjustmentsTemp = [];
  }
  renderBrandAdjustments();
}

let products = [];
let discountsTemp = [];
let brandAdjustmentsTemp = [];
let brandInputsTemp = [];

let brandMemory = {};

/* =======================
   TIPO DE CAMBIO
======================= */
function convertAll(target) {
  products.forEach(p => {
    if (p.currency !== target) {
      toggleCurrencyByValue(p, target);
    }
  });
  renderTable();
}
async function savePDF() {
  const fecha = getFechaEmision();

  const clienteNombre = cliente.value || "Sin nombre";
  const total = document.getElementById("total").innerText || "0.00";

  const doc = await buildPDF(ficha);
  doc.save(`ARCHIVOS_${ficha}.pdf`);

  const historial = JSON.parse(localStorage.getItem("historial")) || [];

  historial.push({ ficha, fecha, cliente: clienteNombre, total });

  localStorage.setItem("historial", JSON.stringify(historial));
}

tc.value = 3.75;

async function cargarListaCotizaciones() {

  const lista = await obtenerCotizaciones();

  const tbody = document.getElementById("tablaCotizaciones");
  tbody.innerHTML = "";

  lista.forEach(c => {

    tbody.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.cliente}</td>
        <td>${new Date(c.fecha).toLocaleDateString()}</td>
        <td>${c.total}</td>
        <td>
          <button onclick='cargarCotizacionDesdeDB(${JSON.stringify(c)})'>
            Abrir
          </button>
        </td>
      </tr>
    `;
  });
}

function cargarCotizacionDesdeDB(coti) {

  cliente.value = coti.cliente;
  products = coti.productos;

  renderTable();
}



/*async function loadTipoCambio() {
  try {
    const res = await fetch("https://api.apis.net.pe/v1/tipo-cambio-sunat");
    const data = await res.json();
    tc.value = data.venta;
  } catch {
    tc.value = 3.75;
  }
}
loadTipoCambio();
*/
/* =======================
   UI
======================= */

function updateMonedaLabel() {
  monedaLabel.innerText = monedaProducto.value;
}
updateMonedaLabel();


/* =======================
   DESCUENTOS
======================= */
function addDiscount() {
  const d = Number(descuentoInput.value);
  if (d > 0) {
    discountsTemp.push(d);
    descuentoInput.value = "";
    updateDiscountLabel();
  }
}

function removeDiscount() {
  discountsTemp.pop();
  updateDiscountLabel();
}

function updateDiscountLabel() {
  listaDescuentos.innerText =
    discountsTemp.length ? discountsTemp.join("%, ") + "%" : "Ninguno descuento añadido";
}

/* =======================
   PRODUCTOS
======================= */
function addProduct() {
  let adjustments = [];

  if (marca.value === "CAT" || marca.value === "Otro") {

    adjustments = [...document.querySelectorAll(
      "#brandAdjustmentsBox input:checked"
    )].map(i => Number(i.dataset.value));

  } else if (["CTP", "Handook", "IPD"].includes(marca.value)) {

    adjustments = [...brandInputsTemp];

  }

  const brandFinal =
    marca.value === "Otro"
      ? (otraMarca.value || "Otro")
      : marca.value;
  const product = {
    code: codigoProducto.value,
    brand: brandFinal,
    unit: unidad.value || "UND",
    qty: Number(cantidad.value),
    desc: descripcion.value,
    price: Number(precio.value),
    currency: monedaProducto.value,
    discounts: [...discountsTemp],
    brandAdjustments: adjustments,
    showDiscounts: mostrarDescCheck.checked 
  };

  if (editIndex !== null) {
    products[editIndex] = product;
    editIndex = null;
  } else {
    products.push(product);
  }
  saveCurrentBrandMemory();
  clearForm();
  renderTable();
}

function toggleCurrency(index) {
  const p = products[index];
  p.currency = p.currency === "USD" ? "PEN" : "USD";
  renderTable();
}

function clearProducts() {
  products = [];
  renderTable();
}

function clearForm() {
  codigoProducto.value = "";
  cantidad.value = 1;
  descripcion.value = "";
  precio.value = "";

  dni.value = "";
  direccion.value = "";

  // 👇 restaurar memoria de marca
  const brandActual =
    marca.value === "Otro" ? otraMarca.value : marca.value;

  brandInputsTemp = [...(brandMemory[brandActual] || [])];

  renderBrandAdjustments();

  monedaProducto.value = "USD";
  updateMonedaLabel();
}


/* =======================
   CÁLCULO
======================= */
function calcularPrecioFinal(p) {
  let precio = p.price;
  const tcambio = Number(tc.value);

  if (p.currency === "USD") {
    precio *= tcambio;
  }

  // aplicar ajustes de marca seleccionados
  p.brandAdjustments?.forEach(a => {
    precio *= (1 + a / 100);
  });

  // aplicar descuentos reales
  p.discounts.forEach(d => {
    precio *= (1 - d / 100);
  });

  return Math.round(precio);
}


/* =======================
   TABLA
======================= */
function setAllCurrency(currency) {
  products.forEach(p => p.currency = currency);
  renderTable();
}
function renderTable() {
  const tbody = document.getElementById("tabla");
  tbody.innerHTML = "";

  let total = 0;

  products.forEach((p, i) => {
    const subtotal = calcularPrecioFinal(p) * p.qty;
    total += subtotal;

    const descTexto = p.discounts.length
      ? `${p.desc} (Desc: ${p.discounts.join("%, ")}%)`
      : p.desc;

    tbody.innerHTML += `
      <tr>
        <td>${p.code}</td>
        <td>${p.unit}</td>
        <td>${p.brand}</td>
        <td>${p.qty}</td>
        <td>${descTexto}</td>
        <td>${p.price.toFixed(2)} ${p.currency}</td>
        <td>${subtotal.toFixed(2)}</td>
        <td>
          <div class="actions-wrap">
            <button onclick="editProduct(${i})">✏️</button>
            <button onclick="toggleCurrency(${i})">
              ${p.currency === "USD" ? "💲" : "🪙"}
            </button>
            <button onclick="eliminarProducto(${i})">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });

  document.getElementById("total").innerText = total.toFixed(2);
  updatePDFPreview(numeroCotizacionActual);
}


function editProduct(index) {
  const p = products[index];
  editIndex = index;

  codigoProducto.value = p.code;
  marca.value = p.brand;
  unidad.value = p.unit;
  cantidad.value = p.qty;
  descripcion.value = p.desc;
  precio.value = p.price;
  monedaProducto.value = p.currency;
  mostrarDescCheck.checked = p.showDiscounts ?? true;

  discountsTemp = [...p.discounts];
  toggleOtraMarca();
  
  brandInputsTemp = [...(p.brandAdjustments || [])];
  renderBrandAdjustments();
  
  updateDiscountLabel();

  updateMonedaLabel();
}

/* =======================
   PDF
======================= */


async function buildPDF(numeroCotizacion) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const img = new Image();
  img.src = "plantillahdm.png";
  await new Promise(resolve => img.onload = resolve);

  doc.addImage(img, "PNG", 0, 0, 210, 297);

  doc.setFontSize(9);

  doc.text(dni.value || "-", 48, 62);
  doc.text(cliente.value || "-", 48, 68);
  doc.text(direccion.value || "-", 48, 74);
  doc.text(getFechaEmision(), 48, 80);

  const numeroFormateado =
    String(numeroCotizacion).padStart(7, "0");
  doc.setFontSize(24);

  doc.text(numeroFormateado, 161, 45);

  doc.setFontSize(9);

  let y = 107;
  let total = 0;
  let index = 1;

  products.forEach(p => {
    const precioFinal = calcularPrecioFinal(p);
    const subtotal = precioFinal * p.qty;
    total += subtotal;

    const descTexto =
      p.showDiscounts && p.discounts.length
        ? `${p.desc} (Desc: ${p.discounts.join("%, ")}%)`
        : p.desc;


    doc.text(String(index), 9, y);
    doc.text(p.code, 18, y);
    doc.text(p.unit, 44, y);
    doc.text(p.qty.toString(), 66, y);
    doc.text(p.brand, 85, y);
    doc.text(descTexto, 103, y - 1, { maxWidth: 58 });
    doc.text(precioFinal.toFixed(2), 180, y, { align: "right" });
    doc.text(subtotal.toFixed(2), 202, y, { align: "right" });

    y += 7;
    index++;
  });

  doc.setFontSize(10);
  doc.text(total.toFixed(2), 202, 275, { align: "right" });

  return doc;
}
async function obtenerSiguienteNumero() {

  const { data, error } = await supabase
    .from("cotizaciones")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error(error);
    return 1;
  }

  return data ? data.id + 1 : 1;
}


async function guardarCotizacion() {

  if (!products.length) {
    alert("Agrega al menos un producto");
    return;
  }

  const clienteNombre = cliente.value || "Sin nombre";
  const clienteDni = dni.value || "";
  const clienteDireccion = direccion.value || "";

  const total = Number(document.getElementById("total").innerText);

  const { data, error } = await supabase
    .from("cotizaciones")
    .insert([
      {
        cliente: clienteNombre,
        dni: clienteDni,
        direccion: clienteDireccion,
        fecha: new Date().toISOString(),
        productos: products,
        total: total
      }
    ])
    .select()
    .single();

  if (error) {
    console.error(error);
    alert("Error guardando cotización");
    return;
  }

  const idGenerado = data.id;

  alert(`Cotización guardada correctamente ✅ N° ${idGenerado}`);
  updatePDFPreview(idGenerado);
}


async function obtenerCotizaciones() {

  const { data, error } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("id", { ascending: false })
  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

function cargarCotizacion(coti) {

  cliente.value = coti.cliente || "";
  dni.value = coti.dni || "";
  direccion.value = coti.direccion || "";

  products = coti.productos || [];

  renderTable();
}



async function updatePDFPreview(id = numeroCotizacionActual) {
  const doc = await buildPDF(id);
  pdfPreview.src = URL.createObjectURL(doc.output("blob"));
}

async function downloadPDF() {
  const doc = await buildPDF("PREVIEW");
  doc.save(`cotizacion_preview.pdf`);
}

function getFechaEmision() {
  const f = new Date();
  return f.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

renderBrandAdjustments();
updatePDFPreview(0);

marca.addEventListener("change", () => {

  // Guardar valores de la marca anterior
  saveCurrentBrandMemory();

  toggleOtraMarca();

  const brandActual =
    marca.value === "Otro" ? otraMarca.value : marca.value;

  // Recuperar memoria de la nueva marca
  brandInputsTemp = [...(brandMemory[brandActual] || [])];

  renderBrandAdjustments();

  // Actualizar marca previa
  lastBrand = brandActual;
});

async function cargarCotizacionDesdeNumero() {

  const id = localStorage.getItem("cotizacionAbrir");

  if (!id) return;

  const { data } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) return;

  cliente.value = data.cliente || "";
  dni.value = data.dni || "";
  direccion.value = data.direccion || "";
  products = data.productos || [];

  renderTable();

  localStorage.removeItem("cotizacionAbrir");
}

cargarCotizacionDesdeNumero();



function eliminarProducto(index){
  products.splice(index,1);
  renderTable();
}

window.eliminarProducto = eliminarProducto;
window.addProduct = addProduct;
window.guardarCotizacion = guardarCotizacion;
window.downloadPDF = downloadPDF;
window.clearProducts = clearProducts;
window.addDiscount = addDiscount;
window.removeDiscount = removeDiscount;
window.toggleOtraMarca = toggleOtraMarca;
window.updatePDFPreview = updatePDFPreview;
window.toggleCurrency = toggleCurrency;
window.editProduct = editProduct;
window.renderTable = renderTable;