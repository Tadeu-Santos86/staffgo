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
  getDoc,
  deleteDoc
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
let dadosCandidatoAtual = {};
let todasAsVagas = [];
let acessoLiberado = false;
let vagaEditandoId = null;
let candidaturaEditandoId = null;

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
window.editarVaga = editarVaga;
window.salvarPerfilCandidato = salvarPerfilCandidato;
window.editarCandidatura = editarCandidatura;
window.retirarCandidatura = retirarCandidatura;
window.fecharModalEditarCandidatura = fecharModalEditarCandidatura;
window.salvarEdicaoCandidatura = salvarEdicaoCandidatura;

garantirModalEdicaoCandidatura();

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
      dadosCandidatoAtual = usuario.data() || {};
      aplicarCandidatoLogado(dadosCandidatoAtual.Nome || "");
      return;
    }
  }

  usuarioAtual = null;
  tipoUsuario = null;
  nomeEmpresaAtual = "";
  dadosCandidatoAtual = {};
  resetarInterfaces();
});

function abrirSecao(id) {
  const secaoVagas = document.getElementById("secao-vagas");
  const secaoEmpresa = document.getElementById("secao-empresa");
  const secaoCandidato = document.getElementById("secao-candidato");

  if (secaoVagas) secaoVagas.style.display = "none";
  if (secaoEmpresa) secaoEmpresa.style.display = "none";
  if (secaoCandidato) secaoCandidato.style.display = "none";

  const alvo = document.getElementById(id);
  if (alvo) alvo.style.display = "block";

  if (id === "secao-vagas") carregarVagas();
  if (id === "secao-candidato") carregarMinhasCandidaturas();
  if (id === "secao-empresa" && tipoUsuario === "empresa") carregarVagasEmpresa();
}

function aplicarEmpresaLogada() {
  const empresaAuth = document.getElementById("empresa-auth");
  const empresaLogadaBox = document.getElementById("empresa-logada-box");
  const empresaPainelConteudo = document.getElementById("empresa-painel-conteudo");
  const empresaLogadaNome = document.getElementById("empresa-logada-nome");
  const empresaInput = document.getElementById("empresa");

  if (empresaAuth) empresaAuth.classList.add("oculto");
  if (empresaLogadaBox) empresaLogadaBox.classList.remove("oculto");
  if (empresaPainelConteudo) empresaPainelConteudo.classList.remove("oculto");
  if (empresaLogadaNome) empresaLogadaNome.textContent = nomeEmpresaAtual || "Empresa";
  if (empresaInput) empresaInput.value = nomeEmpresaAtual || "";

  carregarVagasEmpresa();
}

function aplicarCandidatoLogado(nome) {
  const candidatoAuth = document.getElementById("candidato-auth");
  const candidatoLogadoBox = document.getElementById("candidato-logado-box");
  const candidatoPainel = document.getElementById("candidato-painel");
  const candidatoLogadoNome = document.getElementById("candidato-logado-nome");

  if (candidatoAuth) candidatoAuth.classList.add("oculto");
  if (candidatoLogadoBox) candidatoLogadoBox.classList.remove("oculto");
  if (candidatoPainel) candidatoPainel.classList.remove("oculto");
  if (candidatoLogadoNome) candidatoLogadoNome.textContent = nome || "Candidato";

  const perfilNome = document.getElementById("perfil-cand-nome");
  const perfilWhatsApp = document.getElementById("perfil-cand-whatsapp");
  const perfilExperiencia = document.getElementById("perfil-cand-experiencia");

  if (perfilNome) perfilNome.value = dadosCandidatoAtual.Nome || "";
  if (perfilWhatsApp) perfilWhatsApp.value = dadosCandidatoAtual.WhatsApp || "";
  if (perfilExperiencia) perfilExperiencia.value = dadosCandidatoAtual.Experiencia || "";

  carregarMinhasCandidaturas();
}

function resetarInterfaces() {
  const empresaAuth = document.getElementById("empresa-auth");
  const empresaLogadaBox = document.getElementById("empresa-logada-box");
  const empresaPainelConteudo = document.getElementById("empresa-painel-conteudo");
  const candidatoAuth = document.getElementById("candidato-auth");
  const candidatoLogadoBox = document.getElementById("candidato-logado-box");
  const candidatoPainel = document.getElementById("candidato-painel");

  if (empresaAuth) empresaAuth.classList.remove("oculto");
  if (empresaLogadaBox) empresaLogadaBox.classList.add("oculto");
  if (empresaPainelConteudo) empresaPainelConteudo.classList.add("oculto");

  if (candidatoAuth) candidatoAuth.classList.remove("oculto");
  if (candidatoLogadoBox) candidatoLogadoBox.classList.add("oculto");
  if (candidatoPainel) candidatoPainel.classList.add("oculto");
}

async function cadastrarEmpresa() {
  const nome = document.getElementById("empresa-nome-cadastro")?.value.trim() || "";
  const email = document.getElementById("empresa-email")?.value.trim() || "";
  const senha = document.getElementById("empresa-senha")?.value.trim() || "";

  if (!nome || !email || !senha) {
    alert("Preencha nome, e-mail e senha.");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    await setDoc(doc(db, "Empresas", cred.user.uid), {
      Nome: nome,
      Email: email
    });

    const mensagem = document.getElementById("mensagem-auth");
    if (mensagem) mensagem.innerHTML = "Empresa cadastrada com sucesso.";
  } catch (erro) {
    console.error("Erro ao cadastrar empresa:", erro);
    alert("Erro ao cadastrar empresa.");
  }
}

async function loginEmpresa() {
  const email = document.getElementById("empresa-email")?.value.trim() || "";
  const senha = document.getElementById("empresa-senha")?.value.trim() || "";

  if (!email || !senha) {
    alert("Preencha e-mail e senha.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    const mensagem = document.getElementById("mensagem-auth");
    if (mensagem) mensagem.innerHTML = "Login realizado com sucesso.";
  } catch (erro) {
    console.error("Erro ao entrar:", erro);
    alert("Erro ao entrar.");
  }
}

async function logoutEmpresa() {
  try {
    await signOut(auth);
    vagaEditandoId = null;
  } catch (erro) {
    console.error("Erro ao sair:", erro);
    alert("Erro ao sair.");
  }
}

async function cadastrar
