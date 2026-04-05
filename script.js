// 🔹 IMPORTS FIREBASE
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

// 🔹 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBwKDWQNYTV1MNL9isJVoxLz2ErqBOYaM0",
  authDomain: "staffgo-1927e.firebaseapp.com",
  projectId: "staffgo-1927e",
  storageBucket: "staffgo-1927e.firebasestorage.app",
  messagingSenderId: "571900078925",
  appId: "1:571900078925:web:e51e80af825aa054e2a504"
};

// 🔹 INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔹 VARIÁVEIS
let vagaSelecionada = null;
let usuarioAtual = null;
let tipoUsuario = null;
let nomeEmpresaAtual = "";
let dadosEmpresaAtual = {};
let todasAsVagas = [];
let acessoLiberado = false;
let vagaEditandoId = null;

// 🔹 EXPOSIÇÃO GLOBAL
window.abrirSecao = abrirSecao;
window.cadastrarEmpresa = cadastrarEmpresa;
window.loginEmpresa = loginEmpresa;
window.logoutEmpresa = logoutEmpresa;
window.salvarOuAtualizarVaga = salvarOuAtualizarVaga;
window.cadastrarCandidato = cadastrarCandidato;
window.loginCandidato = loginCandidato;
window.logoutCandidato = logoutCandidato;
window.salvarPerfilEmpresa = salvarPerfilEmpresa;

// 🔹 AUTH
onAuthStateChanged(auth, async (user) => {
  if (user) {
    usuarioAtual = user;

    const empresa = await getDoc(doc(db, "Empresas", user.uid));
    if (empresa.exists()) {
      tipoUsuario = "empresa";
      dadosEmpresaAtual = empresa.data();
      nomeEmpresaAtual = dadosEmpresaAtual.Nome || "";

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
  resetarInterfaces();
});

// 🔹 EMPRESA LOGADA
function aplicarEmpresaLogada() {
  document.getElementById("empresa-auth").classList.add("oculto");
  document.getElementById("empresa-logada-box").classList.remove("oculto");
  document.getElementById("empresa-painel-conteudo").classList.remove("oculto");

  document.getElementById("empresa-logada-nome").textContent = nomeEmpresaAtual || "Empresa";

  // preencher campos
  document.getElementById("empresa").value = dadosEmpresaAtual.Nome || "";
  document.getElementById("empresa-telefone").value = dadosEmpresaAtual.Telefone || "";
  document.getElementById("empresa-descricao").value = dadosEmpresaAtual.Descricao || "";
}

// 🔹 SALVAR PERFIL
async function salvarPerfilEmpresa() {
  if (!usuarioAtual) return;

  const nome = document.getElementById("empresa").value.trim();
  const telefone = document.getElementById("empresa-telefone").value.trim();
  const descricao = document.getElementById("empresa-descricao").value.trim();

  try {
    await updateDoc(doc(db, "Empresas", usuarioAtual.uid), {
      Nome: nome,
      Telefone: telefone,
      Descricao: descricao
    });

    document.getElementById("mensagem-empresa").innerHTML = "Perfil atualizado com sucesso.";

    nomeEmpresaAtual = nome;
    dadosEmpresaAtual.Nome = nome;

    document.getElementById("empresa-logada-nome").textContent = nome;
  } catch (erro) {
    console.error("Erro ao salvar perfil:", erro);
    alert("Erro ao salvar perfil.");
  }
}

// 🔹 LOGIN / CADASTRO EMPRESA
async function cadastrarEmpresa() {
  const nome = document.getElementById("empresa-nome-cadastro").value;
  const email = document.getElementById("empresa-email").value;
  const senha = document.getElementById("empresa-senha").value;

  const cred = await createUserWithEmailAndPassword(auth, email, senha);

  await setDoc(doc(db, "Empresas", cred.user.uid), {
    Nome: nome,
    Email: email,
    Telefone: "",
    Descricao: ""
  });

  alert("Empresa cadastrada!");
}

async function loginEmpresa() {
  const email = document.getElementById("empresa-email").value;
  const senha = document.getElementById("empresa-senha").value;

  await signInWithEmailAndPassword(auth, email, senha);
}

async function logoutEmpresa() {
  await signOut(auth);
}

// 🔹 OUTRAS FUNÇÕES (mantidas simples para estabilidade)
function abrirSecao(id) {
  document.getElementById("secao-vagas").style.display = "none";
  document.getElementById("secao-empresa").style.display = "none";
  document.getElementById("secao-candidato").style.display = "none";

  document.getElementById(id).style.display = "block";
}

function aplicarCandidatoLogado(nome) {
  document.getElementById("candidato-logado-nome").textContent = nome;
}

function resetarInterfaces() {}
