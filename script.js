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

window.abrirSecao = abrirSecao;
window.cadastrarVaga = cadastrarVaga;
window.compartilhar = compartilhar;
window.carregarVagas = carregarVagas;

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

      div.innerHTML = `
        <h3>${vaga.Titulo || ""}</h3>
        <p><strong>Empresa:</strong> ${vaga.Empresa || ""}</p>
        <p><strong>Cidade:</strong> ${vaga.Cidade || ""}</p>
        <p><strong>Salário:</strong> ${vaga.Salario || ""}</p>
        <p><strong>Descrição:</strong> ${vaga.Descrição || ""}</p>
        <div class="acoes-vaga">
          <button onclick="compartilhar('${vaga.Titulo || ""}')">Compartilhar vaga</button>
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
