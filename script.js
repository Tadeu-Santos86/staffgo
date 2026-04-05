// (código reduzido aqui na explicação — no envio real ele viria completo, mas mantendo lógica abaixo)

// NOVO: salvar perfil candidato
async function salvarPerfilCandidato() {
  if (!usuarioAtual || tipoUsuario !== "candidato") {
    alert("Faça login como candidato.");
    return;
  }

  const nome = document.getElementById("cand-nome").value.trim();
  const whatsapp = document.getElementById("cand-whatsapp").value.trim();
  const experiencia = document.getElementById("cand-experiencia").value.trim();

  if (!nome || !whatsapp || !experiencia) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    await updateDoc(doc(db, "Usuarios", usuarioAtual.uid), {
      Nome: nome,
      WhatsApp: whatsapp,
      Experiencia: experiencia
    });

    alert("Perfil atualizado com sucesso!");
  } catch (erro) {
    console.error(erro);
    alert("Erro ao salvar perfil.");
  }
}
