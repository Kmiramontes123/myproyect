console.log("BTN LOGIN:", document.getElementById("btnLogin"));
const SUPABASE_URL = "https://fmecckzpxwygpozznjnk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZWNja3pweHd5Z3Bvenpuam5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODIzMDEsImV4cCI6MjA5MTk1ODMwMX0.1IV2Oh99gbrG88Nx6sScZ74lKQC3O6sXDhM9jAOS-dc";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= ELEMENTOS =================
const loginBox = document.getElementById("loginBox");
const app = document.getElementById("app");

const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");

const btnGuardarCurso = document.getElementById("btnGuardarCurso");
const cursoImagen = document.getElementById("cursoImagen");

// ================= LOGIN =================
btnLogin.onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  checkUser();
};

// ================= LOGOUT =================
btnLogout.onclick = async () => {
  await supabaseClient.auth.signOut();
  location.reload();
};

// ================= CHECK USER =================
async function checkUser() {
  const { data } = await supabaseClient.auth.getUser();

  if (data.user) {
  loginBox.style.display = "none";
  app.style.display = "flex";

  cargarCursosAdmin();
  cargarDashboard(); 
  cargarLogo();
  cargarHero();
  cargarGaleria();
}
  }

async function cargarLogo() {
  const { data } = await supabaseClient
    .from("configuracion")
    .select("logo_url")
    .eq("id", 1)
    .single();

  const cont = document.getElementById("logoPreview");
  cont.innerHTML = "";

  if (!data?.logo_url) return;

  cont.innerHTML = `<img src="${data.logo_url}" width="120">`;
}
async function cargarHero() {
  const { data } = await supabaseClient
    .from("configuracion")
    .select("hero_url")
    .eq("id", 1)
    .single();

  const cont = document.getElementById("heroPreview");
  cont.innerHTML = "";

  if (!data?.hero_url) return;

  cont.innerHTML = `<img src="${data.hero_url}" width="200">`;
}
async function cargarGaleria() {
  const { data } = await supabaseClient
    .from("imagenes")
    .select("*")
    .order("id", { ascending: false });

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  data.forEach(img => {
    grid.innerHTML += `
      <div>
        <img src="${img.url}" width="120">
      </div>
    `;
  });
}

// ================= COMPRESIÓN =================
function comprimirImagen(file) {
  return new Promise(resolve => {
    const img = new Image();
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = e => (img.src = e.target.result);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const maxW = 800;
      const scale = maxW / img.width;

      canvas.width = maxW;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(blob => resolve(blob), "image/webp", 0.8);
    };
  });
}

// ================= GUARDAR / EDITAR CURSO =================
btnGuardarCurso.onclick = async () => {
  const nombre = document.getElementById("cursoNombre").value;
  const descripcion = document.getElementById("cursoDescripcion").value;
  const activo = document.getElementById("cursoActivo").checked;
  const file = cursoImagen.files[0];
  const id = btnGuardarCurso.dataset.id;

  if (!nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  let imagen_url = null;

  try {
    // eliminar imagen anterior si edita
    if (id && file) {
      const { data: actual } = await supabaseClient
        .from("cursos")
        .select("imagen_url")
        .eq("id", id)
        .single();

      if (actual?.imagen_url) {
        const path = actual.imagen_url.split("/imagenes/")[1];
        await supabaseClient.storage.from("imagenes").remove([path]);
      }
    }

    // subir imagen nueva
    if (file) {
      const blob = await comprimirImagen(file);
      const name = `cursos/${Date.now()}.webp`;

      const { error } = await supabaseClient.storage
        .from("imagenes")
        .upload(name, blob);

      if (error) {
        alert("Error subiendo imagen");
        return;
      }

      const { data } = supabaseClient.storage
        .from("imagenes")
        .getPublicUrl(name);

      imagen_url = data.publicUrl;
    }

    let datos = { nombre, descripcion, activo };

    if (imagen_url) datos.imagen_url = imagen_url;

    if (id) {
      await supabaseClient.from("cursos").update(datos).eq("id", id);
    } else {
      await supabaseClient.from("cursos").insert(datos);
    }

    alert("Guardado correctamente");

    // limpiar
    document.getElementById("cursoNombre").value = "";
    document.getElementById("cursoDescripcion").value = "";
    document.getElementById("cursoActivo").checked = true;
    cursoImagen.value = "";
    delete btnGuardarCurso.dataset.id;

    cargarCursosAdmin();
    cargarDashboard();

  } catch (err) {
    console.error(err);
    alert("Error inesperado");
  }
};

// ================= LISTAR CURSOS =================
async function cargarCursosAdmin() {
  const cont = document.getElementById("listaCursos");

  const { data } = await supabaseClient
    .from("cursos")
    .select("*")
    .order("id", { ascending: false });

  cont.innerHTML = "";

  data.forEach(curso => {
    cont.innerHTML += `
      <div class="curso-item">
        <img src="${curso.imagen_url || ""}" width="80">
        <div>
          <strong>${curso.nombre}</strong><br>
          <small>${curso.descripcion || ""}</small><br>
          <small>${curso.activo ? "🟢 Activo" : "🔴 Inactivo"}</small>
        </div>

        <button onclick="editarCurso(${curso.id}, '${curso.nombre}', \`${curso.descripcion || ""}\`, ${curso.activo})">✏️</button>
        <button onclick="eliminarCurso(${curso.id})">🗑️</button>
      </div>
    `;
  });
}

// ================= EDITAR =================
function editarCurso(id, nombre, descripcion, activo) {
  document.getElementById("cursoNombre").value = nombre;
  document.getElementById("cursoDescripcion").value = descripcion;
  document.getElementById("cursoActivo").checked = activo;

  btnGuardarCurso.dataset.id = id;
}

// ================= ELIMINAR =================
async function eliminarCurso(id) {
  if (!confirm("¿Eliminar curso?")) return;

  const { data } = await supabaseClient
    .from("cursos")
    .select("imagen_url")
    .eq("id", id)
    .single();

  if (data?.imagen_url) {
    const path = data.imagen_url.split("/imagenes/")[1];
    await supabaseClient.storage.from("imagenes").remove([path]);
  }

  await supabaseClient.from("cursos").delete().eq("id", id);

  cargarCursosAdmin();
  cargarDashboard();
}

// ================= DASHBOARD =================
async function cargarDashboard() {
  try {
    const { data: cursos } = await supabaseClient.from("cursos").select("*");
    const { data: imagenes } = await supabaseClient.from("imagenes").select("*");

    document.getElementById("totalCursos").textContent = cursos.length;

    const activos = cursos.filter(c => c.activo).length;
    document.getElementById("cursosActivos").textContent = activos;

    document.getElementById("totalImagenes").textContent = imagenes.length;

  } catch (err) {
    console.error(err);
  }
}
function irASeccion(tipo) {

  if (tipo === "cursos") {
    document.getElementById("seccionCursos")
      .scrollIntoView({ behavior: "smooth" });
  }

  if (tipo === "imagenes") {
    document.getElementById("grid")
      .scrollIntoView({ behavior: "smooth" });
  }

  if (tipo === "activos") {
    document.getElementById("listaCursos")
      .scrollIntoView({ behavior: "smooth" });

    filtrarActivos();
  }
}
 
async function filtrarActivos() {
  const cont = document.getElementById("listaCursos");

  const { data } = await supabaseClient
    .from("cursos")
    .select("*")
    .eq("activo", true);

  cont.innerHTML = "";

  data.forEach(curso => {
    cont.innerHTML += `
      <div class="curso-item">
        <img src="${curso.imagen_url || ""}" width="80">
        <div>
          <strong>${curso.nombre}</strong><br>
          <small>${curso.descripcion || ""}</small>
        </div>
      </div>
    `;
  });
}


// ================= INIT =================
checkUser();