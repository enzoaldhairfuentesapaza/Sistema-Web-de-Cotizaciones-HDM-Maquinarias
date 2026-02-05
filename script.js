let editIndex = null;


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

function renderBrandAdjustments() {
  const box = document.getElementById("brandAdjustmentsBox");
  box.innerHTML = "";

  const brand = marca.value;

  // Valores base de la marca
  const defaults = brandAdjustmentsConfig[brand] || [];

  // Mezclar defaults + personalizados
  const allAdjustments = [
    ...defaults.map(a => a.value),
    ...brandAdjustmentsTemp
  ];

  allAdjustments.forEach(value => {
    box.innerHTML += `
      <label class="brand-adjustment">
        <input type="checkbox" checked data-value="${value}">
        <span>+${value}%</span>
      </label>
    `;
  });

  // Input + botones
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

function toggleOtraMarca() {
  otraMarca.style.display = marca.value === "Otro" ? "block" : "none";

  brandAdjustmentsTemp = []; // reset personalizados
  renderBrandAdjustments();
}
let products = [];
let discountsTemp = [];
let brandAdjustmentsTemp = [];


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
  const ficha = getNextFicha();
  const fecha = getFechaEmision();

  const clienteNombre = cliente.value || "Sin nombre";
  const total = document.getElementById("total").innerText || "0.00";

  const doc = await buildPDF(ficha);
  doc.save(`ARCHIVOS_${ficha}.pdf`);

  const historial = JSON.parse(localStorage.getItem("historial")) || [];

  historial.push({ ficha, fecha, cliente: clienteNombre, total });

  localStorage.setItem("historial", JSON.stringify(historial));
}

async function loadTipoCambio() {
  try {
    const res = await fetch("https://api.apis.net.pe/v1/tipo-cambio-sunat");
    const data = await res.json();
    tc.value = data.venta;
  } catch {
    tc.value = 3.75;
  }
}
loadTipoCambio();

/* =======================
   UI
======================= */

function updateMonedaLabel() {
  monedaLabel.innerText = monedaProducto.value;
}
updateMonedaLabel();

function getNextFicha() {
  let last = localStorage.getItem("ultimaFicha");
  if (!last) last = "0000000000";

  const next = (parseInt(last) + 1).toString().padStart(10, "0");
  localStorage.setItem("ultimaFicha", next);
  return next;
}

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
    discountsTemp.length ? discountsTemp.join("%, ") + "%" : "Ninguno";
}

/* =======================
   PRODUCTOS
======================= */
function addProduct() {
  const adjustments = [...document.querySelectorAll(
  "#brandAdjustmentsBox input:checked")].map(i => Number(i.dataset.value));

  const brandFinal = marca.value === "Otro" ? otraMarca.value : marca.value;

  const product = {
    code: codigoProducto.value,
    brand: brandFinal,
    unit: unidad.value || "UND",
    qty: Number(cantidad.value),
    desc: descripcion.value,
    price: Number(precio.value),
    currency: monedaProducto.value,
    discounts: [...discountsTemp],
    brandAdjustments: adjustments
  };

  if (editIndex !== null) {
    products[editIndex] = product;
    editIndex = null;
  } else {
    products.push(product);
  }
  discountsTemp = [];
  updateDiscountLabel();
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
  marca.value = "CAT";
  otraMarca.value = "";
  otraMarca.style.display = "none";
  cantidad.value = 1;
  descripcion.value = "";
  precio.value = "";
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

  return Math.ceil(precio * 10) / 10;
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
            <button onclick="products.splice(${i},1);renderTable()">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });

  document.getElementById("total").innerText = total.toFixed(2);
  updatePDFPreview();
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

  discountsTemp = [...p.discounts];
  updateDiscountLabel();

  toggleOtraMarca();
  updateMonedaLabel();
}

/* =======================
   PDF
======================= */


async function buildPDF(ficha) {
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

  doc.setFontSize(20);
  doc.text( ficha, 161, 44);
  doc.setFontSize(9);


  let y = 107;
  let total = 0;
  let index = 1;

  products.forEach(p => {
    const precioFinal = calcularPrecioFinal(p);
    const subtotal = precioFinal * p.qty;
    total += subtotal;

    const descTexto = p.desc;


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



async function updatePDFPreview() {
  const fichaPreview = getPreviewFicha();
  const doc = await buildPDF(fichaPreview);
  pdfPreview.src = URL.createObjectURL(doc.output("blob"));
}

function getPreviewFicha() {
  let last = localStorage.getItem("ultimaFicha");
  if (!last) last = "0000000000";

  return (parseInt(last) + 1).toString().padStart(10, "0");
}
async function downloadPDF() {
  const fichaPreview = getPreviewFicha();
  const doc = await buildPDF(fichaPreview);
  doc.save(`cotizacion_${fichaPreview}.pdf`);
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
updatePDFPreview();