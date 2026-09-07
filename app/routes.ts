import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";

export default [
  layout("routes/site/layout.tsx", [
    index("routes/site/home.tsx"),
    route("proyectos/:slug", "routes/site/project.tsx"),
  ]),
  route("robots.txt", "routes/seo/robots.ts"),
  route("sitemap.xml", "routes/seo/sitemap.ts"),
  route("api/contact", "routes/api/contact.ts"),
  route("api/cloudinary/sign", "routes/api/cloudinary-sign.ts"),
  route("admin/login", "routes/admin/login.tsx"),
  route("admin/logout", "routes/admin/logout.ts"),
  ...prefix("admin", [
    layout("routes/admin/layout.tsx", [
      index("routes/admin/dashboard.tsx"),
      route("ajustes", "routes/admin/settings.tsx"),
      route("seguridad", "routes/admin/security.tsx"),
      route("secciones", "routes/admin/sections.tsx"),
      route("secciones/:id", "routes/admin/section-edit.tsx"),
      route("proyectos", "routes/admin/projects.tsx"),
      route("proyectos/:id", "routes/admin/project-edit.tsx"),
      route("experiencia", "routes/admin/experience.tsx"),
      route("experiencia/:id", "routes/admin/experience-edit.tsx"),
      route("habilidades", "routes/admin/skills.tsx"),
      route("media", "routes/admin/media.tsx"),
      route("mensajes", "routes/admin/messages.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
