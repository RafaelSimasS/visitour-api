-- CreateTable
CREATE TABLE "Preferences" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "preferenceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PreferencesToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Preferences_name_key" ON "Preferences"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_preferenceId_key" ON "UserPreferences"("userId", "preferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "_PreferencesToUser_AB_unique" ON "_PreferencesToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PreferencesToUser_B_index" ON "_PreferencesToUser"("B");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferencesToUser" ADD CONSTRAINT "_PreferencesToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Preferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferencesToUser" ADD CONSTRAINT "_PreferencesToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
