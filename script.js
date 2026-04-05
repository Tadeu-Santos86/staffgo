import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwKDWQNYTV1MNL9isJVoxLz2ErqBOYaM0",
  authDomain: "staffgo-1927e.firebaseapp.com",
  projectId: "staffgo-1927e",
  storageBucket: "staffgo-1927e.firebasestorage.app",
  messagingSenderId: "571900078925",
  appId: "1:571900078925:web:e51e80af825aa054e2a504"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let vagaSelecionada = null;
let usuarioAtual = null;
let tipoUsuario = null;
let nomeEmpresaAtual = "";
let todasAsVagas = [];
let acessoLiberado = false;

window.abrirSecao = abrirSecao;
window.cadastrarEmpresa = cadastrarEmpresa;
window.loginEmpresa = loginEmpresa;
window.logoutEmpresa = logoutEmpresa;
window.salvarOuAtualizarVaga = salvarOuAtualizarVaga;
window.cadastrarCandidato = cadastrarCandidato;
window.loginCandidato = loginCandidato;
window.logoutCandidato = logoutCandidato;
window.abrirModalCandidatura = abrirModalCandidatura;
window.fecharModalCandidatura = fecharModalCandidatura;
window.enviarCandidatura = enviarCandidatura;
window.verCandidatosDaVaga = verCandidatosDaVaga;
window.fecharModalCandidatos = fecharModalCandidatos;
window.atualizarStatusCandidatura = atualizarStatusCandidatura;
window.aplicarFiltrosVagas = aplicarFiltrosVagas;
window.limparFiltrosVagas = limparFiltrosVagas;
window.verificarAcesso = verificarAcesso;
window.compartilharVaga = compartilharVaga;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    usuarioAtual = user;

    const empresa = await getDoc(doc(db, "Empresas", user.uid));
    if (empresa.exists()) {
      tipoUsuario = "empresa";
      nomeEmpresaAtual = empresa.data().Nome || "";
      aplicarEmpresaLogada();
      return;
    }

    const usuario = await getDoc(doc(db, "Usuarios", user.uid));
    if (usuario.exists()) {
      tipoUsuario = "candidato";
      aplicarCandidatoLogado(usuario.data().Nome || "");
      return;
    }
  }

  usuarioAtual = null;
  tipoUsuario = null;
  nomeEmpresaAtual = "";
  resetarInterfaces();
});

function abrirSecao(id) {
  document.getElementById("secao-vagas").style.display = "none";
  document.getElementById("secao-empresa").style.display = "none";
  document.getElementById("secao-candidato").style.display = "none";

  document.getElementById(id).style.display = "block";

  if (id === "secao-vagas") carregarVagas();
  if (id === "secao-candidato") carregarMinhasCandidaturas();
  if (id === "secao-empresa" && tipoUsuario === "empresa") carregarVagasEmpresa();
}

function aplicarEmpresaLogada() {
  document.getElementById("empresa-auth").classList.add("oculto");
  document.getElementById("empresa-logada-box").classList.remove("oculto");
  document.getElementById("empresa-painel-conteudo").classList.remove("oculto");
  document.getElementById("empresa-logada-nome").textContent = nomeEmpresaAtual || "Empresa";
  document.getElementById("empresa").value = nomeEmpresaAtual || "";
  carregarVagasEmpresa();
}

function aplicarCandidatoLogado(nome) {
  document.getElementById("candidato-auth").classList.add("oculto");
  document.getElementById("candidato-logado-box").classList.remove("oculto");
  document.getElementById("candidato-painel").classList.remove("oculto");
  document.getElementById("candidato-logado-nome").textContent = nome || "Candidato";
  carregarMinhasCandidaturas();
}

function resetarInterfaces() {
  document.getElementById("empresa-auth").classList.remove("oculto");
  document.getElementById("empresa-logada-box").classList.add("oculto");
  document.getElementById("empresa-painel-conteudo").classList.add("oculto");

  document.getElementById("candidato-auth").classList.remove("oculto");
  document.getElementById("candidato-logado-box").classList.add("oculto");
  document.getElementById("candidato-painel").classList.add("oculto");
}

async function carregarVagas() {
  const snapshot = await getDocs(query(collection(db, "Vagas"), orderBy("Data", "desc")));

  todasAsVagas = [];

  snapshot.forEach((docItem) => {
    todasAsVagas.push({
      id: docItem.id,
      ...docItem.data()
    });
  });

  renderizarVagasFiltradas();
}

function renderizarVagasFiltradas() {
  const container = document.getElementById("vagas");

  const filtroTitulo = (document.getElementById("filtro-titulo").value || "").toLowerCase();
  const filtroCidade = (document.getElementById("filtro-cidade").value || "").toLowerCase();

  container.innerHTML = "";

  const vagasFiltradas = todasAsVagas.filter((vaga) => {
    return (
      (!filtroTitulo || (vaga.Titulo || "").toLowerCase().includes(filtroTitulo)) &&
      (!filtroCidade || (vaga.Cidade || "").toLowerCase().includes(filtroCidade))
    );
  });

  vagasFiltradas.forEach((vaga) => {
    const div = document.createElement("div");
    div.className = "vaga";

    div.innerHTML = `
      <h3>${vaga.Titulo}</h3>
      <p><strong>Empresa:</strong> ${vaga.Empresa}</p>
      <p><strong>Cidade:</strong> ${vaga.Cidade}</p>
      <p><strong>Salário:</strong> ${vaga.Salario}</p>
      <p>${vaga.Descrição}</p>

      <button class="acao-candidato"
        onclick="verificarAcesso('${encodeURIComponent(vaga.Titulo)}','${encodeURIComponent(vaga.Empresa)}','${encodeURIComponent(vaga.Cidade)}')">
        Candidatar-se
      </button>

      <button class="acao-neutra"
        onclick="compartilharVaga('${encodeURIComponent(vaga.Titulo)}')">
        Compartilhar
      </button>
    `;

    container.appendChild(div);
  });
}

function aplicarFiltrosVagas() {
  renderizarVagasFiltradas();
}

function limparFiltrosVagas() {
  document.getElementById("filtro-titulo").value = "";
  document.getElementById("filtro-cidade").value = "";
  renderizarVagasFiltradas();
}

function verificarAcesso(titulo, empresa, cidade) {
  if (!acessoLiberado) {
    alert("Compartilhe a vaga para liberar a candidatura.");
    return;
  }

  abrirModalCandidatura(
    decodeURIComponent(titulo),
    decodeURIComponent(empresa),
    decodeURIComponent(cidade)
  );
}

function compartilharVaga(titulo) {
  const url = `${window.location.origin}${window.location.pathname}?vaga=${titulo}`;

  navigator.clipboard.writeText(url).then(() => {
    acessoLiberado = true;
    alert("Link copiado! Agora você pode se candidatar.");
  });
}
