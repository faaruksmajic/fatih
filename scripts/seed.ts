import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { createProject } from "../src/db/queries";

const SEED_PROJECTS = [
  {
    file: "project-atal-group.jpg",
    title: "ATAL Group Office Building",
    category: "Commercial",
    description:
      "A five-story mixed-use building combining functionality and modern minimalism in an urban setting. The first four floors are flexible office space with abundant natural light, while the top two floors hold two luxurious penthouses with private terraces. A sleek black-and-white facade with black-framed windows creates a contemporary, high-contrast identity, supported by a large front parking area for tenants and residents alike.",
  },
  {
    file: "project-brcko-house.jpg",
    title: "Private Residence, Brčko",
    category: "Residential",
    description:
      "A single-story modern house in Brčko, BiH spanning over 300 m². Built with American walls beneath a four-sloped roof, finished with anthracite windows and a matching gate. The garage fits up to four cars, the backyard includes a pool and terrace, and the attic is designed as a home gym — a comfortable, stylish family home built on contemporary aesthetics.",
  },
  {
    file: "project-kitchen.jpg",
    title: "Modern Kitchen Interior",
    category: "Interior",
    description:
      "An interior study of a modern kitchen finished in wood and matte black. A central island anchors the space, balancing aesthetics and functionality — every detail, from cabinetry to material choice, reflects a thoughtful design approach aimed at a sleek, highly functional result.",
  },
  {
    file: "notable-01.jpg",
    title: "Notable Project 01",
    category: "Interior",
    description: "A walk-in closet and bedroom suite finished in dark wood veneer and soft, layered textiles.",
  },
  {
    file: "notable-02.jpg",
    title: "Notable Project 02",
    category: "Interior",
    description: "A bedroom interior balancing warm lighting with fluted wall paneling and a minimal material palette.",
  },
  {
    file: "notable-03.jpg",
    title: "Notable Project 03",
    category: "Interior",
    description: "A living room composition centered on a floating media console and understated natural finishes.",
  },
];

async function main() {
  for (let i = 0; i < SEED_PROJECTS.length; i++) {
    const seed = SEED_PROJECTS[i];
    const filePath = path.join(process.cwd(), "public", "images", seed.file);
    const fileBuffer = await readFile(filePath);

    const blob = await put(`seed/${seed.file}`, fileBuffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    const id = await createProject({
      title: seed.title,
      description: seed.description,
      category: seed.category,
      coverImage: blob.url,
      images: [],
    });

    console.log(`Seeded "${seed.title}" -> ${id} (${blob.url})`);
  }
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
