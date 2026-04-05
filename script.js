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
  projectId: "staffgo-1927e",
  storageBucket: "staffgo-1927e.firebasestorage.app",
  messagingSenderId: "571900078925",
  appId: "1:571900078925:web:e51e80af825aa054e2a504"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let vagaSelecionada = null;
let vagaEditandoId = null;
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
}

function aplicarEmpresaLogada() {
  document.getElementById("empresa-auth").classList.add("oculto");
  document.getElementById("empresa-logada-box").classList.remove("oculto");
  document.getElementById("empresa-painel-conteudo").classList.remove("oculto");

  document.getElementById("empresa-logada-nome").textContent = nomeEmpresaAtual || "Empresa";
}

async function cadastrarEmpresa() {
  const nome = document.getElementById("empresa-nome-cadastro").value;
  const email = document.getElementById("empresa-email").value;
  const senha = document.getElementById("empresa-senha").value;

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

    document.getElementById("mensagem-auth").innerHTML = "Empresa cadastrada com sucesso.";
  } catch (erro) {
    console.error("Erro ao cadastrar empresa:", erro);
    alert("Erro ao cadastrar empresa.");
  }
}

async function loginEmpresa() {
  const email = document.getElementById("empresa-email").value;
  const senha = document.getElementById("empresa-senha").value;

  if (!email || !senha) {
    alert("Preencha e-mail e senha.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    document.getElementById("mensagem-auth").innerHTML = "Login realizado com sucesso.";
  } catch (erro) {
    console.error("Erro ao entrar:", erro);
    alert("Erro ao entrar.");
  }
}

async function logoutEmpresa() {
  try {
    await signOut(auth);
  } catch (erro) {
    console.error("Erro ao sair:", erro);
    alert("Erro ao sair.");
  }
}

async function salvarOuAtualizarVaga() {
  if (!usuarioAtual || tipoUsuario !== "empresa") {
    alert("Faça login como empresa.");
    return;
  }

  const titulo = document.getElementById("titulo").value;
  const empresa = document.getElementById("empresa").value;
  const cidade = document.getElementById("cidade").value;
  const salario = document.getElementById("salario").value;
  const descricao = document.getElementById("descricao").value;

  if (!titulo || !empresa || !cidade || !salario || !descricao) {
    alert("Preencha todos os campos da vaga.");
    return;
  }

  try {
    if (vagaEditandoId) {
      await updateDoc(doc(db, "Vagas", vagaEditandoId), {
        Titulo: titulo,
        Empresa: empresa,
        Cidade: cidade,
        Salario: salario,
        Descrição: descricao,
        Data: new Date(),
        EmpresaId: usuarioAtual.uid,
        EmpresaNome: nomeEmpresaAtual
      });
    } else {
      await addDoc(collection(db, "Vagas"), {
        Titulo: titulo,
        Empresa: empresa,
        Cidade: cidade,
        Salario: salario,
        Descrição: descricao,
        Data: new Date(),
        EmpresaId: usuarioAtual.uid,
        EmpresaNome: nomeEmpresaAtual
      });
    }

    document.getElementById("mensagem-empresa").innerHTML = "Vaga salva com sucesso.";
    limparFormularioVaga();
    carregarVagasEmpresa();
    carregarVagas();
  } catch (erro) {
    console.error("Erro ao salvar vaga:", erro);
    alert("Erro ao salvar vaga.");
  }
}

function limparFormularioVaga() {
  document.getElementById("titulo").value = "";
  document.getElementById("empresa").value = nomeEmpresaAtual || "";
  document.getElementById("cidade").value = "";
  document.getElementById("salario").value = "";
  document.getElementById("descricao").value = "";
  vagaEditandoId = null;
}

async function carregarVagas() {
  const container = document.getElementById("vagas");
  const mensagem = document.getElementById("mensagem-vagas");

  container.innerHTML = "";
  if (mensagem) mensagem.innerHTML = "Carregando vagas...";

  try {
    const snapshot = await getDocs(query(collection(db, "Vagas"), orderBy("Data", "desc")));

    if (snapshot.empty) {
      if (mensagem) mensagem.innerHTML = "Nenhuma vaga cadastrada.";
      return;
    }

    if (mensagem) mensagem.innerHTML = "";

    snapshot.forEach((docItem) => {
      const vaga = docItem.data();

      const div = document.createElement("div");
      div.className = "vaga";

      const titulo = vaga.Titulo || "";
      const empresa = vaga.Empresa || "";
      const cidade = vaga.Cidade || "";
      const salario = vaga.Salario || "";
      const descricao = vaga.Descrição || "";

      div.innerHTML = `
        <h3>${titulo}</h3>
        <p><strong>Empresa:</strong> ${empresa}</p>
        <p><strong>Cidade:</strong> ${cidade}</p>
        <p><strong>Salário:</strong> ${salario}</p>
        <p><strong>Descrição:</strong> ${descricao}</p>
        <button onclick="abrirModalCandidatura('${escapeTexto(titulo)}','${escapeTexto(empresa)}','${escapeTexto(cidade)}')">Candidatar-se</button>
      `;

      container.appendChild(div);
    });
  } catch (erro) {
    console.error("Erro ao carregar vagas:", erro);
    if (mensagem) mensagem.innerHTML = "Erro ao carregar vagas.";
  }
}

async function carregarVagasEmpresa() {
  const container = document.getElementById("vagas-empresa");
  const mensagem = document.getElementById("mensagem-vagas-empresa");

  if (!container) return;

  container.innerHTML = "";
  if (mensagem) mensagem.innerHTML = "Carregando vagas da empresa...";

  if (!usuarioAtual) {
    if (mensagem) mensagem.innerHTML = "Faça login.";
    return;
  }

  try {
    const snapshot = await getDocs(query(collection(db, "Vagas"), orderBy("Data", "desc")));

    let encontrou = false;
    container.innerHTML = "";

    snapshot.forEach((docItem) => {
      const vaga = docItem.data();

      if ((vaga.EmpresaId || "") !== usuarioAtual.uid) return;

      encontrou = true;

      const div = document.createElement("div");
      div.className = "vaga";

      div.innerHTML = `
        <h3>${vaga.Titulo || ""}</h3>
        <p><strong>Cidade:</strong> ${vaga.Cidade || ""}</p>
        <p><strong>Salário:</strong> ${vaga.Salario || ""}</p>
      `;

      container.appendChild(div);
    });

    if (mensagem) mensagem.innerHTML = encontrou ? "" : "Nenhuma vaga sua cadastrada.";
  } catch (erro) {
    console.error("Erro ao carregar vagas da empresa:", erro);
    if (mensagem) mensagem.innerHTML = "Erro ao carregar vagas da empresa.";
  }
}

function aplicarCandidatoLogado(nome) {
  document.getElementById("candidato-auth").classList.add("oculto");
  document.getElementById("candidato-logado-box").classList.remove("oculto");
  document.getElementById("candidato-painel").classList.remove("oculto");

  document.getElementById("candidato-logado-nome").textContent = nome || "Candidato";

  carregarMinhasCandidaturas();
}

async function cadastrarCandidato() {
  const nome = document.getElementById("cand-nome-cadastro").value;
  const email = document.getElementById("cand-email").value;
  const senha = document.getElementById("cand-senha").value;

  if (!nome || !email || !senha) {
    alert("Preencha nome, e-mail e senha.");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    await setDoc(doc(db, "Usuarios", cred.user.uid), {
      Nome: nome,
      Email: email
    });

    document.getElementById("mensagem-candidato-auth").innerHTML = "Candidato cadastrado com sucesso.";
  } catch (erro) {
    console.error("Erro ao cadastrar candidato:", erro);
    alert("Erro ao cadastrar candidato.");
  }
}

async function loginCandidato() {
  const email = document.getElementById("cand-email").value;
  const senha = document.getElementById("cand-senha").value;

  if (!email || !senha) {
    alert("Preencha e-mail e senha.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    document.getElementById("mensagem-candidato-auth").innerHTML = "Login realizado com sucesso.";
  } catch (erro) {
    console.error("Erro ao entrar como candidato:", erro);
    alert("Erro ao entrar como candidato.");
  }
}

async function logoutCandidato() {
  try {
    await signOut(auth);
  } catch (erro) {
    console.error("Erro ao sair:", erro);
    alert("Erro ao sair.");
  }
}

function abrirModalCandidatura(titulo, empresa, cidade) {
  vagaSelecionada = { titulo, empresa, cidade };

  document.getElementById("cand-nome").value = "";
  document.getElementById("cand-whatsapp").value = "";
  document.getElementById("cand-experiencia").value = "";
  document.getElementById("mensagem-candidatura").innerHTML = "";

  document.getElementById("modal-candidatura-fundo").style.display = "block";
}

function fecharModalCandidatura() {
  document.getElementById("modal-candidatura-fundo").style.display = "none";
}

async function enviarCandidatura() {
  if (!usuarioAtual || tipoUsuario !== "candidato") {
    alert("Faça login como candidato antes de se candidatar.");
    return;
  }

  const nome = document.getElementById("cand-nome").value.trim();
  const whatsapp = document.getElementById("cand-whatsapp").value.trim();
  const experiencia = document.getElementById("cand-experiencia").value.trim();

  if (!nome || !whatsapp || !experiencia) {
    alert("Preencha todos os campos da candidatura.");
    return;
  }

  if (!vagaSelecionada) {
    alert("Nenhuma vaga selecionada.");
    return;
  }

  try {
    await addDoc(collection(db, "Candidatos"), {
      Nome: nome,
      WhatsApp: whatsapp,
      Experiencia: experiencia,
      UsuarioId: usuarioAtual.uid,
      Vaga: vagaSelecionada.titulo,
      Empresa: vagaSelecionada.empresa,
      Cidade: vagaSelecionada.cidade,
      Status: "Enviado",
      Data: new Date()
    });

    document.getElementById("mensagem-candidatura").innerHTML = "Candidatura enviada com sucesso.";
    carregarMinhasCandidaturas();

    setTimeout(() => {
      fecharModalCandidatura();
    }, 1000);
  } catch (erro) {
    console.error("Erro ao enviar candidatura:", erro);
    alert("Erro ao enviar candidatura.");
  }
}

async function carregarMinhasCandidaturas() {
  const container = document.getElementById("minhas-candidaturas");

  if (!container) return;

  container.innerHTML = "Carregando...";

  if (!usuarioAtual) {
    container.innerHTML = "";
    return;
  }

  try {
    const snapshot = await getDocs(query(collection(db, "Candidatos"), orderBy("Data", "desc")));

    container.innerHTML = "";

    let encontrou = false;

    snapshot.forEach((docItem) => {
      const candidatura = docItem.data();

      if ((candidatura.UsuarioId || "") !== usuarioAtual.uid) return;

      encontrou = true;

      const status = candidatura.Status || "Enviado";

      const div = document.createElement("div");
      div.className = "vaga";

      div.innerHTML = `
        <h3>${candidatura.Vaga || ""}</h3>
        <p><strong>Empresa:</strong> ${candidatura.Empresa || ""}</p>
        <p><strong>Cidade:</strong> ${candidatura.Cidade || ""}</p>
        <p><strong>Status:</strong> ${status}</p>
      `;

      container.appendChild(div);
    });

    if (!encontrou) {
      container.innerHTML = "<p>Nenhuma candidatura encontrada.</p>";
    }
  } catch (erro) {
    console.error("Erro ao carregar candidaturas:", erro);
    container.innerHTML = "<p>Erro ao carregar candidaturas.</p>";
  }
}

function resetarInterfaces() {
  document.getElementById("empresa-auth").classList.remove("oculto");
  document.getElementById("empresa-logada-box").classList.add("oculto");
  document.getElementById("empresa-painel-conteudo").classList.add("oculto");

  document.getElementById("candidato-auth").classList.remove("oculto");
  document.getElementById("candidato-logado-box").classList.add("oculto");
  document.getElementById("candidato-painel").classList.add("oculto");
}

function escapeTexto(texto) {
  return String(texto)
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, " ");
}

carregarVagas();
