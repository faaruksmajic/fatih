import type { ProjectWithImages } from "@/db/queries";

// Gallery images for the local samples, so the project page can be checked
// without a database. Never shown in production.
const EXTRA_IMAGES: string[][] = [
  ["notable-02.jpg", "notable-03.jpg", "project-kitchen.jpg"],
  ["notable-01.jpg", "notable-02.jpg"],
  ["notable-03.jpg"],
  [],
];

// Shown only in local development when the database is not reachable.
const LOCAL_SAMPLE: ProjectWithImages[] = [
  [
    "project-atal-group.jpg",
    "ATAL Group Office Building",
    "Commercial",
    "A five-storey mixed-use building: four floors of flexible offices with abundant daylight, two penthouses with private terraces on top, and a black-and-white facade with black-framed windows.",
  ],
  [
    "project-brcko-house.jpg",
    "Private Residence, Brčko",
    "Residential",
    "A single-storey family house of over 300 m² under a four-sloped roof, with anthracite windows, a four-car garage, a pool and terrace, and a home gym in the attic.",
  ],
  [
    "project-kitchen.jpg",
    "Modern Kitchen Interior",
    "Interior",
    "A kitchen in wood and matte black, anchored by a central island, where every cabinet and material is chosen for a sleek and highly functional result.",
  ],
  [
    "notable-01.jpg",
    "Walk-in Closet and Bedroom",
    "Interior",
    "A walk-in closet and bedroom suite finished in dark wood veneer and soft, layered textiles.",
  ],
].map(([file, title, category, description], i) => ({
  id: `sample-${i}`,
  title,
  category,
  description,
  coverImage: `/images/${file}`,
  position: i,
  images: (EXTRA_IMAGES[i] ?? []).map((name, j) => ({
    id: `sample-${i}-${j}`,
    imageUrl: `/images/${name}`,
  })),
}));


/** The database projects, or sample ones in local development when there are none. */
export function withLocalSample(projects: ProjectWithImages[]): ProjectWithImages[] {
  return projects.length === 0 && process.env.NODE_ENV === "development"
    ? LOCAL_SAMPLE
    : projects;
}
