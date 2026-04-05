import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
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
let vagaEditandoId = null;
let usuarioEmpresaAtual = null;
let nomeEmpresaAtual = "";

window.abrirSecao = abrirSecao;
window.salvarOuAtualizarVaga = salvarOuAtualizarVaga;
window.carregarVagas = carregarVagas;
window.carregarVagasEmpresa = carregarVagasEmpresa;
window.compartilhar = compartilhar;
window.abrirModalCandidatura = abrirModalCandidatura;
window.fecharModalCandidatura = fecharModalCandidatura;
window.enviarCandidatura = enviarCandidatura;
window.editarVaga = editarVaga;
window.excluirVaga = excluirVaga;
window.verCandidatos = verCandidatos;
window.fecharModalCandidatos = fecharModalCandidatos;
window.limparFormularioVaga = limparFormularioVaga;
window.cadastrarEmpresa = cadastrarEmpresa;
window.loginEmpresa = loginEmpresa;
window.logoutEmpresa = logoutEmpresa;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    usuarioEmpresaAtual = user;
    await carregarDadosEmpresa(user.uid);
    aplicarEstadoEmpresaLogada();
  } else {
    usuarioEmpresaAtual = null;
    nomeEmpresaAtual = "";
    aplicarEstadoDeslogado();
  }
});

async function carregarDadosEmpresa(uid) {
  try {
    const empresaRef = doc(db, "Empresas", uid);
    const empresaSnap = await getDoc(empresaRef);

    if (empresaSnap.exists()) {
      const dados = empresaSnap.data();
      nomeEmpresaAtual = dados.Nome || "";
    } else {
      nomeEmpresaAtual = "";
    }
  } catch (erro) {
    console.error("Erro ao carregar dados da empresa:", erro);
    nomeEmpresaAtual = "";
  }
}

function abrirSecao(id) {
  document.getElementById("secao-vagas").style.display = "none";
  document.getElementById("secao-empresa").style.display = "none";

  document.getElementById(id).style.display = "block";

  if (id === "secao-vagas") {
    carregarVagas();
  }

  if (id === "secao-empresa") {
    if (usuarioEmpresaAtual) {
      aplicarEstadoEmpresaLogada();
    } else {
      aplicarEstadoDeslogado();
    }
  }
}

function aplicarEstadoEmpresaLogada() {
  document.getElementById("empresa-auth").classList.add("oculto");
  document.getElementById("empresa-logada-box").classList.remove("oculto");
  document.getElementById("empresa-painel-conteudo").classList.remove("oculto");

  document.getElementById("empresa-logada-email").textContent = usuarioEmpresaAtual?.email || "-";
  document.getElementById("empresa-logada-nome").textContent = nomeEmpresaAtual || "Empresa";

  document.getElementById("empresa").value = nomeEmpresaAtual || "";

  carregarVagasEmpresa();
}

function aplicarEstadoDeslogado() {
  document.getElementById("empresa-auth").classList.remove("oculto");
  document.getElementById("empresa-logada-box").classList.add("oculto");
  document.getElementById("empresa-painel-conteudo").classList.add("oculto");
  document.getElementById("mensagem-auth").innerHTML = "";
}

async function cadastrarEmpresa() {
  const nome = document.getElementById("empresa-nome-cadastro").value.trim();
  const email = document.getElementById("empresa-email").value.trim();
  const senha = document.getElementById("empresa-senha").value.trim();
  const mensagem = document.getElementById("mensagem-auth");

  if (!nome || !email || !senha) {
    alert("Preencha nome da empresa, e-mail e senha.");
    return;
  }

  mensagem.innerHTML = "Cadastrando empresa...";

  try {
    const credencial = await createUserWithEmailAndPassword(auth, email, senha);

    await setDoc(doc(db, "Empresas", credencial.user.uid), {
      Nome: nome,
      Email: email,
      EmpresaId: credencial.user.uid,
      Data: new Date()
    });

    nomeEmpresaAtual = nome;
    mensagem.innerHTML = "Empresa cadastrada com sucesso.";
    limparCamposAuth();
  } catch (erro) {
    console.error("Erro ao cadastrar empresa:", erro);
    mensagem.innerHTML = traduzirErroAuth(erro.code);
  }
}

async function loginEmpresa() {
  const email = document.getElementById("empresa-email").value.trim();
  const senha = document.getElementById("empresa-senha").value.trim();
  const mensagem = document.getElementById("mensagem-auth");

  if (!email || !senha) {
    alert("Preencha e-mail e senha.");
    return;
  }

  mensagem.innerHTML = "Entrando...";

  try {
    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    await carregarDadosEmpresa(credencial.user.uid);
    mensagem.innerHTML = "Login realizado com sucesso.";
    limparCamposAuth();
  } catch (erro) {
    console.error("Erro ao entrar:", erro);
    mensagem.innerHTML = traduzirErroAuth(erro.code);
  }
}

async function logoutEmpresa() {
  try {
    await signOut(auth);
    limparFormularioVaga();
  } catch (erro) {
    console.error("Erro ao sair:", erro);
    alert("Erro ao sair.");
  }
}

function limparCamposAuth() {
  document.getElementById("empresa-nome-cadastro").value = "";
  document.getElementById("empresa-email").value = "";
  document.getElementById("empresa-senha").value = "";
}

function traduzirErroAuth(codigo) {
  const mapa = {
    "auth/email-already-in-use": "Esse e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "Senha fraca. Use pelo menos 6 caracteres.",
    "auth/invalid-credential": "E-mail ou senha inválidos.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta."
  };

  return mapa[codigo] || "Ocorreu um erro no login/cadastro.";
}

async function carregarVagas() {
  const container = document.getElementById("vagas");
  const mensagem = document.getElementById("mensagem-vagas");

  container.innerHTML = "";
  mensagem.innerHTML = "Carregando vagas...";

  try {
    const vagasRef = collection(db, "Vagas");
    const q = query(vagasRef, orderBy("Data", "desc"));
    const snapshot = await getDocs(q);

    container.innerHTML = "";

    if (snapshot.empty) {
      mensagem.innerHTML = "Nenhuma vaga cadastrada no momento.";
      return;
    }

    mensagem.innerHTML = "";

    snapshot.forEach((docItem) => {
      const vaga = docItem.data();

      const titulo = vaga.Titulo || "";
      const empresa = vaga.Empresa || "";
      const cidade = vaga.Cidade || "";
      const salario = vaga.Salario || "";
      const descricao = vaga.Descrição || "";

      const div = document.createElement("div");
      div.className = "vaga";

      div.innerHTML = `
        <h3>${titulo}</h3>
        <p><strong>Empresa:</strong> ${empresa}</p>
        <p><strong>Cidade:</strong> ${cidade}</p>
        <p><strong>Salário:</strong> ${salario}</p>
        <p><strong>Descrição:</strong> ${descricao}</p>
        <div class="acoes-vaga">
          <button onclick="compartilhar('${escapeTexto(titulo)}')">Compartilhar vaga</button>
          <button onclick="abrirModalCandidatura('${escapeTexto(titulo)}', '${escapeTexto(empresa)}', '${escapeTexto(cidade)}', '${escapeTexto(vaga.EmpresaId || "")}')">Candidatar-se</button>
        </div>
      `;

      container.appendChild(div);
    });
  } catch (erro) {
    console.error("Erro ao carregar vagas:", erro);
    mensagem.innerHTML = "Erro ao carregar vagas.";
  }
}

async function carregarVagasEmpresa() {
  const container = document.getElementById("vagas-empresa");
  const mensagem = document.getElementById("mensagem-vagas-empresa");

  container.innerHTML = "";
  mensagem.innerHTML = "Carregando vagas da empresa...";

  if (!usuarioEmpresaAtual) {
    mensagem.innerHTML = "Faça login para ver suas vagas.";
    return;
  }

  try {
    const vagasRef = collection(db, "Vagas");
    const q = query(vagasRef, orderBy("Data", "desc"));
    const snapshot = await getDocs(q);

    container.innerHTML = "";

    let encontrou = false;

    snapshot.forEach((docItem) => {
      const vaga = docItem.data();
      const vagaId = docItem.id;

      if ((vaga.EmpresaId || "") !== usuarioEmpresaAtual.uid) {
        return;
      }

      encontrou = true;

      const titulo = vaga.Titulo || "";
      const empresa = vaga.Empresa || "";
      const cidade = vaga.Cidade || "";
      const salario = vaga.Salario || "";
      const descricao = vaga.Descrição || "";

      const div = document.createElement("div");
      div.className = "vaga";

      div.innerHTML = `
        <h3>${titulo}</h3>
        <p><strong>Empresa:</strong> ${empresa}</p>
        <p><strong>Cidade:</strong> ${cidade}</p>
        <p><strong>Salário:</strong> ${salario}</p>
        <p><strong>Descrição:</strong> ${descricao}</p>
        <div class="acoes-vaga">
          <button class="botao-secundario" onclick="editarVaga('${vagaId}', '${escapeTexto(titulo)}', '${escapeTexto(empresa)}', '${escapeTexto(cidade)}', '${escapeTexto(salario)}', '${escapeTexto(descricao)}')">Editar informações</button>
          <button onclick="verCandidatos('${escapeTexto(titulo)}')">Ver candidatos</button>
          <button class="botao-alerta" onclick="excluirVaga('${vagaId}')">Excluir vaga</button>
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

async function salvarOuAtualizarVaga() {
  if (!usuarioEmpresaAtual) {
    alert("Faça login da empresa para cadastrar ou editar vagas.");
    return;
  }

  const titulo = document.getElementById("titulo").value.trim();
  const empresa = document.getElementById("empresa").value.trim() || nomeEmpresaAtual || "Empresa";
  const cidade = document.getElementById("cidade").value.trim();
  const salario = document.getElementById("salario").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const mensagem = document.getElementById("mensagem-empresa");

  if (!titulo || !empresa || !cidade || !salario || !descricao) {
    alert("Preencha todos os campos da vaga.");
    return;
  }

  mensagem.innerHTML = vagaEditandoId ? "Atualizando vaga..." : "Salvando vaga...";

  try {
    if (vagaEditandoId) {
      const vagaRef = doc(db, "Vagas", vagaEditandoId);

      await updateDoc(vagaRef, {
        Titulo: titulo,
        Empresa: empresa,
        Cidade: cidade,
        Salario: salario,
        Descrição: descricao,
        Data: new Date(),
        EmpresaId: usuarioEmpresaAtual.uid,
        EmpresaEmail: usuarioEmpresaAtual.email || "",
        EmpresaNome: nomeEmpresaAtual || empresa
      });

      mensagem.innerHTML = "Vaga atualizada com sucesso.";
      vagaEditandoId = null;
    } else {
      await addDoc(collection(db, "Vagas"), {
        Titulo: titulo,
        Empresa: empresa,
        Cidade: cidade,
        Salario: salario,
        Descrição: descricao,
        Data: new Date(),
        EmpresaId: usuarioEmpresaAtual.uid,
        EmpresaEmail: usuarioEmpresaAtual.email || "",
        EmpresaNome: nomeEmpresaAtual || empresa
      });

      mensagem.innerHTML = "Vaga cadastrada com sucesso.";
    }

    limparFormularioVaga();
    carregarVagasEmpresa();
    abrirSecao("secao-empresa");
  } catch (erro) {
    console.error("Erro ao salvar/atualizar vaga:", erro);
    mensagem.innerHTML = "Erro ao salvar ou atualizar vaga.";
  }
}

function editarVaga(id, titulo, empresa, cidade, salario, descricao) {
  vagaEditandoId = id;

  document.getElementById("titulo").value = titulo;
  document.getElementById("empresa").value = empresa;
  document.getElementById("cidade").value = cidade;
  document.getElementById("salario").value = salario;
  document.getElementById("descricao").value = descricao;

  document.getElementById("mensagem-empresa").innerHTML = "Modo edição ativado. Altere os campos e clique em Salvar vaga.";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function excluirVaga(vagaId) {
  const confirmar = confirm("Tem certeza que deseja excluir esta vaga?");
  if (!confirmar) return;

  try {
    await deleteDoc(doc(db, "Vagas", vagaId));
    carregarVagasEmpresa();
  } catch (erro) {
    console.error("Erro ao excluir vaga:", erro);
    alert("Erro ao excluir vaga.");
  }
}

function limparFormularioVaga() {
  document.getElementById("titulo").value = "";
  document.getElementById("empresa").value = nomeEmpresaAtual || "";
  document.getElementById("cidade").value = "";
  document.getElementById("salario").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("mensagem-empresa").innerHTML = "";
  vagaEditandoId = null;
}

function compartilhar(titulo) {
  const texto = `Olha essa vaga no StaffGo: ${titulo}`;
  navigator.clipboard.writeText(texto);
  alert("Texto copiado para compartilhar.");
}

function abrirModalCandidatura(titulo, empresa, cidade, empresaId) {
  vagaSelecionada = { titulo, empresa, cidade, empresaId };

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
  const nome = document.getElementById("cand-nome").value.trim();
  const whatsapp = document.getElementById("cand-whatsapp").value.trim();
  const experiencia = document.getElementById("cand-experiencia").value.trim();
  const mensagem = document.getElementById("mensagem-candidatura");

  if (!nome || !whatsapp || !experiencia) {
    alert("Preencha todos os campos da candidatura.");
    return;
  }

  if (!vagaSelecionada) {
    alert("Nenhuma vaga selecionada.");
    return;
  }

  mensagem.innerHTML = "Enviando candidatura...";

  try {
    await addDoc(collection(db, "Candidatos"), {
      Nome: nome,
      WhatsApp: whatsapp,
      Experiencia: experiencia,
      Vaga: vagaSelecionada.titulo,
      Empresa: vagaSelecionada.empresa,
      Cidade: vagaSelecionada.cidade,
      VagaEmpresaId: vagaSelecionada.empresaId || "",
      Data: new Date()
    });

    mensagem.innerHTML = "Candidatura enviada com sucesso.";

    setTimeout(() => {
      fecharModalCandidatura();
    }, 1200);
  } catch (erro) {
    console.error("Erro ao enviar candidatura:", erro);
    mensagem.innerHTML = "Erro ao enviar candidatura.";
  }
}

async function verCandidatos(tituloVaga) {
  const container = document.getElementById("lista-candidatos");
  const mensagem = document.getElementById("mensagem-candidatos");

  container.innerHTML = "";
  mensagem.innerHTML = "Carregando candidatos...";
  document.getElementById("modal-candidatos-fundo").style.display = "block";

  if (!usuarioEmpresaAtual) {
    mensagem.innerHTML = "Faça login para ver candidatos.";
    return;
  }

  try {
    const candidatosRef = collection(db, "Candidatos");
    const q = query(candidatosRef, orderBy("Data", "desc"));
    const snapshot = await getDocs(q);

    container.innerHTML = "";

    let encontrou = false;

    snapshot.forEach((docItem) => {
      const candidato = docItem.data();

      const mesmaVaga = (candidato.Vaga || "") === tituloVaga;
      const mesmaEmpresa = (candidato.VagaEmpresaId || "") === usuarioEmpresaAtual.uid;

      if (mesmaVaga && mesmaEmpresa) {
        encontrou = true;

        const nome = candidato.Nome || "";
        const whatsapp = candidato.WhatsApp || "";
        const experiencia = candidato.Experiencia || "";
        const vaga = candidato.Vaga || "";

        const telefoneLimpo = String(whatsapp).replace(/\D/g, "");
        const linkWhatsApp = `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(
          "Olá, vi sua candidatura para a vaga de " + vaga + " no StaffGo."
        )}`;

        const div = document.createElement("div");
        div.className = "candidato";

        div.innerHTML = `
          <h3>${nome}</h3>
          <p><strong>WhatsApp:</strong> ${whatsapp}</p>
          <p><strong>Experiência:</strong> ${experiencia}</p>
          <div class="acoes-candidato">
            <button onclick="window.open('${linkWhatsApp}', '_blank')">Chamar no WhatsApp</button>
          </div>
        `;

        container.appendChild(div);
      }
    });

    mensagem.innerHTML = encontrou ? "" : "Nenhum candidato encontrado para esta vaga.";
  } catch (erro) {
    console.error("Erro ao carregar candidatos:", erro);
    mensagem.innerHTML = "Erro ao carregar candidatos.";
  }
}

function fecharModalCandidatos() {
  document.getElementById("modal-candidatos-fundo").style.display = "none";
}

function escapeTexto(texto) {
  return String(texto)
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, " ");
}
