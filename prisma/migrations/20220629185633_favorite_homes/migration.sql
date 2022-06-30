-- CreateTable
CREATE TABLE "_favoriteHomes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_favoriteHomes_AB_unique" ON "_favoriteHomes"("A", "B");

-- CreateIndex
CREATE INDEX "_favoriteHomes_B_index" ON "_favoriteHomes"("B");

-- AddForeignKey
ALTER TABLE "_favoriteHomes" ADD CONSTRAINT "_favoriteHomes_A_fkey" FOREIGN KEY ("A") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_favoriteHomes" ADD CONSTRAINT "_favoriteHomes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
