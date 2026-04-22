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
async function cargarCursos() {
  const cont = document.getElementById("contenedor-cursos");
  if (!cont) return;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/cursos?select=*&activo=eq.true&order=id.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!res.ok) {
      console.error("Error cargando cursos");
      return;
    }

    const data = await res.json();

    cont.innerHTML = "";

    data.forEach(curso => {
      const card = document.createElement("div");
      card.className = "card";

     card.innerHTML = `
  
  <h3>${curso.nombre}</h3>
  <img src="${curso.imagen_url}" alt="${curso.nombre}"> 
  <button class="btn-info">Información</button> 
  <div class="info-curso">
    <p>${curso.descripcion}</p>
    <button onclick="scrollToReserva('${curso.nombre}')">
      Reservar
    </button>
  </div>
`;

      cont.appendChild(card);
    });

    // 🔥 EVENTO PARA MOSTRAR/OCULTAR
    document.querySelectorAll(".btn-info").forEach(btn => {
      btn.addEventListener("click", () => {
        const info = btn.nextElementSibling;

        // 👉 si quieres que solo uno se abra:
        document.querySelectorAll(".info-curso").forEach(el => {
          if (el !== info) el.classList.remove("activo");
        });

        info.classList.toggle("activo");
      });
    });

  } catch (err) {
    console.error(err);
  }
}
async function cargarCursosSelect() {
  const select = document.getElementById("curso");
  if (!select) return;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/cursos?select=nombre&activo=eq.true`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const data = await res.json();

    select.innerHTML = "";

    data.forEach(curso => {
      const option = document.createElement("option");
      option.value = curso.nombre;
      option.textContent = curso.nombre;
      select.appendChild(option);
    });

  } catch (err) {
    console.error(err);
  }
}

// ================= RESERVA =================
function reservar() {
  let curso = document.getElementById("curso").value;
  let fecha = document.getElementById("fecha").value;

  let url = `https://wa.me/521XXXXXXXXXX?text=Quiero reservar ${curso} para ${fecha}`;

  window.open(url, "_blank");
}

function animarContador() {
  const el = document.getElementById("contadorNumero");
  if (!el) return;

  let inicio = 0;
  let fin = 250; // 👈 aquí cambias el número final
  let duracion = 2000;

  let incremento = Math.ceil(fin / (duracion / 20));

  let intervalo = setInterval(() => {
    inicio += incremento;

    if (inicio >= fin) {
      el.textContent = fin;
      clearInterval(intervalo);
    } else {
      el.textContent = inicio;
    }
  }, 20);
}
function contadorPro() {
  const el = document.getElementById("contadorNumero");
  if (!el) return;

  let valor = 0;
  let max = 150; // 👈 límite

  function actualizar() {
    if (valor >= max) {
      el.textContent = max.toLocaleString();
      return; // 🔴 se detiene
    }

    valor += Math.floor(Math.random() * 8) + 3;

    el.textContent = valor.toLocaleString();

    setTimeout(actualizar, 80 + Math.random() * 120);
  }

  actualizar();
}

window.addEventListener("load", contadorPro);

// ================= INIT =================
 

  window.addEventListener("load", () => {
  cargarHero();
  cargarLogo();
  cargarImagenes();
  cargarCursos();
  cargarCursosSelect();
});
 