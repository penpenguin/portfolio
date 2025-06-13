# Modern Portfolio Website

A modern, responsive portfolio website built with Astro, featuring glass morphism design and Markdown-based content management.

## ✨ Features

- **Modern Design**: Glass morphism effects with gradient backgrounds
- **Responsive Layout**: Mobile-first design that works on all devices
- **Markdown Content**: Easy content management with Astro's content collections
- **Fast Performance**: Built with Astro for optimal loading speeds
- **TypeScript Support**: Full TypeScript integration for better development experience
- **GitHub Pages Ready**: Automated deployment with GitHub Actions

## 🚀 Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── content/
│   │   ├── config.ts
│   │   ├── projects/
│   │   │   └── sample-project.md
│   │   └── blog/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── blog/
│   │   │   └── index.astro
│   │   └── projects/
│   │       ├── index.astro
│   │       └── [...slug].astro
│   └── styles/
│       └── global.css
├── .github/
│   └── workflows/
│       └── deploy.yml
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:4321`     |
| `npm run build`        | Build your production site to `./dist/`         |
| `npm run preview`      | Preview your build locally, before deploying    |
| `npm run check`        | Run Astro's type checking                        |
| `npm run lint`         | Check code formatting with Prettier             |
| `npm run format`       | Format code with Prettier                       |

## 🎨 Customization

### Colors and Styling
Edit the CSS custom properties in `src/styles/global.css` to customize the color scheme and styling.

### Content
- Add projects by creating markdown files in `src/content/projects/`
- Add blog posts by creating markdown files in `src/content/blog/`
- Update personal information in the page files

### Configuration
Update `astro.config.mjs` to change the site URL and base path for GitHub Pages deployment.

## 🚀 Deployment

This site is configured for automatic deployment to GitHub Pages. To deploy:

1. Fork this repository
2. Go to your repository settings
3. Enable GitHub Pages in the "Pages" section
4. Select "GitHub Actions" as the source
5. Push to the main branch to trigger a deployment

The site will be available at `https://yourusername.github.io/portfolio/`

## 📝 Adding Content

### Projects
Create a new markdown file in `src/content/projects/`:

```markdown
---
title: 'My Project'
description: 'A brief description of your project'
pubDate: 2024-01-01
heroImage: '/project-image.jpg'
tags: ['React', 'TypeScript']
link: 'https://myproject.com'
github: 'https://github.com/username/project'
---

# Project Details

Your project content goes here...
```

### Blog Posts
Create a new markdown file in `src/content/blog/`:

```markdown
---
title: 'My Blog Post'
description: 'A brief description of your post'
pubDate: 2024-01-01
heroImage: '/blog-image.jpg'
tags: ['Web Development', 'Tutorial']
---

# Blog Content

Your blog content goes here...
```

## 🛠️ Built With

- [Astro](https://astro.build/) - Static site generator
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - Styling with modern features
- [Prettier](https://prettier.io/) - Code formatting

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
