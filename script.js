import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

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

let vagaSelecionada = null;

window.abrirSecao = abrirSecao;
window.cadastrarVaga = cadastrarVaga;
window.compartilhar = compartilhar;
window.carregarVagas = carregarVagas;
window.abrirModalCandidatura = abrirModalCandidatura;
window.fecharModalCandidatura = fecharModalCandidatura;
window.enviarCandidatura = enviarCandidatura;

function abrirSecao(id) {
  document.getElementById("secao-vagas").style.display = "none";
  document.getElementById("secao-empresa").style.display = "none";

  document.getElementById(id).style.display = "block";

  if (id === "secao-vagas") {
    carregarVagas();
  }
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
        <div class="acoes-vaga">
          <button onclick="compartilhar('${titulo}')">Compartilhar vaga</button>
          <button onclick="abrirModalCandidatura('${titulo}', '${empresa}', '${cidade}')">Candidatar-se</button>
        </div>
      `;

      container.appendChild(div);
    });
  } catch (erro) {
    console.error("Erro ao carregar vagas:", erro);
    mensagem.innerHTML = "Erro ao carregar vagas. Verifique as regras do Firestore e os nomes dos campos.";
  }
}

async function cadastrarVaga() {
  const titulo = document.getElementById("titulo").value.trim();
  const empresa = document.getElementById("empresa").value.trim();
  const cidade = document.getElementById("cidade").value.trim();
  const salario = document.getElementById("salario").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const mensagem = document.getElementById("mensagem-empresa");

  if (!titulo || !empresa || !cidade || !salario || !descricao) {
    alert("Preencha todos os campos da vaga.");
    return;
  }

  mensagem.innerHTML = "Salvando vaga...";

  try {
    await addDoc(collection(db, "Vagas"), {
      Titulo: titulo,
      Empresa: empresa,
      Cidade: cidade,
      Salario: salario,
      Descrição: descricao,
      Data: new Date()
    });

    document.getElementById("titulo").value = "";
    document.getElementById("empresa").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("salario").value = "";
    document.getElementById("descricao").value = "";

    mensagem.innerHTML = "Vaga cadastrada com sucesso.";
    abrirSecao("secao-vagas");
  } catch (erro) {
    console.error("Erro ao salvar vaga:", erro);
    mensagem.innerHTML = "Erro ao salvar vaga. Verifique as regras do Firestore.";
  }
}

function compartilhar(titulo) {
  const texto = `Olha essa vaga no StaffGo: ${titulo}`;
  navigator.clipboard.writeText(texto);
  alert("Texto copiado para compartilhar.");
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
      Data: new Date()
    });

    mensagem.innerHTML = "Candidatura enviada com sucesso.";

    setTimeout(() => {
      fecharModalCandidatura();
    }, 1200);
  } catch (erro) {
    console.error("Erro ao enviar candidatura:", erro);
    mensagem.innerHTML = "Erro ao enviar candidatura. Verifique as regras do Firestore.";
  }
}
