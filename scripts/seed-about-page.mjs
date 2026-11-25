import {createClient} from "@sanity/client";
import {loadEnvConfig} from "@next/env";

loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN before seeding.");
}

const client = createClient({projectId, dataset, token, apiVersion: "2026-01-01", useCdn: false});
const paragraph = (text) => ({
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{_type: "span", marks: [], text}],
});

const document = {
  _id: "aboutPage",
  _type: "aboutPage",
  title: "Our Story",
  heroHeading: "Everyone has a story worth sharing",
  heroDescription: "Urban Stories is a space for curious minds, creative thinkers, and people with experiences worth sharing. We believe every story has the power to introduce a new perspective, spark an idea, or help someone see the world differently.",
  heroImage: {
    _type: "image",
    asset: {_type: "reference", _ref: "image-d6ccaae4b9b759e88e0151c8fc5777fb4d51277f-2400x1742-jpg"},
    alt: "A person writing in a notebook beside a laptop, capturing the spirit of ideas and storytelling.",
  },
  sections: [
    {
      _key: "stories-think",
      heading: "Stories that make us think differently",
      imagePosition: "right",
      image: {
        _type: "image",
        asset: {_type: "reference", _ref: "image-64ecc55459a58bc2d7e7dc30d5ed5f8d6d93348e-2400x1703-jpg"},
        alt: "A reader holding an open book, representing curiosity and discovery.",
      },
      body: [
        paragraph("We believe meaningful content goes beyond headlines and passing trends. The best stories make us pause, ask questions, challenge assumptions, and look at familiar things from a different point of view."),
        paragraph("In a world filled with information, we want to create room for ideas that deserve attention. Stories that explain complex subjects, celebrate creativity, share practical knowledge, and explore the experiences that connect us."),
        paragraph("We value curiosity over certainty, depth over noise, and meaningful conversations over fleeting attention."),
      ],
    },
    {
      _key: "curious-voices",
      heading: "A community of curious voices",
      imagePosition: "left",
      image: {
        _type: "image",
        asset: {_type: "reference", _ref: "image-b114ae7ba3e22341512519b794371e580c0b1de5-2400x1600-jpg"},
        alt: "People taking notes together during a shared discussion and learning session.",
      },
      body: [
        paragraph("Urban Stories brings together readers, writers, professionals, creators, and lifelong learners. Everyone has a different journey, and every experience offers an opportunity to learn something valuable."),
        paragraph("You might be a developer sharing what you have built, an entrepreneur reflecting on a lesson, a traveller describing a new place, or simply someone with an idea worth exploring."),
        paragraph("You do not need to be an established writer to contribute. You just need a perspective, an experience, or an idea you believe is worth sharing."),
      ],
    },
  ],
  quote: "Every perspective adds something to the bigger picture. Our goal is to bring those perspectives together through the power of storytelling.",
  closingHeading: "Read something. Discover something. Share something.",
  closingDescription: "We believe reading and writing should be an open exchange of ideas. Discover stories that expand your knowledge, explore subjects that interest you, and find perspectives that challenge the way you think. And when you have a story of your own, share it with the community.",
  closingTagline: "Urban Stories — Stories Beyond Boundaries.",
  ctaTitle: "Your story deserves a place here.",
  ctaDescription: "Have an idea, experience, or perspective worth sharing? Join the Urban Stories contributor community.",
  ctaButtons: [
    {_key: "explore-stories", label: "Explore Stories", href: "/", style: "primary"},
    {_key: "become-contributor", label: "Become a Contributor", href: "/contributor/editor", style: "secondary"},
  ],
  seo: {
    title: "Our Story | Urban Stories",
    description: "Discover the purpose, people and perspectives behind Urban Stories — a publication for curious minds and stories beyond boundaries.",
    socialImage: {
      _type: "image",
      asset: {_type: "reference", _ref: "image-d6ccaae4b9b759e88e0151c8fc5777fb4d51277f-2400x1742-jpg"},
    },
  },
};

const result = await client.createIfNotExists(document);
console.log("Our Story document is ready:", result._id);
