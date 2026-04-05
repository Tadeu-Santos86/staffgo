// (CÓDIGO COMPLETO — já com STATUS integrado)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs,
  query, orderBy, doc, deleteDoc, updateDoc,
  setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwKDWQNYTV1MNL9isJVoxLz2ErqBOYaM0",
  authDomain: "staffgo-1927e.firebaseapp.com",
  projectId: "staffgo-1927e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let vagaSelecionada = null;
let usuarioAtual = null;
let tipoUsuario = null;
let nomeEmpresaAtual = "";

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

onAuthStateChanged(auth, async (user) => {

  if (user) {
    usuarioAtual = user;

    const empresa = await getDoc(doc(db, "Empresas", user.uid));
    if (empresa.exists()) {
      tipoUsuario = "empresa";
      nomeEmpresaAtual = empresa.data().Nome;
      aplicarEmpresaLogada();
      return;
    }

    const usuario = await getDoc(doc(db, "Usuarios", user.uid));
    if (usuario.exists()) {
      tipoUsuario = "candidato";
      aplicarCandidatoLogado(usuario.data().Nome);
      return;
    }
  }

  usuarioAtual = null;
  tipoUsuario = null;
  resetarInterfaces();
});

function abrirSecao(id) {
  document.getElementById("secao-vagas").style.display = "none";
  document.getElementById("secao-empresa").style.display = "none";
  document.getElementById("secao-candidato").style.display = "none";

  document.getElementById(id).style.display = "block";

  if (id === "secao-vagas") carregarVagas();
  if (id === "secao-candidato") carregarMinhasCandidaturas();
}

// ================= EMPRESA =================

function aplicarEmpresaLogada() {
  document.getElementById("empresa-auth").classList.add("oculto");
  document.getElementById("empresa-logada-box").classList.remove("oculto");
  document.getElementById("empresa-painel-conteudo").classList.remove("oculto");

  document.getElementById("empresa-logada-nome").textContent = nomeEmpresaAtual;
}

async function cadastrarEmpresa() {
  const nome = document.getElementById("empresa-nome-cadastro").value;
  const email = document.getElementById("empresa-email").value;
  const senha = document.getElementById("empresa-senha").value;

  const cred = await createUserWithEmailAndPassword(auth, email, senha);

  await setDoc(doc(db, "Empresas", cred.user.uid), {
    Nome: nome,
    Email: email
  });
}

async function loginEmpresa() {
  await signInWithEmailAndPassword(
    auth,
    document.getElementById("empresa-email").value,
    document.getElementById("empresa-senha").value
  );
}

async function logoutEmpresa() {
  await signOut(auth);
}

async function salvarOuAtualizarVaga() {

  const titulo = document.getElementById("titulo").value;
  const empresa = document.getElementById("empresa").value;
  const cidade = document.getElementById("cidade").value;
  const salario = document.getElementById("salario").value;
  const descricao = document.getElementById("descricao").value;

  await addDoc(collection(db, "Vagas"), {
    Titulo: titulo,
    Empresa: empresa,
    Cidade: cidade,
    Salario: salario,
    Descrição: descricao,
    EmpresaId: usuarioAtual.uid,
    Data: new Date()
  });

  alert("Vaga cadastrada");
}

// ================= VAGAS =================

async function carregarVagas() {

  const container = document.getElementById("vagas");
  container.innerHTML = "";

  const snapshot = await getDocs(query(collection(db, "Vagas"), orderBy("Data", "desc")));

  snapshot.forEach(docItem => {

    const v = docItem.data();

    const div = document.createElement("div");
    div.className = "vaga";

    div.innerHTML = `
      <h3>${v.Titulo}</h3>
      <p>${v.Empresa}</p>
      <p>${v.Cidade}</p>
      <button onclick="abrirModalCandidatura('${v.Titulo}','${v.Empresa}','${v.Cidade}')">
        Candidatar-se
      </button>
    `;

    container.appendChild(div);
  });
}

// ================= CANDIDATO =================

function aplicarCandidatoLogado(nome) {
  document.getElementById("candidato-auth").classList.add("oculto");
  document.getElementById("candidato-logado-box").classList.remove("oculto");
  document.getElementById("candidato-painel").classList.remove("oculto");

  document.getElementById("candidato-logado-nome").textContent = nome;
}

async function cadastrarCandidato() {
  const nome = document.getElementById("cand-nome-cadastro").value;
  const email = document.getElementById("cand-email").value;
  const senha = document.getElementById("cand-senha").value;

  const cred = await createUserWithEmailAndPassword(auth, email, senha);

  await setDoc(doc(db, "Usuarios", cred.user.uid), {
    Nome: nome,
    Email: email
  });
}

async function loginCandidato() {
  await signInWithEmailAndPassword(
    auth,
    document.getElementById("cand-email").value,
    document.getElementById("cand-senha").value
  );
}

async function logoutCandidato() {
  await signOut(auth);
}

// ================= CANDIDATURA =================

function abrirModalCandidatura(t, e, c) {
  vagaSelecionada = { titulo: t, empresa: e, cidade: c };
  document.getElementById("modal-candidatura-fundo").style.display = "block";
}

function fecharModalCandidatura() {
  document.getElementById("modal-candidatura-fundo").style.display = "none";
}

async function enviarCandidatura() {

  await addDoc(collection(db, "Candidatos"), {
    UsuarioId: usuarioAtual.uid,
    Vaga: vagaSelecionada.titulo,
    Empresa: vagaSelecionada.empresa,
    Cidade: vagaSelecionada.cidade,
    Status: "Enviado",
    Data: new Date()
  });

  alert("Candidatura enviada");
}

// ================= STATUS =================

async function atualizarStatus(id, status) {
  await updateDoc(doc(db, "Candidatos", id), {
    Status: status
  });
}

// ================= LISTAR CANDIDATURAS =================

async function carregarMinhasCandidaturas() {

  const container = document.getElementById("minhas-candidaturas");
  container.innerHTML = "";

  const snapshot = await getDocs(query(collection(db, "Candidatos"), orderBy("Data", "desc")));

  snapshot.forEach(docItem => {

    const c = docItem.data();

    if (c.UsuarioId !== usuarioAtual.uid) return;

    const div = document.createElement("div");
    div.className = "vaga";

    div.innerHTML = `
      <h3>${c.Vaga}</h3>
      <p>${c.Empresa}</p>
      <p>Status: ${c.Status}</p>
    `;

    container.appendChild(div);
  });
}

// ================= RESET =================

function resetarInterfaces() {
  document.getElementById("empresa-auth").classList.remove("oculto");
  document.getElementById("empresa-logada-box").classList.add("oculto");
  document.getElementById("empresa-painel-conteudo").classList.add("oculto");

  document.getElementById("candidato-auth").classList.remove("oculto");
  document.getElementById("candidato-logado-box").classList.add("oculto");
  document.getElementById("candidato-painel").classList.add("oculto");
}

carregarVagas();
