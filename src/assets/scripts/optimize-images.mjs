// scripts/optimize-images.mjs
import sharp from "sharp";
import fg from "fast-glob";
import fs from "fs-extra";
import path from "path";

const srcDir = path.resolve("src/assets/images");
const distDir = path.resolve("dist/images");

async function optimizeImages() {
    try {
        // 1. Limpiar carpeta dist/images
        await fs.remove(distDir);
        await fs.ensureDir(distDir);

        // 2. Buscar imágenes
        const files = await fg("**/*.{jpg,jpeg,png,svg}", { cwd: srcDir });

        for (const file of files) {
            const srcPath = path.join(srcDir, file);
            const distPath = path.join(distDir, file);

            await fs.ensureDir(path.dirname(distPath));

            if (file.endsWith(".svg")) {
                // 👉 Solo mover SVG
                await fs.copyFile(srcPath, distPath);
                console.log(`📄 Copiado: ${file}`);
            } else {
                const ext = path.extname(file).toLowerCase();

                if (ext === ".png") {
                    await sharp(srcPath)
                        .png({ quality: 50, compressionLevel: 3 })
                        .toFile(distPath.replace(ext, ".png"));
                } else {
                    await sharp(srcPath)
                        .jpeg({ quality: 50 })
                        .toFile(distPath.replace(ext, ".jpg"));
                }

                // 👉 Generar versión WebP
                await sharp(srcPath)
                    .webp({ quality: 50 })
                    .toFile(distPath.replace(ext, ".webp"));

                // 👉 Generar versión AVIF
                await sharp(srcPath)
                    .avif({ quality: 50, effort: 9, chromaSubsampling: "4:2:0" })
                    .toFile(distPath.replace(ext, ".avif"));

                console.log(`✨ Optimizado + convertido: ${file}`);
            }
        }

        console.log("✅ Optimización completada.");
    } catch (err) {
        console.error("❌ Error al optimizar imágenes:", err);
    }
}

optimizeImages();
