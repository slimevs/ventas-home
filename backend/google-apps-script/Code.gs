/**
 * Google Apps Script backend para Gestor de Ventas
 * Publicar como Web App: "Cualquiera con el enlace"
 */

function doGet(e) {
  const action = (e?.parameter?.action || 'list').toLowerCase();
  try {
    if (action === 'list') {
      const data = listVentas_();
      return json_({ ok: true, data });
    }
    return json_({ ok: false, error: 'Unknown action' }, 400);
  } catch (err) {
    return json_({ ok: false, error: String(err) }, 500);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const { action } = body;
    if (action === 'create') {
      const data = createVenta_(body.data);
      return json_({ ok: true, data });
    }
    if (action === 'update') {
      const data = updateVenta_(body.data);
      return json_({ ok: true, data });
    }
    if (action === 'delete') {
      removeVenta_(body.id);
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'Unknown action' }, 400);
  } catch (err) {
    return json_({ ok: false, error: String(err) }, 500);
  }
}

// CONFIG: Id de la hoja y nombre de pestaña
const SHEET_ID = 'REEMPLAZAR_CON_TU_ID';
const TAB_NAME = 'Ventas';

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(TAB_NAME);
  if (!sh) sh = ss.insertSheet(TAB_NAME);
  return sh;
}

function listVentas_() {
  const sh = getSheet_();
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
  const sh = getSheet_();
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
  const sh = getSheet_();
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
  const sh = getSheet_();
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

