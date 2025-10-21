/**
 * Google Apps Script backend para Gestor de Ventas
 * Publicar como Web App: "Cualquiera con el enlace"
 */

function doGet(e) {
  const action = (e?.parameter?.action || 'list').toLowerCase();
  const entity = (e?.parameter?.entity || 'ventas').toLowerCase();
  try {
    if (action === 'list') {
      let data;
      if (entity === 'clientes') data = listClientes_();
      else if (entity === 'productos') data = listProductos_();
      else data = listVentas_();
      return respond_(e, { ok: true, data });
    }
    return respond_(e, { ok: false, error: 'Unknown action' });
  } catch (err) {
    return respond_(e, { ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var action, entity, data, id;
    if (e.postData && String(e.postData.type).indexOf('x-www-form-urlencoded') >= 0) {
      action = String(e.parameter.action || '').toLowerCase();
      entity = String(e.parameter.entity || 'ventas').toLowerCase();
      id = e.parameter.id || '';
      data = e.parameter.data ? JSON.parse(e.parameter.data) : {};
    } else {
      const body = JSON.parse(e.postData.contents || '{}');
      action = String(body?.action || '').toLowerCase();
      entity = String(body?.entity || 'ventas').toLowerCase();
      id = body?.id || '';
      data = body?.data || {};
    }
    if (action === 'create') {
      let out;
      if (entity === 'clientes') out = createCliente_(data);
      else if (entity === 'productos') out = createProducto_(data);
      else out = createVenta_(data);
      return json_({ ok: true, data: out });
    }
    if (action === 'update') {
      let out;
      if (entity === 'clientes') out = updateCliente_(data);
      else if (entity === 'productos') out = updateProducto_(data);
      else out = updateVenta_(data);
      return json_({ ok: true, data: out });
    }
    if (action === 'delete') {
      if (entity === 'clientes') removeCliente_(id);
      else if (entity === 'productos') removeProducto_(id);
      else removeVenta_(id);
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'Unknown action' }, 400);
  } catch (err) {
    return respond_(e, { ok: false, error: String(err) });
  }
}

// CONFIG: Id de la hoja y nombre de pestaña
const SHEET_ID = 'REEMPLAZAR_CON_TU_ID';
const TAB_VENTAS = 'Ventas';
const TAB_CLIENTES = 'Clientes';
const TAB_PRODUCTOS = 'Productos';

function getSheet_(tabName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(tabName);
  if (!sh) sh = ss.insertSheet(tabName);
  return sh;
}

function listVentas_() {
  const sh = getSheet_(TAB_VENTAS);
  const values = sh.getDataRange().getValues();
  if (!values.length) return [];
  const [header, ...rows] = values;
  const idx = name => header.indexOf(name);
  const idI = idx('id');
  const fechaI = idx('fecha');
  const clienteI = idx('cliente');
  const productoI = idx('producto');
  const cantidadI = idx('cantidad');
  const precioI = idx('precio');
  const totalI = idx('total');
  const costoI = idx('costo');
  return rows.filter(r => r.join('').length).map(r => ({
    id: String(r[idI] || ''),
    fecha: r[fechaI] instanceof Date ? r[fechaI].toISOString() : String(r[fechaI] || ''),
    cliente: String(r[clienteI] || ''),
    producto: String(r[productoI] || ''),
    cantidad: Number(r[cantidadI] || 0),
    precio: Number(r[precioI] || 0),
    total: Number(r[totalI] || 0),
    costo: Number(r[costoI] || 0)
  }));
}

function createVenta_(v) {
  const sh = getSheet_(TAB_VENTAS);
  const header = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0] || [];
  const needHeader = header.length === 0;
  if (needHeader) {
    sh.getRange(1,1,1,8).setValues([[
      'id','fecha','cliente','producto','cantidad','precio','total','costo'
    ]]);
  }
  const id = v.id || Utilities.getUuid();
  const row = [
    id,
    new Date(v.fecha),
    v.cliente,
    v.producto,
    Number(v.cantidad || 0),
    Number(v.precio || 0),
    Number(v.total || 0),
    Number(v.costo || 0)
  ];
  sh.appendRow(row);
  return { ...v, id };
}

function updateVenta_(v) {
  const sh = getSheet_(TAB_VENTAS);
  const values = sh.getDataRange().getValues();
  if (!values.length) throw new Error('Sin datos');
  const [header, ...rows] = values;
  const idI = header.indexOf('id');
  const idx = rows.findIndex(r => String(r[idI]) === String(v.id));
  if (idx === -1) throw new Error('ID no encontrado');
  const rowN = idx + 2; // offset header
  const data = [
    v.id,
    new Date(v.fecha),
    v.cliente,
    v.producto,
    Number(v.cantidad || 0),
    Number(v.precio || 0),
    Number(v.total || 0),
    Number(v.costo || 0)
  ];
  sh.getRange(rowN, 1, 1, data.length).setValues([data]);
  return v;
}

function removeVenta_(id) {
  const sh = getSheet_(TAB_VENTAS);
  const values = sh.getDataRange().getValues();
  if (!values.length) return;
  const [header, ...rows] = values;
  const idI = header.indexOf('id');
  const idx = rows.findIndex(r => String(r[idI]) === String(id));
  if (idx === -1) return;
  const rowN = idx + 2;
  sh.deleteRow(rowN);
}

// --- Clientes ---
function listClientes_() {
  const sh = getSheet_(TAB_CLIENTES);
  const values = sh.getDataRange().getValues();
  if (!values.length) return [];
  const [header, ...rows] = values;
  const idx = name => header.indexOf(name);
  const idI = idx('id');
  const nombreI = idx('nombre');
  const emailI = idx('email');
  const telI = idx('telefono');
  const depI = idx('departamento');
  return rows.filter(r => r.join('').length).map(r => ({
    id: String(r[idI] || ''),
    nombre: String(r[nombreI] || ''),
    email: String(r[emailI] || ''),
    telefono: String(r[telI] || ''),
    departamento: String(depI >= 0 ? (r[depI] || '') : '')
  }));
}

function ensureClientesHeader_(sh) {
  const header = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0] || [];
  const needHeader = header.length === 0;
  if (needHeader) {
    sh.getRange(1,1,1,5).setValues([[ 'id','nombre','email','telefono','departamento' ]]);
  }
}

function createCliente_(c) {
  const sh = getSheet_(TAB_CLIENTES);
  ensureClientesHeader_(sh);
  const id = c.id || Utilities.getUuid();
  const row = [ id, c.nombre || '', c.email || '', c.telefono || '', c.departamento || '' ];
  sh.appendRow(row);
  return { ...c, id };
}

function updateCliente_(c) {
  const sh = getSheet_(TAB_CLIENTES);
  const values = sh.getDataRange().getValues();
  if (!values.length) throw new Error('Sin datos');
  const [header, ...rows] = values;
  const idI = header.indexOf('id');
  const idx = rows.findIndex(r => String(r[idI]) === String(c.id));
  if (idx === -1) throw new Error('ID no encontrado');
  const rowN = idx + 2;
  const data = [ c.id, c.nombre || '', c.email || '', c.telefono || '', c.departamento || '' ];
  sh.getRange(rowN, 1, 1, data.length).setValues([data]);
  return c;
}

function removeCliente_(id) {
  const sh = getSheet_(TAB_CLIENTES);
  const values = sh.getDataRange().getValues();
  if (!values.length) return;
  const [header, ...rows] = values;
  const idI = header.indexOf('id');
  const idx = rows.findIndex(r => String(r[idI]) === String(id));
  if (idx === -1) return;
  const rowN = idx + 2;
  sh.deleteRow(rowN);
}

// --- Productos ---
function listProductos_() {
  const sh = getSheet_(TAB_PRODUCTOS);
  const values = sh.getDataRange().getValues();
  if (!values.length) return [];
  const [header, ...rows] = values;
  const idx = name => header.indexOf(name);
  const idI = idx('id');
  const nombreI = idx('nombre');
  const precioI = idx('precio');
  const costoI = idx('costo');
  const stockI = idx('stock');
  return rows.filter(r => r.join('').length).map(r => ({
    id: String(r[idI] || ''),
    nombre: String(r[nombreI] || ''),
    precio: Number(r[precioI] || 0),
    costo: Number(r[costoI] || 0),
    stock: Number(r[stockI] || 0)
  }));
}

function ensureProductosHeader_(sh) {
  const header = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0] || [];
  const needHeader = header.length === 0;
  if (needHeader) {
    sh.getRange(1,1,1,5).setValues([[ 'id','nombre','precio','costo','stock' ]]);
  }
}

function createProducto_(p) {
  const sh = getSheet_(TAB_PRODUCTOS);
  ensureProductosHeader_(sh);
  const id = p.id || Utilities.getUuid();
  const row = [ id, p.nombre || '', Number(p.precio || 0), Number(p.costo || 0), Number(p.stock || 0) ];
  sh.appendRow(row);
  return { ...p, id };
}

function updateProducto_(p) {
  const sh = getSheet_(TAB_PRODUCTOS);
  const values = sh.getDataRange().getValues();
  if (!values.length) throw new Error('Sin datos');
  const [header, ...rows] = values;
  const idI = header.indexOf('id');
  const idx = rows.findIndex(r => String(r[idI]) === String(p.id));
  if (idx === -1) throw new Error('ID no encontrado');
  const rowN = idx + 2;
  const data = [ p.id, p.nombre || '', Number(p.precio || 0), Number(p.costo || 0), Number(p.stock || 0) ];
  sh.getRange(rowN, 1, 1, data.length).setValues([data]);
  return p;
}

function removeProducto_(id) {
  const sh = getSheet_(TAB_PRODUCTOS);
  const values = sh.getDataRange().getValues();
  if (!values.length) return;
  const [header, ...rows] = values;
  const idI = header.indexOf('id');
  const idx = rows.findIndex(r => String(r[idI]) === String(id));
  if (idx === -1) return;
  const rowN = idx + 2;
  sh.deleteRow(rowN);
}

function json_(obj, code) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  if (code) out.setContent(JSON.stringify({ ...obj, code }));
  return out;
}

function respond_(e, obj) {
  try {
    const cb = e && e.parameter && e.parameter.callback;
    if (cb) {
      return ContentService
        .createTextOutput(String(cb) + '(' + JSON.stringify(obj) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } catch (err) {}
  return json_(obj);
}
