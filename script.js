const SUPABASE_URL = "https://fmecckzpxwygpozznjnk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZWNja3pweHd5Z3Bvenpuam5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODIzMDEsImV4cCI6MjA5MTk1ODMwMX0.1IV2Oh99gbrG88Nx6sScZ74lKQC3O6sXDhM9jAOS-dc";
 

// ================= GALERÍA INFINITA =================
let pagina = 0;
const limite = 30;
let cargando = false;
let fin = false;

async function cargarImagenes() {
  if (cargando || fin) return;

  cargando = true;

  const cont = document.getElementById("contenedor-imagenes");
  if (!cont) return;

  try {
    const desde = pagina * limite;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/imagenes?select=*&activo=eq.true&order=id.desc&limit=${limite}&offset=${desde}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const data = await res.json();

    if (!data.length) {
      fin = true;
      cargando = false;
      return;
    }

    data.forEach(img => {
      const el = document.createElement("img");

      el.src = img.url;
      el.loading = "lazy";

      // 🔥 fade-in elegante
      el.style.opacity = "0";
      el.style.transform = "scale(0.98)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";

      el.onload = () => {
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
      };

      cont.appendChild(el);
    });

    pagina++;

  } catch (err) {
    console.error(err);
  }

  cargando = false;
}

// ================= SCROLL INFINITO =================
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const height = window.innerHeight;
  const total = document.body.offsetHeight;

  if (scrollTop + height >= total - 200) {
    cargarImagenes();
  }
});

// ================= LOGO (DESDE CONFIG) =================
async function cargarLogo() {
  const img = document.querySelector(".logo img");
  if (!img) return;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/configuracion?id=eq.1&select=logo_url`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  const data = await res.json();

  if (data[0]?.logo_url) {
    img.src = data[0].logo_url + "?v=" + Date.now();
  }
}

// ================= HERO (DESDE CONFIG) =================
async function cargarHero() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/configuracion?id=eq.1&select=hero_url`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  const data = await res.json();

  if (data[0]?.hero_url) {
    const url = data[0].hero_url + "?v=" + Date.now();

    hero.style.backgroundImage = `
      linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
      url('${url}')
    `;

    hero.style.backgroundSize = "cover";
    hero.style.backgroundPosition = "center";
  }
}

// ================= RESERVA =================
function reservar() {
  let curso = document.getElementById("curso").value;
  let fecha = document.getElementById("fecha").value;

  let url = `https://wa.me/521XXXXXXXXXX?text=Quiero reservar ${curso} para ${fecha}`;

  window.open(url, "_blank");
}

// ================= INIT =================
window.addEventListener("load", () => {
  cargarHero();
  cargarLogo();
  cargarImagenes();
});