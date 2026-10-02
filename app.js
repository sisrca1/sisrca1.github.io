/* ══════════════════════════════════════════════════════════
   PORTAL RCA (Registro y Control de Asistencia) — app.js  v1.0
   Cambios v5.5:
     • Fix real del mailer: payload enviado como parámetro GET (URL encoded)
     • GAS lee e.parameter.data en doPost/doGet — compatible con no-cors
     • Correos llegan tanto al usuario como al administrador
   Cambios v5.3:
     • Reemplazado EmailJS por Google Apps Script Mailer
     • Sin dependencias externas para correos
     • Correos HTML enriquecidos enviados desde sis.cte1@gmail.com
   Cambios v5.2:
     • Eliminado botón "Actualizar" del nav y de Mis Envíos
     • iniciarLimpiezaDuplicados() limpia la UI de forma síncrona y garantizada
     • Eliminadas funciones refrescarTodo / refrescarMisEnvios
══════════════════════════════════════════════════════════ */

/* ── Firebase ────────────────────────────────────────── */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDPgK1CBF0sO00j6Rho_e9xkc9Xj2HdPaI",
  authDomain:        "sis-cte1.firebaseapp.com",
  projectId:         "sis-cte1",
  storageBucket:     "sis-cte1.firebasestorage.app",
  messagingSenderId: "861145504172",
  appId:             "1:861145504172:web:daa073aec7e6478709c209"
};

/* ── GAS Mailer — Notificaciones por correo ──────────── */
const GAS_MAILER_URL = 'https://script.google.com/macros/s/AKfycbxVjHN7-NeDy2e0mhZ5RPIoqnUhzt86sW6v1HJlhmMaBtI-3PJlM2ZuSI1Wdvtf2jR8/exec';

/* ── Google Drive ────────────────────────────────────── */
const GDRIVE_CONFIG = {
  clientId: '861145504172-qf14jcon0msi3hl3l5cn5j5eard2gdvb.apps.googleusercontent.com',
  scope: 'https://www.googleapis.com/auth/drive'
};

const GDRIVE_CARPETA_GENERAL      = '1EBYsTtNi7JMTOYqKSnjFWnipmaq1L_LU';
const GDRIVE_CARPETA_COMPROBANTES = '1sZnOusOY3mT-nidmdlveKaj3FxX5WG5_';

/* ── Admin ───────────────────────────────────────────── */
const ADMIN_EMAILS = [
  "sis.cte1@gmail.com"
];

const AREAS = [
"ACTIVO FIJO","ARENILLAS CRV","ARENILLAS EDUCACION VIAL","ARENILLAS OIAT","ARENILLAS UNIDAD JUDICIAL","ARENILLAS UNIDAD LEGAL","AZUAY DAI","AZUAY GOBERNACION","AZUAY JEFE OIAT","BABA TERMINAL TERRESTRE","BABAHOYO CRV","BABAHOYO ECU-911","BABAHOYO OIAT","BABAHOYO UNIDAD JUDICIAL","BUENA FE CRV","BUENA FE EDUCACION VIAL","BUENA FE OIAT","BUENA FE UREM","CALUMA EDUCACION VIAL","CALUMA OIAT","CAMILO PONCE ENRIQUEZ OIAT","CHONE OIAT","CO2M","COMANDANCIA","COMANDANTE TRANSITO SUB ZONA AZUAY","CONJUNTO Y BANDA","CONTROL REGISTRO DE TRANSPORTE E INFORMALIDAD","COORDINACION GENERAL TTTSV","CUENCA CRV","CUENCA ECU-911","CUENCA EDUCACION VIAL","CUENCA OIAT","CULTURA Y DEPORTE","DAULE CRV","DAULE TERMINAL TERRESTRE","DIRECCION ASESORIA JURIDICA","DIRECCION DE CONTROL OPERATIVO","DIRECCION DE FORMACION Y DESARROLLO CTE - ACT","DIRECCION EJECUTIVA","DIRECCION FINANCIERA","DIRECCION NACIONAL OIAT","DIRECCION PROVINCIAL ANT GUAYAS","DIRECCION PROVINCIAL CTE GUAYAS","DIRECCION TALENTO HUMANO","DIRECCION ZONAL 2 MIT","DIRECCION ZONAL 8","DIRECTOR CONTROL OPERATIVO TTTSV","DISTRITO QUEVEDO OIAT","DISTRITO QUEVEDO UNIDAD JUDICIAL","DURAN EDUCACION VIAL","DURAN OIAT","DURAN TERMINAL TERRESTRE","DURAN UNIDAD JUDICIAL","EL EMPALME CRV","EL EMPALME UNIDAD JUDICIAL","EL GUABO EDUCACION VIAL","EL GUABO OIAT","EL GUABO UNIDAD JUDICIAL","EL GUABO UREM","EL ORO DAI","EL ORO GOBERNACION","EL TRIUNFO CRV","EL TRIUNFO UNIDAD JUDICIAL","ESCOLTA PRESIDENCIAL","ESCOLTA PRESIDENCIAL GOBERNACION","ESFOCE / ANGEL SONNENHOLZNER","ESFOCE / MAURO ORDOÑEZ","FUT","GIRON OIAT","GUALACEO CRV","GUALACEO OIAT","GUARDIA COMANDANCIA","GUARDIA COMANDANCIA ARMERIA","GUARDIA ED. CENTRAL","GUARDIA ESFOCE / MAURO ORDOÑEZ","GUARDIA PARQUE VIAL","GUARDIA PREVENCION DURAN","GUAYAQUIL CRV NORTE","GUAYAQUIL CRV SUR","GUAYAQUIL DAI","GUAYAQUIL EDUCACION VIAL","GUAYAQUIL OIAT CADENA DE CUSTODIO","GUAYAQUIL OIAT CENTRO","GUAYAQUIL OIAT ESTE","GUAYAQUIL OIAT FISCALIA MONTECRISTI","GUAYAQUIL OIAT FLORIDA NORTE","GUAYAQUIL OIAT MEDICINA LEGAL","GUAYAQUIL OIAT SUR","GUAYAQUIL TERMINAL TERRESTRE","GUAYAQUIL UREM","GUAYAS OIAT","HUAQUILLAS CEBAF","INGRESO DE CITACIONES","INSPECTORIA GENERAL","JEFE NACIONAL CRV","JIPIJAPA OIAT","JIPIJAPA UREM","LA AURORA OIAT","LA AURORA UNIDAD JUDICIAL","LA CONCORDIA OIAT","LA CONCORDIA UNIDAD JUDICIAL","LA LIBERTAD CRV","LAS NAVES EDUCACION VIAL","LAS NAVES OIAT","LENTAG CRV","LENTAG EDUCACION VIAL","LENTAG OIAT","LOS RIOS DAI","LOS RIOS GOBERNACION","MACARA CEBAF","MACHACHI CRV","MACHALA CRV","MACHALA ECU-911","MANABI DAI","MANABI DIRECCION PROVINCIAL","MANGLARALTO CRV","MANGLARALTO OIAT","MANTA OIAT","MANTENIMIENTO AUTOMOTRIZ","MILAGRO CRV","MILAGRO GUARDIA INSTALACIONES","MILAGRO TERMINAL TERRESTRE","MILAGRO UNIDAD JUDICIAL","MOLLETURO CRV","MOLLETURO OIAT","MOLLETURO UREM","MONTALVO EDUCACION VIAL","MONTALVO UNIDAD JUDICIAL","NACIONAL CEBAF","NARANJAL CRV","NARANJAL UNIDAD JUDICIAL","NARANJITO UNIDAD JUDICIAL","NUEVA LOJA CEBAF","OPERACIONES","PALMAR UREM","PARQUE AUTOMOTOR","PASCUALES TERMINAL TERRESTRE","PEDRO CARBO UNIDAD JUDICIAL","PICHINCHA OIAT MIT","PICHINCHA UNIDAD JUDICIAL","PIÑAS OIAT","PIÑAS UNIDAD JUDICIAL","PLAYAS UNIDAD JUDICIAL","PORTOVIEJO CRV","PORTOVIEJO ECU-911","PORTOVIEJO EDUCACION VIAL","PORTOVIEJO OIAT","PORTOVIEJO UNIDAD JUDICIAL","PORTOVIEJO UREM","PREVENCION DURAN INGRESO DE PARTES CITACIONES ESTADISTICAS","PROGRESO UREM","RIO 7 UREM","SALA SITUACIONAL","SALINAS - LA LIBERTAD OIAT","SALINAS CRV","SALITRE UNIDAD JUDICIAL","SAMBORONDON DAI ECU-911","SAMBORONDON ECU-911","SAMBORONDON UNIDAD JUDICIAL","SAN CARLOS UREM","SAN JUAN UREM","SANTA ELENA CRV","SANTA ELENA DAI","SANTA ELENA DIRECCION PROVINCIAL","SANTA ELENA ECU-911","SANTA ELENA EDUCACION VIAL","SANTA ELENA GOBERNACION","SANTA ELENA JEFE OIAT","SANTA ELENA OIAT","SANTA ELENA TERMINAL TERRESTRE","SANTA ELENA UNIDAD COMUNICACIONES OPERACIONALES","SANTA ELENA UNIDAD JUDICIAL","SANTA ELENA UREM","SANTA LUCIA UNIDAD JUDICIAL","SANTA ROSA UREM","SANTO DOMINGO","SANTO DOMINGO CRV","SANTO DOMINGO ECU-911","SANTO DOMINGO EDUCACION VIAL","SANTO DOMINGO OIAT","SANTO DOMINGO UNIDAD JUDICIAL","SANTO DOMINGO UREM","SARACAY UREM","SECRETARIA GENERAL","SIMON BOLIVAR UNIDAD JUDICIAL","SUB DIRECCION EJECUTIVA","SUB ZONA EL ORO","SUB ZONA GUAYAS","SUB ZONA MANABI","SUB ZONA SANTA ELENA","TANDAPI OIAT","TRES POSTES UREM","TULCAN CEBAF","UCT ARENILLAS","UCT BABAHOYO","UCT BABAHOYO UNIDAD LEGAL","UCT BALAO","UCT BALZAR","UCT BALZAR CRV","UCT BALZAR EDUCACION VIAL","UCT BALZAR OIAT","UCT BUCAY","UCT BUCAY UREM","UCT BUENA FE","UCT CALUMA","UCT CAMILO PONCE ENRIQUEZ","UCT CHARAPOTO","UCT CHONE","UCT COLIMES","UCT COLIMES CRV","UCT CUENCA","UCT CUENCA INGRESO DE PARTES CITACIONES ESTADISTICAS","UCT CUENCA UNIDAD JUDICIAL","UCT CUENCA UNIDAD LEGAL","UCT DAULE","UCT DAULE EDUCACION VIAL","UCT DAULE GUARDIA","UCT DAULE OIAT","UCT DAULE UNIDAD JUDICIAL","UCT DAULE UNIDAD LEGAL","UCT DAULE UREM","UCT DOS BOCAS","UCT DURAN","UCT EL EMPALME","UCT EL EMPALME EDUCACION VIAL","UCT EL EMPALME OIAT","UCT EL GUABO","UCT EL PAN","UCT EL ROSARIO","UCT EL TRIUNFO","UCT EL TRIUNFO EDUCACION VIAL","UCT EL TRIUNFO OIAT","UCT GIRON","UCT GUALACEO","UCT ISIDRO AYORA","UCT JIPIJAPA","UCT JUAN BAUTISTA AGUIRRE","UCT JUJAN","UCT JUNQUILLAL","UCT LA CONCORDIA","UCT LA LIBERTAD","UCT LA VICTORIA","UCT LAS NAVES","UCT LAUREL","UCT LENTAG","UCT LIMONAL","UCT LOMAS DE SARGENTILLO","UCT MANGLARALTO","UCT MARCELINO MARIDUEÑA","UCT MATILDE ESTHER","UCT MILAGRO","UCT MILAGRO DAI","UCT MILAGRO EDUCACION VIAL","UCT MILAGRO GUARDIA PREVENCION","UCT MILAGRO OIAT","UCT MILAGRO OIAT CADENA DE CUSTODIO","UCT MOLLETURO","UCT MONTALVO","UCT NARANJAL","UCT NARANJAL GUARDIA","UCT NARANJAL OIAT","UCT NARANJITO","UCT NARANJITO CRV","UCT NARANJITO OIAT","UCT NOBOL","UCT PALESTINA","UCT PALMAR","UCT PASCUALES","UCT PEDRO CARBO","UCT PEDRO CARBO CRV","UCT PEDRO CARBO EDUCACION VIAL","UCT PEDRO CARBO OIAT","UCT PIEDRERO","UCT PIÑAS","UCT PLAYAS","UCT PLAYAS EDUCACION VIAL","UCT PLAYAS OIAT","UCT PLAYAS UNIDAD LEGAL","UCT PORTOVIEJO","UCT PORTOVIEJO GUARDIA","UCT PORTOVIEJO UNIDAD LEGAL","UCT POSORJA","UCT PROGRESO","UCT PROGRESO CRV","UCT PROGRESO OIAT","UCT PUERTO CAYO","UCT PUNTILLA","UCT SALINAS","UCT SALINAS GUARDIA","UCT SALITRE","UCT SAMBORONDON","UCT SAMBORONDON OIAT","UCT SAN CARLOS DE BALAO","UCT SAN PABLO","UCT SANTA ELENA","UCT SANTA ELENA GUARDIA","UCT SANTA ELENA UNIDAD LEGAL","UCT SANTA LUCIA","UCT SANTO DOMINGO","UCT SANTO DOMINGO UNIDAD LEGAL","UCT SIMON BOLIVAR","UCT SIMON BOLIVAR CRV","UCT SUSUDEL","UCT TANDAPI","UCT TARIFA","UCT VENTANAS","UCT VINCES","UCT VINCES UNIDAD JUDICIAL","UCT VIRGEN DE FATIMA","UCT VIRGEN DE FATIMA OIAT","UCT YAGUACHI","UCT YAGUACHI EDUCACION VIAL","UCT YAGUACHI GUARDIA","UCT YAGUACHI OIAT","UCT ZAPOTAL","UCT ZAPOTAL SANTA ELENA","UNIDAD BIENESTAR SOCIAL","UNIDAD COMUNICACIONES OPERACIONALES","UNIDAD DE COMUNICACION SOCIAL","UNIDAD DE PERSONAL Y MOVILIDAD CTE","UNIDAD DE PROMOCION E IMAGEN OPERATIVA","UNIDAD JUDICIAL ALBAN BORJA","UNIDAD JUDICIAL FLORIDA NORTE","UNIDAD JUDICIAL INGRESO DE PARTES CITACIONES ESTADISTICAS","UNIDAD JUDICIAL VALDIVIA SUR","UNIDAD LEGAL CTE","UNIDAD LOGISTICA PARQUE AUTOMOTOR","UNIDAD PLANIFICACION ESTRATEGICA","UNIDAD PLANIFICACION OPERATIVA NACIONAL","UNIDAD PLANIFICACION VIAL NACIONAL","UNIDAD PLANIFICACION VIAL OPERATIVA AZUAY","UNIDAD PLANIFICACION VIAL OPERATIVA EL ORO","UNIDAD PLANIFICACION VIAL OPERATIVA MANABI","UNIDAD PLANIFICACION VIAL OPERATIVA SANTA ELENA","UNIDAD PLANIFICACION VIAL OPERATIVA SANTO DOMINGO","UNIDAD PLANIFICACION VIAL OPERATIVA SUB ZONA GUAYAS","UNIDAD PLANIFICACION VIAL OPERATIVA ZONA 8","UNIDAD SEÑALETICA","VALIDADOR RADAR","VENTANAS EDUCACION VIAL","VENTANAS OIAT","VENTANAS TERMINAL TERRESTRE","VINCES CRV","VINCES OIAT","VINCES TERMINAL TERRESTRE","VIRGEN DE FATIMA UREM","YAGUACHI UNIDAD JUDICIAL","ZAPOTAL EDUCACION VIAL","ZAPOTAL UREM",
];

/* ── Códigos de Novedad (8 exactos) ─────────────────── */
// ── Escudo del Ecuador y sello de la CTE: se cargan desde la carpeta img/
//    para no inflar el tamaño de este archivo. Se cachean tras la primera carga.
//    El antiguo logo "S" de SISCTE iba embebido en base64 acá; se eliminó al
//    pasar al monograma "RCA", que ahora se dibuja como texto vectorial.
const _cacheImagenesInstitucionales = {};
async function cargarImagenComoBase64(ruta) {
  if (_cacheImagenesInstitucionales[ruta]) return _cacheImagenesInstitucionales[ruta];
  const resp = await fetch(ruta);
  if (!resp.ok) throw new Error(`No se pudo cargar ${ruta}`);
  const blob = await resp.blob();
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  _cacheImagenesInstitucionales[ruta] = base64;
  return base64;
}
async function obtenerEscudoEcuador() {
  try { return await cargarImagenComoBase64('img/escudo-ecuador.png'); }
  catch(e) { console.warn('No se pudo cargar el escudo de Ecuador:', e); return null; }
}
async function obtenerSelloCTE() {
  try { return await cargarImagenComoBase64('img/sello-cte.png'); }
  catch(e) { console.warn('No se pudo cargar el sello de la CTE:', e); return null; }
}

// ── Logo institucional de la CTE: reemplaza al escudo del Ecuador en las
//    exportaciones del módulo Novedades (PDF y Excel). Colocar el archivo
//    en img/logo-cte.png ──
async function obtenerLogoCTE() {
  try { return await cargarImagenComoBase64('img/logo-cte.png'); }
  catch(e) { console.warn('No se pudo cargar el logo de la CTE:', e); return null; }
}

const CODIGOS_VALIDOS = ["S/N", "OA", "X", "CS", "B", "LI", "V", "PE", "FA"];
const CODIGOS_DESC = {
  "S/N": "SIN NOVEDAD (normal)",
  "OA":  "OTRA ÁREA — Formulario Único de Traslado (FUT)",
  "X":   "AUSENCIA INJUSTIFICADA",
  "CS":  "COMISIÓN DE SERVICIO",
  "B":   "BAJA (Fallecido, Destitución, Renuncia)",
  "LI":  "LICENCIA (Paternidad, Matrimonio, Calamidad, Maternidad)",
  "V":   "VACACIONES",
  "PE":  "PERMISO",
  "FA":  "FRANCO FIN DE SEMANA"
};

let db, auth, usuario = null;
let archivoSeleccionado  = null;
let informeSeleccionado  = null;
let actaSeleccionada     = null;
let docsAdmin           = [];
let _firebaseReady      = null;
let _driveTokenCache    = null;
let _driveTokenExpiry   = 0;

// Variables para Novedades
let novedadesActuales   = null;
let areaActual          = null;
let mesActual           = null;

/* ══════════════════════════════════
   FIREBASE INIT
══════════════════════════════════ */
let _resolveFirebase;
_firebaseReady = new Promise(res => { _resolveFirebase = res; });

async function initFirebase() {
  try {
    const { initializeApp }
      = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
    const { getFirestore, collection, addDoc, getDocs, orderBy, query, doc, getDoc, setDoc, updateDoc, deleteDoc, where, limit, startAfter, writeBatch, onSnapshot, serverTimestamp }
      = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    const { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
      getRedirectResult, signOut, onAuthStateChanged,
      createUserWithEmailAndPassword, signInWithEmailAndPassword,
      sendPasswordResetEmail, updateProfile }
      = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

    const app = initializeApp(FIREBASE_CONFIG);
    db   = getFirestore(app);
    auth = getAuth(app);

    window._fb = {
      collection, addDoc, getDocs, orderBy, query, doc, getDoc, setDoc, updateDoc, deleteDoc, where, limit, startAfter, writeBatch, onSnapshot, serverTimestamp,
      GoogleAuthProvider, signInWithPopup, signInWithRedirect,
      getRedirectResult, signOut, onAuthStateChanged,
      createUserWithEmailAndPassword, signInWithEmailAndPassword,
      sendPasswordResetEmail, updateProfile
    };

    try {
      const result = await getRedirectResult(auth);
      if (result?.user) console.log('✓ Redirect login:', result.user.email);
    } catch(e) { console.warn('Redirect result:', e.message); }

    onAuthStateChanged(auth, async u => {
      if (u) {
        usuario = { uid: u.uid, nombre: u.displayName, email: u.email, foto: u.photoURL };
        await cargarPermisoUsuario();
        actualizarNav();

        const debeVerOperativas = await actualizarVisibilidadNav();

        if (!debeVerOperativas && tieneAccesoPanel()) {
          irAdmin();
        } else if (!debeVerOperativas && (esSupervisor() || tienePermisoAccion('actividad_ver'))) {
          irReportes();
        } else {
          irNovedades();
        }

        // Tiempo real sobre el propio permiso y acceso: si el admin cambia algo
        // mientras esta pestaña sigue abierta, se entera sin recargar la página.
        iniciarListenerPermisoUsuario();
        iniciarListenerAccesoUsuario();
        // Hora del servidor primero (máx. 4 s de espera) para que el cronómetro nunca dependa del reloj del equipo
        iniciarSincronizacionReloj();
        await Promise.race([sincronizarRelojServidor(), new Promise(r => setTimeout(r, 4000))]);
        iniciarListenerMantenimiento();
      } else {
        detenerListenersPropios();
        usuario = null;
        permisoUsuario = null;
        actualizarNav();
        ir('vista-login');
      }
    });

    _resolveFirebase();
  } catch(e) {
    console.error('❌ Error Firebase:', e);
    toast('Error iniciando sistema: ' + e.message, 'err');
    _resolveFirebase();
  }
}

/* ══════════════════════════════════
   AUTH — solo Google
══════════════════════════════════ */
async function login() {
  try {
    await _firebaseReady;
    const provider = new window._fb.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    try {
      toast('Abriendo ventana de Google...', 'ok');
      await window._fb.signInWithPopup(auth, provider);
    } catch(popupErr) {
      if (['auth/popup-blocked','auth/popup-closed-by-user','auth/cancelled-popup-request']
          .includes(popupErr.code)) {
        toast('Redirigiendo a Google...', 'ok');
        await window._fb.signInWithRedirect(auth, provider);
      } else { throw popupErr; }
    }
  } catch(e) {
    if (!['auth/popup-closed-by-user','auth/cancelled-popup-request'].includes(e.code))
      toast('Error: ' + (e.message || e.code), 'err');
  }
}

async function logout() {
  _driveTokenCache = null; _driveTokenExpiry = 0;
  try { await window._fb.signOut(auth); } catch(e) {}
}

const esAdmin = () =>
  usuario && ADMIN_EMAILS.map(x => x.toLowerCase()).includes(usuario.email.toLowerCase());

/* ══════════════════════════════════
   PERMISOS — acceso parcial al Panel de Control / supervisor de solo lectura
══════════════════════════════════ */

// Catálogo de acciones concretas que se pueden delegar, agrupadas por pestaña.
// key = se usa como identificador en Firestore y en los atributos data-permiso del HTML.
const PERMISOS_DISPONIBLES = [
  { tab: 'envios', tabLabel: '📤 Envíos realizados', acciones: [
    { key: 'envios_ver',                label: 'Ver envíos y estadísticas' },
    { key: 'envios_exportar',           label: 'Exportar Excel (todo / filtrado)' },
    { key: 'envios_archivar',           label: 'Archivar mes' },
    { key: 'envios_eliminar_duplicados',label: 'Eliminar registros de la BD' },
  ]},
  { tab: 'importar', tabLabel: '📥 Importar BD', acciones: [
    { key: 'importar_bd',               label: 'Importar base de datos (Excel/CSV)' },
    { key: 'importar_borrar_todo',      label: 'Borrar TODA la base de Novedades' },
    { key: 'importar_ver_personal',     label: 'Ver Base de Personal' },
  ]},
  { tab: 'accesos', tabLabel: '🔐 Accesos', acciones: [
    { key: 'accesos_ver',               label: 'Ver accesos' },
    { key: 'accesos_gestionar',         label: 'Crear / editar / eliminar accesos' },
  ]},
  { tab: 'auditoria', tabLabel: '📋 Auditoría', acciones: [
    { key: 'auditoria_ver',             label: 'Ver auditoría' },
    { key: 'auditoria_exportar',        label: 'Exportar auditoría a Excel' },
    { key: 'auditoria_limpiar',         label: 'Eliminar historial de auditoría' },
  ]},
  { tab: 'desbloqueos', tabLabel: '🔓 Desbloqueos', acciones: [
    { key: 'desbloqueos_ver',           label: 'Ver solicitudes de desbloqueo' },
    { key: 'desbloqueos_aprobar',       label: 'Aprobar / rechazar solicitudes' },
    { key: 'desbloqueos_directo',       label: 'Desbloqueo directo (sin esperar solicitud)' },
  ]},
  { tab: 'resumen', tabLabel: '📊 Reportes', acciones: [
    { key: 'resumen_ver',               label: 'Ver resumen general' },
    { key: 'resumen_exportar',          label: 'Exportar resumen a Excel' },
  ]},
  { tab: 'areas', tabLabel: '🗺️ Áreas', acciones: [
    { key: 'areas_gestionar',           label: 'Agregar / renombrar / eliminar / importar áreas' },
  ]},
  { tab: 'actividad', tabLabel: '📈 Actividad del Administrador', acciones: [
    { key: 'actividad_ver',             label: 'Ver actividad del administrador (auditoría resumida) y descargarla' },
  ]},
  { tab: 'config', tabLabel: '⚙️ Configuración', acciones: [
    { key: 'config_ver',                label: 'Ver la configuración de cierre mensual' },
    { key: 'config_editar',             label: 'Cambiar los días de habilitación y bloqueo del informe mensual' },
  ]},
  { tab: 'reporte_novedades', tabLabel: '📄 Novedades — Generar Reporte', acciones: [
    { key: 'reporte_elegir_mes',        label: 'Elegir cualquier mes/año en "Generar Reporte" (como el administrador)' },
    { key: 'reporte_habilitar_campos',  label: 'Habilitar "Elaborado por" / "Responsable" y el botón para generar reportes tardíos (aunque el mes aún no cierre automáticamente)' },
  ]},
];

let permisoUsuario = null; // { tipo: 'parcial'|'supervisor', acciones: [...] } o null

async function cargarPermisoUsuario() {
  permisoUsuario = null;
  if (!usuario || esAdmin()) return; // el superadmin no necesita permiso, ya tiene todo
  try {
    const ref = window._fb.doc(db, 'permisos_panel', usuario.email.toLowerCase());
    const snap = await window._fb.getDoc(ref);
    if (snap.exists()) permisoUsuario = snap.data();
  } catch(e) {
    console.warn('No se pudo cargar el permiso del usuario:', e);
  }
}

const tienePermisoAccion = (key) => {
  if (esAdmin()) return true;
  if (permisoUsuario?.tipo === 'parcial') return (permisoUsuario.acciones || []).includes(key);
  // El supervisor puede ver y exportar cualquier cosa, pero nunca crear/editar/eliminar/aprobar/importar
  if (permisoUsuario?.tipo === 'supervisor') return key.endsWith('_ver') || key.endsWith('_exportar');
  return false;
};

// Una pestaña se muestra si el usuario tiene AL MENOS una acción de ese grupo
// (el supervisor ve todas las pestañas sustantivas, siempre en modo solo lectura)
const tabPermitido = (tabName) => {
  if (esAdmin()) return true;
  if (permisoUsuario?.tipo === 'supervisor') return true;
  if (permisoUsuario?.tipo !== 'parcial') return false;
  const grupo = PERMISOS_DISPONIBLES.find(g => g.tab === tabName);
  if (!grupo) return false;
  return grupo.acciones.some(a => (permisoUsuario.acciones || []).includes(a.key));
};

const tieneAccesoPanel = () =>
  esAdmin() || (permisoUsuario && (permisoUsuario.tipo === 'parcial' || permisoUsuario.tipo === 'supervisor'));
const esSupervisor = () => !esAdmin() && permisoUsuario && permisoUsuario.tipo === 'supervisor';

async function usuarioTieneAreaAsignada() {
  try {
    const q = window._fb.query(
      window._fb.collection(db, 'accesos'),
      window._fb.where('correo', '==', usuario.email.toLowerCase())
    );
    const snap = await window._fb.getDocs(q);
    return !snap.empty;
  } catch(e) {
    return false;
  }
}

// Novedades/Envíos son para personal operativo (con área asignada en Accesos).
// Si la persona tiene algún permiso del Panel de Control pero NO tiene área
// asignada, no es personal operativo — no debe ver esas dos pestañas, sin
// importar qué tipo de permiso se le haya dado. Devuelve si debe ver las
// pestañas operativas, para que quien la llama decida si además navega.
async function actualizarVisibilidadNav() {
  const tieneArea = permisoUsuario ? await usuarioTieneAreaAsignada() : true;
  const debeVerOperativas = esAdmin() || tieneArea;

  debeVerOperativas ? show('nb-novedades') : hide('nb-novedades');
  debeVerOperativas ? show('nb-envios') : hide('nb-envios');
  tieneAccesoPanel() ? show('nb-admin') : hide('nb-admin');   // Panel de control: admin o con permiso
  (esSupervisor() || tienePermisoAccion('actividad_ver')) ? show('nb-reportes') : hide('nb-reportes');

  return debeVerOperativas;
}

/* ══════════════════════════════════
   TIEMPO REAL sobre el propio permiso/acceso
   ──────────────────────────────────
   Antes, el permiso (permisos_panel) y el área asignada (accesos) se leían
   UNA SOLA VEZ, al iniciar sesión. Si el administrador quitaba un permiso,
   bloqueaba el acceso o cambiaba las áreas de alguien que ya tenía la
   pestaña abierta, esa persona no se enteraba hasta recargar la página —
   aunque, ojo, las reglas de Firestore igual rechazaban cualquier intento
   de guardar algo que ya no le correspondía; solo la PANTALLA quedaba
   desactualizada, no la seguridad real.
   Ahora se deja un oyente (onSnapshot) sobre su propio documento en cada
   colección, así el cambio le llega solo, sin recargar nada.
══════════════════════════════════ */
let unsubPermisoUsuario = null;
let unsubAccesoUsuario  = null;

function detenerListenersPropios() {
  if (unsubPermisoUsuario) { unsubPermisoUsuario(); unsubPermisoUsuario = null; }
  if (unsubAccesoUsuario)  { unsubAccesoUsuario();  unsubAccesoUsuario = null; }
  if (unsubMantenimiento)  { unsubMantenimiento();  unsubMantenimiento = null; }
  detenerTimersMantenimiento();
  hide('pantalla-mantenimiento');
  const avisoAdmin = $('mantenimiento-info-flotante');
  if (avisoAdmin) avisoAdmin.remove();
}

function iniciarListenerPermisoUsuario() {
  if (!usuario || esAdmin()) return; // el superadmin no tiene documento de permiso
  if (unsubPermisoUsuario) unsubPermisoUsuario();

  const ref = window._fb.doc(db, 'permisos_panel', usuario.email.toLowerCase());
  unsubPermisoUsuario = window._fb.onSnapshot(ref, async (snap) => {
    const nuevo = snap.exists() ? snap.data() : null;
    const eraAlgo = !!permisoUsuario;
    permisoUsuario = nuevo;

    // Si le quitaron el permiso por completo mientras estaba en el Panel de
    // Control, sacarla de ahí — ya no tiene nada que ver.
    if (eraAlgo && !nuevo && vistaActual === 'vista-admin') {
      toast('🔒 Se le retiró el acceso al Panel de Control', 'err');
      irNovedades();
      return;
    }

    await actualizarVisibilidadNav();
    aplicarPermisosBotones();
    if (vistaActual === 'vista-admin') aplicarVisibilidadTabsAdmin();
  }, (e) => console.warn('Listener de permiso interrumpido:', e.message));
}

function iniciarListenerAccesoUsuario() {
  if (!usuario || esAdmin()) return;
  if (unsubAccesoUsuario) unsubAccesoUsuario();

  const correoNorm = String(usuario.email || '').toLowerCase().trim();
  const ref = window._fb.doc(db, 'accesos', correoNorm);
  unsubAccesoUsuario = window._fb.onSnapshot(ref, (snap) => {
    if (!snap.exists()) return; // sin acceso configurado — el flujo normal ya lo avisa al entrar
    const acceso = snap.data();

    if (acceso.estado === false) {
      toast('🔒 Su acceso fue bloqueado. Se cerrará la sesión.', 'err');
      logout();
      return;
    }

    if (vistaActual !== 'vista-novedades') return; // el cambio se aplica solo cuando vuelva a esa pantalla

    const areasNuevas = Array.isArray(acceso.areas) && acceso.areas.length
      ? acceso.areas
      : (acceso.area ? [acceso.area] : []);

    if (!areasNuevas.includes(areaActual)) {
      // Le quitaron el área que tenía activa — salta a otra y recarga la tabla.
      areaActual = areasNuevas.includes(acceso.areaActiva) ? acceso.areaActiva : (areasNuevas[0] || '');
      toast(`ℹ️ Sus áreas asignadas cambiaron — ahora en "${areaActual}"`, 'ok');
      cargarNovedadesActuales();
    } else if (areasNuevas.length > 1) {
      // Sigue teniendo la misma área activa, pero puede haberse sumado o
      // quitado alguna otra — refrescar solo el selector, sin recargar la tabla.
      poblarSelectorAreaActivaSecretario(areasNuevas, areaActual);
      show('selector-area-activa-secretario');
    } else {
      hide('selector-area-activa-secretario');
    }
  }, (e) => console.warn('Listener de acceso interrumpido:', e.message));
}

const MANT_SVG = {"letrero": "<svg viewBox=\"0 0 600 440\" role=\"img\" aria-label=\"Letrero de mantenimiento colgando de una grúa, con conos y una luz de obra parpadeando\" xmlns=\"http://www.w3.org/2000/svg\"><defs><linearGradient id=\"@P@-oro\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#f5d37a\"/><stop offset=\"1\" stop-color=\"#e8b84b\"/></linearGradient><pattern id=\"@P@-franja\" patternUnits=\"userSpaceOnUse\" width=\"28\" height=\"28\" patternTransform=\"rotate(45)\"><rect width=\"28\" height=\"28\" fill=\"#e8b84b\"/><rect width=\"14\" height=\"28\" fill=\"#0d1b3e\"/></pattern><radialGradient id=\"@P@-luz\"><stop offset=\"0\" stop-color=\"#fb923c\" stop-opacity=\".95\"/><stop offset=\"1\" stop-color=\"#fb923c\" stop-opacity=\"0\"/></radialGradient><filter id=\"@P@-sombra\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"150%\"><feDropShadow dx=\"0\" dy=\"6\" stdDeviation=\"5\" flood-color=\"#000\" flood-opacity=\".35\"/></filter></defs><ellipse cx=\"300\" cy=\"404\" rx=\"272\" ry=\"13\" fill=\"#000\" opacity=\".28\"/><g transform=\"translate(520.00,72.00)\"><g><path d=\"M19.80,-2.82 L27.32,-2.15 L27.32,2.15 L19.80,2.82 A20.00,20.00 0 0 1 18.56,7.46 L18.56,7.46 L24.73,11.80 L22.58,15.52 L15.74,12.34 A20.00,20.00 0 0 1 12.34,15.74 L12.34,15.74 L15.52,22.58 L11.80,24.73 L7.46,18.56 A20.00,20.00 0 0 1 2.82,19.80 L2.82,19.80 L2.15,27.32 L-2.15,27.32 L-2.82,19.80 A20.00,20.00 0 0 1 -7.46,18.56 L-7.46,18.56 L-11.80,24.73 L-15.52,22.58 L-12.34,15.74 A20.00,20.00 0 0 1 -15.74,12.34 L-15.74,12.34 L-22.58,15.52 L-24.73,11.80 L-18.56,7.46 A20.00,20.00 0 0 1 -19.80,2.82 L-19.80,2.82 L-27.32,2.15 L-27.32,-2.15 L-19.80,-2.82 A20.00,20.00 0 0 1 -18.56,-7.46 L-18.56,-7.46 L-24.73,-11.80 L-22.58,-15.52 L-15.74,-12.34 A20.00,20.00 0 0 1 -12.34,-15.74 L-12.34,-15.74 L-15.52,-22.58 L-11.80,-24.73 L-7.46,-18.56 A20.00,20.00 0 0 1 -2.82,-19.80 L-2.82,-19.80 L-2.15,-27.32 L2.15,-27.32 L2.82,-19.80 A20.00,20.00 0 0 1 7.46,-18.56 L7.46,-18.56 L11.80,-24.73 L15.52,-22.58 L12.34,-15.74 A20.00,20.00 0 0 1 15.74,-12.34 L15.74,-12.34 L22.58,-15.52 L24.73,-11.80 L18.56,-7.46 A20.00,20.00 0 0 1 19.80,-2.82Z\" fill=\"url(#@P@-oro)\" stroke=\"#b8901f\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><circle r=\"10.00\" fill=\"#1a2f5e\" stroke=\"#b8901f\" stroke-width=\"1.4\"/><circle cx=\"12.47\" cy=\"7.20\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"0.00\" cy=\"14.40\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-12.47\" cy=\"7.20\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-12.47\" cy=\"-7.20\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-0.00\" cy=\"-14.40\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"12.47\" cy=\"-7.20\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle r=\"3.40\" fill=\"#e8b84b\"/><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 0 0\" to=\"360 0 0\" dur=\"14.00s\" repeatCount=\"indefinite\"/></g></g><g transform=\"translate(520.00,112.00)\"><g><path d=\"M-6.82,-9.87 L-9.48,-16.93 L-5.27,-18.67 L-2.16,-11.80 A12.00,12.00 0 0 1 2.16,-11.80 L2.16,-11.80 L5.27,-18.67 L9.48,-16.93 L6.82,-9.87 A12.00,12.00 0 0 1 9.87,-6.82 L9.87,-6.82 L16.93,-9.48 L18.67,-5.27 L11.80,-2.16 A12.00,12.00 0 0 1 11.80,2.16 L11.80,2.16 L18.67,5.27 L16.93,9.48 L9.87,6.82 A12.00,12.00 0 0 1 6.82,9.87 L6.82,9.87 L9.48,16.93 L5.27,18.67 L2.16,11.80 A12.00,12.00 0 0 1 -2.16,11.80 L-2.16,11.80 L-5.27,18.67 L-9.48,16.93 L-6.82,9.87 A12.00,12.00 0 0 1 -9.87,6.82 L-9.87,6.82 L-16.93,9.48 L-18.67,5.27 L-11.80,2.16 A12.00,12.00 0 0 1 -11.80,-2.16 L-11.80,-2.16 L-18.67,-5.27 L-16.93,-9.48 L-9.87,-6.82 A12.00,12.00 0 0 1 -6.82,-9.87Z\" fill=\"url(#@P@-oro)\" stroke=\"#b8901f\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><circle r=\"6.00\" fill=\"#1a2f5e\" stroke=\"#b8901f\" stroke-width=\"1.4\"/><circle cx=\"7.48\" cy=\"4.32\" r=\"1.32\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"0.00\" cy=\"8.64\" r=\"1.32\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-7.48\" cy=\"4.32\" r=\"1.32\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-7.48\" cy=\"-4.32\" r=\"1.32\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-0.00\" cy=\"-8.64\" r=\"1.32\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"7.48\" cy=\"-4.32\" r=\"1.32\" fill=\"#0d1b3e\" opacity=\".85\"/><circle r=\"2.04\" fill=\"#e8b84b\"/><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 0 0\" to=\"-360 0 0\" dur=\"9.33s\" repeatCount=\"indefinite\"/></g></g><g transform=\"translate(78.00,84.00)\"><g><path d=\"M19.80,-2.82 L27.32,-2.15 L27.32,2.15 L19.80,2.82 A20.00,20.00 0 0 1 18.56,7.46 L18.56,7.46 L24.73,11.80 L22.58,15.52 L15.74,12.34 A20.00,20.00 0 0 1 12.34,15.74 L12.34,15.74 L15.52,22.58 L11.80,24.73 L7.46,18.56 A20.00,20.00 0 0 1 2.82,19.80 L2.82,19.80 L2.15,27.32 L-2.15,27.32 L-2.82,19.80 A20.00,20.00 0 0 1 -7.46,18.56 L-7.46,18.56 L-11.80,24.73 L-15.52,22.58 L-12.34,15.74 A20.00,20.00 0 0 1 -15.74,12.34 L-15.74,12.34 L-22.58,15.52 L-24.73,11.80 L-18.56,7.46 A20.00,20.00 0 0 1 -19.80,2.82 L-19.80,2.82 L-27.32,2.15 L-27.32,-2.15 L-19.80,-2.82 A20.00,20.00 0 0 1 -18.56,-7.46 L-18.56,-7.46 L-24.73,-11.80 L-22.58,-15.52 L-15.74,-12.34 A20.00,20.00 0 0 1 -12.34,-15.74 L-12.34,-15.74 L-15.52,-22.58 L-11.80,-24.73 L-7.46,-18.56 A20.00,20.00 0 0 1 -2.82,-19.80 L-2.82,-19.80 L-2.15,-27.32 L2.15,-27.32 L2.82,-19.80 A20.00,20.00 0 0 1 7.46,-18.56 L7.46,-18.56 L11.80,-24.73 L15.52,-22.58 L12.34,-15.74 A20.00,20.00 0 0 1 15.74,-12.34 L15.74,-12.34 L22.58,-15.52 L24.73,-11.80 L18.56,-7.46 A20.00,20.00 0 0 1 19.80,-2.82Z\" fill=\"url(#@P@-oro)\" stroke=\"#b8901f\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><circle r=\"10.00\" fill=\"#1a2f5e\" stroke=\"#b8901f\" stroke-width=\"1.4\"/><circle cx=\"12.47\" cy=\"7.20\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"0.00\" cy=\"14.40\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-12.47\" cy=\"7.20\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-12.47\" cy=\"-7.20\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-0.00\" cy=\"-14.40\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"12.47\" cy=\"-7.20\" r=\"2.20\" fill=\"#0d1b3e\" opacity=\".85\"/><circle r=\"3.40\" fill=\"#e8b84b\"/><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 0 0\" to=\"-360 0 0\" dur=\"16.00s\" repeatCount=\"indefinite\"/></g></g><g filter=\"url(#@P@-sombra)\"><line x1=\"228\" y1=\"356\" x2=\"206\" y2=\"402\" stroke=\"#cfd8ea\" stroke-width=\"10\" stroke-linecap=\"round\"/><line x1=\"372\" y1=\"356\" x2=\"394\" y2=\"402\" stroke=\"#cfd8ea\" stroke-width=\"10\" stroke-linecap=\"round\"/><rect x=\"216\" y=\"372\" width=\"168\" height=\"18\" rx=\"4\" fill=\"#e8eef9\"/><rect x=\"204\" y=\"322\" width=\"192\" height=\"36\" rx=\"6\" fill=\"url(#@P@-franja)\" stroke=\"#0d1b3e\" stroke-width=\"3\"/></g><rect x=\"284\" y=\"304\" width=\"32\" height=\"18\" rx=\"4\" fill=\"#475569\"/><circle cx=\"300\" cy=\"298\" r=\"40\" fill=\"url(#@P@-luz)\"><animate attributeName=\"opacity\" values=\".15;1;.15\" dur=\"1.3s\" repeatCount=\"indefinite\" calcMode=\"spline\" keyTimes=\"0;.5;1\" keySplines=\".4 0 .6 1;.4 0 .6 1\"/></circle><circle cx=\"300\" cy=\"298\" r=\"16\" fill=\"#f97316\" stroke=\"#9a3412\" stroke-width=\"2\"><animate attributeName=\"fill\" values=\"#c2410c;#fdba74;#c2410c\" dur=\"1.3s\" repeatCount=\"indefinite\"/></circle><circle cx=\"300\" cy=\"298\" r=\"18\" fill=\"none\" stroke=\"#fb923c\" stroke-width=\"2\"><animate attributeName=\"r\" values=\"18;44\" dur=\"1.3s\" repeatCount=\"indefinite\"/><animate attributeName=\"opacity\" values=\".7;0\" dur=\"1.3s\" repeatCount=\"indefinite\"/></circle><g transform=\"translate(66,400)\"><path d=\"M-10,-96 Q0,-103 10,-96 L30,-8 L-30,-8 Z\" fill=\"#f97316\"/><polygon points=\"-15.45,-72 15.45,-72 20,-52 -20,-52\" fill=\"#fff\"/><polygon points=\"-23.2,-38 23.2,-38 26.8,-22 -26.8,-22\" fill=\"#fff\"/><path d=\"M-6,-94 L-2,-94 L-16,-8 L-22,-8 Z\" fill=\"#fff\" opacity=\".18\"/><rect x=\"-38\" y=\"-9\" width=\"76\" height=\"11\" rx=\"3\" fill=\"#c2410c\"/></g><g transform=\"translate(126,400)\"><path d=\"M-10,-96 Q0,-103 10,-96 L30,-8 L-30,-8 Z\" fill=\"#f97316\"/><polygon points=\"-15.45,-72 15.45,-72 20,-52 -20,-52\" fill=\"#fff\"/><polygon points=\"-23.2,-38 23.2,-38 26.8,-22 -26.8,-22\" fill=\"#fff\"/><path d=\"M-6,-94 L-2,-94 L-16,-8 L-22,-8 Z\" fill=\"#fff\" opacity=\".18\"/><rect x=\"-38\" y=\"-9\" width=\"76\" height=\"11\" rx=\"3\" fill=\"#c2410c\"/></g><g transform=\"translate(474,400)\"><path d=\"M-10,-96 Q0,-103 10,-96 L30,-8 L-30,-8 Z\" fill=\"#f97316\"/><polygon points=\"-15.45,-72 15.45,-72 20,-52 -20,-52\" fill=\"#fff\"/><polygon points=\"-23.2,-38 23.2,-38 26.8,-22 -26.8,-22\" fill=\"#fff\"/><path d=\"M-6,-94 L-2,-94 L-16,-8 L-22,-8 Z\" fill=\"#fff\" opacity=\".18\"/><rect x=\"-38\" y=\"-9\" width=\"76\" height=\"11\" rx=\"3\" fill=\"#c2410c\"/></g><g transform=\"translate(534,400)\"><path d=\"M-10,-96 Q0,-103 10,-96 L30,-8 L-30,-8 Z\" fill=\"#f97316\"/><polygon points=\"-15.45,-72 15.45,-72 20,-52 -20,-52\" fill=\"#fff\"/><polygon points=\"-23.2,-38 23.2,-38 26.8,-22 -26.8,-22\" fill=\"#fff\"/><path d=\"M-6,-94 L-2,-94 L-16,-8 L-22,-8 Z\" fill=\"#fff\" opacity=\".18\"/><rect x=\"-38\" y=\"-9\" width=\"76\" height=\"11\" rx=\"3\" fill=\"#c2410c\"/></g><line x1=\"300\" y1=\"-10\" x2=\"300\" y2=\"30\" stroke=\"#9fb3d9\" stroke-width=\"6\"/><g><circle cx=\"300\" cy=\"42\" r=\"11\" fill=\"none\" stroke=\"#e8b84b\" stroke-width=\"5\"/><path d=\"M300,53 L204,126 M300,53 L396,126\" stroke=\"#cbd5e8\" stroke-width=\"3\" fill=\"none\"/><g filter=\"url(#@P@-sombra)\"><rect x=\"150\" y=\"120\" width=\"300\" height=\"152\" rx=\"24\" fill=\"url(#@P@-franja)\" stroke=\"#0d1b3e\" stroke-width=\"4\"/><rect x=\"170\" y=\"140\" width=\"260\" height=\"112\" rx=\"14\" fill=\"url(#@P@-oro)\" stroke=\"#0d1b3e\" stroke-width=\"4\"/><rect x=\"176\" y=\"146\" width=\"248\" height=\"5\" rx=\"2.5\" fill=\"#fff\" opacity=\".35\"/></g><circle cx=\"204\" cy=\"124\" r=\"7\" fill=\"#94a3b8\" stroke=\"#0d1b3e\" stroke-width=\"2.5\"/><circle cx=\"396\" cy=\"124\" r=\"7\" fill=\"#94a3b8\" stroke=\"#0d1b3e\" stroke-width=\"2.5\"/><text x=\"300\" y=\"186\" text-anchor=\"middle\" font-family=\"'Barlow Condensed','Arial Narrow',Impact,sans-serif\" font-weight=\"700\" font-size=\"28\" fill=\"#0d1b3e\" textLength=\"132\" lengthAdjust=\"spacingAndGlyphs\">SISTEMA RCA</text><text x=\"300\" y=\"230\" text-anchor=\"middle\" font-family=\"'Barlow Condensed','Arial Narrow',Impact,sans-serif\" font-weight=\"800\" font-size=\"42\" fill=\"#0d1b3e\" textLength=\"226\" lengthAdjust=\"spacingAndGlyphs\">MANTENIMIENTO</text><animateTransform attributeName=\"transform\" type=\"rotate\" values=\"-4.5 300 42;4.5 300 42;-4.5 300 42\" keyTimes=\"0;.5;1\" dur=\"3.4s\" repeatCount=\"indefinite\" calcMode=\"spline\" keySplines=\".45 0 .55 1;.45 0 .55 1\"/></g></svg>", "engranajes": "<svg viewBox=\"0 0 600 440\" role=\"img\" aria-label=\"Tres engranajes girando y una barra de progreso\" xmlns=\"http://www.w3.org/2000/svg\"><defs><linearGradient id=\"@P@-oro\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#f5d37a\"/><stop offset=\"1\" stop-color=\"#e8b84b\"/></linearGradient><pattern id=\"@P@-franja\" patternUnits=\"userSpaceOnUse\" width=\"28\" height=\"28\" patternTransform=\"rotate(45)\"><rect width=\"28\" height=\"28\" fill=\"#e8b84b\"/><rect width=\"14\" height=\"28\" fill=\"#0d1b3e\"/></pattern><radialGradient id=\"@P@-luz\"><stop offset=\"0\" stop-color=\"#fb923c\" stop-opacity=\".95\"/><stop offset=\"1\" stop-color=\"#fb923c\" stop-opacity=\"0\"/></radialGradient><filter id=\"@P@-sombra\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"150%\"><feDropShadow dx=\"0\" dy=\"6\" stdDeviation=\"5\" flood-color=\"#000\" flood-opacity=\".35\"/></filter></defs><clipPath id=\"@P@-pista\"><rect x=\"150\" y=\"344\" width=\"300\" height=\"12\" rx=\"6\"/></clipPath><g filter=\"url(#@P@-sombra)\"><g transform=\"translate(222.07,195.53)\"><g><path d=\"M71.74,-6.10 L86.70,-4.09 L86.70,4.09 L71.74,6.10 A72.00,72.00 0 0 1 70.11,16.37 L70.11,16.37 L83.72,22.90 L81.20,30.68 L66.34,27.97 A72.00,72.00 0 0 1 61.63,37.23 L61.63,37.23 L72.55,47.66 L67.74,54.27 L54.45,47.10 A72.00,72.00 0 0 1 47.10,54.45 L47.10,54.45 L54.27,67.74 L47.66,72.55 L37.23,61.63 A72.00,72.00 0 0 1 27.97,66.34 L27.97,66.34 L30.68,81.20 L22.90,83.72 L16.37,70.11 A72.00,72.00 0 0 1 6.10,71.74 L6.10,71.74 L4.09,86.70 L-4.09,86.70 L-6.10,71.74 A72.00,72.00 0 0 1 -16.37,70.11 L-16.37,70.11 L-22.90,83.72 L-30.68,81.20 L-27.97,66.34 A72.00,72.00 0 0 1 -37.23,61.63 L-37.23,61.63 L-47.66,72.55 L-54.27,67.74 L-47.10,54.45 A72.00,72.00 0 0 1 -54.45,47.10 L-54.45,47.10 L-67.74,54.27 L-72.55,47.66 L-61.63,37.23 A72.00,72.00 0 0 1 -66.34,27.97 L-66.34,27.97 L-81.20,30.68 L-83.72,22.90 L-70.11,16.37 A72.00,72.00 0 0 1 -71.74,6.10 L-71.74,6.10 L-86.70,4.09 L-86.70,-4.09 L-71.74,-6.10 A72.00,72.00 0 0 1 -70.11,-16.37 L-70.11,-16.37 L-83.72,-22.90 L-81.20,-30.68 L-66.34,-27.97 A72.00,72.00 0 0 1 -61.63,-37.23 L-61.63,-37.23 L-72.55,-47.66 L-67.74,-54.27 L-54.45,-47.10 A72.00,72.00 0 0 1 -47.10,-54.45 L-47.10,-54.45 L-54.27,-67.74 L-47.66,-72.55 L-37.23,-61.63 A72.00,72.00 0 0 1 -27.97,-66.34 L-27.97,-66.34 L-30.68,-81.20 L-22.90,-83.72 L-16.37,-70.11 A72.00,72.00 0 0 1 -6.10,-71.74 L-6.10,-71.74 L-4.09,-86.70 L4.09,-86.70 L6.10,-71.74 A72.00,72.00 0 0 1 16.37,-70.11 L16.37,-70.11 L22.90,-83.72 L30.68,-81.20 L27.97,-66.34 A72.00,72.00 0 0 1 37.23,-61.63 L37.23,-61.63 L47.66,-72.55 L54.27,-67.74 L47.10,-54.45 A72.00,72.00 0 0 1 54.45,-47.10 L54.45,-47.10 L67.74,-54.27 L72.55,-47.66 L61.63,-37.23 A72.00,72.00 0 0 1 66.34,-27.97 L66.34,-27.97 L81.20,-30.68 L83.72,-22.90 L70.11,-16.37 A72.00,72.00 0 0 1 71.74,-6.10Z\" fill=\"url(#@P@-oro)\" stroke=\"#b8901f\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><circle r=\"36.00\" fill=\"#1a2f5e\" stroke=\"#b8901f\" stroke-width=\"1.4\"/><circle cx=\"44.89\" cy=\"25.92\" r=\"7.92\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"0.00\" cy=\"51.84\" r=\"7.92\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-44.89\" cy=\"25.92\" r=\"7.92\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-44.89\" cy=\"-25.92\" r=\"7.92\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-0.00\" cy=\"-51.84\" r=\"7.92\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"44.89\" cy=\"-25.92\" r=\"7.92\" fill=\"#0d1b3e\" opacity=\".85\"/><circle r=\"12.24\" fill=\"#e8b84b\"/><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 0 0\" to=\"360 0 0\" dur=\"9.00s\" repeatCount=\"indefinite\"/></g></g><g transform=\"translate(358.07,195.53)\"><g><path d=\"M-45.16,16.26 L-60.15,18.06 L-62.03,9.82 L-47.74,4.95 A48.00,48.00 0 0 1 -47.74,-4.95 L-47.74,-4.95 L-62.03,-9.82 L-60.15,-18.06 L-45.16,-16.26 A48.00,48.00 0 0 1 -40.87,-25.17 L-40.87,-25.17 L-51.62,-35.76 L-46.35,-42.37 L-33.64,-34.24 A48.00,48.00 0 0 1 -25.90,-40.41 L-25.90,-40.41 L-30.99,-54.62 L-23.38,-58.29 L-15.45,-45.45 A48.00,48.00 0 0 1 -5.80,-47.65 L-5.80,-47.65 L-4.22,-62.66 L4.22,-62.66 L5.80,-47.65 A48.00,48.00 0 0 1 15.45,-45.45 L15.45,-45.45 L23.38,-58.29 L30.99,-54.62 L25.90,-40.41 A48.00,48.00 0 0 1 33.64,-34.24 L33.64,-34.24 L46.35,-42.37 L51.62,-35.76 L40.87,-25.17 A48.00,48.00 0 0 1 45.16,-16.26 L45.16,-16.26 L60.15,-18.06 L62.03,-9.82 L47.74,-4.95 A48.00,48.00 0 0 1 47.74,4.95 L47.74,4.95 L62.03,9.82 L60.15,18.06 L45.16,16.26 A48.00,48.00 0 0 1 40.87,25.17 L40.87,25.17 L51.62,35.76 L46.35,42.37 L33.64,34.24 A48.00,48.00 0 0 1 25.90,40.41 L25.90,40.41 L30.99,54.62 L23.38,58.29 L15.45,45.45 A48.00,48.00 0 0 1 5.80,47.65 L5.80,47.65 L4.22,62.66 L-4.22,62.66 L-5.80,47.65 A48.00,48.00 0 0 1 -15.45,45.45 L-15.45,45.45 L-23.38,58.29 L-30.99,54.62 L-25.90,40.41 A48.00,48.00 0 0 1 -33.64,34.24 L-33.64,34.24 L-46.35,42.37 L-51.62,35.76 L-40.87,25.17 A48.00,48.00 0 0 1 -45.16,16.26Z\" fill=\"url(#@P@-oro)\" stroke=\"#b8901f\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><circle r=\"24.00\" fill=\"#1a2f5e\" stroke=\"#b8901f\" stroke-width=\"1.4\"/><circle cx=\"29.93\" cy=\"17.28\" r=\"5.28\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"0.00\" cy=\"34.56\" r=\"5.28\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-29.93\" cy=\"17.28\" r=\"5.28\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-29.93\" cy=\"-17.28\" r=\"5.28\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-0.00\" cy=\"-34.56\" r=\"5.28\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"29.93\" cy=\"-17.28\" r=\"5.28\" fill=\"#0d1b3e\" opacity=\".85\"/><circle r=\"8.16\" fill=\"#e8b84b\"/><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 0 0\" to=\"-360 0 0\" dur=\"6.30s\" repeatCount=\"indefinite\"/></g></g><g transform=\"translate(417.93,120.47)\"><g><path d=\"M-15.44,28.03 L-25.61,39.17 L-32.49,33.68 L-23.89,21.29 A32.00,32.00 0 0 1 -28.97,13.60 L-28.97,13.60 L-43.74,16.64 L-46.08,8.15 L-31.84,3.18 A32.00,32.00 0 0 1 -31.43,-6.02 L-31.43,-6.02 L-45.17,-12.25 L-42.07,-20.49 L-27.63,-16.14 A32.00,32.00 0 0 1 -21.88,-23.35 L-21.88,-23.35 L-29.34,-36.46 L-21.99,-41.31 L-12.87,-29.30 A32.00,32.00 0 0 1 -3.98,-31.75 L-3.98,-31.75 L-2.31,-46.74 L6.49,-46.35 L6.81,-31.27 A32.00,32.00 0 0 1 15.44,-28.03 L15.44,-28.03 L25.61,-39.17 L32.49,-33.68 L23.89,-21.29 A32.00,32.00 0 0 1 28.97,-13.60 L28.97,-13.60 L43.74,-16.64 L46.08,-8.15 L31.84,-3.18 A32.00,32.00 0 0 1 31.43,6.02 L31.43,6.02 L45.17,12.25 L42.07,20.49 L27.63,16.14 A32.00,32.00 0 0 1 21.88,23.35 L21.88,23.35 L29.34,36.46 L21.99,41.31 L12.87,29.30 A32.00,32.00 0 0 1 3.98,31.75 L3.98,31.75 L2.31,46.74 L-6.49,46.35 L-6.81,31.27 A32.00,32.00 0 0 1 -15.44,28.03Z\" fill=\"url(#@P@-oro)\" stroke=\"#b8901f\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><circle r=\"16.00\" fill=\"#1a2f5e\" stroke=\"#b8901f\" stroke-width=\"1.4\"/><circle cx=\"19.95\" cy=\"11.52\" r=\"3.52\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"0.00\" cy=\"23.04\" r=\"3.52\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-19.95\" cy=\"11.52\" r=\"3.52\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-19.95\" cy=\"-11.52\" r=\"3.52\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-0.00\" cy=\"-23.04\" r=\"3.52\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"19.95\" cy=\"-11.52\" r=\"3.52\" fill=\"#0d1b3e\" opacity=\".85\"/><circle r=\"5.44\" fill=\"#e8b84b\"/><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 0 0\" to=\"360 0 0\" dur=\"4.50s\" repeatCount=\"indefinite\"/></g></g></g><rect x=\"150\" y=\"344\" width=\"300\" height=\"12\" rx=\"6\" fill=\"#1e3a6e\" stroke=\"#2f4f94\" stroke-width=\"1.5\"/><g clip-path=\"url(#@P@-pista)\"><rect x=\"-110\" y=\"344\" width=\"110\" height=\"12\" rx=\"6\" fill=\"url(#@P@-oro)\"><animate attributeName=\"x\" values=\"110;450\" dur=\"1.9s\" repeatCount=\"indefinite\" calcMode=\"spline\" keyTimes=\"0;1\" keySplines=\".5 0 .5 1\"/></rect></g></svg>", "servidor": "<svg viewBox=\"0 0 600 440\" role=\"img\" aria-label=\"Servidor con luces parpadeando y engranajes girando\" xmlns=\"http://www.w3.org/2000/svg\"><defs><linearGradient id=\"@P@-oro\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#f5d37a\"/><stop offset=\"1\" stop-color=\"#e8b84b\"/></linearGradient><pattern id=\"@P@-franja\" patternUnits=\"userSpaceOnUse\" width=\"28\" height=\"28\" patternTransform=\"rotate(45)\"><rect width=\"28\" height=\"28\" fill=\"#e8b84b\"/><rect width=\"14\" height=\"28\" fill=\"#0d1b3e\"/></pattern><radialGradient id=\"@P@-luz\"><stop offset=\"0\" stop-color=\"#fb923c\" stop-opacity=\".95\"/><stop offset=\"1\" stop-color=\"#fb923c\" stop-opacity=\"0\"/></radialGradient><filter id=\"@P@-sombra\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"150%\"><feDropShadow dx=\"0\" dy=\"6\" stdDeviation=\"5\" flood-color=\"#000\" flood-opacity=\".35\"/></filter></defs><ellipse cx=\"300\" cy=\"404\" rx=\"250\" ry=\"12\" fill=\"#000\" opacity=\".28\"/><g filter=\"url(#@P@-sombra)\"><rect x=\"200\" y=\"70\" width=\"200\" height=\"320\" rx=\"16\" fill=\"#14275a\" stroke=\"#3b5ea8\" stroke-width=\"3\"/><rect x=\"218\" y=\"92\" width=\"164\" height=\"50\" rx=\"9\" fill=\"#1e3a6e\" stroke=\"#2f4f94\" stroke-width=\"1.5\"/><circle cx=\"236\" cy=\"106\" r=\"4.5\" fill=\"#4ade80\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"0.90s\" begin=\"0.00s\" repeatCount=\"indefinite\"/></circle><circle cx=\"254\" cy=\"106\" r=\"4.5\" fill=\"#e8b84b\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"1.25s\" begin=\"0.41s\" repeatCount=\"indefinite\"/></circle><circle cx=\"272\" cy=\"106\" r=\"4.5\" fill=\"#4ade80\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"1.60s\" begin=\"0.82s\" repeatCount=\"indefinite\"/></circle><rect x=\"236\" y=\"120\" width=\"128\" height=\"9\" rx=\"4.5\" fill=\"#0d1b3e\"/><rect x=\"236\" y=\"120\" width=\"20\" height=\"9\" rx=\"4.5\" fill=\"url(#@P@-oro)\"><animate attributeName=\"width\" values=\"20;118;20\" dur=\"2.20s\" repeatCount=\"indefinite\" calcMode=\"spline\" keyTimes=\"0;.5;1\" keySplines=\".45 0 .55 1;.45 0 .55 1\"/></rect><line x1=\"338\" y1=\"102\" x2=\"368\" y2=\"102\" stroke=\"#2f4f94\" stroke-width=\"2\" stroke-linecap=\"round\"/><line x1=\"338\" y1=\"109\" x2=\"368\" y2=\"109\" stroke=\"#2f4f94\" stroke-width=\"2\" stroke-linecap=\"round\"/><rect x=\"218\" y=\"154\" width=\"164\" height=\"50\" rx=\"9\" fill=\"#1e3a6e\" stroke=\"#2f4f94\" stroke-width=\"1.5\"/><circle cx=\"236\" cy=\"168\" r=\"4.5\" fill=\"#e8b84b\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"1.95s\" begin=\"0.27s\" repeatCount=\"indefinite\"/></circle><circle cx=\"254\" cy=\"168\" r=\"4.5\" fill=\"#4ade80\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"2.30s\" begin=\"0.68s\" repeatCount=\"indefinite\"/></circle><circle cx=\"272\" cy=\"168\" r=\"4.5\" fill=\"#4ade80\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"0.90s\" begin=\"1.09s\" repeatCount=\"indefinite\"/></circle><rect x=\"236\" y=\"182\" width=\"128\" height=\"9\" rx=\"4.5\" fill=\"#0d1b3e\"/><rect x=\"236\" y=\"182\" width=\"20\" height=\"9\" rx=\"4.5\" fill=\"url(#@P@-oro)\"><animate attributeName=\"width\" values=\"20;118;20\" dur=\"2.75s\" repeatCount=\"indefinite\" calcMode=\"spline\" keyTimes=\"0;.5;1\" keySplines=\".45 0 .55 1;.45 0 .55 1\"/></rect><line x1=\"338\" y1=\"164\" x2=\"368\" y2=\"164\" stroke=\"#2f4f94\" stroke-width=\"2\" stroke-linecap=\"round\"/><line x1=\"338\" y1=\"171\" x2=\"368\" y2=\"171\" stroke=\"#2f4f94\" stroke-width=\"2\" stroke-linecap=\"round\"/><rect x=\"218\" y=\"216\" width=\"164\" height=\"50\" rx=\"9\" fill=\"#1e3a6e\" stroke=\"#2f4f94\" stroke-width=\"1.5\"/><circle cx=\"236\" cy=\"230\" r=\"4.5\" fill=\"#4ade80\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"1.25s\" begin=\"0.54s\" repeatCount=\"indefinite\"/></circle><circle cx=\"254\" cy=\"230\" r=\"4.5\" fill=\"#4ade80\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"1.60s\" begin=\"0.95s\" repeatCount=\"indefinite\"/></circle><circle cx=\"272\" cy=\"230\" r=\"4.5\" fill=\"#e8b84b\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"1.95s\" begin=\"0.06s\" repeatCount=\"indefinite\"/></circle><rect x=\"236\" y=\"244\" width=\"128\" height=\"9\" rx=\"4.5\" fill=\"#0d1b3e\"/><rect x=\"236\" y=\"244\" width=\"20\" height=\"9\" rx=\"4.5\" fill=\"url(#@P@-oro)\"><animate attributeName=\"width\" values=\"20;118;20\" dur=\"3.30s\" repeatCount=\"indefinite\" calcMode=\"spline\" keyTimes=\"0;.5;1\" keySplines=\".45 0 .55 1;.45 0 .55 1\"/></rect><line x1=\"338\" y1=\"226\" x2=\"368\" y2=\"226\" stroke=\"#2f4f94\" stroke-width=\"2\" stroke-linecap=\"round\"/><line x1=\"338\" y1=\"233\" x2=\"368\" y2=\"233\" stroke=\"#2f4f94\" stroke-width=\"2\" stroke-linecap=\"round\"/><rect x=\"218\" y=\"278\" width=\"164\" height=\"50\" rx=\"9\" fill=\"#1e3a6e\" stroke=\"#2f4f94\" stroke-width=\"1.5\"/><circle cx=\"236\" cy=\"292\" r=\"4.5\" fill=\"#4ade80\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"2.30s\" begin=\"0.81s\" repeatCount=\"indefinite\"/></circle><circle cx=\"254\" cy=\"292\" r=\"4.5\" fill=\"#e8b84b\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"0.90s\" begin=\"1.22s\" repeatCount=\"indefinite\"/></circle><circle cx=\"272\" cy=\"292\" r=\"4.5\" fill=\"#4ade80\"><animate attributeName=\"opacity\" values=\"1;.15;1\" dur=\"1.25s\" begin=\"0.33s\" repeatCount=\"indefinite\"/></circle><rect x=\"236\" y=\"306\" width=\"128\" height=\"9\" rx=\"4.5\" fill=\"#0d1b3e\"/><rect x=\"236\" y=\"306\" width=\"20\" height=\"9\" rx=\"4.5\" fill=\"url(#@P@-oro)\"><animate attributeName=\"width\" values=\"20;118;20\" dur=\"3.85s\" repeatCount=\"indefinite\" calcMode=\"spline\" keyTimes=\"0;.5;1\" keySplines=\".45 0 .55 1;.45 0 .55 1\"/></rect><line x1=\"338\" y1=\"288\" x2=\"368\" y2=\"288\" stroke=\"#2f4f94\" stroke-width=\"2\" stroke-linecap=\"round\"/><line x1=\"338\" y1=\"295\" x2=\"368\" y2=\"295\" stroke=\"#2f4f94\" stroke-width=\"2\" stroke-linecap=\"round\"/><rect x=\"214\" y=\"352\" width=\"172\" height=\"26\" rx=\"7\" fill=\"#0d1b3e\" stroke=\"#2f4f94\" stroke-width=\"1.5\"/></g><g transform=\"translate(104,222)\"><g><circle cx=\"32.00\" cy=\"0.00\" r=\"3.00\" fill=\"#e8b84b\" opacity=\"0.15\"/><circle cx=\"22.63\" cy=\"22.63\" r=\"3.55\" fill=\"#e8b84b\" opacity=\"0.27\"/><circle cx=\"0.00\" cy=\"32.00\" r=\"4.10\" fill=\"#e8b84b\" opacity=\"0.39\"/><circle cx=\"-22.63\" cy=\"22.63\" r=\"4.65\" fill=\"#e8b84b\" opacity=\"0.51\"/><circle cx=\"-32.00\" cy=\"0.00\" r=\"5.20\" fill=\"#e8b84b\" opacity=\"0.63\"/><circle cx=\"-22.63\" cy=\"-22.63\" r=\"5.75\" fill=\"#e8b84b\" opacity=\"0.75\"/><circle cx=\"-0.00\" cy=\"-32.00\" r=\"6.30\" fill=\"#e8b84b\" opacity=\"0.87\"/><circle cx=\"22.63\" cy=\"-22.63\" r=\"6.85\" fill=\"#e8b84b\" opacity=\"0.99\"/><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 0 0\" to=\"360 0 0\" dur=\"1.4s\" repeatCount=\"indefinite\"/></g></g><g filter=\"url(#@P@-sombra)\"><g transform=\"translate(482.00,306.00)\"><g><path d=\"M41.76,-4.44 L53.01,-3.13 L53.01,3.13 L41.76,4.44 A42.00,42.00 0 0 1 40.29,11.88 L40.29,11.88 L50.17,17.40 L47.78,23.17 L36.88,20.09 A42.00,42.00 0 0 1 32.67,26.39 L32.67,26.39 L39.69,35.27 L35.27,39.69 L26.39,32.67 A42.00,42.00 0 0 1 20.09,36.88 L20.09,36.88 L23.17,47.78 L17.40,50.17 L11.88,40.29 A42.00,42.00 0 0 1 4.44,41.76 L4.44,41.76 L3.13,53.01 L-3.13,53.01 L-4.44,41.76 A42.00,42.00 0 0 1 -11.88,40.29 L-11.88,40.29 L-17.40,50.17 L-23.17,47.78 L-20.09,36.88 A42.00,42.00 0 0 1 -26.39,32.67 L-26.39,32.67 L-35.27,39.69 L-39.69,35.27 L-32.67,26.39 A42.00,42.00 0 0 1 -36.88,20.09 L-36.88,20.09 L-47.78,23.17 L-50.17,17.40 L-40.29,11.88 A42.00,42.00 0 0 1 -41.76,4.44 L-41.76,4.44 L-53.01,3.13 L-53.01,-3.13 L-41.76,-4.44 A42.00,42.00 0 0 1 -40.29,-11.88 L-40.29,-11.88 L-50.17,-17.40 L-47.78,-23.17 L-36.88,-20.09 A42.00,42.00 0 0 1 -32.67,-26.39 L-32.67,-26.39 L-39.69,-35.27 L-35.27,-39.69 L-26.39,-32.67 A42.00,42.00 0 0 1 -20.09,-36.88 L-20.09,-36.88 L-23.17,-47.78 L-17.40,-50.17 L-11.88,-40.29 A42.00,42.00 0 0 1 -4.44,-41.76 L-4.44,-41.76 L-3.13,-53.01 L3.13,-53.01 L4.44,-41.76 A42.00,42.00 0 0 1 11.88,-40.29 L11.88,-40.29 L17.40,-50.17 L23.17,-47.78 L20.09,-36.88 A42.00,42.00 0 0 1 26.39,-32.67 L26.39,-32.67 L35.27,-39.69 L39.69,-35.27 L32.67,-26.39 A42.00,42.00 0 0 1 36.88,-20.09 L36.88,-20.09 L47.78,-23.17 L50.17,-17.40 L40.29,-11.88 A42.00,42.00 0 0 1 41.76,-4.44Z\" fill=\"url(#@P@-oro)\" stroke=\"#b8901f\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><circle r=\"21.00\" fill=\"#1a2f5e\" stroke=\"#b8901f\" stroke-width=\"1.4\"/><circle cx=\"26.19\" cy=\"15.12\" r=\"4.62\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"0.00\" cy=\"30.24\" r=\"4.62\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-26.19\" cy=\"15.12\" r=\"4.62\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-26.19\" cy=\"-15.12\" r=\"4.62\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-0.00\" cy=\"-30.24\" r=\"4.62\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"26.19\" cy=\"-15.12\" r=\"4.62\" fill=\"#0d1b3e\" opacity=\".85\"/><circle r=\"7.14\" fill=\"#e8b84b\"/><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 0 0\" to=\"360 0 0\" dur=\"10.00s\" repeatCount=\"indefinite\"/></g></g><g transform=\"translate(452.15,233.94)\"><g><path d=\"M18.44,15.36 L25.21,24.43 L20.18,28.72 L12.28,20.62 A24.00,24.00 0 0 1 5.90,23.26 L5.90,23.26 L6.03,34.58 L-0.55,35.10 L-2.18,23.90 A24.00,24.00 0 0 1 -8.91,22.29 L-8.91,22.29 L-15.44,31.52 L-21.07,28.07 L-15.81,18.05 A24.00,24.00 0 0 1 -20.30,12.80 L-20.30,12.80 L-31.02,16.42 L-33.55,10.32 L-23.41,5.31 A24.00,24.00 0 0 1 -23.95,-1.58 L-23.95,-1.58 L-34.75,-4.95 L-33.21,-11.37 L-22.06,-9.46 A24.00,24.00 0 0 1 -18.44,-15.36 L-18.44,-15.36 L-25.21,-24.43 L-20.18,-28.72 L-12.28,-20.62 A24.00,24.00 0 0 1 -5.90,-23.26 L-5.90,-23.26 L-6.03,-34.58 L0.55,-35.10 L2.18,-23.90 A24.00,24.00 0 0 1 8.91,-22.29 L8.91,-22.29 L15.44,-31.52 L21.07,-28.07 L15.81,-18.05 A24.00,24.00 0 0 1 20.30,-12.80 L20.30,-12.80 L31.02,-16.42 L33.55,-10.32 L23.41,-5.31 A24.00,24.00 0 0 1 23.95,1.58 L23.95,1.58 L34.75,4.95 L33.21,11.37 L22.06,9.46 A24.00,24.00 0 0 1 18.44,15.36Z\" fill=\"url(#@P@-oro)\" stroke=\"#b8901f\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><circle r=\"12.00\" fill=\"#1a2f5e\" stroke=\"#b8901f\" stroke-width=\"1.4\"/><circle cx=\"14.96\" cy=\"8.64\" r=\"2.64\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"0.00\" cy=\"17.28\" r=\"2.64\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-14.96\" cy=\"8.64\" r=\"2.64\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-14.96\" cy=\"-8.64\" r=\"2.64\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"-0.00\" cy=\"-17.28\" r=\"2.64\" fill=\"#0d1b3e\" opacity=\".85\"/><circle cx=\"14.96\" cy=\"-8.64\" r=\"2.64\" fill=\"#0d1b3e\" opacity=\".85\"/><circle r=\"4.08\" fill=\"#e8b84b\"/><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 0 0\" to=\"-360 0 0\" dur=\"6.25s\" repeatCount=\"indefinite\"/></g></g></g></svg>"};

/* ══════════════════════════════════════════════════════════════
   HORA DE REFERENCIA DEL SERVIDOR
   El cronómetro y la reapertura automática NO usan el reloj del equipo.
   Al iniciar sesión se le pide la hora a Firestore (serverTimestamp),
   se calcula la diferencia y, desde ahí, se avanza con el cronómetro
   interno del navegador (performance.now), que no se altera si alguien
   cambia la fecha u hora de su computador o celular.
   Si Firestore no responde (o falta la regla sistema_reloj), se usa el
   reloj del equipo como respaldo y el panel del administrador lo avisa.
══════════════════════════════════════════════════════════════ */
const _reloj = { servidorMs: null, perf: 0, dateBase: 0, fuente: 'equipo', difMs: 0, sincronizando: null, iniciado: false };

function ahoraServidor() {
  if (_reloj.servidorMs == null) return Date.now();
  return _reloj.servidorMs + (performance.now() - _reloj.perf);
}

// Si el reloj del equipo y el cronómetro interno se separan, hubo un cambio de hora o el equipo estuvo suspendido
function relojDesfasado() {
  if (_reloj.servidorMs == null) return false;
  return Math.abs((Date.now() - _reloj.dateBase) - (performance.now() - _reloj.perf)) > 3000;
}

async function sincronizarRelojServidor() {
  if (_reloj.sincronizando) return _reloj.sincronizando;
  _reloj.sincronizando = (async () => {
    try {
      if (!usuario || !window._fb || !window._fb.serverTimestamp) throw new Error('sin sesión o sin serverTimestamp');
      const ref = window._fb.doc(db, 'sistema_reloj', usuario.uid);
      const t0 = performance.now();
      await window._fb.setDoc(ref, { t: window._fb.serverTimestamp() });
      const t1 = performance.now();
      const snap = await window._fb.getDoc(ref);
      const ts = snap.exists() ? snap.data().t : null;
      if (!ts || typeof ts.toMillis !== 'function') throw new Error('el servidor no devolvió la hora');
      const instanteEscritura = (t0 + t1) / 2;            // la escritura se confirmó, en promedio, a mitad de camino
      _reloj.servidorMs = ts.toMillis();
      _reloj.perf = instanteEscritura;
      _reloj.dateBase = Date.now() - (performance.now() - instanteEscritura);
      _reloj.difMs = _reloj.servidorMs - _reloj.dateBase;  // servidor − equipo
      _reloj.fuente = 'servidor';
    } catch (e) {
      console.warn('No se pudo sincronizar la hora con el servidor:', e.message);
      if (_reloj.servidorMs == null) _reloj.fuente = 'equipo';
    } finally {
      _reloj.sincronizando = null;
      pintarEstadoRelojAdmin();
    }
  })();
  return _reloj.sincronizando;
}

function iniciarSincronizacionReloj() {
  if (_reloj.iniciado) return;
  _reloj.iniciado = true;
  setInterval(() => { if (usuario) sincronizarRelojServidor(); }, 10 * 60 * 1000);
  setInterval(() => { if (usuario && relojDesfasado()) sincronizarRelojServidor(); }, 5000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && usuario) sincronizarRelojServidor();
  });
}

function pintarEstadoRelojAdmin() {
  const el = $('mant-reloj-estado');
  if (!el) return;
  if (_reloj.fuente === 'servidor') {
    const dif = Math.round(_reloj.difMs / 1000);
    el.style.color = '';
    el.textContent = '🕐 Hora del servidor sincronizada' +
      (Math.abs(dif) >= 2 ? ` · este equipo ${dif > 0 ? 'va atrasado' : 'va adelantado'} ${Math.abs(dif)} s` : ' · este equipo está al día');
  } else {
    el.style.color = 'var(--red)';
    el.textContent = '⚠️ No se pudo obtener la hora del servidor: la reapertura automática usaría el reloj de cada equipo. ' +
      'Revise que la regla "sistema_reloj" esté publicada en Firestore.';
  }
}

/* ══════════════════════════════════════════════════════════════
   MODO MANTENIMIENTO — tiempo real
   El admin nunca ve la pantalla de mantenimiento, aunque esté activado (así
   puede entrar a probar los cambios). Todos los demás la ven de inmediato,
   sin recargar, apenas el documento cambia.
   Campos del documento sistema/mantenimiento:
     activo, mensaje, correosExentos[], animacion ('letrero'|'engranajes'|'servidor'),
     finEnMs (instante exacto de reapertura automática, o null)
══════════════════════════════════════════════════════════════ */
let unsubMantenimiento = null;
let mantData = null;            // último documento recibido
let mantTimerFin = null;        // aviso al llegar la hora de reapertura
let mantTimerCrono = null;      // cuenta regresiva de la pantalla
let mantAnimPintada = null;     // animación que ya está en pantalla (para no reiniciarla)
let mantExentos = [];           // lista de trabajo del panel
let mantExentosSucio = false;   // true = hay cambios sin guardar en la lista

const MANT_ANIMACIONES = [
  { clave: 'letrero',    nombre: 'Letrero de obra' },
  { clave: 'engranajes', nombre: 'Engranajes' },
  { clave: 'servidor',   nombre: 'Servidor' }
];

const mantEsc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Correos que el administrador permite entrar aunque el mantenimiento esté activo
function correoExentoDeMantenimiento(data) {
  const lista = (data && Array.isArray(data.correosExentos)) ? data.correosExentos : [];
  const mio = ((typeof usuario !== 'undefined' && usuario && usuario.email) || '').toLowerCase();
  return !!mio && lista.map(c => String(c).toLowerCase()).includes(mio);
}

// ¿Sigue vigente? Activo y, si tiene hora de reapertura, que esa hora no haya llegado (según el servidor)
function mantenimientoVigente(data) {
  if (!data || !data.activo) return false;
  if (typeof data.finEnMs === 'number' && ahoraServidor() >= data.finEnMs) return false;
  return true;
}

/* Hora de Ecuador (UTC-5 fija, sin horario de verano): no depende de la zona horaria del equipo */
const MANT_UTC_MENOS_5 = 5 * 3600 * 1000;
function mantHoraEcuador(ms) {
  const d = new Date(ms - MANT_UTC_MENOS_5);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}
function mantDiaEcuador(ms) {
  const d = new Date(ms - MANT_UTC_MENOS_5);
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}
// Próxima vez que el reloj de Ecuador marque HH:MM (siempre dentro de las próximas 24 horas)
function mantCalcularFin(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || ''));
  if (!m) return null;
  const h = +m[1], mi = +m[2];
  if (h > 23 || mi > 59) return null;
  const ahora = ahoraServidor();
  const e = new Date(ahora - MANT_UTC_MENOS_5);
  let fin = Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), h, mi) + MANT_UTC_MENOS_5;
  if (fin <= ahora + 30000) fin += 24 * 3600 * 1000;
  return fin;
}

function mantTextoDuracion(ms) {
  const min = Math.max(1, Math.round(ms / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), r = min % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

function formatoCuentaRegresiva(ms) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const dos = n => String(n).padStart(2, '0');
  return h > 0 ? `${dos(h)}:${dos(m)}:${dos(s)}` : `${dos(m)}:${dos(s)}`;
}

/* ── Animaciones ── */
function svgMantenimiento(clave, prefijo) {
  return (MANT_SVG[clave] || MANT_SVG.letrero).replace(/@P@/g, prefijo);
}

function pintarAnimacionMantenimiento(clave) {
  const cont = $('pm-animacion');
  if (!cont) return;
  const k = MANT_SVG[clave] ? clave : 'letrero';
  if (mantAnimPintada === k && cont.firstChild) return;
  cont.innerHTML = svgMantenimiento(k, 'pm');
  mantAnimPintada = k;
  quietarAnimacionSiCorresponde(cont);
}

function quietarAnimacionSiCorresponde(raiz) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    raiz.querySelectorAll('svg').forEach(s => { if (s.pauseAnimations) s.pauseAnimations(); });
  }
}

function construirOpcionesAnimacionMantenimiento() {
  const cont = $('mant-anim-opciones');
  if (!cont || cont.dataset.listo) return;
  cont.innerHTML = MANT_ANIMACIONES.map((a, i) => `
    <label class="mant-anim-op">
      <input type="radio" name="mant-anim" value="${a.clave}" ${i === 0 ? 'checked' : ''}>
      <span class="mant-anim-thumb">${svgMantenimiento(a.clave, 'mt' + i)}</span>
      <span class="mant-anim-nombre">${a.nombre}</span>
    </label>`).join('');
  cont.dataset.listo = '1';
  cont.addEventListener('change', mantMarcarSucio);
  quietarAnimacionSiCorresponde(cont);
}

function mantElegirAnimacionEnPanel(clave) {
  const r = document.querySelector(`input[name="mant-anim"][value="${clave}"]`);
  if (r) r.checked = true;
}

/* ── Cronómetro de la pantalla ── */
function tickCronometroMantenimiento() {
  const data = mantData;
  const el = $('pm-crono');
  if (!el || !data || typeof data.finEnMs !== 'number') return;
  const resto = data.finEnMs - ahoraServidor();
  if (resto <= 0) { renderMantenimiento(); return; }
  el.textContent = formatoCuentaRegresiva(resto);
}

function detenerTimersMantenimiento() {
  if (mantTimerFin)   { clearTimeout(mantTimerFin);   mantTimerFin = null; }
  if (mantTimerCrono) { clearInterval(mantTimerCrono); mantTimerCrono = null; }
}

/* ── Pintado general (pantalla de los usuarios + panel del administrador) ── */
function renderMantenimiento() {
  const data = mantData;
  const vigente = mantenimientoVigente(data);
  const vencido = !!(data && data.activo) && !vigente;
  const tieneFin = !!(data && typeof data.finEnMs === 'number');
  detenerTimersMantenimiento();

  // 1) Pantalla de mantenimiento para quien NO es admin ni está exento
  const pantalla = $('pantalla-mantenimiento');
  if (pantalla) {
    if (vigente && !esAdmin() && !correoExentoDeMantenimiento(data)) {
      if ($('pantalla-mantenimiento-mensaje')) {
        $('pantalla-mantenimiento-mensaje').textContent =
          (data.mensaje && data.mensaje.trim())
            ? data.mensaje.trim()
            : 'Estamos aplicando una mejora al sistema. Vuelva a intentarlo en unos minutos.';
      }
      pintarAnimacionMantenimiento(data.animacion);
      const wrap = $('pm-crono-wrap');
      if (wrap) {
        wrap.style.display = tieneFin ? 'block' : 'none';
        if ($('pm-crono-hora') && tieneFin) $('pm-crono-hora').textContent = `El sistema se abrirá solo a las ${mantHoraEcuador(data.finEnMs)} (hora de Ecuador)`;
      }
      show('pantalla-mantenimiento');
      pantalla.style.display = 'flex';
      if (tieneFin) {
        tickCronometroMantenimiento();
        mantTimerCrono = setInterval(tickCronometroMantenimiento, 500);
      }
    } else {
      hide('pantalla-mantenimiento');
    }
  }

  // 2) Aviso discreto para el admin, para que no se olvide de desactivarlo
  const avisoAdmin = $('mantenimiento-info-flotante');
  if (esAdmin()) {
    if (vigente) {
      if (!avisoAdmin) {
        const div = document.createElement('div');
        div.id = 'mantenimiento-info-flotante';
        div.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9998;background:#c9a227;color:#0d1b3e;font-weight:700;font-size:12px;padding:10px 16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.3);';
        document.body.appendChild(div);
      }
      const av = $('mantenimiento-info-flotante');
      av.textContent = '🚧 Modo Mantenimiento ACTIVO — los demás usuarios no pueden entrar' +
        (tieneFin ? ` · se reabre solo a las ${mantHoraEcuador(data.finEnMs)}` : '');
    } else if (avisoAdmin) {
      avisoAdmin.remove();
    }
  }

  // 3) Panel de Configuración (si está en pantalla)
  construirOpcionesAnimacionMantenimiento();
  if ($('mantenimiento-activo')) {
    // Si el administrador ya tocó algo del formulario y aún no guarda, no se le pisa lo que eligió
    const sucio = !!($('mant-card') && $('mant-card').dataset.sucio === '1');
    if (!sucio) $('mantenimiento-activo').checked = vigente;
    const nPerm = (data && Array.isArray(data.correosExentos)) ? data.correosExentos.length : 0;
    let txt;
    if (vigente) {
      txt = nPerm
        ? `Activado — el sistema está bloqueado para todos menos usted y ${nPerm} ${nPerm === 1 ? 'correo permitido' : 'correos permitidos'}`
        : 'Activado — el sistema está bloqueado para todos menos usted';
      if (tieneFin) txt += ` · se reabre solo a las ${mantHoraEcuador(data.finEnMs)}`;
    } else if (vencido) {
      txt = `Finalizó automáticamente a las ${mantHoraEcuador(data.finEnMs)} — el sistema ya está abierto para todos`;
    } else {
      txt = 'Desactivado — el sistema funciona con normalidad';
    }
    $('mantenimiento-estado-texto').textContent = txt;
    $('mantenimiento-estado-texto').style.color = vigente ? 'var(--red)' : '';

    if (!sucio) {
      if ($('mantenimiento-mensaje') && data && data.mensaje && !$('mantenimiento-mensaje').dataset.editando) {
        $('mantenimiento-mensaje').value = data.mensaje;
      }
      if (data && data.animacion) mantElegirAnimacionEnPanel(data.animacion);
      const chk = $('mant-auto');
      if (chk) {
        chk.checked = vigente && tieneFin;
        if ($('mant-auto-hora') && vigente && tieneFin) $('mant-auto-hora').value = mantHoraEcuador(data.finEnMs);
        mantAutoCambio();
      }
    } else {
      mantAutoPrevia();
    }
    if (!mantExentosSucio) {
      mantExentos = (data && Array.isArray(data.correosExentos)) ? data.correosExentos.map(c => String(c).toLowerCase()) : [];
      pintarListaExentos();
    }
    pintarEstadoRelojAdmin();
  }

  // 4) Aviso exacto al llegar la hora de reapertura
  if (vigente && tieneFin) {
    const falta = Math.max(0, data.finEnMs - ahoraServidor());
    mantTimerFin = setTimeout(renderMantenimiento, Math.min(falta + 60, 2147000000));
  }
}

function iniciarListenerMantenimiento() {
  if (unsubMantenimiento) unsubMantenimiento();
  const ref = window._fb.doc(db, 'sistema', 'mantenimiento');
  unsubMantenimiento = window._fb.onSnapshot(ref, (snap) => {
    mantData = snap.exists() ? snap.data() : null;
    renderMantenimiento();
  }, (e) => console.warn('Listener de mantenimiento interrumpido:', e.message));
}

// Marca que el formulario principal tiene cambios sin guardar
function mantMarcarSucio() {
  const c = $('mant-card');
  if (c) c.dataset.sucio = '1';
}

/* ── Opción: reabrir automáticamente a una hora ── */
function mantAutoCambio() {
  const chk = $('mant-auto'), campos = $('mant-auto-campos');
  if (!chk || !campos) return;
  campos.style.display = chk.checked ? 'block' : 'none';
  mantAutoPrevia();
}

function mantAutoPrevia() {
  const el = $('mant-auto-previa'), inp = $('mant-auto-hora');
  if (!el || !inp) return;
  if (!inp.value) { el.textContent = 'Elija la hora a la que el sistema se abrirá solo.'; return; }
  const fin = mantCalcularFin(inp.value);
  if (!fin) { el.textContent = 'La hora no es válida.'; return; }
  const ahora = ahoraServidor();
  const cuando = mantDiaEcuador(fin) === mantDiaEcuador(ahora) ? 'hoy' : 'mañana';
  el.textContent = `Se abrirá ${cuando} a las ${mantHoraEcuador(fin)} (hora de Ecuador), dentro de ${mantTextoDuracion(fin - ahora)}.`;
}

function mantAutoAtajo(minutos) {
  const inp = $('mant-auto-hora');
  if (!inp) return;
  const objetivo = Math.ceil((ahoraServidor() + minutos * 60000) / 60000) * 60000;
  inp.value = mantHoraEcuador(objetivo);
  mantAutoPrevia();
}

/* ── Lista de correos que pueden entrar durante el mantenimiento ── */
const MANT_CORREO_VALIDO = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

function pintarListaExentos() {
  const cont = $('mant-exentos-lista');
  if (!cont) return;
  cont.innerHTML = mantExentos.length
    ? mantExentos.map((c, i) => `
        <div class="mant-ex-item">
          <span class="mant-ex-correo">${mantEsc(c)}</span>
          <button type="button" class="mant-ex-btn" onclick="editarCorreoExento(${i})">✏️ Editar</button>
          <button type="button" class="mant-ex-btn mant-ex-quitar" onclick="quitarCorreoExento(${i})">✕ Quitar</button>
        </div>`).join('')
    : '<div class="mant-ex-vacio">Ningún usuario permitido. Solo usted podrá entrar mientras el mantenimiento esté activo.</div>';
  const btn = $('mant-exentos-guardar'), est = $('mant-exentos-estado');
  if (btn) btn.disabled = !mantExentosSucio;
  if (est) {
    est.textContent = mantExentosSucio ? 'Hay cambios sin guardar en la lista.' : 'La lista está guardada.';
    est.style.color = mantExentosSucio ? 'var(--red)' : 'var(--txt2)';
  }
}

// Mientras escribe: no deja teclear coma, punto y coma ni espacio (un correo a la vez)
function onTeclaCorreoExento(ev) {
  if (ev.key === 'Enter') { ev.preventDefault(); agregarCorreoExento(); return; }
  if (ev.key === ',' || ev.key === ';' || ev.key === ' ') {
    ev.preventDefault();
    toast('Escriba un solo correo, sin comas. Pulse "Agregar" para añadirlo a la lista.', 'err');
  }
}

function agregarCorreoExento() {
  const inp = $('mant-correo-nuevo');
  if (!inp) return;
  const valor = inp.value.trim().toLowerCase();
  if (!valor) { toast('Escriba el correo del usuario.', 'err'); inp.focus(); return; }
  if (/[,;\s]/.test(valor)) { toast('Escriba un solo correo, sin comas ni espacios. Se agrega de uno en uno.', 'err'); inp.focus(); return; }
  if (!MANT_CORREO_VALIDO.test(valor)) { toast('Ese correo no es válido. Revíselo (ej.: nombre@gmail.com).', 'err'); inp.focus(); return; }
  if (mantExentos.includes(valor)) { toast('Ese correo ya está en la lista.', 'err'); inp.value = ''; return; }
  mantExentos.push(valor);
  mantExentosSucio = true;
  inp.value = '';
  pintarListaExentos();
  inp.focus();
}

function quitarCorreoExento(i) {
  if (i < 0 || i >= mantExentos.length) return;
  mantExentos.splice(i, 1);
  mantExentosSucio = true;
  pintarListaExentos();
}

// Editar = sacarlo de la lista y dejarlo en el campo para corregirlo y volver a agregarlo
function editarCorreoExento(i) {
  if (i < 0 || i >= mantExentos.length) return;
  const inp = $('mant-correo-nuevo');
  if (inp && inp.value.trim()) { toast('Primero agregue o borre el correo que está escribiendo.', 'err'); inp.focus(); return; }
  const c = mantExentos.splice(i, 1)[0];
  mantExentosSucio = true;
  if (inp) { inp.value = c; inp.focus(); }
  pintarListaExentos();
}

async function guardarCorreosExentos() {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }
  const inp = $('mant-correo-nuevo');
  if (inp && inp.value.trim()) { toast('Tiene un correo escrito sin agregar. Pulse "Agregar" o bórrelo antes de guardar.', 'err'); inp.focus(); return; }
  const btn = $('mant-exentos-guardar');
  if (btn) btn.disabled = true;
  const correosExentos = [...new Set(mantExentos)];
  try {
    await window._fb.setDoc(window._fb.doc(db, 'sistema', 'mantenimiento'), {
      correosExentos, exentosActualizadoPor: usuario.email, exentosActualizadoEn: new Date()
    }, { merge: true });
    mantExentosSucio = false;
    await registrarEnAuditoria(
      'actualizar_correos_mantenimiento', null, usuario.email, null, null, { correosExentos },
      `Lista de correos permitidos en mantenimiento actualizada por ${usuario.email} (${correosExentos.length})`
    );
    pintarListaExentos();
    toast('✅ Lista guardada. Los cambios rigen de inmediato, sin tocar el mantenimiento.', 'ok');
  } catch (e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
    pintarListaExentos();
  }
}

/* ── Guardar el modo mantenimiento (interruptor, mensaje, animación y reapertura) ── */
async function guardarModoMantenimiento() {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }
  const activo = $('mantenimiento-activo').checked;
  const mensaje = $('mantenimiento-mensaje').value.trim();
  const sel = document.querySelector('input[name="mant-anim"]:checked');
  const animacion = sel ? sel.value : 'letrero';
  const quiereAuto = !!($('mant-auto') && $('mant-auto').checked);

  let finEnMs = null;
  if (activo && quiereAuto) {
    const hhmm = $('mant-auto-hora') ? $('mant-auto-hora').value : '';
    if (!hhmm) { toast('Elija la hora de reapertura o desmarque la reapertura automática.', 'err'); return; }
    finEnMs = mantCalcularFin(hhmm);
    if (!finEnMs) { toast('La hora de reapertura no es válida.', 'err'); return; }
  }

  if (activo) {
    await sincronizarRelojServidor();
    if (finEnMs) finEnMs = mantCalcularFin($('mant-auto-hora').value);   // recalcular con la hora ya sincronizada
    const guardados = (mantData && Array.isArray(mantData.correosExentos)) ? mantData.correosExentos : [];
    let msg = 'Esto va a bloquear el acceso a TODOS los secretarios y al supervisor de inmediato — solo usted' +
      (guardados.length
        ? ` y ${guardados.length === 1 ? 'el correo permitido' : 'los ' + guardados.length + ' correos permitidos'} (${guardados.join(', ')})`
        : '') +
      ' van a poder entrar.';
    if (finEnMs) {
      const cuando = mantDiaEcuador(finEnMs) === mantDiaEcuador(ahoraServidor()) ? 'hoy' : 'mañana';
      msg += ` El sistema se abrirá solo ${cuando} a las ${mantHoraEcuador(finEnMs)} (hora de Ecuador), dentro de ${mantTextoDuracion(finEnMs - ahoraServidor())}.`;
    }
    if (finEnMs && _reloj.fuente !== 'servidor') msg += ' ATENCIÓN: no se pudo obtener la hora del servidor, así que la reapertura dependerá del reloj de cada equipo.';
    if (mantExentosSucio) msg += ' Tenga en cuenta que la lista de correos permitidos tiene cambios SIN guardar: no se aplicarán hasta que pulse "Guardar cambios de la lista".';
    msg += ' ¿Confirma que quiere activar el Modo Mantenimiento?';
    const ok = await confirmarAccion(msg, 'Activar Modo Mantenimiento');
    if (!ok) { $('mantenimiento-activo').checked = false; return; }
  }

  if ($('mant-card')) delete $('mant-card').dataset.sucio;
  try {
    await window._fb.setDoc(window._fb.doc(db, 'sistema', 'mantenimiento'), {
      activo, mensaje, animacion,
      reaperturaAuto: !!finEnMs,
      finEnMs: finEnMs || null,
      relojFuente: _reloj.fuente,
      activadoPor: usuario.email,
      fecha: new Date()
    }, { merge: true });

    await registrarEnAuditoria(
      activo ? 'activar_mantenimiento' : 'desactivar_mantenimiento',
      null, usuario.email, null, null, { mensaje, animacion, finEnMs: finEnMs || null },
      `Modo Mantenimiento ${activo ? 'ACTIVADO' : 'desactivado'} por ${usuario.email}` +
      (finEnMs ? ` · reapertura automática a las ${mantHoraEcuador(finEnMs)}` : '')
    );

    toast(activo ? '🚧 Modo Mantenimiento activado' : '✅ Modo Mantenimiento desactivado', 'ok');
  } catch(e) {
    console.error(e);
    mantMarcarSucio();
    toast('❌ Error: ' + e.message, 'err');
  }
}

window.mantMarcarSucio       = mantMarcarSucio;
window.logout                = logout;   // el botón "Salir" de la pantalla de mantenimiento lo llama desde el HTML
window.guardarCorreosExentos = guardarCorreosExentos;
window.agregarCorreoExento   = agregarCorreoExento;
window.quitarCorreoExento    = quitarCorreoExento;
window.editarCorreoExento    = editarCorreoExento;
window.onTeclaCorreoExento   = onTeclaCorreoExento;
window.mantAutoCambio        = mantAutoCambio;
window.mantAutoPrevia        = mantAutoPrevia;
window.mantAutoAtajo         = mantAutoAtajo;

// Oculta/deshabilita cualquier elemento con data-permiso="clave" si el usuario no la tiene
function aplicarPermisosBotones() {
  if (esAdmin()) return; // el admin siempre ve todo
  document.querySelectorAll('[data-permiso]').forEach(el => {
    const claves = el.dataset.permiso.split(',').map(k => k.trim());
    const permitido = claves.some(k => tienePermisoAccion(k));
    el.style.display = permitido ? '' : 'none';
  });
}

/* ══════════════════════════════════
   DOM HELPERS
══════════════════════════════════ */
const $       = id => document.getElementById(id);
const show    = id => { const e=$(id); if(!e) return; e.style.display = ['nav-sesion','nav-guest','nav-right'].includes(id) ? 'flex' : 'block'; };
const hide    = id => { const e=$(id); if(e) e.style.display='none'; };
const hideAll = () => ['vista-login','vista-novedades','vista-envios','vista-exito','vista-admin','vista-reportes'].forEach(hide);

let vistaActual = null;

function ir(v) {
  hideAll();
  const el = $(v); if (!el) return;
  el.style.display = v === 'vista-login' ? 'flex' : 'block';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (v==='vista-envios'||v==='vista-exito') $('nb-envios')?.classList.add('active');
  if (v==='vista-novedades') $('nb-novedades')?.classList.add('active');
  if (v==='vista-admin') $('nb-admin')?.classList.add('active');
  if (v==='vista-reportes') $('nb-reportes')?.classList.add('active');
  if (v==='vista-envios') infActualizarTarjeta();
  vistaActual = v;
}

function irNovedades() { ir('vista-novedades'); cargarNovedadesActuales(); }

// Clic en el logo/nombre "RCA v1.0": solo navega si hay sesión iniciada
function irInicioNav() {
  if (!usuario) return;
  irNovedades();
}

// Botón "Actualizar" del navbar: refresca solo los datos de la vista visible,
// sin recargar toda la página (así no se pierde el scroll ni el estado de filtros)
function actualizarVistaActual() {
  switch (vistaActual) {
    case 'vista-novedades':
      cargarNovedadesActuales();
      break;
    case 'vista-envios':
      cargarMisEnvios();
      break;
    case 'vista-reportes':
      cargarReportesActividad();
      break;
    case 'vista-admin': {
      const tabActiva = document.querySelector('.admin-tab.active')?.dataset.tab;
      if (tabActiva === 'envios')      cargarAdmin();
      else if (tabActiva === 'accesos')     cargarAccesos();
      else if (tabActiva === 'auditoria')   { poblarFiltrosAuditoria(); cargarAuditoria(); }
      else if (tabActiva === 'desbloqueos') { cargarDesbloqueos(); poblarSelectoresDesbloqueoDirecto(); }
      else if (tabActiva === 'resumen')     cargarResumenGeneral();
      else if (tabActiva === 'importar')    cargarDirectorioPersonal();
      else if (tabActiva === 'areas')       cargarAreasPanel();
      else if (tabActiva === 'config')      cargarConfigPanel();
      break;
    }
    default:
      location.reload();
  }
  toast('🔄 Actualizado', 'ok');
}
function irReportes() {
  ir('vista-reportes');
  cargarReportesActividad();
  poblarSelectoresResumen('rep-resumen');
}

function irAdmin() {
  if (!tieneAccesoPanel()) return;
  ir('vista-admin');
  aplicarVisibilidadTabsAdmin();
}

function toast(msg, tipo='ok') {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast toast--${tipo} toast--on`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.className = 'toast', 4200);
}

function actualizarNav() {
  if (usuario) {
    const fotoEl = $('nav-foto');
    if (usuario.foto) {
      fotoEl.src = usuario.foto; fotoEl.style.display = 'block';
      const ie = $('nav-iniciales'); if (ie) ie.style.display = 'none';
    } else {
      fotoEl.style.display = 'none';
      let ie = $('nav-iniciales');
      if (!ie) {
        ie = document.createElement('div'); ie.id = 'nav-iniciales';
        ie.style.cssText = 'width:26px;height:26px;border-radius:50%;background:#0d1b3e;color:#e8b84b;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
        fotoEl.parentNode.insertBefore(ie, fotoEl.nextSibling);
      }
      const nombre = usuario.nombre || usuario.email || '?';
      const p = nombre.trim().split(' ');
      ie.textContent = p.length >= 2 ? (p[0][0]+p[1][0]).toUpperCase() : nombre.slice(0,2).toUpperCase();
      ie.style.display = 'flex';
    }
    $('nav-nombre').textContent = usuario.nombre?.split(' ')[0] || usuario.email;
    show('nav-sesion'); hide('nav-guest');
    esAdmin() ? show('nb-envios') : hide('nb-envios');
    tieneAccesoPanel() ? show('nb-admin') : hide('nb-admin');
    (esSupervisor() || tienePermisoAccion('actividad_ver')) ? show('nb-reportes') : hide('nb-reportes');
  } else {
    hide('nav-sesion'); show('nav-guest'); hide('nb-admin');
  }
}

function resetBtn() {
  const btn = $('btn-enviar'); if (!btn) return;
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg> Registrar Envío`;
  actualizarBotonEnviar();
}

/* ══════════════════════════════════
   MÓDULO NOVEDADES — Utilidades
══════════════════════════════════ */
function obtenerFechaParts() {
  const hoy = new Date();
  return {
    dia: hoy.getDate(),
    mes: String(hoy.getMonth() + 1).padStart(2, '0'),
    año: hoy.getFullYear(),
    periodo: `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  };
}

function obtenerNombreMes(mesNum) {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return meses[parseInt(mesNum) - 1];
}

/* ══════════════════════════════════
   CONFIGURACIÓN DEL CIERRE MENSUAL
   ──────────────────────────────────
   Antes el cierre estaba quemado en el día 1: apenas cambiaba el mes,
   aparecía la obligación de generar el informe y el área quedaba bloqueada.
   Ahora el administrador define dos días del mes siguiente:

     diaHabilitacion → desde ese día aparece la opción de generar el
                       informe del mes anterior (el secretario puede
                       generarlo apenas lo tenga listo, sin bloqueo).
     diaBloqueo      → si al llegar ese día el informe no se generó,
                       recién ahí se bloquea el registro del mes en curso.

   Valores por defecto 1 y 1 = comportamiento anterior del sistema.
══════════════════════════════════ */

const CONFIG_CIERRE_DEFAULT = { diaHabilitacion: 1, diaBloqueo: 1, modoLlenado: 'diario' };

/* Modo de llenado de novedades — define qué días quedan abiertos para escribir.
   Es global: aplica igual a todas las áreas.
     diario  → solo el día de hoy (comportamiento histórico del sistema)
     semanal → desde el lunes de la semana en curso hasta hoy
     mensual → desde el día 1 del mes en curso hasta hoy
   En los tres casos nunca se habilitan días futuros: no se registra una
   novedad de un día que todavía no ocurrió. */
const MODOS_LLENADO = {
  diario:  'Diario — solo el día de hoy',
  semanal: 'Semanal — de lunes a domingo',
  mensual: 'Mensual — todo el mes en curso'
};
let configCierreCache = null;

async function obtenerConfigCierre(forzarRecarga = false) {
  if (configCierreCache && !forzarRecarga) return configCierreCache;
  try {
    const ref = window._fb.doc(db, 'sistema', 'config_cierre');
    const snap = await window._fb.getDoc(ref);
    const data = snap.exists() ? snap.data() : {};
    configCierreCache = {
      diaHabilitacion: sanearDiaConfig(data.diaHabilitacion, CONFIG_CIERRE_DEFAULT.diaHabilitacion),
      diaBloqueo:      sanearDiaConfig(data.diaBloqueo,      CONFIG_CIERRE_DEFAULT.diaBloqueo),
      modoLlenado:     MODOS_LLENADO[data.modoLlenado] ? data.modoLlenado : CONFIG_CIERRE_DEFAULT.modoLlenado,
      actualizadoPor:  data.actualizadoPor || null,
      fechaActualizacion: data.fechaActualizacion || null
    };
    // El bloqueo nunca puede ser anterior a la habilitación
    if (configCierreCache.diaBloqueo < configCierreCache.diaHabilitacion) {
      configCierreCache.diaBloqueo = configCierreCache.diaHabilitacion;
    }
  } catch(e) {
    console.warn('No se pudo cargar la configuración de cierre, se usan los valores por defecto:', e);
    configCierreCache = { ...CONFIG_CIERRE_DEFAULT, actualizadoPor: null, fechaActualizacion: null };
  }
  return configCierreCache;
}

// Se admite del 1 al 31. Si el mes es más corto que el día configurado
// (febrero de 28 o 29 días según el año, o los meses de 30), el día efectivo
// pasa a ser el último día real de ese mes.
function sanearDiaConfig(valor, porDefecto) {
  const n = parseInt(valor, 10);
  if (isNaN(n) || n < 1 || n > 31) return porDefecto;
  return n;
}

// Traduce el día configurado al día que realmente corresponde en ese período.
// diasEnMes() se apoya en el calendario del navegador, así que los años
// bisiestos quedan resueltos solos: febrero de 2028 devuelve 29, el de 2026, 28.
function ajustarDiaAlMes(dia, periodo) {
  const ultimo = diasEnMes(periodo);
  return Math.min(dia, ultimo);
}

/* ── Ventana de llenado ──────────────────────────────────────────
   diaEsEditable() es la única regla de apertura de días. Antes esto
   estaba repetido como `dia !== new Date().getDate()` en cuatro
   lugares distintos; ahora todos consultan esta función. */

function obtenerModoLlenado() {
  return (configCierreCache && configCierreCache.modoLlenado) || CONFIG_CIERRE_DEFAULT.modoLlenado;
}

// Día del mes en que arranca la semana en curso (lunes). Si la semana viene
// del mes anterior, se corta en el día 1: ese tramo pertenece a otro período
// y se cierra con el informe de ese mes.
function diaInicioSemana(referencia = new Date()) {
  const d = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate());
  const diaSemana = d.getDay();                       // 0 = domingo … 6 = sábado
  const desdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  const lunes = new Date(d);
  lunes.setDate(d.getDate() - desdeLunes);
  return lunes.getMonth() === d.getMonth() ? lunes.getDate() : 1;
}

function diaEsEditable(dia, referencia = new Date()) {
  const diaHoy = referencia.getDate();
  if (dia > diaHoy) return false;                     // nunca se abre un día futuro
  const modo = obtenerModoLlenado();
  if (modo === 'mensual') return true;
  if (modo === 'semanal') return dia >= diaInicioSemana(referencia);
  return dia === diaHoy;
}

// El día está abierto por la ventana configurada o por un desbloqueo puntual del admin
function diaAbiertoParaEscritura(dia) {
  const desbloqueado = (novedadesActuales?.diasDesbloqueados || []).includes(dia);
  return diaEsEditable(dia) || desbloqueado;
}

// Texto para avisar al usuario qué días tiene abiertos
function descripcionVentanaLlenado() {
  const modo = obtenerModoLlenado();
  if (modo === 'mensual') return 'Este mes está abierto para registrar cualquier día ya transcurrido.';
  if (modo === 'semanal') return `Esta semana está abierta desde el día ${diaInicioSemana()} hasta hoy.`;
  return 'Solo está abierto el día de hoy.';
}

// Devuelve el período (AAAA-MM) siguiente al indicado
function obtenerPeriodoSiguiente(periodo) {
  const [anio, mes] = periodo.split('-').map(Number);
  const d = new Date(anio, mes, 1); // mes es 1-based, así que esto ya cae en el mes siguiente
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function registrarEnAuditoria(accion, area, correoAfectado, dia, mes, detalles, descripcion) {
  try {
    await window._fb.addDoc(window._fb.collection(db, 'auditoria'), {
      admin: usuario.email,
      accion: accion,
      area: area || null,
      correoAfectado: correoAfectado || null,
      dia: dia || null,
      mes: mes || null,
      detalles: detalles || {},
      timestamp: new Date(),
      descripcion: descripcion || ''
    });
  } catch(e) {
    // Antes esto se descartaba en silencio: si fallaba (cuota agotada, reglas
    // de Firestore, sin conexión) el rastro se cortaba sin que nadie se
    // enterara. Ahora se avisa en pantalla y se deja el detalle en consola.
    console.error('No se pudo registrar en auditoría:', e);
    try { toast('⚠️ La acción se guardó, pero NO quedó registrada en auditoría', 'err'); } catch(_) {}
  }
}

/* ══════════════════════════════════
   VALIDACIÓN DE CÓDIGOS
══════════════════════════════════ */

function normalizarCodigo(entrada) {
  if (!entrada) return null;
  return entrada.toUpperCase().trim();
}

function validarCodigo(codigo) {
  if (!codigo) return false;
  const norm = normalizarCodigo(codigo);
  return CODIGOS_VALIDOS.some(c => normalizarCodigo(c) === norm);
}

/* ═════════════════════════════════════════
   MÓDULO NOVEDADES — Cargar datos actuales
═════════════════════════════════════════ */

function obtenerPeriodoAnterior(periodo) {
  const [anio, mes] = periodo.split('-').map(Number);
  const d = new Date(anio, mes - 2, 1); // mes-1 es el mes actual (0-index), -1 más = mes anterior
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function obtenerAreasNovedades() {
  try {
    await _firebaseReady; // evita leer window._fb antes de que initFirebase() termine de inicializar
    const ref = window._fb.doc(db, 'sistema', 'areas_novedades');
    const snap = await window._fb.getDoc(ref);
    if (snap.exists() && snap.data().lista && snap.data().lista.length > 0) {
      return snap.data().lista;
    }
  } catch(e) {
    console.warn('No se pudo obtener la lista real de áreas, usando AREAS por defecto:', e);
  }
  return AREAS; // respaldo si todavía no se importó/guardó ningún catálogo en Firestore
}

// Guarda el catálogo de áreas (ordenado y sin duplicados) — fuente única
// que alimenta tanto el selector de Envíos como el de Novedades
async function guardarCatalogoAreas(lista) {
  const limpio = [...new Set(lista.map(a => String(a).trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'es'));
  const ref = window._fb.doc(db, 'sistema', 'areas_novedades');
  await window._fb.setDoc(ref, { lista: limpio, ultimaModificacion: new Date() });
  return limpio;
}

/* ═════════════════════════════════════════
   COMBOBOX DE ÁREA (buscador reutilizable) — input de texto + lista
   desplegable filtrable, usado en Envíos y en el selector admin de Novedades
═════════════════════════════════════════ */
function crearComboboxArea({ inputId, listaId, onSeleccionar, permitirNuevo = false, limpiarAlEnfocar = true }) {
  const input = $(inputId);
  const lista = $(listaId);
  if (!input || !lista) return null;

  let opciones = [];
  let valorActual = '';

  // La lista se posiciona "fixed" respecto al viewport (calculada desde
  // getBoundingClientRect del input) en vez de "absolute" respecto a su
  // contenedor — así no queda recortada dentro de modales con overflow-y:auto
  // (ej. "Editar Acceso"), que cortaban el menú y hacían parecer que no buscaba.
  const posicionarLista = () => {
    const r = input.getBoundingClientRect();
    lista.style.position = 'fixed';
    lista.style.top = `${r.bottom + 4}px`;
    lista.style.left = `${r.left}px`;
    lista.style.width = `${r.width}px`;
  };

  const cerrarLista = () => {
    lista.style.display = 'none';
    window.removeEventListener('scroll', cerrarSiScrollFuera, true);
    window.removeEventListener('resize', cerrarLista);
  };

  // El scroll dentro de la propia lista también dispara 'scroll' en la fase
  // de captura de window (los eventos scroll pasan por window camino al
  // elemento). Sin este filtro, apenas el usuario intentaba desplazarse
  // dentro del desplegable, este se cerraba de inmediato y no dejaba ver
  // el resto de las áreas.
  const cerrarSiScrollFuera = (e) => {
    if (lista.contains(e.target)) return;
    cerrarLista();
  };

  const renderLista = (filtro) => {
    const norm = (filtro || '').trim().toLowerCase();
    const coincidencias = norm ? opciones.filter(a => a.toLowerCase().includes(norm)) : opciones;
    lista.innerHTML = '';
    if (!coincidencias.length) {
      const vacio = document.createElement('div');
      vacio.style.cssText = 'padding:10px 12px;font-size:13px;color:var(--txt2);';
      vacio.textContent = permitirNuevo
        ? 'Ningún área coincide — si guarda este texto, se creará como área nueva'
        : 'Ningún área coincide con la búsqueda';
      lista.appendChild(vacio);
    } else {
      coincidencias.forEach(a => {
        const item = document.createElement('div');
        item.textContent = a;
        item.style.cssText = 'padding:9px 12px;font-size:13px;cursor:pointer;';
        item.addEventListener('mouseover', () => item.style.background = 'var(--blue-l)');
        item.addEventListener('mouseout',  () => item.style.background = '');
        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          input.value = a;
          valorActual = a;
          cerrarLista();
          onSeleccionar(a);
        });
        lista.appendChild(item);
      });
    }
    posicionarLista();
    lista.style.display = 'block';
    // Si el usuario hace scroll fuera de la lista (por ejemplo dentro de un
    // modal) mientras esta está abierta, se cierra en vez de quedar
    // desalineada. El scroll dentro de la lista misma no la cierra.
    window.addEventListener('scroll', cerrarSiScrollFuera, true);
    window.addEventListener('resize', cerrarLista);
  };

  if (input.dataset.comboboxInit !== '1') {
    input.dataset.comboboxInit = '1';
    input.addEventListener('focus', () => {
      // En los comboboxes de selección estricta (área única a elegir de la
      // lista) se borra para buscar de cero. En los que permiten un valor
      // nuevo (ej. Base de Personal), NO se borra — se muestra el valor
      // actual y la lista ya filtrada por él, para no dejar el campo en
      // blanco si el usuario hace clic y sale sin escribir nada.
      if (limpiarAlEnfocar) input.value = '';
      renderLista(input.value);
    });
    input.addEventListener('input', () => renderLista(input.value));
    input.addEventListener('blur', () => {
      setTimeout(() => {
        // Si quedó escrito algo que no es un área del catálogo, se restaura el
        // valor previo — salvo que este combobox permita áreas nuevas
        // (ej. Base de Personal, donde escribir un área que no existe todavía
        // la crea en el catálogo al guardar).
        if (!permitirNuevo && !opciones.includes(input.value)) input.value = valorActual;
        cerrarLista();
      }, 150);
    });
  }

  return {
    actualizar(nuevasOpciones, seleccionInicial) {
      opciones = nuevasOpciones;
      valorActual = seleccionInicial || '';
      input.value = valorActual;
    }
  };
}

let comboboxAreaNovedadesAdmin = null;

async function poblarSelectorAreaAdmin() {
  const cont  = $('admin-selector-area-novedades');
  const input = $('input-area-admin-novedades');
  const lista = $('lista-area-admin-novedades');
  if (!cont || !input || !lista) return;
  show('admin-selector-area-novedades');
  cont.style.display = 'block';

  const areasReales = await obtenerAreasNovedades();

  if (!areaActual || !areasReales.includes(areaActual)) areaActual = areasReales[0];

  if (!comboboxAreaNovedadesAdmin) {
    comboboxAreaNovedadesAdmin = crearComboboxArea({
      inputId: 'input-area-admin-novedades',
      listaId: 'lista-area-admin-novedades',
      onSeleccionar: (area) => {
        areaActual = area;
        cargarNovedadesActuales();
      }
    });
  }
  comboboxAreaNovedadesAdmin.actualizar(areasReales, areaActual);
}

/* ── Selector de "área activa" para un secretario con varias áreas
   agrupadas bajo un mismo correo. A diferencia del selector del admin
   (que busca en TODO el catálogo), este solo lista las áreas que el
   propio correo tiene asignadas en `accesos.areas`. ── */
function poblarSelectorAreaActivaSecretario(areas, seleccionada) {
  const sel = $('select-area-activa-secretario');
  if (!sel) return;
  sel.innerHTML = areas.map(a =>
    `<option value="${String(a).replace(/"/g, '&quot;')}" ${a === seleccionada ? 'selected' : ''}>${a}</option>`
  ).join('');
}

async function cambiarAreaActivaSecretario(area) {
  if (!area || area === areaActual) return;
  areaActual = area;

  // Se recuerda para la próxima vez que entre, aunque sea desde otro dispositivo.
  try {
    const correoNorm = String(usuario.email || '').toLowerCase().trim();
    await window._fb.setDoc(window._fb.doc(db, 'accesos', correoNorm), { areaActiva: area }, { merge: true });
  } catch (e) {
    console.warn('No se pudo guardar el área activa:', e);
  }

  cargarNovedadesActuales();
}

async function cargarNovedadesActuales() {
  try {
    const dateParts = obtenerFechaParts();
    const periodo = dateParts.periodo;
    const diaHoy = dateParts.dia;

    if (esAdmin() || esSupervisor()) {
      // El admin gestiona cualquier área; el supervisor puede recorrerlas todas
      // en modo lectura (los controles de edición quedan igualmente bloqueados
      // por tienePermisoAccion, que solo le concede acciones _ver y _exportar).
      hide('selector-area-activa-secretario');
      await poblarSelectorAreaAdmin();
    } else {
      hide('admin-selector-area-novedades');
      // Obtener area del usuario desde accesos.
      // El correo se normaliza a minúsculas porque así se guarda siempre en
      // `accesos` (ver guardarAcceso), y la comparación de Firestore distingue
      // mayúsculas: sin esto, una cuenta con mayúsculas nunca encontraba su área.
      const accesoRef = window._fb.collection(db, 'accesos');
      const correoNorm = String(usuario.email || '').toLowerCase().trim();
      const q = window._fb.query(accesoRef, window._fb.where('correo', '==', correoNorm));
      const querySnapshot = await window._fb.getDocs(q);

      if (querySnapshot.empty) {
        toast('❌ Su correo no está configurado en el sistema. Contacte a soporte.', 'err');
        hide('tabla-novedades-container');
        hide('cierre-mes-container');
        hide('novedades-top-controles');
        hide('selector-area-activa-secretario');
        show('tabla-cargando');
        $('tabla-cargando').textContent = '❌ Correo no configurado';
        return;
      }

      const acceso = querySnapshot.docs[0].data();

      // El botón "⊘ Bloquear" del panel de Accesos guarda estado:false. Antes
      // ese valor no se revisaba en ninguna parte, así que un acceso bloqueado
      // seguía entrando igual.
      if (acceso.estado === false) {
        toast('❌ Su acceso está bloqueado. Comuníquese con la Unidad de Personal y Movilidad.', 'err');
        hide('tabla-novedades-container');
        hide('cierre-mes-container');
        hide('novedades-top-controles');
        hide('selector-area-activa-secretario');
        show('tabla-cargando');
        $('tabla-cargando').textContent = '🔒 Acceso bloqueado';
        return;
      }

      // Un secretario agrupado tiene varias áreas asignadas (accesos.areas).
      // Se recuerda la última elegida (accesos.areaActiva); si no hay ninguna
      // guardada, o ya no está entre sus áreas, se cae a la primera.
      const areasSecretario = Array.isArray(acceso.areas) && acceso.areas.length
        ? acceso.areas
        : (acceso.area ? [acceso.area] : []);

      if (!areaActual || !areasSecretario.includes(areaActual)) {
        areaActual = areasSecretario.includes(acceso.areaActiva)
          ? acceso.areaActiva
          : (areasSecretario[0] || acceso.area || '');
      }

      if (areasSecretario.length > 1) {
        poblarSelectorAreaActivaSecretario(areasSecretario, areaActual);
        show('selector-area-activa-secretario');
      } else {
        hide('selector-area-activa-secretario');
      }
    }

    mesActual = periodo;

    // Actualizar hero
    $('hero-area').textContent = areaActual;
    $('hero-mes').textContent = obtenerNombreMes(dateParts.mes);
    $('info-dia-actual').textContent = `Hoy es día ${diaHoy}`;

    // ── Verificar si hay un mes anterior sin cerrar ──
    const periodoAnterior = obtenerPeriodoAnterior(periodo);
    const refAnterior = window._fb.doc(db, 'novedades', areaActual, periodoAnterior, 'datos');
    const docAnterior = await window._fb.getDoc(refAnterior);

    // ── Ventana configurable de cierre (definida por el administrador) ──
    // Los días guardados se ajustan al mes en curso: si el administrador fijó el
    // día 30 y el mes es febrero, el efectivo será 28 o 29 según el año.
    const cfgCierre = await obtenerConfigCierre();
    const diaHabilitacion = ajustarDiaAlMes(cfgCierre.diaHabilitacion, periodo);
    const diaBloqueo      = ajustarDiaAlMes(cfgCierre.diaBloqueo, periodo);
    const cfgCierreEfectiva = { ...cfgCierre, diaHabilitacion, diaBloqueo };

    // Aviso permanente de qué días tiene abiertos el área
    const badgeVentana = $('info-ventana-llenado');
    if (badgeVentana) {
      $('info-ventana-llenado-txt').textContent = descripcionVentanaLlenado();
      badgeVentana.style.display = obtenerModoLlenado() === 'diario' ? 'none' : 'flex';
    }
    // Desde el día de habilitación ya se puede generar el informe del mes anterior
    const reporteHabilitado = diaHoy >= diaHabilitacion;
    // Recién desde el día de bloqueo se corta el registro del mes en curso
    const bloqueoActivo     = diaHoy >= diaBloqueo;

    const prevTieneDatos = docAnterior.exists() && (docAnterior.data().agentes || []).length > 0;
    const prevCerrado    = prevTieneDatos && docAnterior.data().estado === 'cerrado';

    // Límite de regeneraciones del informe ya cerrado: el cierre original cuenta
    // como el intento 1, quedan 2 más para el secretario (ej. generó en el
    // celular, no encontró el archivo, y necesita repetirlo desde la PC).
    const datosPrevReporte = prevCerrado ? docAnterior.data() : null;
    const intentosUsadosReporte = intentosUsadosDeReporte(datosPrevReporte);
    const intentosRestantesReporte = intentosRestantesDeReporte(datosPrevReporte, periodoAnterior);

    // Panel "Generar Reporte" (arriba de la tabla):
    // - Admin: acceso total, cualquier área/mes/año, en cualquier momento.
    // - Usuario con permiso "reporte_elegir_mes": igual que el admin (puede elegir mes/año).
    // - Supervisor: se mantiene visible (revisa todo en modo lectura), pero siempre
    //   deshabilitado — no genera reportes, solo observa el estado.
    // - Usuario regular: el panel se OCULTA por completo. Para él, la generación del
    //   reporte del mes recién culminado ya aparece más abajo, dentro de la sección
    //   "Cierre de mes" (mostrarCierreMes), así que repetirla aquí es redundante.
    const puedeVerPanelReporte = esAdmin() || esSupervisor() ||
      tienePermisoAccion('reporte_elegir_mes') || tienePermisoAccion('reporte_habilitar_campos');

    if (!puedeVerPanelReporte) {
      hide('admin-generar-reporte');
      $('admin-generar-reporte').style.display = 'none';
    } else {
      $('reporte-prueba-titulo').textContent = '📄 Generar Reporte';
      hide('reporte-prueba-desc');

      const fijarEstadoCamposReporte = (habilitado) => {
        ['reporte-prueba-elaborado-por', 'reporte-prueba-responsable'].forEach(id => {
          const el = $(id);
          if (!el) return;
          el.disabled = !habilitado;
          el.style.opacity = habilitado ? '' : '0.5';
          el.style.cursor = habilitado ? 'pointer' : 'not-allowed';
          el.style.pointerEvents = habilitado ? '' : 'none';
        });
      };

      if (esAdmin() || tienePermisoAccion('reporte_elegir_mes')) {
        show('admin-generar-reporte');
        $('admin-generar-reporte').style.display = 'block';
        show('reporte-prueba-selectores');
        $('reporte-prueba-selectores').style.display = 'grid';
        $('reporte-prueba-btn-txt').textContent = '📄 Generar Reporte';
        $('btn-generar-reporte-prueba').disabled = false;
        $('btn-generar-reporte-prueba').style.opacity = '';
        $('btn-generar-reporte-prueba').style.cursor = '';
        fijarEstadoCamposReporte(true);
        poblarSelectoresReportePrueba();
      } else if (prevCerrado || reporteHabilitado || (prevTieneDatos && tienePermisoAccion('reporte_habilitar_campos'))) {
        // Habilitado y fijo al mes anterior. Se llega acá por tres caminos:
        //  · el mes anterior ya quedó cerrado (se puede volver a generar el reporte)
        //  · ya llegó el día de habilitación configurado por el administrador
        //  · el usuario tiene el permiso puntual para generar reportes tardíos
        const etiqueta = (!prevCerrado && !reporteHabilitado)
          ? '📄 Generar Reporte (tardío)'
          : (prevTieneDatos ? '📄 Generar Reporte' : '📄 Generar Reporte (sin novedades cargadas)');
        show('admin-generar-reporte');
        $('admin-generar-reporte').style.display = 'block';
        hide('reporte-prueba-selectores');
        $('reporte-prueba-selectores').style.display = 'none';
        $('reporte-prueba-btn-txt').textContent = `${etiqueta} — ${obtenerNombreMes(periodoAnterior.split('-')[1])} ${periodoAnterior.split('-')[0]}`;
        $('btn-generar-reporte-prueba').disabled = false;
        $('btn-generar-reporte-prueba').style.opacity = '';
        $('btn-generar-reporte-prueba').style.cursor = '';
        fijarEstadoCamposReporte(true);
        poblarSelectoresReportePrueba();
        // Fijar el período al mes recién culminado
        $('reporte-prueba-mes').value = periodoAnterior.split('-')[1];
        $('reporte-prueba-anio').value = periodoAnterior.split('-')[0];
      } else {
        // Todavía bloqueado. Dos escenarios distintos, con mensajes distintos:
        //  · hay mes anterior pendiente pero aún no llega el día de habilitación
        //  · no hay mes anterior: se habilita en el mes siguiente al que corre
        show('admin-generar-reporte');
        $('admin-generar-reporte').style.display = 'block';
        hide('reporte-prueba-selectores');
        $('reporte-prueba-selectores').style.display = 'none';
        const periodoSiguiente = obtenerPeriodoSiguiente(periodo);
        const diaHabSiguiente  = ajustarDiaAlMes(cfgCierre.diaHabilitacion, periodoSiguiente);
        $('reporte-prueba-btn-txt').textContent = docAnterior.exists()
          ? `🔒 Se habilita el ${diaHabilitacion} de ${obtenerNombreMes(periodo.split('-')[1])}`
          : `🔒 Se habilita el ${diaHabSiguiente} de ${obtenerNombreMes(periodoSiguiente.split('-')[1])}`;
        $('btn-generar-reporte-prueba').disabled = true;
        $('btn-generar-reporte-prueba').style.opacity = '0.5';
        $('btn-generar-reporte-prueba').style.cursor = 'not-allowed';
        fijarEstadoCamposReporte(false);
      }

      // El supervisor solo observa: aunque el estado anterior lo habilite, nunca puede
      // generar el reporte desde acá — todo lo maneja en modo lectura.
      if (esSupervisor()) {
        $('btn-generar-reporte-prueba').disabled = true;
        $('btn-generar-reporte-prueba').style.opacity = '0.5';
        $('btn-generar-reporte-prueba').style.cursor = 'not-allowed';
        fijarEstadoCamposReporte(false);
      }
    }

    // ── Cierre del mes anterior ──
    // Antes esto bloqueaba siempre. Ahora depende de la ventana configurada:
    //  · antes del día de habilitación → ni se muestra (el área trabaja normal)
    //  · entre habilitación y bloqueo  → se muestra como aviso, SIN bloquear:
    //    el secretario sigue registrando el mes en curso y genera el informe
    //    cuando lo tenga listo
    //  · desde el día de bloqueo       → pantalla bloqueante, como antes
    const cierrePendiente = prevTieneDatos && !prevCerrado;

    // El bloqueo del mes en curso es una medida de control sobre el SECRETARIO
    // del área. El administrador y el supervisor nunca deben quedar encerrados
    // en esta pantalla: supervisan todas las áreas y necesitan ver el mes en
    // curso aunque el informe del mes anterior siga pendiente. Antes este
    // `return` cortaba para todos por igual y dejaba al admin sin ver la tabla.
    const exentoDeBloqueo = esAdmin() || esSupervisor();

    // Prórroga de cierre: el administrador habilitó a esta área a completar el mes
    // anterior. Mientras esté activa no se bloquea el mes en curso.
    const enProrroga = cierrePendiente && !!(docAnterior.data().prorroga && docAnterior.data().prorroga.activa);

    // Desde el día 2 el mes anterior deja de verse para las áreas: solo ven el mes en
    // curso. Lo siguen viendo el administrador y el supervisor, y el área a la que el
    // administrador le dio una prórroga o le repuso los intentos del informe.
    const plazoMesAnterior = plazoLlenadoMesAnteriorVigente(periodoAnterior);
    const reposicionHoy    = prevCerrado && reposicionDeReporteVigente(docAnterior.data());
    const veMesAnterior    = exentoDeBloqueo || plazoMesAnterior || enProrroga || reposicionHoy;

    // El bloqueo del mes en curso solo actúa mientras el área aún puede ver y
    // completar el mes anterior (el día 1); después ya no tendría cómo desbloquearse.
    if (cierrePendiente && bloqueoActivo && !exentoDeBloqueo && !enProrroga && plazoMesAnterior) {
      mostrarCierreMes(areaActual, periodoAnterior, docAnterior.data(), true, cfgCierreEfectiva);
      return;
    }

    // Ya cerrado con intentos de regeneración disponibles: se vuelve a mostrar la
    // pantalla, en modo aviso, para que el secretario pueda volver a descargar su
    // informe. Si agotó los 3 intentos el mismo día 1, se muestra el aviso de límite
    // hasta las 23:59; vencido el plazo, la pantalla desaparece.
    const puedeReabrirPorIntentos = prevCerrado && !exentoDeBloqueo &&
      (intentosRestantesReporte > 0 ||
       (intentosUsadosReporte >= MAX_INTENTOS_REPORTE && plazoReporteVigente(datosPrevReporte, periodoAnterior)));

    if (!veMesAnterior) {
      ocultarPantallaCierreMes();
    } else if (cierrePendiente && (reporteHabilitado || enProrroga)) {
      mostrarCierreMes(areaActual, periodoAnterior, docAnterior.data(), false, cfgCierreEfectiva);
    } else if (puedeReabrirPorIntentos) {
      mostrarCierreMes(areaActual, periodoAnterior, docAnterior.data(), false, cfgCierreEfectiva);
    } else {
      ocultarPantallaCierreMes();
    }
    verificarBackupPendiente(periodoAnterior);

    const novedadesRef = window._fb.doc(db, 'novedades', areaActual, periodo, 'datos');
    const novedadesDoc = await window._fb.getDoc(novedadesRef);

    if (!novedadesDoc.exists()) {
      // Mes nuevo. Antes nacía con `agentes: []` y el área amanecía vacía el
      // día 1 hasta que un administrador reimportara toda la base. Ahora se
      // arrastra la NÓMINA del mes anterior (solo la identidad de cada
      // servidor); las novedades por día arrancan en blanco, porque cada mes
      // es independiente. El documento del mes anterior solo se LEE: no se
      // modifica ni se borra, conserva sus novedades, su cierre y sus firmas.
      const agentesArrastrados = arrastrarNominaMesAnterior(docAnterior);

      const estructuraInicial = {
        agentes: agentesArrastrados,
        estado: 'activo',
        diasBloqueados: [],
        diasDesbloqueados: [],
        diasNoCompletados: Array.from({length: 31}, (_, i) => i + 1),
        fechaCreacion: new Date(),
        ultimaModificacion: new Date()
      };
      if (agentesArrastrados.length) estructuraInicial.nominaArrastradaDe = periodoAnterior;

      await window._fb.setDoc(novedadesRef, estructuraInicial);
      novedadesActuales = { ...estructuraInicial };

      if (agentesArrastrados.length) {
        toast(`📋 Se arrastraron ${agentesArrastrados.length} servidor(es) desde ${obtenerNombreMes(periodoAnterior.split('-')[1])} — las novedades arrancan en blanco`, 'ok');
      }
    } else {
      novedadesActuales = novedadesDoc.data();
    }

    // Renderizar tabla
    renderizarTablaNovedades(diaHoy);

    // Verificar días pendientes
    verificarDiasPendientes();

    show('novedades-top-controles');
    hide('tabla-cargando');
    show('tabla-novedades-container');

  } catch(e) {
    console.error('Error cargando novedades:', e);
    toast('Error cargando datos: ' + e.message, 'err');
    hide('tabla-novedades-container');
    show('tabla-cargando');
    $('tabla-cargando').textContent = '❌ Error cargando datos';
  }
}

/* ═════════════════════════════════════════
   Agrupar agentes duplicados por código válido
   o por nombre (cubre el caso de campos
   código/grado invertidos por una mala carga)
═════════════════════════════════════════ */
function agruparAgentesPorIdentidad(agentes) {
  const n = agentes.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
  function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }

  const porCodigo = {};
  const porNombre = {};

  agentes.forEach((a, i) => {
    const codigo = String(a.codigo || '').trim();
    const esCodigoValido = /^\d+$/.test(codigo);
    const nombre = String(a.apellidosNombres || '').trim().toUpperCase().replace(/\s+/g, ' ');

    if (esCodigoValido) {
      if (porCodigo[codigo] !== undefined) union(i, porCodigo[codigo]);
      else porCodigo[codigo] = i;
    }
    if (nombre) {
      if (porNombre[nombre] !== undefined) union(i, porNombre[nombre]);
      else porNombre[nombre] = i;
    }
  });

  const grupos = {};
  agentes.forEach((a, i) => {
    const raiz = find(i);
    if (!grupos[raiz]) grupos[raiz] = [];
    grupos[raiz].push(a);
  });

  return Object.values(grupos);
}

/* ═════════════════════════════════════════
   Ordenar agentes por código (numérico, menor a mayor)
═════════════════════════════════════════ */
function compararPorCodigo(codigoA, codigoB) {
  const a = parseInt(String(codigoA).replace(/\D/g, ''), 10);
  const b = parseInt(String(codigoB).replace(/\D/g, ''), 10);
  if (isNaN(a) && isNaN(b)) return 0;
  if (isNaN(a)) return 1;
  if (isNaN(b)) return -1;
  return a - b;
}
/* ═════════════════════════════════════════
   Ordenar agentes por GRADO (jerarquía) y,
   dentro de cada grado, por código ascendente
═════════════════════════════════════════ */
const ORDEN_GRADOS = [
  'PREFECTO COMANDANTE',
  'PREFECTO JEFE',
  'PREFECTO',
  'SUBPREFECTO',
  'INSPECTOR',
  'SUBINSPECTOR DE TRANSITO 1',
  'SUBINSPECTOR DE TRANSITO 2',
  'AGENTE DE TRANSITO 1',
  'AGENTE DE TRANSITO 2',
  'AGENTE DE TRANSITO 3',
  'AGENTE DE TRANSITO 4'
];

function normalizarGrado(grado) {
  return String(grado || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes para comparar sin diferencias
    .replace(/\s+/g, ''); // quita todos los espacios — así "SUBPREFECTO" y "SUB PREFECTO" comparan igual
}

function indiceDeGrado(grado) {
  const norm = normalizarGrado(grado);
  const idx = ORDEN_GRADOS.findIndex(g => normalizarGrado(g) === norm);
  return idx === -1 ? ORDEN_GRADOS.length : idx; // grados no listados van al final
}

function compararPorGrado(gradoA, gradoB, codigoA, codigoB) {
  const diff = indiceDeGrado(gradoA) - indiceDeGrado(gradoB);
  if (diff !== 0) return diff;
  return compararPorCodigo(codigoA, codigoB);
}

function ordenarAgentesPorGrado(agentes) {
  return [...(agentes || [])].sort((x, y) => compararPorGrado(x.grado, y.grado, x.codigo, y.codigo));
}

/* Copia la NÓMINA de un mes al siguiente — nunca las novedades.
   De cada servidor se conserva solo su identidad: código, grado y nombres.
   `novedadesPorDia` y `observaciones` arrancan vacíos, porque lo registrado en
   un mes no guarda relación con el mes siguiente.
   El documento de origen NO se toca: acá únicamente se lee.
   Recibe el snapshot del mes anterior, que cargarNovedadesActuales ya trajo
   para revisar el cierre, así que esto no genera una lectura extra. */
function arrastrarNominaMesAnterior(docAnterior) {
  if (!docAnterior || !docAnterior.exists()) return [];

  const previos = docAnterior.data().agentes || [];
  const vistos = new Set();
  const nomina = [];

  previos.forEach(a => {
    const codigo = String(a.codigo || '').trim();
    const clave = codigo.replace(/\s+/g, '').toUpperCase();
    if (!codigo || vistos.has(clave)) return; // sin código o duplicado: no se arrastra
    vistos.add(clave);
    nomina.push({
      codigo,
      grado: a.grado || '',
      apellidosNombres: a.apellidosNombres || '',
      novedadesPorDia: {},
      observaciones: ''
    });
  });

  return ordenarAgentesPorGrado(nomina);
}

/* ── Sombreado horizontal: seleccionar varios días de un mismo agente
   arrastrando, para aplicarles el mismo código de una sola vez ── */
let arrastreSel = null;            // { idxAgente, agente, filaTr, diaInicio, diaFin }
let arrastreHuboMovimiento = false; // true solo si el arrastre cambió de celda (si no, fue un clic simple)
let arrastreSuprimirClick = false;  // evita que el click que sigue a un arrastre real reabra el modal de un solo día
let touchTimerArrastre = null;
let touchInicioPos = null;
let touchArrastreActivo = false;

function iniciarPosibleArrastre(agente, idx, dia, tr) {
  arrastreSel = { idxAgente: idx, agente, filaTr: tr, diaInicio: dia, diaFin: dia };
  arrastreHuboMovimiento = false;
}

function extenderArrastre(idx, dia, tr) {
  if (!arrastreSel || arrastreSel.idxAgente !== idx || arrastreSel.filaTr !== tr) return;
  if (arrastreSel.diaFin === dia) return;
  arrastreSel.diaFin = dia;
  arrastreHuboMovimiento = true;
  pintarArrastre();
}

function pintarArrastre() {
  if (!arrastreSel) return;
  const { filaTr, diaInicio, diaFin } = arrastreSel;
  const desde = Math.min(diaInicio, diaFin), hasta = Math.max(diaInicio, diaFin);
  const hoy = new Date().getDate();
  filaTr.querySelectorAll('td[data-dia]').forEach(td => {
    const d = parseInt(td.dataset.dia, 10);
    const dentro = d >= desde && d <= hasta && td.dataset.arrastrable === '1';
    if (dentro) {
      td.style.backgroundColor = 'var(--gold-m)';
      td.style.outline = '2px solid var(--gold)';
      td.style.outlineOffset = '-2px';
      td.dataset.sombreada = '1';
    } else if (td.dataset.sombreada === '1') {
      td.style.backgroundColor = (d === hoy && filaTr.dataset.cierre !== '1') ? 'var(--green-l)' : '';
      td.style.outline = '';
      td.dataset.sombreada = '0';
    }
  });
}

function finalizarArrastre() {
  if (!arrastreSel) return;
  const { agente, idxAgente, diaInicio, diaFin, filaTr } = arrastreSel;
  const huboMovimiento = arrastreHuboMovimiento;
  const desde = Math.min(diaInicio, diaFin), hasta = Math.max(diaInicio, diaFin);

  // Limpia el sombreado visual, quede o no seleccionado un rango real
  const hoy = new Date().getDate();
  filaTr.querySelectorAll('td[data-sombreada="1"]').forEach(td => {
    const d = parseInt(td.dataset.dia, 10);
    td.style.backgroundColor = (d === hoy && filaTr.dataset.cierre !== '1') ? 'var(--green-l)' : '';
    td.style.outline = '';
    td.dataset.sombreada = '0';
  });

  arrastreSel = null;

  if (!huboMovimiento) return; // fue un clic simple: lo maneja el listener de click normal

  arrastreSuprimirClick = true; // el click que el navegador dispara después de soltar no debe reabrir el modal de un solo día
  setTimeout(() => { arrastreSuprimirClick = false; }, 50);

  // Solo entran al rango los días editables — los bloqueados se saltan solos
  const dias = [];
  for (let d = desde; d <= hasta; d++) {
    const td = filaTr.querySelector(`td[data-dia="${d}"]`);
    if (td && td.dataset.arrastrable === '1') dias.push(d);
  }
  if (dias.length) {
    if (filaTr.dataset.cierre === '1') abrirModalEditarNovedadDiasCierre(agente, dias, idxAgente);
    else abrirModalEditarNovedadDias(agente, dias, idxAgente);
  }
}

document.addEventListener('mouseup', finalizarArrastre);
document.addEventListener('mouseleave', () => { if (arrastreSel) finalizarArrastre(); });

function renderizarTablaNovedades(diaHoy) {
  const tabla = $('tabla-novedades');
  const thead = tabla.querySelector('thead tr');
  const tbody = $('tabla-novedades-body');

  // Detectar si hay agentes duplicados (por código o por nombre) — solo relevante para admin
  const btnCombinar = $('btn-combinar-duplicados');
  if (btnCombinar) {
    const grupos = agruparAgentesPorIdentidad(novedadesActuales.agentes || []);
    const hayDuplicados = grupos.some(g => g.length > 1);
    btnCombinar.style.display = (esAdmin() && hayDuplicados) ? 'inline-flex' : 'none';
  }
  const btnLlenarMes = $('btn-llenar-mes-admin');
  if (btnLlenarMes) btnLlenarMes.style.display = esAdmin() ? 'inline-flex' : 'none';
  
  // Limpiar cabecera (mantener primeras 5 columnas)
  const colsFijas = 4;
  while (thead.children.length > colsFijas) {
    thead.removeChild(thead.children[colsFijas]);
  }
  
  // Agregar columnas de días
  for (let dia = 1; dia <= 31; dia++) {
    const th = document.createElement('th');
    th.style.width = '45px';
    th.textContent = dia;
    if (dia === diaHoy) {
      th.style.backgroundColor = 'var(--green)';
      th.style.color = '#fff';
      th.style.fontWeight = '700';
    }

    const bloqueado = !diaAbiertoParaEscritura(dia);

    if (!bloqueado || esAdmin()) {
      th.style.cursor = 'pointer';
      th.title = `Clic para marcar "Sin Novedad" (S/N) en todos los agentes — día ${dia}`;
      th.addEventListener('click', () => seleccionarDiaColumna(dia));
    } else {
      th.style.cursor = 'not-allowed';
      th.title = 'Día bloqueado — clic para solicitar desbloqueo al administrador';
      th.addEventListener('click', () => solicitarDesbloqueo(dia));
    }

    thead.appendChild(th);
  }
  
  // Agregar columna observación
  const thObs = document.createElement('th');
  thObs.style.minWidth = '120px';
  thObs.textContent = 'Observación';
  thead.appendChild(thObs);

  // Agregar columna acción
  const thAccion = document.createElement('th');
  thAccion.style.width = '90px';
  thAccion.textContent = 'Acción';
  thead.appendChild(thAccion);
  
  // Limpiar cuerpo
  tbody.innerHTML = '';
  
  // Renderizar filas de agentes — ordenadas por grado (jerarquía) y, dentro del mismo grado, por código
  if (novedadesActuales.agentes && novedadesActuales.agentes.length > 0) {
    const agentesOrdenados = novedadesActuales.agentes
      .map((agente, origIdx) => ({ agente, origIdx }))
      .sort((a, b) => compararPorGrado(a.agente.grado, b.agente.grado, a.agente.codigo, b.agente.codigo));

    agentesOrdenados.forEach(({ agente, origIdx }, posicion) => {
      const idx = origIdx; // idx real dentro de novedadesActuales.agentes (para editar/guardar)
      const tr = document.createElement('tr');
      tr.dataset.codigo = String(agente.codigo || '').toLowerCase();
      
      // Columnas fijas
      const tdNum = document.createElement('td');
      tdNum.textContent = posicion + 1;
      tdNum.style.textAlign = 'center';
      tdNum.style.fontSize = '11px';
      tdNum.style.color = 'var(--txt3)';
      tr.appendChild(tdNum);
      
      const tdCod = document.createElement('td');
      tdCod.textContent = agente.codigo || '';
      tdCod.style.fontSize = '11px';
      tr.appendChild(tdCod);
      
      const tdGrado = document.createElement('td');
      tdGrado.textContent = agente.grado || '';
      tdGrado.style.fontSize = '11px';
      tr.appendChild(tdGrado);
      
      const tdNombre = document.createElement('td');
      tdNombre.textContent = agente.apellidosNombres || '';
      tdNombre.style.fontSize = '11px';
      tdNombre.style.whiteSpace = 'nowrap';
      tdNombre.style.overflow = 'hidden';
      tdNombre.style.textOverflow = 'ellipsis';
      tr.appendChild(tdNombre);
      
      
      // Celdas de días
      for (let dia = 1; dia <= 31; dia++) {
        const td = document.createElement('td');
        td.style.textAlign = 'center';
        td.style.padding = '6px 3px';
        td.style.cursor = 'pointer';
        td.style.userSelect = 'none';
        td.style.webkitUserSelect = 'none';
        td.dataset.dia = String(dia);
        
        const valor = agente.novedadesPorDia && agente.novedadesPorDia[String(dia)] ? agente.novedadesPorDia[String(dia)] : '';
        td.textContent = valor || '—';
        
        // Apertura del día según la ventana configurada (diaria / semanal / mensual)
        const desbloqueadoPorAdmin = (novedadesActuales.diasDesbloqueados || []).includes(dia);
        const bloqueado = !diaEsEditable(dia) && !desbloqueadoPorAdmin;
        if (bloqueado) {
          td.style.opacity = '0.5';
          td.style.cursor = 'not-allowed';
          td.style.backgroundColor = 'var(--bg)';
        }
        
        // Resaltar hoy
        if (dia === new Date().getDate()) {
          td.style.backgroundColor = 'var(--green-l)';
          td.style.borderColor = 'var(--green-m)';
          td.style.fontWeight = '600';
        }
        
        const editable = !bloqueado || esAdmin();
        td.dataset.arrastrable = editable ? '1' : '0';

        // Evento click (solo si hoy o admin) — clic simple sigue editando un solo día
        if (editable) {
          td.addEventListener('click', () => {
            if (arrastreSuprimirClick) return;
            abrirModalEditarNovedad(agente, dia, idx);
          });
          td.addEventListener('mouseover', () => {
            if (arrastreSel) { extenderArrastre(idx, dia, tr); return; }
            td.style.backgroundColor = 'var(--blue-l)';
          });
          td.addEventListener('mouseout', () => {
            if (arrastreSel) return; // no perder el sombreado mientras se arrastra
            if (dia === new Date().getDate()) {
              td.style.backgroundColor = 'var(--green-l)';
            } else {
              td.style.backgroundColor = '';
            }
          });
          // Arrastre horizontal (sombrear varios días de esta fila para aplicarles
          // el mismo código de una sola vez) — mouse
          td.addEventListener('mousedown', (e) => {
            e.preventDefault(); // evita que se seleccione el texto de la fila al arrastrar
            iniciarPosibleArrastre(agente, idx, dia, tr);
          });
          // Arrastre horizontal — touch (mantener presionado ~0.35s para no
          // chocar con el gesto normal de deslizar la tabla para hacer scroll)
          td.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            touchInicioPos = { x: t.clientX, y: t.clientY };
            touchArrastreActivo = false;
            clearTimeout(touchTimerArrastre);
            touchTimerArrastre = setTimeout(() => {
              touchArrastreActivo = true;
              iniciarPosibleArrastre(agente, idx, dia, tr);
              if (navigator.vibrate) navigator.vibrate(15);
            }, 350);
          }, { passive: true });
          td.addEventListener('touchmove', (e) => {
            if (touchArrastreActivo) {
              e.preventDefault();
              const t = e.touches[0];
              const destino = document.elementFromPoint(t.clientX, t.clientY);
              const tdDestino = destino && destino.closest('td[data-dia]');
              if (tdDestino && tdDestino.parentElement === tr) {
                extenderArrastre(idx, parseInt(tdDestino.dataset.dia, 10), tr);
              }
            } else if (touchInicioPos) {
              const t = e.touches[0];
              if (Math.abs(t.clientX - touchInicioPos.x) > 10 || Math.abs(t.clientY - touchInicioPos.y) > 10) {
                clearTimeout(touchTimerArrastre); // se movió antes de tiempo: es un scroll normal, no una selección
              }
            }
          }, { passive: false });
          td.addEventListener('touchend', () => {
            clearTimeout(touchTimerArrastre);
            if (touchArrastreActivo) { finalizarArrastre(); touchArrastreActivo = false; }
            touchInicioPos = null;
          });
        } else {
          // Día bloqueado: permitir al usuario solicitar desbloqueo
          td.title = 'Día bloqueado — clic para solicitar desbloqueo al administrador';
          td.addEventListener('click', () => solicitarDesbloqueo(dia));
        }
        
        tr.appendChild(td);
      }
      
      // Columna observación
      const tdObs = document.createElement('td');
      tdObs.textContent = agente.observaciones || '';
      tdObs.style.fontSize = '11px';
      tdObs.style.maxWidth = '120px';
      tdObs.style.overflow = 'hidden';
      tdObs.style.textOverflow = 'ellipsis';
      tr.appendChild(tdObs);

      // Columna acción
      const tdAccion = document.createElement('td');
      tdAccion.style.position = 'relative';
      tdAccion.style.textAlign = 'center';
      const btnAccion = document.createElement('button');
      btnAccion.className = 'btn-acc btn-acc-blue';
      btnAccion.style.fontSize = '10px';
      btnAccion.style.padding = '4px 8px';
      btnAccion.textContent = 'Acción ▾';
      btnAccion.type = 'button';
      btnAccion.addEventListener('click', (e) => {
        e.stopPropagation();
        abrirMenuAccionRapida(idx, btnAccion);
      });
      tdAccion.appendChild(btnAccion);
      tr.appendChild(tdAccion);
      
      tbody.appendChild(tr);
    });
  } else {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 40;
    td.textContent = '⚠️ No hay agentes configurados para su área';
    td.style.textAlign = 'center';
    td.style.padding = '20px';
    td.style.color = 'var(--txt3)';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  filtrarTablaPorCodigo();
}

function filtrarTablaPorCodigo() {
  const input = $('buscar-codigo-agente');
  if (!input) return;
  const texto = input.value.trim().toLowerCase();
  const tbody = $('tabla-novedades-body');
  if (!tbody) return;

  let visibles = 0;
  tbody.querySelectorAll('tr').forEach(tr => {
    if (tr.dataset.codigo === undefined) return; // fila de "sin agentes", no filtrar
    const coincide = !texto || tr.dataset.codigo.includes(texto);
    tr.style.display = coincide ? '' : 'none';
    if (coincide) visibles++;
  });

  let avisoVacio = $('aviso-busqueda-sin-resultados');
  if (texto && visibles === 0) {
    if (!avisoVacio) {
      avisoVacio = document.createElement('div');
      avisoVacio.id = 'aviso-busqueda-sin-resultados';
      avisoVacio.style.cssText = 'text-align:center;padding:16px;color:var(--txt3);font-size:13px;';
      tbody.parentElement.appendChild(avisoVacio);
    }
    avisoVacio.textContent = `Sin resultados para el código "${input.value.trim()}"`;
    avisoVacio.style.display = '';
  } else if (avisoVacio) {
    avisoVacio.style.display = 'none';
  }
}

let solicitudDesbloqueoDiasActual = null; // array de días a solicitar

async function solicitarDesbloqueo(dia) {
  try {
    // Evitar duplicar una solicitud pendiente para el mismo día/área/usuario
    const solRef = window._fb.collection(db, 'solicitudes');
    const q = window._fb.query(
      solRef,
      window._fb.where('correoUsuario', '==', usuario.email),
      window._fb.where('area', '==', areaActual),
      window._fb.where('mes', '==', mesActual),
      window._fb.where('dia', '==', dia),
      window._fb.where('estado', '==', 'pendiente')
    );
    const existentes = await window._fb.getDocs(q);
    if (!existentes.empty) {
      toast('Ya tiene una solicitud pendiente para ese día. Espere la respuesta del administrador.', 'ok');
      return;
    }

    solicitudDesbloqueoDiasActual = [dia];
    $('solicitud-desbloqueo-sub').textContent = `Día ${dia} — ${areaActual}`;
    $('solicitud-desbloqueo-razon').value = '';
    $('modal-solicitar-desbloqueo').style.display = 'flex';
    $('solicitud-desbloqueo-razon').focus();

  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

async function solicitarDesbloqueoTodos() {
  const dias = (diasPendientesActuales || []).slice().sort((a, b) => a - b);
  if (!dias.length) return;

  try {
    // Evitar duplicar una solicitud múltiple pendiente para la misma área/mes/usuario
    const solRef = window._fb.collection(db, 'solicitudes');
    const q = window._fb.query(
      solRef,
      window._fb.where('correoUsuario', '==', usuario.email),
      window._fb.where('area', '==', areaActual),
      window._fb.where('mes', '==', mesActual),
      window._fb.where('tipo', '==', 'desbloqueo_multiples_dias'),
      window._fb.where('estado', '==', 'pendiente')
    );
    const existentes = await window._fb.getDocs(q);
    if (!existentes.empty) {
      toast('Ya tiene una solicitud de desbloqueo pendiente para varios días. Espere la respuesta del administrador.', 'ok');
      return;
    }

    solicitudDesbloqueoDiasActual = dias;
    $('solicitud-desbloqueo-sub').textContent = `Días ${dias.join(', ')} — ${areaActual}`;
    $('solicitud-desbloqueo-razon').value = '';
    $('modal-solicitar-desbloqueo').style.display = 'flex';
    $('solicitud-desbloqueo-razon').focus();

  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

function cerrarModalSolicitudDesbloqueo() {
  $('modal-solicitar-desbloqueo').style.display = 'none';
  solicitudDesbloqueoDiasActual = null;
}

async function confirmarSolicitudDesbloqueo() {
  const razon = $('solicitud-desbloqueo-razon').value.trim();
  if (!razon) { toast('Contale al administrador el motivo', 'err'); return; }

  const dias = solicitudDesbloqueoDiasActual;
  if (!dias || !dias.length) return;

  try {
    const datosSolicitud = {
      area: areaActual,
      correoUsuario: usuario.email,
      mes: mesActual,
      razon: razon,
      estado: 'pendiente',
      fechaSolicitud: new Date(),
      fechaRespuesta: null,
      respuestaAdmin: null
    };

    if (dias.length === 1) {
      datosSolicitud.tipo = 'desbloqueo_dia';
      datosSolicitud.dia = dias[0];
    } else {
      datosSolicitud.tipo = 'desbloqueo_multiples_dias';
      datosSolicitud.dias = dias;
    }

    await window._fb.addDoc(window._fb.collection(db, 'solicitudes'), datosSolicitud);

    toast(
      dias.length === 1
        ? '✅ Solicitud enviada. El administrador la va a revisar.'
        : `✅ Solicitud enviada para ${dias.length} días. El administrador la va a revisar.`,
      'ok'
    );
    cerrarModalSolicitudDesbloqueo();
  } catch(e) {
    console.error(e);
    toast('❌ Error enviando solicitud: ' + e.message, 'err');
  }
}

function cerrarMenuAccionRapida() {
  const existente = document.getElementById('menu-accion-rapida');
  if (existente) existente.remove();
  document.removeEventListener('click', cerrarMenuAccionRapida);
}

function abrirMenuAccionRapida(idx, btnRef) {
  cerrarMenuAccionRapida();

  const dia = new Date().getDate();
  const menu = document.createElement('div');
  menu.id = 'menu-accion-rapida';
  menu.style.cssText = `
    position:absolute; z-index:2000; background:var(--white); border:1px solid var(--border);
    border-radius:8px; box-shadow:var(--shl); padding:6px; min-width:200px;
  `;

  const titulo = document.createElement('div');
  titulo.style.cssText = 'font-size:10px;font-weight:700;color:var(--txt2);padding:4px 8px;';
  titulo.textContent = `Marcar día ${dia} como:`;
  menu.appendChild(titulo);

  const itemObs = document.createElement('div');
  itemObs.style.cssText = 'padding:6px 8px;font-size:12px;cursor:pointer;border-radius:6px;font-weight:600;color:var(--blue-m);border-bottom:1px solid var(--border);margin-bottom:4px;';
  itemObs.textContent = '✏️ Editar observación...';
  itemObs.addEventListener('mouseover', () => itemObs.style.background = 'var(--blue-l)');
  itemObs.addEventListener('mouseout', () => itemObs.style.background = '');
  itemObs.addEventListener('click', (e) => {
    e.stopPropagation();
    cerrarMenuAccionRapida();
    const agente = novedadesActuales.agentes[idx];
    if (agente) abrirModalEditarNovedad(agente, dia, idx);
  });
  menu.appendChild(itemObs);

  CODIGOS_VALIDOS.forEach(c => {
    const item = document.createElement('div');
    item.style.cssText = 'padding:6px 8px;font-size:12px;cursor:pointer;border-radius:6px;';
    item.textContent = `${c} — ${CODIGOS_DESC[c]}`;
    item.addEventListener('mouseover', () => item.style.background = 'var(--blue-l)');
    item.addEventListener('mouseout', () => item.style.background = '');
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarMenuAccionRapida();
      aplicarCodigoRapido(idx, dia, c);
    });
    menu.appendChild(item);
  });

  document.body.appendChild(menu);
  const rect = btnRef.getBoundingClientRect();
  menu.style.top = `${window.scrollY + rect.bottom + 4}px`;
  menu.style.left = `${window.scrollX + rect.right - menu.offsetWidth}px`;

  setTimeout(() => document.addEventListener('click', cerrarMenuAccionRapida), 0);
}

async function aplicarCodigoRapido(idx, dia, codigo) {
  if (!esAdmin() && !diaAbiertoParaEscritura(dia)) {
    toast(`❌ Ese día está fuera del plazo de registro. ${descripcionVentanaLlenado()} Para días anteriores, solicite desbloqueo.`, 'err');
    return;
  }
  const agente = novedadesActuales.agentes[idx];
  if (!agente) return;

  if (!agente.novedadesPorDia) agente.novedadesPorDia = {};
  agente.novedadesPorDia[String(dia)] = codigo;
  // Solo autocompletar con la descripción del código si aún no hay una observación personalizada
  if (!agente.observaciones) {
    agente.observaciones = CODIGOS_DESC[codigo] || '';
  }
  actualizarDiaCompletado(dia);

  try {
    const novedadesRef = window._fb.doc(db, 'novedades', areaActual, mesActual, 'datos');

    // El día NO se vuelve a bloquear al completarlo: queda abierto mientras esté
    // dentro de la ventana configurada (diaria / semanal / mensual) o mientras
    // siga vigente el desbloqueo otorgado por el administrador.
    const diasDesbloqueados = novedadesActuales.diasDesbloqueados || [];

    await window._fb.updateDoc(novedadesRef, {
      agentes: novedadesActuales.agentes,
      diasNoCompletados: novedadesActuales.diasNoCompletados,
      diasDesbloqueados,
      ultimaModificacion: new Date()
    });
    await registrarEnAuditoria('modificar_novedad', areaActual, usuario.email, dia, mesActual, { codigo }, `Acción rápida: ${agente.apellidosNombres} - Día ${dia} - ${codigo}`);
    renderizarTablaNovedades(new Date().getDate());
    verificarDiasPendientes();
    toast(`✅ Marcado como "${codigo}"`, 'ok');
  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

async function combinarDuplicadosArea() {
  const agentes = novedadesActuales.agentes || [];
  const grupos = agruparAgentesPorIdentidad(agentes);
  const duplicados = grupos.filter(g => g.length > 1);

  if (duplicados.length === 0) {
    toast('No se encontraron duplicados en esta área', 'ok');
    return;
  }

  const resumen = duplicados.map(g => {
    const nombre = (g.find(a => (a.apellidosNombres || '').trim()) || {}).apellidosNombres || '(sin nombre)';
    return `${nombre}: ${g.length} registros`;
  }).join('\n');
  const confirmar = await confirmarAccion(
    `Se van a combinar estos duplicados en un solo registro por agente, uniendo los días que cada uno tenga cargados:\n\n${resumen}\n\n¿Confirma?`,
    'Combinar duplicados'
  );
  if (!confirmar) return;

  try {
    const agentesFinal = grupos.map(grupo => {
      if (grupo.length === 1) return grupo[0];

      // Preferir como base el registro con código numérico válido
      // (cubre el caso de un registro con código/grado invertidos)
      const conCodigoValido = grupo.filter(a => /^\d+$/.test(String(a.codigo || '').trim()));
      const candidatos = conCodigoValido.length ? conCodigoValido : grupo;

      // Entre los candidatos, preferir el que tenga el grado más completo
      const base = candidatos.reduce((mejor, actual) => {
        const gradoActual = String(actual.grado || '').trim();
        const gradoMejor = String(mejor.grado || '').trim();
        if (gradoActual.length !== gradoMejor.length) {
          return gradoActual.length > gradoMejor.length ? actual : mejor;
        }
        return (actual.apellidosNombres || '').length > (mejor.apellidosNombres || '').length ? actual : mejor;
      });

      // Unir los días cargados de todas las copias (el valor no vacío gana)
      const novedadesPorDiaUnidas = {};
      grupo.forEach(g => {
        Object.entries(g.novedadesPorDia || {}).forEach(([dia, val]) => {
          if (val && !novedadesPorDiaUnidas[dia]) novedadesPorDiaUnidas[dia] = val;
        });
      });
      const observacionUnida = grupo.map(g => g.observaciones).find(o => o) || '';

      return {
        codigo: base.codigo,
        grado: base.grado,
        apellidosNombres: base.apellidosNombres,
        novedadesPorDia: novedadesPorDiaUnidas,
        observaciones: observacionUnida
      };
    });

    const novedadesRef = window._fb.doc(db, 'novedades', areaActual, mesActual, 'datos');
    await window._fb.updateDoc(novedadesRef, {
      agentes: agentesFinal,
      ultimaModificacion: new Date()
    });

    await registrarEnAuditoria(
      'combinar_duplicados', areaActual, usuario.email, null, mesActual,
      { antes: agentes.length, despues: agentesFinal.length },
      `Duplicados combinados en ${areaActual}: ${agentes.length} → ${agentesFinal.length} agentes`
    );

    toast(`✅ Combinado: ${agentes.length} registros → ${agentesFinal.length} agentes`, 'ok');
    cargarNovedadesActuales();

  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

let diasPendientesActuales = [];

function verificarDiasPendientes() {
  const diaHoy = new Date().getDate();
  const diasSinCompletar = [];
  
  if (novedadesActuales.diasNoCompletados) {
    for (let dia = 1; dia < diaHoy; dia++) {
      if (novedadesActuales.diasNoCompletados.includes(dia)) {
        diasSinCompletar.push(dia);
      }
    }
  }
  
  diasPendientesActuales = diasSinCompletar;
  const btnTodos = $('btn-solicitar-desbloqueo-todos');

  if (diasSinCompletar.length > 0) {
    show('info-dias-pendientes');
    $('info-pendientes-txt').textContent = `⚠️ Días sin completar: ${diasSinCompletar.join(', ')}`;
    if (btnTodos) {
      btnTodos.style.display = '';
      const txtBtn = $('txt-btn-solicitar-desbloqueo-todos');
      if (txtBtn) txtBtn.textContent = `Solicitar desbloqueo (${diasSinCompletar.length} días)`;
    }
  } else {
    hide('info-dias-pendientes');
    if (btnTodos) btnTodos.style.display = 'none';
  }
}

/* ═════════════════════════════════════════
   MODAL: Editar Novedad
═════════════════════════════════════════ */

let _resolveConfirmacion = null;
let _confirmacionTextoEsperado = null;

function confirmarAccion(mensaje, titulo = 'Confirmar') {
  return new Promise((resolve) => {
    _resolveConfirmacion = resolve;
    _confirmacionTextoEsperado = null;
    hide('confirmacion-generica-input-wrap');
    $('confirmacion-generica-titulo').textContent = titulo;
    $('confirmacion-generica-mensaje').textContent = mensaje;
    $('modal-confirmacion-generica').style.display = 'flex';
  });
}

function confirmarConTexto(mensaje, textoEsperado, titulo = 'Confirmar') {
  return new Promise((resolve) => {
    _resolveConfirmacion = resolve;
    _confirmacionTextoEsperado = textoEsperado;
    $('confirmacion-generica-input').value = '';
    show('confirmacion-generica-input-wrap');
    $('confirmacion-generica-input-wrap').style.display = 'flex';
    $('confirmacion-generica-titulo').textContent = titulo;
    $('confirmacion-generica-mensaje').textContent = mensaje;
    $('modal-confirmacion-generica').style.display = 'flex';
    setTimeout(() => $('confirmacion-generica-input')?.focus(), 50);
  });
}

function intentarConfirmarGenerico() {
  if (_confirmacionTextoEsperado !== null) {
    const val = $('confirmacion-generica-input').value.trim();
    if (val !== _confirmacionTextoEsperado) {
      toast(`Debe escribir exactamente: ${_confirmacionTextoEsperado}`, 'err');
      return;
    }
  }
  responderConfirmacion(true);
}

function responderConfirmacion(valor) {
  $('modal-confirmacion-generica').style.display = 'none';
  _confirmacionTextoEsperado = null;
  if (_resolveConfirmacion) { _resolveConfirmacion(valor); _resolveConfirmacion = null; }
}

let modalAgenteEdicion = null;
let modalDiaEdicion = null;
let modalDiasEdicion = null;  // arreglo de días cuando se edita un rango sombreado (uno o más)
let modalIdxEdicion = null;
let modalEsEdicionDeCierre = false;
let resumenGeneralCache = null;

function poblarSelectCodigos(select) {
  if (select.dataset.poblado === '1') return;
  CODIGOS_VALIDOS.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = `${c} — ${CODIGOS_DESC[c]}`;
    select.appendChild(opt);
  });
  select.dataset.poblado = '1';
}

function actualizarObsSegunCodigo() {
  const codigo = $('modal-novedad-codigo').value;
  const obs = $('modal-novedad-obs');
  // No borra lo que el usuario ya escribió o lo que venía cargado — solo
  // sugiere la descripción por defecto cuando el campo está vacío.
  if (obs.value.trim()) return;
  obs.value = codigo ? (CODIGOS_DESC[codigo] || '') : '';
}

function abrirModalEditarNovedad(agente, dia, idx) {
  abrirModalEditarNovedadDias(agente, [dia], idx);
}

// dias: uno o más días del MISMO agente (sombreado horizontal). Con varios,
// el código y la observación elegidos se aplican a todos a la vez.
function abrirModalEditarNovedadDias(agente, dias, idx) {
  const diasOrd = [...dias].sort((a, b) => a - b);

  modalAgenteEdicion = agente;
  modalDiasEdicion = diasOrd;
  modalDiaEdicion = diasOrd[0]; // se mantiene por compatibilidad con el flujo de mes cerrado (siempre 1 día)
  modalIdxEdicion = idx;
  modalEsEdicionDeCierre = false;

  const modal = $('modal-editar-novedad');
  const sub = $('modal-novedad-sub');
  const codigo = $('modal-novedad-codigo');
  const obs = $('modal-novedad-obs');

  poblarSelectCodigos(codigo);

  sub.textContent = diasOrd.length > 1
    ? `Días ${diasOrd[0]} a ${diasOrd[diasOrd.length - 1]} (${diasOrd.length} días) — ${agente.apellidosNombres}`
    : `Día ${diasOrd[0]} — ${agente.apellidosNombres}`;

  if (diasOrd.length === 1) {
    codigo.value = (agente.novedadesPorDia && agente.novedadesPorDia[String(diasOrd[0])]) || '';
    obs.value = agente.observaciones || (codigo.value ? (CODIGOS_DESC[codigo.value] || '') : '');
  } else {
    // Con varios días a la vez puede haber códigos distintos entre ellos —
    // arranca vacío en vez de precargar el de uno solo.
    codigo.value = '';
    obs.value = '';
  }

  hide('modal-novedad-error');

  modal.style.display = 'flex';
  codigo.focus();
}

function cerrarModalNovedad() {
  $('modal-editar-novedad').style.display = 'none';
  hide('modal-novedad-error');
  modalAgenteEdicion = null;
  modalDiaEdicion = null;
  modalDiasEdicion = null;
  modalIdxEdicion = null;
}

function actualizarDiaCompletado(dia) {
  const todosCompletos = (novedadesActuales.agentes || []).length > 0 &&
    novedadesActuales.agentes.every(a => a.novedadesPorDia && a.novedadesPorDia[String(dia)]);
  if (!novedadesActuales.diasNoCompletados) novedadesActuales.diasNoCompletados = [];
  if (todosCompletos) {
    novedadesActuales.diasNoCompletados = novedadesActuales.diasNoCompletados.filter(d => d !== dia);
  } else if (!novedadesActuales.diasNoCompletados.includes(dia)) {
    novedadesActuales.diasNoCompletados.push(dia);
  }
}

async function guardarNovedad() {
  if (!modalAgenteEdicion) return;
  
  const codigo = $('modal-novedad-codigo').value.trim();
  
  if (!codigo) {
    mostrarErrorCodigo('Elegí una nomenclatura de la lista');
    return;
  }
  
  // Normalizar y validar
  const codigoNorm = normalizarCodigo(codigo);
  
  if (!validarCodigo(codigoNorm)) {
    mostrarErrorCodigo(`"${codigo}" no es un código válido`);
    return;
  }
  
  const obs = $('modal-novedad-obs').value.trim() || CODIGOS_DESC[codigoNorm] || '';
  const diasAEditar = (modalDiasEdicion && modalDiasEdicion.length) ? modalDiasEdicion : [modalDiaEdicion];
  const descDias = diasAEditar.length > 1
    ? `Días ${diasAEditar[0]}-${diasAEditar[diasAEditar.length - 1]} (${diasAEditar.length} días)`
    : `Día ${diasAEditar[0]}`;

  // Mes anterior: el plazo se vuelve a comprobar al guardar (por si se pasó la hora)
  if (modalEsEdicionDeCierre) {
    const abiertosAhora = cierreMesData ? diasAbiertosEnCierre(cierreMesData.data, cierreMesData.periodo) : null;
    if (!abiertosAhora || diasAEditar.some(d => !abiertosAhora.has(d))) {
      toast('❌ El plazo para modificar el mes anterior ya terminó. Comuníquese con el administrador.', 'err');
      cerrarModalNovedad();
      modalEsEdicionDeCierre = false;
      if (cierreMesData) {
        renderizarTablaSoloLectura($('tabla-cierre-mes'), cierreMesData.data, cierreMesData.periodo);
        actualizarEstadoPendientesCierre();
      }
      return;
    }
  }

  // Actualizar en memoria
  if (!modalAgenteEdicion.novedadesPorDia) {
    modalAgenteEdicion.novedadesPorDia = {};
  }
  diasAEditar.forEach(d => { modalAgenteEdicion.novedadesPorDia[String(d)] = codigoNorm; });
  modalAgenteEdicion.observaciones = obs;

  // Guardar en Firestore
  try {
    if (modalEsEdicionDeCierre && cierreMesData) {
      // Edición (uno o varios días) del mes anterior mientras su informe está pendiente,
      // o de días reabiertos por el administrador: se guarda en el documento de ESE
      // período (no en el actual).
      const { area, periodo, data } = cierreMesData;
      const diasDesbloqueados = data.diasDesbloqueados || [];

      const novedadesRef = window._fb.doc(db, 'novedades', area, periodo, 'datos');
      await window._fb.updateDoc(novedadesRef, {
        agentes: data.agentes,
        diasDesbloqueados,
        ultimaModificacion: new Date()
      });
      data.diasDesbloqueados = diasDesbloqueados;

      await registrarEnAuditoria(
        'modificar_novedad_mes_cerrado', area, usuario.email, diasAEditar.length === 1 ? diasAEditar[0] : null, periodo,
        { codigo: codigoNorm, observaciones: obs, dias: diasAEditar },
        `Corrección en mes anterior: ${modalAgenteEdicion.apellidosNombres} - ${descDias} - ${codigoNorm}`
      );

      toast('✅ Corrección guardada', 'ok');
      cerrarModalNovedad();
      modalEsEdicionDeCierre = false;
      renderizarTablaSoloLectura($('tabla-cierre-mes'), data, periodo);
      actualizarEstadoPendientesCierre();
      return;
    }

    diasAEditar.forEach(d => actualizarDiaCompletado(d));
    const novedadesRef = window._fb.doc(db, 'novedades', areaActual, mesActual, 'datos');

    // El día NO se vuelve a bloquear al completarlo: queda abierto mientras esté
    // dentro de la ventana configurada (diaria / semanal / mensual) o mientras
    // siga vigente el desbloqueo otorgado por el administrador.
    const diasDesbloqueados = novedadesActuales.diasDesbloqueados || [];

    await window._fb.updateDoc(novedadesRef, {
      agentes: novedadesActuales.agentes,
      diasNoCompletados: novedadesActuales.diasNoCompletados,
      diasDesbloqueados,
      ultimaModificacion: new Date()
    });
    
    // Log auditoría — una sola entrada consolidada aunque hayan sido varios días
    await registrarEnAuditoria(
      'modificar_novedad',
      areaActual,
      usuario.email,
      diasAEditar.length === 1 ? diasAEditar[0] : null,
      mesActual,
      { codigo: codigoNorm, observaciones: obs, dias: diasAEditar },
      `Modificación: ${modalAgenteEdicion.apellidosNombres} - ${descDias} - ${codigoNorm}`
    );
    
    // Actualizar tabla
    renderizarTablaNovedades(new Date().getDate());
    verificarDiasPendientes();
    
    toast(diasAEditar.length > 1 ? `✅ Novedad guardada en ${diasAEditar.length} días` : '✅ Novedad guardada', 'ok');
    cerrarModalNovedad();
    
  } catch(e) {
    console.error('Error guardando:', e);
    mostrarErrorCodigo('Error guardando: ' + e.message);
  }
}

function mostrarErrorCodigo(msg) {
  const error = $('modal-novedad-error');
  error.textContent = msg;
  show('modal-novedad-error');
}

function cerrarErrorCodigo() {
  $('modal-error-codigo').style.display = 'none';
}

/* ═════════════════════════════════════════
   ACCIONES: Llenar S/N, Exportar
═════════════════════════════════════════ */

async function llenarSinNovedadDia(dia) {
  try {
    // Llenar todos los agentes con S/N para el día indicado
    if (novedadesActuales.agentes) {
      novedadesActuales.agentes.forEach(agente => {
        if (!agente.novedadesPorDia) agente.novedadesPorDia = {};
        agente.novedadesPorDia[String(dia)] = 'S/N';
        agente.observaciones = CODIGOS_DESC['S/N'];
      });
    }
    actualizarDiaCompletado(dia);

    // El día NO se vuelve a bloquear al completarlo: queda abierto mientras esté
    // dentro de la ventana configurada (diaria / semanal / mensual) o mientras
    // siga vigente el desbloqueo otorgado por el administrador.
    const diasDesbloqueados = novedadesActuales.diasDesbloqueados || [];

    // Guardar en Firestore
    const novedadesRef = window._fb.doc(db, 'novedades', areaActual, mesActual, 'datos');
    await window._fb.updateDoc(novedadesRef, {
      agentes: novedadesActuales.agentes,
      diasNoCompletados: novedadesActuales.diasNoCompletados,
      diasDesbloqueados,
      ultimaModificacion: new Date()
    });

    // Log
    await registrarEnAuditoria(
      'rellenar_sin_novedad',
      areaActual,
      usuario.email,
      dia,
      mesActual,
      { cantidadAgentes: novedadesActuales.agentes.length },
      `Auto-relleno S/N: ${novedadesActuales.agentes.length} agentes - Día ${dia}`
    );

    renderizarTablaNovedades(new Date().getDate());
    toast(`✅ Se llenó "Sin Novedad" para todos los agentes del día ${dia}`, 'ok');

  } catch(e) {
    console.error('Error:', e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

async function llenarSinNovedadHoy() {
  const hoy = new Date().getDate();
  await llenarSinNovedadDia(hoy);
}


/* ══════════════════════════════════════════════════════════════
   LLENAR EL MES COMPLETO (solo administrador)
   Aplica un código a TODOS los efectivos del área abierta, pero solo en
   las casillas que están VACÍAS: lo que un secretario ya registró no se toca.
   Se puede acotar con "desde / hasta" (útil si hubo traslados a mitad de
   mes, porque los días de la otra área también quedan vacíos).
══════════════════════════════════════════════════════════════ */
let mlEfectivos = [];          // efectivos del área abierta: { key, texto, idx }
let mlSeleccion = new Set();   // claves de los efectivos marcados

// Clave estable de un efectivo (no depende del orden de la lista)
function mlClave(a) { return `${_normCodigoAgente(a.codigo)}|${String(a.apellidosNombres || '').trim()}`; }

function mlRango() {
  const total = diasEnMes(mesActual);
  const desde = parseInt($('ml-desde').value, 10), hasta = parseInt($('ml-hasta').value, 10);
  const valido = Number.isInteger(desde) && Number.isInteger(hasta) && desde >= 1 && hasta <= total && desde <= hasta;
  return { desde, hasta, total, valido };
}

// Cuenta cuántas casillas vacías hay en el rango (sin modificar nada)
function mlContarVacios(desde, hasta) {
  let casillas = 0;
  const conVacios = new Set();
  let seleccionados = 0;
  (novedadesActuales.agentes || []).forEach((ag, i) => {
    if (!mlSeleccion.has(mlClave(ag))) return;
    seleccionados++;
    const dias = ag.novedadesPorDia || {};
    for (let d = desde; d <= hasta; d++) {
      if (!dias[String(d)]) { casillas++; conVacios.add(i); }
    }
  });
  return { casillas, efectivos: conVacios.size, seleccionados, totalEfectivos: (novedadesActuales.agentes || []).length };
}

function mlVaciasDeEfectivo(ag, desde, hasta) {
  const dias = ag.novedadesPorDia || {};
  let n = 0;
  for (let d = desde; d <= hasta; d++) if (!dias[String(d)]) n++;
  return n;
}

function mlPintarResumenEfectivos() {
  const el = $('ml-efectivos-res');
  if (!el) return;
  const sel = mlSeleccion.size, tot = mlEfectivos.length;
  el.textContent = sel === tot ? `Se aplicará a todos los efectivos (${tot})` : `Se aplicará a ${sel} de ${tot} efectivos (${tot - sel} sin marcar)`;
}

function mlRenderEfectivos(r) {
  const cont = $('ml-efectivos');
  if (!cont) return;
  cont.innerHTML = mlEfectivos.map((e, i) => {
    const vac = mlVaciasDeEfectivo(novedadesActuales.agentes[e.idx], r.desde, r.hasta);
    return `<label class="ml-ef"><input type="checkbox" ${mlSeleccion.has(e.key) ? 'checked' : ''} onchange="mlToggle(${i}, this.checked)">` +
           `<span class="ml-ef-nom">${mantEsc(e.texto)}</span><span class="ml-ef-vac">${vac} vacía${vac === 1 ? '' : 's'}</span></label>`;
  }).join('');
}

function mlToggle(i, marcado) {
  const e = mlEfectivos[i];
  if (!e) return;
  if (marcado) mlSeleccion.add(e.key); else mlSeleccion.delete(e.key);
  mlActualizarResumen(false);
}

function mlMarcarTodos(marcar) {
  mlSeleccion = new Set(marcar ? mlEfectivos.map(e => e.key) : []);
  mlActualizarResumen(true);
}

function mlActualizarResumen(redibujar = true) {
  const res = $('ml-resumen'), btn = $('btn-ml-aplicar');
  if (!res || !btn) return;
  const r = mlRango();
  mlPintarResumenEfectivos();
  if (!r.valido) {
    res.className = 'ml-resumen ml-resumen-err';
    res.textContent = `Revise los días: deben estar entre 1 y ${r.total}, y "desde" no puede ser mayor que "hasta".`;
    btn.disabled = true; btn.textContent = 'Llenar casillas vacías';
    return;
  }
  if (redibujar) mlRenderEfectivos(r);
  if (mlSeleccion.size === 0) {
    res.className = 'ml-resumen ml-resumen-err';
    res.textContent = 'Marque al menos un efectivo en la lista para poder llenar casillas.';
    btn.disabled = true; btn.textContent = 'Llenar casillas vacías';
    return;
  }
  const c = mlContarVacios(r.desde, r.hasta);
  const cod = $('ml-codigo').value;
  if (c.casillas === 0) {
    res.className = 'ml-resumen ml-resumen-err';
    res.textContent = 'No hay casillas vacías en ese rango para los efectivos marcados: todo ya está registrado.';
    btn.disabled = true; btn.textContent = 'Llenar casillas vacías';
    return;
  }
  const omitidos = c.totalEfectivos - c.seleccionados;
  res.className = 'ml-resumen';
  res.innerHTML = `Se pondrá <b>${mantEsc(cod)}</b> en <b>${c.casillas}</b> casilla${c.casillas === 1 ? '' : 's'} vacía${c.casillas === 1 ? '' : 's'} ` +
    `de <b>${c.efectivos}</b> efectivo${c.efectivos === 1 ? '' : 's'}, del día ${r.desde} al ${r.hasta}. ` +
    (omitidos ? `No se tocarán los <b>${omitidos}</b> efectivo${omitidos === 1 ? '' : 's'} sin marcar. ` : '') +
    `Lo ya registrado no se modifica.`;
  btn.disabled = false;
  btn.textContent = `Llenar ${c.casillas} casilla${c.casillas === 1 ? '' : 's'}`;
}

function mlAtajo(tipo) {
  const total = diasEnMes(mesActual);
  $('ml-desde').value = 1;
  if (tipo === 'hoy') {
    const hoy = new Date();
    const [a, m] = mesActual.split('-').map(Number);
    $('ml-hasta').value = (hoy.getFullYear() === a && hoy.getMonth() + 1 === m) ? hoy.getDate() : total;
  } else {
    $('ml-hasta').value = total;
  }
  mlActualizarResumen();
}

function abrirModalLlenarMes() {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }
  if (!areaActual || !novedadesActuales || !Array.isArray(novedadesActuales.agentes) || !novedadesActuales.agentes.length) {
    toast('Primero abra un área que tenga efectivos cargados.', 'err');
    return;
  }
  const sel = $('ml-codigo');
  if (!sel.options.length) {
    sel.innerHTML = CODIGOS_VALIDOS.map(c => `<option value="${c}">${c} — ${mantEsc(CODIGOS_DESC[c] || '')}</option>`).join('');
  }
  sel.value = 'S/N';
  const [a, m] = mesActual.split('-');
  $('ml-area').textContent = areaActual;
  $('ml-mes').textContent = `${obtenerNombreMes(m)} ${a}`;
  const aviso = $('ml-aviso');
  const cerrado = novedadesActuales.estado === 'cerrado';
  aviso.style.display = cerrado ? 'block' : 'none';
  aviso.textContent = cerrado ? 'Este mes ya tiene el informe generado: los cambios no modifican los archivos que ya se enviaron.' : '';
  mlEfectivos = (novedadesActuales.agentes || []).map((a, idx) => ({
    key: mlClave(a), idx,
    texto: `${a.grado ? a.grado + ' · ' : ''}${a.codigo ? a.codigo + ' · ' : ''}${a.apellidosNombres || '(sin nombre)'}`
  }));
  mlSeleccion = new Set(mlEfectivos.map(e => e.key));
  const det = $('ml-ef-det'); if (det) det.open = false;
  mlAtajo('mes');
  $('modal-llenar-mes').style.display = 'flex';
}

function cerrarModalLlenarMes() { $('modal-llenar-mes').style.display = 'none'; }

async function llenarMesCompleto() {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }
  const r = mlRango();
  if (!r.valido) { mlActualizarResumen(); return; }
  const codigo = $('ml-codigo').value;
  if (!CODIGOS_VALIDOS.includes(codigo)) { toast('Elija un código válido.', 'err'); return; }
  const btn = $('btn-ml-aplicar');
  btn.disabled = true; btn.textContent = 'Guardando...';
  try {
    // Se vuelve a leer el documento justo antes de escribir, para no pisar lo que
    // un secretario haya registrado mientras esta ventana estaba abierta.
    const ref = window._fb.doc(db, 'novedades', areaActual, mesActual, 'datos');
    const fresco = await window._fb.getDoc(ref);
    if (fresco.exists()) {
      const d = fresco.data();
      novedadesActuales.agentes = d.agentes || novedadesActuales.agentes;
      novedadesActuales.diasNoCompletados = d.diasNoCompletados || [];
      novedadesActuales.diasDesbloqueados = d.diasDesbloqueados || [];
    }
    let casillas = 0;
    const efectivos = new Set();
    const omitidos = novedadesActuales.agentes.filter(ag => !mlSeleccion.has(mlClave(ag))).length;
    novedadesActuales.agentes.forEach((ag, i) => {
      if (!mlSeleccion.has(mlClave(ag))) return;       // efectivos sin marcar: no se tocan
      if (!ag.novedadesPorDia) ag.novedadesPorDia = {};
      let tocado = false;
      for (let d = r.desde; d <= r.hasta; d++) {
        if (!ag.novedadesPorDia[String(d)]) { ag.novedadesPorDia[String(d)] = codigo; casillas++; tocado = true; }
      }
      if (tocado) {
        efectivos.add(i);
        if (!ag.observaciones) ag.observaciones = CODIGOS_DESC[codigo] || '';
      }
    });
    if (!casillas) { toast('No había casillas vacías: alguien ya las había llenado.', 'err'); mlActualizarResumen(); return; }
    for (let d = r.desde; d <= r.hasta; d++) actualizarDiaCompletado(d);

    await window._fb.updateDoc(ref, {
      agentes: novedadesActuales.agentes,
      diasNoCompletados: novedadesActuales.diasNoCompletados,
      diasDesbloqueados: novedadesActuales.diasDesbloqueados || [],
      ultimaModificacion: new Date()
    });
    await registrarEnAuditoria(
      'llenar_mes_completo', areaActual, usuario.email, null, mesActual,
      { codigo, desde: r.desde, hasta: r.hasta, casillas, efectivos: efectivos.size, efectivosOmitidos: omitidos },
      `Llenado de mes por el administrador: ${codigo} en ${casillas} casillas vacías (${efectivos.size} efectivos), días ${r.desde} al ${r.hasta}` + (omitidos ? ` · ${omitidos} efectivo(s) sin marcar` : '')
    );
    cerrarModalLlenarMes();
    renderizarTablaNovedades(new Date().getDate());
    verificarDiasPendientes();
    toast(`✅ Se puso "${codigo}" en ${casillas} casillas vacías (${efectivos.size} efectivos).`, 'ok');
  } catch (e) {
    console.error('Error llenando el mes:', e);
    toast('❌ Error: ' + e.message, 'err');
    mlActualizarResumen();
  }
}

window.abrirModalLlenarMes   = abrirModalLlenarMes;
window.cerrarModalLlenarMes  = cerrarModalLlenarMes;
window.mlActualizarResumen   = mlActualizarResumen;
window.mlAtajo               = mlAtajo;
window.mlToggle              = mlToggle;
window.mlMarcarTodos         = mlMarcarTodos;
window.llenarMesCompleto     = llenarMesCompleto;

async function seleccionarDiaColumna(dia) {
  const bloqueado = !diaAbiertoParaEscritura(dia);
  if (bloqueado && !esAdmin()) {
    toast(`❌ Ese día está fuera del plazo de registro. ${descripcionVentanaLlenado()}`, 'err');
    return;
  }

  const mensaje = bloqueado
    ? `⚠️ Este día está bloqueado para los usuarios — solo usted, como administrador, puede sobrescribirlo.\n\n¿Marcar "Sin Novedad" (S/N) para todos los agentes en el día ${dia}? Esto sobrescribe lo que ya esté cargado ese día.`
    : `¿Marcar "Sin Novedad" (S/N) para todos los agentes en el día ${dia}? Esto sobrescribe lo que ya esté cargado ese día.`;

  const confirmar = await confirmarAccion(mensaje, `Día ${dia}${bloqueado ? ' — BLOQUEADO' : ''}`);
  if (!confirmar) return;
  await llenarSinNovedadDia(dia);
}

function diasEnMes(periodo) {
  const [anio, mes] = periodo.split('-').map(Number);
  return new Date(anio, mes, 0).getDate();
}

/* ═════════════════════════════════════════
   CIERRE DE MES — pantalla de solo lectura
═════════════════════════════════════════ */

let cierreMesData = null; // { area, periodo, data }
let timerPlazoCierre = null; // cierra la edición del mes anterior a medianoche si la pestaña sigue abierta

function mostrarCierreMes(area, periodo, data, bloqueante = true, cfg = null) {
  const yaCerrado = data && data.estado === 'cerrado';
  const intentosUsados = intentosUsadosDeReporte(data);
  const intentosRestantes = intentosRestantesDeReporte(data, periodo);
  // Cerrado con intentos sin gastar, pero fuera de plazo: el contador quedó en cero
  const plazoReporteVencido = yaCerrado && intentosRestantes === 0 && intentosUsados < MAX_INTENTOS_REPORTE;
  cierreMesData = { area, periodo, data, bloqueante, yaCerrado, intentosUsados, intentosRestantes };
  const enProrroga = !!(data && data.prorroga && data.prorroga.activa);
  const plazoVigente = plazoLlenadoMesAnteriorVigente(periodo);

  const cont = $('cierre-mes-container');
  hide('tabla-cargando');
  show('cierre-mes-container');
  cont.style.display = 'block';

  if (bloqueante) {
    // Modo clásico: el área no puede registrar nada del mes en curso hasta cerrar
    hide('tabla-novedades-container');
    hide('novedades-top-controles');
    cont.style.borderColor = 'var(--blue-m)';
  } else {
    // Modo aviso: el mes en curso sigue disponible más abajo. El informe está
    // habilitado por si el secretario ya lo tiene listo, pero nada lo obliga
    // todavía — el bloqueo llega recién el día configurado.
    show('tabla-novedades-container');
    show('novedades-top-controles');
    cont.style.borderColor = 'var(--gold, #e8b84b)';
  }

  $('cierre-mes-nombre').textContent =
    `${obtenerNombreMes(periodo.split('-')[1])} ${periodo.split('-')[0]} — ${area}`;

  // Título y texto explicativo según el modo
  const tituloEl = $('cierre-mes-titulo-icono');
  if (tituloEl) {
    tituloEl.textContent = yaCerrado
      ? (intentosRestantes > 0 ? '📄 Reporte ya generado' : (plazoReporteVencido ? '⏰ Plazo de generación terminado' : '🚫 Límite de generación alcanzado'))
      : (enProrroga ? '📝 Prórroga de cierre habilitada' : (bloqueante ? '🔒 Cierre de mes' : '📄 Informe pendiente'));
  }

  const textoEl = $('cierre-mes-texto');
  if (textoEl) {
    if (yaCerrado) {
      if (intentosRestantes > 0) {
        textoEl.textContent = `El informe de ${obtenerNombreMes(periodo.split('-')[1])} ${periodo.split('-')[0]} ya fue generado. Si necesita volver a descargarlo, dispone de ${intentosRestantes} ${intentosRestantes === 1 ? 'intento adicional' : 'intentos adicionales'} de generación${plazoReporteVigente(data, periodo) ? ', y solo hasta las 23:59 de hoy' : ''}. Mientras tanto, siga registrando el mes en curso con normalidad, más abajo.`;
      } else {
        textoEl.textContent = plazoReporteVencido
          ? 'El plazo para volver a generar este informe terminó. Por favor, comuníquese con soporte técnico para continuar.'
          : 'Ha alcanzado el máximo de intentos permitidos para generar este informe. Por favor, comuníquese con soporte técnico para continuar.';
      }
    } else if (enProrroga) {
      textoEl.textContent = 'El administrador habilitó una prórroga para completar el mes anterior. Edite los días pendientes en la tabla (clic en una celda), luego indique "Elaborado por" y "Responsable" y genere el informe completo. Mientras tanto puede seguir registrando el mes en curso con normalidad, más abajo.';
    } else if (bloqueante) {
      textoEl.textContent = plazoVigente
        ? 'Debe completar y generar el informe del mes anterior para continuar registrando el mes en curso. Puede editar cualquier día del mes anterior en la tabla de abajo hasta las 23:59 de hoy; después ya no podrá corregir novedades.'
        : 'Debe generar el informe del mes anterior para continuar registrando el mes en curso. El plazo para corregir novedades del mes anterior ya terminó.';
    } else {
      const diaBloqueo = cfg ? cfg.diaBloqueo : null;
      const diaHoy = new Date().getDate();
      const restantes = diaBloqueo ? (diaBloqueo - diaHoy) : null;
      let plazo = '';
      if (diaBloqueo) {
        if (restantes > 1)       plazo = ` Tiene plazo hasta el día ${diaBloqueo} de este mes (faltan ${restantes} días).`;
        else if (restantes === 1) plazo = ` Tiene plazo hasta el día ${diaBloqueo} de este mes (falta 1 día).`;
        else                      plazo = ` El plazo vence hoy, día ${diaBloqueo}.`;
      }
      textoEl.textContent = `El informe del mes anterior ya está habilitado: puede generarlo ahora si ya lo tiene listo.${plazo} Mientras tanto, siga registrando el mes en curso con normalidad, más abajo.${plazoVigente ? ' Puede completar los días pendientes del mes anterior en «Ver detalle» solo hasta las 23:59 de hoy.' : ''}`;
    }
  }

  // La tabla de solo lectura del mes anterior se muestra desplegada solo cuando
  // el cierre es obligatorio; en modo aviso queda colapsada para no estorbar.
  const wrapTabla = $('cierre-mes-tabla-wrap');
  const btnVer    = $('btn-ver-detalle-cierre');
  // Si hay días sin completar, la tabla se despliega sola para poder llenarlos
  const hayPendientesCierre = !yaCerrado && !(esAdmin() || esSupervisor()) && diasSinCompletarEnMes(data, periodo).length > 0;
  const verTabla = bloqueante || enProrroga || hayPendientesCierre;
  if (wrapTabla) wrapTabla.style.display = verTabla ? 'block' : 'none';
  if (btnVer) {
    btnVer.style.display = verTabla ? 'none' : 'inline-flex';
    btnVer.textContent = '👁️ Ver detalle del mes anterior';
  }

  renderizarTablaSoloLectura($('tabla-cierre-mes'), data, periodo);

  hide('cierre-mes-aviso-usuario');
  show('cierre-mes-form-admin');
  $('cierre-mes-form-admin').style.display = 'block';
  $('cierre-elaborado-por').value = data.elaboradoPor || '';
  $('cierre-responsable').value = data.responsable || '';
  cargarListaPersonalParaCierre();

  // Estado del botón principal y del aviso de intentos cuando el informe
  // de este mes ya fue generado (regeneración, no un cierre nuevo).
  const avisoIntentos = $('cierre-mes-intentos-aviso');
  const descForm       = $('cierre-mes-form-admin-desc');
  const btnPrincipal    = $('cierre-mes-btn-principal');
  const btnPrincipalTxt = $('cierre-mes-btn-principal-txt');

  if (yaCerrado) {
    if (descForm) descForm.style.display = 'none';
    if (avisoIntentos) {
      avisoIntentos.style.display = 'block';
      if (intentosRestantes > 0) {
        const num = intentosUsados + 1;
        const esUltimo = intentosRestantes === 1;
        avisoIntentos.style.background = esUltimo ? 'var(--red-soft, #fde2e2)' : 'var(--gold-soft, #fdf3d8)';
        avisoIntentos.style.color      = esUltimo ? 'var(--red, #b42318)' : 'var(--gold-dark, #8a6512)';
        avisoIntentos.textContent = esUltimo
          ? 'Este es su último intento disponible para generar el reporte de este mes.'
          : (intentosUsados === 0
              ? `Dispone de ${intentosRestantes} intentos de generación.`
              : `Este es su intento ${num} de generación. Dispone de ${intentosRestantes} ${intentosRestantes === 1 ? 'intento adicional' : 'intentos adicionales'}.`);
      } else {
        avisoIntentos.style.background = 'var(--red-soft, #fde2e2)';
        avisoIntentos.style.color      = 'var(--red, #b42318)';
        avisoIntentos.textContent = plazoReporteVencido
          ? 'El plazo para volver a generar el reporte terminó. Por favor, comuníquese con soporte técnico para continuar.'
          : 'Ha alcanzado el máximo de intentos permitidos. Por favor, comuníquese con soporte técnico para continuar.';
      }
    }
    if (btnPrincipalTxt) btnPrincipalTxt.textContent = 'Volver a generar reporte (Excel + PDF)';
    if (btnPrincipal) {
      const agotado = intentosRestantes <= 0;
      btnPrincipal.disabled = agotado;
      btnPrincipal.style.opacity = agotado ? '0.5' : '';
      btnPrincipal.style.cursor = agotado ? 'not-allowed' : '';
    }
    // "Elaborado por" y "Responsable" quedan fijos al cierre original: una
    // regeneración entrega el mismo informe, no abre un cierre nuevo.
    $('cierre-elaborado-por').style.pointerEvents = 'none';
    $('cierre-elaborado-por').style.opacity = '0.7';
    $('cierre-responsable').style.pointerEvents = 'none';
    $('cierre-responsable').style.opacity = '0.7';
  } else {
    if (descForm) descForm.style.display = 'block';
    if (avisoIntentos) avisoIntentos.style.display = 'none';
    if (btnPrincipalTxt) btnPrincipalTxt.textContent = 'Cerrar mes y exportar (Excel + PDF)';
    if (btnPrincipal) { btnPrincipal.disabled = false; btnPrincipal.style.opacity = ''; btnPrincipal.style.cursor = ''; }
    $('cierre-elaborado-por').style.pointerEvents = '';
    $('cierre-elaborado-por').style.opacity = '';
    $('cierre-responsable').style.pointerEvents = '';
    $('cierre-responsable').style.opacity = '';
  }

  // Si la pestaña sigue abierta pasada la medianoche, el mes anterior deja de verse solo
  clearTimeout(timerPlazoCierre);
  if (!esAdmin() && !enProrroga && (yaCerrado ? plazoReporteVigente(data, periodo) : plazoVigente)) {
    const ahora = new Date();
    const medianoche = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 0, 0, 1);
    timerPlazoCierre = setTimeout(() => {
      if (!cierreMesData) return;
      toast(cierreMesData.yaCerrado
        ? '⏰ Terminó el plazo para volver a generar el reporte'
        : '⏰ Terminó el plazo para completar el mes anterior', 'err');
      cargarNovedadesActuales(); // vuelve a evaluar: desde el día 2 solo queda el mes en curso
    }, medianoche - ahora);
  }

  actualizarEstadoPendientesCierre();
}

// Muestra u oculta la tabla del mes anterior cuando el cierre está en modo aviso
function alternarDetalleCierre() {
  const wrap = $('cierre-mes-tabla-wrap');
  const btn  = $('btn-ver-detalle-cierre');
  if (!wrap) return;
  const visible = wrap.style.display !== 'none';
  wrap.style.display = visible ? 'none' : 'block';
  if (btn) btn.textContent = visible ? '👁️ Ver detalle del mes anterior' : '🙈 Ocultar detalle del mes anterior';
}

let personalListaCache = null; // caché en memoria de sistema/personal_lis
let selectorPersonaTargetId = null; // en qué input escribir la persona elegida

async function cargarListaPersonalParaCierre() {
  await obtenerListaPersonal(); // solo precarga el caché
}

async function obtenerListaPersonal() {
  if (personalListaCache) return personalListaCache;
  try {
    const ref = window._fb.doc(db, 'sistema', 'personal_lis');
    const snap = await window._fb.getDoc(ref);
    personalListaCache = (snap.exists() && snap.data().lista) ? snap.data().lista : [];
  } catch(e) {
    console.warn('No se pudo cargar la lista de personal:', e);
    personalListaCache = [];
  }
  return personalListaCache;
}

async function abrirSelectorPersona(targetInputId) {
  selectorPersonaTargetId = targetInputId;
  await obtenerListaPersonal();
  $('buscador-persona').value = '';
  renderizarListaPersonal(personalListaCache.slice(0, 50));
  $('modal-seleccionar-persona').style.display = 'flex';
  $('buscador-persona').focus();
}

function cerrarSelectorPersona() {
  $('modal-seleccionar-persona').style.display = 'none';
  selectorPersonaTargetId = null;
}

function filtrarListaPersonal() {
  const q = $('buscador-persona').value.toLowerCase().trim();
  const lista = personalListaCache || [];
  const filtrados = q
    ? lista.filter(nombre => nombre.toLowerCase().includes(q)).slice(0, 50)
    : lista.slice(0, 50);
  renderizarListaPersonal(filtrados);
}

function renderizarListaPersonal(lista) {
  const cont = $('lista-persona-resultados');
  if (lista.length === 0) {
    cont.innerHTML = `<div style="padding:16px;text-align:center;color:var(--txt2);font-size:12px;">Sin resultados</div>`;
    return;
  }
  cont.innerHTML = lista.map(nombre => `
    <div style="padding:10px 12px;font-size:12px;cursor:pointer;border-bottom:1px solid var(--border);" 
         onmouseover="this.style.background='var(--blue-l)'" onmouseout="this.style.background=''"
         onclick="elegirPersona('${nombre.replace(/'/g, "\\'")}')">
      ${nombre}
    </div>
  `).join('');
}

function elegirPersona(nombre) {
  if (selectorPersonaTargetId) $(selectorPersonaTargetId).value = nombre;
  cerrarSelectorPersona();
}

/* Selector de ÁREA del panel "Generar Reporte" (solo admin / permiso reporte_elegir_mes).
   Permite sacar el reporte de cualquier área sin cambiar de área arriba.
   Sigue al área activa de la página mientras la persona no elija otra a mano. */
let reporteAreaElegidaManual = false;
let reporteAreaUltimaActiva = null;

async function poblarAreaReportePrueba() {
  const sel = $('reporte-prueba-area');
  if (!sel) return;
  // Si cambió el área activa de la página, vuelve a seguirla
  if (reporteAreaUltimaActiva !== areaActual) {
    reporteAreaElegidaManual = false;
    reporteAreaUltimaActiva = areaActual;
  }
  if (sel.options.length === 0) {
    const areas = await obtenerAreasNovedades();
    sel.innerHTML = areas.map(a => `<option value="${a}">${a}</option>`).join('');
  }
  if (!reporteAreaElegidaManual && areaActual && [...sel.options].some(o => o.value === areaActual)) {
    sel.value = areaActual;
  }
}

function marcarAreaReporteManual() { reporteAreaElegidaManual = true; }

function poblarSelectoresReportePrueba() {
  const selMes = $('reporte-prueba-mes');
  const selAnio = $('reporte-prueba-anio');
  if (!selMes || !selAnio) return;
  poblarAreaReportePrueba();

  if (selMes.options.length === 0) {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    meses.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = String(i + 1).padStart(2, '0');
      opt.textContent = m;
      selMes.appendChild(opt);
    });
    // Arranca en el mes EN CURSO, sincronizado con lo que muestra el
    // encabezado de Novedades Mensuales arriba.
    selMes.value = obtenerFechaParts().periodo.split('-')[1];
  }
  if (selAnio.options.length === 0) {
    const anioActual = new Date().getFullYear();
    for (let a = anioActual - 1; a <= anioActual + 1; a++) {
      const opt = document.createElement('option');
      opt.value = String(a);
      opt.textContent = String(a);
      selAnio.appendChild(opt);
    }
    // Mismo criterio: año en curso
    selAnio.value = obtenerFechaParts().periodo.split('-')[0];
  }
}

async function generarReportePrueba() {
  const mes = $('reporte-prueba-mes').value;
  const anio = $('reporte-prueba-anio').value;
  const elaboradoPor = $('reporte-prueba-elaborado-por').value.trim();
  const responsable = $('reporte-prueba-responsable').value.trim();

  // Con los selectores visibles (admin / reporte_elegir_mes) se usa el área elegida
  // en el panel; en los demás casos, el área activa de la página.
  const selectoresEl = $('reporte-prueba-selectores');
  const selAreaEl    = $('reporte-prueba-area');
  const usaSelectorArea = selectoresEl && selectoresEl.style.display !== 'none' && selAreaEl && selAreaEl.value;
  const areaReporte = usaSelectorArea ? selAreaEl.value : areaActual;

  if (!mes || !anio) { toast('Elegí mes y año', 'err'); return; }
  if (!elaboradoPor || !responsable) { toast('Elegí "Elaborado por" y "Responsable"', 'err'); return; }
  if (!areaReporte) { toast('Elegí un área primero', 'err'); return; }

  const periodo = `${anio}-${mes}`;

  try {
    toast('⏳ Generando reporte de prueba...', 'ok');
    const ref = window._fb.doc(db, 'novedades', areaReporte, periodo, 'datos');
    const snap = await window._fb.getDoc(ref);

    // Un área sin nada cargado también debe poder generar su reporte: sale con
    // el formato, el encabezado y las firmas, y las celdas de novedades vacías.
    // Antes esto cortaba con "No hay datos" y dejaba al área sin documento.
    const data = snap.exists() ? snap.data() : {};
    if (!data.agentes) data.agentes = [];
    if (data.agentes.length === 0) {
      toast(`⚠️ ${areaReporte} no tiene novedades cargadas en ${periodo} — se generará el reporte en blanco`, 'ok');
    }
    await exportarNovedadesExcel(data, areaReporte, periodo, elaboradoPor, responsable);
    await exportarNovedadesPDF(data, areaReporte, periodo, elaboradoPor, responsable);

    toast(`✅ Reporte de ${areaReporte} (${periodo}) generado — no se modificó el estado del mes`, 'ok');
  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

function aplicarVisibilidadTabsAdmin() {
  const tabsMap = { envios: '📤 Envíos', importar: '📥 Importar BD', accesos: '🔐 Accesos', auditoria: '📋 Auditoría', desbloqueos: '🔓 Desbloqueos', resumen: '📊 Reportes' };
  let primeraVisible = null;

  document.querySelectorAll('.admin-tab').forEach(tab => {
    const tabName = tab.dataset.tab;
    const permitido = tabPermitido(tabName);
    tab.style.display = permitido ? 'inline-flex' : 'none';
    if (permitido && !primeraVisible) primeraVisible = tabName;
  });

  // Si el usuario no tiene la pestaña "Envíos" (activa por defecto) permitida,
  // activar automáticamente la primera pestaña que sí tenga.
  const tabEnviosPermitido = tabPermitido('envios');
  if (!tabEnviosPermitido && primeraVisible) {
    const tabBtn = document.querySelector(`.admin-tab[data-tab="${primeraVisible}"]`);
    if (tabBtn) tabBtn.click();
  } else if (tabEnviosPermitido) {
    cargarAdmin();
  }
  aplicarPermisosBotones();
}

function ocultarPantallaCierreMes() {
  hide('cierre-mes-container');
  cierreMesData = null;
}

/* ═════════════════════════════════════════
   PANEL ADMIN — Configuración del cierre mensual
═════════════════════════════════════════ */

async function cargarConfigPanel() {
  const cfg = await obtenerConfigCierre(true); // siempre lectura fresca al abrir la pestaña
  const inpHab = $('config-dia-habilitacion');
  const inpBlo = $('config-dia-bloqueo');
  const selModo = $('config-modo-llenado');
  if (inpHab) inpHab.value = cfg.diaHabilitacion;
  if (inpBlo) inpBlo.value = cfg.diaBloqueo;
  if (selModo) selModo.value = cfg.modoLlenado;

  // En modo solo lectura (supervisor o permiso sin edición) los campos se deshabilitan
  const puedeEditar = tienePermisoAccion('config_editar');
  [inpHab, inpBlo, selModo].forEach(el => {
    if (!el) return;
    el.disabled = !puedeEditar;
    el.style.opacity = puedeEditar ? '' : '0.6';
    el.style.cursor = puedeEditar ? '' : 'not-allowed';
  });

  const meta = $('config-cierre-meta');
  if (meta) {
    if (cfg.actualizadoPor) {
      const f = cfg.fechaActualizacion?.toDate ? cfg.fechaActualizacion.toDate() : cfg.fechaActualizacion;
      const fechaTxt = f ? new Date(f).toLocaleString('es-EC') : '';
      meta.textContent = `Última modificación: ${cfg.actualizadoPor}${fechaTxt ? ' — ' + fechaTxt : ''}`;
    } else {
      meta.textContent = 'Todavía no se ha guardado una configuración: el sistema está usando los valores por defecto (día 1 y día 1).';
    }
  }

  // "Preparar mes" es una escritura masiva sobre todas las áreas: queda
  // reservada al administrador raíz, no se delega por permiso.
  const secPreparar = $('config-preparar-mes');
  if (secPreparar) {
    secPreparar.style.display = esAdmin() ? 'block' : 'none';
    if (esAdmin()) poblarSelectoresPrepararMes();
  }

  actualizarResumenConfigCierre();
  actualizarResumenModoLlenado();
  ['config-dia-habilitacion','config-dia-bloqueo'].forEach(id => {
    const el = $(id);
    if (el && !el.dataset.listenerConfig) {
      el.addEventListener('input', actualizarResumenConfigCierre);
      el.dataset.listenerConfig = '1';
    }
  });
  if (selModo && !selModo.dataset.listenerConfig) {
    selModo.addEventListener('change', actualizarResumenModoLlenado);
    selModo.dataset.listenerConfig = '1';
  }
}

function actualizarResumenConfigCierre() {
  const cont = $('config-cierre-resumen');
  if (!cont) return;
  const hab = parseInt($('config-dia-habilitacion')?.value, 10);
  const blo = parseInt($('config-dia-bloqueo')?.value, 10);

  if (isNaN(hab) || isNaN(blo) || hab < 1 || hab > 31 || blo < 1 || blo > 31) {
    cont.textContent = '⚠️ Los días deben estar entre 1 y 31.';
    return;
  }
  if (blo < hab) {
    cont.textContent = '⚠️ El día de bloqueo no puede ser anterior al día de habilitación.';
    return;
  }

  const margen = blo - hab;
  let texto = hab === blo
    ? `Con esta configuración: el día ${hab} de cada mes se habilita el informe del mes anterior y, ese mismo día, el área queda bloqueada hasta generarlo.`
    : `Con esta configuración: el informe del mes anterior se habilita el día ${hab} y el área tiene ${margen} día${margen === 1 ? '' : 's'} de margen; si al día ${blo} no lo ha generado, queda bloqueada hasta cerrarlo.`;

  // Aviso solo si algún mes del calendario es más corto que los días elegidos:
  // febrero varía entre 28 y 29 según el año bisiesto, y hay meses de 30 días.
  const mayor = Math.max(hab, blo);
  if (mayor > 28) {
    const anio = new Date().getFullYear();
    const feb = new Date(anio, 2, 0).getDate(); // 28 o 29 según el año en curso
    const ejemplos = [];
    if (mayor > feb) ejemplos.push(`en febrero de ${anio} se aplicará el día ${feb}`);
    if (mayor > 30)  ejemplos.push('en los meses de 30 días se aplicará el día 30');
    if (ejemplos.length) {
      texto += ` Nota: cuando el mes es más corto, el sistema usa su último día — ${ejemplos.join(' y ')}.`;
    }
  }

  cont.textContent = texto;
}

/* ═════════════════════════════════════════
   PANEL ADMIN — Preparar mes en todas las áreas
   ─────────────────────────────────────────
   Complementa el arrastre automático de nómina. El arrastre actúa área por
   área, recién cuando alguien la abre; esto deja TODAS las áreas listas de
   una sola vez, para que el día 1 el Resumen General ya salga completo y se
   vea de inmediato qué áreas quedaron sin personal.

   Es una operación segura de repetir: un área que ya tiene el mes creado se
   omite y NUNCA se sobrescribe, así que jamás puede borrar lo ya registrado.
═════════════════════════════════════════ */

function poblarSelectoresPrepararMes() {
  const selMes  = $('preparar-mes-mes');
  const selAnio = $('preparar-mes-anio');
  if (!selMes || !selAnio) return;

  const hoy = obtenerFechaParts();

  if (selMes.options.length === 0) {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    meses.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = String(i + 1).padStart(2, '0');
      opt.textContent = m;
      selMes.appendChild(opt);
    });
    selMes.value = hoy.mes; // acá sí es el mes EN CURSO: es el que se prepara
  }
  if (selAnio.options.length === 0) {
    const anioActual = new Date().getFullYear();
    for (let a = anioActual - 1; a <= anioActual + 1; a++) {
      const opt = document.createElement('option');
      opt.value = String(a);
      opt.textContent = String(a);
      selAnio.appendChild(opt);
    }
    selAnio.value = String(anioActual);
  }
}

async function prepararMesEnTodasLasAreas() {
  if (!esAdmin()) {
    toast('❌ Solo el administrador puede preparar el mes', 'err');
    return;
  }

  const mes  = $('preparar-mes-mes')?.value;
  const anio = $('preparar-mes-anio')?.value;
  if (!mes || !anio) { toast('❌ Elija mes y año', 'err'); return; }

  const periodo = `${anio}-${mes}`;
  const periodoAnterior = obtenerPeriodoAnterior(periodo);
  const nombrePeriodo = `${obtenerNombreMes(mes)} ${anio}`;

  const areas = await obtenerAreasNovedades();
  if (!areas.length) { toast('❌ No hay áreas en el catálogo', 'err'); return; }

  const confirmar = await confirmarAccion(
    `Se revisarán las ${areas.length} áreas del catálogo y se creará ${nombrePeriodo} en las que aún no lo tengan, ` +
    `arrastrando la nómina de ${obtenerNombreMes(periodoAnterior.split('-')[1])} con las novedades en blanco.\n\n` +
    `Las áreas que ya tienen ese mes creado NO se modifican.\n\n¿Confirma?`,
    'Preparar mes en todas las áreas'
  );
  if (!confirmar) return;

  const btn = $('btn-preparar-mes');
  const prog = $('preparar-mes-progreso');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
  if (prog) { show('preparar-mes-progreso'); prog.style.display = 'block'; prog.textContent = 'Preparando...'; }

  const resumen = { preparadas: 0, yaExistian: 0, sinMesAnterior: 0, errores: 0 };

  try {
    const tamanioLote = 25; // mismo lote que usan la importación y el backup
    for (let i = 0; i < areas.length; i += tamanioLote) {
      const lote = areas.slice(i, i + tamanioLote);

      await Promise.all(lote.map(async area => {
        try {
          const refDestino = window._fb.doc(db, 'novedades', area, periodo, 'datos');
          const docDestino = await window._fb.getDoc(refDestino);

          // Regla de oro: si ya existe, no se toca. Nunca se sobrescribe.
          if (docDestino.exists()) { resumen.yaExistian++; return; }

          const docAnterior = await window._fb.getDoc(
            window._fb.doc(db, 'novedades', area, periodoAnterior, 'datos')
          );
          const agentes = arrastrarNominaMesAnterior(docAnterior);

          const estructura = {
            agentes,
            estado: 'activo',
            diasBloqueados: [],
            diasDesbloqueados: [],
            diasNoCompletados: Array.from({length: 31}, (_, i2) => i2 + 1),
            fechaCreacion: new Date(),
            ultimaModificacion: new Date()
          };
          if (agentes.length) estructura.nominaArrastradaDe = periodoAnterior;

          await window._fb.setDoc(refDestino, estructura);

          if (agentes.length) resumen.preparadas++;
          else                resumen.sinMesAnterior++;

        } catch(e) {
          console.error(`Error preparando ${area} en ${periodo}:`, e);
          resumen.errores++;
        }
      }));

      if (prog) prog.textContent = `⏳ Revisando áreas... ${Math.min(i + tamanioLote, areas.length)} / ${areas.length}`;
    }

    await registrarEnAuditoria(
      'preparar_mes', null, usuario.email, null, periodo,
      { ...resumen, areasRevisadas: areas.length },
      `Preparación de ${nombrePeriodo}: ${resumen.preparadas} área(s) con nómina arrastrada, ` +
      `${resumen.yaExistian} ya existían, ${resumen.sinMesAnterior} sin mes anterior` +
      (resumen.errores ? `, ${resumen.errores} con error` : '')
    );

    if (prog) {
      prog.innerHTML =
        `✅ <strong>${nombrePeriodo} preparado.</strong><br>` +
        `• ${resumen.preparadas} área(s) creadas con la nómina arrastrada<br>` +
        `• ${resumen.yaExistian} ya tenían el mes (no se tocaron)<br>` +
        `• ${resumen.sinMesAnterior} quedaron vacías: no tenían mes anterior — hay que importarles la base` +
        (resumen.errores ? `<br>• ⚠️ ${resumen.errores} con error (revise la consola)` : '');
    }
    toast(`✅ ${resumen.preparadas} área(s) preparadas para ${nombrePeriodo}`, 'ok');

  } catch(e) {
    console.error(e);
    if (prog) prog.textContent = '❌ Error: ' + e.message;
    toast('❌ Error preparando el mes: ' + e.message, 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.style.opacity = ''; }
  }
}

function actualizarResumenModoLlenado() {
  const cont = $('config-modo-resumen');
  if (!cont) return;
  const modo = $('config-modo-llenado')?.value || 'diario';
  if (modo === 'mensual') {
    cont.textContent = 'El área podrá completar cualquier día ya transcurrido del mes en curso, hasta que llegue el día de bloqueo del cierre.';
  } else if (modo === 'semanal') {
    cont.textContent = 'El área podrá completar los días de la semana en curso, desde el lunes hasta hoy. Cada lunes arranca una semana nueva y la anterior queda cerrada; si una semana empieza en el mes anterior, ese tramo se cierra con el informe de ese mes.';
  } else {
    cont.textContent = 'El área solo podrá escribir en el día de hoy. Para corregir días anteriores deberá solicitar desbloqueo al administrador.';
  }
}

async function guardarConfigCierre() {
  if (!tienePermisoAccion('config_editar')) {
    toast('❌ No tiene permiso para modificar la configuración', 'err');
    return;
  }

  const hab = parseInt($('config-dia-habilitacion').value, 10);
  const blo = parseInt($('config-dia-bloqueo').value, 10);
  const modo = $('config-modo-llenado')?.value || 'diario';
  if (!MODOS_LLENADO[modo]) { toast('❌ Modo de llenado no válido', 'err'); return; }

  if (isNaN(hab) || hab < 1 || hab > 31 || isNaN(blo) || blo < 1 || blo > 31) {
    toast('❌ Los días deben ser números del 1 al 31', 'err');
    return;
  }
  if (blo < hab) {
    toast('❌ El día de bloqueo no puede ser anterior al día de habilitación', 'err');
    return;
  }

  const anterior = await obtenerConfigCierre();
  const confirmar = await confirmarAccion(
    `Se aplicará a TODAS las áreas:\n\n• El informe del mes anterior se habilita el día ${hab}.\n• El registro se bloquea el día ${blo} si no se generó.\n• Modo de llenado: ${MODOS_LLENADO[modo]}.\n\n¿Confirma el cambio?`,
    'Configuración de cierre mensual'
  );
  if (!confirmar) return;

  try {
    const ref = window._fb.doc(db, 'sistema', 'config_cierre');
    await window._fb.setDoc(ref, {
      diaHabilitacion: hab,
      diaBloqueo: blo,
      modoLlenado: modo,
      actualizadoPor: usuario.email,
      fechaActualizacion: new Date()
    }, { merge: true });

    configCierreCache = null; // forzar relectura en la próxima consulta

    await registrarEnAuditoria(
      'cambiar_config_cierre',
      null,
      usuario.email,
      null,
      null,
      { antes: { diaHabilitacion: anterior.diaHabilitacion, diaBloqueo: anterior.diaBloqueo, modoLlenado: anterior.modoLlenado },
        despues: { diaHabilitacion: hab, diaBloqueo: blo, modoLlenado: modo } },
      `Cierre mensual: habilitación día ${anterior.diaHabilitacion} → ${hab}, bloqueo día ${anterior.diaBloqueo} → ${blo}, modo de llenado ${anterior.modoLlenado} → ${modo}`
    );

    toast('✅ Configuración guardada — se aplica desde ahora en todas las áreas', 'ok');
    await cargarConfigPanel();
  } catch(e) {
    console.error(e);
    toast('❌ Error al guardar: ' + e.message, 'err');
  }
}

async function restaurarConfigCierrePorDefecto() {
  if (!tienePermisoAccion('config_editar')) {
    toast('❌ No tiene permiso para modificar la configuración', 'err');
    return;
  }
  $('config-dia-habilitacion').value = CONFIG_CIERRE_DEFAULT.diaHabilitacion;
  $('config-dia-bloqueo').value = CONFIG_CIERRE_DEFAULT.diaBloqueo;
  if ($('config-modo-llenado')) $('config-modo-llenado').value = CONFIG_CIERRE_DEFAULT.modoLlenado;
  actualizarResumenConfigCierre();
  actualizarResumenModoLlenado();
  toast('Valores restaurados en pantalla — pulse "Guardar configuración" para aplicarlos', 'ok');
}

const MAX_INTENTOS_REPORTE = 3;

// Intentos de generación ya gastados de un informe cerrado. El cierre original cuenta
// como el intento 1; cuando el administrador repone los intentos el contador queda en 0.
function intentosUsadosDeReporte(data) {
  if (!data || data.estado !== 'cerrado') return 0;
  return typeof data.intentosReporte === 'number' ? data.intentosReporte : 1;
}

// La reposición de intentos hecha por el administrador vale solo el DÍA en que la
// hizo (hasta las 23:59). Al día siguiente el contador vuelve a cero.
function reposicionDeReporteVigente(data) {
  if (!data || !data.reporteReabiertoFecha) return false;
  const f = obtenerFechaParts();
  return data.reporteReabiertoFecha === `${f.periodo}-${String(f.dia).padStart(2, '0')}`;
}

// Hay ventana para volver a generar el informe: el día 1 del mes siguiente, o el día
// en que el administrador repuso los intentos. Ambas terminan a las 23:59.
function plazoReporteVigente(data, periodo) {
  return plazoLlenadoMesAnteriorVigente(periodo) || reposicionDeReporteVigente(data);
}

// Volver a generar el informe solo se permite dentro de esa ventana. Pasada la
// hora el contador queda en cero (los intentos que sobraban se pierden) hasta que
// el administrador vuelva a reponerlos con "Reponer intentos".
function intentosRestantesDeReporte(data, periodo) {
  if (!data || data.estado !== 'cerrado') return MAX_INTENTOS_REPORTE;
  return plazoReporteVigente(data, periodo)
    ? Math.max(0, MAX_INTENTOS_REPORTE - intentosUsadosDeReporte(data))
    : 0;
}

// El mes anterior solo se puede llenar o corregir durante el DÍA 1 del mes siguiente
// (hasta las 23:59). Pasada esa hora ya no hay chance de corregir novedades.
function plazoLlenadoMesAnteriorVigente(periodo) {
  const hoy = obtenerFechaParts();
  return obtenerPeriodoSiguiente(periodo) === hoy.periodo && hoy.dia === 1;
}

// Mientras el informe NO se haya generado y el plazo esté vigente, el área tiene el
// mes anterior COMPLETO abierto para llenarlo, sin pedir nada. Vencido el plazo (o
// ya generado el informe) el mes queda cerrado: solo el administrador puede
// reabrirlo con la prórroga o con desbloqueos puntuales (días en diasDesbloqueados).
function diasAbiertosEnCierre(data, periodo) {
  const abiertos = new Set((data && data.diasDesbloqueados) || []);
  if (data && data.estado !== 'cerrado' && (plazoLlenadoMesAnteriorVigente(periodo) || esAdmin())) {
    const total = diasEnMes(periodo);
    for (let d = 1; d <= total; d++) abiertos.add(d);
  }
  return abiertos;
}

// Días del mes en los que TODOS los agentes aún no tienen novedad registrada.
// Es el mismo criterio que usa el sistema para marcar un día como completado.
function diasSinCompletarEnMes(data, periodo) {
  const agentes = (data && data.agentes) || [];
  const total = diasEnMes(periodo);
  const pendientes = [];
  for (let d = 1; d <= total; d++) {
    const completo = agentes.length > 0 &&
      agentes.every(a => a.novedadesPorDia && a.novedadesPorDia[String(d)]);
    if (!completo) pendientes.push(d);
  }
  return pendientes;
}

// Muestra los días pendientes del mes anterior y habilita o deshabilita el botón
// de generar: el informe no se genera con días vacíos (el administrador y el
// supervisor quedan exentos, igual que en el resto del cierre).
function actualizarEstadoPendientesCierre() {
  if (!cierreMesData) return;
  const { data, periodo, yaCerrado } = cierreMesData;
  const exento = esAdmin() || esSupervisor();
  const avisoPend    = $('cierre-mes-pendientes-aviso');
  const btnPrincipal = $('cierre-mes-btn-principal');

  const pendientes = (yaCerrado || exento) ? [] : diasSinCompletarEnMes(data, periodo);
  cierreMesData.diasPendientes = pendientes;

  if (avisoPend) {
    if (pendientes.length) {
      avisoPend.textContent = plazoLlenadoMesAnteriorVigente(periodo)
        ? `Faltan días por completar: ${pendientes.join(', ')}. El informe se podrá generar cuando no quede ningún día vacío. Complételos HOY, hasta las 23:59, en la tabla: clic en una celda, arrastre sobre la fila de un efectivo para elegir varios días, o clic en el número del día para marcar "Sin novedad" a todos. Después de esa hora ya no se podrán corregir novedades.`
        : `Faltan días por completar: ${pendientes.join(', ')}. El plazo para completar el mes anterior ya terminó y el informe no se puede generar con días vacíos. Comuníquese con el administrador.`;
      avisoPend.style.display = 'block';
    } else {
      avisoPend.style.display = 'none';
    }
  }
  if (btnPrincipal && !yaCerrado) {
    const bloquear = pendientes.length > 0;
    btnPrincipal.disabled = bloquear;
    btnPrincipal.style.opacity = bloquear ? '0.5' : '';
    btnPrincipal.style.cursor  = bloquear ? 'not-allowed' : '';
  }
}

// Tabla del mes anterior. Mientras el informe esté pendiente es EDITABLE con las
// mismas herramientas del mes en curso: clic en una celda (un día), arrastre sobre
// la fila de un efectivo (varios días) y clic en el número del día ("Sin novedad"
// para todos). Ya generado el informe, queda de solo lectura.
function renderizarTablaSoloLectura(tabla, data, periodo) {
  const totalDias = diasEnMes(periodo);
  const abiertos = diasAbiertosEnCierre(data, periodo);
  const incompletos = new Set(diasSinCompletarEnMes(data, periodo));
  tabla.innerHTML = '';

  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  ['Código', 'Grado', 'Apellidos y Nombres'].forEach(t => {
    const th = document.createElement('th');
    th.textContent = t;
    trh.appendChild(th);
  });
  for (let d = 1; d <= 31; d++) {
    const th = document.createElement('th');
    th.style.width = '32px';
    th.textContent = d;
    if (d > totalDias) {
      th.style.opacity = '.25';
    } else if (abiertos.has(d)) {
      th.style.cursor = 'pointer';
      th.title = `Clic para marcar "Sin Novedad" (S/N) en todos los efectivos — día ${d}`;
      if (incompletos.has(d)) {
        th.textContent = d + '•';
        th.style.color = 'var(--gold)';
        th.title = `Día ${d} incompleto — clic para marcar "Sin Novedad" (S/N) en todos los efectivos`;
      }
      th.addEventListener('click', () => seleccionarDiaColumnaCierre(d));
    }
    trh.appendChild(th);
  }
  const thObs = document.createElement('th');
  thObs.textContent = 'Observación';
  trh.appendChild(thObs);
  thead.appendChild(trh);

  const tbody = document.createElement('tbody');
  (data.agentes || [])
    .map((agente, origIdx) => ({ agente, origIdx }))
    .sort((a, b) => compararPorGrado(a.agente.grado, b.agente.grado, a.agente.codigo, b.agente.codigo))
    .forEach(({ agente, origIdx }) => {
      const idx = origIdx; // índice real en data.agentes (para editar el agente correcto)
      const tr = document.createElement('tr');
      tr.dataset.cierre = '1';
      [[agente.codigo, false], [agente.grado, false], [agente.apellidosNombres, true]].forEach(([txt, izq]) => {
        const td = document.createElement('td');
        td.style.fontSize = '11px';
        if (izq) td.style.textAlign = 'left';
        td.textContent = txt || '';
        tr.appendChild(td);
      });
      for (let d = 1; d <= 31; d++) {
        const td = document.createElement('td');
        td.style.fontSize = '11px';
        if (d > totalDias) {
          td.style.opacity = '.25';
          tr.appendChild(td);
          continue;
        }
        td.dataset.dia = String(d);
        td.textContent = (agente.novedadesPorDia && agente.novedadesPorDia[String(d)]) || '—';
        if (abiertos.has(d)) {
          td.dataset.arrastrable = '1';
          td.style.cursor = 'pointer';
          td.title = 'Clic para editar este día — o arrastre para elegir varios días';
          enlazarEdicionCeldaCierre(td, agente, idx, d, tr);
        } else {
          td.dataset.arrastrable = '0';
        }
        tr.appendChild(td);
      }
      const tdObs = document.createElement('td');
      tdObs.style.fontSize = '11px';
      tdObs.textContent = agente.observaciones || '';
      tr.appendChild(tdObs);
      tbody.appendChild(tr);
    });

  tabla.appendChild(thead);
  tabla.appendChild(tbody);
}

// Eventos de una celda editable del mes anterior: clic (un día) y arrastre
// horizontal por efectivo (mouse, o mantener presionado en el celular).
function enlazarEdicionCeldaCierre(td, agente, idx, dia, tr) {
  td.addEventListener('click', () => {
    if (arrastreSuprimirClick) return;
    abrirModalEditarNovedadCierre(idx, dia);
  });
  td.addEventListener('mouseover', () => {
    if (arrastreSel) { extenderArrastre(idx, dia, tr); return; }
    td.style.backgroundColor = 'var(--blue-l)';
  });
  td.addEventListener('mouseout', () => {
    if (arrastreSel) return;
    td.style.backgroundColor = '';
  });
  td.addEventListener('mousedown', (e) => {
    e.preventDefault();
    iniciarPosibleArrastre(agente, idx, dia, tr);
  });
  td.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchInicioPos = { x: t.clientX, y: t.clientY };
    touchArrastreActivo = false;
    clearTimeout(touchTimerArrastre);
    touchTimerArrastre = setTimeout(() => {
      touchArrastreActivo = true;
      iniciarPosibleArrastre(agente, idx, dia, tr);
      if (navigator.vibrate) navigator.vibrate(15);
    }, 350);
  }, { passive: true });
  td.addEventListener('touchmove', (e) => {
    if (touchArrastreActivo) {
      e.preventDefault();
      const t = e.touches[0];
      const destino = document.elementFromPoint(t.clientX, t.clientY);
      const tdDestino = destino && destino.closest('td[data-dia]');
      if (tdDestino && tdDestino.parentElement === tr) {
        extenderArrastre(idx, parseInt(tdDestino.dataset.dia, 10), tr);
      }
    } else if (touchInicioPos) {
      const t = e.touches[0];
      if (Math.abs(t.clientX - touchInicioPos.x) > 10 || Math.abs(t.clientY - touchInicioPos.y) > 10) {
        clearTimeout(touchTimerArrastre); // se movió antes de tiempo: es un scroll normal
      }
    }
  }, { passive: false });
  td.addEventListener('touchend', () => {
    clearTimeout(touchTimerArrastre);
    if (touchArrastreActivo) { finalizarArrastre(); touchArrastreActivo = false; }
    touchInicioPos = null;
  });
}

// Clic en el número de un día de la tabla del mes anterior: "Sin Novedad" (S/N)
// para todos los efectivos de ese día.
async function seleccionarDiaColumnaCierre(dia) {
  if (!cierreMesData) return;
  const { area, periodo, data } = cierreMesData;
  const ok = await confirmarAccion(
    `¿Marcar "Sin Novedad" (S/N) para todos los efectivos en el día ${dia} de ${periodo}? Esto sobrescribe lo que ya esté cargado ese día.`,
    `Día ${dia} — mes anterior`
  );
  if (!ok) return;

  if (!diasAbiertosEnCierre(data, periodo).has(dia)) {
    toast('❌ El plazo para modificar el mes anterior ya terminó. Comuníquese con el administrador.', 'err');
    renderizarTablaSoloLectura($('tabla-cierre-mes'), data, periodo);
    actualizarEstadoPendientesCierre();
    return;
  }

  try {
    (data.agentes || []).forEach(agente => {
      if (!agente.novedadesPorDia) agente.novedadesPorDia = {};
      agente.novedadesPorDia[String(dia)] = 'S/N';
      agente.observaciones = CODIGOS_DESC['S/N'];
    });
    const novedadesRef = window._fb.doc(db, 'novedades', area, periodo, 'datos');
    await window._fb.updateDoc(novedadesRef, {
      agentes: data.agentes,
      ultimaModificacion: new Date()
    });
    await registrarEnAuditoria(
      'rellenar_sin_novedad', area, usuario.email, dia, periodo,
      { cantidadAgentes: (data.agentes || []).length },
      `Auto-relleno S/N (mes anterior): ${(data.agentes || []).length} agentes - Día ${dia}`
    );
    renderizarTablaSoloLectura($('tabla-cierre-mes'), data, periodo);
    actualizarEstadoPendientesCierre();
    toast(`✅ Se llenó "Sin Novedad" para todos los efectivos del día ${dia}`, 'ok');
  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

// Varios días de un mismo efectivo (arrastre horizontal) en el mes anterior
function abrirModalEditarNovedadDiasCierre(agente, dias, idx) {
  abrirModalEditarNovedadDias(agente, dias, idx);
  modalEsEdicionDeCierre = true; // guardarNovedad guarda en el período del mes anterior
  const diasOrd = [...dias].sort((a, b) => a - b);
  $('modal-novedad-sub').textContent =
    (diasOrd.length > 1
      ? `Días ${diasOrd[0]} a ${diasOrd[diasOrd.length - 1]} (${diasOrd.length} días)`
      : `Día ${diasOrd[0]}`) +
    ` (mes anterior) — ${agente.apellidosNombres}`;
}

async function abrirModalEditarNovedadCierre(idx, dia) {
  if (!cierreMesData) return;
  const agente = cierreMesData.data.agentes[idx];
  if (!agente) return;
  abrirModalEditarNovedadDiasCierre(agente, [dia], idx);
}

async function cerrarYExportarMes() {
  if (!cierreMesData) return;
  const { area, periodo, data, yaCerrado } = cierreMesData;

  // Caso 1: el mes ya estaba cerrado — esto es una REGENERACIÓN del mismo
  // informe, no un cierre nuevo. No se tocan "elaboradoPor"/"responsable"
  // ni la fecha de cierre; solo se reexportan los archivos y sube el contador.
  if (yaCerrado) {
      if (intentosRestantesDeReporte(data, periodo) <= 0) {
      toast(intentosUsadosDeReporte(data) < MAX_INTENTOS_REPORTE
        ? '❌ El plazo para volver a generar este reporte terminó. Comuníquese con soporte técnico.'
        : '❌ Ha alcanzado el máximo de intentos permitidos. Comuníquese con soporte técnico.', 'err');
      return;
    }
    try {
      toast('⏳ Generando reporte...', 'ok');
      const nuevoConteo = intentosUsadosDeReporte(data) + 1;
      const novedadesRef = window._fb.doc(db, 'novedades', area, periodo, 'datos');
      await window._fb.updateDoc(novedadesRef, { intentosReporte: nuevoConteo });
      data.intentosReporte = nuevoConteo;

      await registrarEnAuditoria('regenerar_reporte', area, usuario.email, null, periodo,
        { intento: nuevoConteo, de: MAX_INTENTOS_REPORTE },
        `Reporte de ${periodo} regenerado por ${usuario.email} (intento ${nuevoConteo} de ${MAX_INTENTOS_REPORTE})`);

      await exportarNovedadesExcel(data, area, periodo, data.elaboradoPor || '', data.responsable || '');
      await exportarNovedadesPDF(data, area, periodo, data.elaboradoPor || '', data.responsable || '');

      toast('✅ Reporte regenerado', 'ok');
      cargarNovedadesActuales();
    } catch(e) {
      console.error(e);
      toast('❌ Error: ' + e.message, 'err');
    }
    return;
  }

  // Caso 2: cierre nuevo, como hasta ahora.
  const elaboradoPor = $('cierre-elaborado-por').value.trim();
  const responsable = $('cierre-responsable').value.trim();

  if (!elaboradoPor || !responsable) {
    toast('❌ Complete "Elaborado por" y "Responsable" antes de cerrar el mes', 'err');
    return;
  }

  // El informe no se genera con días vacíos (administrador y supervisor exentos)
  if (!(esAdmin() || esSupervisor())) {
    const pendientes = diasSinCompletarEnMes(data, periodo);
    if (pendientes.length) {
      toast(`❌ No se puede generar el informe: faltan los días ${pendientes.join(', ')}.`, 'err');
      actualizarEstadoPendientesCierre();
      return;
    }
  }

  try {
    toast('⏳ Generando reporte...', 'ok');

    const novedadesRef = window._fb.doc(db, 'novedades', area, periodo, 'datos');
    const actualizacionCierre = {
      estado: 'cerrado',
      elaboradoPor,
      responsable,
      fechaCierre: new Date(),
      intentosReporte: 1
    };
    // Si el área estaba en prórroga, al generar su informe la prórroga termina
    // sola y los días vuelven a bloquearse.
    const terminaProrroga = !!(data.prorroga && data.prorroga.activa);
    if (terminaProrroga) {
      actualizacionCierre.diasDesbloqueados = [];
      actualizacionCierre['prorroga.activa'] = false;
      actualizacionCierre['prorroga.finalizadaEn'] = new Date();
    }
    await window._fb.updateDoc(novedadesRef, actualizacionCierre);
    if (terminaProrroga) {
      data.diasDesbloqueados = [];
      data.prorroga.activa = false;
    }

    await registrarEnAuditoria('cerrar_mes', area, usuario.email, null, periodo, { elaboradoPor, responsable }, `Mes ${periodo} cerrado por ${usuario.email}`);

    data.elaboradoPor = elaboradoPor;
    data.responsable = responsable;

    await exportarNovedadesExcel(data, area, periodo, elaboradoPor, responsable);
    await exportarNovedadesPDF(data, area, periodo, elaboradoPor, responsable);

    toast('✅ Mes cerrado y reporte exportado', 'ok');
    ocultarPantallaCierreMes();
    cargarNovedadesActuales();

  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

/* ═════════════════════════════════════════
   EXPORTAR — Excel (formato oficial)
═════════════════════════════════════════ */

async function exportarNovedadesExcel(data, area, periodo, elaboradoPor, responsable, esGeneral = false) {
  if (!window.ExcelJS) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }

  const totalDias = diasEnMes(periodo);
  const [anio, mesNum] = periodo.split('-');
  const nombreMes = obtenerNombreMes(mesNum);
  const numCols = 1 + 3 + 31 + 1; // N°, código, grado, nombres + 31 días + observación

  // Colores de la plantilla oficial
  const NAVY = 'FF1F3864';
  const AMARILLO = 'FFFFFF00';
  const VERDE_CLARO = 'FFD9EAD3';
  const BLANCO = 'FFFFFFFF';

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Novedades');

  ws.columns = [
    { width: 5 }, { width: 8 }, { width: 12 }, { width: 30 },
    ...Array.from({ length: 31 }, () => ({ width: 4 })),
    { width: 22 }
  ];

  // GRADO y APELLIDOS Y NOMBRES se ajustan al texto más largo de ESTE reporte,
  // para que no se corten (con un mínimo y un máximo razonables)
  const anchoParaTexto = (textos, minimo, maximo) => {
    const mayor = Math.max(0, ...textos.map(t => String(t || '').trim().length));
    return Math.min(maximo, Math.max(minimo, Math.ceil(mayor * 1.1) + 2));
  };
  ws.getColumn(3).width = anchoParaTexto((data.agentes || []).map(a => a.grado), 12, 36);
  ws.getColumn(4).width = anchoParaTexto((data.agentes || []).map(a => a.apellidosNombres), 30, 60);

  const estiloNavy = (cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    cell.font = { color: { argb: BLANCO }, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  };
  const estiloAmarillo = (cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AMARILLO } };
    cell.alignment = { horizontal: 'center' };
  };

  // ── Título ──
  ws.mergeCells(1, 1, 1, numCols);
  const tituloCell = ws.getCell(1, 1);
  tituloCell.value = 'COMISIÓN DE TRÁNSITO DEL ECUADOR — CONTROL DE NOVEDADES MENSUAL';
  estiloNavy(tituloCell);
  ws.getRow(1).height = 26;

  // ── Área ──
  const totalEfectivo = (data.agentes || []).length;
  ws.mergeCells(2, 1, 2, numCols);
  const areaCell = ws.getCell(2, 1);
  areaCell.value = esGeneral
    ? `REPORTE GENERAL — TODOS LOS EFECTIVOS   ·   MES: ${nombreMes.toUpperCase()} ${anio}   ·   EFECTIVO: ${totalEfectivo}`
    : `ÁREA: ${area}   ·   MES: ${nombreMes.toUpperCase()} ${anio}   ·   EFECTIVO: ${totalEfectivo}`;
  estiloNavy(areaCell);
  ws.getRow(2).height = 20;

  // ── Logo institucional de la CTE (izquierda) sobre el banner navy
  //    (filas 1-2). Es la única imagen del encabezado ──
  const logoB64Nov = await obtenerLogoCTE();
  if (logoB64Nov) {
    const logoIdCteNov = wb.addImage({ base64: logoB64Nov, extension: 'png' });
    ws.addImage(logoIdCteNov, { tl: { col: 0.15, row: 0.12 }, ext: { width: 38, height: 38 } });
  }

  ws.addRow([]);

  // ── Encabezado de columnas ──
  const headerRow = ['N°', 'CÓDIGO', 'GRADO', 'APELLIDOS Y NOMBRES'];
  for (let d = 1; d <= 31; d++) headerRow.push(d);
  headerRow.push('OBSERVACIÓN');
  const filaHeader = ws.addRow(headerRow);
  filaHeader.eachCell(c => estiloNavy(c));

  // ── Repetir el banner (título + área/mes) y encabezado de columnas en cada página impresa ──
  ws.pageSetup.printTitlesRow = '1:4';
  ws.pageSetup.orientation = 'landscape';
  ws.pageSetup.fitToPage = true;
  ws.pageSetup.fitToWidth = 1;
  ws.pageSetup.fitToHeight = 0;

  // ── Contador de hojas al pie de cada página impresa ──
  ws.headerFooter.oddFooter = '&CPágina &P de &N';
  ws.headerFooter.evenFooter = '&CPágina &P de &N';

  // ── Filas de agentes — días en amarillo (zona de datos, como la plantilla) ──
  ordenarAgentesPorGrado(data.agentes).forEach((agente, idx) => {
    const fila = [idx + 1, agente.codigo || '', agente.grado || '', agente.apellidosNombres || ''];
    for (let d = 1; d <= 31; d++) {
      fila.push(d > totalDias ? '' : ((agente.novedadesPorDia && agente.novedadesPorDia[String(d)]) || ''));
    }
    fila.push(agente.observaciones || '');
    const row = ws.addRow(fila);

    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(3).alignment = { horizontal: 'left' };
    row.getCell(4).alignment = { horizontal: 'left' };
    for (let d = 1; d <= 31; d++) {
      const cell = row.getCell(4 + d);
      if (d > totalDias) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      } else {
        estiloAmarillo(cell);
      }
    }
    row.getCell(numCols).alignment = { horizontal: 'left' };
  });

  ws.addRow([]);

  // ── Nomenclatura ──
  ws.mergeCells(ws.rowCount + 1, 1, ws.rowCount + 1, numCols);
  const filaNomTitulo = ws.getRow(ws.rowCount);
  filaNomTitulo.getCell(1).value = 'NOMENCLATURA';
  filaNomTitulo.eachCell({ includeEmpty: true }, c => estiloNavy(c));

  // El verde debe cubrir todo el texto: se une desde la columna 2 hasta la primera columna
  // donde ya cabe la descripción más larga, y todos los renglones quedan del mismo largo.
  const textoMasLargo = Math.max(...CODIGOS_VALIDOS.map(c => String(CODIGOS_DESC[c] || '').length));
  let colFinNom = 2;
  let anchoAcum = ws.getColumn(2).width;
  while (anchoAcum < Math.ceil(textoMasLargo * 1.1) + 2 && colFinNom < numCols) {
    colFinNom++;
    anchoAcum += ws.getColumn(colFinNom).width;
  }
  CODIGOS_VALIDOS.forEach(c => {
    const row = ws.addRow([c, CODIGOS_DESC[c]]);
    ws.mergeCells(row.number, 2, row.number, colFinNom);
    for (let col = 1; col <= colFinNom; col++) {
      row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE_CLARO } };
    }
    row.getCell(1).font = { bold: true };
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
  });

  ws.addRow([]);
  const filaNota = ws.addRow(['NOTA: Para meses de 28, 29 o 30 días, se dejan en blanco las columnas de los días que no existen en ese mes.']);
  ws.mergeCells(filaNota.number, 1, filaNota.number, numCols);

  ws.addRow([]);

  // ── Certificación — se omite en el Reporte General (solo lo usan
  //    Administrador y Supervisor como resumen interno, sin firmas) ──
  if (!esGeneral) {
    const filaCertTituloNum = ws.rowCount + 1;
    ws.mergeCells(filaCertTituloNum, 1, filaCertTituloNum, numCols);
    const filaCertTitulo = ws.getRow(filaCertTituloNum);
    filaCertTitulo.getCell(1).value = 'CERTIFICACIÓN';
    filaCertTitulo.eachCell({ includeEmpty: true }, c => estiloNavy(c));

    const mitad = Math.floor(numCols / 2);
    const filaLabelsNum = filaCertTituloNum + 1;
    ws.mergeCells(filaLabelsNum, 1, filaLabelsNum, mitad);
    ws.mergeCells(filaLabelsNum, mitad + 1, filaLabelsNum, numCols);
    const filaCertLabels = ws.getRow(filaLabelsNum);
    filaCertLabels.getCell(1).value = 'ELABORADO POR';
    filaCertLabels.getCell(mitad + 1).value = 'RESPONSABLE';
    filaCertLabels.eachCell({ includeEmpty: true }, c => estiloNavy(c));

    const filaValoresNum = filaLabelsNum + 1;
    ws.mergeCells(filaValoresNum, 1, filaValoresNum, mitad);
    ws.mergeCells(filaValoresNum, mitad + 1, filaValoresNum, numCols);
    const filaCertValores = ws.getRow(filaValoresNum);
    filaCertValores.getCell(1).value = elaboradoPor;
    filaCertValores.getCell(mitad + 1).value = responsable;
    filaCertValores.eachCell({ includeEmpty: true }, c => estiloAmarillo(c));
    filaCertValores.height = 22;

    // ── Recuadro de firma (en blanco) ──
    const filaFirmaNum = filaValoresNum + 1;
    ws.mergeCells(filaFirmaNum, 1, filaFirmaNum, mitad);
    ws.mergeCells(filaFirmaNum, mitad + 1, filaFirmaNum, numCols);
    const filaFirma = ws.getRow(filaFirmaNum);
    filaFirma.eachCell({ includeEmpty: true }, c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLANCO } };
    });
    filaFirma.height = 45;
  }

  // ── Líneas de cuadrícula en toda la hoja ──
  const bordeDelgado = { style: 'thin', color: { argb: 'FF999999' } };
  ws.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: true }, cell => {
      cell.border = { top: bordeDelgado, left: bordeDelgado, bottom: bordeDelgado, right: bordeDelgado };
    });
  });

  // ── Nota de pie de página discreta (no institucional, solo trazabilidad técnica) ──
  const filaFooterNum = ws.rowCount + 2;
  ws.mergeCells(filaFooterNum, 1, filaFooterNum, numCols);
  const filaFooter = ws.getCell(filaFooterNum, 1);
  const fechaGenExcel = new Date().toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  filaFooter.value = `Documento generado automáticamente — Unidad de Personal y Movilidad CTE · Generado: ${fechaGenExcel}`;
  filaFooter.font = { size: 8, italic: true, color: { argb: 'FF888888' } };
  filaFooter.alignment = { horizontal: 'center' };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `novedades_${esGeneral ? 'REPORTE_GENERAL' : area}_${periodo}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ═════════════════════════════════════════
   EXPORTAR — PDF (formato oficial)
═════════════════════════════════════════ */

async function exportarNovedadesPDF(data, area, periodo, elaboradoPor, responsable, esGeneral = false) {
  if (!window.jspdf) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  if (!window.jspdf.jsPDF.API.autoTable) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }

  const { jsPDF } = window.jspdf;
  const totalDias = diasEnMes(periodo);
  const [anio, mesNum] = periodo.split('-');
  const nombreMes = obtenerNombreMes(mesNum);

  // Colores de la plantilla oficial
  const NAVY = [31, 56, 100];
  const AMARILLO = [255, 255, 0];
  const VERDE_CLARO = [217, 234, 211];
  const BLANCO = [255, 255, 255];

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const totalEfectivo = (data.agentes || []).length;

  // Se cargan una sola vez ANTES de dibujarBanner porque esta última se
  // invoca de forma síncrona (didDrawPage de autoTable no admite async)
  const logoB64Pdf = await obtenerLogoCTE();

  // ── Banners de título (se redibujan en cada página vía didDrawPage) ──
  const dibujarBanner = () => {
    doc.setFillColor(...NAVY);
    doc.rect(10, 8, anchoPagina - 20, 8, 'F');
    doc.setTextColor(...BLANCO);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('COMISIÓN DE TRÁNSITO DEL ECUADOR — CONTROL DE NOVEDADES MENSUAL', anchoPagina / 2, 13.5, { align: 'center' });

    doc.setFillColor(...NAVY);
    doc.rect(10, 16, anchoPagina - 20, 7, 'F');
    doc.setFontSize(10);
    doc.text(
      esGeneral
        ? `REPORTE GENERAL — TODOS LOS EFECTIVOS   ·   MES: ${nombreMes.toUpperCase()} ${anio}   ·   EFECTIVO: ${totalEfectivo}`
        : `ÁREA: ${area}   ·   MES: ${nombreMes.toUpperCase()} ${anio}   ·   EFECTIVO: ${totalEfectivo}`,
      anchoPagina / 2, 21, { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);

    // ── Logo institucional de la CTE (izquierda) sobre el banner. Es la
    //    única imagen del encabezado y se redibuja en cada página ──
    try {
      if (logoB64Pdf) doc.addImage(logoB64Pdf, 'PNG', 12, 8.6, 13.6, 13.6);
    } catch (e) { /* si el navegador no soporta el formato, se omite sin romper el PDF */ }

    // ── Nota de pie de página discreta: identifica el sistema que generó
    //    el documento sin competir con el encabezado institucional ──
    const altoPaginaFooter = doc.internal.pageSize.getHeight();
    const fechaGen = new Date().toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.setFont(undefined, 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`Documento generado automáticamente — Unidad de Personal y Movilidad CTE · Generado: ${fechaGen}`, anchoPagina / 2, altoPaginaFooter - 5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  };
  dibujarBanner();

  const head = [['N°', 'Código', 'Grado', 'Apellidos y Nombres', ...Array.from({length: totalDias}, (_, i) => String(i + 1)), 'Observación']];
  const body = ordenarAgentesPorGrado(data.agentes).map((agente, idx) => {
    const fila = [idx + 1, agente.codigo || '', agente.grado || '', agente.apellidosNombres || ''];
    for (let d = 1; d <= totalDias; d++) {
      const valorDia = ((agente.novedadesPorDia && agente.novedadesPorDia[String(d)]) || '').trim();
      const sinNovedad = valorDia === '' || valorDia.toUpperCase() === 'S/N';
      fila.push(sinNovedad ? '' : valorDia);
    }
    fila.push(agente.observaciones || '');
    return fila;
  });

  // ── Anchos de columna fijos, calculados para que la tabla nunca exceda
  //    el ancho útil de la página (márgenes de 10mm a cada lado) ──
  const margenLateral = 10;
  const anchoUtil = anchoPagina - (margenLateral * 2);
  const anchoNo = 7;
  const anchoCodigo = 14;
  const anchoGrado = 22;
  const anchoNombres = 34;
  const anchoObservacion = 20;
  const anchoFijosTotal = anchoNo + anchoCodigo + anchoGrado + anchoNombres + anchoObservacion;
  const anchoDia = (anchoUtil - anchoFijosTotal) / totalDias;

  const columnStyles = {
    0: { cellWidth: anchoNo, halign: 'center' },
    1: { cellWidth: anchoCodigo, halign: 'center' },
    2: { cellWidth: anchoGrado, halign: 'center' },
    3: { cellWidth: anchoNombres, halign: 'left' },
  };
  for (let i = 0; i < totalDias; i++) {
    columnStyles[4 + i] = { cellWidth: anchoDia, halign: 'center' };
  }
  columnStyles[4 + totalDias] = { cellWidth: anchoObservacion, halign: 'left' };

  doc.autoTable({
    head, body,
    startY: 26,
    margin: { top: 26, left: margenLateral, right: margenLateral },
    tableWidth: anchoUtil,
    theme: 'grid',
    styles: { fontSize: 6, cellPadding: 1, lineColor: [150, 150, 150], lineWidth: 0.1, overflow: 'linebreak' },
    headStyles: { fillColor: NAVY, textColor: BLANCO },
    columnStyles,
    didParseCell: (hookData) => {
      // Pintar de amarillo las columnas de días (índices 4 al 4+totalDias-1) en el cuerpo
      const idx = hookData.column.index;
      if (hookData.section === 'body' && idx >= 4 && idx < 4 + totalDias) {
        hookData.cell.styles.fillColor = AMARILLO;
      }
      // Tamaño de letra fijo y estándar para Apellidos y Nombres (columna 3).
      // Los nombres largos se ajustan a dos líneas dentro de la celda
      // (overflow:'linebreak' ya lo maneja autoTable) en vez de achicar la fuente.
      if (hookData.section === 'body' && idx === 3) {
        hookData.cell.styles.fontSize = 6;
      }
    },
    didDrawPage: () => {
      dibujarBanner();
    }
  });

  const altoPagina = doc.internal.pageSize.getHeight();
  let y = doc.lastAutoTable.finalY + 6;
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.1);

  // ── Verificar espacio disponible: si Nomenclatura + Certificación + firma
  //    no caben en lo que queda de la página, saltar a una nueva página ──
  const altoNomenclatura = 6 + (CODIGOS_VALIDOS.length * 4.6);
  const altoCertificacionYFirma = 6 + 6 + 8 + 18;
  const margenInferior = 12;
  const altoNecesario = 6 /* espacio antes de nomenclatura */ + altoNomenclatura + 6 + altoCertificacionYFirma;
  if (y + altoNecesario > altoPagina - margenInferior) {
    doc.addPage();
    dibujarBanner();
    y = 30;
  }

  // ── Nomenclatura ──
  doc.setFillColor(...NAVY);
  doc.rect(10, y, anchoPagina - 20, 6, 'FD');
  doc.setTextColor(...BLANCO);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('NOMENCLATURA', anchoPagina / 2, y + 4.2, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y += 6;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  const altoFilaNom = 4.6;
  CODIGOS_VALIDOS.forEach(c => {
    doc.setFillColor(...VERDE_CLARO);
    doc.rect(10, y, anchoPagina - 20, altoFilaNom, 'FD');
    doc.setFont(undefined, 'bold');
    doc.text(c, 12, y + 3.2);
    doc.setFont(undefined, 'normal');
    doc.text(`— ${CODIGOS_DESC[c]}`, 24, y + 3.2);
    y += altoFilaNom;
  });

  y += 6;

  // ── Certificación — se omite en el Reporte General (solo lo usan
  //    Administrador y Supervisor como resumen interno, sin firmas) ──
  if (!esGeneral) {
    doc.setFillColor(...NAVY);
    doc.rect(10, y, anchoPagina - 20, 6, 'FD');
    doc.setTextColor(...BLANCO);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('CERTIFICACIÓN', anchoPagina / 2, y + 4.2, { align: 'center' });
    y += 6;

    const mitadPagina = anchoPagina / 2;
    const anchoCol = mitadPagina - 12;

    // Fila de etiquetas
    doc.setFillColor(...NAVY);
    doc.rect(10, y, anchoCol, 6, 'FD');
    doc.rect(mitadPagina + 2, y, anchoCol, 6, 'FD');
    doc.setTextColor(...BLANCO);
    doc.setFontSize(8);
    doc.text('ELABORADO POR', 10 + anchoCol / 2, y + 4.2, { align: 'center' });
    doc.text('RESPONSABLE', mitadPagina + 2 + anchoCol / 2, y + 4.2, { align: 'center' });
    y += 6;

    // Fila de valores
    doc.setFillColor(...AMARILLO);
    doc.rect(10, y, anchoCol, 8, 'FD');
    doc.rect(mitadPagina + 2, y, anchoCol, 8, 'FD');
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(elaboradoPor, 10 + anchoCol / 2, y + 5.2, { align: 'center' });
    doc.text(responsable, mitadPagina + 2 + anchoCol / 2, y + 5.2, { align: 'center' });
    y += 8;

    // ── Recuadro de firma (en blanco) ──
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(255, 255, 255);
    doc.rect(10, y, anchoCol, 18, 'FD');
    doc.rect(mitadPagina + 2, y, anchoCol, 18, 'FD');
  }

  // ── Contador de páginas (pie de cada hoja) ──
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPaginas; p++) {
    doc.setPage(p);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Página ${p} de ${totalPaginas}`, anchoPagina - 12, altoPagina - 4, { align: 'right' });
  }

  doc.save(`novedades_${esGeneral ? 'REPORTE_GENERAL' : area}_${periodo}.pdf`);
}

/* ═════════════════════════════════════════
   PANEL ADMIN — Importar BD
═════════════════════════════════════════ */


/* ══════════════════════════════════
   AREAS
══════════════════════════════════ */
async function poblarAreas(selectId, placeholder='— Seleccione su área —') {
  const sel = $(selectId); if (!sel) return;
  const areas = await obtenerAreasNovedades();
  sel.innerHTML = `<option value="">${placeholder}</option>`;
  areas.forEach(a => { const o=document.createElement('option'); o.value=a; o.textContent=a; sel.appendChild(o); });
}

let comboboxAreaEnvios = null;

async function poblarAreaEnvios() {
  const areas = await obtenerAreasNovedades();
  if (!comboboxAreaEnvios) {
    comboboxAreaEnvios = crearComboboxArea({
      inputId: 'area-select-buscar',
      listaId: 'area-select-lista',
      onSeleccionar: (area) => { $('area-select').value = area; }
    });
  }
  comboboxAreaEnvios.actualizar(areas, $('area-select')?.value || '');
}

/* ══════════════════════════════════
   FILTROS — MES / AÑO (panel admin)
══════════════════════════════════ */
const MESES_FILTRO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function poblarFiltroMes() {
  const sel = $('filtro-mes'); if (!sel) return;
  sel.innerHTML = '<option value="">Todos los meses</option>';
  MESES_FILTRO.forEach((m,i) => {
    const o = document.createElement('option');
    o.value = String(i+1).padStart(2,'0');
    o.textContent = m;
    sel.appendChild(o);
  });
}

/* Se llama cada vez que se cargan datos en el panel admin, para que
   el listado de años refleje los años que realmente tienen envíos */
function poblarFiltroAnio(docs) {
  const sel = $('filtro-anio'); if (!sel) return;
  const valorPrevio = sel.value;
  const anios = [...new Set((docs||[]).map(d => (d.timestamp||'').slice(0,4)).filter(Boolean))]
    .sort((a,b) => b.localeCompare(a));
  const anioActual = String(new Date().getFullYear());
  if (!anios.includes(anioActual)) anios.unshift(anioActual);

  sel.innerHTML = '<option value="">Todos los años</option>';
  anios.forEach(a => {
    const o = document.createElement('option'); o.value=a; o.textContent=a; sel.appendChild(o);
  });
  if (anios.includes(valorPrevio)) sel.value = valorPrevio;
}

/* ══════════════════════════════════
   VISTA SUBIR
══════════════════════════════════ */
function irEnvios() {
  archivoSeleccionado = null;
  informeSeleccionado = null;
  actaSeleccionada    = null;
  const fi=$('file-input');    if(fi) fi.value='';
  const ii=$('informe-input'); if(ii) ii.value='';
  const ai=$('acta-input');    if(ai) ai.value='';
  $('dropzone').style.display    = 'flex';
  $('file-preview').style.display = 'none';
  const id=$('informe-dropzone'); if(id) id.style.display='flex';
  const ip=$('informe-preview');  if(ip) ip.style.display='none';
  const ad=$('acta-dropzone'); if(ad) ad.style.display='flex';
  const ap=$('acta-preview');  if(ap) ap.style.display='none';
  $('progress-wrap').style.display = 'none';
  $('area-select').value = '';
  const asb=$('area-select-buscar'); if (asb) asb.value = '';
  poblarAreaEnvios();
  const det=$('detalle-envio'); if(det) det.value='';
  const bar=$('progress-bar'); if(bar) bar.style.width='0%';
  const ptxt=$('progress-txt'); if(ptxt) ptxt.textContent='0%';
  resetBtn();
  actualizarContadorActa();
  const hn=$('hero-nombre'); if(hn) hn.textContent=usuario?.nombre||usuario?.email||'';
  ir('vista-envios');
  cargarMisEnvios();
}

/* ══════════════════════════════════
   MIS ENVÍOS
══════════════════════════════════ */
async function cargarMisEnvios() {
  const lista=$('mis-envios-lista'); if(!lista||!usuario) return;
  lista.innerHTML=`<div class="mis-envios-vacio"><p style="font-size:12px;color:var(--txt3);">Cargando envíos...</p></div>`;
  try {
    const {where}=await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    const q=window._fb.query(window._fb.collection(db,'entregas'),where('uid','==',usuario.uid));
    const snap=await window._fb.getDocs(q);
    const docs=snap.docs.map(d=>({id:d.id,...d.data()}))
      .sort((a,b)=>(b.timestamp||'').localeCompare(a.timestamp||''));
    if(!docs.length){
      lista.innerHTML=`<div class="mis-envios-vacio">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <p>No hay envíos registrados todavía.</p></div>`;
      return;
    }
    lista.innerHTML=docs.map(d=>`
      <div class="mis-envio-item${d.archivado?' mei-archivado':''}" id="mei-${d.id}">
        <div class="mei-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <div class="mei-info">
          <div class="mei-nombre">${d.nombreArchivo}</div>
          <div class="mei-meta">
            <span class="mei-area">${d.area||'—'}</span>
            &nbsp;·&nbsp;${d.fechaTexto} · ${d.horaTexto}
            &nbsp;·&nbsp;${d.tamanoTexto||'—'}
            ${d.archivado
              ? '&nbsp;·&nbsp;<span style="color:var(--txt3);font-size:10px;font-weight:600;">Archivado</span>'
              : '&nbsp;·&nbsp;<span style="color:var(--blue);font-size:10px;font-weight:500;">↩ Subir de nuevo este mes reemplaza este envío</span>'}
            ${d.comprobanteURL
              ? `&nbsp;·&nbsp;<a href="${d.comprobanteURL}" target="_blank" style="color:#16a34a;font-size:10px;font-weight:600;">🧾 Ver comprobante</a>`
              : ''}
          </div>
        </div>
      </div>`).join('');
  } catch(e) {
    lista.innerHTML=`<div class="mis-envios-vacio"><p style="color:var(--red);font-size:11px;">Error: ${e.message}</p></div>`;
  }
}

/* ══════════════════════════════════
   DOM READY
══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  initFirebase().catch(e => console.error(e));
  poblarAreaEnvios();
  poblarAreas('filtro-area', 'Todas las áreas');
  poblarFiltroMes();
  await new Promise(r => setTimeout(r, 100));

  /* botones */
  $('btn-google')?.addEventListener('click', login);
  document.querySelectorAll('.btn-logout').forEach(b => b.addEventListener('click', logout));
  $('nb-novedades')?.addEventListener('click', () => usuario ? irNovedades() : ir('vista-login'));
  $('nb-envios')?.addEventListener('click', () => usuario ? irEnvios() : ir('vista-login'));
  $('nb-admin')?.addEventListener('click', irAdmin);
  $('nb-reportes')?.addEventListener('click', () => { if (esSupervisor() || tienePermisoAccion('actividad_ver')) irReportes(); });
  $('btn-enviar-otro')?.addEventListener('click', irEnvios);
  $('btn-enviar')?.addEventListener('click', enviarArchivo);
  $('btn-filtrar')?.addEventListener('click', aplicarFiltros);
  $('btn-limpiar')?.addEventListener('click', limpiarFiltros);
  $('btn-excel')?.addEventListener('click', () => exportarExcel(docsAdmin, false));
  $('btn-excel-filtrado')?.addEventListener('click', exportarFiltrado);

  /* pestañas del Panel de Control (Envíos / Importar BD / Accesos / Auditoría / Desbloqueos) */
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      if (!tabPermitido(tabName)) return; // defensa extra, el botón ya está oculto
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
      tab.classList.add('active');
      const content = $(`admin-tab-${tabName}`);
      if (content) content.style.display = 'block';
      if (tabName === 'envios')      cargarAdmin();
      if (tabName === 'accesos')     cargarAccesos();
      if (tabName === 'auditoria')   { poblarFiltrosAuditoria(); cargarAuditoria(); }
      if (tabName === 'desbloqueos') { cargarDesbloqueos(); poblarSelectoresDesbloqueoDirecto(); }
      if (tabName === 'resumen') { poblarSelectoresResumen(); cargarResumenGeneral(); poblarSelectoresResumen('resumen-efectivo'); }
      if (tabName === 'importar') { cargarDirectorioPersonal(); poblarSelectoresBackupManual(); }
      if (tabName === 'areas') cargarAreasPanel();
      if (tabName === 'config') cargarConfigPanel();
      aplicarPermisosBotones();
    });
  });


  /* dropzone Excel */
  const dz = $('dropzone');
  if (dz) {
    dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('dz-over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dz-over'));
    dz.addEventListener('drop',      e => { e.preventDefault(); dz.classList.remove('dz-over'); if(e.dataTransfer.files[0]) seleccionar(e.dataTransfer.files[0]); });
    dz.addEventListener('click',     abrirSelectorArchivo);
  }
  $('file-input')?.addEventListener('change', () => { if($('file-input').files[0]) seleccionar($('file-input').files[0]); });

  /* botón cambiar Excel */
  $('btn-cambiar')?.addEventListener('click', () => {
    archivoSeleccionado = null;
    $('file-preview').style.display = 'none';
    $('dropzone').style.display = 'flex';
    const fi=$('file-input'); if(fi) fi.value='';
    actualizarBotonEnviar();
  });
});

/* ══════════════════════════════════
   SELECTORES DE ARCHIVO
══════════════════════════════════ */
function abrirSelectorArchivo() {
  const i=document.createElement('input'); i.type='file'; i.accept='.rar,.zip,.pdf'; i.style.display='none';
  i.addEventListener('change', () => { if(i.files[0]) seleccionar(i.files[0]); i.remove(); });
  document.body.appendChild(i); i.click();
}

function abrirSelectorActa() {
  const i=document.createElement('input'); i.type='file'; i.accept='.pdf'; i.style.display='none';
  i.addEventListener('change', () => { if(i.files[0]) seleccionarActa(i.files[0]); i.remove(); });
  document.body.appendChild(i); i.click();
}

function abrirSelectorInforme() {
  const i=document.createElement('input'); i.type='file'; i.accept='.pdf'; i.style.display='none';
  i.addEventListener('change', () => { if(i.files[0]) seleccionarInforme(i.files[0]); i.remove(); });
  document.body.appendChild(i); i.click();
}

function seleccionarInforme(f) {
  if (!f) return;
  if (f.name.split('.').pop().toLowerCase() !== 'pdf') { toast('El informe debe ser PDF (.pdf)','err'); return; }
  informeSeleccionado = f;
  const iNombre=$('informe-nombre'); if(iNombre) iNombre.textContent=f.name;
  const iPeso=$('informe-peso');     if(iPeso)   iPeso.textContent=formatSize(f.size);
  const idz=$('informe-dropzone');   if(idz) idz.style.display='none';
  const iprev=$('informe-preview');  if(iprev) iprev.style.display='flex';
  actualizarBotonEnviar();
}

function quitarInforme() {
  informeSeleccionado = null;
  const idz=$('informe-dropzone');  if(idz) idz.style.display='flex';
  const iprev=$('informe-preview'); if(iprev) iprev.style.display='none';
  const ii=$('informe-input'); if(ii) ii.value='';
  actualizarBotonEnviar();
}

function quitarActa() {
  actaSeleccionada = null;
  const ad=$('acta-dropzone'); if(ad) ad.style.display='flex';
  const ap=$('acta-preview');  if(ap) ap.style.display='none';
  actualizarBotonEnviar();
}

function seleccionar(f) {
  const ext = f.name.split('.').pop().toLowerCase();
  if (!['rar','zip','pdf'].includes(ext)) { toast('Solo se aceptan archivos .rar, .zip o .pdf','err'); return; }
  archivoSeleccionado = f;
  $('fp-nombre').textContent = f.name;
  $('fp-peso').textContent   = formatSize(f.size);
  const m=$('fp-modo'); if(m) m.textContent='☁️ Google Drive';
  $('dropzone').style.display     = 'none';
  $('file-preview').style.display = 'flex';
  actualizarBotonEnviar();
}

function seleccionarActa(f) {
  if (!f) return;
  if (f.name.split('.').pop().toLowerCase() !== 'pdf') { toast('El acta debe ser PDF (.pdf)','err'); return; }
  actaSeleccionada = f;
  const an=$('acta-nombre'); if(an) an.textContent=f.name;
  const ap2=$('acta-peso');  if(ap2) ap2.textContent=formatSize(f.size);
  const ad=$('acta-dropzone'); if(ad) ad.style.display='none';
  const ap=$('acta-preview');  if(ap) ap.style.display='flex';
  actualizarBotonEnviar();
}

/* ══════════════════════════════════
   NOMBRADO DE ARCHIVOS — NRO_MES_MES_AREA_AÑO
   El mes que se usa es el MES REPORTADO (mes anterior al
   día de envío), no el mes calendario en que se sube.
══════════════════════════════════ */
const MESES_ES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
  'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];

function obtenerMesReporte() {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
}

function normalizarParaArchivo(txt) {
  return (txt || '').toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // quitar tildes
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')                          // quitar espacios/guiones/etc.
    .trim();
}

function nombreBaseEnvio(areaVal) {
  const mesReporte = obtenerMesReporte();
  const mesNum     = String(mesReporte.getMonth() + 1).padStart(2, '0');
  const mesNombre  = MESES_ES[mesReporte.getMonth()];
  const anio       = mesReporte.getFullYear();
  const areaSlug   = normalizarParaArchivo(areaVal);
  return `${mesNum}_${mesNombre}_${areaSlug}_${anio}`;
}

/* ══════════════════════════════════
   LÓGICA DE PLAZO / ACTA OBLIGATORIA
   Plazo: día 2 del mes. Después del día 2 es tardío y
   se vuelven obligatorios los tres archivos.
══════════════════════════════════ */
function actaEsObligatoriaHoy() {
  return new Date().getDate() > 2;
}

function infoPlazoPorFecha() {
  const ahora           = new Date();
  const dia             = ahora.getDate();
  const mesPasado       = obtenerMesReporte();
  const nombreMesPasado = mesPasado.toLocaleDateString('es-EC',
    { month:'long', year:'numeric', timeZone:'America/Guayaquil' });

  if (dia <= 2) {
    const diasRestantes = 2 - dia;
    return {
      tardio: false,
      mesReporte: nombreMesPasado,
      mensaje: diasRestantes === 0
        ? `Hoy vence el plazo para el reporte de ${nombreMesPasado}`
        : `Envío del reporte de ${nombreMesPasado} · te quedan ${diasRestantes} día${diasRestantes!==1?'s':''} sin acta`
    };
  } else {
    const diasRetraso = dia - 2;
    return {
      tardio: true,
      mesReporte: nombreMesPasado,
      mensaje: `Envío tardío del reporte de ${nombreMesPasado} · ${diasRetraso} día${diasRetraso!==1?'s':''} de retraso — Acta obligatoria`
    };
  }
}

/* Devuelve true si aún estamos antes del día 10 (el dropzone debe estar bloqueado) */
function actaEstaDeshabilitada() {
  return !actaEsObligatoriaHoy();
}

/* Actualiza el contador regresivo / aviso vencimiento del Informativo de Atraso */
function actualizarContadorActa() {
  const cBox = $('acta-countdown');
  const cTxt = $('acta-countdown-txt');
  const dz   = $('acta-dropzone');
  const lbl  = $('acta-label-oblig');
  if (!cBox || !cTxt) return;

  const actaObligatoria = actaEsObligatoriaHoy();
  const dia = new Date().getDate();

  if (!actaObligatoria) {
    /* Antes del día 2: mostrar cuenta regresiva, bloquear dropzone */
    const diasRestantes = 2 - dia;
    cBox.style.background   = '#fef2f2';
    cBox.style.borderColor  = '#fecaca';
    cBox.querySelector('svg').style.stroke = '#ef4444';
    cTxt.style.color = '#ef4444';
    cTxt.textContent = diasRestantes === 0
      ? '⏰ ¡Hoy vence el plazo! Mañana será obligatorio'
      : `⏳ Faltan ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} para que el Informe de Atraso sea obligatorio`;

    if (dz) {
      dz.style.opacity = '0.45';
      dz.style.cursor  = 'not-allowed';
      dz.style.pointerEvents = 'none';
    }
    if (lbl) {
      lbl.textContent = `OBLIGATORIO EN ${diasRestantes} DÍA${diasRestantes !== 1 ? 'S' : ''}`;
      lbl.style.background = '#ef4444';
    }
  } else {
    /* Después del día 2: habilitado y en rojo urgente */
    const diasRetraso = dia - 2;
    cBox.style.background   = '#fff1f2';
    cBox.style.borderColor  = '#fda4af';
    cBox.querySelector('svg').style.stroke = '#dc2626';
    cTxt.style.color = '#dc2626';
    cTxt.textContent = `🚨 Envío tardío — ${diasRetraso} día${diasRetraso !== 1 ? 's' : ''} de retraso · El Informe de Atraso es OBLIGATORIO`;

    if (dz) {
      dz.style.opacity = '1';
      dz.style.cursor  = 'pointer';
      dz.style.pointerEvents = 'auto';
    }
    if (lbl) {
      lbl.textContent = 'OBLIGATORIO — Envío tardío';
      lbl.style.background = '#ef4444';
    }
  }
}

function actualizarBotonEnviar() {
  const btn = $('btn-enviar'); if (!btn) return;
  const actaObligatoria = actaEsObligatoriaHoy();

  /* Actualizar visual del contador */
  actualizarContadorActa();

  /* Si no es obligatoria y había algo seleccionado, limpiarlo */
  if (!actaObligatoria && actaSeleccionada) {
    actaSeleccionada = null;
    const ai=$('acta-input'); if(ai) ai.value='';
    const ad=$('acta-dropzone'); if(ad) ad.style.display='flex';
    const ap=$('acta-preview');  if(ap) ap.style.display='none';
  }

  const listo = !!(archivoSeleccionado && informeSeleccionado && (actaSeleccionada || !actaObligatoria));
  btn.disabled = !listo;
  btn.style.opacity = listo ? '1' : '0.45';
  btn.style.cursor  = listo ? 'pointer' : 'not-allowed';

  const hint = $('enviar-hint');
  if (hint) {
    if (!archivoSeleccionado)
      hint.textContent = 'Suba el archivo (RAR, ZIP o PDF) para habilitar el envío';
    else if (!informeSeleccionado)
      hint.textContent = '⚠️ El Informe de Entrega PDF es obligatorio';
    else if (!actaSeleccionada && actaObligatoria)
      hint.textContent = '⚠️ El Informe de Atraso es obligatorio — pasó el día 2';
    else
      hint.textContent = '';
  }
}

function formatSize(b) {
  return b >= 1024*1024 ? (b/(1024*1024)).toFixed(2)+' MB' : (b/1024).toFixed(1)+' KB';
}

function setProgreso(pct, label) {
  $('progress-bar').style.width = pct+'%';
  $('progress-txt').textContent = pct+'%';
  const l=$('progress-label-txt'); if(l) l.textContent=label||'';
}

/* ══════════════════════════════════
   GOOGLE DRIVE — TOKEN
══════════════════════════════════ */
function obtenerTokenDrive(forzarNuevo=false) {
  if (!forzarNuevo && _driveTokenCache && Date.now() < _driveTokenExpiry)
    return Promise.resolve(_driveTokenCache);
  return new Promise((resolve, reject) => {
    const cargarGIS = () => new Promise((res, rej) => {
      if (window.google?.accounts?.oauth2) { res(); return; }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.onload = res; s.onerror = () => rej(new Error('No se pudo cargar Google Identity Services'));
      document.head.appendChild(s);
    });
    cargarGIS().then(() => {
      let resuelto = false;

      // Si Google no responde en 20 segundos (ventana bloqueada, cerrada
      // sin elegir cuenta, o sin conexión), avisamos en vez de quedarnos
      // esperando en silencio.
      const timeoutId = setTimeout(() => {
        if (resuelto) return;
        resuelto = true;
        toast('✗ No se pudo conectar con Google Drive. Intente de nuevo.', 'err');
        reject(new Error('Tiempo de espera agotado al conectar con Google Drive'));
      }, 20000);

      let client;
      try {
        client = google.accounts.oauth2.initTokenClient({
          client_id: GDRIVE_CONFIG.clientId,
          scope: GDRIVE_CONFIG.scope,
          callback: (resp) => {
            if (resuelto) return;
            resuelto = true;
            clearTimeout(timeoutId);
            if (resp.error) { reject(new Error('Error de autorización: ' + resp.error)); return; }
            _driveTokenCache  = resp.access_token;
            _driveTokenExpiry = Date.now() + 45 * 60 * 1000;
            toast('✓ Conectado a Google Drive');
            resolve(resp.access_token);
          }
        });
        client.requestAccessToken();
      } catch (e) {
        // requestAccessToken lanza error de forma síncrona si el navegador
        // bloqueó la ventana emergente.
        if (!resuelto) {
          resuelto = true;
          clearTimeout(timeoutId);
          toast('✗ Habilite las ventanas emergentes para este sitio e intente de nuevo.', 'err');
          reject(new Error('Ventana emergente de Google bloqueada por el navegador'));
        }
      }
    }).catch(e => reject(e));
  });
}

/* ══════════════════════════════════
   GOOGLE DRIVE — CARPETA POR MES + ÁREA
   Estructura: CARPETA_GENERAL / "MES AÑO" / {ÁREA} / archivo
   El mes usado es el que se está reportando (obtenerMesReporte), el mismo
   que ya se usa para nombrar los archivos — así todas las áreas que suban
   el reporte de un mes quedan agrupadas bajo una sola carpeta de ese mes,
   y se va creando una carpeta nueva automáticamente mes tras mes.
══════════════════════════════════ */
async function obtenerOCrearSubcarpeta(token, nombreArea) {
  const mesReporte = obtenerMesReporte();
  const nombreMes = `${MESES_ES[mesReporte.getMonth()]} ${mesReporte.getFullYear()}`;

  const idCarpetaMes = await obtenerOCrearCarpetaPublica(token, nombreMes, GDRIVE_CARPETA_GENERAL);
  return await obtenerOCrearCarpetaPublica(token, nombreArea, idCarpetaMes);
}

/* Busca una carpeta por nombre dentro de idPadre; si no existe la crea y la
   deja visible para cualquiera con el link (igual que antes para el área). */
async function obtenerOCrearCarpetaPublica(token, nombre, idPadre) {
  const q = encodeURIComponent(
    `mimeType='application/vnd.google-apps.folder' and name='${nombre}' and '${idPadre}' in parents and trashed=false`
  );
  const sr = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`,
    { headers: { 'Authorization': 'Bearer ' + token } }
  );
  if (!sr.ok) throw new Error('Error buscando carpeta: HTTP ' + sr.status);
  const sd = await sr.json();
  if (sd.files?.length > 0) return sd.files[0].id;

  const cr = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nombre, mimeType: 'application/vnd.google-apps.folder', parents: [idPadre] })
  });
  if (!cr.ok) { const e=await cr.json(); throw new Error(e.error?.message||cr.status); }
  const carpeta = await cr.json();
  await fetch(`https://www.googleapis.com/drive/v3/files/${carpeta.id}/permissions`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' })
  });
  toast(`📁 Carpeta "${nombre}" creada ✓`);
  return carpeta.id;
}

/* ══════════════════════════════════
   GOOGLE DRIVE — HELPERS DE NOMBRADO
══════════════════════════════════ */
function mimeTypePorExtension(ext) {
  const e = (ext||'').toLowerCase();
  if (e === 'zip') return 'application/zip';
  if (e === 'rar') return 'application/vnd.rar';
  if (e === 'pdf') return 'application/pdf';
  return 'application/octet-stream';
}

/* Busca archivos con un nombre exacto dentro de una carpeta */
async function buscarArchivoEnCarpeta(token, idCarpeta, nombre) {
  const q = encodeURIComponent(
    `name='${nombre.replace(/'/g,"\\'")}' and '${idCarpeta}' in parents and trashed=false`
  );
  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=10`,
    { headers: { 'Authorization': 'Bearer ' + token } }
  );
  if (!r.ok) return [];
  const d = await r.json();
  return d.files || [];
}

/* Si ya existe un archivo con ese nombre en la carpeta (mismo mes/área), lo elimina
   antes de subir el nuevo — así no se acumulan duplicados del mismo reporte */
async function eliminarSiExiste(token, idCarpeta, nombre) {
  try {
    const existentes = await buscarArchivoEnCarpeta(token, idCarpeta, nombre);
    for (const f of existentes) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    }
  } catch(e) {
    console.warn('No se pudo verificar/eliminar archivo previo en Drive:', e.message);
  }
}

/* ══════════════════════════════════
   GOOGLE DRIVE — SUBIR ARCHIVO
══════════════════════════════════ */
async function subirAGoogleDrive(archivo, nombreFinal, onProgress) {
  const token = await obtenerTokenDrive();
  const area  = $('area-select')?.value;
  if (!area) throw new Error('No se seleccionó área');
  const idSubcarpeta = await obtenerOCrearSubcarpeta(token, area);
  onProgress(25);

  await eliminarSiExiste(token, idSubcarpeta, nombreFinal);
  onProgress(40);

  const ext = nombreFinal.split('.').pop();

  return new Promise((resolve, reject) => {
    const metadata = {
      name:     nombreFinal,
      mimeType: archivo.type || mimeTypePorExtension(ext),
      parents:  [idSubcarpeta]
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', archivo);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.upload.onprogress = e => { if(e.lengthComputable) onProgress(Math.round(40 + (e.loaded/e.total)*50)); };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const resp = JSON.parse(xhr.responseText);
        fetch(`https://www.googleapis.com/drive/v3/files/${resp.id}/permissions`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'reader', type: 'anyone' })
        }).finally(() => resolve(`https://drive.google.com/file/d/${resp.id}/view`));
      } else {
        reject(new Error('HTTP ' + xhr.status + ': ' + xhr.responseText));
      }
    };
    xhr.onerror = () => reject(new Error('Error de red'));
    xhr.send(form);
  });
}

/* ══════════════════════════════════
   GOOGLE DRIVE — HELPERS GENÉRICOS (usados por Backups)
══════════════════════════════════ */
async function obtenerOCrearCarpetaEnPadre(token, nombre, idPadre) {
  const q = encodeURIComponent(
    `mimeType='application/vnd.google-apps.folder' and name='${nombre}' and '${idPadre}' in parents and trashed=false`
  );
  const sr = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`,
    { headers: { 'Authorization': 'Bearer ' + token } }
  );
  if (!sr.ok) throw new Error('Error buscando carpeta: HTTP ' + sr.status);
  const sd = await sr.json();
  if (sd.files?.length > 0) return sd.files[0].id;

  const cr = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nombre, mimeType: 'application/vnd.google-apps.folder', parents: [idPadre] })
  });
  if (!cr.ok) { const e = await cr.json(); throw new Error(e.error?.message || cr.status); }
  const carpeta = await cr.json();
  return carpeta.id;
}

async function obtenerOCrearCarpetaRaiz(token, nombre) {
  const q = encodeURIComponent(
    `mimeType='application/vnd.google-apps.folder' and name='${nombre}' and 'root' in parents and trashed=false`
  );
  const sr = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`,
    { headers: { 'Authorization': 'Bearer ' + token } }
  );
  if (!sr.ok) throw new Error('Error buscando carpeta: HTTP ' + sr.status);
  const sd = await sr.json();
  if (sd.files?.length > 0) return sd.files[0].id;

  const cr = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nombre, mimeType: 'application/vnd.google-apps.folder' })
  });
  if (!cr.ok) { const e = await cr.json(); throw new Error(e.error?.message || cr.status); }
  const carpeta = await cr.json();
  return carpeta.id;
}

async function subirBlobADrive(token, idCarpeta, nombreArchivo, blob, mimeType) {
  const metadata = { name: nombreArchivo, mimeType, parents: [idCarpeta] };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token },
    body: form
  });
  if (!resp.ok) { const e = await resp.json(); throw new Error(e.error?.message || resp.status); }
  return resp.json();
}

async function cargarJSZip() {
  if (!window.JSZip) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  return window.JSZip;
}

/* ══════════════════════════════════
   BACKUP MENSUAL — Novedades, Personal, Accesos, Auditoría, Envíos
══════════════════════════════════ */
const GDRIVE_NOMBRE_CARPETA_BACKUPS = 'Respaldos';

async function existeBackup(periodo) {
  try {
    const ref = window._fb.doc(db, 'backups', periodo);
    const snap = await window._fb.getDoc(ref);
    return snap.exists() && snap.data().estado === 'completo';
  } catch(e) {
    console.warn('No se pudo verificar backup existente:', e);
    return true; // ante la duda, no molestar con el aviso
  }
}

async function verificarBackupPendiente(periodoAnterior) {
  if (!esAdmin()) return;
  try {
    const yaExiste = await existeBackup(periodoAnterior);
    const banner = $('banner-backup-pendiente');
    if (!banner) return;
    if (yaExiste) { banner.style.display = 'none'; return; }
    $('banner-backup-pendiente-txt').textContent =
      `📦 Todavía no hay backup en Drive de ${obtenerNombreMes(periodoAnterior.split('-')[1])} ${periodoAnterior.split('-')[0]}.`;
    banner.dataset.periodo = periodoAnterior;
    banner.style.display = 'flex';
  } catch(e) {
    console.warn('No se pudo verificar el backup pendiente:', e);
  }
}

async function generarBackupMensualManual() {
  const periodo = $('banner-backup-pendiente')?.dataset.periodo;
  if (!periodo) return;
  await generarBackupMensual(periodo, true);
}

async function generarBackupMensual(periodo, manual = false, forzar = false) {
  try {
    if (!forzar && await existeBackup(periodo)) {
      if (manual) toast(`Ya existe un backup de ${periodo} — marque "Forzar" si quiere volver a generarlo`, 'ok');
      $('banner-backup-pendiente') && (($('banner-backup-pendiente').style.display = 'none'));
      return;
    }

    if (manual) toast(`Generando backup de ${periodo}, un momento...`, 'ok');

    const token = await obtenerTokenDrive();
    const idCarpetaBackups = await obtenerOCrearCarpetaRaiz(token, GDRIVE_NOMBRE_CARPETA_BACKUPS);
    const idCarpetaMes     = await obtenerOCrearCarpetaEnPadre(token, periodo, idCarpetaBackups);
    const JSZipLib = await cargarJSZip();
    const zip = new JSZipLib();

    // 1. Novedades del período — todas las áreas
    const areas = await obtenerAreasNovedades();
    const novedadesDump = {};
    for (const area of areas) {
      const ref = window._fb.doc(db, 'novedades', area, periodo, 'datos');
      const snap = await window._fb.getDoc(ref);
      if (snap.exists()) novedadesDump[area] = snap.data();
    }
    zip.file(`novedades_${periodo}.json`, JSON.stringify(novedadesDump, null, 2));

    // 2. Personal (snapshot completo — no tiene dimensión de mes)
    const personalSnap = await window._fb.getDocs(window._fb.collection(db, 'personal'));
    const personalDump = personalSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    zip.file(`personal_${periodo}.json`, JSON.stringify(personalDump, null, 2));

    // 3. Accesos (snapshot completo — no tiene dimensión de mes)
    const accesosSnap = await window._fb.getDocs(window._fb.collection(db, 'accesos'));
    const accesosDump = accesosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    zip.file(`accesos_${periodo}.json`, JSON.stringify(accesosDump, null, 2));

    // 4. Auditoría del mes
    const auditoriaSnap = await window._fb.getDocs(window._fb.collection(db, 'auditoria'));
    const auditoriaMes = auditoriaSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(a => a.timestamp?.toDate && a.timestamp.toDate().toISOString().slice(0, 7) === periodo);
    zip.file(`auditoria_${periodo}.json`, JSON.stringify(auditoriaMes, null, 2));

    // 5. Envíos (entregas) del mes
    const entregasSnap = await window._fb.getDocs(window._fb.collection(db, 'entregas'));
    const entregasMes = entregasSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(e => String(e.timestamp || '').startsWith(periodo));
    zip.file(`entregas_${periodo}.json`, JSON.stringify(entregasMes, null, 2));

    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    await subirBlobADrive(token, idCarpetaMes, `backup_${periodo}.zip`, zipBlob, 'application/zip');

    await window._fb.setDoc(window._fb.doc(db, 'backups', periodo), {
      periodo,
      estado: 'completo',
      generadoPor: usuario.email,
      fecha: new Date(),
      carpetaId: idCarpetaMes,
      cantidadAreas: Object.keys(novedadesDump).length,
      cantidadEntregas: entregasMes.length,
      cantidadAuditoria: auditoriaMes.length
    });

    await registrarEnAuditoria('backup_mensual', null, usuario.email, null, periodo, {},
      `Backup mensual generado en Drive: ${periodo}`);

    const banner = $('banner-backup-pendiente');
    if (banner) banner.style.display = 'none';

    toast(`✅ Backup de ${periodo} guardado en Drive (carpeta "${GDRIVE_NOMBRE_CARPETA_BACKUPS}/${periodo}")`, 'ok');

  } catch(e) {
    console.error('Error generando backup mensual:', e);
    if (manual) toast('❌ Error generando backup: ' + e.message, 'err');
  }
}

function poblarSelectoresBackupManual() {
  const selMes = $('backup-manual-mes');
  const selAnio = $('backup-manual-anio');
  if (!selMes || !selAnio) return;

  if (selMes.options.length === 0) {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    meses.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = String(i + 1).padStart(2, '0');
      opt.textContent = m;
      selMes.appendChild(opt);
    });
  }
  if (selAnio.options.length === 0) {
    const anioActual = new Date().getFullYear();
    for (let a = anioActual - 1; a <= anioActual + 1; a++) {
      const opt = document.createElement('option');
      opt.value = String(a);
      opt.textContent = String(a);
      selAnio.appendChild(opt);
    }
  }

  // Por defecto, apunta al mes anterior (el más común de respaldar)
  const anterior = obtenerPeriodoAnterior(obtenerFechaParts().periodo).split('-');
  selAnio.value = anterior[0];
  selMes.value  = anterior[1];
}

async function generarBackupManualDesdeAdmin() {
  const mes  = $('backup-manual-mes').value;
  const anio = $('backup-manual-anio').value;
  if (!mes || !anio) { toast('Elija mes y año', 'err'); return; }
  const periodo = `${anio}-${mes}`;
  const forzar = $('backup-manual-forzar')?.checked || false;

  const estadoEl = $('backup-manual-estado');
  estadoEl.textContent = `Generando backup de ${periodo}, un momento...`;

  await generarBackupMensual(periodo, true, forzar);

  estadoEl.textContent = '';
}

/* ══════════════════════════════════
   RESTAURAR BACKUP (desde los .json descargados de Drive)
══════════════════════════════════ */
let backupRestoreData = { periodo: null, novedades: null, personal: null, accesos: null, auditoria: null, entregas: null };
let backupRestoreConflictos = [];
let backupRestoreAreasAOmitir = new Set();

function normalizarFechasParaRestaurar(valor) {
  if (valor === null || valor === undefined) return valor;
  if (Array.isArray(valor)) return valor.map(normalizarFechasParaRestaurar);
  if (typeof valor === 'object') {
    // Detecta un Timestamp de Firestore serializado a JSON: { seconds, nanoseconds, ... }
    if (typeof valor.seconds === 'number' && typeof valor.nanoseconds === 'number') {
      return new Date(valor.seconds * 1000);
    }
    const out = {};
    for (const k in valor) out[k] = normalizarFechasParaRestaurar(valor[k]);
    return out;
  }
  return valor;
}

async function analizarArchivosBackup(event) {
  const files = Array.from(event.target.files || []);
  event.target.value = '';
  if (!files.length) return;

  const datos = { periodo: null, novedades: null, personal: null, accesos: null, auditoria: null, entregas: null };

  const asignar = (nombreArchivo, json) => {
    const m = nombreArchivo.match(/(\d{4}-\d{2})/);
    if (m && !datos.periodo) datos.periodo = m[1];

    if (/^novedades_/i.test(nombreArchivo))      datos.novedades = json;
    else if (/^personal_/i.test(nombreArchivo))  datos.personal  = json;
    else if (/^accesos_/i.test(nombreArchivo))   datos.accesos   = json;
    else if (/^auditoria_/i.test(nombreArchivo)) datos.auditoria = json;
    else if (/^entregas_/i.test(nombreArchivo))  datos.entregas  = json;
    else toast(`⚠️ No reconocí "${nombreArchivo}" (nombre esperado: novedades_/personal_/accesos_/auditoria_/entregas_AAAA-MM.json) — se ignora`, 'err');
  };

  for (const file of files) {
    if (/\.zip$/i.test(file.name)) {
      // Backup nuevo formato: un .zip con los .json adentro
      let entradas;
      try {
        const JSZipLib = await cargarJSZip();
        const zip = await JSZipLib.loadAsync(file);
        entradas = Object.values(zip.files).filter(f => !f.dir && /\.json$/i.test(f.name));
      } catch(e) {
        toast(`❌ No se pudo abrir "${file.name}": ${e.message}`, 'err');
        return;
      }
      if (!entradas.length) {
        toast(`❌ "${file.name}" no contiene archivos .json adentro`, 'err');
        return;
      }
      for (const entrada of entradas) {
        let json;
        try {
          json = JSON.parse(await entrada.async('text'));
        } catch(e) {
          toast(`❌ "${entrada.name}" dentro del .zip no es un JSON válido`, 'err');
          return;
        }
        // El nombre puede venir con ruta interna (ej. carpeta/novedades_...json) — usar solo el nombre de archivo
        asignar(entrada.name.split('/').pop(), json);
      }
    } else {
      // Backup formato viejo: .json sueltos
      let json;
      try {
        json = JSON.parse(await file.text());
      } catch(e) {
        toast(`❌ "${file.name}" no es un JSON válido`, 'err');
        return;
      }
      asignar(file.name, json);
    }
  }

  if (!datos.novedades && !datos.personal && !datos.accesos && !datos.auditoria && !datos.entregas) {
    toast('Ningún archivo reconocido. Use el .zip (o los .json sueltos) que descargó de la carpeta de Backups en Drive.', 'err');
    return;
  }
  if (!datos.periodo) {
    toast('No se pudo determinar el mes (AAAA-MM) a partir del nombre de los archivos', 'err');
    return;
  }

  backupRestoreData = datos;

  // Detectar áreas de Novedades que ya tienen datos actuales para ese período
  backupRestoreConflictos = [];
  if (datos.novedades) {
    for (const area of Object.keys(datos.novedades)) {
      try {
        const ref = window._fb.doc(db, 'novedades', area, datos.periodo, 'datos');
        const snap = await window._fb.getDoc(ref);
        if (snap.exists() && (snap.data().agentes || []).length > 0) backupRestoreConflictos.push(area);
      } catch(e) { console.warn('No se pudo verificar', area, e); }
    }
  }
  // Por defecto, ninguna de las áreas en conflicto se sobrescribe (hay que marcarla a propósito)
  backupRestoreAreasAOmitir = new Set(backupRestoreConflictos);

  mostrarPrevisualizacionRestaurarBackup();
}

function mostrarPrevisualizacionRestaurarBackup() {
  const d = backupRestoreData;
  const areasNovedades = d.novedades ? Object.keys(d.novedades) : [];

  $('modal-restaurar-backup-sub').textContent = `Período detectado: ${obtenerNombreMes(d.periodo.split('-')[1])} ${d.periodo.split('-')[0]}`;

  let html = `<div style="padding:14px 16px;font-size:13px;line-height:1.9;">
    <div>📋 Novedades: <strong>${areasNovedades.length ? areasNovedades.length + ' área(s)' : 'no incluido'}</strong></div>
    <div>👤 Personal: <strong>${d.personal ? d.personal.length + ' registros' : 'no incluido'}</strong></div>
    <div>🔑 Accesos: <strong>${d.accesos ? d.accesos.length + ' registros' : 'no incluido'}</strong></div>
    <div>📝 Auditoría: <strong>${d.auditoria ? d.auditoria.length + ' registros' : 'no incluido'}</strong></div>
    <div>📤 Envíos: <strong>${d.entregas ? d.entregas.length + ' registros' : 'no incluido'}</strong></div>
  </div>`;

  if (backupRestoreConflictos.length) {
    html += `<div style="padding:10px 16px;background:#fffbeb;border-top:1px solid #f59e0b;border-bottom:1px solid #f59e0b;font-size:12px;color:#78350f;">
      ⚠️ Estas áreas ya tienen datos actuales en ${d.periodo}. Marque las que quiere <strong>sobrescribir</strong> con lo que trae el backup — las que no marque quedan tal como están hoy:
    </div>`;
    html += `<div style="padding:8px 16px;">` + backupRestoreConflictos.map(a => `
      <label style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;cursor:pointer;">
        <input type="checkbox" onchange="toggleAreaSobrescribirBackup('${a.replace(/'/g,"\\'")}', this.checked)">
        Sobrescribir <strong>${a}</strong>
      </label>
    `).join('') + `</div>`;
  }

  $('modal-restaurar-backup-body').innerHTML = html;
  $('btn-confirmar-restaurar-backup').disabled = false;
  $('btn-confirmar-restaurar-backup').textContent = 'Confirmar restauración';
  $('modal-restaurar-backup').style.display = 'flex';
}

function toggleAreaSobrescribirBackup(area, marcado) {
  if (marcado) backupRestoreAreasAOmitir.delete(area);
  else backupRestoreAreasAOmitir.add(area);
}

function cerrarModalRestaurarBackup() {
  $('modal-restaurar-backup').style.display = 'none';
  backupRestoreData = { periodo: null, novedades: null, personal: null, accesos: null, auditoria: null, entregas: null };
  backupRestoreConflictos = [];
  backupRestoreAreasAOmitir = new Set();
}

async function confirmarRestaurarBackup() {
  const d = backupRestoreData;
  if (!d.periodo) return;

  const btn = $('btn-confirmar-restaurar-backup');
  btn.disabled = true;
  btn.textContent = 'Restaurando...';

  const resumen = { novedades: 0, omitidas: 0, personal: 0, accesos: 0, auditoria: 0, entregas: 0 };

  try {
    if (d.novedades) {
      for (const [area, datosArea] of Object.entries(d.novedades)) {
        if (backupRestoreAreasAOmitir.has(area)) { resumen.omitidas++; continue; }
        const ref = window._fb.doc(db, 'novedades', area, d.periodo, 'datos');
        await window._fb.setDoc(ref, normalizarFechasParaRestaurar(datosArea));
        resumen.novedades++;
      }
    }
    if (d.personal) {
      for (const p of d.personal) {
        const { id, ...resto } = p;
        if (!id) continue;
        await window._fb.setDoc(window._fb.doc(db, 'personal', id), normalizarFechasParaRestaurar(resto));
        resumen.personal++;
      }
    }
    if (d.accesos) {
      for (const a of d.accesos) {
        const { id, ...resto } = a;
        if (!id) continue;
        await window._fb.setDoc(window._fb.doc(db, 'accesos', id), normalizarFechasParaRestaurar(resto));
        resumen.accesos++;
      }
    }
    if (d.auditoria) {
      for (const a of d.auditoria) {
        const { id, ...resto } = a;
        if (!id) continue;
        await window._fb.setDoc(window._fb.doc(db, 'auditoria', id), normalizarFechasParaRestaurar(resto));
        resumen.auditoria++;
      }
    }
    if (d.entregas) {
      for (const e of d.entregas) {
        const { id, ...resto } = e;
        if (!id) continue;
        await window._fb.setDoc(window._fb.doc(db, 'entregas', id), normalizarFechasParaRestaurar(resto));
        resumen.entregas++;
      }
    }

    await registrarEnAuditoria('restaurar_backup', null, usuario.email, null, d.periodo, resumen,
      `Backup restaurado (${d.periodo}) — Novedades: ${resumen.novedades} área(s) (${resumen.omitidas} omitidas), Personal: ${resumen.personal}, Accesos: ${resumen.accesos}, Auditoría: ${resumen.auditoria}, Envíos: ${resumen.entregas}`);

    cerrarModalRestaurarBackup();
    toast(`✅ Backup restaurado — Novedades: ${resumen.novedades}${resumen.omitidas ? ` (${resumen.omitidas} omitidas)` : ''}, Personal: ${resumen.personal}, Accesos: ${resumen.accesos}, Auditoría: ${resumen.auditoria}, Envíos: ${resumen.entregas}`, 'ok');

    if (mesActual === d.periodo) cargarNovedadesActuales();

  } catch(e) {
    console.error('Error restaurando backup:', e);
    toast('❌ Error restaurando: ' + e.message, 'err');
    btn.disabled = false;
    btn.textContent = 'Confirmar restauración';
  }
}

/* ══════════════════════════════════
   GOOGLE DRIVE — SUBIR PDF GENÉRICO
══════════════════════════════════ */
async function subirPDFaGoogleDrive(archivo, nombreFinal, onProgress) {
  const token = await obtenerTokenDrive();
  const area  = $('area-select')?.value;
  if (!area) throw new Error('No se seleccionó área');
  const idSubcarpeta = await obtenerOCrearSubcarpeta(token, area);
  if (onProgress) onProgress(25);

  await eliminarSiExiste(token, idSubcarpeta, nombreFinal);
  if (onProgress) onProgress(40);

  return new Promise((resolve, reject) => {
    const metadata = {
      name:     nombreFinal,
      mimeType: 'application/pdf',
      parents:  [idSubcarpeta]
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', archivo);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.upload.onprogress = e => { if(e.lengthComputable && onProgress) onProgress(Math.round(40 + (e.loaded/e.total)*50)); };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const resp = JSON.parse(xhr.responseText);
        fetch(`https://www.googleapis.com/drive/v3/files/${resp.id}/permissions`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'reader', type: 'anyone' })
        }).finally(() => resolve(`https://drive.google.com/file/d/${resp.id}/view`));
      } else {
        reject(new Error('HTTP ' + xhr.status + ': ' + xhr.responseText));
      }
    };
    xhr.onerror = () => reject(new Error('Error de red'));
    xhr.send(form);
  });
}

/* ══════════════════════════════════
   GOOGLE DRIVE — SUBIR COMPROBANTE PDF
══════════════════════════════════ */
async function subirComprobantePDFaDrive(dataUrl, registro) {
  try {
    const token    = await obtenerTokenDrive();
    const base64   = dataUrl.split(',')[1];
    const byteChars = atob(base64);
    const bytes    = new Uint8Array(byteChars.length);
    for (let i=0; i<byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
    const blob     = new Blob([bytes], { type: 'application/pdf' });

    const fecha    = new Date().toISOString().slice(0,10);
    const nombre   = `COMPROBANTE_${registro}_${fecha}.pdf`;
    const metadata = { name: nombre, mimeType: 'application/pdf', parents: [GDRIVE_CARPETA_COMPROBANTES] };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob, nombre);

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: form }
    );
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'reader', type: 'anyone' })
    });

    const link = `https://drive.google.com/file/d/${data.id}/view`;
    console.log('✓ Comprobante PDF subido a Drive:', link);
    return link;
  } catch(e) {
    console.warn('⚠️ No se pudo subir comprobante a Drive:', e.message);
    return null;
  }
}

/* ══════════════════════════════════
   ENVIAR ARCHIVO — FLUJO PRINCIPAL
══════════════════════════════════ */
async function enviarArchivo() {
  if (!archivoSeleccionado) { toast('Seleccione un archivo (RAR, ZIP o PDF) primero','err'); return; }
  if (!informeSeleccionado) { toast('El Informe de Entrega PDF es obligatorio','err'); return; }

  const actaObligatoria = actaEsObligatoriaHoy();
  if (actaObligatoria && !actaSeleccionada) {
    const _info = infoPlazoPorFecha();
    toast(`⚠️ Envío tardío del reporte de ${_info.mesReporte} — el Acta PDF es obligatoria`, 'err');
    return;
  }

  const areaVal    = $('area-select').value;
  if (!areaVal) { toast('Debe seleccionar su área','err'); return; }
  const detalleVal = ($('detalle-envio')?.value||'').trim();

  /* Nombres estandarizados: NRO_MES_MES_AREA_AÑO (+ sufijo según tipo) */
  const nombreBase        = nombreBaseEnvio(areaVal);
  const extArchivo        = (archivoSeleccionado.name.split('.').pop()||'').toLowerCase();
  const nombreArchivoFinal = `${nombreBase}.${extArchivo}`;
  const nombreInformeFinal = `${nombreBase}_INFORME.pdf`;
  const nombreActaFinal    = actaSeleccionada ? `${nombreBase}_ATRASO.pdf` : null;

  const btn = $('btn-enviar');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Subiendo...';
  $('progress-wrap').style.display = 'block';
  setProgreso(5, 'Preparando...');

  try {
    const ahora      = new Date();
    const fechaTexto = ahora.toLocaleDateString('es-EC',{timeZone:'America/Guayaquil',day:'2-digit',month:'long',year:'numeric'});
    const horaTexto  = ahora.toLocaleTimeString('es-EC',{timeZone:'America/Guayaquil',hour:'2-digit',minute:'2-digit',second:'2-digit'});

    /* 1. Subir archivo principal (RAR/ZIP/PDF) */
    setProgreso(10, 'Subiendo archivo a Google Drive...');
    const storageURL = await subirAGoogleDrive(archivoSeleccionado, nombreArchivoFinal,
      p => setProgreso(10 + Math.round(p*0.20), `Subiendo archivo... ${Math.round(p)}%`));

    /* 2. Subir Informe de Entrega PDF (obligatorio) */
    setProgreso(35, 'Subiendo Informe de Entrega PDF...');
    const informeURL = await subirPDFaGoogleDrive(informeSeleccionado, nombreInformeFinal,
      p => setProgreso(35 + Math.round(p*0.15), `Subiendo Informe... ${Math.round(p)}%`));

    /* 3. Subir Acta PDF (si existe) */
    let actaURL = null;
    if (actaSeleccionada) {
      setProgreso(55, 'Subiendo Acta PDF...');
      actaURL = await subirPDFaGoogleDrive(actaSeleccionada, nombreActaFinal,
        p => setProgreso(55 + Math.round(p*0.10), `Subiendo Acta... ${Math.round(p)}%`));
    }

    const numRegistro = 'RCA-' + Date.now().toString(36).toUpperCase();

    /* 4. Generar comprobante PDF */
    setProgreso(68, 'Generando comprobante PDF...');
    const comprobanteDataUrl = await generarComprobantePDFComoURL({
      nombre:    usuario.nombre,
      email:     usuario.email,
      area:      areaVal,
      archivo:   nombreArchivoFinal,
      informe:   nombreInformeFinal,
      acta:      nombreActaFinal || '—',
      tamano:    formatSize(archivoSeleccionado.size),
      fecha:     fechaTexto,
      hora:      horaTexto,
      registro:  numRegistro,
      driveLink: storageURL,
      informeLink: informeURL || '',
      actaLink:  actaURL || ''
    });

    /* 5. Subir comprobante a Drive */
    setProgreso(78, 'Subiendo comprobante PDF...');
    let comprobanteURL = null;
    if (comprobanteDataUrl) {
      comprobanteURL = await subirComprobantePDFaDrive(comprobanteDataUrl, numRegistro);
    }

    /* 6. Registrar en Firestore (con deduplicación por mes+área) */
    setProgreso(88, 'Registrando en Firestore...');
    const { where, deleteDoc, doc: docRef } =
      await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

    const qDup = window._fb.query(
      window._fb.collection(db,'entregas'),
      where('uid',          '==', usuario.uid),
      where('nombreArchivo','==', nombreArchivoFinal),
      where('area',         '==', areaVal)
    );
    const snapDup = await window._fb.getDocs(qDup);
    for (const ds of snapDup.docs) {
      await deleteDoc(docRef(db,'entregas',ds.id));
    }
    const fueReemplazo = snapDup.docs.length > 0;

    let driveFileId = null;
    const m = storageURL?.match(/\/d\/([a-zA-Z0-9-_]+)\//);
    if (m) driveFileId = m[1];

    await window._fb.addDoc(window._fb.collection(db,'entregas'), {
      uid:           usuario.uid,
      nombre:        usuario.nombre,
      email:         usuario.email,
      foto:          usuario.foto,
      area:          areaVal,
      nombreArchivo: nombreArchivoFinal,
      nombreOriginal: archivoSeleccionado.name,
      nombreInforme: nombreInformeFinal,
      nombreActa:    nombreActaFinal,
      tamanoBytes:   archivoSeleccionado.size,
      tamanoTexto:   formatSize(archivoSeleccionado.size),
      metodo:        'google_drive',
      storageURL,
      informeURL,
      actaURL,
      comprobanteURL,
      driveFileId,
      detalle:       detalleVal,
      registro:      numRegistro,
      fechaTexto,
      horaTexto,
      timestamp:     ahora.toISOString()
    });

    /* 6. Correos */
    setProgreso(93, 'Enviando correos de notificación...');
    try {
      /* Calcular el link de la carpeta real del área en Drive */
      const _tokenMail = _driveTokenCache;
      let _carpetaAreaId = null;
      if (_tokenMail) {
        try { _carpetaAreaId = await obtenerOCrearSubcarpeta(_tokenMail, areaVal); } catch(e) {}
      }
      const linkCarpetaArea = _carpetaAreaId
        ? `https://drive.google.com/drive/folders/${_carpetaAreaId}`
        : `https://drive.google.com/drive/folders/${GDRIVE_CARPETA_GENERAL}`;

      await enviarCorreosNotificacion({
        nombre:         usuario.nombre,
        email:          usuario.email,
        area:           areaVal,
        archivo:        nombreArchivoFinal,
        informe:        nombreInformeFinal,
        acta:           nombreActaFinal || '—',
        tamano:         formatSize(archivoSeleccionado.size),
        fecha:          fechaTexto,
        hora:           horaTexto,
        registro:       numRegistro,
        driveLink:      storageURL,
        informeLink:    informeURL || null,
        actaLink:       actaURL || null,
        linkCarpeta:    linkCarpetaArea,
        comprobanteUrl: comprobanteURL || ''
      });
    } catch(mailErr) {
      console.error('❌ Error enviando correos:', mailErr);
    }

    setProgreso(100, fueReemplazo ? '¡Archivo reemplazado!' : '¡Completado!');
    mostrarExito(areaVal, fechaTexto, horaTexto, nombreArchivoFinal);
    setTimeout(() => ir('vista-exito'), 500);

  } catch(err) {
    console.error(err);
    toast('Error al subir: ' + (err?.message || 'Error desconocido'), 'err');
    $('progress-wrap').style.display = 'none';
    resetBtn();
  }
}

function mostrarExito(area, fecha, hora, nombreArchivoFinal) {
  $('ex-nombre').textContent  = usuario.nombre;
  $('ex-email').textContent   = usuario.email;
  $('ex-area').textContent    = area;
  $('ex-archivo').textContent = nombreArchivoFinal || archivoSeleccionado.name;
  $('ex-tamano').textContent  = formatSize(archivoSeleccionado.size);
  $('ex-fecha').textContent   = fecha;
  $('ex-hora').textContent    = hora;
}

/* ══════════════════════════════════
   GENERAR COMPROBANTE PDF
══════════════════════════════════ */
async function generarComprobantePDFComoURL(d) {
  try {
    if (!window.jspdf) {
      await new Promise((res,rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload=res; s.onerror=rej; document.head.appendChild(s);
      });
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'mm', format:'a4' });
    const W = 210;

    doc.setFillColor(37,99,235);
    doc.rect(0,0,W,50,'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(20); doc.setFont('helvetica','bold');
    doc.text('RCA', W/2, 18.5, { align:'center' });
    doc.setFontSize(11); doc.setFont('helvetica','normal');
    doc.text('Registro y Control de Asistencia · Personal CTE', W/2, 30, { align:'center' });
    doc.setFontSize(9);
    doc.text('Confirmación de entrega registrada exitosamente', W/2, 38, { align:'center' });

    doc.setFillColor(22,163,74);
    doc.circle(W/2, 62, 8, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text('✓', W/2, 66, { align:'center' });

    doc.setTextColor(17,24,39);
    doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('¡Archivo registrado exitosamente!', W/2, 78, { align:'center' });
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.setTextColor(100,116,139);
    doc.text('Su entrega fue guardada correctamente en el sistema RCA.', W/2, 85, { align:'center' });

    const campos = [
      ['ENVIADO POR', d.nombre],
      ['CORREO',      d.email],
      ['ÁREA',        d.area],
      ['ARCHIVO',     d.archivo],
      ['ACTA PDF',    d.acta||'—'],
      ['TAMAÑO',      d.tamano],
      ['FECHA',       d.fecha],
      ['HORA',        d.hora],
    ];
    let y = 95;
    campos.forEach(([lbl,val],i) => {
      doc.setFillColor(i%2===0?248:255, i%2===0?250:255, i%2===0?252:255);
      doc.rect(14, y-5, W-28, 12, 'F');
      doc.setDrawColor(226,232,240); doc.setLineWidth(0.3);
      doc.rect(14, y-5, W-28, 12, 'S');
      doc.setTextColor(148,163,184); doc.setFontSize(7); doc.setFont('helvetica','bold');
      doc.text(lbl, 18, y);
      doc.setTextColor(30,41,59); doc.setFontSize(10); doc.setFont('helvetica','normal');
      const v = String(val||'—');
      doc.text(v.length>55 ? v.substring(0,52)+'...' : v, 70, y);
      y += 13;
    });

    y += 2;
    doc.setFillColor(241,245,249);
    doc.roundedRect(14, y, W-28, 14, 3, 3, 'F');
    doc.setDrawColor(203,213,225); doc.setLineWidth(0.3);
    doc.roundedRect(14, y, W-28, 14, 3, 3, 'S');
    doc.setTextColor(148,163,184); doc.setFontSize(7); doc.setFont('helvetica','bold');
    doc.text('N° DE REGISTRO', 18, y+5);
    doc.setTextColor(26,58,107); doc.setFontSize(12); doc.setFont('helvetica','bold');
    doc.text(d.registro, 70, y+9);

    y += 22;
    doc.setFillColor(255,251,235);
    doc.roundedRect(14, y, W-28, 16, 3, 3, 'F');
    doc.setDrawColor(245,158,11); doc.setLineWidth(0.8);
    doc.line(14, y, 14, y+16);
    doc.setTextColor(120,53,15); doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.text('Guarde este comprobante como respaldo de su entrega en el sistema RCA.', 20, y+6);
    doc.setFont('helvetica','normal');
    doc.text('Su archivo fue almacenado en Google Drive y el registro queda permanente.', 20, y+12);

    doc.setFillColor(37,99,235);
    doc.rect(0, 275, W, 22, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text('Sistema Registro y Control de Asistencia (RCA) — Generado el '+d.fecha+' a las '+d.hora, 14, 284);
    doc.text('sisrca1.github.io', W-14, 284, { align:'right' });
    doc.setFontSize(7); doc.setTextColor(179,207,255);
    doc.text('Este documento es un comprobante automático de su entrega.', W/2, 290, { align:'center' });

    return doc.output('datauristring');
  } catch(e) {
    console.warn('PDF error:', e.message);
    return null;
  }
}

/* ══════════════════════════════════
   GAS MAILER — Notificaciones  v5.6
   ──────────────────────────────────
   CORRECCIONES:
   1. Se abandona el <script> tag (JSONP): GAS redirige a login
      de Google cuando el payload es grande → onload nunca
      dispara con los datos correctos, onerror se ignora.
   2. Se usa fetch() con mode:'no-cors' + method POST.
      • no-cors permite enviar la petición sin preflight.
      • La respuesta es opaca (no se puede leer), pero el
        GAS la recibe y ejecuta _procesarEnvio() sin problema.
   3. El payload ya NO va en la URL (límite ~2000 chars).
      Va en el body como texto plano — GAS lo lee en
      e.postData.contents dentro de doPost().
   4. Se envían los dos correos en secuencia (no en paralelo)
      para evitar que GAS rechace peticiones simultáneas del
      mismo deployment.

   IMPORTANTE: El GAS debe estar desplegado como:
     • Ejecutar como: Yo (el propietario)
     • Quién tiene acceso: Cualquier persona (anónimo)
══════════════════════════════════ */
async function _gasSend(payload) {
  const jsonStr = JSON.stringify(payload);

  // fetch no-cors + POST: sin CORS bloqueante, sin límite de URL
  await fetch(GAS_MAILER_URL, {
    method:  'POST',
    mode:    'no-cors',   // respuesta opaca — aceptable, solo nos importa que llegue
    headers: { 'Content-Type': 'text/plain' },  // 'application/json' dispara preflight en no-cors
    body:    jsonStr
  });
  // no-cors nunca rechaza aunque el servidor devuelva error HTTP —
  // cualquier fallo de red lanzará TypeError, que el caller captura
}

async function enviarCorreoUsuario(datos) {
  await _gasSend({
    tipo:           'usuario',
    email:          datos.email,
    nombre:         datos.nombre,
    area:           datos.area,
    archivo:        datos.archivo,
    informe:        datos.informe     || '—',
    informeLink:    datos.informeLink || '',
    acta:           datos.acta        || '—',
    tamano:         datos.tamano,
    fecha:          datos.fecha,
    hora:           datos.hora,
    registro:       datos.registro,
    comprobanteUrl: datos.comprobanteUrl || ''
  });
  console.log('✓ Correo usuario enviado via GAS');
  toast('Correo de confirmación enviado ✓');
}

async function enviarCorreoAdmin(datos) {
  await _gasSend({
    tipo:        'admin',
    nombre:      datos.nombre,
    email:       datos.email,
    area:        datos.area,
    archivo:     datos.archivo,
    informe:     datos.informe     || '—',
    informeLink: datos.informeLink || '',
    acta:        datos.acta        || '—',
    tamano:      datos.tamano,
    fecha:       datos.fecha,
    hora:        datos.hora,
    registro:    datos.registro,
    driveLink:   datos.driveLink   || '',
    actaLink:    datos.actaLink    || '',
    linkCarpeta: datos.linkCarpeta || `https://drive.google.com/drive/folders/${GDRIVE_CARPETA_GENERAL}`
  });
  console.log('✓ Alerta admin enviada via GAS');
}

async function enviarCorreosNotificacion(datos) {
  // Secuencial: evita que GAS rechace dos peticiones simultáneas
  try {
    await enviarCorreoAdmin(datos);
  } catch(e) {
    console.error('❌ Correo ADMIN no enviado:', e.message);
  }
  try {
    await enviarCorreoUsuario(datos);
  } catch(e) {
    console.error('❌ Correo USUARIO no enviado:', e.message);
    toast('⚠️ No se pudo enviar el correo de confirmación', 'err');
  }
}

/* ══════════════════════════════════
   PANEL ADMIN
══════════════════════════════════ */

/* Abre en una pestaña nueva la carpeta de Drive de un área para el mes que
   se está reportando ahora (CARPETA_GENERAL / MES AÑO / ÁREA). */
async function abrirCarpetaArea(area) {
  if (!area) { toast('No se encontró el área para abrir la carpeta','err'); return; }
  try {
    toast(`Abriendo carpeta de ${area}...`);
    const token = await obtenerTokenDrive();
    const idCarpeta = await obtenerOCrearSubcarpeta(token, area);
    window.open(`https://drive.google.com/drive/folders/${idCarpeta}`, '_blank');
  } catch(e) {
    toast('Error al abrir la carpeta: ' + e.message, 'err');
  }
}

async function cargarAdmin() {
  $('tabla-body').innerHTML     = `<tr><td colspan="9" class="td-vacio">Cargando...</td></tr>`;
  $('admin-personas').innerHTML = `<p class="cargando-txt">Cargando...</p>`;
  docsAdmin = [];
  try {
    const snap = await window._fb.getDocs(window._fb.collection(db,'entregas'));
    docsAdmin  = snap.docs
      .map(d => ({id:d.id,...d.data()}))
      .sort((a,b) => (b.timestamp||'').localeCompare(a.timestamp||''));
    poblarFiltroAnio(docsAdmin);
    renderAdmin(docsAdmin);
  } catch(e) {
    console.error('cargarAdmin error:', e);
    $('tabla-body').innerHTML = `<tr><td colspan="9" class="td-vacio" style="color:var(--red)">Error al cargar: ${e.message}</td></tr>`;
    toast('Error al cargar: '+e.message,'err');
  }
}

const POR_PAGINA_ENVIOS = 10;
let personasCache = [];
let paginaPersonas = 1;
let docsCache = [];
let paginaArchivos = 1;

function renderAdmin(docs) {
  const unicos = [...new Set(docs.map(d=>d.email))];
  $('st-total').textContent  = docs.length;
  $('st-unicos').textContent = unicos.length;
  $('st-ultimo').textContent = docs.length ? `${docs[0].fechaTexto} · ${docs[0].horaTexto}` : 'Sin entregas aún';

  const porPersona = {};
  docs.forEach(d => {
    if (!porPersona[d.email]) porPersona[d.email]={...d,cant:0,areas:new Set()};
    porPersona[d.email].cant++;
    if(d.area) porPersona[d.email].areas.add(d.area);
  });

  personasCache = Object.values(porPersona).sort((a,b)=>b.cant-a.cant);
  docsCache = docs;
  paginaPersonas = 1;
  paginaArchivos = 1;

  renderizarPersonasPagina();
  renderizarArchivosPagina();

  $('filtro-resultado').textContent = `${docs.length} registro${docs.length!==1?'s':''} encontrado${docs.length!==1?'s':''}`;
}

function renderizarControlesPaginacion(contenedorId, totalItems, paginaActual, funcCambiarPagina) {
  const totalPaginas = Math.max(1, Math.ceil(totalItems / POR_PAGINA_ENVIOS));
  const cont = $(contenedorId);
  if (!cont) return;
  if (totalItems <= POR_PAGINA_ENVIOS) { cont.innerHTML = ''; return; }
  cont.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
      <span style="font-size:12px;color:var(--txt2);">${totalItems} en total — página ${paginaActual} de ${totalPaginas}</span>
      <div style="display:flex;gap:8px;">
        <button class="btn-acc btn-acc-ghost" ${paginaActual<=1?'disabled':''} onclick="${funcCambiarPagina}(-1)">← Anterior</button>
        <button class="btn-acc btn-acc-ghost" ${paginaActual>=totalPaginas?'disabled':''} onclick="${funcCambiarPagina}(1)">Siguiente →</button>
      </div>
    </div>`;
}

function renderizarPersonasPagina() {
  const inicio = (paginaPersonas - 1) * POR_PAGINA_ENVIOS;
  const pagina = personasCache.slice(inicio, inicio + POR_PAGINA_ENVIOS);

  $('admin-personas').innerHTML = pagina.map(p=>`
    <div class="persona-row">
      <img class="persona-foto" src="${p.foto||avatar(p.nombre)}" alt="" onerror="this.src='${avatar(p.nombre)}'">
      <div class="persona-info">
        <div class="persona-nombre">${p.nombre||'—'}</div>
        <div class="persona-email">${p.email}</div>
        <div class="persona-ultima">Área(s): ${[...p.areas].join(', ')||'—'} · Último: ${p.fechaTexto} · ${p.horaTexto}</div>
      </div>
      <button type="button" class="persona-badge persona-badge-link" onclick="abrirCarpetaArea('${p.area||''}')" title="Abrir carpeta de ${p.area||'su área'} en Drive">${p.cant} archivo${p.cant>1?'s':''}</button>
    </div>`).join('') || '<p class="cargando-txt">Sin entregas</p>';

  renderizarControlesPaginacion('admin-personas-paginacion', personasCache.length, paginaPersonas, 'cambiarPaginaPersonasEnvio');
}

function cambiarPaginaPersonasEnvio(delta) {
  const totalPaginas = Math.max(1, Math.ceil(personasCache.length / POR_PAGINA_ENVIOS));
  paginaPersonas = Math.min(totalPaginas, Math.max(1, paginaPersonas + delta));
  renderizarPersonasPagina();
}

function renderizarArchivosPagina() {
  const inicio = (paginaArchivos - 1) * POR_PAGINA_ENVIOS;
  const pagina = docsCache.slice(inicio, inicio + POR_PAGINA_ENVIOS);

  $('tabla-body').innerHTML = !docsCache.length
    ? `<tr><td colspan="9" class="td-vacio">No hay registros</td></tr>`
    : pagina.map((d,i) => `
      <tr class="${d.archivado?'tr-archivado':''}">
        <td class="td-n">${inicio + i + 1}</td>
        <td><div class="td-user">
          <img class="td-foto" src="${d.foto||avatar(d.nombre)}" alt="" onerror="this.src='${avatar(d.nombre)}'">
          <div><div class="td-nombre">${d.nombre||'—'}</div><div class="td-email">${d.email}</div></div>
        </div></td>
        <td><span class="badge-area">${d.area||'—'}</span></td>
        <td class="td-arch">${renderDescarga(d)}</td>
        <td class="td-detalle" title="${d.detalle||'—'}">${d.detalle?(d.detalle.length>40?d.detalle.slice(0,40)+'…':d.detalle):'<span style="color:#9ca3af">—</span>'}</td>
        <td class="td-peso">${d.tamanoTexto||'—'}</td>
        <td class="td-fecha">${d.fechaTexto}</td>
        <td class="td-hora">${d.horaTexto}</td>
        <td>${d.archivado
          ? `<span class="badge-archivado">Archivado</span>`
          : `<span class="badge-activo">Activo</span>`}</td>
      </tr>`).join('');

  renderizarControlesPaginacion('tabla-body-paginacion', docsCache.length, paginaArchivos, 'cambiarPaginaArchivosEnvio');
}

function cambiarPaginaArchivosEnvio(delta) {
  const totalPaginas = Math.max(1, Math.ceil(docsCache.length / POR_PAGINA_ENVIOS));
  paginaArchivos = Math.min(totalPaginas, Math.max(1, paginaArchivos + delta));
  renderizarArchivosPagina();
}

function renderDescarga(d) {
  const svg=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
  if (d.storageURL) return `<a href="${d.storageURL}" target="_blank" class="link-archivo">${svg}${d.nombreArchivo}</a>`;
  return `<span style="color:var(--txt3);font-size:12px;">${d.nombreArchivo||'—'}</span>`;
}

/* ══════════════════════════════════
   FILTROS
══════════════════════════════════ */
function filtrarDocs(docs) {
  const area   = $('filtro-area').value.toLowerCase();
  const nombre = $('filtro-nombre').value.trim().toLowerCase();
  const email  = $('filtro-email').value.trim().toLowerCase();
  const fd     = $('filtro-fecha-desde').value;
  const fh     = $('filtro-fecha-hasta').value;
  const mes    = $('filtro-mes')?.value || '';
  const anio   = $('filtro-anio')?.value || '';
  let r = [...docs];
  if (area)   r=r.filter(d=>(d.area||'').toLowerCase().includes(area));
  if (nombre) r=r.filter(d=>(d.nombre||'').toLowerCase().includes(nombre));
  if (email)  r=r.filter(d=>(d.email||'').toLowerCase().includes(email));
  if (fd)     r=r.filter(d=>d.timestamp>=new Date(fd).toISOString());
  if (fh)     { const h=new Date(fh); h.setHours(23,59,59); r=r.filter(d=>d.timestamp<=h.toISOString()); }
  if (mes)    r=r.filter(d=>(d.timestamp||'').slice(5,7)===mes);
  if (anio)   r=r.filter(d=>(d.timestamp||'').slice(0,4)===anio);
  return r;
}

function aplicarFiltros() { renderAdmin(filtrarDocs(docsAdmin)); }
function limpiarFiltros() {
  ['filtro-area','filtro-nombre','filtro-email','filtro-fecha-desde','filtro-fecha-hasta','filtro-mes','filtro-anio']
    .forEach(id => { const e=$(id); if(e) e.value=''; });
  renderAdmin(docsAdmin);
}
function exportarFiltrado() { exportarExcel(filtrarDocs(docsAdmin), true); }

/* ══════════════════════════════════
   EXPORTAR EXCEL
══════════════════════════════════ */
const avatar = n =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(n||'?')}&background=1d4ed8&color=fff`;

async function exportarExcel(docs, filtrado=false) {
  if (!window.XLSX) {
    await new Promise((res,rej) => {
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload=res; s.onerror=rej; document.head.appendChild(s);
    });
  }
  const filas = docs.map((d,i) => ({
    '#':i+1, 'Nombre':d.nombre||'—', 'Correo':d.email||'—', 'Área':d.area||'—',
    'Archivo':d.nombreArchivo||'—', 'Acta':d.nombreActa||'—',
    'Descripción':d.detalle||'—', 'Peso':d.tamanoTexto||'—',
    'Fecha':d.fechaTexto||'—', 'Hora':d.horaTexto||'—',
    'Estado':d.archivado?'ARCHIVADO':'Activo',
    'Link Drive':d.storageURL||'—',
    'Link Comprobante':d.comprobanteURL||'—'
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(filas);
  ws['!cols'] = [{wch:4},{wch:28},{wch:34},{wch:22},{wch:38},{wch:30},{wch:40},{wch:12},{wch:22},{wch:14},{wch:12},{wch:50},{wch:50}];
  XLSX.utils.book_append_sheet(wb, ws, 'Entregas');
  XLSX.writeFile(wb, `informe_RCA${filtrado?'_filtrado':'_completo'}_${new Date().toISOString().slice(0,10)}.xlsx`);
  toast(`Informe${filtrado?' filtrado':''} descargado ✓`);
}

/* ══════════════════════════════════
   ARCHIVADO MENSUAL
══════════════════════════════════ */
window.verificarChecks = function() {
  const ok = $('check1')?.checked && $('check2')?.checked && $('check3')?.checked;
  const btn = $('arch-btn-descargar'); if(btn) btn.disabled=!ok;
};

function labelMes(ts) {
  return new Date(ts).toLocaleDateString('es-EC',
    { month:'long', year:'numeric', timeZone:'America/Guayaquil' });
}

function abrirModalArchivado() {
  const mesesMap = {};
  docsAdmin.forEach(d => {
    if (d.archivado || !d.storageURL) return;
    const mes = d.timestamp.slice(0,7);
    if (!mesesMap[mes]) mesesMap[mes] = { docs:[], label: labelMes(d.timestamp) };
    mesesMap[mes].docs.push(d);
  });
  const meses = Object.entries(mesesMap).sort((a,b)=>b[0].localeCompare(a[0]));
  if (!meses.length) { toast('No hay archivos pendientes de archivar'); return; }

  const sel = $('arch-mes-select');
  sel.innerHTML = '<option value="">— Seleccione el mes —</option>';
  meses.forEach(([k,v]) => {
    const o=document.createElement('option'); o.value=k;
    o.textContent=`${v.label} (${v.docs.length} archivo${v.docs.length>1?'s':''})`;
    sel.appendChild(o);
  });
  window._archMeses = mesesMap;
  $('modal-archivado').style.display = 'flex';
  $('arch-paso1').style.display = 'block';
  $('arch-paso2').style.display = 'none';
  $('arch-paso3').style.display = 'none';
  $('arch-btn-siguiente').disabled = true;
}

function seleccionarMesArchivado() {
  const mes = $('arch-mes-select').value;
  $('arch-btn-siguiente').disabled = !mes;
  if (!mes) return;
  const info = window._archMeses[mes];
  $('arch-resumen').innerHTML = `
    <div class="arch-stat"><span>${info.docs.length}</span> archivos a descargar y archivar</div>
    <div class="arch-personas">${info.docs.map(d=>`
      <div class="arch-persona-row">
        <img src="${d.foto||avatar(d.nombre)}" alt="" onerror="this.src='${avatar(d.nombre)}'">
        <div>
          <div class="arch-persona-nombre">${d.nombre||'—'} <span class="badge-area" style="font-size:10px">${d.area||''}</span></div>
          <div class="arch-persona-archivo">${d.nombreArchivo} · ${d.tamanoTexto||'—'}</div>
        </div>
      </div>`).join('')}</div>`;
}

function archPaso2() {
  const mes = $('arch-mes-select').value; if(!mes) return;
  $('arch-paso1').style.display = 'none'; $('arch-paso2').style.display = 'block';
  const info = window._archMeses[mes];
  $('arch-advertencia-detalle').textContent =
    `Se descargarán ${info.docs.length} archivo(s) de ${labelMes(info.docs[0].timestamp)}. Después podrás eliminar los binarios. El historial quedará guardado.`;
}

async function descargarMesCompleto() {
  const mes = $('arch-mes-select').value;
  const info = window._archMeses[mes];
  $('arch-paso2').style.display = 'none'; $('arch-paso3').style.display = 'block';
  $('arch-progreso-txt').textContent = 'Abriendo archivos de Drive...';
  let ok = 0;
  for (let i=0; i<info.docs.length; i++) {
    const d = info.docs[i];
    $('arch-progreso-bar').style.width = Math.round(((i+1)/info.docs.length)*100)+'%';
    $('arch-progreso-txt').textContent = `Abriendo ${i+1} de ${info.docs.length}: ${d.nombreArchivo}`;
    try { if(d.storageURL) window.open(d.storageURL,'_blank'); ok++; } catch(e) {}
    await new Promise(r => setTimeout(r,400));
  }
  $('arch-progreso-txt').textContent = `✓ ${ok} de ${info.docs.length} archivos abiertos`;
  $('arch-btn-archivar').style.display = 'block';
  $('arch-btn-archivar').onclick = () => confirmarArchivar(mes, info.docs);
}

async function confirmarArchivar(mes, docs) {
  $('arch-btn-archivar').disabled = true; $('arch-btn-archivar').textContent = 'Archivando...';
  try {
    const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    let p = 0;
    for (const d of docs) {
      $('arch-progreso-bar').style.width = Math.round(((p+1)/docs.length)*100)+'%';
      await updateDoc(doc(db,'entregas',d.id), {
        archivado:      true,
        fechaArchivado: new Date().toISOString(),
        notaArchivado:  `Archivado el ${new Date().toLocaleDateString('es-EC',{timeZone:'America/Guayaquil',day:'2-digit',month:'long',year:'numeric'})}`
      });
      p++; await new Promise(r => setTimeout(r,150));
    }
    $('arch-progreso-txt').textContent = `✓ ${p} registros archivados.`;
    $('arch-btn-archivar').textContent = '✓ Completado';
    setTimeout(async () => {
      cerrarModalArchivado(); await cargarAdmin(); toast(`Mes archivado ✓`);
    }, 2000);
  } catch(e) {
    toast('Error al archivar: '+e.message,'err');
    $('arch-btn-archivar').disabled = false; $('arch-btn-archivar').textContent = 'Reintentar';
  }
}

function cerrarModalArchivado() { $('modal-archivado').style.display = 'none'; }

/* ══════════════════════════════════
   ELIMINAR REGISTROS BD
   FIX v5.2: limpia UI inmediatamente tras borrar
══════════════════════════════════ */
function abrirModalLimpiarDuplicados() {
  $('limpieza-contenido').style.display = 'block';
  $('limpieza-progreso').style.display  = 'none';
  $('check-confirmar').checked = false;
  $('btn-iniciar-limpieza').disabled = true;
  $('elim-preview-result').style.display = 'none';
  $('elim-fecha-desde').value = '';
  $('elim-fecha-hasta').value = new Date().toISOString().slice(0,10);
  $('modal-limpiar-duplicados').style.display = 'flex';
}

function cerrarModalLimpiarDuplicados() { $('modal-limpiar-duplicados').style.display = 'none'; }

window.verificarCheckLimpieza = function() {
  $('btn-iniciar-limpieza').disabled = !$('check-confirmar').checked;
};

async function _obtenerRegistrosEnRango() {
  const fd = $('elim-fecha-desde').value;
  const fh = $('elim-fecha-hasta').value;

  const snap = await window._fb.getDocs(window._fb.collection(db,'entregas'));
  let entregas = snap.docs.map(d => ({id:d.id,...d.data()}));

  if (!fd && !fh) return entregas;

  entregas = entregas.filter(d => {
    if (!d.timestamp) return true;
    const fechaDoc = d.timestamp.slice(0, 10);
    if (fd && fechaDoc < fd) return false;
    if (fh && fechaDoc > fh) return false;
    return true;
  });

  return entregas;
}

window.previsualizarEliminacion = async function() {
  const btn = $('btn-preview-eliminar');
  btn.textContent = 'Consultando...'; btn.disabled = true;
  try {
    const registros = await _obtenerRegistrosEnRango();
    const res = $('elim-preview-result');
    res.style.display = 'block';
    if (!registros.length) {
      res.style.background='#fff7ed'; res.style.borderColor='#fed7aa'; res.style.color='#c2410c';
      res.textContent = '⚠️ No se encontraron registros en ese rango de fechas.';
    } else {
      res.style.background='#f0fdf4'; res.style.borderColor='#bbf7d0'; res.style.color='#15803d';
      res.textContent = `✓ Se eliminarán ${registros.length} registro${registros.length!==1?'s':''} de Firestore (los archivos en Drive no se tocan).`;
    }
  } catch(e) {
    toast('Error al consultar: '+e.message,'err');
  } finally {
    btn.textContent = 'Ver cuántos registros se borrarán'; btn.disabled = false;
  }
};

async function iniciarLimpiezaDuplicados() {
  $('limpieza-contenido').style.display = 'none';
  $('limpieza-progreso').style.display  = 'block';
  $('limpieza-resultados').innerHTML    = '';
  const log = msg => {
    const el=$('limpieza-resultados');
    el.innerHTML += msg+'\n';
    el.scrollTop = el.scrollHeight;
  };
  try {
    log('🔍 Obteniendo registros en el rango seleccionado...\n');
    const entregas = await _obtenerRegistrosEnRango();
    log(`✓ ${entregas.length} registros encontrados\n`);
    if (!entregas.length) {
      log('ℹ️ No hay registros para eliminar en ese rango.');
      $('limpieza-progreso-bar').style.width='100%';
      $('limpieza-progreso-txt').textContent='Sin registros que eliminar';
      setTimeout(() => cerrarModalLimpiarDuplicados(), 2000);
      return;
    }
    const { deleteDoc, doc: dRef } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    let eliminados = 0;
    for (let i=0; i<entregas.length; i++) {
      const d = entregas[i];
      const pct = Math.round(((i+1)/entregas.length)*100);
      $('limpieza-progreso-bar').style.width = pct+'%';
      $('limpieza-progreso-txt').textContent = `Eliminando ${i+1} de ${entregas.length}...`;
      log(`  🗑️ ${d.nombreArchivo} · ${d.area||'—'} · ${d.fechaTexto||d.timestamp.slice(0,10)}`);
      await deleteDoc(dRef(db,'entregas',d.id));
      eliminados++;
      await new Promise(r => setTimeout(r,80));
    }
    $('limpieza-progreso-bar').style.width='100%';
    $('limpieza-progreso-txt').textContent='✓ Eliminación completada';
    log(`\n✅ ${eliminados} registro${eliminados!==1?'s':''} eliminado${eliminados!==1?'s':''} de Firestore.`);
    log('ℹ️ Los archivos en Google Drive no fueron afectados.');

    docsAdmin = [];
    cerrarModalLimpiarDuplicados();

    const vistaAdmin = $('vista-admin');
    if (vistaAdmin && vistaAdmin.style.display !== 'none') {
      $('tabla-body').innerHTML = `<tr><td colspan="9" class="td-vacio">No hay registros</td></tr>`;
      $('admin-personas').innerHTML = `<p class="cargando-txt">Sin entregas</p>`;
      $('st-total').textContent  = '0';
      $('st-unicos').textContent = '0';
      $('st-ultimo').textContent = 'Sin entregas aún';
      $('filtro-resultado').textContent = '0 registros encontrados';
    }

    const listaMisEnvios = $('mis-envios-lista');
    if (listaMisEnvios) {
      listaMisEnvios.innerHTML = `<div class="mis-envios-vacio">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <p>No hay envíos registrados todavía.</p></div>`;
    }

    toast(`✓ ${eliminados} registro${eliminados!==1?'s':''} eliminado${eliminados!==1?'s':''}`);

  } catch(e) {
    log(`\n❌ Error: ${e.message}`);
    toast('Error: '+e.message,'err');
  }
}

/* ══════════════════════════════════
   PANEL ADMIN — Novedades (Importar BD, Accesos, Auditoría, Desbloqueos)
══════════════════════════════════ */
function sanitizarNombreArea(area) {
  // Firestore usa "/" como separador de ruta — no puede ir dentro de un nombre de área
  return (area || 'SIN ÁREA').replace(/\//g, '-').replace(/\s+/g, ' ').trim();
}

async function importarBaseDatos() {
  try {
    if (!esAdmin()) {
      toast('❌ Solo admin puede importar datos', 'err');
      return;
    }
    
    const coleccion = $('import-coleccion').value.trim();
    const fileInput = $('import-csv');
    
    if (!coleccion) {
      toast('⚠️ Ingrese un nombre para la colección', 'warn');
      return;
    }
    
    if (!fileInput.files || fileInput.files.length === 0) {
      toast('⚠️ Seleccione un archivo CSV o Excel', 'warn');
      return;
    }
    
    toast('⏳ Procesando archivo...', 'ok');
    
    // Leer archivo (CSV o Excel) y convertirlo a filas (array de arrays)
    const file = fileInput.files[0];
    const esExcel = /\.xlsx?$/i.test(file.name);
    let filas = [];

    if (esExcel) {
      if (!window.XLSX) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          s.onload = res; s.onerror = rej; document.head.appendChild(s);
        });
      }
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const primeraHoja = wb.Sheets[wb.SheetNames[0]];
      filas = XLSX.utils.sheet_to_json(primeraHoja, { header: 1, defval: '' })
        .map(fila => fila.map(celda => String(celda ?? '').trim()));
    } else {
      const text = await file.text();
      filas = text.split('\n').filter(l => l.trim())
        .map(linea => linea.split(',').map(p => p.replace(/^"|"$/g, '').trim()));
    }

    if (filas.length < 2) {
      toast('❌ El archivo está vacío o mal formateado', 'err');
      return;
    }
    
    // Detectar columnas por su encabezado, en vez de asumir una posición fija
    // (distintos archivos pueden traer GRADO/CÓDIGO en orden diferente)
    function buscarColumna(headerRow, nombresPosibles) {
      const normalizado = headerRow.map(h => String(h || '').toUpperCase().trim());
      for (const nombre of nombresPosibles) {
        const idx = normalizado.indexOf(nombre);
        if (idx !== -1) return idx;
      }
      return -1;
    }

    const encabezado = filas[0] || [];
    let iCodigo = buscarColumna(encabezado, ['CODIGO', 'CÓDIGO', 'N°', 'Nº', 'NUMERO']);
    let iGrado = buscarColumna(encabezado, ['GRADO']);
    let iApellidos = buscarColumna(encabezado, ['APELLIDOS']);
    let iNombres = buscarColumna(encabezado, ['NOMBRES']);
    let iArea = buscarColumna(encabezado, ['AREA ACTUAL', 'ÁREA ACTUAL', 'AREA', 'ÁREA']);

    // Si no se pudo detectar por encabezado, usar el orden por defecto conocido
    const usoPorDefecto = [iCodigo, iGrado, iApellidos, iNombres, iArea].some(i => i === -1);
    if (usoPorDefecto) {
      iCodigo = 0; iGrado = 1; iApellidos = 2; iNombres = 3; iArea = 4;
      toast('⚠️ No se detectaron los encabezados del archivo, se usó el orden por defecto (Código, Grado, Apellidos, Nombres, Área). Revise que los datos importados sean correctos.', 'err');
    }

    // Parsear filas (saltar encabezado)
    const resultado = $('import-resultado');
    show('import-resultado');
    resultado.style.display = 'block';
    resultado.innerHTML = '⏳ Procesando archivo...';

    const datos = {};
    const personalCompleto = []; // lista completa para autocompletar "Elaborado por" / "Responsable"
    const registrosPersonal = []; // para la colección plana 'personal' (visor paginado/editable)
    for (let i = 1; i < filas.length; i++) {
      const partes = filas[i];
      if (!partes || partes.length < 5 || !String(partes[iCodigo]).trim()) continue;
      
      const area = sanitizarNombreArea(partes[iArea] || 'SIN ÁREA');
      if (!datos[area]) datos[area] = [];
      
      const grado = partes[iGrado] || '';
      const apellidos = partes[iApellidos] || '';
      const nombres = partes[iNombres] || '';
      const nombreCompleto = `${apellidos} ${nombres}`.trim();
      const codigo = String(partes[iCodigo]).trim();

      datos[area].push({
        codigo: codigo,
        grado: grado,
        apellidosNombres: nombreCompleto,
        novedadesPorDia: {},
        observaciones: ''
      });

      personalCompleto.push(`${codigo} - ${grado} ${nombreCompleto}`.trim());
      registrosPersonal.push({ codigo, grado, apellidos, nombres, area });
    }
    
    // Guardar la lista completa de personal (para los selectores de "Elaborado por" / "Responsable").
    // IMPORTANTE: se FUSIONA con la lista que ya existe. Antes esto reemplazaba el
    // documento entero, así que todo efectivo que no viniera en el Excel desaparecía
    // de los selectores aunque siguiera en la institución. Ahora el archivo solo
    // actualiza los códigos que trae; el resto se conserva tal cual.
    let lisConservados = 0, lisActualizados = 0, lisNuevos = 0;
    try {
      const personalRef = window._fb.doc(db, 'sistema', 'personal_lis');
      const lisSnap = await window._fb.getDoc(personalRef);
      const listaPrevia = lisSnap.exists() ? (lisSnap.data().lista || []) : [];

      // La entrada tiene el formato "CODIGO - GRADO APELLIDOS NOMBRES": el código es la llave
      const codigoDeEntrada = (txt) => String(txt || '').split(' - ')[0].replace(/\s+/g, '').toUpperCase();
      const fusionada = new Map();
      listaPrevia.forEach(e => { const c = codigoDeEntrada(e); if (c) fusionada.set(c, e); });
      lisConservados = fusionada.size;

      personalCompleto.forEach(e => {
        const c = codigoDeEntrada(e);
        if (!c) return;
        if (fusionada.has(c)) lisActualizados++; else lisNuevos++;
        fusionada.set(c, e);
      });
      lisConservados -= lisActualizados;

      await window._fb.setDoc(personalRef, {
        lista: Array.from(fusionada.values()).sort((a, b) => a.localeCompare(b, 'es')),
        ultimaActualizacion: new Date()
      });
    } catch(e) {
      console.warn('No se pudo guardar la lista de personal:', e);
    }

    // Guardar la lista real de áreas de Novedades encontradas (para el selector del admin
    // y el Resumen General — la lista fija AREAS es de Envíos y no coincide con el LIS)
    try {
      const areasRef = window._fb.doc(db, 'sistema', 'areas_novedades');
      const areasSnap = await window._fb.getDoc(areasRef);
      const areasPrevias = areasSnap.exists() ? (areasSnap.data().lista || []) : [];
      const areasNuevas = Object.keys(datos);
      const areasUnion = Array.from(new Set([...areasPrevias, ...areasNuevas])).sort();
      await window._fb.setDoc(areasRef, {
        lista: areasUnion,
        ultimaActualizacion: new Date()
      });
    } catch(e) {
      console.warn('No se pudo guardar la lista de áreas:', e);
    }

    // Guardar cada persona en la colección plana 'personal' (visor paginado/editable del admin)
    resultado.innerHTML = '⏳ Guardando el directorio de personal...';
    const tamanioLotePersonal = 100;
    let personalGuardados = 0;
    let personalErrorEjemplo = null;
    for (let i = 0; i < registrosPersonal.length; i += tamanioLotePersonal) {
      const lote = registrosPersonal.slice(i, i + tamanioLotePersonal);
      const resultados = await Promise.allSettled(lote.map(reg =>
        window._fb.setDoc(window._fb.doc(db, 'personal', reg.codigo), {
          ...reg,
          ultimaActualizacion: new Date()
        }, { merge: true })
      ));
      resultados.forEach(r => {
        if (r.status === 'fulfilled') personalGuardados++;
        else if (!personalErrorEjemplo) personalErrorEjemplo = r.reason;
      });
      resultado.innerHTML = `⏳ Guardando el directorio de personal... ${Math.min(i + tamanioLotePersonal, registrosPersonal.length)} / ${registrosPersonal.length}`;
    }
    if (personalErrorEjemplo) {
      console.error('Error guardando el directorio de personal:', personalErrorEjemplo);
      toast(`⚠️ Se guardaron ${personalGuardados}/${registrosPersonal.length} registros en la Base de Personal. Hubo errores — revise los permisos de Firestore para la colección "personal". Detalle: ${personalErrorEjemplo.message || personalErrorEjemplo}`, 'err');
    }
    
    // Guardar en Firestore — se FUSIONA con lo existente, nunca se sobrescribe
    // Un agente que rota de área NO se mueve dentro del mes en curso: se queda
    // donde está con lo ya registrado, y el área nueva del Excel rige desde el
    // mes siguiente. Antes se lo agregaba igual al área nueva y quedaba contado
    // dos veces en el mismo mes, en dos áreas distintas.
    const dateParts = obtenerFechaParts();
    const periodo = dateParts.periodo;

    // Mapa código → área donde el agente YA figura este mes
    resultado.innerHTML = '⏳ Revisando en qué área está cada agente este mes...';
    const ubicacionActual = new Map();
    try {
      const areasConocidas = Array.from(new Set([...(await obtenerAreasNovedades()), ...Object.keys(datos)]));
      const tamanioLoteUbic = 25;
      for (let i = 0; i < areasConocidas.length; i += tamanioLoteUbic) {
        const lote = areasConocidas.slice(i, i + tamanioLoteUbic);
        await Promise.all(lote.map(async area => {
          const snap = await window._fb.getDoc(window._fb.doc(db, 'novedades', area, periodo, 'datos'));
          if (!snap.exists()) return;
          (snap.data().agentes || []).forEach(a => {
            const c = String(a.codigo || '').replace(/\s+/g, '').toUpperCase();
            if (c && !ubicacionActual.has(c)) ubicacionActual.set(c, area);
          });
        }));
      }
    } catch(e) {
      console.warn('No se pudo mapear la ubicación actual de los agentes:', e);
    }

    let noMovidosEsteMes = 0;
    const entradas = Object.entries(datos);
    const tamanioLote = 25;

    for (let i = 0; i < entradas.length; i += tamanioLote) {
      const lote = entradas.slice(i, i + tamanioLote);
      await Promise.all(lote.map(async ([area, agentesNuevos]) => {
        const novedadesRef = window._fb.doc(db, 'novedades', area, periodo, 'datos');
        const existente = await window._fb.getDoc(novedadesRef);
        const dataExistente = existente.exists() ? existente.data() : null;
        const agentesFinal = dataExistente ? [...(dataExistente.agentes || [])] : [];

        agentesNuevos.forEach(nuevo => {
          const codigoNuevoNorm = String(nuevo.codigo || '').replace(/\s+/g, '').toUpperCase();
          const yaExiste = codigoNuevoNorm && agentesFinal.some(a =>
            String(a.codigo || '').replace(/\s+/g, '').toUpperCase() === codigoNuevoNorm
          );
          if (yaExiste) return;

          // Si este mes ya figura en otra área, se respeta esa ubicación:
          // el cambio de área del Excel recién aplica el mes que viene.
          const areaEsteMes = ubicacionActual.get(codigoNuevoNorm);
          if (areaEsteMes && areaEsteMes !== area) { noMovidosEsteMes++; return; }

          agentesFinal.push(nuevo);
        });

        await window._fb.setDoc(novedadesRef, {
          agentes: agentesFinal,
          estado: dataExistente ? dataExistente.estado : 'activo',
          diasBloqueados: dataExistente ? (dataExistente.diasBloqueados || []) : [],
          diasDesbloqueados: dataExistente ? (dataExistente.diasDesbloqueados || []) : [],
          diasNoCompletados: dataExistente ? dataExistente.diasNoCompletados : Array.from({length: 31}, (_, i) => i + 1),
          fechaCreacion: dataExistente ? dataExistente.fechaCreacion : new Date(),
          ultimaModificacion: new Date()
        });
      }));
      resultado.innerHTML = `⏳ Importando... ${Math.min(i + tamanioLote, entradas.length)} / ${entradas.length} áreas procesadas`;
    }
    
    // Log
    await registrarEnAuditoria(
      'importar_bd',
      null,
      null,
      null,
      null,
      {
        coleccion: coleccion,
        totalRegistros: Object.values(datos).reduce((sum, arr) => sum + arr.length, 0),
        areas: Object.keys(datos),
        lis: { conservados: lisConservados, actualizados: lisActualizados, nuevos: lisNuevos },
        noMovidosEsteMes
      },
      `Importación de BD: ${coleccion} — ${lisActualizados} actualizados, ${lisNuevos} nuevos, ${lisConservados} conservados sin tocar`
    );

    resultado.innerHTML = `
      ✅ <strong>Importación exitosa</strong><br>
      Colección: ${coleccion}<br>
      Áreas: ${Object.keys(datos).length}<br>
      Registros en Novedades: ${Object.values(datos).reduce((sum, arr) => sum + arr.length, 0)}<br>
      Registros en Base de Personal: ${personalGuardados} / ${registrosPersonal.length}${personalErrorEjemplo ? ' ⚠️ (hubo errores, ver arriba)' : ' ✅'}
      <hr style="border:none;border-top:1px solid var(--border);margin:10px 0;">
      <strong>No se borró nada de lo que ya tenía:</strong><br>
      · ${lisActualizados} efectivo(s) actualizados desde el archivo<br>
      · ${lisNuevos} efectivo(s) nuevos agregados<br>
      · ${lisConservados} efectivo(s) que no venían en el archivo se conservaron intactos${noMovidosEsteMes ? `<br>· ${noMovidosEsteMes} efectivo(s) cambiaron de área: siguen en su área actual este mes y pasan a la nueva desde el mes siguiente` : ''}
    `;
    show('import-resultado');
    
    toast('✅ Base de datos importada', 'ok');
    
  } catch(e) {
    console.error('Error importando:', e);
    toast('❌ Error: ' + e.message, 'err');
  }
}


/* ═════════════════════════════════════════
   ACTUALIZACIÓN DE ÁREAS DESDE EXCEL — solo administrador
   ─────────────────────────────────────────
   Compara el archivo contra la Base de Personal existente y cambia el
   campo `area` de los códigos que coincidan. Nunca borra registros ni
   modifica grado, apellidos ni nombres. En Novedades del mes en curso,
   cada efectivo que cambia de área queda PARTIDO entre ambas: los días
   antes del corte elegido se quedan en el área anterior (con lo ya
   cargado) y desde ese día pasa a la nueva área (ver aplicarCortesDeArea).
═════════════════════════════════════════ */

let actualizacionAreasPendiente = null; // { cambios:[], sinCambios:n, noEncontrados:[] }

// Lee un CSV/Excel y devuelve filas (array de arrays). Compartido por las
// dos rutinas de carga para no repetir la lectura de archivos.
async function leerArchivoTabular(file) {
  if (/\.xlsx?$/i.test(file.name)) {
    if (!window.XLSX) {
      await new Promise((res, rej) => {
        const sc = document.createElement('script');
        sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        sc.onload = res; sc.onerror = rej; document.head.appendChild(sc);
      });
    }
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' })
      .map(fila => fila.map(celda => String(celda ?? '').trim()));
  }
  const text = await file.text();
  return text.split('\n').filter(l => l.trim())
    .map(linea => linea.split(',').map(pz => pz.replace(/^"|"$/g, '').trim()));
}

const normalizarCodigoPersonal = (c) => String(c || '').replace(/\s+/g, '').toUpperCase();

async function analizarActualizacionAreas() {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }

  const input = $('areas-update-file');
  const cont = $('areas-update-resultado');
  hide('btn-aplicar-areas');
  actualizacionAreasPendiente = null;

  if (!input.files || !input.files.length) { toast('⚠️ Seleccione un archivo', 'err'); return; }

  try {
    cont.style.display = 'block';
    cont.innerHTML = '⏳ Leyendo el archivo...';

    const filas = await leerArchivoTabular(input.files[0]);
    if (filas.length < 2) { cont.innerHTML = '❌ El archivo está vacío o mal formateado'; return; }

    const encabezado = (filas[0] || []).map(h => String(h || '').toUpperCase().trim());
    const buscar = (nombres) => { for (const n of nombres) { const i = encabezado.indexOf(n); if (i !== -1) return i; } return -1; };
    const iCodigo = buscar(['CODIGO', 'CÓDIGO', 'N°', 'Nº', 'NUMERO']);
    const iArea   = buscar(['AREA ACTUAL', 'ÁREA ACTUAL', 'AREA', 'ÁREA', 'AREA NUEVA', 'ÁREA NUEVA']);

    if (iCodigo === -1 || iArea === -1) {
      cont.innerHTML = '❌ No se encontraron las columnas necesarias. El archivo debe tener un encabezado con <strong>CÓDIGO</strong> y <strong>ÁREA</strong>.';
      return;
    }

    cont.innerHTML = '⏳ Comparando contra la Base de Personal...';
    const personalSnap = await window._fb.getDocs(window._fb.collection(db, 'personal'));
    const base = new Map();
    personalSnap.docs.forEach(d => base.set(normalizarCodigoPersonal(d.data().codigo || d.id), { id: d.id, ...d.data() }));

    const cambios = [], noEncontrados = [], repetidos = [];
    const vistos = new Set();
    let sinCambios = 0;

    for (let i = 1; i < filas.length; i++) {
      const fila = filas[i] || [];
      const codigoBruto = String(fila[iCodigo] || '').trim();
      const areaBruta = String(fila[iArea] || '').trim();
      if (!codigoBruto) continue;

      const codigo = normalizarCodigoPersonal(codigoBruto);
      if (vistos.has(codigo)) { repetidos.push(codigoBruto); continue; }
      vistos.add(codigo);

      if (!areaBruta) continue;                       // sin área en el archivo: no se toca
      const registro = base.get(codigo);
      if (!registro) { noEncontrados.push(codigoBruto); continue; }

      const areaNueva = sanitizarNombreArea(areaBruta);
      if (sanitizarNombreArea(registro.area || '') === areaNueva) { sinCambios++; continue; }

      cambios.push({
        id: registro.id,
        codigo: codigoBruto,
        grado: registro.grado || '',
        apellidos: registro.apellidos || '',
        nombres: registro.nombres || '',
        nombre: `${registro.apellidos || ''} ${registro.nombres || ''}`.trim(),
        areaAnterior: registro.area || '(sin área)',
        areaNueva
      });
    }

    actualizacionAreasPendiente = { cambios, sinCambios, noEncontrados, repetidos };

    const listaCambios = cambios.slice(0, 50).map(c =>
      `<tr><td style="padding:3px 8px;">${c.codigo}</td><td style="padding:3px 8px;">${c.nombre}</td>
       <td style="padding:3px 8px;color:var(--txt2);">${c.areaAnterior}</td>
       <td style="padding:3px 8px;">→</td>
       <td style="padding:3px 8px;font-weight:700;">${c.areaNueva}</td></tr>`).join('');

    cont.innerHTML = `
      <strong>Resultado del análisis</strong><br><br>
      · <strong>${cambios.length}</strong> efectivo(s) cambian de área<br>
      · <strong>${sinCambios}</strong> ya estaban en el área correcta (no se tocan)<br>
      · <strong>${noEncontrados.length}</strong> código(s) del archivo no existen en la base — se omiten<br>
      ${repetidos.length ? `· <strong>${repetidos.length}</strong> código(s) repetidos en el archivo — se tomó la primera aparición<br>` : ''}
      ${base.size ? `· ${base.size} efectivo(s) en la base permanecen intactos<br>` : ''}
      ${noEncontrados.length ? `
        <div style="margin-top:12px;padding:10px;background:#fff1f2;border:1px solid #fda4af;border-radius:8px;">
          <strong style="color:var(--red);">Códigos no encontrados — revíselos y corrija el archivo:</strong><br>
          <div style="margin-top:6px;max-height:140px;overflow:auto;font-family:monospace;font-size:11px;">${noEncontrados.join(', ')}</div>
          <button class="btn-acc btn-acc-ghost" style="margin-top:8px;padding:3px 10px;font-size:11px;" onclick="descargarCodigosNoEncontrados()">📥 Descargar lista</button>
        </div>` : ''}
      ${cambios.length ? `
        <div style="margin-top:12px;max-height:260px;overflow:auto;">
          <table style="width:100%;font-size:11px;border-collapse:collapse;">
            <thead><tr style="background:var(--bg);"><th style="padding:4px 8px;text-align:left;">Código</th><th style="padding:4px 8px;text-align:left;">Nombre</th><th style="padding:4px 8px;text-align:left;">Área actual</th><th></th><th style="padding:4px 8px;text-align:left;">Área nueva</th></tr></thead>
            <tbody>${listaCambios}</tbody>
          </table>
          ${cambios.length > 50 ? `<p style="margin-top:6px;color:var(--txt2);">…y ${cambios.length - 50} más.</p>` : ''}
        </div>` : '<br><em>No hay cambios de área que aplicar.</em>'}
    `;

    if (cambios.length) {
      const btn = $('btn-aplicar-areas');
      btn.style.display = 'inline-flex';
      btn.textContent = `✅ Aplicar ${cambios.length} cambio(s) de área`;
    }
  } catch(e) {
    console.error(e);
    cont.innerHTML = '❌ Error leyendo el archivo: ' + e.message;
  }
}

function descargarCodigosNoEncontrados() {
  const lista = actualizacionAreasPendiente?.noEncontrados || [];
  if (!lista.length) return;
  const csv = 'CODIGO NO ENCONTRADO\n' + lista.join('\n');
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `codigos_no_encontrados_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function aplicarActualizacionAreas() {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }
  const pend = actualizacionAreasPendiente;
  if (!pend || !pend.cambios.length) { toast('Primero analice el archivo', 'err'); return; }

  const periodo = obtenerFechaParts().periodo;
  const diaCorte = ajustarDiaAlMes(
    parseInt(($('areas-update-corte') || {}).value, 10) || obtenerFechaParts().dia,
    periodo
  );

  // ── Mes cerrado en el área anterior: esos efectivos se omiten por completo ──
  let cambiosAplicar = pend.cambios;
  let omitidosCerrados = [];
  let avisoCerrados = '';
  try {
    const r = await separarCambiosPorMesCerrado(pend.cambios, periodo);
    cambiosAplicar = r.permitidos;
    omitidosCerrados = r.bloqueados;
  } catch(e) {
    console.error('No se pudo verificar meses cerrados en la actualización por Excel:', e);
  }
  if (omitidosCerrados.length) {
    const lista = omitidosCerrados.slice(0, 15).map(b => `· ${b.codigo} — ${b.nombre} (${b.origen})`).join('\n');
    avisoCerrados = `⚠️ ${omitidosCerrados.length} efectivo(s) NO se moverán porque el mes ${periodo} de su área actual ya está cerrado (informe generado):\n${lista}${omitidosCerrados.length > 15 ? `\n…y ${omitidosCerrados.length - 15} más.` : ''}\n\n`;
  }
  if (!cambiosAplicar.length) {
    toast(`❌ No se aplicó ningún cambio: el mes ${periodo} de todas las áreas actuales ya está cerrado (informe generado)`, 'err');
    return;
  }

  const confirmar = await confirmarAccion(
    avisoCerrados + `Se cambiará el área de ${cambiosAplicar.length} efectivo(s).\n\nNo se borra ningún registro. En Novedades de este mes, cada uno quedará registrado en AMBAS áreas: los días antes del ${diaCorte} en su área anterior (con lo ya cargado) y desde el ${diaCorte} en la nueva área.\n\n¿Confirma?`,
    'Actualizar áreas desde Excel'
  );
  if (!confirmar) return;

  const cont = $('areas-update-resultado');
  try {
    const tamanioLote = 100;
    let aplicados = 0;
    for (let i = 0; i < cambiosAplicar.length; i += tamanioLote) {
      const lote = cambiosAplicar.slice(i, i + tamanioLote);
      await Promise.all(lote.map(c =>
        window._fb.setDoc(window._fb.doc(db, 'personal', c.id), {
          area: c.areaNueva,
          ultimaActualizacion: new Date()
        }, { merge: true })
      ));
      aplicados += lote.length;
      cont.innerHTML = `⏳ Aplicando cambios... ${aplicados} / ${cambiosAplicar.length}`;
    }

    // Sumar al catálogo las áreas nuevas que no existían (unión, nunca reemplazo)
    try {
      const areasRef = window._fb.doc(db, 'sistema', 'areas_novedades');
      const areasSnap = await window._fb.getDoc(areasRef);
      const previas = areasSnap.exists() ? (areasSnap.data().lista || []) : [];
      const union = Array.from(new Set([...previas, ...cambiosAplicar.map(c => c.areaNueva)])).sort();
      if (union.length !== previas.length) {
        await window._fb.setDoc(areasRef, { lista: union, ultimaActualizacion: new Date() });
      }
    } catch(e) {
      console.warn('No se pudo actualizar el catálogo de áreas:', e);
    }

    // Partir en Novedades del mes en curso, respetando el día de corte elegido
    cont.innerHTML = `⏳ Actualizando Novedades de ${periodo}...`;
    let resultadoCorte = { procesados: 0 };
    try {
      resultadoCorte = await aplicarCortesDeArea(
        cambiosAplicar.map(c => ({
          codigo: c.codigo, grado: c.grado, apellidos: c.apellidos, nombres: c.nombres,
          areaAnterior: c.areaAnterior, areaNueva: c.areaNueva
        })),
        diaCorte, periodo
      );
    } catch(e) {
      console.error('No se pudo partir Novedades en la actualización por Excel:', e);
      toast('⚠️ Se actualizó la Base de Personal, pero hubo un error partiendo Novedades: ' + e.message, 'err');
    }

    await registrarEnAuditoria(
      'actualizar_areas_personal', null, usuario.email, null, null,
      { cambios: cambiosAplicar.length, omitidosMesCerrado: omitidosCerrados.map(b => ({ codigo: b.codigo, area: b.origen })), sinCambios: pend.sinCambios, noEncontrados: pend.noEncontrados.length,
        diaCorte, partidosEnNovedades: resultadoCorte.procesados, detalle: cambiosAplicar.slice(0, 200) },
      `Actualización de áreas desde Excel: ${cambiosAplicar.length} efectivos cambiaron de área (corte día ${diaCorte}, ${resultadoCorte.procesados} partidos en Novedades de ${periodo}), ${pend.noEncontrados.length} códigos no encontrados`
    );

    cont.innerHTML = `
      ✅ <strong>${cambiosAplicar.length} área(s) actualizadas</strong><br>
      · ${pend.sinCambios} efectivo(s) ya estaban correctos<br>
      · ${pend.noEncontrados.length} código(s) omitidos por no existir en la base<br>
      · ${resultadoCorte.procesados} efectivo(s) partidos en Novedades de ${periodo}: días antes del ${diaCorte} en su área anterior, desde el ${diaCorte} en la nueva<br>
      · No se borró ningún registro.
      ${omitidosCerrados.length ? `<div style="margin-top:10px;padding:10px;background:#fff1f2;border:1px solid #fda4af;border-radius:8px;"><strong style="color:var(--red);">${omitidosCerrados.length} efectivo(s) omitidos: el mes ${periodo} de su área actual ya está cerrado (informe generado). No se modificó nada de ellos.</strong><div style="margin-top:6px;max-height:140px;overflow:auto;font-family:monospace;font-size:11px;">${omitidosCerrados.map(b => `${b.codigo} — ${b.nombre} (${b.origen})`).join('<br>')}</div></div>` : ''}
    `;
    hide('btn-aplicar-areas');
    actualizacionAreasPendiente = null;
    toast(`✅ ${cambiosAplicar.length} áreas actualizadas · ${resultadoCorte.procesados} partidos en Novedades desde el día ${diaCorte}`, 'ok');
    cargarDirectorioPersonal();
  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
    cont.innerHTML = '❌ Error aplicando los cambios: ' + e.message;
  }
}

/* ═════════════════════════════════════════
   PANEL ADMIN — Corregir/Eliminar datos de un área+mes
═════════════════════════════════════════ */

/* ═════════════════════════════════════════
   VISTA REPORTES — actividad de solo lectura (supervisor)
═════════════════════════════════════════ */

let reporteActividadCache = [];
let paginaReporteActividad = 1;

function renderizarReporteActividadPagina() {
  const inicio = (paginaReporteActividad - 1) * POR_PAGINA_ENVIOS;
  const pagina = reporteActividadCache.slice(inicio, inicio + POR_PAGINA_ENVIOS);

  $('rep-actividad-lista').innerHTML = pagina.map(r => {
    const fecha = r.timestamp?.toDate ? r.timestamp.toDate().toLocaleString('es-EC') : '—';
    return `
      <div style="padding:12px;background:var(--bg);border-radius:8px;border-left:3px solid var(--blue);">
        <div style="font-size:12px;font-weight:600;">${r.descripcion || r.accion}</div>
        <div style="font-size:11px;color:var(--txt2);margin-top:2px;">${r.admin || ''} · ${fecha}</div>
      </div>`;
  }).join('');

  renderizarControlesPaginacion('rep-actividad-paginacion', reporteActividadCache.length, paginaReporteActividad, 'cambiarPaginaReporteActividad');
}

function cambiarPaginaReporteActividad(delta) {
  const totalPaginas = Math.max(1, Math.ceil(reporteActividadCache.length / POR_PAGINA_ENVIOS));
  paginaReporteActividad = Math.min(totalPaginas, Math.max(1, paginaReporteActividad + delta));
  renderizarReporteActividadPagina();
}

async function cargarReportesActividad() {
  const lista = $('rep-actividad-lista');
  lista.innerHTML = `<p class="td-vacio">Cargando...</p>`;
  $('rep-total-acciones').textContent = '—';
  $('rep-total-novedades').textContent = '—';
  $('rep-ultima-actividad').textContent = '—';

  try {
    const hoy = obtenerFechaParts();
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const snap = await window._fb.getDocs(
      window._fb.query(window._fb.collection(db, 'auditoria'), window._fb.orderBy('timestamp', 'desc'), window._fb.limit(200))
    );

    const registros = snap.docs.map(d => d.data());
    reporteActividadCache = registros;
    const esteMs = registros.filter(r => r.timestamp && r.timestamp.toDate && r.timestamp.toDate() >= inicioMes);
    const novedadesEsteMes = esteMs.filter(r => r.accion === 'modificar_novedad' || r.accion === 'modificar_novedad_mes_cerrado').length;

    $('rep-total-acciones').textContent = esteMs.length;
    $('rep-total-novedades').textContent = novedadesEsteMes;

    if (registros.length > 0 && registros[0].timestamp?.toDate) {
      $('rep-ultima-actividad').textContent = registros[0].timestamp.toDate().toLocaleString('es-EC');
    } else {
      $('rep-ultima-actividad').textContent = 'Sin registros';
    }

    if (registros.length === 0) {
      lista.innerHTML = `<p class="td-vacio">Todavía no hay actividad registrada</p>`;
      $('rep-actividad-paginacion').innerHTML = '';
      return;
    }

    paginaReporteActividad = 1;
    renderizarReporteActividadPagina();

  } catch(e) {
    console.error(e);
    lista.innerHTML = `<p class="td-vacio">❌ Error cargando la actividad: ${e.message}</p>`;
  }
}

async function exportarReporteActividadExcel() {
  if (!reporteActividadCache || reporteActividadCache.length === 0) {
    toast('No hay actividad para exportar todavía', 'err');
    return;
  }
  if (!window.ExcelJS) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }

  const NAVY = 'FF1F3864';
  const BLANCO = 'FFFFFFFF';

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Actividad del sistema');

  ws.columns = [
    { key: 'fecha', width: 20 },
    { key: 'admin', width: 26 },
    { key: 'accion', width: 24 },
    { key: 'area', width: 22 },
    { key: 'descripcion', width: 60 },
  ];

  // ── Título ──
  ws.mergeCells(1, 1, 1, 5);
  const tituloCell = ws.getCell(1, 1);
  tituloCell.value = 'COMISIÓN DE TRÁNSITO DEL ECUADOR — ACTIVIDAD DEL SISTEMA';
  tituloCell.font = { bold: true, size: 13, color: { argb: BLANCO } };
  tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  // ── Escudo del Ecuador (izquierda) y sello institucional de la CTE (derecha) ──
  const [escudoB64Act, selloB64Act] = await Promise.all([obtenerEscudoEcuador(), obtenerSelloCTE()]);
  if (escudoB64Act) {
    const logoIdEscudoAct = wb.addImage({ base64: escudoB64Act, extension: 'png' });
    ws.addImage(logoIdEscudoAct, { tl: { col: 0.12, row: 0.1 }, ext: { width: 24, height: 29 } });
  }
  if (selloB64Act) {
    const logoIdSelloAct = wb.addImage({ base64: selloB64Act, extension: 'png' });
    ws.addImage(logoIdSelloAct, { tl: { col: 4.91, row: 0.1 }, ext: { width: 29, height: 29 } });
  }

  // ── Encabezado de columnas ──
  const filaHeaderAct = ws.addRow({ fecha: 'Fecha y hora', admin: 'Realizado por', accion: 'Acción', area: 'Área', descripcion: 'Descripción' });
  filaHeaderAct.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    c.font = { color: { argb: BLANCO }, bold: true };
  });

  reporteActividadCache.forEach(r => {
    ws.addRow({
      fecha: r.timestamp?.toDate ? r.timestamp.toDate().toLocaleString('es-EC') : '',
      admin: r.admin || '',
      accion: r.accion || '',
      area: r.area || '',
      descripcion: r.descripcion || ''
    });
  });

  const bordeDelgado = { style: 'thin', color: { argb: 'FF999999' } };
  ws.eachRow(row => row.eachCell(c => {
    c.border = { top: bordeDelgado, left: bordeDelgado, bottom: bordeDelgado, right: bordeDelgado };
  }));

  // ── Nota de pie de página discreta (no institucional, solo trazabilidad técnica) ──
  const filaFooterActNum = ws.lastRow.number + 2;
  ws.mergeCells(filaFooterActNum, 1, filaFooterActNum, 5);
  const filaFooterAct = ws.getCell(filaFooterActNum, 1);
  const fechaGenAct = new Date().toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  filaFooterAct.value = `Documento generado automáticamente mediante el Sistema Registro y Control de Asistencia (RCA) v1.0 — Unidad de Personal y Movilidad CTE · Generado: ${fechaGenAct}`;
  filaFooterAct.font = { size: 8, italic: true, color: { argb: 'FF888888' } };
  filaFooterAct.alignment = { horizontal: 'center' };

  const buffer = await wb.xlsx.writeBuffer();

  toast('✅ Reporte descargado', 'ok');
}

/* ═════════════════════════════════════════
   PANEL ADMIN — Base de Personal (visor paginado/editable)
═════════════════════════════════════════ */

let personalDirectorioCache = [];
let personalPaginaActual = 1;
const PERSONAL_POR_PAGINA = 20;

async function cargarDirectorioPersonal() {
  // El panel de actualización de áreas y toda la gestión de la Base de
  // Personal (agregar, editar, cambio en lote) son exclusivos del admin
  const panelAreas = $('panel-actualizar-areas');
  if (panelAreas) panelAreas.style.display = esAdmin() ? 'block' : 'none';
  if ($('btn-agregar-personal')) $('btn-agregar-personal').style.display = esAdmin() ? '' : 'none';
  if ($('personal-check-todos')) $('personal-check-todos').style.display = esAdmin() ? '' : 'none';
  if (!esAdmin()) {
    personalSeleccionados.clear();
    hide('personal-cambio-lote');
  }

  const cargando = $('personal-cargando');
  const cont = $('personal-tabla-container');
  hide('personal-paginacion');
  show('personal-cargando');
  cargando.style.display = 'block';
  hide('personal-tabla-container');

  try {
    const snap = await window._fb.getDocs(window._fb.collection(db, 'personal'));
    personalDirectorioCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    personalPaginaActual = 1;
    hide('personal-cargando');
    show('personal-tabla-container');
    cont.style.display = 'block';
    renderizarTablaPersonal();
  } catch(e) {
    console.error(e);
    cargando.textContent = '❌ Error cargando el directorio: ' + e.message;
  }
}

async function exportarDirectorioPersonal() {
  if (!personalDirectorioCache.length) { toast('No hay registros para exportar', 'err'); return; }
  try {
    toast('⏳ Generando archivo...', 'ok');
    if (!window.ExcelJS) {
      await new Promise((res, rej) => {
        const sc = document.createElement('script');
        sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
        sc.onload = res; sc.onerror = rej;
        document.head.appendChild(sc);
      });
    }
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('BASE');

    ws.columns = [
      { header: 'CODIGO',       key: 'codigo',    width: 12 },
      { header: 'GRADO',        key: 'grado',     width: 26 },
      { header: 'APELLIDOS',    key: 'apellidos', width: 28 },
      { header: 'NOMBRES',      key: 'nombres',   width: 28 },
      { header: 'AREA ACTUAL',  key: 'area',      width: 34 },
    ];
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A6E' } };

    [...personalDirectorioCache]
      .sort((a, b) => String(a.codigo || '').localeCompare(String(b.codigo || ''), 'es', { numeric: true }))
      .forEach(p => ws.addRow({
        codigo: p.codigo || '',
        grado: p.grado || '',
        apellidos: p.apellidos || '',
        nombres: p.nombres || '',
        area: p.area || ''
      }));

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `base_personal_actual_${obtenerFechaParts().periodo}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast('✅ Archivo generado', 'ok');
  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

function obtenerPersonalFiltrado() {  const fCodigo = ($('personal-filtro-codigo')?.value || '').toLowerCase().trim();
  const fGrado = ($('personal-filtro-grado')?.value || '').toLowerCase().trim();
  const fNombre = ($('personal-filtro-nombre')?.value || '').toLowerCase().trim();
  const fArea = ($('personal-filtro-area')?.value || '').toLowerCase().trim();

  return personalDirectorioCache.filter(p => {
    if (fCodigo && !String(p.codigo || '').toLowerCase().includes(fCodigo)) return false;
    if (fGrado && !String(p.grado || '').toLowerCase().includes(fGrado)) return false;
    if (fNombre && !`${p.apellidos || ''} ${p.nombres || ''}`.toLowerCase().includes(fNombre)) return false;
    if (fArea && !String(p.area || '').toLowerCase().includes(fArea)) return false;
    return true;
  });
}

function filtrarPersonal() {
  personalPaginaActual = 1;
  renderizarTablaPersonal();
}

function cambiarPaginaPersonal(delta) {
  const filtrados = obtenerPersonalFiltrado();
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PERSONAL_POR_PAGINA));
  personalPaginaActual = Math.min(totalPaginas, Math.max(1, personalPaginaActual + delta));
  renderizarTablaPersonal();
}

let personalSeleccionados = new Set(); // ids seleccionados para el cambio de área en lote

function renderizarTablaPersonal() {
  const filtrados = obtenerPersonalFiltrado();
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PERSONAL_POR_PAGINA));
  personalPaginaActual = Math.min(personalPaginaActual, totalPaginas);

  const inicio = (personalPaginaActual - 1) * PERSONAL_POR_PAGINA;
  const pagina = filtrados.slice(inicio, inicio + PERSONAL_POR_PAGINA);

  const tbody = $('personal-tabla-body');
  if (pagina.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="td-vacio">No se encontraron registros</td></tr>`;
  } else {
    tbody.innerHTML = pagina.map(p => `
      <tr>
        <td>${esAdmin() ? `<input type="checkbox" data-personal-id="${p.id}" ${personalSeleccionados.has(p.id) ? 'checked' : ''} onchange="toggleSeleccionPersonal('${p.id}', this.checked)">` : ''}</td>
        <td>${p.codigo || ''}</td>
        <td>${p.grado || ''}</td>
        <td>${p.apellidos || ''}</td>
        <td>${p.nombres || ''}</td>
        <td>${p.area || ''}</td>
        <td style="white-space:nowrap;">
${esAdmin() ? `
          <button class="btn-acc btn-acc-blue" style="padding:4px 8px;font-size:11px;" onclick="editarRegistroPersonal('${p.id}')">✎</button>
          <button class="btn-acc btn-acc-red" style="padding:4px 8px;font-size:11px;" onclick="eliminarRegistroPersonal('${p.id}')">🗑️</button>` : ''}
        </td>
      </tr>
    `).join('');
  }

  show('personal-paginacion');
  $('personal-paginacion').style.display = 'flex';
  $('personal-paginacion-info').textContent =
    `${filtrados.length} registro${filtrados.length !== 1 ? 's' : ''} — página ${personalPaginaActual} de ${totalPaginas}`;

  // Botón para seleccionar TODOS los filtrados (no solo los de la página actual)
  const btnFiltrados = $('personal-seleccionar-filtrados');
  const hayFiltroActivo = ['personal-filtro-codigo','personal-filtro-grado','personal-filtro-nombre','personal-filtro-area']
    .some(id => ($(id)?.value || '').trim() !== '');
  if (filtrados.length > 0 && (hayFiltroActivo || filtrados.length > PERSONAL_POR_PAGINA)) {
    btnFiltrados.style.display = 'inline-flex';
    btnFiltrados.textContent = `☑️ Seleccionar los ${filtrados.length} registros filtrados (todas las páginas)`;
  } else {
    btnFiltrados.style.display = 'none';
  }

  actualizarBarraCambioLote();
}

function toggleSeleccionPersonal(id, checked) {
  if (checked) personalSeleccionados.add(id);
  else personalSeleccionados.delete(id);
  actualizarBarraCambioLote();
}

function toggleSeleccionarTodosPersonal(checked) {
  if (!esAdmin()) return;
  const filtrados = obtenerPersonalFiltrado();
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PERSONAL_POR_PAGINA));
  const inicio = (personalPaginaActual - 1) * PERSONAL_POR_PAGINA;
  const pagina = filtrados.slice(inicio, inicio + PERSONAL_POR_PAGINA);
  pagina.forEach(p => { if (checked) personalSeleccionados.add(p.id); else personalSeleccionados.delete(p.id); });
  renderizarTablaPersonal();
}

function seleccionarTodosLosFiltradosPersonal() {
  if (!esAdmin()) return;
  const filtrados = obtenerPersonalFiltrado();
  filtrados.forEach(p => personalSeleccionados.add(p.id));
  renderizarTablaPersonal();
  toast(`✅ ${filtrados.length} registros seleccionados`, 'ok');
}

function limpiarSeleccionPersonal() {
  personalSeleccionados.clear();
  renderizarTablaPersonal();
  const campoArea = $('personal-cambio-lote-area');
  if (campoArea) { campoArea.value = ''; delete campoArea.dataset.poblado; }
}

let comboboxAreaCambioLote = null;

function actualizarBarraCambioLote() {
  const barra = $('personal-cambio-lote');
  if (!esAdmin() || personalSeleccionados.size === 0) {
    barra.style.display = 'none';
    return;
  }
  barra.style.display = 'flex';
  $('personal-cambio-lote-info').textContent = `${personalSeleccionados.size} agente${personalSeleccionados.size !== 1 ? 's' : ''} seleccionado${personalSeleccionados.size !== 1 ? 's' : ''}`;

  obtenerAreasNovedades().then(areas => {
    if (!comboboxAreaCambioLote) {
      comboboxAreaCambioLote = crearComboboxArea({
        inputId: 'personal-cambio-lote-area',
        listaId: 'personal-cambio-lote-area-lista',
        onSeleccionar: () => {},
        limpiarAlEnfocar: false
      });
    }
    // Solo se pobla la primera vez que aparece la barra por esta selección —
    // si el admin ya venía escribiendo un área, no se le borra al agregar/quitar
    // más agentes a la selección.
    if ($('personal-cambio-lote-area').dataset.poblado !== '1') {
      comboboxAreaCambioLote.actualizar(areas, '');
      $('personal-cambio-lote-area').dataset.poblado = '1';
    } else {
      comboboxAreaCambioLote.actualizar(areas, $('personal-cambio-lote-area').value);
    }
  });
}

// El checkbox "Es corrección" y el campo "Día de corte" del cambio en lote
// son igual de excluyentes que en la edición individual.
function toggleCambioLoteCorreccion() {
  const esCorreccion = $('personal-cambio-lote-es-correccion')?.checked;
  const wrap = $('personal-cambio-lote-corte-wrap');
  if (wrap) wrap.style.display = esCorreccion ? 'none' : 'flex';
}

async function aplicarCambioAreaLote() {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }
  const nuevaArea = $('personal-cambio-lote-area').value;
  if (!nuevaArea) { toast('Elegí un área', 'err'); return; }
  if (personalSeleccionados.size === 0) return;

  const periodo = obtenerFechaParts().periodo;
  const esCorreccion = $('personal-cambio-lote-es-correccion')?.checked || false;
  // Corrección: mueve el mes ENTERO (diaCorte=1, sin partir días).
  // Traslado real: respeta el día de corte que eligió el admin.
  const diaCorte = esCorreccion
    ? 1
    : ajustarDiaAlMes(parseInt(($('personal-cambio-lote-corte') || {}).value, 10) || obtenerFechaParts().dia, periodo);
  const areaNuevaSanitizada = sanitizarNombreArea(nuevaArea);

  // ── Mes cerrado en el área anterior: esos agentes se omiten por completo ──
  let idsPermitidos = Array.from(personalSeleccionados);
  let avisoCerrados = '';
  let omitidosCerrados = [];
  try {
    const infoSel = idsPermitidos
      .map(id => personalDirectorioCache.find(x => x.id === id))
      .filter(Boolean);
    const { bloqueados } = await separarCambiosPorMesCerrado(
      infoSel
        .filter(p => sanitizarNombreArea(p.area || '') !== areaNuevaSanitizada)
        .map(p => ({ id: p.id, codigo: p.codigo, nombre: `${p.apellidos || ''} ${p.nombres || ''}`.trim(), areaAnterior: p.area, areaNueva: areaNuevaSanitizada })),
      periodo
    );
    if (bloqueados.length) {
      omitidosCerrados = bloqueados;
      const idsB = new Set(bloqueados.map(b => b.id));
      idsPermitidos = idsPermitidos.filter(id => !idsB.has(id));
      const lista = bloqueados.slice(0, 15).map(b => `· ${b.codigo} — ${b.nombre} (${b.origen})`).join('\n');
      avisoCerrados = `⚠️ ${bloqueados.length} agente(s) NO se moverán porque el mes ${periodo} de su área actual ya está cerrado (informe generado):\n${lista}${bloqueados.length > 15 ? `\n…y ${bloqueados.length - 15} más.` : ''}\n\n`;
    }
  } catch(e) {
    console.error('No se pudo verificar meses cerrados en el cambio en lote:', e);
  }
  if (!idsPermitidos.length) {
    toast(`❌ Ningún agente se movió: el mes ${periodo} de su área actual ya está cerrado (informe generado)`, 'err');
    return;
  }

  if (!(await confirmarAccion(
    avisoCerrados + (esCorreccion
      ? `¿Corregir el área de ${idsPermitidos.length} agente(s) a "${nuevaArea}"?\n\nNo es un traslado: el mes completo de Novedades pasará a la nueva área, sin partir días.`
      : `¿Cambiar el área de ${idsPermitidos.length} agente(s) a "${nuevaArea}"?\n\nEn Novedades de este mes, los días antes del ${diaCorte} quedan en su área anterior y desde el ${diaCorte} pasan a la nueva área.`),
    esCorreccion ? 'Corregir área en lote' : 'Cambiar área en lote'
  ))) return;

  try {
    const ids = idsPermitidos;
    const seleccionInfo = ids
      .map(id => personalDirectorioCache.find(x => x.id === id))
      .filter(Boolean);

    const tamanioLote = 50;
    for (let i = 0; i < ids.length; i += tamanioLote) {
      const lote = ids.slice(i, i + tamanioLote);
      await Promise.all(lote.map(id =>
        window._fb.setDoc(window._fb.doc(db, 'personal', id), {
          area: areaNuevaSanitizada,
          ultimaActualizacion: new Date()
        }, { merge: true })
      ));
    }

    // Partir en Novedades del mes en curso a quienes realmente cambiaron de área
    const cambiosNovedades = seleccionInfo
      .filter(p => sanitizarNombreArea(p.area || '') !== areaNuevaSanitizada)
      .map(p => ({
        codigo: p.codigo, grado: p.grado, apellidos: p.apellidos, nombres: p.nombres,
        areaAnterior: p.area, areaNueva: areaNuevaSanitizada
      }));
    let resultadoCorte = { procesados: 0 };
    try {
      resultadoCorte = await aplicarCortesDeArea(cambiosNovedades, diaCorte, periodo);
    } catch(e) {
      console.error('No se pudo partir Novedades en el cambio en lote:', e);
      toast('⚠️ Se actualizó la Base de Personal, pero hubo un error partiendo Novedades: ' + e.message, 'err');
    }

    await registrarEnAuditoria(
      esCorreccion ? 'corregir_area_lote' : 'cambio_area_lote', areaNuevaSanitizada, usuario.email, null, null,
      { cantidad: ids.length, diaCorte, partidosEnNovedades: resultadoCorte.procesados, esCorreccion,
        omitidosMesCerrado: omitidosCerrados.map(b => ({ codigo: b.codigo, area: b.origen })) },
      esCorreccion
        ? `Corrección de área en lote (no traslado): ${ids.length} agentes → ${areaNuevaSanitizada} (mes ${periodo} completo, ${resultadoCorte.procesados} corregidos en Novedades)`
        : `Cambio de área en lote: ${ids.length} agentes → ${areaNuevaSanitizada} (corte día ${diaCorte}, ${resultadoCorte.procesados} partidos en Novedades de ${periodo})`
    );

    toast(
      esCorreccion
        ? `✅ ${ids.length} agentes corregidos a "${areaNuevaSanitizada}" · mes ${periodo} completo movido en Novedades`
        : `✅ ${ids.length} agentes actualizados a "${areaNuevaSanitizada}" · ${resultadoCorte.procesados} partidos en Novedades desde el día ${diaCorte}`,
      'ok'
    );
    if (omitidosCerrados.length) {
      toast(`⚠️ ${omitidosCerrados.length} agente(s) se omitieron por tener el mes ${periodo} cerrado en su área actual`, 'err');
    }
    limpiarSeleccionPersonal();
    cargarDirectorioPersonal();
  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

let modalPersonalIdEdicion = null;
let comboboxAreaPersonal = null;

async function poblarComboboxAreaPersonal(areaSeleccionada) {
  const areasReales = await obtenerAreasNovedades();
  if (!comboboxAreaPersonal) {
    comboboxAreaPersonal = crearComboboxArea({
      inputId: 'modal-personal-area',
      listaId: 'modal-personal-area-lista',
      onSeleccionar: () => {}, // crearComboboxArea ya deja el valor escrito en el input
      permitirNuevo: true, // el admin puede escribir un área que todavía no existe en el catálogo
      limpiarAlEnfocar: false // no borrar el área actual al hacer clic — mostrarla y filtrar desde ahí
    });
  }
  comboboxAreaPersonal.actualizar(areasReales, areaSeleccionada || '');
}


async function abrirModalPersonal() {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }
  modalPersonalIdEdicion = null;
  $('modal-personal-titulo').textContent = 'Agregar registro';
  $('modal-personal-codigo').value = '';
  $('modal-personal-codigo').disabled = false;
  $('modal-personal-grado').value = '';
  $('modal-personal-apellidos').value = '';
  $('modal-personal-nombres').value = '';
  await poblarComboboxAreaPersonal('');
  if ($('modal-personal-corte')) {
    $('modal-personal-corte').value = obtenerFechaParts().dia;
    hide('modal-personal-corte-wrap');
  }
  if ($('modal-personal-es-correccion')) $('modal-personal-es-correccion').checked = false;
  hide('modal-personal-correccion-wrap'); // no aplica al crear un registro nuevo, no hay área anterior que corregir
  hide('modal-personal-error');
  $('modal-personal').style.display = 'flex';
}

async function editarRegistroPersonal(id) {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }
  const p = personalDirectorioCache.find(x => x.id === id);
  if (!p) return;
  modalPersonalIdEdicion = id;
  $('modal-personal-titulo').textContent = 'Editar registro';
  $('modal-personal-codigo').value = p.codigo || '';
  $('modal-personal-codigo').disabled = true; // el código es el ID del documento
  $('modal-personal-grado').value = p.grado || '';
  $('modal-personal-apellidos').value = p.apellidos || '';
  $('modal-personal-nombres').value = p.nombres || '';
  await poblarComboboxAreaPersonal(p.area || '');
  if ($('modal-personal-es-correccion')) $('modal-personal-es-correccion').checked = false;
  show('modal-personal-correccion-wrap');
  if ($('modal-personal-corte')) {
    $('modal-personal-corte').value = obtenerFechaParts().dia;
    show('modal-personal-corte-wrap');
  }
  hide('modal-personal-error');
  $('modal-personal').style.display = 'flex';
}

// El checkbox "Es corrección" y el campo "Día de corte" son mutuamente
// excluyentes: una corrección mueve el mes completo, no tiene sentido pedir
// un día donde partirlo.
function toggleModalPersonalCorreccion() {
  const esCorreccion = $('modal-personal-es-correccion')?.checked;
  if (esCorreccion) hide('modal-personal-corte-wrap');
  else show('modal-personal-corte-wrap');
}

function cerrarModalPersonal() {
  $('modal-personal').style.display = 'none';
  modalPersonalIdEdicion = null;
}

/* ═════════════════════════════════════════
   CAMBIO DE ÁREA → NOVEDADES DEL MES EN CURSO (con corte por día)

   El área de la Base de Personal (fija o temporal) era solo
   informativa: se guardaba en la colección `personal` pero no movía al
   agente dentro de novedades/{área}/{período}. Estas funciones lo
   mueven de verdad, PARTIENDO los días entre la vieja y la nueva área
   según el día de corte que indique quien hace el cambio.

   Reglas acordadas:
   · El agente queda registrado en AMBAS áreas ese mes: los días antes
     del corte se quedan en el área anterior (con lo ya cargado), y
     desde el día de corte en adelante pasa a la nueva área (en blanco,
     salvo que ya hubiera algo cargado en esos días, que se traslada).
   · Si se lo vuelve a cambiar de área el mismo mes, se repite el corte
     tomando como "área anterior" la última área en la que quedó — las
     áreas previas de ese mismo mes ya no se tocan.
   · El conteo EFECTIVO no requiere lógica aparte: como el agente sigue
     figurando como registro en cada área por la que pasó, cuenta en
     todas ellas automáticamente.
   · Al mes siguiente ya no hay partición: como la Base de Personal
     (`personal`) queda con el área final, el mes nuevo arranca con el
     agente solo en esa área.
   · Aplica a los tres caminos de cambio de área: edición individual,
     cambio en lote y actualización masiva por Excel.
   · El agente NO desaparece del área anterior en un traslado real: si el
     corte es posterior al día 1, su ficha se conserva en esa área aunque
     los días previos estén en blanco (en blanco = presencia normal), para
     que siga contando en el EFECTIVO y en el reporte del área anterior.
     Solo se retira del área anterior cuando no hay días previos al corte
     (corrección por error de digitación, o corte en el día 1).
   · Si el mes del área anterior ya está CERRADO (informe generado), no se
     toca nada de ese agente: ni Novedades ni la Base de Personal. En el
     lote y en Excel se omiten esos agentes y se informa cuáles fueron.
═════════════════════════════════════════ */

/* Revisa, para una lista de cambios, cuáles tienen el mes CERRADO en su
   área anterior. Lee cada área una sola vez.
   cambios: [{ areaAnterior, areaNueva, ...cualquier otro dato }]
   Devuelve { permitidos, bloqueados } — cada bloqueado lleva `origen`
   (nombre sanitizado del área anterior con el mes cerrado). */
async function separarCambiosPorMesCerrado(cambios, periodo) {
  const cerradas = new Map(); // areaSanitizada -> boolean
  const permitidos = [];
  const bloqueados = [];
  for (const c of (cambios || [])) {
    const origen = c.areaAnterior ? sanitizarNombreArea(c.areaAnterior) : '';
    if (!origen || origen === sanitizarNombreArea(c.areaNueva || '')) { permitidos.push(c); continue; }
    if (!cerradas.has(origen)) {
      let cerrada = false;
      try {
        const snap = await window._fb.getDoc(window._fb.doc(db, 'novedades', origen, periodo, 'datos'));
        cerrada = snap.exists() && snap.data().estado === 'cerrado';
      } catch (e) {
        // Ante un error de lectura no se asume "cerrado": el guardado normal seguirá su curso
        console.warn('No se pudo verificar el cierre del área ' + origen + ':', e);
      }
      cerradas.set(origen, cerrada);
    }
    if (cerradas.get(origen)) bloqueados.push({ ...c, origen });
    else permitidos.push(c);
  }
  return { permitidos, bloqueados };
}

function _normCodigoAgente(c) {
  return String(c || '').replace(/\s+/g, '').toUpperCase();
}

/* Aplica uno o varios cambios de área con corte de día, en una sola
   pasada por cada área afectada (agrupa lecturas/escrituras para evitar
   condiciones de carrera cuando varios agentes comparten área origen o
   destino, como en el cambio en lote o la actualización por Excel).

   cambios: [{ codigo, grado, apellidos, nombres, areaAnterior, areaNueva }]
   diaCorte: día del mes (1-31, ya ajustado a los días reales del mes)
   periodo: 'AAAA-MM'

   Devuelve un resumen: { procesados, areas: Set<string> } */
async function aplicarCortesDeArea(cambios, diaCorte, periodo) {
  const lista = (cambios || []).filter(c => c && c.codigo && c.areaNueva);
  if (!lista.length) return { procesados: 0, areas: new Set() };

  // 1) Determinar todas las áreas involucradas y leerlas una sola vez.
  const docsPorArea = new Map(); // areaSanitizada -> { ref, data, agentes }
  const asegurarArea = async (area) => {
    if (!area || docsPorArea.has(area)) return;
    const ref = window._fb.doc(db, 'novedades', area, periodo, 'datos');
    const snap = await window._fb.getDoc(ref);
    const data = snap.exists() ? snap.data() : null;
    docsPorArea.set(area, { ref, data, agentes: data ? [...(data.agentes || [])] : [] });
  };

  const cambiosSaneados = [];
  for (const c of lista) {
    const destino = sanitizarNombreArea(c.areaNueva);
    const origen = c.areaAnterior ? sanitizarNombreArea(c.areaAnterior) : '';
    if (!destino || origen === destino) continue;
    if (origen) await asegurarArea(origen);
    await asegurarArea(destino);
    cambiosSaneados.push({ ...c, origen, destino });
  }
  if (!cambiosSaneados.length) return { procesados: 0, areas: new Set() };

  // 2) Aplicar cada cambio en memoria sobre los documentos ya leídos.
  const modificadas = new Set();
  let omitidosMesCerrado = 0;
  for (const c of cambiosSaneados) {
    // Red de seguridad: si el mes del área anterior ya está cerrado no se
    // toca nada (los llamadores ya lo filtran antes de guardar la Base de
    // Personal; esto cubre una carrera con un cierre reciente).
    if (c.origen && docsPorArea.get(c.origen)?.data?.estado === 'cerrado') { omitidosMesCerrado++; continue; }
    const buscado = _normCodigoAgente(c.codigo);
    const nombreCompleto = `${c.apellidos || ''} ${c.nombres || ''}`.trim() || c.nombre || '';
    let diasTrasladados = {};

    if (c.origen && docsPorArea.has(c.origen)) {
      const entradaOrigen = docsPorArea.get(c.origen);
      const idx = entradaOrigen.agentes.findIndex(a => _normCodigoAgente(a.codigo) === buscado);
      if (idx !== -1) {
        const ag = entradaOrigen.agentes[idx];
        const diasOrig = ag.novedadesPorDia || {};
        const diasConservados = {};
        Object.entries(diasOrig).forEach(([dia, val]) => {
          if (Number(dia) < diaCorte) diasConservados[dia] = val;
          else diasTrasladados[dia] = val;
        });
        modificadas.add(c.origen);
        if (diaCorte <= 1) {
          // No hay días previos al corte (corrección por error de digitación,
          // o corte en el día 1): se lo saca del área anterior.
          // Si el corte es posterior al día 1 el agente SÍ estuvo en esa área
          // esos días — aunque estén en blanco (presencia normal) — así que su
          // ficha se conserva para que siga contando en el EFECTIVO y en el reporte.
          entradaOrigen.agentes.splice(idx, 1);
        } else {
          entradaOrigen.agentes[idx] = {
            ...ag,
            grado: c.grado || ag.grado || '',
            apellidosNombres: nombreCompleto || ag.apellidosNombres || '',
            novedadesPorDia: diasConservados
          };
        }
      }
    }

    const entradaDestino = docsPorArea.get(c.destino);
    modificadas.add(c.destino);
    const idxD = entradaDestino.agentes.findIndex(a => _normCodigoAgente(a.codigo) === buscado);
    if (idxD !== -1) {
      // Ya tenía registro este mes en el área destino (p.ej. vuelve a un
      // área por la que ya había pasado): se fusionan los días sin pisar
      // lo que ya hubiera cargado ahí.
      entradaDestino.agentes[idxD] = {
        ...entradaDestino.agentes[idxD],
        grado: c.grado || entradaDestino.agentes[idxD].grado || '',
        apellidosNombres: nombreCompleto || entradaDestino.agentes[idxD].apellidosNombres || '',
        novedadesPorDia: { ...diasTrasladados, ...(entradaDestino.agentes[idxD].novedadesPorDia || {}) }
      };
    } else {
      entradaDestino.agentes.push({
        codigo: c.codigo,
        grado: c.grado || '',
        apellidosNombres: nombreCompleto,
        novedadesPorDia: diasTrasladados,
        observaciones: ''
      });
    }
  }

  // 3) Guardar cada área modificada una sola vez.
  for (const [area, info] of docsPorArea.entries()) {
    if (!modificadas.has(area)) continue; // solo se escriben las áreas realmente tocadas
    await window._fb.setDoc(info.ref, {
      agentes: info.agentes,
      estado: (info.data && info.data.estado) || 'activo',
      diasBloqueados: (info.data && info.data.diasBloqueados) || [],
      diasDesbloqueados: (info.data && info.data.diasDesbloqueados) || [],
      diasNoCompletados: (info.data && info.data.diasNoCompletados) || Array.from({length: 31}, (_, i) => i + 1),
      fechaCreacion: (info.data && info.data.fechaCreacion) || new Date(),
      ultimaModificacion: new Date()
    }, { merge: true });
  }

  return { procesados: cambiosSaneados.length - omitidosMesCerrado, omitidosMesCerrado, areas: new Set(docsPorArea.keys()) };
}

async function guardarRegistroPersonal() {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }
  const codigo = $('modal-personal-codigo').value.trim();
  const grado = $('modal-personal-grado').value.trim();
  const apellidos = $('modal-personal-apellidos').value.trim();
  const nombres = $('modal-personal-nombres').value.trim();
  const area = $('modal-personal-area').value.trim();
  const errorEl = $('modal-personal-error');

  if (!codigo) { errorEl.textContent = 'El código es obligatorio'; show('modal-personal-error'); return; }
  if (!area) { errorEl.textContent = 'El área es obligatoria'; show('modal-personal-error'); return; }

  try {
    const areaSanitizada = sanitizarNombreArea(area);

    // ── Mes cerrado en el área anterior: no se modifica nada ──
    {
      const previo = modalPersonalIdEdicion
        ? personalDirectorioCache.find(x => x.id === modalPersonalIdEdicion)
        : null;
      if (previo && previo.area && sanitizarNombreArea(previo.area) !== areaSanitizada) {
        const periodoChk = obtenerFechaParts().periodo;
        const { bloqueados } = await separarCambiosPorMesCerrado(
          [{ areaAnterior: previo.area, areaNueva: areaSanitizada }], periodoChk
        );
        if (bloqueados.length) {
          errorEl.textContent = `No se pudo cambiar el área: el mes ${periodoChk} de "${bloqueados[0].origen}" ya está cerrado (informe generado). Cambiarla alteraría un informe ya emitido, por eso no se modificó nada.`;
          show('modal-personal-error');
          return;
        }
      }
    }

    await window._fb.setDoc(window._fb.doc(db, 'personal', codigo), {
      codigo, grado, apellidos, nombres, area: areaSanitizada,
      ultimaActualizacion: new Date()
    }, { merge: true });

    // Mantener sincronizada la lista de áreas conocidas
    const areasRef = window._fb.doc(db, 'sistema', 'areas_novedades');
    const areasSnap = await window._fb.getDoc(areasRef);
    const areasPrevias = areasSnap.exists() ? (areasSnap.data().lista || []) : [];
    if (!areasPrevias.includes(areaSanitizada)) {
      await window._fb.setDoc(areasRef, {
        lista: [...areasPrevias, areaSanitizada].sort(),
        ultimaActualizacion: new Date()
      });
    }

    // ── Partir al agente entre la vieja y la nueva área en las Novedades
    //    del mes en curso si cambió su área (antes esto solo se guardaba
    //    en el directorio, no se reflejaba en el mes) ──
    const registroPrevio = modalPersonalIdEdicion
      ? personalDirectorioCache.find(x => x.id === modalPersonalIdEdicion)
      : null;
    const areaAnterior = registroPrevio ? registroPrevio.area : null;
    const esCorreccion = $('modal-personal-es-correccion')?.checked || false;
    let movimiento = null;
    let correccion = null;
    if (areaAnterior && sanitizarNombreArea(areaAnterior) !== areaSanitizada) {
      const periodo = obtenerFechaParts().periodo;
      // Corrección de error: mueve el mes ENTERO (diaCorte=1, sin partir
      // días). Traslado real: respeta el día de corte que eligió el admin.
      const diaCorte = esCorreccion
        ? 1
        : ajustarDiaAlMes(parseInt($('modal-personal-corte').value, 10) || obtenerFechaParts().dia, periodo);
      try {
        const resultado = await aplicarCortesDeArea(
          [{ codigo, grado, apellidos, nombres, areaAnterior, areaNueva: areaSanitizada }],
          diaCorte, periodo
        );
        if (resultado.procesados) {
          if (esCorreccion) {
            correccion = { desde: sanitizarNombreArea(areaAnterior), hacia: areaSanitizada, periodo };
          } else {
            movimiento = { desde: sanitizarNombreArea(areaAnterior), hacia: areaSanitizada, periodo, diaCorte };
          }
        }
      } catch(e) {
        console.error('No se pudo partir al agente en Novedades:', e);
        toast('⚠️ El registro se guardó, pero no se pudo actualizar Novedades: ' + e.message, 'err');
      }
    } else {
      // ── No hubo cambio real de área (registro nuevo, o edición/reguardado
      //    de uno existente sin traslado): si el área ya tiene abierto el
      //    documento de Novedades de este mes, hay que asegurarse de que el
      //    agente esté ahí. Antes esto solo pasaba en un cambio de área, así
      //    que un agente que nunca se movió de área podía quedar fuera de la
      //    tabla del mes (recién creado, o creado antes de que existiera el
      //    documento del mes) sin ninguna forma de entrar. ──
      try {
        const periodo = obtenerFechaParts().periodo;
        const ref = window._fb.doc(db, 'novedades', areaSanitizada, periodo, 'datos');
        const snap = await window._fb.getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const agentes = [...(data.agentes || [])];
          const yaExiste = agentes.some(a => _normCodigoAgente(a.codigo) === _normCodigoAgente(codigo));
          if (!yaExiste) {
            agentes.push({
              codigo, grado,
              apellidosNombres: `${apellidos} ${nombres}`.trim(),
              novedadesPorDia: {},
              observaciones: ''
            });
            await window._fb.setDoc(ref, { agentes, ultimaModificacion: new Date() }, { merge: true });
          }
        }
        // Si el documento del mes todavía no existe para esa área, no hay
        // nada que hacer: se creará solo (con este agente ya en `personal`
        // solo si en el futuro se decide arrastrar también desde `personal`;
        // por ahora arrastra del mes anterior, así que si el área nunca
        // tuvo Novedades, el agente entrará normal la primera vez que
        // alguien abra esa área).
      } catch(e) {
        console.error('No se pudo agregar el agente a Novedades del mes en curso:', e);
        toast('⚠️ El registro se guardó, pero no se pudo agregar a Novedades de este mes: ' + e.message, 'err');
      }
    }

    await registrarEnAuditoria(
      correccion ? 'corregir_area_personal' : (modalPersonalIdEdicion ? 'editar_personal' : 'crear_personal'),
      areaSanitizada, usuario.email, null, null, { codigo, movimiento, correccion },
      correccion
        ? `Corrección de área (error de digitación, no traslado): ${codigo} — ${apellidos} ${nombres} · de "${correccion.desde}" a "${correccion.hacia}", mes ${correccion.periodo} completo`
        : `${modalPersonalIdEdicion ? 'Editado' : 'Agregado'} registro de personal: ${codigo} — ${apellidos} ${nombres}${movimiento ? ` · Novedades ${movimiento.periodo}: días 1-${movimiento.diaCorte - 1} en "${movimiento.desde}", desde el ${movimiento.diaCorte} en "${movimiento.hacia}"` : ''}`
    );

    toast(
      correccion
        ? `✅ Área corregida — el mes ${correccion.periodo} completo ahora figura en "${correccion.hacia}"`
        : movimiento
          ? `✅ Registro actualizado · en Novedades de ${movimiento.periodo}: hasta el día ${movimiento.diaCorte - 1} en "${movimiento.desde}", desde el ${movimiento.diaCorte} en "${movimiento.hacia}"`
          : `✅ Registro ${modalPersonalIdEdicion ? 'actualizado' : 'agregado'}`,
      'ok'
    );
    cerrarModalPersonal();
    cargarDirectorioPersonal();
  } catch(e) {
    errorEl.textContent = 'Error: ' + e.message;
    show('modal-personal-error');
  }
}

async function eliminarRegistroPersonal(id) {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }
  const p = personalDirectorioCache.find(x => x.id === id);
  if (!p) return;
  if (!(await confirmarAccion(`¿Eliminar el registro de "${p.apellidos} ${p.nombres}" (código ${p.codigo})?\n\nEsto NO borra sus novedades ya cargadas en meses anteriores, solo lo saca del directorio de personal.`, 'Eliminar registro de personal'))) return;

  try {
    await window._fb.deleteDoc(window._fb.doc(db, 'personal', id));
    await registrarEnAuditoria('eliminar_personal', p.area, usuario.email, null, null, { codigo: p.codigo }, `Registro de personal eliminado: ${p.codigo} — ${p.apellidos} ${p.nombres}`);
    toast('✅ Registro eliminado', 'ok');
    cargarDirectorioPersonal();
  } catch(e) {
    toast('❌ Error: ' + e.message, 'err');
  }
}

async function borrarTodaLaBaseNovedades() {
  if (!esAdmin()) {
    toast('❌ Solo el administrador puede hacer esto', 'err');
    return;
  }

  const primeraConfirmacion = await confirmarAccion(
    '⚠️ ESTO VA A BORRAR TODA LA BASE DE NOVEDADES (todas las áreas, todos los meses).\n\n' +
    'Los envíos de archivos (pestaña Envíos) no se tocan.\n\n' +
    '¿Está seguro de que quiere continuar?',
    'Borrar toda la base de Novedades'
  );
  if (!primeraConfirmacion) { toast('Cancelado', 'ok'); return; }

  const segundaConfirmacion = await confirmarConTexto(
    'Para confirmar, escriba exactamente: BORRAR TODO',
    'BORRAR TODO',
    'Confirmación final'
  );
  if (!segundaConfirmacion) {
    toast('Cancelado — no se borró nada', 'ok');
    return;
  }

  const progreso = $('borrar-todo-progreso');
  show('borrar-todo-progreso');
  progreso.style.display = 'block';
  progreso.textContent = 'Preparando...';

  try {
    const areasReales = await obtenerAreasNovedades();

    // Rango de meses a cubrir: desde el año pasado hasta el año que viene
    const anioActual = new Date().getFullYear();
    const periodos = [];
    for (let a = anioActual - 1; a <= anioActual + 1; a++) {
      for (let m = 1; m <= 12; m++) {
        periodos.push(`${a}-${String(m).padStart(2, '0')}`);
      }
    }

    const combinaciones = [];
    areasReales.forEach(area => {
      periodos.forEach(periodo => combinaciones.push({ area, periodo }));
    });

    let borrados = 0;
    const tamanioLote = 25;
    for (let i = 0; i < combinaciones.length; i += tamanioLote) {
      const lote = combinaciones.slice(i, i + tamanioLote);
      await Promise.all(lote.map(async ({ area, periodo }) => {
        try {
          await window._fb.deleteDoc(window._fb.doc(db, 'novedades', area, periodo, 'datos'));
        } catch(e) { /* documento no existía, se ignora */ }
      }));
      borrados += lote.length;
      progreso.textContent = `Borrando... ${Math.min(borrados, combinaciones.length)} / ${combinaciones.length} combinaciones revisadas`;
    }

    // Resetear las listas de áreas y personal para que la próxima importación arranque limpia
    await window._fb.deleteDoc(window._fb.doc(db, 'sistema', 'areas_novedades')).catch(() => {});
    await window._fb.deleteDoc(window._fb.doc(db, 'sistema', 'personal_lis')).catch(() => {});

    await registrarEnAuditoria(
      'borrar_toda_base_novedades', null, usuario.email, null, null,
      { areasRevisadas: areasReales.length, periodosRevisados: periodos.length },
      `Borrado total de la base de Novedades por ${usuario.email}`
    );

    progreso.textContent = `✅ Listo. Se revisaron ${areasReales.length} áreas × ${periodos.length} meses.`;
    toast('✅ Base de Novedades borrada. Puede volver a importar desde cero.', 'ok');

    novedadesActuales = null;
    areaActual = null;

  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
    progreso.textContent = '❌ Ocurrió un error, revise la consola.';
  }
}

let mapeoAccesosPendiente = null;

async function analizarMapeoAccesos() {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }

  const input = $('mapeo-accesos-file');
  const cont = $('mapeo-accesos-resultado');
  hide('btn-aplicar-mapeo-accesos');
  mapeoAccesosPendiente = null;

  if (!input.files || !input.files.length) { toast('⚠️ Seleccione un archivo', 'err'); return; }

  try {
    cont.style.display = 'block';
    cont.innerHTML = '⏳ Leyendo el archivo...';

    const filas = await leerArchivoTabular(input.files[0]);
    if (filas.length < 2) { cont.innerHTML = '❌ El archivo está vacío o mal formateado'; return; }

    const encabezado = (filas[0] || []).map(h => String(h || '').toUpperCase().trim());
    const buscar = (nombres) => { for (const n of nombres) { const i = encabezado.indexOf(n); if (i !== -1) return i; } return -1; };
    const iVieja = buscar(['AREA VIEJA', 'ÁREA VIEJA', 'AREA ANTERIOR', 'ÁREA ANTERIOR']);
    const iNueva = buscar(['AREA NUEVA', 'ÁREA NUEVA']);

    if (iVieja === -1 || iNueva === -1) {
      cont.innerHTML = '❌ No se encontraron las columnas necesarias. El archivo debe tener un encabezado con <strong>ÁREA VIEJA</strong> y <strong>ÁREA NUEVA</strong>.';
      return;
    }

    const mapa = new Map(); // área vieja saneada -> área nueva saneada
    for (let i = 1; i < filas.length; i++) {
      const fila = filas[i] || [];
      const vieja = sanitizarNombreArea(String(fila[iVieja] || '').trim());
      const nueva = sanitizarNombreArea(String(fila[iNueva] || '').trim());
      if (!vieja || !nueva || vieja === nueva) continue;
      mapa.set(vieja.toLowerCase(), { vieja, nueva });
    }

    if (!mapa.size) { cont.innerHTML = '❌ El archivo no trae ningún par válido de área vieja → área nueva'; return; }

    cont.innerHTML = '⏳ Revisando los accesos existentes...';
    const snap = await window._fb.getDocs(window._fb.collection(db, 'accesos'));

    const cambios = []; // { id, correo, antes:[...], despues:[...] }
    snap.docs.forEach(d => {
      const data = d.data();
      const areasActuales = Array.isArray(data.areas) && data.areas.length
        ? data.areas
        : (data.area ? [data.area] : []);
      if (!areasActuales.length) return;

      let huboCambio = false;
      const areasNuevas = areasActuales.map(a => {
        const match = mapa.get(String(a).toLowerCase());
        if (match) { huboCambio = true; return match.nueva; }
        return a;
      });
      if (!huboCambio) return;

      let areaActivaNueva = data.areaActiva;
      const matchActiva = mapa.get(String(data.areaActiva || '').toLowerCase());
      if (matchActiva) areaActivaNueva = matchActiva.nueva;

      cambios.push({
        id: d.id,
        correo: data.correo || d.id,
        antes: areasActuales,
        despues: [...new Set(areasNuevas)],
        areaActivaAntes: data.areaActiva || null,
        areaActivaDespues: areaActivaNueva || null
      });
    });

    mapeoAccesosPendiente = cambios;

    const filasTabla = cambios.slice(0, 100).map(c => `
      <tr>
        <td style="padding:3px 8px;">${c.correo}</td>
        <td style="padding:3px 8px;color:var(--txt2);">${c.antes.join(', ')}</td>
        <td style="padding:3px 8px;">→</td>
        <td style="padding:3px 8px;font-weight:700;">${c.despues.join(', ')}</td>
      </tr>`).join('');

    cont.innerHTML = `
      <strong>Resultado del análisis</strong><br><br>
      · <strong>${mapa.size}</strong> par(es) de área leídos del archivo<br>
      · <strong>${cambios.length}</strong> acceso(s) van a actualizarse<br>
      ${cambios.length ? `
        <div style="margin-top:12px;max-height:260px;overflow:auto;">
          <table style="width:100%;font-size:11px;border-collapse:collapse;">
            <thead><tr style="background:var(--bg);"><th style="padding:4px 8px;text-align:left;">Correo</th><th style="padding:4px 8px;text-align:left;">Áreas actuales</th><th></th><th style="padding:4px 8px;text-align:left;">Áreas nuevas</th></tr></thead>
            <tbody>${filasTabla}</tbody>
          </table>
          ${cambios.length > 100 ? `<p style="margin-top:6px;color:var(--txt2);">…y ${cambios.length - 100} más.</p>` : ''}
        </div>` : '<br><em>Ningún acceso tiene asignada un área de las que trae el archivo.</em>'}
    `;

    if (cambios.length) {
      const btn = $('btn-aplicar-mapeo-accesos');
      btn.style.display = 'inline-flex';
      btn.textContent = `✅ Aplicar a ${cambios.length} acceso(s)`;
    }
  } catch(e) {
    console.error(e);
    cont.innerHTML = '❌ Error leyendo el archivo: ' + e.message;
  }
}

async function aplicarMapeoAccesos() {
  if (!esAdmin()) { toast('❌ Esta función es exclusiva del administrador', 'err'); return; }
  const cambios = mapeoAccesosPendiente || [];
  if (!cambios.length) return;

  if (!(await confirmarAccion(
    `¿Actualizar el área asignada de ${cambios.length} acceso(s)? El correo, código y perfil de cada uno no se tocan.`,
    'Actualizar áreas en Accesos'
  ))) return;

  const btn = $('btn-aplicar-mapeo-accesos');
  btn.disabled = true;
  btn.textContent = '⏳ Aplicando...';

  try {
    const tamanioLote = 50;
    for (let i = 0; i < cambios.length; i += tamanioLote) {
      const lote = cambios.slice(i, i + tamanioLote);
      await Promise.all(lote.map(c => window._fb.setDoc(window._fb.doc(db, 'accesos', c.id), {
        areas: c.despues,
        area: c.despues[0] || '',
        areaActiva: c.areaActivaDespues,
        ultimaEdicion: new Date()
      }, { merge: true })));
    }

    await registrarEnAuditoria(
      'actualizar_areas_accesos_mapeo', null, usuario.email, null, null,
      { cantidad: cambios.length },
      `Actualización de áreas en Accesos por mapeo: ${cambios.length} correo(s) actualizados`
    );

    toast(`✅ ${cambios.length} acceso(s) actualizados`, 'ok');
    $('mapeo-accesos-resultado').innerHTML += '<br><strong style="color:var(--green);">✅ Cambios aplicados.</strong>';
    hide('btn-aplicar-mapeo-accesos');
    mapeoAccesosPendiente = null;
  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  } finally {
    btn.disabled = false;
  }
}

async function borrarTodaLaBasePersonal() {
  if (!esAdmin()) {
    toast('❌ Solo el administrador puede hacer esto', 'err');
    return;
  }

  const primeraConfirmacion = await confirmarAccion(
    '⚠️ ESTO VA A BORRAR TODO EL DIRECTORIO DE PERSONAL (todos los códigos, grados, apellidos, nombres y áreas).\n\n' +
    'Novedades, Accesos y Auditoría no se tocan.\n\n' +
    '¿Está seguro de que quiere continuar?',
    'Borrar toda la Base de Personal'
  );
  if (!primeraConfirmacion) { toast('Cancelado', 'ok'); return; }

  const segundaConfirmacion = await confirmarConTexto(
    'Para confirmar, escriba exactamente: BORRAR TODO',
    'BORRAR TODO',
    'Confirmación final'
  );
  if (!segundaConfirmacion) {
    toast('Cancelado — no se borró nada', 'ok');
    return;
  }

  const progreso = $('borrar-personal-progreso');
  show('borrar-personal-progreso');
  progreso.style.display = 'block';
  progreso.textContent = 'Leyendo el directorio...';

  try {
    const snap = await window._fb.getDocs(window._fb.collection(db, 'personal'));
    const ids = snap.docs.map(d => d.id);

    let borrados = 0;
    const tamanioLote = 50;
    for (let i = 0; i < ids.length; i += tamanioLote) {
      const lote = ids.slice(i, i + tamanioLote);
      await Promise.all(lote.map(id => window._fb.deleteDoc(window._fb.doc(db, 'personal', id))));
      borrados += lote.length;
      progreso.textContent = `Borrando... ${Math.min(borrados, ids.length)} / ${ids.length} registros`;
    }

    await registrarEnAuditoria(
      'borrar_toda_base_personal', null, usuario.email, null, null,
      { registrosBorrados: ids.length },
      `Borrado total de la Base de Personal por ${usuario.email}: ${ids.length} registros`
    );

    progreso.textContent = `✅ Listo. Se borraron ${ids.length} registros.`;
    toast('✅ Base de Personal borrada. Puede volver a importar desde cero.', 'ok');
    cargarDirectorioPersonal();

  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
    progreso.textContent = '❌ Ocurrió un error, revise la consola.';
  }
}



/* ═════════════════════════════════════════
   PANEL ADMIN — Accesos (ficha por usuario, perfiles, bloqueo)
   ─────────────────────────────────────────
   Un acceso vive en `accesos/{correo}` y guarda:
     correo, codigo, area, estado (true=activo / false=bloqueado),
     fechaCreacion, ultimaEdicion
   El PERFIL vive aparte, en `permisos_panel/{correo}`:
     SECRETARIO      → no tiene documento (solo carga novedades de su área)
     SUPERVISOR      → { tipo:'supervisor' }           lectura + exportación de todo
     ADMINISTRADOR   → { tipo:'parcial', acciones:[…] } con todas las acciones
   El ADMINISTRADOR RAÍZ es el de ADMIN_EMAILS (dentro de este archivo) y no se
   puede cambiar desde la interfaz — es la cuenta que nadie puede revocar.
═════════════════════════════════════════ */

const PERFILES = {
  SECRETARIO:    { label: 'SECRETARIO',    color: 'gold',  desc: 'Carga las novedades de su área. Sin acceso al Panel de Control.' },
  SUPERVISOR:    { label: 'SUPERVISOR',    color: 'orange',  desc: 'Ve y exporta todo el sistema, incluida la auditoría. No puede modificar nada.' },
  ADMINISTRADOR: { label: 'ADMINISTRADOR', color: 'green', desc: 'Acceso completo al Panel de Control: importar, accesos, desbloqueos, auditoría.' },
};

const COLORES_PERFIL = {
  gold:   'background:var(--gold-l);color:var(--gold);',
  orange: 'background:var(--orange-l);color:var(--orange);',
  green:  'background:var(--green-l);color:var(--green);',
  red:    'background:var(--red-l);color:var(--red);',
  // 'blue' se mantiene por compatibilidad, pero resuelto en tonos cálidos
  // para que en modo oscuro no aparezca como celeste
  blue:   'background:var(--orange-l);color:var(--orange);',
};

let accesosCache = [];          // [{ correo, codigo, area, estado, perfil, nombre, grado }]
let accesosPagina = 1;
let accesosBusqueda = '';
let accesosAreasSinAcceso = [];
const ACCESOS_POR_PAGINA = 25;

/* Devuelve un Map(codigo → {grado, nombre}) leyendo UN solo documento
   (`sistema/personal_lis`), en vez de recorrer los miles de registros de
   la colección `personal`. Ese documento lo arma la importación de la base
   con el formato "CODIGO - GRADO APELLIDOS NOMBRES". */
async function obtenerMapaPersonal() {
  const mapa = new Map();
  try {
    const snap = await window._fb.getDoc(window._fb.doc(db, 'sistema', 'personal_lis'));
    if (!snap.exists()) return mapa;
    (snap.data().lista || []).forEach(linea => {
      const partes = String(linea).split(' - ');
      if (partes.length < 2) return;
      const codigo = partes[0].trim();
      const resto = partes.slice(1).join(' - ').trim();
      mapa.set(codigo, { texto: resto });
    });
  } catch(e) {
    console.warn('No se pudo leer la lista de personal:', e);
  }
  return mapa;
}

/* Perfil efectivo de un correo, mirando la lista raíz y `permisos_panel`. */
function resolverPerfil(correo, permisoDoc) {
  if (ADMIN_EMAILS.map(x => x.toLowerCase()).includes(String(correo).toLowerCase())) return 'RAIZ';
  if (!permisoDoc) return 'SECRETARIO';
  if (permisoDoc.tipo === 'supervisor') return 'SUPERVISOR';
  if (permisoDoc.tipo === 'parcial') {
    const todas = PERMISOS_DISPONIBLES.flatMap(g => g.acciones).map(a => a.key);
    const tiene = permisoDoc.acciones || [];
    return todas.every(k => tiene.includes(k)) ? 'ADMINISTRADOR' : 'PERSONALIZADO';
  }
  return 'SECRETARIO';
}

function inicialesDe(texto) {
  const limpio = String(texto || '').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, ' ').trim();
  const palabras = limpio.split(/\s+/).filter(Boolean);
  if (!palabras.length) return '??';
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase();
}

async function cargarAccesos() {
  const lista = $('accesos-lista');
  if (lista) lista.innerHTML = `<p class="td-vacio">Cargando accesos...</p>`;

  try {
    const [accesoSnapshot, permisosSnapshot, mapaPersonal, areasCatalogo] = await Promise.all([
      window._fb.getDocs(window._fb.collection(db, 'accesos')),
      window._fb.getDocs(window._fb.collection(db, 'permisos_panel')),
      obtenerMapaPersonal(),
      obtenerAreasNovedades(),
    ]);

    const permisosPorCorreo = new Map();
    permisosSnapshot.forEach(d => permisosPorCorreo.set(String(d.id).toLowerCase(), d.data()));

    accesosCache = accesoSnapshot.docs.map(d => {
      const data = d.data();
      const correo = data.correo || d.id;
      const codigo = String(data.codigo || '').trim();
      const info = codigo ? mapaPersonal.get(codigo) : null;
      const areas = Array.isArray(data.areas) && data.areas.length ? data.areas : (data.area ? [data.area] : []);
      return {
        id: d.id,
        correo,
        codigo,
        areas,
        area: areas[0] || '',   // compatibilidad temporal para pantallas que aún leen `area`
        estado: data.estado !== false,       // si el campo no existe, se asume activo
        perfil: resolverPerfil(correo, permisosPorCorreo.get(String(correo).toLowerCase())),
        nombre: info ? info.texto : '',
      };
    });

    // Ordenado por primera ÁREA — así los correos de un mismo grupo quedan juntos
    accesosCache.sort((a, b) =>
      (a.areas[0] || '').localeCompare(b.areas[0] || '', 'es') || (a.correo || '').localeCompare(b.correo || '', 'es')
    );

    // Áreas del catálogo que quedaron sin ningún correo asignado (mirando todas
    // las áreas de cada correo, no solo la primera)
    const areasConAcceso = new Set(accesosCache.flatMap(a => a.areas.map(x => String(x).toLowerCase())));
    accesosAreasSinAcceso = (areasCatalogo || []).filter(a => !areasConAcceso.has(String(a).toLowerCase()));

    accesosPagina = 1;
    renderizarAccesos();

  } catch(e) {
    console.error('Error cargando accesos:', e);
    if (lista) lista.innerHTML = `<p class="td-vacio">❌ Error cargando accesos: ${e.message}</p>`;
    toast('Error: ' + e.message, 'err');
  }
}

function accesosFiltrados() {
  const q = accesosBusqueda.toLowerCase().trim();
  return accesosCache.filter(a => {
    if (!q) return true;
    return [a.correo, ...(a.areas || []), a.codigo, a.nombre].some(v => String(v || '').toLowerCase().includes(q));
  });
}

function renderizarAccesos() {
  const lista = $('accesos-lista');
  const vacio = $('accesos-vacio');
  if (!lista) return;

  const puedeGestionar = tienePermisoAccion('accesos_gestionar');
  const filtrados = accesosFiltrados();

  // ── Resumen de cobertura ──
  const resumen = $('accesos-resumen');
  if (resumen) {
    const totalAreas = accesosCache.length + accesosAreasSinAcceso.length;
    const faltan = accesosAreasSinAcceso.length;
    resumen.innerHTML = `
      <span><strong>${accesosCache.length}</strong> accesos configurados</span>
      ${faltan
        ? `<span style="color:var(--red);font-weight:700;">· ${faltan} área${faltan === 1 ? '' : 's'} sin acceso asignado</span>
           <button class="btn-acc btn-acc-ghost" style="padding:3px 10px;font-size:11px;" onclick="verAreasSinAcceso()">Ver cuáles</button>`
        : `<span style="color:var(--green);font-weight:700;">· todas las áreas del catálogo tienen acceso</span>`}
      <span style="color:var(--txt3);">(${accesosCache.length} de ${totalAreas})</span>`;
  }

  if (!accesosCache.length) {
    lista.innerHTML = '';
    if (vacio) show('accesos-vacio');
    const pag = $('accesos-paginacion'); if (pag) pag.innerHTML = '';
    return;
  }
  if (vacio) hide('accesos-vacio');

  if (!filtrados.length) {
    lista.innerHTML = `<p class="td-vacio">No hay accesos que coincidan con la búsqueda</p>`;
    const pag = $('accesos-paginacion'); if (pag) pag.innerHTML = '';
    return;
  }

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ACCESOS_POR_PAGINA));
  if (accesosPagina > totalPaginas) accesosPagina = totalPaginas;
  const inicio = (accesosPagina - 1) * ACCESOS_POR_PAGINA;
  const pagina = filtrados.slice(inicio, inicio + ACCESOS_POR_PAGINA);

  lista.innerHTML = pagina.map(a => {
    const esRaiz = a.perfil === 'RAIZ';
    const cfg = PERFILES[a.perfil];
    const badge = esRaiz
      ? `<span style="${COLORES_PERFIL.red}padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:.3px;">ADMINISTRADOR RAÍZ</span>`
      : cfg
        ? `<span style="${COLORES_PERFIL[cfg.color]}padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:.3px;">${cfg.label}</span>`
        : `<span style="${COLORES_PERFIL.blue}padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:.3px;">PERSONALIZADO</span>`;

    const badgeEstado = a.estado
      ? ''
      : `<span style="${COLORES_PERFIL.red}padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;">BLOQUEADO</span>`;

    const titulo = a.nombre || a.correo;
    const esc = s => String(s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

    const meta = [
      a.areas && a.areas.length
        ? `<span style="color:var(--gold);font-weight:700;">📍 ${a.areas.join('  ·  ')}</span>`
        : `<span style="color:var(--red);">Sin área asignada</span>`,
      a.codigo ? `CÓD: ${a.codigo}` : `<span style="color:var(--red);">sin código</span>`,
    ].join(' <span style="color:var(--txt3);">|</span> ');

    return `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;${a.estado ? '' : 'opacity:.6;'}">
        <div style="width:38px;height:38px;flex-shrink:0;border-radius:50%;background:#0d1b3e;color:#e8b84b;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;">
          ${inicialesDe(titulo)}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-weight:700;font-size:13px;text-transform:uppercase;">${titulo}</span>
            ${badge}${badgeEstado}
          </div>
          <div style="font-size:11px;color:var(--txt2);margin-top:2px;">${a.correo}</div>
          <div style="font-size:11px;color:var(--txt2);margin-top:3px;">${meta}</div>
        </div>
        ${puedeGestionar ? `
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
          ${esRaiz ? '' : `<button class="btn-acc btn-acc-ghost" style="padding:5px 10px;font-size:11px;" onclick="abrirModalPerfil('${esc(a.correo)}')">Perfil</button>`}
          <button class="btn-acc btn-acc-blue" style="padding:5px 10px;font-size:11px;" onclick="editarAcceso('${esc(a.id)}')">✎ Editar</button>
          ${esRaiz ? '' : `<button class="btn-acc ${a.estado ? 'btn-acc-orange' : 'btn-acc-green'}" style="padding:5px 10px;font-size:11px;" onclick="alternarBloqueoAcceso('${esc(a.id)}')">${a.estado ? '⊘ Bloquear' : '✓ Activar'}</button>`}
          ${esRaiz ? '' : `<button class="btn-acc btn-acc-red" style="padding:5px 10px;font-size:11px;" onclick="eliminarAcceso('${esc(a.id)}')">🗑</button>`}
        </div>` : ''}
      </div>`;
  }).join('');

  renderizarPaginacionAccesos(filtrados.length, totalPaginas);
}

function renderizarPaginacionAccesos(totalItems, totalPaginas) {
  const cont = $('accesos-paginacion');
  if (!cont) return;
  if (totalItems <= ACCESOS_POR_PAGINA) { cont.innerHTML = ''; return; }
  cont.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
      <span style="font-size:12px;color:var(--txt2);">${totalItems} en total — página ${accesosPagina} de ${totalPaginas}</span>
      <div style="display:flex;gap:8px;">
        <button class="btn-acc btn-acc-ghost" ${accesosPagina <= 1 ? 'disabled' : ''} onclick="cambiarPaginaAccesos(-1)">← Anterior</button>
        <button class="btn-acc btn-acc-ghost" ${accesosPagina >= totalPaginas ? 'disabled' : ''} onclick="cambiarPaginaAccesos(1)">Siguiente →</button>
      </div>
    </div>`;
}

function cambiarPaginaAccesos(delta) {
  const total = Math.max(1, Math.ceil(accesosFiltrados().length / ACCESOS_POR_PAGINA));
  accesosPagina = Math.min(total, Math.max(1, accesosPagina + delta));
  renderizarAccesos();
  $('accesos-lista')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buscarAccesos(valor) {
  accesosBusqueda = valor || '';
  accesosPagina = 1;
  renderizarAccesos();
}

function verAreasSinAcceso() {
  if (!accesosAreasSinAcceso.length) { toast('Todas las áreas tienen acceso asignado', 'ok'); return; }
  const cont = $('modal-areas-sin-acceso-lista');
  $('modal-areas-sin-acceso-sub').textContent =
    `${accesosAreasSinAcceso.length} área(s) del catálogo sin ningún correo asignado — nadie puede cargar novedades ahí`;
  cont.innerHTML = accesosAreasSinAcceso.map(a => `
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
      <span>${a}</span>
    </div>`).join('');
  $('modal-areas-sin-acceso').style.display = 'flex';
}

function cerrarModalAreasSinAcceso() { $('modal-areas-sin-acceso').style.display = 'none'; }

/* ── Exportar usuarios a Excel ── */
async function exportarAccesos() {
  if (!accesosCache.length) { toast('No hay accesos para exportar', 'err'); return; }
  try {
    toast('⏳ Generando archivo...', 'ok');
    if (!window.ExcelJS) {
      await new Promise((res, rej) => {
        const sc = document.createElement('script');
        sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
        sc.onload = res; sc.onerror = rej;
        document.head.appendChild(sc);
      });
    }
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Usuarios');

    ws.columns = [
      { header: 'CORREO',   key: 'correo', width: 34 },
      { header: 'CODIGO',   key: 'codigo', width: 12 },
      { header: 'NOMBRE',   key: 'nombre', width: 44 },
      { header: 'AREA',     key: 'area',   width: 34 },
      { header: 'PERFIL',   key: 'perfil', width: 18 },
      { header: 'ESTADO',   key: 'estado', width: 12 },
    ];
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A6E' } };

    accesosFiltrados().forEach(a => ws.addRow({
      correo: a.correo,
      codigo: a.codigo || '',
      nombre: a.nombre || '',
      area: a.area || '',
      perfil: a.perfil === 'RAIZ' ? 'ADMINISTRADOR RAÍZ' : (PERFILES[a.perfil]?.label || a.perfil),
      estado: a.estado ? 'ACTIVO' : 'BLOQUEADO',
    }));

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `USUARIOS_RCA_${new Date().toISOString().slice(0,10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast('✅ Usuarios exportados', 'ok');
  } catch(e) {
    console.error(e);
    toast('❌ Error exportando: ' + e.message, 'err');
  }
}

/* ── Cambio de perfil ── */
let perfilCorreoEditando = null;

function abrirModalPerfil(correo) {
  const acceso = accesosCache.find(a => a.correo === correo);
  if (!acceso) { toast('No se encontró ese acceso', 'err'); return; }
  perfilCorreoEditando = correo;

  $('modal-perfil-sub').textContent = `${acceso.nombre || correo} — perfil actual: ${acceso.perfil === 'RAIZ' ? 'ADMINISTRADOR RAÍZ' : (PERFILES[acceso.perfil]?.label || acceso.perfil)}`;

  $('modal-perfil-opciones').innerHTML = Object.entries(PERFILES).map(([key, cfg]) => `
    <label style="display:flex;gap:10px;align-items:flex-start;padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;">
      <input type="radio" name="perfil-opcion" value="${key}" ${acceso.perfil === key ? 'checked' : ''} style="margin-top:3px;">
      <span>
        <span style="${COLORES_PERFIL[cfg.color]}padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;">${cfg.label}</span>
        <span style="display:block;font-size:11px;color:var(--txt2);margin-top:5px;">${cfg.desc}</span>
      </span>
    </label>`).join('');

  $('modal-perfil').style.display = 'flex';
}

function cerrarModalPerfil() {
  $('modal-perfil').style.display = 'none';
  perfilCorreoEditando = null;
}

async function guardarPerfilAcceso() {
  if (!perfilCorreoEditando) return;
  const elegido = document.querySelector('input[name="perfil-opcion"]:checked');
  if (!elegido) { toast('Elija un perfil', 'err'); return; }
  const perfil = elegido.value;
  const correo = String(perfilCorreoEditando).toLowerCase();

  try {
    const ref = window._fb.doc(db, 'permisos_panel', correo);

    if (perfil === 'SECRETARIO') {
      await window._fb.deleteDoc(ref).catch(() => {});
    } else if (perfil === 'SUPERVISOR') {
      await window._fb.setDoc(ref, {
        correo, tipo: 'supervisor', acciones: [], perfil: 'SUPERVISOR', ultimaEdicion: new Date()
      });
    } else if (perfil === 'ADMINISTRADOR') {
      const todas = PERMISOS_DISPONIBLES.flatMap(g => g.acciones).map(a => a.key);
      await window._fb.setDoc(ref, {
        correo, tipo: 'parcial', acciones: todas, perfil: 'ADMINISTRADOR', ultimaEdicion: new Date()
      });
    }

    await registrarEnAuditoria('cambiar_perfil', null, correo, null, null, { perfil },
      `Perfil de ${correo} cambiado a ${perfil}`);

    toast(`✅ Perfil actualizado a ${perfil}`, 'ok');
    cerrarModalPerfil();
    cargarAccesos();
  } catch(e) {
    toast('❌ Error: ' + e.message, 'err');
  }
}

/* ── Bloquear / activar ── */
async function alternarBloqueoAcceso(docId) {
  const acceso = accesosCache.find(a => a.id === docId);
  if (!acceso) return;
  const bloquear = acceso.estado;

  if (bloquear && !(await confirmarAccion(
      `¿Bloquear el acceso de ${acceso.nombre || acceso.correo}? No podrá cargar novedades hasta que lo reactive.`,
      'Bloquear acceso'))) return;

  try {
    await window._fb.updateDoc(window._fb.doc(db, 'accesos', docId), {
      estado: !bloquear, ultimaEdicion: new Date()
    });
    await registrarEnAuditoria(bloquear ? 'bloquear_acceso' : 'activar_acceso', (acceso.areas || []).join(', ') || acceso.area, acceso.correo, null, null, {},
      `${bloquear ? 'Bloqueado' : 'Activado'} el acceso de ${acceso.correo}`);
    toast(bloquear ? '✅ Acceso bloqueado' : '✅ Acceso activado', 'ok');
    acceso.estado = !bloquear;
    renderizarAccesos();
  } catch(e) {
    toast('Error: ' + e.message, 'err');
  }
}

/* ── Alta / edición ── */
let modalAccesoDocIdEdicion = null; // null = creando nuevo, string = editando existente
let comboboxAreaAcceso = null;
let modalAccesoAreasSeleccionadas = []; // áreas agregadas como chips en el modal actual

async function actualizarOpcionesComboboxAcceso() {
  const todas = await obtenerAreasNovedades();
  // las ya agregadas como chip se sacan de las sugerencias, para no poder duplicarlas
  const disponibles = todas.filter(a => !modalAccesoAreasSeleccionadas.includes(a));
  comboboxAreaAcceso.actualizar(disponibles, '');
}

function renderizarChipsAreaAcceso() {
  const cont = $('modal-acceso-areas-chips');
  if (!cont) return;
  if (!modalAccesoAreasSeleccionadas.length) {
    cont.innerHTML = `<span style="font-size:12px;color:var(--txt3);">Ninguna área agregada todavía</span>`;
    return;
  }
  const esc = s => String(s).replace(/'/g, "\\'");
  // Reutiliza la clase .badge-area (la misma insignia que ya usa el resto del
  // sistema) para heredar automáticamente su contraste correcto en modo claro
  // Y modo oscuro — un color fijo en línea se veía casi invisible en oscuro.
  cont.innerHTML = modalAccesoAreasSeleccionadas.map(a => `
    <span class="badge-area" style="display:inline-flex;align-items:center;gap:6px;padding:4px 6px 4px 10px;font-size:12px;margin:3px 4px 3px 0;">
      ${a}
      <button type="button" onclick="quitarAreaModalAcceso('${esc(a)}')" title="Quitar" style="border:none;background:none;cursor:pointer;font-weight:700;color:inherit;padding:0 3px;line-height:1;font-size:13px;">✕</button>
    </span>`).join('');
}

function agregarAreaModalAcceso(area) {
  if (!area || modalAccesoAreasSeleccionadas.includes(area)) return;
  modalAccesoAreasSeleccionadas.push(area);
  const input = $('modal-acceso-area-buscar');
  if (input) input.value = '';
  actualizarOpcionesComboboxAcceso();
  renderizarChipsAreaAcceso();
}

function quitarAreaModalAcceso(area) {
  modalAccesoAreasSeleccionadas = modalAccesoAreasSeleccionadas.filter(a => a !== area);
  actualizarOpcionesComboboxAcceso();
  renderizarChipsAreaAcceso();
}

async function poblarSelectAreaAcceso(areasIniciales) {
  modalAccesoAreasSeleccionadas = Array.isArray(areasIniciales)
    ? [...areasIniciales].filter(Boolean)
    : (areasIniciales ? [areasIniciales] : []);

  if (!comboboxAreaAcceso) {
    comboboxAreaAcceso = crearComboboxArea({
      inputId: 'modal-acceso-area-buscar',
      listaId: 'modal-acceso-area-lista',
      onSeleccionar: (area) => agregarAreaModalAcceso(area)
    });
  }
  await actualizarOpcionesComboboxAcceso();
  renderizarChipsAreaAcceso();
}

/* Al escribir el código en el modal, muestra a quién corresponde. */
async function verificarCodigoAcceso() {
  const codigo = ($('modal-acceso-codigo')?.value || '').trim();
  const el = $('modal-acceso-codigo-info');
  if (!el) return;
  if (!codigo) { el.textContent = ''; return; }
  const mapa = await obtenerMapaPersonal();
  const info = mapa.get(codigo);
  if (info) {
    el.style.color = 'var(--green)';
    el.textContent = '✓ ' + info.texto;
  } else {
    el.style.color = 'var(--red)';
    el.textContent = '✗ Ese código no está en la base de personal';
  }
}

async function mostrarFormAcceso() {
  modalAccesoDocIdEdicion = null;
  await poblarSelectAreaAcceso([]);
  $('modal-acceso-titulo').textContent = 'Nuevo Acceso';
  $('modal-acceso-sub').textContent = 'Asigne un código y una o varias áreas a este correo';
  $('modal-acceso-correo').value = '';
  $('modal-acceso-correo').disabled = false;
  if ($('modal-acceso-codigo')) $('modal-acceso-codigo').value = '';
  if ($('modal-acceso-codigo-info')) $('modal-acceso-codigo-info').textContent = '';
  $('modal-acceso').style.display = 'flex';
  hide('modal-acceso-error');
  $('modal-acceso-correo').focus();
}

// Recibe solo el docId y busca el resto en accesosCache — evita tener que
// serializar un arreglo de áreas dentro de un atributo onclick en el HTML.
async function editarAcceso(docId) {
  const acceso = accesosCache.find(a => a.id === docId);
  if (!acceso) { toast('❌ No se encontró ese acceso', 'err'); return; }

  modalAccesoDocIdEdicion = docId;
  await poblarSelectAreaAcceso(acceso.areas || []);
  $('modal-acceso-titulo').textContent = 'Editar Acceso';
  $('modal-acceso-sub').textContent = 'Cambie el correo, el código o las áreas asignadas';
  $('modal-acceso-correo').value = acceso.correo || docId;
  $('modal-acceso-correo').disabled = false; // el correo ahora sí se puede editar
  if ($('modal-acceso-codigo')) $('modal-acceso-codigo').value = acceso.codigo || '';
  if ($('modal-acceso-codigo-info')) $('modal-acceso-codigo-info').textContent = '';
  if (acceso.codigo) verificarCodigoAcceso();
  hide('modal-acceso-error');
  $('modal-acceso').style.display = 'flex';
}

function cerrarModalAcceso() {
  $('modal-acceso').style.display = 'none';
  modalAccesoDocIdEdicion = null;
}

async function confirmarGuardarAcceso() {
  const correo = $('modal-acceso-correo').value.trim();
  const areas = [...modalAccesoAreasSeleccionadas];
  const codigo = ($('modal-acceso-codigo')?.value || '').trim();
  const errorEl = $('modal-acceso-error');

  if (!correo || !correo.includes('@')) {
    errorEl.textContent = 'Ingrese un correo válido';
    show('modal-acceso-error');
    return;
  }
  if (!areas.length) {
    errorEl.textContent = 'Agregue al menos un área';
    show('modal-acceso-error');
    return;
  }

  await guardarAcceso(correo, areas, codigo, modalAccesoDocIdEdicion);
  cerrarModalAcceso();
}

async function guardarAcceso(correo, areas, codigo, docIdAnterior = null) {
  try {
    const correoNorm = correo.toLowerCase().trim();
    const accesoRef = window._fb.doc(db, 'accesos', correoNorm);
    const areasLimpias = [...new Set((Array.isArray(areas) ? areas : [areas]).filter(Boolean))];

    // Está editando un acceso existente y cambió el correo: el correo es el ID
    // del documento en Firestore, así que no se puede "renombrar" — hay que
    // crear el documento nuevo con los datos de siempre y borrar el anterior.
    if (docIdAnterior && docIdAnterior !== correoNorm) {
      const refAnterior = window._fb.doc(db, 'accesos', docIdAnterior);
      const snapAnterior = await window._fb.getDoc(refAnterior);
      if (!snapAnterior.exists()) {
        toast('❌ No se encontró el acceso original, no se pudo cambiar el correo', 'err');
        return;
      }
      const destinoExistente = await window._fb.getDoc(accesoRef);
      if (destinoExistente.exists()) {
        toast(`❌ Ya existe un acceso con el correo ${correoNorm}`, 'err');
        return;
      }

      const datosAnteriores = snapAnterior.data();
      const areaActivaPrevia = datosAnteriores.areaActiva;
      await window._fb.setDoc(accesoRef, {
        ...datosAnteriores,
        correo: correoNorm,
        codigo: String(codigo || '').trim(),
        areas: areasLimpias,
        area: areasLimpias[0] || '', // compatibilidad temporal — se retira cuando todo el sistema lea `areas`
        areaActiva: areasLimpias.includes(areaActivaPrevia) ? areaActivaPrevia : (areasLimpias[0] || null),
        ultimaEdicion: new Date()
      });
      await window._fb.deleteDoc(refAnterior);

      await registrarEnAuditoria(
        'editar_acceso', areasLimpias.join(', '), correoNorm, null, null,
        { codigo, correoAnterior: docIdAnterior },
        `Acceso con correo cambiado: ${docIdAnterior} → ${correoNorm} (áreas: ${areasLimpias.join(', ')})`
      );

      toast(`✅ Acceso actualizado — correo cambiado a ${correoNorm}`, 'ok');
      cargarAccesos();
      return;
    }

    // Un solo registro por correo (usando el correo como ID) — si la persona ya tenía
    // acceso y se le cambian las áreas, esto ACTUALIZA su lista en vez de crear un duplicado.
    const existente = await window._fb.getDoc(accesoRef);
    const areaActivaPrevia = existente.exists() ? existente.data().areaActiva : null;
    const areasAnteriores = existente.exists()
      ? (Array.isArray(existente.data().areas) ? existente.data().areas : (existente.data().area ? [existente.data().area] : []))
      : [];

    await window._fb.setDoc(accesoRef, {
      correo: correoNorm,
      codigo: String(codigo || '').trim(),
      areas: areasLimpias,
      area: areasLimpias[0] || '', // compatibilidad temporal — se retira cuando todo el sistema lea `areas`
      areaActiva: areasLimpias.includes(areaActivaPrevia) ? areaActivaPrevia : (areasLimpias[0] || null),
      estado: existente.exists() ? (existente.data().estado !== false) : true,
      fechaCreacion: existente.exists() ? existente.data().fechaCreacion : new Date(),
      ultimaEdicion: new Date()
    });

    await registrarEnAuditoria(
      existente.exists() ? 'editar_acceso' : 'crear_acceso',
      areasLimpias.join(', '), correoNorm, null, null, { codigo },
      existente.exists()
        ? `Acceso actualizado: ${correoNorm} → ${areasLimpias.join(', ')} (antes: ${areasAnteriores.join(', ') || '(sin área)'})`
        : `Nuevo acceso: ${correoNorm} → ${areasLimpias.join(', ')}`
    );

    toast(`✅ Acceso ${existente.exists() ? 'actualizado' : 'creado'}`, 'ok');
    cargarAccesos();

  } catch(e) {
    toast('Error: ' + e.message, 'err');
  }
}

/* ── Migración de un solo uso: accesos.area (string) → accesos.areas (arreglo) ──
   Habilita que un correo tenga varias áreas asignadas (agrupación de
   secretarías). Es seguro ejecutarla más de una vez: los documentos que ya
   tienen `areas` se saltan, así que nunca duplica ni pisa una agrupación que
   ya se haya armado a mano. Conserva el campo `area` original — no se borra
   en este paso, para no romper pantallas que todavía no fueron actualizadas. */
async function migrarAccesosAAreasMultiples() {
  if (!(await confirmarAccion(
    'Esto prepara todos los accesos existentes para poder asignarles varias áreas. ' +
    'Es seguro ejecutarlo más de una vez. ¿Continuar?',
    'Migrar a áreas múltiples'
  ))) return;

  try {
    const snap = await window._fb.getDocs(window._fb.collection(db, 'accesos'));

    let migrados = 0, saltados = 0, sinArea = 0;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();

      if (Array.isArray(data.areas)) { saltados++; continue; }

      const areaOriginal = (data.area || '').trim();
      if (!areaOriginal) sinArea++;

      await window._fb.setDoc(
        window._fb.doc(db, 'accesos', docSnap.id),
        { areas: areaOriginal ? [areaOriginal] : [], areaActiva: areaOriginal || null },
        { merge: true }
      );
      migrados++;
    }

    await registrarEnAuditoria(
      'migrar_areas_multiples', null, usuario.email, null, null,
      { migrados, saltados, sinArea },
      `Migración a áreas múltiples: ${migrados} migrados, ${saltados} ya estaban migrados, ${sinArea} sin área original`
    );

    toast(`✅ Migración completa: ${migrados} migrados, ${saltados} ya estaban listos${sinArea ? `, ⚠️ ${sinArea} sin área` : ''}`, 'ok');
    cargarAccesos();

  } catch (e) {
    toast('Error en la migración: ' + e.message, 'err');
  }
}

async function eliminarAcceso(docId) {
  const acceso = accesosCache.find(a => a.id === docId);
  if (!(await confirmarAccion(`¿Eliminar el acceso de ${acceso ? (acceso.nombre || acceso.correo) : docId}?`, 'Eliminar acceso'))) return;
  try {
    await window._fb.deleteDoc(window._fb.doc(db, 'accesos', docId));
    await registrarEnAuditoria('eliminar_acceso', (acceso?.areas || []).join(', ') || acceso?.area || null, acceso?.correo || docId, null, null, {},
      `Acceso eliminado: ${acceso?.correo || docId}`);
    toast('✅ Acceso eliminado', 'ok');
    cargarAccesos();
  } catch(e) {
    toast('Error: ' + e.message, 'err');
  }
}

/* ── Importación masiva de Accesos (Excel/CSV) ── */
let filasImportarAccesos = [];

async function importarAccesosDesdeArchivo(event) {
  const file = event.target.files[0];
  event.target.value = ''; // permite volver a elegir el mismo archivo después
  if (!file) return;

  try {
    // leerArchivoTabular soporta Excel (.xlsx/.xls, vía librería XLSX, cargándola
    // sola si hace falta) y CSV (lectura de texto plano, sin depender de esa librería)
    const filas = await leerArchivoTabular(file);
    if (filas.length < 2) {
      toast('El archivo no tiene filas de datos', 'err');
      return;
    }

    const encabezado = (filas[0] || []).map(h => String(h || '').toUpperCase().trim());
    const colCorreo = encabezado.findIndex(c => /CORREO|EMAIL|E-MAIL|MAIL/i.test(c));
    const colArea   = encabezado.findIndex(c => /ÁREA|AREA/i.test(c));
    const colCodigo = encabezado.findIndex(c => /C[OÓ]DIGO|^COD$|^C[OÓ]D\.?$/i.test(c));

    if (colCorreo === -1 || colArea === -1) {
      toast('❌ No se encontró una columna de correo y/o de área en el archivo. Verifique los encabezados.', 'err');
      return;
    }

    const areasReales = await obtenerAreasNovedades();
    const areasNorm = new Map(areasReales.map(a => [a.toLowerCase().trim(), a]));

    filasImportarAccesos = filas.slice(1).map(fila => {
      const correo = String(fila[colCorreo] || '').toLowerCase().trim();
      const areaTexto = sanitizarNombreArea(String(fila[colArea] || '').trim());
      const areaReal = areasNorm.get(areaTexto.toLowerCase());
      const codigo = colCodigo !== -1 ? String(fila[colCodigo] || '').trim() : '';

      let valido = true, motivo = '';
      let esAreaNueva = false;
      if (!correo || !correo.includes('@')) { valido = false; motivo = 'Correo inválido o vacío'; }
      else if (!areaTexto) { valido = false; motivo = 'Área vacía'; }
      else if (!areaReal) { esAreaNueva = true; motivo = `Área nueva — se creará en el catálogo`; }

      return { correo, codigo, area: areaReal || areaTexto, valido, esAreaNueva, motivo };
    }).filter(f => f.correo || f.area); // descarta filas totalmente vacías al final del archivo

    mostrarPrevisualizacionImportarAccesos();

  } catch(e) {
    console.error(e);
    toast('❌ Error leyendo el archivo: ' + e.message, 'err');
  }
}

function mostrarPrevisualizacionImportarAccesos() {
  const validos = filasImportarAccesos.filter(f => f.valido).length;
  const invalidos = filasImportarAccesos.length - validos;
  const areasNuevas = new Set(filasImportarAccesos.filter(f => f.valido && f.esAreaNueva).map(f => f.area));

  $('modal-importar-accesos-sub').textContent =
    `${filasImportarAccesos.length} filas leídas — ${validos} válidas${invalidos ? `, ${invalidos} con error (no se importarán)` : ''}` +
    (areasNuevas.size ? ` · ${areasNuevas.size} área(s) nueva(s) se crearán en el catálogo` : '');

  const cont = $('modal-importar-accesos-lista');
  cont.innerHTML = filasImportarAccesos.map(f => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px;">
      <span style="width:16px;flex-shrink:0;">${!f.valido ? '❌' : (f.esAreaNueva ? '🆕' : '✅')}</span>
      <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        <strong>${f.correo || '(sin correo)'}</strong>${f.codigo ? ` · CÓD ${f.codigo}` : ''} — ${f.area || '(sin área)'}
      </span>
      ${(!f.valido || f.esAreaNueva) ? `<span style="color:${f.valido ? 'var(--gold, #b8860b)' : 'var(--red)'};font-size:11px;flex-shrink:0;">${f.motivo}</span>` : ''}
    </div>
  `).join('');

  const btn = $('btn-confirmar-importar-accesos');
  btn.disabled = validos === 0;
  btn.textContent = validos ? `Confirmar importación (${validos})` : 'Nada que importar';

  $('modal-importar-accesos').style.display = 'flex';
}

function cerrarModalImportarAccesos() {
  $('modal-importar-accesos').style.display = 'none';
  filasImportarAccesos = [];
}

async function confirmarImportarAccesos() {
  const validos = filasImportarAccesos.filter(f => f.valido);
  if (!validos.length) return;

  const btn = $('btn-confirmar-importar-accesos');
  btn.disabled = true;
  btn.textContent = 'Importando...';

  // Sumar al catálogo las áreas nuevas que traiga el archivo (unión, nunca reemplazo)
  const areasNuevas = [...new Set(validos.filter(f => f.esAreaNueva).map(f => f.area))];
  if (areasNuevas.length) {
    try {
      const areasRef = window._fb.doc(db, 'sistema', 'areas_novedades');
      const areasSnap = await window._fb.getDoc(areasRef);
      const previas = areasSnap.exists() ? (areasSnap.data().lista || []) : [];
      const union = Array.from(new Set([...previas, ...areasNuevas])).sort();
      await window._fb.setDoc(areasRef, { lista: union, ultimaActualizacion: new Date() }, { merge: true });
    } catch(e) {
      console.error('No se pudo crear las áreas nuevas en el catálogo:', e);
      toast('⚠️ No se pudieron crear las áreas nuevas, se importarán solo los accesos con área existente: ' + e.message, 'err');
    }
  }

  let ok = 0, error = 0;
  for (const fila of validos) {
    try {
      const correoNorm = fila.correo.toLowerCase().trim();
      const accesoRef = window._fb.doc(db, 'accesos', correoNorm);
      const existente = await window._fb.getDoc(accesoRef);
      const areasExistentes = existente.exists()
        ? (Array.isArray(existente.data().areas) ? existente.data().areas : (existente.data().area ? [existente.data().area] : []))
        : [];
      // Suma el área del archivo a las que ya tenía (no las reemplaza) — así
      // importar un Excel no desarma una agrupación de áreas hecha a mano.
      const areasFinal = [...new Set([...areasExistentes, fila.area].filter(Boolean))];
      const areaActivaPrevia = existente.exists() ? existente.data().areaActiva : null;
      await window._fb.setDoc(accesoRef, {
        correo: correoNorm,
        codigo: fila.codigo || (existente.exists() ? (existente.data().codigo || '') : ''),
        areas: areasFinal,
        area: areasFinal[0] || '', // compatibilidad temporal
        areaActiva: areasFinal.includes(areaActivaPrevia) ? areaActivaPrevia : (areasFinal[0] || null),
        estado: existente.exists() ? (existente.data().estado !== false) : true,
        fechaCreacion: existente.exists() ? existente.data().fechaCreacion : new Date(),
        ultimaEdicion: new Date()
      });
      ok++;
    } catch(e) {
      console.error('Error importando acceso', fila.correo, e);
      error++;
    }
  }

  await registrarEnAuditoria(
    'importar_accesos', null, usuario.email, null, null,
    { cantidad: ok, areasNuevas },
    `Importación masiva de accesos: ${ok} creados/actualizados${error ? `, ${error} con error` : ''}${areasNuevas.length ? ` · áreas nuevas creadas: ${areasNuevas.join(', ')}` : ''}`
  );

  cerrarModalImportarAccesos();
  cargarAccesos();
  toast(error ? `✅ Se importaron ${ok} accesos — ${error} fallaron` : `✅ Se importaron ${ok} accesos`, 'ok');
}

/* ═════════════════════════════════════════
   PANEL ADMIN — Auditoría
   ─────────────────────────────────────────
   Paginación del lado del SERVIDOR: nunca se descarga la colección
   completa. Cada página es una consulta con `limit` y `startAfter`,
   de modo que el historial puede crecer indefinidamente sin que la
   pantalla se ponga lenta ni se dispare el consumo de lecturas.
═════════════════════════════════════════ */

const AUDITORIA_POR_PAGINA = 50;

/* Catálogo de acciones — el `value` debe coincidir con el primer
   argumento de registrarEnAuditoria() en cada punto del sistema. */
const ACCIONES_AUDITORIA = [
  { grupo: 'Novedades', items: [
    { v: 'modificar_novedad',             l: 'Modificar novedad' },
    { v: 'modificar_novedad_mes_cerrado', l: 'Modificar novedad (mes cerrado)' },
    { v: 'rellenar_sin_novedad',          l: 'Rellenar Sin Novedad' },
    { v: 'combinar_duplicados',           l: 'Combinar duplicados' },
    { v: 'cerrar_mes',                    l: 'Cerrar mes' },
    { v: 'preparar_mes',                  l: 'Preparar mes en todas las áreas' },
  ]},
  { grupo: 'Desbloqueos', items: [
    { v: 'aprobar_desbloqueo',            l: 'Aprobar desbloqueo' },
    { v: 'desbloqueo_directo',            l: 'Desbloqueo directo' },
  ]},
  { grupo: 'Accesos y permisos', items: [
    { v: 'crear_acceso',                  l: 'Crear acceso' },
    { v: 'editar_acceso',                 l: 'Editar acceso' },
    { v: 'eliminar_acceso',               l: 'Eliminar acceso' },
    { v: 'bloquear_acceso',               l: 'Bloquear acceso' },
    { v: 'activar_acceso',                l: 'Activar acceso' },
    { v: 'importar_accesos',              l: 'Importar accesos' },
    { v: 'cambiar_perfil',                l: 'Cambiar perfil' },
    { v: 'asignar_permiso',               l: 'Asignar permiso' },
    { v: 'quitar_permiso',                l: 'Quitar permiso' },
  ]},
  { grupo: 'Base de personal', items: [
    { v: 'importar_bd',                   l: 'Importar base de datos' },
    { v: 'crear_personal',                l: 'Crear registro de personal' },
    { v: 'editar_personal',               l: 'Editar registro de personal' },
    { v: 'corregir_area_personal',        l: 'Corregir área (error de digitación, no traslado)' },
    { v: 'eliminar_personal',             l: 'Eliminar registro de personal' },
    { v: 'cambio_area_lote',              l: 'Cambio de área en lote' },
    { v: 'corregir_area_lote',            l: 'Corregir área en lote (error de digitación, no traslado)' },
    { v: 'actualizar_areas_personal',     l: 'Actualizar áreas desde Excel' },
  ]},
  { grupo: 'Áreas', items: [
    { v: 'area_agregar',                  l: 'Agregar área' },
    { v: 'area_renombrar',                l: 'Renombrar área' },
    { v: 'area_eliminar',                 l: 'Eliminar área' },
    { v: 'area_importar',                 l: 'Importar catálogo de áreas' },
  ]},
  { grupo: 'Sistema', items: [
    { v: 'backup_mensual',                l: 'Generar respaldo' },
    { v: 'restaurar_backup',              l: 'Restaurar respaldo' },
    { v: 'borrar_toda_base_novedades',    l: 'Borrar base de Novedades' },
    { v: 'eliminar_auditoria',            l: 'Eliminar historial de auditoría' },
    { v: 'cambiar_config_cierre',         l: 'Cambiar configuración de cierre mensual' },
  ]},
];

const ETIQUETA_ACCION = (() => {
  const m = new Map();
  ACCIONES_AUDITORIA.forEach(g => g.items.forEach(i => m.set(i.v, i.l)));
  return m;
})();

let auditoriaPagina = 1;
let auditoriaCursores = [];    // último doc de cada página, para avanzar
let auditoriaHayMas = false;
let auditoriaCache = [];       // solo la página en pantalla
let auditoriaFiltros = { desde: '', hasta: '', accion: '', usuario: '', area: '' };

/* Arma la consulta con los filtros activos.
   `cursor` es el último documento de la página anterior (o null). */
function construirConsultaAuditoria(cursor, cantidad) {
  const F = window._fb;
  const partes = [F.collection(db, 'auditoria')];

  if (auditoriaFiltros.accion)  partes.push(F.where('accion', '==', auditoriaFiltros.accion));
  if (auditoriaFiltros.usuario) partes.push(F.where('admin', '==', auditoriaFiltros.usuario.toLowerCase().trim()));
  if (auditoriaFiltros.area)    partes.push(F.where('area', '==', auditoriaFiltros.area));

  if (auditoriaFiltros.desde) {
    const d = new Date(auditoriaFiltros.desde + 'T00:00:00');
    partes.push(F.where('timestamp', '>=', d));
  }
  if (auditoriaFiltros.hasta) {
    const h = new Date(auditoriaFiltros.hasta + 'T23:59:59');
    partes.push(F.where('timestamp', '<=', h));
  }

  partes.push(F.orderBy('timestamp', 'desc'));
  if (cursor) partes.push(F.startAfter(cursor));
  partes.push(F.limit(cantidad));

  return F.query(...partes);
}

/* Traduce el error de índice faltante de Firestore en algo accionable:
   la consola de Firebase devuelve el enlace directo para crearlo. */
function mostrarErrorAuditoria(e) {
  const cont = $('auditoria-body');
  const texto = String(e && e.message || e);
  const enlace = (texto.match(/https:\/\/console\.firebase\.google\.com\/\S+/) || [])[0];

  if (enlace) {
    cont.innerHTML = `<tr><td colspan="5" style="padding:16px;font-size:12px;line-height:1.6;">
      ⚠️ Esta combinación de filtros necesita un <strong>índice</strong> en Firestore.
      Se crea una sola vez y es gratuito.<br>
      <a href="${enlace}" target="_blank" rel="noopener" style="font-weight:700;text-decoration:underline;">
        Abrir la consola de Firebase para crearlo →</a><br>
      <span style="color:var(--txt2);">Tarda 1-2 minutos en construirse. Después vuelva a filtrar.</span>
    </td></tr>`;
  } else {
    cont.innerHTML = `<tr><td colspan="5" style="padding:16px;">❌ Error cargando la auditoría: ${texto}</td></tr>`;
  }
  hide('auditoria-vacio');
  const pag = $('auditoria-paginacion'); if (pag) pag.innerHTML = '';
}

async function cargarAuditoria(reiniciar = true) {
  const cont = $('auditoria-body');
  if (!cont) return;
  cont.innerHTML = `<tr><td colspan="5" class="td-vacio">Cargando...</td></tr>`;

  if (reiniciar) { auditoriaPagina = 1; auditoriaCursores = []; }

  try {
    const cursor = auditoriaPagina > 1 ? auditoriaCursores[auditoriaPagina - 2] : null;
    // Se pide UNO de más para saber si existe página siguiente, sin contar toda la colección
    const snap = await window._fb.getDocs(construirConsultaAuditoria(cursor, AUDITORIA_POR_PAGINA + 1));

    const docs = snap.docs;
    auditoriaHayMas = docs.length > AUDITORIA_POR_PAGINA;
    const dePagina = auditoriaHayMas ? docs.slice(0, AUDITORIA_POR_PAGINA) : docs;

    if (dePagina.length) auditoriaCursores[auditoriaPagina - 1] = dePagina[dePagina.length - 1];
    auditoriaCache = dePagina.map(d => ({ id: d.id, ...d.data() }));

    renderizarAuditoriaPagina();
  } catch(e) {
    console.error('Error cargando auditoría:', e);
    mostrarErrorAuditoria(e);
  }
}

function fechaAuditoria(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return isNaN(d) ? '' : d.toLocaleString('es-EC');
}

function renderizarAuditoriaPagina() {
  const tbody = $('auditoria-body');
  if (!tbody) return;

  if (!auditoriaCache.length) {
    tbody.innerHTML = '';
    show('auditoria-vacio');
    $('auditoria-vacio').textContent = auditoriaPagina > 1
      ? 'No hay más registros'
      : 'No hay registros que coincidan con los filtros';
    const pag = $('auditoria-paginacion'); if (pag) pag.innerHTML = '';
    return;
  }
  hide('auditoria-vacio');

  tbody.innerHTML = auditoriaCache.map(d => `
    <tr>
      <td style="font-size:10px;white-space:nowrap;">${fechaAuditoria(d.timestamp)}</td>
      <td style="font-size:10px;">${d.admin || '—'}</td>
      <td style="font-size:10px;font-weight:700;">${ETIQUETA_ACCION.get(d.accion) || d.accion || '—'}</td>
      <td style="font-size:10px;">${d.area || '—'}</td>
      <td style="font-size:10px;">${d.descripcion || '—'}</td>
    </tr>`).join('');

  const pag = $('auditoria-paginacion');
  if (pag) {
    pag.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
        <span style="font-size:12px;color:var(--txt2);">
          Página ${auditoriaPagina} — mostrando ${auditoriaCache.length} registro(s)
        </span>
        <div style="display:flex;gap:8px;">
          <button class="btn-acc btn-acc-ghost" ${auditoriaPagina <= 1 ? 'disabled' : ''} onclick="cambiarPaginaAuditoria(-1)">← Anterior</button>
          <button class="btn-acc btn-acc-ghost" ${auditoriaHayMas ? '' : 'disabled'} onclick="cambiarPaginaAuditoria(1)">Siguiente →</button>
        </div>
      </div>`;
  }
}

function cambiarPaginaAuditoria(delta) {
  const destino = auditoriaPagina + delta;
  if (destino < 1) return;
  if (delta > 0 && !auditoriaHayMas) return;
  auditoriaPagina = destino;
  cargarAuditoria(false);
}

async function filtrarAuditoria() {
  auditoriaFiltros = {
    desde:   ($('audit-desde')?.value || '').trim(),
    hasta:   ($('audit-hasta')?.value || '').trim(),
    accion:  ($('audit-accion')?.value || '').trim(),
    usuario: ($('audit-usuario')?.value || '').trim(),
    area:    ($('audit-area')?.value || '').trim(),
  };
  if (auditoriaFiltros.desde && auditoriaFiltros.hasta && auditoriaFiltros.desde > auditoriaFiltros.hasta) {
    toast('La fecha "Desde" no puede ser posterior a "Hasta"', 'err');
    return;
  }
  await cargarAuditoria(true);
}

function limpiarFiltrosAuditoria() {
  ['audit-desde','audit-hasta','audit-accion','audit-usuario','audit-area'].forEach(id => {
    const el = $(id); if (el) el.value = '';
  });
  auditoriaFiltros = { desde: '', hasta: '', accion: '', usuario: '', area: '' };
  cargarAuditoria(true);
}

/* Rellena el selector de acciones agrupado y el combobox de áreas. */
async function poblarFiltrosAuditoria() {
  const sel = $('audit-accion');
  if (sel && sel.dataset.poblado !== '1') {
    sel.innerHTML = '<option value="">Todas las acciones</option>' +
      ACCIONES_AUDITORIA.map(g =>
        `<optgroup label="${g.grupo}">` +
        g.items.map(i => `<option value="${i.v}">${i.l}</option>`).join('') +
        `</optgroup>`).join('');
    sel.dataset.poblado = '1';
  }
  const selArea = $('audit-area');
  if (selArea && selArea.dataset.poblado !== '1') {
    const areas = await obtenerAreasNovedades();
    selArea.innerHTML = '<option value="">Todas las áreas</option>' +
      (areas || []).map(a => `<option value="${a}">${a}</option>`).join('');
    selArea.dataset.poblado = '1';
  }
}

/* ── Exportar a Excel lo que esté filtrado ──
   Trae los registros POR LOTES, no todos de una vez, para no ahogar
   el navegador cuando el filtro abarca un mes completo. */
async function exportarAuditoria() {
  const LOTE = 500;
  const TECHO = 50000;   // resguardo: más que esto conviene acotar el rango

  try {
    toast('⏳ Recopilando registros...', 'ok');

    const filas = [];
    let cursor = null;
    while (filas.length < TECHO) {
      const snap = await window._fb.getDocs(construirConsultaAuditoria(cursor, LOTE));
      if (snap.empty) break;
      snap.docs.forEach(d => filas.push(d.data()));
      cursor = snap.docs[snap.docs.length - 1];
      if (snap.docs.length < LOTE) break;
      toast(`⏳ ${filas.length} registros...`, 'ok');
    }

    if (!filas.length) { toast('No hay registros que coincidan con los filtros', 'err'); return; }

    if (!window.ExcelJS) {
      await new Promise((res, rej) => {
        const sc = document.createElement('script');
        sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
        sc.onload = res; sc.onerror = rej;
        document.head.appendChild(sc);
      });
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Auditoría');
    ws.columns = [
      { header: 'FECHA Y HORA', key: 'fecha',  width: 22 },
      { header: 'USUARIO',      key: 'admin',  width: 32 },
      { header: 'ACCIÓN',       key: 'accion', width: 30 },
      { header: 'ÁREA',         key: 'area',   width: 30 },
      { header: 'PERÍODO',      key: 'mes',    width: 12 },
      { header: 'DÍA',          key: 'dia',    width: 7  },
      { header: 'AFECTADO',     key: 'afect',  width: 32 },
      { header: 'DESCRIPCIÓN',  key: 'desc',   width: 70 },
    ];
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A6E' } };
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    filas.forEach(d => ws.addRow({
      fecha:  fechaAuditoria(d.timestamp),
      admin:  d.admin || '',
      accion: ETIQUETA_ACCION.get(d.accion) || d.accion || '',
      area:   d.area || '',
      mes:    d.mes || '',
      dia:    d.dia || '',
      afect:  d.correoAfectado || '',
      desc:   d.descripcion || '',
    }));

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sufijo = auditoriaFiltros.desde || auditoriaFiltros.hasta
      ? `_${auditoriaFiltros.desde || 'inicio'}_a_${auditoriaFiltros.hasta || 'hoy'}`
      : '';
    a.download = `AUDITORIA_RCA${sufijo}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`✅ ${filas.length} registros exportados`, 'ok');
  } catch(e) {
    console.error(e);
    if (String(e.message || '').includes('index')) { mostrarErrorAuditoria(e); return; }
    toast('❌ Error exportando: ' + e.message, 'err');
  }
}

/* ── Eliminar historial: por rango de fechas o todo ──
   Solo con el permiso `auditoria_limpiar`. El borrado se hace en lotes
   de 400 porque Firestore rechaza los lotes de más de 500 operaciones
   (por eso el botón anterior fallaba apenas había algo de historial). */
function abrirModalEliminarAuditoria() {
  if (!tienePermisoAccion('auditoria_limpiar')) { toast('No tiene permiso para esta acción', 'err'); return; }
  $('elim-audit-modo').value = 'rango';
  $('elim-audit-desde').value = '';
  $('elim-audit-hasta').value = new Date().toISOString().slice(0, 10);
  $('elim-audit-confirmar').checked = false;
  $('elim-audit-progreso').textContent = '';
  cambiarModoEliminarAuditoria();
  verificarCheckEliminarAuditoria();
  $('modal-eliminar-auditoria').style.display = 'flex';
}

function cerrarModalEliminarAuditoria() { $('modal-eliminar-auditoria').style.display = 'none'; }

function cambiarModoEliminarAuditoria() {
  const todo = $('elim-audit-modo').value === 'todo';
  $('elim-audit-fechas').style.display = todo ? 'none' : 'grid';
  $('elim-audit-aviso').innerHTML = todo
    ? '⚠️ Se eliminará <strong>TODO</strong> el historial de auditoría, desde el primer registro. Esta acción no se puede deshacer.'
    : '⚠️ Se eliminarán los registros comprendidos en el rango indicado. Esta acción no se puede deshacer.';
}

function verificarCheckEliminarAuditoria() {
  $('btn-elim-audit').disabled = !$('elim-audit-confirmar').checked;
}

async function ejecutarEliminarAuditoria() {
  if (!tienePermisoAccion('auditoria_limpiar')) { toast('No tiene permiso para esta acción', 'err'); return; }
  if (!$('elim-audit-confirmar').checked) return;

  const modo  = $('elim-audit-modo').value;
  const desde = $('elim-audit-desde').value;
  const hasta = $('elim-audit-hasta').value;

  if (modo === 'rango' && !desde && !hasta) {
    toast('Indique al menos una de las dos fechas', 'err');
    return;
  }
  if (modo === 'rango' && desde && hasta && desde > hasta) {
    toast('La fecha "Desde" no puede ser posterior a "Hasta"', 'err');
    return;
  }

  const detalle = modo === 'todo'
    ? 'TODO el historial de auditoría'
    : `los registros del ${desde || 'inicio'} al ${hasta || 'hoy'}`;
  if (!(await confirmarAccion(`¿Confirma eliminar ${detalle}? Esta acción no se puede deshacer.`, 'Eliminar historial'))) return;

  const btn = $('btn-elim-audit');
  const prog = $('elim-audit-progreso');
  btn.disabled = true;
  btn.textContent = 'Eliminando...';

  let borrados = 0;
  try {
    const F = window._fb;
    while (true) {
      const partes = [F.collection(db, 'auditoria')];
      if (modo === 'rango') {
        if (desde) partes.push(F.where('timestamp', '>=', new Date(desde + 'T00:00:00')));
        if (hasta) partes.push(F.where('timestamp', '<=', new Date(hasta + 'T23:59:59')));
      }
      partes.push(F.orderBy('timestamp', 'desc'));
      partes.push(F.limit(400));   // Firestore rechaza lotes de más de 500 operaciones

      const snap = await F.getDocs(F.query(...partes));
      if (snap.empty) break;

      const batch = F.writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      borrados += snap.docs.length;
      prog.textContent = `Eliminando... ${borrados} registro(s)`;
      if (snap.docs.length < 400) break;
    }

    // El asiento del borrado se escribe DESPUÉS, así sobrevive a la eliminación
    // y el historial nunca queda en blanco sin explicación.
    await registrarEnAuditoria(
      'eliminar_auditoria', null, usuario.email, null, null,
      { modo, desde: desde || null, hasta: hasta || null, borrados },
      `Historial de auditoría eliminado (${modo === 'todo' ? 'todo' : `${desde || 'inicio'} a ${hasta || 'hoy'}`}) — ${borrados} registro(s), por ${usuario.email}`
    );

    prog.textContent = `✅ Listo. Se eliminaron ${borrados} registro(s).`;
    toast(`✅ ${borrados} registro(s) eliminados`, 'ok');
    setTimeout(() => { cerrarModalEliminarAuditoria(); cargarAuditoria(true); }, 1200);

  } catch(e) {
    console.error(e);
    if (String(e.message || '').includes('index')) {
      prog.textContent = '⚠️ Firestore necesita un índice para ese rango. Revise la consola del navegador para el enlace.';
    } else {
      prog.textContent = '❌ Error: ' + e.message;
    }
    toast('❌ Error eliminando: ' + e.message, 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Eliminar historial';
  }
}

/* ═════════════════════════════════════════
   PANEL ADMIN — Áreas (catálogo compartido por Envíos y Novedades)
═════════════════════════════════════════ */

let areasPanelCache = [];
let areaPanelEditando = null; // nombre del área que se está renombrando ahora mismo

async function cargarAreasPanel() {
  areasPanelCache = await obtenerAreasNovedades();
  areaPanelEditando = null;
  renderizarListaAreasPanel();
}

let areasPanelSeleccionadas = new Set();

function renderizarListaAreasPanel() {
  const cont = $('areas-panel-lista');
  const totalTxt = $('areas-panel-total');
  if (!cont) return;

  const filtro = ($('areas-panel-buscar')?.value || '').trim().toLowerCase();
  const filtradas = filtro
    ? areasPanelCache.filter(a => a.toLowerCase().includes(filtro))
    : areasPanelCache;

  // Quita de la selección áreas que ya no existen en el catálogo (renombradas/eliminadas)
  areasPanelSeleccionadas = new Set([...areasPanelSeleccionadas].filter(a => areasPanelCache.includes(a)));

  if (totalTxt) totalTxt.textContent = `${filtradas.length} de ${areasPanelCache.length} área${areasPanelCache.length !== 1 ? 's' : ''}`;

  if (!filtradas.length) {
    cont.innerHTML = `<div style="padding:16px;text-align:center;font-size:13px;color:var(--txt2);">Ningún área coincide con la búsqueda</div>`;
  } else {
    cont.innerHTML = filtradas.map(area => {
      const enEdicion = areaPanelEditando === area;
      const esc = area.replace(/'/g, "\\'");
      if (enEdicion) {
        return `
          <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);">
            <input type="text" id="areas-panel-input-editar" class="form-select" value="${area.replace(/"/g, '&quot;')}" style="flex:1;font-size:13px;padding:6px 10px;">
            <button class="btn-acc btn-acc-blue" style="padding:5px 10px;font-size:11px;" onclick="guardarRenombreAreaPanel('${esc}')">💾 Guardar</button>
            <button class="btn-acc btn-acc-ghost" style="padding:5px 10px;font-size:11px;" onclick="cancelarRenombreAreaPanel()">Cancelar</button>
          </div>`;
      }
      return `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);">
          <input type="checkbox" data-permiso="areas_gestionar" onchange="alternarSeleccionAreaPanel('${esc}')" ${areasPanelSeleccionadas.has(area) ? 'checked' : ''}>
          <span style="flex:1;font-size:13px;">${area}</span>
          <button class="btn-acc btn-acc-orange" style="padding:5px 10px;font-size:11px;" data-permiso="areas_gestionar" onclick="iniciarRenombreAreaPanel('${esc}')">✏️ Renombrar</button>
          <button class="btn-acc btn-acc-red" style="padding:5px 10px;font-size:11px;" data-permiso="areas_gestionar" onclick="eliminarAreaPanel('${esc}')">🗑️ Eliminar</button>
        </div>`;
    }).join('');
  }

  const checkTodas = $('areas-panel-check-todas');
  if (checkTodas) checkTodas.checked = filtradas.length > 0 && filtradas.every(a => areasPanelSeleccionadas.has(a));

  renderizarBarraSeleccionAreasPanel();
  aplicarPermisosBotones();
}

function alternarSeleccionAreaPanel(area) {
  if (areasPanelSeleccionadas.has(area)) areasPanelSeleccionadas.delete(area);
  else areasPanelSeleccionadas.add(area);
  renderizarListaAreasPanel();
}

function alternarSeleccionarTodasAreasPanel() {
  const filtro = ($('areas-panel-buscar')?.value || '').trim().toLowerCase();
  const filtradas = filtro ? areasPanelCache.filter(a => a.toLowerCase().includes(filtro)) : areasPanelCache;
  const todasMarcadas = filtradas.length > 0 && filtradas.every(a => areasPanelSeleccionadas.has(a));
  if (todasMarcadas) filtradas.forEach(a => areasPanelSeleccionadas.delete(a));
  else filtradas.forEach(a => areasPanelSeleccionadas.add(a));
  renderizarListaAreasPanel();
}

function cancelarSeleccionAreasPanel() {
  areasPanelSeleccionadas.clear();
  renderizarListaAreasPanel();
}

function renderizarBarraSeleccionAreasPanel() {
  const barra = $('areas-panel-barra-seleccion');
  const texto = $('areas-panel-seleccion-texto');
  if (!barra) return;
  const n = areasPanelSeleccionadas.size;
  if (n >= 2) {
    barra.style.display = 'flex';
    if (texto) texto.textContent = `${n} áreas seleccionadas`;
  } else {
    barra.style.display = 'none';
  }
}

async function agregarAreaPanel() {
  const input = $('nueva-area-input');
  const nombre = (input?.value || '').trim();
  if (!nombre) { toast('Escriba el nombre del área', 'err'); return; }
  if (areasPanelCache.some(a => a.toLowerCase() === nombre.toLowerCase())) {
    toast('❌ Ese área ya existe en la lista', 'err');
    return;
  }
  try {
    const nuevaLista = await guardarCatalogoAreas([...areasPanelCache, nombre]);
    areasPanelCache = nuevaLista;
    input.value = '';
    renderizarListaAreasPanel();
    await registrarEnAuditoria('area_agregar', nombre, usuario.email, null, null, {}, `Área agregada al catálogo: "${nombre}"`);
    toast(`✅ Área "${nombre}" agregada`, 'ok');
  } catch(e) {
    toast('❌ Error guardando: ' + e.message, 'err');
  }
}

// Importa áreas en lote desde un Excel/CSV — detecta la columna por encabezado
// (ÁREA / AREA / AREA ACTUAL) o toma la única columna si el archivo no trae encabezado
async function importarAreasPanel() {
  const fileInput = $('areas-import-file');
  const file = fileInput?.files?.[0];
  if (!file) { toast('⚠️ Seleccione un archivo CSV o Excel', 'warn'); return; }

  try {
    toast('⏳ Procesando archivo...', 'ok');
    const esExcel = /\.xlsx?$/i.test(file.name);
    let filas = [];

    if (esExcel) {
      if (!window.XLSX) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          s.onload = res; s.onerror = rej; document.head.appendChild(s);
        });
      }
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const primeraHoja = wb.Sheets[wb.SheetNames[0]];
      filas = XLSX.utils.sheet_to_json(primeraHoja, { header: 1, defval: '' })
        .map(fila => fila.map(celda => String(celda ?? '').trim()));
    } else {
      const text = await file.text();
      filas = text.split('\n').filter(l => l.trim())
        .map(linea => linea.split(',').map(p => p.replace(/^"|"$/g, '').trim()));
    }

    filas = filas.filter(fila => fila.some(c => c !== ''));
    if (!filas.length) { toast('❌ El archivo está vacío', 'err'); return; }

    // Detectar la columna de área por encabezado; si no hay encabezado reconocible
    // y el archivo tiene una sola columna, se usa esa
    const encabezado = filas[0].map(h => String(h || '').toUpperCase().trim());
    const nombresPosibles = ['ÁREA', 'AREA', 'AREA ACTUAL', 'ÁREA ACTUAL'];
    let iArea = encabezado.findIndex(h => nombresPosibles.includes(h));

    let filasDatos;
    if (iArea !== -1) {
      filasDatos = filas.slice(1); // saltar encabezado
    } else if (filas[0].length === 1) {
      iArea = 0;
      filasDatos = filas; // sin encabezado, columna única: todas las filas son datos
    } else {
      toast('❌ No encontré una columna "ÁREA" en el archivo. Use un encabezado "ÁREA" o suba un archivo de una sola columna.', 'err');
      return;
    }

    const areasDelArchivo = [...new Set(
      filasDatos.map(f => String(f[iArea] || '').trim()).filter(Boolean)
    )];

    if (!areasDelArchivo.length) {
      toast('❌ No se encontraron nombres de área en el archivo', 'err');
      return;
    }

    const existentesLower = new Set(areasPanelCache.map(a => a.toLowerCase()));
    const nuevas = areasDelArchivo.filter(a => !existentesLower.has(a.toLowerCase()));
    const yaExistian = areasDelArchivo.length - nuevas.length;

    if (!nuevas.length) {
      toast(`ℹ️ Las ${areasDelArchivo.length} áreas del archivo ya estaban en el catálogo`, 'ok');
      return;
    }

    const nuevaLista = await guardarCatalogoAreas([...areasPanelCache, ...nuevas]);
    areasPanelCache = nuevaLista;
    if (fileInput) fileInput.value = '';
    renderizarListaAreasPanel();
    await registrarEnAuditoria('area_importar', null, usuario.email, null, null,
      { agregadas: nuevas.length, yaExistian }, `Importación de áreas: ${nuevas.length} nuevas agregadas, ${yaExistian} ya existían`);
    toast(`✅ ${nuevas.length} área${nuevas.length !== 1 ? 's' : ''} agregada${nuevas.length !== 1 ? 's' : ''}${yaExistian ? ` (${yaExistian} ya existían y se omitieron)` : ''}`, 'ok');
  } catch(e) {
    toast('❌ Error importando: ' + e.message, 'err');
  }
}


function iniciarRenombreAreaPanel(area) {
  areaPanelEditando = area;
  renderizarListaAreasPanel();
  setTimeout(() => $('areas-panel-input-editar')?.focus(), 30);
}

function cancelarRenombreAreaPanel() {
  areaPanelEditando = null;
  renderizarListaAreasPanel();
}

async function guardarRenombreAreaPanel(nombreViejo) {
  const nuevoNombre = ($('areas-panel-input-editar')?.value || '').trim();
  if (!nuevoNombre) { toast('El nombre no puede quedar vacío', 'err'); return; }
  if (nuevoNombre === nombreViejo) { cancelarRenombreAreaPanel(); return; }
  if (areasPanelCache.some(a => a.toLowerCase() === nuevoNombre.toLowerCase())) {
    toast('❌ Ya existe un área con ese nombre', 'err');
    return;
  }

  const confirmado = await confirmarAccion(
    `Se renombrará "${nombreViejo}" a "${nuevoNombre}" en el catálogo. ` +
    `Los registros de Novedades y Envíos ya guardados con el nombre anterior NO se actualizan automáticamente. ¿Continuar?`,
    'Renombrar área'
  );
  if (!confirmado) return;

  try {
    const listaActualizada = areasPanelCache.map(a => a === nombreViejo ? nuevoNombre : a);
    const nuevaLista = await guardarCatalogoAreas(listaActualizada);
    areasPanelCache = nuevaLista;
    areaPanelEditando = null;
    renderizarListaAreasPanel();
    await registrarEnAuditoria('area_renombrar', nuevoNombre, usuario.email, null, null, { antes: nombreViejo, despues: nuevoNombre }, `Área renombrada: "${nombreViejo}" → "${nuevoNombre}"`);
    toast(`✅ Área renombrada a "${nuevoNombre}"`, 'ok');
  } catch(e) {
    toast('❌ Error guardando: ' + e.message, 'err');
  }
}

async function eliminarAreaPanel(area) {
  const confirmado = await confirmarAccion(
    `¿Eliminar "${area}" del catálogo de áreas? Ya no aparecerá como opción en Envíos ni en Novedades, ` +
    `pero los registros ya guardados con esta área no se borran.`,
    'Eliminar área'
  );
  if (!confirmado) return;

  try {
    const nuevaLista = await guardarCatalogoAreas(areasPanelCache.filter(a => a !== area));
    areasPanelCache = nuevaLista;
    renderizarListaAreasPanel();
    await registrarEnAuditoria('area_eliminar', area, usuario.email, null, null, {}, `Área eliminada del catálogo: "${area}"`);
    toast(`✅ Área "${area}" eliminada`, 'ok');
  } catch(e) {
    toast('❌ Error guardando: ' + e.message, 'err');
  }
}

/* ── Unificar varias áreas seleccionadas en un solo nombre ──
   Fusiona el catálogo (varias áreas -> una sola), copia el historial de
   Novedades desde UNIFICAR_AREAS_DESDE hasta el mes actual (Firestore no
   permite listar qué meses tiene cada área, así que se recorre ese rango
   mes por mes) y actualiza los accesos que tenían asignada alguna de las
   áreas viejas. No borra los documentos originales — quedan como historial
   huérfano pero intacto, igual que al renombrar o eliminar un área. */
const UNIFICAR_AREAS_DESDE = '2026-09';

let unificarAreasViejas = [];
let unificarAreasPreview = null;

function abrirModalUnificarAreas() {
  const areas = [...areasPanelSeleccionadas];
  if (areas.length < 2) return;

  unificarAreasViejas = areas;
  unificarAreasPreview = null;
  $('modal-unificar-areas-sub').textContent = `${areas.length} áreas seleccionadas`;
  $('modal-unificar-areas-lista-seleccion').innerHTML = areas.map(a =>
    `<span class="badge-area" style="display:inline-block;padding:4px 10px;font-size:12px;margin:3px 4px 3px 0;">${a}</span>`
  ).join('');
  $('modal-unificar-nombre-nuevo').value = '';
  $('modal-unificar-areas-preview').innerHTML = '';
  $('modal-unificar-desde-txt').textContent = `${obtenerNombreMes(UNIFICAR_AREAS_DESDE.split('-')[1])} ${UNIFICAR_AREAS_DESDE.split('-')[0]}`;
  hide('modal-unificar-areas-error');
  ocultarProgresoUnificar();
  $('modal-unificar-btn-analizar').disabled = false;
  $('modal-unificar-btn-analizar').style.display = '';
  $('modal-unificar-btn-confirmar').disabled = false;
  $('modal-unificar-btn-confirmar').style.display = 'none';

  $('modal-unificar-areas').style.display = 'flex';
}

function cerrarModalUnificarAreas() {
  $('modal-unificar-areas').style.display = 'none';
}

function mostrarProgresoUnificar(label) {
  $('modal-unificar-progreso-label').textContent = label;
  $('modal-unificar-progreso-txt').textContent = '0%';
  $('modal-unificar-progreso-bar').style.width = '0%';
  $('modal-unificar-progreso-wrap').style.display = 'block';
}

function actualizarProgresoUnificar(hechos, total, label) {
  const pct = total > 0 ? Math.round((hechos / total) * 100) : 100;
  $('modal-unificar-progreso-bar').style.width = pct + '%';
  $('modal-unificar-progreso-txt').textContent = pct + '%';
  if (label) $('modal-unificar-progreso-label').textContent = label;
}

function ocultarProgresoUnificar() {
  $('modal-unificar-progreso-wrap').style.display = 'none';
}

// Recorre mes por mes desde UNIFICAR_AREAS_DESDE hasta el actual, revisando
// si cada área vieja tiene novedades cargadas en ese mes.
async function analizarUnificarAreas() {
  const errorEl = $('modal-unificar-areas-error');
  hide('modal-unificar-areas-error');

  const nombreNuevo = ($('modal-unificar-nombre-nuevo')?.value || '').trim();
  if (!nombreNuevo) {
    errorEl.textContent = 'Escriba el nombre del área unificada';
    show('modal-unificar-areas-error');
    return;
  }
  if (areasPanelCache.some(a => a.toLowerCase() === nombreNuevo.toLowerCase() && !unificarAreasViejas.some(v => v.toLowerCase() === a.toLowerCase()))) {
    errorEl.textContent = 'Ya existe otra área con ese nombre en el catálogo';
    show('modal-unificar-areas-error');
    return;
  }

  $('modal-unificar-areas-preview').innerHTML = '';
  $('modal-unificar-btn-analizar').disabled = true;

  const periodoActual = obtenerFechaParts().periodo;
  const periodos = [];
  let p = UNIFICAR_AREAS_DESDE;
  while (periodos.length < 60) {
    periodos.push(p);
    if (p === periodoActual) break;
    p = obtenerPeriodoSiguiente(p);
  }

  const totalRevisiones = periodos.length * unificarAreasViejas.length;
  let hechas = 0;
  mostrarProgresoUnificar(`Revisando meses desde ${UNIFICAR_AREAS_DESDE}...`);

  const conDatos = [];
  for (const periodo of periodos) {
    const fuentes = [];
    for (const area of unificarAreasViejas) {
      const snap = await window._fb.getDoc(window._fb.doc(db, 'novedades', area, periodo, 'datos'));
      if (snap.exists()) fuentes.push({ area, datos: snap.data() });
      hechas++;
      actualizarProgresoUnificar(hechas, totalRevisiones, `Revisando ${periodo} — ${area}`);
    }
    if (fuentes.length) conDatos.push({ periodo, fuentes, accion: fuentes.length > 1 ? 'unir' : 'copiar' });
  }

  await cargarAccesos();
  const accesosAfectados = accesosCache.filter(a => a.areas.some(ar => unificarAreasViejas.includes(ar)));

  unificarAreasPreview = { nombreNuevo, periodos: conDatos, accesosAfectados };
  ocultarProgresoUnificar();
  $('modal-unificar-btn-analizar').disabled = false;
  renderizarPreviewUnificarAreas();
}

function renderizarPreviewUnificarAreas() {
  const cont = $('modal-unificar-areas-preview');
  const { periodos, accesosAfectados, nombreNuevo } = unificarAreasPreview;

  let html = '';
  if (!periodos.length) {
    html += `<div style="padding:12px;font-size:12px;color:var(--txt2);">No se encontraron novedades cargadas en esas áreas desde ${UNIFICAR_AREAS_DESDE}.</div>`;
  } else {
    html += `<div style="padding:8px 10px;font-size:12px;font-weight:600;">Meses con novedades que se copiarán a "${nombreNuevo}":</div>`;
    html += periodos.map(p => {
      if (p.fuentes.length === 1) {
        return `<div style="padding:6px 10px;font-size:12px;border-top:1px solid var(--border);">${p.periodo} — copia directa desde ${p.fuentes[0].area}</div>`;
      }
      return `
        <div style="padding:6px 10px;font-size:12px;border-top:1px solid var(--border);background:rgba(234,179,8,.10);">
          <div>⚠️ ${p.periodo} — tiene novedades en ${p.fuentes.map(f => f.area).join(' Y ')} a la vez</div>
          <label style="display:flex;align-items:center;gap:6px;margin-top:4px;cursor:pointer;">
            <input type="checkbox" ${p.accion === 'unir' ? 'checked' : ''} onchange="alternarAccionConflictoUnificar('${p.periodo}')">
            Unir las listas de agentes de ambas (si lo desmarca, este mes se omite y lo revisa usted manualmente después)
          </label>
        </div>`;
    }).join('');
  }

  html += `<div style="padding:8px 10px;font-size:12px;font-weight:600;border-top:1px solid var(--border);">Accesos que se actualizarán automáticamente:</div>`;
  html += accesosAfectados.length
    ? accesosAfectados.map(a => `<div style="padding:4px 10px;font-size:12px;">${a.correo}</div>`).join('')
    : `<div style="padding:4px 10px;font-size:12px;color:var(--txt2);">Ninguno tiene hoy asignada alguna de estas áreas.</div>`;

  cont.innerHTML = html;
  $('modal-unificar-btn-analizar').style.display = 'none';
  $('modal-unificar-btn-confirmar').style.display = '';
}

function alternarAccionConflictoUnificar(periodo) {
  const item = unificarAreasPreview?.periodos.find(p => p.periodo === periodo);
  if (item) item.accion = item.accion === 'unir' ? 'omitir' : 'unir';
}

async function confirmarUnificarAreas() {
  const errorEl = $('modal-unificar-areas-error');
  hide('modal-unificar-areas-error');
  if (!unificarAreasPreview) return;

  const { nombreNuevo, periodos, accesosAfectados } = unificarAreasPreview;

  const confirmado = await confirmarAccion(
    `Se van a unificar ${unificarAreasViejas.length} áreas en "${nombreNuevo}": se copiará su historial de novedades ` +
    `desde ${UNIFICAR_AREAS_DESDE}, se actualizarán ${accesosAfectados.length} acceso(s) y las áreas viejas se quitarán ` +
    `del catálogo (sus registros originales no se borran). ¿Continuar?`,
    'Unificar áreas'
  );
  if (!confirmado) return;

  try {
    $('modal-unificar-btn-confirmar').disabled = true;

    const totalPasos = periodos.length + accesosAfectados.length + 1; // + 1 por el catálogo
    let hechos = 0;
    mostrarProgresoUnificar('Copiando novedades...');

    // 1. Copiar/fusionar el historial de Novedades mes por mes
    for (const p of periodos) {
      if (p.fuentes.length > 1 && p.accion !== 'unir') { hechos++; continue; } // conflicto sin resolver: se omite, queda para revisión manual

      actualizarProgresoUnificar(hechos, totalPasos, `Copiando novedades de ${p.periodo}...`);

      let datosFinal;
      if (p.fuentes.length === 1) {
        datosFinal = { ...p.fuentes[0].datos };
      } else {
        // Toma como base el documento modificado más recientemente (conserva su
        // estado de cierre/bloqueos como el vigente) y le suma los agentes que
        // falten de la(s) otra(s) fuente(s), sin duplicar por código.
        const ordenados = [...p.fuentes].sort((a, b) => {
          const fa = a.datos.ultimaModificacion?.toDate ? a.datos.ultimaModificacion.toDate().getTime() : 0;
          const fb = b.datos.ultimaModificacion?.toDate ? b.datos.ultimaModificacion.toDate().getTime() : 0;
          return fb - fa;
        });
        const base = { ...ordenados[0].datos };
        const agentesUnidos = [...(base.agentes || [])];
        const codigosExistentes = new Set(agentesUnidos.map(ag => ag.codigo));
        for (const otra of ordenados.slice(1)) {
          for (const ag of (otra.datos.agentes || [])) {
            if (!codigosExistentes.has(ag.codigo)) {
              agentesUnidos.push(ag);
              codigosExistentes.add(ag.codigo);
            }
          }
        }
        datosFinal = { ...base, agentes: agentesUnidos };
      }
      await window._fb.setDoc(window._fb.doc(db, 'novedades', nombreNuevo, p.periodo, 'datos'), datosFinal);
      hechos++;
      actualizarProgresoUnificar(hechos, totalPasos);
    }

    // 2. Catálogo: quita las áreas viejas, agrega la nueva
    actualizarProgresoUnificar(hechos, totalPasos, 'Actualizando el catálogo de áreas...');
    const catalogoActual = await obtenerAreasNovedades();
    const catalogoNuevo = [...new Set([
      ...catalogoActual.filter(a => !unificarAreasViejas.includes(a)),
      nombreNuevo
    ])];
    areasPanelCache = await guardarCatalogoAreas(catalogoNuevo);
    hechos++;
    actualizarProgresoUnificar(hechos, totalPasos);

    // 3. Accesos: reemplaza cualquier área vieja por el nombre nuevo
    for (const acceso of accesosAfectados) {
      actualizarProgresoUnificar(hechos, totalPasos, `Actualizando acceso ${acceso.correo}...`);
      const areasNuevas = [...new Set(acceso.areas.map(a => unificarAreasViejas.includes(a) ? nombreNuevo : a))];
      await guardarAcceso(acceso.correo, areasNuevas, acceso.codigo, acceso.id);
      hechos++;
      actualizarProgresoUnificar(hechos, totalPasos);
    }

    const mesesFusionados = periodos.filter(p => p.fuentes.length === 1 || p.accion === 'unir').map(p => p.periodo);
    await registrarEnAuditoria('area_unificar', nombreNuevo, usuario.email, null, null,
      { areasViejas: unificarAreasViejas, mesesFusionados },
      `Áreas unificadas en "${nombreNuevo}": ${unificarAreasViejas.join(', ')} — ${mesesFusionados.length} mes(es) copiados, ${accesosAfectados.length} acceso(s) actualizados`
    );

    toast(`✅ Áreas unificadas en "${nombreNuevo}"`, 'ok');
    ocultarProgresoUnificar();
    $('modal-unificar-btn-confirmar').disabled = false;
    cancelarSeleccionAreasPanel();
    cerrarModalUnificarAreas();
    renderizarListaAreasPanel();

  } catch(e) {
    ocultarProgresoUnificar();
    $('modal-unificar-btn-confirmar').disabled = false;
    errorEl.textContent = 'Error unificando: ' + e.message;
    show('modal-unificar-areas-error');
  }
}

/* ═════════════════════════════════════════
   PANEL ADMIN — Desbloqueos
═════════════════════════════════════════ */

async function poblarSelectoresDesbloqueoDirecto() {
  poblarSelectoresProrroga();
  poblarSelectoresReponerIntentos();
  const selArea = $('desbloqueo-directo-area');
  const selMes = $('desbloqueo-directo-mes');
  const selAnio = $('desbloqueo-directo-anio');
  const selDia = $('desbloqueo-directo-dia');
  if (!selArea || !selMes || !selAnio || !selDia) return;

  const areasReales = await obtenerAreasNovedades();
  selArea.innerHTML = areasReales.map(a => `<option value="${a}">${a}</option>`).join('');

  if (selMes.options.length === 0) {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    meses.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = String(i + 1).padStart(2, '0');
      opt.textContent = m;
      selMes.appendChild(opt);
    });
  }
  if (selAnio.options.length === 0) {
    const anioActual = new Date().getFullYear();
    for (let a = anioActual - 1; a <= anioActual + 1; a++) {
      const opt = document.createElement('option');
      opt.value = String(a);
      opt.textContent = String(a);
      selAnio.appendChild(opt);
    }
  }
  if (selDia.options.length === 0) {
    for (let d = 1; d <= 31; d++) {
      const opt = document.createElement('option');
      opt.value = String(d);
      opt.textContent = String(d);
      selDia.appendChild(opt);
    }
  }

  const hoy = obtenerFechaParts();
  selMes.value = hoy.mes;
  selAnio.value = String(new Date().getFullYear());
  selDia.value = String(hoy.dia);
}

async function desbloquearDiaDirecto() {
  const area = $('desbloqueo-directo-area').value;
  const mes = $('desbloqueo-directo-mes').value;
  const anio = $('desbloqueo-directo-anio').value;
  const dia = parseInt($('desbloqueo-directo-dia').value, 10);
  if (!area || !mes || !anio || !dia) { toast('Complete todos los campos', 'err'); return; }

  const periodo = `${anio}-${mes}`;

  try {
    const ref = window._fb.doc(db, 'novedades', area, periodo, 'datos');
    const snap = await window._fb.getDoc(ref);
    if (!snap.exists()) {
      toast(`No hay datos de Novedades para ${area} — ${periodo}`, 'err');
      return;
    }
    const data = snap.data();
    const diasDesbloqueados = data.diasDesbloqueados || [];
    if (!diasDesbloqueados.includes(dia)) diasDesbloqueados.push(dia);

    await window._fb.updateDoc(ref, { diasDesbloqueados });

    await registrarEnAuditoria(
      'desbloqueo_directo', area, usuario.email, dia, periodo, {},
      `Desbloqueo directo (sin solicitud): ${area} — día ${dia} de ${periodo}, autorizado por ${usuario.email}`
    );

    toast(`✅ Día ${dia} de ${periodo} desbloqueado para ${area}. Se vuelve a bloquear solo apenas guarden el cambio.`, 'ok');

    // Si es el área/mes que se está viendo, refrescar
    if (areaActual === area) cargarNovedadesActuales();

  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

async function cargarDesbloqueos() {
  try {
    const solicitudes = await window._fb.getDocs(window._fb.collection(db, 'solicitudes'));
    const lista = $('desbloqueos-lista');
    const vacio = $('desbloqueos-vacio');
    
    lista.innerHTML = '';
    
    let pendientes = 0, aprobadas = 0, rechazadas = 0;
    
    if (solicitudes.empty) {
      show('desbloqueos-vacio');
      $('stat-pendientes').textContent = '0';
      $('stat-aprobadas').textContent = '0';
      $('stat-rechazadas').textContent = '0';
      return;
    }
    
    hide('desbloqueos-vacio');
    
    solicitudes.forEach(doc => {
      const data = doc.data();
      if (data.estado === 'pendiente') pendientes++;
      else if (data.estado === 'aprobada') aprobadas++;
      else if (data.estado === 'rechazada') rechazadas++;
      
      const div = document.createElement('div');
      div.style.cssText = 'padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);margin-bottom:8px;';
      
      const badge = data.estado === 'pendiente' ? '🔄' : data.estado === 'aprobada' ? '✅' : '❌';
      
      const etiquetaTipo = data.tipo === 'desbloqueo_dia' ? 'Día ' + data.dia
        : data.tipo === 'desbloqueo_multiples_dias' ? 'Días ' + (data.dias || []).join(', ')
        : 'Mes ' + data.mes;

      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:600;">${badge} ${data.correoUsuario}</div>
            <div style="font-size:11px;color:var(--txt2);">${data.area} — ${etiquetaTipo}${data.mes ? ' · ' + data.mes : ''}</div>
            ${data.razon ? `<div style="font-size:11px;color:var(--txt3);margin-top:2px;">"${data.razon}"</div>` : ''}
          </div>
          ${data.estado === 'pendiente' && tienePermisoAccion('desbloqueos_aprobar') ? `
            <div style="display:flex;gap:6px;">
              <button class="btn-acc btn-acc-green" onclick="aprobarDesbloqueo('${doc.id}')">Aprobar</button>
              <button class="btn-acc btn-acc-red" onclick="rechazarDesbloqueo('${doc.id}')">Rechazar</button>
            </div>
          ` : ''}
        </div>
      `;
      lista.appendChild(div);
    });
    
    $('stat-pendientes').textContent = pendientes;
    $('stat-aprobadas').textContent = aprobadas;
    $('stat-rechazadas').textContent = rechazadas;
    
  } catch(e) {
    console.error('Error:', e);
  }
}

/* ═════════════════════════════════════════
   PRÓRROGA DE CIERRE (solo administrador)
   Habilita a un área —o a todas las que tienen el informe pendiente— a completar
   todos los días de un mes y generar su informe completo, sin que el cierre las
   bloquee. Termina sola cuando el área genera su informe, o con "Retirar".
═════════════════════════════════════════ */

async function poblarSelectoresReponerIntentos() {
  const selArea = $('reponer-intentos-area');
  const selMes  = $('reponer-intentos-mes');
  const selAnio = $('reponer-intentos-anio');
  if (!selArea || !selMes || !selAnio) return;

  if (selArea.options.length === 0) {
    const areas = await obtenerAreasNovedades();
    selArea.innerHTML = areas.map(a => `<option value="${a}">${a}</option>`).join('');
  }
  if (selMes.options.length === 0) {
    ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      .forEach((m, i) => {
        const opt = document.createElement('option');
        opt.value = String(i + 1).padStart(2, '0');
        opt.textContent = m;
        selMes.appendChild(opt);
      });
  }
  if (selAnio.options.length === 0) {
    const anioActual = new Date().getFullYear();
    for (let a = anioActual - 1; a <= anioActual + 1; a++) {
      const opt = document.createElement('option');
      opt.value = String(a);
      opt.textContent = String(a);
      selAnio.appendChild(opt);
    }
  }
  // Por defecto: el mes recién culminado, igual que en la prórroga. Solo la
  // primera vez, para no pisar lo que el administrador ya haya elegido.
  if (!selMes.dataset.listo) {
    const ant = obtenerPeriodoAnterior(obtenerFechaParts().periodo);
    selAnio.value = ant.split('-')[0];
    selMes.value  = ant.split('-')[1];
    selMes.dataset.listo = '1';
  }
}

async function poblarSelectoresProrroga() {
  const selArea = $('prorroga-area');
  const selMes  = $('prorroga-mes');
  const selAnio = $('prorroga-anio');
  if (!selArea || !selMes || !selAnio) return;

  if (selArea.options.length === 0) {
    const areas = await obtenerAreasNovedades();
    selArea.innerHTML = '<option value="__TODAS__">⏳ Todas las áreas que apliquen</option>' +
      areas.map(a => `<option value="${a}">${a}</option>`).join('');
  }
  if (selMes.options.length === 0) {
    ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      .forEach((m, i) => {
        const opt = document.createElement('option');
        opt.value = String(i + 1).padStart(2, '0');
        opt.textContent = m;
        selMes.appendChild(opt);
      });
  }
  if (selAnio.options.length === 0) {
    const anioActual = new Date().getFullYear();
    for (let a = anioActual - 1; a <= anioActual + 1; a++) {
      const opt = document.createElement('option');
      opt.value = String(a);
      opt.textContent = String(a);
      selAnio.appendChild(opt);
    }
  }
  // Por defecto: el mes recién culminado (el que se cierra). Solo la primera vez,
  // para no pisar lo que el administrador ya haya elegido.
  if (!selMes.dataset.listo) {
    const ant = obtenerPeriodoAnterior(obtenerFechaParts().periodo);
    selAnio.value = ant.split('-')[0];
    selMes.value  = ant.split('-')[1];
    selMes.dataset.listo = '1';
  }
}

// Lee de Firestore el documento del período para cada área indicada
async function leerAreasParaProrroga(areas, periodo) {
  return Promise.all(areas.map(async area => {
    const ref  = window._fb.doc(db, 'novedades', area, periodo, 'datos');
    const snap = await window._fb.getDoc(ref);
    return { area, ref, snap };
  }));
}

function resumenAreasProrroga(candidatas) {
  const nombres = candidatas.map(c => c.area);
  const visibles = nombres.slice(0, 12).map(n => '• ' + n).join('\n');
  const extra = nombres.length > 12 ? `\n… y ${nombres.length - 12} más` : '';
  return `${visibles}${extra}`;
}

async function habilitarProrrogaCierre() {
  if (!esAdmin()) { toast('❌ Solo el administrador puede habilitar prórrogas', 'err'); return; }
  const sel  = $('prorroga-area').value;
  const mes  = $('prorroga-mes').value;
  const anio = $('prorroga-anio').value;
  if (!sel || !mes || !anio) { toast('Complete todos los campos', 'err'); return; }

  const periodo = `${anio}-${mes}`;
  const todas   = sel === '__TODAS__';

  try {
    toast('⏳ Revisando áreas...', 'ok');
    const areas = todas ? await obtenerAreasNovedades() : [sel];
    const lecturas = await leerAreasParaProrroga(areas, periodo);

    const candidatas = lecturas.filter(({ snap }) => {
      if (!snap.exists()) return false;
      const d = snap.data();
      if (!(d.agentes || []).length) return false;          // sin nómina cargada
      if (d.prorroga && d.prorroga.activa) return false;    // ya tiene prórroga
      return todas ? d.estado !== 'cerrado' : true;         // "todas" = solo las pendientes
    });

    if (!candidatas.length) {
      toast(todas
        ? `No hay áreas con informe pendiente en ${periodo} (o ya tienen prórroga activa)`
        : `${sel} no tiene datos en ${periodo} o ya tiene una prórroga activa`, 'err');
      return;
    }

    const reabre = !todas && candidatas[0].snap.data().estado === 'cerrado';
    const mensaje = reabre
      ? `${sel} ya generó su informe de ${periodo}. Con la prórroga se reabrirá el mes completo para que lo complete y genere el informe de nuevo.\n\n¿Habilitar la prórroga?`
      : `Se habilitará la prórroga de ${periodo} (todos los días del mes) para ${candidatas.length} área(s):\n\n${resumenAreasProrroga(candidatas)}\n\n¿Continuar?`;
    const ok = await confirmarAccion(mensaje, 'Habilitar prórroga de cierre');
    if (!ok) return;

    const totalDias = diasEnMes(periodo);
    const todosLosDias = Array.from({ length: totalDias }, (_, i) => i + 1);

    for (const { area, ref, snap } of candidatas) {
      const d = snap.data();
      const upd = {
        diasDesbloqueados: todosLosDias,
        prorroga: {
          activa: true,
          por: usuario.email,
          fecha: new Date(),
          periodo,
          estadoPrevio: d.estado || null
        }
      };
      if (d.estado === 'cerrado') upd.estado = 'prorroga';
      await window._fb.updateDoc(ref, upd);
      await registrarEnAuditoria(
        'prorroga_cierre', area, usuario.email, null, periodo,
        { dias: totalDias, reabierto: d.estado === 'cerrado' },
        `Prórroga de cierre habilitada para ${area} — ${periodo} (mes completo), autorizada por ${usuario.email}`
      );
    }

    toast(`✅ Prórroga habilitada en ${candidatas.length} área(s) para ${periodo}`, 'ok');
    if (areaActual && candidatas.some(c => c.area === areaActual)) cargarNovedadesActuales();

  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

async function retirarProrrogaCierre() {
  if (!esAdmin()) { toast('❌ Solo el administrador puede retirar prórrogas', 'err'); return; }
  const sel  = $('prorroga-area').value;
  const mes  = $('prorroga-mes').value;
  const anio = $('prorroga-anio').value;
  if (!sel || !mes || !anio) { toast('Complete todos los campos', 'err'); return; }

  const periodo = `${anio}-${mes}`;
  const todas   = sel === '__TODAS__';

  try {
    toast('⏳ Revisando áreas...', 'ok');
    const areas = todas ? await obtenerAreasNovedades() : [sel];
    const lecturas = await leerAreasParaProrroga(areas, periodo);
    const candidatas = lecturas.filter(({ snap }) =>
      snap.exists() && snap.data().prorroga && snap.data().prorroga.activa);

    if (!candidatas.length) {
      toast(todas ? `No hay prórrogas activas en ${periodo}` : `${sel} no tiene una prórroga activa en ${periodo}`, 'err');
      return;
    }

    const ok = await confirmarAccion(
      `Se retirará la prórroga de ${periodo} en ${candidatas.length} área(s) y los días volverán a bloquearse:\n\n${resumenAreasProrroga(candidatas)}\n\nLo que ya hayan guardado se conserva. ¿Continuar?`,
      'Retirar prórroga de cierre'
    );
    if (!ok) return;

    for (const { area, ref, snap } of candidatas) {
      const d = snap.data();
      const upd = {
        diasDesbloqueados: [],
        'prorroga.activa': false,
        'prorroga.retiradaPor': usuario.email,
        'prorroga.retiradaEn': new Date()
      };
      // Si el área ya había generado su informe antes de la prórroga, vuelve a quedar cerrada
      if (d.prorroga.estadoPrevio === 'cerrado') upd.estado = 'cerrado';
      await window._fb.updateDoc(ref, upd);
      await registrarEnAuditoria(
        'retirar_prorroga_cierre', area, usuario.email, null, periodo, {},
        `Prórroga de cierre retirada para ${area} — ${periodo}, por ${usuario.email}`
      );
    }

    toast(`✅ Prórroga retirada en ${candidatas.length} área(s)`, 'ok');
    if (areaActual && candidatas.some(c => c.area === areaActual)) cargarNovedadesActuales();

  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

// Repone los 3 intentos de generación de reporte para un área/mes puntual.
// Distinto de la prórroga de cierre: esto no reabre novedades para corregir,
// solo resetea el contador de regeneraciones del informe ya generado.
async function reponerIntentosReporte() {
  if (!esAdmin()) { toast('❌ Solo el administrador puede reponer intentos', 'err'); return; }
  const area = $('reponer-intentos-area').value;
  const mes  = $('reponer-intentos-mes').value;
  const anio = $('reponer-intentos-anio').value;
  if (!area || !mes || !anio) { toast('Complete todos los campos', 'err'); return; }

  const periodo = `${anio}-${mes}`;

  try {
    const novedadesRef = window._fb.doc(db, 'novedades', area, periodo, 'datos');
    const novedadesDoc = await window._fb.getDoc(novedadesRef);
    if (!novedadesDoc.exists() || !(novedadesDoc.data().agentes || []).length) {
      toast(`${area} no tiene datos en ${periodo}`, 'err');
      return;
    }
    const d = novedadesDoc.data();
    if (d.estado !== 'cerrado') {
      toast(`${area} todavía no ha generado el informe de ${periodo}`, 'err');
      return;
    }
    const intentosUsados = intentosUsadosDeReporte(d);
    if (intentosRestantesDeReporte(d, periodo) > 0) {
      const ok0 = await confirmarAccion(
        `${area} todavía tiene intentos disponibles en ${periodo} (lleva ${intentosUsados} de 3). ¿Reponer de todas formas los 3 intentos completos?`,
        'Reponer intentos de generación'
      );
      if (!ok0) return;
    } else {
      const ok = await confirmarAccion(
        `Se repondrán los 3 intentos de generación de reporte para ${area} — ${periodo} y se le devolverá el acceso solo hasta las 23:59 de hoy; al día siguiente el contador vuelve a cero. ¿Continuar?`,
        'Reponer intentos de generación'
      );
      if (!ok) return;
    }

    await window._fb.updateDoc(novedadesRef, {
      intentosReporte: 0,
      reporteReabiertoFecha: `${obtenerFechaParts().periodo}-${String(obtenerFechaParts().dia).padStart(2, '0')}`,
      reporteReabiertoEn: new Date(),
      reporteReabiertoPor: usuario.email
    });
    await registrarEnAuditoria(
      'reponer_intentos_reporte', area, usuario.email, null, periodo, {},
      `Intentos de generación de reporte repuestos para ${area} — ${periodo}, por ${usuario.email}`
    );

    toast(`✅ Intentos repuestos para ${area} — ${periodo}, válidos hasta las 23:59 de hoy`, 'ok');
    if (areaActual === area) cargarNovedadesActuales();

  } catch(e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  }
}

async function aprobarDesbloqueo(docId) {
  try {
    const solRef = window._fb.doc(db, 'solicitudes', docId);
    const solDoc = await window._fb.getDoc(solRef);
    if (!solDoc.exists()) { toast('❌ Solicitud no encontrada', 'err'); return; }
    const sol = solDoc.data();

    await window._fb.updateDoc(solRef, {
      estado: 'aprobada',
      fechaRespuesta: new Date()
    });

    // Soporta solicitudes de un solo día (campo "dia") o de varios días (campo "dias")
    const diasAAprobar = Array.isArray(sol.dias) ? sol.dias : (sol.dia ? [sol.dia] : []);

    // Habilitar la edición de esos días en el documento de Novedades del área/mes correspondiente
    if (sol.area && sol.mes && diasAAprobar.length) {
      const novedadesRef = window._fb.doc(db, 'novedades', sol.area, sol.mes, 'datos');
      const novedadesDoc = await window._fb.getDoc(novedadesRef);
      if (novedadesDoc.exists()) {
        const data = novedadesDoc.data();
        const diasDesbloqueados = data.diasDesbloqueados || [];
        diasAAprobar.forEach(d => {
          if (!diasDesbloqueados.includes(d)) diasDesbloqueados.push(d);
        });
        await window._fb.updateDoc(novedadesRef, { diasDesbloqueados });
      }
      await registrarEnAuditoria(
        'aprobar_desbloqueo', sol.area, sol.correoUsuario,
        diasAAprobar.length === 1 ? diasAAprobar[0] : null, sol.mes,
        { dias: diasAAprobar },
        `Día(s) ${diasAAprobar.join(', ')} desbloqueado(s) para ${sol.correoUsuario}`
      );
    }

    toast(
      diasAAprobar.length === 1
        ? '✅ Desbloqueo aprobado — el día ya se puede editar'
        : `✅ Desbloqueo aprobado — ${diasAAprobar.length} días ya se pueden editar`,
      'ok'
    );
    cargarDesbloqueos();
  } catch(e) {
    toast('Error: ' + e.message, 'err');
  }
}

let rechazoDesbloqueoDocId = null;

function rechazarDesbloqueo(docId) {
  rechazoDesbloqueoDocId = docId;
  $('rechazo-desbloqueo-razon').value = '';
  $('modal-rechazar-desbloqueo').style.display = 'flex';
  $('rechazo-desbloqueo-razon').focus();
}

function cerrarModalRechazarDesbloqueo() {
  $('modal-rechazar-desbloqueo').style.display = 'none';
  rechazoDesbloqueoDocId = null;
}

async function confirmarRechazarDesbloqueo() {
  const razon = $('rechazo-desbloqueo-razon').value.trim();
  if (!razon) { toast('Escriba el motivo del rechazo', 'err'); return; }
  const docId = rechazoDesbloqueoDocId;
  if (!docId) return;

  try {
    await window._fb.updateDoc(window._fb.doc(db, 'solicitudes', docId), {
      estado: 'rechazada',
      fechaRespuesta: new Date(),
      respuestaAdmin: razon
    });
    toast('❌ Desbloqueo rechazado', 'ok');
    cerrarModalRechazarDesbloqueo();
    cargarDesbloqueos();
  } catch(e) {
    toast('Error: ' + e.message, 'err');
  }
}

/* ═════════════════════════════════════════
   PANEL ADMIN — Resumen General de Novedades
═════════════════════════════════════════ */

function poblarSelectoresResumen(prefix = 'resumen') {
  const selMes = $(`${prefix}-mes`);
  const selAnio = $(`${prefix}-anio`);
  if (!selMes || !selAnio) return;

  if (selMes.options.length === 0) {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    meses.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = String(i + 1).padStart(2, '0');
      opt.textContent = m;
      selMes.appendChild(opt);
    });
  }
  if (selAnio.options.length === 0) {
    const anioActual = new Date().getFullYear();
    for (let a = anioActual - 1; a <= anioActual + 1; a++) {
      const opt = document.createElement('option');
      opt.value = String(a);
      opt.textContent = String(a);
      selAnio.appendChild(opt);
    }
  }

  const hoy = obtenerFechaParts();
  selMes.value = hoy.mes;
  selAnio.value = String(new Date().getFullYear());
}

/* ── Reporte General por Efectivo — consolida TODAS las áreas en un solo
   documento día por día, sin separarlas ni mostrar de qué área es cada
   quien. Disponible para Administrador y Supervisor (mismo permiso que el
   resto del Resumen General: resumen_ver / resumen_exportar). Reutiliza el
   mismo formato Excel/PDF del informe por área (exportarNovedadesExcel /
   exportarNovedadesPDF), pasándoles esGeneral=true para que la cabecera
   diga "REPORTE GENERAL" en vez de nombrar un área. ── */
async function generarReporteGeneralEfectivos() {
  const mes = $('resumen-efectivo-mes').value;
  const anio = $('resumen-efectivo-anio').value;
  const btn = $('btn-reporte-general-efectivo');

  if (!mes || !anio) { toast('Elegí mes y año', 'err'); return; }

  const periodo = `${anio}-${mes}`;
  const txtOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Consolidando todas las áreas...';

  try {
    const areas = await obtenerAreasNovedades();
    let todosLosAgentes = [];
    let areasConDatos = 0;

    for (const area of areas) {
      const ref = window._fb.doc(db, 'novedades', area, periodo, 'datos');
      const snap = await window._fb.getDoc(ref);
      if (!snap.exists()) continue;
      const agentes = snap.data().agentes || [];
      if (agentes.length) {
        areasConDatos++;
        todosLosAgentes = todosLosAgentes.concat(agentes);
      }
    }

    if (!todosLosAgentes.length) {
      toast(`⚠️ Ninguna área tiene novedades cargadas en ${periodo} — se generará el reporte en blanco`, 'ok');
    }

    const dataGeneral = { agentes: ordenarAgentesPorGrado(todosLosAgentes) };

    // esGeneral=true → sin sección de firmas, no requiere "Elaborado por"/"Responsable"
    await exportarNovedadesExcel(dataGeneral, 'REPORTE GENERAL', periodo, '', '', true);
    await exportarNovedadesPDF(dataGeneral, 'REPORTE GENERAL', periodo, '', '', true);

    toast(`✅ Reporte general generado — ${todosLosAgentes.length} efectivos de ${areasConDatos} área${areasConDatos === 1 ? '' : 's'}`, 'ok');
  } catch (e) {
    console.error(e);
    toast('❌ Error: ' + e.message, 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = txtOriginal;
  }
}

/* Áreas del catálogo sin ningún correo asignado. Se muestra únicamente al
   administrador dentro del Resumen General: es información de gestión interna,
   no algo que deban ver los secretarios ni los supervisores. */
async function verificarAreasSinAsignar(prefix = 'resumen') {
  const banner = $(`${prefix}-areas-sin-asignar`);
  if (!banner) return;

  if (!esAdmin()) { banner.style.display = 'none'; return; }

  try {
    const [accesoSnapshot, areasCatalogo] = await Promise.all([
      window._fb.getDocs(window._fb.collection(db, 'accesos')),
      obtenerAreasNovedades(),
    ]);

    const areasConAcceso = new Set(
      accesoSnapshot.docs.map(d => String(d.data().area || '').toLowerCase()).filter(Boolean)
    );
    // Se reutiliza la misma variable que alimenta el modal de la pestaña Accesos,
    // así el botón "Ver cuáles" muestra el detalle sin duplicar lógica.
    accesosAreasSinAcceso = (areasCatalogo || []).filter(a => !areasConAcceso.has(String(a).toLowerCase()));

    const faltan = accesosAreasSinAcceso.length;
    const total  = (areasCatalogo || []).length;

    if (faltan === 0) {
      banner.style.background = 'var(--green-l)';
      banner.style.borderColor = 'var(--green-m)';
      banner.innerHTML = `<span style="color:var(--green);font-weight:700;">✅ Las ${total} áreas del catálogo tienen correo asignado</span>`;
    } else {
      banner.style.background = '#fff1f2';
      banner.style.borderColor = '#fda4af';
      banner.innerHTML = `
        <span style="color:var(--red);font-weight:700;">⚠️ ${faltan} área${faltan === 1 ? '' : 's'} no asignada${faltan === 1 ? '' : 's'}</span>
        <span style="color:var(--txt2);">— sin correo responsable, nadie puede cargar novedades ahí (${total - faltan} de ${total} asignadas)</span>
        <button class="btn-acc btn-acc-ghost" style="padding:3px 10px;font-size:11px;" onclick="verAreasSinAcceso()">Ver cuáles</button>`;
    }
    banner.style.display = 'flex';
  } catch(e) {
    console.warn('No se pudo verificar las áreas sin asignar:', e);
    banner.style.display = 'none';
  }
}

async function cargarResumenGeneral(prefix = 'resumen') {
  const mes = $(`${prefix}-mes`).value;
  const anio = $(`${prefix}-anio`).value;
  if (!mes || !anio) { toast('Elija mes y año', 'err'); return; }
  const periodo = `${anio}-${mes}`;

  const tbody = $(`${prefix}-tabla-body`);
  tbody.innerHTML = `<tr><td colspan="11" class="td-vacio">Cargando...</td></tr>`;
  const detalleCont = $(`${prefix}-detalle-container`);
  if (detalleCont) hide(`${prefix}-detalle-container`);

  verificarAreasSinAsignar(prefix);

  const filasPorArea = [];
  const totales = { total: 0, 'S/N':0, 'OA':0, 'X':0, 'CS':0, 'B':0, 'LI':0, 'V':0, 'PE':0, 'FA':0 };
  const detalleAusenciasX = [];

  const areasReales = await obtenerAreasNovedades();
  const tbodyProgreso = tbody;
  const tamanioLoteResumen = 25;

  for (let i = 0; i < areasReales.length; i += tamanioLoteResumen) {
    const lote = areasReales.slice(i, i + tamanioLoteResumen);
    await Promise.all(lote.map(async (area) => {
      try {
        const ref = window._fb.doc(db, 'novedades', area, periodo, 'datos');
        const snap = await window._fb.getDoc(ref);
        if (!snap.exists()) return;
        const data = snap.data();
        const agentes = data.agentes || [];
        if (agentes.length === 0) return;

        const conteo = { 'S/N':0, 'OA':0, 'X':0, 'CS':0, 'B':0, 'LI':0, 'V':0, 'PE':0, 'FA':0 };
        agentes.forEach(agente => {
          const dias = agente.novedadesPorDia || {};
          let diasConX = 0;
          Object.values(dias).forEach(codigo => {
            if (conteo.hasOwnProperty(codigo)) conteo[codigo]++;
            if (codigo === 'X') diasConX++;
          });
          if (diasConX > 0) {
            detalleAusenciasX.push({
              area,
              codigo: agente.codigo || '',
              grado: agente.grado || '',
              apellidosNombres: agente.apellidosNombres || '',
              diasConX
            });
          }
        });

        filasPorArea.push({
          area,
          responsable: data.responsable || data.elaboradoPor || '—',
          totalPersonal: agentes.length,
          conteo,
          periodo
        });

        totales.total += agentes.length;
        CODIGOS_VALIDOS.forEach(c => { totales[c] += conteo[c]; });

      } catch(e) {
        console.warn(`Sin datos de ${area} para ${periodo}`);
      }
    }));
    tbodyProgreso.innerHTML = `<tr><td colspan="11" class="td-vacio">Cargando... ${Math.min(i + tamanioLoteResumen, areasReales.length)} / ${areasReales.length} áreas revisadas</td></tr>`;
  }

  filasPorArea.sort((a, b) => a.area.localeCompare(b.area));


  if (filasPorArea.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="td-vacio">No hay novedades registradas para ese mes</td></tr>`;
    return;
  }

  let html = '';
  filasPorArea.forEach(fila => {
    html += `<tr>
      <td>${fila.area}</td>
      <td>${fila.responsable}</td>
      <td style="text-align:center">${fila.totalPersonal}</td>
      ${CODIGOS_VALIDOS.map(c => `<td style="text-align:center;cursor:pointer;text-decoration:underline;" onclick="mostrarDetalleCodigo('${fila.area.replace(/'/g,"\\'")}','${fila.periodo}','${c}','${prefix}')">${fila.conteo[c]}</td>`).join('')}
    </tr>`;
  });

  html += `<tr style="font-weight:700;background:var(--bg);">
    <td>TOTAL GENERAL</td><td></td>
    <td style="text-align:center">${totales.total}</td>
    ${CODIGOS_VALIDOS.map(c => `<td style="text-align:center">${totales[c]}</td>`).join('')}
  </tr>`;

  tbody.innerHTML = html;

  resumenGeneralCache = { filasPorArea, totales, periodo, detalleAusenciasX };
}

async function exportarResumenGeneralExcel() {
  if (!resumenGeneralCache || !resumenGeneralCache.filasPorArea || resumenGeneralCache.filasPorArea.length === 0) {
    toast('Primero genere el resumen (botón "Generar resumen")', 'err');
    return;
  }
  if (!window.ExcelJS) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }

  const { filasPorArea, totales, periodo, detalleAusenciasX } = resumenGeneralCache;
  const [anio] = periodo.split('-');

  // Colores (mismos que el spreadsheet de referencia)
  const NAVY   = 'FF1F3864';
  const ROJO   = 'FFC00000';
  const ROJO_CLARO = 'FFF4CCCC';
  const AZUL_CLARO = 'FFDCE6F1';
  const BLANCO = 'FFFFFFFF';

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Resumen General');

  const headers = ['ÁREA', 'RESPONSABLE (CÓD. - APELLIDO)', 'TOTAL PERSONAL', 'S/N', 'OA', 'X (Ausentes)', 'CS', 'B (Bajas)', 'Li (Licencias)', 'V', 'PE'];
  ws.columns = [
    { width: 34 }, { width: 30 }, { width: 15 },
    { width: 10 }, { width: 10 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 10 }, { width: 10 }
  ];

  // ── Título ──
  ws.mergeCells(1, 1, 1, headers.length);
  const tituloCell = ws.getCell(1, 1);
  tituloCell.value = `RESUMEN GENERAL DE NOVEDADES — CTE ${anio}`;
  tituloCell.font = { bold: true, size: 14, color: { argb: BLANCO } };
  tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  // ── Escudo del Ecuador (izquierda) y sello institucional de la CTE (derecha) ──
  const [escudoB64Res, selloB64Res] = await Promise.all([obtenerEscudoEcuador(), obtenerSelloCTE()]);
  if (escudoB64Res) {
    const logoIdEscudoRes = wb.addImage({ base64: escudoB64Res, extension: 'png' });
    ws.addImage(logoIdEscudoRes, { tl: { col: 0.12, row: 0.1 }, ext: { width: 24, height: 29 } });
  }
  if (selloB64Res) {
    const logoIdSelloRes = wb.addImage({ base64: selloB64Res, extension: 'png' });
    ws.addImage(logoIdSelloRes, { tl: { col: 10.61, row: 0.1 }, ext: { width: 29, height: 29 } });
  }

  // ── Encabezado ──
  const filaHeader = ws.addRow(headers);
  filaHeader.eachCell(cell => {
    cell.font = { bold: true, color: { argb: BLANCO } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // ── Filas por área (con X en rojo si hay ausentes) ──
  filasPorArea.forEach((fila, i) => {
    const filaRow = ws.addRow([
      fila.area, fila.responsable, fila.totalPersonal,
      ...CODIGOS_VALIDOS.map(c => fila.conteo[c])
    ]);
    if (i % 2 === 0) {
      filaRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_CLARO } };
      });
    }
    const celdaX = filaRow.getCell(6); // columna F = X (Ausentes)
    if (fila.conteo['X'] > 0) {
      celdaX.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO } };
      celdaX.font = { bold: true, color: { argb: BLANCO } };
    }
    filaRow.eachCell(cell => { cell.alignment = { horizontal: 'center' }; });
    filaRow.getCell(1).alignment = { horizontal: 'left' };
    filaRow.getCell(2).alignment = { horizontal: 'left' };
  });

  // ── Total general ──
  const filaTotal = ws.addRow(['TOTAL GENERAL', '', totales.total, ...CODIGOS_VALIDOS.map(c => totales[c])]);
  filaTotal.eachCell(cell => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_CLARO } };
    cell.alignment = { horizontal: 'center' };
  });
  filaTotal.getCell(1).alignment = { horizontal: 'left' };

  // ── Bloque de detalle de ausencias injustificadas ──
  ws.addRow([]);
  const filaBannerNum = ws.rowCount + 1;
  ws.mergeCells(filaBannerNum, 1, filaBannerNum, 5);
  const bannerCell = ws.getCell(filaBannerNum, 1);
  bannerCell.value = 'DETALLE DE AUSENCIAS INJUSTIFICADAS (X)';
  bannerCell.font = { bold: true, color: { argb: BLANCO } };
  bannerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO } };
  bannerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(filaBannerNum).height = 22;

  const filaHeaderDetalle = ws.addRow(['ÁREA', 'CÓDIGO', 'GRADO', 'APELLIDOS Y NOMBRES', 'DÍAS CON X']);
  filaHeaderDetalle.eachCell(cell => {
    cell.font = { bold: true, color: { argb: BLANCO } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    cell.alignment = { horizontal: 'center' };
  });

  if (detalleAusenciasX && detalleAusenciasX.length > 0) {
    detalleAusenciasX.forEach(d => {
      const fila = ws.addRow([d.area, d.codigo, d.grado, d.apellidosNombres, d.diasConX]);
      fila.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO_CLARO } };
        cell.alignment = { horizontal: 'center' };
      });
      fila.getCell(1).alignment = { horizontal: 'left' };
      fila.getCell(4).alignment = { horizontal: 'left' };
    });

    ws.mergeCells(ws.rowCount + 1, 1, ws.rowCount + 1, 4);
    const filaTotalX = ws.addRow(['TOTAL DE PERSONAS CON AUSENCIA INJUSTIFICADA', '', '', '', detalleAusenciasX.length]);
    filaTotalX.eachCell(cell => {
      cell.font = { bold: true, color: { argb: BLANCO } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO } };
      cell.alignment = { horizontal: 'center' };
    });
  } else {
    ws.addRow(['Sin ausencias injustificadas este mes']);
  }

  // ── Nota de pie de página discreta (no institucional, solo trazabilidad técnica) ──
  const filaFooterResNum = ws.rowCount + 2;
  ws.mergeCells(filaFooterResNum, 1, filaFooterResNum, headers.length);
  const filaFooterRes = ws.getCell(filaFooterResNum, 1);
  const fechaGenRes = new Date().toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  filaFooterRes.value = `Documento generado automáticamente — Unidad de Personal y Movilidad CTE · Generado: ${fechaGenRes}`;
  filaFooterRes.font = { size: 8, italic: true, color: { argb: 'FF888888' } };
  filaFooterRes.alignment = { horizontal: 'center' };

  // ── Descargar ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resumen_general_novedades_${periodo}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast('✅ Resumen exportado con colores', 'ok');
}

async function mostrarDetalleCodigo(area, periodo, codigo, prefix = 'resumen') {
  try {
    const ref = window._fb.doc(db, 'novedades', area, periodo, 'datos');
    const snap = await window._fb.getDoc(ref);
    if (!snap.exists()) return;
    const agentes = snap.data().agentes || [];

    const filas = [];
    agentes.forEach(agente => {
      const dias = agente.novedadesPorDia || {};
      const cantidad = Object.values(dias).filter(c => c === codigo).length;
      if (cantidad > 0) {
        filas.push({ area, codigo: agente.codigo || '', grado: agente.grado || '', nombre: agente.apellidosNombres || '', cantidad });
      }
    });

    $(`${prefix}-detalle-titulo`).textContent = `Detalle — ${area} — Código "${codigo}" (${CODIGOS_DESC[codigo] || ''})`;

    if (filas.length === 0) {
      $(`${prefix}-detalle-body`).innerHTML = `<tr><td colspan="5" class="td-vacio">Sin registros</td></tr>`;
    } else {
      $(`${prefix}-detalle-body`).innerHTML = filas.map(f => `
        <tr>
          <td>${f.area}</td><td>${f.codigo}</td><td>${f.grado}</td><td>${f.nombre}</td>
          <td style="text-align:center">${f.cantidad}</td>
        </tr>`).join('') + `
        <tr style="font-weight:700;background:var(--bg);">
          <td colspan="4">TOTAL DE PERSONAS CON "${codigo}"</td>
          <td style="text-align:center">${filas.length}</td>
        </tr>`;
    }

    show(`${prefix}-detalle-container`);
    $(`${prefix}-detalle-container`).scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch(e) {
    toast('Error: ' + e.message, 'err');
  }
}

/* ═════════════════════════════════════════
   ENVÍOS (Funciones del sistema actual)
═════════════════════════════════════════ */


/* ══════════════════════════════════
   EXPONER AL HTML
══════════════════════════════════ */
window.login                        = login;
window.abrirSelectorArchivo         = abrirSelectorArchivo;
window.abrirSelectorActa            = abrirSelectorActa;
window.abrirSelectorInforme         = abrirSelectorInforme;
window.actaEstaDeshabilitada         = actaEstaDeshabilitada;
window.seleccionarActa              = seleccionarActa;
window.seleccionarInforme           = seleccionarInforme;
window.quitarActa                   = quitarActa;
window.quitarInforme                = quitarInforme;
window.abrirModalArchivado          = abrirModalArchivado;
window.cerrarModalArchivado         = cerrarModalArchivado;
window.abrirModalLimpiarDuplicados  = abrirModalLimpiarDuplicados;
window.cerrarModalLimpiarDuplicados = cerrarModalLimpiarDuplicados;
window.iniciarLimpiezaDuplicados    = iniciarLimpiezaDuplicados;
window.irEnvios                      = irEnvios;
window.seleccionarMesArchivado      = seleccionarMesArchivado;
window.archPaso2                    = archPaso2;
window.descargarMesCompleto         = descargarMesCompleto;
window.ir                           = ir;
window.show                         = show;
window.hide                         = hide;
window.toast                        = toast;
window.$                            = $;
window.abrirCarpetaArea             = abrirCarpetaArea;

/* Novedades */
window.irNovedades                  = irNovedades;
window.llenarSinNovedadHoy          = llenarSinNovedadHoy;
window.filtrarTablaPorCodigo        = filtrarTablaPorCodigo;
window.combinarDuplicadosArea       = combinarDuplicadosArea;
window.cerrarYExportarMes           = cerrarYExportarMes;
window.abrirModalEditarNovedad      = abrirModalEditarNovedad;
window.abrirModalEditarNovedadCierre = abrirModalEditarNovedadCierre;
window.cerrarModalNovedad           = cerrarModalNovedad;
window.guardarNovedad               = guardarNovedad;
window.actualizarObsSegunCodigo     = actualizarObsSegunCodigo;
window.mostrarErrorCodigo           = mostrarErrorCodigo;
window.cerrarErrorCodigo            = cerrarErrorCodigo;

/* Panel Admin — Novedades */
window.importarBaseDatos            = importarBaseDatos;
window.desbloquearDiaDirecto        = desbloquearDiaDirecto;
window.borrarTodaLaBaseNovedades    = borrarTodaLaBaseNovedades;
window.mostrarFormAcceso            = mostrarFormAcceso;
window.cerrarModalAcceso            = cerrarModalAcceso;
window.abrirSelectorPersona         = abrirSelectorPersona;
window.cerrarModalSolicitudDesbloqueo = cerrarModalSolicitudDesbloqueo;
window.confirmarSolicitudDesbloqueo = confirmarSolicitudDesbloqueo;
window.solicitarDesbloqueoTodos     = solicitarDesbloqueoTodos;
window.cerrarSelectorPersona        = cerrarSelectorPersona;
window.filtrarListaPersonal         = filtrarListaPersonal;
window.elegirPersona                = elegirPersona;
window.generarReportePrueba         = generarReportePrueba;
window.marcarAreaReporteManual       = marcarAreaReporteManual;
window.habilitarProrrogaCierre       = habilitarProrrogaCierre;
window.retirarProrrogaCierre         = retirarProrrogaCierre;
window.reponerIntentosReporte        = reponerIntentosReporte;
window.exportarReporteActividadExcel = exportarReporteActividadExcel;
window.cambiarPaginaPersonasEnvio   = cambiarPaginaPersonasEnvio;
window.cambiarPaginaArchivosEnvio   = cambiarPaginaArchivosEnvio;
window.cambiarPaginaReporteActividad = cambiarPaginaReporteActividad;
window.cambiarPaginaAuditoria       = cambiarPaginaAuditoria;
window.filtrarPersonal              = filtrarPersonal;
window.cambiarPaginaPersonal        = cambiarPaginaPersonal;
window.abrirModalPersonal           = abrirModalPersonal;
window.editarRegistroPersonal       = editarRegistroPersonal;
window.cerrarModalPersonal          = cerrarModalPersonal;
window.guardarRegistroPersonal      = guardarRegistroPersonal;
window.eliminarRegistroPersonal     = eliminarRegistroPersonal;
window.toggleSeleccionPersonal      = toggleSeleccionPersonal;
window.toggleSeleccionarTodosPersonal = toggleSeleccionarTodosPersonal;
window.seleccionarTodosLosFiltradosPersonal = seleccionarTodosLosFiltradosPersonal;
window.limpiarSeleccionPersonal     = limpiarSeleccionPersonal;
window.aplicarCambioAreaLote        = aplicarCambioAreaLote;
window.toggleCambioLoteCorreccion   = toggleCambioLoteCorreccion;
window.toggleModalPersonalCorreccion = toggleModalPersonalCorreccion;
window.confirmarGuardarAcceso       = confirmarGuardarAcceso;
window.generarBackupMensualManual   = generarBackupMensualManual;
window.generarBackupManualDesdeAdmin = generarBackupManualDesdeAdmin;
window.analizarArchivosBackup        = analizarArchivosBackup;
window.toggleAreaSobrescribirBackup  = toggleAreaSobrescribirBackup;
window.cerrarModalRestaurarBackup    = cerrarModalRestaurarBackup;
window.confirmarRestaurarBackup      = confirmarRestaurarBackup;
window.guardarAcceso                = guardarAcceso;
window.quitarAreaModalAcceso        = quitarAreaModalAcceso;
window.cambiarAreaActivaSecretario  = cambiarAreaActivaSecretario;
window.eliminarAcceso               = eliminarAcceso;
window.migrarAccesosAAreasMultiples = migrarAccesosAAreasMultiples;
window.editarAcceso                 = editarAcceso;
window.cargarAccesos                = cargarAccesos;
window.buscarAccesos                = buscarAccesos;
window.cambiarPaginaAccesos         = cambiarPaginaAccesos;
window.verAreasSinAcceso            = verAreasSinAcceso;
window.cerrarModalAreasSinAcceso    = cerrarModalAreasSinAcceso;
window.exportarAccesos              = exportarAccesos;
window.borrarTodaLaBasePersonal     = borrarTodaLaBasePersonal;
window.analizarMapeoAccesos         = analizarMapeoAccesos;
window.aplicarMapeoAccesos          = aplicarMapeoAccesos;
window.guardarModoMantenimiento     = guardarModoMantenimiento;
window.exportarDirectorioPersonal   = exportarDirectorioPersonal;
window.abrirModalPerfil             = abrirModalPerfil;
window.cerrarModalPerfil            = cerrarModalPerfil;
window.guardarPerfilAcceso          = guardarPerfilAcceso;
window.alternarBloqueoAcceso        = alternarBloqueoAcceso;
window.verificarCodigoAcceso        = verificarCodigoAcceso;
window.importarAccesosDesdeArchivo  = importarAccesosDesdeArchivo;
window.cerrarModalImportarAccesos   = cerrarModalImportarAccesos;
window.confirmarImportarAccesos     = confirmarImportarAccesos;
window.filtrarAuditoria             = filtrarAuditoria;
window.cargarAuditoria              = cargarAuditoria;
window.filtrarAuditoria             = filtrarAuditoria;
window.limpiarFiltrosAuditoria      = limpiarFiltrosAuditoria;
window.cambiarPaginaAuditoria       = cambiarPaginaAuditoria;
window.exportarAuditoria            = exportarAuditoria;
window.abrirModalEliminarAuditoria  = abrirModalEliminarAuditoria;
window.cerrarModalEliminarAuditoria = cerrarModalEliminarAuditoria;
window.cambiarModoEliminarAuditoria = cambiarModoEliminarAuditoria;
window.verificarCheckEliminarAuditoria = verificarCheckEliminarAuditoria;
window.ejecutarEliminarAuditoria    = ejecutarEliminarAuditoria;
window.poblarFiltrosAuditoria       = poblarFiltrosAuditoria;
window.aprobarDesbloqueo            = aprobarDesbloqueo;
window.rechazarDesbloqueo           = rechazarDesbloqueo;
window.cerrarModalRechazarDesbloqueo = cerrarModalRechazarDesbloqueo;
window.responderConfirmacion        = responderConfirmacion;
window.intentarConfirmarGenerico    = intentarConfirmarGenerico;
window.confirmarRechazarDesbloqueo  = confirmarRechazarDesbloqueo;
window.cargarResumenGeneral         = cargarResumenGeneral;
window.generarReporteGeneralEfectivos = generarReporteGeneralEfectivos;
window.exportarResumenGeneralExcel  = exportarResumenGeneralExcel;
window.mostrarDetalleCodigo         = mostrarDetalleCodigo;

// Exportaciones agregadas en cambios recientes (navbar, panel de Áreas) —
// app.js se carga como <script type="module">, así que cualquier función
// usada en un onclick="..." del HTML debe colgarse explícitamente de window
window.irInicioNav                  = irInicioNav;
window.actualizarVistaActual        = actualizarVistaActual;
window.agregarAreaPanel             = agregarAreaPanel;
window.importarAreasPanel           = importarAreasPanel;
window.iniciarRenombreAreaPanel     = iniciarRenombreAreaPanel;
window.cancelarRenombreAreaPanel    = cancelarRenombreAreaPanel;
window.guardarRenombreAreaPanel     = guardarRenombreAreaPanel;
window.eliminarAreaPanel            = eliminarAreaPanel;
window.renderizarListaAreasPanel    = renderizarListaAreasPanel;
window.alternarSeleccionAreaPanel   = alternarSeleccionAreaPanel;
window.alternarSeleccionarTodasAreasPanel = alternarSeleccionarTodasAreasPanel;
window.cancelarSeleccionAreasPanel  = cancelarSeleccionAreasPanel;
window.abrirModalUnificarAreas       = abrirModalUnificarAreas;
window.cerrarModalUnificarAreas      = cerrarModalUnificarAreas;
window.analizarUnificarAreas         = analizarUnificarAreas;
window.alternarAccionConflictoUnificar = alternarAccionConflictoUnificar;
window.confirmarUnificarAreas        = confirmarUnificarAreas;
window.analizarActualizacionAreas   = analizarActualizacionAreas;
window.aplicarActualizacionAreas    = aplicarActualizacionAreas;
window.descargarCodigosNoEncontrados = descargarCodigosNoEncontrados;
window.verificarAreasSinAsignar     = verificarAreasSinAsignar;
window.cargarConfigPanel            = cargarConfigPanel;
window.guardarConfigCierre          = guardarConfigCierre;
window.prepararMesEnTodasLasAreas   = prepararMesEnTodasLasAreas;
window.restaurarConfigCierrePorDefecto = restaurarConfigCierrePorDefecto;
window.actualizarResumenConfigCierre = actualizarResumenConfigCierre;
window.actualizarResumenModoLlenado = actualizarResumenModoLlenado;
window.alternarDetalleCierre        = alternarDetalleCierre;

/* ══════════════════════════════════════════════════════════════
   INFORME DE ENTREGA / ATRASO — dibujo del PDF (función pura)
   d    = { titulo, lugar, fechaTexto, asunto, mesTexto, areaTexto,
            para:{grado,codigo,nombre,cargo}, firmantes:[{grado,codigo,nombre,cargo}] }
   imgs = { escudo: dataURL PNG, logo: dataURL PNG }
══════════════════════════════════════════════════════════════ */
/* Logos incrustados: así el PDF sale completo aunque no se hayan subido archivos nuevos a la carpeta img/ */
const INF_IMG = {
  escudo: 'data:image/png;base64,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',
  logo: 'data:image/png;base64,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'
};

function infTitulo(txt) {
  const chicas = ['de', 'del', 'la', 'las', 'los', 'y', 'e'];
  return String(txt || '').toLowerCase().split(/\s+/).filter(Boolean).map((p, i) => {
    if (i > 0 && chicas.includes(p)) return p;
    if (p === 'transito') return 'Tránsito';
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).join(' ');
}

function infJustificar(doc, texto, x, y, ancho, paso) {
  const lineas = doc.splitTextToSize(texto, ancho);
  lineas.forEach((ln, i) => {
    const esUltima = i === lineas.length - 1;
    const palabras = ln.trim().split(/\s+/);
    if (esUltima || palabras.length < 2) {
      doc.text(ln.trim(), x, y);
    } else {
      const sumaPalabras = palabras.reduce((s, p) => s + doc.getTextWidth(p), 0);
      const hueco = (ancho - sumaPalabras) / (palabras.length - 1);
      let cx = x;
      palabras.forEach(p => { doc.text(p, cx, y); cx += doc.getTextWidth(p) + hueco; });
    }
    y += paso;
  });
  return y;
}

function infConstruirPdf(jsPDF, d, imgs) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const AZUL = [38, 46, 125];
  const GRIS = [125, 125, 125];
  const LM = 24.8, ANCHO = 167, PASO = 5.2;
  const nombreConGrado = (p, conCodigo) =>
    (p.grado ? infTitulo(p.grado) + ': ' : '') + (conCodigo && p.codigo ? p.codigo + ' ' : '') + infTitulo(p.nombre);

  /* — Encabezado — */
  doc.setFillColor(...AZUL);
  doc.roundedRect(112, -8, 110, 17, 4, 4, 'F');
  if (imgs && imgs.escudo) doc.addImage(imgs.escudo, 'PNG', 9, 6, 18.1, 20, undefined, 'FAST');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...AZUL);
  doc.text('REPÚBLICA', 29.5, 15.3);
  doc.text('DEL ECUADOR', 29.5, 20.3);
  doc.setTextColor(0, 0, 0);

  /* — Título — */
  doc.setFont('times', 'bold'); doc.setFontSize(17);
  doc.text(d.titulo, 105, 26.5, { align: 'center' });
  const wT = doc.getTextWidth(d.titulo);
  doc.setLineWidth(0.4); doc.line(105 - wT / 2, 27.6, 105 + wT / 2, 27.6);

  doc.setFontSize(12);
  const VX = 41;                         // columna donde empiezan los valores
  const anchoVal = ANCHO - (VX - LM);

  /* — PARA — */
  let y = 38;
  doc.setFont('times', 'bold'); doc.text('PARA:', LM, y);
  doc.setFont('times', 'normal');
  doc.splitTextToSize(nombreConGrado(d.para, false) + '.', anchoVal).forEach(l => { doc.text(l, VX, y); y += PASO; });
  doc.setFont('times', 'bold');
  doc.splitTextToSize(String(d.para.cargo || '').toUpperCase(), anchoVal).forEach(l => { doc.text(l, VX, y); y += PASO; });
  y += 7;

  /* — DE — */
  const de = d.firmantes[0];
  doc.setFont('times', 'bold'); doc.text('DE:', LM, y);
  doc.setFont('times', 'normal');
  doc.splitTextToSize(nombreConGrado(de, false) + '.', anchoVal).forEach(l => { doc.text(l, VX, y); y += PASO; });
  doc.setFont('times', 'bold');
  let cargoDe = String(de.cargo || '').toUpperCase(); if (!cargoDe.endsWith('.')) cargoDe += '.';
  doc.splitTextToSize(cargoDe, anchoVal).forEach(l => { doc.text(l, VX, y); y += PASO; });
  y += 5;

  /* — FECHA / ASUNTO — */
  doc.setFont('times', 'bold'); doc.text('FECHA:', LM, y);
  doc.setFont('times', 'normal'); doc.text(d.lugar + ', ' + d.fechaTexto + '.', LM + doc.getTextWidth('FECHA:  ') + 0.5, y);
  y += PASO + 4.5;
  doc.setFont('times', 'bold'); doc.text('ASUNTO:', LM, y);
  const xAsunto = LM + doc.getTextWidth('ASUNTO:  ') + 0.5;
  doc.setFont('times', 'normal');
  doc.splitTextToSize(d.asunto, ANCHO - (xAsunto - LM)).forEach(l => { doc.text(l, xAsunto, y); y += PASO; });
  y += 4.5;

  /* — Cuerpo — */
  const cuerpo = 'Previo atento y cordial saludo, pasando por el respectivo órgano Regular de mis inmediatos ' +
    'superiores me dirijo a usted mi Coronel, para hacer la entrega del respectivo formato de los parámetros ' +
    'que corresponde al mes de ' + d.mesTexto + ', ' + d.areaTexto + '.';
  y = infJustificar(doc, cuerpo, LM, y, ANCHO, PASO);
  y += 12;
  doc.text('Particular que comunico para los fines de ley correspondientes.', LM, y);
  y += 22;
  doc.setFont('times', 'bold'); doc.text('DIOS, PATRIA Y LIBERTAD', 105, y, { align: 'center' });

  /* — Firmantes (1 a 4) — */
  const firm = d.firmantes;
  const n = firm.length;
  const NOMBRE_Y_ULTIMA = 240, PASO_FILA = 38;
  const celdas = [];   // { p, cx, ancho, fila }
  if (n === 1) {
    celdas.push({ p: firm[0], cx: 105, ancho: 150, fila: 0 });
  } else if (n === 2) {
    celdas.push({ p: firm[0], cx: 56, ancho: 92, fila: 0 }, { p: firm[1], cx: 154, ancho: 92, fila: 0 });
  } else {
    // columnas: la izquierda se llena primero (hasta 2), luego la derecha
    celdas.push({ p: firm[0], cx: 56, ancho: 92, fila: 0 }, { p: firm[1], cx: 56, ancho: 92, fila: 1 });
    celdas.push({ p: firm[2], cx: 154, ancho: 92, fila: 0 });
    if (n === 4) celdas.push({ p: firm[3], cx: 154, ancho: 92, fila: 1 });
  }
  const hayDosFilas = celdas.some(c => c.fila === 1);
  const tam = n === 1 ? 12 : 11;
  celdas.forEach(c => {
    const yNombre = hayDosFilas ? NOMBRE_Y_ULTIMA - PASO_FILA * (1 - c.fila) : NOMBRE_Y_ULTIMA;
    doc.setFont('times', 'normal'); doc.setFontSize(tam);
    doc.splitTextToSize(nombreConGrado(c.p, true), c.ancho).forEach((l, i) => doc.text(l, c.cx, yNombre + i * 5, { align: 'center' }));
    const lineasNom = doc.splitTextToSize(nombreConGrado(c.p, true), c.ancho).length;
    doc.setFont('times', 'bold');
    doc.splitTextToSize(String(c.p.cargo || '').toUpperCase(), c.ancho)
      .forEach((l, i) => doc.text(l, c.cx, yNombre + lineasNom * 5 + 1 + i * 5, { align: 'center' }));
  });

  /* — Pie de página — */
  doc.setFontSize(7); doc.setTextColor(...GRIS);
  const pie = [['Dirección:', ' Chile 1710 y Cuenca'], ['Código postal:', ' 090109 / Guayaquil-Ecuador'],
               ['Teléfono:', ' 3731750 / 1800-103103'], ['', 'www.comisiontransito.gob.ec']];
  pie.forEach((par, i) => {
    const yy = 283 + i * 3.3;
    doc.setFont('helvetica', 'bold'); doc.text(par[0], 17.5, yy);
    const anchoEtiqueta = doc.getTextWidth(par[0]);
    doc.setFont('helvetica', 'normal'); doc.text(par[1], 17.5 + anchoEtiqueta, yy);
  });
  if (imgs && imgs.logo) doc.addImage(imgs.logo, 'PNG', 150, 280.5, 50, 13.3, undefined, 'FAST');
  doc.setTextColor(0, 0, 0);
  return doc;
}

/* ══════════════════════════════════════════════════════════════
   INFORME DE ENTREGA / ATRASO — ventana de datos dentro de Envíos
   Es opcional: el usuario puede seguir subiendo su propio PDF.
   Entrega o Atraso lo decide el plazo (actaEsObligatoriaHoy).
══════════════════════════════════════════════════════════════ */
const INF_MAX_FIRMANTES = 4;
const INF_CARGO_PARA = 'DEPARTAMENTO DE PERSONAL Y MOVILIDAD CTE.';
let infPersonas = null;          // lista ya parseada y ordenada por rango
let infPersonasFuente = null;    // la lista original de la que salió (para saber si cambió)
let infPara = { persona: null, texto: '', cargo: INF_CARGO_PARA };
let infFirmantes = [];

const infEsc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const infSinTildes = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/* La lista guarda cada persona como "CODIGO - GRADO APELLIDOS NOMBRES".
   Para separar el grado de los nombres se compara contra los grados
   conocidos del sistema (ORDEN_GRADOS), del más largo al más corto. */
function infSepararGrado(resto) {
  const plano = [];
  for (let i = 0; i < resto.length; i++) {
    const c = resto[i].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    for (const ch of c) plano.push({ ch, i });
  }
  const extras = ['SUBINSPECTOR', 'AGENTE 1', 'AGENTE 2', 'AGENTE 3', 'AGENTE 4'];
  const candidatos = [...ORDEN_GRADOS, ...extras]
    .map(g => g.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[\s\-–]+/g, ''))
    .sort((a, b) => b.length - a.length);
  const esSep = ch => /[\s\-–]/.test(ch);
  for (const cand of candidatos) {
    let p = 0, ok = true;
    for (const letra of cand) {
      while (p < plano.length && esSep(plano[p].ch)) p++;
      if (p >= plano.length || plano[p].ch !== letra) { ok = false; break; }
      p++;
    }
    if (!ok) continue;
    if (p < plano.length && !esSep(plano[p].ch)) continue;      // debe terminar en límite de palabra
    const fin = plano[p - 1].i + 1;
    return { grado: resto.slice(0, fin).trim(), nombre: resto.slice(fin).trim() };
  }
  return { grado: '', nombre: resto.trim() };
}

function infParsearPersona(linea) {
  const partes = String(linea).split(' - ');
  if (partes.length < 2) return null;
  const codigo = partes[0].trim();
  const { grado, nombre } = infSepararGrado(partes.slice(1).join(' - ').trim());
  if (!codigo || !nombre) return null;
  const gradoRango = grado.replace(/^AGENTE\s+(\d)/i, 'AGENTE DE TRANSITO $1');
  return {
    codigo, grado, nombre,
    rango: indiceDeGrado(gradoRango),
    etiqueta: `${grado ? grado + ' · ' : ''}${codigo} · ${nombre}`,
    busqueda: infSinTildes(`${codigo} ${grado} ${nombre}`)
  };
}

function infPrepararPersonas(lista) {
  if (infPersonas && infPersonasFuente === lista) return;
  infPersonas = lista.map(infParsearPersona).filter(Boolean)
    .sort((a, b) => (a.rango - b.rango) || a.nombre.localeCompare(b.nombre, 'es'));
  infPersonasFuente = lista;
}

/* "UCT SUSUDEL" → "Susudel" · "UCF – CEBAF NUEVA LOJA G1" → "Nueva Loja" (editable por el usuario) */
function infLugarDesdeArea(area) {
  let t = String(area || '').toUpperCase().replace(/[–—-]/g, ' ').replace(/\s+/g, ' ').trim();
  const prefijos = ['UCT', 'OIAT', 'UCF', 'CEBAF', 'CRV', 'OIA', 'DAI', 'UNIDAD', 'DISTRITO'];
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const pf of prefijos) {
      if (t === pf) break;
      if (t.startsWith(pf + ' ')) { t = t.slice(pf.length + 1); cambio = true; }
    }
  }
  t = t.replace(/\s+G\s?\d+(\s*[-–y]\s*\d+)?$/i, '').trim();
  return infTitulo(t) || 'Guayaquil';
}

/* ── Tarjeta dentro de Envíos ── */
function infActualizarTarjeta() {
  // El botón siempre dice lo mismo; lo que cambia según el plazo es el TÍTULO del documento que se genera
  const tarde = actaEsObligatoriaHoy();
  const sub = $('inf-card-sub');
  if (sub) sub.textContent = tarde
    ? 'El sistema prepara el informe con los datos del personal. Por estar fuera de plazo, saldrá titulado «Informe de Atraso».'
    : 'El sistema prepara el informe con los datos del personal. Dentro del plazo, saldrá titulado «Informe de Entrega».';
}

/* ── Buscadores (lista completa + escribir para filtrar) ── */
/* ── Mensajes de error junto al campo (en vez de solo avisos flotantes) ── */
function infMarcarError(clave, msg, idFoco) {
  const el = $('inf-err-' + clave);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  const foco = idFoco ? $(idFoco) : null;
  if (foco) foco.classList.add('inf-invalido');
  // Se centra el mensaje (queda justo debajo del campo) para que ambos se vean a la vez
  const dest = el || foco;
  if (dest && dest.scrollIntoView) dest.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (foco) {
    infNoAbrirLista = true;
    foco.focus({ preventScroll: true });
    infNoAbrirLista = false;
  }
}

function infLimpiarError(clave) {
  const el = $('inf-err-' + clave);
  if (el) { el.textContent = ''; el.style.display = 'none'; }
  const ids = clave === 'datos' ? ['inf-lugar', 'inf-fecha', 'inf-asunto'] : ['inf-in-' + clave, 'inf-cargo-' + clave];
  ids.forEach(id => { const x = $(id); if (x) x.classList.remove('inf-invalido'); });
}

function infActualizarResumen() {
  const el = $('inf-resumen-datos');
  if (!el) return;
  const f = $('inf-fecha') ? $('inf-fecha').value : '';
  const asunto = $('inf-asunto') ? $('inf-asunto').value.trim() : '';
  el.textContent = `Fecha ${f ? f.split('-').reverse().join('/') : '—'} · Asunto: ${asunto || '—'}`;
}

function infCbEstado(clave) {
  return clave === 'para' ? infPara : infFirmantes[parseInt(clave.slice(1), 10)];
}

function infCbRender(clave) {
  const st = infCbEstado(clave), lista = $('inf-lista-' + clave);
  if (!st || !lista || !infPersonas) return;
  const q = infSinTildes(st.persona ? '' : st.texto).trim();
  const terminos = q.split(/\s+/).filter(Boolean);
  const idxs = [];
  let total = 0;
  for (let i = 0; i < infPersonas.length; i++) {
    const p = infPersonas[i];
    if (terminos.every(t => p.busqueda.includes(t))) { total++; if (idxs.length < 60) idxs.push(i); }
  }
  lista.innerHTML = idxs.length
    ? idxs.map(i => {
        const p = infPersonas[i];
        return `<div class="inf-cb-item" onclick="infCbElegir('${clave}',${i})">` +
               `<span class="inf-cb-grado">${infEsc(p.grado || 'SIN GRADO')}</span> ` +
               `<b>${infEsc(p.codigo)}</b> · ${infEsc(p.nombre)}</div>`;
      }).join('') + (total > idxs.length
        ? `<div class="inf-cb-mas">Mostrando ${idxs.length} de ${total}. Escriba más para acotar la búsqueda.</div>` : '')
    : `<div class="inf-cb-mas">Sin resultados</div>`;
  lista.style.display = 'block';
}

let infNoAbrirLista = false;   // evita que la lista tape el mensaje de error cuando se enfoca un campo por validación
function infCbAbrir(clave) { if (infNoAbrirLista) return; infCbRender(clave); }

function infCbEscribir(clave) {
  const st = infCbEstado(clave), inp = $('inf-in-' + clave);
  if (!st || !inp) return;
  st.texto = inp.value;
  st.persona = null;               // si escribe de nuevo, debe volver a elegir de la lista
  inp.classList.remove('inf-ok');
  infLimpiarError(clave);
  infCbRender(clave);
}

function infCbElegir(clave, idx) {
  const st = infCbEstado(clave), p = infPersonas[idx], inp = $('inf-in-' + clave);
  if (!st || !p || !inp) return;
  st.persona = p; st.texto = p.etiqueta;
  inp.value = p.etiqueta;
  inp.classList.add('inf-ok');
  infLimpiarError(clave);
  const lista = $('inf-lista-' + clave); if (lista) lista.style.display = 'none';
}

function infCargoEscribir(clave) {
  const st = infCbEstado(clave), inp = $('inf-cargo-' + clave);
  if (st && inp) { st.cargo = inp.value; inp.classList.remove('inf-invalido'); }
}

/* ── Firmantes (mínimo 1, máximo 4) ── */
function infRenderFirmantes() {
  const cont = $('inf-firmantes'); if (!cont) return;
  cont.innerHTML = infFirmantes.map((f, i) => `
    <div class="inf-firmante" id="inf-card-f${i}">
      <div class="inf-firmante-cab">
        <span>Firmante ${i + 1}${i === 0 ? ' <small>· figura como remitente (DE)</small>' : ''}</span>
        <button type="button" class="inf-quitar" onclick="infQuitarFirmante(${i})" ${infFirmantes.length <= 1 ? 'disabled' : ''}>✕ Quitar</button>
      </div>
      <label class="inf-etq" for="inf-in-f${i}">Persona</label>
      <div class="inf-cb">
        <input type="text" id="inf-in-f${i}" class="form-select${f.persona ? ' inf-ok' : ''}" autocomplete="off"
               placeholder="Escriba el nombre o el código y elija de la lista" value="${infEsc(f.persona ? f.persona.etiqueta : f.texto)}"
               onfocus="infCbAbrir('f${i}')" oninput="infCbEscribir('f${i}')">
        <div id="inf-lista-f${i}" class="inf-cb-lista" style="display:none"></div>
      </div>
      <label class="inf-etq" for="inf-cargo-f${i}">Cargo que aparecerá bajo la firma</label>
      <input type="text" id="inf-cargo-f${i}" class="form-select" autocomplete="off"
             placeholder="Ej.: JEFE UCT SUSUDEL" value="${infEsc(f.cargo)}" oninput="infCargoEscribir('f${i}')">
      <div class="inf-err" id="inf-err-f${i}" style="display:none"></div>
    </div>`).join('');
  const btn = $('btn-inf-agregar');
  if (btn) {
    btn.disabled = infFirmantes.length >= INF_MAX_FIRMANTES;
    btn.textContent = infFirmantes.length >= INF_MAX_FIRMANTES
      ? `Máximo ${INF_MAX_FIRMANTES} firmantes` : '+ Agregar otro firmante';
  }
}

function infAgregarFirmante() {
  if (infFirmantes.length >= INF_MAX_FIRMANTES) return;
  const area = ($('area-select')?.value || '').toUpperCase();
  infFirmantes.push({ persona: null, texto: '', cargo: 'SECRETARIO ' + area });
  infRenderFirmantes();
}

function infQuitarFirmante(i) {
  if (infFirmantes.length <= 1) return;
  infFirmantes.splice(i, 1);
  infRenderFirmantes();
}

/* ── Abrir / cerrar ventana ── */
function infFechaIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function abrirModalInforme() {
  const area = $('area-select')?.value;
  if (!area) {
    toast('Primero seleccione el Área en "Nuevo Envío" (más abajo en esta pantalla).', 'err');
    const ab = $('area-select-buscar');
    if (ab) { ab.scrollIntoView({ behavior: 'smooth', block: 'center' }); ab.focus(); }
    return;
  }
  const lista = await obtenerListaPersonal();
  if (!lista || !lista.length) { toast('No se pudo cargar la base de personal. Intente nuevamente.', 'err'); return; }
  infPrepararPersonas(lista);

  const tarde = actaEsObligatoriaHoy();
  const hoy = new Date();
  $('inf-modal-titulo').textContent = tarde ? 'Informe de Atraso' : 'Informe de Entrega';
  const aviso = $('inf-aviso');
  aviso.className = 'inf-aviso ' + (tarde ? 'inf-aviso-tarde' : 'inf-aviso-ok');
  aviso.textContent = tarde
    ? 'Su envío está fuera de plazo: el documento saldrá titulado «INFORME DE ATRASO».'
    : 'Su envío está dentro del plazo: el documento saldrá titulado «INFORME DE ENTREGA».';

  $('inf-lugar').value = infLugarDesdeArea(area);
  const f = $('inf-fecha');
  f.min = infFechaIso(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  f.max = infFechaIso(hoy);
  f.value = infFechaIso(hoy);
  // Asunto por defecto: el mes que se está entregando (el mes anterior). El usuario puede cambiarlo.
  const mesAsunto = obtenerMesReporte();
  $('inf-asunto').value = `Informe ${MESES_ES[mesAsunto.getMonth()].toLowerCase()} ${mesAsunto.getFullYear()}`;
  $('inf-complemento').value = '';
  $('inf-area-nombre').textContent = infTitulo(area);

  infPara = { persona: null, texto: '', cargo: INF_CARGO_PARA };
  const ip = $('inf-in-para'); ip.value = ''; ip.classList.remove('inf-ok');
  $('inf-cargo-para').value = INF_CARGO_PARA;
  infFirmantes = [{ persona: null, texto: '', cargo: 'JEFE ' + area.toUpperCase() }];
  infRenderFirmantes();
  $('inf-detalles').open = false;
  ['para', 'datos'].forEach(infLimpiarError);
  infActualizarResumen();
  $('modal-informe').style.display = 'flex';
  const tarjeta = $('modal-informe').querySelector('.modal-card');
  if (tarjeta) tarjeta.scrollTop = 0;
}

function cerrarModalInforme() { $('modal-informe').style.display = 'none'; }

document.addEventListener('click', e => {
  if (!e.target.closest || e.target.closest('.inf-cb')) return;
  document.querySelectorAll('.inf-cb-lista').forEach(l => { l.style.display = 'none'; });
});

/* ── Generar y descargar ── */
async function infGenerar() {
  const area = $('area-select')?.value;
  if (!area) { toast('Seleccione el área del envío.', 'err'); return; }
  if (!infPara.persona) { infMarcarError('para', 'Elija a la persona de la lista: escriba su nombre o código y toque una opción.', 'inf-in-para'); return; }
  if (!String(infPara.cargo || '').trim()) { infMarcarError('para', 'Escriba el cargo o dependencia de quien recibe el informe.', 'inf-cargo-para'); return; }
  for (let i = 0; i < infFirmantes.length; i++) {
    if (!infFirmantes[i].persona) { infMarcarError('f' + i, 'Elija a la persona de la lista: escriba su nombre o código y toque una opción.', 'inf-in-f' + i); return; }
    if (!String(infFirmantes[i].cargo || '').trim()) { infMarcarError('f' + i, 'Escriba el cargo que aparecerá bajo la firma.', 'inf-cargo-f' + i); return; }
  }
  const detalles = $('inf-detalles');
  const lugar = $('inf-lugar').value.trim();
  if (!lugar) { detalles.open = true; infMarcarError('datos', 'Escriba el lugar (ciudad o cantón).', 'inf-lugar'); return; }
  const asunto = $('inf-asunto').value.trim();
  if (!asunto) { detalles.open = true; infMarcarError('datos', 'Escriba el asunto.', 'inf-asunto'); return; }
  const fecha = $('inf-fecha').value;
  const f = $('inf-fecha');
  if (!fecha || fecha < f.min || fecha > f.max) {
    detalles.open = true;
    infMarcarError('datos', 'La fecha debe ser de este mes, desde el día 1 hasta hoy.', 'inf-fecha');
    return;
  }

  const btn = $('btn-inf-generar');
  if (btn) { btn.disabled = true; btn.textContent = 'Generando...'; }
  try {
    if (!window.jspdf) {
      await new Promise((res, rej) => {
        const sc = document.createElement('script');
        sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        sc.onload = res; sc.onerror = rej; document.head.appendChild(sc);
      });
    }
    const tarde = actaEsObligatoriaHoy();
    const [a, m, dd] = fecha.split('-').map(Number);
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const fechaTexto = `${dias[new Date(a, m - 1, dd).getDay()]} ${String(dd).padStart(2, '0')} de ${MESES_ES[m - 1].toLowerCase()} del ${a}`;
    const mesRep = obtenerMesReporte();
    const mesTexto = `${MESES_ES[mesRep.getMonth()].toLowerCase()} del ${mesRep.getFullYear()}`;
    const complemento = $('inf-complemento').value.trim();

    const doc = infConstruirPdf(window.jspdf.jsPDF, {
      titulo: tarde ? 'INFORME DE ATRASO.' : 'INFORME DE ENTREGA.',
      lugar: infTitulo(lugar), fechaTexto, asunto, mesTexto,
      areaTexto: infTitulo(area) + (complemento ? ' ' + complemento : ''),
      para: { ...infPara.persona, cargo: infPara.cargo.trim() },
      firmantes: infFirmantes.map(x => ({ ...x.persona, cargo: x.cargo.trim() }))
    }, { escudo: INF_IMG.escudo, logo: INF_IMG.logo });

    const nombre = `${nombreBaseEnvio(area)}_${tarde ? 'ATRASO' : 'INFORME'}.pdf`;
    doc.save(nombre);
    cerrarModalInforme();
    toast(`✅ Documento generado: ${nombre}. Imprímalo, fírmelo y súbalo en su envío.`, 'ok');
  } catch (e) {
    console.error('Error generando el informe:', e);
    toast('No se pudo generar el documento. Revise su conexión e intente de nuevo.', 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📄 Descargar PDF'; }
  }
}

window.abrirModalInforme   = abrirModalInforme;
window.cerrarModalInforme  = cerrarModalInforme;
window.infGenerar          = infGenerar;
window.infAgregarFirmante  = infAgregarFirmante;
window.infQuitarFirmante   = infQuitarFirmante;
window.infCbAbrir          = infCbAbrir;
window.infCbEscribir       = infCbEscribir;
window.infCbElegir         = infCbElegir;
window.infCargoEscribir    = infCargoEscribir;
window.infActualizarTarjeta = infActualizarTarjeta;
window.infLimpiarError     = infLimpiarError;
window.infActualizarResumen = infActualizarResumen;

/* ══════════════════════════════════
   MODO OSCURO / CLARO
══════════════════════════════════ */
function toggleModo() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('siscte-modo', isDark ? 'dark' : 'light');
  document.querySelectorAll('#btn-modo,#btn-modo-guest').forEach(b => {
    if (b) b.textContent = isDark ? '☀️' : '🌙';
  });
}
window.toggleModo = toggleModo;

// Conectar botones de modo al cargar
document.addEventListener('DOMContentLoaded', () => {
  // Restaurar modo guardado
  if (localStorage.getItem('siscte-modo') === 'dark') {
    document.body.classList.add('dark-mode');
  }
  const isDark = document.body.classList.contains('dark-mode');
  document.querySelectorAll('#btn-modo,#btn-modo-guest').forEach(b => {
    if (b) {
      b.textContent = isDark ? '☀️' : '🌙';
      b.addEventListener('click', toggleModo);
    }
  });
});
