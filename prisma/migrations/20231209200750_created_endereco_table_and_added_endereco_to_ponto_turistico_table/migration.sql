/*
  Warnings:

  - You are about to drop the column `localizacao` on the `PontoTuristico` table. All the data in the column will be lost.
  - Added the required column `enderecoId` to the `PontoTuristico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PontoTuristico" DROP COLUMN "localizacao",
ADD COLUMN     "enderecoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Endereco" (
    "id" SERIAL NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "rua" TEXT NOT NULL,

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PontoTuristico" ADD CONSTRAINT "PontoTuristico_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "Endereco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
