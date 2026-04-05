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
let dadosCandidatoAtual = {};
let todasAsVagas = [];
let acessoLiberado = false;
let vagaEditandoId = null;

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

  const perfilNome = document.getElementById("perfil-cand-nome");
  const perfilWhatsApp = document.getElementById("perfil-cand-whatsapp");
  const perfilExperiencia = document.getElementById("perfil-cand-experiencia");

  if (perfilNome) perfilNome.value = dadosCandidatoAtual.Nome || "";
  if (perfilWhatsApp) perfilWhatsApp.value = dadosCandidatoAtual.WhatsApp || "";
  if (perfilExperiencia) perfilExperiencia.value = dadosCandidatoAtual.Experiencia || "";

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

async function cadastrarEmpresa() {
  const nome = document.getElementById("empresa-nome-cadastro").value.trim();
  const email = document.getElementById("empresa-email").value.trim();
  const senha = document.getElementById("empresa-senha").value.trim();

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
  const email = document.getElementById("empresa-email").value.trim();
  const senha = document.getElementById("empresa-senha").value.trim();

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
    vagaEditandoId = null;
  } catch (erro) {
    console.error("Erro ao sair:", erro);
    alert("Erro ao sair.");
  }
}

async function cadastrarCandidato() {
  const nome = document.getElementById("cand-nome-cadastro").value.trim();
  const email = document.getElementById("cand-email").value.trim();
  const senha = document.getElementById("cand-senha").value.trim();

  if (!nome || !email || !senha) {
    alert("Preencha nome, e-mail e senha.");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    await setDoc(doc(db, "Usuarios", cred.user.uid), {
      Nome: nome,
      Email: email,
      WhatsApp: "",
      Experiencia: ""
    });

    document.getElementById("mensagem-candidato-auth").innerHTML = "Candidato cadastrado com sucesso.";
  } catch (erro) {
    console.error("Erro ao cadastrar candidato:", erro);
    alert("Erro ao cadastrar candidato.");
  }
}

async function loginCandidato() {
  const email = document.getElementById("cand-email").value.trim();
  const senha = document.getElementById("cand-senha").value.trim();

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

async function salvarPerfilCandidato() {
  if (!usuarioAtual || tipoUsuario !== "candidato") {
    alert("Faça login como candidato.");
    return;
  }

  const nome = document.getElementById("perfil-cand-nome").value.trim();
  const whatsapp = document.getElementById("perfil-cand-whatsapp").value.trim();
  const experiencia = document.getElementById("perfil-cand-experiencia").value.trim();

  if (!nome) {
    alert("Preencha pelo menos o nome.");
    return;
  }

  try {
    await updateDoc(doc(db, "Usuarios", usuarioAtual.uid), {
      Nome: nome,
      WhatsApp: whatsapp,
      Experiencia: experiencia
    });

    dadosCandidatoAtual.Nome = nome;
    dadosCandidatoAtual.WhatsApp = whatsapp;
    dadosCandidatoAtual.Experiencia = experiencia;

    document.getElementById("candidato-logado-nome").textContent = nome;
    document.getElementById("mensagem-perfil-candidato").innerHTML = "Perfil atualizado com sucesso.";
  } catch (erro) {
    console.error("Erro ao salvar perfil do candidato:", erro);
    document.getElementById("mensagem-perfil-candidato").innerHTML = "Erro ao salvar perfil.";
  }
}

async function salvarOuAtualizarVaga() {
  if (!usuarioAtual || tipoUsuario !== "empresa") {
    alert("Faça login como empresa.");
    return;
  }

  const titulo = document.getElementById("titulo").value.trim();
  const empresa = document.getElementById("empresa").value.trim();
  const cidade = document.getElementById("cidade").value.trim();
  const salario = document.getElementById("salario").value.trim();
  const descricao = document.getElementById("descricao").value.trim();

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
        Descrição: descricao
      });

      document.getElementById("mensagem-empresa").innerHTML = "Vaga atualizada com sucesso.";
      vagaEditandoId = null;
    } else {
      await addDoc(collection(db, "Vagas"), {
        Titulo: titulo,
        Empresa: empresa,
        Cidade: cidade,
        Salario: salario,
        Descrição: descricao,
        EmpresaId: usuarioAtual.uid,
        EmpresaNome: nomeEmpresaAtual,
        Data: new Date()
      });

      document.getElementById("mensagem-empresa").innerHTML = "Vaga cadastrada com sucesso.";
    }

    document.getElementById("titulo").value = "";
    document.getElementById("empresa").value = nomeEmpresaAtual || "";
    document.getElementById("cidade").value = "";
    document.getElementById("salario").value = "";
    document.getElementById("descricao").value = "";

    carregarVagasEmpresa();
    carregarVagas();
  } catch (erro) {
    console.error("Erro ao salvar vaga:", erro);
    alert("Erro ao salvar vaga.");
  }
}

function editarVaga(id, titulo, empresa, cidade, salario, descricao) {
  document.getElementById("titulo").value = titulo;
  document.getElementById("empresa").value = empresa;
  document.getElementById("cidade").value = cidade;
  document.getElementById("salario").value = salario;
  document.getElementById("descricao").value = descricao;

  vagaEditandoId = id;

  document.getElementById("mensagem-empresa").innerHTML = "Modo edição ativado. Altere os dados e clique em Salvar vaga.";
  abrirSecao("secao-empresa");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function carregarVagas() {
  const mensagem = document.getElementById("mensagem-vagas");
  if (mensagem) mensagem.innerHTML = "Carregando vagas...";

  try {
    const snapshot = await getDocs(query(collection(db, "Vagas"), orderBy("Data", "desc")));

    todasAsVagas = [];

    snapshot.forEach((docItem) => {
      todasAsVagas.push({
        id: docItem.id,
        ...docItem.data()
      });
    });

    renderizarVagasFiltradas();
  } catch (erro) {
    console.error("Erro ao carregar vagas:", erro);
    if (mensagem) mensagem.innerHTML = "Erro ao carregar vagas.";
  }
}

function renderizarVagasFiltradas() {
  const container = document.getElementById("vagas");
  const mensagem = document.getElementById("mensagem-vagas");

  const filtroTitulo = (document.getElementById("filtro-titulo")?.value || "").trim().toLowerCase();
  const filtroCidade = (document.getElementById("filtro-cidade")?.value || "").trim().toLowerCase();

  container.innerHTML = "";

  const vagasFiltradas = todasAsVagas.filter((vaga) => {
    const titulo = String(vaga.Titulo || "").toLowerCase();
    const cidade = String(vaga.Cidade || "").toLowerCase();

    const atendeTitulo = !filtroTitulo || titulo.includes(filtroTitulo);
    const atendeCidade = !filtroCidade || cidade.includes(filtroCidade);

    return atendeTitulo && atendeCidade;
  });

  if (vagasFiltradas.length === 0) {
    if (mensagem) mensagem.innerHTML = "Nenhuma vaga encontrada com esse filtro.";
    return;
  }

  if (mensagem) mensagem.innerHTML = `${vagasFiltradas.length} vaga(s) encontrada(s).`;

  vagasFiltradas.forEach((vaga) => {
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

      <button class="acao-candidato"
        onclick="verificarAcesso('${encodeURIComponent(titulo)}','${encodeURIComponent(empresa)}','${encodeURIComponent(cidade)}')">
        Candidatar-se
      </button>

      <button class="acao-neutra"
        onclick="compartilharVaga('${encodeURIComponent(titulo)}')">
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
  }).catch(() => {
    acessoLiberado = true;
    alert("Não consegui copiar automaticamente, mas a candidatura foi liberada.");
  });
}

async function carregarVagasEmpresa() {
  const container = document.getElementById("vagas-empresa");
  const mensagem = document.getElementById("mensagem-vagas-empresa");

  container.innerHTML = "";
  mensagem.innerHTML = "Carregando vagas da empresa...";

  if (!usuarioAtual || tipoUsuario !== "empresa") {
    mensagem.innerHTML = "Faça login como empresa.";
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

      const titulo = vaga.Titulo || "";
      const cidade = vaga.Cidade || "";
      const salario = vaga.Salario || "";
      const descricao = vaga.Descrição || "";

      const div = document.createElement("div");
      div.className = "vaga";

      div.innerHTML = `
        <h3>${titulo}</h3>
        <p><strong>Cidade:</strong> ${cidade}</p>
        <p><strong>Salário:</strong> ${salario}</p>
        <div class="actions">
          <button class="acao-candidato" onclick="verCandidatosDaVaga('${escapeTexto(titulo)}')">Ver candidatos</button>
          <button class="acao-empresa" onclick="editarVaga('${docItem.id}','${escapeTexto(titulo)}','${escapeTexto(nomeEmpresaAtual)}','${escapeTexto(cidade)}','${escapeTexto(salario)}','${escapeTexto(descricao)}')">Editar vaga</button>
        </div>
      `;

      container.appendChild(div);
    });

    mensagem.innerHTML = encontrou ? "" : "Nenhuma vaga sua cadastrada.";
  } catch (erro) {
    console.error("Erro ao carregar vagas da empresa:", erro);
    mensagem.innerHTML = "Erro ao carregar vagas da empresa.";
  }
}

function abrirModalCandidatura(titulo, empresa, cidade) {
  vagaSelecionada = { titulo, empresa, cidade };

  document.getElementById("cand-nome").value = dadosCandidatoAtual.Nome || "";
  document.getElementById("cand-whatsapp").value = dadosCandidatoAtual.WhatsApp || "";
  document.getElementById("cand-experiencia").value = dadosCandidatoAtual.Experiencia || "";

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
    await updateDoc(doc(db, "Usuarios", usuarioAtual.uid), {
      Nome: nome,
      WhatsApp: whatsapp,
      Experiencia: experiencia
    });

    dadosCandidatoAtual.Nome = nome;
    dadosCandidatoAtual.WhatsApp = whatsapp;
    dadosCandidatoAtual.Experiencia = experiencia;
    document.getElementById("candidato-logado-nome").textContent = nome;

    const perfilNome = document.getElementById("perfil-cand-nome");
    const perfilWhatsApp = document.getElementById("perfil-cand-whatsapp");
    const perfilExperiencia = document.getElementById("perfil-cand-experiencia");

    if (perfilNome) perfilNome.value = nome;
    if (perfilWhatsApp) perfilWhatsApp.value = whatsapp;
    if (perfilExperiencia) perfilExperiencia.value = experiencia;

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

  if (!usuarioAtual || tipoUsuario !== "candidato") {
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

async function verCandidatosDaVaga(tituloVaga) {
  const lista = document.getElementById("lista-candidatos");
  const mensagem = document.getElementById("mensagem-candidatos");

  lista.innerHTML = "";
  mensagem.innerHTML = "Carregando candidatos...";
  document.getElementById("modal-candidatos-fundo").style.display = "block";

  if (!usuarioAtual || tipoUsuario !== "empresa") {
    mensagem.innerHTML = "Faça login como empresa.";
    return;
  }

  try {
    const vagasSnap = await getDocs(query(collection(db, "Vagas"), orderBy("Data", "desc")));
    let vagaPertenceEmpresa = false;

    vagasSnap.forEach((docItem) => {
      const vaga = docItem.data();
      if ((vaga.Titulo || "") === tituloVaga && (vaga.EmpresaId || "") === usuarioAtual.uid) {
        vagaPertenceEmpresa = true;
      }
    });

    if (!vagaPertenceEmpresa) {
      mensagem.innerHTML = "Essa vaga não pertence à empresa logada.";
      return;
    }

    const candSnap = await getDocs(query(collection(db, "Candidatos"), orderBy("Data", "desc")));

    lista.innerHTML = "";
    let encontrou = false;

    candSnap.forEach((docItem) => {
      const c = docItem.data();

      if ((c.Vaga || "") !== tituloVaga) return;
      if ((c.Empresa || "") !== nomeEmpresaAtual) return;

      encontrou = true;
      const statusAtual = c.Status || "Enviado";

      const div = document.createElement("div");
      div.className = "candidato";

      div.innerHTML = `
        <h3>${c.Nome || ""}</h3>
        <p><strong>WhatsApp:</strong> ${c.WhatsApp || ""}</p>
        <p><strong>Experiência:</strong> ${c.Experiencia || ""}</p>
        <p><strong>Status atual:</strong> ${statusAtual}</p>

        <div class="linha-status">
          <select id="status-${docItem.id}">
            <option value="Enviado" ${statusAtual === "Enviado" ? "selected" : ""}>Enviado</option>
            <option value="Em análise" ${statusAtual === "Em análise" ? "selected" : ""}>Em análise</option>
            <option value="Entrevista" ${statusAtual === "Entrevista" ? "selected" : ""}>Entrevista</option>
            <option value="Aprovado" ${statusAtual === "Aprovado" ? "selected" : ""}>Aprovado</option>
            <option value="Reprovado" ${statusAtual === "Reprovado" ? "selected" : ""}>Reprovado</option>
          </select>
          <button class="acao-empresa" onclick="atualizarStatusCandidatura('${docItem.id}')">Salvar status</button>
        </div>
      `;

      lista.appendChild(div);
    });

    mensagem.innerHTML = encontrou ? "" : "Nenhum candidato encontrado para essa vaga.";
  } catch (erro) {
    console.error("Erro ao carregar candidatos da vaga:", erro);
    mensagem.innerHTML = "Erro ao carregar candidatos.";
  }
}

async function atualizarStatusCandidatura(candidaturaId) {
  try {
    const select = document.getElementById(`status-${candidaturaId}`);
    const novoStatus = select.value;

    await updateDoc(doc(db, "Candidatos", candidaturaId), {
      Status: novoStatus
    });

    document.getElementById("mensagem-candidatos").innerHTML = "Status atualizado com sucesso.";
    carregarMinhasCandidaturas();
  } catch (erro) {
    console.error("Erro ao atualizar status:", erro);
    document.getElementById("mensagem-candidatos").innerHTML = "Erro ao atualizar status.";
  }
}

function fecharModalCandidatos() {
  document.getElementById("modal-candidatos-fundo").style.display = "none";
}

function escapeTexto(texto) {
  return String(texto)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, " ");
}

carregarVagas();
