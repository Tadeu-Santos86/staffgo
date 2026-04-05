import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// CONFIG
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

// =========================
// CONTROLE GLOBAL
// =========================
let vagaEditandoId = null;
let empresaAtual = JSON.parse(localStorage.getItem("empresaAtual"));
let candidatoAtual = JSON.parse(localStorage.getItem("candidatoAtual"));

// =========================
// EMPRESA
// =========================
window.cadastrarEmpresa = async () => {
  const nome = document.getElementById("empresa-nome-cadastro").value;
  const email = document.getElementById("empresa-email").value;
  const senha = document.getElementById("empresa-senha").value;

  const ref = await addDoc(collection(db, "empresas"), {
    nome,
    email,
    senha
  });

  empresaAtual = { id: ref.id, nome };
  localStorage.setItem("empresaAtual", JSON.stringify(empresaAtual));

  alert("Empresa cadastrada!");
};

window.loginEmpresa = async () => {
  const email = document.getElementById("empresa-email").value;
  const senha = document.getElementById("empresa-senha").value;

  const snapshot = await getDocs(collection(db, "empresas"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    if (data.email === email && data.senha === senha) {
      empresaAtual = { id: docSnap.id, nome: data.nome };
      localStorage.setItem("empresaAtual", JSON.stringify(empresaAtual));
      location.reload();
    }
  });
};

window.logoutEmpresa = () => {
  localStorage.removeItem("empresaAtual");
  location.reload();
};

// =========================
// EDITAR EMPRESA
// =========================
window.editarEmpresa = async () => {
  const novoNome = prompt("Novo nome da empresa:", empresaAtual.nome);

  if (!novoNome) return;

  await updateDoc(doc(db, "empresas", empresaAtual.id), {
    nome: novoNome
  });

  empresaAtual.nome = novoNome;
  localStorage.setItem("empresaAtual", JSON.stringify(empresaAtual));

  alert("Empresa atualizada!");
  location.reload();
};

// =========================
// VAGAS
// =========================
window.salvarOuAtualizarVaga = async () => {
  const titulo = document.getElementById("titulo").value;
  const empresa = document.getElementById("empresa").value;
  const cidade = document.getElementById("cidade").value;
  const salario = document.getElementById("salario").value;
  const descricao = document.getElementById("descricao").value;

  if (vagaEditandoId) {
    await updateDoc(doc(db, "vagas", vagaEditandoId), {
      titulo,
      empresa,
      cidade,
      salario,
      descricao
    });

    alert("Vaga atualizada!");
    vagaEditandoId = null;
  } else {
    await addDoc(collection(db, "vagas"), {
      titulo,
      empresa,
      cidade,
      salario,
      descricao,
      empresaId: empresaAtual.id
    });

    alert("Vaga criada!");
  }

  location.reload();
};

window.editarVaga = (vaga) => {
  document.getElementById("titulo").value = vaga.titulo;
  document.getElementById("empresa").value = vaga.empresa;
  document.getElementById("cidade").value = vaga.cidade;
  document.getElementById("salario").value = vaga.salario;
  document.getElementById("descricao").value = vaga.descricao;

  vagaEditandoId = vaga.id;
};

// =========================
// LISTAR VAGAS EMPRESA
// =========================
async function carregarVagasEmpresa() {
  if (!empresaAtual) return;

  const container = document.getElementById("vagas-empresa");
  if (!container) return;

  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "vagas"));

  snapshot.forEach(docSnap => {
    const vaga = docSnap.data();

    if (vaga.empresaId === empresaAtual.id) {
      const div = document.createElement("div");
      div.className = "vaga";

      div.innerHTML = `
        <h3>${vaga.titulo}</h3>
        <p><strong>Cidade:</strong> ${vaga.cidade}</p>
        <p><strong>Salário:</strong> ${vaga.salario}</p>
        <div class="actions">
          <button onclick='editarVaga(${JSON.stringify({ ...vaga, id: docSnap.id })})'>Editar</button>
        </div>
      `;

      container.appendChild(div);
    }
  });
}

// =========================
// CANDIDATO
// =========================
window.cadastrarCandidato = async () => {
  const nome = document.getElementById("cand-nome-cadastro").value;
  const email = document.getElementById("cand-email").value;
  const senha = document.getElementById("cand-senha").value;

  const ref = await addDoc(collection(db, "candidatos"), {
    nome,
    email,
    senha
  });

  candidatoAtual = { id: ref.id, nome };
  localStorage.setItem("candidatoAtual", JSON.stringify(candidatoAtual));

  alert("Candidato cadastrado!");
};

window.loginCandidato = async () => {
  const email = document.getElementById("cand-email").value;
  const senha = document.getElementById("cand-senha").value;

  const snapshot = await getDocs(collection(db, "candidatos"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    if (data.email === email && data.senha === senha) {
      candidatoAtual = { id: docSnap.id, nome: data.nome };
      localStorage.setItem("candidatoAtual", JSON.stringify(candidatoAtual));
      location.reload();
    }
  });
};

window.logoutCandidato = () => {
  localStorage.removeItem("candidatoAtual");
  location.reload();
};

// =========================
// EDITAR CANDIDATO
// =========================
window.editarCandidato = async () => {
  const novoNome = prompt("Novo nome:", candidatoAtual.nome);

  if (!novoNome) return;

  await updateDoc(doc(db, "candidatos", candidatoAtual.id), {
    nome: novoNome
  });

  candidatoAtual.nome = novoNome;
  localStorage.setItem("candidatoAtual", JSON.stringify(candidatoAtual));

  alert("Dados atualizados!");
  location.reload();
};

// =========================
// INIT
// =========================
window.onload = () => {
  if (empresaAtual) {
    document.getElementById("empresa-logada-box")?.classList.remove("oculto");
    document.getElementById("empresa-painel-conteudo")?.classList.remove("oculto");
    document.getElementById("empresa-logada-nome").innerText = empresaAtual.nome;
    carregarVagasEmpresa();
  }

  if (candidatoAtual) {
    document.getElementById("candidato-logado-box")?.classList.remove("oculto");
    document.getElementById("candidato-painel")?.classList.remove("oculto");
    document.getElementById("candidato-logado-nome").innerText = candidatoAtual.nome;
  }
};
