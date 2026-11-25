"use client";
import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "./src/sanity/schemaTypes";
export default defineConfig({name:"urban-stories",title:"Urban Stories",projectId:process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,dataset:process.env.NEXT_PUBLIC_SANITY_DATASET!,basePath:"/studio",plugins:[structureTool({structure:S=>S.list().title("Urban Stories").items([
S.listItem().title("Site settings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
S.listItem().title("Homepage").child(S.document().schemaType("homePage").documentId("homePage")),
S.listItem().title("Our Story").child(S.document().schemaType("aboutPage").documentId("aboutPage")),
S.listItem().title("Navigation").child(S.document().schemaType("navigation").documentId("mainNavigation")),
S.listItem().title("Footer").child(S.document().schemaType("siteFooter").documentId("siteFooter")),S.divider(),
...S.documentTypeListItems().filter(item=>!["siteSettings","homePage","aboutPage","navigation","siteFooter"].includes(item.getId()||""))] )}),visionTool()],schema:{types:schemaTypes}});
