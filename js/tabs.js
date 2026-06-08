class TabsController {
  constructor({ terminal, tabs, menuToggle, newTabButton }) {
    this.terminal = terminal;
    this.tabs = tabs;
    this.menuToggle = menuToggle;
    this.newTabButton = newTabButton;
    this.sessions = new Map();
    this.openTabs = new Set(tabs.map((tab) => tab.dataset.tab));
    this.feedbackTypewriter = new Typewriter({ speed: 18, pause: 120 });
    this.activeTab = "profile";
  }

  createSession(name) {
    const session = document.createElement("section");
    session.className = "session";
    session.dataset.session = name;
    this.terminal.appendChild(session);
    this.sessions.set(name, { element: session, scrollTop: 0 });
    return session;
  }

  bind(onActivate) {
    this.tabs.forEach((tab) => {
      tab.addEventListener("click", (event) => {
        if (this.isCloseClick(event, tab)) {
          event.stopPropagation();
          this.closeTab(tab.dataset.tab, onActivate);
          return;
        }
        if (!this.openTabs.has(tab.dataset.tab)) return;
        this.activate(tab.dataset.tab, onActivate);
      });
      tab.addEventListener("keydown", (event) => this.handleKeys(event, onActivate));
    });
    this.newTabButton?.addEventListener("click", () => this.openNextTab(onActivate));
    this.menuToggle?.addEventListener("click", () => this.toggleMenu());
    document.addEventListener("click", (event) => {
      if (!this.menuToggle || !this.menuToggle.getAttribute("aria-expanded")) return;
      const clickedInsideMenu = event.target.closest(".tabs") || event.target.closest(".mobile-tab-toggle");
      if (!clickedInsideMenu) this.closeMenu();
    });
  }

  async activate(name, onActivate) {
    if (!this.openTabs.has(name)) return;
    const current = this.sessions.get(this.activeTab);
    if (current) current.scrollTop = this.terminal.scrollTop;

    this.activeTab = name;
    this.tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === name;
      const isOpen = this.openTabs.has(tab.dataset.tab);
      tab.classList.toggle("is-closed", !isOpen);
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.setAttribute("aria-hidden", String(!isOpen));
    });
    this.closeMenu();

    for (const [key, session] of this.sessions) {
      session.element.classList.toggle("is-active", key === name);
    }

    const next = this.sessions.get(name);
    next.element.replaceChildren();
    await onActivate(name, next.element);
    requestAnimationFrame(() => {
      this.terminal.scrollTop = 0;
      this.terminal.focus({ preventScroll: true });
    });
  }

  handleKeys(event, onActivate) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const openTabs = this.tabs.filter((tab) => this.openTabs.has(tab.dataset.tab));
    const currentIndex = openTabs.findIndex((tab) => tab.dataset.tab === this.activeTab);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowLeft') nextIndex = Math.max(0, currentIndex - 1);
    if (event.key === 'ArrowRight') nextIndex = Math.min(openTabs.length - 1, currentIndex + 1);
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = openTabs.length - 1;
    openTabs[nextIndex].focus();
    this.activate(openTabs[nextIndex].dataset.tab, onActivate);
  }

  isCloseClick(event, tab) {
    const box = tab.getBoundingClientRect();
    return event.clientX >= box.right - 34;
  }

  async closeTab(name, onActivate) {
    if (!this.openTabs.has(name)) return;
    this.openTabs.delete(name);
    const closedTab = this.tabs.find((tab) => tab.dataset.tab === name);
    closedTab.classList.add("is-closed");
    closedTab.classList.remove("is-active");
    closedTab.setAttribute("aria-hidden", "true");
    closedTab.setAttribute("aria-selected", "false");

    const session = this.sessions.get(name);
    if (session) session.element.classList.remove("is-active");

    if (this.activeTab !== name) return;
    const nextTab = this.findNextOpenTab(name);
    if (nextTab) {
      await this.activate(nextTab.dataset.tab, onActivate);
      nextTab.focus();
      return;
    }
    this.activeTab = "";
    this.terminal.replaceChildren(...[...this.sessions.values()].map((item) => item.element));
  }

  async openNextTab(onActivate) {
    const closedTab = this.tabs.find((tab) => !this.openTabs.has(tab.dataset.tab));
    if (closedTab) {
      this.openTabs.add(closedTab.dataset.tab);
      closedTab.classList.remove("is-closed");
      closedTab.setAttribute("aria-hidden", "false");
      await this.activate(closedTab.dataset.tab, onActivate);
      closedTab.focus();
      return;
    }
    this.appendMaxTabsMessage();
  }

  findNextOpenTab(closedName) {
    const closedIndex = this.tabs.findIndex((tab) => tab.dataset.tab === closedName);
    return this.tabs.slice(closedIndex + 1).find((tab) => this.openTabs.has(tab.dataset.tab))
      || [...this.tabs].reverse().find((tab) => this.openTabs.has(tab.dataset.tab));
  }

  async appendMaxTabsMessage() {
    const session = this.sessions.get(this.activeTab)?.element;
    if (!session) return;
    const path = `C:\\${this.activeTab}`;
    this.feedbackTypewriter.reset();
    const message = Terminal.line("");
    message.classList.add("max-tabs-message");
    const command = Terminal.line("", "command");
    session.append(
      message,
      command,
    );
    requestAnimationFrame(() => {
      this.terminal.scrollTop = this.terminal.scrollHeight;
      this.terminal.focus({ preventScroll: true });
    });
    this.feedbackTypewriter
      .enqueue({ type: "text", element: message, text: "Why would you need more than these 4 tabs here? :)", speed: 18 })
      .enqueue({ type: "pause", duration: 120 })
      .enqueue({ type: "text", element: command, text: `${path}> dir`, speed: 18 });
    await this.feedbackTypewriter.run();
    requestAnimationFrame(() => {
      this.terminal.scrollTop = this.terminal.scrollHeight;
      this.terminal.focus({ preventScroll: true });
    });
  }

  toggleMenu() {
    const isOpen = this.tabs[0].parentElement.classList.toggle("is-open");
    this.menuToggle.setAttribute("aria-expanded", String(isOpen));
    this.menuToggle.setAttribute("aria-label", isOpen ? "Close tab menu" : "Open tab menu");
  }

  closeMenu() {
    if (!this.menuToggle) return;
    this.tabs[0].parentElement.classList.remove("is-open");
    this.menuToggle.setAttribute("aria-expanded", "false");
    this.menuToggle.setAttribute("aria-label", "Open tab menu");
  }
}

window.TabsController = TabsController;