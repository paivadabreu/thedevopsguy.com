const App = (() => {
  const state = {
    content: {},
    typewriter: new Typewriter(),
  };

  const fetchJson = async (path) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return response.json();
  };

  async function init() {
    const terminal = document.querySelector('#terminal');
    const tabs = [...document.querySelectorAll('.tab')];
    const menuToggle = document.querySelector('.mobile-tab-toggle');
    const newTabButton = document.querySelector('.new-tab');
    const controller = new TabsController({ terminal, tabs, menuToggle, newTabButton });
    ['profile', 'projects', 'blog', 'contact'].forEach((name) => controller.createSession(name));
    controller.bind(renderTab);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') state.typewriter.skip();
    });
    terminal.addEventListener('click', () => {
      if (state.typewriter.running) state.typewriter.skip();
    });
    terminal.addEventListener('scroll', () => animateVisibleSkillBars(terminal), { passive: true });

    state.content = await loadContent();

    await controller.activate('profile', renderTab);
  }

  async function loadContent() {
    const [profile, projectsIndex, contact, blogIndex] = await Promise.all([
      fetchJson('content/profile.json'),
      fetchJson('projects/index.json'),
      fetchJson('content/contact.json'),
      fetchJson('blog/index.json'),
    ]);
    return { profile, projects: projectsIndex.projects, contact, blogIndex };
  }

  async function renderTab(name, session) {
    const renderers = {
      profile: renderProfile,
      projects: renderProjects,
      blog: renderBlog,
      contact: renderContact,
    };
    await renderWithTypewriter(session, () => renderers[name](session));
  }

  async function renderWithTypewriter(session, render) {
    if (typeof state.typewriter.reset === 'function') {
      state.typewriter.reset();
    } else {
      state.typewriter.queue = [];
      state.typewriter.running = false;
      state.typewriter.skipRequested = false;
    }
    await render();
    const typeTargets = [...session.querySelectorAll('[data-typewrite="true"]')];
    const fadeTargets = [...session.children].filter((element) => !typeTargets.includes(element));
    fadeTargets.forEach((element) => {
      element.classList.add('reveal-on-load');
      element.hidden = true;
    });
    const blocks = typeTargets;
    blocks.forEach((element) => {
      element.dataset.originalHtml = element.innerHTML;
      element.dataset.originalText = element.innerText;
      element.innerHTML = '';
      element.style.visibility = 'hidden';
    });

    for (const element of blocks) {
      element.style.visibility = 'visible';
      const html = element.dataset.originalHtml;
      const text = element.dataset.originalText;
      const canTypeAsText = text && text.length <= 420 && !html.includes('<a ') && !html.includes('<button') && !html.includes('<img') && !html.includes('<div');
      if (canTypeAsText) {
        state.typewriter.enqueue({ type: 'text', element, text, speed: 9 });
      } else {
        state.typewriter.enqueue({ type: 'html', element, html });
      }
      state.typewriter.enqueue({ type: 'pause', duration: 70 });
    }
    await state.typewriter.run();
    fadeTargets.forEach((element, index) => {
      element.hidden = false;
      element.style.animationDelay = `${index * 45}ms`;
      element.classList.add('is-revealed');
    });
    if (session.dataset.session === 'profile') {
      setTimeout(() => observeSkillBars(session), 320);
    }
  }

  async function revealCurrentSession(session) {
    await renderWithTypewriter(session, () => Promise.resolve());
  }

  function renderProfile(session) {
    const profile = state.content.profile;
    const buildSkillTable = (items) => {
      const rows = [];
      for (let index = 0; index < items.length; index += 3) {
        const cells = items.slice(index, index + 3).map((skill) => `<td>${Terminal.escape(skill)}</td>`);
        while (cells.length < 3) cells.push('<td></td>');
        rows.push(`<tr>${cells.join('')}</tr>`);
      }
      return `<table class="skills-table"><tbody>${rows.join('')}</tbody></table>`;
    };
    const skillSections = (profile.skillSections || [{ label: '', items: profile.skills }]).map((section) => `
      <div class="skills-section">
        <div class="skills-label">${Terminal.escape(section.label)}:</div>
        ${buildSkillTable(section.items)}
      </div>`).join('');
    const intro = Terminal.line(`O ${profile.domain}\nCopyright (C) ${profile.name}. All right reserved.`);
    intro.dataset.typewrite = 'true';
    session.append(
      intro,
      Terminal.html(`
        <div class="cv-section terminal-grid">
          <div class="cv-main profile-summary-block">
            <div>
              <div class="section-title">Professional Summary</div>
              <p>${Terminal.escape(profile.summary)}</p>
            </div>
            <div class="profile-education">
              <div class="section-title">Education & Certifications</div>
              ${profile.education.map((item) => `<div>${Terminal.escape(item)}</div>`).join('')}
              <div>Certifications:</div>
              ${profile.certifications.map((item) => `<div>${Terminal.escape(item)}</div>`).join('')}
            </div>
          </div>
          <img class="profile-photo" src="${Terminal.escape(profile.photo)}" alt="Profile photo for ${Terminal.escape(profile.name)}" onerror="this.style.display='none'">
        </div>`),
      Terminal.separator(),
      Terminal.html(`<div class="cv-section"><div class="section-title">Technical Skills</div><div class="skills-sections">${skillSections}</div></div>`),
      Terminal.separator(),
      Terminal.html(`<div class="cv-section"><div class="section-title">Professional Experience</div><div class="experience-list">${profile.experienceDetails.map((job) => `
        <article class="job">
          <div class="job-copy">
            <div><span class="job-company">${Terminal.escape(job.company)}</span> - ${Terminal.escape(job.role)}</div>
            <div class="muted">${Terminal.escape(job.period)}</div>
            ${job.highlights.map((highlight) => `<div class="job-line">- ${Terminal.escape(highlight)}</div>`).join('')}
          </div>
          <div class="skill-bars" aria-label="Skills applied at ${Terminal.escape(job.company)}">
            ${job.skills.map((skill) => `<div class="skill-bar" data-level="${skill.level}"><span>${Terminal.escape(skill.name)}</span><strong>0%</strong><i></i></div>`).join('')}
          </div>
        </article>`).join('')}</div></div>`),
    );
  }

  function observeSkillBars(session) {
    const bars = [...session.querySelectorAll('.skill-bar')];
    if (!bars.length) return;
    const animate = (bar) => {
      const level = Number(bar.dataset.level);
      const maxWidth = bar.parentElement.getBoundingClientRect().width;
      bar.style.setProperty('--skill-width', `${Math.round((level / 100) * maxWidth)}px`);
      bar.classList.add('is-visible');
      const value = bar.querySelector('strong');
      let current = 0;
      const step = () => {
        current = Math.min(level, current + Math.max(1, Math.ceil(level / 24)));
        value.textContent = `${current}%`;
        if (current < level) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      setTimeout(() => {
        value.textContent = `${level}%`;
      }, 950);
    };
    if (!('IntersectionObserver' in window)) {
      bars.forEach(animate);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.classList.contains('is-visible')) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    }, { root: document.querySelector('#terminal'), threshold: 0.35 });
    bars.forEach((bar) => observer.observe(bar));
    const terminal = document.querySelector('#terminal');
    const checkVisibleBars = () => {
      const viewport = terminal.getBoundingClientRect();
      bars.forEach((bar) => {
        if (bar.classList.contains('is-visible')) return;
        const box = bar.getBoundingClientRect();
        const visible = box.top < viewport.bottom && box.bottom > viewport.top;
        if (visible) animate(bar);
      });
    };
    terminal.addEventListener('scroll', checkVisibleBars, { passive: true });
    setTimeout(checkVisibleBars, 250);
    setTimeout(checkVisibleBars, 900);
    setTimeout(() => animateVisibleSkillBars(terminal), 900);
  }

  function animateVisibleSkillBars(terminal = document.querySelector('#terminal')) {
    const viewport = terminal.getBoundingClientRect();
    document.querySelectorAll('.skill-bar').forEach((bar) => {
      if (bar.classList.contains('is-visible')) return;
      const box = bar.getBoundingClientRect();
      if (box.top >= viewport.bottom || box.bottom <= viewport.top) return;
      const level = Number(bar.dataset.level);
      const maxWidth = bar.parentElement.getBoundingClientRect().width;
      bar.style.setProperty('--skill-width', `${Math.round((level / 100) * maxWidth)}px`);
      bar.classList.add('is-visible');
      const value = bar.querySelector('strong');
      let current = 0;
      const step = () => {
        current = Math.min(level, current + Math.max(1, Math.ceil(level / 24)));
        value.textContent = `${current}%`;
        if (current < level) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      setTimeout(() => {
        value.textContent = `${level}%`;
      }, 950);
    });
  }

  function renderProjects(session) {
    const projects = state.content.projects;
    renderProjectsList(session, projects);
    bindShowcaseItems(session, 'project', projects, showProjectDetails);
  }

  function renderProjectsList(session, projects) {
    const intro = Terminal.line('C:\\projects> dir\nHere you will find my latest and notorious projects');
    intro.dataset.typewrite = 'true';
    session.append(
      intro,
      Terminal.html(`<div class="showcase-list">${projects.map((project, index) => renderShowcaseItem({
        title: `Project ${index + 1}`,
        description: project.summary,
        meta: project.slug,
        type: 'project',
        index
      })).join('')}</div>`)
    );
  }

  function renderShowcaseItem({ title, description, meta, type, index }) {
    return `
      <button class="showcase-item" type="button" data-showcase-type="${type}" data-index="${index}">
        <div class="showcase-copy">
          <div class="section-title">${Terminal.escape(title)}</div>
          <p>${Terminal.escape(description)}</p>
          <div class="showcase-link">${Terminal.escape(meta)}</div>
        </div>
        <div class="showcase-thumb" aria-hidden="true"></div>
      </button>`;
  }

  function bindShowcaseItems(session, type, items, showDetails) {
    session.querySelectorAll(`[data-showcase-type="${type}"]`).forEach((button) => {
      button.addEventListener('click', () => showDetails(session, items[Number(button.dataset.index)]));
    });
  }

  async function showProjectDetails(session, project) {
    session.replaceChildren(
      Terminal.command('C:\\projects', `cd ${project.slug}`),
      Terminal.command(`C:\\projects\\${project.slug}`, 'type readme.txt'),
      Terminal.line('Loading project markdown...', 'muted')
    );
    const response = await fetch(`projects/${project.file}`);
    const markdown = response.ok ? await response.text() : '# Missing project\nThe selected project file could not be loaded.';
    session.replaceChildren(
      Terminal.command('C:\\projects', `cd ${project.slug}`),
      Terminal.command(`C:\\projects\\${project.slug}`, 'type readme.txt'),
      Terminal.html(`
        <div class="detail-view markdown">
          <button class="terminal-button" type="button" data-back="projects">.. back to projects</button>
          ${Markdown.parse(markdown)}
        </div>`)
    );
    session.querySelectorAll('.command').forEach((command) => {
      command.dataset.typewrite = 'true';
    });
    session.querySelector('[data-back="projects"]').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.typewriter.reset();
      session.replaceChildren();
      renderProjectsList(session, state.content.projects);
      bindShowcaseItems(session, 'project', state.content.projects, showProjectDetails);
    }, true);
    await revealCurrentSession(session);
  }

  function renderContact(session) {
    const contact = state.content.contact;
    const intro = Terminal.line('C:\\contact> get-contact\nRecruiter-friendly contact details');
    intro.dataset.typewrite = 'true';
    session.append(
      intro,
      Terminal.html(`
        <div class="cv-section contact-panel">
          <div><span class="section-title">Email</span><br>${Terminal.link(`mailto:${contact.email}`, contact.email)}</div>
          <div><span class="section-title">Phone</span><br>${Terminal.escape(contact.phone)}</div>
          <div><span class="section-title">Location</span><br>${Terminal.escape(contact.location)}</div>
          <div><span class="section-title">Citizenship</span><br>${Terminal.escape(contact.citizenship)}</div>
        </div>`)
    );
  }

  function renderBlog(session) {
    const posts = state.content.blogIndex.posts;
    renderBlogList(session, posts);
    bindShowcaseItems(session, 'post', posts, showPostDetails);
  }

  function renderBlogList(session, posts) {
    const intro = Terminal.line('C:\\blog> dir\nTechnical notes and field lessons');
    intro.dataset.typewrite = 'true';
    session.append(
      intro,
      Terminal.html(`<div class="showcase-list">${posts.map((post, index) => renderShowcaseItem({
        title: `Post ${index + 1}`,
        description: post.title,
        meta: post.file,
        type: 'post',
        index
      })).join('')}</div>`)
    );
  }

  async function showPostDetails(session, post) {
    session.replaceChildren(
      Terminal.command('C:\\blog', `type ${post.file}`),
      Terminal.line('Loading markdown...', 'muted')
    );
    const response = await fetch(`blog/${post.file}`);
    const markdown = response.ok ? await response.text() : '# Missing post\nThe selected Markdown file could not be loaded.';
    session.replaceChildren(
      Terminal.command('C:\\blog', `type ${post.file}`),
      Terminal.html(`
        <div class="detail-view markdown">
          <button class="terminal-button" type="button" data-back="blog">.. back to blog</button>
          ${Markdown.parse(markdown)}
        </div>`)
    );
    session.querySelectorAll('.command').forEach((command) => {
      command.dataset.typewrite = 'true';
    });
    session.querySelector('[data-back="blog"]').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.typewriter.reset();
      session.replaceChildren();
      renderBlogList(session, state.content.blogIndex.posts);
      bindShowcaseItems(session, 'post', state.content.blogIndex.posts, showPostDetails);
    }, true);
    await revealCurrentSession(session);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init().catch((error) => {
    document.querySelector('#terminal').textContent = `Startup failed: ${error.message}`;
  });
});