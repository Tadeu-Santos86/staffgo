let vagas = [
  {
    titulo: "Recepcionista de Hotel",
    empresa: "Resort Luxo SP",
    local: "São Paulo",
  },
  {
    titulo: "Auxiliar de Cozinha",
    empresa: "Hotel Praia",
    local: "Bahia",
  }
];

function abrirSecao(id) {
  document.getElementById("secao-vagas").style.display = "none";
  document.getElementById("secao-empresa").style.display = "none";

  document.getElementById(id).style.display = "block";

  if (id === "secao-vagas") {
    mostrarVagas();
  }
}

function mostrarVagas() {
  const container = document.getElementById("vagas");
  container.innerHTML = "";

  if (vagas.length === 0) {
    container.innerHTML = "<p>Nenhuma vaga cadastrada no momento.</p>";
    return;
  }

  vagas.forEach((vaga) => {
    const div = document.createElement("div");
    div.className = "vaga";

    div.innerHTML = `
      <h3>${vaga.titulo}</h3>
      <p><strong>Empresa:</strong> ${vaga.empresa}</p>
      <p><strong>Local:</strong> ${vaga.local}</p>
      <div class="acoes-vaga">
        <button onclick="compartilhar('${vaga.titulo}')">Compartilhar vaga</button>
      </div>
    `;

    container.appendChild(div);
  });
}

function cadastrarVaga() {
  const titulo = document.getElementById("titulo").value.trim();
  const empresa = document.getElementById("empresa").value.trim();
  const local = document.getElementById("local").value.trim();

  if (!titulo || !empresa || !local) {
    alert("Preencha todos os campos da vaga.");
    return;
  }

  vagas.push({ titulo, empresa, local });

  document.getElementById("titulo").value = "";
  document.getElementById("empresa").value = "";
  document.getElementById("local").value = "";

  alert("Vaga cadastrada com sucesso.");

  abrirSecao("secao-vagas");
}

function compartilhar(titulo) {
  const texto = `Olha essa vaga no StaffGo: ${titulo}`;
  navigator.clipboard.writeText(texto);
  alert("Texto copiado para compartilhar.");
}
