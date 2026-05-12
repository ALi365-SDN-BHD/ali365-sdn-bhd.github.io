document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-navigation");
  const filterButtons = Array.from(document.querySelectorAll("[data-product-filter]"));
  const productCards = Array.from(document.querySelectorAll("[data-product-type]"));
  const shareGroups = Array.from(document.querySelectorAll("[data-share-title]"));
  const currentYearTargets = Array.from(document.querySelectorAll("[data-current-year]"));

  currentYearTargets.forEach((target) => {
    target.textContent = String(new Date().getFullYear());
  });

  if (header && button && nav) {
    const setOpen = (open) => {
      header.classList.toggle("is-menu-open", open);
      button.setAttribute("aria-expanded", String(open));
    };

    button.addEventListener("click", () => {
      setOpen(button.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.focus();
      }
    });
  }

  if (!filterButtons.length || !productCards.length) {
    setupShareButtons(shareGroups);
    return;
  }

  const validFilters = new Set(["all", "hardware", "software"]);

  const getFilterFromHash = () => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    return validFilters.has(hash) ? hash : "all";
  };

  const applyProductFilter = (filter, updateHash = false) => {
    const nextFilter = validFilters.has(filter) ? filter : "all";

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton.dataset.productFilter === nextFilter;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    productCards.forEach((card) => {
      const isVisible = nextFilter === "all" || card.dataset.productType === nextFilter;
      card.classList.toggle("is-hidden", !isVisible);
    });

    if (updateHash) {
      if (nextFilter === "all") {
        history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      } else {
        history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${nextFilter}`);
      }
    }
  };

  filterButtons.forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
      applyProductFilter(filterButton.dataset.productFilter, true);
    });
  });

  window.addEventListener("hashchange", () => {
    applyProductFilter(getFilterFromHash());
  });

  applyProductFilter(getFilterFromHash());

  setupShareButtons(shareGroups);
});

function setupShareButtons(shareGroups) {
  if (!shareGroups.length) {
    return;
  }

  shareGroups.forEach((group) => {
    const title = group.dataset.shareTitle || document.title;
    const status = group.querySelector(".detail-share-status");
    const buttons = Array.from(group.querySelectorAll("[data-share-action]"));
    const pageUrl = window.location.href;
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(pageUrl);

    buttons.forEach((shareControl) => {
      const action = shareControl.dataset.shareAction;

      if (shareControl instanceof HTMLAnchorElement) {
        if (action === "facebook") {
          shareControl.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        } else if (action === "twitter") {
          shareControl.href = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        } else if (action === "whatsapp") {
          shareControl.href = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
        }
        return;
      }

      shareControl.addEventListener("click", async () => {
        try {
          await copyText(pageUrl);
          setShareStatus(status, "Link copied");
        } catch (error) {
          setShareStatus(status, "Copy failed");
        }
      });
    });
  });
}

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function setShareStatus(status, message) {
  if (!status) {
    return;
  }

  status.textContent = message;
  window.clearTimeout(status._shareTimer);
  status._shareTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 2200);
}
