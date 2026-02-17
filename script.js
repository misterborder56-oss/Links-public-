const supabaseUrl = "https://molbmjwxojrjkyxatebc.supabase.co";
const supabaseKey = "sb_publishable_7zCY2tTeUi61lhZlGgwEMw_io7eXi3H";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const contenedorLinks = document.getElementById("links");
const botonCrear = document.getElementById("crearLink");
const buscador = document.getElementById("buscador");
const resultados = document.getElementById("resultados");

const modal = document.getElementById("modal");
const nombreInput = document.getElementById("nombreInput");
const urlInput = document.getElementById("urlInput");
const guardarBtn = document.getElementById("guardar");
const cancelarBtn = document.getElementById("cancelar");
const modalTitulo = document.getElementById("modalTitulo");

let editandoId = null;

/* ===== CARGAR LINKS DESDE SUPABASE ===== */
async function cargarLinks() {
    const { data, error } = await supabaseClient
        .from("links")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.log(error);
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

            const eliminar = document.createElement("button");
            eliminar.textContent = "Eliminar";
            eliminar.onclick = async () => {
                await supabaseClient
                    .from("links")
                    .delete()
                    .eq("id", link.id);

                cargarLinks();
            };

            botones.appendChild(editar);
            botones.appendChild(eliminar);
            card.appendChild(botones);
        }

        contenedorLinks.appendChild(card);
    });
}

/* ===== CREAR LINK ===== */
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

/* ===== CERRAR MODAL ===== */
cancelarBtn.onclick = () => {
    modal.style.display = "none";
};

cargarLinks();