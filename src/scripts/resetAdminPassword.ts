import readline from "readline";
import bcrypt from "bcryptjs";
import { db } from "../config/database";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function perguntar(pergunta: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(pergunta, resolve);
  });
}

async function resetAdminPassword(): Promise<void> {
  try {
    const senha = await perguntar("Digite a nova senha do administrador: ");
    const confirmarSenha = await perguntar("Confirme a nova senha: ");

    if (senha.length < 8) {
      throw new Error("A senha deve possuir pelo menos 8 caracteres.");
    }

    if (senha !== confirmarSenha) {
      throw new Error("As senhas não coincidem.");
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const [result] = await db.execute(
      `UPDATE usuarios
       SET senha = ?
       WHERE id_usuario = ?
         AND tipo = ?
         AND ativo = 1`,
      [senhaHash, 1, "GERENTE"],
    );

    const atualizacao = result as { affectedRows: number };

    if (atualizacao.affectedRows === 0) {
      throw new Error("Administrador não encontrado ou inativo.");
    }

    console.log("Senha do administrador atualizada com sucesso!");
    console.log("A senha foi armazenada com hash bcrypt.");
  } catch (error) {
    console.error(
      "Erro ao redefinir senha:",
      error instanceof Error ? error.message : error,
    );
  } finally {
    rl.close();
    await db.end();
  }
}

resetAdminPassword();