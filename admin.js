console.log("BTN LOGIN:", document.getElementById("btnLogin"));
const SUPABASE_URL = "https://fmecckzpxwygpozznjnk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZWNja3pweHd5Z3Bvenpuam5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODIzMDEsImV4cCI6MjA5MTk1ODMwMX0.1IV2Oh99gbrG88Nx6sScZ74lKQC3O6sXDhM9jAOS-dc";



const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// ================= ELEMENTOS =================
const loginBox = document.getElementById("loginBox");
const app = document.getElementById("app");

const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");

const btnLogo = document.getElementById("btnLogo");
const btnHero = document.getElementById("btnHero");
const btnSubir = document.getElementById("btnSubir");

const logoInput = document.getElementById("logoInput");
const heroInput = document.getElementById("heroInput");
const galeriaInput = document.getElementById("galeriaInput");

const logoPreview = document.getElementById("logoPreview");
const heroPreview = document.getElementById("heroPreview");
const grid = document.getElementById("grid");

// ================= MENSAJES =================
function mostrarMensaje(texto, tipo = "success") {
  const msg = document.createElement("div");

  msg.textContent = texto;
  msg.style.position = "fixed";
  msg.style.bottom = "20px";
  msg.style.right = "20px";
  msg.style.padding = "12px 18px";
  msg.style.borderRadius = "10px";
  msg.style.color = "#fff";
  msg.style.fontSize = "14px";
  msg.style.zIndex = "9999";
  msg.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
  msg.style.transition = "0.3s ease";
  msg.style.background = tipo === "error" ? "#e74c3c" : "#2ecc71";

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.style.opacity = "0";
    msg.style.transform = "translateY(10px)";
  }, 2000);

  setTimeout(() => msg.remove(), 2600);
}

// ================= LOGIN =================
btnLogin.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    mostrarMensaje(error.message, "error");
    return;
  }

  mostrarMensaje("Login correcto");
  checkUser();
});

// ================= LOGOUT =================
btnLogout.onclick = async () => {
  await supabaseClient.auth.signOut();

  loginBox.style.display = "flex";
  app.style.display = "none";

  logoPreview.innerHTML = "";
  heroPreview.innerHTML = "";
  grid.innerHTML = "";

  mostrarMensaje("Sesión cerrada");
};

// ================= CHECK USER =================
async function checkUser() {
  const { data } = await supabaseClient.auth.getUser();

  if (data.user) {
    loginBox.style.display = "none";
    app.style.display = "flex";

    cargarLogo();
    cargarHero();
    cargarGaleria();
  }
}

// ================= COMPRESIÓN =================
function comprimirImagen(file, calidad = 0.8, maxWidth = 1200) {
  return new Promise(resolve => {
    const img = new Image();
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = e => (img.src = e.target.result);

    img.onload = () => {
      const canvas = document.createElement("canvas");

      let w = img.width;
      let h = img.height;

      if (w > maxWidth) {
        h = Math.round(h * (maxWidth / w));
        w = maxWidth;
      }

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(blob => resolve(blob), "image/webp", calidad);
    };
  });
}

// ================= LOGO =================
btnLogo.onclick = async () => {
  const file = logoInput.files[0];
  if (!file) return;

  const blob = await comprimirImagen(file);
  const imgFile = new File([blob], "logo.webp", { type: "image/webp" });

  const { error } = await supabaseClient.storage
    .from("imagenes")
    .upload("logo.webp", imgFile, { upsert: true });

  if (error) return mostrarMensaje(error.message, "error");

  const { data } = supabaseClient.storage
    .from("imagenes")
    .getPublicUrl("logo.webp");

  await supabaseClient
    .from("configuracion")
    .update({ logo_url: data.publicUrl })
    .eq("id", 1);

  mostrarMensaje("Logo actualizado");
  cargarLogo();
};

async function cargarLogo() {
  const { data } = await supabaseClient
    .from("configuracion")
    .select("logo_url")
    .eq("id", 1)
    .single();

  logoPreview.innerHTML = "";
  if (!data?.logo_url) return;

  const box = document.createElement("div");
  box.className = "preview-box";

  const img = document.createElement("img");
  img.src = data.logo_url;

  const btn = document.createElement("button");
  btn.innerText = "X";

  btn.onclick = async () => {
    await supabaseClient.storage.from("imagenes").remove(["logo.webp"]);
    await supabaseClient.from("configuracion")
      .update({ logo_url: null })
      .eq("id", 1);

    mostrarMensaje("Logo eliminado");
    cargarLogo();
  };

  box.appendChild(img);
  box.appendChild(btn);
  logoPreview.appendChild(box);
}

// ================= HERO =================
btnHero.onclick = async () => {
  const file = heroInput.files[0];
  if (!file) return;

  const blob = await comprimirImagen(file);
  const imgFile = new File([blob], "hero.webp", { type: "image/webp" });

  const { error } = await supabaseClient.storage
    .from("imagenes")
    .upload("hero.webp", imgFile, { upsert: true });

  if (error) return mostrarMensaje(error.message, "error");

  const { data } = supabaseClient.storage
    .from("imagenes")
    .getPublicUrl("hero.webp");

  await supabaseClient
    .from("configuracion")
    .update({ hero_url: data.publicUrl })
    .eq("id", 1);

  mostrarMensaje("Hero actualizado");
  cargarHero();
};

async function cargarHero() {
  const heroPreview = document.getElementById("heroPreview");
  heroPreview.innerHTML = "";

  const { data } = await supabaseClient
    .from("configuracion")
    .select("hero_url")
    .eq("id", 1)
    .single();

  if (!data?.hero_url) return;

  const box = document.createElement("div");
  box.className = "preview-box";

  const img = document.createElement("img");
  img.src = data.hero_url;

  const btn = document.createElement("button");
  btn.innerText = "X";

  btn.onclick = async () => {
    await supabaseClient.storage.from("imagenes").remove(["hero.webp"]);
    await supabaseClient.from("configuracion")
      .update({ hero_url: null })
      .eq("id", 1);

    mostrarMensaje("Hero eliminado");
    cargarHero();
  };

  box.appendChild(img);
  box.appendChild(btn);
  heroPreview.appendChild(box);
}

// ================= GALERÍA =================
btnSubir.onclick = async () => {
  const files = galeriaInput.files;
  if (!files.length) return;

  for (let file of files) {
    const blob = await comprimirImagen(file);
    const name = `${Date.now()}_${file.name}`;

    const imgFile = new File([blob], name, { type: "image/webp" });

    const { error } = await supabaseClient.storage
      .from("imagenes")
      .upload(name, imgFile);

    if (error) {
      mostrarMensaje("Error subiendo imagen", "error");
      continue;
    }

    const { data } = supabaseClient.storage
      .from("imagenes")
      .getPublicUrl(name);

    await supabaseClient
      .from("imagenes")
      .insert({ url: data.publicUrl });
  }

  galeriaInput.value = "";
  mostrarMensaje("Imágenes subidas");
  cargarGaleria();
};

async function cargarGaleria() {
  const { data } = await supabaseClient
    .from("imagenes")
    .select("*")
    .order("id", { ascending: false });

  grid.innerHTML = "";

  data.forEach(img => {
    const div = document.createElement("div");

    const image = document.createElement("img");
    image.src = img.url;

    const btn = document.createElement("button");
    btn.innerText = "X";

    btn.onclick = async () => {
      const fileName = img.url.split("/imagenes/")[1];

      await supabaseClient.storage.from("imagenes").remove([fileName]);
      await supabaseClient.from("imagenes").delete().eq("id", img.id);

      mostrarMensaje("Imagen eliminada");
      cargarGaleria();
    };

    div.appendChild(image);
    div.appendChild(btn);
    grid.appendChild(div);
  });
}

// ================= INIT =================
checkUser();
 