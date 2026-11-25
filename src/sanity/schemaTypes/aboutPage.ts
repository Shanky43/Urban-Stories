import {defineArrayMember, defineField, defineType} from "sanity";
import {DocumentIcon} from "@sanity/icons/Document";

export const aboutPage = defineType({
  name: "aboutPage", title: "About page", type: "document", icon: DocumentIcon,
  fields: [
    defineField({name: "title", title: "Internal title", type: "string", initialValue: "Our Story", validation: (rule) => rule.required()}),
    defineField({name: "heroHeading", title: "Hero heading", type: "string", description: "The main heading at the top of the About page.", validation: (rule) => rule.required()}),
    defineField({name: "heroDescription", title: "Hero introduction", type: "text", rows: 4, description: "Introductory copy shown beneath the hero heading.", validation: (rule) => rule.required()}),
    defineField({name: "heroImage", title: "Hero image", type: "image", options: {hotspot: true}, fields: [{name: "alt", title: "Alternative text", type: "string", validation: (rule) => rule.required()}], description: "Editorial image representing reading, writing, storytelling and creativity."}),
    defineField({name: "sections", title: "Editorial sections", type: "array", description: "Add, remove or reorder the story sections. Each section can include rich text and an optional image.", of: [defineArrayMember({
      type: "object", fields: [
        defineField({name: "heading", title: "Section heading", type: "string", validation: (rule) => rule.required()}),
        defineField({name: "body", title: "Section content", type: "portableText", validation: (rule) => rule.required()}),
        defineField({name: "image", title: "Section image", type: "image", options: {hotspot: true}, fields: [{name: "alt", title: "Alternative text", type: "string"}]}),
        defineField({name: "imagePosition", title: "Image position", type: "string", options: {list: [{title: "Right", value: "right"}, {title: "Left", value: "left"}], layout: "radio"}, initialValue: "right"}),
      ], preview: {select: {title: "heading", media: "image", subtitle: "imagePosition"}},
    })]}),
    defineField({name: "quote", title: "Pull quote", type: "text", rows: 3, description: "A short statement displayed prominently between sections."}),
    defineField({name: "closingHeading", title: "Closing heading", type: "string"}),
    defineField({name: "closingDescription", title: "Closing description", type: "text", rows: 4}),
    defineField({name: "closingTagline", title: "Closing brand tagline", type: "string"}),
    defineField({name: "ctaTitle", title: "Call-to-action heading", type: "string"}),
    defineField({name: "ctaDescription", title: "Call-to-action description", type: "text", rows: 3}),
    defineField({name: "ctaButtons", title: "Call-to-action buttons", type: "array", of: [defineArrayMember({type: "object", fields: [
      defineField({name: "label", title: "Button label", type: "string", validation: (rule) => rule.required()}),
      defineField({name: "href", title: "Destination", type: "string", description: "Use an internal path such as / or /contributor/editor.", validation: (rule) => rule.required()}),
      defineField({name: "style", title: "Button style", type: "string", options: {list: [{title: "Primary", value: "primary"}, {title: "Secondary", value: "secondary"}]}, initialValue: "primary"}),
    ], preview: {select: {title: "label", subtitle: "href"}}})]}),
    defineField({name: "seo", title: "SEO metadata", type: "seoFields"}),
  ],
  preview: {select: {title: "title", subtitle: "heroHeading", media: "heroImage"}, prepare: ({title, subtitle, media}) => ({title: title || "About page", subtitle, media})},
});
