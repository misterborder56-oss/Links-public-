const supabaseUrl = "https://molbmjwxojrjkyxatebc.supabase.co";
const supabaseKey = "sb_publishable_7zCY2tTeUi61lhZlGgwEMw_io7eXi3H";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

/* ELEMENTOS */
const linksContainer = document.getElementById("links");
const crearBtn = document.getElementById("crearLink");
const temasBtn = document.getElementById("temas");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const modal = document.getElementById("modal");
const nombreInput = document.getElementById("nombreInput");
const urlInput = document.getElementById("urlInput");
const guardarBtn = document.getElementById("guardar");
const cancelarBtn = document.getElementById("cancelar");

const modalLogin = document.getElementById("modalLogin");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const entrarBtn = document.getElementById("entrar");
const registrarBtn = document.getElementById("registrar");

let editandoId = null;

/* ===== TEMAS ===== */
const temas = ["neon","oscuro","claro"];
let temaActual = 0;

temasBtn.onclick = () => {
    temaActual++;
    if (temaActual >= temas.length) temaActual = 0;
    document.body.className = temas[temaActual];
    localStorage.setItem("tema", temas[temaActual]);
};

window.onload = async () => {
    const guardado = localStorage.getItem("tema");
    if (guardado) document.body.className = guardado;
    cargarLinks();
};

/* ===== AUTH ===== */

loginBtn.onclick = () => modalLogin.style.display = "flex";

logoutBtn.onclick = async () => {
    await supabaseClient.auth.signOut();
    alert("Sesión cerrada");
};

entrarBtn.onclick = async () => {
    await supabaseClient.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value
    });
    modalLogin.style.display = "none";
};

registrarBtn.onclick = async () => {
    await supabaseClient.auth.signUp({
        email: emailInput.value,
        password: passwordInput.value
    });
    alert("Usuario registrado");
};

/* ===== CARGAR LINKS ===== */
async function cargarLinks() {
    const { data } = await supabaseClient.from("links").select("*");
    mostrarLinks(data);
}

function mostrarLinks(lista) {
    linksContainer.innerHTML = "";

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
                nombreInput.value = link.nombre;
                urlInput.value = link.url;
                editandoId = link.id;
            };

            const eliminar = document.createElement("button");
            eliminar.textContent = "Eliminar";
            eliminar.onclick = async () => {
                await supabaseClient.from("links").delete().eq("id", link.id);
                cargarLinks();
            };

            botones.appendChild(editar);
            botones.appendChild(eliminar);
            card.appendChild(botones);
        }

        linksContainer.appendChild(card);
    });
}

/* ===== CREAR / EDITAR ===== */

crearBtn.onclick = () => {
    modal.style.display = "flex";
    editandoId = null;
    nombreInput.value = "";
    urlInput.value = "";
};

guardarBtn.onclick = async () => {

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Debes iniciar sesión");
        return;
    }

    if (editandoId) {
        await supabaseClient
            .from("links")
            .update({ nombre: nombreInput.value, url: urlInput.value })
            .eq("id", editandoId);
    } else {
        await supabaseClient
            .from("links")
            .insert([{
                nombre: nombreInput.value,
                url: urlInput.value,
                fijo: false,
                user_id: user.id
            }]);
    }

    modal.style.display = "none";
    cargarLinks();
};

cancelarBtn.onclick = () => modal.style.display = "none";
