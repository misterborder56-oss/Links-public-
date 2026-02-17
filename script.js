/* ===== SUPABASE ===== */
const supabaseUrl = "https://molbmjwxojrjkyxatebc.supabase.co";
const supabaseKey = "sb_publishable_7zCY2tTeUi61lhZlGgwEMw_io7eXi3H";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

/* ===== ELEMENTOS ===== */
const contenedorLinks = document.getElementById("links");
const botonCrear = document.getElementById("crearLink");
const botonTema = document.getElementById("temas");
const buscador = document.getElementById("buscador");
const resultados = document.getElementById("resultados");

const modal = document.getElementById("modal");
const nombreInput = document.getElementById("nombreInput");
const urlInput = document.getElementById("urlInput");
const guardarBtn = document.getElementById("guardar");
const cancelarBtn = document.getElementById("cancelar");
const modalTitulo = document.getElementById("modalTitulo");

let editandoId = null;

/* ===== TEMAS ===== */
const temas = ["neon", "oscuro", "claro"];
let temaActual = 0;

botonTema.onclick = () => {
    temaActual++;
    if (temaActual >= temas.length) temaActual = 0;
    document.body.className = temas[temaActual];
    localStorage.setItem("temaGuardado", temas[temaActual]);
};

window.addEventListener("load", () => {
    const guardado = localStorage.getItem("temaGuardado");
    if (guardado) {
        document.body.className = guardado;
        temaActual = temas.indexOf(guardado);
    }
});

/* ===== CARGAR LINKS ===== */
async function cargarLinks() {
    const { data, error } = await supabaseClient
        .from("links")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.log("Error:", error);
        return;
    }

    mostrarLinks(data);
}

/* ===== MOSTRAR LINKS ===== */
function mostrarLinks(lista) {
    contenedorLinks.innerHTML = "";

    lista.forEach(link => {

        const card = document.createElement("div");
        card.className = "card";

        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.textContent = link.nombre;

        card.appendChild(a);

        // SOLO PERMITIR EDITAR SI NO ES FIJO
        if (!link.fijo) {

            const botones = document.createElement("div");
            botones.className = "card-buttons";

            const editar = document.createElement("button");
            editar.textContent = "Editar";
            editar.onclick = () => {
                modal.style.display = "flex";
                modalTitulo.textContent = "Editar Link";
                nombreInput.value = link.nombre;
                urlInput.value = link.url;
                editandoId = link.id;
            };

            botones.appendChild(editar);
            card.appendChild(botones);
        }

        contenedorLinks.appendChild(card);
    });
}

/* ===== ABRIR MODAL ===== */
botonCrear.onclick = () => {
    modal.style.display = "flex";
    modalTitulo.textContent = "Nuevo Link";
    nombreInput.value = "";
    urlInput.value = "";
    editandoId = null;
};

/* ===== GUARDAR ===== */
guardarBtn.onclick = async () => {
    const nombre = nombreInput.value;
    const url = urlInput.value;

    if (!nombre || !url) return;

    if (editandoId) {
        await supabaseClient
            .from("links")
            .update({ nombre, url })
            .eq("id", editandoId);
    } else {
        await supabaseClient
            .from("links")
            .insert([{ nombre, url, fijo: false }]);
    }

    modal.style.display = "none";
    cargarLinks();
};

/* ===== CANCELAR MODAL ===== */
cancelarBtn.onclick = () => {
    modal.style.display = "none";
};

/* ===== BUSCADOR ===== */
buscador.addEventListener("input", async () => {
    const texto = buscador.value.toLowerCase();

    const { data } = await supabaseClient
        .from("links")
        .select("*");

    resultados.innerHTML = "";

    data.forEach(link => {
        if (link.nombre.toLowerCase().includes(texto)) {
            const item = document.createElement("div");
            item.textContent = link.nombre;
            item.style.cursor = "pointer";
            item.onclick = () => window.open(link.url, "_blank");
            resultados.appendChild(item);
        }
    });
});

cargarLinks();
