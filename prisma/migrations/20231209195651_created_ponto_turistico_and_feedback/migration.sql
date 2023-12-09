-- CreateTable
CREATE TABLE "PontoTuristico" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataInauguracao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PontoTuristico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PontosPreferences" (
    "id" SERIAL NOT NULL,
    "pontoTuristicoId" INTEGER NOT NULL,
    "preferenceId" INTEGER NOT NULL,

    CONSTRAINT "PontosPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PontoTuristicoToPreferences" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PontosPreferences_pontoTuristicoId_preferenceId_key" ON "PontosPreferences"("pontoTuristicoId", "preferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "_PontoTuristicoToPreferences_AB_unique" ON "_PontoTuristicoToPreferences"("A", "B");

-- CreateIndex
CREATE INDEX "_PontoTuristicoToPreferences_B_index" ON "_PontoTuristicoToPreferences"("B");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PontosPreferences" ADD CONSTRAINT "PontosPreferences_pontoTuristicoId_fkey" FOREIGN KEY ("pontoTuristicoId") REFERENCES "PontoTuristico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PontosPreferences" ADD CONSTRAINT "PontosPreferences_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PontoTuristicoToPreferences" ADD CONSTRAINT "_PontoTuristicoToPreferences_A_fkey" FOREIGN KEY ("A") REFERENCES "PontoTuristico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PontoTuristicoToPreferences" ADD CONSTRAINT "_PontoTuristicoToPreferences_B_fkey" FOREIGN KEY ("B") REFERENCES "Preferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
