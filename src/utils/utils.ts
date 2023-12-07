import brcypt from "bcrypt";
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const match = await brcypt.compare(plainPassword, hashedPassword);
    return match;
  } catch (e) {
    console.error(e);

    throw new Error("Erro ao comparar as senhas");
  }
}
