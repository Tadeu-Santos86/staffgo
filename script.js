const vagas = [
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

function mostrarVagas() {
  const container = document.getElementById("vagas");
  container.innerHTML = "";

  vagas.forEach(vaga => {
    const div = document.createElement("div");
    div.className = "vaga";

    div.innerHTML = `
      <h3>${vaga.titulo}</h3>
      <p>${vaga.empresa} - ${vaga.local}</p>
      <button onclick="compartilhar('${vaga.titulo}')">
        Compartilhar vaga
      </button>
    `;

    container.appendChild(div);
  });
}

function compartilhar(titulo) {
  const texto = `Olha essa vaga: ${titulo} - StaffGo`;
  navigator.clipboard.writeText(texto);
  alert("Link copiado! Compartilhe essa vaga");
}
